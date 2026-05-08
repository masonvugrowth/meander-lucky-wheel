import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEY, DEFAULT_REWARDS, SHEETS_API_URL } from '../data/constants'

const BRANCHES = ['1948', 'taipei', 'osaka', 'saigon']
const SHEETS_ENABLED = typeof SHEETS_API_URL === 'string' && SHEETS_API_URL.startsWith('http')
const POLL_MS = 5000
const WRITE_LOCK_MS = 3500   // ignore poll updates this long after a local write
const UPDATE_DEBOUNCE_MS = 700

function freshBranch() {
  return {
    rewards: JSON.parse(JSON.stringify(DEFAULT_REWARDS)),
    history: [],
  }
}

function emptyState() {
  const out = {}
  for (const b of BRANCHES) out[b] = freshBranch()
  return out
}

// Re-hydrate rewards from DEFAULT_REWARDS so static metadata (image, emoji,
// display_name, tier) always tracks the source code; only the staff-mutable
// fields (inventory_count, probability_weight) come from the remote source.
function mergeRewards(stored) {
  return DEFAULT_REWARDS.map(def => {
    const old = stored?.find(s => s.id === def.id)
    return {
      ...def,
      inventory_count:    old?.inventory_count    ?? def.inventory_count,
      probability_weight: old?.probability_weight ?? def.probability_weight,
    }
  })
}

function hydrateState(state) {
  const out = {}
  for (const b of BRANCHES) {
    out[b] = {
      rewards: mergeRewards(state?.[b]?.rewards),
      history: state?.[b]?.history ?? [],
    }
  }
  return out
}

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return hydrateState(JSON.parse(raw))
  } catch (_) {}
  return emptyState()
}

function saveCache(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) {}
}

// POST với body string → Content-Type mặc định là text/plain;charset=UTF-8.
// Apps Script đọc e.postData.contents được. Tránh application/json để khỏi
// trigger CORS preflight (Apps Script không handle OPTIONS).
async function api(action, body = {}) {
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...body }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'api error')
  return hydrateState(json.state)
}

export function useWheelState() {
  const [state, setStateRaw] = useState(loadCache)
  const stateRef = useRef(state)
  stateRef.current = state

  // Don't let polling clobber the user's just-typed value.
  const writeLockUntilRef = useRef(0)
  const lockPoll = (ms = WRITE_LOCK_MS) => {
    writeLockUntilRef.current = Math.max(writeLockUntilRef.current, Date.now() + ms)
  }

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveCache(next)
      return next
    })
  }, [])

  // ── Initial fetch + polling (only when Sheets is configured) ──────────
  useEffect(() => {
    if (!SHEETS_ENABLED) return
    let alive = true
    const refresh = async () => {
      if (!alive) return
      if (Date.now() < writeLockUntilRef.current) return
      try {
        const fresh = await api('getState')
        if (alive) setState(fresh)
      } catch (e) {
        console.warn('[wheel] poll failed:', e.message)
      }
    }
    refresh()
    const id = setInterval(refresh, POLL_MS)
    return () => { alive = false; clearInterval(id) }
  }, [setState])

  // ── Selectors ─────────────────────────────────────────────────────────
  const getBranch = useCallback((branch) => state[branch], [state])

  const getActiveRewards = useCallback((branch) =>
    state[branch].rewards.filter(r => r.inventory_count > 0),
  [state])

  const pickWinner = useCallback((branch) => {
    const pool = state[branch].rewards.filter(r => r.inventory_count > 0)
    if (!pool.length) return null
    const total = pool.reduce((s, r) => s + r.probability_weight, 0)
    let rand = Math.random() * total
    for (const r of pool) {
      rand -= r.probability_weight
      if (rand <= 0) return r
    }
    return pool[pool.length - 1]
  }, [state])

  // ── Mutations ─────────────────────────────────────────────────────────
  const claimReward = useCallback(async (branch, rewardId) => {
    const won = stateRef.current[branch].rewards.find(r => r.id === rewardId)
    const display_name = won?.display_name ?? rewardId

    // Optimistic local update for snappy UI
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const r = next[branch].rewards.find(x => x.id === rewardId)
      if (r) r.inventory_count = Math.max(0, r.inventory_count - 1)
      next[branch].history.unshift({
        ts: Date.now(),
        reward_id: rewardId,
        display_name,
        branch,
      })
      return next
    })

    if (!SHEETS_ENABLED) return
    lockPoll()
    try {
      const fresh = await api('claim', { branch, reward_id: rewardId, display_name })
      setState(fresh)
    } catch (e) {
      console.warn('[wheel] claim sync failed; will retry on next poll:', e.message)
    }
  }, [setState])

  // updateReward fires on every keystroke in the admin inputs. Debounce so
  // we send one API call after the user stops typing.
  const pendingUpdatesRef = useRef(new Map()) // key="branch|id|field" → value
  const updateTimerRef = useRef(null)

  const flushUpdates = useCallback(async () => {
    const pending = pendingUpdatesRef.current
    if (pending.size === 0) return
    const entries = Array.from(pending.entries())
    pendingUpdatesRef.current = new Map()
    if (!SHEETS_ENABLED) return
    lockPoll()
    let lastFresh = null
    for (const [key, value] of entries) {
      const [branch, reward_id, field] = key.split('|')
      try {
        lastFresh = await api('updateReward', { branch, reward_id, field, value })
      } catch (e) {
        console.warn('[wheel] updateReward sync failed:', e.message)
      }
    }
    if (lastFresh) setState(lastFresh)
  }, [setState])

  const updateReward = useCallback((branch, rewardId, field, value) => {
    const num = Math.max(0, Number(value) || 0)

    // Optimistic local update
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const r = next[branch].rewards.find(x => x.id === rewardId)
      if (r) r[field] = num
      return next
    })

    pendingUpdatesRef.current.set(`${branch}|${rewardId}|${field}`, num)
    lockPoll()
    clearTimeout(updateTimerRef.current)
    updateTimerRef.current = setTimeout(flushUpdates, UPDATE_DEBOUNCE_MS)
  }, [setState, flushUpdates])

  const resetBranch = useCallback(async (branch) => {
    setState(prev => ({ ...prev, [branch]: freshBranch() }))
    if (!SHEETS_ENABLED) return
    lockPoll()
    try {
      const fresh = await api('reset', { branch })
      setState(fresh)
    } catch (e) {
      console.warn('[wheel] reset sync failed:', e.message)
    }
  }, [setState])

  const importState = useCallback(async (newState) => {
    setState(hydrateState(newState))
    if (!SHEETS_ENABLED) return
    lockPoll()
    try {
      const fresh = await api('importState', { state: newState })
      setState(fresh)
    } catch (e) {
      console.warn('[wheel] import sync failed:', e.message)
    }
  }, [setState])

  return {
    state,
    getBranch,
    getActiveRewards,
    pickWinner,
    claimReward,
    updateReward,
    resetBranch,
    importState,
    fullState: state,
  }
}
