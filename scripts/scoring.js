/* AYO — Scoring page: key-feature tabs (Figma 28109:22154 … 22474).
   Panels other than the first are hidden until chosen, so their Mini UIs are
   re-measured (AyoMiniUI.refresh) when the tab opens. */
(function(){
  'use strict';
  var tabs = [].slice.call(document.querySelectorAll('.sc-tab'));
  if(!tabs.length) return;
  function select(tab, focus){
    tabs.forEach(function(t){
      var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if(on && window.AyoMiniUI) window.AyoMiniUI.refresh(panel);
    });
    if(focus) tab.focus();
  }
  // Deep link: scoring.html#setup (or #match, #klasemen, #bagikan) opens that tab.
  var fromHash = document.getElementById('tab-' + location.hash.slice(1));
  if(fromHash && tabs.indexOf(fromHash) > 0) select(fromHash);
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ select(t); });
    t.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if(e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      else if(e.key === 'End') { e.preventDefault(); select(tabs[tabs.length-1], true); }
      else if(d){ e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
})();

/* Sports list (Figma 28109:22053): auto-scrolling row. The tiles are wrapped
   in a set and the set is copied once (hidden from assistive tech), so the
   track can slide by exactly half its width and loop without a seam. */
(function(){
  'use strict';
  var sec = document.querySelector('.sc-sports'), track = sec && sec.querySelector('.sc-sports__track');
  if(!track || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var set = document.createElement('div'); set.className = 'sc-sports__set';
  while(track.firstChild) set.appendChild(track.firstChild);
  var copy = set.cloneNode(true); copy.setAttribute('aria-hidden', 'true');
  track.appendChild(set); track.appendChild(copy);
  sec.classList.add('is-marquee');
  // Constant speed (~45px/s) whatever the number of tiles.
  sec.style.setProperty('--sc-marquee-dur', Math.round(set.scrollWidth / 45) + 's');
})();

/* Format 05 price: one currency for every market, "$", counting down from
   25,00 to 0,00 (two decimals, comma as the decimal mark). */
var FREE_PRICE = {label:'$', from:25, step:.01, nf:new Intl.NumberFormat('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2})};
function freePrice(){ return FREE_PRICE; }

/* Format 05 price card: while the card is in view, loop: the price counts down
   from $25,00 to $0,00, the six features appear one by one, then the +more
   pill pops in; hold, fade out, repeat. Out of view (or reduced motion) it
   rests on the end state in the markup. */
(function(){
  'use strict';
  var card = document.querySelector('[data-free]');
  if(!card || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var num = card.querySelector('[data-free-num]'), items = [].slice.call(card.querySelectorAll('.sc-free__item')),
      more = card.querySelector('.sc-free__more'), run = 0, raf;
  var price = freePrice(), fmt = function(n){ return price.nf.format(n); };
  function later(id, ms, fn){ setTimeout(function(){ if(id === run) fn(); }, ms); }
  function count(id, done){
    var from = price.from, step = price.step, dur = 1600, t0 = performance.now();
    (function tick(now){
      if(id !== run) return;
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      num.textContent = fmt(Math.round(from * (1 - e) / step) * step);
      if(k < 1) raf = requestAnimationFrame(tick); else { num.textContent = fmt(0); done(); }
    })(t0);
  }
  function play(id){
    price = freePrice();
    items.concat(more).forEach(function(el){ el.classList.remove('is-in'); });
    card.classList.add('is-hide');
    num.textContent = fmt(price.from);
    later(id, 500, function(){
      count(id, function(){
        // Each feature appears together with the · in front of it.
        var feats = items.filter(function(el){ return !el.classList.contains('sc-free__sep'); }), n = feats.length;
        feats.forEach(function(el, i){ later(id, 200 + i * 140, function(){
          var sep = el.previousElementSibling; if(sep && sep.classList.contains('sc-free__sep')) sep.classList.add('is-in');
          el.classList.add('is-in'); }); });
        later(id, 200 + n * 140 + 200, function(){ more.classList.add('is-in'); });
        later(id, 200 + n * 140 + 3000, function(){ items.concat(more).forEach(function(el){ el.classList.remove('is-in'); }); });
        later(id, 200 + n * 140 + 3500, function(){ play(id); });
      });
    });
  }
  function rest(){ run++; cancelAnimationFrame(raf); card.classList.remove('is-hide'); num.textContent = fmt(0); items.concat(more).forEach(function(el){ el.classList.remove('is-in'); }); }
  var inView = false;
  new IntersectionObserver(function(es){
    es.forEach(function(e){ inView = e.isIntersecting; if(inView){ rest(); play(run); } else rest(); });
  }, {threshold:.5}).observe(card);

})();
