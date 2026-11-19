/* AYO — About Us page: the AYO story timeline (Figma 27987:8085 and the
   story states 28014:8166 / 8243 / 8320 / 8397).
   Each year button carries its milestone in data-* (title, photo, alt); the
   card shows the chosen one. Years before it turn red ("passed") and the red
   progress line runs up to it. Prev/next arrows, the year buttons, arrow keys
   on the timeline and a sideways swipe on the card all move between years.
   The card keeps one height for every year: all five texts are laid in the
   same grid cell (only the chosen one visible), so the card is as tall as
   the longest title in this language and width, the photo fills that same
   box, and the arrows never move. */
(function(){
  'use strict';
  var story = document.querySelector('[data-story]');
  if(!story) return;
  var tl = story.querySelector('.ab-tl');
  var items = [].slice.call(tl.querySelectorAll('li'));
  var buttons = items.map(function(li){ return li.querySelector('button'); });
  var card = story.querySelector('.ab-card');
  var img = card.querySelector('.ab-card__photo img');
  var prev = card.querySelector('[data-prev]');
  var next = card.querySelector('[data-next]');
  var total = buttons.length, current = 0;
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  // One text block per milestone, built from the markup's first block.
  var tpl = card.querySelector('.ab-card__text');
  var stack = document.createElement('div');
  stack.className = 'ab-card__texts';
  stack.setAttribute('aria-live', 'polite');
  tpl.parentNode.insertBefore(stack, tpl);
  var texts = buttons.map(function(b, i){
    var t = i ? tpl.cloneNode(true) : tpl;
    t.querySelector('[data-count]').textContent = pad(i + 1) + ' / ' + pad(total);
    t.querySelector('.ab-card__year').textContent = b.textContent.trim();
    t.querySelector('.ab-card__title').textContent = b.dataset.title;
    stack.appendChild(t);
    return t;
  });
  card.removeAttribute('aria-live');

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
    texts.forEach(function(t, k){
      t.classList.toggle('is-on', k === i);
      if(k === i) t.removeAttribute('aria-hidden'); else t.setAttribute('aria-hidden', 'true');
    });
    tl.style.setProperty('--p', i);
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
   drift apart, bounce off the edges of the box and knock into each other; the
   cursor pushes any pill it comes near. The first push is gentle and eased
   in. When the pointer leaves they don't go back: they coast on from
   wherever they are, slowing down (still bouncing and nudging each other)
   until they come to rest, and stay there. The next hover starts from that
   spot. On touch, a tap on the illustration starts it
   and a tap anywhere else (or on it again) lets them coast to a stop.
   Pills are treated as their tilted bounding boxes, equal mass, slightly
   bouncy; tilt stays within 35° of the design so the labels stay readable.
   Positions are in px of the current box, so the 0.586× mobile art moves the
   same way. Off with reduced motion: the pills keep their designed places. */
(function(){
  'use strict';
  var art = document.querySelector('.ab-art');
  if(!art) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var pills = [].slice.call(art.querySelectorAll('.ab-pill')).map(function(el){
    return { el: el, gx: parseFloat(el.style.getPropertyValue('--x')), gy: parseFloat(el.style.getPropertyValue('--y')), r0: parseFloat(el.style.getPropertyValue('--r')) || 0 };
  });
  var W = 0, H = 0, u = 0, playing = false, running = false, placed = false, last = 0, ptr = null;
  var BOUNCE = .86, TILT = 35, BURST = .4, burstLeft = 0;

  function measure(){
    var old = u;
    W = art.clientWidth; H = art.clientHeight; u = W / 560;
    pills.forEach(function(p){
      p.hx = p.gx * u; p.hy = p.gy * u; p.hw = p.el.offsetWidth / 2; p.hh = p.el.offsetHeight / 2;
      // A resize keeps a moved pill at the same spot relative to the art.
      if(placed && old){ var k = u / old; p.x *= k; p.y *= k; p.vx *= k; p.vy *= k; }
    });
  }
  function place(){
    pills.forEach(function(p){ p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0; p.a = p.r0; p.va = 0; });
    placed = true;
  }
  function render(){
    pills.forEach(function(p){
      p.el.style.transform = 'translate(-50%,-50%) translate(' + (p.x - p.hx).toFixed(2) + 'px,' + (p.y - p.hy).toFixed(2) + 'px) rotate(' + p.a.toFixed(2) + 'deg)';
    });
  }

  function play(){
    if(reduce.matches) return;
    measure();
    if(!placed) place();
    playing = true;
    art.classList.add('is-playing');
    // Gentle push: each pill drifts away from the middle of the box. The push
    // is eased in over BURST seconds (see tick) rather than given at once.
    pills.forEach(function(p){
      var dx = p.x - W / 2, dy = p.y - H / 2, d = Math.hypot(dx, dy) || 1;
      var sp = (160 + Math.random() * 90) * u;
      p.bx = dx / d * sp + (Math.random() - .5) * 40 * u;
      p.by = dy / d * sp + (Math.random() - .5) * 40 * u;
      p.ba = (Math.random() - .5) * 70;
    });
    burstLeft = BURST;
    if(!running){ running = true; last = 0; requestAnimationFrame(tick); }
  }
  function coast(){ playing = false; ptr = null; art.classList.remove('is-playing'); }

  function tick(t){
    var dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    var m = 6 * u, moving = playing;
    // Ease the hover push in: a share of it every frame, front-loaded and
    // tapering off (sums to the whole push over BURST seconds).
    var share = 0;
    if(burstLeft > 0){
      var t0 = 1 - burstLeft / BURST, t1 = Math.min(1, t0 + dt / BURST);
      share = (1 - Math.pow(1 - t1, 2)) - (1 - Math.pow(1 - t0, 2));
      burstLeft -= dt;
    }
    pills.forEach(function(p){
      if(share && p.bx !== undefined){ p.vx += p.bx * share; p.vy += p.by * share; p.va += p.ba * share; }
      if(playing){
        // A little drag, but keep a lazy drift so they never stop dead while hovered.
        var drag = Math.pow(.72, dt), s;
        p.vx *= drag; p.vy *= drag;
        s = Math.hypot(p.vx, p.vy);
        if(s < 60 * u){ var k = s ? 60 * u / s : 0; if(k){ p.vx *= k; p.vy *= k; } else { p.vx = 60 * u; } }
        if(ptr){
          var dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy), R = 120 * u;
          if(d < R && d > 0){ var f = (1 - d / R) * 2200 * u * dt; p.vx += dx / d * f; p.vy += dy / d * f; }
        }
        // Tilt wobbles but is pulled back towards the design's angle.
        p.va += (p.r0 - p.a) * 40 * dt; p.va *= Math.pow(.15, dt);
      } else {
        // Coasting: friction only. A fast pill takes about four seconds to stop.
        var fr = Math.pow(.35, dt);
        p.vx *= fr; p.vy *= fr; p.va *= Math.pow(.2, dt);
        if(Math.hypot(p.vx, p.vy) > 2 * u || Math.abs(p.va) > 1) moving = true;
        else { p.vx = p.vy = p.va = 0; }
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
      if(Math.abs(p.a - p.r0) > TILT){ p.a = p.r0 + (p.a > p.r0 ? TILT : -TILT); p.va *= -.4; }
      // Half-size of the tilted pill's bounding box, for walls and contacts.
      var rad = p.a * Math.PI / 180, c = Math.abs(Math.cos(rad)), sn = Math.abs(Math.sin(rad));
      p.ex = c * p.hw + sn * p.hh; p.ey = sn * p.hw + c * p.hh;
      // Edges of the box (a few px of give, as the design overhangs it).
      if(p.x - p.ex < -m){ p.x = -m + p.ex; p.vx = Math.abs(p.vx) * BOUNCE; p.va += p.vy * .03; }
      if(p.x + p.ex > W + m){ p.x = W + m - p.ex; p.vx = -Math.abs(p.vx) * BOUNCE; p.va -= p.vy * .03; }
      if(p.y - p.ey < -m){ p.y = -m + p.ey; p.vy = Math.abs(p.vy) * BOUNCE; p.va -= p.vx * .03; }
      if(p.y + p.ey > H + m){ p.y = H + m - p.ey; p.vy = -Math.abs(p.vy) * BOUNCE; p.va += p.vx * .03; }
    });
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
    render();
    // At rest the pills simply stay where they stopped (the transform remains).
    if(moving) requestAnimationFrame(tick); else running = false;
  }

  function local(e){ var r = art.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  art.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse'){ ptr = local(e); play(); } });
  art.addEventListener('pointermove', function(e){ if(playing && e.pointerType === 'mouse') ptr = local(e); });
  art.addEventListener('pointerleave', function(e){ if(e.pointerType === 'mouse') coast(); });
  art.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse'){ if(playing) coast(); else play(); } });
  document.addEventListener('pointerdown', function(e){ if(playing && e.pointerType !== 'mouse' && !art.contains(e.target)) coast(); });
  addEventListener('resize', function(){ if(placed){ measure(); if(!running) render(); } });
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
