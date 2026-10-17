import type { Category } from '../schema'

// Grayscale, low-fidelity HTML mockups. Self-contained (inline CSS, no external assets)
// so users can copy the HTML or a PNG straight into an LLM as a layout reference.
export type WireframeId = Category['wireframe']

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f4f5;color:#27272a;font-size:13px}
.app{display:flex;flex-direction:column;min-height:100vh}
.top{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#fff;border-bottom:2px solid #d4d4d8}
.logo{font-weight:700;display:flex;gap:8px;align-items:center}
.logo i{width:22px;height:22px;border-radius:6px;background:#a1a1aa;display:inline-block}
.row{display:flex;gap:12px}.col{display:flex;flex-direction:column;gap:10px}
.grow{flex:1}.pad{padding:16px}
.box{background:#fff;border:2px solid #d4d4d8;border-radius:10px;padding:12px}
.side{width:200px;background:#e4e4e7;border-right:2px solid #d4d4d8;padding:12px;display:flex;flex-direction:column;gap:6px}
.item{padding:7px 9px;border-radius:7px;background:#f4f4f5}.item.on{background:#a1a1aa;color:#fff}
.btn{display:inline-block;padding:8px 14px;border-radius:8px;background:#52525b;color:#fff;font-weight:600;text-align:center}
.btn.ghost{background:#fff;color:#52525b;border:2px solid #a1a1aa}
.line{height:9px;border-radius:5px;background:#d4d4d8;margin:5px 0}.w40{width:40%}.w60{width:60%}.w80{width:80%}
.input{border:2px solid #d4d4d8;border-radius:8px;padding:9px;background:#fafafa;color:#a1a1aa}
.h{font-weight:700;font-size:15px}.muted{color:#71717a}
.grid7{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
.day{padding:7px 0;border-radius:6px;background:#f4f4f5}.day.on{background:#52525b;color:#fff}.day.x{color:#d4d4d8}
.chip{display:inline-block;padding:4px 9px;border-radius:999px;background:#e4e4e7;margin:2px}
.track{height:34px;border-radius:6px;background:#e4e4e7;position:relative;overflow:hidden}
.clip{position:absolute;top:4px;bottom:4px;border-radius:4px;background:#a1a1aa}
.bubble{max-width:75%;padding:10px 12px;border-radius:12px;background:#fff;border:2px solid #d4d4d8}
.bubble.me{align-self:flex-end;background:#52525b;color:#fff;border-color:#52525b}
.note{font-size:11px;color:#a1a1aa;text-align:center;padding:8px}
`

function shell(appName: string, body: string, nav = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(appName)} wireframe</title><style>${CSS}</style></head><body><div class="app"><div class="top"><div class="logo"><i></i>${esc(appName)}</div><div class="row">${nav}</div></div>${body}<div class="note">Low-fidelity wireframe: layout reference only. Use your own name, colors and branding.</div></div></body></html>`
}

const lines = (n: number) => Array.from({ length: n }, (_, i) => `<div class="line ${['w80', 'w60', 'w40'][i % 3]}"></div>`).join('')

const templates: Record<WireframeId, (name: string) => string> = {
  scheduling: (name) =>
    shell(
      name,
      `<div class="row pad" style="flex-wrap:wrap">
        <div class="box col" style="width:220px"><div class="h">Your Name</div><div class="muted">30-min intro call</div><div class="muted">🕒 30 min · 📹 Video link</div>${lines(3)}</div>
        <div class="box col grow" style="min-width:260px"><div class="h">Select a date</div>
          <div class="grid7 muted"><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div></div>
          <div class="grid7">${Array.from({ length: 28 }, (_, i) => `<div class="day ${i === 15 ? 'on' : i % 7 > 4 ? 'x' : ''}">${i + 1}</div>`).join('')}</div>
          <div class="muted">Time zone: auto-detected ▾</div></div>
        <div class="box col" style="width:180px"><div class="h">Available times</div>${['9:00am', '9:30am', '11:00am', '1:30pm', '3:00pm'].map((t, i) => `<div class="btn ${i === 2 ? '' : 'ghost'}">${t}</div>`).join('')}</div>
      </div>
      <div class="row pad" style="padding-top:0"><div class="box col grow"><div class="h">Your details</div><div class="input">Name</div><div class="input">Email</div><div class="input">Anything to share before the call?</div><div><span class="btn">Confirm booking</span></div></div></div>`,
      '<span class="btn ghost">Event types</span><span class="btn ghost">Availability</span>',
    ),
  'video-editing': (name) =>
    shell(
      name,
      `<div class="row pad grow">
        <div class="box col" style="width:260px"><div class="h">Transcript</div><div class="muted">Click a word to jump · delete text to cut video</div>${lines(9)}<div><span class="chip">Remove filler words</span><span class="chip">Captions</span></div></div>
        <div class="col grow"><div class="box" style="height:220px;display:flex;align-items:center;justify-content:center;background:#d4d4d8">▶ Preview</div>
          <div class="box col"><div class="row muted" style="justify-content:space-between"><span>00:00</span><span>Timeline</span><span>12:34</span></div>
            <div class="track"><div class="clip" style="left:2%;width:40%"></div><div class="clip" style="left:45%;width:30%"></div></div>
            <div class="track"><div class="clip" style="left:10%;width:20%;background:#71717a"></div></div>
            <div class="track"><div class="clip" style="left:0;width:85%;background:#d4d4d8;border:2px dashed #a1a1aa"></div></div>
            <div class="row muted"><span>🎬 Video</span><span>🎵 Music</span><span>💬 Captions</span></div></div></div>
      </div>`,
      '<span class="btn ghost">Record</span><span class="btn">Export</span>',
    ),
  'ai-chat': (name) =>
    shell(
      name,
      `<div class="row grow" style="gap:0">
        <div class="side"><div class="btn">+ New chat</div>${['Email to client', 'Video script ideas', 'Budget plan', 'Recipe for 4'].map((t, i) => `<div class="item ${i === 0 ? 'on' : ''}">${t}</div>`).join('')}<div class="grow"></div><div class="item">⚙ Model: local ▾</div></div>
        <div class="col grow pad"><div class="bubble me">Write a friendly follow-up email to a client who hasn't paid yet.</div>
          <div class="bubble">${lines(4)}</div><div class="bubble me">Make it shorter.</div><div class="bubble">${lines(2)}</div>
          <div class="grow"></div><div class="row"><div class="input grow">Message… (📎 attach a file)</div><span class="btn">Send</span></div></div>
      </div>`,
    ),
  notes: (name) =>
    shell(
      name,
      `<div class="row grow" style="gap:0">
        <div class="side"><div class="input">🔍 Search</div>${['📌 Home', '📝 Content ideas', '📅 Weekly plan', '📚 Reading list', '  ↳ Book notes'].map((t, i) => `<div class="item ${i === 1 ? 'on' : ''}">${t}</div>`).join('')}<div class="item">+ New page</div></div>
        <div class="col grow pad"><div class="h" style="font-size:22px">Content ideas</div><div class="muted">Last edited today</div>${lines(3)}
          <div class="box"><div class="row muted"><span class="chip">Table</span><span class="chip" style="background:#a1a1aa;color:#fff">Board</span><span class="chip">Calendar</span></div>
            <div class="row" style="margin-top:8px">${['Idea', 'Scripting', 'Filming', 'Posted'].map((c) => `<div class="col grow" style="background:#f4f4f5;border-radius:8px;padding:8px"><b>${c}</b><div class="box">${lines(1)}</div><div class="box">${lines(2)}</div></div>`).join('')}</div></div>
          ${lines(2)}</div>
      </div>`,
    ),
  forms: (name) =>
    shell(
      name,
      `<div class="col pad grow" style="align-items:center;justify-content:center">
        <div class="box col" style="width:min(480px,100%);padding:28px"><div class="muted">Question 3 of 7</div><div class="track" style="height:8px"><div class="clip" style="top:0;bottom:0;left:0;width:40%"></div></div>
          <div class="h" style="font-size:20px">What best describes you?</div>
          ${['A  Creator', 'B  Small business owner', 'C  Freelancer', 'D  Other'].map((o, i) => `<div class="btn ${i === 1 ? '' : 'ghost'}" style="text-align:left">${o}</div>`).join('')}
          <div class="row" style="justify-content:space-between"><span class="btn ghost">↑ Back</span><span class="btn">OK ✓</span></div></div>
        <div class="muted">Builder view: question list · logic jumps · themes · responses tab</div>
      </div>`,
      '<span class="btn ghost">Build</span><span class="btn ghost">Logic</span><span class="btn ghost">Results</span>',
    ),
  'link-in-bio': (name) =>
    shell(
      name,
      `<div class="col pad grow" style="align-items:center">
        <div class="col" style="width:min(380px,100%);align-items:center;gap:12px;padding-top:12px">
          <div style="width:84px;height:84px;border-radius:50%;background:#a1a1aa"></div><div class="h" style="font-size:18px">@yourname</div><div class="muted">One-line bio about what you do</div>
          ${['🎥 Latest video', '📚 My course', '🗓️ Book a call', '🛍️ Shop', '📧 Newsletter'].map((l) => `<div class="btn ghost" style="width:100%">${l}</div>`).join('')}
          <div class="row muted"><span>◯ IG</span><span>◯ TikTok</span><span>◯ YT</span><span>◯ X</span></div></div>
      </div>`,
    ),
  email: (name) =>
    shell(
      name,
      `<div class="row grow" style="gap:0">
        <div class="side">${['📊 Dashboard', '👥 Subscribers', '✉️ Campaigns', '⚙ Automations', '📝 Signup forms'].map((t, i) => `<div class="item ${i === 2 ? 'on' : ''}">${t}</div>`).join('')}</div>
        <div class="col grow pad"><div class="row" style="justify-content:space-between"><div class="h">Campaigns</div><span class="btn">+ New campaign</span></div>
          <div class="row">${['Subscribers 1,240', 'Open rate 48%', 'Click rate 6%'].map((s) => `<div class="box grow"><div class="muted">${s.split(' ').slice(0, -1).join(' ')}</div><div class="h">${s.split(' ').pop()}</div></div>`).join('')}</div>
          ${['Weekly newsletter #42 · Sent', 'Course launch · Scheduled', 'Welcome sequence · Draft'].map((c) => `<div class="box row" style="justify-content:space-between"><span>${c}</span><span class="muted">Edit ›</span></div>`).join('')}
          <div class="box col"><div class="h">Editor</div><div class="row"><div class="col" style="width:120px"><span class="chip">Text</span><span class="chip">Image</span><span class="chip">Button</span></div><div class="box grow">${lines(5)}</div></div></div></div>
      </div>`,
    ),
  generic: (name) =>
    shell(
      name,
      `<div class="row grow" style="gap:0">
        <div class="side">${['🏠 Dashboard', '📁 Items', '🔍 Search', '⚙ Settings'].map((t, i) => `<div class="item ${i === 0 ? 'on' : ''}">${t}</div>`).join('')}</div>
        <div class="col grow pad"><div class="row" style="justify-content:space-between"><div class="h">Dashboard</div><span class="btn">+ New</span></div>
          <div class="row">${[1, 2, 3].map(() => `<div class="box grow">${lines(2)}</div>`).join('')}</div>
          <div class="box col"><div class="input">🔍 Search items…</div>${[1, 2, 3, 4].map(() => `<div class="row" style="justify-content:space-between;border-bottom:1px solid #e4e4e7;padding:6px 0"><div class="grow">${lines(1)}</div><span class="muted">Edit · Delete</span></div>`).join('')}</div>
          <div class="row"><span class="btn ghost">Export CSV</span></div></div>
      </div>`,
    ),
}

export function renderWireframe(id: WireframeId, appName: string): string {
  return (templates[id] ?? templates.generic)(appName)
}
