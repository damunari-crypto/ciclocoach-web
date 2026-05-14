import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { runPlanAgent } from '@/lib/planAgent'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Messaggio vuoto' }, { status: 400 })
    }
    const { reply, updated, writeError, hadPlanUpdate } = await runPlanAgent(message)
    if (updated) {
      revalidatePath('/')
      revalidatePath('/workout/[date]', 'page')
      revalidatePath('/plan')
    }
    return NextResponse.json({ reply, updated, writeError, hadPlanUpdate })
  } catch (e: any) {
    console.error('Chat error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
