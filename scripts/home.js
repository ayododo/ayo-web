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

/* CTA band — the balls arrive once the band is in view (Figma 26735:33565).
   All real physics, stepped at a fixed 240 Hz so it plays the same at any
   frame rate:
   - Tennis ball ("roll") rolls in from the left under constant rolling
     friction, hits the band's right edge with a soft squash, loses part of
     its speed and rolls back to its rest spot. Its start speed is solved
     backwards from that spot, so it always settles in the same place.
   - The other balls ("drop") fall in from above the band under gravity and
     bounce (restitution per ball: basketball springiest), drifting sideways
     a little; spin always equals distance travelled / radius. Each one waits
     until the tennis ball has rolled clear of its spot, so nothing overlaps.
   - The shuttlecock falls slowly against air drag, cork first with a small
     sway, lands on the cork and tips over onto its side.
   Phones (no balls in the mobile design) and reduced motion: no animation,
   everything just sits at rest. */
(function(){
  var band = document.querySelector('[data-ctaband]');
  var balls = band ? [].slice.call(band.querySelectorAll('[data-ball]')) : [];
  if(!balls.length || !('IntersectionObserver' in window)) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(getComputedStyle(balls[0].parentNode).display === 'none') return;

  var DEG = 180 / Math.PI;
  var G = 1700;              // gravity, px/s²
  var FRICTION = 150;        // tennis rolling friction, px/s²
  var RESTITUTION = 0.6;     // tennis vs. the wall
  var CONTACT = 0.12;        // s the tennis ball stays squashed on the wall
  var DT = 1 / 240;

  /* Shuttlecock: lowest point of the image below its centre, as a share of
     its size, for rotations -60°…40° in 5° steps (measured from the art). */
  var LOW = [.464,.4756,.4851,.4909,.4953,.496,.4943,.4898,.4824,.4726,.4597,.4433,.4236,.4067,.3867,.3638,.3381,.3099,.2818,.269,.2933];
  function low(deg){ var f = (Math.max(-60, Math.min(40, deg)) + 60) / 5, i = Math.min(19, Math.floor(f)); return LOW[i] + (LOW[i + 1] - LOW[i]) * (f - i); }

  band.setAttribute('data-balls', 'ready');   // hidden until they arrive

  function put(el, x, y, rot, sx, sy){
    el.style.setProperty('--x', x.toFixed(2) + 'px');
    el.style.setProperty('--y', y.toFixed(2) + 'px');
    el.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    el.style.setProperty('--sx', sx.toFixed(3));
    el.style.setProperty('--sy', sy.toFixed(3));
  }
  function squash(hits, t){            // sum of short sine pulses after each impact
    var k = 0;
    for(var i = 0; i < hits.length; i++){ var u = t - hits[i][0]; if(u >= 0 && u < .08) k += hits[i][1] * Math.sin(Math.PI * u / .08); }
    return Math.min(k, .2);
  }

  /* --- Tennis: closed-form roll ------------------------------------------ */
  function tennisPlan(el){
    var d = el.offsetWidth, rest = el.offsetLeft;
    var wall = Math.max(rest, band.clientWidth - d);
    var x0 = -d - 12 - rest, xw = wall - rest;
    var vBack = Math.sqrt(2 * FRICTION * xw), vHit = vBack / RESTITUTION;
    var v0 = Math.sqrt(vHit * vHit + 2 * FRICTION * (xw - x0));
    var tIn = (v0 - vHit) / FRICTION, tOut = vBack / FRICTION;
    function x(t){
      if(t < tIn) return x0 + v0 * t - FRICTION * t * t / 2;
      if(t < tIn + CONTACT) return xw;
      var u = Math.min(t - tIn - CONTACT, tOut);
      return xw - (vBack * u - FRICTION * u * u / 2);
    }
    return {
      end: tIn + CONTACT + tOut, wallAt: tIn,
      leftAt: function(t){ return rest + x(t); },
      draw: function(t){
        var sx = 1, sy = 1, xx = x(t);
        if(t >= tIn && t < tIn + CONTACT){
          var k = Math.sin(Math.PI * (t - tIn) / CONTACT);
          sx = 1 - .07 * k; sy = 1 + .035 * k; xx += d * (1 - sx) / 2;   // right side stays on the wall
        }
        put(el, xx, 0, xx / (d / 2) * DEG, sx, sy);
      }
    };
  }
  /* When is the tennis ball's left edge first past px going right (or, with
     back = true, back below px going left)? */
  function tennisPass(plan, px, back){
    for(var t = 0; t < plan.end; t += .01){
      var l = plan.leftAt(t);
      if(!back && l > px) return t;
      if(back && t > plan.wallAt && l < px) return t;
    }
    return 0;
  }

  /* --- Drop: integrate fall + bounces ------------------------------------ */
  function dropPlan(el, start){
    var d = el.offsetWidth, r = d / 2, e = parseFloat(el.dataset.e) || .6, dx = parseFloat(el.dataset.dx) || 0;
    var y = -(el.offsetTop + d + 20), v = 0, t = 0, frames = [], hits = [];
    while(t < 6){
      v += G * DT; y += v * DT; t += DT;
      if(y >= 0){
        y = 0;
        if(v < 60){ frames.push(0); break; }
        hits.push([t, Math.min(.16, v / 9000)]);
        v = -v * e;
      }
      frames.push(y);
    }
    var T = frames.length * DT;
    return {
      start: start, end: start + T,
      draw: function(now){
        var u = now - start;
        if(u < 0) return false;
        var y = frames[Math.min(frames.length - 1, Math.floor(u / DT))];
        var p = Math.min(1, u / T), x = dx * Math.pow(1 - p, 3);          // drift eases out to the rest spot
        var k = squash(hits, u), sx = 1 + k * .6, sy = 1 - k;
        put(el, x, y + d * (1 - sy) / 2, x / r * DEG, sx, sy);           // squash stays on the floor
        return true;
      }
    };
  }

  /* --- Shuttlecock: drag-limited fall, then tip over ---------------------- */
  function shuttlePlan(el, start){
    var s = el.offsetWidth, REST = 35, FALL = -35, TIP = .55;
    var restLow = low(REST) * s;
    var y = -(el.offsetTop + s + 40), v = 0, t = 0, frames = [];
    var VT = 230;                                   // terminal speed, px/s
    while(t < 8){
      v += G * (1 - (v / VT) * (v / VT)) * DT; y += v * DT; t += DT;
      // y is the cork tip relative to where it touches the floor (cork down)
      if(y >= 0){ frames.push(0); break; }
      frames.push(y);
    }
    var tLand = frames.length * DT;
    return {
      start: start, end: start + tLand + TIP + .25,
      draw: function(now){
        var u = now - start;
        if(u < 0) return false;
        var rot, yy, x;
        if(u < tLand){
          var fy = frames[Math.floor(u / DT)];
          var fade = 1 - u / tLand;
          rot = FALL + 7 * Math.sin(u * 4.2) * fade;
          x = 26 * Math.sin(u * 2.4) * fade;
          yy = fy + (restLow - low(rot) * s);       // cork tip, not the box, meets the floor
        } else {
          var w = Math.min(1, (u - tLand) / TIP);
          var ease = w * w;                         // tipping over speeds up as it falls…
          var settle = u - tLand - TIP;             // …then a small rock once it lands
          rot = FALL + (REST - FALL) * ease - (settle > 0 ? 4 * Math.exp(-settle * 9) * Math.sin(settle * 30) : 0);
          x = 0;
          yy = restLow - low(rot) * s;
        }
        put(el, x, yy, rot, 1, 1);
        return true;
      }
    };
  }

  function run(){
    var tennisEl = balls.filter(function(b){ return b.dataset.ball === 'roll'; })[0];
    var tennis = tennisEl ? tennisPlan(tennisEl) : null;
    var plans = [];
    balls.forEach(function(el){
      var kind = el.dataset.ball;
      if(kind === 'roll') return;
      var left = el.offsetLeft, right = left + el.offsetWidth, start = 0;
      if(tennis){
        var tennisRest = tennisEl.offsetLeft;
        start = right < tennisRest
          ? tennisPass(tennis, right + 10) + .05             // it has rolled past on the way in
          : Math.max(0, tennisPass(tennis, left - tennisEl.offsetWidth - 10, true) - .45);  // gone on the way back (land just after)
      }
      plans.push(kind === 'shuttle' ? shuttlePlan(el, start + .2) : dropPlan(el, start));
      plans[plans.length - 1].el = el;
    });
    balls.forEach(function(el){ el.style.visibility = 'hidden'; });
    band.removeAttribute('data-balls');
    var t0 = null;
    requestAnimationFrame(function frame(now){
      if(t0 === null) t0 = now;
      var t = (now - t0) / 1000, busy = false;
      if(tennis){ tennis.draw(Math.min(t, tennis.end)); tennisEl.style.visibility = ''; busy = t < tennis.end; }
      plans.forEach(function(p){
        if(p.draw(Math.min(t, p.end))) p.el.style.visibility = '';
        if(t < p.end) busy = true;
      });
      if(busy) requestAnimationFrame(frame);
    });
  }

  var io = new IntersectionObserver(function(es){
    if(es[0].isIntersecting){ io.disconnect(); run(); }
  }, { threshold: .4 });
  io.observe(band);
})();
