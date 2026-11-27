/* AYO — contact form success swap (styles/form-sent.css), shared by the
   Partner (B2B) and AVM pages. AYOFormSent.show(form, sent, done) fades the
   form out, glides the panel to its new height, centres it in the viewport and plays the success card
   (pop + drawn check); AYOFormSent.hide(form, sent, done) brings the form
   back. Reduced motion swaps instantly. */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var LEAVE = 240, GLIDE = 460, busy = false;

  /* Bring the whole contact panel to the middle of the viewport (below the
     fixed nav) so the result is visible without scrolling. h is the panel's
     final height, since it is still gliding when this runs. */
  function center(box, h, instant){
    var nav = document.querySelector('.ayo-nav');
    var navH = nav ? nav.getBoundingClientRect().height : 0;
    var room = window.innerHeight - navH;
    var top = box.getBoundingClientRect().top + window.pageYOffset;
    var y = h < room - 32 ? top - navH - (room - h) / 2 : top - navH - 16;
    window.scrollTo({top: Math.max(0, Math.round(y)), behavior: instant ? 'auto' : 'smooth'});
  }

  function swap(from, to, enterClass, done, centre){
    if(busy) return;
    var box = from.parentElement;
    if(reduce.matches){
      from.hidden = true; to.hidden = false;
      if(centre) center(box, box.getBoundingClientRect().height, true);
      if(done) done();
      return;
    }
    busy = true;
    from.classList.add('fs-leave');
    setTimeout(function(){
      var h0 = box.getBoundingClientRect().height;
      from.hidden = true; from.classList.remove('fs-leave');
      to.classList.remove('fs-play', 'fs-return');
      to.hidden = false;
      var h1 = box.getBoundingClientRect().height;
      void to.offsetWidth;
      to.classList.add(enterClass);
      if(Math.abs(h1 - h0) > 1){
        box.style.boxSizing = 'border-box';
        box.style.overflow = 'hidden';
        box.style.height = h0 + 'px';
        void box.offsetHeight;
        box.style.transition = 'height ' + GLIDE + 'ms cubic-bezier(.22,1,.36,1)';
        box.style.height = h1 + 'px';
      }
      if(centre) center(box, h1, false);
      if(done) done();
      setTimeout(function(){
        box.style.height = box.style.transition = box.style.overflow = box.style.boxSizing = '';
        busy = false;
      }, GLIDE + 20);
    }, LEAVE);
  }

  window.AYOFormSent = {
    show: function(form, sent, done){ swap(form, sent, 'fs-play', done, true); },
    hide: function(form, sent, done){ swap(sent, form, 'fs-return', done); }
  };
})();
