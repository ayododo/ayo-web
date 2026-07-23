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
          desc: 'Create a session, set player limits, and follow the game as it runs. Manage participants and payments from one place.',
          giant: '12,000+',
          giantLabel: 'Sessions / month',
          cta: 'See what you can do as a host'
        },
        participant: {
          desc: 'Find open sessions near you, join in one tap, and split the court fee automatically — no group-chat math.',
          giant: '90,000+',
          giantLabel: 'Active players',
          cta: 'Find sessions near you',
          /* Faces only on this side of the toggle: 90,000+ counts people, so
             showing a few makes the figure concrete. The host figure counts
             sessions, where a row of portraits would say nothing. */
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
      href: '#',
      desc: 'Challenge other players, choose your match format, and find balanced opponents through ratings — every match stays close and fun.',
      giant: '5,400+',
      giantLabel: 'Matches / month',
      cta: 'See Open Match',
      micros: [
        { value: '4.8', label: 'Match rating', star: true }
      ]
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
      image: a.image, imageAlt: a.imageAlt, href: a.href, micros: a.micros,
      desc: r.desc, giant: r.giant, giantLabel: r.giantLabel, cta: r.cta,
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

  function renderPanel() {
    var d = currentData();

    /* On Open Play the chip carries the role too — "OPEN PLAY · HOST" — so the
       point of view is stated on the image, not only on the toggle below it.
       Open Match has no role, so it stays a single label. */
    var chip = esc(d.tag) + (d.hasRole
      ? '<i class="actb__chip-sep" aria-hidden="true"></i>' + esc(role)
      : '');

    panel.innerHTML =
      '<div class="actb__media">' +
        '<img src="' + esc(ASSETS + d.image) + '" alt="' + esc(d.imageAlt) + '">' +
        '<span class="actb__scrim" aria-hidden="true"></span>' +
        '<span class="actb__chip">' + chip + '</span>' +
        '<div class="actb__overlay">' +
          '<span class="actb__giant">' + esc(d.giant) + '</span>' +
          '<span class="actb__giant-lbl">' + esc(d.giantLabel) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="actb__lead">' +
        '<div class="actb__lead-main">' +
          /* No heading here on purpose: the active tab and the chip on the
             image both already say the activity name. The panel is still
             named for assistive tech via aria-labelledby on the tab. */
          (d.hasRole ? rolesHTML() : '') +
          '<p class="actb__desc">' + esc(d.desc) + '</p>' +
        '</div>' +
        proofHTML(d.avatars, d.avatarsNote) +
      '</div>' +
      '<div class="actb__foot">' +
        '<div class="actb__micros">' + microsHTML(d.micros) + '</div>' +
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
