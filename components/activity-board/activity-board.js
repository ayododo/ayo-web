/* ==========================================================================
   AYO — Activity Board
   Builds the vertical tablist and renders the panel. Targets [data-actb].

   Two pieces of state: which tab is open, and — for Open Play only — whether
   the copy is written for a host or a participant. Switching tabs deliberately does
   NOT reset the role, so returning to Open Play shows what you last chose.

   Image paths are composed from data-actb-assets on the root rather than being
   hard-coded here, so the page and the standalone preview can each point at
   their own relative path (same approach as persona-hero).
   ========================================================================== */
(function () {

  var root = document.querySelector('[data-actb]');
  if (!root) return;

  var tabsEl = root.querySelector('[data-actb-tabs]');
  var panel = root.querySelector('[data-actb-panel]');
  if (!tabsEl || !panel) return;

  var ASSETS = root.dataset.actbAssets || 'assets/';

  /* Feature-list icons live in assets/icons (Figma exports). Each entry is
     { icon, w, h } — the glyph's own size, centred in a 48px tile, so it must
     not be stretched to the tile.

     Imagery (Figma exports) lives in assets/activity. An empty `image` or
     avatar string still renders its slot, just without a picture. */
  var ICON = {
    pin:      { icon: 'map-pin.svg',     w: 15.8,  h: 20.3 },
    userPlus: { icon: 'user-plus.svg',   w: 21.3,  h: 17.3 },
    users:    { icon: 'users.svg',       w: 20.8,  h: 17.3 },
    calendar: { icon: 'calendar.svg',    w: 19.8,  h: 19.8 },
    card:     { icon: 'credit-card.svg', w: 19.8,  h: 14.8 },
    search:   { icon: 'search-zoom.svg', w: 17.8,  h: 17.8 },
    zap:      { icon: 'zap.svg',         w: 16.8,  h: 21.8 },
    chart:    { icon: 'bar-chart.svg',   w: 17.8,  h: 15.8 },
    bell:     { icon: 'bell.svg',        w: 19.8,  h: 20.8 },
    calendarPlus: { icon: 'calendar-plus.svg',   w: 19.8, h: 19.8 },
    sliders:      { icon: 'sliders.svg',         w: 17.8, h: 15.8 },
    clipboard:    { icon: 'clipboard-check.svg', w: 15.8, h: 19.8 },
    target:       { icon: 'target.svg',          w: 19.8, h: 19.8 },
    scale:        { icon: 'scale.svg',           w: 21.8, h: 19.8 },
    trophy:       { icon: 'trophy.svg',          w: 16.1, h: 18.8 },
    shuffle:      { icon: 'shuffle.svg',         w: 19.8, h: 17.8 },
    layers:       { icon: 'layers.svg',          w: 20.8, h: 20.3 }
  };
  function feat(ic, title, desc) { return { icon: ICON[ic], title: title, desc: desc }; }

  var ACTIVITIES = [
    {
      id: 'open-play',
      title: 'Open Play',
      tag: 'Open Play',
      hasRole: true,
      image: 'activity/open-play.webp',
      imageAlt: 'Players in an open play session',
      href: 'open-play.html',
      roles: {
        host: {
          /* Figma: Activity/Open Play/Host (26212:7874). */
          tagline: 'Host Games, Without the Hassle.',
          features: [
            feat('calendarPlus', 'Create Sessions in Minutes', 'Set up your Open Play session quickly and easily.'),
            feat('sliders', 'Control Your Session', 'Set player limits and skill levels to suit your game.'),
            feat('clipboard', 'Manage Everything in One Place', 'Keep track of participants and payments with less manual work.')
          ],
          giant: '12,000+',
          giantLabel: 'Sessions / month',
          cta: 'Learn How to Host',
          /* The two roles used to share the activity's href, which meant the
             host CTA and the participant CTA led to the same place. Host has a
             page of its own now, so it carries its own destination. */
          href: 'open-play-host.html'
        },
        participant: {
          tagline: 'Find Your Game. Meet New People.',
          features: [
            feat('pin', 'Discover Nearby Sessions', 'Find Open Play games happening near you.'),
            feat('userPlus', 'Join with Ease', 'Explore available sessions and join whenever you find one that suits you.'),
            feat('users', 'Play with Your Community', 'Meet new people and connect with fellow players who share your passion.')
          ],
          giant: '90,000+',
          giantLabel: 'Active players',
          cta: 'Find sessions near you',
          /* Faces only on this side of the toggle: 90,000+ counts people, so
             showing a few makes the figure concrete. The host figure counts
             sessions, where a row of portraits would say nothing. */
          avatars: ['activity/avatar-1.webp', 'activity/avatar-2.webp', 'activity/avatar-3.webp', 'activity/avatar-4.webp', 'activity/avatar-5.webp'],
          avatarsNote: '100+ joined this week'
        }
      },
      micros: [
        { value: '4.8', label: 'Session avg', star: true },
        { value: '150+', label: 'Cities', star: false }
      ]
    },
    {
      id: 'open-match',
      title: 'Open Match',
      tag: 'Open Match',
      hasRole: false,
      image: 'activity/open-match.webp',
      imageAlt: 'Two players in a competitive match',
      href: 'open-match.html',
      /* Figma: Activity/Open Match (26106:1821). The image carries a headline
         instead of a figure, over a pair-vs-pair of faces; there is no lead
         line and no micro-stats. */
      headline: 'Find Your Opponents',
      headlineSub: 'Discover 4-player competitive matches with players at your levels.',
      versus: [['activity/avatar-1.webp', 'activity/avatar-2.webp'], ['activity/avatar-3.webp', 'activity/avatar-5.webp']],
      tagline: '',
      features: [
        feat('target', 'Challenge Other Players', 'Set up a match and choose your preferred match format.'),
        feat('scale', 'Find Balanced Matchups', 'Use player ratings to find opponents at a similar skill level.'),
        feat('trophy', 'Enjoy Focused Competition', 'Play a dedicated 4-player match where every point counts.')
      ],
      giant: '',
      giantLabel: '',
      /* Copy as in Figma — it repeats the Host CTA; confirm with design. */
      cta: 'Learn How to Host',
      micros: []
    },
    {
      /* Figma: Activity/GameTime (26106:1894). A headline on the image, no
         figure, no lead line and no micro-stats. */
      id: 'gametime',
      title: 'GameTime',
      tag: 'GameTime',
      hasRole: false,
      image: 'activity/gametime.webp',
      imageAlt: 'Players in a GameTime round',
      href: '#',
      headline: 'Every Points Counts. Every Round Matters',
      tagline: '',
      features: [
        feat('shuffle', 'Automatically Generate Matchups', 'Generate match pairings and rounds for your session without organizing them manually.'),
        feat('layers', 'Multiple Competitive Formats', 'Play your way with Americano, Mexicano, or a custom format tailored to your session.'),
        feat('chart', 'Live Scores & Standings', 'Record match results and track standings to keep everyone engaged throughout the session.')
      ],
      giant: '',
      giantLabel: '',
      cta: 'Explore GameTime',
      micros: []
    }
  ];

  var ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; }); }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Drawn, not typed: the ↗ glyph differs per platform and sits off the
     baseline. This is the same arrow the page already uses for .hlink. */
  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 16L16 8"/><path d="M9 8h7v7"/></svg>';

  var STAR =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 2l2.9 6.26 6.85.62-5.18 4.54 1.55 6.72L12 17.1 5.88 20.66l1.55-6.72L2.25 8.88l6.85-.62L12 2z"/>' +
    '</svg>';

  var tab = 0;
  var role = 'participant';

  /* ---- Data ---------------------------------------------------------------- */
  /* Flattens the role dimension away so render() only ever sees one shape. */
  function currentData() {
    var a = ACTIVITIES[tab];
    if (!a.hasRole) return a;

    var r = a.roles[role];
    return {
      id: a.id, title: a.title, tag: a.tag, hasRole: true,
      /* A role may point somewhere of its own — host has its own page, while
         participant still falls back to the activity's. */
      image: a.image, imageAlt: a.imageAlt, href: r.href || a.href, micros: a.micros,
      tagline: r.tagline, features: r.features,
      giant: r.giant, giantLabel: r.giantLabel, cta: r.cta,
      avatars: r.avatars, avatarsNote: r.avatarsNote
    };
  }

  /* ---- Tabs ---------------------------------------------------------------- */
  var tabs = ACTIVITIES.map(function (a, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'actb__tab';
    b.setAttribute('role', 'tab');
    b.id = 'actb-tab-' + a.id;
    b.setAttribute('aria-controls', 'actb-panel');
    b.innerHTML =
      '<span class="actb__tab-title">' + esc(a.title) + '</span>' +
      '<span class="actb__tab-arrow">' + ARROW + '</span>';
    b.addEventListener('click', function () { selectTab(i); });
    b.addEventListener('keydown', function (e) { onTabKey(e, i); });
    tabsEl.appendChild(b);
    return b;
  });

  function onTabKey(e, i) {
    var next = null;
    if (e.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    selectTab(next);
    tabs[next].focus();
  }

  function renderTabs() {
    tabs.forEach(function (b, i) {
      var on = i === tab;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      /* Roving tabindex: the tablist is one stop, arrows move within it. */
      b.tabIndex = on ? 0 : -1;
    });
  }

  /* ---- Panel --------------------------------------------------------------- */
  function microsHTML(micros) {
    return micros.map(function (m, i) {
      /* A divider belongs BETWEEN micros — with a single micro there is nothing
         to divide, so Open Match shows none. */
      var div = i === 0 ? '' : '<span class="actb__mdiv" aria-hidden="true"></span>';
      var star = m.star ? STAR : '';
      return div +
        '<div class="actb__micro">' +
          '<span class="actb__micro-val">' + star + esc(m.value) + '</span>' +
          '<span class="actb__micro-lbl">' + esc(m.label) + '</span>' +
        '</div>';
    }).join('');
  }

  /* The portraits are aria-hidden with empty alt — four unnamed faces announced
     one by one is noise. The note underneath is NOT hidden: it carries a figure
     that appears nowhere else on the panel. */
  function proofHTML(list, note) {
    if (!list || !list.length) return '';
    return '<div class="actb__proof">' +
      '<div class="actb__avatars" aria-hidden="true">' +
        list.map(function (f) {
          return f
            ? '<img class="actb__avatar" src="' + esc(ASSETS + f) + '" alt="">'
            : '<span class="actb__avatar actb__avatar--empty"></span>';
        }).join('') +
      '</div>' +
      (note ? '<p class="actb__proof-note">' + esc(note) + '</p>' : '') +
    '</div>';
  }

  /* Open Match: two pairs of faces either side of "vs". Decorative — the
     headline below says what the picture means. */
  function versusHTML(pairs) {
    if (!pairs || !pairs.length) return '';
    function face(f) {
      return f
        ? '<img class="actb__vs-face" src="' + esc(ASSETS + f) + '" alt="">'
        : '<span class="actb__vs-face actb__vs-face--empty"></span>';
    }
    return '<div class="actb__vs" aria-hidden="true">' +
      pairs.map(function (p) {
        return '<span class="actb__vs-pair">' + p.map(face).join('') + '</span>';
      }).join('<span class="actb__vs-word">vs</span>') +
    '</div>';
  }

  /* What sits over the photo: a big figure (Open Play) or a headline
     (Open Match, GameTime). */
  function overlayHTML(d) {
    if (d.giant) {
      return '<div class="actb__overlay">' +
          '<span class="actb__giant">' + esc(d.giant) + '</span>' +
          '<span class="actb__giant-lbl">' + esc(d.giantLabel) + '</span>' +
        '</div>';
    }
    if (d.headline) {
      return '<div class="actb__overlay">' +
          versusHTML(d.versus) +
          '<p class="actb__headline">' + esc(d.headline) + '</p>' +
          (d.headlineSub ? '<span class="actb__giant-lbl actb__headline-sub">' + esc(d.headlineSub) + '</span>' : '') +
        '</div>';
    }
    return '';
  }

  function rolesHTML() {
    return '<div class="actb__roles" role="group" aria-label="Point of view">' +
      /* These keys are also the visible labels (CSS uppercases them) and the
         chip suffix, so renaming one renames all three. */
      ['participant', 'host'].map(function (r) {
        return '<button type="button" class="actb__role" data-role="' + r + '" ' +
               'aria-pressed="' + (r === role ? 'true' : 'false') + '">' + r + '</button>';
      }).join('') +
      '</div>';
  }

  /* Icon tile + title + one line of description (Figma: Activity / Feature item). */
  function featuresHTML(list) {
    if (!list || !list.length) return '';
    return '<ul class="actb__features">' + list.map(function (f) {
      return '<li class="actb__feature">' +
        '<span class="actb__ficon" aria-hidden="true">' +
          '<img src="' + esc(ASSETS + 'icons/' + f.icon.icon) + '" alt="" ' +
          'width="' + f.icon.w + '" height="' + f.icon.h + '">' +
        '</span>' +
        '<span class="actb__ftext"><span class="actb__ftitle">' + esc(f.title) + '</span>' +
        '<span class="actb__fdesc">' + esc(f.desc) + '</span></span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function renderPanel() {
    var d = currentData();

    /* On Open Play the chip carries the role too — "OPEN PLAY · HOST" — so the
       point of view is stated on the image, not only on the toggle below it.
       Open Match has no role, so it stays a single label. */
    var chip = esc(d.tag) + (d.hasRole
      ? '<i class="actb__chip-sep" aria-hidden="true"></i>' + esc(role)
      : '');

    panel.innerHTML =
      '<div class="actb__media' + (d.image ? '' : ' actb__media--empty') + '">' +
        (d.image ? '<img src="' + esc(ASSETS + d.image) + '" alt="' + esc(d.imageAlt) + '">' : '') +
        '<span class="actb__scrim" aria-hidden="true"></span>' +
        '<span class="actb__chip">' + chip + '</span>' +
        overlayHTML(d) +
      '</div>' +
      /* Open Match and GameTime have no toggle, line or faces under the image,
         so the lead row is left out rather than drawn empty. */
      ((d.hasRole || d.tagline || (d.avatars && d.avatars.length)) ?
      '<div class="actb__lead">' +
        '<div class="actb__lead-main">' +
          /* No heading here on purpose: the active tab and the chip on the
             image both already say the activity name. The panel is still
             named for assistive tech via aria-labelledby on the tab. */
          (d.hasRole ? rolesHTML() : '') +
          '<p class="actb__desc">' + esc(d.tagline) + '</p>' +
        '</div>' +
        proofHTML(d.avatars, d.avatarsNote) +
      '</div>' : '') +
      featuresHTML(d.features) +
      '<div class="actb__foot">' +
        (d.micros.length ? '<div class="actb__micros">' + microsHTML(d.micros) + '</div>' : '<span class="actb__micros"></span>') +
        '<a class="actb__cta" href="' + esc(d.href) + '">' + esc(d.cta) + ARROW + '</a>' +
      '</div>';

    panel.setAttribute('aria-labelledby', 'actb-tab-' + d.id);

    [].forEach.call(panel.querySelectorAll('[data-role]'), function (b) {
      b.addEventListener('click', function () { setRole(b.dataset.role); });
    });

    if (!reduce) restartEnter();
  }

  /* Re-adding the class alone does nothing — the browser has not finished the
     previous animation record until layout is read. Forcing a reflow between
     the remove and the add is what makes it replay. */
  function restartEnter() {
    panel.classList.remove('actb__panel--enter');
    void panel.offsetWidth;
    panel.classList.add('actb__panel--enter');
  }

  /* ---- State --------------------------------------------------------------- */
  function selectTab(i) {
    if (i === tab) return;
    tab = i;
    renderTabs();
    renderPanel();
  }

  function setRole(r) {
    if (r === role) return;
    role = r;
    renderPanel();
  }

  renderTabs();
  renderPanel();

})();
