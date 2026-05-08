import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { BRANCH_META } from '../data/constants'
import { easeOutQuart, playSpinSound } from '../utils/helpers'

const SIZE = 380
const CX = SIZE / 2
const CY = SIZE / 2
const R  = SIZE / 2 - 8

const WheelCanvas = forwardRef(function WheelCanvas({ branch, rewards, onSpinComplete }, ref) {
  const canvasRef    = useRef(null)
  const angleRef     = useRef(0)
  const rafRef       = useRef(null)
  const spinningRef  = useRef(false)
  const imagesRef    = useRef({})        // { [reward.id]: HTMLImageElement | 'failed' }

  // ── Preload prize images ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    rewards.forEach((r) => {
      if (!r.image || imagesRef.current[r.id]) return
      const img = new Image()
      img.onload  = () => { if (!cancelled) { imagesRef.current[r.id] = img; draw() } }
      img.onerror = () => { if (!cancelled) { imagesRef.current[r.id] = 'failed' } }
      img.src = r.image
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards])

  // ── Draw ─────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const meta = BRANCH_META[branch]
    const N = rewards.length
    if (!N) return

    // HiDPI scaling so text/images stay crisp
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== SIZE * dpr) {
      canvas.width  = SIZE * dpr
      canvas.height = SIZE * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

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

      // ── Label area: image (or emoji) above name ──────────────
      const midA  = startA + sliceAngle / 2
      const textR = R * 0.62
      ctx.save()
      ctx.translate(CX + textR * Math.cos(midA), CY + textR * Math.sin(midA))
      ctx.rotate(midA + Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Icon: prefer real image, fall back to emoji
      const img = imagesRef.current[r.id]
      const iconSize = 44
      if (img && img !== 'failed') {
        const prevAlpha = ctx.globalAlpha
        if (isOut) ctx.globalAlpha = 0.4
        ctx.drawImage(img, -iconSize / 2, -iconSize / 2 - 12, iconSize, iconSize)
        ctx.globalAlpha = prevAlpha
      } else {
        ctx.font = '500 22px DM Sans, sans-serif'
        ctx.fillStyle = isOut ? '#aaa' : '#1a1a18'
        ctx.fillText(r.emoji, 0, -16)
      }

      // Short name — bigger, bolder, darker for legibility
      const short = r.display_name.length > 14
        ? r.display_name.substring(0, 12) + '…'
        : r.display_name
      ctx.font = '600 10.5px "DM Sans", sans-serif'
      ctx.fillStyle = isOut ? '#999' : '#1f1f1d'
      ctx.fillText(short, 0, 22)
      ctx.restore()
    })

    // Outer accent ring
    ctx.beginPath()
    ctx.arc(CX, CY, R, 0, 2 * Math.PI)
    ctx.strokeStyle = meta.accent
    ctx.lineWidth = 4
    ctx.stroke()
  }, [branch, rewards])

  useEffect(() => { draw() }, [draw])

  // Redraw when DPR changes (e.g. moving across monitors)
  useEffect(() => {
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  // ── Spin API ─────────────────────────────────────────────────
  const spinTo = useCallback((winnerIdx) => {
    if (spinningRef.current) return
    spinningRef.current = true
    playSpinSound()

    const N = rewards.length
    const sliceAngle = (2 * Math.PI) / N
    const extraSpins  = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI
    const targetSliceCenter = winnerIdx * sliceAngle
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.55

    // Subtract the current rotation so the pointer lands on the winner regardless
    // of where the wheel left off after a previous spin.
    const startAngle = angleRef.current
    const targetDelta = extraSpins - startAngle - targetSliceCenter - sliceAngle / 2 + jitter

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
      style={{
        width: `${SIZE}px`, height: `${SIZE}px`,
        borderRadius: '50%', display: 'block',
      }}
    />
  )
})

export default WheelCanvas
