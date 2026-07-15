import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = black pill/square, secondary = inverted, ghost = hairline outline, danger = red */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** lg = marketing (40px, pill default), md = nav/app (32px, square default) */
  size?: 'lg' | 'md';
  /** Override the auto shape. pill = marketing CTA, square = 6px chrome, category = 64px tab */
  shape?: 'pill' | 'square' | 'category';
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * The Geist button. Marketing CTAs are fully-rounded black pills; nav/app
 * controls are tight 6px squares — the shape signals which surface you're on.
 *
 * @startingPoint section="Buttons" subtitle="Pill + square button set" viewport="700x120"
 */
export function Button(props: ButtonProps): JSX.Element;
