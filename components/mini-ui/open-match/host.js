/* ==========================================================================
   AYO — Open Match: Mini UI cards for the "Untuk host / For hosts" tab
   Page design: Figma 26953:68879 (key features, host tab), staging board
   28427:17089 (slots H01–H05). Sources are read from the Open Match PRD file
   04uINvJUyqOhAdayb0pLjT (read only):
     H01 · Set up your match — 1.1 Entry Point 5085:139761, 4.1 Select Mode /
           Competitive 762:48631, 4.2 Select Mode / Casual 5652:33792
     H02 · Invite players or open spots — [Host] Motion - Selected Player
           4333:157721 (Players 4277:152270, Reserve Players 4277:152146)
     H03 · Set your price and payment method — 9 Fee 677:52014
     H04 · Connect your match to a court booking — 2.1 Time & Location
           655:39662 (Select Venue, Select Schedules, form with Booked via AYO)
     H05 · Record scores and share results — J. Input Score 4207:157435,
           Share Match Result 7207:140659

   Registers with the shared engine (components/mini-ui/mini-ui.js, loaded
   first). Strings come from the table below, picked by <html lang>. The
   first page of each card is its static frame (shown with reduced motion);
   the flow opens from the state set in PREP and plays the feature.
   Players are the site's fictional set (assets/scoring/avatars).
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h, on = h.on;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  /* ---------- Strings ---------- */
  var T = {
    id: {
      activity:'Aktivitas', upcoming:'Aktivitas mendatang', openMatch:'Open Match', openPlay:'Open Play',
      c1t:'Padel Malam Kamis', c1s:'Kam, 21 Mei · 19:00 · Senayan Padel', c2t:'Main Bareng Minggu Pagi', c2s:'Min, 24 Mei · 07:00 · Kemang Tennis',
      createPlay:'Buat Open Play', createPlayS:'Open play atau coaching, ajak orang lain ikut.',
      createMatch:'Buat match', createMatchS:'Match individu, ganda, atau sparring tim.',
      createComm:'Buat komunitas', createCommS:'Bentuk grup olahraga dan ajak pemain bergabung.',
      cancel:'Batal', cmTitle:'Buat Match', ind:'Individu', indS:'Kamu dan pemain lain bermain sebagai individu.',
      comm:'Komunitas', commS:'Bertanding atas nama komunitasmu.', cont:'Lanjut',
      formT:'Buat Open Match', formS:'Individu', name:'Nama Aktivitas', nameV:'Open Match Fajar',
      desc:'Deskripsi', descV:'Main seru, tetap kompetitif. Yuk tanding!', booking:'Pakai jadwal booking di', manual:'Atau', manualL:'Isi Jadwal Manual',
      sportCat:'Cabor &amp; Kategori', sport:'Cabor', padel:'Padel', comp:'Kompetitif', casual:'Santai',
      compT:'Untuk pertandingan serius', compS:'Skor match Kompetitif memengaruhi rating kemampuanmu.',
      casT:'Untuk main santai dan seru', casS:'Skor tidak memengaruhi rating kemampuanmu.',
      skill:'Preferensi Level', hostPlays:'Host ikut bermain', hostS:'Host bertugas mengisi dan mengirim skor, ikut main atau hanya mengatur.',
      singles:'Singles', singlesS:'1 vs 1', doubles:'Doubles', doublesS:'2 vs 2', avail:'Tersedia',
      note:'Mode Kompetitif di Padel hanya untuk match ganda.', privacy:'Privasi', privacyV:'Publik', fee:'Biaya Match', adv:'Pengaturan Lanjutan', finish:'Selesai',
      // H02
      players:'Pemain', playersS:'Atur pasangan dan posisi', invite:'Undangan',
      tabs:['Diminta','Menunggu','Bergabung','Batal'], decline:'Tolak', accept:'Terima', self:'Self rated · Pemula',
      reserveT:'Reserve Pemain', search:'Cari nama pemain…', rtabs:['Jelajahi','Komunitas','Aktivitas'], filter:'Filter',
      // H03
      feeT:'Biaya Match', online:'Online', cash:'Tunai', both:'Online &amp; Tunai', free:'Gratis',
      onlineFee:'Biaya Online', cashFee:'Biaya Tunai', save:'Simpan',
      // H04
      tl:'Waktu &amp; Lokasi', tlV:'Sen, 17 Agu 2026 · 14:00 – 16:00', courtsV:'Court A', bookedVia:'Booked via',
      venueT:'Pilih Venue', venueS:'Hanya venue dari booking AYO-mu.', searchVenue:'Cari nama venue…',
      venues:[['Arena Padel Senayan','Jakarta Selatan','Padel · Tennis'],['Kemang Sports Hub','Jakarta Selatan','Padel · Badminton'],['Bintaro Racket Club','Tangerang Selatan','Padel · Pickleball']],
      schedT:'Pilih Jadwal', reset:'Reset', days:[['Sen','17 Agu'],['Sel','18 Agu'],['Rab','19 Agu'],['Kam','20 Agu'],['Jum','21 Agu']], perDate:'lapangan sesuai tanggal',
      // H05
      inputT:'Input Skor', matchScore:'Skor Match', addSet:'+ Set', photos:'Tunjukkan fotonya!', addPhoto:'Tambah foto',
      submit:'Kirim skor', submitS:'Setelah dikirim, pemain lain bisa melihat dan mengonfirmasi hasilnya.',
      resultT:'Hasil Match', final:'Skor Akhir', when:'Min, 17 Agu 2026 · 09:00 – 11:00', where:'Court A, Arena Padel Senayan',
      won:'Fajar &amp; Maya Menang', verified:'Skor match sudah terverifikasi.', playersCol:'Pemain', confirmed:'mengonfirmasi hasil.',
      share:'Bagikan', bannerT:'Buat Banner · Feed'
    },
    en: {
      activity:'Activity', upcoming:'Upcoming activities', openMatch:'Open Match', openPlay:'Open Play',
      c1t:'Thursday Night Padel', c1s:'Thu, 21 May · 19:00 · Senayan Padel', c2t:'Sunday Morning Social', c2s:'Sun, 24 May · 07:00 · Kemang Tennis',
      createPlay:'Create an open play', createPlayS:'Open play or coaching, invite others to join.',
      createMatch:'Create a match', createMatchS:'Individual, doubles, or team sparring matches.',
      createComm:'Create a community', createCommS:'Start a group for your sport and invite players.',
      cancel:'Cancel', cmTitle:'Create Match', ind:'Individuals', indS:'You and the other players join as individuals.',
      comm:'Community', commS:'Play on behalf of your community.', cont:'Continue',
      formT:'Create an Open Match', formS:'Individual', name:'Activity Name', nameV:'Fajar’s Open Match',
      desc:'Description', descV:'Friendly, but competitive. Let’s play!', booking:'Use your booking schedule on', manual:'Or', manualL:'Enter Schedule Manually',
      sportCat:'Sport &amp; Category', sport:'Sport', padel:'Padel', comp:'Competitive', casual:'Casual',
      compT:'This is for your intense matches', compS:'Scores from competitive games directly affect your skill rating.',
      casT:'This is for your relaxed and social games', casS:'Scores will not affect your skill rating.',
      skill:'Skill Preferences', hostPlays:'Host plays in this match', hostS:'The host enters and submits the score, whether playing or only organizing.',
      singles:'Singles', singlesS:'1 vs 1', doubles:'Doubles', doublesS:'2 vs 2', avail:'Available',
      note:'Competitive mode in Padel is only available for doubles.', privacy:'Privacy', privacyV:'Public', fee:'Match Fee', adv:'Advanced Settings', finish:'Finish Setup',
      players:'Players', playersS:'Set pairings and positions', invite:'Invitation',
      tabs:['Requested','Pending','Joined','Canceled'], decline:'Decline', accept:'Accept', self:'Self rated · Newbie',
      reserveT:'Reserve Players', search:'Search player’s name…', rtabs:['Explore','Community','Activities'], filter:'Filter',
      feeT:'Match Fee', online:'Online', cash:'Cash', both:'Online &amp; Cash', free:'Free',
      onlineFee:'Online Registration Fee', cashFee:'Cash Registration Fee', save:'Save',
      tl:'Time &amp; Location', tlV:'Mon, 17 Aug 2026 · 14:00 – 16:00', courtsV:'Court A', bookedVia:'Booked via',
      venueT:'Select Venue', venueS:'Only venues from your AYO bookings.', searchVenue:'Search venue name…',
      venues:[['Arena Padel Senayan','South Jakarta','Padel · Tennis'],['Kemang Sports Hub','South Jakarta','Padel · Badminton'],['Bintaro Racket Club','South Tangerang','Padel · Pickleball']],
      schedT:'Select Schedules', reset:'Reset', days:[['Mon','17 Aug'],['Tue','18 Aug'],['Wed','19 Aug'],['Thu','20 Aug'],['Fri','21 Aug']], perDate:'courts for this date',
      inputT:'Input Score', matchScore:'Match Score', addSet:'+ Set', photos:'Show us the photos!', addPhoto:'Add photos',
      submit:'Submit score', submitS:'Once you submit, the other players can view and confirm the results.',
      resultT:'Match Result', final:'Final Score', when:'Sun, 17 Aug 2026 · 09:00 – 11:00', where:'Court A, Arena Padel Senayan',
      won:'Fajar &amp; Maya Won', verified:'The match score has been verified.', playersCol:'Players', confirmed:'confirmed the result.',
      share:'Share', bannerT:'Create Banner · Feed'
    }
  };
  var t = T[lang];
  var RATE = {fajar:'3.41', maya:'3.34', raka:'3.38', nina:'2.95', bayu:'3.12', tari:'2.87', sinta:'3.05', dika:'2.96'};
  var SHORT = {fajar:'Fajar R.', maya:'Maya L.', raka:'Raka A.', nina:'Nina S.', bayu:'Bayu A.', tari:'Tari A.', sinta:'Sinta D.', dika:'Dika P.'};
  var FULL = {fajar:'Fajar Rahman', maya:'Maya Lestari', raka:'Raka Aditya', nina:'Nina Sari', bayu:'Bayu Adi', tari:'Tari Ayu', sinta:'Sinta Dewi', dika:'Dika Putra'};

  /* ---------- Icons ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var I = {
    cal: S+'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M9 3v4"/><path d="M15 3v4"/></svg>',
    users: S+'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.4 3-5.2 6-5.2s5.5 1.8 6 5.2"/><path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2"/><path d="M18 14.9c1.8.6 2.8 2.2 3 5.1"/></svg>',
    user: S+'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6"/></svg>',
    userPlus: S+'<circle cx="10" cy="8" r="3.4"/><path d="M3.5 20c.6-3.6 3.2-5.6 6.5-5.6 1.5 0 2.9.4 4 1.2"/><path d="M18 14v6"/><path d="M15 17h6"/></svg>',
    down: S+'<path d="m6 9 6 6 6-6"/></svg>',
    plusC: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7"/><path d="M8.5 12h7"/></svg>',
    info: S+'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    // Zap, Hand-peace and the PadelLevels mark are the PRD's own icons (assets/open-match/).
    bolt: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><g> <path d="M5.75207 8.44907H5.4461C4.45694 8.44907 3.96236 8.44907 3.75155 8.12293C3.54074 7.79687 3.7416 7.34253 4.14334 6.43389L5.3511 3.70215C5.71636 2.876 5.89899 2.46292 6.25329 2.23146C6.60759 2 7.05724 2 7.95664 2H9.34958C10.4421 2 10.9884 2 11.1944 2.3569C11.4004 2.7138 11.1294 3.19059 10.5874 4.14415L9.87278 5.40125C9.60331 5.8753 9.46858 6.11233 9.47044 6.30635C9.47291 6.5585 9.60698 6.7908 9.82358 6.918C9.99024 7.01593 10.2618 7.01593 10.8049 7.01593C11.4915 7.01593 11.8348 7.01593 12.0136 7.1348C12.2459 7.2892 12.3675 7.56547 12.3249 7.84213C12.2921 8.05507 12.0612 8.3104 11.5993 8.82113L7.90924 12.9015C7.18444 13.703 6.82204 14.1037 6.57869 13.9769C6.33533 13.8501 6.4522 13.3215 6.68591 12.2641L7.14378 10.1931C7.32171 9.388 7.41071 8.98547 7.19671 8.71727C6.98271 8.44907 6.57249 8.44907 5.75207 8.44907Z" stroke-width="1.25" stroke-linejoin="round" stroke="currentColor"/> </g></svg>',
    hand: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><g> <path d="M13.265 1.875C13.0914 1.57638 12.8334 1.33579 12.5234 1.18354C12.2133 1.0313 11.8652 0.974197 11.5228 1.01944C11.1803 1.06468 10.859 1.21024 10.5991 1.43778C10.3393 1.66532 10.1525 1.96467 10.0625 2.29813L9.25 5.31812L8.44063 2.29813C8.38844 2.0685 8.29045 1.85177 8.15253 1.66091C8.0146 1.47006 7.83957 1.309 7.63793 1.18739C7.43629 1.06577 7.21217 0.986104 6.97901 0.953154C6.74585 0.920204 6.50844 0.934649 6.28099 0.995624C6.05354 1.0566 5.84074 1.16285 5.65533 1.30801C5.46992 1.45318 5.31571 1.63427 5.20194 1.84044C5.08817 2.04661 5.01718 2.27362 4.99322 2.50788C4.96926 2.74213 4.99282 2.97882 5.0625 3.20375L5.64875 5.39125L5.10313 5.28625C4.7301 5.20948 4.34221 5.2565 3.99833 5.42016C3.65444 5.58383 3.37334 5.85521 3.19767 6.19311C3.022 6.53102 2.96135 6.91702 3.02494 7.29251C3.08853 7.66801 3.27287 8.01252 3.55 8.27375C3.37507 8.43782 3.23593 8.63626 3.14128 8.85663C3.04664 9.077 2.99854 9.31455 3 9.55437V10C3 11.3261 3.52678 12.5979 4.46447 13.5355C5.40215 14.4732 6.67392 15 8 15H8.03813C10.7744 14.9794 13 12.7112 13 9.94375V9.735C12.9995 8.95915 12.7407 8.20556 12.2644 7.59312L13.4375 3.20375C13.4981 2.98188 13.5141 2.75017 13.4845 2.52208C13.4549 2.29398 13.3803 2.07404 13.265 1.875ZM6.10063 2.375C6.17469 2.2462 6.28535 2.14231 6.41855 2.07649C6.55175 2.01067 6.7015 1.9859 6.8488 2.00532C6.9961 2.02474 7.13432 2.08747 7.24592 2.18555C7.35751 2.28364 7.43746 2.41266 7.47563 2.55625L8.39875 6.00312C8.08563 6.02228 7.78342 6.12525 7.52375 6.30125C7.52084 6.29559 7.51749 6.29015 7.51375 6.285C7.32725 6.002 7.06165 5.78009 6.75 5.64687L6.02625 2.945C6.00035 2.84979 5.99359 2.75039 6.00635 2.65255C6.01912 2.55471 6.05116 2.46037 6.10063 2.375ZM4.01563 6.85C4.03541 6.753 4.0742 6.66088 4.12977 6.57895C4.18533 6.49702 4.25656 6.4269 4.33936 6.37263C4.42215 6.31836 4.51487 6.28102 4.61217 6.26276C4.70946 6.24451 4.80941 6.24569 4.90625 6.26625L6.20062 6.51625C6.29716 6.53593 6.38886 6.57443 6.47051 6.62957C6.55216 6.6847 6.62214 6.75537 6.67647 6.83756C6.73079 6.91974 6.76839 7.01182 6.78712 7.10854C6.80585 7.20526 6.80534 7.30473 6.78562 7.40125C6.76584 7.49825 6.72705 7.59037 6.67148 7.6723C6.61592 7.75423 6.54469 7.82435 6.46189 7.87862C6.3791 7.93289 6.28638 7.97023 6.18908 7.98849C6.09179 8.00674 5.99184 8.00556 5.895 7.985L4.59813 7.735C4.40376 7.69468 4.23331 7.57895 4.12413 7.41318C4.01494 7.24741 3.97592 7.04511 4.01563 6.85062V6.85ZM4.01563 9.395C4.05532 9.20202 4.16936 9.03242 4.33309 8.92284C4.49682 8.81325 4.69709 8.7725 4.89063 8.80937L5.5225 8.93437C5.71732 8.97413 5.88839 9.08962 5.99808 9.25545C6.10778 9.42129 6.14714 9.6239 6.1075 9.81875C6.08776 9.91548 6.04913 10.0074 5.9938 10.0891C5.93847 10.1709 5.86755 10.2409 5.78509 10.2952C5.70264 10.3495 5.61028 10.387 5.5133 10.4055C5.41633 10.424 5.31666 10.4232 5.22 10.4031L4.595 10.2781C4.40028 10.2381 4.22941 10.1224 4.11995 9.95645C4.01049 9.7905 3.97139 9.58788 4.01125 9.39312L4.01563 9.395ZM12 9.94375C12 12.1644 10.2194 13.9837 8.03125 14C7.17499 14.0061 6.33933 13.7376 5.64687 13.2339C4.95442 12.7302 4.44163 12.0178 4.18375 11.2012C4.25504 11.2252 4.32766 11.2451 4.40125 11.2606L5.02625 11.3856C5.14165 11.4091 5.25911 11.4211 5.37687 11.4212C5.68488 11.4212 5.98741 11.3398 6.2539 11.1854C6.52039 11.0309 6.7414 10.8089 6.8946 10.5417C7.0478 10.2745 7.12776 9.97155 7.1264 9.66354C7.12504 9.35554 7.04242 9.05335 6.88688 8.7875C6.93625 8.76063 6.985 8.73187 7.03188 8.7L7.04188 8.71625C7.16825 8.90858 7.33155 9.07391 7.52231 9.20266C7.71306 9.3314 7.92748 9.421 8.15313 9.46625L8.54813 9.545C8.47327 9.90636 8.48844 10.2806 8.59231 10.6347C8.69618 10.9888 8.88556 11.312 9.14375 11.5756C9.23744 11.6665 9.36295 11.7172 9.49348 11.7167C9.62401 11.7163 9.7492 11.6649 9.84231 11.5734C9.93542 11.4819 9.98906 11.3577 9.99178 11.2272C9.99451 11.0967 9.94609 10.9703 9.85688 10.875C9.66997 10.6843 9.54905 10.4387 9.51182 10.1743C9.47459 9.90991 9.52302 9.64052 9.65 9.40562C9.68734 9.33682 9.708 9.2602 9.71032 9.18195C9.71264 9.1037 9.69656 9.026 9.66336 8.9551C9.63016 8.8842 9.58077 8.82209 9.51918 8.77376C9.45759 8.72544 9.38551 8.69225 9.30875 8.67687L8.35 8.485C8.15529 8.4451 7.98438 8.32956 7.87481 8.16374C7.76524 7.99791 7.72597 7.79538 7.76563 7.60062C7.78537 7.50402 7.82397 7.41226 7.87921 7.33059C7.93445 7.24892 8.00526 7.17894 8.08758 7.12467C8.16989 7.07039 8.2621 7.03287 8.35893 7.01427C8.45576 6.99567 8.55531 6.99634 8.65187 7.01625L9.99 7.28375C10.5562 7.39812 11.0655 7.70456 11.4318 8.15123C11.798 8.5979 11.9988 9.15737 12 9.735V9.94375ZM12.4744 2.94375L11.4356 6.81875C11.0569 6.56602 10.6322 6.39019 10.1856 6.30125L10.0294 6.27L11.025 2.55687C11.0493 2.46048 11.0926 2.36988 11.1522 2.29035C11.2119 2.21081 11.2867 2.14393 11.3724 2.09359C11.4582 2.04325 11.5531 2.01045 11.6516 1.99711C11.7501 1.98377 11.8503 1.99015 11.9463 2.01588C12.0423 2.0416 12.1323 2.08616 12.2109 2.14697C12.2896 2.20778 12.3554 2.28361 12.4044 2.37007C12.4535 2.45652 12.4849 2.55187 12.4968 2.65058C12.5087 2.74928 12.5009 2.84936 12.4738 2.945L12.4744 2.94375Z" fill="currentColor"/> </g></svg>',
    bell: S+'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
    mail: S+'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    search: S+'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
    sliders: S+'<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>',
    pin: S+'<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    trash: S+'<path d="M5 7h14"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>',
    minus: S+'<path d="M6 12h12"/></svg>',
    cam: S+'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    chat: S+'<path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5z"/><path d="M9 10.5h.01"/><path d="M12 10.5h.01"/><path d="M15 10.5h.01"/></svg>',
    pl: '<svg aria-hidden="true" viewBox="0 0 12 12" fill="none"><g> <g> <path d="M7.01212 8.10842L11.4 2.08982L10.9786 1.80002L7.01464 7.22838L5.04848 3.94426L0.900001 10.0049L5.02664 4.79462L7.01212 8.10842Z" fill-rule="evenodd" clip-rule="evenodd" fill="#D83232"/> <path d="M7.01212 10.2L11.3339 4.23407L10.9128 3.94427L7.01492 9.32028L5.04876 6.03588L1.9122 9.91387L5.02692 6.88624L7.01212 10.2Z" fill-rule="evenodd" clip-rule="evenodd" fill="#D83232"/> </g> </g></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10"/><path d="M17 7 7 17"/></svg>'
  };
  function ic(n, cls){ return '<span class="om-ic'+(cls?' '+cls:'')+'">'+I[n]+'</span>'; }
  var AYO = '<img class="om-ayo" src="assets/logo.svg" alt="AYO" width="22" height="12">';
  function plain(s){ return s.replace(/&amp;/g, '&'); }

  /* ---------- Shared parts ---------- */
  function rate(k){ return '<em class="om-rate">'+I.pl+RATE[k]+'</em>'; }
  function avatar(k, size){ return '<img class="om-av" style="width:'+size+'px;height:'+size+'px" src="assets/scoring/avatars/'+k+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function slotEmpty(){ return '<span class="om-slot__c">'+h.I.plus+'</span><span class="om-slot__l">'+t.avail+'</span>'; }
  function slotFull(k, x){ return '<span class="om-slot__p">'+avatar(k, 30)+(x?'<i class="om-x">'+I.x+'</i>':'')+'</span>'+rate(k)+'<span class="om-slot__l om-slot__l--me">'+SHORT[k]+'</span>'; }
  function slot(k, el, x){ return '<span class="om-slot'+(k?' is-full':'')+'"'+(el?' data-el="'+el+'"':'')+'>'+(k?slotFull(k, x):slotEmpty())+'</span>'; }
  function field(label, value, req, right, el){
    return '<div class="om-fld"'+(el?' data-el="'+el+'"':'')+'><div class="mu-col mu-grow"><span class="om-fld__l">'+label+(req?'<i>*</i>':'')+'</span>'+(value?'<span class="om-fld__v">'+value+'</span>':'')+'</div>'+(right||'')+'</div>';
  }
  function chips(list, el, onIdx, cls){
    return '<div class="om-chips'+(cls?' '+cls:'')+'"'+(el?' data-el="'+el+'"':'')+'>'+list.map(function(c, i){ return '<span class="mu-chip'+(i===onIdx?' is-on':'')+'" data-el="'+(el||'chip')+'-'+i+'">'+c+'</span>'; }).join('')+'</div>';
  }
  function booked(){ return '<span class="om-booked">'+t.bookedVia+' <img src="assets/icons/footer/logo.svg" alt="AYO" width="16" height="9"></span>'; }

  /* ---------- The Create an Open Match form (H01, H03, H04) ---------- */
  function form(o){
    o = o || {};
    var bk = '<div class="om-bk'+(o.booked?' is-booked':'')+'" data-el="bk">'+
        '<div class="om-fld om-bk__row" data-el="bk-row"><span class="om-fld__v mu-grow">'+t.booking+' '+AYO+'</span>'+ic('plusC')+'</div>'+
        '<span class="mu-s om-bk__row">'+t.manual+' <u class="om-u">'+t.manualL+'</u></span>'+
        '<div class="om-fld om-tl" data-el="tl"><div class="mu-col mu-grow" style="gap:3px"><span class="om-fld__l">'+t.tl+'</span><span class="om-fld__v">'+t.tlV+'</span>'+booked()+
          '<span class="om-tl__hr"></span><span class="om-fld__v">'+t.venues[0][0]+'</span><span class="om-fld__l">'+t.courtsV+'</span></div>'+ic('trash')+'</div>'+
      '</div>';
    return h.page('form', h.head(h.ico('back')+'<span class="mu-head__title">'+t.formT+'<span class="mu-head__sub">'+t.formS+'</span></span>'),
      '<div class="om-form" data-el="form">'+
      field(t.name, t.nameV, true)+
      field(t.desc, t.descV)+
      bk+
      '<span class="om-band"></span>'+
      '<span class="mu-h" data-el="sportcat">'+t.sportCat+'</span>'+
      field(t.sport, t.padel, true, ic('down'))+
      '<div class="mu-seg" data-el="mode" data-on="0"><span class="mu-seg__knob"></span>'+
        '<span class="mu-seg__i is-on" data-el="mode-0">'+ic('bolt','om-ic--in')+t.comp+'</span>'+
        '<span class="mu-seg__i" data-el="mode-1">'+ic('hand','om-ic--in')+t.casual+'</span></div>'+
      '<div class="mu-tint om-info" data-el="info">'+
        '<img class="om-pl om-only-comp" src="assets/open-match/padellevels.svg" alt="PadelLevels" width="79" height="16">'+
        '<span class="mu-t mu-b" data-el="info-t">'+t.compT+'</span><span class="mu-s" data-el="info-s">'+t.compS+'</span></div>'+
      field(t.skill, '', true, ic('down'))+
      '<div class="mu-card mu-pad mu-col" style="gap:5px"><div class="mu-row">'+ic('userPlus')+'<span class="mu-h mu-grow" style="font-size:11px">'+t.hostPlays+'</span><span class="mu-toggle is-on"></span></div>'+
        '<span class="mu-s" style="font-size:9px">'+t.hostS+'</span></div>'+
      '<div class="mu-card om-format" data-el="format">'+
        '<div class="om-fmt om-only-cas" data-el="fmt-single"><div class="mu-row">'+ic('user')+'<span class="mu-h mu-grow" style="font-size:11px">'+t.singles+' <span class="om-light">· '+t.singlesS+'</span></span><span class="mu-radio"></span></div></div>'+
        '<div class="om-fmt" data-el="fmt-double"><div class="mu-row">'+ic('users')+'<span class="mu-h mu-grow" style="font-size:11px">'+t.doubles+' <span class="om-light">· '+t.doublesS+'</span></span><span class="mu-radio is-on om-only-cas"></span></div>'+
          '<div class="om-lineup">'+slot('fajar')+slot()+'<b class="om-vs">VS</b>'+slot()+slot()+'</div></div></div>'+
      '<div class="mu-tint om-note om-only-comp">'+ic('info')+'<span class="mu-s">'+t.note+'</span></div>'+
      '<span class="om-band"></span>'+
      '<div class="om-links" data-el="settings">'+
        '<span>'+t.privacy+'<i>*</i><b class="om-links__v">'+t.privacyV+'</b>'+h.I.chev+'</span>'+
        '<span data-el="fee-row">'+t.fee+'<i>*</i><b class="om-links__v" data-el="fee-v">'+(o.fee||'')+'</b>'+h.I.chev+'</span>'+
        '<span>'+t.adv+'<b class="om-links__v"></b>'+h.I.chev+'</span></div>'+
      '<div class="mu-btn mu-btn--off" data-el="finish">'+t.finish+'</div>'+
      '</div>');
  }

  /* ---------- H01 · Create sheets and Activity screen ---------- */
  function card(title, sub, badge){
    return '<div class="mu-card mu-pad mu-col" style="gap:6px"><span class="om-badge">'+badge+'</span><span class="mu-h">'+title+'</span><span class="mu-s">'+sub+'</span>'+
      '<span class="mu-avs"><span class="mu-pair">'+h.av('maya')+h.av('bayu')+'</span><span class="mu-s">+4</span></span></div>';
  }
  function home(){
    return h.page('home', h.head('<span class="mu-head__title">'+t.activity+'</span><span class="mu-head__sp"></span><span class="mu-ico">'+I.bell+'</span>'),
      '<span class="mu-cap">'+t.upcoming.toUpperCase()+'</span>'+card(t.c1t, t.c1s, t.openMatch)+card(t.c2t, t.c2s, t.openPlay),
      '<span class="mu-fab" data-el="fab">'+h.I.plus+'</span>');
  }
  function createSheets(){
    function opt(icon, title, sub, el){ return '<div class="mu-li" data-el="'+el+'">'+icon+'<div class="mu-col mu-grow"><span class="mu-h" style="font-size:11px">'+title+'</span><span class="mu-s" style="font-size:9px">'+sub+'</span></div></div>'; }
    function pick(icon, title, sub, el){
      return '<div class="mu-li om-pick" data-el="'+el+'"><div class="mu-col mu-grow" style="gap:4px"><div class="mu-row">'+ic(icon)+'<span class="mu-h mu-grow" style="font-size:11px">'+title+'</span><span class="mu-radio"></span></div>'+
        '<span class="mu-s om-pick__s">'+sub+'</span></div></div>';
    }
    return '<div class="mu-sheet om-sheet" data-el="create"><span class="mu-sheet__bar"></span><div class="mu-list">'+
        opt(ic('cal'), t.createPlay, t.createPlayS, 'opt-play')+
        opt('<b class="om-vs om-vs--ic">VS</b>', t.createMatch, t.createMatchS, 'opt-match')+
        opt(ic('users'), t.createComm, t.createCommS, 'opt-comm')+
      '</div><div class="mu-btn mu-btn--line">'+t.cancel+'</div></div>'+
      '<div class="mu-sheet om-sheet" data-el="cmatch"><div class="mu-row mu-row--between"><span class="mu-h" style="font-size:13px">'+t.cmTitle+'</span>'+h.ico('close')+'</div>'+
        '<div class="mu-list">'+pick('user', t.ind, t.indS, 'ind')+pick('users', t.comm, t.commS, 'comm')+'</div>'+
        '<div class="mu-btn mu-btn--off" data-el="cont">'+t.cont+'</div></div>';
  }

  /* ---------- H02 · Players and Reserve Players ---------- */
  function request(k){
    return '<div class="om-req" data-el="req-'+k+'">'+avatar(k, 26)+'<div class="mu-col mu-grow" style="gap:3px"><span class="mu-h" style="font-size:10.5px">'+FULL[k]+'</span>'+
      '<span class="om-tags">'+rate(k)+'</span></div>'+
      '<span class="om-mini om-mini--line">'+t.decline+'</span><span class="om-mini" data-el="acc-'+k+'">'+t.accept+'</span></div>';
  }
  function players(){
    return h.page('players', h.head(h.ico('back')+'<span class="mu-head__title">'+t.players+'<span class="mu-head__sub">'+t.playersS+'</span></span><span class="mu-head__sp"></span><span class="om-pillbtn">'+ic('mail')+t.invite+'</span>'),
      '<div class="om-teams"><div class="om-team"><b>A</b><div class="om-team__row">'+slot('fajar')+slot('maya', 'a2', true)+'</div></div><span class="om-team__div"></span>'+
        '<div class="om-team"><b>B</b><div class="om-team__row">'+slot(null, 'b1')+slot(null, 'b2')+'</div></div></div>'+
      '<div class="om-tabs"><span class="is-on">'+t.tabs[0]+' (<span data-el="req-n">2</span>)</span><span>'+t.tabs[1]+'</span><span>'+t.tabs[2]+'</span><span>'+t.tabs[3]+'</span></div>'+
      '<div class="om-reqs" data-el="reqs">'+request('raka')+request('nina')+'</div>');
  }
  function reserve(){
    var rows = ['maya','bayu','tari','sinta','dika'].map(function(k){
      return '<div class="om-req" data-el="pick-'+k+'">'+avatar(k, 26)+'<div class="mu-col mu-grow" style="gap:3px"><span class="mu-h" style="font-size:10.5px">'+FULL[k]+'</span>'+
        '<span class="om-tags"><span class="om-tag">'+t.self+'</span>'+rate(k)+'</span></div></div>';
    }).join('');
    return h.page('reserve', h.head(h.ico('close')+'<span class="mu-head__title">'+t.reserveT+'</span>'),
      '<div class="om-fld om-search">'+ic('search')+'<span class="om-fld__l" style="font-size:10.5px">'+t.search+'</span></div>'+
      '<div class="om-tabs om-tabs--eq"><span class="is-on">'+t.rtabs[0]+'</span><span>'+t.rtabs[1]+'</span><span>'+t.rtabs[2]+'</span></div>'+
      '<div class="om-reqs">'+rows+'</div>',
      '<span class="om-filter">'+ic('sliders')+t.filter+'</span>');
  }

  /* ---------- H03 · Match Fee sheet ---------- */
  function feeSheet(){
    return '<div class="mu-sheet om-sheet" data-el="fee"><div class="mu-row mu-row--between"><span class="mu-h" style="font-size:13px">'+t.feeT+'</span>'+h.ico('close')+'</div>'+
      chips([t.online, t.cash, t.both, t.free], 'feec', 2, 'om-chips--fee')+
      '<div class="om-feef" data-el="f-online">'+field(t.onlineFee, '<span class="om-rp">Rp</span><span data-el="v-online">100.000</span>', true)+'</div>'+
      '<div class="om-feef" data-el="f-cash">'+field(t.cashFee, '<span class="om-rp">Rp</span><span data-el="v-cash">125.000</span>', true)+'</div>'+
      '<div class="mu-btn" data-el="fee-save">'+t.save+'</div></div>';
  }

  /* ---------- H04 · Select Venue and Select Schedules ---------- */
  function thumb(i){ return '<span class="om-thumb om-thumb--'+i+'"></span>'; }
  function venue(){
    var rows = t.venues.map(function(v, i){
      return '<div class="om-venue" data-el="venue-'+i+'">'+thumb(i)+'<div class="mu-col mu-grow" style="gap:1px"><span class="mu-h" style="font-size:10.5px">'+v[0]+'</span><span class="mu-s" style="font-size:9px">'+v[1]+'</span><span class="mu-s" style="font-size:9px">'+v[2]+'</span></div></div>';
    }).join('');
    return h.page('venue', h.head(h.ico('close')+'<span class="mu-head__title">'+t.venueT+'</span>'),
      '<span class="mu-s">'+t.venueS+'</span>'+
      '<div class="om-fld om-search">'+ic('search')+'<span class="om-fld__l" style="font-size:10.5px">'+t.searchVenue+'</span></div>'+
      chips(['Padel','Tennis','Badminton'], 'vs', -1)+rows);
  }
  function sched(){
    var days = t.days.map(function(d, i){ return '<span class="om-day'+(i===0?' is-on':'')+'"><span class="om-day__w">'+d[0]+'</span>'+d[1]+(i===1||i===3?'<i></i>':'')+'</span>'; }).join('');
    function court(name, el){ return '<div class="om-court" data-el="'+el+'"><span>'+name+'</span><span class="om-cb"></span></div>'; }
    return h.page('sched', h.head(h.ico('back')+'<span class="mu-head__title">'+t.schedT+'</span><span class="mu-head__sp"></span><span class="mu-link">'+t.reset+'</span>'),
      '<div class="om-days">'+days+'</div>'+
      '<div class="om-venue om-venue--sel">'+thumb(0)+'<div class="mu-col mu-grow" style="gap:1px"><span class="mu-h" style="font-size:10.5px">'+t.venues[0][0]+'</span><span class="mu-s" style="font-size:9px">'+t.venues[0][1]+' · '+t.perDate+'</span></div>'+ic('down')+'</div>'+
      chips(['Padel','Tennis','Pickleball'], 'ss', 0)+
      '<span class="mu-h" style="font-size:11px">14:00 – 15:00</span>'+court('Court A','ct-a1')+court('Court B','ct-b1')+
      '<span class="mu-h" style="font-size:11px">15:00 – 16:00</span>'+court('Court A','ct-a2')+court('Court C','ct-c2')+
      '<div class="mu-btn mu-btn--off om-endbtn" data-el="sched-save">'+t.save+'</div>');
  }

  /* ---------- H05 · Input Score, Match Result, Banner ---------- */
  function four(center){
    function p(k){ return '<span class="om-four__p">'+avatar(k, 30)+rate(k)+'<span class="om-slot__l om-slot__l--me">'+SHORT[k].split(' ')[0]+'</span></span>'; }
    return '<div class="om-four">'+p('fajar')+p('maya')+'<span class="om-four__c">'+center+'</span>'+p('raka')+p('nina')+'</div>';
  }
  function setRow(n, a, b){
    function side(v, el){ return '<div class="om-set__s">'+ic('minus','om-ic--sm')+'<b data-el="'+el+'">'+v+'</b><span class="om-plus" data-el="'+el+'-plus">'+ic('plusC','om-ic--sm')+'</span></div>'; }
    return '<div class="om-set">'+side(a, 's'+n+'a')+'<span class="om-set__n"><b>'+n+'</b><i>'+I.trash+'</i></span>'+side(b, 's'+n+'b')+'</div>';
  }
  function input(){
    return h.page('input', h.head(h.ico('back')+'<span class="mu-head__title">'+t.inputT+'</span>'),
      four('<b class="om-vs">VS</b>')+
      '<span class="mu-h">'+t.matchScore+'</span>'+setRow(1, 5, 3)+setRow(2, 5, 4)+
      '<span class="om-addset">'+t.addSet+'</span>'+
      '<span class="mu-h">'+t.photos+'</span><div class="om-photo">'+ic('cam')+'<span>'+t.addPhoto+'</span></div>'+
      '<div class="mu-btn om-endbtn" data-el="submit">'+t.submit+'</div><span class="mu-s om-submit-s">'+t.submitS+'</span>');
  }
  function result(){
    function row(names, s, a, b, win){ return '<div class="om-tr'+(win?'':' is-lose')+'"><span>'+names+'</span><b>'+s+'</b><span>'+a+'</span><span>'+b+'</span></div>'; }
    function conf(k){ return '<div class="mu-row" style="gap:5px">'+h.av(k)+'<span class="mu-t" style="font-size:10px"><b>'+SHORT[k].split(' ')[0]+'</b> <span class="om-ok">'+t.confirmed.split(' ')[0]+'</span> '+t.confirmed.split(' ').slice(1).join(' ')+'</span></div>'; }
    return h.page('result', h.head(h.ico('back')+'<span class="mu-head__title">'+t.resultT+'</span>'),
      four('<span class="om-four__k">'+t.final+'</span><b class="om-final">2:0</b>')+
      '<span class="mu-s" style="text-align:center">'+t.when+'<br>'+t.where+'</span>'+
      '<div class="om-win" data-el="win"><div class="mu-col" style="gap:2px"><span class="mu-h">'+t.won+'</span><span class="mu-s" style="font-size:9px">'+t.verified+'</span></div>'+
        '<img class="om-cup" src="assets/scoring/trophy-cup.svg" alt="" width="34" height="49"></div>'+
      '<div class="om-table"><div class="om-tr om-tr--h"><span>'+t.playersCol+'</span><b>Set</b><span>1</span><span>2</span></div>'+
        row('Fajar R./Maya L.', 2, 6, 6, true)+row('Raka A./Nina S.', 0, 3, 4, false)+'</div>'+
      conf('maya')+conf('raka')+conf('nina')+
      '<div class="om-resfoot" data-el="res-foot"><span class="om-sq">'+ic('chat')+'</span><div class="mu-btn mu-btn--line" data-el="share">'+h.I.share.replace('<svg','<svg class="om-share"')+t.share+'</div></div>');
  }
  function banner(){
    var colors = ['#14a3f0','#6dd42c','#f2852c','#ec2435'];
    return h.page('banner', h.head(h.ico('back')+'<span class="mu-head__title">'+t.bannerT+'</span>'),
      '<div class="om-banner"><span class="om-banner__t">MATCH RESULT</span><span class="om-banner__court"></span>'+
        '<div class="om-banner__score"><div><span>Fajar Rahman<br>Maya Lestari</span><b class="w">6</b><b class="w">6</b><i>2</i></div><div><span>Raka Aditya<br>Nina Sari</span><b>3</b><b>4</b><i class="l">0</i></div></div>'+
        '<img class="om-banner__logo" src="assets/icons/footer/logo.svg" alt="AYO" width="22" height="12"></div>'+
      '<div class="om-colors">'+colors.map(function(c, i){ return '<span class="'+(i===0?'is-on':'')+'" style="background:'+c+'"></span>'; }).join('')+'</div>'+
      '<div class="mu-btn">'+t.share+'</div>');
  }

  /* ---------- Motion helpers ---------- */
  function casual(a, v){
    var f = a.el('form'), seg = a.el('mode');
    seg.dataset.on = v ? '1' : '0';
    on(a.el('mode-0'), 'is-on', !v); on(a.el('mode-1'), 'is-on', v);
    f.classList.toggle('is-casual', v);
    a.el('info-t').textContent = v ? plain(t.casT) : plain(t.compT);
    a.el('info-s').textContent = v ? t.casS : t.compS;
    pop(a.el('info')); pop(a.el('fmt-single'));
  }
  function pop(el){ el.classList.remove('mu-new'); el.offsetWidth; el.classList.add('mu-new'); }
  function activate(a, name){
    var scr = a.stage.querySelector('.mu-screen');
    [].forEach.call(scr.querySelectorAll('.mu-page'), function(p){ p.classList.toggle('is-active', p.dataset.page === name); p.classList.remove('is-behind'); });
  }
  function fill(a, el, k, x){ var s = a.el(el); s.classList.add('is-full'); s.innerHTML = slotFull(k, x); pop(s); }
  function empty(a, el){ var s = a.el(el); s.classList.remove('is-full'); s.innerHTML = slotEmpty(); }
  function feeSelect(a, i){
    a.select('feec', 'feec-'+i);
    on(a.el('f-online'), 'is-hide', !(i === 0 || i === 2));
    on(a.el('f-cash'), 'is-hide', !(i === 1 || i === 2));
  }
  function count(a, el, to){ var v = a.el(el); return a.tap(el+'-plus').then(function(){ v.textContent = String(to); pop(v); return a.wait(380); }); }

  M.add({
    cards: {
      // H01 · Set up your match. Static frame: the form at Sport & Category (Competitive).
      'om-h01': {pages:[form(), home()], to:'sportcat', margin:8, extra:createSheets, flow:'om-h01'},
      // H02 · Invite players. Static frame: Maya reserved into team A, two requests waiting.
      'om-h02': {pages:[players(), reserve()], flow:'om-h02'},
      // H03 · Match fee. Static frame: the Match Fee sheet on Online & Cash, both fees set.
      'om-h03': {pages:[form({fee:t.both})], to:'settings', margin:22, extra:feeSheet, open:'fee', flow:'om-h03'},
      // H04 · Court booking. Static frame: the form with the booked Time & Location card.
      'om-h04': {pages:[form({booked:true}), venue(), sched()], to:'bk', margin:8, flow:'om-h04'},
      // H05 · Scores and results. Static frame: Match Result with the winner banner.
      'om-h05': {pages:[result(), input(), banner()], flow:'om-h05'}
    },
    prep: {
      // Opens on the Activity screen, before anything is created.
      'om-h01': function(a){ activate(a, 'home'); },
      // Opens with team A's second spot empty.
      'om-h02': function(a){ empty(a, 'a2'); a.el('a2').classList.remove('mu-new'); },
      // Opens on the form with no fee set and the sheet closed.
      'om-h03': function(a){
        a.el('fee').classList.add('no-anim'); a.el('fee').classList.remove('is-on'); a.el('dim').classList.remove('is-on');
        a.el('fee-v').textContent = ''; feeSelect(a, -1); a.el('v-online').textContent = ''; a.el('v-cash').textContent = '';
        a.el('fee').offsetHeight; a.el('fee').classList.remove('no-anim');
      },
      // Opens on the form before a booking is linked.
      'om-h04': function(a){ a.el('bk').classList.remove('is-booked'); },
      // Opens on Input Score, two points short of the final score.
      'om-h05': function(a){ activate(a, 'input'); }
    },
    flows: {
      // + → Create sheet → Create a match → Individuals → Continue → the
      // form scrolls to Sport & Category → Casual (info and formats change).
      'om-h01': function(a){
        return a.tap('fab').then(function(){ return a.sheet('create', true); })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.tap('opt-match'); })
          .then(function(){ a.el('create').classList.remove('is-on'); return a.sheet('cmatch', true); })
          .then(function(){ return a.wait(350); })
          .then(function(){ return a.tap('ind'); })
          .then(function(){
            on(a.el('ind'), 'is-on'); on(a.el('ind').querySelector('.mu-radio'), 'is-on');
            a.el('cont').classList.remove('mu-btn--off'); return a.wait(600);
          })
          .then(function(){ return a.tap('cont'); })
          .then(function(){ a.sheet('cmatch', false); return a.go('form'); })
          .then(function(){ return a.toTarget(); })
          .then(function(){ return a.wait(700); })
          .then(function(){ return a.tap('mode-1'); })
          .then(function(){ casual(a, true); return a.wait(1300); })
          .then(function(){ return a.scrollTo('format', 40, 900); });
      },
      // Tap the empty spot → Reserve Players → Maya → back, Maya takes the
      // spot; then accept Raka's request and he joins team B.
      'om-h02': function(a){
        return a.wait(300).then(function(){ return a.tap('a2'); })
          .then(function(){ return a.go('reserve'); })
          .then(function(){ return a.wait(400); })
          .then(function(){ return a.tap('pick-maya'); })
          .then(function(){ on(a.el('pick-maya'), 'is-picked'); return a.wait(250); })
          .then(function(){ return a.back('players'); })
          .then(function(){ fill(a, 'a2', 'maya', true); return a.wait(900); })
          .then(function(){ return a.tap('acc-raka'); })
          .then(function(){ on(a.el('req-raka'), 'is-gone'); a.el('req-n').textContent = '1'; return a.wait(350); })
          .then(function(){ a.el('req-raka').remove(); fill(a, 'b1', 'raka'); return a.wait(400); });
      },
      // Down to Match Fee → sheet → Online (types the fee) → Online & Cash
      // (types the cash fee) → Save → the row shows Online & Cash.
      'om-h03': function(a){
        return a.toTarget().then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('fee-row'); })
          .then(function(){ return a.sheet('fee', true); })
          .then(function(){ return a.tap('feec-0'); })
          .then(function(){ feeSelect(a, 0); return a.type('v-online', '100.000', 90); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('feec-2'); })
          .then(function(){ feeSelect(a, 2); return a.type('v-cash', '125.000', 90); })
          .then(function(){ return a.wait(400); })
          .then(function(){ return a.tap('fee-save'); })
          .then(function(){ a.el('fee-v').textContent = plain(t.both); pop(a.el('fee-v')); return a.sheet('fee', false); });
      },
      // "Use your booking schedule on AYO" → Select Venue → Select Schedules
      // (tick a court for two hours) → Save → the booked card fills the form.
      'om-h04': function(a){
        return a.wait(300).then(function(){ return a.tap('bk-row'); })
          .then(function(){ return a.go('venue'); })
          .then(function(){ return a.wait(350); })
          .then(function(){ return a.tap('venue-0'); })
          .then(function(){ return a.go('sched'); })
          .then(function(){ return a.wait(350); })
          .then(function(){ return a.tap('ct-a1'); })
          .then(function(){ on(a.el('ct-a1'), 'is-on'); return a.wait(300); })
          .then(function(){ return a.scrollTo('ct-a1', 26, 700); })
          .then(function(){ return a.tap('ct-a2'); })
          .then(function(){ on(a.el('ct-a2'), 'is-on'); a.el('sched-save').classList.remove('mu-btn--off'); return a.wait(400); })
          .then(function(){ return a.scrollBottom('sched-save', 800); })
          .then(function(){ return a.wait(250); })
          .then(function(){ return a.tap('sched-save'); })
          .then(function(){
            var v = a.stage.querySelector('[data-page="venue"]');
            a.el('bk').classList.add('is-booked'); pop(a.el('tl'));
            var p = a.back('form'); v.classList.remove('is-behind'); return p;
          })
          .then(function(){ return a.wait(500); })
          .then(function(){ return a.toTarget(); });
      },
      // Two taps finish the score (6–3, 6–4) → Submit → Match Result with
      // the winner banner → Share → the feed banner.
      'om-h05': function(a){
        return a.wait(300).then(function(){ return count(a, 's1a', 6); })
          .then(function(){ return count(a, 's2a', 6); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.scrollBottom('submit', 900); })
          .then(function(){ return a.wait(250); })
          .then(function(){ return a.tap('submit'); })
          .then(function(){ return a.go('result'); })
          .then(function(){ pop(a.el('win')); return a.wait(1400); })
          .then(function(){ return a.scrollBottom('res-foot', 1000); })
          .then(function(){ return a.wait(300); })
          .then(function(){ return a.tap('share'); })
          .then(function(){ return a.go('banner'); });
      }
    }
  });
})();
