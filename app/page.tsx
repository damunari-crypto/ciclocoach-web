import { generatePlan, workoutForDate, currentWeek } from '@/lib/trainingPlan'
import { fetchFitnessData } from '@/lib/intervals'
import { WORKOUT_META, PHASE_LABELS } from '@/lib/types'
import { formatDuration, tsbColor, tsbLabel, computeZones } from '@/lib/zones'
import Link from 'next/link'

const FTP_DEFAULT = 252
const EVENT_DATE  = '2026-07-15'

function daysToEvent(): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const event = new Date(EVENT_DATE)
  return Math.max(0, Math.round((event.getTime() - today.getTime()) / 86400000))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function italianDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export const revalidate = 300

export default async function HomePage() {
  const today = todayStr()

  // Carica dati Intervals.icu (fallback silenzioso)
  let fitness = null
  try { fitness = await fetchFitnessData() } catch {}

  const ftp  = fitness?.current.eftp ?? FTP_DEFAULT
  const plan = generatePlan(ftp)
  const workout = workoutForDate(plan, today)
  const week  = currentWeek(plan, today)
  const zones = computeZones(ftp)

  const meta = workout ? WORKOUT_META[workout.type] : WORKOUT_META['REST']

  const weekTSS = week?.days
    .filter(d => d.date <= today)
    .reduce((s, d) => s + d.tss, 0) ?? 0

  const weekProgress = week ? Math.min(1, weekTSS / week.targetTSS) : 0

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--orange)', letterSpacing: '-0.5px' }}>
            CicloCoach
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>
            {italianDate(today)}
          </p>
        </div>
        <div style={{
          background: 'var(--orange-lt)', borderRadius: 12, padding: '8px 14px',
          textAlign: 'center', border: '1px solid #F2C9BA'
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--orange)' }}>
            {daysToEvent()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.3 }}>
            giorni<br />all'evento
          </div>
        </div>
      </div>

      {/* Card allenamento oggi */}
      <Link href={workout && workout.type !== 'REST' ? `/workout/${today}` : '#'}
        style={{ textDecoration: 'none' }}>
        <div className="card" style={{
          padding: 20, cursor: workout?.type !== 'REST' ? 'pointer' : 'default',
          borderLeft: `4px solid ${meta.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{meta.emoji}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: meta.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                OGGI
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
                {meta.label}
              </div>
            </div>
            {workout && workout.type !== 'REST' && (
              <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 18 }}>›</span>
            )}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>
            {workout?.summary ?? 'Riposo — recupero, idratazione e sonno di qualità.'}
          </p>

          {workout && workout.type !== 'REST' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {workout.durationMinutes > 0 && (
                <Chip icon="⏱" label={formatDuration(workout.durationMinutes)} />
              )}
              {workout.mainPowerMin > 0 && (
                <Chip icon="⚡" label={`${workout.mainPowerMin}–${workout.mainPowerMax}W`} />
              )}
              {workout.tss > 0 && (
                <Chip icon="📈" label={`TSS ${workout.tss}`} />
              )}
              {workout.mainIntervals.length > 0 && workout.mainIntervals[0].sets > 1 && (
                <Chip icon="🔁" label={`${workout.mainIntervals[0].sets}×${workout.mainIntervals[0].durationMinutes} min`} />
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Card fitness Intervals.icu */}
      {fitness ? (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📡</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Intervals.icu</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  eFTP {ftp}W · {fitness.ridesThisWeek} uscite questa settimana
                </div>
              </div>
            </div>
            <form action="/api/fitness" style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            <FitnessMetric label="CTL" value={fitness.current.ctl.toFixed(0)} sub="Fitness" color="var(--green)" />
            <FitnessMetric label="ATL" value={fitness.current.atl.toFixed(0)} sub="Fatica" color="var(--yellow)" />
            <FitnessMetric label="TSB" value={(fitness.current.tsb >= 0 ? '+' : '') + fitness.current.tsb.toFixed(0)} sub="Forma" color={tsbColor(fitness.current.tsb)} />
            <FitnessMetric label="TSS" value={fitness.weeklyTSS.toFixed(0)} sub="7 giorni" color="var(--orange)" />
          </div>

          {fitness.alert && (
            <div style={{
              background: fitness.current.tsb < -20 ? 'var(--red-lt)' : 'var(--yellow-lt)',
              borderRadius: 10, padding: '10px 12px',
              fontSize: 12, color: fitness.current.tsb < -20 ? 'var(--red)' : 'var(--yellow)',
              lineHeight: 1.5
            }}>
              {fitness.alert}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 20, opacity: 0.6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>📡</span>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Dati Intervals.icu non disponibili. Ricarica la pagina.
            </div>
          </div>
        </div>
      )}

      {/* Settimana corrente */}
      {week && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Settimana {week.weekNumber}</div>
              <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2 }}>{PHASE_LABELS[week.phase]}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{weekTSS} / {week.targetTSS}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>TSS settimana</div>
            </div>
          </div>

          <div style={{
            height: 6, borderRadius: 3, background: 'var(--gray-lt)', overflow: 'hidden', marginBottom: 10
          }}>
            <div style={{
              height: '100%', borderRadius: 3, background: 'var(--orange)',
              width: `${weekProgress * 100}%`, transition: 'width 0.4s'
            }} />
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 14 }}>
            {week.weekGoal}
          </p>

          {/* Mini calendario */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {week.days.map(day => {
              const m = WORKOUT_META[day.type]
              const isToday = day.date === today
              return (
                <Link key={day.date} href={day.type !== 'REST' ? `/workout/${day.date}` : '#'}
                  style={{ textDecoration: 'none' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 3 }}>
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'narrow' })}
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, margin: '0 auto',
                      background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, border: isToday ? `2px solid ${m.color}` : '2px solid transparent',
                    }}>
                      {m.emoji}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Zone di potenza */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Zone di Potenza — FTP {ftp}W</div>
        </div>
        {([
          ['Z1 Recupero',    `< ${zones.z1Max}W`,                    'var(--gray)',   'var(--gray-lt)'],
          ['Z2 Resistenza',  `${zones.z2Min}–${zones.z2Max}W`,       'var(--blue)',   'var(--blue-lt)'],
          ['Z3 Tempo',       `${zones.z3Min}–${zones.z3Max}W`,       'var(--yellow)', 'var(--yellow-lt)'],
          ['Z4 Sweet Spot',  `${zones.ssMin}–${zones.ssMax}W`,       'var(--orange)', 'var(--orange-lt)'],
          ['Z5 Soglia',      `${zones.thMin}–${zones.thMax}W`,       'var(--red)',    'var(--red-lt)'],
          ['Z6 VO₂max',      `${zones.vo2Min}–${zones.vo2Max}W`,     'var(--purple)', 'var(--purple-lt)'],
        ] as [string, string, string, string][]).map(([label, range, color, bg]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, color,
              background: bg, padding: '2px 8px', borderRadius: 6
            }}>{range}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'var(--gray-lt)', borderRadius: 8,
      padding: '4px 10px', fontSize: 11, color: 'var(--text-2)', fontWeight: 600
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {label}
    </div>
  )
}

function FitnessMetric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1.2, margin: '2px 0' }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-2)' }}>{sub}</div>
    </div>
  )
}
