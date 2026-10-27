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
  function setMenu(open){
    if(!links) return;
    links.classList.toggle('open', open);
    if(burger){
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    }
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(!links.classList.contains('open')); });
  if(links) links.addEventListener('click', function(e){ if(e.target.tagName==='A') setMenu(false); });
  /* Escape already closes the dropdowns below; the menu should go with them. */
  addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });

  /* nav float + hide going down, show coming back up (rAF-throttled) */
  var nav=document.querySelector('.nav'), tick=false, lastY=Math.max(0,scrollY);
  function navCheck(){
    if(!nav){ tick=false; return; }
    var y=Math.max(0,scrollY), dy=y-lastY;
    nav.classList.toggle('scrolled', y>60);
    /* An open menu or focus inside the nav means someone is using it — sliding
       it out from under them would be hostile. Near the top there is nothing to
       reclaim, so it stays put there too. */
    if(nav.querySelector('.open') || nav.contains(document.activeElement) || y<120){
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

  /* nav dropdowns — hover (desktop, via CSS) + click/tap (mobile & keyboard) */
  var subTops=[].slice.call(document.querySelectorAll('.nav-item.has-sub > .nav-top'));
  function closeSubs(except){
    document.querySelectorAll('.nav-item.has-sub.open').forEach(function(o){
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
  document.addEventListener('click', function(e){ if(!e.target.closest('.nav-item.has-sub')) closeSubs(null); });
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
  function renderSession(){
    loginBtns.forEach(function(b){ b.hidden = Boolean(session); });
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
          '<button class="btn primary auth-next" type="submit" disabled></button>' +
        '</form>' +
        '<p class="auth-or">atau</p>' +
        '<button class="btn ghost auth-google" type="button">' +
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

