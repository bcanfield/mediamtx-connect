A context-driven button — rounded black pills for marketing CTAs, tight 6px squares for nav/app chrome — use whenever the design needs an action control.

```jsx
<Button variant="primary" size="lg">Start Deploying</Button>
<Button variant="secondary" size="lg">Get a Demo</Button>
<Button variant="primary" size="md">Sign Up</Button>
<Button variant="ghost" size="md">Log In</Button>
<Button variant="primary" size="md" shape="category">AI Apps</Button>
```

Variants: `primary` (black fill), `secondary` (white, ink border), `ghost` (white, hairline border), `danger` (red). Sizes: `lg` marketing (40px, pill by default), `md` nav/app (32px, 6px square by default). Override the shape with `shape="pill|square|category"` — e.g. a category tab pill at 64px radius.
