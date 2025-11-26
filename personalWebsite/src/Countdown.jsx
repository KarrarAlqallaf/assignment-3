import { useEffect, useMemo, useState } from 'react'
import './Countdown.css'

const GRADUATION_DATE = new Date('2027-01-21T00:00:00')

const getTimeLeft = targetDate => {
  const now = Date.now()
  const diff = Math.max(0, targetDate.getTime() - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, completed: diff === 0 }
}

const Countdown = ({ language = 'Eng' }) => {
  const graduationDate = useMemo(() => GRADUATION_DATE, [])
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(graduationDate))

  useEffect(() => {
    if (timeLeft.completed) return

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(graduationDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [graduationDate, timeLeft.completed])

  const labels =
    language === 'Eng'
      ? {
          heading: 'Expected to be graduated in',
          finished: '🎓 Graduation day has arrived!'
        }
      : {
          heading: 'العد التنازلي للتخرج',
          finished: '🎓 وصل يوم التخرج!'
        }

  const units =
    language === 'Eng'
      ? ['Days', 'Hours', 'Minutes', 'Seconds']
      : ['أيام', 'ساعات', 'دقائق', 'ثواني']

  if (timeLeft.completed) {
    return (
      <section className="countdown">
        <h2 className="countdown__heading">{labels.heading}</h2>
        <p className="countdown__finished">{labels.finished}</p>
      </section>
    )
  }

  const values = [
    timeLeft.days,
    timeLeft.hours,
    timeLeft.minutes,
    timeLeft.seconds
  ]

  return (
    <section className="countdown">
      <h2 className="countdown__heading">{labels.heading}</h2>
      <div className="countdown__grid" dir={language === 'Arb' ? 'rtl' : 'ltr'}>
        {units.map((label, index) => (
          <div key={label} className="countdown__unit">
            <span className="countdown__value">
              {String(values[index]).padStart(2, '0')}
            </span>
            <span className="countdown__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Countdown

