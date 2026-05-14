import { NextResponse } from 'next/server'
import { runPlanAgent } from '@/lib/planAgent'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { reply, updated } = await runPlanAgent()
    return NextResponse.json({ ok: true, reply, updated })
  } catch (e: any) {
    console.error('Cron error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
