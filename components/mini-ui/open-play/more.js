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
  // Hero icons, taken from Figma (Event Details 28443:30660, PadelLevels
  // 28577:41807, Superhost BadgeTag 28443:30584). Drawn on Figma's 13.33px grid.
  var HV = '<svg viewBox="0 0 13.333 13.333" fill="none" aria-hidden="true">';
  var HS = ' fill="none" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round"';
  var HI = {
    // Padel racket (Figma 28443:30595), 10.67px box.
    padel: '<svg viewBox="0 0 10.667 10.667" fill="#25282B" aria-hidden="true"><path d="M6.04 2.944a.4.4 0 1 0 .4-.693.4.4 0 0 0-.4.693zM7.195 3.61a.4.4 0 1 0 .4-.692.4.4 0 0 0-.4.692zM5.787 4.183a.4.4 0 1 1-.693-.4.4.4 0 0 1 .693.4zM6.942 4.85a.4.4 0 1 1-.693-.4.4.4 0 0 1 .693.4z"/><path fill-rule="evenodd" d="M5.508.467c.719-.194 1.519.01 2.425.532.906.523 1.482 1.115 1.674 1.834.192.72-.033 1.457-.46 2.196-.425.736-1.03 1.463-1.802 1.863a2.6 2.6 0 0 1-.39.169L4.996 8.486l-.89 1.543a.667.667 0 0 1-.911.244l-.924-.533a.667.667 0 0 1-.244-.911l.89-1.543.255-2.409a2.6 2.6 0 0 1-.05-.422c-.038-.868.288-1.756.713-2.493C4.263 1.223 4.788.661 5.508.467zm.208.772c-.42.113-.804.459-1.187 1.123-.385.666-.636 1.4-.607 2.057.028.628.311 1.219 1.077 1.661.767.442 1.42.392 1.978.102.584-.303 1.093-.887 1.478-1.553.383-.664.49-1.17.379-1.59-.112-.421-.475-.87-1.301-1.347-.826-.477-1.396-.566-1.817-.453zM3.453 7.959l-.667 1.154.693.4.667-1.154-.693-.4zm1.146-1.186c.305.176.603.294.894.362l-.826.601-.935-.54.107-1.016c.204.218.456.417.76.593z"/></svg>',
    crown: '<svg class="op-crown" viewBox="4 2.667 9.333 9.333" fill="none" aria-hidden="true"><path d="M4.78 5.78l.51.41a1.6 1.6 0 0 0 2.33-.46l1.05-1.89 1.05 1.89a1.6 1.6 0 0 0 2.33.46l.51-.41-.68 3.41a1.07 1.07 0 0 1-.53.7 6.02 6.02 0 0 1-5.35 0 1.07 1.07 0 0 1-.53-.7z" fill="#EC2435" stroke="#EC2435" stroke-width="1.167" stroke-linejoin="round"/><path d="M7.12 8.5c1 .52 2.1.52 3.11 0" stroke="#fff" stroke-width=".583" stroke-linecap="round"/></svg>',
    level: HV+'<rect width="13.333" height="13.333" rx="2.667" fill="#F3F0ED"/><path d="M7.156 8.339 10.638 3.562l-.334-.23-3.146 4.308L5.597 5.034 2.305 9.844 5.58 5.709z" fill-rule="evenodd" fill="#D83232"/><path d="m7.157 10 3.43-4.735-.334-.23-3.094 4.267-1.56-2.607-2.49 3.078 2.472-2.403z" fill-rule="evenodd" fill="#D83232"/></svg>',
    cal: HV+'<path d="M8.886 1.109v2.222M4.442 1.109v2.222M1.664 5.554h10M7.22 2.22H6.109c-2.095 0-3.143 0-3.794.652-.65.651-.651 1.698-.651 3.793v1.111c0 2.095 0 3.143.651 3.794.651.65 1.699.651 3.794.651H7.22c2.095 0 3.143 0 3.793-.651.651-.651.651-1.699.651-3.794V6.665c0-2.095 0-3.143-.651-3.793C10.362 2.221 9.315 2.22 7.22 2.22z"'+HS+'/><path d="M6.665 7.777h.005M6.665 10h.005M8.885 7.777h.005M4.445 7.777h.005M4.445 10h.005"'+HS+' stroke-width="1.333"/></svg>',
    pin: HV+'<path fill="#2C2C2C" fill-rule="evenodd" d="M6.667 1.832C4.325 1.832 2.5 3.499 2.5 5.865c0 1.936.835 3.346 1.793 4.279.482.469.991.814 1.434 1.04.46.234.798.315.94.315.142 0 .479-.08.94-.315.442-.226.951-.571 1.433-1.04.958-.933 1.793-2.343 1.793-4.279 0-2.366-1.825-4.033-4.166-4.033zM1.5 5.865C1.5 2.898 3.823.832 6.667.832s5.166 2.066 5.166 5.033c0 2.252-.98 3.909-2.095 4.996-.556.541-1.148.944-1.678 1.214-.512.261-1.017.424-1.393.424s-.882-.163-1.394-.424a7.1 7.1 0 0 1-1.677-1.214C2.48 9.774 1.5 8.118 1.5 5.865zm5.167-.833c-.57 0-1.056.479-1.056 1.1 0 .621.486 1.1 1.056 1.1.57 0 1.055-.479 1.055-1.1 0-.621-.486-1.1-1.055-1.1zM4.61 6.132c0-1.146.908-2.1 2.056-2.1 1.149 0 2.056.954 2.056 2.1 0 1.147-.907 2.1-2.056 2.1-1.148 0-2.055-.953-2.055-2.1z"/><circle cx="10.336" cy="10.332" r="2.833" fill="#00C48C" stroke="#fff" stroke-width=".333"/><path fill="#fff" fill-rule="evenodd" d="M11.651 9.265a.45.45 0 0 1 0 .636l-1.375 1.375a.45.45 0 0 1-.636 0l-.625-.625a.45.45 0 0 1 .636-.636l.307.307 1.057-1.057a.45.45 0 0 1 .636 0z"/></svg>',
    money: HV+'<path d="M8.887 2.777H4.443c-1.571 0-2.357 0-2.845.489-.488.488-.488 1.274-.488 2.845v1.111c0 1.571 0 2.357.488 2.845.488.488 1.274.488 2.845.488h4.444c1.571 0 2.357 0 2.845-.488.488-.488.488-1.274.488-2.845V6.111c0-1.571 0-2.357-.488-2.845-.488-.489-1.274-.489-2.845-.489z"'+HS+'/><path d="M10.277 6.668h.005M3.055 6.668h.005"'+HS+' stroke-width="1.333"/><path d="M8.333 6.667a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0z"'+HS+'/></svg>',
    lock: HV+'<path d="M6.664 9.166V8.055"'+HS+'/><path d="M2.368 10.47c.125.927.893 1.655 1.829 1.697.786.036 1.586.055 2.466.055.881 0 1.68-.019 2.467-.056.936-.042 1.704-.77 1.829-1.697.082-.606.149-1.226.149-1.858 0-.633-.067-1.253-.149-1.859-.125-.927-.893-1.655-1.829-1.698a54.6 54.6 0 0 0-2.467-.055c-.88 0-1.68.019-2.466.056-.936.042-1.704.77-1.829 1.697-.082.606-.149 1.226-.149 1.858 0 .633.067 1.253.149 1.859z"'+HS+'/><path d="M4.164 4.998V3.609a2.5 2.5 0 0 1 5 0v1.389"'+HS+'/></svg>'
  };
  // A hero detail row as in Figma: 13.33px icon, 8px gap, bold line over a
  // regular one (or one line with a bold lead), optional tag below.
  function hrow(icon, b, s, extra){
    return '<div class="op-hloc"><span class="op-hloc__pin">'+HI[icon]+'</span><div class="op-hloc__c"><div><b>'+b+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>'+(extra||'')+'</div></div>';
  }
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
      (o.hero
        // Hero (Figma 28448:20941): the PRD's own pills — dark teal "Open play"
        // with lime text, pink Superhost with the crown.
        ? '<div class="mu-row" style="gap:5px"><span class="op-hpill op-hpill--open">Open play</span><span class="op-hpill op-hpill--super">'+HI.crown+'Superhost</span></div>'
        : '<div class="mu-row" style="gap:4px">'+tag('Open Play','open')+(o.superhost ? tag('Superhost','super', I.crown) : '')+'</div>')+
      (o.hero
        // Hero session (Figma 28443:30575): a Jakarta game.
        ? '<span class="op-dtitle">Fun Padel Kawan AYO Jakarta Area</span>'+
          '<span class="op-meta">'+'<span class="op-ic">'+HI.padel+'</span>'+'<b>Padel</b> • '+ic('bolt')+'<b>Kompetitif</b> • '+ic('pin')+'<b>Jakarta</b></span>'
        : '<span class="op-dtitle">Fun Padel Kawan AYO Chapter Bogor Area</span>'+
          '<span class="op-meta">'+ic('racket')+'<b>Padel</b> • '+ic('bolt')+'<b>Kompetitif</b> • '+ic('pin')+'<b>Kabupaten Bogor</b></span>')+
      '<div class="op-ppl" style="align-items:flex-start">'+ppl+'</div>'+
      '<div class="op-dtabs"><span class="is-on">Detail</span><span>Diskusi</span><span>Skor</span></div>'+
      (o.hero
        // Event Details rows as in Figma 28443:30660: the PadelLevels logo,
        // calendar, pin with the green check, money and lock icons.
        ? hrow('level', 'PadelLevels · 2.50 - 3.50', 'Pemain dengan rating 2.50 – 3.50 diutamakan')+
          '<div data-el="when">'+hrow('cal', 'Minggu, 17 Agustus 2026', '09:30 - 11:30')+'</div>'+
          hrow('pin', 'Kawan AYO Jakarta', 'Lapangan Utama', '<span class="op-hbooked">Booked via <img src="assets/icons/footer/logo.svg" alt="AYO" width="48" height="26"></span>')+
          '<div data-el="fee">'+hrow('money', 'Rp75.000 <span>· Hanya Pembayaran Online</span>')+'</div>'+
          hrow('lock', 'Privasi <span>· Publik</span>')
        : irow('level', 'PadelLevels · 2.50 - 3.50', 'Pemain dengan rating 2.50 – 3.50 diutamakan.')+
          '<div data-el="when">'+irow('cal', 'Minggu, 17 Agustus 2026', '09:30 - 11:30')+'</div>'+
          irow('pin', 'Kawan AYO Arena Bogor', 'Lapangan Utama', tag('Booked via AYO','booked'))+
          '<div data-el="fee">'+irow('money', 'Rp75.000 · Pembayaran Online')+'</div>'+
          (o.full ? '' : irow('lock', 'Privasi · Publik')))+
      '<span class="op-desc">Main aman, main nyaman, sudah termasuk foto &amp; air mineral. Tanya dahulu ketersediaan slot jadwal ke admin.</span><b style="font-size:9px">Selengkapnya</b>'+
      '<span class="op-band"></span><span class="op-sub" data-el="org">Penyelenggara</span>'+
      '<div class="op-org" data-el="org-row"><span class="op-logo op-logo--kpb">KPB</span><div class="mu-col mu-grow" style="gap:2px"><b style="font-size:10.5px">Komunitas Padel Bogor</b>'+
        '<span class="op-rate" data-el="rate">'+I.star+'<b>4.9</b>(86) · Dimas Pratama'+I.crown+'</span></div></div>'+
      '<span class="op-sp"></span>',
      o.hero ? '' : foot(cta));
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
      // No flow: the screen stays put; only the pills and the Booked tag move (CSS).
      'op-hero': {pages:[detail({host:true, superhost:true, hero:true})]}
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
