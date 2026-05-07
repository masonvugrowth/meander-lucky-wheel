// ── Weighted spin sound ──────────────────────────────────────────
export function playSpinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.5)
  } catch (_) {}
}

// ── Confetti ─────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#8fac65','#c9a84c','#5b8260','#038781','#e8b4c8','#c0556e','#f5f0e8']

export function launchConfetti(count = 60) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      const size = 6 + Math.random() * 6
      el.style.cssText = [
        `left: ${Math.random() * 100}vw`,
        `top: -12px`,
        `width: ${size}px`,
        `height: ${size}px`,
        `background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}`,
        `--dur: ${2 + Math.random() * 2}s`,
        `--delay: ${Math.random() * 0.4}s`,
        `border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}`,
        `transform: rotate(${Math.random() * 360}deg)`,
      ].join(';')
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 5000)
    }, i * 25)
  }
}

// ── Easing ───────────────────────────────────────────────────────
export function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

// ── Date formatter ───────────────────────────────────────────────
export function formatTs(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
