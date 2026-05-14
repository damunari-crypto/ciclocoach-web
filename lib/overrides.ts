import type { DailyWorkout } from './types'
import { WORKOUT_META } from './types'
import type { PlanOverrides } from './planAgent'

const RAW_URL = 'https://raw.githubusercontent.com/damunari-crypto/ciclocoach-web/main/data/overrides.json'

export async function fetchOverrides(): Promise<PlanOverrides> {
  try {
    const res = await fetch(RAW_URL, { next: { revalidate: 60 } })
    if (!res.ok) return { lastUpdated: '', coachNote: null, days: {} }
    return await res.json()
  } catch {
    return { lastUpdated: '', coachNote: null, days: {} }
  }
}

export function applyOverride(workout: DailyWorkout, overrides: PlanOverrides): DailyWorkout {
  const day = overrides.days[workout.date]
  if (!day) return workout

  const result = { ...workout }

  if (day.skip) {
    return {
      ...workout,
      type: 'REST',
      venue: 'REST',
      durationMinutes: 0,
      tss: 0,
      summary: day.reason ?? 'Riposo su indicazione coach.',
      mainIntervals: [],
      gymExercises: [],
      mainPowerMin: 0,
      mainPowerMax: 0,
    }
  }

  if (day.type) {
    const meta = WORKOUT_META[day.type as keyof typeof WORKOUT_META]
    result.type = day.type as DailyWorkout['type']
    if (meta) {
      // Convert to lighter workout (Z2) keeping original structure but overriding summary
    }
  }

  if (day.durationMinutes) result.durationMinutes = day.durationMinutes
  if (day.summaryOverride) result.summary = day.summaryOverride
  if (overrides.coachNote) result.coachNote = overrides.coachNote

  return result
}
