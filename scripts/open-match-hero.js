/* ==========================================================================
   AYO — Open Match hero motion (open-match-id/en.html)
   Floating assets from Figma "asset floating" 28584:47410. While the hero is
   in view it loops one story, in steps:
     1. Budi's request is accepted: he fills Team A's open spot in the phone,
        the request count drops 2 → 1 and the snackbar slides in.
     2. PadelLevels is activated (the Activate button is pressed): the card
        shows 3.XX · Calibrating · 40%.
     3. A match is played: the result card (+0.04) pops in and the card steps
        to 3.4X · 54%.
     4. The win is verified: the winner banner pops in and the card lands on
        3.42 · Calibrated · 75%.
   Then the result and banner fade out and the story starts again.
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
      mr = hf('mr'), won = hf('won');
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
  function reset(){
    var slot = el('pa2'), snack = el('snack'), req = el('req-n');
    if(slot) slot.classList.remove('is-filled');
    if(snack) snack.classList.add('is-hide');
    if(req) req.textContent = '2';
    mr.classList.remove('is-in'); won.classList.remove('is-in');
    bar.style.transition = 'none'; bar.style.width = '0%'; bar.offsetWidth; bar.style.transition = '';
    tag.textContent = tag.dataset.cal;
    step(1);
  }
  function story(){
    reset();
    // 1 · Budi joins Team A.
    later(600, function(){
      var slot = el('pa2'), snack = el('snack'), req = el('req-n');
      if(slot) slot.classList.add('is-filled');
      if(req) req.textContent = '1';
      if(snack) snack.classList.remove('is-hide');
    });
    later(2600, function(){ var snack = el('snack'); if(snack) snack.classList.add('is-hide'); });
    // 2 · Activate PadelLevels.
    later(1700, function(){ act.classList.add('is-down'); });
    later(1950, function(){ act.classList.remove('is-down'); });
    later(2150, function(){ step(2, '3.XX', false, 40); });
    // 3 · A match result comes in.
    later(3500, function(){ mr.classList.add('is-in'); });
    later(4200, function(){ step(3, '3.4X', false, 54); });
    // 4 · The win is verified: calibrated.
    later(5600, function(){ won.classList.add('is-in'); });
    later(6300, function(){ step(4, '3.42', true, 75); });
    later(9400, function(){ mr.classList.remove('is-in'); won.classList.remove('is-in'); });
  }
  function start(){ if(live) return; live = true; vis.classList.add('is-live'); story(); loop = setInterval(story, 10200); }
  function stop(){ live = false; vis.classList.remove('is-live'); clearInterval(loop); timers.forEach(clearTimeout); timers = []; }
  vis.classList.add('is-motion');
  new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? start() : stop(); }); }, {threshold:.25}).observe(vis);
})();
