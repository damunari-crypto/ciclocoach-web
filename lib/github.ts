const OWNER = 'damunari-crypto'
const REPO  = 'ciclocoach-web'
const BRANCH = 'main'

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

export async function readJsonFile(path: string): Promise<any> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN non impostato in Vercel')
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub read ${res.status}: ${body.slice(0, 120)}`)
  }
  const data = await res.json()
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return { json: JSON.parse(content), sha: data.sha }
}

export async function writeJsonFile(path: string, content: any, sha: string, message: string): Promise<void> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`
  const body = JSON.stringify({
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    sha,
    branch: BRANCH,
  })
  const res = await fetch(url, { method: 'PUT', headers: githubHeaders(), body })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub write error: ${res.status} — ${err}`)
  }
}
