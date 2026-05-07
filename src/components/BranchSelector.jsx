import React from 'react'
import { BRANCH_META } from '../data/constants'

const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    padding: '2rem 1.5rem',
    background: 'var(--cream)',
  },
  lockup: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2.2rem, 6vw, 3rem)',
    fontWeight: 300,
    letterSpacing: '0.14em',
    color: 'var(--dark)',
  },
  sub: {
    fontSize: '0.65rem',
    letterSpacing: '0.3em',
    color: 'var(--light)',
    textTransform: 'uppercase',
    marginTop: '0.4rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
    maxWidth: '360px',
  },
  btn: (accent) => ({
    background: 'var(--white)',
    border: '1px solid var(--warm)',
    borderRadius: '14px',
    padding: '1.6rem 1rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  }),
  flag: {
    fontSize: '1.8rem',
    marginBottom: '0.5rem',
    display: 'block',
  },
  name: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.15rem',
    fontWeight: 500,
    display: 'block',
    color: 'var(--dark)',
  },
  city: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    color: 'var(--light)',
    textTransform: 'uppercase',
    display: 'block',
    marginTop: '0.25rem',
  },
  divider: {
    width: '32px',
    height: '1px',
    background: 'var(--warm)',
    margin: '1.5rem auto 0',
  },
}

export default function BranchSelector({ onSelect, onInventory }) {
  const [hovered, setHovered] = React.useState(null)

  return (
    <div style={styles.screen}>
      <div style={styles.lockup}>
        <h1 style={styles.h1}>MEANDER</h1>
        <p style={styles.sub}>Lucky Wheel · Gift Campaign</p>
        <div style={styles.divider} />
      </div>

      <div style={styles.grid}>
        {Object.entries(BRANCH_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...styles.btn(meta.accent),
              transform: hovered === key ? 'translateY(-3px)' : 'none',
              boxShadow: hovered === key ? `0 10px 30px rgba(0,0,0,0.1)` : 'none',
              borderColor: hovered === key ? meta.accent : 'var(--warm)',
            }}
          >
            <span style={styles.flag}>{meta.flag}</span>
            <span style={styles.name}>Meander</span>
            <span style={styles.city}>{meta.city}</span>
          </button>
        ))}
      </div>

      {onInventory && (
        <button onClick={onInventory} style={{
          marginTop: '2rem', background: 'none', border: 'none',
          fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--light)', cursor: 'pointer', padding: '0.5rem 0.75rem',
          textDecoration: 'underline', textDecorationColor: 'var(--warm)',
          textUnderlineOffset: '4px',
        }}>
          Staff · Inventory
        </button>
      )}
    </div>
  )
}
