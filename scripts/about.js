/* AYO — About Us page: the AYO story timeline (Figma 27987:8085 and the
   story states 28014:8166 / 8243 / 8320 / 8397).
   Each year button carries its milestone in data-* (title, photo, alt); the
   card shows the chosen one. Years before it turn red ("passed") and the red
   progress line runs up to it. Prev/next arrows, the year buttons, arrow keys
   on the timeline and a sideways swipe on the card all move between years.
   Motion for the page comes in a later pass. */
(function(){
  'use strict';
  var story = document.querySelector('[data-story]');
  if(!story) return;
  var tl = story.querySelector('.ab-tl');
  var items = [].slice.call(tl.querySelectorAll('li'));
  var buttons = items.map(function(li){ return li.querySelector('button'); });
  var card = story.querySelector('.ab-card');
  var img = card.querySelector('.ab-card__photo img');
  var count = card.querySelector('[data-count]');
  var year = card.querySelector('.ab-card__year');
  var title = card.querySelector('.ab-card__title');
  var prev = card.querySelector('[data-prev]');
  var next = card.querySelector('[data-next]');
  var total = buttons.length, current = 0;
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  // Warm the cache so switching years doesn't flash an empty photo.
  buttons.forEach(function(b){ var i = new Image(); i.src = b.dataset.img; });

  function show(i, focus){
    if(i < 0 || i >= total) return;
    current = i;
    var b = buttons[i];
    items.forEach(function(li, k){
      li.classList.toggle('is-on', k === i);
      li.classList.toggle('is-past', k < i);
      if(k === i) buttons[k].setAttribute('aria-current', 'step'); else buttons[k].removeAttribute('aria-current');
    });
    tl.style.setProperty('--p', i);
    count.textContent = pad(i + 1) + ' / ' + pad(total);
    year.textContent = b.textContent.trim();
    title.textContent = b.dataset.title;
    img.src = b.dataset.img;
    img.alt = b.dataset.alt || '';
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    if(focus) b.focus();
  }

  buttons.forEach(function(b, i){
    b.addEventListener('click', function(){ show(i); });
    b.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if(d){ e.preventDefault(); show(Math.min(total - 1, Math.max(0, i + d)), true); }
    });
  });
  prev.addEventListener('click', function(){ show(current - 1); });
  next.addEventListener('click', function(){ show(current + 1); });

  // Swipe on the card (mobile frame "Timeline · swipe").
  var x0 = null, y0 = 0;
  card.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
  card.addEventListener('touchend', function(e){
    if(x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  }, {passive:true});

  show(0);
})();
