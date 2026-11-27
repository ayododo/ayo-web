/* AYO — contact form success swap (styles/form-sent.css), shared by the
   Partner (B2B) and AVM pages. AYOFormSent.show(form, sent, done) fades the
   form out, glides the panel to its new height and plays the success card
   (pop + drawn check); AYOFormSent.hide(form, sent, done) brings the form
   back. Reduced motion swaps instantly. */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var LEAVE = 240, GLIDE = 460, busy = false;

  function swap(from, to, enterClass, done){
    if(busy) return;
    if(reduce.matches){
      from.hidden = true; to.hidden = false;
      if(done) done();
      return;
    }
    busy = true;
    var box = from.parentElement;
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
      if(done) done();
      setTimeout(function(){
        box.style.height = box.style.transition = box.style.overflow = box.style.boxSizing = '';
        busy = false;
      }, GLIDE + 20);
    }, LEAVE);
  }

  window.AYOFormSent = {
    show: function(form, sent, done){ swap(form, sent, 'fs-play', done); },
    hide: function(form, sent, done){ swap(sent, form, 'fs-return', done); }
  };
})();
