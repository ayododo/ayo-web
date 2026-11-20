/* ==========================================================================
   AYO — Open Play (host): Mini UI cards, part 2
   Tabs: Skor Live (op-sk01–sk06, sk04 is the "$0,00" card in the page
   markup, played by scripts/scoring.js), Pembayaran (op-by01–by03),
   Bagikan & Superhost (op-b01–b03). Uses the parts from host.js
   (window.AyoOP), so load host.js first.

   Skor Live reuses the Scoring Mini UIs (same screens and flows as the
   Scoring page, mini-ui.js f01–f03, m01, m02, k01, s01) drawn here in
   Indonesian. Pembayaran and Bagikan follow PRD Open Play
   HOS5cFYe4Fj7gqJumLpxsR: Non Approval join flow 3594:36575 (detail →
   checkout → "you're in"), Player List Type=Joined 2132:47872, host detail
   2100:25369 (rating 2100:25542), Find a Match 3594:36856 (Superhost crown).
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI, O = window.AyoOP; if(!M || !O) return;
  var h = M.h, on = h.on, I = O.I, ic = O.ic, av = O.av, btn = O.btn, tag = O.tag, foot = O.foot;

  /* =====================================================================
     SKOR LIVE — Scoring screens in Indonesian
     ===================================================================== */
  var NM = {fajar:'Fajar R.', maya:'Maya L.', bayu:'Bayu A.', tari:'Tari A.', raka:'Raka A.', sinta:'Sinta D.', dika:'Dika P.', nina:'Nina S.'};
  var FULL = {fajar:'Fajar Rahman', maya:'Maya Lestari', bayu:'Bayu Adi', tari:'Tari Ayu', raka:'Raka Aditya', sinta:'Sinta Dewi', dika:'Dika Putra', nina:'Nina Sari'};
  // Standings before and after Round 1 · Court A is scored 16–8 (Fajar & Maya
  // beat Bayu & Tari): the four players' games, record, difference and points
  // change, and Fajar and Maya climb from 5th and 6th to the top.
  var BEFORE = [['nina','4','2-0-2','+6','51'],['sinta','4','2-1-1','0','48'],['dika','4','1-2-1','0','48'],['raka','4','2-1-1','-2','47'],
                ['fajar','3','2-0-1','+8','40'],['maya','3','1-2-0','+6','39'],['tari','3','0-1-2','-8','32'],['bayu','3','0-1-2','-10','31']];
  var AFTER  = [['fajar','4','3-0-1','+16','56'],['maya','4','2-2-0','+14','55'],['nina','4','2-0-2','+6','51'],['sinta','4','2-1-1','0','48'],
                ['dika','4','1-2-1','0','48'],['raka','4','2-1-1','-2','47'],['tari','4','0-1-3','-16','40'],['bayu','4','0-1-3','-18','39']];
  var MOVED = {fajar:1, maya:1, tari:1, bayu:1};

  function partners(fmt, onRow){
    var rows = fmt === 'Custom' ? [['Singles · 1 vs 1',''],['Doubles · 2 vs 2','']] :
      [['Pasangan Bergilir','Pasangan berganti setiap match.'],['Pasangan Tetap','Pasangan sama di setiap match.'],['Pasangan Campuran','Pasangan campuran dari dua grup.'],['Singles','Perorangan bertanding 1 vs 1.']];
    return rows.map(function(r){ return '<div class="mu-li"><div class="mu-col mu-grow"><span class="mu-h">'+r[0]+'</span>'+(r[1]?'<span class="mu-s">'+r[1]+'</span>':'')+'</div><span class="mu-radio'+(r[0]===onRow?' is-on':'')+'"></span></div>'; }).join('');
  }
  function setup(o){
    o = o || {};
    var fmt = o.fmt || 'Americano', cas = o.mode === 'cas';
    var tiles = ['Custom','Americano','Mexicano'].map(function(t){ return '<span class="mu-tile'+(t===fmt?' is-on':'')+'" data-el="tile-'+t+'">'+t+'</span>'; }).join('');
    return h.page('setup', O.headT('Buat GameTime'),
      '<div class="op-sc" style="display:contents">'+
      '<div class="mu-h">Kategori Olahraga</div>'+
      '<div class="mu-chips"><span class="mu-chip is-on">Padel</span><span class="mu-chip">Tenis</span><span class="mu-chip">Badminton</span></div>'+
      '<div class="mu-seg" data-el="mode" data-on="'+(cas?1:0)+'"><span class="mu-seg__knob"></span><span class="mu-seg__i'+(cas?'':' is-on')+'" data-el="mode-0">Kompetitif</span><span class="mu-seg__i'+(cas?' is-on':'')+'" data-el="mode-1">Santai</span></div>'+
      '<div class="mu-tint" data-el="info"><div class="mu-t mu-b" data-el="info-t">'+(cas?'Hanya untuk seru-seruan':'Ini untuk pertandingan serius')+'</div><div class="mu-s" data-el="info-s">'+(cas?'Skor tidak memengaruhi rating skill kamu.':'Skor memengaruhi rating skill kamu.')+'</div></div>'+
      '<div class="mu-tiles" data-el="formats">'+tiles+'</div>'+
      '<div class="mu-list" data-el="partners">'+partners(fmt, fmt === 'Custom' ? 'Doubles · 2 vs 2' : 'Pasangan Bergilir')+'</div>'+
      '<div class="mu-card mu-pad mu-col" style="gap:4px"><span class="mu-h">Kriteria Peringkat Klasemen</span><span class="mu-s" style="font-size:10px">1&nbsp; Total Poin<br>2&nbsp; Jumlah Kemenangan<br>3&nbsp; Selisih Poin</span></div>'+
      '<div class="mu-row mu-row--between"><span class="mu-h">Jumlah Lapangan</span><span class="mu-step"><i>–</i><span>1</span><span>+</span></span></div>'+
      '<div class="mu-field">Lapangan 1</div>'+
      btn('Lanjutkan', 'continue')+'</div>');
  }
  function team(a, b, right, el){ return '<div class="mu-row" data-el="'+el+'">'+h.pair(a, b)+'<span class="mu-t mu-grow" style="font-weight:500">'+NM[a]+' / '+NM[b]+'</span>'+(right||'')+'</div>'; }
  function round(n, t1, t2, r1, r2){
    return '<div class="mu-col" style="gap:6px" data-el="round-'+n+'"><span class="mu-cap">RONDE '+n+'</span><div class="mu-card mu-pad mu-col" style="gap:8px">'+
      '<div class="mu-row"><span class="mu-t mu-b mu-grow">Lapangan A</span><span class="mu-link">Cadangan</span><span class="mu-link">Ubah</span></div>'+
      team(t1[0], t1[1], r1, 't'+n+'a')+team(t2[0], t2[1], r2, 't'+n+'b')+'</div></div>';
  }
  function plus(el){ return '<span class="mu-pill"'+(el?' data-el="'+el+'"':'')+'>+ Skor</span>'; }
  function sc(v, el){ return '<span class="mu-score"'+(el?' data-el="'+el+'"':'')+'>'+v+'</span>'; }
  function table(data, hl){
    var rows = data.map(function(r, i){
      return '<div class="mu-tr'+(hl && MOVED[r[0]] ? ' op-tr-hl' : '')+'" data-el="row-'+r[0]+'"><span'+(i===0?' style="font-weight:700"':'')+'><b class="op-rk">'+(i+1)+'</b>&nbsp; '+FULL[r[0]]+'</span><span class="c-g">'+r[1]+'</span><span class="c-wtl">'+r[2]+'</span><span class="c-d">'+r[3]+'</span><span class="c-p">'+r[4]+'</span></div>'; }).join('');
    return '<div class="mu-table" data-el="table"><div class="mu-tr mu-tr--head"><span>PEMAIN</span><span class="c-g">Mn</span><span class="c-wtl">M-S-K</span><span class="c-d">'+(O.isEN ? 'Diff' : 'Sel')+'</span><span class="c-p">P</span></div><div class="op-rows" data-el="rows">'+rows+'</div></div>';
  }
  function gd(o){
    o = o || {};
    var top = h.head(h.ico('back')+'<span class="mu-head__sp"></span>'+h.ico('share')+h.ico('more'));
    var people = ['fajar','maya','bayu','tari','raka','sinta'].map(function(k){ return h.av(k, 22); }).join('');
    var body = '<div class="mu-title">Fun Padel Kawan AYO</div><div class="mu-s">Padel · 8 pemain · 10 Agu 2026</div>'+
      '<div class="mu-avs">'+people+'<span class="mu-s" style="font-weight:600">8/8 ›</span></div>'+
      '<div class="mu-t"><b>'+(o.fmt||'Americano')+'</b> · Pasangan Bergilir</div>'+
      '<div class="mu-seg mu-seg--sm" data-on="'+(o.tab||0)+'" data-el="tabs-row"><span class="mu-seg__knob"></span><span class="mu-seg__i'+(o.tab?'':' is-on')+'">Pertandingan</span><span class="mu-seg__i'+(o.tab?' is-on':'')+'">Klasemen</span></div>';
    if(o.tab) body += table(o.data || AFTER);
    else {
      body += round(1, ['fajar','maya'], ['bayu','tari'], o.r1 ? sc(16,'s1a') : '<span data-el="s1a"></span>', o.r1 ? sc(8,'s1b') : plus('plus-1'));
      body += round(2, ['raka','sinta'], ['dika','nina'], '', plus());
      body += '<div class="op-btns" data-el="footer">'+btn('Akhiri Sesi','','line')+btn('+ Tambah Ronde')+'</div>';
    }
    return h.page('gd', top, body);
  }
  function input(){
    function side(a, b){ return '<div class="mu-col" style="flex:1;align-items:center;gap:5px"><span class="mu-pair">'+h.av(a, 32)+h.av(b, 32)+'</span><span class="mu-s">'+NM[a]+' / '+NM[b]+'</span></div>'; }
    return h.page('input', h.head(h.ico('close')+'<span class="mu-head__title">Ronde 1 · Lapangan A</span><span class="mu-head__sp"></span><span class="mu-h" data-el="save">Simpan</span>'),
      '<div class="mu-row" style="align-items:flex-start;padding-top:6px">'+side('fajar','maya')+side('bayu','tari')+'</div>'+
      '<div class="mu-row"><div class="mu-scorebox" data-el="box-a">–<b data-el="val-a">0</b>+</div><div class="mu-scorebox" data-el="box-b">–<b data-el="val-b">0</b>+</div></div>'+
      '<div class="mu-h" style="margin-top:4px">Foto Pertandingan</div><div class="mu-photo"><span class="mu-ico">'+h.I.cam+'</span></div>');
  }
  function numpad(){
    var k = ['1','2','3','4','5','6','7','8','9','','0','⌫'].map(function(c){ return '<span data-el="key-'+(c||'none')+'">'+c+'</span>'; }).join('');
    return '<div class="mu-sheet op-numpad" data-el="numpad"><span class="mu-sheet__bar"></span><div class="mu-field is-focus" style="padding:7px 10px"><div class="mu-s" style="font-size:8.5px">Skor · <span data-el="np-label">Fajar R. / Maya L.</span></div><span data-el="np-val" class="mu-caret mu-b" style="font-size:12px"></span></div>'+
      '<div class="mu-keys">'+k+'</div>'+btn('Selesai', 'np-done', 'line')+'</div>';
  }
  function setMode(a, cas){
    a.el('mode').dataset.on = cas ? '1' : '0';
    on(a.el('mode-0'), 'is-on', !cas); on(a.el('mode-1'), 'is-on', cas);
    a.el('info-t').textContent = O.L(cas ? 'Hanya untuk seru-seruan' : 'Ini untuk pertandingan serius');
    a.el('info-s').textContent = O.L(cas ? 'Skor tidak memengaruhi rating skill kamu.' : 'Skor memengaruhi rating skill kamu.');
    O.pop(a.el('info'));
  }
  function pickFormat(a, fmt){
    return a.tap('tile-'+fmt).then(function(){
      a.select('formats', 'tile-'+fmt);
      var p = a.el('partners'); p.innerHTML = O.trHTML(partners(fmt, fmt === 'Custom' ? 'Doubles · 2 vs 2' : 'Pasangan Bergilir')); O.pop(p);
      return a.wait(1500);
    });
  }
  // The table re-sorts with the new numbers: rows move to their new place
  // (each slides from where it was), and the changed rows are tinted.
  function reorder(a){
    var box = a.el('rows'), old = {};
    [].forEach.call(box.children, function(r){ old[r.dataset.el] = r.offsetTop; });
    AFTER.forEach(function(d, i){
      var r = a.el('row-'+d[0]), cells = r.children;
      cells[0].innerHTML = '<b class="op-rk">'+(i+1)+'</b>&nbsp; '+FULL[d[0]]; cells[0].style.fontWeight = i === 0 ? '700' : '';
      cells[1].textContent = d[1]; cells[2].textContent = d[2]; cells[3].textContent = d[3]; cells[4].textContent = d[4];
      box.appendChild(r);
    });
    [].forEach.call(box.children, function(r){
      r.style.transition = 'none'; r.style.transform = 'translateY('+(old[r.dataset.el] - r.offsetTop)+'px)';
    });
    box.offsetHeight;
    [].forEach.call(box.children, function(r){ r.style.transition = ''; r.style.transform = ''; if(MOVED[r.dataset.el.slice(4)]) r.classList.add('op-tr-hl'); });
    return a.wait(900);
  }

  /* =====================================================================
     PEMBAYARAN + BAGIKAN — detail, checkout, confirmation, activity list
     ===================================================================== */
  function irow(icon, b, s, extra){ return '<div class="op-irow">'+ic(icon)+'<div><b>'+b+'</b>'+(s?'<span>'+s+'</span>':'')+(extra||'')+'</div></div>'; }
  // The Open Play detail (PRD 2139:49870 / 2100:25369): host or player.
  function detail(o){
    o = o || {};
    var ppl;
    if(o.full){
      ppl = [['dimas','n','3.34'],['bima','y','3.XX'],['sinta','n','2.80'],['yoga','r','X.XX'],['rara','n','3.10']].map(function(p){
        return '<span class="mu-col" style="align-items:center;gap:2px">'+av(p[0], 24)+O.lv(p[1], p[2])+'</span>'; }).join('')+'<b>5/8 ›</b>';
    } else {
      ppl = '<span class="mu-col" style="align-items:center;gap:2px">'+av('dimas', 24)+O.lv('n','3.34')+'</span>'+O.slot(24)+O.slot(24)+O.slot(24)+O.slot(24)+'<b>1/8 ›</b>';
    }
    var cta = o.host ? '<span class="op-sq">'+ic('chat')+'</span>'+btn('Atur Open Play','atur') : btn(o.cta || 'Gabung Open Play', 'join');
    return h.page(o.page || 'detail', O.headIcons('chev'),
      '<div class="mu-row" style="gap:4px">'+tag('Open Play','open')+(o.superhost ? tag('Superhost','super', I.crown) : '')+'</div>'+
      '<span class="op-dtitle">Fun Padel Kawan AYO Chapter Bogor Area</span>'+
      '<span class="op-meta">'+ic('racket')+'<b>Padel</b> • '+ic('bolt')+'<b>Kompetitif</b> • '+ic('pin')+'<b>Kabupaten Bogor</b></span>'+
      '<div class="op-ppl" style="align-items:flex-start">'+ppl+'</div>'+
      '<div class="op-dtabs"><span class="is-on">Detail</span><span>Diskusi</span><span>Skor</span></div>'+
      irow('level', 'PadelLevels · 2.50 - 3.50', 'Pemain dengan rating 2.50 – 3.50 diutamakan.')+
      '<div data-el="when">'+irow('cal', 'Minggu, 17 Agustus 2026', '09:30 - 11:30')+'</div>'+
      irow('pin', 'Kawan AYO Arena Bogor', 'Lapangan Utama', tag('Booked via AYO','booked'))+
      '<div data-el="fee">'+irow('money', 'Rp75.000 · Pembayaran Online')+'</div>'+
      (o.full ? '' : irow('lock', 'Privasi · Publik'))+
      '<span class="op-desc">Main aman, main nyaman, sudah termasuk foto &amp; air mineral. Tanya dahulu ketersediaan slot jadwal ke admin.</span><b style="font-size:9px">Selengkapnya</b>'+
      '<span class="op-band"></span><span class="op-sub" data-el="org">Penyelenggara</span>'+
      '<div class="op-org" data-el="org-row"><span class="op-logo op-logo--kpb">KPB</span><div class="mu-col mu-grow" style="gap:2px"><b style="font-size:10.5px">Komunitas Padel Bogor</b>'+
        '<span class="op-rate" data-el="rate">'+I.star+'<b>4.9</b>(86) · Dimas Pratama'+I.crown+'</span></div></div>'+
      '<span class="op-sp"></span>',
      foot(cta));
  }
  function checkout(sel){
    function pay(logo, name, fee, el, right){ return '<div class="op-pay" data-el="'+el+'"><span class="op-pay__l">'+logo+'</span><div class="mu-col"><span class="mu-t" style="font-size:10.5px;font-weight:500">'+name+'</span><span class="mu-s" style="font-size:8.5px">'+fee+'</span></div>'+(right||'<span class="mu-radio'+(el===sel?' is-on':'')+'"></span>')+'</div>'; }
    return h.page('checkout', O.headT('Checkout'),
      '<span class="op-st">Informasi Aktivitas</span>'+
      '<b style="font-size:11px">Fun Padel Kawan AYO Chapter Bogor Area</b>'+
      '<span class="op-meta" style="color:#17171a">'+ic('cal')+'Minggu, 17 Agustus 2026 · 09:30 - 11:30</span>'+
      '<span class="op-meta" style="color:#17171a">'+ic('pin')+'Kawan AYO Arena Bogor · Lapangan Utama</span>'+
      '<span class="op-hr"></span><span class="op-st">Peserta</span>'+
      '<div class="mu-row">'+av('laras', 28)+'<div class="mu-col" style="gap:3px"><span class="op-name"><b>Laras Ayu</b><span>@laras</span></span><span class="op-chips2" style="margin:0"><span class="op-self">Nilai sendiri · Newbie</span>'+O.lv('y','3.XX')+'</span></div></div>'+
      '<div class="op-org" style="padding:4px 0"><span class="op-logo" style="background:#f1f1f2;color:#52575c">'+ic('users','op-ic--mut')+'</span><div class="mu-col mu-grow"><b style="font-size:10px">Daftar Kolektif</b><span class="mu-s" style="font-size:8.5px">Daftarkan peserta lain ke event ini</span></div>'+ic('chev')+'</div>'+
      '<span class="op-hr"></span><span class="op-st" data-el="pm">Metode Pembayaran</span>'+
      '<div class="mu-seg mu-seg--sm" data-on="0"><span class="mu-seg__knob"></span><span class="mu-seg__i is-on">Online</span><span class="mu-seg__i" style="color:#b4b4b4">Tunai</span></div>'+
      '<div data-el="methods">'+pay('<span style="color:#1a4fa3">BCA</span>', 'BCA Virtual Account', '+Rp4.000', 'm-bca')+pay('QRIS', 'QRIS', '+Rp2.500', 'm-qris')+
        pay(ic('card','op-ic--mut'), 'Kartu', '+Rp2.500', 'm-card', '<u class="op-u">Masukkan Kartu</u>')+'</div>'+
      '<span class="op-hr"></span><span class="op-terms">Dengan melanjutkan, kamu telah menyetujui <u>Syarat &amp; Ketentuan</u> serta <u>Kebijakan Privasi</u>.</span><span class="op-sp"></span>',
      foot('<span class="op-total"><span>Total</span><b data-el="total">Rp79.000</b></span><span class="op-btn" data-el="pay">'+ic('shield')+'Bayar Sekarang</span>'));
  }
  var CH = [
    ['Facebook', '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#1877f2"/><path d="M17.6 25v-7.6h2.6l.4-3h-3v-1.9c0-.9.3-1.5 1.5-1.5h1.6V8.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H12v3h2.5V25z" fill="#fff"/></svg>'],
    ['IG Feed', '<svg viewBox="0 0 32 32"><defs><linearGradient id="opg1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a825"/><stop offset=".5" stop-color="#e1306c"/><stop offset="1" stop-color="#833ab4"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#opg1)"/><g fill="#fff"><rect x="10" y="10" width="3.4" height="3.4" rx=".6"/><rect x="14.3" y="10" width="3.4" height="3.4" rx=".6"/><rect x="18.6" y="10" width="3.4" height="3.4" rx=".6"/><rect x="10" y="14.3" width="3.4" height="3.4" rx=".6"/><rect x="14.3" y="14.3" width="3.4" height="3.4" rx=".6"/><rect x="18.6" y="14.3" width="3.4" height="3.4" rx=".6"/><rect x="10" y="18.6" width="3.4" height="3.4" rx=".6"/><rect x="14.3" y="18.6" width="3.4" height="3.4" rx=".6"/><rect x="18.6" y="18.6" width="3.4" height="3.4" rx=".6"/></g></svg>'],
    ['IG Story', '<svg viewBox="0 0 32 32"><defs><linearGradient id="opg2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a825"/><stop offset=".5" stop-color="#e1306c"/><stop offset="1" stop-color="#833ab4"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#opg2)"/><circle cx="16" cy="16" r="7" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="3 2"/><path d="M16 12.5v7M12.5 16h7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>'],
    ['WhatsApp', '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#25d366"/><path d="M16 8.5a7.5 7.5 0 0 0-6.4 11.4l-1 3.6 3.7-1A7.5 7.5 0 1 0 16 8.5z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M13.4 12.6c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.6 1.4c0 .2 0 .3-.1.4l-.4.5c-.1.1-.1.2 0 .4.4.7 1.2 1.6 2.3 2 .2.1.3.1.4-.1l.5-.6c.1-.1.3-.2.4-.1l1.4.7c.2.1.3.2.3.3 0 .4-.2 1-.7 1.3-.5.3-1.3.4-2.6-.1-1.6-.7-2.9-2.2-3.4-3.1-.5-.9-.6-1.9-.2-2.6z" fill="#fff"/></svg>']];
  // "You're in" (PRD Thank you Page 3600:35983, share panel 3600:36742).
  function thanks(page){
    return h.page(page || 'thanks', '',
      '<span style="height:10px;flex:0 0 auto"></span><span class="op-ok">'+I.check+'</span>'+
      '<span class="op-ty">Kamu sudah masuk!<br>Spot kamu terkonfirmasi</span>'+
      '<div class="op-ses"><div class="mu-col mu-grow"><span class="mu-pair">'+av('dimas', 18)+av('laras', 18)+'</span><b style="font-size:10.5px;margin-top:3px">Fun Padel Kawan AYO Chapter…</b>'+
        '<span class="mu-s" style="font-size:8.5px">09:30 - 11:30 · Padel</span><span class="mu-s" style="font-size:8.5px">Kawan AYO Arena Bogor</span>'+tag('Bergabung','join')+'</div><span class="op-map"></span></div>'+
      '<span class="op-band"></span><span class="op-sub" data-el="share">Bagikan Open Play</span>'+
      '<div class="op-chan">'+CH.map(function(c, i){ return '<span data-el="ch-'+i+'"><i>'+c[1]+'</i>'+c[0]+'</span>'; }).join('')+'</div>'+
      '<span class="op-copy">'+ic('link')+'Salin link undangan</span>'+
      '<span class="op-band"></span><span class="op-sub">Gabung komunitas biar selalu update</span>'+
      '<div class="op-comm"><span class="op-logo" style="background:#7c5cff"></span><div class="mu-col mu-grow"><b style="font-size:10px">Komunitas Padel Bogor</b><span class="mu-s" style="font-size:8.5px">Padel · Kabupaten Bogor</span></div><span class="op-btn">Gabung</span></div>'+
      '<span class="op-sp"></span>',
      foot(btn('Lihat Detail Open Play')));
  }
  // Find a Match list (PRD 3594:36856): the host's avatar wears the Superhost crown.
  function activities(){
    function acard(o){
      var host = '<span class="op-hostav">'+av(o.host, 22)+(o.crown ? I.crown : '')+'</span>';
      var avs = host+o.others.map(function(k){ return av(k, 22); }).join('')+Array(o.empty + 1).join(O.slot(22));
      return '<div class="op-acard" data-el="'+o.el+'"><span class="op-acard__o"><span class="op-logo op-logo--kpb" style="background:'+o.bg+'">'+o.lg+'</span>'+o.org+'</span><b>'+o.title+'</b>'+
        '<span class="op-acard__m">'+tag('Open Play','open')+ic(o.mode === 'Kompetitif' ? 'bolt' : 'clock')+o.mode+'&nbsp;'+ic('clock')+'120 Menit</span>'+
        '<span class="op-acard__v">'+ic('pin')+'<span>'+o.venue+' <b style="font-size:7.5px;color:#13804b">Booked via AYO</b><small>'+o.area+'</small></span></span>'+
        '<div class="op-acard__a"><div>'+avs+'</div><span>'+o.count+'</span></div></div>';
    }
    return h.page('acts', h.head('<span class="mu-ico">'+I.back+'</span><span class="mu-head__sp"></span><span class="op-loc">Lokasi<b>Kabupaten Bogor'+ic('down','op-ic--sm')+'</b></span><span class="mu-head__sp"></span><span class="mu-ico">'+I.search+'</span>'),
      '<div class="op-fchips">'+ic('filter')+'<span>'+ic('racket','op-ic--sm')+'Padel'+ic('down','op-ic--sm')+'</span><span>Coaching</span><span>'+I.crown+'Superhost</span></div>'+
      '<div class="op-days"><span><small>Semua</small>&nbsp;</span><span class="is-on"><small>Hari ini</small>17</span><span><small>Sen</small>18</span><span><small>Sel</small>19</span><span><small>Rab</small>20</span><span><small>Kam</small>21</span></div>'+
      '<div class="op-grp"><span><b>09:30</b> | 2 aktivitas</span>'+ic('up','op-ic--sm op-ic--mut')+'</div>'+
      acard({el:'card-1', bg:'#1f2a44', lg:'KPB', org:'Komunitas Padel Bogor', title:'Fun Padel Kawan AYO Chapter Bogor…', mode:'Kompetitif', venue:'Kawan AYO Arena Bogor', area:'Cisarua, Kabupaten Bogor', host:'dimas', crown:true, others:[], empty:4, count:'1/8'})+
      acard({el:'card-2', bg:'#6b4fd8', lg:'BPS', org:'Bogor Padel Squad', title:'Sparring Santai Akhir Pekan', mode:'Santai', venue:'Padel Hub Sentul', area:'Sentul, Kabupaten Bogor', host:'arif', crown:false, others:['rangga','sinta'], empty:3, count:'3/6'})+
      '<span class="op-sp"></span>');
  }
  function joined(){
    var rows = [O.prow({k:'dimas', host:true, kebab:true, paid:true, self:'Nilai sendiri · Intermediate', lv:['n','3.34']}),
      O.prow({k:'bima', kebab:true, paid:true, self:'Nilai sendiri · Beginner', lv:['y','3.XX']}),
      O.prow({k:'sinta', kebab:true, paid:true, self:'Nilai sendiri · Beginner', lv:['lock']}),
      O.prow({k:'yoga', kebab:true, paid:true, self:'Nilai sendiri · Intermediate', lv:['r','X.XX']}),
      O.prow({k:'rara', kebab:true, paid:true, self:'Nilai sendiri · Pro', lv:['n','3.34']}),
      O.prow({k:'arif', kebab:true, paid:true, self:'Nilai sendiri · Beginner', lv:['lock']})];
    return O.plist({tabs:['Permintaan','Daftar Tunggu','Pembayaran','Bergabung (6)','Dibatalkan'], active:3, shift:-96, rows:rows});
  }
  function press(a, el, ms){ var e = a.el(el); on(e, 'is-press'); return a.wait(ms || 220).then(function(){ e.classList.remove('is-press'); }); }

  O.add({
    cards: {
      // SK01 · Beragam format. Static: the formats, Americano picked.
      'op-sk01': {pages:[setup()], to:'formats', margin:8, flow:'op-sk01'},
      // SK02 · Tim seimbang. Static: the top of the GameTime (Mexicano).
      'op-sk02': {pages:[gd({fmt:'Mexicano'})], flow:'op-sk02'},
      // SK03 · Papan skor live. Static: Ronde 1 with + Skor.
      'op-sk03': {pages:[gd(), input()], to:'round-1', extra:numpad, flow:'op-sk03'},
      // SK05 · Klasemen live. Static: the top of the standings tab.
      'op-sk05': {pages:[gd({tab:1, data:BEFORE})], flow:'op-sk05'},
      // SK06 · Kompetitif. Static: Buat GameTime on Santai.
      'op-sk06': {pages:[setup({mode:'cas'})], flow:'op-sk06'},
      // BY01 · Biaya per pemain. Static: the form at Biaya Pendaftaran.
      'op-by01': {pages:[O.form({booked:true, skill:'2.50 - 3.25'})], to:'links', margin:10, extra:function(){ return O.feeSheet()+O.numKb('kb'); }, flow:'op-by01'},
      // BY02 · Bayar saat bergabung (player). Static: the detail.
      'op-by02': {pages:[detail({full:true, cta:'Gabung Aktivitas'}), checkout('m-bca'), thanks()], flow:'op-by02'},
      // BY03 · Status pembayaran. Static: Bergabung (6), all paid.
      'op-by03': {pages:[joined()], flow:'op-by03'},
      // B01 · Bagikan. Static: the "you're in" screen.
      'op-b01': {pages:[thanks()], flow:'op-b01'},
      // B02 · Rating host. Static: the host's detail.
      'op-b02': {pages:[detail({host:true, superhost:true})], flow:'op-b02'},
      // B03 · Superhost. Static: the activity list.
      'op-b03': {pages:[activities(), detail({superhost:true})], flow:'op-b03'},
      // Hero (Figma 27055:7122, staging H01): the host's own session detail.
      'op-hero': {pages:[detail({host:true, superhost:true})], flow:'op-hero'}
    },
    prep: {
      'op-by01': O.feePrep
    },
    flows: {
      // Americano → Mexicano → Custom (the pairing options change with it).
      'op-sk01': function(a){
        return a.toTarget().then(function(){ return a.wait(700); })
          .then(function(){ return pickFormat(a, 'Mexicano'); })
          .then(function(){ return pickFormat(a, 'Custom'); })
          .then(function(){ return a.scroll(a.maxY(), 1200); });
      },
      // Down the rounds: Ronde 1, Ronde 2 (new pairs), then the session controls.
      'op-sk02': function(a){
        return a.wait(500).then(function(){ return a.scrollTo('round-1', 6, 1000); })
          .then(function(){ return a.wait(900); })
          .then(function(){ return a.scrollTo('round-2', 6, 1000); })
          .then(function(){ return a.wait(900); })
          .then(function(){ return a.scrollBottom('footer', 900); });
      },
      // + Skor → Input Skor → numpad 16 → numpad 8 → Simpan → the score shows.
      'op-sk03': function(a){
        function numpadFor(box, label, digits, val){
          return a.tap(box).then(function(){ on(a.el(box), 'is-focus'); a.el('np-label').textContent = label; a.el('np-val').textContent = ''; return a.sheet('numpad', true); })
            .then(function(){ var p = Promise.resolve(); digits.split('').forEach(function(d){ p = p.then(function(){ return a.tap('key-'+d); }).then(function(){ var k = a.el('key-'+d); on(k, 'is-press'); setTimeout(function(){ k.classList.remove('is-press'); }, 140); a.el('np-val').textContent += d; return a.wait(260); }); }); return p; })
            .then(function(){ return a.tap('np-done'); })
            .then(function(){ a.el(val).textContent = digits; a.el(box).classList.remove('is-focus'); return a.sheet('numpad', false); });
        }
        return a.toTarget().then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('plus-1'); })
          .then(function(){ return a.go('input'); })
          .then(function(){ return numpadFor('box-a', 'Fajar R. / Maya L.', '16', 'val-a'); })
          .then(function(){ return numpadFor('box-b', 'Bayu A. / Tari A.', '8', 'val-b'); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('save'); })
          .then(function(){ a.el('s1a').outerHTML = sc(16, 's1a'); a.el('plus-1').outerHTML = sc(8, 's1b'); O.pop(a.el('s1a')); O.pop(a.el('s1b')); return a.back('gd'); })
          .then(function(){ return a.wait(600); });
      },
      // Down to the table → a score comes in: numbers change and the rows
      // move to their new places → down the rest of the table.
      'op-sk05': function(a){
        return a.wait(500).then(function(){ return a.scrollTo('table', 6, 1000); })
          .then(function(){ return a.wait(900); })
          .then(function(){ return reorder(a); })
          .then(function(){ return a.wait(1300); })
          .then(function(){ return a.scroll(a.maxY(), 1100); });
      },
      // Santai → Kompetitif: the info turns to "affects your skill rating".
      'op-sk06': function(a){
        return a.wait(700).then(function(){ return a.tap('mode-0'); })
          .then(function(){ setMode(a, false); return a.wait(800); });
      },
      'op-by01': O.feeFlow,
      // Gabung Aktivitas → Checkout → down to Metode Pembayaran → QRIS (the
      // total changes) → Bayar Sekarang → "you're in".
      'op-by02': function(a){
        return a.wait(600).then(function(){ return a.tap('join'); })
          .then(function(){ return a.go('checkout'); })
          .then(function(){ return a.wait(400); })
          .then(function(){ return O.scrollAbove(a, 'm-qris', 1000); })
          .then(function(){ return a.tap('m-qris'); })
          .then(function(){
            [].forEach.call(a.el('methods').querySelectorAll('.mu-radio'), function(r){ r.classList.remove('is-on'); });
            a.el('m-qris').querySelector('.mu-radio').classList.add('is-on');
            a.el('total').textContent = 'Rp77.500'; O.pop(a.el('total')); return a.wait(700); })
          .then(function(){ return a.tap('pay'); })
          .then(function(){ return a.go('thanks'); })
          .then(function(){ return a.wait(500); });
      },
      // Down the joined list until every player shows "Lunas".
      'op-by03': function(a){
        return a.wait(700).then(function(){ return a.scroll(a.maxY(), 1600); })
          .then(function(){ return a.wait(500); });
      },
      // Hero: from the top, one scroll down through schedule, venue and fee; the
      // host's control (Atur Open Play) is lit; back up to the top.
      'op-hero': function(a){
        return a.wait(900).then(function(){ return O.scrollAbove(a, 'fee', 1600); })
          .then(function(){ return a.wait(900); })
          .then(function(){ on(a.el('atur'), 'is-hl'); return a.wait(2200); })
          .then(function(){ a.el('atur').classList.remove('is-hl'); return a.scroll(0, 1300); });
      },
      // Down to "Bagikan Open Play" → WhatsApp.
      'op-b01': function(a){
        return a.wait(600).then(function(){ return a.scrollTo('share', 8, 1100); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('ch-3'); })
          .then(function(){ return press(a, 'ch-3'); })
          .then(function(){ return a.wait(500); });
      },
      // Down to Penyelenggara → the rating and review count light up.
      'op-b02': function(a){
        return a.wait(500).then(function(){ return O.scrollAbove(a, 'org-row', 1300); })
          .then(function(){ return a.wait(400); })
          .then(function(){ on(a.el('rate'), 'is-hl'); return a.wait(1600); });
      },
      // Down the list to the session with the crown → open it → the
      // Superhost tag → down to Penyelenggara (the crown by the host's name).
      'op-b03': function(a){
        return a.wait(500).then(function(){ return a.scrollBottom('card-1', 1000); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('card-1'); })
          .then(function(){ return a.go('detail'); })
          .then(function(){ return a.wait(900); })
          .then(function(){ return O.scrollAbove(a, 'org-row', 1200); });
      }
    }
  });
})();
