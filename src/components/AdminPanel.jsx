import React, { useState } from 'react'
import { ADMIN_PASSWORD, DEFAULT_REWARDS } from '../data/constants'
import { formatTs } from '../utils/helpers'

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(26,26,24,0.92)',
    zIndex: 200,
    overflowY: 'auto',
  },
  inner: {
    background: 'var(--white)',
    minHeight: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.4rem', fontWeight: 400,
  },
  closeBtn: {
    background: 'none',
    border: '1px solid var(--warm)',
    borderRadius: '8px',
    padding: '0.4rem 0.9rem',
    fontSize: '0.75rem',
    color: 'var(--mid)',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '0.62rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'var(--light)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--warm)',
  },
  statBar: {
    display: 'flex', gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  statPill: {
    background: 'var(--cream)',
    borderRadius: '10px',
    padding: '0.6rem 0.75rem',
    textAlign: 'center',
    flex: 1,
  },
  statNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem', fontWeight: 400,
    display: 'block', color: 'var(--dark)',
  },
  statLbl: {
    fontSize: '0.62rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--light)',
  },
  rewardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 58px 58px',
    gap: '0.4rem',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  input: {
    border: '1px solid var(--warm)',
    borderRadius: '6px',
    padding: '0.3rem 0.4rem',
    fontSize: '0.8rem',
    textAlign: 'center',
    background: 'var(--cream)',
    width: '100%',
    color: 'var(--dark)',
  },
  actionBtn: (variant) => ({
    background: variant === 'danger' ? '#c0556e' : variant === 'success' ? '#8fac65' : 'var(--dark)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
    marginTop: '0.5rem',
  }),
  logEntry: {
    padding: '0.45rem 0',
    borderBottom: '1px solid var(--warm)',
    fontSize: '0.78rem',
    color: 'var(--mid)',
  },
}

// ── Password gate ─────────────────────────────────────────────────
function PasswordGate({ onSuccess, onCancel }) {
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)

  function check() {
    if (val === ADMIN_PASSWORD) { onSuccess() }
    else { setErr(true); setVal('') }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,24,0.92)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '2rem',
        textAlign: 'center', width: '280px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '1.25rem' }}>
          Staff Access
        </div>
        <input
          type="password"
          value={val}
          onChange={e => { setVal(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Password"
          autoFocus
          style={{ ...s.input, width: '100%', marginBottom: '0.75rem',
            letterSpacing: '0.2em', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
        />
        {err && <div style={{ color: '#c0556e', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
          Incorrect password
        </div>}
        <button onClick={check} style={{ ...s.actionBtn(), width: '100%', padding: '0.7rem', marginRight: 0 }}>
          Enter
        </button>
        <button onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'var(--light)', fontSize: '0.75rem',
            marginTop: '0.75rem', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────────────
export default function AdminPanel({ branch, branchLabel, state, onUpdateReward, onReset, onImport, onClose }) {
  const [authed, setAuthed] = useState(false)

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} onCancel={onClose} />
  }

  const rewards = state[branch].rewards
  const history = state[branch].history
  const totalRemaining = rewards.reduce((s, r) => s + r.inventory_count, 0)

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `meander-wheel-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try { onImport(JSON.parse(ev.target.result)) } catch (_) { alert('Invalid JSON') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={s.overlay}>
      <div style={s.inner}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.title}>Admin — {branchLabel}</div>
          <button style={s.closeBtn} onClick={onClose}>Save & Close</button>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={s.statBar}>
            <div style={s.statPill}>
              <span style={s.statNum}>{history.length}</span>
              <span style={s.statLbl}>Total Spins</span>
            </div>
            <div style={s.statPill}>
              <span style={s.statNum}>{rewards.filter(r => r.inventory_count > 0).length}</span>
              <span style={s.statLbl}>Active Prizes</span>
            </div>
            <div style={s.statPill}>
              <span style={s.statNum}>{totalRemaining}</span>
              <span style={s.statLbl}>Remaining</span>
            </div>
          </div>
        </div>

        {/* Inventory + Weights */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={s.sectionTitle}>Inventory & Probability Weight</div>
          <div style={{ ...s.rewardGrid, marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--light)' }}>Prize</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--light)', textAlign: 'center' }}>Stock</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--light)', textAlign: 'center' }}>Weight</div>
          </div>
          {rewards.map(r => (
            <div key={r.id} style={s.rewardGrid}>
              <div style={{ fontSize: '0.82rem', color: 'var(--dark)' }}>
                {r.emoji} {r.display_name}
              </div>
              <input
                style={s.input}
                type="number" min="0" max="999"
                value={r.inventory_count}
                onChange={e => onUpdateReward(branch, r.id, 'inventory_count', e.target.value)}
              />
              <input
                style={s.input}
                type="number" min="1" max="100"
                value={r.probability_weight}
                onChange={e => onUpdateReward(branch, r.id, 'probability_weight', e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={s.sectionTitle}>Actions</div>
          <button style={s.actionBtn()} onClick={exportData}>Export JSON</button>
          <label style={{ ...s.actionBtn('success'), display: 'inline-block', cursor: 'pointer' }}>
            Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button style={s.actionBtn('danger')}
            onClick={() => { if (window.confirm('Reset all data for this branch?')) onReset(branch) }}>
            Reset Branch
          </button>
        </div>

        {/* Spin history */}
        <div>
          <div style={s.sectionTitle}>Spin History ({history.length})</div>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {history.length === 0
              ? <div style={{ color: 'var(--light)', fontSize: '0.8rem', padding: '0.5rem 0' }}>No spins yet.</div>
              : history.slice(0, 50).map((h, i) => (
                <div key={i} style={s.logEntry}>
                  {formatTs(h.ts)} — {h.display_name}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
