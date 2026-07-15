import React from 'react';

/**
 * IconButton — circular icon / carousel control. White fill, 1px hairline, ink glyph.
 */
export function IconButton({ size = 40, disabled = false, children, style = {}, ...rest }) {
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        padding: 0,
        color: 'var(--color-ink)',
        background: 'var(--color-canvas-elevated)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-full)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background .15s ease, border-color .15s ease',
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = 'var(--color-ink)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-hairline)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
