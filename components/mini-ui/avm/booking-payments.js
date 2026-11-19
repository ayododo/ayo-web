/* ==========================================================================
   AYO Venue Management — Mini UI cards: Booking + Payments tabs
   Figma (ID → EN): bk01 28086:11777 → 28378:16738 · bk02 28086:11810 → 28378:16771
   bk03 28086:11836 (ID only) · bk04 28086:11860 → 28378:16797 · bk05 28086:11974 → 28378:16911
   py01 28092:11722 → 28378:17152 · py02 28092:11768 → 28378:17198
   py03 28092:11799 → 28378:17229 · py04 28092:11832 → 28378:17262

   Registers with the shared engine (components/mini-ui/mini-ui.js, loaded
   first). Strings come from the table below, picked by <html lang>. Each
   card's first page is its static Figma frame (shown at the top, as in
   Figma); the flows open from a "before" state (PREP) and play the feature.
   Screens Figma doesn't draw (the schedule before Booking Details, the
   withdraw form, the payment link, the reschedule picker…) follow the same
   parts and look.
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on, I = h.I;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings ---------- */
  var T = {
    id: {
      sched:'Jadwal', d12:'Sen, 12 Mei', d13:'Sel, 13 Mei', football:'Sepak Bola', mini:'Mini Soccer', fresh:'Baru', linked:'Terhubung',
      newOnline:'Booking baru via AYO', newOnlineS:'Raka Aditya · Sepak Bola · 06:00–08:00',
      detail:'Detail Booking', paid:'Lunas', bid:'Booking ID', dateSlot:'Tanggal &amp; Slot', dateSlotV:'12 Mei 2026 · 10:00 – 12:00',
      courtSport:'Lapangan &amp; Cabor', extra:'Jasa Tambahan', photo:'Fotografi', totalPaid:'Total bayar',
      dp:'DP', online:'Pembayaran Online', voucher:'Voucher AYO −Rp40.000', offline:'Sisa Pelunasan Offline', unpaid:'Belum Lunas',
      seeDetail:'Lihat detail →', markPaid:'Tandai Lunas', dlgT:'Tandai sebagai lunas?', dlgS:'Sisa Rp170.000 sudah dibayar di venue.',
      cancel:'Batal', yesPaid:'Ya, Lunas', paidDone:'Sudah Lunas', paidToast:'Booking ditandai lunas', paidToastS:'AYO-260512-0418 · Rp380.000',
      open:'Open', compact:'Ringkas', detailTab:'Detail', courtA:'Court A ▾', month:'Juni 2026',
      wd:['S','S','R','K','J','S','M'], day:['Sen','Sel','Rab','Kam','Jum','Sab','Min'], legend:['Tersedia','Hampir penuh','Penuh'],
      slotsFor:'Slot · Kam, 4 Jun', avail:'Tersedia', booked:'Terisi', closed:'Ditutup',
      share:'Basket &amp; Futsal berbagi 1 lapangan', basket:'Basket', futsal:'Futsal', na:'Tidak tersedia', usedBy:'Terpakai Basket',
      newBk:'Booking Baru', renter:'Nama penyewa', saveBk:'Simpan Booking',
      pay:'Pembayaran', linkT:'Buat Payment Link', linkS:'Pelanggan bayar lewat link', manualT:'Catat Manual', manualS:'Untuk bayar di tempat',
      methods:'Metode tersedia', m:['QRIS','E-Wallet','Kartu','Transfer','Gerai','Tunai'], next:'Selanjutnya',
      linkReady:'Link pembayaran siap dibagikan', linkFor:'AYO-260512-0418 · Court 1', valid:'Berlaku 60 menit', copy:'Salin', copied:'Tersalin',
      shareLink:'Bagikan Link', copiedToast:'Link pembayaran disalin', copiedToastS:'Kirim ke pelanggan lewat chat',
      bal:'Saldo', cur:'Saldo saat ini', withdraw:'Cairkan ke Rekening', hist:'Riwayat Saldo', txW:'Pencairan', acct:'Rekening ••4821', ok:'Berhasil',
      txBs:'12 Mei · Raka Aditya', txB2s:'11 Mei · Bima Santoso', incoming:'Masuk', proc:'Diproses',
      wdT:'Cairkan Dana', availBal:'Saldo tersedia', amt:'Nominal pencairan', dest:'Rekening tujuan', holder:'a.n. Arena Nusantara',
      wdNote:'Dana masuk maks. 1×24 jam', wdGo:'Cairkan', wdToast:'Pencairan diajukan', wdToastS:'Rp2.000.000 ke BCA ••4821',
      res:'Ubah Jadwal', oldS:'Jadwal lama', oldV:'12 Mei · 10:00', newS:'Jadwal baru', newV:'14 Mei · 16:00', pick:'Pilih jadwal',
      breakdown:'Rincian Perubahan Biaya', oldP:'Harga jadwal lama', newP:'Harga jadwal baru', refund:'Penyewa terima refund',
      pol:['H-7 · 100%','H-5 · 50%','&lt; 24 jam · 0%'], saveRes:'Simpan Perubahan', pickT:'Pilih Jadwal Baru', dates:['13 Mei','14 Mei','15 Mei'],
      choose:'Pilih', resToast:'Jadwal diubah', resToastS:'Refund Rp25.000 ke penyewa',
      dpTitle:'Buat Link Pembayaran', totalBill:'Total tagihan', dpT:'Tandai sebagai DP', dpS:'Pelanggan bayar sebagian dulu', nominal:'Nominal',
      payNow:'Bayar sekarang', rest:'Sisa pelunasan', createLink:'Buat Link', dpToast:'Link DP dibuat', dpToastS:'Bayar sekarang Rp120.000'
    },
    en: {
      sched:'Schedule', d12:'Mon, 12 May', d13:'Tue, 13 May', football:'Football', mini:'Mini Soccer', fresh:'New', linked:'Connected',
      newOnline:'New booking via AYO', newOnlineS:'Raka Aditya · Football · 06:00–08:00',
      detail:'Booking Details', paid:'Paid', bid:'Booking ID', dateSlot:'Date &amp; Slot', dateSlotV:'12 May 2026 · 10:00 – 12:00',
      courtSport:'Court &amp; Sport', extra:'Extra Services', photo:'Photography', totalPaid:'Total paid',
      dp:'DP', online:'Online Payment', voucher:'AYO voucher −Rp40.000', offline:'Remaining Offline Payment', unpaid:'Unpaid',
      seeDetail:'See details →', markPaid:'Mark as Paid', dlgT:'Mark as paid?', dlgS:'The remaining Rp170.000 was paid at the venue.',
      cancel:'Cancel', yesPaid:'Yes, Paid', paidDone:'Paid in Full', paidToast:'Booking marked as paid', paidToastS:'AYO-260512-0418 · Rp380.000',
      open:'Open', compact:'Compact', detailTab:'Detail', courtA:'Court A ▾', month:'June 2026',
      wd:['M','T','W','T','F','S','S'], day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], legend:['Available','Filling up','Full'],
      slotsFor:'Slots · Thu, 4 Jun', avail:'Available', booked:'Booked', closed:'Closed',
      share:'Basketball &amp; Futsal share 1 court', basket:'Basketball', futsal:'Futsal', na:'Unavailable', usedBy:'Used by Basketball',
      newBk:'New Booking', renter:'Renter name', saveBk:'Save Booking',
      pay:'Payment', linkT:'Create Payment Link', linkS:'Customer pays via link', manualT:'Record Manually', manualS:'For on-site payment',
      methods:'Available methods', m:['QRIS','E-Wallet','Card','Transfer','Outlet','Cash'], next:'Next',
      linkReady:'Payment link ready to share', linkFor:'AYO-260512-0418 · Court 1', valid:'Valid for 60 minutes', copy:'Copy', copied:'Copied',
      shareLink:'Share Link', copiedToast:'Payment link copied', copiedToastS:'Send it to the customer in chat',
      bal:'Balance', cur:'Current balance', withdraw:'Withdraw to Bank', hist:'Balance History', txW:'Withdrawal', acct:'Account ••4821', ok:'Successful',
      txBs:'12 May · Raka Aditya', txB2s:'11 May · Bima Santoso', incoming:'Incoming', proc:'Processing',
      wdT:'Withdraw Funds', availBal:'Available balance', amt:'Withdrawal amount', dest:'Destination account', holder:'Arena Nusantara',
      wdNote:'Funds arrive within 24 hours', wdGo:'Withdraw', wdToast:'Withdrawal submitted', wdToastS:'Rp2.000.000 to BCA ••4821',
      res:'Reschedule', oldS:'Old schedule', oldV:'12 May · 10:00', newS:'New schedule', newV:'14 May · 16:00', pick:'Pick a slot',
      breakdown:'Price Change Details', oldP:'Old schedule price', newP:'New schedule price', refund:'Renter gets a refund',
      pol:['D-7 · 100%','D-5 · 50%','&lt; 24 hrs · 0%'], saveRes:'Save Changes', pickT:'Choose New Schedule', dates:['13 May','14 May','15 May'],
      choose:'Select', resToast:'Booking rescheduled', resToastS:'Rp25.000 refunded to the renter',
      dpTitle:'Create Payment Link', totalBill:'Total bill', dpT:'Mark as down payment', dpS:'Customer pays part first', nominal:'Amount',
      payNow:'Pay now', rest:'Remaining balance', createLink:'Create Link', dpToast:'Down payment link created', dpToastS:'Pay now Rp120.000'
    }
  };
  var S = T[lang];

  /* ---------- Small parts ---------- */
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
  var LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.5 3.5 0 0 0 5 5l1-1"/></svg>';
  function rp(n){ return 'Rp'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function att(el){ return el ? ' data-el="'+el+'"' : ''; }
  function title(t){ return '<span class="mu-head__title">'+t+'</span>'; }
  function back(t){ return h.head(h.ico('back')+title(t)); }
  function pill(text, tone, el){ return '<span class="mu-bp-pill mu-bp-pill--'+tone+'"'+att(el)+'>'+text+'</span>'; }
  function kv(k, v, el, cls){ return '<div class="mu-bp-kv"><span class="mu-bp-k">'+k+'</span><span class="mu-bp-v'+(cls||'')+'"'+att(el)+'>'+v+'</span></div>'; }
  var DIV = '<span class="mu-bp-div"></span>';
  function toast(t, s, icon){ return '<div class="mu-toast mu-bp-toast" data-el="toast"><span class="mu-bp-tick">'+(icon||CHECK)+'</span><span class="mu-col"><b>'+t+'</b><span>'+s+'</span></span></div>'; }

  /* Day grid (Jadwal): time labels every hour (44px), one column per court.
     A cell spans `hrs` hours: its empty dashed slots, with a booking (or a
     "connected" block) laid over them, so a booking can drop in or fade out
     and leave the empty slots behind. */
  function cell(hrs, over, el, slotEl){
    var s = ''; for(var i = 0; i < hrs; i++) s += '<span class="mu-bp-slot"'+(i === 0 ? att(slotEl) : '')+'></span>';
    return '<div class="mu-bp-cell" style="height:'+(hrs*44-4)+'px"'+att(el)+'>'+s+(over||'')+'</div>';
  }
  function booking(name, time, tone, extra, el){ return '<div class="mu-bp-bk mu-bp-bk--'+tone+'"'+att(el)+'><b>'+name+'</b><span>'+time+'</span>'+(extra||'')+'</div>'; }
  function linked(l1, l2, el){ return '<div class="mu-bp-bk mu-bp-bk--link"'+att(el)+'><span class="mu-bp-l1">'+l1+'</span>'+(l2?'<span class="mu-bp-l2">'+l2+'</span>':'')+'</div>'; }
  function grid(times, cols, el){
    return '<div class="mu-bp-grid"'+att(el)+'><div class="mu-bp-times"><span class="mu-bp-sp"></span>'+times.map(function(t){ return '<span>'+t+'</span>'; }).join('')+'</div>'+
      cols.map(function(c){ return '<div class="mu-bp-col"><span class="mu-bp-colh">'+c[0]+'</span>'+c[1]+'</div>'; }).join('')+'</div>';
  }
  function schedHead(date){ return h.head(title(S.sched)+'<span class="mu-head__sp"></span>'+pill(date, 'date')); }

  /* ---------- Booking ---------- */
  // BK01 · Booking baru: the AYO-app booking with its "Baru" badge, and the
  // Mini Soccer column greyed where it shares the pitch.
  function bk01(){
    return h.page('sched', schedHead(S.d12),
      grid(['06:00','07:00','08:00','09:00','10:00'], [
        [S.football, cell(2, booking('Raka Aditya', '06:00 – 08:00', 'white', pill(S.fresh, 'brand', 'fresh'), 'raka'), 'raka-cell')+cell(1)+cell(1)+cell(1)],
        [S.mini, cell(2, linked(S.linked, '', 'link'))+cell(2, booking('Dimas P.', '08:00 – 10:00', 'green'))+cell(1)]
      ], 'grid'));
  }
  // BK02 · Detail booking: Booking Details (Figma) + the schedule it opens from.
  function bk02Detail(){
    return h.page('detail', h.head(h.ico('back')+title(S.detail)+'<span class="mu-head__sp"></span>'+pill(S.paid, 'green')),
      '<div class="mu-bp-card mu-bp-card--detail">'+kv(S.bid, 'AYO-260512-0418')+DIV+kv(S.dateSlot, S.dateSlotV)+DIV+kv(S.courtSport, 'Court 1 · Futsal')+DIV+kv(S.extra, S.photo)+'</div>'+
      '<div class="mu-bp-card mu-bp-card--row" data-el="d-total"><div class="mu-bp-row"><span class="mu-bp-k">'+S.totalPaid+'</span><span class="mu-bp-v">Rp350.000</span></div></div>');
  }
  function bk02Sched(){
    return h.page('sched', schedHead(S.d12),
      grid(['08:00','09:00','10:00','11:00'], [
        ['Court 1', cell(1)+cell(1)+cell(2, booking('Raka Aditya', '10:00 – 12:00', 'white', pill(S.paid, 'green'), 'raka'), 'raka-cell')],
        ['Court 2', cell(2, booking('Bima S.', '08:00 – 10:00', 'green'))+cell(1)+cell(1)]
      ]));
  }
  // BK03 · Status pembayaran (ID page only; EN strings kept for completeness).
  function bk03(){
    return h.page('detail', h.head(h.ico('back')+title(S.detail)+'<span class="mu-head__sp"></span>'+pill(S.dp, 'orange', 'h-pill')),
      '<div class="mu-bp-card mu-bp-card--tight">'+kv(S.extra, S.photo)+'</div>'+
      '<div class="mu-bp-card mu-bp-card--pay">'+
        '<div class="mu-bp-kv"><span class="mu-bp-k">'+S.online+'</span><span class="mu-bp-v mu-bp-v--lg">Rp210.000</span><span class="mu-bp-sub">'+S.voucher+'</span></div>'+DIV+
        '<div class="mu-bp-kv"><div class="mu-bp-row"><span class="mu-bp-k">'+S.offline+'</span>'+pill(S.unpaid, 'red', 'off-pill')+'</div><span class="mu-bp-v mu-bp-v--lg" data-el="off-amt">Rp170.000</span></div>'+
      '</div>'+
      '<span class="mu-bp-link">'+S.seeDetail+'</span>'+
      '<div class="mu-btn" data-el="mark">'+S.markPaid+'</div>');
  }
  function bk03Dialog(){
    return '<div class="mu-dialog" data-el="dialog"><span class="mu-h" style="font-size:13px">'+S.dlgT+'</span><span class="mu-s">'+S.dlgS+'</span>'+
      '<div class="mu-btns" style="margin-top:6px"><span class="mu-btn mu-btn--line">'+S.cancel+'</span><span class="mu-btn" data-el="dlg-ok">'+S.yesPaid+'</span></div></div>'+toast(S.paidToast, S.paidToastS);
  }
  // BK04 · Ringkas/Detail: month view (Figma) and the per-slot detail view.
  var BARS = 'go,gx,og,gg,xx,og,go,gg,ox,gg,xo,gg,og,gx,go,og,gg,xg,go,oo,gg,gg,go,og,gg,ox,xo,gg,gg,go'.split(',');
  function month(){
    var weeks = '';
    for(var w = 0; w < 5; w++){
      var row = '';
      for(var d = 1; d <= 7; d++){
        var n = w*7 + d, b = BARS[n-1];
        row += b ? '<span class="mu-bp-day'+(n === 2 ? ' is-today' : '')+'" data-el="d-'+n+'"><b>'+n+'</b><i class="'+b[0]+'"></i><i class="'+b[1]+'"></i></span>' : '<span class="mu-bp-day"></span>';
      }
      weeks += '<div class="mu-bp-wk">'+row+'</div>';
    }
    return '<div class="mu-bp-cal" data-el="cal"><div class="mu-bp-wk mu-bp-wk--head">'+S.wd.map(function(x){ return '<span>'+x+'</span>'; }).join('')+'</div>'+weeks+'</div>'+
      '<div class="mu-bp-legend">'+S.legend.map(function(l, i){ return '<span><i class="'+'gox'[i]+'"></i>'+l+'</span>'; }).join('')+'</div>';
  }
  function slotRows(){
    return [['06','07',0],['07','08','Raka A.'],['08','09',0],['09','10',0],['10','11','Dimas P.'],['11','12',0]].map(function(r){
      var right = r[2] ? pill(S.booked, 'grey') : '<span class="mu-toggle is-on" data-el="tg-'+r[0]+'"></span>';
      return '<div class="mu-bp-li" data-el="sl-'+r[0]+'"><div class="mu-col mu-grow"><span class="mu-bp-v">'+r[0]+':00 – '+r[1]+':00</span><span class="mu-bp-k" data-el="st-'+r[0]+'">'+(r[2] || S.avail)+'</span></div>'+right+'</div>';
    }).join('');
  }
  function bk04(){
    var strip = S.wd.map(function(x, i){ var n = i + 1; return '<span class="mu-bp-sd'+(n === 2 ? ' is-today' : '')+(n === 4 ? ' is-on' : '')+'"><span>'+x+'</span><b>'+n+'</b></span>'; }).join('');
    return h.page('cal', h.head('<span class="mu-head__title">Arena Nusantara<small class="mu-bp-caret">▾</small></span><span class="mu-head__sp"></span>'+pill(S.open, 'green')),
      '<div class="mu-row" style="gap:6px"><span class="mu-bp-seg" data-el="seg"><span class="is-on" data-el="seg-0">'+S.compact+'</span><span data-el="seg-1">'+S.detailTab+'</span></span>'+pill(S.courtA, 'date')+'</div>'+
      '<div class="mu-col mu-bp-view" style="gap:9px" data-el="v-month"><span class="mu-bp-v">'+S.month+'</span>'+month()+'</div>'+
      '<div class="mu-col mu-bp-view" style="gap:9px;display:none" data-el="v-detail"><div class="mu-bp-strip">'+strip+'</div><span class="mu-bp-v">'+S.slotsFor+'</span><div class="mu-bp-list" data-el="slots">'+slotRows()+'</div></div>');
  }
  // BK05 · Lapangan terhubung: Basketball and Futsal on one shared court.
  function bk05(){
    return h.page('sched', schedHead(S.d13),
      '<div class="mu-bp-info">'+S.share+'</div>'+
      grid(['07:00','08:00','09:00','10:00'], [
        [S.basket, cell(2, booking('Sinta M.', '07:00 – 09:00', 'green', '', 'sinta'), 'b-cell', 'b-07')+cell(1)+cell(1)],
        [S.futsal, cell(2, linked(S.na, S.usedBy, 'f-na'))+cell(2, booking('Bima Santoso', '09:00 – 11:00', 'white'))]
      ], 'grid'));
  }
  function bk05Sheet(){
    return '<div class="mu-sheet" data-el="bk-sheet"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">'+S.newBk+'</span>'+
      '<div class="mu-bp-row"><span class="mu-bp-k">'+S.basket+' · '+S.d13+'</span><span class="mu-bp-v">07:00 – 09:00</span></div>'+
      '<div class="mu-field is-focus"><div class="mu-s" style="font-size:9px">'+S.renter+'</div><span data-el="bk-name" class="mu-caret"></span></div>'+
      '<div class="mu-btn" data-el="bk-save">'+S.saveBk+'</div></div>';
  }

  /* ---------- Payments ---------- */
  var METH = [['QR','n'],['EW','b'],['CC','o'],['VA','g'],['GR','r'],['Rp','l']];
  // PY01 · Opsi pembayaran: Payment Link vs manual, and the methods a link takes.
  function py01(){
    function opt(t, s, el, isOn){ return '<div class="mu-bp-opt'+(isOn?' is-on':'')+'" data-el="'+el+'"><div class="mu-col mu-grow"><span class="mu-bp-v">'+t+'</span><span class="mu-bp-k">'+s+'</span></div><span class="mu-radio'+(isOn?' is-on':'')+'"></span></div>'; }
    var tiles = METH.map(function(m, i){ return '<div class="mu-bp-meth" data-el="m-'+i+'"><span class="mu-bp-mi mu-bp-mi--'+m[1]+'">'+m[0]+'</span>'+S.m[i]+'</div>'; }).join('');
    return h.page('opts', h.head(title(S.pay)+'<span class="mu-head__sp"></span>'+h.ico('close')),
      '<div class="mu-col" style="gap:9px" data-el="opts">'+opt(S.linkT, S.linkS, 'opt-link', true)+opt(S.manualT, S.manualS, 'opt-manual', false)+'</div>'+
      '<span class="mu-bp-v">'+S.methods+'</span><div class="mu-bp-meths" data-el="meths">'+tiles+'</div>'+
      '<div class="mu-btn" data-el="next">'+S.next+'</div>');
  }
  function py01Link(){
    var chips = S.m.slice(0, 5).map(function(m){ return '<span class="mu-bp-mchip">'+m+'</span>'; }).join('');
    return h.page('link', back('Payment Link'),
      '<div class="mu-bp-card mu-bp-ready"><span class="mu-bp-ok">'+CHECK+'</span><span class="mu-bp-v">'+S.linkReady+'</span><span class="mu-bp-v mu-bp-v--xl">Rp350.000</span><span class="mu-bp-k">'+S.linkFor+'</span></div>'+
      '<div class="mu-bp-url"><span class="mu-bp-urli">'+LINK+'</span><span class="mu-grow">pay.ayo.co.id/l/8KQ2</span><span class="mu-bp-copy" data-el="copy">'+S.copy+'</span></div>'+
      '<div class="mu-bp-mchips">'+chips+'</div><span class="mu-bp-k">'+S.valid+'</span>'+
      '<div class="mu-btn">'+S.shareLink+'</div>');
  }
  // PY02 · Saldo & cairkan: balance → withdraw form → balance updated.
  function tx(t, s, amt, p, el){ return '<div class="mu-bp-tx"'+att(el)+'><div class="mu-col mu-grow"><span class="mu-bp-v">'+t+'</span><span class="mu-bp-k">'+s+'</span></div><div class="mu-bp-amt"><span class="mu-bp-v">'+amt+'</span>'+p+'</div></div>'; }
  function py02(){
    return h.page('saldo', back(S.bal),
      '<div class="mu-bp-card mu-bp-card--bal"><span class="mu-bp-k">'+S.cur+'</span><span class="mu-bp-v mu-bp-v--xxl" data-el="bal">Rp19.250.000</span><div class="mu-btn" data-el="wd-btn">'+S.withdraw+'</div></div>'+
      '<div class="mu-bp-row" data-el="hist"><span class="mu-bp-v">'+S.hist+'</span>'+pill('Excel', 'green')+'</div>'+
      '<div class="mu-col" style="gap:9px" data-el="txs">'+
        tx(S.txW, S.acct, '−Rp5.000.000', pill(S.ok, 'green'))+
        tx('Booking · Court 1', S.txBs, '+Rp350.000', pill(S.incoming, 'blue'))+
        tx('Booking · Court 2', S.txB2s, '+Rp300.000', pill(S.incoming, 'blue'))+
      '</div>');
  }
  function py02Form(){
    return h.page('wd', back(S.wdT),
      '<div class="mu-tint mu-bp-row"><span class="mu-bp-k">'+S.availBal+'</span><span class="mu-bp-v">Rp19.250.000</span></div>'+
      '<div class="mu-col" style="gap:4px"><span class="mu-bp-k">'+S.amt+'</span><div class="mu-field mu-bp-amtf" data-el="amt-f"><span data-el="amt" class="mu-bp-ph">Rp0</span></div></div>'+
      '<div class="mu-col" style="gap:4px"><span class="mu-bp-k">'+S.dest+'</span><div class="mu-bp-opt is-on"><span class="mu-bp-mi mu-bp-mi--b">BCA</span><div class="mu-col mu-grow"><span class="mu-bp-v">BCA ••4821</span><span class="mu-bp-k">'+S.holder+'</span></div><span class="mu-radio is-on"></span></div></div>'+
      '<span class="mu-bp-sub">'+S.wdNote+'</span>'+
      '<div class="mu-btn mu-btn--off" data-el="wd-go"><span data-el="wd-go-l">'+S.wdGo+'</span></div>');
  }
  // PY03 · Rincian refund: reschedule, the price difference refunded.
  function py03(){
    return h.page('res', back(S.res),
      '<div class="mu-bp-card mu-bp-card--sched"><div class="mu-bp-kv mu-grow"><span class="mu-bp-k">'+S.oldS+'</span><span class="mu-bp-v">'+S.oldV+'</span></div><span class="mu-bp-arrow">→</span>'+
        '<div class="mu-bp-kv mu-grow mu-bp-newbox" data-el="new-box"><span class="mu-bp-k">'+S.newS+'</span><span class="mu-bp-v" data-el="new-v">'+S.newV+'</span></div></div>'+
      '<div class="mu-bp-card mu-bp-card--calc"><span class="mu-bp-v">'+S.breakdown+'</span>'+
        '<div class="mu-bp-row"><span class="mu-bp-k">'+S.oldP+'</span><span class="mu-bp-num">Rp125.000</span></div>'+
        '<div class="mu-bp-row"><span class="mu-bp-k">'+S.newP+'</span><span class="mu-bp-num" data-el="new-p">Rp100.000</span></div>'+DIV+
        '<div class="mu-bp-row"><span class="mu-bp-v">'+S.refund+'</span><span class="mu-bp-v mu-bp-v--green" data-el="refund">Rp25.000</span></div></div>'+
      '<div class="mu-row" style="gap:6px" data-el="pol">'+pill(S.pol[0], 'green', 'pol-0')+pill(S.pol[1], 'orange')+pill(S.pol[2], 'grey')+'</div>'+
      '<div class="mu-btn" data-el="save">'+S.saveRes+'</div>');
  }
  function py03Sheet(){
    function chips(list, pre){ return '<div class="mu-bp-chips">'+list.map(function(c){ return '<span class="mu-bp-chip" data-el="'+pre+c.replace(/\W/g,'')+'">'+c+'</span>'; }).join('')+'</div>'; }
    return '<div class="mu-sheet" data-el="pick"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">'+S.pickT+'</span>'+
      chips(S.dates, 'sd-')+chips(['10:00 · Rp125.000','16:00 · Rp100.000'], 'st-')+'<div class="mu-btn" data-el="pick-ok">'+S.choose+'</div></div>'+toast(S.resToast, S.resToastS);
  }
  // PY04 · Toggle DP: down payment on, 30% / 50%, amounts recomputed.
  function py04(){
    return h.page('dp', back(S.dpTitle),
      '<div class="mu-col" style="gap:4px"><span class="mu-bp-k">'+S.totalBill+'</span><div class="mu-field mu-bp-amtf">Rp400.000</div></div>'+
      '<div class="mu-bp-opt"><div class="mu-col mu-grow"><span class="mu-bp-v">'+S.dpT+'</span><span class="mu-bp-k">'+S.dpS+'</span></div><span class="mu-toggle is-on" data-el="dp-toggle"></span></div>'+
      '<div class="mu-bp-chips" data-el="dp-opts"><span class="mu-bp-chip is-on" data-el="c30">30%</span><span class="mu-bp-chip" data-el="c50">50%</span><span class="mu-bp-chip">'+S.nominal+'</span></div>'+
      '<div class="mu-tint mu-col mu-bp-sum" data-el="dp-sum"><div class="mu-bp-row"><span class="mu-bp-k">'+S.payNow+'</span><span class="mu-bp-v" data-el="now">Rp120.000</span></div>'+
        '<div class="mu-bp-row"><span class="mu-bp-k">'+S.rest+'</span><span class="mu-bp-num mu-bp-num--muted" data-el="rest">Rp280.000</span></div></div>'+
      '<div class="mu-btn" data-el="create"><span data-el="create-l">'+S.createLink+'</span></div>');
  }

  /* ---------- Motion helpers ---------- */
  // Count a figure from one amount to another (ease-out, timer steps so it
  // also advances where rAF is throttled).
  function count(a, el, from, to, ms){
    var node = a.el(el), n = 14, i = 0;
    function step(){ i++; var k = 1 - Math.pow(1 - i/n, 3); node.textContent = rp(from + (to - from)*k); return i < n ? a.wait(ms/n).then(step) : a.wait(0); }
    return step();
  }
  function toastOn(a, ms){ on(a.el('toast'), 'is-on'); return a.wait(ms || 1600).then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(350); }); }
  // Swap the static first page out for the page a flow opens on, without a slide.
  function openOn(a, name){
    var scr = a.stage.querySelector('.mu-screen'), pages = scr.querySelectorAll('.mu-page');
    [].forEach.call(pages, function(p){ p.classList.add('no-anim'); p.classList.remove('is-active', 'is-behind'); });
    scr.querySelector('[data-page="'+name+'"]').classList.add('is-active');
    scr.offsetHeight;
    [].forEach.call(pages, function(p){ p.classList.remove('no-anim'); });
  }
  function quiet(el, fn){ el.classList.add('mu-bp-still'); fn(); el.offsetHeight; el.classList.remove('mu-bp-still'); }

  /* ---------- Cards ---------- */
  M.add({
    cards: {
      'avm-bk01': {pages:[bk01()], extra:function(){ return toast(S.newOnline, S.newOnlineS, BELL); }, flow:'avm-bk01'},
      'avm-bk02': {pages:[bk02Detail(), bk02Sched()], flow:'avm-bk02'},
      'avm-bk03': {pages:[bk03()], extra:bk03Dialog, flow:'avm-bk03'},
      'avm-bk04': {pages:[bk04()], flow:'avm-bk04'},
      'avm-bk05': {pages:[bk05()], extra:bk05Sheet, flow:'avm-bk05'},
      'avm-py01': {pages:[py01(), py01Link()], extra:function(){ return toast(S.copiedToast, S.copiedToastS); }, flow:'avm-py01'},
      'avm-py02': {pages:[py02(), py02Form()], extra:function(){ return toast(S.wdToast, S.wdToastS); }, flow:'avm-py02'},
      'avm-py03': {pages:[py03()], extra:py03Sheet, flow:'avm-py03'},
      'avm-py04': {pages:[py04()], extra:function(){ return toast(S.dpToast, S.dpToastS); }, flow:'avm-py04'}
    },

    /* Opening states (the static frame is the Figma "after"). */
    prep: {
      // The online booking has not arrived yet; the shared pitch is free.
      'avm-bk01': function(a){ quiet(a.stage, function(){ on(a.el('raka'), 'is-out'); on(a.el('link'), 'is-out'); }); },
      // Opens on the schedule; Booking Details waits off to the right.
      'avm-bk02': function(a){ openOn(a, 'sched'); },
      // Day 4 not picked yet.
      'avm-bk04': function(a){ a.el('d-4').classList.remove('is-on'); },
      // No basketball booking yet: the futsal slot is still free.
      'avm-bk05': function(a){ quiet(a.stage, function(){ on(a.el('sinta'), 'is-out'); on(a.el('f-na'), 'is-out'); }); },
      // Manual is chosen: only Transfer and Cash apply.
      'avm-py01': function(a){
        a.el('opt-manual').classList.add('is-on'); a.el('opt-manual').querySelector('.mu-radio').classList.add('is-on');
        a.el('opt-link').classList.remove('is-on'); a.el('opt-link').querySelector('.mu-radio').classList.remove('is-on');
        [0,1,2,4].forEach(function(i){ on(a.el('m-'+i), 'is-dim'); });
      },
      // New slot not picked: no new price, nothing to refund yet.
      'avm-py03': function(a){
        var v = a.el('new-v'); v.textContent = S.pick; on(v, 'is-ph');
        a.el('new-p').textContent = '–'; a.el('refund').textContent = 'Rp0';
      },
      // Down payment off: options and summary hidden.
      'avm-py04': function(a){ a.el('dp-toggle').classList.remove('is-on'); a.el('dp-opts').style.display = 'none'; a.el('dp-sum').style.display = 'none'; }
    },

    flows: {
      // BK01 · A booking made in the AYO app lands: notification, the block
      // drops into 06:00–08:00 with its "Baru" badge, the linked Mini Soccer
      // slot greys out; then a look down the rest of the day and back.
      'avm-bk01': function(a){
        return a.wait(400)
          .then(function(){ on(a.el('toast'), 'is-on'); return a.wait(1500); })
          .then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(250); })
          .then(function(){ a.el('raka').classList.remove('is-out'); on(a.el('raka'), 'is-hl'); return a.wait(650); })
          .then(function(){ a.el('link').classList.remove('is-out'); return a.wait(900); })
          .then(function(){ a.el('raka').classList.remove('is-hl'); return a.scroll(a.maxY(), 1300); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.scroll(0, 1100); });
      },
      // BK02 · Schedule → down to Raka's 10:00 booking → tap → Booking
      // Details slides in and scrolls to the total.
      'avm-bk02': function(a){
        return a.wait(300)
          .then(function(){ return a.scrollBottom('raka-cell', 1100); })
          .then(function(){ return a.tap('raka'); })
          .then(function(){ on(a.el('raka'), 'is-hl'); return a.go('detail'); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.scroll(a.maxY(), 1300); });
      },
      // BK03 · Down to Tandai Lunas → confirm → the offline balance turns
      // Lunas, the header badge DP → Lunas; back up to the top.
      'avm-bk03': function(a){
        return a.wait(300)
          .then(function(){ return a.scroll(a.maxY(), 1300); })
          .then(function(){ return a.tap('mark'); })
          .then(function(){ return a.sheet('dialog', true); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('dlg-ok'); })
          .then(function(){
            a.sheet('dialog', false);
            var p = a.el('off-pill'); p.textContent = S.paid; p.className = 'mu-bp-pill mu-bp-pill--green mu-bp-pop';
            var m = a.el('mark'); m.textContent = S.paidDone; on(m, 'mu-btn--off');
            return a.wait(700); })
          .then(function(){ on(a.el('toast'), 'is-on'); return a.scroll(0, 1100); })
          .then(function(){ var p = a.el('h-pill'); p.textContent = S.paid; p.className = 'mu-bp-pill mu-bp-pill--green mu-bp-pop'; return a.wait(1200); })
          .then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); });
      },
      // BK04 · Down the month and back, pick the 4th, switch to Detail (the
      // day's slots), close the 09:00 slot, scroll the slots, back to Ringkas.
      'avm-bk04': function(a){
        function view(detail){
          a.el('seg-0').classList.toggle('is-on', !detail); a.el('seg-1').classList.toggle('is-on', detail);
          a.el('v-month').style.display = detail ? 'none' : ''; a.el('v-detail').style.display = detail ? '' : 'none';
          var v = a.el(detail ? 'v-detail' : 'v-month'); v.classList.remove('mu-new'); v.offsetHeight; v.classList.add('mu-new');
        }
        return a.wait(300)
          .then(function(){ return a.scroll(a.maxY(), 1300); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.scroll(0, 1000); })
          .then(function(){ return a.tap('d-4'); })
          .then(function(){ on(a.el('d-4'), 'is-on'); return a.wait(600); })
          .then(function(){ return a.tap('seg-1'); })
          .then(function(){ view(true); return a.wait(900); })
          .then(function(){ return a.tap('tg-09'); })
          .then(function(){ a.el('tg-09').classList.remove('is-on'); a.el('st-09').textContent = S.closed; on(a.el('sl-09'), 'is-off'); return a.wait(700); })
          .then(function(){ return a.scroll(a.maxY(), 1000); })
          .then(function(){ return a.wait(600); })
          .then(function(){ return a.scroll(0, 900); })
          .then(function(){ return a.tap('seg-0'); })
          .then(function(){ view(false); return a.wait(300); });
      },
      // BK05 · Tap the free 07:00 basketball slot → New Booking sheet, the
      // renter's name typed → saved: the block drops in and the futsal slot on
      // the same court becomes unavailable. Then down the rest of the day.
      'avm-bk05': function(a){
        return a.wait(300)
          .then(function(){ return a.scrollTo('grid', 4, 900); })
          .then(function(){ return a.tap('b-07'); })
          .then(function(){ return a.sheet('bk-sheet', true); })
          .then(function(){ return a.type('bk-name', 'Sinta M.', 110); })
          .then(function(){ return a.tap('bk-save'); })
          .then(function(){ a.sheet('bk-sheet', false); return a.wait(350); })
          .then(function(){ a.el('sinta').classList.remove('is-out'); return a.wait(700); })
          .then(function(){ a.el('f-na').classList.remove('is-out'); on(a.el('f-na'), 'is-hl'); return a.wait(1000); })
          .then(function(){ a.el('f-na').classList.remove('is-hl'); return a.scroll(a.maxY(), 1100); });
      },
      // PY01 · Manual → Payment Link: every method lights up in turn; down to
      // Next → the link page → Copy → copied toast.
      'avm-py01': function(a){
        function pick(sel, other){ on(a.el(sel), 'is-on'); a.el(sel).querySelector('.mu-radio').classList.add('is-on'); a.el(other).classList.remove('is-on'); a.el(other).querySelector('.mu-radio').classList.remove('is-on'); }
        var p = a.wait(400).then(function(){ return a.tap('opt-link'); }).then(function(){ pick('opt-link', 'opt-manual'); return a.wait(350); })
          .then(function(){ return a.scrollTo('meths', 30, 800); });
        [0,1,2,3,4,5].forEach(function(i){ p = p.then(function(){ var m = a.el('m-'+i); m.classList.remove('is-dim'); on(m, 'is-hl'); return a.wait(170); }); });
        return p.then(function(){ return a.wait(400); })
          .then(function(){ [0,1,2,3,4,5].forEach(function(i){ a.el('m-'+i).classList.remove('is-hl'); }); return a.scroll(a.maxY(), 800); })
          .then(function(){ return a.tap('next'); })
          .then(function(){ return a.go('link'); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('copy'); })
          .then(function(){ var c = a.el('copy'); c.textContent = S.copied; on(c, 'is-done'); return toastOn(a, 1600); });
      },
      // PY02 · Withdraw → amount typed → Withdraw (busy) → back: the balance
      // counts down, the new withdrawal row lands at the top of the history.
      'avm-py02': function(a){
        var digits = '2000000';
        function typeAmt(){
          var el = a.el('amt'), i = 0; el.classList.remove('mu-bp-ph'); on(el, 'mu-caret');
          function step(){ i++; el.textContent = rp(+digits.slice(0, i)); return i < digits.length ? a.wait(150).then(step) : a.wait(300); }
          return step();
        }
        return a.wait(400)
          .then(function(){ return a.tap('wd-btn'); })
          .then(function(){ return a.go('wd'); })
          .then(function(){ return a.tap('amt-f'); })
          .then(function(){ on(a.el('amt-f'), 'is-focus'); return typeAmt(); })
          .then(function(){ a.el('amt-f').classList.remove('is-focus'); a.el('amt').classList.remove('mu-caret'); a.el('wd-go').classList.remove('mu-btn--off'); return a.wait(400); })
          .then(function(){ return a.tap('wd-go'); })
          .then(function(){ on(a.el('wd-go'), 'is-busy'); return a.wait(1000); })
          .then(function(){ return a.back('saldo'); })
          .then(function(){
            on(a.el('toast'), 'is-on');
            var row = document.createElement('div'); row.innerHTML = tx(S.txW, S.acct, '−Rp2.000.000', pill(S.proc, 'orange'), 'tx-new');
            row = row.firstChild; row.classList.add('mu-new'); a.el('txs').insertBefore(row, a.el('txs').firstChild);
            return count(a, 'bal', 19250000, 17250000, 1000); })
          .then(function(){ return a.wait(700); })
          .then(function(){ a.el('toast').classList.remove('is-on'); return a.scrollTo('hist', 6, 1000); });
      },
      // PY03 · Tap New schedule → pick 14 May, 16:00 → the new price fills in,
      // the refund counts up to Rp25.000 under the D-7 · 100% policy; down to Save.
      'avm-py03': function(a){
        return a.wait(400)
          .then(function(){ return a.tap('new-box'); })
          .then(function(){ on(a.el('new-box'), 'is-focus'); return a.sheet('pick', true); })
          .then(function(){ return a.tap('sd-'+S.dates[1].replace(/\W/g,'')); })
          .then(function(){ on(a.el('sd-'+S.dates[1].replace(/\W/g,'')), 'is-on'); return a.wait(350); })
          .then(function(){ return a.tap('st-1600Rp100000'); })
          .then(function(){ on(a.el('st-1600Rp100000'), 'is-on'); return a.wait(350); })
          .then(function(){ return a.tap('pick-ok'); })
          .then(function(){
            a.sheet('pick', false);
            var v = a.el('new-v'); v.textContent = S.newV; v.classList.remove('is-ph'); a.el('new-box').classList.remove('is-focus');
            return a.wait(450); })
          .then(function(){ var p = a.el('new-p'); p.textContent = 'Rp100.000'; on(p, 'mu-bp-pop'); return a.wait(350); })
          .then(function(){ return count(a, 'refund', 0, 25000, 900); })
          .then(function(){ on(a.el('pol-0'), 'is-hl'); return a.wait(500); })
          .then(function(){ return a.scroll(a.maxY(), 1000); })
          .then(function(){ return a.tap('save'); })
          .then(function(){ return toastOn(a, 1600); });
      },
      // PY04 · DP on → 30% (Rp120.000 now / Rp280.000 later) → 50% → back to
      // 30%, amounts recounted each time; down to Create Link → toast.
      'avm-py04': function(a){
        function chip(k){ ['c30','c50'].forEach(function(c){ a.el(c).classList.toggle('is-on', c === k); }); }
        function amounts(fromNow, toNow){ return Promise.all([count(a, 'now', fromNow, toNow, 700), count(a, 'rest', 400000 - fromNow, 400000 - toNow, 700)]); }
        return a.wait(400)
          .then(function(){ return a.tap('dp-toggle'); })
          .then(function(){
            on(a.el('dp-toggle'), 'is-on');
            ['dp-opts','dp-sum'].forEach(function(k){ var e = a.el(k); e.style.display = ''; e.classList.add('mu-new'); });
            a.el('now').textContent = 'Rp0'; a.el('rest').textContent = 'Rp400.000';
            return a.wait(350); })
          .then(function(){ return amounts(0, 120000); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.tap('c50'); })
          .then(function(){ chip('c50'); return amounts(120000, 200000); })
          .then(function(){ return a.wait(800); })
          .then(function(){ return a.tap('c30'); })
          .then(function(){ chip('c30'); return amounts(200000, 120000); })
          .then(function(){ return a.wait(600); })
          .then(function(){ return a.scroll(a.maxY(), 900); })
          .then(function(){ return a.tap('create'); })
          .then(function(){ on(a.el('create'), 'is-busy'); return a.wait(900); })
          .then(function(){ a.el('create').classList.remove('is-busy'); return toastOn(a, 1600); });
      }
    }
  });
})();
