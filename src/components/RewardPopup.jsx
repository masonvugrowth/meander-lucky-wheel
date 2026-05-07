import React, { useState } from 'react'
import { TIER_LABELS } from '../data/constants'

export default function RewardPopup({ reward, onClose }) {
  if (!reward) return null
  const tier = TIER_LABELS[reward.tier] ?? TIER_LABELS.common
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = reward.image && !imgFailed

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,26,24,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--white)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '320px',
        width: '100%',
        animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {showImage ? (
          <img
            src={reward.image}
            alt={reward.display_name}
            onError={() => setImgFailed(true)}
            style={{
              width: '140px', height: '140px', objectFit: 'contain',
              margin: '0 auto 0.75rem', display: 'block',
            }}
          />
        ) : (
          <div style={{ fontSize: '3.8rem', marginBottom: '0.75rem' }}>{reward.emoji}</div>
        )}

        <div style={{
          fontSize: '0.62rem',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'var(--light)',
          marginBottom: '0.4rem',
        }}>
          Congratulations!
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.75rem',
          fontWeight: 400,
          color: 'var(--dark)',
          lineHeight: 1.2,
          marginBottom: '0.5rem',
        }}>
          {reward.display_name}
        </div>

        <div style={{
          fontSize: '0.68rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: tier.color,
          marginBottom: '1.75rem',
          fontWeight: 500,
        }}>
          {tier.label}
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'var(--dark)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '100px',
            padding: '0.85rem 2.5rem',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Claim Gift
        </button>
      </div>
    </div>
  )
}
