/* ==========================================================================
   AYO — Persona Hero
   Builds the persona tabs, renders the hero content, and drives the auto-rotate.
   Targets every [data-persona-hero] on the page.
   ========================================================================== */
(function(){

  /* Must match --ph-dwell and --ph-fade in persona-hero.css. */
  var DWELL = 8000;
  var FADE  = 1100;

  /* Copy per Figma "Header Copies" (26639:11927). `title` may hold a "\n"
     for a forced line break. */
  var PERSONAS = [
    {
      key: 'player', label: 'Player',
      eyebrow: 'Open Play · Open Match · Booking · Community',
      title: 'Find a game. Book a court.\nPlay together.',
      sub: '900,000+ users across 100+ cities in Indonesia. Find a court, join an Open Play or Open Match session, or host your own game, all in one app.',
      ctas: [ { label: 'Download AYO', kind: 'ghost' } ]
    },
    {
      key: 'host', label: 'Host',
      eyebrow: 'Open Play · Session Management · Payments',
      title: 'Host a session, hassle-free.',
      sub: 'Create sessions, manage participants and track payment automatically. Run it all in one place.',
      ctas: [ { label: 'Download AYO', kind: 'ghost' } ]
    },
    {
      key: 'venue', label: 'Venue Owner',
      eyebrow: 'Venue Management · Scheduling · Revenue',
      title: 'Manage your venue, connect with more players.',
      sub: 'Simplify venue management with one dashboard for schedules, pricing, and payments. Connect with 900,000+ AYO users and unlock more opportunities to fill your courts.',
      ctas: [ { label: 'Download the App', kind: 'ghost' } ]
    },
    {
      key: 'business', label: 'Business Partner',
      eyebrow: 'Brand · Sponsorship · Activation',
      title: 'Reach hundreds of thousands of sport enthusiasts.',
      sub: 'Connect your brand with Indonesia\u2019s most active sports community through campaigns, sponsorships, and in-platform activations.',
      ctas: [ { label: 'Explore Partnership', kind: 'ghost', href: 'partner.html' } ]
    }
  ];

  var ESCAPES = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return ESCAPES[c]; }); }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  [].slice.call(document.querySelectorAll('[data-persona-hero]')).forEach(init);

  function init(root){
    var content = root.querySelector('[data-ph-content]');
    var tabsEl  = root.querySelector('[data-ph-tabs]');
    var toggle  = root.querySelector('[data-ph-toggle]');
    if(!content || !tabsEl) return;

    var idx = 0, timer = null, paused = reduce;

    /* ---- Per-persona video background -----------------------------------
       Video paths live in the markup (data-video-<key>), not here, so the
       component preview and the page can each use their own relative paths.
       A persona without its own entry falls back to data-video-default. */
    var vidA = root.querySelector('.ph-video'), vidB = null;
    var curVideo = vidA ? vidA.getAttribute('src') : null;

    function videoFor(p){
      var key = 'video' + p.key.charAt(0).toUpperCase() + p.key.slice(1);
      return root.dataset[key] || root.dataset.videoDefault || null;
    }

    function ensureLayerB(){
      if(vidB || !vidA) return;
      vidB = vidA.cloneNode(false);
      vidB.classList.remove('is-active');
      vidB.removeAttribute('src');
      vidB.style.zIndex = '0';
      vidA.parentNode.insertBefore(vidB, vidA.nextSibling);
    }

    function idleLayer(){ return vidA.classList.contains('is-active') ? vidB : vidA; }

    /* Preload the next persona's video into the idle layer, so when its turn
       comes there's no lag between the text changing and the image following. */
    function preloadNext(){
      if(reduce || !vidA) return;
      ensureLayerB();
      var next = videoFor(PERSONAS[(idx + 1) % PERSONAS.length]);
      var idle = idleLayer();
      if(next && next !== curVideo && idle.getAttribute('src') !== next){
        idle.src = next;
        idle.load();
      }
    }

    function crossfade(incoming, outgoing, url){
      if(curVideo !== url) return;
      var playing = incoming.play();
      if(playing && playing.catch) playing.catch(function(){});
      incoming.style.zIndex = '1';
      outgoing.style.zIndex = '0';
      incoming.classList.add('is-active');
      /* The outgoing layer is deliberately held at full opacity through the
         transition. If it faded out at the same time, both would be half
         transparent mid-cross and the dark background would show through —
         a brief dip in brightness. Fading the incoming layer in ON TOP of an
         intact one means no dip at all. */
      setTimeout(function(){
        if(!incoming.classList.contains('is-active')) return;
        outgoing.classList.remove('is-active');
        outgoing.pause();
        preloadNext();
      }, FADE);
    }

    function setVideo(url){
      /* Under reduced-motion the CSS hides the video anyway — don't fetch it. */
      if(reduce || !vidA || !url || url === curVideo) return;
      curVideo = url;

      ensureLayerB();
      var incoming = idleLayer();
      var outgoing = incoming === vidA ? vidB : vidA;

      /* Already preloaded and ready — cross-fade straight away. */
      if(incoming.getAttribute('src') === url && incoming.readyState >= 3){
        crossfade(incoming, outgoing, url);
        return;
      }
      /* Attach the listener before load() so it can never be missed.
         Waits for the first frame; fading in immediately would show black. */
      incoming.addEventListener('canplay', function(){
        /* On a slow connection this video may only become ready after the
           persona has changed again. If so, don't show the stale one. */
        crossfade(incoming, outgoing, url);
      }, { once: true });
      if(incoming.getAttribute('src') !== url){
        incoming.src = url;
        incoming.load();
      }
    }

    /* ---- Tab ------------------------------------------------------------- */
    tabsEl.innerHTML = '';
    var tabs = PERSONAS.map(function(p, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ph-tab';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.dataset.persona = p.key;
      b.textContent = p.label;
      b.addEventListener('click', function(){ go(i); });
      b.addEventListener('keydown', function(e){
        if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = (i + (e.key === 'ArrowRight' ? 1 : PERSONAS.length - 1)) % PERSONAS.length;
        tabs[n].focus(); go(n);
      });
      tabsEl.appendChild(b);
      return b;
    });

    /* ---- Render ---------------------------------------------------------- */
    function render(p){
      var ctas = p.ctas.map(function(c){
        return '<a class="ph-btn ' + (c.kind === 'solid' ? 'solid' : 'ghost') + '" href="' +
               esc(c.href || '#') + '">' + esc(c.label) + '</a>';
      }).join('');

      content.innerHTML =
        '<p class="ph-eyebrow">' + esc(p.eyebrow) + '</p>' +
        '<h1 class="ph-title">' + esc(p.title).replace(/\n/g, '<br>') + '</h1>' +
        '<p class="ph-sub">' + esc(p.sub) + '</p>' +
        '<div class="ph-ctas">' + ctas + '</div>';
    }

    /* The progress bar lives in the tab's ::after, so it can't be restarted
       via inline style. Drop the class, force a reflow, re-apply it. */
    function restartProgress(){
      tabs.forEach(function(t){ t.classList.remove('is-active'); });
      void tabsEl.offsetWidth;
      tabs[idx].classList.add('is-active');
      revealTab(tabs[idx]);
    }

    /* On phones the tab row scrolls sideways (see persona-hero.css). Bring the
       active tab into view by scrolling the ROW only — scrollIntoView would
       also move the page, yanking the reader back up to the hero. */
    function revealTab(t){
      if(tabsEl.scrollWidth <= tabsEl.clientWidth) return;
      var left = t.offsetLeft - (tabsEl.clientWidth - t.offsetWidth) / 2;
      tabsEl.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
    }

    function schedule(){
      clearTimeout(timer);
      if(!paused) timer = setTimeout(function(){ go((idx + 1) % PERSONAS.length); }, DWELL);
    }

    /* ---- Per-persona photo ----------------------------------------------
       <img class="ph-photo" data-persona="key"> layers inside .ph-media. */
    var photos = [].slice.call(root.querySelectorAll('.ph-photo'));
    var photoTimer = null;
    function setPhoto(key){
      var incoming = photos.filter(function(ph){ return ph.dataset.persona === key; })[0];
      if(!incoming || incoming.classList.contains('is-top')) return;
      clearTimeout(photoTimer);
      photos.forEach(function(ph){ ph.classList.remove('is-top'); });
      incoming.classList.add('is-top', 'is-active');
      photoTimer = setTimeout(function(){
        photos.forEach(function(ph){ if(ph !== incoming) ph.classList.remove('is-active'); });
      }, reduce ? 0 : FADE);
    }

    function go(i){
      idx = i;
      setPhoto(PERSONAS[i].key);
      tabs.forEach(function(t, j){ t.setAttribute('aria-selected', String(i === j)); });
      render(PERSONAS[i]);
      setVideo(videoFor(PERSONAS[i]));
      restartProgress();
      schedule();
    }

    /* ---- Pause / play ---------------------------------------------------- */
    if(toggle){
      toggle.addEventListener('click', function(){
        paused = !paused;
        root.classList.toggle('is-paused', paused);
        toggle.setAttribute('aria-label', paused ? 'Resume persona rotation' : 'Pause persona rotation');
        if(paused) clearTimeout(timer); else schedule();
      });
    }

    /* Don't run the countdown while the browser tab is hidden. */
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) clearTimeout(timer); else schedule();
    });

    root.classList.toggle('is-paused', paused);
    if(toggle && paused) toggle.setAttribute('aria-label', 'Resume persona rotation');
    go(0);
    /* The first persona never goes through a cross-fade, so its preload is
       triggered manually — delayed a moment so it doesn't fight the first
       video for bandwidth. */
    setTimeout(preloadNext, 2000);
  }

})();
