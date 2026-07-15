import React from 'react';

export interface LogoStripProps {
  /** Muted caption above the logos. */
  label?: string;
  /** Customer names, rendered as greyscale wordmarks (no logo assets ship). */
  logos?: string[];
  style?: React.CSSProperties;
}

/** Greyscale customer-logo band — muted wordmarks in a centered row. */
export function LogoStrip(props: LogoStripProps): JSX.Element;
