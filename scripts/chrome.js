/* ==========================================================================
   AYO — Chrome behaviour
   The nav, the back-to-top button and reveal-on-scroll: everything every page
   carries. Pulled out of index.html alongside chrome.css when a second page
   arrived, for the same reason — the nav had just gained hide-on-scroll, and a
   copy would have drifted from it the next time either page was touched.
   Page-specific behaviour stays with its page.
   ========================================================================== */
(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* back to top */
  var toTop=document.getElementById('toTop');
  if(toTop){
    var ttTick=false;
    addEventListener('scroll',function(){ if(!ttTick){ ttTick=true; requestAnimationFrame(function(){ toTop.classList.toggle('show', scrollY > innerHeight*0.9); ttTick=false; }); } },{passive:true});
    toTop.addEventListener('click',function(){ scrollTo({top:0,behavior:rm?'auto':'smooth'}); });
  }

  /* burger — the open state lives on the button, not only in a class, so the
     control reports what it does and the icon can follow from it. */
  var links=document.getElementById('navlinks');
  var burger=document.querySelector('.burger');
  /* The burger opens the mobile drawer (built further down). #navlinks is the
     desktop row; it is no longer reused as the drawer because the phone menu
     has its own items, account block and language switch. */
  var drawer=null, scrim=null;
  function menuIsOpen(){ return Boolean(drawer && !drawer.hidden); }
  function setMenu(open, restoreFocus){
    if(!drawer){
      if(links) links.classList.toggle('open', open);
    } else {
      var was = menuIsOpen();
      drawer.hidden = !open;
      if(scrim) scrim.hidden = !open;
      var navEl = document.querySelector('.ayo-nav');
      if(navEl) navEl.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('m-lock', open);
      if(open && !was){ var first = drawer.querySelector('a,button'); if(first) first.focus({preventScroll:true}); }
      if(!open && was && restoreFocus && burger) burger.focus();
    }
    if(burger){
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    }
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(drawer ? !menuIsOpen() : !links.classList.contains('open')); });
  if(links) links.addEventListener('click', function(e){ if(e.target.tagName==='A') setMenu(false); });
  /* Escape already closes the dropdowns below; the menu should go with them. */
  addEventListener('keydown', function(e){ if(e.key==='Escape' && menuIsOpen()) setMenu(false, true); });

  /* nav float + hide going down, show coming back up (rAF-throttled) */
  var nav=document.querySelector('.ayo-nav'), tick=false, lastY=Math.max(0,scrollY);
  function navCheck(){
    if(!nav){ tick=false; return; }
    var y=Math.max(0,scrollY), dy=y-lastY;
    nav.classList.toggle('scrolled', y>60);
    /* An open menu or focus inside the nav means someone is using it — sliding
       it out from under them would be hostile. Near the top there is nothing to
       reclaim, so it stays put there too. */
    if(nav.querySelector('.open') || menuIsOpen() || nav.contains(document.activeElement) || y<120){
      nav.classList.remove('nav--away');
    } else if(Math.abs(dy)>6){          /* ignore trackpad jitter and rubber-banding */
      nav.classList.toggle('nav--away', dy>0);
    }
    lastY=y; tick=false;
  }
  addEventListener('scroll',function(){ if(!tick){ tick=true; requestAnimationFrame(navCheck); } },{passive:true});
  if(nav) navCheck();

  /* IBM Carbon Icons, Apache-2.0. SVG sources and license: assets/icons/carbon/. */
  if(nav){
    var cart = nav.querySelector('.nav-icon[aria-label="Cart"]');
    if(cart) cart.innerHTML = '<span class="carbon-icon carbon-cart" aria-hidden="true"></span>';
    if(burger) burger.innerHTML = '<span class="carbon-icon carbon-menu ico-open" aria-hidden="true"></span><span class="carbon-icon carbon-close ico-close" aria-hidden="true"></span>';
  }

  /* Activities menu. Desktop (Figma 26670:23051): a floating panel with three
     columns — Open Play, Open Match, Scoring — each with its icon, a preview
     card and its links. Mobile drawer (Figma 26667:12714): the same three
     groups stacked, icon + title, links on an indent line (mActs). Both are
     built here from one copy; the plain links in the markup stay as the
     no-JS fallback. Every page shares this nav. */
  var mActs = '';
  (function(){
    var menu = document.querySelector('.submenu[data-mega="activities"]');
    if(!menu) return;
    var I = 'assets/icons/mega/';
    var ARROW = '<img src="'+I+'arrow-brand.svg" alt="" width="16" height="16">';
    var VS = '<span class="act-ico act-ico--vs" aria-hidden="true"><i>VS</i></span>';
    var SCORE = '<span class="act-ico act-ico--score" aria-hidden="true"><i>6</i><i>:</i><i>4</i></span>';
    var PADEL = '<img class="act-ico act-ico--padel" src="'+I+'padel.webp" alt="" width="40" height="40">';
    var GROUPS = {
      play:  { icon: PADEL, title: 'Open Play',  desc: 'Play with new people, no team needed',
               links: [['https://ayo.co.id/main-bareng', 'Join activity', 'Find an open game near you'],
                       ['open-play-host.html', 'Host activity', 'Learn how to Host']] },
      match: { icon: VS,    title: 'Open Match', desc: 'Bring your team and play against another squad',
               cta: ['open-match.html', 'Explore Open Match'] },
      score: { icon: SCORE, title: 'Scoring',    desc: 'Play Americano, Mexicano, or Custom',
               links: [['#', 'Explore Scoring', 'Learn how Scoring works'],
                       ['index.html#rating', 'Learn about PadelLevels', 'An international padel rating system']] }
    };
    function txt(t, d){ return '<span class="act-txt"><b>'+t+'</b><small>'+d+'</small></span>'; }
    /* Some portraits are cut-outs on a transparent background; Figma sets a
       soft colour behind each one, so the same colour is set here. */
    var FACE_BG = { 3: '#ffd2a6', 4: '#ffdfdf', 5: '#c4caf0', 6: '#ccdcbd' };
    function bg(n){ return FACE_BG[n] ? ' style="background:'+FACE_BG[n]+'"' : ''; }
    function face(n, extra){ return '<img class="mcard__face'+(extra||'')+'" src="'+I+'card-av'+n+'.webp" alt="" width="32" height="32"'+bg(n)+'>'; }
    function chip(icon, label){ return '<span class="mcard__chip"><img src="'+I+'card-'+icon+'.svg" alt="" width="14" height="14">'+label+'</span>'; }
    function eventCard(kind){
      var play = kind === 'play';
      return '<div class="mcard" aria-hidden="true">' +
        '<img class="mcard__logo" src="'+I+'card-logo.svg" alt="" width="32" height="32">' +
        '<div class="mcard__body">' +
          '<div class="mcard__head"><div class="mcard__titles"><small>Kawan AYO Community</small>' +
            '<b>'+(play ? 'Beginner/First-timer Match All Level 16 pax, Upper Intermediate' : '[3H2C] 120K Intense Rally Match All Level 16 pax, Upper Intermediate')+'</b></div>' +
            '<img src="'+I+'card-padel.svg" alt="" width="20" height="20"></div>' +
          '<div class="mcard__tags">' +
            '<span class="mcard__status mcard__status--'+kind+'">'+(play ? 'Open play' : 'Open Match')+'</span><span class="mcard__sep"></span>' +
            (play ? chip('hand', 'Casual') : chip('zap', 'Competitive')) + chip('clock', '120 Mins') +
          '</div>' +
          (play
            ? '<div class="mcard__reel"><span class="mcard__faces"><span class="mcard__host">'+face(0)+'<img class="mcard__crown" src="'+I+'card-crown.svg" alt="" width="10" height="9"><em>Host</em></span>'+face(1)+face(2)+face(3)+face(4)+'</span><span class="mcard__slot">15 / 16</span></div>'
            : '<div class="mcard__reel"><span class="mcard__faces mcard__faces--team"><span class="mcard__host">'+face(0)+'<em>Host</em></span>'+face(1)+'</span><span class="mcard__vs">VS</span><span class="mcard__faces mcard__faces--team">'+face(3)+face(2)+'</span></div>') +
        '</div></div>';
    }
    function scoreCard(){
      function stepper(n){ return '<span class="scard__step"><img src="'+I+'card-minus.svg" alt="" width="36" height="36"><b>'+n+'</b><img src="'+I+'card-plus.svg" alt="" width="36" height="36"></span>'; }
      return '<div class="scard" aria-hidden="true">' +
        '<div class="scard__players"><img src="'+I+'card-av5.webp" alt="" width="44" height="44"'+bg(5)+'><span class="scard__vs">VS</span><img src="'+I+'card-av6.webp" alt="" width="44" height="44"'+bg(6)+'></div>' +
        '<div class="scard__score">'+stepper(6)+stepper(2)+'<span class="scard__set">1</span></div>' +
      '</div>';
    }
    function subs(links){
      return '<div class="amenu__subs"><div class="amenu__indent">' + links.map(function(l){
        return '<a class="amenu__sub" href="'+l[0]+'">'+txt(l[1], l[2])+ARROW+'</a>';
      }).join('') + '</div></div>';
    }
    function cta(c){ return '<a class="amenu__cta" href="'+c[0]+'">'+c[1]+ARROW+'</a>'; }

    var g = GROUPS;
    menu.innerHTML =
      '<div class="amenu__col">' +
        '<div class="amenu__group"><div class="amenu__head">'+g.play.icon+txt(g.play.title, g.play.desc)+'</div>'+eventCard('play')+'</div>' +
        subs(g.play.links) +
      '</div>' +
      '<div class="amenu__col">' +
        '<div class="amenu__group"><div class="amenu__head">'+g.match.icon+txt(g.match.title, g.match.desc)+'</div>'+eventCard('match')+cta(g.match.cta)+'</div>' +
      '</div>' +
      '<div class="amenu__col">' +
        '<div class="amenu__group"><div class="amenu__head">'+g.score.icon+txt(g.score.title, g.score.desc)+'</div>'+scoreCard()+'</div>' +
        subs(g.score.links) +
      '</div>';
    menu.classList.add('submenu--cascade');
    menu.parentElement.classList.add('has-mega');

    /* Mobile drawer copy: same groups, icon + title, links on an indent. */
    function mGroup(key){
      var o = g[key];
      return '<div class="m-acts__group">' +
        '<div class="m-acts__headrow">'+o.icon+txt(o.title, o.desc)+'</div>' +
        (o.links ? '<div class="m-acts__indent">' + o.links.map(function(l){
          return '<a class="m-acts__sub" href="'+l[0]+'"><b>'+l[1]+'</b><small>'+l[2]+'</small></a>';
        }).join('') + '</div>' : '') +
        (o.cta ? '<a class="m-acts__cta" href="'+o.cta[0]+'">'+o.cta[1]+ARROW+'</a>' : '') +
      '</div>';
    }
    mActs = mGroup('play') + '<span class="m-acts__sep"></span>' + mGroup('match') + '<span class="m-acts__sep"></span>' + mGroup('score');

  })();

  /* Mobile drawer (Figma "Mobile Nav — Open (360)"). Opened by the burger at
     ≤1000px. Booking, Activities (collapsed accordion), For Venue Owners,
     Partner with Us, Blog, then the account
     block (signed in: Profile with the avatar photo, Dashboard), Change
     Language and Log Out — or a Login button when signed out. */
  var syncDrawerLang = function(){};
  var drawerNav = document.querySelector('.ayo-nav');
  if(drawerNav && burger){
    var cartLink = drawerNav.querySelector('.nav-icon[aria-label="Cart"]');
    if(cartLink){
      /* Count is a placeholder until the cart is wired. */
      cartLink.insertAdjacentHTML('beforeend', '<span class="nav-badge" aria-hidden="true">0</span>');
      cartLink.setAttribute('aria-label', 'Cart, 0 items');
    }
    burger.insertAdjacentHTML('beforebegin', '<span class="nav-divider" aria-hidden="true"></span>');
    var CHEV = '<span class="chev" aria-hidden="true"></span>';
    drawer = document.createElement('div');
    drawer.className = 'm-drawer';
    drawer.id = 'm-drawer';
    drawer.hidden = true;
    drawer.innerHTML =
      '<div class="m-drawer__in">' +
        '<div class="m-list" role="group" aria-label="Main">' +
          '<a class="m-link" href="https://ayo.co.id/venues">Booking</a>' +
          '<div class="m-acc">' +
            '<button class="m-link m-acc__btn" type="button" aria-expanded="false" aria-controls="m-acc-activities">Activities'+CHEV+'</button>' +
            '<div class="m-acc__panel m-acts" id="m-acc-activities" hidden>' + mActs + '</div>' +
          '</div>' +
          '<a class="m-link" href="venue.html">For Venue Owners</a>' +
          '<a class="m-link" href="partner.html">Partner with Us</a>' +
          '<a class="m-link" href="#">Blog</a>' +
        '</div>' +
        '<div class="m-account" data-m-auth="in" hidden>' +
          '<a class="m-acct" href="#"><span class="m-acct__ico m-acct__ico--photo"><span data-m-initials aria-hidden="true">AP</span><img src="assets/avatar-1.jpg" alt="" width="32" height="32"></span>Profile</a>' +
          '<a class="m-acct" href="#"><span class="m-acct__ico"><span class="carbon-icon carbon-dashboard" aria-hidden="true"></span></span>Dashboard</a>' +
        '</div>' +
        '<div class="m-sep" data-m-lang-wrap></div>' +
        '<div class="m-acc" data-m-lang-wrap>' +
          '<button class="m-link m-acc__btn" type="button" aria-expanded="false" aria-controls="m-acc-lang">Change Language'+CHEV+'</button>' +
          '<div class="m-acc__panel m-lang" id="m-acc-lang" role="group" aria-label="Language" hidden>' +
            '<button type="button" class="m-lang__opt" data-m-lang="EN" aria-pressed="false"><span class="flag" aria-hidden="true">🇬🇧</span>English<span class="carbon-icon carbon-checkmark" aria-hidden="true"></span></button>' +
            '<button type="button" class="m-lang__opt" data-m-lang="ID" aria-pressed="false"><span class="flag" aria-hidden="true">🇮🇩</span>Bahasa Indonesia<span class="carbon-icon carbon-checkmark" aria-hidden="true"></span></button>' +
          '</div>' +
        '</div>' +
        '<div class="m-sep"></div>' +
        '<button class="m-link m-logout" type="button" data-m-auth="in" data-m-logout hidden>Log Out</button>' +
        '<div class="m-guest" data-m-auth="out"><a class="ayo-btn primary m-login" href="#" data-login>Login</a></div>' +
      '</div>';
    drawerNav.appendChild(drawer);
    scrim = document.createElement('div');
    scrim.className = 'm-scrim';
    scrim.hidden = true;
    document.body.appendChild(scrim);
    burger.setAttribute('aria-controls', 'm-drawer');
    scrim.addEventListener('click', function(){ setMenu(false); });
    drawer.querySelector('[data-m-initials]').nextElementSibling.addEventListener('error', function(){ this.hidden = true; });
    /* Accordions: Activities and Change Language. Both start collapsed. */
    drawer.querySelectorAll('.m-acc__btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
      });
    });
    drawer.addEventListener('click', function(e){ if(e.target.closest('a') && !e.target.closest('[data-login]')) setMenu(false); });
    /* Leaving phone width with the drawer open would strand the scroll lock. */
    var wide = matchMedia('(min-width:1001px)');
    (wide.addEventListener ? wide.addEventListener.bind(wide,'change') : wide.addListener.bind(wide))(function(e){ if(e.matches) setMenu(false); });
    syncDrawerLang = function(code, show){
      drawer.querySelectorAll('[data-m-lang-wrap]').forEach(function(el){ el.hidden = !show; });
      drawer.querySelectorAll('[data-m-lang]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.mLang === code)); });
    };
  }

  /* nav dropdowns — hover (desktop, via CSS) + click/tap (mobile & keyboard) */
  var subTops=[].slice.call(document.querySelectorAll('.ayo-nav-item.has-sub > .nav-top'));
  function closeSubs(except){
    document.querySelectorAll('.ayo-nav-item.has-sub.open').forEach(function(o){
      if(o!==except){ o.classList.remove('open'); var t=o.querySelector('.nav-top'); if(t)t.setAttribute('aria-expanded','false'); }
    });
  }
  subTops.forEach(function(btn){
    btn.addEventListener('click',function(e){ e.preventDefault();
      var item=btn.parentElement, willOpen=!item.classList.contains('open');
      closeSubs(item); item.classList.toggle('open',willOpen); btn.setAttribute('aria-expanded',String(willOpen));
    });
  });
  /* Frontend demo state only. Never retain or send passwords. */
  function readPreference(key){
    try { return JSON.parse(localStorage.getItem(key)); } catch(e){ return null; }
  }
  function savePreference(key, value){
    try {
      if(value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch(e){ /* The controls still work when browser storage is unavailable. */ }
  }

  /* Small shared menu controller: one open menu, keyboard navigation and
     focus returned to its trigger on Escape or selection. */
  var popups = [];
  function closePopups(except){
    popups.forEach(function(p){ if(p !== except) p.close(); });
  }
  function setupPopup(root, button, menu){
    var popup = {
      close: function(restoreFocus){
        var wasOpen = root.classList.contains('open');
        root.classList.remove('open');
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        if(wasOpen && restoreFocus) button.focus();
      },
      open: function(last){
        closePopups(popup); closeSubs(null); setMenu(false);
        root.classList.add('open');
        menu.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        var items = menu.querySelectorAll('[role^="menuitem"]');
        var selected = menu.querySelector('[aria-checked="true"]');
        if(items.length) (last ? items[items.length - 1] : selected || items[0]).focus();
      }
    };
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-controls', menu.id);
    menu.querySelectorAll('[role^="menuitem"]').forEach(function(item){ item.tabIndex = -1; });
    popup.close();
    button.addEventListener('click', function(e){
      e.stopPropagation();
      if(root.classList.contains('open')) popup.close(); else popup.open();
    });
    button.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        e.preventDefault(); popup.open(e.key === 'ArrowUp');
      }
    });
    menu.addEventListener('keydown', function(e){
      var items = [].slice.call(menu.querySelectorAll('[role^="menuitem"]'));
      var i = items.indexOf(document.activeElement);
      if(['ArrowDown','ArrowUp','Home','End'].indexOf(e.key) !== -1){
        e.preventDefault();
        if(e.key === 'Home') i = 0;
        else if(e.key === 'End') i = items.length - 1;
        else i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        if(items[i]) items[i].focus();
      }
      if(e.key === 'Escape'){ e.preventDefault(); popup.close(true); }
    });
    root.addEventListener('focusout', function(e){
      if(!root.contains(e.relatedTarget)) popup.close();
    });
    document.addEventListener('click', function(e){ if(!root.contains(e.target)) popup.close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') popup.close(true); });
    popups.push(popup);
    return popup;
  }
  subTops.forEach(function(b){ b.addEventListener('click', function(){ closePopups(); }); });
  if(burger) burger.addEventListener('click', function(){ closePopups(); closeSubs(null); });

  /* Indonesia offers EN/ID. Other countries use EN without a language control.
     These frontend preferences do not route to a regional backend. */
  var COUNTRIES = [
    {code:'ID', name:'Indonesia', flag:'🇮🇩'},
    {code:'MY', name:'Malaysia', flag:'🇲🇾'},
    {code:'AU', name:'Australia', flag:'🇦🇺'},
    {code:'SG', name:'Singapore', flag:'🇸🇬'}
  ];
  var countryKey = 'ayo-country-v1';
  var countryCode = readPreference(countryKey) || 'ID';
  var countryRoot, countryButton, countryPopup;
  var lang = document.getElementById('lang');
  var indonesiaLanguageKey = 'ayo-indonesia-language-v1';
  var indonesiaLanguage = readPreference(indonesiaLanguageKey) === 'ID' ? 'ID' : 'EN';
  function syncCountryLanguage(){
    if(!lang || !languagePopup) return;
    var isIndonesia = countryCode === 'ID';
    var code = isIndonesia ? indonesiaLanguage : 'EN';
    if(!isIndonesia){
      if(lang.contains(document.activeElement)) countryButton.focus();
      languagePopup.close();
    }
    lang.hidden = !isIndonesia;
    langMenu.querySelectorAll('button').forEach(function(b){
      b.setAttribute('aria-checked', String(b.dataset.code === code));
      if(b.dataset.code === code){
        lang.querySelector('.cur').textContent = code;
        var flag = lang.querySelector('.cur-flag'); if(flag) flag.textContent = b.dataset.flag;
      }
    });
    document.documentElement.dataset.language = code;
    syncDrawerLang(code, isIndonesia);
  }
  if(lang){
    countryRoot = document.createElement('div');
    countryRoot.className = 'country';
    countryRoot.innerHTML =
      '<button class="country-btn" type="button" aria-expanded="false">' +
        '<span class="carbon-icon carbon-location" aria-hidden="true"></span>' +
        '<span data-country-code></span><span class="chev" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="nav-popover country-menu" id="country-menu" role="menu" aria-labelledby="country-menu-title">' +
        '<p class="nav-menu-title" id="country-menu-title">Country / region</p>' +
        COUNTRIES.map(function(c){ return '<button type="button" role="menuitemradio" aria-checked="false" data-country="'+c.code+'"><span class="flag" aria-hidden="true">'+c.flag+'</span><span>'+c.name+'</span><span class="carbon-icon carbon-checkmark menu-check" aria-hidden="true"></span></button>'; }).join('') +
      '</div>';
    lang.parentNode.insertBefore(countryRoot, lang);
    countryButton = countryRoot.querySelector('.country-btn');
    countryPopup = setupPopup(countryRoot, countryButton, countryRoot.querySelector('.country-menu'));
    function renderCountry(){
      var selected = COUNTRIES.find(function(c){ return c.code === countryCode; });
      if(!selected){ selected = COUNTRIES[0]; countryCode = selected.code; }
      countryRoot.querySelector('[data-country-code]').textContent = selected.code;
      countryButton.setAttribute('aria-label', 'Country / region: ' + selected.name);
      countryButton.title = selected.name;
      countryRoot.querySelectorAll('[data-country]').forEach(function(b){ b.setAttribute('aria-checked', String(b.dataset.country === selected.code)); });
      document.documentElement.dataset.country = selected.code;
      syncCountryLanguage();
    }
    renderCountry();
    countryRoot.querySelectorAll('[data-country]').forEach(function(b){
      b.addEventListener('click', function(){
        countryCode = b.dataset.country;
        savePreference(countryKey, countryCode);
        renderCountry(); countryPopup.close(true);
      });
    });

    var langButton = lang.querySelector('.lang-btn');
    var langMenu = lang.querySelector('.lang-menu');
    langMenu.id = 'language-menu';
    langMenu.setAttribute('aria-label', 'Language');
    langMenu.querySelectorAll('button').forEach(function(b){
      b.setAttribute('aria-checked', b.getAttribute('aria-selected') || 'false');
      b.removeAttribute('aria-selected');
    });
    var languagePopup = setupPopup(lang, langButton, langMenu);
    syncCountryLanguage();
    if(drawer) drawer.querySelectorAll('[data-m-lang]').forEach(function(b){
      b.addEventListener('click', function(){
        if(countryCode !== 'ID') return;
        indonesiaLanguage = b.dataset.mLang;
        savePreference(indonesiaLanguageKey, indonesiaLanguage);
        syncCountryLanguage();
      });
    });
    langMenu.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){
        if(countryCode !== 'ID') return;
        indonesiaLanguage = b.dataset.code;
        savePreference(indonesiaLanguageKey, indonesiaLanguage);
        syncCountryLanguage();
        languagePopup.close(true);
      });
    });
  }
  document.addEventListener('click', function(e){ if(!e.target.closest('.ayo-nav-item.has-sub')) closeSubs(null); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSubs(null); });

  /* A local demo session shared by the pages. No password, token, or claim of
     real authentication is stored. Replace this adapter when auth is wired. */
  var sessionKey = 'ayo-demo-session-v1';
  var session = readPreference(sessionKey);
  function validSession(s){ return s && typeof s.name === 'string' && s.name.length > 0 && ['email','phone','google'].indexOf(s.method) !== -1; }
  if(!validSession(session)) session = null;
  var loginBtns = [].slice.call(document.querySelectorAll('[data-login]'));
  var accountRoot, accountButton, accountPopup;
  var navLogin = document.querySelector('.nav-actions [data-login]');
  if(navLogin){
    accountRoot = document.createElement('div');
    accountRoot.className = 'nav-account';
    accountRoot.hidden = true;
    accountRoot.innerHTML =
      '<button class="account-btn" type="button" aria-label="Account menu" aria-expanded="false">' +
        '<span class="account-avatar"><span aria-hidden="true" data-account-initials>AP</span><img src="assets/avatar-1.jpg" alt="" width="36" height="36"></span>' +
      '</button>' +
      '<div class="nav-popover account-menu" id="account-menu" role="menu" aria-label="Account">' +
        '<button type="button" role="menuitem" data-account-profile><span class="carbon-icon carbon-profile" aria-hidden="true"></span>Profil</button>' +
        '<button type="button" role="menuitem" data-account-dashboard><span class="carbon-icon carbon-dashboard" aria-hidden="true"></span>Dasbor</button>' +
        '<button type="button" role="menuitem" data-logout>Keluar</button>' +
      '</div>';
    navLogin.insertAdjacentElement('afterend', accountRoot);
    accountButton = accountRoot.querySelector('.account-btn');
    accountPopup = setupPopup(accountRoot, accountButton, accountRoot.querySelector('.account-menu'));
    accountRoot.querySelector('img').addEventListener('error', function(){ this.hidden = true; });
    accountRoot.querySelector('[data-logout]').addEventListener('click', function(){
      session = null; savePreference(sessionKey, null); accountPopup.close(); renderSession(); navLogin.focus();
    });
  }
  if(drawer) drawer.querySelector('[data-m-logout]').addEventListener('click', function(){
    session = null; savePreference(sessionKey, null); renderSession(); setMenu(false, true);
  });
  function renderSession(){
    loginBtns.forEach(function(b){ b.hidden = Boolean(session); });
    if(drawer){
      drawer.querySelectorAll('[data-m-auth]').forEach(function(el){ el.hidden = (el.dataset.mAuth === 'in') !== Boolean(session); });
      if(session) drawer.querySelector('[data-m-initials]').textContent = session.name.split(/\s+/).map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase();
    }
    if(!accountRoot) return;
    accountRoot.hidden = !session;
    if(session){
      var name = session.name.slice(0,64);
      accountRoot.querySelector('[data-account-initials]').textContent = name.split(/\s+/).map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase();
      accountButton.setAttribute('aria-label', 'Account menu: ' + name);
    } else accountPopup.close();
  }
  renderSession();
  addEventListener('storage', function(e){
    if(e.key === indonesiaLanguageKey || e.key === null){
      indonesiaLanguage = readPreference(indonesiaLanguageKey) === 'ID' ? 'ID' : 'EN'; syncCountryLanguage();
    }
    if(e.key === sessionKey || e.key === null){
      session = readPreference(sessionKey); if(!validSession(session)) session = null; renderSession();
    }
    if(countryRoot && (e.key === countryKey || e.key === null)){
      countryCode = readPreference(countryKey) || 'ID'; renderCountry();
    }
  });

  /* Login and register share a form. These handlers simulate success locally;
     Google is a demo button, never an OAuth request or credential collector. */
  if(loginBtns.length && window.HTMLDialogElement){
    var AUTH = {
      login: {title:'Masuk', ask:'Belum punya akun AYO?', swap:'Daftar', to:'register', placeholder:'Nomor ponsel atau email', label:'Nomor ponsel atau email', type:'text', complete:'username', google:'Masuk dengan Google', submit:'Masuk'},
      register: {title:'Daftar', ask:'Sudah punya akun AYO?', swap:'Masuk', to:'login', placeholder:'Nomor ponsel', label:'Nomor ponsel', type:'tel', complete:'tel', google:'Daftar dengan Google', submit:'Daftar'}
    };
    var dlg = document.createElement('dialog');
    dlg.className = 'auth';
    dlg.setAttribute('aria-labelledby','auth-title');
    dlg.setAttribute('aria-describedby','auth-demo-note');
    dlg.innerHTML =
      '<div class="auth-in">' +
        '<button class="auth-x" type="button" data-auth-close aria-label="Tutup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<h2 id="auth-title"></h2>' +
        '<p class="sub"><span data-auth-ask></span> <a href="#" data-auth-swap></a></p>' +
        '<form class="auth-form" novalidate>' +
          '<label class="auth-label" for="auth-identity" data-auth-label></label>' +
          '<input id="auth-identity" name="username" data-auth-input required aria-describedby="auth-error" autocapitalize="none" spellcheck="false">' +
          '<label class="auth-label" for="auth-password">Kata sandi</label>' +
          '<div class="auth-password"><input id="auth-password" name="password" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi" required aria-describedby="auth-error"><button type="button" class="auth-password-toggle" aria-controls="auth-password" aria-label="Tampilkan kata sandi" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' +
          '<p class="auth-error" id="auth-error" role="alert" hidden></p>' +
          '<button class="ayo-btn primary auth-next" type="submit" disabled></button>' +
        '</form>' +
        '<p class="auth-or">atau</p>' +
        '<button class="ayo-btn ghost auth-google" type="button">' +
          '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span data-auth-google></span>' +
        '</button>' +
        '<p class="auth-demo-note" id="auth-demo-note">Demo frontend. Gunakan data contoh; akun asli tidak diperlukan.</p>' +
      '</div>';
    document.body.appendChild(dlg);
    var form = dlg.querySelector('form');
    var authInput = dlg.querySelector('[data-auth-input]');
    var password = dlg.querySelector('#auth-password');
    var passwordToggle = dlg.querySelector('.auth-password-toggle');
    var authNext = dlg.querySelector('.auth-next');
    var authSwap = dlg.querySelector('[data-auth-swap]');
    var authError = dlg.querySelector('.auth-error');
    var mode = 'login';
    function setPasswordVisibility(show){
      password.type = show ? 'text' : 'password';
      passwordToggle.setAttribute('aria-pressed', String(show));
      passwordToggle.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    }
    function clearAuthError(){
      authError.hidden = true; authError.textContent = '';
      authInput.removeAttribute('aria-invalid'); password.removeAttribute('aria-invalid');
    }
    function authSet(name){
      mode = name; var m = AUTH[name];
      form.reset(); clearAuthError(); setPasswordVisibility(false);
      dlg.querySelector('#auth-title').textContent = m.title;
      dlg.querySelector('[data-auth-ask]').textContent = m.ask;
      authSwap.textContent = m.swap;
      dlg.querySelector('[data-auth-google]').textContent = m.google;
      dlg.querySelector('[data-auth-label]').textContent = m.label;
      authNext.textContent = m.submit;
      authInput.type = m.type; authInput.autocomplete = m.complete; authInput.placeholder = m.placeholder;
      password.autocomplete = name === 'register' ? 'new-password' : 'current-password';
      authNext.disabled = true;
    }
    function signIn(method){
      var identity = authInput.value.trim();
      var name = method === 'email' ? identity.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,function(c){ return c.toUpperCase(); }) : 'AYO Player';
      session = {name:name.slice(0,64), method:method};
      savePreference(sessionKey, session); renderSession();
      dlg.close('success');
      if(accountButton) accountButton.focus();
    }
    authSet('login');
    loginBtns.forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault(); closePopups(); closeSubs(null); setMenu(false);
        authSet('login'); dlg.showModal(); authInput.focus();
      });
    });
    authSwap.addEventListener('click', function(e){ e.preventDefault(); authSet(AUTH[mode].to); authInput.focus(); });
    passwordToggle.addEventListener('click', function(){ setPasswordVisibility(password.type === 'password'); });
    dlg.querySelector('[data-auth-close]').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });
    form.addEventListener('input', function(){
      clearAuthError(); authNext.disabled = !authInput.value.trim() || !password.value.trim();
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var identity = authInput.value.trim();
      var email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity);
      var phone = /^\+?[\d\s().-]+$/.test(identity) && /^\d{8,15}$/.test(identity.replace(/\D/g,''));
      var message = (!phone && (!email || mode === 'register')) ? (mode === 'register' ? 'Masukkan nomor ponsel yang valid.' : 'Masukkan email atau nomor ponsel yang valid.') : !password.value.trim() ? 'Masukkan kata sandi untuk melanjutkan.' : '';
      if(message){
        authError.textContent = message; authError.hidden = false;
        var field = !phone && (!email || mode === 'register') ? authInput : password;
        field.setAttribute('aria-invalid','true'); field.focus(); return;
      }
      signIn(email ? 'email' : 'phone');
    });
    dlg.querySelector('.auth-google').addEventListener('click', function(){ signIn('google'); });
    dlg.addEventListener('close', function(){ authSet('login'); });
  }

  /* reveal on scroll */
  var reveals=[].slice.call(document.querySelectorAll('.reveal'));
  if(rm || !('IntersectionObserver' in window)){ reveals.forEach(function(el){ el.classList.add('in'); }); }
  else{
    var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } }); },{threshold:.12});
    reveals.forEach(function(el){ rio.observe(el); });
  }
})();

