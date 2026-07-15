import React from 'react';

export interface NavLink { label: string; href?: string; }

export interface NavBarProps {
  /** Wordmark text (no logo asset ships with this system — see readme). */
  brand?: string;
  links?: NavLink[];
  /** Right-aligned actions, typically Sign Up / Log In buttons. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * The top navigation band — canvas background, bottom hairline, ghost links.
 *
 * @startingPoint section="Navigation" subtitle="Top nav bar" viewport="1000x64"
 */
export function NavBar(props: NavBarProps): JSX.Element;
