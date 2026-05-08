import React, { useRef, useState, useCallback } from 'react'
import WheelCanvas from './WheelCanvas'
import RewardPopup from './RewardPopup'
import AdminPanel from './AdminPanel'
import { BRANCH_META } from '../data/constants'
import { launchConfetti } from '../utils/helpers'

export default function WheelScreen({ branch, state, actions, onBack }) {
  const meta        = BRANCH_META[branch]
  const branchData  = state[branch]
  const rewards     = branchData.rewards
  // Wheel only renders prizes still in stock; out-of-stock ones disappear
  // from the slices but stay in the list below (strike-through).
  const wheelRewards = rewards.filter(r => r.inventory_count > 0)

  const wheelRef    = useRef(null)
  const [spinning, setSpinning]     = useState(false)
  const [winner, setWinner]         = useState(null)
  const [showAdmin, setShowAdmin]   = useState(false)
  const [adminTaps, setAdminTaps]   = useState(0)
  const tapTimerRef = useRef(null)

  // Pick winner + kick off animation
  const handleSpin = useCallback(() => {
    if (spinning) return
    if (!wheelRewards.length) return

    const picked = actions.pickWinner(branch)
    if (!picked) return

    setSpinning(true)
    // Index must be within the slices currently drawn on the wheel.
    const idx = wheelRewards.findIndex(r => r.id === picked.id)
    pendingWinnerRef.current = picked
    wheelRef.current?.spinTo(idx)
  }, [spinning, wheelRewards, actions, branch])

  const pendingWinnerRef = useRef(null)

  const handleSpinComplete = useCallback(() => {
    const won = pendingWinnerRef.current
    if (!won) return
    actions.claimReward(branch, won.id)
    setWinner(won)
    setSpinning(false)
    launchConfetti()
  }, [actions, branch])

  const handleClosePopup = useCallback(() => {
    setWinner(null)
    pendingWinnerRef.current = null
  }, [])

  // Admin: tap back arrow 5× quickly
  const handleAdminTap = () => {
    setAdminTaps(n => {
      const next = n + 1
      clearTimeout(tapTimerRef.current)
      tapTimerRef.current = setTimeout(() => setAdminTaps(0), 2000)
      if (next >= 5) { setAdminTaps(0); setShowAdmin(true) }
      return next
    })
  }

  const activeCount = rewards.filter(r => r.inventory_count > 0).length

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100dvh', padding: '1.5rem 1rem 2rem',
      background: 'var(--cream)',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <button onClick={() => { onBack(); handleAdminTap() }}
          style={{ background: 'none', border: 'none', fontSize: '0.7rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--light)', cursor: 'pointer', padding: '0.5rem 0' }}>
          ← Back
        </button>

        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)' }}>
          {meta.label}
        </span>

        {/* Hidden admin trigger: tap 5× */}
        <button onClick={() => {
          setAdminTaps(n => {
            const next = n + 1
            clearTimeout(tapTimerRef.current)
            tapTimerRef.current = setTimeout(() => setAdminTaps(0), 2500)
            if (next >= 5) { setAdminTaps(0); setShowAdmin(true) }
            return next
          })
        }} style={{ background: 'none', border: 'none', cursor: 'pointer',
          width: '32px', height: '32px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: '4px', height: '4px',
              background: adminTaps > 0 ? meta.accent : 'var(--warm)', borderRadius: '50%',
              transition: 'background 0.3s' }} />
          ))}
        </button>
      </div>

      {/* Wheel */}
      <div style={{ position: 'relative', width: '380px', height: '380px', maxWidth: '92vw', maxHeight: '92vw', margin: '0 auto 2rem' }}>
        {/* Pointer */}
        <div style={{
          position: 'absolute', top: '-10px', left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `22px solid ${meta.accent}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          zIndex: 10,
        }} />

        <WheelCanvas
          ref={wheelRef}
          branch={branch}
          rewards={wheelRewards}
          onSpinComplete={handleSpinComplete}
        />

        {/* Center hub */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '56px', height: '56px',
          background: 'var(--white)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 3px var(--cream), 0 0 0 5px ${meta.accent}`,
          zIndex: 10,
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: meta.accent }} />
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={spinning || activeCount === 0}
        style={{
          background: spinning || activeCount === 0 ? 'var(--light)' : 'var(--dark)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '100px',
          padding: '1.35rem 5rem',
          fontSize: '1.05rem',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: spinning || activeCount === 0 ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
          transition: 'all 0.2s ease',
        }}
      >
        {spinning ? 'Spinning…' : activeCount === 0 ? 'All Out' : 'Spin'}
      </button>

      {/* Prize list */}
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ fontSize: '0.62rem', letterSpacing: '0.26em', textTransform: 'uppercase',
          color: 'var(--light)', marginBottom: '0.75rem' }}>
          Available Prizes
        </div>

        {/* Public list — every prize is rendered as if available so guests
            never see which items have been depleted. Inventory state lives
            in the staff-only /#/inventory dashboard. */}
        {rewards.map((r, i) => {
          const color = meta.slices[i % meta.slices.length]
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center',
              padding: '0.6rem 0',
              borderBottom: '1px solid var(--warm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: color, flexShrink: 0 }} />
                <PrizeIcon reward={r} />
                <span style={{ fontSize: '0.82rem', color: 'var(--dark)' }}>
                  {r.display_name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reward Popup */}
      {winner && <RewardPopup reward={winner} onClose={handleClosePopup} />}

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          branch={branch}
          branchLabel={meta.label}
          state={state}
          onUpdateReward={actions.updateReward}
          onReset={actions.resetBranch}
          onImport={actions.importState}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}

/* Small icon that prefers the prize image; falls back to emoji on error. */
function PrizeIcon({ reward, size = 22, grayscale = false }) {
  const [failed, setFailed] = React.useState(false)
  const showImage = reward.image && !failed
  const filter = grayscale ? 'grayscale(1)' : 'none'

  if (showImage) {
    return (
      <img
        src={reward.image}
        alt=""
        onError={() => setFailed(true)}
        style={{
          width: size, height: size, objectFit: 'contain',
          flexShrink: 0, filter, opacity: grayscale ? 0.6 : 1,
        }}
      />
    )
  }
  return (
    <span style={{ fontSize: `${size * 0.85}px`, lineHeight: 1, flexShrink: 0,
      filter, opacity: grayscale ? 0.5 : 1 }}>{reward.emoji}</span>
  )
}
