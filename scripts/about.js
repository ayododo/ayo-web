/* AYO — About Us page: the AYO story timeline (Figma 27987:8085 and the
   story states 28014:8166 / 8243 / 8320 / 8397).
   Each year button carries its milestone in data-* (title, photo, alt); the
   card shows the chosen one. Years before it turn red ("passed") and the red
   progress line runs up to it. Prev/next arrows, the year buttons, arrow keys
   on the timeline and a sideways swipe on the card all move between years. */
(function(){
  'use strict';
  var story = document.querySelector('[data-story]');
  if(!story) return;
  var tl = story.querySelector('.ab-tl');
  var items = [].slice.call(tl.querySelectorAll('li'));
  var buttons = items.map(function(li){ return li.querySelector('button'); });
  var card = story.querySelector('.ab-card');
  var img = card.querySelector('.ab-card__photo img');
  var count = card.querySelector('[data-count]');
  var year = card.querySelector('.ab-card__year');
  var title = card.querySelector('.ab-card__title');
  var prev = card.querySelector('[data-prev]');
  var next = card.querySelector('[data-next]');
  var total = buttons.length, current = 0;
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  // Warm the cache so switching years doesn't flash an empty photo.
  buttons.forEach(function(b){ var i = new Image(); i.src = b.dataset.img; });

  function show(i, focus){
    if(i < 0 || i >= total) return;
    current = i;
    var b = buttons[i];
    items.forEach(function(li, k){
      li.classList.toggle('is-on', k === i);
      li.classList.toggle('is-past', k < i);
      if(k === i) buttons[k].setAttribute('aria-current', 'step'); else buttons[k].removeAttribute('aria-current');
    });
    tl.style.setProperty('--p', i);
    count.textContent = pad(i + 1) + ' / ' + pad(total);
    year.textContent = b.textContent.trim();
    title.textContent = b.dataset.title;
    img.src = b.dataset.img;
    img.alt = b.dataset.alt || '';
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    if(focus) b.focus();
  }

  buttons.forEach(function(b, i){
    b.addEventListener('click', function(){ show(i); });
    b.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if(d){ e.preventDefault(); show(Math.min(total - 1, Math.max(0, i + d)), true); }
    });
  });
  prev.addEventListener('click', function(){ show(current - 1); });
  next.addEventListener('click', function(){ show(current + 1); });

  // Swipe on the card (mobile frame "Timeline · swipe").
  var x0 = null, y0 = 0;
  card.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
  card.addEventListener('touchend', function(e){
    if(x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  }, {passive:true});

  show(0);
})();

/* Hero sport pills (Figma 28057:8203): hover the illustration and the pills
   burst apart, bounce off the edges of the box and knock into each other; the
   cursor pushes any pill it comes near. Leave and they spring back to their
   places and tilts from the design. On touch, a tap on the illustration
   starts it and a tap anywhere else (or on it again) settles them.
   Pills are treated as their tilted bounding boxes, equal mass, slightly
   bouncy. Positions are in px of the current box, so the 0.586× mobile art
   moves the same way. Off with reduced motion. */
(function(){
  'use strict';
  var art = document.querySelector('.ab-art');
  if(!art) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var pills = [].slice.call(art.querySelectorAll('.ab-pill')).map(function(el){
    return { el: el, gx: parseFloat(el.style.getPropertyValue('--x')), gy: parseFloat(el.style.getPropertyValue('--y')), r0: parseFloat(el.style.getPropertyValue('--r')) || 0 };
  });
  var W = 0, H = 0, u = 1, playing = false, running = false, last = 0, ptr = null;
  var BOUNCE = .86;

  function measure(){
    W = art.clientWidth; H = art.clientHeight; u = W / 560;
    pills.forEach(function(p){ p.hx = p.gx * u; p.hy = p.gy * u; p.hw = p.el.offsetWidth / 2; p.hh = p.el.offsetHeight / 2; });
  }
  function reset(){
    pills.forEach(function(p){ p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0; p.a = p.r0; p.va = 0; p.el.style.transform = ''; });
  }
  function render(){
    pills.forEach(function(p){
      p.el.style.transform = 'translate(-50%,-50%) translate(' + (p.x - p.hx).toFixed(2) + 'px,' + (p.y - p.hy).toFixed(2) + 'px) rotate(' + p.a.toFixed(2) + 'deg)';
    });
  }

  function play(){
    if(reduce.matches) return;
    if(!running){ measure(); reset(); }
    playing = true;
    art.classList.add('is-playing');
    // Burst: each pill flies away from the middle of the box.
    pills.forEach(function(p){
      var dx = p.x - W / 2, dy = p.y - H / 2, d = Math.hypot(dx, dy) || 1;
      var sp = (420 + Math.random() * 260) * u;
      p.vx += dx / d * sp + (Math.random() - .5) * 120 * u;
      p.vy += dy / d * sp + (Math.random() - .5) * 120 * u;
      p.va += (Math.random() - .5) * 260;
    });
    if(!running){ running = true; last = 0; requestAnimationFrame(tick); }
  }
  function settle(){ playing = false; ptr = null; art.classList.remove('is-playing'); }

  function tick(t){
    var dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    var m = 6 * u, done = true;
    pills.forEach(function(p){
      if(playing){
        // A little drag, but keep a lazy drift so they never stop dead.
        var drag = Math.pow(.72, dt), s;
        p.vx *= drag; p.vy *= drag;
        s = Math.hypot(p.vx, p.vy);
        if(s < 60 * u){ var k = s ? 60 * u / s : 0; if(k){ p.vx *= k; p.vy *= k; } else { p.vx = 60 * u; } }
        if(ptr){
          var dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy), R = 120 * u;
          if(d < R && d > 0){ var f = (1 - d / R) * 3200 * u * dt; p.vx += dx / d * f; p.vy += dy / d * f; }
        }
        // Tilt wobbles but is pulled back so the words stay readable.
        p.va += (p.r0 - p.a) * 40 * dt; p.va *= Math.pow(.15, dt);
      } else {
        // Spring home (slightly under-damped: a small settle at the end).
        p.vx += ((p.hx - p.x) * 120 - p.vx * 17) * dt;
        p.vy += ((p.hy - p.y) * 120 - p.vy * 17) * dt;
        p.va += ((p.r0 - p.a) * 120 - p.va * 17) * dt;
        if(Math.abs(p.x - p.hx) > .3 || Math.abs(p.y - p.hy) > .3 || Math.abs(p.a - p.r0) > .2 || Math.hypot(p.vx, p.vy) > 4) done = false;
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
      if(playing && Math.abs(p.a - p.r0) > 35){ p.a = p.r0 + (p.a > p.r0 ? 35 : -35); p.va *= -.4; }
      // Half-size of the tilted pill's bounding box, for walls and contacts.
      var rad = p.a * Math.PI / 180, c = Math.abs(Math.cos(rad)), sn = Math.abs(Math.sin(rad));
      p.ex = c * p.hw + sn * p.hh; p.ey = sn * p.hw + c * p.hh;
      if(playing){
        // Edges of the box (a few px of give, as the design overhangs it).
        if(p.x - p.ex < -m){ p.x = -m + p.ex; p.vx = Math.abs(p.vx) * BOUNCE; p.va += p.vy * .03; }
        if(p.x + p.ex > W + m){ p.x = W + m - p.ex; p.vx = -Math.abs(p.vx) * BOUNCE; p.va -= p.vy * .03; }
        if(p.y - p.ey < -m){ p.y = -m + p.ey; p.vy = Math.abs(p.vy) * BOUNCE; p.va -= p.vx * .03; }
        if(p.y + p.ey > H + m){ p.y = H + m - p.ey; p.vy = -Math.abs(p.vy) * BOUNCE; p.va += p.vx * .03; }
      }
    });
    if(playing){
      // Pill against pill: push apart along the shallower overlap and trade momentum.
      for(var i = 0; i < pills.length; i++) for(var j = i + 1; j < pills.length; j++){
        var A = pills[i], B = pills[j], dx = B.x - A.x, dy = B.y - A.y;
        var ox = A.ex + B.ex - Math.abs(dx), oy = A.ey + B.ey - Math.abs(dy);
        if(ox <= 0 || oy <= 0) continue;
        var n, rel, jv;
        if(ox < oy){
          n = dx < 0 ? -1 : 1; A.x -= n * ox / 2; B.x += n * ox / 2;
          rel = (B.vx - A.vx) * n;
          if(rel < 0){ jv = -(1 + BOUNCE) * rel / 2; A.vx -= jv * n; B.vx += jv * n; }
        } else {
          n = dy < 0 ? -1 : 1; A.y -= n * oy / 2; B.y += n * oy / 2;
          rel = (B.vy - A.vy) * n;
          if(rel < 0){ jv = -(1 + BOUNCE) * rel / 2; A.vy -= jv * n; B.vy += jv * n; }
        }
        if(rel < 0){ var spin = Math.min(90, Math.abs(rel) * .2 / u); A.va -= spin * (Math.random() < .5 ? 1 : -1); B.va += spin * (Math.random() < .5 ? 1 : -1); }
      }
      done = false;
    }
    if(done){ running = false; reset(); return; }
    render();
    requestAnimationFrame(tick);
  }

  function local(e){ var r = art.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  art.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse'){ ptr = local(e); play(); } });
  art.addEventListener('pointermove', function(e){ if(playing && e.pointerType === 'mouse') ptr = local(e); });
  art.addEventListener('pointerleave', function(e){ if(e.pointerType === 'mouse') settle(); });
  art.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse'){ if(playing) settle(); else play(); } });
  document.addEventListener('pointerdown', function(e){ if(playing && e.pointerType !== 'mouse' && !art.contains(e.target)) settle(); });
  addEventListener('resize', function(){ if(!running) measure(); });
})();

/* Moments photo strip (Figma "Photo strip · auto-scroll" 27988:8049): drifts
   sideways on its own and loops without a seam (the photos are copied once,
   hidden from assistive tech). It pauses while the pointer is over it, while
   it has focus and while a finger is on it, and only runs on screen. It stays
   a normal scroller, so it can still be swiped or scrolled by hand. Off with
   reduced motion. */
(function(){
  'use strict';
  var strip = document.querySelector('.ab-strip');
  if(!strip || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = [].slice.call(strip.children);
  items.forEach(function(el){
    var c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    [].forEach.call(c.querySelectorAll('img'), function(i){ i.alt = ''; });
    strip.appendChild(c);
  });
  strip.classList.add('is-auto');
  var SPEED = 36, loopW = 0, pos = 0, last = 0, onScreen = false, hover = false, focus = false, touchUntil = 0;
  function measure(){ loopW = strip.children[items.length].offsetLeft - strip.children[0].offsetLeft; }
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  strip.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse') hover = true; });
  strip.addEventListener('pointerleave', function(e){ if(e.pointerType === 'mouse') hover = false; });
  strip.addEventListener('focusin', function(){ focus = true; });
  strip.addEventListener('focusout', function(){ focus = false; });
  strip.addEventListener('touchstart', function(){ touchUntil = Infinity; }, {passive:true});
  strip.addEventListener('touchend', function(){ touchUntil = performance.now() + 2500; }, {passive:true});
  // Hand scrolling moves the strip on from wherever it was left; past one
  // full set it wraps back so the copy never runs out.
  strip.addEventListener('scroll', function(){
    if(Math.abs(strip.scrollLeft - pos) > 2) pos = strip.scrollLeft;
    if(loopW && strip.scrollLeft >= loopW){ pos = strip.scrollLeft - loopW; strip.scrollLeft = pos; }
  }, {passive:true});
  new IntersectionObserver(function(en){ onScreen = en[0].isIntersecting; }).observe(strip);
  function tick(t){
    var dt = last ? Math.min((t - last) / 1000, .05) : 0;
    last = t;
    if(onScreen && !hover && !focus && t > touchUntil && loopW){
      pos += SPEED * dt;
      if(pos >= loopW) pos -= loopW;
      strip.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
