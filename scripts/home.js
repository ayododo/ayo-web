(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Story rail — auto-advance, click, ArrowUp/Down, and a pause control.
     The progress bar IS the timer: each slide ends on its animationend, so the
     bar can never drift out of step with the story it belongs to, and the
     pausing done in CSS needs no bookkeeping here. */
  var stTabs = [].slice.call(document.querySelectorAll('.st__tab'));
  var stStories = [].slice.call(document.querySelectorAll('.st__story'));
  var stGrid = document.querySelector('.st__grid');
  var stCur = 0;
  /* Under reduced motion the global rule collapses every animation to ~0ms, so
     an auto-advance would strobe. Those users get plain click-to-switch tabs. */
  var stAuto = !!stGrid && stTabs.length > 1 && !rm;

  function stShow(i){
    stCur = i;
    stTabs.forEach(function(t,j){
      t.setAttribute('aria-selected', i===j); t.classList.remove('ticking');
      /* Collapsed tabs are hidden but still in the document — their control has
         to leave the focus order with them, or Tab lands on nothing visible. */
      var tg = t.querySelector('.st__toggle');
      if(tg) tg.tabIndex = i===j ? 0 : -1;
    });
    stStories.forEach(function(p,j){ p.classList.toggle('is-active', i===j); });
    if(stAuto){ void stTabs[i].offsetWidth; stTabs[i].classList.add('ticking'); }  /* reflow restarts the bar */
  }

  stTabs.forEach(function(b,i){
    /* Picking a topic moves the rotation there rather than ending it. It used to
       end it, back when hovering off the section was the only way to stop —
       the pause control is the way to stop now, and it says so. */
    b.addEventListener('click', function(e){
      if(e.target.closest('.st__toggle')) return;   /* the control governs the bar, not the choice */
      stShow(i);
    });
    b.addEventListener('keydown', function(e){
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault();
        var n=(i+(e.key==='ArrowDown'?1:stTabs.length-1))%stTabs.length; stTabs[n].focus(); stTabs[n].click(); }
      /* A div carries role=tab but not a button's built-in activation, so Enter
         and Space have to be wired by hand. It is a div because the control
         inside it is a real button, and a button cannot nest in one. */
      else if((e.key==='Enter'||e.key===' ') && e.target===b){ e.preventDefault(); stShow(i); }
    });
    if(stAuto) b.addEventListener('animationend', function(e){
      if(e.animationName==='sttick' && b.classList.contains('ticking')) stShow((stCur+1)%stTabs.length);
    });
  });

  /* Pause is a real toggle, not a hover accident: it holds until pressed again.
     It is the only thing that stops the rotation, which is why picking a topic
     no longer does. */
  /* Every bar carries one, but only the open tab's is reachable. They all drive
     the same state, so whichever is on screen is the one that answers. */
  var stToggles = [].slice.call(document.querySelectorAll('.st__toggle'));
  if(stGrid && stToggles.length){
    stToggles.forEach(function(tg){
      tg.addEventListener('click', function(e){
        e.stopPropagation();                        /* do not also re-pick the tab */
        var held = stGrid.classList.toggle('is-paused');
        stToggles.forEach(function(x){
          x.setAttribute('aria-pressed', held);
          x.setAttribute('aria-label', held ? 'Resume story rotation' : 'Pause story rotation');
        });
      });
    });
  }

  if(stAuto){
    if('IntersectionObserver' in window){
      stGrid.classList.add('is-offscreen');   /* hold until the section is actually on screen */
      new IntersectionObserver(function(es){
        stGrid.classList.toggle('is-offscreen', !es[0].isIntersecting);
      },{threshold:.25}).observe(stGrid);
    }
    stShow(0);
  }

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
