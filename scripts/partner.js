/* AYO — Partner (B2B) page (partner-id.html / partner-en.html)
   Brand marquee, stat count-up, What We Do tabs (desktop) / accordion
   (mobile), FAQ accordion (one open at a time), contact form (no backend:
   inline sent state) and section reveal. Reduced motion shows static frames. */
(function(){
  'use strict';
  var root = document.documentElement;
  var lang = root.lang === 'id' ? 'id' : 'en';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOTION = !reduce;
  var mqMobile = window.matchMedia('(max-width: 900px)');
  var $$ = function(sel, ctx){ return [].slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- Brand marquee ------------------------------------------------------
     The list is cloned once; the track slides left by exactly one list width
     (logos carry their gap as margin-right), so the loop has no seam.
     Speed is constant in px/s whatever the screen width. Hover pauses it. */
  var mq = document.querySelector('[data-pt-marquee]');
  if(mq){
    var track = mq.querySelector('.pt-marquee__track');
    var list = track.querySelector('.pt-marquee__list');
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    $$('img', clone).forEach(function(i){ i.alt = ''; });
    track.appendChild(clone);
    var setShift = function(){
      var w = list.getBoundingClientRect().width;
      var speed = mqMobile.matches ? 34 : 48;            // px per second
      mq.style.setProperty('--pt-mq-shift', w + 'px');
      mq.style.setProperty('--pt-mq-dur', (w / speed).toFixed(1) + 's');
    };
    setShift();
    window.addEventListener('load', setShift);
    window.addEventListener('resize', setShift);
    if(MOTION) mq.classList.add('is-running');
    else mq.style.overflowX = 'auto';
  }

  /* ---- What We Do ---------------------------------------------------------
     Desktop: vertical tablist; the grey highlight glides to the active tab and
     the panel crossfades with a staggered entrance. Mobile (≤900px): the same
     buttons act as accordion headers; one section open at a time. */
  var card = document.querySelector('[data-pt-wwd]');
  if(card){
    var items = $$('.pt-wwd__item', card);
    var tabs = items.map(function(it){ return it.querySelector('.pt-tab'); });
    var panels = items.map(function(it){ return it.querySelector('.pt-panel'); });
    var glider = card.querySelector('.pt-wwd__glider');
    var current = 0;
    panels.forEach(function(p){ $$('.pt-feat', p).forEach(function(f, i){ f.style.setProperty('--i', i); }); });

    var moveGlider = function(){
      if(!glider || mqMobile.matches) return;
      var t = tabs[current];
      glider.style.setProperty('--gy', t.offsetTop + 'px');
      glider.style.height = t.offsetHeight + 'px';
    };
    var applyDesktop = function(i, animate){
      tabs.forEach(function(t, k){
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.removeAttribute('aria-expanded');
        panels[k].classList.toggle('is-active', on);
        panels[k].classList.remove('is-open');
        panels[k].hidden = false;
        panels[k].setAttribute('aria-hidden', String(!on));
      });
      if(animate && MOTION){
        var p = panels[i];
        p.classList.remove('is-enter'); void p.offsetWidth; p.classList.add('is-enter');
      }
      moveGlider();
    };
    var applyMobile = function(open){
      tabs.forEach(function(t, k){
        var on = k === open;
        t.setAttribute('aria-expanded', String(on));
        t.removeAttribute('aria-selected');
        t.tabIndex = 0;
        panels[k].classList.toggle('is-open', on);
        panels[k].classList.remove('is-active');
        panels[k].removeAttribute('aria-hidden');
      });
    };
    var setRoles = function(){
      var mobile = mqMobile.matches;
      card.setAttribute('role', mobile ? 'presentation' : 'tablist');
      if(mobile) card.removeAttribute('aria-orientation'); else card.setAttribute('aria-orientation', 'vertical');
      tabs.forEach(function(t){ t.setAttribute('role', mobile ? 'button' : 'tab'); });
      panels.forEach(function(p){ p.setAttribute('role', mobile ? 'region' : 'tabpanel'); });
      if(mobile) applyMobile(current); else applyDesktop(current, false);
    };

    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){
        if(mqMobile.matches){
          var open = t.getAttribute('aria-expanded') !== 'true';
          current = open ? i : current;
          applyMobile(open ? i : -1);
          if(open && MOTION){
            var p = panels[i];
            p.classList.remove('is-enter'); void p.offsetWidth; p.classList.add('is-enter');
          }
        } else if(i !== current){
          current = i;
          applyDesktop(i, true);
        }
      });
      t.addEventListener('keydown', function(e){
        if(mqMobile.matches) return;
        var k = e.key, n = tabs.length, to = null;
        if(k === 'ArrowDown' || k === 'ArrowRight') to = (i + 1) % n;
        else if(k === 'ArrowUp' || k === 'ArrowLeft') to = (i - 1 + n) % n;
        else if(k === 'Home') to = 0;
        else if(k === 'End') to = n - 1;
        if(to === null) return;
        e.preventDefault();
        current = to; applyDesktop(to, true); tabs[to].focus();
      });
    });

    setRoles();
    requestAnimationFrame(function(){ card.classList.add('is-ready'); });
    (mqMobile.addEventListener ? mqMobile.addEventListener('change', setRoles) : mqMobile.addListener(setRoles));
    window.addEventListener('resize', moveGlider);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(moveGlider);
  }

  /* ---- FAQ: one question open at a time ---------------------------------- */
  var faqs = $$('.pt-faq__item');
  faqs.forEach(function(item){
    var btn = item.querySelector('.pt-faq__q');
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') !== 'true';
      faqs.forEach(function(o){
        var on = o === item && open;
        o.classList.toggle('is-open', on);
        o.querySelector('.pt-faq__q').setAttribute('aria-expanded', String(on));
      });
    });
  });

  /* ---- Contact form ------------------------------------------------------
     Floating labels: .is-filled once a field has a value. The form posts
     nowhere: on a valid submit it shows the inline sent state. */
  var form = document.querySelector('[data-pt-form]'), sent = document.querySelector('[data-pt-sent]');
  if(form){
    var fields = $$('.pt-field', form);
    var fieldEl = function(f){ return f.querySelector('.pt-field__box > input, .pt-field__box > select, .pt-field__box > textarea'); };
    var sync = function(f){
      var el = fieldEl(f);
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
      var el = fieldEl(f);
      if(el){
        el.addEventListener('invalid', function(){ f.classList.add('is-invalid'); });
        f.addEventListener('click', function(e){ if(e.target === f || e.target.classList.contains('pt-field__box')) el.focus(); });
      }
    });
    var cc = form.querySelector('.pt-cc select');
    if(cc) cc.addEventListener('change', function(){
      var o = cc.options[cc.selectedIndex];
      form.querySelector('.pt-cc__flag').textContent = o.dataset.flag;
      form.querySelector('.pt-cc__code').textContent = o.value;
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      form.hidden = true;
      sent.hidden = false;
      var h = sent.querySelector('h3'); h.tabIndex = -1; h.focus({preventScroll:true});
      var top = sent.getBoundingClientRect().top;
      if(top < 80 || top > innerHeight - 200) sent.scrollIntoView({block:'center', behavior: reduce ? 'auto' : 'smooth'});
    });
    var again = sent && sent.querySelector('[data-pt-again]');
    if(again) again.addEventListener('click', function(){
      form.reset();
      fields.forEach(sync);
      var fl = form.querySelector('.pt-cc__flag'); if(fl) fl.textContent = '🇮🇩';
      var c = form.querySelector('.pt-cc__code'); if(c) c.textContent = '+62';
      sent.hidden = true; form.hidden = false;
      var first = form.querySelector('input:not([type=hidden])'); if(first) first.focus();
    });
  }

  if(!MOTION) return;
  root.classList.add('pt-motion');

  /* ---- Stat count-up ------------------------------------------------------ */
  var nf = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US');
  $$('[data-count]').forEach(function(el){
    var end = +el.dataset.count, done = false;
    var io = new IntersectionObserver(function(es){
      if(done || !es[0].isIntersecting) return;
      done = true; io.disconnect();
      var t0 = performance.now(), dur = 1500;
      (function tick(now){
        var k = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
        el.textContent = nf.format(v);
        if(k < 1) requestAnimationFrame(tick);
      })(t0);
    }, {threshold:.6});
    io.observe(el);
  });

  /* ---- Section reveal: fade/rise once, staggered by data-reveal order ---- */
  var rv = $$('[data-reveal]');
  rv.forEach(function(el){ var d = el.dataset.reveal; if(d) el.style.setProperty('--rd', (+d * .08) + 's'); });
  var rio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); rio.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  rv.forEach(function(el){ rio.observe(el); });
})();
