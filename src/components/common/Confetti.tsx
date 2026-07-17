// ============================================
// CORIANDOLI ROSA — partono una volta sola, subito dopo il login
//
// Il flag in sessionStorage viene scritto dalla pagina di login e consumato qui:
// così i coriandoli non ripartono a ogni visita della home.
// ============================================

import { useEffect, useRef } from 'react'
import { KEYS } from '../../utils/storage'

const COLORS = [
  '#FF69B4', '#FF69B4', '#FF69B4',
  '#FFB6C1', '#FFB6C1', '#FFB6C1',
  '#FF1493', '#FF1493',
  '#FFC0CB', '#FFC0CB',
  '#FF85C2',
  '#ffffff', '#ffffff',
  '#FFE4F0',
]

const SPAWN_DURATION_MS = 5000
const SPAWN_PROBABILITY = 0.8
const FADE_PER_FRAME = 0.004

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  rotation: number
  rotationSpeed: number
  color: string
  opacity: number
  shape: 'rect' | 'circle'
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function createParticle(): Particle {
  // Più rettangoli che ellissi: ricorda i coriandoli di carta
  let shape: Particle['shape'] = 'circle'
  if (Math.random() < 0.6) shape = 'rect'

  return {
    shape,
    x: random(0, window.innerWidth),
    y: random(-20, -5),
    size: random(4, 9),
    speedY: random(1.5, 3.5),
    speedX: random(-1.5, 1.5),
    rotation: random(0, 360),
    rotationSpeed: random(-5, 5),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: random(0.7, 1),
  }
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flagConsumed = useRef(false)

  useEffect(() => {
    // Il flag si legge una volta sola. In StrictMode React esegue effect →
    // cleanup → effect: senza questo guardia il secondo giro non troverebbe
    // più il flag e i coriandoli non partirebbero mai in sviluppo.
    if (!flagConsumed.current) {
      if (!sessionStorage.getItem(KEYS.justLoggedIn)) return
      sessionStorage.removeItem(KEYS.justLoggedIn)
      flagConsumed.current = true
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    let spawning = true
    let frameId = 0

    const spawnTimer = setTimeout(() => {
      spawning = false
    }, SPAWN_DURATION_MS)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (spawning && Math.random() < SPAWN_PROBABILITY) particles.push(createParticle())

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2)
        } else {
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()

        p.y += p.speedY
        p.x += p.speedX
        p.rotation += p.rotationSpeed
        p.opacity -= FADE_PER_FRAME

        if (p.y > window.innerHeight + 15 || p.opacity <= 0) particles.splice(i, 1)
      }

      // A riposo il loop si ferma del tutto: niente CPU/batteria su una pagina ferma
      if (spawning || particles.length > 0) frameId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      clearTimeout(spawnTimer)
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  )
}
