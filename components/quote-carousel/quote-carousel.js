/* ==========================================================================
   AYO — Quote carousel. Targets [data-qtc].
   Reads the testimonials from the <template data-qtc-item> elements, shows one
   at a time and autoplays every 7s. Autoplay pauses while the pointer or focus
   is on the card and while the section is off screen, and is off entirely
   under prefers-reduced-motion. Dots and arrows step it by hand.
   ========================================================================== */
(function () {
  var root = document.querySelector('[data-qtc]');
  if (!root) return;
  var slide = root.querySelector('[data-qtc-slide]');
  var dotsEl = root.querySelector('[data-qtc-dots]');
  var card = root.querySelector('.qtc__card');
  var items = [].slice.call(root.querySelectorAll('template[data-qtc-item]'));
  if (!slide || !dotsEl || items.length < 2) return;

  var DWELL = 7000;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, timer = 0, hover = false, visible = false;

  var dots = items.map(function (t, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'qtc__dot';
    b.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + items.length);
    b.addEventListener('click', function () { go(i, true); });
    dotsEl.appendChild(b);
    return b;
  });

  function paint(i) {
    slide.replaceChildren(items[i].content.cloneNode(true));
    dots.forEach(function (d, j) { d.setAttribute('aria-current', i === j ? 'true' : 'false'); });
  }
  function go(i, user) {
    i = (i + items.length) % items.length;
    if (i === cur) { schedule(); return; }
    cur = i;
    if (reduce) { paint(i); }
    else {
      slide.classList.add('is-out');
      setTimeout(function () { paint(cur); slide.classList.remove('is-out'); }, 300);
    }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || hover || !visible) return;
    timer = setTimeout(function () { go(cur + 1); }, DWELL);
  }

  root.querySelector('[data-qtc-prev]').addEventListener('click', function () { go(cur - 1, true); });
  root.querySelector('[data-qtc-next]').addEventListener('click', function () { go(cur + 1, true); });
  card.addEventListener('mouseenter', function () { hover = true; schedule(); });
  card.addEventListener('mouseleave', function () { hover = false; schedule(); });
  card.addEventListener('focusin', function () { hover = true; schedule(); });
  card.addEventListener('focusout', function () { hover = false; schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: 0.4 }).observe(card);
  } else { visible = true; }

  paint(0);
  schedule();
})();
