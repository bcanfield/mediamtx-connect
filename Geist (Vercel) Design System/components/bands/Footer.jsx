import React from 'react';

/** Footer — multi-column link groups under the wordmark. */
export function Footer({ brand = 'Vercel', columns = [], note, style = {} }) {
  return (
    <footer style={{
      background: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline)',
      ...style,
    }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: 'var(--space-3xl) var(--space-lg)',
        display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 3fr', gap: 'var(--space-3xl)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <span style={{
            font: `var(--weight-semibold) 20px/1 var(--font-sans)`,
            letterSpacing: '-0.04em', color: 'var(--color-ink)',
          }}>{brand}</span>
          {note && (
            <span style={{
              font: `var(--weight-regular) var(--body-sm-size)/var(--body-sm-lh) var(--font-sans)`,
              color: 'var(--color-mute)',
            }}>{note}</span>
          )}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, 1fr)`,
          gap: 'var(--space-lg)',
        }}>
          {columns.map((col, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <span style={{
                font: `var(--weight-medium) var(--label-sm-size)/var(--label-sm-lh) var(--font-sans)`,
                letterSpacing: 'var(--label-sm-ls)', color: 'var(--color-ink)',
              }}>{col.title}</span>
              {col.links.map((l, j) => (
                <a key={j} href={l.href || '#'} style={{
                  font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
                  color: 'var(--color-body)', textDecoration: 'none',
                  transition: 'color .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-body)'; }}
                >{l.label}</a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
