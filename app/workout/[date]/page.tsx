import { generatePlan, workoutForDate } from '@/lib/trainingPlan'
import { fetchFitnessData } from '@/lib/intervals'
import { WORKOUT_META } from '@/lib/types'
import type { DailyWorkout } from '@/lib/types'
import { formatDuration } from '@/lib/zones'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

const FTP_DEFAULT = 252

// ── Workout block model for visualization ────────────────────────────────────
interface Block {
  label: string
  durationMinutes: number
  powerAvg: number  // watts
  kind: 'warmup' | 'work' | 'recovery' | 'cooldown'
}

function buildBlocks(workout: DailyWorkout): Block[] {
  const blocks: Block[] = []
  if (workout.warmup) {
    blocks.push({
      label: 'Risc.',
      durationMinutes: workout.warmup.durationMinutes,
      powerAvg: Math.round((workout.warmup.powerMin + workout.warmup.powerMax) / 2),
      kind: 'warmup',
    })
  }
  for (const interval of workout.mainIntervals) {
    for (let s = 0; s < interval.sets; s++) {
      blocks.push({
        label: interval.durationMinutes < 2
          ? `${interval.durationMinutes * 60}"`
          : `${interval.durationMinutes}'`,
        durationMinutes: interval.durationMinutes,
        powerAvg: Math.round((interval.powerMin + interval.powerMax) / 2),
        kind: 'work',
      })
      if (interval.recoveryMinutes > 0) {
        blocks.push({
          label: `${interval.recoveryMinutes}'`,
          durationMinutes: interval.recoveryMinutes,
          powerAvg: Math.round(interval.recoveryPowerMax * 0.6),
          kind: 'recovery',
        })
      }
    }
  }
  if (workout.cooldown) {
    blocks.push({
      label: 'Def.',
      durationMinutes: workout.cooldown.durationMinutes,
      powerAvg: Math.round((workout.cooldown.powerMin + workout.cooldown.powerMax) / 2),
      kind: 'cooldown',
    })
  }
  return blocks
}

function estimateIF(workout: DailyWorkout, ftp: number): number {
  if (ftp === 0 || workout.mainPowerMin === 0) return 0
  const np = Math.round((workout.mainPowerMin + workout.mainPowerMax) / 2)
  return np / ftp
}

function zoneColor(powerAvg: number, ftp: number): string {
  const pct = ftp > 0 ? powerAvg / ftp : 0
  if (pct < 0.56) return '#9CA3AF'  // Z1
  if (pct < 0.76) return '#5B8FA8'  // Z2
  if (pct < 0.88) return '#D4A054'  // Z3
  if (pct < 0.95) return '#D4785A'  // SS
  if (pct < 1.06) return '#C05A5A'  // Threshold
  return '#8B6BAE'                   // VO2max+
}

export default async function WorkoutPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  let ftp = FTP_DEFAULT
  try { const f = await fetchFitnessData(); ftp = f.current.eftp } catch {}
  const plan = generatePlan(ftp)
  const workout = workoutForDate(plan, date)
  if (!workout || workout.type === 'REST') return notFound()

  const meta = WORKOUT_META[workout.type]
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const blocks = buildBlocks(workout)
  const totalMinutes = blocks.reduce((s, b) => s + b.durationMinutes, 0)
  const ifValue = estimateIF(workout, ftp)

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Hero */}
      <div style={{ background: meta.bg, padding: '24px 16px 20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
          ← Torna a Oggi
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 40 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: 1, textTransform: 'uppercase' }}>{dateLabel}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>{meta.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{workout.summary}</div>
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {workout.durationMinutes > 0 && <StatBox label="Durata" value={formatDuration(workout.durationMinutes)} />}
          {workout.tss > 0 && <StatBox label="TSS" value={String(workout.tss)} />}
          {ifValue > 0 && <StatBox label="IF" value={ifValue.toFixed(2)} />}
          {workout.mainPowerMin > 0 && <StatBox label="Potenza" value={`${workout.mainPowerMin}–${workout.mainPowerMax}W`} />}
          {workout.cadenceTarget && <StatBox label="Cadenza" value={`${workout.cadenceTarget[0]}–${workout.cadenceTarget[1]} rpm`} />}
          <StatBox label="Venue" value={workout.venue === 'ROLLERS' ? '🎰 Rulli' : workout.venue === 'ROAD' ? '🛣️ Strada' : '💪 Palestra'} />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Workout Profile Card */}
        {blocks.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ background: meta.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16 }}>📊</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>Profilo Allenamento</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              {/* Bar chart */}
              <div style={{ display: 'flex', gap: 2, height: 64, alignItems: 'flex-end', marginBottom: 12 }}>
                {blocks.map((b, i) => {
                  const widthPct = (b.durationMinutes / totalMinutes) * 100
                  const maxPower = ftp * 1.3
                  const heightPct = Math.max(12, Math.min(100, (b.powerAvg / maxPower) * 100))
                  const color = zoneColor(b.powerAvg, ftp)
                  return (
                    <div key={i} style={{
                      width: `${widthPct}%`, height: `${heightPct}%`,
                      background: color, borderRadius: '3px 3px 0 0',
                      minWidth: 4, position: 'relative',
                    }} title={`${b.label} — ${b.powerAvg}W`} />
                  )
                })}
              </div>

              {/* Block list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Warmup */}
                {workout.warmup && (
                  <BlockRow
                    color="#5B8FA8"
                    bg="#E8F2F8"
                    label="Riscaldamento"
                    detail={`${workout.warmup.durationMinutes} min · ${workout.warmup.powerMin}–${workout.warmup.powerMax}W`}
                  />
                )}
                {/* Main intervals */}
                {workout.mainIntervals.map((interval, i) => (
                  <div key={i}>
                    <BlockRow
                      color={meta.color}
                      bg={meta.bg}
                      label={`${interval.sets > 1 ? `${interval.sets}×` : ''}${interval.name}`}
                      detail={`${interval.durationMinutes < 2
                        ? `${interval.durationMinutes * 60}"`
                        : `${interval.durationMinutes}'`} · ${interval.powerMin}–${interval.powerMax}W${interval.sets > 1 ? ` · ×${interval.sets}` : ''}`}
                    />
                    {interval.recoveryMinutes > 0 && (
                      <BlockRow
                        color="#6B9E8A"
                        bg="#E8F5F0"
                        label="Recupero"
                        detail={`${interval.recoveryMinutes}' · <${interval.recoveryPowerMax}W`}
                        indent
                      />
                    )}
                  </div>
                ))}
                {/* Cooldown */}
                {workout.cooldown && (
                  <BlockRow
                    color="#6B9E8A"
                    bg="#E8F5F0"
                    label="Defaticamento"
                    detail={`${workout.cooldown.durationMinutes} min · ${workout.cooldown.powerMin}–${workout.cooldown.powerMax}W`}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Riscaldamento detail */}
        {workout.warmup && (
          <SectionCard title="Riscaldamento" emoji="🌡️" color="var(--blue)" bg="var(--blue-lt)">
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{workout.warmup.description}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{formatDuration(workout.warmup.durationMinutes)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{workout.warmup.powerMin}–{workout.warmup.powerMax}W</span>
              {workout.warmup.cadence && (
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{workout.warmup.cadence[0]}–{workout.warmup.cadence[1]} rpm</span>
              )}
            </div>
          </SectionCard>
        )}

        {/* Intervalli principali */}
        {workout.mainIntervals.length > 0 && (
          <SectionCard title="Allenamento Principale" emoji="🎯" color={meta.color} bg={meta.bg}>
            {workout.mainIntervals.map((interval, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 12, padding: 14,
                border: '1px solid var(--border)', marginTop: i > 0 ? 10 : 0
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{interval.name}</div>
                  {interval.sets > 1 && (
                    <span style={{
                      background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 99, border: `1px solid ${meta.color}40`
                    }}>×{interval.sets}</span>
                  )}
                </div>
                <div style={{
                  background: meta.bg, borderRadius: 10, padding: '10px 14px', marginBottom: 10,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: 1 }}>POTENZA TARGET</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: meta.color }}>{interval.powerMin}–{interval.powerMax}W</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>DURATA</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{formatDuration(interval.durationMinutes)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: interval.notes ? 10 : 0 }}>
                  {interval.cadence && <InfoPill label="Cadenza" value={`${interval.cadence[0]}–${interval.cadence[1]} rpm`} />}
                  {interval.recoveryMinutes > 0 && <InfoPill label="Recupero" value={`${interval.recoveryMinutes}' @ <${interval.recoveryPowerMax}W`} />}
                </div>
                {interval.notes && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, background: 'var(--gray-lt)', borderRadius: 8, padding: '8px 12px', whiteSpace: 'pre-line' }}>
                    {interval.notes}
                  </div>
                )}
              </div>
            ))}
          </SectionCard>
        )}

        {/* Defaticamento */}
        {workout.cooldown && (
          <SectionCard title="Defaticamento" emoji="❄️" color="var(--green)" bg="var(--green-lt)">
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{workout.cooldown.description}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{formatDuration(workout.cooldown.durationMinutes)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{workout.cooldown.powerMin}–{workout.cooldown.powerMax}W</span>
            </div>
          </SectionCard>
        )}

        {/* Palestra */}
        {workout.gymExercises.length > 0 && (
          <SectionCard title="Palestra" emoji="💪" color="var(--green)" bg="var(--green-lt)">
            {workout.gymExercises.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 0', borderBottom: i < workout.gymExercises.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{ex.backSafe ? '✅ ' : ''}{ex.name}</div>
                  {ex.notes && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{ex.notes}</div>}
                </div>
                <div style={{ textAlign: 'right', marginLeft: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{ex.sets} serie</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{ex.reps} rip</div>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Note coach */}
        {(workout.coachNote || workout.backNote || workout.nutritionNote) && (
          <SectionCard title="Note del Coach" emoji="📋" color="var(--orange)" bg="var(--orange-lt)">
            {workout.coachNote && <NoteBlock icon="💬" label="Coaching" text={workout.coachNote} />}
            {workout.backNote && <NoteBlock icon="🔧" label="Schiena" text={workout.backNote} />}
            {workout.nutritionNote && <NoteBlock icon="🥗" label="Nutrizione" text={workout.nutritionNote} />}
          </SectionCard>
        )}

        {/* Kikr setup */}
        {workout.venue === 'ROLLERS' && workout.mainPowerMin > 0 && (
          <SectionCard title="Setup Kickr Core" emoji="🎰" color="var(--purple)" bg="var(--purple-lt)">
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              <strong>Modalità:</strong> ERG Mode<br />
              <strong>Target principale:</strong> {workout.mainPowerMin}–{workout.mainPowerMax}W<br />
              <strong>App consigliata:</strong> Wahoo SYSTM o Zwift<br />
              <strong>Ventilazione:</strong> Ventilatore obbligatorio
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  )
}

function BlockRow({ color, bg, label, detail, indent }: {
  color: string; bg: string; label: string; detail: string; indent?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingLeft: indent ? 16 : 0,
    }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg, borderRadius: 8, padding: '6px 10px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{detail}</span>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: 10, padding: '8px 12px',
      border: '1px solid var(--border)', textAlign: 'center', minWidth: 64
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{value}</div>
    </div>
  )
}

function SectionCard({ title, emoji, color, bg, children }: {
  title: string; emoji: string; color: string; bg: string; children: React.ReactNode
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ background: bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{title}</span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{value}</span>
    </div>
  )
}

function NoteBlock({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{text}</div>
    </div>
  )
}
