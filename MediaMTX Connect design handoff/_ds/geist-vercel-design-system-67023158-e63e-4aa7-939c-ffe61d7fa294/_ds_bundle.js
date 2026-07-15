/* @ds-bundle: {"format":4,"namespace":"GeistVercelDesignSystem_670231","components":[{"name":"CTABand","sourcePath":"components/bands/CTABand.jsx"},{"name":"Footer","sourcePath":"components/bands/Footer.jsx"},{"name":"Hero","sourcePath":"components/bands/Hero.jsx"},{"name":"LogoStrip","sourcePath":"components/bands/LogoStrip.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"CodeBlock","sourcePath":"components/content/CodeBlock.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"}],"sourceHashes":{"components/bands/CTABand.jsx":"27b6b8470945","components/bands/Footer.jsx":"206f1236bb01","components/bands/Hero.jsx":"6e9c9fd8d863","components/bands/LogoStrip.jsx":"7297bb35c673","components/buttons/Button.jsx":"762f9203aedd","components/buttons/IconButton.jsx":"d46833be066a","components/cards/Card.jsx":"a61e82c9f585","components/content/CodeBlock.jsx":"66ac4087b9fa","components/forms/Input.jsx":"1b61b3053340","components/navigation/NavBar.jsx":"e54f15c8e1e7","ui_kits/marketing/MarketingPage.jsx":"db01c8a5ac00"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GeistVercelDesignSystem_670231 = window.GeistVercelDesignSystem_670231 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/bands/CTABand.jsx
try { (() => {
/** CTABand — end-of-page call-to-action. Display headline + marketing pill, no mesh. */
function CTABand({
  title,
  subtitle,
  actions,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-4xl) var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-lg)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: `var(--display-xl-weight) var(--display-xl-size)/var(--display-xl-lh) var(--font-sans)`,
      letterSpacing: 'var(--display-xl-ls)',
      color: 'var(--color-ink)',
      textWrap: 'balance'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '44ch',
      font: `var(--weight-regular) var(--body-lg-size)/var(--body-lg-lh) var(--font-sans)`,
      color: 'var(--color-body)'
    }
  }, subtitle), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-sm)',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, actions)));
}
Object.assign(__ds_scope, { CTABand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/CTABand.jsx", error: String((e && e.message) || e) }); }

// components/bands/Footer.jsx
try { (() => {
/** Footer — multi-column link groups under the wordmark. */
function Footer({
  brand = 'Vercel',
  columns = [],
  note,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-3xl) var(--space-lg)',
      display: 'grid',
      gridTemplateColumns: 'minmax(160px, 1fr) 3fr',
      gap: 'var(--space-3xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-md)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-semibold) 20px/1 var(--font-sans)`,
      letterSpacing: '-0.04em',
      color: 'var(--color-ink)'
    }
  }, brand), note && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-regular) var(--body-sm-size)/var(--body-sm-lh) var(--font-sans)`,
      color: 'var(--color-mute)'
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, 1fr)`,
      gap: 'var(--space-lg)'
    }
  }, columns.map((col, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-medium) var(--label-sm-size)/var(--label-sm-lh) var(--font-sans)`,
      letterSpacing: 'var(--label-sm-ls)',
      color: 'var(--color-ink)'
    }
  }, col.title), col.links.map((l, j) => /*#__PURE__*/React.createElement("a", {
    key: j,
    href: l.href || '#',
    style: {
      font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
      color: 'var(--color-body)',
      textDecoration: 'none',
      transition: 'color .15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = 'var(--color-ink)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = 'var(--color-body)';
    }
  }, l.label)))))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/Footer.jsx", error: String((e && e.message) || e) }); }

// components/bands/Hero.jsx
try { (() => {
/**
 * Hero — full-width hero band. The one place color lives: a soft multi-stop
 * mesh gradient blooms behind the tightly-tracked display headline.
 */
function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  mesh = true,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--color-canvas)',
      ...style
    }
  }, mesh && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-mesh)',
      filter: 'blur(40px) saturate(1.1)',
      opacity: 0.9,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-section) var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 'var(--space-lg)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-medium) var(--mono-eyebrow-size)/var(--mono-eyebrow-lh) var(--font-mono)`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: 'var(--color-mute)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: `var(--display-xl-weight) var(--display-xl-size)/var(--display-xl-lh) var(--font-sans)`,
      letterSpacing: 'var(--display-xl-ls)',
      color: 'var(--color-ink)',
      maxWidth: '18ch',
      textWrap: 'balance'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '46ch',
      font: `var(--weight-regular) var(--body-lg-size)/var(--body-lg-lh) var(--font-sans)`,
      color: 'var(--color-body)'
    }
  }, subtitle), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-sm)',
      flexWrap: 'wrap'
    }
  }, actions)));
}
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/Hero.jsx", error: String((e && e.message) || e) }); }

// components/bands/LogoStrip.jsx
try { (() => {
/** LogoStrip — greyscale customer wordmark band. */
function LogoStrip({
  label = 'Trusted by the best frontend teams',
  logos = [],
  style = {}
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-canvas)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-xl) var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-lg)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
      color: 'var(--color-mute)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3xl)',
      width: '100%'
    }
  }, logos.map((name, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      font: `var(--weight-semibold) 22px/1 var(--font-sans)`,
      letterSpacing: '-0.03em',
      color: 'var(--color-faint)'
    }
  }, name)))));
}
Object.assign(__ds_scope, { LogoStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/LogoStrip.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — Geist's context-driven button. Marketing surfaces use fully-rounded
 * pills; nav/app chrome uses tight 6px squares. Shape is a deliberate signal of
 * which surface you're on.
 */
function Button({
  variant = 'primary',
  size = 'lg',
  shape,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  // shape defaults: lg marketing -> pill, md app/nav -> sm square
  const resolvedShape = shape || (size === 'lg' ? 'pill' : 'square');
  const radius = resolvedShape === 'pill' ? 'var(--radius-pill)' : resolvedShape === 'category' ? 'var(--radius-pill-category)' : 'var(--radius-sm)';
  const height = size === 'lg' ? 40 : 32;
  const font = size === 'lg' ? 'var(--button-lg-size)' : 'var(--button-md-size)';
  const pad = size === 'lg' ? '0 14px' : resolvedShape === 'category' ? '0 16px' : '0 12px';
  const palettes = {
    primary: {
      bg: 'var(--color-primary)',
      fg: 'var(--color-on-primary)',
      border: 'transparent'
    },
    secondary: {
      bg: 'var(--color-canvas-elevated)',
      fg: 'var(--color-ink)',
      border: 'var(--color-ink)'
    },
    ghost: {
      bg: 'var(--color-canvas-elevated)',
      fg: 'var(--color-ink)',
      border: 'var(--color-hairline)'
    },
    danger: {
      bg: 'var(--color-error)',
      fg: 'var(--color-on-primary)',
      border: 'transparent'
    }
  };
  const p = palettes[variant] || palettes.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: `${height}px`,
      padding: pad,
      font: `var(--weight-medium) ${font}/1 var(--font-sans)`,
      letterSpacing: '0',
      color: p.fg,
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: radius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      whiteSpace: 'nowrap',
      transition: 'opacity .15s ease, background .15s ease, transform .06s ease',
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — circular icon / carousel control. White fill, 1px hairline, ink glyph.
 */
function IconButton({
  size = 40,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`,
      padding: 0,
      color: 'var(--color-ink)',
      background: 'var(--color-canvas-elevated)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--radius-full)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'background .15s ease, border-color .15s ease',
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.borderColor = 'var(--color-ink)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = 'var(--color-hairline)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/cards/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the workhorse hairline content tile. Flat by default (1px hairline);
 * `elevation` lifts it with the layered low-alpha shadow stack.
 */
function Card({
  elevation = 0,
  radius = 'md',
  padding = 'var(--space-lg)',
  eyebrow,
  title,
  children,
  style = {},
  ...rest
}) {
  const shadow = elevation === 2 ? 'var(--shadow-2)' : elevation === 1 ? 'var(--shadow-1)' : 'var(--shadow-0)';
  const radiusVar = radius === 'lg' ? 'var(--radius-lg)' : radius === 'sm' ? 'var(--radius-sm)' : 'var(--radius-md)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--color-canvas-elevated)',
      border: '1px solid var(--color-hairline)',
      borderRadius: radiusVar,
      boxShadow: shadow,
      padding,
      color: 'var(--color-ink)',
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--weight-medium) var(--mono-eyebrow-size)/var(--mono-eyebrow-lh) var(--font-mono)`,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      color: 'var(--color-mute)',
      marginBottom: 'var(--space-sm)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--weight-semibold) var(--heading-md-size)/var(--heading-md-lh) var(--font-sans)`,
      letterSpacing: 'var(--heading-md-ls)',
      color: 'var(--color-ink)',
      marginBottom: children ? 'var(--space-xs)' : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
      color: 'var(--color-body)'
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/content/CodeBlock.jsx
try { (() => {
const PALETTE = {
  kw: '#7928ca',
  // keyword — violet
  fn: '#0070f3',
  // function — blue
  str: '#eb367f',
  // string — magenta
  com: '#8f8f8f',
  // comment — mute
  ink: '#171717'
};

/**
 * CodeBlock — code / terminal surface. White, 1px hairline, Geist Mono,
 * ink-and-accent syntax. Pass either `code` (string) or pre-tokenized children.
 */
function CodeBlock({
  code = '',
  label,
  showChrome = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-canvas-elevated)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      ...style
    }
  }, (label || showChrome) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)',
      padding: 'var(--space-xs) var(--space-md)',
      borderBottom: '1px solid var(--color-hairline)',
      font: `var(--weight-regular) var(--body-sm-size)/1 var(--font-mono)`,
      color: 'var(--color-mute)'
    }
  }, showChrome && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: '6px',
      marginRight: 'var(--space-xs)'
    }
  }, ['#ff5f57', '#febc2e', '#28c840'].map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: c
    }
  }))), label), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: 'var(--space-md)',
      font: `var(--weight-regular) var(--code-size)/var(--code-lh) var(--font-mono)`,
      color: 'var(--color-ink)',
      whiteSpace: 'pre',
      overflowX: 'auto'
    }
  }, code));
}
CodeBlock.PALETTE = PALETTE;
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Input — default form field. White, 1px hairline, ink text, 6px radius. */
function Input({
  label,
  hint,
  error,
  style = {},
  id,
  ...rest
}) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      font: `var(--weight-medium) var(--label-sm-size)/var(--label-sm-lh) var(--font-sans)`,
      letterSpacing: 'var(--label-sm-ls)',
      color: 'var(--color-ink)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    style: {
      height: '40px',
      padding: '0 12px',
      font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
      color: 'var(--color-ink)',
      background: 'var(--color-canvas-elevated)',
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-hairline)'}`,
      borderRadius: 'var(--radius-sm)',
      outline: 'none',
      transition: 'border-color .15s ease, box-shadow .15s ease',
      ...style
    },
    onFocus: e => {
      if (!error) {
        e.currentTarget.style.borderColor = 'var(--color-ink)';
      }
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-hairline)';
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-regular) var(--body-sm-size)/var(--body-sm-lh) var(--font-sans)`,
      color: error ? 'var(--color-error)' : 'var(--color-mute)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
/** NavBar — top navigation. Wordmark left, ghost links center, actions right. */
function NavBar({
  brand = 'Vercel',
  links = [],
  actions,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-lg)',
      padding: 'var(--space-sm) var(--space-lg)',
      background: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline)',
      font: `var(--weight-regular) var(--body-md-size)/var(--body-md-lh) var(--font-sans)`,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--weight-semibold) 20px/1 var(--font-sans)`,
      letterSpacing: '-0.04em',
      color: 'var(--color-ink)'
    }
  }, brand), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      flex: 1
    }
  }, links.map((l, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: l.href || '#',
    style: {
      padding: 'var(--space-xs) var(--space-sm)',
      borderRadius: 'var(--radius-full)',
      color: 'var(--color-body)',
      textDecoration: 'none',
      transition: 'color .15s ease, background .15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = 'var(--color-ink)';
      e.currentTarget.style.background = 'var(--color-hairline-soft)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = 'var(--color-body)';
      e.currentTarget.style.background = 'transparent';
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)'
    }
  }, actions));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/MarketingPage.jsx
try { (() => {
const {
  Hero,
  LogoStrip,
  CTABand,
  Footer,
  NavBar,
  Card,
  CodeBlock,
  Button,
  Input
} = window.GeistVercelDesignSystem_670231;
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 12px/16px var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: 'var(--color-mute)',
      marginBottom: '12px'
    }
  }, children);
}
function SectionHead({
  eyebrow,
  title,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '640px',
      marginBottom: 'var(--space-2xl)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, null, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '600 32px/40px var(--font-sans)',
      letterSpacing: '-1.28px',
      color: 'var(--color-ink)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 0 0',
      font: '400 16px/24px var(--font-sans)',
      color: 'var(--color-body)'
    }
  }, sub));
}

// ---- Feature grid ----
function Features() {
  const items = [{
    e: 'Edge',
    t: 'Fluid compute',
    d: 'Pay only for what you use, down to the millisecond. Scale to zero automatically.'
  }, {
    e: 'Previews',
    t: 'Every push, a URL',
    d: 'Deploy previews for every commit — share, review, and roll back instantly.'
  }, {
    e: 'Observability',
    t: 'See everything',
    d: 'Logs, traces, and Web Analytics built in — no extra config.'
  }, {
    e: 'Security',
    t: 'Secure by default',
    d: 'DDoS mitigation, WAF, and automatic HTTPS on every deployment.'
  }, {
    e: 'AI',
    t: 'Ship AI faster',
    d: 'The AI Gateway routes to any model with one API and unified billing.'
  }, {
    e: 'DX',
    t: 'Framework-native',
    d: 'First-class support for Next.js, Svelte, Nuxt, and every major framework.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-4xl) var(--space-lg)'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Develop \xB7 Preview \xB7 Ship",
    title: "Everything you need to build on the web.",
    sub: "A single platform that unifies your workflow \u2014 from local dev to global production."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-md)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    eyebrow: it.e,
    title: it.t
  }, it.d))));
}

// ---- Deploy band with code ----
function DeployBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-hairline-soft)',
      borderTop: '1px solid var(--color-hairline)',
      borderBottom: '1px solid var(--color-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-4xl) var(--space-lg)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-3xl)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Zero config",
    title: "Deploy in seconds, not hours.",
    sub: "Connect your Git repository and Vercel builds, deploys, and serves your app on a global edge network."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg"
  }, "Start Deploying")), /*#__PURE__*/React.createElement(CodeBlock, {
    label: "Terminal",
    showChrome: true,
    code: "$ vercel deploy\n\n\u25B2 Deploying acme-app\n\u2713 Building\n\u2713 Uploading [====================]\n\u2713 Production\n\nhttps://acme-app.vercel.app"
  })));
}

// ---- Category tabs + templates ----
function Templates() {
  const [tab, setTab] = React.useState('AI Apps');
  const tabs = ['AI Apps', 'Web Apps', 'Ecommerce', 'Docs'];
  const byTab = {
    'AI Apps': ['Chatbot Starter', 'RAG Template', 'AI SDK Demo'],
    'Web Apps': ['Next.js Boilerplate', 'SaaS Dashboard', 'Marketing Site'],
    'Ecommerce': ['Commerce Storefront', 'Subscriptions', 'Headless Shop'],
    'Docs': ['Docs Starter', 'Changelog', 'API Reference']
  };
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-4xl) var(--space-lg)'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Templates",
    title: "Start from a template."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-xs)',
      marginBottom: 'var(--space-lg)',
      flexWrap: 'wrap'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      height: '36px',
      padding: '0 16px',
      cursor: 'pointer',
      font: '500 14px/1 var(--font-sans)',
      color: tab === t ? 'var(--color-on-primary)' : 'var(--color-ink)',
      background: tab === t ? 'var(--color-primary)' : 'var(--color-canvas-elevated)',
      border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
      borderRadius: 'var(--radius-pill-category)'
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-md)'
    }
  }, byTab[tab].map((name, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    elevation: 1
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '96px',
      borderRadius: '8px',
      marginBottom: 'var(--space-md)',
      background: ['linear-gradient(120deg,#007cf0,#00dfd8)', 'linear-gradient(120deg,#7928ca,#ff0080)', 'linear-gradient(120deg,#ff4d4d,#f9cb28)'][i % 3]
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 16px/20px var(--font-sans)',
      letterSpacing: '-0.02em',
      color: 'var(--color-ink)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '4px',
      font: '400 13px/18px var(--font-sans)',
      color: 'var(--color-mute)'
    }
  }, "Deploy with one click")))));
}
function SignupBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: '520px',
      margin: '0 auto',
      padding: 'var(--space-2xl) var(--space-lg)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    elevation: 2,
    radius: "lg",
    padding: "var(--space-xl)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 20px/28px var(--font-sans)',
      letterSpacing: '-0.4px',
      color: 'var(--color-ink)',
      marginBottom: 'var(--space-md)'
    }
  }, "Get started for free"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-md)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    placeholder: "you@company.com"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      width: '100%'
    }
  }, "Create account"))));
}
function MarketingPage() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-canvas)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    brand: "Vercel",
    links: [{
      label: 'Products'
    }, {
      label: 'Solutions'
    }, {
      label: 'Resources'
    }, {
      label: 'Docs'
    }, {
      label: 'Pricing'
    }],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "md"
    }, "Log In"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md"
    }, "Sign Up"))
  }), /*#__PURE__*/React.createElement(Hero, {
    eyebrow: "Deploy \xB7 Preview \xB7 Ship",
    title: "Your complete platform for the web.",
    subtitle: "Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg"
    }, "Start Deploying"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg"
    }, "Get a Demo"))
  }), /*#__PURE__*/React.createElement(LogoStrip, {
    label: "Trusted by the best frontend teams",
    logos: ['Runway', 'Sonos', 'Notion', 'Under Armour', 'Zapier', 'Leonardo']
  }), /*#__PURE__*/React.createElement(Features, null), /*#__PURE__*/React.createElement(DeployBand, null), /*#__PURE__*/React.createElement(Templates, null), /*#__PURE__*/React.createElement(SignupBand, null), /*#__PURE__*/React.createElement(CTABand, {
    title: "Ready to deploy?",
    subtitle: "Start building on Vercel today. It's free to get started.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg"
    }, "Start Deploying")
  }), /*#__PURE__*/React.createElement(Footer, {
    brand: "Vercel",
    note: "\xA9 2026 \u2014 a recreation on the Geist system",
    columns: [{
      title: 'Products',
      links: [{
        label: 'AI'
      }, {
        label: 'Previews'
      }, {
        label: 'Edge Network'
      }, {
        label: 'Observability'
      }]
    }, {
      title: 'Resources',
      links: [{
        label: 'Docs'
      }, {
        label: 'Guides'
      }, {
        label: 'Blog'
      }, {
        label: 'Changelog'
      }]
    }, {
      title: 'Company',
      links: [{
        label: 'About'
      }, {
        label: 'Careers'
      }, {
        label: 'Customers'
      }, {
        label: 'Contact'
      }]
    }, {
      title: 'Legal',
      links: [{
        label: 'Privacy'
      }, {
        label: 'Terms'
      }, {
        label: 'DPA'
      }]
    }]
  }));
}
window.MarketingPage = MarketingPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/MarketingPage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CTABand = __ds_scope.CTABand;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.LogoStrip = __ds_scope.LogoStrip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.NavBar = __ds_scope.NavBar;

})();
