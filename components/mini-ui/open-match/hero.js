/* ==========================================================================
   AYO — Open Match hero: the match detail in the phone (card om-hero)
   Figma: "Detail Open Match (hero)" 28528:94 in the hero slot 26953:68943
   (mobile 26953:69201). Drawn at the Figma frame's own size (240 px screen),
   with the icons exported from that frame. Players use the Scoring hero's
   photos and names (assets/scoring/hero-faces: p0 Bayu, p1 Gabriella, p4 Gilberta, p3 Fredy). Static card, no flow:
   scripts/open-match-hero.js plays the hero (a player joins, the snackbar,
   and the floating PadelLevels card stepping 3.34 → 3.41).
   Load after mini-ui.js; classes are in hero.css (prefix omh-).
   ========================================================================== */
(function(){
  'use strict';
  var M = window.AyoMiniUI; if(!M) return;
  var h = M.h;
  var lang = document.documentElement.lang === 'id' ? 'id' : 'en';

  var S = {
    id: {
      title:'[3H2C] 120K Intense Rally Match All Level 16 pax, Upper Intermediate',
      padel:'Padel', comp:'Kompetitif', city:'Jakarta', avail:'Tersedia', req:'Permintaan',
      lvSub:'Pemain dengan rating 2.50 – 3.50 diutamakan',
      date:'Minggu, 17 Agustus 2026', venue:'Kawan AYO Arena Jakarta', court:'Lapangan Utama',
      online:'· Pembayaran Online', cash:'· Pembayaran Tunai', privacy:'Privasi', pub:'· Publik',
      desc:'Deskripsi', descV:'Main aman main nyaman, sudah termasuk foto &amp; air mineral. Tanya terlebih dahulu untuk ketersediaan slot jadwal ke admin.',
      snack:'Pemain diperbarui.'
    },
    en: {
      title:'[3H2C] 120K Intense Rally Match All Level 16 pax, Upper Intermediate',
      padel:'Padel', comp:'Competitive', city:'Jakarta', avail:'Available', req:'Requested',
      lvSub:'Players with a 2.50 – 3.50 rating are preferred',
      date:'Sunday, 17 August 2026', venue:'Kawan AYO Arena Jakarta', court:'Main Court',
      online:'· Online Payment', cash:'· Cash Payment', privacy:'Privacy', pub:'· Public',
      desc:'Description', descV:'Play safe, play comfortably, photos &amp; mineral water included. Please ask the admin about slot availability first.',
      snack:'Players updated.'
    }
  };
  var t = S[lang];

  // Icons exported from Figma 28528:94 (stroke/fill colours kept).
  var I = {
    back:'<svg viewBox="0 0 24 24" fill="none"><path d="M6.668 12h10.667M6.668 12c0 .879 3.333 3.333 3.333 3.333M6.668 12c0-.879 3.333-3.333 3.333-3.333" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    share:'<svg viewBox="0 0 16 16" fill="none"><path d="M8.667 5.668H9V3.132a.5.5 0 0 1 .805-.315l3.968 4.273a.85.85 0 0 1 0 1.156l-3.968 4.274A.5.5 0 0 1 9 12.204V9.668c-3.703 0-5.702 2.678-6.205 3.457a.42.42 0 0 1-.795-.209v-.581c0-3.682 2.985-6.667 6.667-6.667Z" stroke="#2C2C2C" stroke-linejoin="round"/></svg>',
    padel:'<svg viewBox="0 0 11 11" fill="#25282B"><circle cx="6.24" cy="2.6" r=".4"/><circle cx="7.4" cy="3.26" r=".4"/><circle cx="5.44" cy="3.98" r=".4"/><circle cx="6.6" cy="4.65" r=".4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.508.467c.719-.194 1.519.01 2.425.532.906.523 1.482 1.115 1.674 1.834.192.72-.033 1.457-.46 2.196-.425.736-1.03 1.463-1.802 1.863a2.6 2.6 0 0 1-.39.169L4.996 8.486l-.89 1.543a.667.667 0 0 1-.911.244l-.924-.534a.667.667 0 0 1-.244-.91l.891-1.543.255-2.41a2.6 2.6 0 0 1-.05-.422c-.039-.868.288-1.756.713-2.492.427-.74.952-1.302 1.672-1.495Zm.208.772c-.42.113-.804.459-1.187 1.123-.385.667-.636 1.4-.607 2.057.028.628.311 1.219 1.077 1.661.766.443 1.42.392 1.977.103.584-.304 1.094-.888 1.479-1.554.383-.664.49-1.17.379-1.59-.113-.421-.475-.87-1.301-1.347-.827-.477-1.396-.566-1.817-.453ZM3.453 7.959l-.667 1.154.693.4.667-1.155-.693-.4Zm1.146-1.186c.305.176.603.294.894.362l-.826.601-.935-.54.107-1.016c.204.218.456.417.76.593Z"/></svg>',
    zap:'<svg viewBox="0 0 11 11" fill="none"><path d="M3.836 5.631h-.204c-.66 0-.99 0-1.13-.217-.14-.217-.007-.52.261-1.126l.805-1.821c.244-.551.365-.826.602-.98.236-.155.536-.155 1.135-.155h.929c.728 0 1.092 0 1.23.238.137.238-.044.556-.405 1.192l-.477.838c-.18.316-.27.474-.268.603a.43.43 0 0 0 .235.408c.111.065.292.065.654.065.458 0 .687 0 .806.08a.43.43 0 0 1 .207.472c-.022.142-.176.312-.484.652L5.274 8.6c-.483.534-.725.801-.887.717-.163-.085-.085-.437.071-1.142l.305-1.381c.119-.537.178-.805.035-.984-.142-.179-.416-.179-.963-.179Z" stroke="#2C2C2C" stroke-width=".833" stroke-linejoin="round"/></svg>',
    mpin:'<svg viewBox="0 0 11 11" fill="none" stroke="#25282B" stroke-width=".833"><circle cx="5.337" cy="4.891" r="1.556"/><path d="M5.336.891c2.164 0 4 1.792 4 3.967 0 2.209-1.865 3.76-3.588 4.813a.84.84 0 0 1-.824 0C3.204 8.607 1.336 7.075 1.336 4.858c0-2.175 1.836-3.967 4-3.967Z"/></svg>',
    mark:'<svg viewBox="0 0 8 8" fill="#D83232"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.676 5.405 7.602 1.392 7.32 1.2 4.678 4.818 3.367 2.629.602 6.669l2.75-3.473 1.324 2.209Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.673 6.8 7.555 2.822l-.281-.193-2.599 3.584-1.311-2.19-2.091 2.586 2.077-2.019L4.673 6.8Z"/></svg>',
    level:'<svg viewBox="0 0 14 14" fill="none"><rect width="13.333" height="13.333" rx="2.667" fill="#F3F0ED"/><g fill="#D83232"><path fill-rule="evenodd" clip-rule="evenodd" d="m7.156 8.339 3.482-4.777-.334-.23-3.146 4.308-1.56-2.606-3.293 4.81 3.275-4.135 1.576 2.63Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="m7.157 9.996 3.43-4.735-.334-.23-3.094 4.267-1.56-2.607-2.49 3.078 2.472-2.403 1.576 2.63Z"/></g></svg>',
    cal:'<svg viewBox="0 0 14 14" fill="none" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round"><path d="M8.89 1.11v2.22M4.446 1.11v2.22M1.668 5.554h10M7.224 2.22H6.112c-2.095 0-3.143 0-3.793.652-.651.65-.651 1.698-.651 3.793v1.11c0 2.096 0 3.144.65 3.794.652.651 1.7.651 3.794.651h1.112c2.095 0 3.142 0 3.793-.65.65-.651.65-1.699.65-3.794v-1.11c0-2.096 0-3.144-.65-3.794-.651-.651-1.698-.651-3.793-.651Z"/><path d="M6.665 7.777h.005M6.665 10h.005M8.885 7.777h.005M4.445 7.777h.005M4.445 10h.005" stroke-width="1.333"/></svg>',
    pin:'<svg viewBox="0 0 14 14" fill="#2C2C2C"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.667 1.832C4.325 1.832 2.5 3.499 2.5 5.865c0 1.936.835 3.346 1.793 4.28.482.468.991.813 1.434 1.039.46.234.798.315.94.315.142 0 .479-.08.94-.315.442-.226.951-.571 1.433-1.04.958-.933 1.793-2.343 1.793-4.279 0-2.366-1.825-4.033-4.166-4.033ZM1.5 5.865C1.5 2.898 3.823.832 6.667.832s5.166 2.066 5.166 5.033c0 2.252-.98 3.91-2.095 4.996a6.2 6.2 0 0 1-1.678 1.214c-.512.26-1.017.424-1.393.424-.377 0-.882-.163-1.394-.424a6.2 6.2 0 0 1-1.677-1.214C2.48 9.774 1.5 8.117 1.5 5.865Zm5.167-.833c-.57 0-1.056.479-1.056 1.1 0 .621.486 1.1 1.056 1.1.57 0 1.055-.479 1.055-1.1 0-.621-.486-1.1-1.055-1.1Zm-2.056 1.1c0-1.146.907-2.1 2.056-2.1 1.148 0 2.055.954 2.055 2.1 0 1.147-.907 2.1-2.055 2.1-1.149 0-2.056-.953-2.056-2.1Z"/></svg>',
    money:'<svg viewBox="0 0 14 14" fill="none" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round"><path d="M8.887 2.777H4.443c-1.571 0-2.357 0-2.845.489-.489.488-.489 1.274-.489 2.845v1.11c0 1.572 0 2.358.489 2.846.488.488 1.274.488 2.845.488h4.444c1.571 0 2.357 0 2.845-.488.489-.488.489-1.274.489-2.845V6.11c0-1.571 0-2.357-.489-2.845-.488-.489-1.274-.489-2.845-.489Z"/><path d="M10.277 6.668h.005M3.055 6.668h.005" stroke-width="1.333"/><circle cx="6.667" cy="6.667" r="1.667"/></svg>',
    lock:'<svg viewBox="0 0 14 14" fill="none" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round"><rect x="2.2" y="5" width="8.9" height="7.2" rx="1.8"/><path d="M4.2 5V3.6a2.47 2.47 0 0 1 4.93 0V5M6.67 8.1v1.1"/></svg>',
    info:'<svg viewBox="0 0 16 16" fill="none"><rect width="16" height="16" rx="5.333" fill="#E6F6F2"/><g stroke="#00996D" stroke-width=".833" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.003" cy="8.003" r="4.444"/><path d="M8.004 9.781v-2M8.004 6.232v-.005"/></g></svg>',
    cross:'<svg viewBox="0 0 14 14" fill="none" stroke="#25282B" stroke-linecap="round"><path d="M3.33 3.33l6.67 6.67M10 3.33 3.33 10"/></svg>',
    chev:'<svg viewBox="0 0 8 8" fill="none"><path d="m3.664 2.664.931.931a.333.333 0 0 1 0 .471l-.931.931" stroke="#EC221F" stroke-linecap="round"/></svg>',
    plus:'<svg viewBox="0 0 12 12" fill="none" stroke="#52575C" stroke-width="1.3" stroke-linecap="round"><path d="M6 1.5v9M1.5 6h9"/></svg>'
  };
  var HF = 'assets/scoring/hero-faces/p';

  function status(){
    return '<div class="omh-status"><b>5:13 PM</b><span class="omh-status__ic">'+
      '<svg viewBox="0 0 12 12" fill="#000"><path d="M6 2.6c1.6 0 3.1.6 4.2 1.7l-.9.9A4.6 4.6 0 0 0 6 3.9 4.6 4.6 0 0 0 2.7 5.2l-.9-.9A6 6 0 0 1 6 2.6Zm0 2.6c.9 0 1.7.3 2.4 1l-.9.9a2 2 0 0 0-3 0l-.9-.9c.7-.7 1.5-1 2.4-1Zm0 2.6.9.9-.9.9-.9-.9.9-.9Z"/></svg>'+
      '<svg viewBox="0 0 12 12" fill="#000"><path d="M2.1 8.5h1.3V10H2.1zM4.3 6.8h1.3V10H4.3zM6.5 4.8h1.3V10H6.5zM8.7 2.1H10V10H8.7z"/></svg>'+
      '<svg viewBox="0 0 12 12" fill="none"><rect x="1.5" y="3" width="8.4" height="6" rx="1.4" stroke="#000"/><rect x="2.8" y="4.3" width="5.8" height="3.4" rx=".6" fill="#000"/><path d="M10.8 5v2" stroke="#000" stroke-linecap="round"/></svg>'+
      '</span></div><div class="omh-nav"><span class="omh-nav__back">'+I.back+'</span><span class="omh-nav__sp"></span><span class="omh-nav__ic">'+I.share+'</span></div>';
  }
  function player(face, name, rate, el){
    return '<span class="omh-pl" data-el="'+el+'"><img class="omh-av" src="'+HF+face+'.webp" alt="" width="38" height="38" decoding="async">'+
      '<span class="omh-badge" data-el="'+el+'-rate">'+I.mark+'<b>'+rate+'</b></span><span class="omh-name">'+name+'</span></span>';
  }
  function empty(el){ return '<span class="omh-pl omh-pl--open" data-el="'+el+'"><span class="omh-open">'+I.plus+'</span><span class="omh-name omh-name--mut">'+t.avail+'</span></span>'; }
  function row(icon, b, s){ return '<div class="omh-row"><span class="omh-row__ic">'+I[icon]+'</span><span class="omh-row__c"><b>'+b+'</b>'+(s ? '<span>'+s+'</span>' : '')+'</span></div>'; }

  function hero(){
    return h.page('omh', status(),
      '<div class="omh-head"><span class="omh-tag">Open Match</span><span class="omh-title">'+t.title+'</span>'+
        '<span class="omh-meta"><i>'+I.padel+'</i>'+t.padel+'<em></em><i>'+I.zap+'</i>'+t.comp+'<em></em><i>'+I.mpin+'</i>'+t.city+'</span></div>'+
      // Team A: Bayu + an open spot · VS · Team B: Gabriella + an open spot.
      '<div class="omh-teams">'+player(0, 'Bayu G.', '3.41', 'pa1')+// Team A's open spot also holds Gilberta (hidden): the hero fills it
        // when her request is accepted. Teams are mixed: Bayu + Gilberta vs
        // Gabriella + Fredy.
        '<span class="omh-slot" data-el="pa2">'+empty('pa2-open')+player(4, 'Gilberta L.', '3.12', 'pa2-pl')+'</span>'+
        '<b class="omh-vs">VS</b>'+player(1, 'Gabriella T.', '3.28', 'pb1')+
        // Team B's open spot holds Fredy (hidden): he joins Gabriella right
        // after Gilberta, matching the result card (Gabriella + Fredy).
        '<span class="omh-slot" data-el="pb2">'+empty('pb2-open')+player(3, 'Fredy R.', '3.05', 'pb2-pl')+'</span></div>'+
      '<span class="omh-req" data-el="req"><b data-el="req-n">2</b>&nbsp;'+t.req+I.chev+'</span>'+
      '<div class="omh-list">'+
        row('level', 'PadelLevels · 2.50 - 3.50', t.lvSub)+
        row('cal', t.date, '9:30 - 11:30')+
        row('pin', t.venue, t.court)+
        row('money', 'Rp75.000 <span>'+t.online+'</span>', 'Rp85.000 '+t.cash)+
        '<div class="omh-row omh-row--one"><span class="omh-row__ic">'+I.lock+'</span><span class="omh-row__c"><b>'+t.privacy+' <span>'+t.pub+'</span></b></span></div>'+
        '<div class="omh-desc"><b>'+t.desc+'</b><span>'+t.descV+'</span></div>'+
      '</div>',
      '<div class="omh-snack" data-el="snack"><span class="omh-snack__i">'+I.info+'</span><span class="omh-snack__t">'+t.snack+'</span><span class="omh-snack__x">'+I.cross+'</span></div>');
  }

  M.add({ cards: { 'om-hero': {pages:[hero()]} } });
})();
