/* ==========================================================================
   AYO — Open Play hero: floating feature cards (open-play-en/id.html)
   While the hero is in view: the cards drift (CSS, .is-live), the dark toast
   pops a new player joining (2/8 → 5/8, then starts over) and, in step, that
   player's avatar drops into the next dashed slot on the phone (the count
   beside the slots follows); the Privacy card flips Public ↔ Private, and the
   payment card counts paid players up.
   Reduced motion or no IntersectionObserver: the cards stay still as drawn.
   ========================================================================== */
(function(){
  'use strict';
  var vis = document.querySelector('[data-op-hero]');
  if(!vis || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function q(k){ return vis.querySelector('[data-hf="'+k+'"]'); }
  var toast = q('toast'), av = q('toast-av'), name = q('toast-name'), num = q('toast-n'),
      pub = q('pub'), prv = q('prv'), paid = q('paid'), bar = q('bar');
  // Faces match the names: p4 and p5 are women, p3 and p7 are men. Ratings
  // sit in the session's 2.50–3.50 band; Bima's is unverified (yellow 3.XX).
  var JOIN = [['p4','Rara Amelia','n','3.10'], ['p3','Bima Santoso','y','3.XX'],
              ['p5','Sinta Dewi','n','2.80'], ['p7','Arif Kurniawan','n','3.20']];
  var N = JOIN.length, step = 0, timer = null, live = false;
  var stage = vis.querySelector('.mu-stage');

  /* Phone roster: the 4 dashed slots after the host. The Mini UI may re-render
     the screen (resize), so the row is looked up fresh every time and brought
     to the wanted count; only the newest arrival animates. */
  function roster(){
    var s = stage && stage.querySelector('.op-slot');
    if(!s) return null;
    var row = s.parentNode;
    return {row:row, slots:[].slice.call(row.querySelectorAll(':scope > .op-slot')),
            joined:[].slice.call(row.querySelectorAll(':scope > .op-hj')), count:row.querySelector(':scope > b')};
  }
  function joiner(j){
    var el = document.createElement('span');
    el.className = 'mu-col op-hj';
    el.innerHTML = '<img class="op-av" style="width:24px;height:24px" src="assets/scoring/hero-faces/'+j[0]+'.webp" alt="" width="40" height="40" decoding="async">'+
      (window.AyoOP ? AyoOP.lv(j[2], j[3]) : '');
    return el;
  }
  function seat(n, animate){
    var r = roster();
    if(!r) return;
    while(r.joined.length > n){ r.row.removeChild(r.joined.pop()); }
    for(var k = 0; k < r.slots.length; k++) r.slots[k].hidden = k < n;
    for(k = r.joined.length; k < n; k++){
      var el = joiner(JOIN[k]);
      r.row.insertBefore(el, r.slots[k]);
      if(animate && k === n - 1) el.classList.add('is-new');
    }
    if(r.count){
      r.count.textContent = (1 + n) + '/8 ›';
      if(animate){ r.count.classList.remove('op-hj-bump'); void r.count.offsetWidth; r.count.classList.add('op-hj-bump'); }
    }
  }
  // Round over: the guests fade out, then the dashed slots come back at 1/8.
  function clear(){
    var r = roster();
    if(!r || !r.joined.length) return;
    r.joined.forEach(function(el){ el.classList.remove('is-new'); el.classList.add('is-out'); });
    setTimeout(function(){ seat(0, false); var c = roster(); if(c) c.slots.forEach(function(s){ s.classList.add('op-hj-back'); setTimeout(function(){ s.classList.remove('op-hj-back'); }, 500); }); }, 320);
  }

  vis.classList.add('is-motion');
  function tick(){
    var i = step % N, round = step % (2 * N);
    // Toast: hide, swap the player, pop back in.
    toast.classList.remove('is-in', 'is-pop');
    setTimeout(function(){
      av.src = 'assets/scoring/hero-faces/'+JOIN[i][0]+'.webp';
      name.textContent = JOIN[i][1];
      num.textContent = 2 + i;
      toast.classList.add('is-in', 'is-pop');
      seat(i + 1, true);                   // the avatar lands with the toast
    }, 400);
    // Last guest of the round: hold the full row, then empty it.
    if(i === N - 1) setTimeout(clear, 2500);
    // Privacy: flip every other step.
    var isPrivate = round >= N;
    pub.classList.toggle('is-on', !isPrivate);
    prv.classList.toggle('is-on', isPrivate);
    // Payment: everyone who joined has paid online (2/8 → 5/8), in step
    // with the roster.
    var n = 2 + i;
    setTimeout(function(){
      paid.textContent = n; bar.style.width = (n / 8 * 100)+'%';
      paid.classList.add('is-bump');
      setTimeout(function(){ paid.classList.remove('is-bump'); }, 300);
    }, 1100);
    step++;
  }
  function start(){ if(live) return; live = true; vis.classList.add('is-live'); tick(); timer = setInterval(tick, 3200); }
  function stop(){ live = false; step = 0; seat(0, false); vis.classList.remove('is-live'); clearInterval(timer); }
  new IntersectionObserver(function(es){
    es.forEach(function(e){ e.isIntersecting ? start() : stop(); });
  }, {threshold: .25}).observe(vis);
})();
