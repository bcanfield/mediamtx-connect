import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Square hit area in px. Default 40. */
  size?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

/** Circular icon / carousel control — white fill, 1px hairline, ink glyph. */
export function IconButton(props: IconButtonProps): JSX.Element;
