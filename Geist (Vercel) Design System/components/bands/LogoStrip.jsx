import React from 'react';

/** LogoStrip — greyscale customer wordmark band. */
export function LogoStrip({ label = 'Trusted by the best frontend teams', logos = [], style = {} }) {
  return (
    <section style={{ background: 'var(--color-canvas)', ...style }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: 'var(--space-xl) var(--space-lg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)',
      }}>
        {label && (
          <span style={{
            font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
            color: 'var(--color-mute)',
          }}>{label}</span>
        )}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--space-3xl)', width: '100%',
        }}>
          {logos.map((name, i) => (
            <span key={i} style={{
              font: `var(--weight-semibold) 22px/1 var(--font-sans)`,
              letterSpacing: '-0.03em', color: 'var(--color-faint)',
            }}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
