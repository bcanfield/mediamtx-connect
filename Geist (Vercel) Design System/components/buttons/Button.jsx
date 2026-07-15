import React from 'react';

/**
 * Button — Geist's context-driven button. Marketing surfaces use fully-rounded
 * pills; nav/app chrome uses tight 6px squares. Shape is a deliberate signal of
 * which surface you're on.
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  shape,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  // shape defaults: lg marketing -> pill, md app/nav -> sm square
  const resolvedShape = shape || (size === 'lg' ? 'pill' : 'square');
  const radius = resolvedShape === 'pill'
    ? 'var(--radius-pill)'
    : resolvedShape === 'category'
      ? 'var(--radius-pill-category)'
      : 'var(--radius-sm)';

  const height = size === 'lg' ? 40 : 32;
  const font = size === 'lg' ? 'var(--button-lg-size)' : 'var(--button-md-size)';
  const pad = size === 'lg' ? '0 14px' : (resolvedShape === 'category' ? '0 16px' : '0 12px');

  const palettes = {
    primary: { bg: 'var(--color-primary)', fg: 'var(--color-on-primary)', border: 'transparent' },
    secondary: { bg: 'var(--color-canvas-elevated)', fg: 'var(--color-ink)', border: 'var(--color-ink)' },
    ghost: { bg: 'var(--color-canvas-elevated)', fg: 'var(--color-ink)', border: 'var(--color-hairline)' },
    danger: { bg: 'var(--color-error)', fg: 'var(--color-on-primary)', border: 'transparent' },
  };
  const p = palettes[variant] || palettes.primary;

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: `${height}px`,
        padding: pad,
        font: `var(--weight-medium) ${font}/1 var(--font-sans)`,
        letterSpacing: '0',
        color: p.fg,
        background: p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        whiteSpace: 'nowrap',
        transition: 'opacity .15s ease, background .15s ease, transform .06s ease',
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
