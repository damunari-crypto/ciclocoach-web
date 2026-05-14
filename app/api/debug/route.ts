import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN non presente' })

  const url = 'https://api.github.com/repos/damunari-crypto/ciclocoach-web/contents/data/overrides.json?ref=main'
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  })

  const body = await res.text()
  return NextResponse.json({
    status: res.status,
    tokenPrefix: token.slice(0, 8) + '...',
    body: body.slice(0, 300),
  })
}
