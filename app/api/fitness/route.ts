import { NextResponse } from 'next/server'
import { fetchFitnessData } from '@/lib/intervals'

export async function GET() {
  try {
    const data = await fetchFitnessData(4)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
