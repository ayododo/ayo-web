/* ==========================================================================
   Booking — the two phone mocks (AYO app, AVM) as Lottie.
   Each mock starts from frame 0 when it comes into view and pauses when it
   leaves, so the story (pick a slot → Book now / booking lands in AVM) is
   always seen from the beginning. The two panels are a screen apart, so each
   runs on its own clock rather than in sync.
   At rest — before the script runs, without JS, or with reduced motion — the
   card shows a poster of the finished state (frame 150).
   ========================================================================== */
/* lottie_light is loaded with defer and runs before DOMContentLoaded; this
   file is not deferred, so it must wait or `lottie` is still undefined. */
document.addEventListener('DOMContentLoaded', function(){
  var slots = [].slice.call(document.querySelectorAll('[data-booking-lottie]'));
  if(!slots.length || typeof lottie === 'undefined') return;

  var REST = 150;   /* 5s in: date, slot and booking all done */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anims = new WeakMap();

  slots.forEach(function(slot){
    var box = document.createElement('div');
    box.className = 'bk-mock__anim';
    box.setAttribute('aria-hidden', 'true');   /* the slot's aria-label speaks for it */
    slot.appendChild(box);
    var anim = lottie.loadAnimation({
      container: box, renderer: 'svg', loop: true, autoplay: false,
      path: slot.getAttribute('data-booking-lottie'),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });
    anim.addEventListener('DOMLoaded', function(){
      anim.goToAndStop(REST, true);
      slot.classList.add('is-ready');            /* poster hides once the SVG is drawn */
      if(slot.__visible && !reduce) anim.goToAndPlay(0, true);
    });
    anims.set(slot, anim);
  });

  if(reduce || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var anim = anims.get(e.target);
      var wasVisible = e.target.__visible;
      e.target.__visible = e.isIntersecting;
      if(!anim || !anim.isLoaded) return;
      if(e.isIntersecting && !wasVisible) anim.goToAndPlay(0, true);
      else if(!e.isIntersecting) anim.pause();
    });
  }, { threshold: 0.35 });
  slots.forEach(function(s){ io.observe(s); });
});
