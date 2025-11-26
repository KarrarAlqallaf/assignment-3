import { useCallback, useEffect, useRef, useState } from 'react'
import './HorseRunner.css'

const CANVAS_WIDTH = 860
const CANVAS_HEIGHT = 260
const GROUND_LEVEL = CANVAS_HEIGHT - 30
const HERO_HEIGHT = 70
const HERO_WIDTH = 90
const HERO_X = 90
const GRAVITY = 0.8
const JUMP_FORCE = 14
const BASE_SPEED = 5.4
const SPEED_SCALE = 0.0015
const MIN_SPAWN = 900
const MAX_SPAWN = 1600

const getRandomSpawn = () =>
  MIN_SPAWN + Math.random() * (MAX_SPAWN - MIN_SPAWN)

const initialSnapshot = {
  heroY: GROUND_LEVEL,
  obstacles: [],
  score: 0
}

const HorseRunner = ({ language = 'Eng' }) => {
  const canvasRef = useRef(null)
  const heroRef = useRef({ y: GROUND_LEVEL, vy: 0 })
  const obstaclesRef = useRef([])
  const spawnTimerRef = useRef(0)
  const nextSpawnRef = useRef(getRandomSpawn())
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const scoreRef = useRef(0)

  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [gameStatus, setGameStatus] = useState('idle') // idle | running | over
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem('horse-runner-highscore')) || 0
  )

  const strings =
    language === 'Eng'
      ? {
          title: 'Horse Sprint',
          instructions: 'Press Space/Up to jump. Dodge sand dunes.',
          idle: 'Press Space or the button to ride.',
          over: 'You stumbled! Press Enter to retry.',
          cta: gameStatus === 'running' ? 'Riding...' : 'Ride Now'
        }
      : {
          title: 'سباق الفارس',
          instructions: 'اضغط المسطرة أو السهم للأعلى للقفز وتفادي الكثبان.',
          idle: 'اضغط مسطرة البدء أو الزر للانطلاق.',
          over: 'تعثرت! اضغط إدخال للمحاولة من جديد.',
          cta: gameStatus === 'running' ? 'جاري الركض...' : 'ابدأ الركوب'
        }

  const resetGame = useCallback(() => {
    heroRef.current = { y: GROUND_LEVEL, vy: 0 }
    obstaclesRef.current = []
    spawnTimerRef.current = 0
    nextSpawnRef.current = getRandomSpawn()
    scoreRef.current = 0
    setSnapshot(initialSnapshot)
    lastTimeRef.current = null
  }, [])

  const startGame = useCallback(() => {
    resetGame()
    setGameStatus('running')
  }, [resetGame])

  const endGame = useCallback(() => {
    setGameStatus('over')
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current)
      localStorage.setItem('horse-runner-highscore', scoreRef.current.toFixed(0))
    }
  }, [highScore])

  const jump = useCallback(() => {
    if (heroRef.current.y >= GROUND_LEVEL - 1) {
      heroRef.current.vy = -JUMP_FORCE
    }
  }, [])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        if (gameStatus !== 'running') {
          startGame()
        } else {
          jump()
        }
      }

      if (event.code === 'Enter' && gameStatus !== 'running') {
        startGame()
      }
    },
    [gameStatus, jump, startGame]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const updateGame = useCallback(
    (delta) => {
      const hero = heroRef.current
      const speed = BASE_SPEED + scoreRef.current * SPEED_SCALE

      hero.vy += GRAVITY
      hero.y += hero.vy

      if (hero.y >= GROUND_LEVEL) {
        hero.y = GROUND_LEVEL
        hero.vy = 0
      }

      spawnTimerRef.current += delta
      if (spawnTimerRef.current > nextSpawnRef.current) {
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 40,
          width: 28 + Math.random() * 30,
          height: 35 + Math.random() * 50
        })
        spawnTimerRef.current = 0
        nextSpawnRef.current = getRandomSpawn()
      }

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - speed
        }))
        .filter((obstacle) => obstacle.x + obstacle.width > 0)

      const heroRect = {
        x: HERO_X + 5,
        y: hero.y - HERO_HEIGHT + 5,
        width: HERO_WIDTH - 10,
        height: HERO_HEIGHT - 10
      }

      for (const obstacle of obstaclesRef.current) {
        const obstacleRect = {
          x: obstacle.x,
          y: GROUND_LEVEL - obstacle.height,
          width: obstacle.width,
          height: obstacle.height
        }

        const intersects =
          heroRect.x < obstacleRect.x + obstacleRect.width &&
          heroRect.x + heroRect.width > obstacleRect.x &&
          heroRect.y < obstacleRect.y + obstacleRect.height &&
          heroRect.y + heroRect.height > obstacleRect.y

        if (intersects) {
          endGame()
          return
        }
      }

      scoreRef.current += delta * 0.02

      setSnapshot({
        heroY: hero.y,
        obstacles: obstaclesRef.current,
        score: Math.floor(scoreRef.current)
      })
    },
    [endGame]
  )

  useEffect(() => {
    if (gameStatus !== 'running') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const loop = (timestamp) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp
      }
      const delta = Math.min(32, timestamp - lastTimeRef.current)
      lastTimeRef.current = timestamp
      updateGame(delta)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [gameStatus, updateGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const styles = getComputedStyle(document.documentElement)
    const sky = styles.getPropertyValue('--color-game-sky') || '#1f1f1f'
    const ground = styles.getPropertyValue('--color-game-ground') || '#3a2a17'
    const horse = styles.getPropertyValue('--color-game-horse') || '#c39a5d'
    const rider = styles.getPropertyValue('--color-game-rider') || '#111'
    const robe = styles.getPropertyValue('--color-game-robe') || '#fff'
    const obstacleColor =
      styles.getPropertyValue('--color-game-obstacle') || '#a0522d'
    const sunColor = styles.getPropertyValue('--color-game-sun') || '#f5a623'

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.fillStyle = sunColor
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH - 80, 60, 28, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = ground
    ctx.fillRect(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL)

    ctx.fillStyle = horse
    const heroTop = snapshot.heroY - HERO_HEIGHT + 20
    ctx.fillRect(HERO_X, heroTop + 20, 70, 30)
    ctx.fillRect(HERO_X + 60, heroTop + 10, 26, 18)
    ctx.fillRect(HERO_X + 10, heroTop + 50, 10, 25)
    ctx.fillRect(HERO_X + 50, heroTop + 50, 10, 25)

    ctx.fillStyle = rider
    ctx.fillRect(HERO_X + 20, heroTop - 10, 20, 20)
    ctx.fillStyle = robe
    ctx.fillRect(HERO_X + 15, heroTop + 10, 30, 25)

    ctx.fillStyle = obstacleColor
    snapshot.obstacles.forEach((obstacle) => {
      const obsTop = GROUND_LEVEL - obstacle.height
      ctx.fillRect(obstacle.x, obsTop, obstacle.width, obstacle.height)
    })
  }, [snapshot])

  const statusLabel =
    gameStatus === 'over'
      ? strings.over
      : gameStatus === 'idle'
        ? strings.idle
        : strings.instructions

  return (
    <section className="horse-runner">
      <div className="horse-runner__header">
        <h3 className="horse-runner__title">{strings.title}</h3>
        <div className="horse-runner__panel">
          <span>
            {language === 'Eng' ? 'Score' : 'النتيجة'}{' '}
            {snapshot.score.toString().padStart(4, '0')}
          </span>
          <span>
            {language === 'Eng' ? 'Best' : 'الأفضل'}{' '}
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div className="horse-runner__canvas">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>

      <div className="horse-runner__cta">
        <p className="horse-runner__status">{statusLabel}</p>
        <button
          type="button"
          onClick={gameStatus === 'running' ? jump : startGame}
          disabled={gameStatus === 'running'}
        >
          {strings.cta}
        </button>
      </div>
    </section>
  )
}

export default HorseRunner


