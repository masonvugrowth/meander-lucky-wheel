import React, { useState, useMemo } from 'react'
import { BRANCH_META, TIER_LABELS, ADMIN_PASSWORD, DEFAULT_REWARDS } from '../data/constants'

export default function InventoryScreen({ state, actions, onExit }) {
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [pwError, setPwError] = useState(false)
  const [branch, setBranch]   = useState('taipei')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  if (!authed) return <PasswordGate pw={pw} setPw={setPw} error={pwError} onSubmit={handleSubmit} onExit={onExit} />

  return <Dashboard state={state} actions={actions} branch={branch} setBranch={setBranch} onExit={onExit} />
}

/* ---------- Password gate ---------- */
function PasswordGate({ pw, setPw, error, onSubmit, onExit }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '2rem 1.5rem', background: 'var(--cream)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 300,
          letterSpacing: '0.14em', color: 'var(--dark)', margin: 0 }}>STAFF</h1>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--light)',
          textTransform: 'uppercase', marginTop: '0.4rem' }}>Inventory Dashboard</p>
        <div style={{ width: '32px', height: '1px', background: 'var(--warm)', margin: '1.5rem auto 0' }} />
      </div>

      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: '320px' }}>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          style={{
            width: '100%', padding: '0.9rem 1rem', fontSize: '0.9rem',
            border: `1px solid ${error ? '#c0556e' : 'var(--warm)'}`,
            borderRadius: '10px', background: 'var(--white)', color: 'var(--dark)',
            outline: 'none', letterSpacing: '0.1em', boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ fontSize: '0.7rem', color: '#c0556e', marginTop: '0.5rem',
            letterSpacing: '0.05em' }}>Incorrect password</p>
        )}

        <button type="submit" style={{
          width: '100%', marginTop: '1rem', padding: '1rem',
          background: 'var(--dark)', color: 'var(--white)', border: 'none',
          borderRadius: '100px', fontSize: '0.85rem', fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>Enter</button>
      </form>

      <button onClick={onExit} style={{
        marginTop: '1.5rem', background: 'none', border: 'none',
        fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--light)', cursor: 'pointer',
      }}>← Back to Wheel</button>
    </div>
  )
}

/* ---------- Dashboard ---------- */
function Dashboard({ state, actions, branch, setBranch, onExit }) {
  const meta       = BRANCH_META[branch]
  const branchData = state[branch]
  const rewards    = branchData.rewards
  const history    = branchData.history || []

  const stats = useMemo(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const todayMs = startOfDay.getTime()
    const spinsToday   = history.filter(h => h.ts >= todayMs).length
    const totalLeft    = rewards.reduce((s, r) => s + r.inventory_count, 0)
    const totalInitial = DEFAULT_REWARDS.reduce((s, r) => s + r.inventory_count, 0)
    const totalGiven   = Math.max(0, totalInitial - totalLeft)
    return { spinsToday, totalLeft, totalGiven, totalInitial }
  }, [rewards, history])

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--cream)',
      padding: '1.5rem 1rem 3rem',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '560px', margin: '0 auto 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onExit} style={{
          background: 'none', border: 'none', fontSize: '0.7rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--light)', cursor: 'pointer', padding: '0.5rem 0',
        }}>← Exit</button>

        <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--light)' }}>Inventory</span>

        <div style={{ width: '40px' }} />
      </div>

      {/* Branch tabs */}
      <div style={{
        maxWidth: '560px', margin: '0 auto 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem',
      }}>
        {Object.entries(BRANCH_META).map(([key, m]) => {
          const active = key === branch
          return (
            <button key={key} onClick={() => setBranch(key)} style={{
              padding: '0.65rem 0.4rem',
              background: active ? 'var(--dark)' : 'var(--white)',
              color: active ? 'var(--white)' : 'var(--dark)',
              border: `1px solid ${active ? 'var(--dark)' : 'var(--warm)'}`,
              borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.7rem', letterSpacing: '0.08em',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1rem' }}>{m.flag}</span>
              <span>{m.city}</span>
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <div style={{
        maxWidth: '560px', margin: '0 auto 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem',
      }}>
        <StatCard label="Today's Spins" value={stats.spinsToday} accent={meta.accent} />
        <StatCard label="Given Out"     value={stats.totalGiven} />
        <StatCard label="Left in Stock" value={stats.totalLeft} />
      </div>

      {/* Branch label */}
      <div style={{ maxWidth: '560px', margin: '0 auto 0.75rem' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem',
          fontWeight: 400, color: 'var(--dark)', margin: 0,
        }}>{meta.label}</h2>
        <div style={{ width: '24px', height: '1px', background: meta.accent, marginTop: '0.5rem' }} />
      </div>

      {/* Reward rows */}
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {rewards.map((r) => (
          <RewardRow
            key={r.id}
            reward={r}
            accent={meta.accent}
            onChange={(val) => actions.updateReward(branch, r.id, 'inventory_count', val)}
          />
        ))}
      </div>

      {/* Reset */}
      <div style={{ maxWidth: '560px', margin: '2rem auto 0', textAlign: 'center' }}>
        <button onClick={() => {
          if (confirm(`Reset ${meta.label} inventory to defaults? This will clear history too.`)) {
            actions.resetBranch(branch)
          }
        }} style={{
          background: 'none', border: '1px solid var(--warm)',
          padding: '0.6rem 1.5rem', borderRadius: '100px',
          fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--light)', cursor: 'pointer',
        }}>Reset Branch</button>
      </div>
    </div>
  )
}

/* ---------- Sub-components ---------- */
function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--warm)',
      borderRadius: '12px', padding: '0.85rem 0.6rem', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem',
        fontWeight: 500, color: accent || 'var(--dark)', lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--light)', marginTop: '0.4rem',
      }}>{label}</div>
    </div>
  )
}

function RewardRow({ reward, accent, onChange }) {
  const initial = DEFAULT_REWARDS.find(d => d.id === reward.id)?.inventory_count ?? reward.inventory_count
  const tier    = TIER_LABELS[reward.tier] || { label: reward.tier, color: 'var(--light)' }
  const pct     = initial > 0 ? Math.min(100, (reward.inventory_count / initial) * 100) : 0
  const isOut   = reward.inventory_count === 0
  const isLow   = !isOut && pct <= 25

  const dec = () => onChange(Math.max(0, reward.inventory_count - 1))
  const inc = () => onChange(reward.inventory_count + 1)

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--warm)',
      borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '0.6rem',
      opacity: isOut ? 0.65 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.6rem', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <span style={{ fontSize: '1.1rem' }}>{reward.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--dark)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reward.display_name}
            </div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: tier.color, marginTop: '0.15rem' }}>
              {tier.label}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <StepBtn onClick={dec} disabled={reward.inventory_count <= 0}>−</StepBtn>
          <input
            type="number"
            value={reward.inventory_count}
            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
            style={{
              width: '52px', textAlign: 'center', padding: '0.4rem 0.2rem',
              border: '1px solid var(--warm)', borderRadius: '8px',
              fontSize: '0.9rem', color: 'var(--dark)', background: 'var(--cream)',
              outline: 'none', fontVariantNumeric: 'tabular-nums',
            }}
          />
          <StepBtn onClick={inc}>+</StepBtn>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', height: '4px', background: 'var(--warm)',
        borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${pct}%`,
          background: isOut ? '#ccc' : (isLow ? '#c0556e' : accent),
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: '0.6rem', color: 'var(--light)', marginTop: '0.35rem',
        letterSpacing: '0.06em' }}>
        <span>{isOut ? 'Out of stock' : isLow ? 'Low stock' : `${Math.round(pct)}% remaining`}</span>
        <span>of {initial}</span>
      </div>
    </div>
  )
}

function StepBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '32px', height: '32px', borderRadius: '50%',
      border: '1px solid var(--warm)', background: 'var(--white)',
      color: disabled ? 'var(--warm)' : 'var(--dark)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '1rem', lineHeight: 1, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 0,
    }}>{children}</button>
  )
}
