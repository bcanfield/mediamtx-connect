The site top-nav band — wordmark, pill-hit-area ghost links, and right-aligned action buttons on a hairline-bottomed canvas.

```jsx
<NavBar
  brand="Vercel"
  links={[{label:'Products'},{label:'Solutions'},{label:'Docs'}]}
  actions={<><Button variant="ghost" size="md">Log In</Button><Button variant="primary" size="md">Sign Up</Button></>}
/>
```
No logo asset ships with this system, so `brand` renders as tightly-tracked wordmark type.
