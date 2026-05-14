'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/',           label: 'Oggi',       icon: '🏠' },
  { href: '/plan',       label: 'Piano',      icon: '📅' },
  { href: '/nutrition',  label: 'Nutrizione', icon: '🥗' },
  { href: '/stats',      label: 'Forma',      icon: '📊' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 520,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(item => {
        const active = item.href === '/' ? path === '/' : path.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 0 8px',
            textDecoration: 'none',
            color: active ? 'var(--orange)' : 'var(--text-3)',
            transition: 'color 0.15s',
          }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 2 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
