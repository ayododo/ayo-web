/* ==========================================================================
   AYO — Open Play (host): Mini UI cards, part 1
   Tabs: Buat Sesi (op-s01–s04), Undang Co-host (op-c01–c03), Peserta
   (op-p01–p03). Part 2 (Skor Live, Pembayaran, Bagikan & Superhost) is
   more.js, which reuses the parts exported here as window.AyoOP.

   Page design: Figma section "Open Play: Host" 26953:69335 (ID). Every card
   has hidden "Motion · <card> · Step n" frames: the flows below play those
   steps in order. Content sources (read only): PRD Open Play
   HOS5cFYe4Fj7gqJumLpxsR, PRD CoHost uTu6BPbSABqg5O2Zb3aOXu, PRD Waiting List
   Cc2lSec0ppahCuLDXBbFq2 (see the staging board 28398:16217).

   Registers with the shared engine (components/mini-ui/mini-ui.js, loaded
   first). The first page of each card is its static frame (reduced motion);
   PREP sets the opening state when the flow starts from somewhere else.
   Copy is Indonesian; "Open Play" is never translated. People are
   fictional, photos from assets/scoring/hero-faces.
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on;

  /* ---------- Language ----------
     Copy is written in Indonesian. On the English page (<html lang="en">)
     every text node of a card and every string a flow writes is looked up in
     window.AyoOPen (i18n-en.js); the motion is the same. */
  var EN = document.documentElement.lang === 'en' ? (window.AyoOPen || {}) : null;
  function L(s){ return EN && EN[s] != null ? EN[s] : s; }
  function esc(s){ return s.replace(/&/g, '&amp;'); }
  function trHTML(html){
    if(!EN) return html;
    return html.replace(/>([^<]+)</g, function(m, txt){
      var k = txt.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      if(!k || EN[k] == null) return m;
      var lead = txt.match(/^\s*/)[0], tail = txt.match(/\s*$/)[0];
      return '>'+lead+esc(EN[k])+tail+'<';
    });
  }
  // Register cards with their pages and overlays in the page's language.
  function add(defs){
    if(EN) Object.keys(defs.cards).forEach(function(k){
      var c = defs.cards[k], ex = c.extra;
      c.pages = c.pages.map(trHTML);
      if(ex) c.extra = function(){ return trHTML(ex()); };
    });
    M.add(defs);
  }

  /* ---------- People (fictional) ---------- */
  var P = {dimas:[0,'Dimas Pratama'], laras:[1,'Laras Ayu'], rangga:[2,'Rangga Wijaya'], rara:[3,'Rara Amelia'],
           bima:[4,'Bima Santoso'], sinta:[5,'Sinta Dewi'], yoga:[6,'Yoga Pamungkas'], arif:[7,'Arif Kurniawan']};

  /* ---------- Icons ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var I = {
    back: h.I.back, share: h.I.share, more: h.I.more, chev: h.I.chev, plus: h.I.plus, close: h.I.close,
    chevL: S+'<path d="m15 6-6 6 6 6"/></svg>',
    down: S+'<path d="m6 9 6 6 6-6"/></svg>',
    up: S+'<path d="m6 15 6-6 6 6"/></svg>',
    cal: S+'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M9 3v4"/><path d="M15 3v4"/></svg>',
    pin: S+'<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    user: S+'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6"/></svg>',
    users: S+'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.4 3-5.2 6-5.2s5.5 1.8 6 5.2"/><path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2"/><path d="M18 14.9c1.8.6 2.8 2.2 3 5.1"/></svg>',
    money: S+'<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/></svg>',
    search: S+'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
    trash: S+'<path d="M5 7h14"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>',
    info: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    plusC: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7"/><path d="M8.5 12h7"/></svg>',
    history: S+'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4h4"/><path d="M12 7.5V12l3 2"/></svg>',
    flag: S+'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>',
    alert: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V13"/><path d="M12 16.3v.2"/></svg>',
    edit: S+'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
    uPlus: S+'<circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><path d="M18.5 8v6"/><path d="M15.5 11h6"/></svg>',
    uX: S+'<circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><path d="m16 8.5 5 5"/><path d="m21 8.5-5 5"/></svg>',
    uOut: S+'<circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><path d="M16 11h5.5"/><path d="m19 8.5 2.5 2.5-2.5 2.5"/></svg>',
    uCheck: S+'<circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><path d="m15.5 11 2 2 4-4"/></svg>',
    calRe: S+'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M9 15.5a3 3 0 1 0 1-2.3"/><path d="M9 12.5v1.6h1.6"/></svg>',
    sort: S+'<path d="M4 6h9"/><path d="M4 12h6"/><path d="M4 18h3"/><path d="M17 5v14"/><path d="m14 16 3 3 3-3"/></svg>',
    mail: S+'<rect x="3" y="5.5" width="15" height="12" rx="2"/><path d="m3.5 7 7 5 7-5"/><path d="M15 19.5h6"/><path d="m18.5 17 2.5 2.5-2.5 2.5"/></svg>',
    note: S+'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3v3"/><path d="M15 3v3"/><path d="M8.5 11h7"/><path d="M8.5 15h4"/></svg>',
    lock: S+'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>',
    racket: S+'<ellipse cx="14" cy="9" rx="5.5" ry="6" transform="rotate(40 14 9)"/><path d="M9.6 13.6 4 19.5"/></svg>',
    bolt: S+'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/></svg>',
    chat: S+'<path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5z"/><path d="M9 10.5h.01"/><path d="M12 10.5h.01"/><path d="M15 10.5h.01"/></svg>',
    level: S+'<path d="M3.5 17.5l5-6 4 3.5 7.5-9"/><path d="M15.5 6h4.5v4.5"/></svg>',
    fem: S+'<circle cx="12" cy="9" r="4.5"/><path d="M12 13.5V21"/><path d="M9 18h6"/></svg>',
    clock: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    filter: S+'<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>',
    card: S+'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
    shield: S+'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    link: S+'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    del: S+'<path d="M8 6h12v12H8l-5-6z"/><path d="m12 10 4 4"/><path d="m16 10-4 4"/></svg>',
    // PadelLevels mark (the PRD's own glyph, also used on the Open Match page)
    pl: '<svg aria-hidden="true" viewBox="0 0 12 12" fill="none"><path d="M7.01212 8.10842L11.4 2.08982L10.9786 1.80002L7.01464 7.22838L5.04848 3.94426L0.900001 10.0049L5.02664 4.79462L7.01212 8.10842Z" fill-rule="evenodd" fill="#D83232"/><path d="M7.01212 10.2L11.3339 4.23407L10.9128 3.94427L7.01492 9.32028L5.04876 6.03588L1.9122 9.91387L5.02692 6.88624L7.01212 10.2Z" fill-rule="evenodd" fill="#D83232"/></svg>',
    crown: '<svg class="op-crown" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ec2435"/></svg>',
    pinFill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#2c2c2c" fill-rule="evenodd" d="M12 2.2c-4.3 0-7.8 3.4-7.8 7.7 0 5.6 6.4 11.2 7 11.7.5.4 1.1.4 1.6 0 .6-.5 7-6.1 7-11.7 0-4.3-3.5-7.7-7.8-7.7zm0 2c3.2 0 5.8 2.5 5.8 5.7 0 3.8-4.2 8.1-5.8 9.6-1.6-1.5-5.8-5.8-5.8-9.6 0-3.2 2.6-5.7 5.8-5.7zm0 2.6a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm0 2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>',
    tick: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3.4 6.2 1.7 1.7 3.5-3.6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg class="op-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" fill="#f5a623"/></svg>'
  };
  function ic(n, cls, el){ return '<span class="op-ic'+(cls?' '+cls:'')+'"'+(el?' data-el="'+el+'"':'')+'>'+I[n]+'</span>'; }
  var AYO = '<img class="op-ayo" src="assets/logo.svg" alt="AYO" width="22" height="12">';

  /* ---------- Small parts ---------- */
  function av(k, size){ return '<img class="op-av" style="width:'+size+'px;height:'+size+'px" src="assets/scoring/hero-faces/p'+P[k][0]+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function ini(ch, size){ return '<span class="op-ini" style="width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.4)+'px">'+ch+'</span>'; }
  function role(k, size, r){ return '<span class="op-avw">'+av(k, size)+'<span class="op-role op-role--'+(r==='Host'?'host':'co')+'">'+r+'</span></span>'; }
  function slot(size, q){ return '<span class="op-slot" style="width:'+size+'px;height:'+size+'px">'+(q?'<b>?</b>':'')+'</span>'; }
  function lv(kind, val, el){
    var cls = kind === 'y' ? ' op-lv--y' : kind === 'r' ? ' op-lv--r' : '';
    return '<span class="op-lv'+cls+'"'+(el?' data-el="'+el+'"':'')+'>'+I.pl+(kind === 'lock' ? '<span class="op-ic op-ic--sm op-ic--mut" style="width:9px;height:9px">'+I.lock+'</span>' : val)+'</span>';
  }
  function tag(text, kind, icon){ return '<span class="op-tag op-tag--'+kind+'">'+(icon||'')+text+'</span>'; }
  function name(k, sub){ return '<span class="op-name"><b>'+P[k][1]+'</b><span>'+(sub || '@'+k)+'</span></span>'; }
  function btn(label, el, mod){ return '<span class="op-btn'+(mod?' op-btn--'+mod:'')+'"'+(el?' data-el="'+el+'"':'')+'>'+label+'</span>'; }
  function foot(inner, el){ return '<div class="op-foot"'+(el?' data-el="'+el+'"':'')+'>'+inner+'</div>'; }
  function headIcons(left){ return h.head('<span class="mu-ico">'+(left === 'chev' ? I.chevL : I.back)+'</span><span class="mu-head__sp"></span><span class="mu-ico">'+I.share+'</span><span class="mu-ico" data-el="more">'+I.more+'</span>'); }
  function headT(title, sub, right, close){ return h.head('<span class="mu-ico">'+(close ? I.close : I.back)+'</span><span class="mu-head__title">'+title+(sub?'<span class="mu-head__sub">'+sub+'</span>':'')+'</span><span class="mu-head__sp"></span>'+(right||'')); }
  function pop(el){ el.classList.remove('mu-new'); el.offsetWidth; el.classList.add('mu-new'); }
  function activate(a, name){
    [].forEach.call(a.stage.querySelectorAll('.mu-screen .mu-page'), function(p){ p.classList.toggle('is-active', p.dataset.page === name); p.classList.remove('is-behind'); });
  }
  // Scroll a page's content (not only the active one) without animating.
  function preset(a, page, y){
    var sc = a.stage.querySelector('[data-page="'+page+'"] .mu-scroll');
    sc.classList.add('no-anim'); sc.style.setProperty('--mu-y', (-y)+'px'); sc.offsetHeight; sc.classList.remove('no-anim');
  }
  // Inner scroll of a tall sheet (its content slides up inside the sheet).
  function sheetY(a, name, y, dur){
    var inr = a.el(name).querySelector('.op-in');
    inr.style.transitionDuration = (dur || 800)+'ms'; inr.style.transform = 'translateY('+(-y)+'px)';
    return a.wait((dur || 800) + 120);
  }
  function offIn(a, name, el){ var t = a.el(el), inr = a.el(name).querySelector('.op-in'); return t.getBoundingClientRect().top - inr.getBoundingClientRect().top; }
  // Close a sheet without its slide (when the next page replaces it).
  function quietClose(a, name){ var s = a.el(name); s.classList.add('no-anim'); s.classList.remove('is-on'); a.el('dim').classList.remove('is-on'); s.offsetHeight; s.classList.remove('no-anim'); }
  // Scroll so an element sits just above the page's fixed footer (the
  // engine's scrollBottom only knows the header).
  function scrollAbove(a, n, dur){
    var t = a.el(n), pg = t.closest('.mu-page'), scr = a.stage.querySelector('.mu-screen');
    var vis = parseFloat(scr.style.getPropertyValue('--mu-vis-h')) || 382, hd = pg.querySelector('.mu-head'), ft = pg.querySelector('.op-foot');
    return a.scroll(t.offsetTop + t.offsetHeight - (vis - (hd ? hd.offsetHeight : 0) - (ft ? ft.offsetHeight : 0)) + 8, dur);
  }
  function enable(a, el){ var b = a.el(el); b.classList.remove('op-btn--off'); }
  // Typing on an on-screen keyboard: each key lights as its character lands.
  function keys(a, kb, field, text, speed){
    var f = a.el(field), i = 0;
    function step(){
      var ch = text.charAt(i), k = a.el(kb).querySelector('[data-k="'+ch.toUpperCase()+'"]');
      if(k){ k.classList.add('is-press'); setTimeout(function(){ k.classList.remove('is-press'); }, 130); }
      f.textContent = text.slice(0, ++i);
      return i < text.length ? a.wait(speed || 170).then(step) : a.wait(260);
    }
    f.textContent = ''; return a.wait(120).then(step);
  }
  function kbOn(a, kb, v){ on(a.el(kb), 'is-on', v); return a.wait(v ? 380 : 320); }
  function numKb(el){
    var k = ['1','2','3','–','4','5','6','spasi','7','8','9','del',',','0','.','ok'];
    return '<div class="op-kb op-kb--num" data-el="'+el+'">'+k.map(function(c){
      if(c === 'del') return '<span class="op-k2">'+I.del.replace('<svg','<svg style="width:11px;height:11px"')+'</span>';
      if(c === 'ok') return '<span class="op-ok" data-el="'+el+'-ok">'+I.check+'</span>';
      return '<span'+(c === '–' || c === 'spasi' ? ' class="op-k2"' : '')+' data-k="'+c+'">'+c+'</span>';
    }).join('')+'</div>';
  }
  function abcKb(el){
    return '<div class="op-kb op-kb--abc" data-el="'+el+'">'+['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(function(r){
      return '<div>'+r.split('').map(function(c){ return '<span data-k="'+c+'">'+c+'</span>'; }).join('')+'</div>'; }).join('')+'</div>';
  }

  /* =====================================================================
     BUAT SESI — the Create Open Play form (Figma S01–S04)
     ===================================================================== */
  function fld(label, value, req, right, el, ph, vel){
    return '<div class="op-fld"'+(el?' data-el="'+el+'"':'')+'><div class="mu-col mu-grow"><span class="op-fld__l">'+label+(req?'<i class="op-req">*</i>':'')+'</span>'+
      '<span class="op-fld__v"'+(vel?' data-el="'+vel+'"':'')+'>'+(value || (ph ? '<span class="op-fld__p">'+ph+'</span>' : ''))+'</span></div>'+(right||'')+'</div>';
  }
  function form(o){
    o = o || {};
    var cas = o.mode === 'cas';
    return h.page('form', headT('Buat Open Play'),
      '<div class="op-form'+(cas?' is-casual':'')+'" data-el="form">'+
      '<div class="op-link" style="padding-top:2px">'+ic('note')+'Gunakan template aktivitas<span class="op-v"></span>'+ic('chev')+'</div>'+
      fld('Nama Aktivitas', 'Fun Padel Kawan AYO Chapter Bogor Area', true)+
      fld('Deskripsi', 'Main puas, main aman, main nyaman. Yuk gabung!')+
      '<span class="op-band"></span>'+
      '<span class="op-sec" data-el="sport-sec">Olahraga &amp; Komunitas<i>*</i></span>'+
      '<div class="op-group">'+fld('Kategori Olahraga', o.cat === undefined ? 'Padel' : o.cat, true, ic('down'), 'f-cat', 'Pilih cabang olahraga', 'cat-v')+
        fld('Komunitas', 'Purple Padel Club', true, ic('down'))+'</div>'+
      '<div class="mu-seg" data-el="mode" data-on="'+(cas?1:0)+'"><span class="mu-seg__knob"></span>'+
        '<span class="mu-seg__i'+(cas?'':' is-on')+'" data-el="mode-0">Kompetitif</span><span class="mu-seg__i'+(cas?' is-on':'')+'" data-el="mode-1">Santai</span></div>'+
      '<div class="mu-tint op-info" data-el="info">'+
        '<img class="op-pl op-only-comp" src="assets/open-match/padellevels.svg" alt="PadelLevels" width="79" height="16">'+
        '<span class="mu-t mu-b" data-el="info-t">'+(cas?'Ini untuk main santai dan seru-seruan':'Ini untuk pertandingan serius')+'</span>'+
        '<span class="mu-s" data-el="info-s">'+(cas?'Skor tidak memengaruhi rating skill kamu.':'Segera Hadir - Skor dari game kompetitif akan langsung memengaruhi rating skill kamu.')+'</span></div>'+
      fld('Preferensi Skill', o.skill || '', true, ic('down'), 'f-skill', 'Pilih rentang level', 'skill-v')+
      '<span class="op-sec" data-el="tl-sec">Waktu &amp; Lokasi<i>*</i></span>'+
      '<div class="op-bk'+(o.booked?' is-booked':'')+'" data-el="bk" style="display:flex;flex-direction:column;gap:7px">'+
        '<div class="op-bkrow" data-el="bk-row">Gunakan jadwal booking kamu di '+AYO+ic('plusC')+'</div>'+
        '<div class="op-tl" data-el="tl"><b>Sen, 17 Agu 2026 · 14:00 - 17:00</b>'+tag('Booked via AYO','booked')+
          '<b>Kawan AYO Arena Setiabudhi</b><span class="mu-s">Lapangan A, Lapangan F, Lapangan C</span><span class="mu-s">Jl. Hankam Leuwimalang, Cisarua, Kabupaten Bogor</span></div>'+
        '<span class="mu-s" style="font-size:9.5px">Atau <u class="op-u">Masukkan Jadwal Manual</u></span></div>'+
      '<span class="op-sec">CoHost</span>'+
      '<div class="op-co"><div class="op-co__r">Jumlah CoHost Ditugaskan<b>0</b></div><div class="mu-row">'+slot(22, true)+slot(22, true)+'<span class="mu-grow"></span>'+ic('chev')+'</div></div>'+
      '<span class="op-sec" data-el="q-sec">Peserta</span>'+
      '<div class="op-qbox" data-el="qbox"><div class="op-qrow">Jumlah Peserta<span class="op-step"><i>–</i><b data-el="q-n">'+(o.qty||6)+'</b><i>+</i></span></div>'+
        '<div class="op-cbrow"><span class="op-cb is-on"></span><span>Host dihitung sebagai peserta<br><b>Slot tersedia: <span data-el="q-slot">'+((o.qty||6)-1)+'</span> peserta</b></span></div></div>'+
      '<span class="op-band"></span>'+
      '<div class="op-links" data-el="links">'+
        '<span class="op-link" data-el="fee-row"><span>Biaya Pendaftaran<i class="op-req">*</i></span><span class="op-v" data-el="fee-v">'+(o.fee||'')+'</span>'+ic('chev')+'</span>'+
        '<span class="op-link"><span>Privasi<i class="op-req">*</i></span><span class="op-v"></span>'+ic('chev')+'</span>'+
        '<span class="op-link">Pengaturan Lanjutan<span class="op-v"></span>'+ic('chev')+'</span>'+
        '<span class="op-link">Waiting List Otomatis<span class="mu-toggle"></span></span></div>'+
      btn('Selesaikan Pengaturan', 'finish', 'off')+
      '</div>');
  }
  function catSheet(){
    var rows = ['Badminton','Squash','Padel','Tenis Meja','Tenis','Pickleball'].map(function(s, i){ return '<div data-el="cat-'+i+'">'+s+'<span class="mu-radio"></span></div>'; }).join('');
    return '<div class="mu-sheet op-sheet" data-el="sh-cat"><div class="op-sheet__t">Cabang Olahraga'+h.ico('close')+'</div><div class="op-rlist" data-el="cats">'+rows+'</div>'+btn('Simpan', 'cat-save', 'off')+'</div>';
  }
  function thumb(i){ return '<span class="op-thumb op-thumb--'+i+'"></span>'; }
  function venueSheet(){
    var v = [['Kawan AYO Arena Setiabudhi','Kota Bandung','Padel · Tenis · Pickleball'],['Kawan AYO Arena Cimahi','Kota Cimahi','Padel · Tenis']];
    return '<div class="mu-sheet op-sheet" data-el="sh-venue"><div class="op-sheet__t">Pilih Venue'+h.ico('close')+'</div>'+
      '<span class="mu-s" style="font-size:9px">Hanya menampilkan booking venue padel kamu di AYO.</span>'+
      '<div class="op-search">'+ic('search')+'Cari venue</div>'+
      v.map(function(x, i){ return '<div class="op-venue" data-el="venue-'+i+'">'+thumb(i)+'<div class="mu-col mu-grow" style="gap:1px"><b style="font-size:10.5px">'+x[0]+'</b><span class="mu-s" style="font-size:8.5px">'+x[1]+'</span><span class="mu-s" style="font-size:8.5px">'+x[2]+'</span></div></div>'; }).join('')+'</div>';
  }
  function sched(){
    var days = [['Sen','17 Agu',1],['Sel','18 Agu'],['Rab','19 Agu',1],['Kam','20 Agu'],['Jum','21 Agu']].map(function(d, i){ return '<span class="op-day'+(i===0?' is-on':'')+'"><small>'+d[0]+'</small>'+d[1]+(d[2]?'<i></i>':'')+'</span>'; }).join('');
    function court(n, el){ return '<div class="op-court" data-el="'+el+'"><span>'+n+'</span><span class="op-cb"></span></div>'; }
    return h.page('sched', headT('Pilih Jadwal', '', '<span class="mu-link" style="text-decoration:underline">Reset</span>'),
      '<div class="mu-row" style="gap:6px">'+ic('cal')+'<div class="op-dayrow">'+days+'</div></div>'+
      '<div class="op-venue op-venue--sel">'+thumb(0)+'<div class="mu-col mu-grow" style="gap:1px"><b style="font-size:10.5px">Kawan AYO Arena Setiabudhi</b><span class="mu-s" style="font-size:8.5px">Kota Bandung</span><span class="mu-s" style="font-size:8.5px">3 lapangan tersedia di tanggal terpilih</span></div>'+ic('down')+'</div>'+
      '<span class="op-sec">14:00 - 15:00</span>'+court('Lapangan A','ct-a')+court('Lapangan D','ct-d')+
      '<span class="op-sec" data-el="t15">15:00 - 16:00</span>'+court('Lapangan C','ct-c1')+court('Lapangan F','ct-f')+
      '<span class="op-sec" data-el="t16">16:00 - 17:00</span>'+court('Lapangan C','ct-c2')+'<span class="op-sp"></span>',
      foot(btn('Lanjutkan', 'sched-go', 'off')));
  }
  function skillSheet(){
    return '<div class="mu-sheet op-sheet op-sheet--tall" data-el="sh-skill"><div class="op-in">'+
      '<div class="op-sheet__t">Preferensi Skill'+h.ico('close')+'</div>'+
      '<span class="mu-h" style="font-size:10.5px">Dasar Rating</span>'+
      '<span class="mu-s" style="font-size:8.5px">Pilih sistem rating yang ditampilkan sebagai preferensi level Open Play kamu.</span>'+
      '<div class="op-chips"><span class="op-chip is-on">PadelLevels</span><span class="op-chip">Nilai Sendiri</span></div>'+
      '<span class="mu-s" style="font-size:8.5px;color:#17171a">Baru di PadelLevels? Pemain yang baru aktivasi belum punya level (TBD). Atur minimum ke 0.00 agar mereka bisa ikut.</span>'+
      '<div class="op-minmax" data-el="minmax">'+fld('Minimum', '0.00', true, '', 'f-min', '', 'min-v')+'<i></i>'+fld('Maksimum', '7.00', true, '', 'f-max', '', 'max-v')+'</div>'+
      '<div class="op-note">'+ic('info')+'Pemain di luar rentang ini tetap bisa mengirim permintaan bergabung.</div>'+
      btn('Simpan', 'skill-save')+'</div></div>';
  }
  function feeSheet(){
    return '<div class="mu-sheet op-sheet" data-el="sh-fee"><div class="op-sheet__t">Biaya Pendaftaran'+h.ico('close')+'</div>'+
      '<div class="op-chips"><span class="op-chip is-on">Online</span><span class="op-chip">Tunai</span><span class="op-chip">Online &amp; Tunai</span><span class="op-chip">Gratis</span></div>'+
      '<div class="op-fld" data-el="f-fee"><div class="mu-col mu-grow"><span class="op-fld__l">Biaya Pendaftaran Online<i class="op-req">*</i></span><span class="op-fld__v"><span class="op-rp" data-el="rp" style="display:none">Rp</span><span data-el="fee-in"></span></span></div></div>'+
      '<div class="op-note">'+ic('info')+'Pendapatan dari pembayaran online peserta masuk ke saldo kamu maksimal 2 hari kerja setelah sesi berakhir.</div>'+
      btn('Simpan', 'fee-save', 'off')+'</div>';
  }
  function setMode(a, cas){
    var f = a.el('form');
    a.el('mode').dataset.on = cas ? '1' : '0';
    on(a.el('mode-0'), 'is-on', !cas); on(a.el('mode-1'), 'is-on', cas);
    f.classList.toggle('is-casual', cas);
    a.el('info-t').textContent = L(cas ? 'Ini untuk main santai dan seru-seruan' : 'Ini untuk pertandingan serius');
    a.el('info-s').textContent = L(cas ? 'Skor tidak memengaruhi rating skill kamu.' : 'Segera Hadir - Skor dari game kompetitif akan langsung memengaruhi rating skill kamu.');
    pop(a.el('info'));
  }
  // Fee flow (S03 and Pembayaran 01): Biaya Pendaftaran → sheet → type → Simpan.
  function feeFlow(a){
    return a.toTarget().then(function(){ return a.wait(250); })
      .then(function(){ return a.tap('fee-row'); })
      .then(function(){ return a.sheet('sh-fee', true); })
      .then(function(){ return a.tap('f-fee'); })
      .then(function(){ on(a.el('f-fee'), 'is-focus'); a.el('sh-fee').classList.add('op-up'); a.el('rp').style.display = ''; return kbOn(a, 'kb', true); })
      .then(function(){ return keys(a, 'kb', 'fee-in', EN ? '7' : '100.000', 150); })
      .then(function(){ return a.tap('kb-ok'); })
      .then(function(){ a.el('f-fee').classList.remove('is-focus'); a.el('sh-fee').classList.remove('op-up'); enable(a, 'fee-save'); return kbOn(a, 'kb', false); })
      .then(function(){ return a.wait(250); })
      .then(function(){ return a.tap('fee-save'); })
      .then(function(){ a.el('fee-v').textContent = 'Online'; pop(a.el('fee-v')); return a.sheet('sh-fee', false); });
  }
  function feePrep(a){ a.el('fee-v').textContent = ''; }

  /* =====================================================================
     UNDANG CO-HOST — session detail, Host & CoHost, Tambah CoHost (C01–C03)
     ===================================================================== */
  function detailC(o){
    o = o || {};
    var ppl = role('dimas', 24, 'Host')+slot(24)+slot(24)+slot(24)+slot(24)+slot(24)+'<em>+2</em>';
    var co = (o.co || []).length ? o.co.map(function(k){ return role(k, 24, 'CoHost'); }).join('') : slot(24, true);
    return h.page('detail', headIcons(),
      tag('COACHING','coach')+
      '<span class="op-dtitle">Fun Padel Kawan AYO Chapter Bogor Area</span>'+
      '<span class="op-meta">Padel  •  1/12  •  Kabupaten Bogor</span>'+
      '<div class="op-ppl">'+ppl+'</div>'+
      '<div class="op-dtabs"><span class="is-on">Detail</span><span>GameTime</span><span>Diskusi</span></div>'+
      (o.dates ? '<div class="op-dates"><span class="is-on">17 Agu</span><span>24 Agu</span><span>31 Agu</span><span>7 Sep</span><span>14 Sep</span></div>' : '')+
      '<div class="op-irow">'+ic('cal')+'<div><b>Minggu, 17 Agustus 2026</b><span>09:30 - 11:30</span></div></div>'+
      '<div class="op-irow">'+ic('pin')+'<div><b>Kawan AYO Arena Bogor</b><span>Lapangan Utama</span></div></div>'+
      '<div class="op-irow">'+ic('user')+'<div><b>Coach</b><span>Fajar Nugroho</span></div></div>'+
      '<div class="op-irow">'+ic('money')+'<div><span style="color:#17171a"><b style="display:inline">Rp75.000</b> · Pembayaran Online</span><span style="color:#17171a"><b style="display:inline">Rp85.000</b> · Pembayaran Tunai</span></div></div>'+
      '<span class="op-sub">Deskripsi</span><span class="op-desc">Main aman, main nyaman, sudah termasuk foto &amp; air mineral. Tanya dahulu ketersediaan slot jadwal ke admin.</span><u class="op-u" style="font-size:9px">Selengkapnya</u>'+
      '<span class="op-hr"></span><span class="op-sub" data-el="org-sec">Penyelenggara</span>'+
      '<div class="op-org"><span class="op-logo"></span><div class="mu-col mu-grow"><b style="font-size:10.5px">Komunitas Padel Bogor</b><span class="mu-s" style="font-size:8.5px">★ 4.9 (86 Ulasan) · Dimas Pratama</span></div>'+ic('chev')+'</div>'+
      '<span class="op-hr"></span>'+
      '<div class="op-hc" data-el="hc"><div class="op-hc__c"><b>Host</b><div>'+role('dimas', 24, 'Host')+'</div></div>'+
        '<div class="op-hc__c mu-grow"><b>Co-Host</b><div data-el="co-avs">'+co+'</div></div>'+ic('chev')+'</div>'+
      '<span class="op-hr"></span><span class="op-sub">Rekomendasi Aktivitas</span>'+
      '<div class="op-reco"><b>Padel Open Play Depok</b><span>Padel · Semua Level</span></div><span class="op-sp"></span>',
      foot(btn('Atur Open Play', 'atur'))+'<div class="op-toast" data-el="toast">Berhasil Menambahkan CoHost.</div>');
  }
  function hrow(k, r){ return '<div class="op-hrow" data-el="hr-'+k+'">'+role(k, 24, r)+name(k)+(r === 'CoHost' ? ic('trash', '', 'del-'+k) : '')+'</div>'; }
  function hostCo(o){
    o = o || {};
    return h.page('hc', headT('Host &amp; CoHost', 'Bagi Tugas kelola Open Play', '<span class="op-atur'+((o.co||[]).length?' is-on':'')+'" data-el="atur-l">Atur</span>'),
      '<div data-el="hlist" style="display:flex;flex-direction:column;gap:5px">'+hrow('dimas', 'Host')+(o.co||[]).map(function(k){ return hrow(k, 'CoHost'); }).join('')+'</div>',
      (o.fab ? '<span class="op-fab" data-el="fab">'+I.plus+'</span>' : '')+foot(btn('Lanjutkan Perubahan', 'lanjut', 'off')));
  }
  function addCo(){
    var rows = ['bima','rangga','sinta','rara','yoga'].map(function(k){ return '<div class="op-mrow" data-el="m-'+k+'">'+av(k, 24)+name(k)+'<span class="op-cb" data-el="cb-'+k+'"></span></div>'; }).join('');
    return h.page('add', headT('Tambah CoHost', 'Komunitas Padel Bogor'),
      '<div class="op-search" data-el="srch">'+ic('search')+'<span data-el="q" class="op-q">Cari Nama Member</span></div>'+
      '<div style="display:flex;flex-direction:column;gap:5px">'+rows+'</div>',
      foot(btn('Assign Sebagai CoHost', 'assign', 'off'))+abcKb('kb-abc'));
  }
  // C02: the "Menjadi CoHost" notification (a tall sheet over the app)
  function notif(){
    var scope = ['Menyetujui atau menolak permintaan bergabung ke Open Play','Menghapus peserta dari Open Play','Mengubah tanggal, waktu, dan harga Open Play','Mengubah kapasitas jumlah peserta','Mengelola waiting list','Membatalkan Open Play','Dapat mengatur GameTime','Dapat mengikuti atau mengedit skor'];
    return h.page('notif', '<div class="mu-head"></div>',
      '<div class="op-sheet__t" style="padding-top:6px">Menjadi CoHost'+h.ico('close')+'</div>'+
      '<span class="mu-t" style="font-size:10px;line-height:1.4">Kamu telah ditambahkan untuk menjadi CoHost Open Play Fun Padel Kawan AYO Chapter Bogor Area.</span>'+
      '<div class="mu-row mu-row--between"><span class="mu-h" style="font-size:10.5px">Lihat cakupan Peran CoHost</span>'+ic('up')+'</div>'+
      '<ul class="op-scope">'+scope.map(function(s){ return '<li>'+s+'</li>'; }).join('')+'</ul>'+
      '<div class="op-mini-s">'+tag('Padel • Semua Level','join')+'<b>Fun Padel Kawan AYO Chapter Bogor Area</b><span>17 Agu 2026, 09:30 · Rp75.000</span><span>Kawan AYO Arena Bogor</span>'+
        '<div class="mu-row" style="gap:4px">'+tag('Booked via AYO','paid')+'<span class="op-tag" style="background:#2c2c2c;color:#fff">1/12 Bergabung</span></div>'+
        '<div class="mu-row" style="gap:4px">'+av('dimas', 16)+slot(16)+slot(16)+slot(16)+'</div></div>'+
      btn('Keluar Sebagai CoHost', '', 'line')+btn('Mengerti, Lihat Detail Open Play', 'ok')+'<span style="height:8px;flex:0 0 auto"></span>'
    ).replace('class="mu-page"', 'class="mu-page op-notif"');
  }
  function aturSheet(){
    var it = [['edit','Edit Open Play','Ubah informasi terkait aktivitas.'],['money','Dana Terkumpul','Lihat total dana yang terkumpul dari aktivitas ini.'],
      ['uPlus','Undang Partisipan','Ajak peserta untuk bergabung di aktivitas ini.'],['uCheck','Tutup Pendaftaran','Aktivitas tetap terlaksana dengan peserta yang telah terdaftar.'],
      ['uX','Batalkan Open Play','Aktivitas tidak terlaksana dan biaya akan dikembalikan ke peserta yang sudah terdaftar.'],['calRe','Reschedule','Aktivitas tetap terlaksana dengan jadwal baru.'],
      ['uOut','Keluar dari Peran CoHost','Lepaskan hak akses pengelolaan acara ini.']];
    return '<div class="mu-sheet op-sheet op-sheet--tall" data-el="sh-atur"><div class="op-in"><span class="mu-sheet__bar"></span>'+
      '<div class="mu-col"><span class="op-sheet__t">Atur Open Play</span><span class="mu-s" style="font-size:8.5px">Minggu, 17 Agustus 2026 · 09:30 - 11:30</span></div>'+
      '<div>'+it.map(function(x, i){ return '<div class="op-mrow2"'+(i === it.length-1 ? ' data-el="atur-last"' : '')+'>'+ic(x[0])+'<div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>'; }).join('')+'</div></div></div>';
  }
  function optSheet(){
    return '<div class="mu-sheet op-sheet" data-el="sh-opt"><span class="mu-sheet__bar"></span><div>'+
      '<div class="op-opt" data-el="opt-riwayat">'+ic('history')+'Riwayat Perubahan'+ic('chev')+'</div>'+
      '<div class="op-opt">'+ic('flag')+'Laporkan Open Play'+ic('chev')+'</div>'+
      '<div class="op-opt">'+ic('alert')+'Blokir Open Play'+ic('chev')+'</div></div></div>';
  }
  function riwayat(){
    function log(t, d){ return '<div class="op-log"><b>Perubahan Open Play</b><span>'+t+'</span><small>'+d+'</small></div>'; }
    return h.page('riwayat', headT('Riwayat Perubahan'),
      '<div class="op-search">'+ic('search')+'Cari riwayat perubahan</div>'+
      '<div class="op-filters"><span>'+ic('sort','op-ic--sm')+'</span><span>Semua Pengguna'+ic('down','op-ic--sm')+'</span><span>Semua Perubahan'+ic('down','op-ic--sm')+'</span></div>'+
      log('Merubah Nama Open Play: Fun Padel Kawan AYO Chapter Bogor Area', '10 Agu 2026 · 18:35 · Rangga Wijaya')+
      log('Merubah Nama Coach menjadi: Fajar Nugroho', '10 Agu 2026 · 18:20 · Rangga Wijaya')+
      '<div data-el="log-3">'+log('Menampilkan Nama Coach', '9 Agu 2026 · 20:05 · Rara Amelia')+'</div>');
  }

  /* =====================================================================
     PESERTA — player list, levels, waiting list (P01–P03)
     ===================================================================== */
  function prow(o){
    var right = o.req ? '<span class="op-prow__r"><span class="op-mini op-mini--line">Tolak</span><span class="op-mini" data-el="acc-'+o.k+'">Terima</span></span>'
      : o.kebab ? '<span class="op-prow__r">'+(o.paid?tag('Lunas','paid'):'')+ic('more')+'</span>' : '';
    var who = o.init ? ini(o.init, 28) : o.host ? role(o.k, 28, 'Host') : av(o.k, 28);
    var nm = '<span class="op-name"><b>'+(o.label || P[o.k][1])+(o.badge ? ' '+o.badge : '')+'</b><span>'+(o.sub || '@'+o.k)+'</span></span>';
    var chips = o.self ? '<div class="op-chips2"><span class="op-self">'+o.self+'</span><span class="op-lvw">'+lv(o.lv[0], o.lv[1], o.lvEl)+(o.tip?'<span class="op-tip" data-el="tip">'+o.tip+'</span>':'')+'</span></div>' : '';
    var note = o.note ? '<div class="op-pnote" data-el="note-'+o.k+'">'+ic('note')+'<span>Udah lama main padel, accept dong! Rutin main <span data-c>… <u data-el="more-'+o.k+'">selengkapnya</u></span><span data-x>seminggu 2 kali, mohon dipertimbangkan ya, makasih! <u>sembunyikan</u></span></span></div>' : '';
    return '<div class="op-prow" data-el="pr-'+(o.k||o.init)+'"><div class="op-prow__top">'+who+'<div class="mu-grow">'+nm+chips+'</div>'+right+'</div>'+note+'</div>';
  }
  function tabs(list, active, el, shift){
    return '<div class="op-tabs"><div class="op-tabs__in" data-el="'+(el||'tabs')+'"'+(shift?' style="transform:translateX('+shift+'px)"':'')+'>'+list.map(function(t, i){ return '<span'+(i===active?' class="is-on"':'')+' data-el="tab-'+i+'">'+t+'</span>'; }).join('')+'</div></div>';
  }
  function plist(o){
    // Header, search and tabs stay put (the PRD's navbar set); only the list scrolls.
    return h.page('pl', '<div class="mu-head op-head2"><div class="op-head2__r"><span class="mu-ico">'+I.back+'</span><span class="mu-head__title">Daftar Pemain</span><span class="mu-head__sp"></span><span class="op-pill">'+ic('mail','op-ic--sm')+'Undangan</span></div>'+
        '<div class="op-search">'+ic('search')+'Cari nama pemain...</div>'+tabs(o.tabs, o.active || 0, '', o.shift)+'</div>',
      '<span style="height:4px;flex:0 0 auto"></span><div data-el="list-a" style="display:flex;flex-direction:column;gap:8px">'+o.rows.join('')+'</div>'+
      '<div data-el="list-b" style="display:none;flex-direction:column;gap:8px">'+(o.rowsB||[]).join('')+'</div>',
      '<span class="op-btn op-addp">'+I.plus.replace('<svg','<svg style="width:12px;height:12px"')+'Tambah Pemain</span>');
  }
  // Slide the tab strip so the tab `i` is in view, then make it the active one.
  function stripTo(a, i){
    var s = a.el('tabs'), t = a.el('tab-'+i), w = s.parentNode.offsetWidth;
    var x = Math.min(0, w - 12 - 36 - (t.offsetLeft + t.offsetWidth));
    s.style.transform = 'translateX('+x+'px)'; return a.wait(560);
  }
  function tabTo(a, i){ [].forEach.call(a.el('tabs').children, function(c, k){ on(c, 'is-on', k === i); }); }
  function swap(a){ a.el('list-a').style.display = 'none'; var b = a.el('list-b'); b.style.display = 'flex'; pop(b); }
  // P03: the full session (Waiting List PRD 17:7248) and its waiting list
  function detailFull(){
    var faces = ['dimas','laras','rangga','rara','bima','yoga'].map(function(k){ return av(k, 24); }).join('');
    return h.page('dfull', headIcons('chev'),
      tag('Penuh','full')+'<span class="op-dtitle">Fun Padel Kawan AYO Chapter Bogor Area</span>'+
      '<span class="op-meta">'+ic('racket')+'<b>Padel</b> • '+ic('pin')+'<b>Kabupaten Bogor</b></span>'+
      '<div class="op-ppl" data-el="ppl-n">'+faces+'<b>•  10/10 ›</b></div>'+
      '<div class="op-dtabs"><span class="is-on">Detail</span><span>Diskusi</span><span>Skor</span></div>'+
      '<div class="op-dcard">'+
        '<div class="op-irow">'+ic('level')+'<div><b>Beginner - Intermediate</b><span>Pemain dengan skill Beginner hingga Intermediate dapat bergabung.</span></div></div>'+
        '<div class="op-irow">'+ic('cal')+'<div><b>Minggu, 17 Agustus 2026</b><span>09:30 - 11:30</span></div></div>'+
        '<div class="op-irow">'+ic('pin')+'<div><b>Kawan AYO Arena Bogor</b><span>Lapangan Utama</span>'+tag('Booked via AYO','booked')+'</div></div>'+
        '<div class="op-irow">'+ic('money')+'<div><b>Rp75.000 · Pembayaran Online</b></div></div></div><span class="op-sp"></span>',
      foot('<span class="op-sq">'+ic('chat')+'</span>'+btn('Atur Open Play','','line')));
  }
  function wrow(k, lvl){
    return '<div class="op-wrow" data-el="w-'+k+'">'+av(k, 28)+'<span class="op-name"><b>'+P[k][1]+' <span class="op-fem">'+I.fem+'</span></b><span>@'+k+' • '+ic('racket','op-ic--sm op-ic--mut')+lvl+'</span>'+
      '<span class="op-mini" data-el="add-'+k+'">Masukkan ke Aktivitas</span></span>'+ic('more')+'</div>';
  }
  function waitlist(){
    return h.page('wl', h.head('<span class="mu-ico">'+I.chevL+'</span><div class="op-search op-search--sm">'+ic('search')+'Cari nama peserta</div><span class="mu-ico">'+I.mail+'</span>'),
      tabs(['Permintaan','Daftar Tunggu (<span data-el="wl-n">2</span>)','Pembayaran','Bergabung (10)'], 1)+
      '<div class="op-wl">Waiting List Otomatis'+ic('info')+'<span class="op-wl__s is-on" data-el="wl-s">Aktif</span><span class="mu-toggle is-on" data-el="wl-t"></span></div>'+
      '<div class="op-wlist" data-el="wlist" style="display:flex;flex-direction:column;gap:6px">'+wrow('sinta','Advanced')+wrow('rara','Intermediate')+'</div><span class="op-sp"></span>',
      '<span class="op-btn op-addp">'+I.plus.replace('<svg','<svg style="width:11px;height:11px"')+'PESERTA</span>');
  }
  function dlg(el, title, body, ok){
    return '<div class="mu-dialog op-dlg" data-el="'+el+'"><span class="mu-h">'+title+'</span><span class="mu-s">'+body+'</span>'+
      '<div class="op-btns">'+btn('Batal','','line')+btn('Konfirmasi', ok)+'</div></div>';
  }

  /* ---------- Register ---------- */
  var REQ3 = function(){ return [
    prow({k:'bima', req:true, self:'Nilai sendiri · Intermediate', lv:['n','3.34'], note:true}),
    prow({k:'sinta', req:true, self:'Nilai sendiri · Newbie', lv:['n','1.25']}),
    prow({k:'yoga', req:true, self:'Nilai sendiri · Beginner', lv:['y','3.XX']})]; };

  add({
    cards: {
      // S01 · Cabang olahraga, lapangan & jam. Static: the form at Olahraga & Komunitas.
      'op-s01': {pages:[form(), sched()], to:'sport-sec', margin:10, extra:function(){ return catSheet()+venueSheet(); }, flow:'op-s01'},
      // S02 · Kuota & level. Static: the form at Peserta.
      'op-s02': {pages:[form({booked:true})], to:'q-sec', margin:10, extra:function(){ return skillSheet()+numKb('kb'); }, flow:'op-s02'},
      // S03 · Biaya & pembayaran online. Static: the form at Biaya Pendaftaran (Online).
      'op-s03': {pages:[form({booked:true, skill:'2.50 - 3.25'})], to:'links', margin:10, extra:function(){ return feeSheet()+numKb('kb'); }, flow:'op-s03'},
      // S04 · Santai atau Kompetitif. Static: Kompetitif.
      'op-s04': {pages:[form({booked:true, skill:'2.50 - 3.25'})], to:'mode', margin:8, flow:'op-s04'},
      // C01 · Undang co-host. Static: the detail at Penyelenggara, no co-host yet.
      'op-c01': {pages:[detailC(), hostCo({fab:true}), addCo()], to:'org-sec', margin:10, flow:'op-c01'},
      // C02 · Bagi tugas. Static: the "Menjadi CoHost" notification.
      'op-c02': {pages:[notif(), detailC({co:['rangga','rara']})], extra:aturSheet, flow:'op-c02'},
      // C03 · Tetap pegang kendali. Static: the top of the detail.
      'op-c03': {pages:[detailC({co:['rangga','rara'], dates:true}), riwayat(), hostCo({co:['rangga','rara'], fab:true})], extra:optSheet, flow:'op-c03'},
      // P01 · Tentukan siapa yang bisa bergabung. Static: Permintaan (3).
      'op-p01': {pages:[plist({tabs:['Permintaan (<span data-el="req-n">3</span>)','Daftar Tunggu','Pembayaran','Bergabung (1)','Dibatalkan'], rows:REQ3(),
        rowsB:[prow({k:'dimas', host:true, self:'Nilai sendiri · Intermediate', lv:['n','3.34']}), prow({init:'N', label:'Nadia', badge:tag('Dipesan','res'), sub:'Tamu', kebab:true}),
               prow({k:'rara', kebab:true, paid:true, self:'Nilai sendiri · Beginner', lv:['r','X.XX']})]})], flow:'op-p01'},
      // P02 · Kenali pemain. Static: Permintaan (4) with each player's level.
      'op-p02': {pages:[plist({tabs:['Permintaan (4)','Daftar Tunggu','Pembayaran','Bergabung (1)','Dibatalkan'],
        rows:REQ3().concat(prow({k:'arif', req:true, self:'Nilai sendiri · Beginner', lv:['lock']})),
        rowsB:[prow({k:'laras', kebab:true, paid:true, self:'Nilai sendiri · Newbie', lv:['n','3.34'], lvEl:'lv-laras', tip:'Level stabil.'})]})], flow:'op-p02'},
      // P03 · Daftar tunggu. Static: the full session (10/10).
      'op-p03': {pages:[detailFull(), waitlist()], extra:function(){
        return dlg('dlg-off', 'Nonaktifkan Waitlist Otomatis?', 'Kamu perlu memindahkan calon peserta secara manual agar dapat tergabung di Open Play.', 'off-ok')+
               dlg('dlg-add', 'Masukkan peserta ke aktivitas?', 'Sistem akan mengirim permintaan pembayaran ke peserta ini.', 'add-ok'); }, flow:'op-p03'}
    },
    prep: {
      // Opens before a sport is picked and before the booking is linked.
      'op-s01': function(a){ a.el('cat-v').innerHTML = '<span class="op-fld__p">'+L('Pilih cabang olahraga')+'</span>'; a.el('bk').classList.remove('is-booked'); },
      'op-s03': feePrep,
      // Opens with the detail scrolled back to the top (static frame rests lower).
      'op-c01': function(a){}
    },
    flows: {
      // Olahraga → Cabang Olahraga sheet → Padel → Simpan → down to Waktu &
      // Lokasi → booking on AYO → Pilih Venue → Pilih Jadwal (three courts,
      // one per hour) → Lanjutkan → the booked card fills the form.
      'op-s01': function(a){
        return a.toTarget().then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('f-cat'); })
          .then(function(){ return a.sheet('sh-cat', true); })
          .then(function(){ return a.tap('cat-2'); })
          .then(function(){ a.radio('cat-2'); enable(a, 'cat-save'); return a.wait(450); })
          .then(function(){ return a.tap('cat-save'); })
          .then(function(){ a.el('cat-v').textContent = 'Padel'; pop(a.el('cat-v')); return a.sheet('sh-cat', false); })
          .then(function(){ return a.scrollTo('tl-sec', 8, 900); })
          .then(function(){ return a.tap('bk-row'); })
          .then(function(){ return a.sheet('sh-venue', true); })
          .then(function(){ return a.tap('venue-0'); })
          .then(function(){ quietClose(a, 'sh-venue'); return a.go('sched'); })
          .then(function(){ return a.tap('ct-a'); })
          .then(function(){ on(a.el('ct-a'), 'is-on'); return a.wait(350); })
          .then(function(){ return a.scrollTo('t15', 6, 700); })
          .then(function(){ return a.tap('ct-f'); })
          .then(function(){ on(a.el('ct-f'), 'is-on'); return a.wait(350); })
          .then(function(){ return a.scrollTo('t16', 6, 700); })
          .then(function(){ return a.tap('ct-c2'); })
          .then(function(){ on(a.el('ct-c2'), 'is-on'); enable(a, 'sched-go'); return a.wait(450); })
          .then(function(){ return a.tap('sched-go'); })
          .then(function(){ a.el('bk').classList.add('is-booked'); pop(a.el('tl')); return a.back('form'); })
          .then(function(){ return a.wait(1200); });
      },
      // Peserta: type 10 on the keyboard (slots 5 → 9), then up to Preferensi
      // Skill → sheet → type 2.50 and 3.25 → Simpan → the range shows.
      'op-s02': function(a){
        return a.toTarget().then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('q-n'); })
          .then(function(){ on(a.el('q-n'), 'is-focus'); return kbOn(a, 'kb', true); })
          .then(function(){ return keys(a, 'kb', 'q-n', '10', 220); })
          .then(function(){ return a.tap('kb-ok'); })
          .then(function(){ a.el('q-n').classList.remove('is-focus'); a.el('q-slot').textContent = '9'; pop(a.el('q-slot')); return kbOn(a, 'kb', false); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.scrollTo('f-skill', 40, 900); })
          .then(function(){ return a.tap('f-skill'); })
          .then(function(){ return a.sheet('sh-skill', true); })
          .then(function(){ return a.wait(250); })
          .then(function(){ return sheetY(a, 'sh-skill', offIn(a, 'sh-skill', 'minmax') - 52, 700); })
          .then(function(){ return a.tap('f-min'); })
          .then(function(){ on(a.el('f-min'), 'is-focus'); a.el('sh-skill').classList.add('op-up'); return kbOn(a, 'kb', true); })
          .then(function(){ return keys(a, 'kb', 'min-v', '2.50', 170); })
          .then(function(){ return a.tap('f-max'); })
          .then(function(){ a.el('f-min').classList.remove('is-focus'); on(a.el('f-max'), 'is-focus'); return keys(a, 'kb', 'max-v', '3.25', 170); })
          .then(function(){ return a.tap('kb-ok'); })
          .then(function(){ a.el('f-max').classList.remove('is-focus'); a.el('sh-skill').classList.remove('op-up'); return kbOn(a, 'kb', false); })
          .then(function(){ var s = a.el('sh-skill'), inr = s.querySelector('.op-in'); return sheetY(a, 'sh-skill', Math.max(0, inr.offsetHeight - s.offsetHeight), 600); })
          .then(function(){ return a.tap('skill-save'); })
          .then(function(){ a.el('skill-v').textContent = '2.50 - 3.25'; pop(a.el('skill-v')); return a.sheet('sh-skill', false); })
          .then(function(){ return a.wait(400); });
      },
      'op-s03': feeFlow,
      // Kompetitif → Santai (the info changes, PadelLevels drops out) → back.
      'op-s04': function(a){
        return a.toTarget().then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('mode-1'); })
          .then(function(){ setMode(a, true); return a.wait(1800); })
          .then(function(){ return a.tap('mode-0'); })
          .then(function(){ setMode(a, false); return a.wait(600); });
      },
      // Host & Co-Host → + → search "Ra" → tick Rangga and Rara → Assign →
      // both listed → Lanjutkan Perubahan → back on the detail with a toast.
      'op-c01': function(a){
        return a.toTarget().then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('hc'); })
          .then(function(){ return a.go('hc'); })
          .then(function(){ return a.tap('fab'); })
          .then(function(){ return a.go('add'); })
          .then(function(){ return a.tap('srch'); })
          .then(function(){ on(a.el('srch'), 'is-focus'); a.el('q').classList.add('mu-caret'); return kbOn(a, 'kb-abc', true); })
          .then(function(){ return keys(a, 'kb-abc', 'q', 'Ra', 260); })
          .then(function(){ ['bima','sinta','yoga'].forEach(function(k){ a.el('m-'+k).classList.add('is-hide'); }); return a.wait(500); })
          .then(function(){ a.el('q').classList.remove('mu-caret'); a.el('srch').classList.remove('is-focus'); return kbOn(a, 'kb-abc', false); })
          .then(function(){ return a.tap('cb-rangga'); })
          .then(function(){ on(a.el('cb-rangga'), 'is-on'); return a.wait(300); })
          .then(function(){ return a.tap('cb-rara'); })
          .then(function(){ on(a.el('cb-rara'), 'is-on'); enable(a, 'assign'); return a.wait(450); })
          .then(function(){ return a.tap('assign'); })
          .then(function(){
            var l = a.el('hlist');
            ['rangga','rara'].forEach(function(k){ l.insertAdjacentHTML('beforeend', trHTML(hrow(k, 'CoHost'))); pop(a.el('hr-'+k)); });
            on(a.el('atur-l'), 'is-on'); enable(a, 'lanjut'); return a.back('hc'); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('lanjut'); })
          .then(function(){ var c = a.el('co-avs'); c.innerHTML = role('rangga', 24, 'CoHost')+role('rara', 24, 'CoHost'); pop(c); return a.back('detail'); })
          .then(function(){ on(a.el('toast'), 'is-on'); return a.wait(1800); })
          .then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); });
      },
      // Notification → scroll to the buttons → Mengerti → the detail (as
      // co-host) → Atur Open Play → the sheet scrolls to the co-host's tasks.
      'op-c02': function(a){
        return a.wait(400).then(function(){ return a.scrollBottom('ok', 1300); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('ok'); })
          .then(function(){ return a.go('detail'); })
          .then(function(){ return a.scrollTo('org-sec', 6, 1100); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('atur'); })
          .then(function(){ return a.sheet('sh-atur', true); })
          .then(function(){ return a.wait(700); })
          .then(function(){ var s = a.el('sh-atur'), inr = s.querySelector('.op-in'); return sheetY(a, 'sh-atur', Math.max(0, inr.offsetHeight - s.offsetHeight), 1300); });
      },
      // ⋮ → Riwayat Perubahan (changes made by co-hosts) → back → Host &
      // Co-Host → remove Rara → Lanjutkan Perubahan turns on.
      'op-c03': function(a){
        return a.wait(400).then(function(){ return a.tap('more'); })
          .then(function(){ return a.sheet('sh-opt', true); })
          .then(function(){ return a.tap('opt-riwayat'); })
          .then(function(){ quietClose(a, 'sh-opt'); return a.go('riwayat'); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.scrollBottom('log-3', 900); })
          .then(function(){ return a.wait(900); })
          .then(function(){ return a.back('detail'); })
          .then(function(){ return a.scrollTo('org-sec', 6, 1100); })
          .then(function(){ return a.tap('hc'); })
          .then(function(){ return a.go('hc'); })
          .then(function(){ return a.tap('del-rara'); })
          .then(function(){ on(a.el('hr-rara'), 'is-gone'); return a.wait(320); })
          .then(function(){ a.el('hr-rara').remove(); enable(a, 'lanjut'); return a.wait(600); });
      },
      // Read the request note → Terima (the request leaves the list) → the
      // tabs slide to Bergabung → the joined players.
      'op-p01': function(a){
        return a.wait(500).then(function(){ return a.tap('more-bima'); })
          .then(function(){ on(a.el('note-bima'), 'is-open'); return a.wait(1400); })
          .then(function(){ return a.tap('acc-bima'); })
          .then(function(){ on(a.el('pr-bima'), 'is-gone'); a.el('req-n').textContent = '2'; return a.wait(330); })
          .then(function(){ a.el('pr-bima').remove(); return a.wait(700); })
          .then(function(){ return stripTo(a, 3); })
          .then(function(){ return a.tap('tab-3'); })
          .then(function(){ tabTo(a, 3); swap(a); return a.wait(600); });
      },
      // Scroll the levels → Bergabung → tap the level → "Level stabil."
      'op-p02': function(a){
        return a.wait(500).then(function(){ return a.scroll(a.maxY(), 1300); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.scroll(0, 800); })
          .then(function(){ return stripTo(a, 3); })
          .then(function(){ return a.tap('tab-3'); })
          .then(function(){ tabTo(a, 3); swap(a); return a.wait(700); })
          .then(function(){ return a.tap('lv-laras'); })
          .then(function(){ on(a.el('lv-laras'), 'is-on'); on(a.el('tip'), 'is-on'); return a.wait(1500); });
      },
      // 10/10 → Daftar Tunggu → switch auto off (confirm) → Masukkan ke
      // Aktivitas → confirm (payment request) → Sinta leaves the queue.
      'op-p03': function(a){
        return a.wait(500).then(function(){ return a.tap('ppl-n'); })
          .then(function(){ return a.go('wl'); })
          .then(function(){ return a.tap('wl-t'); })
          .then(function(){ return a.sheet('dlg-off', true); })
          .then(function(){ return a.tap('off-ok'); })
          .then(function(){
            a.el('wl-t').classList.remove('is-on'); a.el('wl-s').textContent = L('Tidak aktif'); a.el('wl-s').classList.remove('is-on');
            on(a.el('wlist'), 'is-manual'); return a.sheet('dlg-off', false); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('add-sinta'); })
          .then(function(){ return a.sheet('dlg-add', true); })
          .then(function(){ return a.tap('add-ok'); })
          .then(function(){ on(a.el('w-sinta'), 'is-gone'); a.el('wl-n').textContent = '1'; return a.sheet('dlg-add', false); })
          .then(function(){ a.el('w-sinta').remove(); return a.wait(500); });
      }
    }
  });

  // Parts for more.js (Skor Live, Pembayaran, Bagikan & Superhost).
  window.AyoOP = {isEN:!!EN, L:L, trHTML:trHTML, add:add, P:P, I:I, ic:ic, av:av, ini:ini, role:role, slot:slot, lv:lv, tag:tag, name:name, btn:btn, foot:foot,
    headIcons:headIcons, headT:headT, pop:pop, activate:activate, preset:preset, sheetY:sheetY, quietClose:quietClose, enable:enable,
    keys:keys, kbOn:kbOn, scrollAbove:scrollAbove, numKb:numKb, form:form, feeSheet:feeSheet, feeFlow:feeFlow, feePrep:feePrep, prow:prow, plist:plist, stripTo:stripTo, tabTo:tabTo};
})();
