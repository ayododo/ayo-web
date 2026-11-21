/* ==========================================================================
   AYO — Open Play hero: floating feature cards (open-play-en/id.html)
   While the hero is in view: the cards drift (CSS, .is-live), the dark toast
   pops a new player joining (2/8 → 3/8 → 4/8, then starts over), the Privacy
   card flips Public ↔ Private, and the payment card counts paid players up.
   Reduced motion or no IntersectionObserver: the cards stay still as drawn.
   ========================================================================== */
(function(){
  'use strict';
  var vis = document.querySelector('[data-op-hero]');
  if(!vis || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function q(k){ return vis.querySelector('[data-hf="'+k+'"]'); }
  var toast = q('toast'), av = q('toast-av'), name = q('toast-name'), num = q('toast-n'),
      pub = q('pub'), prv = q('prv'), paid = q('paid'), bar = q('bar');
  // Faces match the names: p4 and p5 are women, p3 is a man.
  var JOIN = [['p4','Rara Amelia'], ['p3','Bima Santoso'], ['p5','Sinta Dewi']];
  var step = 0, timer = null, live = false;

  vis.classList.add('is-motion');
  function tick(){
    var i = step % 3, round = step % 6;
    // Toast: hide, swap the player, pop back in.
    toast.classList.remove('is-in', 'is-pop');
    setTimeout(function(){
      av.src = 'assets/scoring/hero-faces/'+JOIN[i][0]+'.webp';
      name.textContent = JOIN[i][1];
      num.textContent = 2 + i;
      toast.classList.add('is-in', 'is-pop');
    }, 400);
    // Privacy: flip every other step.
    var isPrivate = round >= 3;
    pub.classList.toggle('is-on', !isPrivate);
    prv.classList.toggle('is-on', isPrivate);
    // Payment: 5 → 6 → 7 paid, then back to 5.
    var n = 5 + i;
    setTimeout(function(){
      paid.textContent = n; bar.style.width = (n / 8 * 100)+'%';
      paid.classList.add('is-bump');
      setTimeout(function(){ paid.classList.remove('is-bump'); }, 300);
    }, 1100);
    step++;
  }
  function start(){ if(live) return; live = true; vis.classList.add('is-live'); tick(); timer = setInterval(tick, 3200); }
  function stop(){ live = false; vis.classList.remove('is-live'); clearInterval(timer); }
  new IntersectionObserver(function(es){
    es.forEach(function(e){ e.isIntersecting ? start() : stop(); });
  }, {threshold: .25}).observe(vis);
})();
