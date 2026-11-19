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

/* Format 05 "IDR0 +more": roll the 0 and pop the pill while the card is in
   view; rest on IDR0 +more otherwise (and with reduced motion, via CSS). */
(function(){
  'use strict';
  var card = document.querySelector('[data-free]');
  if(!card || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){ card.classList.toggle('is-play', e.isIntersecting); });
  }, {threshold:.5}).observe(card);
})();
