import React from 'react';

/** CTABand — end-of-page call-to-action. Display headline + marketing pill, no mesh. */
export function CTABand({ title, subtitle, actions, style = {} }) {
  return (
    <section style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)', ...style }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: 'var(--space-4xl) var(--space-lg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-lg)',
      }}>
        <h2 style={{
          margin: 0,
          font: `var(--display-xl-weight) var(--display-xl-size)/var(--display-xl-lh) var(--font-sans)`,
          letterSpacing: 'var(--display-xl-ls)', color: 'var(--color-ink)', textWrap: 'balance',
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            margin: 0, maxWidth: '44ch',
            font: `var(--weight-regular) var(--body-lg-size)/var(--body-lg-lh) var(--font-sans)`,
            color: 'var(--color-body)',
          }}>{subtitle}</p>
        )}
        {actions && <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>{actions}</div>}
      </div>
    </section>
  );
}
