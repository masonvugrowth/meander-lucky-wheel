import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { BRANCH_META } from '../data/constants'
import { easeOutQuart, playSpinSound } from '../utils/helpers'

const SIZE = 320
const CX = SIZE / 2
const CY = SIZE / 2
const R  = SIZE / 2 - 8

const WheelCanvas = forwardRef(function WheelCanvas({ branch, rewards, onSpinComplete }, ref) {
  const canvasRef = useRef(null)
  const angleRef  = useRef(0)   // current rotation offset (radians)
  const rafRef    = useRef(null)
  const spinningRef = useRef(false)

  // ── Draw ──────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const meta = BRANCH_META[branch]
    const N = rewards.length
    if (!N) return
    const sliceAngle = (2 * Math.PI) / N

    ctx.clearRect(0, 0, SIZE, SIZE)

    rewards.forEach((r, i) => {
      const startA = angleRef.current + i * sliceAngle - Math.PI / 2
      const endA   = startA + sliceAngle
      const isOut  = r.inventory_count === 0
      const color  = meta.slices[i % meta.slices.length]

      // Slice fill
      ctx.beginPath()
      ctx.moveTo(CX, CY)
      ctx.arc(CX, CY, R, startA, endA)
      ctx.closePath()
      ctx.fillStyle = isOut ? '#e0dbd0' : color
      ctx.fill()

      // Slice border
      ctx.strokeStyle = '#f5f0e8'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      const midA  = startA + sliceAngle / 2
      const textR = R * 0.62
      ctx.save()
      ctx.translate(CX + textR * Math.cos(midA), CY + textR * Math.sin(midA))
      ctx.rotate(midA + Math.PI / 2)
      ctx.textAlign = 'center'

      // Emoji
      ctx.font = '500 13px DM Sans, sans-serif'
      ctx.fillStyle = isOut ? '#aaa' : '#1a1a18'
      ctx.fillText(r.emoji, 0, -10)

      // Short name
      const short = r.display_name.length > 13
        ? r.display_name.substring(0, 11) + '…'
        : r.display_name
      ctx.font = '400 7.5px DM Sans, sans-serif'
      ctx.fillStyle = isOut ? '#bbb' : '#3a3a38'
      ctx.fillText(short, 0, 4)
      ctx.restore()
    })

    // Outer accent ring
    ctx.beginPath()
    ctx.arc(CX, CY, R, 0, 2 * Math.PI)
    ctx.strokeStyle = meta.accent
    ctx.lineWidth = 4
    ctx.stroke()
  }, [branch, rewards])

  // Redraw whenever rewards change
  useEffect(() => { draw() }, [draw])

  // ── Spin API (called from parent via ref) ────────────────────
  const spinTo = useCallback((winnerIdx) => {
    if (spinningRef.current) return
    spinningRef.current = true
    playSpinSound()

    const N = rewards.length
    const sliceAngle = (2 * Math.PI) / N
    const extraSpins  = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI
    // Land pointer (top = -π/2) on the center of winner slice
    const targetSliceCenter = winnerIdx * sliceAngle
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.55
    const targetDelta = extraSpins - targetSliceCenter - sliceAngle / 2 + jitter

    const startAngle = angleRef.current
    const duration   = 4200 + Math.random() * 1200
    const startTime  = performance.now()

    function frame(now) {
      const t      = Math.min((now - startTime) / duration, 1)
      const eased  = easeOutQuart(t)
      angleRef.current = startAngle + targetDelta * eased
      draw()

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Normalise angle
        angleRef.current = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        spinningRef.current = false
        onSpinComplete()
      }
    }

    rafRef.current = requestAnimationFrame(frame)
  }, [rewards, draw, onSpinComplete])

  useImperativeHandle(ref, () => ({ spinTo }), [spinTo])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  )
})

export default WheelCanvas
