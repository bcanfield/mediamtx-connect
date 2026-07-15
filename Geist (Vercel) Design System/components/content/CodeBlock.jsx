import React from 'react';

const PALETTE = {
  kw: '#7928ca',      // keyword — violet
  fn: '#0070f3',      // function — blue
  str: '#eb367f',     // string — magenta
  com: '#8f8f8f',     // comment — mute
  ink: '#171717',
};

/**
 * CodeBlock — code / terminal surface. White, 1px hairline, Geist Mono,
 * ink-and-accent syntax. Pass either `code` (string) or pre-tokenized children.
 */
export function CodeBlock({ code = '', label, showChrome = false, style = {} }) {
  return (
    <div style={{
      background: 'var(--color-canvas-elevated)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      ...style,
    }}>
      {(label || showChrome) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          padding: 'var(--space-xs) var(--space-md)',
          borderBottom: '1px solid var(--color-hairline)',
          font: `var(--weight-regular) var(--body-sm-size)/1 var(--font-mono)`,
          color: 'var(--color-mute)',
        }}>
          {showChrome && (
            <span style={{ display: 'flex', gap: '6px', marginRight: 'var(--space-xs)' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: 9999, background: c }} />
              ))}
            </span>
          )}
          {label}
        </div>
      )}
      <pre style={{
        margin: 0,
        padding: 'var(--space-md)',
        font: `var(--weight-regular) var(--code-size)/var(--code-lh) var(--font-mono)`,
        color: 'var(--color-ink)',
        whiteSpace: 'pre',
        overflowX: 'auto',
      }}>{code}</pre>
    </div>
  );
}

CodeBlock.PALETTE = PALETTE;
