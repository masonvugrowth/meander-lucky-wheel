import { useState, useCallback } from 'react'
import { STORAGE_KEY, DEFAULT_REWARDS } from '../data/constants'

function freshBranch() {
  return {
    rewards: JSON.parse(JSON.stringify(DEFAULT_REWARDS)),
    history: [],
  }
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Ensure all branches exist
      for (const b of ['taipei', 'osaka', 'saigon', '1948']) {
        if (!parsed[b]) parsed[b] = freshBranch()
      }
      return parsed
    }
  } catch (_) {}
  return { taipei: freshBranch(), osaka: freshBranch(), saigon: freshBranch(), '1948': freshBranch() }
}

export function useWheelState() {
  const [state, setStateRaw] = useState(loadInitial)

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

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

  const claimReward = useCallback((branch, rewardId) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const reward = next[branch].rewards.find(r => r.id === rewardId)
      if (reward) reward.inventory_count = Math.max(0, reward.inventory_count - 1)
      const won = prev[branch].rewards.find(r => r.id === rewardId)
      next[branch].history.unshift({
        ts: Date.now(),
        reward_id: rewardId,
        display_name: won?.display_name ?? rewardId,
        branch,
      })
      return next
    })
  }, [setState])

  const updateReward = useCallback((branch, rewardId, field, value) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const reward = next[branch].rewards.find(r => r.id === rewardId)
      if (reward) reward[field] = Math.max(0, Number(value) || 0)
      return next
    })
  }, [setState])

  const resetBranch = useCallback((branch) => {
    setState(prev => ({
      ...prev,
      [branch]: freshBranch(),
    }))
  }, [setState])

  const importState = useCallback((newState) => {
    setState(newState)
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
