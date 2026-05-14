import type { FitnessData, FitnessSnapshot } from './types'

const ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID ?? 'i316979'
const API_KEY    = process.env.INTERVALS_API_KEY    ?? '3z27n0dt2wtxl5v43u7z8y3g'
const BASE_URL   = 'https://intervals.icu'

function authHeader() {
  const credentials = Buffer.from(`API_KEY:${API_KEY}`).toString('base64')
  return { Authorization: `Basic ${credentials}` }
}

export interface RecentActivity {
  date: string
  name: string
  type: string
  durationSeconds: number
  distanceMeters: number
  tss: number | null
  averagePower: number | null
  normalizedPower: number | null
}

export async function fetchRecentActivities(daysBack = 14): Promise<RecentActivity[]> {
  const today  = new Date()
  const oldest = new Date(today)
  oldest.setDate(oldest.getDate() - daysBack)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const res = await fetch(
    `${BASE_URL}/api/v1/athlete/${ATHLETE_ID}/activities?oldest=${fmt(oldest)}&newest=${fmt(today)}&cols=id,start_date_local,name,type,moving_time,distance,icu_training_load,average_watts,icu_weighted_avg_watts`,
    { headers: authHeader(), cache: 'no-store' }
  )
  if (!res.ok) return []

  const data = await res.json()
  return (data ?? []).map((a: any) => ({
    date:            (a.start_date_local ?? '').split('T')[0],
    name:            a.name ?? '',
    type:            a.type ?? '',
    durationSeconds: a.moving_time ?? 0,
    distanceMeters:  a.distance ?? 0,
    tss:             a.icu_training_load ?? null,
    averagePower:    a.average_watts ?? null,
    normalizedPower: a.icu_weighted_avg_watts ?? null,
  }))
}

export async function fetchFitnessData(weeksBack = 4): Promise<FitnessData> {
  const today  = new Date()
  const oldest = new Date(today)
  oldest.setDate(oldest.getDate() - weeksBack * 7)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const res = await fetch(
    `${BASE_URL}/api/v1/athlete/${ATHLETE_ID}/wellness.json?oldest=${fmt(oldest)}&newest=${fmt(today)}`,
    { headers: authHeader(), next: { revalidate: 300 } }
  )

  if (!res.ok) throw new Error(`Intervals.icu error: ${res.status}`)

  const data = await res.json()

  const snapshots: FitnessSnapshot[] = data
    .filter((w: any) => w.ctl != null && w.atl != null)
    .map((w: any) => ({
      date:  w.id,
      ctl:   w.ctl,
      atl:   w.atl,
      tsb:   w.ctl - w.atl,
      eftp:  w.eftp ? Math.round(w.eftp) : 252,
      tss:   w.ctlLoad ?? undefined,
    }))

  if (snapshots.length === 0) throw new Error('Nessun dato disponibile')

  const current = snapshots[snapshots.length - 1]

  const lastWeekDate = new Date(today)
  lastWeekDate.setDate(lastWeekDate.getDate() - 7)
  const lastWeekStr = fmt(lastWeekDate)

  const recentRides = snapshots.filter(s => s.date > lastWeekStr && (s.tss ?? 0) > 0)
  const weeklyTSS   = recentRides.reduce((sum, s) => sum + (s.tss ?? 0), 0)

  let alert: string | undefined
  if (current.tsb < -30)                alert = '⚠️ Overreaching: TSB ' + current.tsb.toFixed(0) + '. Solo Z1/Z2 finché TSB > -20.'
  else if (current.tsb < -20)           alert = 'Fatica elevata (TSB ' + current.tsb.toFixed(0) + '). Priorità al recupero.'
  else if (current.atl > current.ctl * 3) alert = 'Carico acuto 3× il fitness cronico. Gestisci il volume.'
  else if (current.tsb > 10)            alert = 'Forma positiva (TSB +' + current.tsb.toFixed(0) + '). Pronto per sforzi intensi.'

  return { current, history: snapshots, weeklyTSS, ridesThisWeek: recentRides.length, alert }
}
