/* ==========================================================================
   AYO — Marquee
   Drives every [data-mq-row] on the page from ONE requestAnimationFrame loop.

   Per row, read from the markup:
     data-mq-speed   px per second (default 70)
     data-mq-dir     'left' (default) | 'right'

   Scrolling the page briefly speeds the rows up, then they settle back. That
   reaction is the whole point — a marquee running at one constant rate reads as
   a decoration, one that answers the scroll reads as part of the page.
   ========================================================================== */
(function () {

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rows = [].slice.call(document.querySelectorAll('[data-mq-row]'));
  if (!rows.length || reduce) return;

  /* Scroll boost: peaks at BOOST_MAX extra speed, bleeds off by BOOST_DECAY
     each frame so the rows glide back down instead of snapping. */
  var BOOST_MAX = 3;
  var BOOST_GAIN = .05;
  var BOOST_DECAY = .92;

  var items = rows.map(setup).filter(Boolean);
  if (!items.length) return;

  function setup(row) {
    var track = row.querySelector('[data-mq-track]');
    var group = row.querySelector('[data-mq-group]');
    if (!track || !group) return null;

    return {
      row: row, track: track, group: group,
      speed: parseFloat(row.dataset.mqSpeed) || 70,
      dir: row.dataset.mqDir === 'right' ? 1 : -1,
      x: 0, unit: 0, clones: []
    };
  }

  /* Clone the group until the track is at least one row wider than the row
     itself. Anything less and the tail of the loop shows empty space. */
  function measure(it) {
    it.clones.forEach(function (c) { c.remove(); });
    it.clones = [];

    it.unit = it.group.offsetWidth;
    if (!it.unit) return;

    var needed = it.row.offsetWidth + it.unit;
    var total = it.unit;
    while (total < needed && it.clones.length < 40) {
      var c = it.group.cloneNode(true);
      /* Duplicates are decoration — a screen reader should hear the phrases
         once, from the original group. */
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('data-mq-group');
      it.track.appendChild(c);
      it.clones.push(c);
      total += it.unit;
    }
  }

  function measureAll() { items.forEach(measure); }

  /* Widths are measured in px, so measuring before the webfont swaps in would
     size every group against the fallback face and leave a gap at the seam. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureAll);
  }
  measureAll();

  var rt = null;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(measureAll, 150);
  });

  /* ---- Scroll velocity ----------------------------------------------------- */
  var lastY = scrollY, vel = 0;
  addEventListener('scroll', function () {
    vel = Math.abs(scrollY - lastY);
    lastY = scrollY;
  }, { passive: true });

  /* ---- Hover hold ---------------------------------------------------------- */
  /* Pointer-based, so a touch drag doesn't leave a row parked forever. */
  items.forEach(function (it) {
    if (!matchMedia('(hover: hover)').matches) return;
    it.row.addEventListener('pointerenter', function () { it.hold = true; });
    it.row.addEventListener('pointerleave', function () { it.hold = false; });
  });

  /* ---- Loop ---------------------------------------------------------------- */
  var boost = 1, prev = performance.now();

  requestAnimationFrame(function tick(now) {
    /* Clamped: after a background tab or a long frame, dt would otherwise be
       large enough to jump the rows a full screen sideways. */
    var dt = Math.min((now - prev) / 1000, .05);
    prev = now;

    boost = 1 + Math.min(vel * BOOST_GAIN, BOOST_MAX);
    vel *= BOOST_DECAY;

    items.forEach(function (it) {
      if (!it.unit || it.hold) return;
      it.x += it.dir * it.speed * boost * dt;
      /* Wrap into [-unit, 0) — one expression covers both directions, so a
         right-running row needs no separate branch. */
      it.x = ((it.x % it.unit) + it.unit) % it.unit - it.unit;
      it.track.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,0,0)';
    });

    requestAnimationFrame(tick);
  });

})();
