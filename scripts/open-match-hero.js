/* ==========================================================================
   AYO — Open Match hero motion (open-match-id/en.html)
   While the hero is in view it loops one short story, in steps:
     1. Budi's request is accepted: he fills Team A's open spot, the request
        count drops 2 → 1 and the "Players updated." snackbar slides in.
     2. The match is played: the floating PadelLevels card steps Bayu's rating
        3.34 → 3.41 (▲ 0.07 appears, the trend line's new point draws, the
        stats move on: before 3.27 → 3.34, matches 11 → 12, wins 7 → 8), and
        Bayu's chip in the phone updates to 3.41.
     3. A pause, then everything steps back and the story starts again.
   The phone is the Mini UI card om-hero (components/mini-ui/open-match/hero.js).
   Reduced motion or no IntersectionObserver: the hero stays as drawn.
   ========================================================================== */
(function(){
  'use strict';
  var vis = document.querySelector('[data-om-hero]');
  if(!vis || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function hf(k){ return vis.querySelector('[data-hf="'+k+'"]'); }
  function el(k){ return vis.querySelector('[data-el="'+k+'"]'); }
  var card = hf('lv'), num = hf('n'), prev = hf('prev'), mt = hf('m'), wins = hf('w');
  var timers = [], live = false, loop = null;

  function later(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function bump(node, text){ node.textContent = text; node.classList.add('is-bump'); later(300, function(){ node.classList.remove('is-bump'); }); }
  function count(node, from, to, ms){
    var t0 = Date.now();
    (function f(){ var k = Math.min(1, (Date.now() - t0) / ms); node.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2); if(k < 1 && live) timers.push(setTimeout(f, 30)); })();
  }
  function rate(k){ var b = el(k); return b && b.querySelector('b'); }

  // Step 0: the state before the story (no snackbar, open spot, 3.34).
  function reset(){
    var slot = el('pa2'), snack = el('snack'), req = el('req-n'), r = rate('pa1-rate');
    if(slot) slot.classList.remove('is-filled');
    if(snack) snack.classList.add('is-hide');
    if(req) req.textContent = '2';
    if(r) r.textContent = '3.34';
    card.classList.add('is-before');
    num.textContent = '3.34'; prev.textContent = '3.27'; mt.textContent = '11'; wins.textContent = '7';
  }
  function story(){
    reset();
    // 1 · Budi joins Team A.
    later(700, function(){
      var slot = el('pa2'), snack = el('snack'), req = el('req-n');
      if(slot) slot.classList.add('is-filled');
      if(req) bump(req, '1');
      if(snack) snack.classList.remove('is-hide');
    });
    later(2900, function(){ var snack = el('snack'); if(snack) snack.classList.add('is-hide'); });
    // 2 · After the match: the PadelLevels card steps up.
    later(3300, function(){ card.classList.remove('is-before'); count(num, 3.34, 3.41, 1100); });
    later(3700, function(){ bump(prev, '3.34'); });
    later(3950, function(){ bump(mt, '12'); });
    later(4200, function(){ bump(wins, '8'); });
    later(4500, function(){ var b = el('pa1-rate'), r = rate('pa1-rate'); if(r) r.textContent = '3.41'; if(b){ b.classList.remove('is-pop'); b.offsetWidth; b.classList.add('is-pop'); } });
  }
  function start(){
    if(live) return; live = true; vis.classList.add('is-live');
    story(); loop = setInterval(story, 8200);
  }
  function stop(){
    live = false; vis.classList.remove('is-live'); clearInterval(loop);
    timers.forEach(clearTimeout); timers = [];
  }
  vis.classList.add('is-motion');
  new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? start() : stop(); }); }, {threshold:.25}).observe(vis);
})();
