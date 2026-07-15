import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0 = flat hairline (default), 1 = whisper shadow, 2 = floating menu/modal */
  elevation?: 0 | 1 | 2;
  /** md = feature card (12px), lg = pricing card (16px), sm = 6px */
  radius?: 'sm' | 'md' | 'lg';
  padding?: string;
  /** Optional uppercase Geist Mono eyebrow. */
  eyebrow?: string;
  /** Optional heading (heading-md). */
  title?: string;
  children?: React.ReactNode;
}

/**
 * The workhorse hairline content tile — flat 1px border by default, optional
 * whisper/floating shadow.
 *
 * @startingPoint section="Cards" subtitle="Hairline feature card" viewport="700x220"
 */
export function Card(props: CardProps): JSX.Element;
