/* ==========================================================================
   AYO — Persona Hero
   Builds the persona tabs, renders the hero content, and drives the auto-rotate.
   Targets every [data-persona-hero] on the page.
   ========================================================================== */
(function(){

  /* Must match --ph-dwell in persona-hero.css. */
  var DWELL = 8000;

  var PERSONAS = [
    {
      key: 'player', label: 'Player',
      eyebrow: 'Open Play · Open Match · Booking · Community',
      pre: 'Join Activities, made ', hl: 'easy', post: '.',
      sub: '90,000+ active players across 150 cities. Find a court, join an Open Play or Open Match session, and set up your own game — all from one app.',
      ctas: [ { label: 'Download the App', kind: 'ghost' } ]
    },
    {
      key: 'host', label: 'Host',
      eyebrow: 'Open Play · Session Management · Payments',
      pre: 'Host a session, run it ', hl: 'hassle-free', post: '.',
      sub: 'Create a session, set participant limits, and track payments automatically. Run the whole match from one place.',
      ctas: [ { label: 'Learn about hosting', kind: 'ghost' } ]
    },
    {
      key: 'venue', label: 'Venue Owner',
      eyebrow: 'Venue Management · Scheduling · Revenue',
      pre: 'Manage your venue, fill every ', hl: 'time slot', post: '.',
      sub: 'Set schedules, pricing, and payments from a single dashboard. Raise court occupancy through a network of 90,000+ active players.',
      ctas: [ { label: 'Explore AYO Venue Management', kind: 'ghost', href: 'venue.html' } ]
    },
    {
      key: 'business', label: 'Business Partner',
      eyebrow: 'Brand · Sponsorship · Activation',
      pre: 'Reach ', hl: 'tens of thousands', post: ' of active players.',
      sub: 'Connect your brand with Indonesia\u2019s most active sports community through campaigns, sponsorships, and in-platform activations.',
      ctas: [ { label: 'Contact Sales', kind: 'solid' }, { label: 'Read the media kit', kind: 'ghost' } ]
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
        '<h1 class="ph-title">' + esc(p.pre) +
          '<span class="ph-hl">' + esc(p.hl) + '</span>' + esc(p.post) + '</h1>' +
        '<p class="ph-sub">' + esc(p.sub) + '</p>' +
        '<div class="ph-ctas">' + ctas + '</div>';
    }

    /* The progress bar lives in the tab's ::after, so it can't be restarted
       via inline style. Drop the class, force a reflow, re-apply it. */
    function restartProgress(){
      tabs.forEach(function(t){ t.classList.remove('is-active'); });
      void tabsEl.offsetWidth;
      tabs[idx].classList.add('is-active');
    }

    function schedule(){
      clearTimeout(timer);
      if(!paused) timer = setTimeout(function(){ go((idx + 1) % PERSONAS.length); }, DWELL);
    }

    function go(i){
      idx = i;
      tabs.forEach(function(t, j){ t.setAttribute('aria-selected', String(i === j)); });
      render(PERSONAS[i]);
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
  }

})();
