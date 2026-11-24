(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Partnership panels — one panel open at a time. Desktop: the open panel
     widens; phone: the panels are an accordion. Clicking (or, with a mouse,
     hovering) a panel opens it. The progress bar IS the timer: the rotation
     moves on at its animationend, so it can never drift from what is shown.
     Hovering the row or the section being off screen pauses it (CSS). */
  var row = document.querySelector('[data-ptn]');
  if(!row) return;
  var panels = [].slice.call(row.querySelectorAll('.ptn__panel'));
  var cur = Math.max(0, panels.findIndex(function(p){ return p.classList.contains('is-active'); }));
  /* Reduced motion collapses every animation to ~0ms, so an auto-advance
     would strobe; those users get click-to-open panels with no timer. */
  var auto = panels.length > 1 && !rm;
  row.classList.toggle('is-static', !auto);
  var hoverOpens = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');

  function show(i){
    cur = i;
    panels.forEach(function(p,j){
      p.classList.toggle('is-active', i===j);
      p.classList.remove('ticking');
      p.querySelector('.ptn__trigger').setAttribute('aria-expanded', i===j);
    });
    if(auto){ void panels[i].offsetWidth; panels[i].classList.add('ticking'); }  /* reflow restarts the bar */
  }

  panels.forEach(function(p,i){
    p.querySelector('.ptn__trigger').addEventListener('click', function(){ if(i!==cur) show(i); });
    p.addEventListener('mouseenter', function(){ if(hoverOpens.matches && i!==cur) show(i); });
    if(auto) p.addEventListener('animationend', function(e){
      if(e.animationName==='ptntick' && p.classList.contains('ticking')) show((cur+1)%panels.length);
    });
  });

  if(auto && 'IntersectionObserver' in window){
    row.classList.add('is-offscreen');   /* hold until the panels are actually on screen */
    new IntersectionObserver(function(es){
      row.classList.toggle('is-offscreen', !es[0].isIntersecting);
    },{threshold:.35}).observe(row);
  }
  show(cur);
})();

/* stat-band count-up — fires only when the band scrolls into view.
   (The band sits at the foot of the full-height persona hero, so on load it is
   still below the fold; kept in its own IIFE so an error elsewhere can never
   stop it from running.) */
(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var band = document.querySelector('.ph-stats');
  if(!band) return;
  var nums = [].slice.call(band.querySelectorAll('.ph-stat-num[data-to]'));
  if(!nums.length) return;
  function fmt(n){ return n.toLocaleString('en-US'); }
  function paint(el,n){ el.textContent = fmt(n) + (el.dataset.suffix || ''); }
  function run(el){
    var to = +el.dataset.to, dur = 1600, st = null;
    requestAnimationFrame(function step(t){
      if(!st) st = t;
      var p = Math.min((t - st) / dur, 1);
      paint(el, Math.round(to * (1 - Math.pow(1 - p, 3))));   // ease-out cubic
      if(p < 1) requestAnimationFrame(step);
    });
  }
  nums.forEach(function(el){ paint(el, 0); });                  // start at zero
  if(rm || !('IntersectionObserver' in window)){ nums.forEach(function(el){ paint(el, +el.dataset.to); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ nums.forEach(run); io.disconnect(); }  // animate all together, once
    });
  }, { threshold: 0.35 });
  io.observe(band);
})();

/* Booking — tabbed showcases (players, venue owners). Each [data-bkg-tabs]
   pairs a tab list with Mini UI phones (components/mini-ui/): the active tab
   shows its description and a progress bar, and its phone is the visible
   one. Tabs advance on their own while the showcase is on screen (one bar
   run each, paused on hover or keyboard focus); a click or Enter jumps.
   With reduced motion the bars are hidden and nothing advances. A phone
   that was hidden is re-measured when it is shown (AyoMiniUI.refresh). */
(function(){
  var shows = document.querySelectorAll('[data-bkg-tabs]');
  if(!shows.length) return;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(shows, function(show){
    var tabs = [].slice.call(show.querySelectorAll('.bkg__tab'));
    var panes = tabs.map(function(t){ return document.getElementById(t.getAttribute('aria-controls')); });
    var cur = 0;
    function go(i, focus){
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function(t, k){
        var onTab = k === cur;
        t.classList.toggle('is-active', onTab);
        t.setAttribute('aria-selected', String(onTab));
        t.tabIndex = onTab ? 0 : -1;
        panes[k].classList.toggle('is-active', onTab);
      });
      if(focus) tabs[cur].focus();
      // refresh() looks inside the node it gets, so pass the stage that holds the phones.
      if(window.AyoMiniUI) window.AyoMiniUI.refresh(panes[cur].parentNode);
    }
    tabs.forEach(function(t, k){
      t.addEventListener('click', function(){ go(k); });
      t.addEventListener('keydown', function(e){
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if(d){ e.preventDefault(); go(cur + d, true); }
      });
      // The bar's animation ending is the autoplay tick.
      t.querySelector('.bkg__prog i').addEventListener('animationend', function(){ if(t.classList.contains('is-active')) go(cur + 1); });
    });
    go(0);
    if(still || !('IntersectionObserver' in window)){ show.classList.add('is-still'); return; }
    new IntersectionObserver(function(es){ show.classList.toggle('is-run', es[0].isIntersecting); }, { threshold: .35 }).observe(show);
  });
})();

/* Booking — Indonesian copy. The homepage has no Indonesian twin, so the
   strings with data-i18n swap with html[data-language] (scripts/chrome.js).
   The Mini UI phones take their language from <html lang> when they are
   drawn, so a switch that changes it reloads the page. */
(function(){
  var root = document.documentElement;
  var nodes = document.querySelectorAll('#booking [data-i18n]');
  if(!nodes.length) return;
  var ID = {
    title:'Satu booking, dua sisi lapangan.',
    lede:'Pemain booking lapangan di aplikasi AYO. Pemilik venue menerima dan mengelolanya di AYO Venue Management.',
    plPill:'Untuk pemain · Aplikasi AYO', plTitle:'Booking lapangan, beres dalam 2 menit.',
    plLede:'Cari lapangan terdekat, pilih jam, dan bayar, semua di aplikasi AYO.',
    pl1:'Booking lapangan instan', pl1d:'Lihat jadwal kosong secara real-time dan booking tanpa perlu menelepon venue.',
    pl2:'Cari lapangan sesuai preferensimu', pl2d:'Cari lapangan, bandingkan lokasi, harga, dan fasilitasnya untuk menemukan yang paling cocok dengan gaya mainmu.',
    pl3:'Bayar sesuai pilihanmu', pl3d:'Bayar penuh atau DP dulu, dengan metode pembayaran pilihanmu.',
    chipSlot:'Jum · 19:00–21:00 · Lap. 2', bridge:'Booking yang sama langsung masuk ke AVM venue begitu dibayar.', findCourt:'Cari Lapangan',
    ownPill:'Untuk pemilik venue · AYO Venue Management', ownTitle:'Jangkau 900.000+ pengguna AYO. Kelola venue dalam satu platform.',
    ownLede:'Buat venue kamu lebih mudah ditemukan di AYO, kelola booking dan jadwal lapangan, pantau transaksi, dan kembangkan bisnis bersama AYO Venue Management (AVM).',
    size1:'Satu lapangan hingga multi-venue', size2:'Pemilik & staf satu jadwal', size3:'Lewat ponsel atau desktop',
    ow1:'Booking real-time', ow1d:'Lihat booking masuk, detail pelanggan, dan status pembayaran secara langsung.',
    ow2:'Jadwal & ketersediaan lapangan', ow2d:'Atur jadwal, harga, dan ketersediaan lapangan dalam satu tempat untuk membantu mencegah booking ganda.',
    ow3:'Pembayaran & laporan pendapatan', ow3d:'Pantau pendapatan dari booking dan aktivitas melalui berbagai jenis transaksi, lengkap dengan ringkasan harian, mingguan, dan bulanan.',
    ow4:'Promo & pelanggan', ow4d:'Buat program promosi dan kode voucher, pantau performanya, dan kenali pelangganmu.',
    ow5:'Berikan akses sesuai peran karyawan', ow5d:'Berikan akses layanan sesuai peran dan tanggung jawab tiap karyawan, lengkap dengan log aktivitas untuk memantau aktivitas karyawanmu.',
    steps:'Bergabung dalam 4 langkah',
    st1:'Daftar', st1d:'Lengkapi data venue dan bisnismu.', st2:'Verifikasi', st2d:'Tim AYO akan memverifikasi data kamu.',
    st3:'Atur Venue', st3d:'Lengkapi informasi venue, lapangan, jadwal, dan harga.', st4:'Mulai Beroperasi', st4d:'Mulai kelola venue dan terima booking melalui AYO.',
    register:'Daftarkan venue', learnAvm:'Pelajari tentang AVM'
  };
  function apply(){
    var id = root.dataset.language === 'ID';
    [].forEach.call(nodes, function(n){
      if(n.dataset.en == null) n.dataset.en = n.textContent;
      var k = n.dataset.i18n;
      n.textContent = id && ID[k] ? ID[k] : n.dataset.en;
    });
    if(root.dataset.language && id !== (root.lang === 'id')){ root.lang = id ? 'id' : 'en'; location.reload(); }
  }
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-language'] });
  if(root.dataset.language) apply();
})();

/* Booking › "Join in 4 steps" — plays once when the steps scroll into view:
   each number lights up in turn and the line runs on to the next step. Without
   JS, IntersectionObserver or with reduced motion, the static Figma state
   (step 1 current) stays as it is. */
(function(){
  var steps = document.querySelector('.bkg__steps');
  if(!steps || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].forEach.call(steps.querySelectorAll('.bkg__step'), function(s, i){ s.style.setProperty('--i', i); });
  steps.classList.add('is-anim');
  var io = new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting) return;
    steps.classList.add('is-play');
    io.disconnect();
  }, { threshold: .5 });
  io.observe(steps);
})();

/* "Also on AYO" — "+N more" reveals the rest of the sports; the row then
   scrolls sideways with the arrows (Figma 26417:5028 → 26937:6700). */
(function(){
  var more = document.querySelector('.spt__more');
  if(!more) return;
  var track = more.querySelector('[data-spt-track]');
  var expand = more.querySelector('[data-spt-expand]');
  var ctrl = more.querySelector('[data-spt-ctrl]');
  var prev = more.querySelector('[data-spt-prev]');
  var next = more.querySelector('[data-spt-next]');
  if(!track || !expand) return;

  function update(){
    var max = track.scrollWidth - track.clientWidth;
    var overflow = max > 1;
    ctrl.hidden = !overflow;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
    more.classList.toggle('has-more', overflow && track.scrollLeft < max - 1);
  }

  expand.addEventListener('click', function(){
    [].forEach.call(track.querySelectorAll('.spt__extra'), function(s){ s.hidden = false; });
    expand.setAttribute('aria-expanded', 'true');
    expand.remove();
    more.classList.add('is-open');
    update();
    var first = track.querySelector('.spt__extra');
    if(first) first.setAttribute('tabindex', '-1'), first.focus({ preventScroll: true });
  });

  function step(dir){ track.scrollBy({ left: dir * Math.max(120, track.clientWidth * 0.7) }); }
  prev.addEventListener('click', function(){ step(-1); });
  next.addEventListener('click', function(){ step(1); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function(){ if(more.classList.contains('is-open')) update(); });
})();

/* PadelLevels card motion (Figma 28194:24718): Unknown → Calibrating →
   Calibrated, played once — it waits in the Unknown state until the card is
   well inside the viewport, then runs and stays on Calibrated. The rating rolls per
   character (old glyph out downward, new one in from the top), the bar fills
   and the confidence figure counts up with it. Reduced motion / no
   IntersectionObserver: the markup's final state stays as is. */
(function(){
  var card = document.querySelector('[data-plr-card]');
  if(!card || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var numEl = card.querySelector('[data-plr-num]');
  var tagEl = card.querySelector('[data-plr-tag]');
  var confEl = card.querySelector('[data-plr-conf]');
  var barEl = card.querySelector('[data-plr-bar]');
  if(!numEl || !tagEl || !confEl || !barEl) return;

  var STEPS = [
    { num: 'X.XX', tag: 'Unknown',     conf: 0,  unknown: true, hold: 1400 },
    { num: '2.XX', tag: 'Calibrating', conf: 40,                hold: 1700 },
    { num: '4.35', tag: 'Calibrated',  conf: 75 }
  ];

  /* Rating: one slot per character. */
  var slots = [];
  function glyphWidth(ch){
    var m = document.createElement('span');
    m.textContent = ch; m.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    numEl.appendChild(m); var w = m.getBoundingClientRect().width; m.remove(); return w;
  }
  function slot(){
    var s = document.createElement('span'); s.className = 'plr-roll__slot';
    numEl.appendChild(s); return { el: s, ch: null };
  }
  function setNum(str, instant){
    while(slots.length < str.length) slots.push(slot());
    for(var i = 0; i < slots.length; i++){
      var sl = slots[i], ch = str.charAt(i) || '';
      if(sl.ch === ch) continue;
      sl.el.style.width = (ch ? glyphWidth(ch) : 0) + 'px';
      var old = sl.el.lastElementChild;
      if(old && !instant){
        old.classList.add('is-below');
        (function(o){ setTimeout(function(){ o.remove(); }, 600); })(old);
      } else if(old){ old.remove(); }
      if(ch){
        var n = document.createElement('span'); n.className = 'plr-roll__ch'; n.textContent = ch;
        if(!instant){ n.classList.add('is-above'); }
        sl.el.appendChild(n);
        if(!instant){ void n.offsetWidth; (function(x, d){ setTimeout(function(){ x.classList.remove('is-above'); }, d); })(n, i * 60); }
      }
      sl.ch = ch;
    }
  }

  function setTag(step, instant){
    tagEl.classList.toggle('is-unknown', !!step.unknown);
    var sp = document.createElement('span'); sp.textContent = step.tag;
    if(!instant) sp.className = 'is-in';
    tagEl.replaceChildren(sp);
  }

  var confNow = 0, confRaf = 0;
  function setConf(to, instant){
    cancelAnimationFrame(confRaf);
    barEl.style.transition = instant ? 'none' : '';
    barEl.style.width = to + '%';
    if(instant){ confNow = to; confEl.textContent = to + '%'; void barEl.offsetWidth; barEl.style.transition = ''; return; }
    var from = confNow, t0 = performance.now(), dur = 1000;
    (function tick(t){
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      confNow = Math.round(from + (to - from) * e);
      confEl.textContent = confNow + '%';
      if(k < 1) confRaf = requestAnimationFrame(tick);
    })(t0);
  }

  function show(k, instant){
    var st = STEPS[k];
    setNum(st.num, instant); setTag(st, instant); setConf(st.conf, instant);
  }
  function play(k){
    if(k >= STEPS.length) return;
    show(k, false);
    if(STEPS[k].hold) setTimeout(function(){ play(k + 1); }, STEPS[k].hold);
  }

  /* Start from Unknown so the first thing the user sees is the climb. */
  numEl.textContent = '';
  show(0, true);
  var io = new IntersectionObserver(function(es){
    if(!es.some(function(e){ return e.isIntersecting; })) return;
    io.disconnect();
    setTimeout(function(){ play(1); }, STEPS[0].hold);
  }, { threshold: 0.6 });
  io.observe(card);
})();
