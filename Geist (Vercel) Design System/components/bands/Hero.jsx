import React from 'react';

/**
 * Hero — full-width hero band. The one place color lives: a soft multi-stop
 * mesh gradient blooms behind the tightly-tracked display headline.
 */
export function Hero({ eyebrow, title, subtitle, actions, mesh = true, style = {} }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-canvas)', ...style }}>
      {mesh && (
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'var(--gradient-mesh)',
          filter: 'blur(40px) saturate(1.1)',
          opacity: 0.9,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        position: 'relative',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'var(--space-section) var(--space-lg)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-lg)',
      }}>
        {eyebrow && (
          <span style={{
            font: `var(--weight-medium) var(--mono-eyebrow-size)/var(--mono-eyebrow-lh) var(--font-mono)`,
            textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-mute)',
          }}>{eyebrow}</span>
        )}
        <h1 style={{
          margin: 0,
          font: `var(--display-xl-weight) var(--display-xl-size)/var(--display-xl-lh) var(--font-sans)`,
          letterSpacing: 'var(--display-xl-ls)',
          color: 'var(--color-ink)',
          maxWidth: '18ch',
          textWrap: 'balance',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            margin: 0, maxWidth: '46ch',
            font: `var(--weight-regular) var(--body-lg-size)/var(--body-lg-lh) var(--font-sans)`,
            color: 'var(--color-body)',
          }}>{subtitle}</p>
        )}
        {actions && <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </section>
  );
}
