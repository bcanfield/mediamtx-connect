import React from 'react';

/** NavBar — top navigation. Wordmark left, ghost links center, actions right. */
export function NavBar({ brand = 'Vercel', links = [], actions, style = {} }) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-sm) var(--space-lg)',
        background: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)',
        font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
        ...style,
      }}
    >
      <span style={{
        font: `var(--weight-semibold) 20px/1 var(--font-sans)`,
        letterSpacing: '-0.04em',
        color: 'var(--color-ink)',
      }}>{brand}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
        {links.map((l, i) => (
          <a key={i} href={l.href || '#'} style={{
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-body)',
            textDecoration: 'none',
            transition: 'color .15s ease, background .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; e.currentTarget.style.background = 'var(--color-hairline-soft)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-body)'; e.currentTarget.style.background = 'transparent'; }}
          >{l.label}</a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>{actions}</div>
    </nav>
  );
}
