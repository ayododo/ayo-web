/* ==========================================================================
   AYO — CTA band balls (Figma 26735:33565)
   A small 2D physics simulation that plays once, when the band scrolls into
   view. Every visit is different: each ball comes in from a random side,
   height and moment, and they can knock into each other in the air and on landing.

   Physics (fixed 240 Hz steps, so it plays the same at any frame rate):
   - gravity, per-ball restitution (bounciness), rolling friction on the
     floor, quadratic air drag (strong for the shuttlecock, a little for the
     holed pickleball), mass-weighted ball-to-ball collisions — a basketball
     shrugs off a tennis ball, a tennis ball flies off a basketball;
   - spin: rolling on the floor = speed / radius; in the air a ball keeps the
     spin it left the floor or a collision with;
   - a short squash on every hard hit, along the hit direction;
   - the shuttlecock flies cork-first along its path (it turns into the
     wind): launched from the left on a rising diagonal, drag kills its
     speed, it floats down (extra vertical drag), lands on the cork, slides
     a little and tips over onto its side.
   Depth: balls collide while they fly in and bounce; once both are rolling
   to their spots they no longer do — the court has depth, so one rolls past
   in front of the other (smaller balls nearer the viewer). The shuttlecock
   flies in front of everything.
   Landing spot: once a ball has landed it rolls on to its design position
   (a damped pull that fades in as friction fades out), so the band always
   ends exactly like the design. The tennis ball first rolls in from the
   left and hits the right edge, as before.
   Phones (no balls in the mobile design) and reduced motion: no animation;
   the balls just sit at rest, as they do with JS off.
   ========================================================================== */
(function(){
  var band = document.querySelector('[data-ctaband]');
  var els = band ? [].slice.call(band.querySelectorAll('[data-ball]')) : [];
  if(!els.length || !('IntersectionObserver' in window)) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(getComputedStyle(els[0].parentNode).display === 'none') return;

  var G = 1700;            // gravity, px/s²
  var DT = 1 / 240;        // physics step
  var PULL_K = 7;          // pull towards the design spot (spring, 1/s²)…
  var PULL_C = 5.2;        // …and its damping (1/s)
  var PULL_IN = 1;         // s for the pull to fade in after landing
  var MAX_T = 9;           // s — after this, ease whatever is left into place
  var SQUASH_T = .07;      // s per squash pulse
  var DEG = 180 / Math.PI;
  var SHUTTLE_REST = 35;   // deg, as in the design
  var SHUTTLE_KV = 5;      // extra vertical drag (1/s): the shuttle floats down slowly

  /* Shuttlecock: lowest point of the image below its centre, as a share of
     its size, for rotations -60°…40° in 5° steps (measured from the art). */
  var LOW = [.464,.4756,.4851,.4909,.4953,.496,.4943,.4898,.4824,.4726,.4597,.4433,.4236,.4067,.3867,.3638,.3381,.3099,.2818,.269,.2933];
  function low(deg){ var f = (Math.max(-60, Math.min(40, deg)) + 60) / 5, i = Math.min(19, Math.floor(f)); return LOW[i] + (LOW[i + 1] - LOW[i]) * (f - i); }
  function rnd(a, b){ return a + (b - a) * Math.random(); }
  function wrapDeg(a){ while(a > 180) a -= 360; while(a < -180) a += 360; return a; }

  band.setAttribute('data-balls', 'ready');   // hidden until they arrive

  function run(){
    var W = band.clientWidth, H = band.clientHeight;
    var B = els.map(function(el){
      var d = el.offsetWidth, kind = el.dataset.ball;
      return {
        el: el, kind: kind, d: d, shuttle: kind === 'shuttle',
        r: kind === 'shuttle' ? d * .22 : d / 2,           // shuttle collides with its cork end
        m: +el.dataset.m || 100, e: +el.dataset.e || .6, mu: +(el.dataset.mu || 150), cd: +(el.dataset.cd || 0),
        hx: el.offsetLeft + d / 2, hy: el.offsetTop + d / 2, // design spot (box centre)
        x: 0, y: 0, vx: 0, vy: 0, ang: 0, w: 0, rot: 0,
        live: false, landed: -1, tip: -1, tipFrom: 0, hitWall: false, inL: true, inR: true, hits: [], done: false
      };
    });
    // Depth: smaller balls sit nearer the viewer; the shuttlecock in front.
    B.slice().sort(function(a, b){ return b.d - a.d; }).forEach(function(b, i){ b.el.style.zIndex = b.shuttle ? 20 : 1 + i; });
    var minX = Math.min.apply(null, B.map(function(b){ return b.hx - b.d / 2; }).concat(0));
    var maxX = Math.max.apply(null, B.map(function(b){ return b.hx + b.d / 2; }).concat(W));
    function floorY(b){ return b.shuttle ? H - low(b.rot) * b.d : H - b.r; }

    /* ---- Entrances (random every visit) ------------------------------- */
    var order = B.filter(function(b){ return !b.shuttle && b.kind !== 'tennis'; }).sort(function(){ return Math.random() - .5; });
    order.forEach(function(b, i){
      b.start = .15 + i * rnd(.22, .38) + rnd(0, .15);
      var fromSide = Math.random() < .45;
      var side = b.hx < W / 2 ? -1 : 1;
      if(fromSide){                                   // thrown in from the nearer side, on an arc
        b.x0 = side < 0 ? minX - b.r - 4 : maxX + b.r + 4;
        b.y0 = rnd(H * .1, H * .5);
        b.vy0 = rnd(-650, -250);
        if(side < 0) b.inL = false; else b.inR = false;
      } else {                                         // dropped in from above, with some sideways speed
        b.x0 = Math.max(minX + b.r, Math.min(maxX - b.r, b.hx + rnd(-200, 200)));
        b.y0 = -b.r - rnd(10, 180);
        b.vy0 = rnd(-80, 120);
      }
      var fall = H - b.r - b.y0, tf = (b.vy0 + Math.sqrt(b.vy0 * b.vy0 + 2 * G * fall)) / G;
      b.vx0 = (b.hx + rnd(-60, 60) - b.x0) / tf;
      b.w0 = rnd(-6, 6);
    });
    B.forEach(function(b){
      if(b.kind === 'tennis'){                         // rolls in along the floor from the left
        b.start = 0; b.x0 = minX - b.r - 6; b.y0 = H - b.r; b.vx0 = rnd(950, 1100); b.vy0 = 0; b.w0 = 0; b.inL = false;
      }
      if(b.shuttle) aimShuttle(b);
    });

    /* Shuttlecock: from the upper left, heading diagonally down. Find the
       launch speed that lands it on its spot, given the drag. */
    function aimShuttle(b){
      b.start = rnd(.8, 1.4);
      b.x0 = minX - b.d; b.y0 = rnd(H * .25, H * .45); b.inL = false;
      var a = -rnd(10, 22) / DEG, target = b.hx - rnd(20, 50);   // lands a touch short, slides the rest
      function landX(speed){
        var x = b.x0, y = b.y0, vx = Math.cos(a) * speed, vy = Math.sin(a) * speed;
        for(var i = 0; i < 4000; i++){
          var sp = Math.sqrt(vx * vx + vy * vy);
          vx -= b.cd * sp * vx * DT; vy += (G - b.cd * sp * vy - SHUTTLE_KV * vy) * DT;
          x += vx * DT; y += vy * DT;
          if(vy > 0 && y > H - low(-35) * b.d) return x;
        }
        return x;
      }
      var lo = 300, hi = 8000;
      for(var k = 0; k < 32; k++){ var mid = (lo + hi) / 2; if(landX(mid) < target) lo = mid; else hi = mid; }
      b.vx0 = Math.cos(a) * lo; b.vy0 = Math.sin(a) * lo; b.w0 = 0;
    }

    function hit(b, t, k, nx, ny){ if(k > .01) b.hits.push([t, Math.min(k, .2), nx, ny]); }

    /* ---- One physics step --------------------------------------------- */
    function step(t){
      B.forEach(function(b){
        if(!b.live && t >= b.start){
          b.live = true; b.x = b.x0; b.y = b.y0; b.vx = b.vx0; b.vy = b.vy0; b.w = b.w0;
          if(b.shuttle) b.rot = Math.atan2(b.vy, b.vx) * DEG - 135;
        }
      });
      var live = B.filter(function(b){ return b.live && !b.done; });

      live.forEach(function(b){
        var fy = floorY(b), onFloor = b.y >= fy - .5 && Math.abs(b.vy) < 30;
        var pull = b.pull = b.landed < 0 || (b.kind === 'tennis' && !b.hitWall && t < 4) ? 0 : Math.min(1, (t - Math.max(b.landed, b.kind === 'tennis' && !b.hitWall ? 4 : 0)) / PULL_IN);

        if(b.shuttle && b.tip >= 0){                  // tipping over on the floor
          var u = (t - b.tip) / .55, from = b.tipFrom;
          if(u < 1){ b.rot = from + (SHUTTLE_REST - from) * u * u; }
          else { var s = (u - 1) * .55; b.rot = SHUTTLE_REST - 4 * Math.exp(-s * 9) * Math.sin(s * 30); }
          b.vx += (PULL_K * (b.hx - b.x) - PULL_C * 2 * b.vx) * DT;
          b.x += b.vx * DT; b.y = floorY(b);
          if(u > 2.2 && Math.abs(b.x - b.hx) < 1 && Math.abs(b.vx) < 4) b.done = true;
          return;
        }

        // gravity + air drag
        var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.vx -= b.cd * sp * b.vx * DT;
        b.vy += (G - b.cd * sp * b.vy - (b.shuttle ? SHUTTLE_KV * b.vy : 0)) * DT;
        // on the floor: rolling friction (fading out) + the pull to the design spot (fading in)
        if(onFloor && !b.shuttle){
          var f = b.mu * (1 - pull) * DT;
          b.vx = Math.abs(b.vx) <= f ? 0 : b.vx - Math.sign(b.vx) * f;
          b.vx += pull * (PULL_K * (b.hx - b.x) - PULL_C * b.vx) * DT;
        }
        b.x += b.vx * DT; b.y += b.vy * DT;

        // spin
        if(b.shuttle){                                 // cork turns into the direction of travel
          var want = Math.atan2(b.vy, b.vx) * DEG - 135;
          b.rot += wrapDeg(want - b.rot) * Math.min(1, DT * 9);
        } else if(onFloor){ b.w = b.vx / b.r; b.ang += b.w * DT; }
        else b.ang += b.w * DT;

        // floor
        fy = floorY(b);
        if(b.y > fy){
          b.y = fy;
          if(b.shuttle){
            b.vy = 0; b.vx *= .25; b.tip = t; b.tipFrom = b.rot; if(b.landed < 0) b.landed = t;
          } else if(b.vy > 0){
            if(b.vy > 130){ hit(b, t, b.vy / 6500, 0, 1); b.vy = -b.vy * b.e; b.w = b.vx / b.r; }   // below this it just settles
            else b.vy = 0;
            if(b.landed < 0) b.landed = t;
          }
        }
        // walls (only once the ball has come in through that side)
        if(b.x - b.r > minX) b.inL = true;
        if(b.x + b.r < maxX) b.inR = true;
        if(b.inR && b.x + b.r > maxX && b.vx > 0){
          b.x = maxX - b.r; hit(b, t, b.vx / 6500, 1, 0); b.vx = -b.vx * b.e; b.w = -b.w * .5;
          if(b.kind === 'tennis') b.hitWall = true;
        }
        if(b.inL && b.x - b.r < minX && b.vx < 0){
          b.x = minX + b.r; hit(b, t, -b.vx / 6500, -1, 0); b.vx = -b.vx * b.e; b.w = -b.w * .5;
        }
        if(!b.shuttle && pull === 1 && onFloor && Math.abs(b.x - b.hx) < .8 && Math.abs(b.vx) < 3 && t > 3) b.done = true;
      });

      // ball-to-ball collisions (mass-weighted impulse + position fix)
      for(var i = 0; i < live.length; i++){
        for(var j = i + 1; j < live.length; j++){
          var a = live[i], c = live[j];
          // The shuttlecock flies in front of the balls (it is the lightest
          // thing on court and would only be swatted away). Balls stop
          // colliding once both are rolling to their spots: the floor has
          // depth, so one can roll past in front of the other.
          if(a.shuttle || c.shuttle || ((a.pull || 0) > .15 && (c.pull || 0) > .15)) continue;
          var dx = c.x - a.x, dy = c.y - a.y, dist = Math.sqrt(dx * dx + dy * dy), min = a.r + c.r;
          if(dist >= min || dist === 0) continue;
          var nx = dx / dist, ny = dy / dist, ia = 1 / a.m, ic = 1 / c.m, over = min - dist;
          a.x -= nx * over * ia / (ia + ic); a.y -= ny * over * ia / (ia + ic);
          c.x += nx * over * ic / (ia + ic); c.y += ny * over * ic / (ia + ic);
          var vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if(vn >= 0) continue;
          var e = Math.min(a.e, c.e), jn = -(1 + e) * vn / (ia + ic);
          a.vx -= jn * ia * nx; a.vy -= jn * ia * ny;
          c.vx += jn * ic * nx; c.vy += jn * ic * ny;
          var vt = (c.vx - a.vx) * -ny + (c.vy - a.vy) * nx;   // glancing hits add spin
          a.w -= vt / a.r * .25; c.w += vt / c.r * .25;
          hit(a, t, jn * ia / 5000, -nx, -ny); hit(c, t, jn * ic / 5000, nx, ny);
          if(a.landed >= 0 && a.y < floorY(a) - 2) a.landed = t;   // knocked up: land again first
          if(c.landed >= 0 && c.y < floorY(c) - 2) c.landed = t;
        }
      }
    }

    /* ---- Drawing ------------------------------------------------------ */
    function draw(t, blend){
      B.forEach(function(b){
        if(!b.live){ b.el.style.visibility = 'hidden'; return; }
        b.el.style.visibility = '';
        var k = 0, nx = 0, ny = 0;
        b.hits = b.hits.filter(function(h){ return t - h[0] < SQUASH_T; });
        b.hits.forEach(function(h){ var s = h[1] * Math.sin(Math.PI * (t - h[0]) / SQUASH_T); if(s > k){ k = s; nx = h[2]; ny = h[3]; } });
        var sx = 1 - k * Math.abs(nx) + k * .5 * Math.abs(ny), sy = 1 - k * Math.abs(ny) + k * .5 * Math.abs(nx);
        var ox = b.x - b.hx + b.d / 2 * (1 - sx) * nx, oy = b.y - b.hy + b.d / 2 * (1 - sy) * ny;   // squash keeps its contact side
        var rot = b.shuttle ? b.rot : b.ang * DEG;
        var rest = b.shuttle ? SHUTTLE_REST : rot;   // a ball may stop at any turn
        if(blend !== undefined){ ox *= 1 - blend; oy *= 1 - blend; rot += (rest - rot) * blend; sx = sy = 1; }
        var s = b.el.style;
        s.setProperty('--x', ox.toFixed(2) + 'px');
        s.setProperty('--y', oy.toFixed(2) + 'px');
        s.setProperty('--rot', rot.toFixed(2) + 'deg');
        s.setProperty('--sx', sx.toFixed(3));
        s.setProperty('--sy', sy.toFixed(3));
      });
    }

    band.removeAttribute('data-balls');
    draw(0);
    var last = null, t = 0, acc = 0;
    requestAnimationFrame(function frame(now){
      if(last === null) last = now;
      acc += Math.min(.1, (now - last) / 1000); last = now;
      while(acc >= DT){ step(t); t += DT; acc -= DT; }
      if(t < MAX_T && !B.every(function(b){ return b.done; })){ draw(t); requestAnimationFrame(frame); return; }
      // Done, or out of time: ease anything left into its exact design spot.
      var t1 = t, from = null;
      requestAnimationFrame(function settle(n){
        if(from === null) from = n;
        var u = Math.min(1, (n - from) / 500), ease = 1 - Math.pow(1 - u, 3);
        draw(t1, ease);
        if(u < 1) requestAnimationFrame(settle);
      });
    });
  }

  var io = new IntersectionObserver(function(es){
    if(es[0].isIntersecting){ io.disconnect(); run(); }
  }, { threshold: .4 });
  io.observe(band);
})();
