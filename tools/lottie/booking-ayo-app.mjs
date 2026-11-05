// Builds assets/lottie/booking-ayo-app.json — the AYO app booking mock
// (Figma 26682:27439): pick a date, then a price slot, then tap Book now.
// Text is converted to glyph outlines (lottie_light has no text support).
//
// Usage (from tools/lottie):  npm install && npm run fonts && npm run booking
// Edit the layout / copy / timeline constants below, then re-run.
import opentype from 'opentype.js';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2] || new URL('../../assets/lottie/booking-ayo-app.json', import.meta.url).pathname;
const FR = 30, OP = 240, W = 420, H = 420;
const F = {}; for (const w of [400, 500, 600, 700, 800]) F[w] = opentype.loadSync(new URL(`./fonts/${w}.ttf`, import.meta.url).pathname);

const hex = h => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1].map(v => +v.toFixed(4)); };
const C = { white: '#ffffff', ink: '#1a1919', sub: '#787373', mute: '#9b9797', line: '#ededed', off: '#f3f0ed', offTx: '#bebbbb', red: '#ec2435', phone: '#ebe7e0' };

// ---- keyframes --------------------------------------------------------------
const EASE = { i: { x: 0.2, y: 1 }, o: { x: 0.4, y: 0 } };
const anim = (pairs) => ({ a: 1, k: pairs.map(([t, v], idx) => idx < pairs.length - 1 ? { t, s: Array.isArray(v) ? v : [v], ...EASE } : { t, s: Array.isArray(v) ? v : [v] }) });
const stat = v => ({ a: 0, k: v });
const prop = v => (v && v.anim) ? anim(v.anim) : stat(v);

let IND = 0;
function layer(nm, shapes, { o = 100, p = [0, 0, 0], a = [0, 0, 0], s = [100, 100, 100], parent } = {}) {
  const L = { ddd: 0, ind: ++IND, ty: 4, nm, sr: 1, ks: { o: prop(o), r: stat(0), p: prop(p), a: stat(a), s: prop(s) }, ao: 0, shapes, ip: 0, op: OP, st: 0, bm: 0 };
  if (parent) L.parent = parent;
  return L;
}
const tr = () => ({ ty: 'tr', p: stat([0, 0]), a: stat([0, 0]), s: stat([100, 100]), r: stat(0), o: stat(100), sk: stat(0), sa: stat(0), nm: 'Transform' });
const fill = c => ({ ty: 'fl', c: stat(hex(c)), o: stat(100), r: 1, bm: 0, nm: 'Fill' });
const stroke = (c, w) => ({ ty: 'st', c: stat(hex(c)), o: stat(100), w: stat(w), lc: 2, lj: 2, ml: 4, bm: 0, nm: 'Stroke' });
const rectShape = (x, y, w, h, r) => ({ ty: 'rc', d: 1, s: stat([w, h]), p: stat([x + w / 2, y + h / 2]), r: stat(r), nm: 'Rect' });
const group = (it, nm = 'Group') => ({ ty: 'gr', it: [...it, tr()], nm, np: it.length, cix: 2, bm: 0 });
function box(x, y, w, h, r, { fillC, strokeC, sw = 1 } = {}) {
  const it = [rectShape(x, y, w, h, r)];
  if (strokeC) it.push(stroke(strokeC, sw));
  if (fillC) it.push(fill(fillC));
  return [group(it, 'Box')];
}

// ---- text → outlines ---------------------------------------------------------
function textWidth(str, wgt, size) { return F[wgt].getAdvanceWidth(str, size); }
function textShapes(str, wgt, size, x, yTop, lh, color, align = 'left') {
  const font = F[wgt];
  const scale = size / font.unitsPerEm;
  const asc = font.ascender * scale, desc = -font.descender * scale;
  const baseline = yTop + (lh - (asc + desc)) / 2 + asc;
  const w = textWidth(str, wgt, size);
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const path = font.getPath(str, left, baseline, size);
  const contours = []; let cur = null, last = null;
  for (const c of path.commands) {
    if (c.type === 'M') { cur = { v: [[c.x, c.y]], i: [[0, 0]], o: [[0, 0]] }; contours.push(cur); last = [c.x, c.y]; }
    else if (c.type === 'L') { cur.v.push([c.x, c.y]); cur.i.push([0, 0]); cur.o.push([0, 0]); last = [c.x, c.y]; }
    else if (c.type === 'Q' || c.type === 'C') {
      let c1, c2;
      if (c.type === 'Q') { c1 = [last[0] + 2 / 3 * (c.x1 - last[0]), last[1] + 2 / 3 * (c.y1 - last[1])]; c2 = [c.x + 2 / 3 * (c.x1 - c.x), c.y + 2 / 3 * (c.y1 - c.y)]; }
      else { c1 = [c.x1, c.y1]; c2 = [c.x2, c.y2]; }
      const k = cur.v.length - 1;
      cur.o[k] = [c1[0] - last[0], c1[1] - last[1]];
      cur.v.push([c.x, c.y]); cur.i.push([c2[0] - c.x, c2[1] - c.y]); cur.o.push([0, 0]);
      last = [c.x, c.y];
    } else if (c.type === 'Z') {
      const n = cur.v.length - 1;
      if (n > 0 && Math.abs(cur.v[n][0] - cur.v[0][0]) < 1e-6 && Math.abs(cur.v[n][1] - cur.v[0][1]) < 1e-6) {
        cur.i[0] = cur.i[n]; cur.v.pop(); cur.i.pop(); cur.o.pop();
      }
    }
  }
  const r3 = a => a.map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]);
  const it = contours.filter(c => c.v.length > 1).map(c => ({ ty: 'sh', ks: stat({ i: r3(c.i), o: r3(c.o), v: r3(c.v), c: true }), nm: 'Glyph' }));
  it.push(fill(color));
  return [group(it, 'Text')];
}

// ---- layout (Figma 26682:27439, 420×420) ---------------------------------------
const SX = 104;                               // screen content left
const dates = [['Thu', '29'], ['Fri', '30'], ['Sat', '31'], ['Sun', '1']];
const DW = 48.5, DG = 6, DY = 106, DH = 46;
const dateX = i => SX + i * (DW + DG);
const COLX = [142, 201.33, 260.67], COLW = 55.33;
const ROWS = [['17:00', '120K', ['off', '', '']], ['18:00', '150K', ['', 'off', 'off']], ['19:00', '150K', ['', 'pick', '']], ['20:00', '150K', ['off', '', 'off']]];
const ROWY = [186, 224, 262, 300], CH = 32, GY = 164;
const SUM = { x: 104, y: 344, w: 212, h: 56 }, BTN = { x: 225, y: 356, w: 79, h: 32 };
const PICK = { x: COLX[1], y: ROWY[2] };
const P = { fri: [dateX(1) + DW / 2, DY + DH / 2], cell: [PICK.x + COLW / 2, PICK.y + CH / 2], btn: [BTN.x + BTN.w / 2, BTN.y + BTN.h / 2] };

// ---- timeline (frames @30fps) ----------------------------------------------------
const T = { touchIn: 10, tapDate: 26, dateSwap: 28, gridIn: 36, toCell: 52, tapCell: 76, pick: 80, sumIn: 90, toBtn: 108, tapBtn: 134, booked: 142, touchOut: 158, reset: 214, end: 232 };

const layers = [];   // bottom → top; reversed at the end
const add = l => (layers.push(l), l);

add(layer('illo', box(0, 0, W, H, 0, { fillC: C.white })));
add(layer('phone', box(80, 28, 260, 440, 34, { fillC: C.phone })));
add(layer('screen', box(90, 38, 240, 430, 26, { fillC: C.white })));
add(layer('Padel · 2.1 km', textShapes('Padel · 2.1 km', 400, 12, SX, 56, 16, C.sub)));
add(layer('AYO Arena Venue', textShapes('AYO Arena Venue', 800, 16, SX, 74, 20, C.ink)));

// Dates: Thu starts selected, Fri takes over on the tap, and back on reset.
const onAt = (from, to) => ({ anim: [[0, from], [T.dateSwap, from], [T.dateSwap + 5, to], [T.reset + 6, to], [T.reset + 12, from]] });
dates.forEach(([d, n], i) => {
  const x = dateX(i), cx = x + DW / 2;
  add(layer('date ' + d, box(x, DY, DW, DH, 10, { fillC: C.white, strokeC: C.line })));
  const darkFrom = i === 0 ? 100 : 0, darkTo = i === 1 ? 100 : 0;
  if (i <= 1) add(layer('date on ' + d, box(x, DY, DW, DH, 10, { fillC: C.ink }), { o: onAt(darkFrom, darkTo) }));
  const inkO = i === 0 ? onAt(0, 100) : i === 1 ? onAt(100, 0) : 100;
  add(layer(d + ' ink', [...textShapes(d, 400, 12, cx, DY + 6, 16, C.ink, 'center'), ...textShapes(n, 700, 12, cx, DY + 22, 16, C.ink, 'center')], { o: inkO }));
  if (i <= 1) add(layer(d + ' white', [...textShapes(d, 400, 12, cx, DY + 6, 16, C.white, 'center'), ...textShapes(n, 700, 12, cx, DY + 22, 16, C.white, 'center')], { o: onAt(darkFrom, darkTo) }));
});

// Grid: fades in after the date is picked, out again on reset.
const showFrom = (start, dur = 8) => ({ anim: [[0, 0], [start, 0], [start + dur, 100], [T.reset, 100], [T.reset + 8, 0]] });
const riseFrom = (start, base, dur = 8) => ({ anim: [[0, [base[0], base[1] + 6, 0]], [start, [base[0], base[1] + 6, 0]], [start + dur, [base[0], base[1], 0]]] });
add(layer('courts', ['Court 1', 'Court 2', 'Court 3'].flatMap((c, i) => textShapes(c, 700, 11, COLX[i] + COLW / 2, GY, 16, C.ink, 'center')), { o: showFrom(T.gridIn - 2) }));
let k = 0;
ROWS.forEach(([time, price, states], r) => {
  add(layer('time ' + time, textShapes(time, 500, 11, SX, ROWY[r] + 8, 16, C.sub), { o: showFrom(T.gridIn + r * 3) }));
  states.forEach((st, c) => {
    const x = COLX[c], y = ROWY[r], start = T.gridIn + k * 2; k++;
    const cx = x + COLW / 2, cy = y + CH / 2;
    const opts = { o: showFrom(start), a: [cx, cy, 0], p: riseFrom(start, [cx, cy]) };
    const cell = st === 'off' ? box(x, y, COLW, CH, 8, { fillC: C.off }) : box(x, y, COLW, CH, 8, { fillC: C.white, strokeC: C.line });
    const txt = textShapes(price, st === 'off' ? 600 : 600, 12, cx, y + 8, 16, st === 'off' ? C.offTx : C.ink, 'center');
    if (st === 'off') { const w = textWidth(price, 600, 12); txt.push(...box(cx - w / 2, y + 15.5, w, 1, 0, { fillC: C.offTx })); }
    add(layer(`cell ${time} c${c + 1}`, [...txt, ...cell], opts));
    if (st === 'pick') {
      // The picked price: red fill pops in with white text on the tap.
      const pickO = { anim: [[0, 0], [T.pick, 0], [T.pick + 4, 100], [T.reset, 100], [T.reset + 6, 0]] };
      const pop = { anim: [[0, [100, 100, 100]], [T.tapCell, [100, 100, 100]], [T.tapCell + 4, [90, 90, 100]], [T.tapCell + 10, [100, 100, 100]]] };
      add(layer('cell pick red', [...textShapes(price, 700, 12, cx, y + 8, 16, C.white, 'center'), ...box(x, y, COLW, CH, 8, { fillC: C.red })], { o: pickO, a: [cx, cy, 0], p: [cx, cy, 0], s: pop }));
    }
  });
});

// Summary bar rises with the total, then Book now → Booked ✓.
const sumO = { anim: [[0, 0], [T.sumIn, 0], [T.sumIn + 10, 100], [T.reset, 100], [T.reset + 8, 0]] };
const sumP = { anim: [[0, [0, 40, 0]], [T.sumIn, [0, 40, 0]], [T.sumIn + 12, [0, 0, 0]], [T.reset, [0, 0, 0]], [T.reset + 10, [0, 24, 0]]] };
const sum = add(layer('summary', box(SUM.x, SUM.y, SUM.w, SUM.h, 14, { fillC: C.ink }), { o: sumO, p: sumP }));
add(layer('summary info', [...textShapes('Fri · 19:00 · Court 2', 400, 12, SUM.x + 12, SUM.y + 12, 16, C.mute), ...textShapes('Rp150.000', 700, 12, SUM.x + 12, SUM.y + 28, 16, C.white)], { o: sumO, parent: sum.ind }));
const bcx = BTN.x + BTN.w / 2, bcy = BTN.y + BTN.h / 2;
const ring = { anim: [[0, [100, 100, 100]], [T.tapBtn + 2, [100, 100, 100]], [T.tapBtn + 20, [128, 150, 100]]] };
const ringO = { anim: [[0, 0], [T.tapBtn + 2, 0], [T.tapBtn + 4, 55], [T.tapBtn + 20, 0]] };
add(layer('cta ring', box(BTN.x, BTN.y, BTN.w, BTN.h, 16, { fillC: C.red }), { o: ringO, a: [bcx, bcy, 0], p: [bcx, bcy, 0], s: ring, parent: sum.ind }));
const btnPop = { anim: [[0, [100, 100, 100]], [T.tapBtn, [100, 100, 100]], [T.tapBtn + 4, [92, 92, 100]], [T.tapBtn + 10, [100, 100, 100]]] };
add(layer('cta', box(BTN.x, BTN.y, BTN.w, BTN.h, 16, { fillC: C.red }), { o: sumO, a: [bcx, bcy, 0], p: [bcx, bcy, 0], s: btnPop, parent: sum.ind }));
const bookO = { anim: [[0, 0], [T.sumIn, 0], [T.sumIn + 10, 100], [T.booked, 100], [T.booked + 4, 0], [T.end, 0]] };
add(layer('Book now', textShapes('Book now', 700, 12, bcx, BTN.y + 8, 16, C.white, 'center'), { o: bookO, parent: sum.ind }));
const bw = textWidth('Booked', 700, 12), gw = 10 + 5 + bw, gx = bcx - gw / 2;
const bookedO = { anim: [[0, 0], [T.booked + 2, 0], [T.booked + 8, 100], [T.reset, 100], [T.reset + 6, 0]] };
add(layer('Booked', textShapes('Booked', 700, 12, gx + 15, BTN.y + 8, 16, C.white), { o: bookedO, parent: sum.ind }));
// Check mark, drawn on with a trim path.
const check = { ty: 'sh', ks: stat({ i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[gx, bcy + 0.5], [gx + 3.5, bcy + 4], [gx + 10, bcy - 3.5]], c: false }), nm: 'Check' };
const trim = { ty: 'tm', s: stat(0), e: anim([[0, 0], [T.booked + 4, 0], [T.booked + 14, 100]]), o: stat(0), m: 1, nm: 'Trim' };
add(layer('check', [group([check, trim, stroke(C.white, 1.8)], 'Check')], { o: bookedO, parent: sum.ind }));

// Touch: a finger dot that taps the date, the price, then Book now.
const tap = t => [[t, [100, 100, 100]], [t + 3, [80, 80, 100]], [t + 8, [100, 100, 100]]];
const touchP = { anim: [[0, [...P.fri, 0]], [T.tapDate + 8, [...P.fri, 0]], [T.toCell + 18, [...P.cell, 0]], [T.tapCell + 10, [...P.cell, 0]], [T.toBtn + 18, [...P.btn, 0]]] };
const touchO = { anim: [[0, 0], [T.touchIn, 0], [T.touchIn + 8, 100], [T.touchOut, 100], [T.touchOut + 8, 0]] };
const touchS = { anim: [[0, [60, 60, 100]], [T.touchIn, [60, 60, 100]], [T.touchIn + 8, [100, 100, 100]], ...tap(T.tapDate - 2), ...tap(T.tapCell - 2), ...tap(T.tapBtn - 2)] };
const dot = [group([{ ty: 'el', d: 1, s: stat([26, 26]), p: stat([0, 0]), nm: 'Dot' }, stroke(C.white, 2), { ...fill(C.ink), o: stat(28) }], 'Touch')];
add(layer('touch', dot, { o: touchO, p: touchP, s: touchS }));

const json = { v: '5.7.4', fr: FR, ip: 0, op: OP, w: W, h: H, nm: 'AYO app booking — grid', ddd: 0, assets: [], layers: layers.reverse(), markers: [] };
writeFileSync(OUT, JSON.stringify(json));
console.log('layers', json.layers.length, 'bytes', JSON.stringify(json).length);
