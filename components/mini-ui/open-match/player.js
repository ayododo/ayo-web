/* ==========================================================================
   AYO — Open Match: Mini UI cards for the "Untuk pemain / For players" tab
   Page design: Figma 26953:69087 (key features, players tab), staging board
   28427:17089 (slots P01–P05). Sources are read from the Open Match PRD file
   04uINvJUyqOhAdayb0pLjT (read only):
     P01 · Find your match — Hosted 6992:201322 (Find a Match 6992:200150,
           Filter 6992:199904)
     P02 · Choose your spot and join — [Player] Respon Approval / Online
           Payment 4642:223324 (Select Spot 4642:225225, Checkout 4642:223492,
           Thank you 4642:223733)
     P03 · Confirm the score — I. Match Verification · Player Score
           Confirmation 4207:170685 (Confirm Match 4143:127101, Modal 4143:129151)
     P04 · Rate your host — I. Match Verification [Player] Review Match
           4207:170684 (Review 4143:128822 / 4143:128769)
     P05 · Build your level — no rating screen in the PRD: Match Result chips
           (4378:190691) plus a PadelLevels card in the same parts.

   The player is Maya L. ("Kamu / You"), joining Fajar's match — the same
   fictional set as the host tab. Needs components/mini-ui/mini-ui.js and
   open-match/host.css (shared om-* parts) loaded first.
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings ---------- */
  var T = {
    id: {
      loc:'Lokasi', city:'Jakarta Selatan', coaching:'Coaching', superhost:'Superhost', all:'Semua',
      days:[['Hari ini','18'],['Sen','19'],['Sel','20'],['Rab','21']], slot1:'08:00', acts:'3 aktivitas', mins:'120 Menit',
      casual:'Santai', comp:'Kompetitif', booked:'Booked via',
      filter:'Filter', reset:'Reset', type:'Jenis Aktivitas', opDesc:'Main bareng, pemain bebas', omDesc:'Lawan tanding 1v1, 2v2, tim',
      tags:'Tag', apply:'Terapkan',
      // P02
      title:'Fajar’s Open Match', meta:'Padel · Kompetitif · Jakarta Selatan', avail:'Tersedia', you:'Kamu',
      plRow:'PadelLevels · 2.50 – 3.50', plSub:'Pemain dengan rating 2.50 – 3.50 diutamakan', date:'Minggu, 17 Agu 2026', time:'09:00 – 11:00',
      venue:'Arena Padel Senayan', court:'Court A', approved:'Request disetujui', approvedS:'Pilih slotmu sekarang!', pick:'Pilih Slot &amp; Bayar',
      spotT:'Pilih Posisimu', spotTip:'Tap slot yang tersedia untuk memilih posisimu.', toPay:'Lanjut ke Pembayaran',
      checkout:'Checkout', actInfo:'Info Aktivitas', participant:'Peserta', self:'Self rated · Pemula', method:'Metode Pembayaran',
      online:'Online', cash:'Tunai', bca:'BCA Virtual Account', qris:'QRIS', fee1:'+Rp4.000', fee2:'+Rp2.500',
      details:'Rincian Pembayaran', reg:'Reguler x1', service:'Biaya layanan', total:'Total', pay:'Bayar Sekarang',
      inT:'Kamu masuk!', inS:'Slotmu sudah terkonfirmasi.', joined:'Bergabung', seeDetail:'Lihat Detail Open Match',
      // P03 / P04 / P05
      resultT:'Hasil Match', final:'Skor Akhir', when:'Min, 17 Agu 2026 · 09:00 – 11:00', where:'Court A, Arena Padel Senayan',
      waitT:'Menunggu verifikasi pemain', waitS:'Butuh konfirmasi minimal satu lawan. Otomatis terverifikasi dalam 24 jam.',
      players:'Pemain', confirmQ:'Konfirmasi skor hasil match ini?', decline:'Tolak', confirm:'Konfirmasi',
      dlgT:'Konfirmasi hasil match', dlgS:'Yakin mengonfirmasi hasil ini? Setelah dikonfirmasi, tidak bisa diubah.', cancel:'Batal',
      won:'Fajar &amp; Maya Menang', verified:'Skor match sudah terverifikasi.', toastOk:'Hasil match dikonfirmasi',
      rateBtn:'Beri Penilaian Host', revT:'Bagaimana host-mu?', revS:'Bagikan pengalamanmu untuk pemain lain!',
      crit:['Ketepatan waktu','Sportivitas','Komunikasi'], verdict:['','Kurang','Cukup','Lumayan','Bagus','Luar biasa!'], submit:'Kirim',
      thanks:'Terima kasih!', thanksS:'Penilaianmu sudah terkirim.',
      lvT:'Rating PadelLevels', yourRating:'Rating kamu', before:'Sebelumnya', matches:'Match', wins:'Menang',
      lvNote:'Match Kompetitif Padel ikut menghitung rating PadelLevels-mu.'
    },
    en: {
      loc:'Location', city:'South Jakarta', coaching:'Coaching', superhost:'Superhost', all:'All',
      days:[['Today','18'],['Mon','19'],['Tue','20'],['Wed','21']], slot1:'08:00 AM', acts:'3 activities', mins:'120 Mins',
      casual:'Casual', comp:'Competitive', booked:'Booked via',
      filter:'Filter', reset:'Reset', type:'Activity Type', opDesc:'Flexible group play', omDesc:'Versus play: 1v1, 2v2, team',
      tags:'Tags', apply:'Apply',
      title:'Fajar’s Open Match', meta:'Padel · Competitive · South Jakarta', avail:'Available', you:'You',
      plRow:'PadelLevels · 2.50 – 3.50', plSub:'Players with a 2.50 – 3.50 rating are preferred', date:'Sunday, 17 Aug 2026', time:'09:00 – 11:00',
      venue:'Arena Padel Senayan', court:'Court A', approved:'Request approved', approvedS:'Pick your spot now!', pick:'Pick a Spot &amp; Pay',
      spotT:'Select Your Preferred Spot', spotTip:'Choose your position by tapping an available slot.', toPay:'Continue to Payment',
      checkout:'Checkout', actInfo:'Activity Information', participant:'Participant', self:'Self rated · Newbie', method:'Payment Method',
      online:'Online', cash:'Cash', bca:'BCA Virtual Account', qris:'QRIS', fee1:'+Rp4.000', fee2:'+Rp2.500',
      details:'Payment Details', reg:'Regular x1', service:'Service fee', total:'Total', pay:'Pay Now',
      inT:'You’re in!', inS:'Your spot is confirmed.', joined:'Joined', seeDetail:'Open Match Detail',
      resultT:'Match Result', final:'Final Score', when:'Sun, 17 Aug 2026 · 09:00 – 11:00', where:'Court A, Arena Padel Senayan',
      waitT:'Awaiting verification from players', waitS:'Needs at least one opponent to confirm. Verified automatically after 24 hours.',
      players:'Players', confirmQ:'Confirm this match result score?', decline:'Decline', confirm:'Confirm',
      dlgT:'Confirm match result', dlgS:'Are you sure you want to confirm this result? Once confirmed, it cannot be undone.', cancel:'Cancel',
      won:'Fajar &amp; Maya Won', verified:'The match score has been verified.', toastOk:'Match result confirmed',
      rateBtn:'Rate Your Host', revT:'How was your host?', revS:'Share your experience to help other players!',
      crit:['Punctuality','Sportsmanship','Communication'], verdict:['','Poor','Fair','Pretty good','Great','Awesome!'], submit:'Submit',
      thanks:'Thank you!', thanksS:'Your review has been sent.',
      lvT:'PadelLevels Rating', yourRating:'Your rating', before:'Before', matches:'Matches', wins:'Wins',
      lvNote:'Competitive padel matches count towards your PadelLevels rating.'
    }
  };
  var t = T[lang];
  var SHORT = {fajar:'Fajar R.', maya:'Maya L.', raka:'Raka A.', nina:'Nina S.', bayu:'Bayu A.', tari:'Tari A.', sinta:'Sinta D.', dika:'Dika P.'};
  var RATE = {fajar:'3.41', maya:'3.34', raka:'3.38', nina:'2.95'};

  /* ---------- Icons ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var I = {
    search: S+'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
    sliders: S+'<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>',
    down: S+'<path d="m6 9 6 6 6-6"/></svg>',
    clock: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    pin: S+'<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    cal: S+'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M9 3v4"/><path d="M15 3v4"/></svg>',
    racket: S+'<ellipse cx="10" cy="9" rx="5.5" ry="6" transform="rotate(-35 10 9)"/><path d="m13.5 13.5 5.5 5.5"/></svg>',
    chat: S+'<path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5z"/><path d="M9 10.5h.01"/><path d="M12 10.5h.01"/><path d="M15 10.5h.01"/></svg>',
    info: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L3 9.4l6.2-.9z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 12.5 4 4 8-9"/></svg>',
    // PRD icons (assets/open-match/)
    pl: '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.01212 8.10842L11.4 2.08982L10.9786 1.80002L7.01464 7.22838L5.04848 3.94426L0.900001 10.0049L5.02664 4.79462L7.01212 8.10842Z" fill-rule="evenodd" fill="#D83232"/><path d="M7.01212 10.2L11.3339 4.23407L10.9128 3.94427L7.01492 9.32028L5.04876 6.03588L1.9122 9.91387L5.02692 6.88624L7.01212 10.2Z" fill-rule="evenodd" fill="#D83232"/></svg>',
    zap: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.75207 8.44907H5.4461C4.45694 8.44907 3.96236 8.44907 3.75155 8.12293C3.54074 7.79687 3.7416 7.34253 4.14334 6.43389L5.3511 3.70215C5.71636 2.876 5.89899 2.46292 6.25329 2.23146C6.60759 2 7.05724 2 7.95664 2H9.34958C10.4421 2 10.9884 2 11.1944 2.3569C11.4004 2.7138 11.1294 3.19059 10.5874 4.14415L9.87278 5.40125C9.60331 5.8753 9.46858 6.11233 9.47044 6.30635C9.47291 6.5585 9.60698 6.7908 9.82358 6.918C9.99024 7.01593 10.2618 7.01593 10.8049 7.01593C11.4915 7.01593 11.8348 7.01593 12.0136 7.1348C12.2459 7.2892 12.3675 7.56547 12.3249 7.84213C12.2921 8.05507 12.0612 8.3104 11.5993 8.82113L7.90924 12.9015C7.18444 13.703 6.82204 14.1037 6.57869 13.9769C6.33533 13.8501 6.4522 13.3215 6.68591 12.2641L7.14378 10.1931C7.32171 9.388 7.41071 8.98547 7.19671 8.71727C6.98271 8.44907 6.57249 8.44907 5.75207 8.44907Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/></svg>'
  };
  function ic(n, cls){ return '<span class="om-ic'+(cls?' '+cls:'')+'">'+I[n]+'</span>'; }
  function peace(){ return '<img class="op-peace" src="assets/open-match/hand-peace.svg" alt="" width="12" height="12">'; }
  function av(k, size){ return '<img class="om-av" style="width:'+size+'px;height:'+size+'px" src="assets/scoring/avatars/'+k+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function rate(k, v, el){ return '<em class="om-rate"'+(el?' data-el="'+el+'"':'')+'>'+I.pl+'<span>'+(v || RATE[k])+'</span></em>'; }
  function booked(){ return '<span class="om-booked">'+t.booked+' <img src="assets/icons/footer/logo.svg" alt="AYO" width="16" height="9"></span>'; }
  function plain(s){ return s.replace(/&amp;/g, '&'); }
  function pop(el){ el.classList.remove('mu-new'); el.offsetWidth; el.classList.add('mu-new'); }
  function slotFull(k, label){ return '<span class="om-slot is-full"><span class="om-slot__p">'+av(k, 30)+'</span>'+rate(k)+'<span class="om-slot__l om-slot__l--me">'+(label || SHORT[k])+'</span></span>'; }
  function slotEmpty(el){ return '<span class="om-slot"'+(el?' data-el="'+el+'"':'')+'><span class="om-slot__c">'+h.I.plus+'</span><span class="om-slot__l">'+t.avail+'</span></span>'; }
  function four(center, hl){
    function p(k){ return '<span class="om-four__p'+(hl===k?' is-hl':'')+'">'+av(k, 30)+rate(k, null, hl===k?'hl-rate':null)+'<span class="om-slot__l om-slot__l--me">'+SHORT[k].split(' ')[0]+'</span></span>'; }
    return '<div class="om-four">'+p('fajar')+p('maya')+'<span class="om-four__c">'+center+'</span>'+p('raka')+p('nina')+'</div>';
  }
  function finalScore(){ return '<span class="om-four__k">'+t.final+'</span><b class="om-final">2:0</b>'; }
  function table(){
    function row(n, s, a, b, win){ return '<div class="om-tr'+(win?'':' is-lose')+'"><span>'+n+'</span><b>'+s+'</b><span>'+a+'</span><span>'+b+'</span></div>'; }
    return '<div class="om-table"><div class="om-tr om-tr--h"><span>'+t.players+'</span><b>Set</b><span>1</span><span>2</span></div>'+
      row('Fajar R./Maya L.', 2, 6, 6, true)+row('Raka A./Nina S.', 0, 3, 4, false)+'</div>';
  }
  function winBanner(el, hidden){ return '<div class="om-win'+(hidden?' is-hide':'')+'"'+(el?' data-el="'+el+'"':'')+'><div class="mu-col" style="gap:2px"><span class="mu-h">'+t.won+'</span><span class="mu-s" style="font-size:9px">'+t.verified+'</span></div><img class="om-cup" src="assets/open-match/trophy.webp" alt="" width="40" height="40"></div>'; }
  function toast(el, title, sub){ return '<div class="mu-toast op-toast" data-el="'+el+'"><span class="op-tcheck">'+I.check+'</span><span class="mu-col"><b>'+title+'</b><span>'+sub+'</span></span></div>'; }

  /* ---------- P01 · Find a Match + Filter ---------- */
  function act(o){
    var badge = o.kind === 'om' ? '<span class="op-badge">Open Match</span>' : '<span class="op-badge op-badge--play">Open Play</span>';
    var mode = o.comp ? ic('zap','op-mi')+t.comp : peace()+t.casual;
    var org = o.org ? av(o.org, 22) : '<span class="op-org" style="background:'+o.color+'">'+o.ini+'</span>';
    return '<div class="op-act" data-kind="'+o.kind+'"'+(o.el?' data-el="'+o.el+'"':'')+'>'+
      '<div class="op-act__hd">'+org+'<div class="mu-col mu-grow"><span class="mu-s" style="font-size:8.5px">'+o.by+'</span><span class="mu-h op-ellip">'+o.title+'</span></div>'+ic('racket','op-rk')+'</div>'+
      '<div class="op-act__tags">'+badge+'<span class="op-meta">'+mode+'</span><span class="op-meta">'+ic('clock','op-mi')+t.mins+'</span></div>'+
      '<div class="op-act__loc">'+ic('pin','op-mi')+'<span class="mu-t" style="font-size:10px">'+o.venue+'</span>'+booked()+'</div>'+
      '<div class="op-act__ppl"><span class="op-stack">'+o.ppl.map(function(k){ return av(k, 18); }).join('')+'</span>'+
        (o.empty ? new Array(o.empty+1).join('<span class="op-dot">'+h.I.plus+'</span>') : '')+'<span class="op-count">'+o.count+'</span></div></div>';
  }
  function find(){
    var days = '<span class="op-day op-day--all">'+t.all+'</span>'+t.days.map(function(d, i){ return '<span class="op-day'+(i===0?' is-on':'')+(i===2?' is-off':'')+'"><span class="op-day__w">'+d[0]+'</span>'+d[1]+'</span>'; }).join('');
    var list = act({kind:'op', color:'#1f3a5f', ini:'AC', by:'Anwa Community', title:'[3H2C] 120K Intense Rally', comp:false, venue:'Urban Padel', ppl:['bayu','tari','sinta','dika'], count:'16/16'})+
      act({kind:'om', org:'fajar', by:'Fajar Rahman', title:t.title, comp:true, venue:'Arena Padel Senayan', ppl:['fajar','maya','raka'], empty:1, count:'3/4', el:'act-fajar'})+
      act({kind:'op', color:'#0d6b4f', ini:'BP', by:'Banzai Padel Club', title:'Banzai Casual Tournament', comp:false, venue:'Kemang Sports Hub', ppl:['dika'], empty:3, count:'1/6'})+
      act({kind:'om', org:'nina', by:'Nina Sari', title:'Sparring Sabtu Pagi', comp:true, venue:'Bintaro Racket Club', ppl:['nina'], empty:3, count:'1/4'});
    return h.page('find', '<div class="op-loc">'+h.ico('back')+'<div class="mu-col op-loc__c"><span class="mu-s" style="font-size:8.5px">'+t.loc+'</span><span class="mu-h" style="font-size:12px">'+t.city+' ▾</span></div>'+ic('search')+'</div>',
      '<div class="op-chips"><span class="op-fbtn" data-el="fbtn">'+ic('sliders')+'<i class="op-fcount" data-el="fcount">2</i></span><span class="mu-chip is-on">Padel ▾</span><span class="mu-chip">'+t.coaching+'</span><span class="mu-chip">'+t.superhost+'</span></div>'+
      '<div class="op-days">'+days+'</div>'+
      '<span class="op-slot"><b>'+t.slot1+'</b> · '+t.acts+'</span>'+
      '<div class="op-list" data-el="list">'+list+'</div>');
  }
  function filterSheet(){
    function opt(title, sub, el){ return '<div class="op-opt" data-el="'+el+'"><b>'+title+'</b><span>'+sub+'</span></div>'; }
    return '<div class="mu-sheet om-sheet" data-el="filter"><div class="mu-row mu-row--between"><span class="mu-h" style="font-size:13px">'+t.filter+'</span><span class="mu-link" style="text-decoration:underline">'+t.reset+'</span></div>'+
      '<span class="mu-h" style="font-size:10.5px">'+t.type+'</span><div class="op-opts" data-el="types">'+opt('Open Play', t.opDesc, 'opt-op')+opt('Open Match', t.omDesc, 'opt-om')+'</div>'+
      '<span class="mu-h" style="font-size:10.5px">'+t.tags+'</span>'+
      '<div class="op-tags"><span class="mu-chip op-tag"><i class="op-gdot"></i>'+t.booked+' AYO</span><span class="mu-chip op-tag">'+peace()+t.casual+'</span><span class="mu-chip op-tag" data-el="tag-comp">'+ic('zap','op-mi')+t.comp+'</span></div>'+
      '<div class="mu-btn" data-el="apply">'+t.apply+'</div></div>';
  }

  /* ---------- P02 · Detail, spot, checkout, joined ---------- */
  function detail(){
    return h.page('detail', h.head(h.ico('back')+'<span class="mu-head__sp"></span>'+h.ico('share')),
      '<span class="op-badge" style="align-self:flex-start">Open Match</span>'+
      '<span class="mu-title">'+t.title+'</span><span class="mu-s">'+t.meta+'</span>'+
      '<div class="om-lineup">'+slotFull('fajar')+slotEmpty()+'<b class="om-vs">VS</b>'+slotEmpty()+slotEmpty()+'</div>'+
      '<div class="op-info"><span class="op-ii">'+I.pl+'</span><div class="mu-col"><b>'+t.plRow+'</b><span>'+t.plSub+'</span></div></div>'+
      '<div class="op-info">'+ic('cal','op-ii')+'<div class="mu-col"><b>'+t.date+'</b><span>'+t.time+'</span></div></div>'+
      '<div class="op-info">'+ic('pin','op-ii')+'<div class="mu-col"><b>'+t.venue+'</b><span>'+t.court+'</span></div></div>'+
      '<div class="mu-btn om-endbtn" data-el="pick">'+t.pick+'</div>',
      toast('ok-toast', t.approved, t.approvedS));
  }
  function spotSheet(){
    return '<div class="mu-sheet om-sheet" data-el="spot"><div class="mu-row mu-row--between"><span class="mu-h" style="font-size:13px">'+t.spotT+'</span>'+h.ico('close')+'</div>'+
      '<div class="om-teams"><div class="om-team"><b>A</b><div class="om-team__row">'+slotFull('fajar')+slotEmpty('s-a2')+'</div></div><span class="om-team__div"></span>'+
        '<div class="om-team"><b>B</b><div class="om-team__row">'+slotEmpty()+slotEmpty()+'</div></div></div>'+
      '<div class="mu-tint mu-s" style="font-size:9.5px">'+t.spotTip+'</div>'+
      '<div class="mu-btn mu-btn--off" data-el="to-pay">'+t.toPay+'</div></div>';
  }
  function checkout(){
    function payRow(logo, name, fee, el, onn){ return '<div class="op-pay" data-el="'+el+'">'+logo+'<div class="mu-col mu-grow"><span class="mu-t" style="font-size:10.5px">'+name+'</span><span class="mu-s" style="font-size:9px">'+fee+'</span></div><span class="mu-radio'+(onn?' is-on':'')+'"></span></div>'; }
    return h.page('checkout', h.head(h.ico('back')+'<span class="mu-head__title">'+t.checkout+'</span>'),
      '<span class="op-sec">'+t.actInfo+'</span><span class="mu-h">'+t.title+'</span>'+
      '<span class="op-li">'+ic('cal','op-mi')+t.date+' · '+t.time+'</span><span class="op-li">'+ic('pin','op-mi')+t.venue+' · '+t.court+'</span>'+
      '<span class="om-band"></span><span class="op-sec">'+t.participant+'</span>'+
      '<div class="mu-row">'+av('maya', 26)+'<div class="mu-col" style="gap:3px"><span class="mu-h" style="font-size:10.5px">Maya Lestari</span><span class="om-tags"><span class="om-tag">'+t.self+'</span>'+rate('maya')+'</span></div></div>'+
      '<span class="om-band"></span><span class="op-sec" data-el="method">'+t.method+'</span>'+
      '<div class="mu-seg mu-seg--sm" data-on="0"><span class="mu-seg__knob"></span><span class="mu-seg__i is-on">'+t.online+'</span><span class="mu-seg__i">'+t.cash+'</span></div>'+
      payRow('<span class="op-logo op-logo--bca">BCA</span>', t.bca, t.fee1, 'pay-bca', false)+payRow('<span class="op-logo">QRIS</span>', t.qris, t.fee2, 'pay-qris', false)+
      '<span class="om-band"></span><span class="op-sec">'+t.details+'</span>'+
      '<div class="op-sum"><span>'+t.reg+'</span><span>Rp75.000</span></div><div class="op-sum"><span>'+t.service+'</span><span>Rp4.000</span></div>'+
      '<div class="op-sum op-sum--t"><span>'+t.total+'</span><span>Rp79.000</span></div>'+
      '<div class="mu-btn mu-btn--off om-endbtn" data-el="pay">'+t.pay+'</div>');
  }
  function joined(){
    return h.page('joined', h.head('<span class="mu-head__sp"></span>'),
      '<div class="op-done"><span class="op-done__ic" data-el="done-ic">'+I.check+'</span><span class="mu-title" style="text-align:center">'+t.inT+'</span><span class="mu-s" style="text-align:center">'+t.inS+'</span></div>'+
      '<div class="om-lineup">'+slotFull('fajar')+slotFull('maya', t.you)+'<b class="om-vs">VS</b>'+slotEmpty()+slotEmpty()+'</div>'+
      '<div class="mu-card mu-pad mu-col" style="gap:4px"><span class="mu-h" style="font-size:11px">'+t.title+'</span><span class="op-li">'+ic('cal','op-mi')+t.date+' · '+t.time+'</span>'+
        '<span class="op-li">'+ic('pin','op-mi')+t.venue+'</span><span class="op-joined">'+t.joined+'</span></div>'+
      '<div class="mu-btn" data-el="see-detail">'+t.seeDetail+'</div>');
  }

  /* ---------- P03 · Confirm the score ---------- */
  function confirmPage(){
    return h.page('confirm', h.head(h.ico('back')+'<span class="mu-head__title">'+t.resultT+'</span>'),
      four(finalScore())+
      '<div class="op-status" data-el="status"><div class="mu-row" style="gap:5px"><span class="mu-h" style="font-size:10.5px">'+t.waitT+'</span><span class="op-idot">i</span></div><span class="mu-s" style="font-size:9px">'+t.waitS+'</span></div>'+
      '<div class="op-actions" data-el="bar"><div class="op-actrow"><span class="om-sq">'+ic('chat')+'</span><div class="mu-btn mu-btn--line" style="flex:1">'+t.decline+'</div><div class="mu-btn" style="flex:1" data-el="confirm">'+t.confirm+'</div></div></div>'+
      winBanner('won', true)+table()+'<span class="mu-s" style="text-align:center">'+t.when+'<br>'+t.where+'</span>',
      toast('ok-toast', t.toastOk, 'Fajar R./Maya L. · 2:0'));
  }
  function confirmDialog(){
    return '<div class="mu-dialog" data-el="dlg"><span class="mu-h" style="font-size:12.5px">'+t.dlgT+'</span><span class="mu-s">'+t.dlgS+'</span>'+
      '<div class="mu-btns" style="margin-top:6px"><div class="mu-btn mu-btn--line">'+t.cancel+'</div><div class="mu-btn" data-el="dlg-ok">'+t.confirm+'</div></div></div>';
  }

  /* ---------- P04 · Rate your host ---------- */
  function resultPage(){
    return h.page('result', h.head(h.ico('back')+'<span class="mu-head__title">'+t.resultT+'</span>'),
      four(finalScore())+'<span class="mu-s" style="text-align:center">'+t.when+'<br>'+t.where+'</span>'+winBanner()+
      '<div class="mu-btn mu-btn--line op-ratebtn" data-el="rate-btn">'+I.star+t.rateBtn+'</div>'+table(),
      toast('ok-toast', t.thanks, t.thanksS));
  }
  function reviewSheet(){
    var stars = [5, 4, 5];
    var rows = t.crit.map(function(c, i){
      var s = ''; for(var k = 1; k <= 5; k++) s += '<span class="op-star'+(k <= stars[i] ? ' is-on' : '')+'" data-el="st-'+i+'-'+k+'">'+I.star+'</span>';
      return '<div class="op-crit"><span class="mu-t" style="font-size:10.5px">'+c+'</span><div class="mu-row mu-row--between"><span class="op-stars" data-el="stars-'+i+'">'+s+'</span><b class="op-verdict" data-el="vd-'+i+'">'+t.verdict[stars[i]]+'</b></div></div>';
    }).join('');
    return '<div class="mu-sheet om-sheet" data-el="review"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">'+t.revT+'</span><span class="mu-s" style="margin-top:-6px">'+t.revS+'</span>'+rows+
      '<div class="mu-btn" data-el="submit">'+t.submit+'</div></div>';
  }

  /* ---------- P05 · Build your level ---------- */
  function level(){
    var spark = '<svg class="op-spark" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,34 25,31 50,33 75,27 100,29 125,24 150,25 175,20" fill="none" stroke="#c9c9c9" stroke-width="2" stroke-linejoin="round"/>'+
      '<polyline class="op-spark__new" data-el="spark" points="175,20 200,8" fill="none" stroke="#d83232" stroke-width="2.4" stroke-linecap="round"/><circle class="op-spark__dot" data-el="spark-dot" cx="200" cy="8" r="3.4" fill="#d83232"/></svg>';
    return h.page('level', h.head(h.ico('back')+'<span class="mu-head__title">'+t.resultT+'</span>'),
      four(finalScore(), 'maya')+
      '<div class="op-lv" data-el="lv"><img class="op-lv__wm" src="assets/open-match/padellevels.svg" alt="PadelLevels" width="79" height="16">'+
        '<span class="mu-s" style="font-size:9px">'+t.yourRating+'</span>'+
        '<div class="mu-row" style="gap:6px;align-items:baseline"><b class="op-lv__n" data-el="lv-n">3.41</b><span class="op-up" data-el="lv-up">▲ 0.07</span></div>'+spark+
        '<div class="op-lv__stats"><span><i>'+t.before+'</i><b>3.34</b></span><span><i>'+t.matches+'</i><b>12</b></span><span><i>'+t.wins+'</i><b>8</b></span></div></div>'+
      '<span class="mu-s" style="font-size:9px">'+t.lvNote+'</span>');
  }

  /* ---------- Motion helpers ---------- */
  function activate(a, name){
    var scr = a.stage.querySelector('.mu-screen');
    [].forEach.call(scr.querySelectorAll('.mu-page'), function(p){ p.classList.toggle('is-active', p.dataset.page === name); p.classList.remove('is-behind'); });
  }
  function closeNow(a, el){ var s = a.el(el); s.classList.add('no-anim'); s.classList.remove('is-on'); a.el('dim').classList.remove('is-on'); s.offsetHeight; s.classList.remove('no-anim'); }
  function stars(a, i, n){ for(var k = 1; k <= 5; k++) on(a.el('st-'+i+'-'+k), 'is-on', k <= n); a.el('vd-'+i).textContent = t.verdict[n]; }
  function count(el, from, to, ms){
    // Timer based (not rAF) so it also finishes in a background tab.
    return new Promise(function(res){ var t0 = Date.now(); (function f(){ var k = Math.min(1, (Date.now() - t0) / ms); el.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2); if(k < 1) setTimeout(f, 30); else res(); })(); });
  }

  M.add({
    cards: {
      // P01 · Static frame: the Find a Match list.
      'om-p01': {pages:[find()], extra:filterSheet, flow:'om-p01'},
      // P02 · Static frame: the approved request on the match detail.
      'om-p02': {pages:[detail(), checkout(), joined()], extra:spotSheet, flow:'om-p02'},
      // P03 · Static frame: the result awaiting the player's confirmation.
      'om-p03': {pages:[confirmPage()], extra:confirmDialog, flow:'om-p03'},
      // P04 · Static frame: the host review sheet, filled.
      'om-p04': {pages:[resultPage()], extra:reviewSheet, open:'review', flow:'om-p04'},
      // P05 · Static frame: the PadelLevels card after the win.
      'om-p05': {pages:[level()], flow:'om-p05'}
    },
    prep: {
      'om-p01': function(a){ a.el('fcount').classList.remove('is-on'); a.el('list').classList.remove('is-filtered'); },
      'om-p02': function(a){ a.el('ok-toast').classList.remove('is-on'); },
      'om-p04': function(a){ closeNow(a, 'review'); for(var i = 0; i < 3; i++) stars(a, i, 0); },
      'om-p05': function(a){ a.el('lv-n').textContent = '3.34'; a.el('hl-rate').querySelector('span').textContent = '3.34'; a.el('lv').classList.add('is-before'); }
    },
    flows: {
      // Filter → Open Match + Competitive → Apply → only Open Match listed.
      'om-p01': function(a){
        return a.wait(300).then(function(){ return a.tap('fbtn'); })
          .then(function(){ return a.sheet('filter', true); })
          .then(function(){ return a.tap('opt-om'); })
          .then(function(){ a.select('types', 'opt-om'); return a.wait(350); })
          .then(function(){ return a.tap('tag-comp'); })
          .then(function(){ on(a.el('tag-comp'), 'is-on'); return a.wait(450); })
          .then(function(){ return a.tap('apply'); })
          .then(function(){ a.sheet('filter', false); a.el('list').classList.add('is-filtered'); on(a.el('fcount'), 'is-on'); pop(a.el('list')); return a.wait(1200); })
          .then(function(){ return a.scrollTo('act-fajar', 4, 900); });
      },
      // Approved → Pick a spot → take A2 → Continue → Checkout → BCA → Pay → You're in.
      'om-p02': function(a){
        return a.wait(200).then(function(){ on(a.el('ok-toast'), 'is-on'); return a.wait(1400); })
          .then(function(){ a.el('ok-toast').classList.remove('is-on'); return a.scrollBottom('pick', 1000); })
          .then(function(){ return a.wait(250); })
          .then(function(){ return a.tap('pick'); })
          .then(function(){ return a.sheet('spot', true); })
          .then(function(){ return a.tap('s-a2'); })
          .then(function(){ var s = a.el('s-a2'); s.outerHTML = slotFull('maya', t.you).replace('class="om-slot is-full"', 'class="om-slot is-full mu-new" data-el="s-a2"'); a.el('to-pay').classList.remove('mu-btn--off'); return a.wait(600); })
          .then(function(){ return a.tap('to-pay'); })
          .then(function(){ a.sheet('spot', false); return a.go('checkout'); })
          .then(function(){ return a.scrollTo('method', 8, 900); })
          .then(function(){ return a.tap('pay-bca'); })
          .then(function(){ a.radio('pay-bca'); a.el('pay').classList.remove('mu-btn--off'); return a.wait(400); })
          .then(function(){ return a.scrollBottom('pay', 900); })
          .then(function(){ return a.wait(250); })
          .then(function(){ return a.tap('pay'); })
          .then(function(){ return a.go('joined'); })
          .then(function(){ pop(a.el('done-ic')); return a.wait(1200); })
          .then(function(){ return a.scrollBottom('see-detail', 900); });
      },
      // Confirm → dialog → Confirm → verified banner and toast.
      'om-p03': function(a){
        return a.wait(600).then(function(){ return a.tap('confirm'); })
          .then(function(){ return a.sheet('dlg', true); })
          .then(function(){ return a.tap('dlg-ok'); })
          .then(function(){ a.sheet('dlg', false); a.el('status').classList.add('is-hide'); a.el('bar').classList.add('is-hide'); var w = a.el('won'); w.classList.remove('is-hide'); pop(w); on(a.el('ok-toast'), 'is-on'); return a.wait(1500); })
          .then(function(){ a.el('ok-toast').classList.remove('is-on'); return a.scrollTo('won', 8, 900); });
      },
      // Rate your host → stars for each line → Submit → thank-you toast.
      'om-p04': function(a){
        return a.wait(300).then(function(){ return a.scrollTo('rate-btn', 60, 800); })
          .then(function(){ return a.wait(200); })
          .then(function(){ return a.tap('rate-btn'); })
          .then(function(){ return a.sheet('review', true); })
          .then(function(){ return a.tap('st-0-5'); }).then(function(){ stars(a, 0, 5); return a.wait(250); })
          .then(function(){ return a.tap('st-1-4'); }).then(function(){ stars(a, 1, 4); return a.wait(250); })
          .then(function(){ return a.tap('st-2-5'); }).then(function(){ stars(a, 2, 5); return a.wait(450); })
          .then(function(){ return a.tap('submit'); })
          .then(function(){ a.sheet('review', false); on(a.el('ok-toast'), 'is-on'); return a.wait(1600); })
          .then(function(){ a.el('ok-toast').classList.remove('is-on'); });
      },
      // The win lifts Maya's rating 3.34 → 3.41: the card counts up, the
      // new point joins the trend line and her chip updates.
      'om-p05': function(a){
        var chip = a.el('hl-rate');
        return a.wait(500).then(function(){ a.el('lv').classList.remove('is-before'); return count(a.el('lv-n'), 3.34, 3.41, 1100); })
          .then(function(){ chip.querySelector('span').textContent = '3.41'; pop(chip); return a.wait(900); })
          .then(function(){ return a.scrollBottom('lv', 900); });
      }
    }
  });
})();
