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
