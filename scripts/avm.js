/* AYO — AVM landing page (avm-id.html / avm-en.html).
   Key-feature tabs, FAQ accordion, contact form (no backend: inline sent
   state), stat count-up and a subtle section reveal. The Mini UI cards are
   driven by components/mini-ui; the hero by components/avm-hero. */
(function(){
  'use strict';
  var root = document.documentElement, lang = root.lang === 'id' ? 'id' : 'en';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOTION = !reduce && 'IntersectionObserver' in window;

  /* ---- Key features: ARIA tabs, keyboard, deep links ----------------------
     avm-id.html#payments (or #reports, #promotions, #add-ons, #activities,
     #additional) opens that tab. Slugs are the same on both pages, so the
     language switch (chrome.js keeps the hash) lands on the same tab. */
  var tabs = [].slice.call(document.querySelectorAll('.avm-tab'));
  function panelOf(t){ return document.getElementById(t.getAttribute('aria-controls')); }
  function select(tab, opts){
    opts = opts || {};
    tabs.forEach(function(t){
      var on = t === tab, panel = panelOf(t);
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if(on){
        if(opts.animate && !reduce){ panel.classList.remove('is-enter'); void panel.offsetWidth; panel.classList.add('is-enter'); }
        if(window.AyoMiniUI) window.AyoMiniUI.refresh(panel);
      }
    });
    // Keep the chosen chip in view inside the scrolling row (mobile).
    var row = tab.parentNode;
    if(row.scrollWidth > row.clientWidth){
      var l = tab.offsetLeft - row.offsetLeft, r = l + tab.offsetWidth;
      if(l < row.scrollLeft + 16 || r > row.scrollLeft + row.clientWidth - 16)
        row.scrollTo({left: Math.max(0, l - 16), behavior: reduce ? 'auto' : 'smooth'});
    }
    if(opts.hash && history.replaceState) history.replaceState(null, '', '#' + tab.id.replace(/^tab-/, ''));
    if(opts.focus) tab.focus();
  }
  if(tabs.length){
    var fromHash = function(){ var t = document.getElementById('tab-' + location.hash.slice(1)); return tabs.indexOf(t) >= 0 ? t : null; };
    var first = fromHash();
    if(first && first !== tabs[0]) select(first);
    addEventListener('hashchange', function(){ var t = fromHash(); if(t) select(t, {animate:true}); });
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ if(!t.classList.contains('is-on')) select(t, {animate:true, hash:true}); });
      t.addEventListener('keydown', function(e){
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, to = null;
        if(e.key === 'Home') to = tabs[0];
        else if(e.key === 'End') to = tabs[tabs.length - 1];
        else if(d) to = tabs[(i + d + tabs.length) % tabs.length];
        if(to){ e.preventDefault(); select(to, {animate:true, hash:true, focus:true}); }
      });
    });
  }

  /* ---- FAQ accordion: each question toggles on its own ------------------- */
  [].slice.call(document.querySelectorAll('.avm-faq__item')).forEach(function(item){
    var btn = item.querySelector('.avm-faq__q'), ans = item.querySelector('.avm-faq__a');
    function set(open){
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      ans.setAttribute('aria-hidden', String(!open));
      if('inert' in ans) ans.inert = !open;
    }
    set(item.classList.contains('is-open'));
    btn.addEventListener('click', function(){ set(!item.classList.contains('is-open')); });
  });

  /* ---- Contact form ------------------------------------------------------
     Floating labels: .is-filled once a field has a value. The form posts
     nowhere: on a valid submit it shows the inline sent state. */
  var form = document.querySelector('[data-avm-form]'), sent = document.querySelector('[data-avm-sent]');
  if(form){
    var fields = [].slice.call(form.querySelectorAll('.avm-field'));
    var sync = function(f){
      var el = f.querySelector('.avm-field__box > :is(input,select,textarea)');
      if(!el) return;
      var filled = el.value.trim() !== '';
      f.classList.toggle('is-filled', filled);
      if(el.tagName === 'SELECT') el.classList.toggle('is-chosen', filled);
      if(el.validity.valid) f.classList.remove('is-invalid');
    };
    fields.forEach(function(f){
      sync(f);
      f.addEventListener('input', function(){ sync(f); });
      f.addEventListener('change', function(){ sync(f); });
      var el = f.querySelector('.avm-field__box > :is(input,select,textarea)');
      if(el) el.addEventListener('invalid', function(){ f.classList.add('is-invalid'); });
    });
    // Country code: the flag follows the chosen option.
    // Country code: scripts/cc-picker.js draws the picker and keeps the
    // flag + code in step with the <select> (also on form.reset()).
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var go = function(){
        var h = sent.querySelector('h3'); h.tabIndex = -1; h.focus({preventScroll:true});
      };
      if(window.AYOFormSent) AYOFormSent.show(form, sent, go);
      else { form.hidden = true; sent.hidden = false; sent.scrollIntoView({block:'center'}); go(); }
    });
    var again = sent && sent.querySelector('[data-avm-again]');
    if(again) again.addEventListener('click', function(){
      form.reset();
      fields.forEach(sync);
      var back = function(){ var first = form.querySelector('input:not([type=hidden])'); if(first) first.focus({preventScroll:true}); };
      if(window.AYOFormSent) AYOFormSent.hide(form, sent, back);
      else { sent.hidden = true; form.hidden = false; back(); }
    });
  }

  if(!MOTION) return;

  /* ---- Stat count-up (numbers only; "xxx" placeholders stay as they are) - */
  var nf = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US');
  [].slice.call(document.querySelectorAll('[data-count]')).forEach(function(el){
    var end = +el.dataset.count, suffix = el.dataset.suffix || '', done = false;
    var io = new IntersectionObserver(function(es){
      if(done || !es[0].isIntersecting) return;
      done = true; io.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(now){
        var k = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
        el.textContent = nf.format(v) + suffix;
        if(k < 1) requestAnimationFrame(tick);
      })(t0);
    }, {threshold:.6});
    io.observe(el);
  });

  /* ---- Section reveal: fade/rise once, staggered by data-reveal order ---- */
  root.classList.add('avm-motion');
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  items.forEach(function(el){ var d = el.dataset.reveal; if(d) el.style.setProperty('--rd', (+d * .08) + 's'); });
  var rio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); rio.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.12});
  items.forEach(function(el){ rio.observe(el); });
})();
