export type WorkoutType =
  | 'REST'
  | 'RECOVERY'
  | 'ENDURANCE'
  | 'TEMPO'
  | 'SWEET_SPOT'
  | 'THRESHOLD'
  | 'VO2MAX'
  | 'LONG_RIDE'
  | 'GYM'

export type WorkoutVenue = 'REST' | 'ROAD' | 'ROLLERS' | 'GYM'
export type TrainingPhase = 'RECOVERY_BASE' | 'AEROBIC_BUILD' | 'SWEET_SPOT' | 'THRESHOLD_VO2' | 'TAPER'

export interface PowerZones {
  z1Max: number
  z2Min: number; z2Max: number
  z3Min: number; z3Max: number
  ssMin: number; ssMax: number
  thMin: number; thMax: number
  vo2Min: number; vo2Max: number
  recMax: number
}

export interface WorkoutInterval {
  name: string
  sets: number
  durationMinutes: number
  powerMin: number
  powerMax: number
  recoveryMinutes: number
  recoveryPowerMax: number
  cadence?: [number, number]
  notes?: string
}

export interface WorkoutSection {
  durationMinutes: number
  description: string
  powerMin: number
  powerMax: number
  cadence?: [number, number]
}

export interface GymExercise {
  name: string
  sets: string
  reps: string
  notes?: string
  backSafe: boolean
}

export interface DailyWorkout {
  date: string // ISO format YYYY-MM-DD
  type: WorkoutType
  venue: WorkoutVenue
  durationMinutes: number
  tss: number
  summary: string
  warmup?: WorkoutSection
  mainIntervals: WorkoutInterval[]
  cooldown?: WorkoutSection
  mainPowerMin: number
  mainPowerMax: number
  cadenceTarget?: [number, number]
  gymExercises: GymExercise[]
  coachNote?: string
  nutritionNote?: string
  backNote?: string
}

export interface WeeklyPlan {
  weekNumber: number
  startDate: string
  phase: TrainingPhase
  weekGoal: string
  targetTSS: number
  days: DailyWorkout[]
}

export interface FitnessSnapshot {
  date: string
  ctl: number
  atl: number
  tsb: number
  eftp: number
  tss?: number
}

export interface FitnessData {
  current: FitnessSnapshot
  history: FitnessSnapshot[]
  weeklyTSS: number
  ridesThisWeek: number
  alert?: string
}

export const WORKOUT_META: Record<WorkoutType, { emoji: string; label: string; color: string; bg: string }> = {
  REST:       { emoji: '😴', label: 'Riposo',        color: '#9CA3AF', bg: '#F3F4F6' },
  RECOVERY:   { emoji: '🌀', label: 'Recupero',      color: '#6B9E8A', bg: '#E8F5F0' },
  ENDURANCE:  { emoji: '🚴', label: 'Resistenza Z2', color: '#5B8FA8', bg: '#E8F2F8' },
  TEMPO:      { emoji: '💨', label: 'Tempo Z3',      color: '#D4A054', bg: '#FDF3E3' },
  SWEET_SPOT: { emoji: '🎯', label: 'Sweet Spot',    color: '#D4785A', bg: '#FDEEE8' },
  THRESHOLD:  { emoji: '🔥', label: 'Soglia',        color: '#C05A5A', bg: '#FDEAEA' },
  VO2MAX:     { emoji: '⚡', label: 'VO₂max',        color: '#8B6BAE', bg: '#F0EBF8' },
  LONG_RIDE:  { emoji: '🏔️', label: 'Uscita Lunga',  color: '#5B8FA8', bg: '#E8F2F8' },
  GYM:        { emoji: '💪', label: 'Palestra',      color: '#7BA68A', bg: '#ECF5EE' },
}

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  RECOVERY_BASE: 'Base & Recupero',
  AEROBIC_BUILD: 'Costruzione Aerobica',
  SWEET_SPOT:    'Sweet Spot',
  THRESHOLD_VO2: 'Soglia & VO₂max',
  TAPER:         'Taper',
}
