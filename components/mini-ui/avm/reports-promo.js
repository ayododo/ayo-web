/* ==========================================================================
   AYO — AVM Mini UI · Reports + Promotions & Customers tabs
   Cards: avm-rp01 Daftar transaksi · avm-rp02 Pendapatan · avm-rp03 Ekspor
   Excel · avm-pr01 Tipe voucher · avm-pr02 Periode main · avm-pr03 Paket
   kredit · avm-pr04 Paket bundling · avm-pr05 Detail promo · avm-pr06 Daftar
   pelanggan.
   Figma Mini UIs (ID → EN): rp01 28092:11864 → 28378:17294, rp02 28092:11916
   → 28378:17346, rp03 28092:11950 → 28378:17380, pr01 28093:11528 →
   28378:17419, pr02 28093:11570 → 28378:17461, pr03 28093:11599 →
   28378:17490, pr04 28093:11628 → 28378:17519, pr05 28224:11717 →
   28378:17553, pr06 28222:12301 → 28378:17615.
   Content and order follow those screens; the parts a flow needs that Figma
   does not draw (Mutasi list, period sheet, session history, customer
   detail, dialogs, toasts) are drawn here in the same style. Strings come
   from the table below, picked by <html lang>. The static frame (reduced
   motion) is the top of each screen, as in Figma; with motion every card
   starts there and scrolls down through its content while the feature plays.
   Load after components/mini-ui/mini-ui.js.
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, I = h.I, on = h.on;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings (ID from the ID Figma, EN from the EN Figma) ---------- */
  var STR = {
    id: {
      reports:'Laporan', month:'Mei 2026', tabTx:'Transaksi', tabMut:'Mutasi',
      st:{ok:['Lunas','ok'], dp:['DP','warn'], un:['Belum bayar','mute']},
      tx:[['RA','Raka Aditya','Booking · Court 1','Rp350.000','ok'],['SM','Sinta Maharani','Main Bareng','Rp75.000','ok'],['DP','Dimas Pratama','Booking · DP','Rp120.000','dp'],
          ['BS','Bima Santoso','Add-on','Rp40.000','ok'],['NP','Nadia Putri','Paket Kredit','Rp900.000','ok'],['FR','Fajar Rahman','Payment Link','Rp250.000','ok'],['AS','Andi Saputra','Booking Manual','Rp300.000','un']],
      balL:'Saldo akhir', bal:'Rp4.250.000', balSub:'per 15 Mei 2026',
      mut:[['+','Dana masuk · Booking','12 Mei, 09:21','+Rp350.000'],['+','Dana masuk · Main Bareng','12 Mei, 19:05','+Rp75.000'],['−','Pencairan ke BCA','13 Mei, 10:00','−Rp2.000.000'],
           ['−','Refund · Dimas P.','14 Mei, 08:12','−Rp120.000'],['+','Dana masuk · Kredit','15 Mei, 16:40','+Rp900.000']],
      segB:'Booking', segM:'Main Bareng', rev:'Pendapatan', cntB:'Booking', cntM:'Peserta', weekly:'Pendapatan mingguan',
      days:['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
      short:function(v){ return 'Rp'+v.toFixed(1).replace('.', ',')+' jt'; },
      rpTitle:'Laporan Booking', range:'1 – 31 Mei 2026 ▾', status:'Semua status ▾', cols:['Tanggal','Penyewa','Total'],
      rows:[['12 Mei','Raka A.','Rp350.000'],['13 Mei','Sinta M.','Rp200.000'],['14 Mei','Dimas P.','Rp400.000']],
      file:'Laporan_Mei_2026.xlsx', fileOk:'Berhasil diunduh', dl:'Mengunduh…',
      vTitle:'Buat Voucher', vType:'Tipe voucher',
      types:[['%','Diskon %','Potong persen','red'],['Rp','Potongan Rp','Nominal tetap','grn'],['CB','Cashback','Saldo kembali','blu'],['+','Gratis Add-on','Bonus produk','org']],
      codeL:'Kode voucher', code:'MAINLAGI20', codePh:'Masukkan kode voucher', amtL:'Besar diskon', amt:'20%', amtPh:'Contoh: 10%', next:'Lanjut',
      made:'Voucher dibuat', madeSub:'MAINLAGI20 · Diskon 20%',
      pTitle:'Atur Periode', vName:'Diskon 20% Pelanggan Setia', perL:'Periode main', per:'1 Jun – 31 Jul 2026', perPh:'Pilih periode main',
      reqL:'Syarat', req:'Min. 3x main dalam 30 hari', reqPh:'Tulis syarat voucher', oldL:'Khusus pelanggan lama', qualify:'pelanggan memenuhi syarat', allCust:'Berlaku untuk semua pelanggan',
      save:'Simpan Voucher', saving:'Menyimpan…', durs:['1 bulan','2 bulan','3 bulan'], start:'Mulai', end:'Selesai', dStart:'1 Jun 2026', dEnd:'31 Jul 2026', apply:'Terapkan',
      saved:'Voucher disimpan', savedSub:'Aktif untuk 1 Jun – 31 Jul 2026',
      cTitle:'Kredit', active:'Aktif', pkg:'Paket 10 Kredit', saveP:'Hemat 10%', cDesc:'1 kredit = 1 jam main · berlaku 3 bulan', cTx:'Transaksi Credits',
      ctx:[['RA','Raka Aditya','Beli paket · 12 Mei','+10'],['SM','Sinta Maharani','Pakai · Court 2','−2'],['DP','Dimas Pratama','Pakai · Court 1','−1'],['BS','Bima Santoso','Beli paket · 14 Mei','+10']],
      mTitle:'Detail Member', since:'Member sejak Jan 2026', left:'Sisa sesi', valid:'Berlaku s.d.', validV:'30 Jun', bTitle:'Paket bundling', bName:'Paket Bulanan', bPrice:'Rp1.200.000',
      tags:['8x main','Sewa raket','Air mineral'], used:function(n){ return n+' dari 8 sesi terpakai'; }, log:'Catat sesi', hist:'Riwayat sesi',
      hRows:[['Sesi 2 · Court 1','10 Mei'],['Sesi 1 · Court 2','3 Mei']], hNew:['Sesi 3 · Court 1','Hari ini'],
      dTitle:'Detail Promo', dCode:'Diskon15', vtL:'Tipe Voucher', vt:'Publik', ppL:'Periode Promo', psL:'Promo Mulai', peL:'Promo Selesai', ps:'13/10/2026 · 19:30', pe:'19/10/2026 · 19:30',
      pmL:'Periode Main', pm:'25/12/2026 – 31/12/2026', sched:[['Senin','08:00 – 22:00'],['Kamis','08:00 – 10:00'],['','21:00 – 23:00']], courts:'Aktif di 3 lapangan →', cut:'Potongan',
      sum:'Ringkasan Statistik', sumD:'Laporan pendapatan selama periode promo (13 – 19 Okt 2026)', res:'Reservasi', vs:function(p){ return p+' dari periode sebelumnya'; },
      stop:'Hentikan Promo', stopped:'Promo dihentikan', ended:'Berakhir', dlgT:'Hentikan promo?', dlgB:'Voucher Diskon15 tidak bisa dipakai lagi oleh penyewa.', cancel:'Batal', stopOk:'Hentikan',
      stopToast:'Promo Diskon15 dihentikan', stopSub:'Statistik tetap tersimpan di laporan',
      lTitle:'Daftar Pelanggan', search:'Cari nama pelanggan', inactive:'Tidak aktif',
      cust:[['RA','Raka Aditya','12x booking · 2 Nov',1,''],['DP','Dimas P.','8x booking · 30 Okt',1,'red'],['SM','Sinta Maharani','3x booking · 12 Agu',0,'org'],
            ['BS','Bima Santoso','6x booking · 28 Okt',1,'grn'],['SA','Siska Amelia','2x booking · 3 Sep',0,''],['NP','Nadia Putri','5x booking · 1 Nov',1,'red']],
      q:'Sin', cdTitle:'Detail Pelanggan', cdSub:'Terakhir main 12 Agu', totB:'Total booking', totS:'Total belanja', totSV:'Rp450.000', bh:'Riwayat booking',
      bhRows:[['12 Agu · Court 2','Rp150.000'],['28 Jul · Court 1','Rp150.000'],['9 Jul · Court 2','Rp150.000']], send:'Kirim voucher', sent:'Voucher terkirim', sentSub:'MAINLAGI20 ke Sinta Maharani'
    },
    en: {
      reports:'Reports', month:'May 2026', tabTx:'Transactions', tabMut:'Mutations',
      st:{ok:['Paid','ok'], dp:['DP','warn'], un:['Unpaid','mute']},
      tx:[['RA','Raka Aditya','Booking · Court 1','$23','ok'],['SM','Sinta Maharani','Open Play','$5','ok'],['DP','Dimas Pratama','Booking · DP','$8','dp'],
          ['BS','Bima Santoso','Add-on','$3','ok'],['NP','Nadia Putri','Credit Package','$60','ok'],['FR','Fajar Rahman','Payment Link','$17','ok'],['AS','Andi Saputra','Manual Booking','$20','un']],
      balL:'Closing balance', bal:'$283', balSub:'as of 15 May 2026',
      mut:[['+','Funds in · Booking','12 May, 09:21','+$23'],['+','Funds in · Open Play','12 May, 19:05','+$5'],['−','Withdrawal to BCA','13 May, 10:00','−$130'],
           ['−','Refund · Dimas P.','14 May, 08:12','−$8'],['+','Funds in · Credits','15 May, 16:40','+$60']],
      segB:'Booking', segM:'Open Play', rev:'Revenue', cntB:'Booking', cntM:'Players', weekly:'Weekly revenue',
      days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      short:function(v){ return M.h.usd(v * 1e6); },
      rpTitle:'Booking Report', range:'1 – 31 May 2026 ▾', status:'All statuses ▾', cols:['Date','Renter','Total'],
      rows:[['12 May','Raka A.','$23'],['13 May','Sinta M.','$13'],['14 May','Dimas P.','$26']],
      file:'Report_May_2026.xlsx', fileOk:'Downloaded', dl:'Downloading…',
      vTitle:'Create Voucher', vType:'Voucher type',
      types:[['%','Discount %','Percent off','red'],['$','Amount off','Fixed amount','grn'],['CB','Cashback','Balance back','blu'],['+','Free Add-on','Bonus product','org']],
      codeL:'Voucher code', code:'PLAYAGAIN20', codePh:'Enter a voucher code', amtL:'Discount amount', amt:'20%', amtPh:'e.g. 10%', next:'Continue',
      made:'Voucher created', madeSub:'PLAYAGAIN20 · 20% off',
      pTitle:'Set Period', vName:'20% Loyal Customer Discount', perL:'Play period', per:'1 Jun – 31 Jul 2026', perPh:'Select a play period',
      reqL:'Requirements', req:'Min. 3 games in 30 days', reqPh:'Add a requirement', oldL:'Returning customers only', qualify:'customers qualify', allCust:'Open to all customers',
      save:'Save Voucher', saving:'Saving…', durs:['1 month','2 months','3 months'], start:'Start', end:'End', dStart:'1 Jun 2026', dEnd:'31 Jul 2026', apply:'Apply',
      saved:'Voucher saved', savedSub:'Live for 1 Jun – 31 Jul 2026',
      cTitle:'Credits', active:'Active', pkg:'10-Credit Package', saveP:'Save 10%', cDesc:'1 credit = 1 hour of play · valid 3 months', cTx:'Credit Transactions',
      ctx:[['RA','Raka Aditya','Package bought · 12 May','+10'],['SM','Sinta Maharani','Used · Court 2','−2'],['DP','Dimas Pratama','Used · Court 1','−1'],['BS','Bima Santoso','Package bought · 14 May','+10']],
      mTitle:'Member Details', since:'Since Jan 2026', left:'Sessions left', valid:'Valid until', validV:'30 Jun', bTitle:'Bundle package', bName:'Monthly Package', bPrice:'$80',
      tags:['8 games','Racket rental','Mineral water'], used:function(n){ return n+' of 8 sessions used'; }, log:'Log session', hist:'Session history',
      hRows:[['Session 2 · Court 1','10 May'],['Session 1 · Court 2','3 May']], hNew:['Session 3 · Court 1','Today'],
      dTitle:'Promo Details', dCode:'Discount15', vtL:'Voucher Type', vt:'Public', ppL:'Promo Period', psL:'Promo Start', peL:'Promo End', ps:'13/10/2026 · 19:30', pe:'19/10/2026 · 19:30',
      pmL:'Play Period', pm:'25/12/2026 – 31/12/2026', sched:[['Monday','08:00 – 22:00'],['Thursday','08:00 – 10:00'],['','21:00 – 23:00']], courts:'Active on 3 courts →', cut:'Discount',
      sum:'Statistics Summary', sumD:'Revenue during the promo period (13 – 19 Oct 2026)', res:'Reservations', vs:function(p){ return p+' vs previous period'; },
      stop:'Stop Promo', stopped:'Promo stopped', ended:'Ended', dlgT:'Stop this promo?', dlgB:'Renters can no longer use Discount15.', cancel:'Cancel', stopOk:'Stop',
      stopToast:'Discount15 stopped', stopSub:'Its statistics stay in your reports',
      lTitle:'Customer List', search:'Search customer name', inactive:'Inactive',
      cust:[['RA','Raka Aditya','12 bookings · 2 Nov',1,''],['DP','Dimas P.','8 bookings · 30 Oct',1,'red'],['SM','Sinta Maharani','3 bookings · 12 Aug',0,'org'],
            ['BS','Bima Santoso','6 bookings · 28 Oct',1,'grn'],['SA','Siska Amelia','2 bookings · 3 Sep',0,''],['NP','Nadia Putri','5 bookings · 1 Nov',1,'red']],
      q:'Sin', cdTitle:'Customer Details', cdSub:'Last played 12 Aug', totB:'Total bookings', totS:'Total spent', totSV:'$30', bh:'Booking history',
      bhRows:[['12 Aug · Court 2','$10'],['28 Jul · Court 1','$10'],['9 Jul · Court 2','$10']], send:'Send voucher', sent:'Voucher sent', sentSub:'PLAYAGAIN20 to Sinta Maharani'
    }
  };
  var T = STR[lang];
  function money(n){ return M.h.money(n, lang); }   // Rp on the ID page, USD on the EN one

  /* ---------- Small templates ---------- */
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>';
  function el(n){ return ' data-el="'+n+'"'; }
  function ini(t, mod, size){ return '<span class="mu-rpp-ini'+(size?' mu-rpp-ini--'+size:'')+(mod?' mu-rpp-ini--'+mod:'')+'">'+t+'</span>'; }
  function pill(t, mod, n, md){ return '<span class="mu-rpp-pill mu-rpp-pill--'+mod+(md?' mu-rpp-pill--md':'')+'"'+(n?el(n):'')+'>'+t+'</span>'; }
  function title(t, back, right){ return (back?h.ico('back'):'')+'<span class="mu-head__title">'+t+'</span><span class="mu-head__sp"></span>'+(right||''); }
  // A header with a fixed strip under the title (tabs / segmented / search).
  function head2(row, strip){ return '<div class="mu-head mu-rpp-head"><div class="mu-row">'+row+'</div>'+strip+'</div>'; }
  function txt(name, sub, big){ return '<div class="mu-col mu-grow" style="gap:2px"><span class="mu-rpp-name'+(big?' mu-rpp-name--lg':'')+'">'+name+'</span><span class="mu-rpp-sub">'+sub+'</span></div>'; }
  function field(label, n, val, ph, right){
    return '<div class="mu-rpp-field"'+el(n+'-f')+'><span class="mu-rpp-lbl">'+label+'</span><div class="mu-rpp-in"'+el(n+'-in')+'><span'+el(n)+'>'+val+'</span>'+(right||'')+'</div></div>';
  }
  function toast(t, sub){ return '<div class="mu-toast"'+el('toast')+'><span class="mu-rpp-toast-ico">'+CHECK+'</span><span class="mu-col"><b data-el="toast-t">'+t+'</b><span data-el="toast-s">'+sub+'</span></span></div>'; }
  function dots(v){ return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  /* ---------- Shared motion helpers ---------- */
  // Count a number up (ease-out) in ~40 ms steps; stops with the flow.
  function count(a, node, to, ms, fmt, from){
    from = from || 0; var n = Math.max(1, Math.round(ms / 40)), i = 0;
    function step(){ i++; var k = i / n; node.textContent = fmt(i >= n ? to : from + (to - from) * (1 - Math.pow(1 - k, 3))); return i < n ? a.wait(40).then(step) : a.wait(0); }
    return step();
  }
  function show(node){ node.style.display = ''; node.style.visibility = ''; node.classList.remove('mu-new'); node.offsetHeight; node.classList.add('mu-new'); }
  function hide(node){ node.style.display = 'none'; }
  // Hidden but still taking its place, so the screen can scroll to it first.
  function veil(node){ node.style.visibility = 'hidden'; }
  function stagger(a, nodes, gap){ var p = a.wait(0); [].forEach.call(nodes, function(n){ p = p.then(function(){ show(n); return a.wait(gap || 140); }); }); return p; }
  function bump(node){ node.classList.remove('is-bump'); node.offsetHeight; node.classList.add('is-bump'); setTimeout(function(){ node.classList.remove('is-bump'); }, 200); }
  // Placeholder <-> value in a field.
  function placeholder(a, n, ph){ var s = a.el(n); s.textContent = ph; s.classList.add('is-ph'); }
  function focus(a, n, v){ on(a.el(n+'-in'), 'is-focus', v); var s = a.el(n); if(v){ s.classList.remove('is-ph'); s.textContent = ''; s.classList.add('mu-caret'); } else s.classList.remove('mu-caret'); }
  function toastOn(a, ms){ on(a.el('toast'), 'is-on'); return a.wait(ms || 1700).then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); }); }

  /* =====================================================================
     REPORTS
     ===================================================================== */

  /* rp01 · Daftar transaksi: Transaksi / Mutasi tabs (fixed under the title). */
  function txRow(r, n){
    var s = T.st[r[4]];
    return '<div class="mu-rpp-tx"'+el(n)+'>'+ini(r[0])+txt(r[1], r[2])+'<div class="mu-rpp-amt">'+r[3]+pill(s[0], s[1])+'</div></div>';
  }
  function mutRow(r, n){
    var inF = r[0] === '+';
    return '<div class="mu-rpp-tx"'+el(n)+'>'+ini(r[0], inF ? 'grn' : 'gry')+txt(r[1], r[2])+'<div class="mu-rpp-amt'+(inF?' mu-rpp-plus':'')+'">'+r[3]+'</div></div>';
  }
  function rp01(){
    var chips = '<div class="mu-rpp-chips"><span class="mu-rpp-chip is-on"'+el('tab-tx')+'>'+T.tabTx+'</span><span class="mu-rpp-chip"'+el('tab-mut')+'>'+T.tabMut+'</span></div>';
    var bal = '<div class="mu-rpp-stat"'+el('mut-bal')+'><span class="mu-rpp-stat__l">'+T.balL+'</span><span class="mu-rpp-stat__v">'+T.bal+'</span><span class="mu-rpp-sub">'+T.balSub+'</span></div>';
    return h.page('rp01', head2(title(T.reports, false, pill(T.month, 'line')), chips),
      '<div class="mu-rpp-list"'+el('list-tx')+'>'+T.tx.map(function(r, i){ return txRow(r, 'tx-'+i); }).join('')+'</div>'+
      '<div class="mu-rpp-list"'+el('list-mut')+' style="display:none">'+bal+T.mut.map(function(r, i){ return mutRow(r, 'mut-'+i); }).join('')+'</div>');
  }
  function tab(a, mut){
    on(a.el('tab-tx'), 'is-on', !mut); on(a.el('tab-mut'), 'is-on', mut);
    var showL = a.el(mut ? 'list-mut' : 'list-tx'), hideL = a.el(mut ? 'list-tx' : 'list-mut');
    hide(hideL); a.jump(0); showL.style.display = '';
    [].forEach.call(showL.children, function(c){ c.style.opacity = '0'; });
    var p = a.wait(60);
    [].forEach.call(showL.children, function(c){ p = p.then(function(){ c.style.opacity = ''; show(c); return a.wait(130); }); });
    return p;
  }

  /* rp02 · Pendapatan: Booking / Main Bareng, stat tiles, weekly bars. */
  var REV = {
    b: {rev:12.4, revUp:'+12%', cnt:186, cntUp:'+8%', cntL:'cntB', bars:[30,44,36,58,48,66,40]},
    m: {rev:4.8, revUp:'+18%', cnt:312, cntUp:'+15%', cntL:'cntM', bars:[18,26,22,34,46,62,54]}
  };
  function rp02(){
    var seg = '<div class="mu-seg mu-rpp-seg" data-on="0"'+el('seg')+'><span class="mu-seg__knob"></span><span class="mu-seg__i is-on"'+el('seg-0')+'>'+T.segB+'</span><span class="mu-seg__i"'+el('seg-1')+'>'+T.segM+'</span></div>';
    var d = REV.b;
    var bars = d.bars.map(function(v, i){ return '<span class="mu-rpp-bar'+(i===5?' is-hi':'')+'"'+el('bar-'+i)+' style="height:'+v+'px"></span>'; }).join('');
    return h.page('rp02', head2(title(T.reports, false, pill(T.month, 'line')), seg),
      '<div class="mu-rpp-stats"'+el('stats')+'>'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.rev+'</span><span class="mu-rpp-stat__v"'+el('rev')+'>'+T.short(d.rev)+'</span>'+pill(d.revUp, 'ok', 'rev-up')+'</div>'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l"'+el('cnt-l')+'>'+T[d.cntL]+'</span><span class="mu-rpp-stat__v"'+el('cnt')+'>'+d.cnt+'</span>'+pill(d.cntUp, 'ok', 'cnt-up')+'</div></div>'+
      '<div class="mu-rpp-chart"'+el('chart')+'><span class="mu-h">'+T.weekly+'</span><div class="mu-rpp-bars">'+bars+'</div>'+
        '<div class="mu-rpp-days">'+T.days.map(function(x){ return '<span>'+x+'</span>'; }).join('')+'</div></div>');
  }
  function grow(a, d){ var p = a.wait(0); d.bars.forEach(function(v, i){ p = p.then(function(){ a.el('bar-'+i).style.height = v+'px'; return a.wait(90); }); }); return p; }
  function revCount(a, d){
    a.el('rev-up').textContent = d.revUp; a.el('cnt-up').textContent = d.cntUp; a.el('cnt-l').textContent = T[d.cntL];
    return Promise.all([count(a, a.el('rev'), d.rev, 1000, T.short), count(a, a.el('cnt'), d.cnt, 1000, function(v){ return String(Math.round(v)); })]);
  }

  /* rp03 · Ekspor Excel: report table, ⤓ Excel → downloading → file card. */
  function rp03(){
    var xl = '<span class="mu-rpp-xl"'+el('xl')+'>'+I.download+'<span'+el('xl-t')+'>Excel</span></span>';
    var rows = T.rows.map(function(r, i){ return '<div class="mu-col" style="gap:6px"'+el('row-'+i)+'><span class="mu-rpp-hr"></span><div class="mu-rpp-tr"><span>'+r[0]+'</span><span>'+r[1]+'</span><span>'+r[2]+'</span></div></div>'; }).join('');
    return h.page('rp03', h.head(title(T.rpTitle, true, xl)),
      '<div class="mu-row" style="gap:6px">'+pill(T.range, 'line')+pill(T.status, 'line')+'</div>'+
      '<div class="mu-rpp-tbl"'+el('tbl')+'><div class="mu-rpp-tr mu-rpp-tr--head"><span>'+T.cols[0]+'</span><span>'+T.cols[1]+'</span><span>'+T.cols[2]+'</span></div>'+rows+'</div>'+
      '<div class="mu-rpp-file"'+el('file')+'><span class="mu-rpp-file__ico">X</span><span class="mu-col mu-grow" style="gap:2px"><b>'+T.file+'</b><span>'+T.fileOk+'</span></span></div>');
  }

  /* =====================================================================
     PROMOTIONS & CUSTOMERS
     ===================================================================== */

  /* pr01 · Tipe voucher: four types, voucher code, discount. */
  function pr01(){
    var types = T.types.map(function(t, i){
      return '<div class="mu-rpp-type'+(i===0?' is-on':'')+'"'+el('type-'+i)+'><div class="mu-rpp-type__top"><span class="mu-rpp-ico mu-rpp-ico--'+t[3]+'">'+t[0]+'</span><span class="mu-radio'+(i===0?' is-on':'')+'"></span></div>'+
        '<span class="mu-rpp-name">'+t[1]+'</span><span class="mu-rpp-sub" style="margin-top:-2px">'+t[2]+'</span></div>'; }).join('');
    return h.page('pr01', h.head(title(T.vTitle, true)),
      '<div class="mu-h">'+T.vType+'</div><div class="mu-rpp-types"'+el('types')+'>'+types+'</div>'+
      field(T.codeL, 'code', T.code, '')+field(T.amtL, 'amt', T.amt, '')+
      '<div class="mu-btn mu-btn--soft"'+el('next')+'>'+T.next+'</div>', toast(T.made, T.madeSub));
  }
  function pickType(a, k){ [].forEach.call(a.el('types').children, function(c, i){ on(c, 'is-on', i === k); on(c.querySelector('.mu-radio'), 'is-on', i === k); }); }

  /* pr02 · Periode main: play period (sheet), requirement, returning-customer switch, save. */
  function pr02(){
    return h.page('pr02', h.head(title(T.pTitle, true)),
      '<div class="mu-rpp-vc"><span class="mu-rpp-ico mu-rpp-ico--solid">%</span>'+txt(T.vName, T.code)+'</div>'+
      field(T.perL, 'per', T.per, '', '<i>▾</i>')+field(T.reqL, 'req', T.req, '')+
      '<div class="mu-rpp-switch"'+el('sw')+'><div class="mu-col mu-grow" style="gap:2px"><span class="mu-rpp-name">'+T.oldL+'</span><span class="mu-rpp-sub"'+el('elig-s')+'><span'+el('elig')+'>128</span> '+T.qualify+'</span></div><span class="mu-toggle is-on"'+el('tog')+'></span></div>'+
      '<div class="mu-btn mu-btn--soft"'+el('save')+'><span'+el('save-t')+'>'+T.save+'</span></div>');
  }
  function perSheet(){
    var chips = T.durs.map(function(d, i){ return '<span class="mu-chip"'+el('dur-'+i)+'>'+d+'</span>'; }).join('');
    return '<div class="mu-sheet"'+el('per-sheet')+'><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">'+T.perL+'</span>'+
      '<div class="mu-chips"'+el('durs')+'>'+chips+'</div>'+
      '<div class="mu-rpp-dates"><div class="mu-rpp-in"><small>'+T.start+'</small><span>'+T.dStart+'</span></div><div class="mu-rpp-in"'+el('d-end-in')+'><small>'+T.end+'</small><span class="is-ph"'+el('d-end')+'>–</span></div></div>'+
      '<div class="mu-btn mu-btn--soft"'+el('apply')+'>'+T.apply+'</div></div>'+toast(T.saved, T.savedSub);
  }

  /* pr03 · Paket kredit: package card, credit transactions. */
  function pr03(){
    var rows = T.ctx.map(function(r, i){ var plus = r[3].charAt(0) === '+';
      return '<div class="mu-rpp-tx"'+el('ctx-'+i)+'>'+ini(r[0])+txt(r[1], r[2])+'<span class="mu-rpp-amt'+(plus?' mu-rpp-plus':'')+'">'+r[3]+'</span></div>'; }).join('');
    return h.page('pr03', h.head(title(T.cTitle, false, pill(T.active, 'ok', null, true))),
      '<div class="mu-rpp-credit"'+el('credit')+'><div class="mu-row mu-row--between"><span class="mu-rpp-credit__t">'+T.pkg+'</span><span class="mu-rpp-pill mu-rpp-pill--red mu-rpp-pill--md mu-rpp-pop"'+el('save-p')+'>'+T.saveP+'</span></div>'+
        '<span class="mu-rpp-credit__p">'+money(900000)+'</span><span class="mu-rpp-credit__d">'+T.cDesc+'</span></div>'+
      '<div class="mu-h" style="font-size:12px"'+el('tx-h')+'>'+T.cTx+'</div><div class="mu-rpp-list"'+el('ctx')+'>'+rows+'</div>');
  }

  /* pr04 · Paket bundling: member, sessions left, bundle items, session log. */
  function histRow(r, n){ return '<div class="mu-rpp-tx"'+el(n)+'>'+ini(CHECK, 'grn')+txt(r[0], r[1])+'</div>'; }
  function pr04(){
    var tags = T.tags.map(function(t, i){ return '<span class="mu-rpp-pill mu-rpp-pill--tag mu-rpp-pop"'+el('tag-'+i)+'>'+t+'</span>'; }).join('');
    return h.page('pr04', h.head(title(T.mTitle, true)),
      '<div class="mu-rpp-member">'+ini('RA', '', 36)+txt('Raka Aditya', T.since, true)+pill('Gold', 'warn', null, true)+'</div>'+
      '<div class="mu-rpp-stats"><div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.left+'</span><span class="mu-rpp-stat__v mu-rpp-stat__v--13"><span class="mu-rpp-tick"'+el('left')+'>6</span> / 8</span></div>'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.valid+'</span><span class="mu-rpp-stat__v mu-rpp-stat__v--13">'+T.validV+'</span></div></div>'+
      '<div class="mu-h" style="font-size:12px">'+T.bTitle+'</div>'+
      '<div class="mu-rpp-bundle"'+el('bundle')+'><div class="mu-row mu-row--between"><span class="mu-rpp-name">'+T.bName+'</span><span class="mu-rpp-name">'+T.bPrice+'</span></div>'+
        '<div class="mu-rpp-tags">'+tags+'</div>'+
        '<div class="mu-row mu-row--between"><span class="mu-rpp-sub mu-rpp-tick"'+el('used')+'>'+T.used(2)+'</span></div><div class="mu-rpp-prog"><i'+el('prog')+' style="width:25%"></i></div>'+
        '<div class="mu-btn mu-btn--soft mu-rpp-btn-sm"'+el('log')+'>'+T.log+'</div></div>'+
      '<div class="mu-h" style="font-size:12px"'+el('hist-h')+'>'+T.hist+'</div>'+
      '<div class="mu-rpp-list"'+el('hist')+'>'+T.hRows.map(function(r, i){ return histRow(r, 'hist-'+i); }).join('')+'</div>');
  }

  /* pr05 · Detail promo: info, discount, statistics, Stop Promo. */
  function pr05(){
    var sched = '<div class="mu-rpp-sched"'+el('sched')+'><span class="mu-rpp-name" style="font-size:10px">'+T.pm+'</span>'+
      T.sched.map(function(s){ return '<div class="mu-rpp-kv"><span>'+(s[0]||'&#8203;')+'</span><span>'+s[1]+'</span></div>'; }).join('')+'</div>';
    function stat(label, n, val, up){
      return '<div class="mu-col" style="gap:2px"><span class="mu-rpp-lbl">'+label+'</span><span class="mu-rpp-big"><span'+el(n)+'>'+val+'</span><span class="mu-rpp-up"'+el(n+'-up')+'>▲</span></span><span class="mu-rpp-sub" style="font-size:9px">'+T.vs(up)+'</span></div>';
    }
    return h.page('pr05', h.head(title(T.dTitle, true)),
      '<div class="mu-rpp-info"><div class="mu-row mu-row--between"><span class="mu-rpp-code">'+T.dCode+'</span>'+pill(T.active, 'ok', 'st', true)+'</div><span class="mu-rpp-hr"></span>'+
        '<div class="mu-rpp-kv"><span>'+T.vtL+'</span><b>'+T.vt+'</b></div><span class="mu-rpp-hr"></span>'+
        '<span class="mu-rpp-name">'+T.ppL+'</span><div class="mu-rpp-kv"><span>'+T.psL+'</span><span>'+T.ps+'</span></div><div class="mu-rpp-kv"><span>'+T.peL+'</span><span>'+T.pe+'</span></div><span class="mu-rpp-hr"></span>'+
        '<span class="mu-rpp-name">'+T.pmL+'</span>'+sched+'<span class="mu-rpp-hr"></span><span class="mu-rpp-more">'+T.courts+'</span></div>'+
      '<div class="mu-rpp-info" style="flex-direction:row;align-items:center"'+el('cut')+'><span class="mu-rpp-ico mu-rpp-ico--mute">%</span><span class="mu-rpp-name mu-grow">'+T.cut+'</span><span class="mu-ico" style="color:#787373">'+I.chev+'</span></div>'+
      '<div class="mu-rpp-info" style="gap:6px"'+el('stats')+'><span class="mu-h">'+T.sum+'</span><span class="mu-rpp-sub" style="white-space:normal">'+T.sumD+'</span>'+
        stat(T.rev, 'rev', money(15000000), '+16%')+'<span class="mu-rpp-hr"></span>'+stat(T.res, 'res', '135', '+10%')+'</div>'+
      '<div class="mu-btn mu-btn--soft mu-rpp-stop"'+el('stop')+'><span'+el('stop-t')+'>'+T.stop+'</span></div>');
  }
  function stopDialog(){
    return '<div class="mu-dialog"'+el('dlg')+'><span class="mu-h" style="font-size:13px">'+T.dlgT+'</span><span class="mu-s">'+T.dlgB+'</span>'+
      '<div class="mu-btns" style="margin-top:6px"><span class="mu-btn mu-btn--line">'+T.cancel+'</span><span class="mu-btn mu-btn--soft"'+el('dlg-ok')+'>'+T.stopOk+'</span></div></div>'+toast(T.stopToast, T.stopSub);
  }

  /* pr06 · Daftar pelanggan: search filters the list → customer detail → send voucher. */
  function pr06(){
    var search = '<div class="mu-rpp-in mu-rpp-in--search"'+el('q-in')+'>'+SEARCH+'<span class="is-ph"'+el('q')+'>'+T.search+'</span></div>';
    var rows = T.cust.map(function(c, i){
      return '<div class="mu-rpp-tx mu-rpp-tx--lg"'+el('cust-'+i)+' data-name="'+c[1]+'">'+ini(c[0], c[4], 32)+txt(c[1], c[2], true)+(c[3] ? pill(T.active, 'ok', null, true) : pill(T.inactive, 'mute', null, true))+'</div>'; }).join('');
    var list = h.page('pr06', head2(title(T.lTitle, true), search), '<div class="mu-rpp-list"'+el('cust')+'>'+rows+'</div>');
    var detail = h.page('cust', h.head(title(T.cdTitle, true)),
      '<div class="mu-rpp-member">'+ini('SM', 'org', 36)+txt('Sinta Maharani', T.cdSub, true)+pill(T.inactive, 'mute', null, true)+'</div>'+
      '<div class="mu-rpp-stats"><div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.totB+'</span><span class="mu-rpp-stat__v mu-rpp-stat__v--13">3</span></div>'+
        '<div class="mu-rpp-stat"><span class="mu-rpp-stat__l">'+T.totS+'</span><span class="mu-rpp-stat__v mu-rpp-stat__v--13">'+T.totSV+'</span></div></div>'+
      '<div class="mu-h" style="font-size:12px">'+T.bh+'</div>'+
      '<div class="mu-rpp-list">'+T.bhRows.map(function(r){ return '<div class="mu-rpp-tx">'+txt(r[0].split(' · ')[0], r[0].split(' · ')[1])+'<span class="mu-rpp-amt">'+r[1]+'</span></div>'; }).join('')+'</div>'+
      '<div class="mu-btn mu-btn--soft"'+el('send')+'>'+T.send+'</div>');
    return [list, detail];
  }
  function filter(a, q){
    var k = q.toLowerCase();
    [].forEach.call(a.el('cust').children, function(r){
      var hit = !k || r.dataset.name.toLowerCase().split(' ').some(function(w){ return w.indexOf(k) === 0; });
      on(r, 'is-gone', !hit);
    });
  }

  /* =====================================================================
     Cards, opening states (prep) and flows
     ===================================================================== */
  M.add({
    cards: {
      'avm-rp01': {pages:[rp01()], flow:'avm-rp01'},
      'avm-rp02': {pages:[rp02()], flow:'avm-rp02'},
      'avm-rp03': {pages:[rp03()], flow:'avm-rp03'},
      'avm-pr01': {pages:[pr01()], flow:'avm-pr01'},
      'avm-pr02': {pages:[pr02()], extra:perSheet, flow:'avm-pr02'},
      'avm-pr03': {pages:[pr03()], flow:'avm-pr03'},
      'avm-pr04': {pages:[pr04()], flow:'avm-pr04'},
      'avm-pr05': {pages:[pr05()], extra:stopDialog, flow:'avm-pr05'},
      'avm-pr06': {pages:pr06(), extra:function(){ return toast(T.sent, T.sentSub); }, flow:'avm-pr06'}
    },
    prep: {
      // Numbers at zero and bars flat until the flow counts and grows them.
      'avm-rp02': function(a){ a.el('rev').textContent = T.short(0); a.el('cnt').textContent = '0'; REV.b.bars.forEach(function(v, i){ a.el('bar-'+i).style.height = '0px'; }); },
      // The report rows load in; no file yet.
      'avm-rp03': function(a){ T.rows.forEach(function(r, i){ hide(a.el('row-'+i)); }); hide(a.el('file')); },
      // Nothing chosen, fields empty.
      'avm-pr01': function(a){ pickType(a, -1); placeholder(a, 'code', T.codePh); placeholder(a, 'amt', T.amtPh); },
      'avm-pr02': function(a){
        placeholder(a, 'per', T.perPh); placeholder(a, 'req', T.reqPh);
        a.el('tog').classList.remove('is-on'); a.el('elig-s').textContent = T.allCust;
      },
      'avm-pr03': function(a){ a.el('save-p').classList.add('is-out'); [].forEach.call(a.el('ctx').children, veil); },
      'avm-pr04': function(a){
        a.el('left').textContent = '8'; a.el('used').textContent = T.used(0); a.el('prog').style.width = '0';
        T.tags.forEach(function(t, i){ a.el('tag-'+i).classList.add('is-out'); }); [].forEach.call(a.el('hist').children, veil);
      },
      'avm-pr05': function(a){ a.el('rev').textContent = money(0); a.el('res').textContent = '0'; a.el('rev-up').classList.add('is-out'); a.el('res-up').classList.add('is-out'); }
    },
    flows: {
      // RP01 · down the transaction list (online, manual, credits, payment
      // link), then Mutasi: the balance and money in / out rows come in one by
      // one; scroll them, and back to Transaksi.
      'avm-rp01': function(a){
        return a.wait(300)
          .then(function(){ return a.scrollTo('tx-2', 6, 1300); })
          .then(function(){ return a.wait(400); })
          .then(function(){ return a.scroll(a.maxY(), 1100); })
          .then(function(){ return a.wait(600); })
          .then(function(){ return a.tap('tab-mut'); })
          .then(function(){ return tab(a, true); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.scroll(a.maxY(), 1400); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.tap('tab-tx'); })
          .then(function(){ return tab(a, false); });
      },
      // RP02 · the totals count up, scroll to the weekly chart as its bars
      // grow; switch to Main Bareng: totals recount, bars regrow.
      'avm-rp02': function(a){
        function seg(m){ var s = a.el('seg'); s.dataset.on = m ? '1' : '0'; on(a.el('seg-0'), 'is-on', !m); on(a.el('seg-1'), 'is-on', m); }
        return a.wait(300)
          .then(function(){ return revCount(a, REV.b); })
          .then(function(){ return a.wait(300); })
          .then(function(){ a.scrollBottom('chart', 1000); return a.wait(350); })
          .then(function(){ return grow(a, REV.b); })
          .then(function(){ return a.wait(1300); })
          .then(function(){ return a.tap('seg-1'); })
          .then(function(){ seg(true); REV.b.bars.forEach(function(v, i){ a.el('bar-'+i).style.height = '0px'; }); a.el('rev').textContent = T.short(0); a.el('cnt').textContent = '0'; return a.scroll(0, 700); })
          .then(function(){ return revCount(a, REV.m); })
          .then(function(){ a.scrollBottom('chart', 1000); return a.wait(350); })
          .then(function(){ return grow(a, REV.m); })
          .then(function(){ return a.wait(900); });
      },
      // RP03 · the report rows load, ⤓ Excel → downloading → the file card
      // "Laporan_Mei_2026.xlsx · Berhasil diunduh" lands under the table.
      'avm-rp03': function(a){
        return a.wait(300)
          .then(function(){ return stagger(a, T.rows.map(function(r, i){ return a.el('row-'+i); }), 160); })
          .then(function(){ return a.wait(600); })
          .then(function(){ return a.tap('xl'); })
          .then(function(){ on(a.el('xl'), 'is-busy'); a.el('xl-t').textContent = T.dl; return a.wait(1300); })
          .then(function(){ a.el('xl').classList.remove('is-busy'); a.el('xl-t').textContent = 'Excel'; show(a.el('file')); return a.wait(250); })
          .then(function(){ return a.scrollBottom('file', 700); })
          .then(function(){ return a.wait(800); });
      },
      // PR01 · try Potongan Rp, settle on Diskon %, scroll to the fields, type
      // the code and the discount, Continue → created.
      'avm-pr01': function(a){
        function typeIn(n, text, speed){ return a.tap(n+'-in').then(function(){ focus(a, n, true); return a.wait(200); }).then(function(){ return a.type(n, text, speed); }).then(function(){ focus(a, n, false); return a.wait(250); }); }
        return a.wait(300)
          .then(function(){ return a.tap('type-1'); }).then(function(){ pickType(a, 1); return a.wait(650); })
          .then(function(){ return a.tap('type-0'); }).then(function(){ pickType(a, 0); return a.wait(550); })
          .then(function(){ return a.scrollBottom('next', 1100); })
          .then(function(){ return typeIn('code', T.code, 105); })
          .then(function(){ return typeIn('amt', T.amt, 160); })
          .then(function(){ return a.tap('next'); })
          .then(function(){ return toastOn(a, 1700); });
      },
      // PR02 · play period from a sheet (2 months), type the requirement,
      // switch on returning customers (eligible count ticks up to 128), save.
      'avm-pr02': function(a){
        return a.wait(300)
          .then(function(){ return a.tap('per-in'); })
          .then(function(){ on(a.el('per-in'), 'is-focus'); return a.sheet('per-sheet', true); })
          .then(function(){ return a.tap('dur-1'); })
          .then(function(){ on(a.el('dur-1'), 'is-on'); var d = a.el('d-end'); d.classList.remove('is-ph'); d.textContent = T.dEnd; on(a.el('d-end-in'), 'is-focus'); return a.wait(700); })
          .then(function(){ return a.tap('apply'); })
          .then(function(){ var s = a.el('per'); s.classList.remove('is-ph'); s.textContent = T.per; a.el('per-in').classList.remove('is-focus'); return a.sheet('per-sheet', false); })
          .then(function(){ return a.tap('req-in'); })
          .then(function(){ focus(a, 'req', true); return a.wait(200); })
          .then(function(){ return a.type('req', T.req, 55); })
          .then(function(){ focus(a, 'req', false); return a.wait(300); })
          .then(function(){ return a.scrollBottom('save', 900); })
          .then(function(){ return a.tap('tog'); })
          .then(function(){ on(a.el('tog'), 'is-on'); a.el('elig-s').innerHTML = '<span data-el="elig">0</span> '+T.qualify; return count(a, a.el('elig'), 128, 900, function(v){ return String(Math.round(v)); }); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('save'); })
          .then(function(){ on(a.el('save'), 'mu-rpp-busy'); a.el('save-t').textContent = T.saving; return a.wait(900); })
          .then(function(){ a.el('save').classList.remove('mu-rpp-busy'); a.el('save-t').textContent = T.save; return toastOn(a, 1700); });
      },
      // PR03 · the Hemat 10% badge pops, scroll to Transaksi Credits: +10
      // (bought) and −2 / −1 (used) come in one by one.
      'avm-pr03': function(a){
        return a.wait(400)
          .then(function(){ a.el('save-p').classList.remove('is-out'); return a.wait(600); })
          .then(function(){ return a.scrollTo('tx-h', 6, 1100); })
          .then(function(){ var rows = a.el('ctx').children; return stagger(a, [rows[0], rows[1]], 600); })
          .then(function(){ return a.scroll(a.maxY(), 900); })
          .then(function(){ var rows = a.el('ctx').children; return stagger(a, [rows[2], rows[3]], 600); })
          .then(function(){ return a.wait(400); });
      },
      // PR04 · sessions left tick 8 → 6, scroll to the bundle (its items pop
      // in, usage bar fills), log a session (3 of 8), history shows it.
      'avm-pr04': function(a){
        function left(n){ var e = a.el('left'); e.textContent = String(n); bump(e); return a.wait(420); }
        function used(n, pct){ var e = a.el('used'); e.textContent = T.used(n); bump(e); a.el('prog').style.width = pct+'%'; }
        return a.wait(400)
          .then(function(){ return left(7); }).then(function(){ return left(6); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.scrollBottom('bundle', 1100); })
          .then(function(){ var p = a.wait(0); T.tags.forEach(function(t, i){ p = p.then(function(){ a.el('tag-'+i).classList.remove('is-out'); return a.wait(160); }); }); return p; })
          .then(function(){ used(1, 12.5); return a.wait(300); }).then(function(){ used(2, 25); return a.wait(700); })
          .then(function(){ return a.tap('log'); })
          .then(function(){ used(3, 37.5); a.el('left').textContent = '5';
            var row = document.createElement('div'); row.innerHTML = histRow(T.hNew, 'hist-new'); row = row.firstChild; veil(row);
            a.el('hist').insertBefore(row, a.el('hist').firstChild); return a.wait(700); })
          .then(function(){ return a.scrollTo('hist-h', 6, 1100); })
          .then(function(){ return stagger(a, a.el('hist').children, 200); })
          .then(function(){ return a.wait(500); });
      },
      // PR05 · scroll down the promo details to the statistics: revenue and
      // reservations count up; on to Stop Promo → confirm → stopped.
      'avm-pr05': function(a){
        return a.wait(300)
          .then(function(){ return a.scrollBottom('sched', 1400); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.scrollTo('stats', 6, 1300); })
          .then(function(){ return Promise.all([count(a, a.el('rev'), 15000000, 1200, function(v){ return money(v); }), count(a, a.el('res'), 135, 1200, function(v){ return String(Math.round(v)); })]); })
          .then(function(){ a.el('rev-up').classList.remove('is-out'); a.el('res-up').classList.remove('is-out'); return a.wait(900); })
          .then(function(){ return a.scrollBottom('stop', 800); })
          .then(function(){ return a.tap('stop'); })
          .then(function(){ return a.sheet('dlg', true); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('dlg-ok'); })
          .then(function(){ a.sheet('dlg', false); var b = a.el('stop'); b.classList.remove('mu-btn--soft'); b.classList.add('mu-btn--off'); a.el('stop-t').textContent = T.stopped;
            var st = a.el('st'); st.className = 'mu-rpp-pill mu-rpp-pill--mute mu-rpp-pill--md'; st.textContent = T.ended; return a.wait(400); })
          .then(function(){ return toastOn(a, 1800); });
      },
      // PR06 · scroll the customers, search "Sin": the list narrows to Sinta
      // Maharani, open her, send her a voucher.
      'avm-pr06': function(a){
        return a.wait(300)
          .then(function(){ return a.scrollTo('cust-3', 6, 1300); })
          .then(function(){ return a.wait(400); })
          .then(function(){ return a.scroll(0, 900); })
          .then(function(){ return a.tap('q-in'); })
          .then(function(){ on(a.el('q-in'), 'is-focus'); var q = a.el('q'); q.classList.remove('is-ph'); q.textContent = ''; q.classList.add('mu-caret'); return a.wait(300); })
          .then(function(){ var p = a.wait(0); T.q.split('').forEach(function(ch){ p = p.then(function(){ var q = a.el('q'); q.textContent += ch; filter(a, q.textContent); return a.wait(420); }); }); return p; })
          .then(function(){ a.el('q').classList.remove('mu-caret'); return a.wait(500); })
          .then(function(){ return a.tap('cust-2'); })
          .then(function(){ return a.go('cust'); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.scrollBottom('send', 1000); })
          .then(function(){ return a.tap('send'); })
          .then(function(){ return toastOn(a, 1700); });
      }
    }
  });
})();
