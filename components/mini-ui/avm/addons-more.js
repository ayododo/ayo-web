/* ==========================================================================
   AYO — AVM Mini UI cards: Add-ons, Activities, Additional Features
   Figma (ID → EN): ad01 28093:11662 → 28378:17646 · ad02 28093:11700 → 28378:17684
   ad03 28093:11727 → 28378:17711 · ac01 28093:11757 → 28378:17741
   ft01 28093:11792 → 28378:17776 · ft03 28093:11831 → 28378:17808
   ft04 28222:13366 → 28378:17854
   Each card's first page is the Figma Mini UI (its static frame shows the
   top of the screen, as the Figma frame does). Every flow starts at the top,
   scrolls to what it is about and plays the interaction; screens Figma does
   not draw (sheets, toasts, the total bar, reply box) are drawn here in the
   same Mini UI style. Strings come from S[lang] (lang = <html lang>).
   Load after mini-ui.js; classes are in addons-more.css (prefix mu-am-).
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings (ID from the ID Figma, EN from the EN Figma) ---------- */
  var S = {
    id: {
      add: '+ Tambah', save: 'Simpan', saved: 'Tersimpan',
      // ad01
      products: 'Produk Tambahan', prod: {am:'Air Mineral', sr:'Sewa Raket', hd:'Handuk', bl:'Bola'},
      total: 'Total Bayar', items: function(n){ return n+' item'; }, next: 'Lanjut',
      // ad02
      variants: 'Atur Varian', prodName: 'Nama produk', variant: 'Varian',
      vStd: ['Standar','Raket aluminium'], vPro: ['Pro','Raket karbon, senar baru'],
      vDesc: 'Deskripsi varian', vDescPh: 'Tulis detail varian…', addVariant: '+ Tambah Varian',
      vSheet: 'Tambah Varian', vName: 'Nama varian', vNamePh: 'Contoh: Premium', vPrice: 'Harga',
      vNew: ['Premium','Raket premium, grip baru'],
      // ad03
      addCoach: 'Tambah Coach', photo: 'Foto profil', optional: 'Opsional', coachName: 'Nama coach', coachPh: 'Tulis nama coach',
      sport: 'Cabang olahraga', sports3: ['Tenis','Padel','Badminton'], rate: 'Tarif per sesi',
      coachToast: ['Coach ditambahkan','Aldi Pranata · Tenis, Padel'],
      // ac01
      createAct: 'Buat Aktivitas', actSports: ['Badminton','Futsal','Padel'], date: 'Sab, 17 Mei 2026', time: '19:00 – 21:00 · Court 2',
      pickDate: 'Pilih jadwal', pickDateSub: 'Tanggal & jam main', quota: 'Kuota', players: function(n){ return n+' pemain'; }, price: 'Harga',
      allLevels: 'Semua level', pickLevel: 'Pilih level ›', openPlay: 'Main Bareng', publish: 'Publikasikan', published: 'Dipublikasikan',
      dSheet: 'Pilih Jadwal', dDate: 'Tanggal', dTime: 'Jam mulai', days: ['Jum 16','Sab 17','Min 18'],
      qSheet: 'Kuota Pemain', qSub: 'Jumlah maksimal pemain yang bisa gabung',
      lSheet: 'Level Pemain', levels: ['Pemula','Menengah','Mahir','Semua level'],
      actToast: ['Aktivitas dipublikasikan','Main Bareng Badminton · Sab, 17 Mei'],
      // ft01
      access: 'Tambah Hak Akses', role: 'Peran', roles: ['Admin','Staff','Kasir'],
      roleDesc: {none:'Pilih peran untuk anggota tim', Admin:'Admin mengatur semua fitur venue', Staff:'Staff mengelola operasional harian venue', Kasir:'Kasir menerima pembayaran di venue'},
      permFor: function(r){ return r ? 'Izin untuk '+r : 'Izin'; },
      perms: ['Kelola jadwal & booking','Lihat laporan','Cairkan saldo','Buat promo'],
      accessToast: ['Hak akses disimpan','Peran Staff · 2 izin aktif'],
      // ft03
      coach: 'Coach', active: 'Coach aktif', week: 'Sesi minggu ini', sess: function(n){ return n+' sesi'; },
      coaches: [['AP','Aldi P.','Tenis',8,'#e6f6ee','#1b7a4b'],['NR','Nadia R.','Padel',6,'#fff1de','#b4610e'],['YS','Yoga S.','Badminton',5,'#e8f1fd','#1f5fbf'],['MK','Maya K.','Renang',4,'#fdeced','#ec2435']],
      // ft04
      reviews: 'Ulasan Penyewa', ratingLine: function(r, u){ return r+' rating · '+u+' ulasan'; },
      revs: [['raka','Raka Aditya','4.9','Lapangan bersih, besok pasti balik lagi','Arena Nusantara · 20 Mei'],
             ['dimas','Dimas P.','4.7','Kualitas lapangan keren, pelayanan ramah','Arena Nusantara · 20 Mei'],
             ['sinta','Sinta W.','4.6','Booking gampang, parkir luas','Arena Nusantara · 19 Mei']],
      reply: 'Balas', replied: 'Dibalas', send: 'Kirim', replyPh: 'Tulis balasan…', yourReply: 'Balasan kamu',
      replyText: 'Terima kasih, Raka! Ditunggu lagi ya.'
    },
    en: {
      add: '+ Add', save: 'Save', saved: 'Saved',
      products: 'Add-on Products', prod: {am:'Mineral Water', sr:'Racket Rental', hd:'Towel', bl:'Ball'},
      total: 'Total payment', items: function(n){ return n+(n === 1 ? ' item' : ' items'); }, next: 'Continue',
      variants: 'Manage Variants', prodName: 'Product name', variant: 'Variant',
      vStd: ['Standard','Aluminium racket'], vPro: ['Pro','Carbon racket, new strings'],
      vDesc: 'Variant description', vDescPh: 'Describe the variant…', addVariant: '+ Add Variant',
      vSheet: 'Add Variant', vName: 'Variant name', vNamePh: 'e.g. Premium', vPrice: 'Price',
      vNew: ['Premium','Premium racket, new grip'],
      addCoach: 'Add Coach', photo: 'Profile photo', optional: 'Optional', coachName: 'Coach name', coachPh: 'Enter coach name',
      sport: 'Sport', sports3: ['Tennis','Padel','Badminton'], rate: 'Rate per session',
      coachToast: ['Coach added','Aldi Pranata · Tennis, Padel'],
      createAct: 'Create Activity', actSports: ['Badminton','Futsal','Padel'], date: 'Sat, 17 May 2026', time: '19:00 – 21:00 · Court 2',
      pickDate: 'Pick a schedule', pickDateSub: 'Date & play time', quota: 'Quota', players: function(n){ return n+' players'; }, price: 'Price',
      allLevels: 'All levels', pickLevel: 'Pick level ›', openPlay: 'Open Play', publish: 'Publish', published: 'Published',
      dSheet: 'Pick Schedule', dDate: 'Date', dTime: 'Start time', days: ['Fri 16','Sat 17','Sun 18'],
      qSheet: 'Player Quota', qSub: 'Maximum number of players who can join',
      lSheet: 'Player Level', levels: ['Beginner','Intermediate','Advanced','All levels'],
      actToast: ['Activity published','Open Play Badminton · Sat, 17 May'],
      access: 'Add Access Rights', role: 'Role', roles: ['Admin','Staff','Cashier'],
      roleDesc: {none:'Choose a role for your team member', Admin:'Admins control every venue feature', Staff:'Staff run the venue\'s daily operations', Cashier:'Cashiers take payments at the venue'},
      permFor: function(r){ return r ? r+' permissions' : 'Permissions'; },
      perms: ['Manage schedule & bookings','View reports','Withdraw balance','Create promos'],
      accessToast: ['Access rights saved','Staff role · 2 permissions on'],
      coach: 'Coach', active: 'Active coaches', week: 'Sessions this week', sess: function(n){ return n+(n === 1 ? ' session' : ' sessions'); },
      coaches: [['AP','Aldi P.','Tennis',8,'#e6f6ee','#1b7a4b'],['NR','Nadia R.','Padel',6,'#fff1de','#b4610e'],['YS','Yoga S.','Badminton',5,'#e8f1fd','#1f5fbf'],['MK','Maya K.','Swimming',4,'#fdeced','#ec2435']],
      reviews: 'Renter Reviews', ratingLine: function(r, u){ return r+' ratings · '+u+' reviews'; },
      revs: [['raka','Raka Aditya','4.9','Clean courts, coming back tomorrow for sure','Arena Nusantara · 20 May'],
             ['dimas','Dimas P.','4.7','Great courts, friendly service','Arena Nusantara · 20 May'],
             ['sinta','Sinta W.','4.6','Easy booking, plenty of parking','Arena Nusantara · 19 May']],
      reply: 'Reply', replied: 'Replied', send: 'Send', replyPh: 'Write a reply…', yourReply: 'Your reply',
      replyText: 'Thanks, Raka! See you again soon.'
    }
  };
  var T = S[lang];

  /* ---------- Small templates ---------- */
  function rp(n){ return 'Rp'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  // Header as drawn in the Figma Mini UIs: optional "‹", title, optional "+ Add" pill.
  function top(title, back, add){
    return h.head((back ? '<span class="mu-am-back">‹</span>' : '')+'<span class="mu-head__title">'+title+'</span>'+
      (add ? '<span class="mu-head__sp"></span><span class="mu-am-addpill">'+T.add+'</span>' : ''));
  }
  // Every page of this group carries .mu-am (spacing of the Figma screens).
  function pg(name, title, body, extra){ return h.page(name, title, body, extra).replace('class="mu-page"', 'class="mu-page mu-am"'); }
  function field(label, el, value, ph, pre){
    return '<div class="mu-am-fld"><span class="mu-am-lbl">'+label+'</span><div class="mu-am-in" data-el="'+el+'-box">'+(pre ? '<span class="mu-am-pre" data-el="'+el+'-pre">'+pre+'</span>' : '')+
      '<span data-el="'+el+'"'+(ph ? ' class="is-ph"' : '')+'>'+(value || ph || '')+'</span></div></div>';
  }
  function chip(text, isOn, el){ return '<span class="mu-am-chip'+(isOn ? ' is-on' : '')+'" data-el="'+el+'">'+text+'</span>'; }
  function stat(label, value, el){ return '<div class="mu-card mu-am-stat"><span class="mu-am-lbl">'+label+'</span><b data-el="'+el+'">'+value+'</b></div>'; }
  function toast(t){ return '<div class="mu-toast" data-el="toast"><span class="mu-am-ok">✓</span><span class="mu-col"><b>'+t[0]+'</b><span>'+t[1]+'</span></span></div>'; }
  function sheet(el, title, inner){ return '<div class="mu-sheet mu-am-sheet" data-el="'+el+'"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">'+title+'</span>'+inner+'</div>'; }
  // Figma star shapes (Ulasan Penyewa 28222:13376 / 28222:13386).
  var STAR = 'M6.3 0L7.96637 4.00644L12.2917 4.35319L8.99625 7.17606L10.003 11.3968L6.3 9.135L2.59695 11.3968L3.60375 7.17606L0.308344 4.35319L4.63363 4.00644L6.3 0Z';
  function stars(n){
    var p = ''; for(var i = 0; i < 5; i++) p += '<path data-el="star-'+i+'" class="'+(i < n ? 'is-on' : '')+'" transform="translate('+(i*14.9)+' 0)" d="'+STAR+'"/>';
    return '<svg class="mu-am-stars" viewBox="0 0 72.2 12.6" width="63" height="11" aria-hidden="true">'+p+'</svg>';
  }
  var STAR1 = '<svg class="mu-am-star1" viewBox="0 0 9.51056 9.04508" aria-hidden="true"><path d="M4.75528 0L6.0778 3.17971L9.51056 3.45492L6.89516 5.69529L7.69421 9.04508L4.75528 7.25L1.81636 9.04508L2.61541 5.69529L0 3.45492L3.43277 3.17971L4.75528 0Z"/></svg>';

  // Shared motion helpers.
  function focus(a, el){ var b = a.el(el+'-box'); if(b) on(b, 'is-focus'); var t = a.el(el); t.classList.remove('is-ph'); t.classList.add('mu-caret'); t.textContent = ''; }
  function blur(a, el){ var b = a.el(el+'-box'); if(b) b.classList.remove('is-focus'); a.el(el).classList.remove('mu-caret'); }
  function typeIn(a, el, text, speed){ return a.tap(el+'-box').then(function(){ focus(a, el); return a.wait(250); }).then(function(){ return a.type(el, text, speed || 100); }).then(function(){ blur(a, el); return a.wait(200); }); }
  // Counts a number up (or down) in visible steps; fmt draws each value.
  function count(a, el, from, to, ms, fmt, dec){
    var n = Math.max(6, Math.round((ms || 600) / 45)), i = 0, node = typeof el === 'string' ? a.el(el) : el;
    function step(){
      i++; var k = i / n, v = from + (to - from) * (1 - Math.pow(1 - k, 2));
      v = dec ? v.toFixed(dec) : Math.round(v);
      node.textContent = fmt ? fmt(v) : String(v);
      return i < n ? a.wait(45).then(step) : a.wait(0);
    }
    return step();
  }
  function busy(a, btn, ms){ on(a.el(btn), 'is-busy'); return a.wait(ms || 900).then(function(){ a.el(btn).classList.remove('is-busy'); }); }
  function showToast(a, ms){ on(a.el('toast'), 'is-on'); return a.wait(ms || 1800).then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); }); }
  function closeSheetNow(a, n){ var s = a.el(n); s.classList.add('no-anim'); s.classList.remove('is-on'); a.el('dim').classList.remove('is-on'); s.offsetHeight; s.classList.remove('no-anim'); }

  /* ---------- AD01 · Pilihan produk ---------- */
  var PROD = [['am','AM',5000,'#e8f1fd','#1f5fbf',2],['sr','SR',20000,'#fdeced','#ec2435',0],['hd','HD',10000,'#fff1de','#b4610e',0],['bl','BL',30000,'#cef249','#1a1919',0]];
  function product(p){
    return '<div class="mu-card mu-am-prod" data-el="p-'+p[0]+'"><span class="mu-am-ic" data-el="ic-'+p[0]+'" style="background:'+p[3]+';color:'+p[4]+'">'+p[1]+'</span>'+
      '<span class="mu-am-pn">'+T.prod[p[0]]+'</span><div class="mu-am-pb"><span class="mu-am-price">'+rp(p[2])+'</span>'+
      '<span class="mu-am-step" data-el="st-'+p[0]+'"'+(p[5] ? '' : ' hidden')+'><i data-el="minus-'+p[0]+'">−</i><b data-el="q-'+p[0]+'">'+p[5]+'</b><i class="is-dark" data-el="plus-'+p[0]+'">+</i></span></div></div>';
  }
  function ad01(){
    return pg('products', top(T.products, false, true),
      '<div class="mu-am-grid" data-el="row-1">'+product(PROD[0])+product(PROD[1])+'</div>'+
      '<div class="mu-am-grid" data-el="row-2">'+product(PROD[2])+product(PROD[3])+'</div><div class="mu-am-spacer" data-el="spacer"></div>',
      '<div class="mu-am-bar" data-el="bar"><span class="mu-col mu-grow"><span class="mu-s">'+T.total+' · <span data-el="items">'+T.items(2)+'</span></span>'+
      '<b class="mu-am-sum" data-el="sum">'+rp(10000)+'</b></span><span class="mu-btn mu-btn--soft mu-am-btn-sm" data-el="next">'+T.next+'</span></div>');
  }
  function ad01Flow(a){
    var qty = {am:2, sr:0, hd:0, bl:0}, price = {am:5000, sr:20000, hd:10000, bl:30000};
    function total(){ return Object.keys(qty).reduce(function(s, k){ return s + qty[k] * price[k]; }, 0); }
    function items(){ return Object.keys(qty).reduce(function(s, k){ return s + qty[k]; }, 0); }
    function change(k, v){
      var from = total(); qty[k] = v; a.el('q-'+k).textContent = String(v);
      a.el('items').textContent = T.items(items());
      var bar = a.el('bar'); if(!bar.classList.contains('is-on')){ on(bar, 'is-on'); on(a.el('spacer'), 'is-on'); }
      return count(a, 'sum', from, total(), 420, function(v){ return rp(Math.round(v / 500) * 500); });
    }
    function step(k, d){ return a.tap((d > 0 ? 'plus-' : 'minus-')+k).then(function(){ return change(k, qty[k] + d); }).then(function(){ return a.wait(350); }); }
    function add(k){ return a.tap('ic-'+k).then(function(){ var s = a.el('st-'+k); s.hidden = false; s.classList.add('mu-new'); return change(k, 1); }).then(function(){ return a.wait(400); }); }
    return a.wait(300)
      .then(function(){ return step('am', 1); })
      .then(function(){ return add('sr'); })
      .then(function(){ return a.scrollTo('row-2', 6, 1000); })
      .then(function(){ return add('bl'); })
      .then(function(){ return step('bl', 1); })
      .then(function(){ return a.scrollTo('row-1', 6, 800); })
      .then(function(){ return step('am', -1); })
      .then(function(){ return a.wait(300); })
      .then(function(){ return a.tap('next'); })
      .then(function(){ return a.wait(400); });
  }

  /* ---------- AD02 · Atur varian ---------- */
  function variant(v, price, el, cls){
    return '<div class="mu-card mu-am-var'+(cls || '')+'" data-el="'+el+'"><span class="mu-col mu-grow"><span class="mu-am-vn">'+v[0]+'</span><span class="mu-am-vd">'+v[1]+'</span></span><b class="mu-am-vp">'+price+'</b></div>';
  }
  function ad02(){
    return pg('variants', top(T.variants, true),
      field(T.prodName, 'pname', lang === 'id' ? 'Sewa Raket' : 'Racket Rental')+
      '<div class="mu-am-sec">'+T.variant+'</div>'+
      '<div class="mu-col" style="gap:10px" data-el="var-list">'+variant(T.vStd, rp(20000), 'v-std')+variant(T.vPro, rp(35000), 'v-pro')+'</div>'+
      field(T.vDesc, 'vdesc', '', T.vDescPh)+
      '<div class="mu-btn mu-btn--line mu-am-linebtn" data-el="add-var">'+T.addVariant+'</div>');
  }
  function ad02Sheet(){
    return sheet('var-sheet', T.vSheet, field(T.vName, 'vn', '', T.vNamePh)+field(T.vPrice, 'vp', '', '0', 'Rp')+
      '<div class="mu-btn mu-btn--soft" data-el="vs-save">'+T.save+'</div>');
  }
  function ad02Flow(a){
    return a.wait(300)
      .then(function(){ return a.scrollBottom('add-var', 1200); })
      .then(function(){ return a.tap('add-var'); })
      .then(function(){ return a.sheet('var-sheet', true); })
      .then(function(){ return typeIn(a, 'vn', T.vNew[0], 110); })
      .then(function(){ return typeIn(a, 'vp', '50.000', 120); })
      .then(function(){ return a.tap('vs-save'); })
      .then(function(){ return a.sheet('var-sheet', false); })
      .then(function(){
        var list = a.el('var-list'), d = document.createElement('div');
        d.innerHTML = variant(T.vNew, rp(50000), 'v-new', ' mu-new is-on'); list.appendChild(d.firstChild);
        return a.wait(300); })
      .then(function(){ return a.scrollBottom('v-new', 700); })
      .then(function(){ return a.wait(700); })
      .then(function(){ a.el('v-new').classList.remove('is-on'); return a.wait(300); });
  }

  /* ---------- AD03 · Nama coach ---------- */
  function ad03(){
    var s = T.sports3;
    return pg('coach', top(T.addCoach, true),
      '<div class="mu-row" style="gap:10px"><span class="mu-am-avatar" data-el="avatar" style="background:#e6f6ee;color:#1b7a4b">AP</span>'+
      '<span class="mu-col"><span class="mu-am-vn">'+T.photo+'</span><span class="mu-am-vd">'+T.optional+'</span></span></div>'+
      field(T.coachName, 'cname', 'Aldi Pranata')+
      '<span class="mu-am-lbl">'+T.sport+'</span>'+
      '<div class="mu-am-chips">'+chip(s[0], true, 'cs-0')+chip(s[1], true, 'cs-1')+chip(s[2], false, 'cs-2')+'</div>'+
      field(T.rate, 'crate', '150.000', '', 'Rp')+
      '<div class="mu-btn mu-btn--soft mu-am-cta" data-el="c-save">'+T.save+'</div>');
  }
  function ad03Prep(a){
    var av = a.el('avatar'); av.textContent = ''; av.style.background = '#f4f4f5'; av.innerHTML = '<span class="mu-ico" style="color:#787373">'+h.I.cam+'</span>';
    var n = a.el('cname'); n.textContent = T.coachPh; n.classList.add('is-ph');
    ['cs-0','cs-1'].forEach(function(c){ a.el(c).classList.remove('is-on'); });
    var r = a.el('crate'); r.textContent = '0'; r.classList.add('is-ph');
  }
  function ad03Flow(a){
    function pick(c){ return a.tap(c).then(function(){ on(a.el(c), 'is-on'); return a.wait(380); }); }
    return a.wait(300)
      .then(function(){ return typeIn(a, 'cname', 'Aldi Pranata', 90); })
      .then(function(){ var av = a.el('avatar'); av.innerHTML = 'AP'; av.style.background = '#e6f6ee'; av.classList.add('mu-am-pop'); return a.wait(450); })
      .then(function(){ return pick('cs-0'); })
      .then(function(){ return pick('cs-1'); })
      .then(function(){ return a.scroll(a.maxY(), 1000); })
      .then(function(){ return typeIn(a, 'crate', '150.000', 120); })
      .then(function(){ return a.tap('c-save'); })
      .then(function(){ return busy(a, 'c-save', 800); })
      .then(function(){ return showToast(a, 1900); });
  }

  /* ---------- AC01 · Cabor & jadwal (Buat Aktivitas) ---------- */
  function ac01(){
    var s = T.actSports;
    return pg('activity', top(T.createAct, true),
      '<span class="mu-am-lbl">'+T.sport+'</span>'+
      '<div class="mu-am-chips">'+chip(s[0], true, 'as-0')+chip(s[1], false, 'as-1')+chip(s[2], false, 'as-2')+'</div>'+
      '<div class="mu-card mu-am-sched" data-el="sched"><span class="mu-am-ic mu-am-ic--date" data-el="sched-ic">17</span>'+
      '<span class="mu-col mu-grow"><span class="mu-am-vn" data-el="sched-t">'+T.date+'</span><span class="mu-am-vd" data-el="sched-s">'+T.time+'</span></span></div>'+
      '<div class="mu-am-grid" data-el="stats"><div class="mu-card mu-am-stat" data-el="quota"><span class="mu-am-lbl">'+T.quota+'</span><b data-el="quota-v">'+T.players(12)+'</b></div>'+
      '<div class="mu-card mu-am-stat"><span class="mu-am-lbl">'+T.price+'</span><b>'+rp(35000)+'</b></div></div>'+
      '<div class="mu-row" style="gap:6px" data-el="pills"><span class="mu-am-tag" data-el="level">'+T.allLevels+'</span><span class="mu-am-tag mu-am-tag--blue">'+T.openPlay+'</span></div>'+
      '<div class="mu-btn mu-btn--soft mu-am-cta" data-el="publish"><span data-el="publish-l">'+T.publish+'</span></div>');
  }
  function ac01Sheets(){
    var days = T.days.map(function(d, i){ return chip(d, false, 'day-'+i); }).join('');
    var times = ['17:00','19:00','21:00'].map(function(t, i){ return chip(t, false, 'tm-'+i); }).join('');
    var levels = T.levels.map(function(l, i){ return '<div class="mu-li" data-el="lv-'+i+'"><span class="mu-t mu-grow" style="font-weight:600">'+l+'</span><span class="mu-radio"></span></div>'; }).join('');
    return sheet('date-sheet', T.dSheet, '<span class="mu-am-lbl">'+T.dDate+'</span><div class="mu-am-chips">'+days+'</div>'+
        '<span class="mu-am-lbl">'+T.dTime+'</span><div class="mu-am-chips">'+times+'</div><div class="mu-btn mu-btn--soft" data-el="d-save">'+T.save+'</div>')+
      sheet('quota-sheet', T.qSheet, '<span class="mu-s">'+T.qSub+'</span><div class="mu-am-bigstep"><i data-el="q-minus">−</i><b data-el="q-n">8</b><i data-el="q-plus">+</i></div>'+
        '<div class="mu-btn mu-btn--soft" data-el="q-save">'+T.save+'</div>')+
      sheet('level-sheet', T.lSheet, '<div class="mu-list">'+levels+'</div>')+
      toast(T.actToast);
  }
  function ac01Prep(a){
    a.el('as-0').classList.remove('is-on');
    var ic = a.el('sched-ic'); ic.classList.add('is-empty'); ic.textContent = '–';
    a.el('sched-t').textContent = T.pickDate; a.el('sched-t').classList.add('is-ph'); a.el('sched-s').textContent = T.pickDateSub;
    a.el('quota-v').textContent = T.players(8);
    var lv = a.el('level'); lv.textContent = T.pickLevel; lv.classList.add('is-empty');
  }
  function ac01Flow(a){
    function pick(c, group){ return a.tap(c).then(function(){ if(group) [].forEach.call(a.el(c).parentNode.children, function(x){ x.classList.remove('is-on'); }); on(a.el(c), 'is-on'); return a.wait(350); }); }
    return a.wait(300)
      .then(function(){ return pick('as-0', true); })
      // Date & time
      .then(function(){ return a.tap('sched'); })
      .then(function(){ return a.sheet('date-sheet', true); })
      .then(function(){ return pick('day-1', true); })
      .then(function(){ return pick('tm-1', true); })
      .then(function(){ return a.tap('d-save'); })
      .then(function(){
        var ic = a.el('sched-ic'); ic.classList.remove('is-empty'); ic.textContent = '17';
        var t = a.el('sched-t'); t.classList.remove('is-ph'); t.textContent = T.date; a.el('sched-s').textContent = T.time;
        on(a.el('sched'), 'mu-am-flash'); return a.sheet('date-sheet', false); })
      .then(function(){ return a.scrollTo('stats', 6, 900); })
      // Quota stepper 8 → 12
      .then(function(){ return a.tap('quota'); })
      .then(function(){ return a.sheet('quota-sheet', true); })
      .then(function(){ var p = Promise.resolve(); for(var i = 0; i < 4; i++) p = p.then(function(){ return a.tap('q-plus'); }).then(function(){ var n = a.el('q-n'); n.textContent = String(+n.textContent + 1); return a.wait(260); }); return p; })
      .then(function(){ return a.tap('q-save'); })
      .then(function(){ a.el('quota-v').textContent = T.players(12); return a.sheet('quota-sheet', false); })
      // Level
      .then(function(){ return a.tap('level'); })
      .then(function(){ return a.sheet('level-sheet', true); })
      .then(function(){ return a.tap('lv-3'); })
      .then(function(){ a.radio('lv-3'); return a.wait(350); })
      .then(function(){ var lv = a.el('level'); lv.classList.remove('is-empty'); lv.textContent = T.allLevels; return a.sheet('level-sheet', false); })
      // Publish
      .then(function(){ return a.scroll(a.maxY(), 800); })
      .then(function(){ return a.tap('publish'); })
      .then(function(){ return busy(a, 'publish', 900); })
      .then(function(){ var b = a.el('publish'); b.classList.remove('mu-btn--soft'); b.classList.add('mu-btn--line'); a.el('publish-l').textContent = '✓ '+T.published; return showToast(a, 2000); });
  }

  /* ---------- FT01 · Hak akses staff ---------- */
  function ft01(){
    var r = T.roles;
    var perms = T.perms.map(function(p, i){ return '<div class="mu-am-perm'+(i < 2 ? ' is-on' : '')+'" data-el="pm-'+i+'"><span class="mu-am-box"></span><span>'+p+'</span></div>'; }).join('');
    return pg('access', top(T.access, true),
      '<div class="mu-col" style="gap:6px"><span class="mu-am-lbl mu-am-lbl--sm">'+T.role+'</span>'+
      '<div class="mu-am-chips mu-am-chips--sm" data-el="roles">'+chip(r[0], false, 'r-0')+chip(r[1], true, 'r-1')+chip(r[2], false, 'r-2')+'</div>'+
      '<span class="mu-am-lbl mu-am-lbl--sm" data-el="r-desc">'+T.roleDesc[r[1]]+'</span></div>'+
      '<div class="mu-am-sec" data-el="perm-h">'+T.permFor(r[1])+'</div>'+
      '<div class="mu-card mu-am-perms" data-el="perms">'+perms+'</div>'+
      '<div class="mu-btn mu-btn--soft mu-am-cta" data-el="a-save">'+T.save+'</div>');
  }
  function ft01Prep(a){
    a.el('r-1').classList.remove('is-on'); a.el('r-desc').textContent = T.roleDesc.none; a.el('perm-h').textContent = T.permFor('');
    [0,1].forEach(function(i){ a.el('pm-'+i).classList.remove('is-on'); });
  }
  function ft01Flow(a){
    var r = T.roles;
    function role(i){ return a.tap('r-'+i).then(function(){ a.select('roles', 'r-'+i); a.el('r-desc').textContent = T.roleDesc[r[i]]; a.el('perm-h').textContent = T.permFor(r[i]); return a.wait(650); }); }
    function tick(i){ return a.tap('pm-'+i).then(function(){ on(a.el('pm-'+i), 'is-on'); return a.wait(420); }); }
    return a.wait(300)
      .then(function(){ return role(2); })
      .then(function(){ return role(1); })
      .then(function(){ return a.scrollTo('perm-h', 6, 800); })
      .then(function(){ return tick(0); })
      .then(function(){ return tick(1); })
      .then(function(){ return a.scroll(a.maxY(), 800); })
      .then(function(){ return a.tap('a-save'); })
      .then(function(){ return busy(a, 'a-save', 700); })
      .then(function(){ return showToast(a, 1900); });
  }

  /* ---------- FT03 · Daftar coach ---------- */
  function coachCard(c, i){
    return '<div class="mu-card mu-am-coach" data-el="co-'+i+'"><span class="mu-am-avatar mu-am-avatar--sm" style="background:'+c[4]+';color:'+c[5]+'">'+c[0]+'</span>'+
      '<span class="mu-am-vn">'+c[1]+'</span><span class="mu-am-vd">'+c[2]+'</span><span class="mu-am-sess">'+T.sess(c[3])+'</span></div>';
  }
  function ft03(){
    var c = T.coaches;
    return pg('coaches', top(T.coach, false, true),
      '<div class="mu-am-grid">'+stat(T.active, '4', 'n-active').replace('mu-am-stat', 'mu-am-stat mu-am-stat--lg')+stat(T.week, '23', 'n-week').replace('mu-am-stat', 'mu-am-stat mu-am-stat--lg')+'</div>'+
      '<div class="mu-am-grid" data-el="crow-1">'+coachCard(c[0], 0)+coachCard(c[1], 1)+'</div>'+
      '<div class="mu-am-grid" data-el="crow-2">'+coachCard(c[2], 2)+coachCard(c[3], 3)+'</div>');
  }
  function ft03Prep(a){ a.el('n-active').textContent = '0'; a.el('n-week').textContent = '0'; [0,1,2,3].forEach(function(i){ a.el('co-'+i).style.opacity = '0'; }); }
  function ft03Flow(a){
    var act = 0, week = 0;
    function reveal(i){ var card = a.el('co-'+i); card.style.opacity = ''; card.classList.add('mu-new'); }
    // Counters tick up as each coach card lands (while they are in view).
    function tally(list){
      var w0 = week, a0 = act;
      list.forEach(function(i){ act++; week += T.coaches[i][3]; });
      return Promise.all([count(a, 'n-active', a0, act, 420), count(a, 'n-week', w0, week, 520)]);
    }
    return a.wait(400)
      .then(function(){ reveal(0); return tally([0]); }).then(function(){ return a.wait(250); })
      .then(function(){ reveal(1); return tally([1]); }).then(function(){ return a.wait(400); })
      // Down to the second row: two more coaches appear …
      .then(function(){ return a.scrollBottom('crow-2', 1100); })
      .then(function(){ reveal(2); return a.wait(350); })
      .then(function(){ reveal(3); return a.wait(700); })
      // … and back up, where the counters take them in.
      .then(function(){ return a.scroll(0, 1000); })
      .then(function(){ return tally([2, 3]); })
      .then(function(){ return a.wait(300); });
  }

  /* ---------- FT04 · Ulasan penyewa ---------- */
  function review(r){
    return '<div class="mu-card mu-am-rev" data-el="rv-'+r[0]+'"><div class="mu-row mu-row--between"><span class="mu-am-rn">'+r[1]+'</span><span class="mu-am-rate">'+STAR1+r[2]+'</span></div>'+
      '<span class="mu-am-rt">'+r[3]+'</span>'+
      '<div class="mu-row mu-row--between"><span class="mu-am-meta">'+r[4]+'</span><span class="mu-am-reply" data-el="reply-'+r[0]+'">'+T.reply+'</span></div>'+
      '<div data-el="slot-'+r[0]+'"></div></div>';
  }
  function ft04(){
    return pg('reviews', top(T.reviews, true),
      '<div class="mu-card mu-am-score"><span class="mu-am-big"><b data-el="score">4.8</b><span>/5</span></span>'+
      '<span class="mu-col" style="gap:3px">'+stars(4)+'<span class="mu-am-vd" data-el="rline">'+T.ratingLine(105, 38)+'</span></span></div>'+
      T.revs.map(review).join(''));
  }
  function ft04Prep(a){ a.el('score').textContent = '0.0'; a.el('rline').textContent = T.ratingLine(0, 0); [0,1,2,3].forEach(function(i){ a.el('star-'+i).setAttribute('class', ''); }); }
  function ft04Flow(a){
    var line = a.el('rline');
    return a.wait(400)
      .then(function(){
        var st = Promise.resolve();
        [0,1,2,3].forEach(function(i){ st = st.then(function(){ return a.wait(200); }).then(function(){ a.el('star-'+i).setAttribute('class', 'is-on'); }); });
        return Promise.all([count(a, 'score', 0, 4.8, 900, null, 1),
          count(a, line, 0, 105, 900, function(v){ return T.ratingLine(v, Math.round(v * 38 / 105)); }), st]); })
      .then(function(){ return a.wait(500); })
      .then(function(){ return a.scroll(a.maxY(), 1500); })
      .then(function(){ return a.wait(500); })
      .then(function(){ return a.scrollTo('rv-raka', 6, 1100); })
      .then(function(){ return a.tap('reply-raka'); })
      .then(function(){
        a.el('slot-raka').innerHTML = '<div class="mu-am-replybox mu-new"><div class="mu-am-in is-focus mu-grow" data-el="rp-box"><span data-el="rp" class="mu-caret"></span></div>'+
          '<span class="mu-btn mu-btn--soft mu-am-btn-sm" data-el="rp-send">'+T.send+'</span></div>';
        return a.wait(400); })
      .then(function(){ return a.type('rp', T.replyText, 70); })
      .then(function(){ return a.tap('rp-send'); })
      .then(function(){
        a.el('slot-raka').innerHTML = '<div class="mu-am-replied mu-new"><b>'+T.yourReply+'</b><span>'+T.replyText+'</span></div>';
        var b = a.el('reply-raka'); b.textContent = '✓ '+T.replied; on(b, 'is-done');
        return a.wait(400); })
      .then(function(){ return a.scrollBottom('rv-raka', 700); });
  }

  M.add({
    cards: {
      'avm-ad01': {pages:[ad01()], flow:'avm-ad01'},
      'avm-ad02': {pages:[ad02()], extra:ad02Sheet, flow:'avm-ad02'},
      'avm-ad03': {pages:[ad03()], extra:function(){ return toast(T.coachToast); }, flow:'avm-ad03'},
      'avm-ac01': {pages:[ac01()], extra:ac01Sheets, flow:'avm-ac01'},
      'avm-ft01': {pages:[ft01()], extra:function(){ return toast(T.accessToast); }, flow:'avm-ft01'},
      'avm-ft03': {pages:[ft03()], flow:'avm-ft03'},
      'avm-ft04': {pages:[ft04()], flow:'avm-ft04'}
    },
    flows: {'avm-ad01':ad01Flow, 'avm-ad02':ad02Flow, 'avm-ad03':ad03Flow, 'avm-ac01':ac01Flow, 'avm-ft01':ft01Flow, 'avm-ft03':ft03Flow, 'avm-ft04':ft04Flow},
    prep: {'avm-ad03':ad03Prep, 'avm-ac01':ac01Prep, 'avm-ft01':ft01Prep, 'avm-ft03':ft03Prep, 'avm-ft04':ft04Prep}
  });
})();
