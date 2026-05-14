import { generatePlan } from '@/lib/trainingPlan'
import { fetchFitnessData } from '@/lib/intervals'
import { WORKOUT_META, PHASE_LABELS, WeeklyPlan } from '@/lib/types'
import { formatDuration } from '@/lib/zones'
import Link from 'next/link'

export const revalidate = 300

const FTP_DEFAULT = 252

function todayStr() { return new Date().toISOString().split('T')[0] }

export default async function PlanPage() {
  const today = todayStr()
  let ftp = FTP_DEFAULT
  try { const f = await fetchFitnessData(); ftp = f.current.eftp } catch {}
  const plan = generatePlan(ftp)

  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Piano 11 Settimane</h1>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
        Apr 25 → Lug 15, 2026 · FTP {ftp}W
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plan.map(week => <WeekCard key={week.weekNumber} week={week} today={today} />)}
      </div>
    </div>
  )
}

function WeekCard({ week, today }: { week: WeeklyPlan; today: string }) {
  const isCurrentWeek = week.days.some(d => d.date === today)
  const weekTSS = week.days.filter(d => d.date <= today).reduce((s,d) => s+d.tss, 0)
  const progress = Math.min(1, weekTSS / week.targetTSS)
  const isPast = week.days.every(d => d.date < today)

  return (
    <div className="card" style={{
      padding: 16, opacity: isPast ? 0.6 : 1,
      borderLeft: isCurrentWeek ? '4px solid var(--orange)' : '4px solid transparent',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Settimana {week.weekNumber}</span>
            {isCurrentWeek && (
              <span style={{ background: 'var(--orange-lt)', color: 'var(--orange)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                IN CORSO
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 1 }}>{PHASE_LABELS[week.phase]}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{week.targetTSS} TSS</div>
          <div>{new Date(week.startDate + 'T12:00:00').toLocaleDateString('it-IT', { day:'numeric', month:'short' })}</div>
        </div>
      </div>

      {isCurrentWeek && (
        <div style={{ height: 4, borderRadius: 2, background: 'var(--gray-lt)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'var(--orange)', width: `${progress*100}%` }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 10 }}>
        {week.days.map(day => {
          const m = WORKOUT_META[day.type]
          const isToday = day.date === today
          return (
            <Link key={day.date} href={day.type !== 'REST' ? `/workout/${day.date}` : '#'}
              style={{ textDecoration: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'var(--text-3)', marginBottom: 2 }}>
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'narrow' })}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, margin: '0 auto',
                  background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, border: isToday ? `2px solid ${m.color}` : '2px solid transparent',
                }}>
                  {m.emoji}
                </div>
                {day.tss > 0 && (
                  <div style={{ fontSize: 8, color: 'var(--text-3)', marginTop: 2 }}>{day.tss}</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{week.weekGoal}</p>
    </div>
  )
}
