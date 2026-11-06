(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Partnership panels — one panel open at a time. Desktop: the open panel
     widens; phone: the panels are an accordion. Clicking (or, with a mouse,
     hovering) a panel opens it. The progress bar IS the timer: the rotation
     moves on at its animationend, so it can never drift from what is shown.
     Hovering the row or the section being off screen pauses it (CSS). */
  var row = document.querySelector('[data-ptn]');
  if(!row) return;
  var panels = [].slice.call(row.querySelectorAll('.ptn__panel'));
  var cur = Math.max(0, panels.findIndex(function(p){ return p.classList.contains('is-active'); }));
  /* Reduced motion collapses every animation to ~0ms, so an auto-advance
     would strobe; those users get click-to-open panels with no timer. */
  var auto = panels.length > 1 && !rm;
  row.classList.toggle('is-static', !auto);
  var hoverOpens = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');

  function show(i){
    cur = i;
    panels.forEach(function(p,j){
      p.classList.toggle('is-active', i===j);
      p.classList.remove('ticking');
      p.querySelector('.ptn__trigger').setAttribute('aria-expanded', i===j);
    });
    if(auto){ void panels[i].offsetWidth; panels[i].classList.add('ticking'); }  /* reflow restarts the bar */
  }

  panels.forEach(function(p,i){
    p.querySelector('.ptn__trigger').addEventListener('click', function(){ if(i!==cur) show(i); });
    p.addEventListener('mouseenter', function(){ if(hoverOpens.matches && i!==cur) show(i); });
    if(auto) p.addEventListener('animationend', function(e){
      if(e.animationName==='ptntick' && p.classList.contains('ticking')) show((cur+1)%panels.length);
    });
  });

  if(auto && 'IntersectionObserver' in window){
    row.classList.add('is-offscreen');   /* hold until the panels are actually on screen */
    new IntersectionObserver(function(es){
      row.classList.toggle('is-offscreen', !es[0].isIntersecting);
    },{threshold:.35}).observe(row);
  }
  show(cur);
})();

/* stat-band count-up — fires only when the band scrolls into view.
   (The band sits at the foot of the full-height persona hero, so on load it is
   still below the fold; kept in its own IIFE so an error elsewhere can never
   stop it from running.) */
(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var band = document.querySelector('.ph-stats');
  if(!band) return;
  var nums = [].slice.call(band.querySelectorAll('.ph-stat-num[data-to]'));
  if(!nums.length) return;
  function fmt(n){ return n.toLocaleString('en-US'); }
  function paint(el,n){ el.textContent = fmt(n) + (el.dataset.suffix || ''); }
  function run(el){
    var to = +el.dataset.to, dur = 1600, st = null;
    requestAnimationFrame(function step(t){
      if(!st) st = t;
      var p = Math.min((t - st) / dur, 1);
      paint(el, Math.round(to * (1 - Math.pow(1 - p, 3))));   // ease-out cubic
      if(p < 1) requestAnimationFrame(step);
    });
  }
  nums.forEach(function(el){ paint(el, 0); });                  // start at zero
  if(rm || !('IntersectionObserver' in window)){ nums.forEach(function(el){ paint(el, +el.dataset.to); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ nums.forEach(run); io.disconnect(); }  // animate all together, once
    });
  }, { threshold: 0.35 });
  io.observe(band);
})();

/* Booking mock-ups — Lottie motion (assets/lottie/booking-*.json, 420×420).
   The markup phone inside each .bkg__mock is the static fallback: it stays
   for no-JS, reduced motion, or a failed fetch, and is only swapped out once
   the animation has actually rendered its first frame. Each one mounts when it
   nears the viewport and pauses when it leaves, so two SVG renderers are not
   running for art nobody can see. */
document.addEventListener('DOMContentLoaded', function(){
  var mocks = [].slice.call(document.querySelectorAll('.bkg__mock[data-lottie]'));
  if(!mocks.length || typeof lottie === 'undefined' || !('IntersectionObserver' in window)) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var anims = new WeakMap();
  function mount(mock){
    if(mock.dataset.lottieState) { var a = anims.get(mock); if(a) a.play(); return; }
    mock.dataset.lottieState = 'loading';
    fetch(mock.dataset.lottie)
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(data){
        var box = document.createElement('div');
        box.className = 'bkg__lottie';
        mock.appendChild(box);
        var anim = lottie.loadAnimation({ container: box, renderer: 'svg', loop: true, autoplay: true, animationData: data });
        anim.addEventListener('DOMLoaded', function(){ mock.classList.add('is-lottie'); mock.dataset.lottieState = 'ready'; });
        anims.set(mock, anim);
      })
      .catch(function(){ mock.dataset.lottieState = 'failed'; });   /* markup mock stays */
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) mount(e.target);
      else { var a = anims.get(e.target); if(a) a.pause(); }
    });
  }, { rootMargin: '200px 0px' });
  mocks.forEach(function(m){ io.observe(m); });
});

/* Booking › "Join in 4 steps" — plays once when the steps scroll into view:
   each number lights up in turn and the line runs on to the next step. Without
   JS, IntersectionObserver or with reduced motion, the static Figma state
   (step 1 current) stays as it is. */
(function(){
  var steps = document.querySelector('.bkg__steps');
  if(!steps || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].forEach.call(steps.querySelectorAll('.bkg__step'), function(s, i){ s.style.setProperty('--i', i); });
  steps.classList.add('is-anim');
  var io = new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting) return;
    steps.classList.add('is-play');
    io.disconnect();
  }, { threshold: .5 });
  io.observe(steps);
})();
