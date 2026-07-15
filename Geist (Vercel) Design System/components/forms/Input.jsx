import React from 'react';

/** Input — default form field. White, 1px hairline, ink text, 6px radius. */
export function Input({ label, hint, error, style = {}, id, ...rest }) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{
          font: `var(--weight-medium) var(--label-sm-size)/var(--label-sm-lh) var(--font-sans)`,
          letterSpacing: 'var(--label-sm-ls)',
          color: 'var(--color-ink)',
        }}>{label}</label>
      )}
      <input
        id={inputId}
        style={{
          height: '40px',
          padding: '0 12px',
          font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
          color: 'var(--color-ink)',
          background: 'var(--color-canvas-elevated)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-hairline)'}`,
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          transition: 'border-color .15s ease, box-shadow .15s ease',
          ...style,
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-ink)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-hairline)';
        }}
        {...rest}
      />
      {(hint || error) && (
        <span style={{
          font: `var(--weight-regular) var(--body-sm-size)/var(--body-sm-lh) var(--font-sans)`,
          color: error ? 'var(--color-error)' : 'var(--color-mute)',
        }}>{error || hint}</span>
      )}
    </div>
  );
}
