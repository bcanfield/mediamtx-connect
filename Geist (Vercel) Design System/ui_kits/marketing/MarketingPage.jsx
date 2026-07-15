const { Hero, LogoStrip, CTABand, Footer, NavBar, Card, CodeBlock, Button, Input } = window.GeistVercelDesignSystem_670231;

function Eyebrow({ children }) {
  return <div style={{ font: '500 12px/16px var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-mute)', marginBottom: '12px' }}>{children}</div>;
}
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ maxWidth: '640px', marginBottom: 'var(--space-2xl)' }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ margin: 0, font: '600 32px/40px var(--font-sans)', letterSpacing: '-1.28px', color: 'var(--color-ink)' }}>{title}</h2>
      {sub && <p style={{ margin: '12px 0 0', font: '400 16px/24px var(--font-sans)', color: 'var(--color-body)' }}>{sub}</p>}
    </div>
  );
}

// ---- Feature grid ----
function Features() {
  const items = [
    { e: 'Edge', t: 'Fluid compute', d: 'Pay only for what you use, down to the millisecond. Scale to zero automatically.' },
    { e: 'Previews', t: 'Every push, a URL', d: 'Deploy previews for every commit — share, review, and roll back instantly.' },
    { e: 'Observability', t: 'See everything', d: 'Logs, traces, and Web Analytics built in — no extra config.' },
    { e: 'Security', t: 'Secure by default', d: 'DDoS mitigation, WAF, and automatic HTTPS on every deployment.' },
    { e: 'AI', t: 'Ship AI faster', d: 'The AI Gateway routes to any model with one API and unified billing.' },
    { e: 'DX', t: 'Framework-native', d: 'First-class support for Next.js, Svelte, Nuxt, and every major framework.' },
  ];
  return (
    <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-4xl) var(--space-lg)' }}>
      <SectionHead eyebrow="Develop · Preview · Ship" title="Everything you need to build on the web." sub="A single platform that unifies your workflow — from local dev to global production." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
        {items.map((it, i) => (
          <Card key={i} eyebrow={it.e} title={it.t}>{it.d}</Card>
        ))}
      </div>
    </section>
  );
}

// ---- Deploy band with code ----
function DeployBand() {
  return (
    <section style={{ background: 'var(--color-hairline-soft)', borderTop: '1px solid var(--color-hairline)', borderBottom: '1px solid var(--color-hairline)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-4xl) var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3xl)', alignItems: 'center' }}>
        <div>
          <SectionHead eyebrow="Zero config" title="Deploy in seconds, not hours." sub="Connect your Git repository and Vercel builds, deploys, and serves your app on a global edge network." />
          <Button variant="primary" size="lg">Start Deploying</Button>
        </div>
        <CodeBlock label="Terminal" showChrome code={"$ vercel deploy\n\n\u25B2 Deploying acme-app\n\u2713 Building\n\u2713 Uploading [====================]\n\u2713 Production\n\nhttps://acme-app.vercel.app"} />
      </div>
    </section>
  );
}

// ---- Category tabs + templates ----
function Templates() {
  const [tab, setTab] = React.useState('AI Apps');
  const tabs = ['AI Apps', 'Web Apps', 'Ecommerce', 'Docs'];
  const byTab = {
    'AI Apps': ['Chatbot Starter', 'RAG Template', 'AI SDK Demo'],
    'Web Apps': ['Next.js Boilerplate', 'SaaS Dashboard', 'Marketing Site'],
    'Ecommerce': ['Commerce Storefront', 'Subscriptions', 'Headless Shop'],
    'Docs': ['Docs Starter', 'Changelog', 'API Reference'],
  };
  return (
    <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-4xl) var(--space-lg)' }}>
      <SectionHead eyebrow="Templates" title="Start from a template." />
      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            height: '36px', padding: '0 16px', cursor: 'pointer',
            font: '500 14px/1 var(--font-sans)',
            color: tab === t ? 'var(--color-on-primary)' : 'var(--color-ink)',
            background: tab === t ? 'var(--color-primary)' : 'var(--color-canvas-elevated)',
            border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
            borderRadius: 'var(--radius-pill-category)',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
        {byTab[tab].map((name, i) => (
          <Card key={i} elevation={1}>
            <div style={{ height: '96px', borderRadius: '8px', marginBottom: 'var(--space-md)', background: [
              'linear-gradient(120deg,#007cf0,#00dfd8)',
              'linear-gradient(120deg,#7928ca,#ff0080)',
              'linear-gradient(120deg,#ff4d4d,#f9cb28)'][i % 3] }} />
            <div style={{ font: '600 16px/20px var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>{name}</div>
            <div style={{ marginTop: '4px', font: '400 13px/18px var(--font-sans)', color: 'var(--color-mute)' }}>Deploy with one click</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SignupBand() {
  return (
    <section style={{ maxWidth: '520px', margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <Card elevation={2} radius="lg" padding="var(--space-xl)">
        <div style={{ font: '600 20px/28px var(--font-sans)', letterSpacing: '-0.4px', color: 'var(--color-ink)', marginBottom: 'var(--space-md)' }}>Get started for free</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Work email" placeholder="you@company.com" />
          <Button variant="primary" size="lg" style={{ width: '100%' }}>Create account</Button>
        </div>
      </Card>
    </section>
  );
}

function MarketingPage() {
  return (
    <div style={{ background: 'var(--color-canvas)', minHeight: '100%' }}>
      <NavBar
        brand="Vercel"
        links={[{ label: 'Products' }, { label: 'Solutions' }, { label: 'Resources' }, { label: 'Docs' }, { label: 'Pricing' }]}
        actions={<>
          <Button variant="ghost" size="md">Log In</Button>
          <Button variant="primary" size="md">Sign Up</Button>
        </>}
      />
      <Hero
        eyebrow="Deploy · Preview · Ship"
        title="Your complete platform for the web."
        subtitle="Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web."
        actions={<>
          <Button variant="primary" size="lg">Start Deploying</Button>
          <Button variant="secondary" size="lg">Get a Demo</Button>
        </>}
      />
      <LogoStrip label="Trusted by the best frontend teams" logos={['Runway', 'Sonos', 'Notion', 'Under Armour', 'Zapier', 'Leonardo']} />
      <Features />
      <DeployBand />
      <Templates />
      <SignupBand />
      <CTABand title="Ready to deploy?" subtitle="Start building on Vercel today. It's free to get started."
        actions={<Button variant="primary" size="lg">Start Deploying</Button>} />
      <Footer brand="Vercel" note="© 2026 — a recreation on the Geist system"
        columns={[
          { title: 'Products', links: [{ label: 'AI' }, { label: 'Previews' }, { label: 'Edge Network' }, { label: 'Observability' }] },
          { title: 'Resources', links: [{ label: 'Docs' }, { label: 'Guides' }, { label: 'Blog' }, { label: 'Changelog' }] },
          { title: 'Company', links: [{ label: 'About' }, { label: 'Careers' }, { label: 'Customers' }, { label: 'Contact' }] },
          { title: 'Legal', links: [{ label: 'Privacy' }, { label: 'Terms' }, { label: 'DPA' }] },
        ]} />
    </div>
  );
}

window.MarketingPage = MarketingPage;
