import { fetchFitnessData } from '@/lib/intervals'
import { tsbColor, tsbLabel } from '@/lib/zones'

export const revalidate = 300

export default async function StatsPage() {
  let fitness = null
  try { fitness = await fetchFitnessData(8) } catch {}

  if (!fitness) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Forma Atletica</h1>
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-2)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
          <div>Impossibile caricare i dati Intervals.icu.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Ricarica la pagina tra qualche secondo.</div>
        </div>
      </div>
    )
  }

  const { current, history, weeklyTSS, ridesThisWeek, alert } = fitness

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Forma Atletica</h1>

      {/* Stato attuale */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 16 }}>
          SNAPSHOT OGGI
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <BigMetric label="CTL" sub="Fitness cronico" value={current.ctl.toFixed(1)} color="var(--green)" />
          <BigMetric label="ATL" sub="Fatica acuta" value={current.atl.toFixed(1)} color="var(--yellow)" />
          <BigMetric label="TSB" sub={tsbLabel(current.tsb)} value={(current.tsb >= 0 ? '+' : '') + current.tsb.toFixed(1)} color={tsbColor(current.tsb)} />
          <BigMetric label="eFTP" sub="Da Intervals.icu" value={current.eftp + 'W'} color="var(--orange)" />
        </div>

        {alert && (
          <div style={{
            marginTop: 16, background: current.tsb < -20 ? 'var(--red-lt)' : 'var(--yellow-lt)',
            borderRadius: 10, padding: '12px 14px',
            fontSize: 13, color: current.tsb < -20 ? 'var(--red)' : 'var(--yellow)', lineHeight: 1.5
          }}>
            {alert}
          </div>
        )}
      </div>

      {/* Settimana */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14 }}>
          ULTIMI 7 GIORNI
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--orange-lt)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--orange)' }}>{weeklyTSS.toFixed(0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>TSS totale</div>
          </div>
          <div style={{ background: 'var(--blue-lt)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)' }}>{ridesThisWeek}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>uscite in bici</div>
          </div>
        </div>
      </div>

      {/* Storico CTL/ATL */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14 }}>
          STORICO 8 SETTIMANE
        </div>
        {history.slice(-14).map(snap => (
          <div key={snap.date} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', width: 70, flexShrink: 0 }}>
              {new Date(snap.date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <Bar value={snap.ctl} max={80} color="var(--green)" label={`CTL ${snap.ctl.toFixed(0)}`} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Bar value={snap.atl} max={80} color="var(--yellow)" label={`ATL ${snap.atl.toFixed(0)}`} />
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, width: 40, textAlign: 'right',
              color: tsbColor(snap.tsb)
            }}>
              {snap.tsb >= 0 ? '+' : ''}{snap.tsb.toFixed(0)}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          <Legend color="var(--green)" label="CTL" />
          <Legend color="var(--yellow)" label="ATL" />
          <Legend color="var(--gray)" label="TSB (destra)" />
        </div>
      </div>
    </div>
  )
}

function BigMetric({ label, sub, value, color }: { label: string; sub: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{sub}</div>
    </div>
  )
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--gray-lt)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-3)', width: 52 }}>{label}</span>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 10, height: 4, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{label}</span>
    </div>
  )
}
