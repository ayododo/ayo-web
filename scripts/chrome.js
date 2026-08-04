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
  navCheck();

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
  /* language switcher */
  var lang=document.getElementById('lang'), langBtn=lang&&lang.querySelector('.lang-btn'), langCur=lang&&lang.querySelector('.cur');
  function closeLang(){ if(lang){ lang.classList.remove('open'); if(langBtn)langBtn.setAttribute('aria-expanded','false'); } }
  if(lang){
    langBtn.addEventListener('click',function(e){ e.stopPropagation();
      var willOpen=!lang.classList.contains('open'); closeSubs(null); lang.classList.toggle('open',willOpen); langBtn.setAttribute('aria-expanded',String(willOpen));
    });
    lang.querySelectorAll('.lang-menu button').forEach(function(b){
      b.addEventListener('click',function(e){ e.stopPropagation();
        lang.querySelectorAll('.lang-menu button').forEach(function(x){ x.setAttribute('aria-selected', String(x===b)); });
        langCur.textContent=b.dataset.code;
        var cf=lang.querySelector('.cur-flag'); if(cf)cf.textContent=b.dataset.flag;
        closeLang();
      });
    });
  }

  document.addEventListener('click',function(e){ if(!e.target.closest('.nav-item.has-sub')) closeSubs(null); if(!e.target.closest('#lang')) closeLang(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeSubs(null); closeLang(); } });


  /* auth dialog — built here, not in five pages
     ------------------------------------------------------------------------
     The nav is still per-page markup, so writing this form into every page
     would be five copies of one thing. <dialog> supplies the backdrop, the
     focus trap and Esc; nothing is lost by injecting it, because with the
     script off it could not be opened either way.

     Sign in and sign up are one dialog in two modes, not two dialogs. They are
     the same form — heading, one field, continue, a rule, a Google button —
     and only four strings differ. Two copies would drift, and each has to link
     to the other anyway, so switching is a swap rather than a second open.

     NOT WIRED: there is no auth endpoint. The field is never read, nothing is
     sent and nothing is stored — Continue closes the dialog and that is all.
     Point both buttons at the real login before this ships anywhere real. */
  var loginBtns = [].slice.call(document.querySelectorAll('[data-login]'));
  if(loginBtns.length && window.HTMLDialogElement){
    var AUTH = {
      login: {
        title: 'Masuk', ask: 'Belum punya akun AYO?', swap: 'Daftar', to: 'register',
        /* Sign-in accepts either, so the keyboard stays general. */
        placeholder: 'Nomor Ponsel atau Email', type: 'text', complete: 'username',
        label: 'Nomor ponsel atau email', google: 'Masuk dengan Google'
      },
      register: {
        title: 'Daftar', ask: 'Sudah punya akun AYO?', swap: 'Masuk', to: 'login',
        /* Sign-up takes a number only, so type=tel brings up the right keypad. */
        placeholder: 'Nomor Ponsel', type: 'tel', complete: 'tel',
        label: 'Nomor ponsel', google: 'Daftar dengan Google'
      }
    };

    var dlg = document.createElement('dialog');
    dlg.className = 'auth';
    dlg.setAttribute('aria-labelledby', 'auth-title');
    dlg.innerHTML =
      '<div class="auth-in">' +
        '<button class="auth-x" type="button" data-auth-close aria-label="Tutup">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>' +
        '</button>' +
        '<h2 id="auth-title"></h2>' +
        '<p class="sub"><span data-auth-ask></span> <a href="#" data-auth-swap></a></p>' +
        '<input data-auth-input>' +
        '<button class="btn primary auth-next" type="button" disabled>Selanjutnya</button>' +
        '<p class="auth-or">atau</p>' +
        '<button class="btn ghost auth-google" type="button">' +
          '<svg viewBox="0 0 48 48" aria-hidden="true">' +
            '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
            '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
            '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
            '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
          '</svg><span data-auth-google></span></button>' +
      '</div>';
    document.body.appendChild(dlg);

    var authInput  = dlg.querySelector('[data-auth-input]');
    var authNext   = dlg.querySelector('.auth-next');
    var authSwap   = dlg.querySelector('[data-auth-swap]');
    var authGoogle = dlg.querySelector('[data-auth-google]');
    var mode = 'login';

    function authSet(name){
      mode = name;
      var m = AUTH[name];
      dlg.querySelector('#auth-title').textContent = m.title;
      dlg.querySelector('[data-auth-ask]').textContent = m.ask;
      authSwap.textContent = m.swap;
      authGoogle.textContent = m.google;
      authInput.type = m.type;
      authInput.name = name;
      authInput.autocomplete = m.complete;
      authInput.placeholder = m.placeholder;
      authInput.setAttribute('aria-label', m.label);
      /* Switching mode changes what is being asked for, so a half-typed answer
         to the other question should not carry over. */
      authInput.value = '';
      authNext.disabled = true;
    }
    authSet('login');

    loginBtns.forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault();
        authSet('login');
        dlg.showModal();
        authInput.focus();            /* the field is the point of the dialog */
      });
    });
    /* Sign in and sign up point at each other: a swap in place, not a close and
       a second open, so the dialog never blinks. */
    authSwap.addEventListener('click', function(e){
      e.preventDefault();
      authSet(AUTH[mode].to);
      authInput.focus();
    });
    dlg.querySelector('[data-auth-close]').addEventListener('click', function(){ dlg.close(); });
    /* Clicking the backdrop lands on the dialog itself, never on its contents. */
    dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });
    /* Nothing to submit until something is typed, and the button says so. */
    authInput.addEventListener('input', function(){ authNext.disabled = !authInput.value.trim(); });
    /* Always reopens on sign in, whichever mode it was left in. */
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
