import type { PowerZones } from './types'

export function computeZones(ftp: number): PowerZones {
  return {
    z1Max:  Math.round(ftp * 0.55),
    z2Min:  Math.round(ftp * 0.56),
    z2Max:  Math.round(ftp * 0.75),
    z3Min:  Math.round(ftp * 0.76),
    z3Max:  Math.round(ftp * 0.90),
    ssMin:  Math.round(ftp * 0.88),
    ssMax:  Math.round(ftp * 0.95),
    thMin:  Math.round(ftp * 0.95),
    thMax:  Math.round(ftp * 1.05),
    vo2Min: Math.round(ftp * 1.06),
    vo2Max: Math.round(ftp * 1.20),
    recMax: Math.round(ftp * 0.60),
  }
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—'
  if (minutes < 60) return `${minutes}'`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}'` : `${h}h`
}

export function tsbColor(tsb: number): string {
  if (tsb < -20) return '#C05A5A'
  if (tsb < -10) return '#D4A054'
  if (tsb > 5)   return '#6B9E8A'
  return '#6B7280'
}

export function tsbLabel(tsb: number): string {
  if (tsb < -20) return 'Sovraccarico'
  if (tsb < -10) return 'Fatica elevata'
  if (tsb > 10)  return 'Forma positiva'
  if (tsb > 5)   return 'Buona forma'
  return 'Equilibrato'
}
