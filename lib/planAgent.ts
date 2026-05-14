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

// Tool definition for structured plan updates
const UPDATE_PLAN_TOOL: Anthropic.Tool = {
  name: 'update_plan',
  description: 'Modifica il piano di allenamento per uno o più giorni. Chiamare questo tool ogni volta che Davide chiede di cambiare, ridurre, saltare o modificare un allenamento.',
  input_schema: {
    type: 'object' as const,
    properties: {
      coachNote: {
        type: 'string',
        description: 'Nota breve visibile nella home app (es: "Oggi solo Z2 su tua richiesta")',
      },
      days: {
        type: 'object',
        description: 'Chiavi = date ISO (YYYY-MM-DD), valori = modifiche al giorno',
        additionalProperties: {
          type: 'object',
          properties: {
            skip:            { type: 'boolean', description: 'true = salta completamente (diventa REST)' },
            type:            { type: 'string', enum: ['REST','RECOVERY','ENDURANCE','TEMPO','SWEET_SPOT','THRESHOLD','VO2MAX'] },
            durationMinutes: { type: 'number', description: 'Durata in minuti' },
            summaryOverride: { type: 'string', description: 'Descrizione breve del workout modificato' },
            reason:          { type: 'string', description: 'Motivazione della modifica' },
          },
        },
      },
    },
    required: ['coachNote', 'days'],
  },
}

export async function runPlanAgent(userMessage?: string): Promise<{
  reply: string; updated: boolean; writeError: string | null; hadPlanUpdate: boolean
}> {
  const [fitness, activities, overridesData] = await Promise.all([
    fetchFitnessData(4).catch(() => null),
    fetchRecentActivities(14).catch(() => []),
    readJsonFile('data/overrides.json').catch(() => ({ json: { lastUpdated: '', coachNote: null, days: {} }, sha: '' })),
  ])

  const overrides: PlanOverrides = overridesData.json
  const sha: string = overridesData.sha
  const ftp = fitness?.current.eftp ?? 252
  const today = new Date().toISOString().split('T')[0]

  const planContext = buildPlanContext(ftp, overrides)

  const activitiesText = activities.length === 0
    ? 'Nessuna attività recente trovata.'
    : activities.map(a =>
        `${a.date}: ${a.name} (${a.type}) — ${Math.round(a.durationSeconds/60)}min, TSS=${a.tss ?? '?'}, NP=${a.normalizedPower ?? '?'}W`
      ).join('\n')

  const fitnessText = fitness
    ? `CTL=${fitness.current.ctl.toFixed(1)}, ATL=${fitness.current.atl.toFixed(1)}, TSB=${fitness.current.tsb.toFixed(1)}, eFTP=${ftp}W`
    : 'Dati fitness non disponibili.'

  const systemPrompt = `Sei il coach personale di ciclismo di Davide Munari.
Davide, 51 anni, 85kg, ernia discale L5-S1, FTP ${ftp}W. Obiettivo: gran fondo montagna 15 luglio 2026. Oggi: ${today}.

STATO FITNESS: ${fitnessText}

ATTIVITÀ RECENTI:
${activitiesText}

PIANO PROSSIMI GIORNI:
${planContext}

OVERRIDE ATTIVI: ${Object.keys(overrides.days).length === 0 ? 'Nessuno' : JSON.stringify(overrides.days)}

Quando Davide chiede di modificare, ridurre, saltare o cambiare un allenamento, usa SEMPRE il tool update_plan.
Rispondi in italiano, max 3-4 frasi, tono diretto e pratico.`

  const messages: Anthropic.MessageParam[] = [{
    role: 'user',
    content: userMessage ?? 'Analizza il piano della settimana e suggerisci aggiustamenti in base alle attività recenti e allo stato di forma.',
  }]

  // First call: allow tool use
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    tools: [UPDATE_PLAN_TOOL],
    messages,
  })

  // Extract text and tool use blocks
  let reply = ''
  let toolInput: any = null

  for (const block of response.content) {
    if (block.type === 'text') reply += block.text
    if (block.type === 'tool_use' && block.name === 'update_plan') toolInput = block.input
  }

  // If tool was called, get the follow-up text response
  if (toolInput && response.stop_reason === 'tool_use') {
    const followUp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      tools: [UPDATE_PLAN_TOOL],
      messages: [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: (response.content.find(b => b.type === 'tool_use') as any).id, content: 'Piano aggiornato con successo.' }] },
      ],
    })
    reply = followUp.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
  }

  // Write to GitHub if tool was called
  let updated = false
  let writeError: string | null = null

  if (toolInput) {
    try {
      if (!sha) throw new Error('GITHUB_TOKEN non configurato o file non leggibile')
      const newOverrides: PlanOverrides = {
        lastUpdated: today,
        coachNote: toolInput.coachNote ?? overrides.coachNote,
        days: { ...overrides.days, ...toolInput.days },
      }
      await writeJsonFile('data/overrides.json', newOverrides, sha, `Coach update ${today}`)
      updated = true
    } catch (e: any) {
      console.error('Failed to write plan update:', e)
      writeError = e.message
    }
  }

  return { reply: reply.trim(), updated, writeError, hadPlanUpdate: !!toolInput }
}
