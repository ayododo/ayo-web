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
    nav.classList.toggle('floating', y>60);
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


  /* reveal on scroll */
  var reveals=[].slice.call(document.querySelectorAll('.reveal'));
  if(rm || !('IntersectionObserver' in window)){ reveals.forEach(function(el){ el.classList.add('in'); }); }
  else{
    var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } }); },{threshold:.12});
    reveals.forEach(function(el){ rio.observe(el); });
  }
})();
