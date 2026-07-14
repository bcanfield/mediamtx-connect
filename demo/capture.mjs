// Demo capture driver: walks the shot list against a running app, recording the
// browser to webm. Injects a synthetic cursor + a caption bar (this ffmpeg has no
// text filter, so captions are DOM overlays baked into the recorded video).
// Every action is best-effort: a missing selector logs and continues so a single
// UI change never aborts the whole capture.
import { chromium } from '@playwright/test'

const BASE = process.env.DEMO_BASE_URL || 'http://localhost:3000'
const OUT = '.work/video'

const overlay = () => {
  const init = () => {
    if (!document.body || document.getElementById('dcap')) return
    const s = document.createElement('style')
    s.textContent = `
      #dcur{position:fixed;z-index:2147483647;width:28px;height:28px;margin:-4px 0 0 -4px;
        pointer-events:none;transition:transform .05s linear;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
      #dcur svg{width:100%;height:100%}
      #dclick{position:fixed;z-index:2147483646;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
        border:2.5px solid #35b6dc;opacity:0;pointer-events:none}
      #dcap{position:fixed;z-index:2147483645;left:50%;bottom:40px;transform:translateX(-50%);
        max-width:80vw;padding:13px 26px;border-radius:999px;background:rgba(10,15,20,.85);
        color:#eaf0f5;font:600 21px/1.3 system-ui,-apple-system,Segoe UI,sans-serif;white-space:nowrap;
        letter-spacing:.2px;opacity:0;transition:opacity .35s ease;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
        box-shadow:0 6px 30px rgba(0,0,0,.45);border:1px solid rgba(53,182,220,.4)}`
    document.head.appendChild(s)
    const c = document.createElement('div'); c.id = 'dcur'
    c.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff" stroke="#0b0f14" stroke-width="1.3"><path d="M4 2l6 16 2.5-6.5L19 9z"/></svg>'
    const ring = document.createElement('div'); ring.id = 'dclick'
    const cap = document.createElement('div'); cap.id = 'dcap'
    document.body.append(c, ring, cap)
    let x = window.innerWidth / 2, y = window.innerHeight / 2
    const place = () => { c.style.transform = `translate(${x}px,${y}px)` }
    place()
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; place() }, true)
    window.__cap = (t) => { cap.textContent = t || ''; cap.style.opacity = t ? '1' : '0' }
    window.__ring = () => {
      ring.style.left = `${x}px`; ring.style.top = `${y}px`
      ring.animate([{ opacity: .9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1)' }], { duration: 450 })
    }
  }
  if (document.body) init()
  else document.addEventListener('DOMContentLoaded', init)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  })
  await ctx.addInitScript(overlay)
  const page = await ctx.newPage()
  let cursor = { x: 640, y: 400 }

  const cap = t => page.evaluate(x => window.__cap && window.__cap(x), t).catch(() => {})
  async function moveTo(x, y) {
    const steps = 24
    for (let i = 1; i <= steps; i++) {
      const nx = cursor.x + (x - cursor.x) * (i / steps)
      const ny = cursor.y + (y - cursor.y) * (i / steps)
      await page.mouse.move(nx, ny)
      await sleep(12)
    }
    cursor = { x, y }
  }
  async function clickLoc(loc, label) {
    try {
      const el = loc.first()
      await el.scrollIntoViewIfNeeded({ timeout: 3000 })
      const box = await el.boundingBox({ timeout: 3000 })
      if (!box) throw new Error('no box')
      await moveTo(box.x + box.width / 2, box.y + box.height / 2)
      await page.evaluate(() => window.__ring && window.__ring()).catch(() => {})
      await sleep(120)
      await el.click({ timeout: 4000 })
      return true
    }
    catch (e) { console.log(`  · skip click [${label}]: ${e.message.split('\n')[0]}`); return false }
  }
  const goto = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(() => {}); await sleep(450) }

  // 1 — Live grid
  await goto('/')
  await cap('Live Streams — every camera in one place')
  await moveTo(360, 300); await sleep(2600)

  // 2 — Play a stream (HLS in the browser)
  await cap('Live Streams — watch in the browser, one click')
  await clickLoc(page.getByRole('button', { name: /play|watch|start/i }), 'play-stream')
  await sleep(5200)

  // 3 — Recordings index (caption AFTER goto — navigation reloads + wipes the overlay)
  await goto('/recordings')
  await cap('Recordings — browse every camera')
  await moveTo(500, 320); await sleep(2400)

  // 4 — Per-stream recordings + download
  await goto('/recordings/front-door')
  await cap('Recordings — grouped by day, Today & Yesterday')
  await moveTo(640, 360); await sleep(1800)
  await cap('Recordings — play or download any clip')
  await clickLoc(page.getByRole('button', { name: /^play|watch/i }), 'play-recording')
  await sleep(2600)
  await clickLoc(page.getByRole('button', { name: /download/i }), 'download')
  await sleep(2600)

  // 5 — Config without YAML
  await goto('/config/mediamtx/global')
  await cap('MediaMTX Config — the whole server, no YAML')
  await moveTo(500, 260); await sleep(1600)
  for (const tab of [/rtsp/i, /webrtc/i, /hls/i]) {
    await clickLoc(page.getByRole('tab', { name: tab }), `tab ${tab}`)
    await sleep(1300)
  }
  await cap('MediaMTX Config — typed, validated, saved in one click')
  await clickLoc(page.getByRole('switch'), 'toggle-switch')
  await sleep(1800)
  await clickLoc(page.getByRole('button', { name: /discard/i }), 'discard')
  await sleep(900)

  // 6 — Theme polish
  await cap('Dark or light — your call')
  await clickLoc(page.getByRole('button', { name: /theme|mode|dark|light|toggle/i }), 'theme')
  await sleep(1800)
  await cap('')
  await sleep(700)

  const vpath = await page.video().path()
  await page.close()
  await ctx.close()
  await browser.close()
  console.log(`VIDEO:${vpath}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
