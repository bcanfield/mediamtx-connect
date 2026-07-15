import React from 'react';

export interface CodeBlockProps {
  /** Code contents as a plain string (preserves whitespace). */
  code?: string;
  /** Optional top-bar label, e.g. a filename or command. */
  label?: string;
  /** Show macOS traffic-light chrome in the top bar. */
  showChrome?: boolean;
  style?: React.CSSProperties;
}

/** Code / terminal surface — white, 1px hairline, Geist Mono, 12px radius. */
export function CodeBlock(props: CodeBlockProps): JSX.Element;
