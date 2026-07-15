import React from 'react';

export interface HeroProps {
  /** Uppercase Geist Mono eyebrow above the headline. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** CTA buttons, typically a black pill + white pill. */
  actions?: React.ReactNode;
  /** Render the signature mesh gradient behind the headline. Default true. */
  mesh?: boolean;
  style?: React.CSSProperties;
}

/**
 * The full-width hero band — the only place the mesh gradient is allowed.
 *
 * @startingPoint section="Bands" subtitle="Hero with mesh gradient" viewport="1200x520"
 */
export function Hero(props: HeroProps): JSX.Element;
