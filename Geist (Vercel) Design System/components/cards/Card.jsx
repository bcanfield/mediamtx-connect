import React from 'react';

/**
 * Card — the workhorse hairline content tile. Flat by default (1px hairline);
 * `elevation` lifts it with the layered low-alpha shadow stack.
 */
export function Card({
  elevation = 0,
  radius = 'md',
  padding = 'var(--space-lg)',
  eyebrow,
  title,
  children,
  style = {},
  ...rest
}) {
  const shadow = elevation === 2 ? 'var(--shadow-2)' : elevation === 1 ? 'var(--shadow-1)' : 'var(--shadow-0)';
  const radiusVar = radius === 'lg' ? 'var(--radius-lg)' : radius === 'sm' ? 'var(--radius-sm)' : 'var(--radius-md)';
  return (
    <div
      style={{
        background: 'var(--color-canvas-elevated)',
        border: '1px solid var(--color-hairline)',
        borderRadius: radiusVar,
        boxShadow: shadow,
        padding,
        color: 'var(--color-ink)',
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <div style={{
          font: `var(--weight-medium) var(--mono-eyebrow-size)/var(--mono-eyebrow-lh) var(--font-mono)`,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: 'var(--color-mute)',
          marginBottom: 'var(--space-sm)',
        }}>{eyebrow}</div>
      )}
      {title && (
        <div style={{
          font: `var(--weight-semibold) var(--heading-md-size)/var(--heading-md-lh) var(--font-sans)`,
          letterSpacing: 'var(--heading-md-ls)',
          color: 'var(--color-ink)',
          marginBottom: children ? 'var(--space-xs)' : 0,
        }}>{title}</div>
      )}
      {children && (
        <div style={{
          font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
          color: 'var(--color-body)',
        }}>{children}</div>
      )}
    </div>
  );
}
