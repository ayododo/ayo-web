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
    /* Dropdowns (Subject, Kategori Olahraga): the native <select> keeps the
       value, validity and reset, but its popup is replaced by a listbox card
       under the field. A transparent button over the field opens it.
       Keyboard: Enter/Space/↑/↓ open; ↑/↓, Home/End, first letter move;
       Enter/Space pick; Esc/Tab close. */
    var ddUid = 0;
    fields.forEach(function(f){
      var sel = fieldEl(f);
      if(!sel || sel.tagName !== 'SELECT') return;
      var lab = f.querySelector('.pt-field__lab');
      var name = lab ? lab.textContent.replace(/\*/g, '').trim() : '';
      var opts = [].slice.call(sel.options).filter(function(o){ return o.value !== ''; });
      var id = 'pt-dd-' + (++ddUid);
      sel.tabIndex = -1;
      sel.setAttribute('aria-hidden', 'true');
      sel.style.pointerEvents = 'none';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pt-dd__btn';
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', id);
      f.appendChild(btn);
      var list = document.createElement('ul');
      list.className = 'pt-dd__list';
      list.id = id;
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-label', name);
      list.tabIndex = -1;
      list.innerHTML = opts.map(function(o, i){ return '<li role="option" id="' + id + '-' + i + '" data-i="' + i + '">' + o.textContent + '</li>'; }).join('');
      f.appendChild(list);
      f.classList.add('pt-field--dd');
      var items = [].slice.call(list.children), active = 0;
      var cur = function(){ return opts.indexOf(sel.options[sel.selectedIndex]); };
      function label(){
        var i = cur();
        btn.setAttribute('aria-label', name + (i > -1 ? ': ' + opts[i].textContent : ''));
        items.forEach(function(li, k){ li.setAttribute('aria-selected', String(k === i)); });
      }
      function setActive(i){
        active = Math.max(0, Math.min(items.length - 1, i));
        items.forEach(function(li, k){ li.classList.toggle('is-active', k === active); });
        list.setAttribute('aria-activedescendant', items[active].id);
        var li = items[active];
        if(li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
        else if(li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
      }
      var isOpen = function(){ return f.classList.contains('is-open'); };
      function outside(e){ if(!f.contains(e.target)) close(false); }
      function open(){
        if(isOpen()) return;
        f.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        setActive(Math.max(0, cur()));
        list.focus({preventScroll:true});
        document.addEventListener('pointerdown', outside, true);
      }
      function close(refocus){
        if(!isOpen()) return;
        f.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('pointerdown', outside, true);
        if(refocus) btn.focus({preventScroll:true});
      }
      function pick(i){
        if(opts[i] !== sel.options[sel.selectedIndex]){
          sel.value = opts[i].value;
          sel.dispatchEvent(new Event('change', {bubbles:true}));
        }
        label();
        close(true);
      }
      btn.addEventListener('click', function(e){ e.stopPropagation(); isOpen() ? close(true) : open(); });
      btn.addEventListener('keydown', function(e){
        if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); open(); }
      });
      list.addEventListener('click', function(e){
        e.stopPropagation();
        var li = e.target.closest('li'); if(li) pick(+li.dataset.i);
      });
      list.addEventListener('pointermove', function(e){
        var li = e.target.closest('li'); if(li && +li.dataset.i !== active) setActive(+li.dataset.i);
      });
      list.addEventListener('keydown', function(e){
        var k = e.key;
        if(k === 'ArrowDown'){ e.preventDefault(); setActive(active + 1); }
        else if(k === 'ArrowUp'){ e.preventDefault(); setActive(active - 1); }
        else if(k === 'Home'){ e.preventDefault(); setActive(0); }
        else if(k === 'End'){ e.preventDefault(); setActive(items.length - 1); }
        else if(k === 'Enter' || k === ' '){ e.preventDefault(); pick(active); }
        else if(k === 'Escape'){ e.preventDefault(); close(true); }
        else if(k === 'Tab'){ close(false); }
        else if(k.length === 1 && /\S/.test(k)){
          var q = k.toLowerCase();
          for(var n = 1; n <= items.length; n++){
            var j = (active + n) % items.length;
            if(opts[j].textContent.toLowerCase().indexOf(q) === 0){ setActive(j); break; }
          }
        }
      });
      list.addEventListener('focusout', function(e){ if(!f.contains(e.relatedTarget)) close(false); });
      sel.addEventListener('change', label);
      sel.addEventListener('invalid', function(){ setTimeout(function(){ if(document.activeElement === sel || !form.contains(document.activeElement)) btn.focus({preventScroll:true}); }, 0); });
      form.addEventListener('reset', function(){ setTimeout(label, 0); });
      label();
    });
    /* Subject-dependent fields: [data-when="<option data-k>"] shows only for
       that subject (AVM → venue name + location, Booking → Booking ID + hint).
       Hidden fields are disabled so they skip validation and aren't sent. */
    var subject = form.querySelector('select[name="subject"]');
    var whens = $$('[data-when]', form);
    var applySubject = function(){
      var o = subject.options[subject.selectedIndex], k = o ? o.getAttribute('data-k') : '';
      whens.forEach(function(w){
        var on = w.getAttribute('data-when') === k;
        w.hidden = !on;
        $$('input, select, textarea', w).forEach(function(el){ el.disabled = !on; });
        if(!on) (w.classList.contains('pt-field') ? [w] : $$('.pt-field', w)).forEach(function(f){ f.classList.remove('is-invalid'); });
      });
    };
    if(subject && whens.length){
      subject.addEventListener('change', applySubject);
      form.addEventListener('reset', function(){ setTimeout(applySubject, 0); });
      applySubject();
    }
    // Country code: scripts/cc-picker.js draws the picker and keeps the
    // flag + code in step with the <select> (also on form.reset()).
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
