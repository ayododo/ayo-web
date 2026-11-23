/* ==========================================================================
   AYO — Quote carousel. Targets [data-qtc].
   Two groups of testimonials, picked with the tabs in the heading:
   "ayo" (players & communities, light card) and "avm" (venue owners, dark
   card). Each <template data-qtc-item> says its group (data-group) and, when
   it has a translation, its language (data-lang="en" | "id"). The page
   language is html[data-language] (EN/ID, set by scripts/chrome.js); a group
   with no quotes in that language falls back to English. Each tab button
   carries its heading and sub (data-title / data-sub, plus -id for Bahasa
   Indonesia) and the card chip (data-chip).

   One quote shows at a time. Autoplay (7s) runs through the open group and
   then moves on to the other one, so a visitor who never touches the tabs
   still sees both. It pauses while the pointer or focus is on the card,
   while the section is off screen, and is off under prefers-reduced-motion.
   Arrows and dots step within the open group (wrapping). The card's height
   follows the quote and eases between sizes.
   Picking "Venue Owner" in the persona hero opens the AVM group too.
   ========================================================================== */
(function () {
  var root = document.querySelector('[data-qtc]');
  if (!root) return;
  var slide = root.querySelector('[data-qtc-slide]');
  var dotsEl = root.querySelector('[data-qtc-dots]');
  var card = root.querySelector('.qtc__card');
  var chip = root.querySelector('[data-qtc-chip]');
  var titleEl = root.querySelector('[data-qtc-title]');
  var subEl = root.querySelector('[data-qtc-sub]');
  var tabs = [].slice.call(root.querySelectorAll('[data-qtc-tab]'));
  var all = [].slice.call(root.querySelectorAll('template[data-qtc-item]'));
  if (!slide || !dotsEl || !all.length) return;

  var DWELL = 7000, FADE = 300;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;
  var group = root.dataset.group || 'ayo', cur = 0, items = [], dots = [];
  var timer = 0, hover = false, visible = false;

  function lang() { return html.dataset.language === 'ID' ? 'id' : 'en'; }
  function listFor(g) {
    var mine = all.filter(function (t) { return t.dataset.group === g; });
    var l = lang();
    var inLang = mine.filter(function (t) { return (t.dataset.lang || 'en') === l; });
    return inLang.length ? inLang : mine.filter(function (t) { return (t.dataset.lang || 'en') === 'en'; });
  }
  function tabFor(g) { return tabs.filter(function (t) { return t.dataset.qtcTab === g; })[0]; }
  function copy(tab, key) {
    var id = lang() === 'id' && tab.getAttribute('data-' + key + '-id');
    return id || tab.getAttribute('data-' + key) || '';
  }

  /* Swap the card's content and ease its height from the old size to the new. */
  function resize(render) {
    var h0 = card.offsetHeight;
    render();
    if (reduce) return;
    var h1 = card.offsetHeight;
    if (Math.abs(h1 - h0) < 2) return;
    card.style.height = h0 + 'px';
    void card.offsetHeight;
    card.style.height = h1 + 'px';
    var done = function (e) {
      if (e && e.propertyName !== 'height') return;
      card.style.height = '';
      card.removeEventListener('transitionend', done);
    };
    card.addEventListener('transitionend', done);
    setTimeout(done, 600);
  }

  function buildDots() {
    dotsEl.replaceChildren();
    dots = items.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'qtc__dot';
      b.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + items.length);
      b.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(b);
      return b;
    });
  }
  function markDots() {
    dots.forEach(function (d, j) { d.setAttribute('aria-current', cur === j ? 'true' : 'false'); });
  }
  function paintHead() {
    var tab = tabFor(group);
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (tab) {
      titleEl.textContent = copy(tab, 'title');
      subEl.textContent = copy(tab, 'sub');
      chip.textContent = tab.dataset.chip || '';
      card.setAttribute('aria-labelledby', tab.id);
    }
    root.dataset.group = group;
  }
  function paint() {
    resize(function () { slide.replaceChildren(items[cur].content.cloneNode(true)); });
    markDots();
  }

  /* Fade the changing parts out, change them, fade back in. */
  function transition(change) {
    var parts = [slide, titleEl, subEl, chip];
    if (reduce) { change(); return; }
    parts.forEach(function (el) { el.classList.add('is-out'); });
    setTimeout(function () {
      change();
      parts.forEach(function (el) { el.classList.remove('is-out'); });
    }, FADE);
  }

  function setGroup(g, opts) {
    opts = opts || {};
    if (!tabFor(g)) return;
    if (g === group && !opts.force) { schedule(); return; }
    var swap = function () {
      group = g; items = listFor(g); cur = 0;
      paintHead(); buildDots(); paint();
    };
    if (opts.instant) swap(); else transition(swap);
    schedule();
  }
  function go(i, auto) {
    if (auto && i >= items.length) {          // end of this group: hand over to the next
      var k = tabs.indexOf(tabFor(group));
      setGroup(tabs[(k + 1) % tabs.length].dataset.qtcTab);
      return;
    }
    i = (i + items.length) % items.length;
    if (i === cur) { schedule(); return; }
    cur = i;
    var head = slide;
    if (reduce) paint();
    else {
      head.classList.add('is-out');
      setTimeout(function () { paint(); head.classList.remove('is-out'); }, FADE);
    }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || hover || !visible) return;
    timer = setTimeout(function () { go(cur + 1, true); }, DWELL);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setGroup(t.dataset.qtcTab); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); setGroup(n.dataset.qtcTab);
    });
  });
  root.querySelector('[data-qtc-prev]').addEventListener('click', function () { go(cur - 1); });
  root.querySelector('[data-qtc-next]').addEventListener('click', function () { go(cur + 1); });
  card.addEventListener('mouseenter', function () { hover = true; schedule(); });
  card.addEventListener('mouseleave', function () { hover = false; schedule(); });
  card.addEventListener('focusin', function () { hover = true; schedule(); });
  card.addEventListener('focusout', function () { hover = false; schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: 0.4 }).observe(card);
  } else { visible = true; }

  /* The visitor picked a persona in the hero: venue owners see AVM first. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ph-tab[data-persona]');
    if (!t) return;
    if (t.dataset.persona === 'venue') setGroup('avm', { instant: !visible });
    else if (t.dataset.persona === 'player' || t.dataset.persona === 'host') setGroup('ayo', { instant: !visible });
  });

  /* Language switch (EN/ID) re-renders the open group in place. */
  var lastLang = lang();
  new MutationObserver(function () {
    if (lang() === lastLang) return;
    lastLang = lang();
    var keep = cur;
    items = listFor(group);
    cur = Math.min(keep, items.length - 1);
    paintHead(); buildDots(); paint();
  }).observe(html, { attributes: true, attributeFilter: ['data-language'] });

  items = listFor(group);
  paintHead(); buildDots();
  slide.replaceChildren(items[0].content.cloneNode(true));
  markDots();
  schedule();
})();
