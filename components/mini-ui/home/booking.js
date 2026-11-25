/* ==========================================================================
   Homepage › Booking — Mini UI cards for the two tabbed showcases
   Figma: EN section 28695:9674 (Players 28732:10019, Venue owners 28706:9795,
   state boards 28724:10015 / 28707:10249); ID section 28737:10163.

   Players tab (AYO app) — new screens, drawn to the Mini UI spec:
     home-pl01  Instant court booking   pick Fri 30 · 19:00 + 20:00 on Court 2, Book now
     home-pl02  Find the right court    filters, venue cards with price + facilities
     home-pl03  Flexible payment        total with voucher, Pay in full / Down payment
   Venue-owner tab (AVM) — the AVM page cards are reused (avm-bk05, avm-pr05,
   avm-ft01); two screens are homepage-specific:
     home-bk03  Booking details · the DP booking, settled online, automatically
     home-rev   Reports · Daily / Weekly / Monthly, stat tiles, weekly line chart
   The booking the player makes (Court 2, 19:00–21:00, Photography add-on,
   voucher −Rp40.000, DP Rp210.000 now + Rp170.000 later) is the one the venue
   sees in home-bk03. A DP on AYO stays online end to end: the player pays the
   rest in the app, so the venue never marks it paid by hand — the balance
   flips to Paid by itself. (AVM's "Mark as paid" is for manual, pay-at-venue
   bookings only; the AVM page's avm-bk03 still shows that case.)

   Registers with components/mini-ui/mini-ui.js (load it first). Strings are
   picked by <html lang>; the homepage sets it from the saved language before
   these scripts run (see the inline script in index.html's <head>).
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings ---------- */
  var STR = {
    en: {
      venue:'Arena Nusantara', venueSub:'Padel · 2.1 km',
      days:[['Thu','29'],['Fri','30'],['Sat','31'],['Sun','1']], courts:['Court 1','Court 2','Court 3'], cell:'$10',
      pick0:'Pick a slot', pick1:'19:00–20:00 · Court 2', pick2:'19:00–21:00 · Court 2', book:'Book now',
      booked:'Court booked', bookedSub:'Arena Nusantara · Fri 19:00–21:00',
      loc:'Location', city:'South Jakarta', chips:['Padel','Today','≤ $15','Parking'], nearby:'12 courts nearby', from:'from',
      venues:[['Arena Nusantara','Padel · 2.1 km · ★ 4.8','$8',['Indoor','Parking','Shower']],
              ['Lapangan Merdeka','Padel · 3.4 km · ★ 4.6','$10',['Outdoor','Parking']],
              ['Padel Senopati','Padel · 4.0 km · ★ 4.7','$12',['Indoor','Shower']]],
      pay:'Payment', court:'Arena Nusantara · Court 2', when:'Fri, 30 May · 19:00–21:00 · + Photography',
      voucher:'AYO voucher', total:'Total', full:'Pay in full', fullS:'$25 now', dp:'Down payment', dpS:'$14 now · $11 later, online',
      payFull:'Pay $25', payDp:'Pay $14', paid:'Payment successful', paidSub:'DP $14 · pay the rest online in the app',
      detail:'Booking Details', extra:'Extra Services', photo:'Photography', paidP:'Paid', dpOnline:'Down payment · Online', voucherS:'AYO voucher −$3',
      restOnline:'Remaining · Online', waiting:'Pending', restS:'Paid by the customer in the AYO app',
      autoWait:'Settles itself once the customer pays', autoDone:'Paid in full · $25 added to Balance',
      restToast:'Remaining payment received', restToastS:'Court 2 · Fri 19:00–21:00 · $11',
      reports:'Reports', month:'May 2026', seg:['Daily','Weekly','Monthly'], rev:'Revenue', cnt:'Booking', weekly:'Weekly revenue',
      weeks:['W1','W2','W3','W4'], wk:[160, 195, 180, 240], revTotal:775, lo:125, hi:250,
      short:function(v){ return '$'+Math.round(v).toLocaleString('en-US'); }
    },
    id: {
      venue:'Arena Nusantara', venueSub:'Padel · 2,1 km',
      days:[['Kam','29'],['Jum','30'],['Sab','31'],['Min','1']], courts:['Lap. 1','Lap. 2','Lap. 3'], cell:'150rb',
      pick0:'Pilih jadwal', pick1:'19:00–20:00 · Lap. 2', pick2:'19:00–21:00 · Lap. 2', book:'Booking',
      booked:'Lapangan berhasil dibooking', bookedSub:'Arena Nusantara · Jum 19:00–21:00',
      loc:'Lokasi', city:'Jakarta Selatan', chips:['Padel','Hari ini','≤ Rp200rb','Parkir'], nearby:'12 lapangan terdekat', from:'mulai',
      venues:[['Arena Nusantara','Padel · 2,1 km · ★ 4,8','Rp120rb',['Indoor','Parkir','Shower']],
              ['Lapangan Merdeka','Padel · 3,4 km · ★ 4,6','Rp150rb',['Outdoor','Parkir']],
              ['Padel Senopati','Padel · 4,0 km · ★ 4,7','Rp180rb',['Indoor','Shower']]],
      pay:'Pembayaran', court:'Arena Nusantara · Lap. 2', when:'Jum, 30 Mei · 19:00–21:00 · + Fotografi',
      voucher:'Voucher AYO', total:'Total', full:'Bayar penuh', fullS:'Rp380.000 sekarang', dp:'Uang muka', dpS:'Rp210rb sekarang · Rp170rb online',
      payFull:'Bayar Rp380.000', payDp:'Bayar Rp210.000', paid:'Pembayaran berhasil', paidSub:'DP Rp210.000 · sisanya dibayar online di aplikasi',
      detail:'Detail Booking', extra:'Jasa Tambahan', photo:'Fotografi', paidP:'Lunas', dpOnline:'DP · Pembayaran Online', voucherS:'Voucher AYO −Rp40.000',
      restOnline:'Sisa Pelunasan Online', waiting:'Menunggu', restS:'Dibayar penyewa lewat aplikasi AYO',
      autoWait:'Lunas otomatis saat penyewa bayar', autoDone:'Lunas · Rp380.000 masuk ke Saldo',
      restToast:'Pelunasan diterima', restToastS:'Lap. 2 · Jum 19:00–21:00 · Rp170.000',
      reports:'Laporan', month:'Mei 2026', seg:['Harian','Mingguan','Bulanan'], rev:'Pendapatan', cnt:'Booking', weekly:'Pendapatan mingguan',
      weeks:['Mg1','Mg2','Mg3','Mg4'], wk:[2.6, 3.1, 2.9, 3.8], revTotal:12.4, lo:2.0, hi:4.0,
      short:function(v){ return 'Rp'+v.toFixed(1).replace('.', ',')+' jt'; }
    }
  };
  var T = STR[lang];
  function money(n){ return M.h.money(n, lang); }   // Rp on the ID page, USD on the EN one

  /* ---------- Small templates ---------- */
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var CARET = '<svg class="mu-hb-caret" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function el(n){ return ' data-el="'+n+'"'; }
  // A screen's main action sits in a footer pinned to the bottom of the
  // visible screen, as in the app; the content scrolls under it.
  function pad(html){ return html.replace('class="mu-scroll"', 'class="mu-scroll mu-hb-padfoot"'); }
  function foot(inner){ return '<div class="mu-foot mu-hb-foot">'+inner+'</div>'; }
  function pill(t, mod, n){ return '<span class="mu-rpp-pill mu-rpp-pill--'+mod+'"'+(n?el(n):'')+'>'+t+'</span>'; }
  function toast(t, sub){ return '<div class="mu-toast"'+el('toast')+'><span class="mu-rpp-toast-ico">'+CHECK+'</span><span class="mu-col"><b>'+t+'</b><span>'+sub+'</span></span></div>'; }
  function toastOn(a, ms){ on(a.el('toast'), 'is-on'); return a.wait(ms || 1800).then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); }); }
  function show(node){ node.style.display = ''; node.classList.remove('mu-new'); node.offsetHeight; node.classList.add('mu-new'); }
  function count(a, node, to, ms, fmt){
    var n = Math.max(1, Math.round(ms / 40)), i = 0;
    function step(){ i++; var k = i / n; node.textContent = fmt(i >= n ? to : to * (1 - Math.pow(1 - k, 3))); return i < n ? a.wait(40).then(step) : a.wait(0); }
    return step();
  }

  /* ---------- PL01 · Instant court booking ----------
     Court × hour grid. Booked slots are tinted and struck through; a picked
     slot gets the Dark-soft 1.2 stroke (no red fill). */
  var GRID = [['18:00',[1,0,0]],['19:00',[1,1,1]],['20:00',[0,1,0]],['21:00',[1,0,1]]];   // 1 = open
  function pl01(){
    var dates = '<div class="mu-tiles">'+T.days.map(function(d, i){ return '<span class="mu-tile mu-hb-date'+(i===1?' is-on':'')+'"><small>'+d[0]+'</small>'+d[1]+'</span>'; }).join('')+'</div>';
    var head = '<span></span>'+T.courts.map(function(c){ return '<span class="mu-hb-court">'+c+'</span>'; }).join('');
    var rows = GRID.map(function(r, ri){
      return '<span class="mu-hb-time">'+r[0]+'</span>'+r[1].map(function(open, ci){
        return '<span class="mu-hb-cell'+(open?'':' is-off')+'"'+el('c-'+ri+'-'+ci)+'>'+T.cell+'</span>';
      }).join('');
    }).join('');
    var sum = '<div class="mu-card mu-pad mu-row mu-hb-sum"'+el('sum')+'><div class="mu-col mu-grow"><span class="mu-s"'+el('sum-l')+'>'+T.pick2+'</span><span class="mu-hb-val"'+el('sum-v')+'>'+money(300000)+'</span></div>'+
      '<span class="mu-btn mu-btn--soft mu-hb-book"'+el('book')+'>'+T.book+'</span></div>';
    return pad(h.page('pl01', h.head('<span class="mu-head__title">'+T.venue+'</span>'),
      dates+'<div class="mu-hb-grid"'+el('grid')+'>'+head+rows+'</div>', foot(sum)));
  }
  function pick(a, ri, on_){ on(a.el('c-'+ri+'-1'), 'is-pick', on_); }

  /* ---------- PL02 · Find the right court ---------- */
  function venueCard(v, i){
    return '<div class="mu-card mu-pad mu-col mu-hb-venue"'+el('v-'+i)+' style="gap:8px">'+
      '<div class="mu-row" style="align-items:flex-start"><div class="mu-col mu-grow"><span class="mu-h">'+v[0]+'</span><span class="mu-s">'+v[1]+'</span></div>'+
      '<div class="mu-col" style="align-items:flex-end"><span class="mu-s">'+T.from+'</span><span class="mu-hb-val">'+v[2]+'</span></div></div>'+
      '<div class="mu-row" style="gap:4px">'+v[3].map(function(f){ return pill(f, 'mute'); }).join('')+'</div></div>';
  }
  function pl02(){
    var chips = '<div class="mu-chips">'+T.chips.map(function(c, i){ return '<span class="mu-chip'+(i===0?' is-on':'')+'"'+el('chip-'+i)+'>'+c+(i===0?' '+CARET:'')+'</span>'; }).join('')+'</div>';
    return h.page('pl02', '<div class="mu-head mu-rpp-head"><div class="mu-col"><span class="mu-head__sub">'+T.loc+'</span><span class="mu-head__title">'+T.city+' '+CARET+'</span></div>'+chips+'</div>',
      '<span class="mu-s"'+el('nearby')+'>'+T.nearby+'</span>'+T.venues.map(venueCard).join(''));
  }

  /* ---------- PL03 · Flexible payment options ---------- */
  function option(n, t, s, sel, badge){
    return '<div class="mu-card mu-row mu-hb-opt'+(sel?' is-on':'')+'"'+el(n)+'><span class="mu-radio'+(sel?' is-on':'')+'"'+el(n+'-r')+'></span>'+
      '<div class="mu-col mu-grow"><span class="mu-row" style="gap:5px"><span class="mu-h">'+t+'</span>'+(badge?pill('DP', 'warn'):'')+'</span><span class="mu-s">'+s+'</span></div></div>';
  }
  function pl03(){
    var sum = '<div class="mu-card mu-pad mu-col" style="gap:7px"><div class="mu-col"><span class="mu-h">'+T.court+'</span><span class="mu-s">'+T.when+'</span></div>'+
      '<div class="mu-row mu-row--between"><span class="mu-s">'+T.voucher+'</span><span class="mu-hb-off">−'+money(40000)+'</span></div>'+
      '<div class="mu-row mu-row--between"><span class="mu-h">'+T.total+'</span><span class="mu-hb-val">'+money(380000)+'</span></div></div>';
    return pad(h.page('pl03', h.head(h.ico('back')+'<span class="mu-head__title">'+T.pay+'</span>'),
      sum+option('opt-full', T.full, T.fullS, true)+option('opt-dp', T.dp, T.dpS, false, true),
      foot('<span class="mu-btn mu-btn--soft"'+el('pay')+'>'+T.payFull+'</span>')));
  }
  function choose(a, dp){
    on(a.el('opt-full'), 'is-on', !dp); on(a.el('opt-full-r'), 'is-on', !dp);
    on(a.el('opt-dp'), 'is-on', dp); on(a.el('opt-dp-r'), 'is-on', dp);
    a.el('pay').textContent = dp ? T.payDp : T.payFull;
  }

  /* ---------- BK03 · The player's DP booking, as the venue sees it ----------
     Both parts are online: the DP is in, the rest waits for the player to pay
     in the app. No "Mark as paid" — when the payment arrives, the venue is
     notified and the booking settles by itself (into Balance). */
  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
  function bp(t, tone, n){ return '<span class="mu-bp-pill mu-bp-pill--'+tone+'"'+(n?el(n):'')+'>'+t+'</span>'; }
  function bk03(){
    return pad(h.page('detail', h.head(h.ico('back')+'<span class="mu-head__title">'+T.detail+'</span><span class="mu-head__sp"></span>'+bp('DP', 'orange', 'h-pill')),
      '<div class="mu-bp-card mu-bp-card--tight"><div class="mu-bp-kv"><span class="mu-bp-k">'+T.extra+'</span><span class="mu-bp-v">'+T.photo+'</span></div></div>'+
      '<div class="mu-bp-card mu-bp-card--pay">'+
        '<div class="mu-bp-kv"><div class="mu-bp-row"><span class="mu-bp-k">'+T.dpOnline+'</span>'+bp(T.paidP, 'green')+'</div><span class="mu-bp-v mu-bp-v--lg">'+money(210000)+'</span><span class="mu-bp-sub">'+T.voucherS+'</span></div>'+
        '<span class="mu-bp-div"></span>'+
        '<div class="mu-bp-kv"><div class="mu-bp-row"><span class="mu-bp-k">'+T.restOnline+'</span>'+bp(T.waiting, 'orange', 'rest-pill')+'</div><span class="mu-bp-v mu-bp-v--lg">'+money(170000)+'</span><span class="mu-bp-sub">'+T.restS+'</span></div>'+
      '</div>',
      foot('<div class="mu-hb-auto"'+el('auto')+'><span class="mu-hb-auto__ico">'+CHECK+'</span><span'+el('auto-t')+'>'+T.autoWait+'</span></div>')));
  }
  function bk03Toast(){ return '<div class="mu-toast mu-bp-toast"'+el('toast')+'><span class="mu-bp-tick">'+BELL+'</span><span class="mu-col"><b>'+T.restToast+'</b><span>'+T.restToastS+'</span></span></div>'; }

  /* ---------- REV · Reports with a weekly line chart ----------
     Four weeks that add up to the month total (Rp12,4 jt / $775). The last week is
     the highlighted point. Drawn in Dark-soft, no red. */
  var WEEKS = T.wk;   // same shape in both: Rp jt (ID) or US$ (EN)
  var CW = 212, CH = 92, X = [18, 76, 136, 194], BASE = 76;
  function yOf(v){ return Math.round((BASE - (v - T.lo) / (T.hi - T.lo) * 50) * 10) / 10; }
  function rev(){
    var seg = '<div class="mu-seg mu-rpp-seg mu-hb-seg3" data-on="2"'+el('seg')+'><span class="mu-seg__knob"></span>'+
      T.seg.map(function(s, i){ return '<span class="mu-seg__i'+(i===2?' is-on':'')+'"'+el('seg-'+i)+'>'+s+'</span>'; }).join('')+'</div>';
    var pts = WEEKS.map(function(v, i){ return [X[i], yOf(v)]; });
    var line = pts.map(function(p, i){ return (i?'L':'M')+p[0]+','+p[1]; }).join(' ');
    var svg = '<svg class="mu-hb-plot" viewBox="0 0 '+CW+' '+CH+'" aria-hidden="true">'+
      '<line x1="0" y1="'+BASE+'" x2="'+CW+'" y2="'+BASE+'" stroke="#eee" stroke-width="1"/>'+
      '<path d="'+line+' L'+X[3]+','+BASE+' L'+X[0]+','+BASE+' Z" fill="#2c2c2c" fill-opacity=".06"'+el('area')+'/>'+
      '<line x1="'+X[3]+'" y1="'+pts[3][1]+'" x2="'+X[3]+'" y2="'+BASE+'" stroke="#d9d9d9" stroke-dasharray="2 2"/>'+
      '<path class="mu-hb-line" d="'+line+'" pathLength="1" fill="none" stroke="#2c2c2c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+el('line')+'/>'+
      pts.map(function(p, i){ return '<circle class="mu-hb-dot'+(i===3?' is-hi':'')+'" cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===3?4:3)+'"'+el('dot-'+i)+'/>'; }).join('')+
      '</svg>';
    // A dip (lower than both neighbours) takes its label under the point, so
    // it never sits on the line climbing out of it.
    function dip(i){ return i > 0 && i < WEEKS.length - 1 && WEEKS[i] < WEEKS[i-1] && WEEKS[i] < WEEKS[i+1]; }
    var labels = WEEKS.map(function(v, i){ var top = dip(i) ? yOf(v) + 6 : yOf(v) - (i===3?17:15); return '<span class="mu-hb-lbl'+(i===3?' is-hi':'')+'" style="left:'+(X[i]/CW*100)+'%;top:'+top+'px"'+el('lbl-'+i)+'>'+T.short(v)+'</span>'; }).join('');
    var axis = '<div class="mu-hb-axis">'+T.weeks.map(function(w, i){ return '<span style="left:'+(X[i]/CW*100)+'%"'+(i===3?' class="is-hi"':'')+'>'+w+'</span>'; }).join('')+'</div>';
    return h.page('rev', '<div class="mu-head mu-rpp-head"><div class="mu-row"><span class="mu-head__title">'+T.reports+'</span><span class="mu-head__sp"></span>'+pill(T.month, 'line')+'</div>'+seg+'</div>',
      '<div class="mu-rpp-stats">'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.rev+'</span><span class="mu-rpp-stat__v"'+el('rev')+'>'+T.short(T.revTotal)+'</span>'+pill('+12%', 'ok')+'</div>'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.cnt+'</span><span class="mu-rpp-stat__v"'+el('cnt')+'>186</span>'+pill('+8%', 'ok')+'</div></div>'+
      '<div class="mu-rpp-chart"'+el('chart')+'><span class="mu-h">'+T.weekly+'</span><div class="mu-hb-chart">'+svg+labels+'</div>'+axis+'</div>');
  }

  /* The AVM page cards keep their button at the end of the content there;
     on the homepage it moves into the same pinned footer. Done on the card's
     stored opening markup too, so every reset of the flow keeps it. */
  function footify(card, sel){
    function move(root){
      var pg = root.querySelector('.mu-page'), sc = pg && pg.querySelector('.mu-scroll'), b = sc && sc.querySelector(sel);
      if(!b) return;
      var f = document.createElement('div'); f.className = 'mu-foot mu-hb-foot';
      f.appendChild(b); pg.appendChild(f); sc.classList.add('mu-hb-padfoot');
    }
    [].forEach.call(document.querySelectorAll('#booking [data-mu="'+card+'"]'), function(st){
      if(!st._mu) return;
      var tmp = document.createElement('div'); tmp.innerHTML = st._mu.initial; move(tmp); st._mu.initial = tmp.innerHTML;
      move(st.querySelector('.mu-screen'));
    });
  }

  M.add({
    cards: {
      'home-pl01': {pages:[pl01()], extra:function(){ return toast(T.booked, T.bookedSub); }, flow:'home-pl01'},
      'home-pl02': {pages:[pl02()], flow:'home-pl02'},
      'home-pl03': {pages:[pl03()], extra:function(){ return toast(T.paid, T.paidSub); }, flow:'home-pl03'},
      'home-rev':  {pages:[rev()], toBottom:'chart', flow:'home-rev'},
      'home-bk03': {pages:[bk03()], extra:bk03Toast, flow:'home-bk03'}
    },
    // Opening state of each flow (the static frame above is the end state).
    prep: {
      'home-pl01': function(a){ pick(a, 1, false); pick(a, 2, false); on(a.el('sum'), 'is-idle'); a.el('sum-l').textContent = T.pick0; a.el('sum-v').textContent = money(0); },
      'home-pl02': function(a){ for(var i = 0; i < T.venues.length; i++) a.el('v-'+i).style.display = 'none'; },
      'home-pl03': function(a){ choose(a, false); },
      'home-rev':  function(a){
        a.el('rev').textContent = T.short(0); a.el('cnt').textContent = '0';
        on(a.el('line'), 'is-undrawn'); on(a.el('area'), 'is-hidden');
        WEEKS.forEach(function(v, i){ on(a.el('dot-'+i), 'is-hidden'); on(a.el('lbl-'+i), 'is-hidden'); });
      }
    },
    flows: {
      // Fri is already picked: tap 19:00 then 20:00 on Court 2, the total
      // ticks to Rp300.000, Book now → booked toast.
      'home-pl01': function(a){
        return a.wait(400)
          .then(function(){ return a.tap('c-1-1'); })
          .then(function(){ pick(a, 1, true); a.el('sum').classList.remove('is-idle'); a.el('sum-l').textContent = T.pick1; a.el('sum-v').textContent = money(150000); return a.wait(500); })
          .then(function(){ return a.tap('c-2-1'); })
          .then(function(){ pick(a, 2, true); a.el('sum-l').textContent = T.pick2; a.el('sum-v').textContent = money(300000); return a.wait(700); })
          .then(function(){ return a.tap('book'); })
          .then(function(){ return toastOn(a); });
      },
      // The venue cards come in one by one under the filters, then the
      // screen scrolls down the list.
      'home-pl02': function(a){
        var p = a.wait(300).then(function(){ return a.tap('chip-1'); }).then(function(){ on(a.el('chip-1'), 'is-on'); return a.wait(300); });
        T.venues.forEach(function(v, i){ p = p.then(function(){ show(a.el('v-'+i)); return a.wait(260); }); });
        return p.then(function(){ return a.wait(700); })
          .then(function(){ return a.scroll(a.maxY(), 1300); })
          .then(function(){ return a.wait(900); })
          .then(function(){ on(a.el('chip-1'), 'is-on', false); return a.scroll(0, 900); });
      },
      // Down payment is picked, the button follows, Pay → success toast.
      'home-pl03': function(a){
        return a.wait(500)
          .then(function(){ return a.tap('opt-dp'); })
          .then(function(){ choose(a, true); return a.wait(700); })
          .then(function(){ return a.tap('pay'); })
          .then(function(){ return toastOn(a); });
      },
      // The rest is still pending; then the player pays in the app: the
      // venue is notified, the balance turns Paid and the booking DP → Paid,
      // with no one tapping anything on the venue side.
      'home-bk03': function(a){
        function flip(n){ var p = a.el(n); p.textContent = T.paidP; p.className = 'mu-bp-pill mu-bp-pill--green mu-bp-pop'; }
        return a.wait(1400)
          .then(function(){ on(a.el('toast'), 'is-on'); return a.wait(600); })
          .then(function(){
            flip('rest-pill');
            var au = a.el('auto'); on(au, 'is-done'); a.el('auto-t').textContent = T.autoDone;
            return a.wait(500); })
          .then(function(){ flip('h-pill'); return a.wait(1500); })
          .then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(600); });
      },
      // Totals count up, the line draws left to right, then each week's
      // point and label appear; the last week is the highlighted one.
      'home-rev': function(a){
        return a.wait(300)
          .then(function(){ return Promise.all([count(a, a.el('rev'), T.revTotal, 900, T.short), count(a, a.el('cnt'), 186, 900, function(v){ return String(Math.round(v)); })]); })
          .then(function(){ a.scrollBottom('chart', 800); return a.wait(500); })
          .then(function(){ a.el('line').classList.remove('is-undrawn'); a.el('area').classList.remove('is-hidden'); return a.wait(250); })
          .then(function(){ var p = a.wait(0); WEEKS.forEach(function(v, i){ p = p.then(function(){ a.el('dot-'+i).classList.remove('is-hidden'); a.el('lbl-'+i).classList.remove('is-hidden'); return a.wait(220); }); }); return p; })
          .then(function(){ return a.wait(600); });
      }
    }
  });
  footify('avm-pr05', '[data-el="stop"]');
  footify('avm-ft01', '[data-el="a-save"]');
})();
