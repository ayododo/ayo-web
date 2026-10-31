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

  /* Feature icons, drawn from the Figma "Activity / Feature item" set. One
     stroke style for all of them, so they live here as path data only. */
  var ICONS = {
      "calendar-plus": "<path d=\"M18.5 5h-13A2.5 2.5 0 0 0 3 7.5v11A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 18.5 5Z\"/><path d=\"M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5\"/>",
      "sliders": "<path d=\"M4 7h10M18 7h2M4 17h4M12 17h8\"/><circle cx=\"16\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"17\" r=\"2\"/>",
      "clipboard-check": "<path d=\"M16.5 4h-9A2.5 2.5 0 0 0 5 6.5v12A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-12A2.5 2.5 0 0 0 16.5 4Z\"/><path d=\"m9 13 2 2 4-4M9 3h6v3H9V3Z\"/>",
      "pin": "<path d=\"M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z\"/><circle cx=\"12\" cy=\"9.5\" r=\"2.5\"/>",
      "user-plus": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6M19 8v6M16 11h6\"/>",
      "users": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.8 3.5 5.5\"/>",
      "target": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1.2\"/>",
      "scale": "<path d=\"M12 3v18M7 21h10M5 7h14M5 7l-3 6.5a3.4 3.4 0 0 0 6 0L5 7Zm14 0-3 6.5a3.4 3.4 0 0 0 6 0L19 7Z\"/>",
      "trophy": "<path d=\"M12 13a4 4 0 0 0 4-4V4H8v5a4 4 0 0 0 4 4Zm0 0v4M8 6H5a2.9 2.9 0 0 0 3 4M16 6h3a2.9 2.9 0 0 1-3 4M8 21h8M9.5 17h5v4h-5v-4Z\"/>",
      "shuffle": "<path d=\"M3 7h3.5c2 0 3.2 1 4.3 2.8l2.4 4.4C14.3 16 15.5 17 17.5 17H21M18 20l3-3-3-3M3 17h3.5c1.5 0 2.5-.6 3.4-1.7M14.1 8.7C15 7.6 16 7 17.5 7H21M18 10l3-3-3-3\"/>",
      "layers": "<path d=\"m2.5 12.5 9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5M12 3 2.5 8l9.5 5 9.5-5L12 3Z\"/>",
      "bars": "<path d=\"M4 20h16M7 20v-6M12 20V6M17 20V10\"/>"
  };

  var ACTIVITIES = [
    {
      id: 'open-play',
      num: '01',
      title: 'Open Play',
      tag: 'Open Play',
      hasRole: true,
      image: 'activity-open-play.jpg',
      imageAlt: 'Players in an open play session',
      href: 'open-play.html',
      roles: {
        host: {
          lead: 'Host Games, Without the Hassle.',
          features: [
            { icon: 'calendar-plus', title: 'Create Sessions in Minutes', desc: 'Set up your Open Play session quickly and easily.' },
            { icon: 'sliders', title: 'Control Your Session', desc: 'Set player limits and skill levels to suit your game.' },
            { icon: 'clipboard-check', title: 'Manage Everything in One Place', desc: 'Keep track of participants and payments with less manual work.' }
          ],
          giant: '12,000+',
          giantLabel: 'Sessions / month',
          cta: 'Learn How to Host',
          href: 'open-play-host.html'
        },
        participant: {
          lead: 'Find Your Game. Meet New People.',
          features: [
            { icon: 'pin', title: 'Discover Nearby Sessions', desc: 'Find Open Play games happening near you.' },
            { icon: 'user-plus', title: 'Join with Ease', desc: 'Join a session without the hassle of finding enough players yourself.' },
            { icon: 'users', title: 'Play with Your Community', desc: 'Meet new people and connect with fellow players who share your passion.' }
          ],
          giant: '90,000+',
          giantLabel: 'Active players',
          cta: 'Find sessions near you',
          /* Faces only on this side of the toggle: 90,000+ counts people, so
             showing a few makes the figure concrete. */
          avatars: ['avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg', 'avatar-4.jpg', 'avatar-5.jpg'],
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
      num: '02',
      title: 'Open Match',
      tag: 'Open Match',
      hasRole: false,
      image: 'activity-open-match.jpg',
      imageAlt: 'Two players in a competitive match',
      href: 'open-match.html',
      /* No big number here: the image carries the matchup itself — two pairs
         facing off — with the headline under it. */
      versus: {
        left: ['avatar-1.jpg', 'avatar-3.jpg'],
        right: ['avatar-2.jpg', 'avatar-5.jpg'],
        title: 'Find Your Opponents',
        sub: 'Challenge players in 4-player matches against opponents at your skill level.'
      },
      features: [
        { icon: 'target', title: 'Challenge Other Players', desc: 'Set up a match and choose your preferred match format.' },
        { icon: 'scale', title: 'Find Balanced Matchups', desc: 'Use player ratings to find opponents at a similar skill level.' },
        { icon: 'trophy', title: 'Enjoy Focused Competition', desc: 'Play a dedicated 4-player match where every point counts.' }
      ],
      cta: 'Learn How to Host'
    },
    {
      id: 'gametime',
      num: '03',
      title: 'GameTime',
      tag: 'GameTime',
      hasRole: false,
      image: 'activity-gametime.jpg',
      /* Photo not exported yet: render the grey placeholder instead. Remove
         this flag once assets/activity-gametime.jpg is in the repo. */
      imagePending: true,
      imageAlt: 'A player hitting a forehand during a GameTime session',
      href: '#',
      giant: '5,400+',
      giantLabel: 'Matches / month',
      features: [
        { icon: 'shuffle', title: 'Automatically Generate Matchups', desc: 'Generate match pairings and rounds for your session without organizing them manually.' },
        { icon: 'layers', title: 'Multiple Competitive Formats', desc: 'Play your way with Americano, Mexicano, or a custom format tailored to your session.' },
        { icon: 'bars', title: 'Live Scores & Standings', desc: 'Record match results and track standings to keep everyone engaged throughout the session.' }
      ],
      cta: 'Explore GameTime',
      ctaStyle: 'link'
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
      id: a.id, num: a.num, title: a.title, tag: a.tag, hasRole: true,
      /* A role may point somewhere of its own — host has its own page, while
         participant still falls back to the activity's. */
      image: a.image, imageAlt: a.imageAlt, href: r.href || a.href, micros: a.micros,
      lead: r.lead, features: r.features, giant: r.giant, giantLabel: r.giantLabel, cta: r.cta,
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
      '<span class="actb__tab-num">' + esc(a.num) + '</span>' +
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
          return '<img class="actb__avatar" src="' + esc(ASSETS + f) + '" alt="">';
        }).join('') +
      '</div>' +
      (note ? '<p class="actb__proof-note">' + esc(note) + '</p>' : '') +
    '</div>';
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

  function featuresHTML(list) {
    if (!list || !list.length) return '';
    return '<ul class="actb__feats">' + list.map(function (f) {
      return '<li class="actb__feat">' +
        '<span class="actb__feat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[f.icon] || '') + '</svg></span>' +
        '<span class="actb__feat-text"><span class="actb__feat-title">' + esc(f.title) + '</span>' +
        '<span class="actb__feat-desc">' + esc(f.desc) + '</span></span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  /* Open Match: two pairs facing off, then the headline. The faces are
     decoration; the headline is what a screen reader needs. */
  function versusHTML(v) {
    function pair(list) {
      return '<span class="actb__pair">' + list.map(function (f) {
        return '<img class="actb__avatar" src="' + esc(ASSETS + f) + '" alt="">';
      }).join('') + '</span>';
    }
    return '<div class="actb__overlay actb__overlay--versus">' +
      '<div class="actb__vs" aria-hidden="true">' + pair(v.left) + '<span class="actb__vs-word">vs</span>' + pair(v.right) + '</div>' +
      '<p class="actb__vs-title">' + esc(v.title) + '</p>' +
      '<p class="actb__vs-sub">' + esc(v.sub) + '</p>' +
    '</div>';
  }

  function renderPanel() {
    var d = currentData();

    /* On Open Play the chip carries the role too — "OPEN PLAY · HOST" — so the
       point of view is stated on the image, not only on the toggle below it. */
    var chip = esc(d.tag) + (d.hasRole
      ? '<i class="actb__chip-sep" aria-hidden="true"></i>' + esc(role)
      : '');

    var overlay = d.versus ? versusHTML(d.versus) :
      '<div class="actb__overlay">' +
        '<span class="actb__giant">' + esc(d.giant) + '</span>' +
        '<span class="actb__giant-lbl">' + esc(d.giantLabel) + '</span>' +
      '</div>';

    /* Only Open Play has a lead row: the role toggle, the one-line pitch for
       that role, and the faces. The other activities go straight to features. */
    var lead = d.hasRole
      ? '<div class="actb__lead">' +
          '<div class="actb__lead-main">' + rolesHTML() +
            '<p class="actb__desc">' + esc(d.lead) + '</p>' +
          '</div>' +
          proofHTML(d.avatars, d.avatarsNote) +
        '</div>'
      : '';

    var foot = (d.micros && d.micros.length ? '<div class="actb__micros">' + microsHTML(d.micros) + '</div>' : '') +
      '<a class="actb__cta' + (d.ctaStyle === 'link' ? ' actb__cta--link' : '') + '" href="' + esc(d.href) + '">' + esc(d.cta) + ARROW + '</a>';

    panel.innerHTML =
      '<div class="actb__media">' +
        (d.imagePending
          ? '<span class="actb__ph asset-ph" data-asset="' + esc(ASSETS + d.image) + '" role="img" aria-label="' + esc(d.imageAlt) + '"></span>'
          : '<img src="' + esc(ASSETS + d.image) + '" alt="' + esc(d.imageAlt) + '">') +
        '<span class="actb__scrim" aria-hidden="true"></span>' +
        '<span class="actb__chip">' + chip + '</span>' +
        overlay +
      '</div>' +
      lead +
      featuresHTML(d.features) +
      '<div class="actb__foot">' + foot + '</div>';

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
