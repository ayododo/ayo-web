/* ==========================================================================
   Case-study rail — loops, and stays a scrollable rail while it does.
   The logo marquee moves a transform, which is smooth but cannot be dragged.
   This drives scrollLeft instead, so native scrolling, trackpad momentum, the
   scrollbar and keyboard all keep working; the loop is a wrap applied every
   frame, in both directions, so scrolling backwards past the start also
   continues rather than stopping dead.
   ========================================================================== */
(function(){
  var rail = document.querySelector('.pt-rail');
  if(!rail) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SPEED = 26;                 /* px per second — slow enough to read past */
  /* Same vocabulary as the marquee's data-mq-dir: -1 sends the cards rightwards.
     Growing scrollLeft moves the viewport right, which drags the cards left — so
     travelling right means stepping scrollLeft down. The wrap below already runs
     in both directions, and the rail parks a whole set in from the left, so there
     is room to travel backwards without hitting the browser's clamp at zero. */
  var DIR = -1;
  var originals = [].slice.call(rail.children);
  if(originals.length < 2) return;

  var unit = 0, clones = [];

  function cloneSet(){
    originals.forEach(function(el){
      var c = el.cloneNode(true);
      c.setAttribute('aria-hidden','true');     /* duplicates are decoration */
      [].slice.call(c.querySelectorAll('a,button,input')).forEach(function(f){ f.tabIndex = -1; });
      rail.appendChild(c); clones.push(c);
    });
  }

  /* Three sets, and the rail parks on the middle one. Two would be enough to
     loop forwards, but scrollLeft cannot go below zero — the browser clamps it —
     so scrolling back off the start would just stop. Sitting a whole set in from
     the left leaves room to travel backwards and be wrapped like any other move. */
  function measure(){
    clones.forEach(function(c){ c.remove(); });
    clones = [];
    cloneSet();
    /* One unit is the distance to the first clone: measured, not derived from
       scrollWidth, because the gaps between cards do not divide evenly. */
    unit = clones[0].offsetLeft - originals[0].offsetLeft;
    var guard = 0;
    while(rail.scrollWidth < rail.clientWidth + unit * 2 && guard++ < 8) cloneSet();
    rail.scrollLeft = unit;
  }
  measure();
  var rt=null;
  addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(function(){
    var into = unit ? (rail.scrollLeft - unit) : 0; measure(); rail.scrollLeft = unit + into;
  }, 150); });

  /* Runs whether or not the rail is advancing itself, so a hand-scroll off
     either end carries on instead of hitting a wall. */
  function wrap(){
    if(!unit) return;
    if(rail.scrollLeft >= unit * 2) rail.scrollLeft -= unit;
    else if(rail.scrollLeft < 1) rail.scrollLeft += unit;
  }
  rail.addEventListener('scroll', wrap, {passive:true});

  /* Held while someone is using it: hovering to read, tabbing through, or
     mid-drag. Moving the rail under any of those would be hostile. */
  var hold = false, idle = null;
  function pause(){ hold = true; clearTimeout(idle); }
  function resume(){ clearTimeout(idle); idle = setTimeout(function(){ hold = false; }, 1200); }
  if(matchMedia('(hover: hover)').matches){
    rail.addEventListener('pointerenter', pause);
    rail.addEventListener('pointerleave', resume);
  }
  rail.addEventListener('pointerdown', pause);
  addEventListener('pointerup', resume);
  rail.addEventListener('focusin', pause);
  rail.addEventListener('focusout', resume);
  rail.addEventListener('wheel', function(){ pause(); resume(); }, {passive:true});

  /* Off screen it should not be moving at all. */
  var seen = true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ seen = es[0].isIntersecting; }, {threshold:.05}).observe(rail);
  }

  var carry = 0, prev = performance.now();
  requestAnimationFrame(function tick(now){
    var dt = Math.min((now - prev)/1000, .05);   /* clamped: a background tab would jump it */
    prev = now;
    /* Wrapped every frame, not only while advancing. The scroll event covers most
       cases, but a drag holds the rail — and a drag is exactly when someone runs
       off the end and needs the wrap most. */
    wrap();
    if(!reduce && !hold && seen && unit){
      /* scrollLeft rounds to whole pixels, so sub-pixel steps are carried over
         rather than thrown away — otherwise a slow speed never moves at all. */
      carry += SPEED * dt;
      var step = Math.floor(carry);
      if(step){ carry -= step; rail.scrollLeft += DIR * step; }
    }
    requestAnimationFrame(tick);
  });
})();

(function(){
  var dlg = document.getElementById('mediakit');
  if(!dlg || !dlg.showModal) return;          /* no <dialog> support: buttons stay inert rather than half-working */
  document.querySelectorAll('[data-mediakit]').forEach(function(b){
    b.addEventListener('click', function(){ dlg.showModal(); });
  });
  dlg.querySelector('[data-close]').addEventListener('click', function(){ dlg.close('cancel'); });
  /* The form has nowhere to POST yet. Rather than pretend, it acknowledges and
     closes — swap this for a real submit once an endpoint exists. */
  document.getElementById('mediakit-form').addEventListener('submit', function(){
    var f = this;
    setTimeout(function(){ f.reset(); }, 0);
  });
})();
