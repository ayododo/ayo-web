/* ==========================================================================
   AYO — Shorts Rail
   - Arrows scroll the rail by a page of cards; they disable at either end.
   - Dots (phones) follow the scroll position.
   - A card click opens the player instead of leaving for YouTube:
       desktop → lightbox (9:16 player + story info, prev/next arrows)
       phones  → full-screen story player (progress bars, tap zones, mute)
     The card stays a real link, so with JS off (or on middle-click / ⌘-click)
     it simply opens the Short on YouTube.
   The Short plays in a youtube-nocookie embed that is only created on open
   and removed on close, so the page loads no YouTube code up front.
   ========================================================================== */
(function(){
  var root = document.querySelector('[data-shr]');
  if(!root) return;
  var rail = root.querySelector('[data-shr-rail]');
  var cards = [].slice.call(root.querySelectorAll('.shr__card'));
  var prevBtn = root.querySelector('[data-shr-prev]');
  var nextBtn = root.querySelector('[data-shr-next]');
  var dotsBox = root.querySelector('[data-shr-dots]');
  if(!rail || !cards.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 760px)');

  /* ---- Rail: arrows + dots ------------------------------------------- */
  function step(){
    var item = rail.children[0], gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    var per = Math.max(1, Math.floor((rail.clientWidth - 2 * parseFloat(getComputedStyle(rail).paddingLeft) + gap) / (item.offsetWidth + gap)));
    return per * (item.offsetWidth + gap);
  }
  function scrollByPage(dir){ rail.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' }); }
  if(prevBtn) prevBtn.addEventListener('click', function(){ scrollByPage(-1); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ scrollByPage(1); });

  var dots = cards.map(function(){ var i = document.createElement('i'); dotsBox && dotsBox.appendChild(i); return i; });
  var ticking = false;
  function sync(){
    ticking = false;
    var max = rail.scrollWidth - rail.clientWidth;
    if(prevBtn) prevBtn.disabled = rail.scrollLeft <= 2;
    if(nextBtn) nextBtn.disabled = rail.scrollLeft >= max - 2;
    var item = rail.children[0], gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    var idx = rail.scrollLeft >= max - 2 ? cards.length - 1 : Math.round(rail.scrollLeft / (item.offsetWidth + gap));
    dots.forEach(function(d, i){ d.classList.toggle('is-on', i === idx); });
  }
  rail.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  addEventListener('resize', sync);
  sync();

  /* ---- Player --------------------------------------------------------- */
  var ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
  };
  var lb = document.createElement('div');
  lb.className = 'shr-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Story player');
  lb.innerHTML =
    '<button class="shr-lb__step" type="button" data-lb-prev aria-label="Previous story">'+ICON.prev+'</button>' +
    '<div class="shr-lb__modal">' +
      '<div class="shr-lb__player" data-lb-player></div>' +
      '<div class="shr-lb__mobile-top">' +
        '<div class="shr-lb__progress" data-lb-progress></div>' +
        '<div class="shr-lb__head">' +
          '<div class="shr-lb__person"><span class="shr-lb__av" data-lb-av></span><span class="shr-lb__names"><span class="shr-lb__name" data-lb-name></span><span class="shr-lb__role" data-lb-meta></span></span></div>' +
          '<div class="shr-lb__controls"><button class="shr-lb__mute" type="button" data-lb-mute aria-label="Unmute">'+ICON.muted+'</button><button class="shr-lb__close" type="button" data-lb-close aria-label="Close">'+ICON.close+'</button></div>' +
        '</div>' +
      '</div>' +
      '<button class="shr-lb__tap shr-lb__tap--prev" type="button" data-lb-prev aria-label="Previous story"></button>' +
      '<button class="shr-lb__tap shr-lb__tap--next" type="button" data-lb-next aria-label="Next story"></button>' +
      '<div class="shr-lb__mobile-bottom"><p class="shr-lb__quote" data-lb-quote></p></div>' +
      '<div class="shr-lb__info">' +
        '<div class="shr-lb__top">' +
          '<div class="shr-lb__person"><span class="shr-lb__av" data-lb-av></span><span class="shr-lb__names"><span class="shr-lb__name" data-lb-name></span><span class="shr-lb__role" data-lb-role></span></span></div>' +
          '<button class="shr-lb__close" type="button" data-lb-close aria-label="Close">'+ICON.close+'</button>' +
        '</div>' +
        '<p class="shr-lb__quote" data-lb-quote></p>' +
        '<p class="shr-lb__about" data-lb-about></p>' +
        '<a class="shr-lb__yt" data-lb-yt href="#" target="_blank" rel="noopener">Watch on YouTube'+ICON.out+'</a>' +
      '</div>' +
    '</div>' +
    '<button class="shr-lb__step" type="button" data-lb-next aria-label="Next story">'+ICON.next+'</button>';
  document.body.appendChild(lb);

  function all(sel){ return [].slice.call(lb.querySelectorAll(sel)); }
  var player = lb.querySelector('[data-lb-player]');
  var progress = lb.querySelector('[data-lb-progress]');
  var muteBtn = lb.querySelector('[data-lb-mute]');
  var bars = cards.map(function(){ var i = document.createElement('i'); progress.appendChild(i); return i; });
  var cur = -1, lastFocus = null, muted = true, frame = null;

  function quote(q){ return /^[“"]/.test(q) ? q : '“' + q + '”'; }
  function setText(sel, v){ all(sel).forEach(function(n){ n.textContent = v; }); }
  function command(func){
    if(frame && frame.contentWindow) frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
  }
  function show(i){
    cur = (i + cards.length) % cards.length;
    var c = cards[cur], d = c.dataset;
    var dur = c.querySelector('.shr__dur').lastChild.textContent.trim();
    setText('[data-lb-av]', d.initial);
    setText('[data-lb-name]', d.name);
    setText('[data-lb-role]', d.role);
    setText('[data-lb-meta]', d.role.split(' · ')[0] + ' · ' + dur);
    setText('[data-lb-quote]', quote(d.quote));
    setText('[data-lb-about]', d.about || '');
    lb.querySelector('[data-lb-yt]').href = c.href;
    bars.forEach(function(b, j){ b.className = j < cur ? 'is-done' : j === cur ? 'is-on' : ''; });
    /* Phones start muted (browsers block autoplay with sound in an iframe
       there); the speaker button unmutes. Desktop starts with sound. */
    muted = phone.matches;
    muteBtn.innerHTML = muted ? ICON.muted : ICON.sound;
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    var src = 'https://www.youtube-nocookie.com/embed/' + d.id + '?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&loop=1&playlist=' + d.id + (muted ? '&mute=1' : '');
    player.innerHTML = '';
    var poster = c.querySelector('.shr__thumb').cloneNode();
    poster.className = 'shr-lb__poster'; poster.removeAttribute('loading');
    frame = document.createElement('iframe');
    frame.src = src;
    frame.title = d.name + ' — YouTube Short';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    player.appendChild(poster);
    player.appendChild(frame);
    all('[data-lb-prev]').forEach(function(b){ b.disabled = cur === 0; });
    all('[data-lb-next]').forEach(function(b){ b.disabled = cur === cards.length - 1; });
  }
  function open(i){
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var first = [].slice.call(lb.querySelectorAll('[data-lb-close]')).filter(function(b){ return b.offsetParent; })[0];
    if(first) first.focus();
  }
  function close(){
    lb.classList.remove('is-open');
    player.innerHTML = ''; frame = null; cur = -1;
    document.documentElement.style.overflow = '';
    if(lastFocus) lastFocus.focus();
  }

  cards.forEach(function(c, i){
    c.addEventListener('click', function(e){
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;   // let "open in new tab" work
      e.preventDefault();
      open(i);
    });
  });
  all('[data-lb-close]').forEach(function(b){ b.addEventListener('click', close); });
  all('[data-lb-prev]').forEach(function(b){ b.addEventListener('click', function(){ if(cur > 0) show(cur - 1); }); });
  all('[data-lb-next]').forEach(function(b){ b.addEventListener('click', function(){ if(cur < cards.length - 1) show(cur + 1); }); });
  muteBtn.addEventListener('click', function(){
    muted = !muted;
    command(muted ? 'mute' : 'unMute');
    muteBtn.innerHTML = muted ? ICON.muted : ICON.sound;
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  });
  lb.addEventListener('click', function(e){ if(e.target === lb) close(); });   // click on the dim backdrop
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('is-open')) return;
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowLeft' && cur > 0) show(cur - 1);
    else if(e.key === 'ArrowRight' && cur < cards.length - 1) show(cur + 1);
    else if(e.key === 'Tab'){
      /* Keep focus inside the dialog. */
      var f = [].slice.call(lb.querySelectorAll('button, a[href], iframe')).filter(function(n){ return n.offsetParent && !n.disabled; });
      if(!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if(e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); }
      else if(!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); }
    }
  });
  /* Phone: swipe up for the next story, down for the previous. */
  var y0 = null;
  lb.addEventListener('touchstart', function(e){ y0 = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function(e){
    if(y0 === null) return;
    var dy = e.changedTouches[0].clientY - y0; y0 = null;
    if(dy < -60 && cur < cards.length - 1) show(cur + 1);
    else if(dy > 60 && cur > 0) show(cur - 1);
  });
})();
