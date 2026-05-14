import Anthropic from '@anthropic-ai/sdk'
import { generatePlan, workoutForDate } from './trainingPlan'
import { fetchFitnessData, fetchRecentActivities } from './intervals'
import { readJsonFile, writeJsonFile } from './github'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface PlanOverrides {
  lastUpdated: string
  coachNote: string | null
  days: Record<string, {
    skip?: boolean
    type?: string
    durationMinutes?: number
    summaryOverride?: string
    reason?: string
  }>
}

export async function loadOverrides(): Promise<PlanOverrides> {
  try {
    const { json } = await readJsonFile('data/overrides.json')
    return json
  } catch {
    return { lastUpdated: '', coachNote: null, days: {} }
  }
}

function buildPlanContext(ftp: number, overrides: PlanOverrides) {
  const plan = generatePlan(ftp)
  const today = new Date().toISOString().split('T')[0]

  // Next 14 days of planned workouts
  const upcoming: string[] = []
  for (let i = -3; i <= 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    const date = d.toISOString().split('T')[0]
    const w = workoutForDate(plan, date)
    if (w) {
      const override = overrides.days[date]
      const status = date < today ? '✓ passato' : date === today ? '← OGGI' : ''
      const overrideNote = override ? ` [OVERRIDE: ${override.reason ?? JSON.stringify(override)}]` : ''
      upcoming.push(`${date} (${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][new Date(date+'T12:00:00').getDay()]}): ${w.type} ${w.durationMinutes}min TSS=${w.tss} ${status}${overrideNote}`)
    }
  }
  return upcoming.join('\n')
}

export async function runPlanAgent(userMessage?: string): Promise<{ reply: string; updated: boolean; writeError: string | null; hadPlanUpdate: boolean }> {
  const [fitness, activities, overridesData] = await Promise.all([
    fetchFitnessData(4).catch(() => null),
    fetchRecentActivities(14).catch(() => []),
    readJsonFile('data/overrides.json').catch(() => ({ json: { lastUpdated: '', coachNote: null, days: {} }, sha: '' })),
  ])

  const overrides: PlanOverrides = overridesData.json
  const sha: string = overridesData.sha
  const ftp = fitness?.current.eftp ?? 252

  const planContext = buildPlanContext(ftp, overrides)

  const activitiesText = activities.length === 0
    ? 'Nessuna attività recente trovata.'
    : activities.map(a =>
        `${a.date}: ${a.name} (${a.type}) — ${Math.round(a.durationSeconds/60)}min, TSS=${a.tss ?? '?'}, NP=${a.normalizedPower ?? '?'}W`
      ).join('\n')

  const fitnessText = fitness
    ? `CTL=${fitness.current.ctl.toFixed(1)}, ATL=${fitness.current.atl.toFixed(1)}, TSB=${fitness.current.tsb.toFixed(1)}, eFTP=${ftp}W`
    : 'Dati fitness non disponibili.'

  const today = new Date().toISOString().split('T')[0]

  const systemPrompt = `Sei il coach personale di ciclismo di Davide Munari.
Davide, 51 anni, 85kg, ha un'ernia discale L5-S1 (attenzione ai carichi lombari), FTP attuale ${ftp}W.
Obiettivo: gran fondo montagna il 15 luglio 2026. Oggi: ${today}.

Il tuo ruolo è:
1. Analizzare i dati reali da Intervals.icu vs il piano previsto
2. Identificare allenamenti saltati, ridotti, o fatti diversamente
3. Adattare il piano dei prossimi giorni in modo intelligente
4. Rispondere ai messaggi di Davide con consigli pratici

STATO FITNESS ATTUALE:
${fitnessText}

ATTIVITÀ RECENTI (reali da Intervals.icu):
${activitiesText}

PIANO PREVISTO (prossimi giorni):
${planContext}

OVERRIDE ATTIVI:
${Object.keys(overrides.days).length === 0 ? 'Nessuno' : JSON.stringify(overrides.days, null, 2)}

REGOLA FONDAMENTALE: Se Davide ti chiede di cambiare, ridurre, saltare o modificare un allenamento, DEVI SEMPRE includere il blocco <plan_update> con le modifiche corrispondenti. Non limitarti a rispondere a parole — aggiorna effettivamente il piano.

Quando modifichi il piano, includi ALLA FINE della risposta:
<plan_update>
{
  "coachNote": "Nota breve visibile nella home (es: 'Oggi solo Z2 su richiesta')",
  "days": {
    "${today}": { "type": "ENDURANCE", "summaryOverride": "Z2 leggero — modifica coach", "reason": "Richiesta dell'atleta" }
  }
}
</plan_update>

Tipi disponibili: REST, RECOVERY, ENDURANCE, TEMPO, SWEET_SPOT, THRESHOLD, VO2MAX
Per saltare: usa "skip": true
Per alleggerire: usa "type": "ENDURANCE" o "RECOVERY" con "summaryOverride"

Rispondi sempre in italiano, in modo diretto. Max 3-4 frasi.`

  const messages: Anthropic.MessageParam[] = userMessage
    ? [{ role: 'user', content: userMessage }]
    : [{ role: 'user', content: 'Analizza il piano della settimana e suggerisci eventuali aggiustamenti in base alle attività recenti e allo stato di forma attuale.' }]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract plan_update if present
  const match = text.match(/<plan_update>([\s\S]*?)<\/plan_update>/)
  let updated = false
  let writeError: string | undefined

  if (match) {
    try {
      const update = JSON.parse(match[1].trim())
      const newOverrides: PlanOverrides = {
        lastUpdated: today,
        coachNote: update.coachNote ?? overrides.coachNote,
        days: { ...overrides.days, ...update.days },
      }
      if (!sha) throw new Error('SHA mancante — GITHUB_TOKEN non configurato o file non leggibile')
      await writeJsonFile('data/overrides.json', newOverrides, sha, `Coach update ${today}`)
      updated = true
    } catch (e: any) {
      console.error('Failed to write plan_update:', e)
      writeError = e.message
    }
  }

  const reply = text.replace(/<plan_update>[\s\S]*?<\/plan_update>/, '').trim()
  return { reply, updated, writeError: writeError ?? null, hadPlanUpdate: !!match }
}
