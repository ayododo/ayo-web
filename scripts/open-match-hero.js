/* ==========================================================================
   AYO — Open Match hero motion (open-match-id/en.html)
   Floating assets from Figma "asset floating" 28584:47410. While the hero is
   in view it loops one short story. The three assets pop in close together
   (springy scale + tilt): the PadelLevels card at 0.3 s, the match result at
   0.85 s (its trend draws, +0.00 counts to +0.04), the winner banner at
   1.7 s. Meanwhile Gilberta joins Team A and Fredy joins Team B in the phone
   (snackbar) and the
   PadelLevels card steps: Activate (pressed) → 3.XX · Calibrating · 40% →
   3.4X · 54% → 3.42 · Calibrated · 75%. After a hold the assets leave one
   by one and the story starts again (8.6 s loop).
   The phone is the Mini UI card om-hero (components/mini-ui/open-match/hero.js).
   Reduced motion or no IntersectionObserver: the hero stays as drawn
   (all three assets, the card at 3.42 Calibrated).
   ========================================================================== */
(function(){
  'use strict';
  var vis = document.querySelector('[data-om-hero]');
  if(!vis || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function hf(k){ return vis.querySelector('[data-hf="'+k+'"]'); }
  function el(k){ return vis.querySelector('[data-el="'+k+'"]'); }
  var pl = hf('pl'), act = hf('act'), num = hf('pl-n'), tag = hf('pl-tag'), conf = hf('pl-c'), bar = hf('pl-bar'),
      mr = hf('mr'), won = hf('won'), up = hf('mr-up');
  var timers = [], live = false, loop = null;

  function later(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function pop(node){ node.classList.remove('is-pop'); node.offsetWidth; node.classList.add('is-pop'); }
  // One PadelLevels step: number, Calibrating/Calibrated, confidence and bar.
  function step(n, value, done, pct){
    pl.dataset.step = n;
    if(n === 1) return;
    num.textContent = value; pop(num);
    var label = done ? tag.dataset.done : tag.dataset.cal;
    if(tag.textContent !== label){ tag.textContent = label; pop(tag); }
    conf.textContent = pct+'%';
    bar.style.width = pct+'%';
  }
  // The result card's trend: the line draws itself and +0.00 counts to +0.04.
  function trend(){
    mr.classList.remove('is-draw'); mr.offsetWidth; mr.classList.add('is-draw');
    var t0 = Date.now();
    (function f(){ var k = Math.min(1, (Date.now() - t0) / 900); up.textContent = '+'+(0.04 * (1 - Math.pow(1 - k, 3))).toFixed(2); if(k < 1 && live) timers.push(setTimeout(f, 40)); })();
  }
  function reset(){
    var snack = el('snack'), req = el('req-n');
    ['pa2', 'pb2'].forEach(function(k){ var sl = el(k); if(sl) sl.classList.remove('is-filled'); });
    if(snack) snack.classList.add('is-hide');
    if(req) req.textContent = '2';
    [mr, pl, won].forEach(function(n){ n.classList.remove('is-in'); });
    mr.classList.remove('is-draw'); up.textContent = '+0.00';
    bar.style.transition = 'none'; bar.style.width = '0%'; bar.offsetWidth; bar.style.transition = '';
    tag.textContent = tag.dataset.cal;
    step(1);
  }
  function story(){
    reset();
    // The three assets pop in close together; the steps follow quickly.
    later(300, function(){ pl.classList.add('is-in'); });
    later(650, function(){
      var slot = el('pa2'), snack = el('snack'), req = el('req-n');
      if(slot) slot.classList.add('is-filled');
      if(req) req.textContent = '1';
      if(snack) snack.classList.remove('is-hide');
    });
    // Fredy joins Gabriella (Team B), so both pairs match the result card.
    later(1000, function(){ var sl = el('pb2'); if(sl) sl.classList.add('is-filled'); });
    later(850, function(){ mr.classList.add('is-in'); });
    later(1100, trend);
    later(1150, function(){ act.classList.add('is-down'); });
    later(1350, function(){ act.classList.remove('is-down'); });
    later(1500, function(){ step(2, '3.XX', false, 40); });
    later(1700, function(){ won.classList.add('is-in'); });
    later(2500, function(){ step(3, '3.4X', false, 54); });
    later(2900, function(){ var snack = el('snack'); if(snack) snack.classList.add('is-hide'); });
    later(3500, function(){ step(4, '3.42', true, 75); });
    // Hold, then leave one after another.
    later(7600, function(){ won.classList.remove('is-in'); });
    later(7750, function(){ mr.classList.remove('is-in'); });
    later(7900, function(){ pl.classList.remove('is-in'); });
  }
  function start(){ if(live) return; live = true; vis.classList.add('is-live'); story(); loop = setInterval(story, 8600); }
  function stop(){ live = false; vis.classList.remove('is-live'); clearInterval(loop); timers.forEach(clearTimeout); timers = []; }
  vis.classList.add('is-motion');
  new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? start() : stop(); }); }, {threshold:.25}).observe(vis);
})();
