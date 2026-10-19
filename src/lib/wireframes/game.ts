import type { GameGenre } from '../schema'

// Low-fidelity game screen sketches for the Game mode starter kit: HUD, play area, touch controls,
// plus tiny start / game-over screens. Grayscale on purpose: a layout reference, not art to copy.
export type GameSketchId = GameGenre['sketch']

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#18181b;color:#e4e4e7;font-size:13px;padding:16px}
.screen{position:relative;aspect-ratio:16/9;max-width:820px;margin:0 auto;background:#3f3f46;border:3px solid #a1a1aa;border-radius:10px;overflow:hidden}
.hud{position:absolute;inset:8px 10px auto 10px;display:flex;justify-content:space-between;font-weight:700;font-size:12px}
.hud span{background:#27272a;border:2px solid #71717a;border-radius:6px;padding:3px 8px}
.b{position:absolute;background:#a1a1aa;border-radius:4px}.p{background:#fafafa;border-radius:6px}.e{background:#71717a;border-radius:50%}
.c{position:absolute;width:12px;height:12px;border-radius:50%;background:#d4d4d8}
.pad{display:flex;justify-content:space-between;align-items:center;max-width:820px;margin:10px auto 0}
.dpad{display:grid;grid-template-columns:repeat(3,34px);grid-template-rows:repeat(3,34px);gap:3px}
.dpad i{background:#52525b;border-radius:6px}.dpad i:nth-child(odd){visibility:hidden}
.ab{display:flex;gap:10px}.ab i{width:52px;height:52px;border-radius:50%;background:#52525b;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700}
.mini{display:flex;gap:12px;max-width:820px;margin:14px auto 0}
.mini div{flex:1;aspect-ratio:16/9;background:#27272a;border:2px solid #52525b;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.btn{background:#d4d4d8;color:#18181b;border-radius:6px;padding:4px 10px;font-weight:700;font-size:11px}
.card{position:absolute;bottom:14px;width:11%;aspect-ratio:2/3;background:#e4e4e7;border-radius:6px;border:2px solid #71717a}
.cell{position:absolute;border:1px solid #52525b}
.note{font-size:11px;color:#a1a1aa;text-align:center;padding:10px}
.t{font-weight:700;font-size:14px}.muted{color:#a1a1aa;font-size:11px}
`

const block = (l: number, t: number, w: number, h: number, cls = 'b') => `<div class="${cls === 'b' ? 'b' : `b ${cls}`}" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"></div>`
const coin = (l: number, t: number) => `<div class="c" style="left:${l}%;top:${t}%"></div>`

const PLAY: Record<GameSketchId, () => string> = {
  side: () =>
    block(0, 86, 38, 14) + block(46, 86, 54, 14) + block(22, 62, 14, 5) + block(58, 52, 16, 5) + block(80, 68, 12, 5) +
    block(12, 72, 5, 14, 'p') + block(64, 78, 5, 8, 'e') + coin(25, 54) + coin(29, 54) + coin(63, 44) + coin(67, 44) + block(93, 56, 3, 30),
  'top-down': () =>
    block(8, 18, 26, 30) + block(64, 22, 22, 18) + block(40, 64, 30, 22) + block(48, 44, 4, 7, 'p') +
    [18, 30, 72, 80, 26].map((l, i) => block(l, [58, 72, 50, 66, 34][i], 3, 5, 'e')).join('') + coin(56, 30) + coin(84, 52),
  track: () =>
    '<div class="b" style="left:12%;top:16%;width:76%;height:72%;border-radius:40%;background:transparent;border:26px solid #a1a1aa"></div>' +
    block(44, 74, 4, 6, 'p') + block(52, 76, 4, 6, 'e') + block(38, 78, 4, 6, 'e') + coin(48, 20) + coin(82, 50),
  cards: () =>
    block(40, 18, 20, 30, 'e') + '<div style="position:absolute;left:41%;top:12%;font-size:11px">⚔ 12</div>' + block(8, 40, 14, 22, 'p') +
    [24, 36, 48, 60, 72].map((l) => `<div class="card" style="left:${l}%"></div>`).join(''),
  grid: () =>
    Array.from({ length: 60 }, (_, i) => `<div class="cell" style="left:${20 + (i % 10) * 6}%;top:${16 + Math.floor(i / 10) * 13}%;width:6%;height:13%"></div>`).join('') +
    block(32, 81, 18, 12) + block(50, 68, 6, 25) + block(62, 55, 12, 13) + block(26, 68, 6, 13, 'p'),
  blocks: () =>
    Array.from({ length: 24 }, (_, i) => block(i * 4.2, 70 - (i % 5 === 0 ? 8 : 0), 4.2, 30)).join('') +
    block(30, 40, 8, 14) + block(38, 40, 8, 14) + block(34, 26, 8, 14) + block(60, 48, 4, 14, 'p') +
    '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:700">+</div>',
  text: () =>
    '<div style="position:absolute;inset:14% 6% 6% 6%;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#e4e4e7">' +
    '<div class="t">West of a small cabin</div><div>You are in a quiet forest. A path goes north. There is a rusty box here.</div>' +
    '<div style="margin-top:8px">&gt; open box</div><div>Inside the box is a small brass key.</div><div style="margin-top:8px">&gt; <span style="background:#e4e4e7">&nbsp;</span></div></div>',
  board: () =>
    Array.from({ length: 6 }, (_, i) => `<div class="b" style="left:${8 + (i % 3) * 30}%;top:${22 + Math.floor(i / 3) * 36}%;width:24%;height:28%;background:#52525b;display:flex;align-items:center;justify-content:center;font-weight:700">Player ${i + 1}</div>`).join(''),
}

export function renderGameSketch(id: GameSketchId, gameName: string): string {
  const name = esc(gameName)
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} sketch</title><style>${CSS}</style></head><body>
<div class="screen">${(PLAY[id] ?? PLAY.side)()}<div class="hud"><span>⭐ 0120</span><span>❤ ❤ ❤</span><span>⏱ 1:30</span><span>⏸</span></div></div>
<div class="pad"><div class="dpad"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="muted">Touch controls (phones)</div><div class="ab"><i>B</i><i>A</i></div></div>
<div class="mini"><div><div class="t">${name}</div><span class="btn">▶ Play</span><span style="font-size:10px">Controls: ← → move · Space jump</span></div><div><div class="t">Paused</div><span class="btn">Resume</span><span style="font-size:10px">Sound · Screen shake: off</span></div><div><div class="t">Game over</div><span>⭐ 0120 · Best 0340</span><span class="btn">↻ Try again</span></div></div>
<div class="note">Low-fidelity sketch: layout reference only. Make your own original art, names and characters.</div>
</body></html>`
}
