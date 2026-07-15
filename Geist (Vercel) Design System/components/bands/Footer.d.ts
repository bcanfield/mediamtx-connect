import React from 'react';

export interface FooterColumn { title: string; links: { label: string; href?: string }[]; }

export interface FooterProps {
  brand?: string;
  columns?: FooterColumn[];
  /** Small muted note under the wordmark, e.g. a copyright line. */
  note?: string;
  style?: React.CSSProperties;
}

/** Site footer — wordmark + multi-column link groups on a top-hairline canvas. */
export function Footer(props: FooterProps): JSX.Element;
