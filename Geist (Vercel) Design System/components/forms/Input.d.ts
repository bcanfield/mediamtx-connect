import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered above the field. */
  label?: string;
  /** Muted helper text below the field. */
  hint?: string;
  /** Error message — turns border and text red, overrides hint. */
  error?: string;
}

/** Default Geist form field — white, 1px hairline, 6px radius, ink-on-focus. */
export function Input(props: InputProps): JSX.Element;
