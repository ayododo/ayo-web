/* ==========================================================================
   Feature art — loading animation in the placeholder boxes.
   Nineteen boxes across six tab panels, one panel shown at a time. Mounting
   all nineteen would run nineteen 60fps SVG renderers for art nobody can see,
   so each one waits until it is actually on screen and pauses when it leaves.
   Hidden panels are display:none, so the observer never reports them at all.
   ========================================================================== */
/* Deferred scripts run after parsing but before DOMContentLoaded, and this one
   is inline — so it must wait, or `lottie` is still undefined when it runs. */
document.addEventListener('DOMContentLoaded', function(){
  var slots = [].slice.call(document.querySelectorAll('.avm-row-art > span'));
  if(!slots.length || typeof lottie === 'undefined' || !('IntersectionObserver' in window)) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raw = null, waiting = [];

  /* One fetch feeds every box. Each instance gets its own parse rather than a
     shared object — lottie-web writes into the data it is handed. */
  function withData(cb){
    if(raw) return cb(JSON.parse(raw));
    waiting.push(cb);
    if(waiting.length > 1) return;
    fetch('assets/avm-loading.json')
      .then(function(r){ if(!r.ok) throw 0; return r.text(); })
      .then(function(t){ raw = t; waiting.splice(0).forEach(function(f){ f(JSON.parse(raw)); }); })
      .catch(function(){ waiting.length = 0; });   /* box tetap jadi placeholder berlabel */
  }

  var anims = new WeakMap();
  function mount(slot){
    if(slot.dataset.lottie) { var a = anims.get(slot); if(a && !reduce) a.play(); return; }
    slot.dataset.lottie = '1';
    var box = document.createElement('div');
    box.className = 'avm-lottie';
    box.setAttribute('aria-hidden', 'true');   /* dekorasi; labelnya yang bicara */
    slot.insertBefore(box, slot.firstChild);
    withData(function(data){
      anims.set(slot, lottie.loadAnimation({
        container: box, renderer: 'svg', loop: true, autoplay: !reduce, animationData: data
      }));
    });
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) mount(e.target);
      else { var a = anims.get(e.target); if(a) a.pause(); }
    });
  }, { rootMargin: '200px 0px' });
  slots.forEach(function(s){ io.observe(s); });
});
