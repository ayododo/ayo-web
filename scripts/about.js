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

  // Photo change: the new photo is laid over the old one and fades in while
  // settling from a slight zoom (106% to 100%); the old one is dropped once
  // it is covered. It waits for the image to decode, so it never fades in
  // half-loaded. Reduced motion swaps at once (CSS turns the transition off).
  var photo = img.parentNode;
  function swapPhoto(src, alt){
    var top = photo.lastElementChild;
    if(top.getAttribute('src') === src) return;
    [].forEach.call(photo.children, function(el){ el.alt = ''; el.setAttribute('aria-hidden', 'true'); });
    var n = new Image();
    n.className = 'is-in';
    n.width = img.width; n.height = img.height;
    n.src = src; n.alt = alt;
    photo.appendChild(n);
    var started = false;
    var go = function(){
      if(started) return; started = true;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ n.classList.add('is-on'); }); });
    };
    (n.decode ? n.decode() : Promise.resolve()).then(go, go);
    setTimeout(go, 500);   // never wait on a decode that stalls
    var drop = function(){
      n.classList.add('is-on');
      while(photo.firstElementChild !== n && photo.contains(n)) photo.removeChild(photo.firstElementChild);
    };
    n.addEventListener('transitionend', function(e){ if(e.propertyName === 'opacity') drop(); });
    setTimeout(drop, 1800);   // fallback when no transition runs (reduced motion, hidden tab)
  }

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
    card.classList.toggle('is-award', 'award' in b.dataset);
    swapPhoto(b.dataset.img, b.dataset.alt || '');
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

/* Hero sport pills (Figma 28057:8203), reactive: nothing happens on its own
   when the pointer enters the illustration. A pill only moves out of the way
   when the cursor comes close to it (a soft push that grows as the cursor
   gets nearer), leans a little in the direction it's moving, and springs
   back to its designed place (a small overshoot, then still) once the cursor
   moves off. Every pill always ends up back in the Figma layout. On touch,
   a finger on the illustration pushes the same way. At rest the pills float
   gently (CSS, about.css). The ball in each pill rolls with it: it turns
   as the pill slides (exaggerated, so a short push gives most of a turn),
   rolls back on the way home and hops a touch while the pill is moving
   fast. Off with reduced motion. */
(function(){
  'use strict';
  var art = document.querySelector('.ab-art');
  if(!art) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var pills = [].slice.call(art.querySelectorAll('.ab-pill')).map(function(el){
    return { el: el, gx: parseFloat(el.style.getPropertyValue('--x')), gy: parseFloat(el.style.getPropertyValue('--y')), r0: parseFloat(el.style.getPropertyValue('--r')) || 0,
             dx: 0, dy: 0, vx: 0, vy: 0, a: 0, va: 0 };
  });
  var u = 1, ptr = null, running = false, last = 0;
  var K = 70, DAMP = 12, REACH = 64, PUSH = 3200, LEAN = 10;

  function measure(){
    u = art.clientWidth / 560;
    pills.forEach(function(p){ p.hx = p.gx * u; p.hy = p.gy * u; p.hw = p.el.offsetWidth / 2; p.hh = p.el.offsetHeight / 2;
      p.ball = p.ball || p.el.querySelector('img, .ab-pill__plus'); p.br = p.ball ? p.ball.offsetWidth / 2 || 15 * u : 0; });
  }
  function render(p){
    if(!p.dx && !p.dy && !p.a){ p.el.style.transform = ''; if(p.ball) p.ball.style.transform = ''; return; }
    if(p.ball){
      // Roll: distance travelled along the pill over the ball's radius, doubled.
      var roll = (p.dx - p.dy * .5) / p.br * 114.6;
      var hop = Math.min(Math.hypot(p.vx, p.vy) / u * .012, 4) * u;
      p.ball.style.transform = 'translateY(' + (-hop).toFixed(2) + 'px) rotate(' + roll.toFixed(1) + 'deg)';
    }
    p.el.style.transform = 'translate(-50%,-50%) translate(' + p.dx.toFixed(2) + 'px,' + p.dy.toFixed(2) + 'px) rotate(' + (p.r0 + p.a).toFixed(2) + 'deg)';
  }
  function start(){ if(!running){ running = true; last = 0; requestAnimationFrame(tick); } }

  function tick(t){
    var dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    var moving = !!ptr;
    pills.forEach(function(p){
      var fx = -K * p.dx - DAMP * p.vx, fy = -K * p.dy - DAMP * p.vy;
      if(ptr){
        // Distance from the cursor to the pill's edge (not its centre), so a
        // long pill reacts along its whole length.
        var cx = p.hx + p.dx, cy = p.hy + p.dy;
        var ox = Math.max(Math.abs(ptr.x - cx) - p.hw, 0), oy = Math.max(Math.abs(ptr.y - cy) - p.hh, 0);
        var d = Math.hypot(ox, oy), R = REACH * u;
        if(d < R){
          var vx = cx - ptr.x, vy = cy - ptr.y, n = Math.hypot(vx, vy), s = 1 - d / R;
          // Cursor dead on the centre: push outwards, away from the middle of the art.
          if(n < 1){ vx = p.hx - art.clientWidth / 2; vy = p.hy - art.clientHeight / 2; n = Math.hypot(vx, vy) || 1; }
          fx += vx / n * s * s * PUSH * u; fy += vy / n * s * s * PUSH * u;
        }
      }
      p.vx += fx * dt; p.vy += fy * dt;
      p.dx += p.vx * dt; p.dy += p.vy * dt;
      // Lean into the motion a little, then settle back to the design's angle.
      var lean = Math.max(-LEAN, Math.min(LEAN, p.vx / u * .05));
      p.va += ((lean - p.a) * 90 - p.va * 14) * dt; p.a += p.va * dt;
      if(Math.abs(p.dx) + Math.abs(p.dy) > .3 || Math.hypot(p.vx, p.vy) > .5 || Math.abs(p.a) > .1) moving = true;
      else if(!ptr){ p.dx = p.dy = p.vx = p.vy = p.a = p.va = 0; }
      render(p);
    });
    if(moving) requestAnimationFrame(tick);
    else { running = false; art.classList.remove('is-playing'); }
  }

  function local(e){ var r = art.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function enter(e){ if(reduce.matches) return; measure(); ptr = local(e); art.classList.add('is-playing'); start(); }
  art.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse') enter(e); });
  art.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse') enter(e); });
  art.addEventListener('pointermove', function(e){ if(ptr) ptr = local(e); });
  ['pointerleave', 'pointerup', 'pointercancel'].forEach(function(ev){
    art.addEventListener(ev, function(e){ if(ev === 'pointerleave' || e.pointerType !== 'mouse') ptr = null; });
  });
  addEventListener('resize', function(){ if(running) measure(); });
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
