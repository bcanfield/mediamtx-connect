A monospace code / terminal surface — white card, 1px hairline, optional filename bar and traffic-light chrome.

```jsx
<CodeBlock label="~/app" showChrome code={`$ vercel deploy\n✓ Production: https://my-app.vercel.app`} />
```
Exposes `CodeBlock.PALETTE` (kw/fn/str/com/ink) if you want to hand-color tokens in a richer render.
