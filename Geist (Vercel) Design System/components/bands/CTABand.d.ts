import React from 'react';

export interface CTABandProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

/** End-of-page CTA band — centered display headline + marketing pill, no mesh. */
export function CTABand(props: CTABandProps): JSX.Element;
