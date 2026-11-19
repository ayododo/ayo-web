/* ==========================================================================
   AYO — Mini UI renderer + motion player
   Figma: Scoring key features, section 28109:21823. Flow order follows the
   Scoring staging board 28125:11094 (multi-page slots S01, S02, S03, M02,
   M04, B01: only Step 1 is drawn in Figma; the other steps play here).

   Usage:  <div class="mu-stage" data-mu="s02"></div>
   data-mu picks a CARD below: its pages, the part of the screen its static
   frame shows (to / toBottom) and its FLOW. Every card has a flow. A flow
   starts when the card is half in view: the screen starts at the top and
   scrolls down to the content the card is about, then the interaction
   plays. It loops with a pause and resets when the card leaves the view.
   With reduced motion (or no IntersectionObserver) the card shows the
   static Figma frame instead, already scrolled to its content.
   window.AyoMiniUI.refresh(root) re-measures cards inside a tab that was
   hidden when the page loaded.
   ========================================================================== */
(function(){
  'use strict';

  /* ---------- Data ---------- */
  var AV = 'assets/scoring/avatars/';
  var NAME = {fajar:'Fajar R.',maya:'Maya L.',bayu:'Bayu A.',tari:'Tari A.',raka:'Raka A.',sinta:'Sinta D.',dika:'Dika P.',nina:'Nina S.'};
  var FULL = {fajar:'Fajar Rahman',maya:'Maya Lestari',bayu:'Bayu Adi',tari:'Tari Ayu',raka:'Raka Aditya',sinta:'Sinta Dewi',dika:'Dika Putra',nina:'Nina Sari'};
  // Four Americano rounds to 24 points; totals add up (384 points, diff 0).
  var STANDINGS = [['fajar','4','3-0-1','+16','56'],['maya','4','2-2-0','+14','55'],['nina','4','2-0-2','+6','51'],['sinta','4','2-1-1','0','48'],
                   ['dika','4','1-2-1','0','48'],['raka','4','2-1-1','-2','47'],['tari','4','0-1-3','-16','40'],['bayu','4','0-1-3','-18','39']];

  /* ---------- Icons ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var I = {
    back: S+'<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>',
    close: S+'<path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>',
    // Share-new (Figma 28321:61464): a forward arrow, as in the app's nav bar.
    share: '<svg viewBox="284 16 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M297 24.5H297.5V20.7c0-.14.04-.28.12-.39.08-.12.19-.2.32-.26.13-.05.27-.06.41-.03.14.03.26.1.35.21l5.95 6.41c.22.24.34.55.34.87 0 .32-.12.63-.34.87l-5.95 6.41c-.1.1-.22.17-.36.21-.14.03-.28.02-.41-.03-.13-.05-.24-.14-.32-.26-.08-.12-.12-.25-.12-.39V30.5c-5.55 0-8.55 4.02-9.31 5.19-.06.1-.14.17-.24.23-.1.05-.21.08-.32.08-.08 0-.16-.02-.24-.05-.08-.03-.15-.08-.2-.14-.06-.06-.1-.13-.14-.2-.03-.08-.05-.16-.05-.24v-.87c0-5.52 4.48-10 10-10z"/></svg>',
    more: S+'<circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>',
    plus: S+'<path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    chev: S+'<path d="m9 6 6 6-6 6"/></svg>',
    cam: S+'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    download: S+'<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
    gear: S+'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    grip: '<svg class="mu-grip" viewBox="0 0 10 14" aria-hidden="true"><g fill="currentColor"><circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/><circle cx="2.5" cy="7" r="1.2"/><circle cx="7.5" cy="7" r="1.2"/><circle cx="2.5" cy="12" r="1.2"/><circle cx="7.5" cy="12" r="1.2"/></g></svg>'
  };
  // Share channels in their own colours (white glyphs drawn here, not the
  // brands' logo files).
  var W = '<svg viewBox="0 0 24 24" aria-hidden="true">';
  var CHANNELS = [
    ['WhatsApp', '#25d366', W+'<path fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" d="M12 4.5a7.5 7.5 0 0 0-6.5 11.2L4.5 19.5l3.9-1A7.5 7.5 0 1 0 12 4.5z"/><path fill="#fff" d="M9.3 8.6c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.6 1.4c.1.2 0 .4-.1.5l-.4.5c-.1.1-.2.3 0 .5.3.5.7 1 1.2 1.4.5.4 1 .7 1.5.9.2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.3.6c.2.1.3.2.3.3 0 .4-.1.9-.5 1.2-.4.3-1 .6-1.6.5-1-.2-2.2-.7-3.3-1.7-1.1-1-1.8-2.2-2-3.2-.1-.6.1-1.3.5-1.6z"/></svg>'],
    ['Facebook', '#1877f2', W+'<path fill="#fff" d="M13.3 20v-6.6h2.2l.3-2.6h-2.5V9.2c0-.7.2-1.3 1.3-1.3h1.3V5.6a18 18 0 0 0-2-.1c-2 0-3.3 1.2-3.3 3.4v1.9H8.4v2.6h2.2V20z"/></svg>'],
    ['Instagram', 'linear-gradient(45deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)', W+'<rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="16.3" cy="7.7" r="1" fill="#fff"/></svg>'],
    ['Copy Link', '#2c2c2c', W+'<g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.5 3.5 0 0 0 5 5l1-1"/></g></svg>']
  ];

  /* ---------- Small templates ---------- */
  function ico(n, el){ return '<span class="mu-ico"'+(el?' data-el="'+el+'"':'')+'>'+I[n]+'</span>'; }
  function av(k, size){ return '<img class="mu-av'+(size?' mu-av--'+size:'')+'" src="'+AV+k+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function pair(a, b){ return '<span class="mu-pair">'+av(a)+av(b)+'</span>'; }
  function head(inner){ return '<div class="mu-head">'+inner+'</div>'; }
  function page(name, top, body, extra){
    return '<div class="mu-page" data-page="'+name+'">'+top+'<div class="mu-body"><div class="mu-scroll">'+body+'</div></div>'+(extra||'')+'</div>';
  }
  function channels(){
    return '<div class="mu-chan">'+CHANNELS.map(function(c){ return '<span><i style="background:'+c[1]+'">'+c[2]+'</i>'+c[0]+'</span>'; }).join('')+'</div>';
  }
  function trophy(){
    return '<span class="mu-trophy" data-el="trophy" aria-hidden="true"><img class="mu-trophy__cup" src="assets/scoring/trophy-cup.svg" alt="" width="86" height="124">'+
      '<img class="mu-trophy__star s1" src="assets/scoring/trophy-star.svg" alt=""><img class="mu-trophy__star s2" src="assets/scoring/trophy-star.svg" alt=""><img class="mu-trophy__star s3" src="assets/scoring/trophy-star.svg" alt=""></span>';
  }

  /* ---------- Screens ---------- */
  function partnerRows(fmt, on){
    var rows = fmt === 'Custom' ? [['Singles · 1 vs 1',''],['Doubles · 2 vs 2','']] :
      [['Rotating Partner','Partners rotate every match.'],['Fixed Partner','Same partner in every match.'],['Mixed Partner','Mixed pairs from two groups.'],['Singles','Individuals compete 1 vs 1.']];
    if(fmt === 'Custom' && on === undefined) on = 'Doubles · 2 vs 2';
    return rows.map(function(r){ return '<div class="mu-li" data-el="p-'+r[0].replace(/\W/g,'')+'"><div class="mu-col mu-grow"><span class="mu-h">'+r[0]+'</span>'+(r[1]?'<span class="mu-s">'+r[1]+'</span>':'')+'</div><span class="mu-radio'+(r[0]===on?' is-on':'')+'"></span></div>'; }).join('');
  }
  function setup(o){
    o = o || {};
    var fmt = o.fmt || 'Americano', partner = o.partner || 'Rotating Partner';
    var sports = o.sports || ['Padel','Tennis','Badminton','Pickleball'];
    var chips = sports.map(function(s, i){ return '<span class="mu-chip'+(i===0?' is-on':'')+'" data-el="sport-'+s.replace(/\W/g,'')+'">'+s+'</span>'; }).join('');
    var tiles = ['Custom','Americano','Mexicano'].map(function(t){ return '<span class="mu-tile'+(t===fmt?' is-on':'')+'" data-el="tile-'+t+'">'+t+'</span>'; }).join('');
    return page('setup', head(ico('back')+'<span class="mu-head__title">Create GameTime</span>'),
      '<div class="mu-h">Sport Categories</div>'+
      '<div class="mu-chips" data-el="sports">'+chips+'</div>'+
      '<div class="mu-seg" data-el="mode" data-on="0"><span class="mu-seg__knob"></span><span class="mu-seg__i is-on" data-el="mode-0">Competitive</span><span class="mu-seg__i" data-el="mode-1">Casual</span></div>'+
      '<div class="mu-tint" data-el="info"><div class="mu-t mu-b">This is for your intense matches</div><div class="mu-s">Scores affect your skill rating.</div></div>'+
      '<div class="mu-tiles" data-el="formats">'+tiles+'</div>'+
      '<div class="mu-list" data-el="partners">'+partnerRows(fmt, fmt === 'Custom' ? undefined : partner)+'</div>'+
      '<div class="mu-card mu-pad mu-col" style="gap:4px" data-el="criteria"><span class="mu-h">Standings Ranking Criteria</span><span class="mu-s" style="font-size:10.5px">1&nbsp; Total Points<br>2&nbsp; Number of Wins<br>3&nbsp; Point Difference</span></div>'+
      '<div class="mu-row mu-row--between" data-el="courts"><span class="mu-h">Number of Courts</span><span class="mu-step"><i>–</i><span data-el="courts-n">1</span><span data-el="courts-plus">+</span></span></div>'+
      '<div class="mu-col" style="gap:6px" data-el="court-list"><div class="mu-field" data-el="court-1">Court 1</div></div>'+
      '<div class="mu-btn" data-el="continue">Continue</div>');
  }
  function selectSport(){
    var rows = ['Badminton','Squash','Padel','Table Tennis','Tennis','Pickleball'].map(function(s){
      return '<div class="mu-li" data-el="pick-'+s.replace(/\W/g,'')+'"><span class="mu-h mu-grow">'+s+'</span><span class="mu-radio'+(s==='Padel'?' is-on':'')+'"></span></div>'; }).join('');
    return page('sport', head(ico('back')+'<span class="mu-head__title">Sport Categories</span>'), '<div class="mu-list">'+rows+'</div>');
  }
  function participants(){
    return page('participants', head(ico('back')+'<span class="mu-head__title">Set Participants<span class="mu-head__sub">Americano · Rotating Partner</span></span>'),
      '<div class="mu-row mu-row--between"><span class="mu-h">Participants · <span data-el="count">1</span></span><span class="mu-link">Reset</span></div>'+
      '<div class="mu-s">A minimum of 4 players is required to create a match.</div>'+
      // No FAB or Create button here; an "Add" tile in the grid opens Add Participants.
      '<div class="mu-grid" data-el="grid"><span class="mu-person">'+av('fajar',40)+'Fajar R.</span>'+
      '<span class="mu-person" data-el="add-tile"><span class="mu-addtile">'+I.plus+'</span>Add</span></div>');
  }
  function addParticipants(){
    var rows = ['maya','bayu','tari','raka'].map(function(k){
      return '<div class="mu-li" data-el="pick-'+k+'">'+av(k,22)+'<div class="mu-col mu-grow"><span class="mu-h">'+FULL[k]+'</span><span class="mu-s">@'+FULL[k].toLowerCase().replace(' ','')+'</span></div><span class="mu-check"></span></div>'; }).join('');
    return page('add', head(ico('close')+'<span class="mu-head__title">Add Participants</span>'),
      '<div class="mu-field is-focus" data-el="search"><span data-el="q" class="mu-caret" style="color:#787373">Participant name</span></div>'+
      '<div class="mu-cap">RECENT PLAYERS</div><div class="mu-list">'+rows+'</div>',
      '<div class="mu-foot"><div class="mu-btn mu-btn--soft" data-el="add-btn">Add (<span data-el="add-n">0</span>)</div></div>');
  }
  function team(a, b, right, el){ return '<div class="mu-row" data-el="'+el+'">'+pair(a,b)+'<span class="mu-t mu-grow" style="font-weight:500">'+NAME[a]+' / '+NAME[b]+'</span>'+(right||'')+'</div>'; }
  function round(n, t1, t2, r1, r2, el){
    return '<div class="mu-col" style="gap:6px" data-el="'+(el||'round-'+n)+'"><span class="mu-cap">ROUND '+n+'</span><div class="mu-card mu-pad mu-col" style="gap:8px">'+
      '<div class="mu-row"><span class="mu-t mu-b mu-grow">Court A</span><span class="mu-link">Bench</span><span class="mu-link">Edit</span></div>'+
      team(t1[0],t1[1],r1,'t'+n+'a')+team(t2[0],t2[1],r2,'t'+n+'b')+'</div></div>';
  }
  var PLUS = function(el){ return '<span class="mu-pill"'+(el?' data-el="'+el+'"':'')+'>+ Score</span>'; };
  var SC = function(v, el){ return '<span class="mu-score"'+(el?' data-el="'+el+'"':'')+'>'+v+'</span>'; };
  function winner(){
    return '<div class="mu-card mu-pad mu-col mu-winner" style="gap:8px" data-el="winner"><span class="mu-pill" style="background:#f4f4f5;color:#17171a;align-self:flex-start">WINNER · AMERICANO</span>'+
      '<div class="mu-row">'+av('fajar',32)+'<div class="mu-col mu-grow"><span class="mu-h" style="font-size:12.5px">Fajar Rahman</span><span class="mu-s">@fajarrahman</span></div></div>'+trophy()+'</div>';
  }
  function table(){
    var rows = STANDINGS.map(function(r, i){
      return '<div class="mu-tr"><span'+(i===0?' style="font-weight:700"':'')+'>'+(i+1)+'&nbsp; '+FULL[r[0]]+'</span><span class="c-g">'+r[1]+'</span><span class="c-wtl">'+r[2]+'</span><span class="c-d">'+r[3]+'</span><span class="c-p">'+r[4]+'</span></div>'; }).join('');
    return '<div class="mu-table" data-el="table"><div class="mu-tr mu-tr--head"><span>PLAYERS</span><span class="c-g">G</span><span class="c-wtl">W-T-L</span><span class="c-d">Diff</span><span class="c-p">P</span></div>'+rows+'</div>';
  }
  function gd(o){
    o = o || {};
    var top = head(ico('back')+'<span class="mu-head__sp"></span>'+ico('share','share')+ico('more'));
    var people = ['fajar','maya','bayu','tari','raka','sinta'].map(function(k){ return av(k,22); }).join('');
    var seg = '<div class="mu-seg mu-seg--sm mu-grow" data-on="'+(o.tab||0)+'"><span class="mu-seg__knob"></span><span class="mu-seg__i'+(o.tab?'':' is-on')+'">Matches</span><span class="mu-seg__i'+(o.tab?' is-on':'')+'">Standings</span></div>';
    var body = '<div class="mu-title">Fun Padel Kawan AYO</div><div class="mu-s">Padel · 8 players · 10 Aug 2026</div>'+
      '<div class="mu-avs">'+people+'<span class="mu-s" style="font-weight:600">8/8 ›</span></div>'+
      '<div class="mu-t"><b>Americano</b> · Rotating Partner</div>'+
      '<div class="mu-row" data-el="tabs-row">'+seg+(o.tab ? '' : '<span class="mu-reshuffle" data-el="reshuffle">Re-Shuffle</span>')+'</div>';
    if(o.tab){ body += (o.winner?winner():'')+table(); }
    else {
      body += round(1, ['fajar','maya'], ['bayu','tari'], o.r1 ? SC(16,'s1a') : '<span data-el="s1a"></span>', o.r1 ? SC(8,'s1b') : PLUS('plus-1'));
      body += round(2, ['raka','sinta'], ['dika','nina'], '', PLUS());
      body += '<div data-el="round-slot"></div>';
      body += '<div class="mu-btns" data-el="footer"><span class="mu-btn mu-btn--line">End Session</span><span class="mu-btn mu-btn--soft" data-el="more-rounds">+ More Rounds</span></div>';
    }
    return page('gd', top, body);
  }
  function inputScore(){
    function side(a, b){ return '<div class="mu-col" style="flex:1;align-items:center;gap:5px"><span class="mu-pair">'+av(a,32)+av(b,32)+'</span><span class="mu-s">'+NAME[a]+' / '+NAME[b]+'</span></div>'; }
    return page('input', head(ico('close')+'<span class="mu-head__title">Round 1 · Court A</span><span class="mu-head__sp"></span><span class="mu-h" data-el="save">Save</span>'),
      '<div class="mu-row" style="align-items:flex-start;padding-top:6px">'+side('fajar','maya')+side('bayu','tari')+'</div>'+
      '<div class="mu-row"><div class="mu-scorebox" data-el="box-a">–<b data-el="val-a">0</b>+</div><div class="mu-scorebox" data-el="box-b">–<b data-el="val-b">0</b>+</div></div>'+
      '<div class="mu-h" style="margin-top:4px">Match Photos</div><div class="mu-photo"><span class="mu-ico">'+I.cam+'</span></div>');
  }
  function numpad(){
    var keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'].map(function(k){ return '<span data-el="key-'+(k||'none')+'">'+k+'</span>'; }).join('');
    return '<div class="mu-sheet" data-el="numpad"><span class="mu-sheet__bar"></span><div class="mu-field is-focus"><div class="mu-s" style="font-size:9px">Score · <span data-el="np-label">Fajar R. / Maya L.</span></div><span data-el="np-val" class="mu-caret mu-b" style="font-size:13px"></span></div><div class="mu-keys">'+keys+'</div><div class="mu-btn mu-btn--line" data-el="np-done">Done</div></div>';
  }
  function courtSheet(){
    return '<div class="mu-sheet" data-el="court-sheet"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Edit Court Name</span><div class="mu-field is-focus"><div class="mu-s" style="font-size:9px">Court Name</div><span data-el="court-input" class="mu-caret">Court 2</span></div><div class="mu-btn mu-btn--soft" data-el="court-done">Done</div></div>';
  }
  function moreDialog(){
    return '<div class="mu-dialog" data-el="dialog"><span class="mu-h" style="font-size:13px">Add More Rounds?</span><span class="mu-s">Add a new round with the same number of matches as the previous one.</span><div class="mu-btns" style="margin-top:6px"><span class="mu-btn mu-btn--line">Back</span><span class="mu-btn mu-btn--soft" data-el="confirm">Confirm</span></div></div>';
  }
  function shareType(el, cls){
    return '<div class="mu-sheet'+(cls||'')+'" data-el="'+el+'"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Share Standings</span>'+channels()+
      '<div class="mu-s" style="text-align:center">or</div><div class="mu-btns"><span class="mu-btn mu-btn--line">Feed</span><span class="mu-btn mu-btn--line" data-el="stories">Stories</span></div>'+
      '<div class="mu-btn mu-btn--line" data-el="pdf"><span data-el="pdf-label">Download Standings (PDF)</span></div></div>';
  }
  function shareSheets(){
    return '<div class="mu-sheet" data-el="share-options"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Share Activity</span>'+
      '<div class="mu-list"><div class="mu-li" data-el="opt-standings"><span class="mu-h mu-grow">Standings</span>'+ico('chev')+'</div><div class="mu-li"><span class="mu-h mu-grow">Matches</span>'+ico('chev')+'</div></div></div>'+
      shareType('share-type');
  }
  function story(){
    var rows = STANDINGS.slice(0,3).map(function(r, i){ return '<div class="mu-story__row"><span>'+(i+1)+'</span>'+av(r[0],22)+'<span>'+FULL[r[0]]+'</span><b>'+r[4]+'</b></div>'; }).join('');
    return '<div class="mu-page" data-page="story"><div class="mu-story"><img class="mu-story__logo" src="assets/icons/footer/logo.svg" alt="AYO" width="48" height="26">'+
      '<span class="mu-s" style="color:rgba(255,255,255,.7)">Fun Padel Kawan AYO · Americano</span>'+rows+
      '<span class="mu-s" style="color:rgba(255,255,255,.6);margin-top:auto">Yuk coba buat Americano di aplikasi AYO!</span></div></div>';
  }
  var CRIT = [['Total Points','Points earned during the match.'],['Number of Wins','Games won.'],['Point Difference','Points scored minus conceded.'],['Set Difference','Sets won minus lost.'],['Head-to-Head','Direct result between the two.']];
  function ranking(adv){
    var items = CRIT.slice();
    if(adv) items.unshift(['Advanced League System','Points from win / draw / loss.']);
    var steps = adv ? '<div class="mu-col" style="gap:8px" data-el="league-steps">'+[['Win Points',3,'win'],['Draw Points',1,'draw'],['Loss Points',0,'loss']].map(function(p){ return '<div class="mu-row mu-row--between"><span class="mu-t" style="color:#787373">'+p[0]+'</span><span class="mu-step"><i>–</i><span data-el="pt-'+p[2]+'">'+p[1]+'</span><span data-el="plus-'+p[2]+'">+</span></span></div>'; }).join('')+'</div>' : '';
    var list = items.map(function(it, i){ return '<div class="mu-crit" data-el="crit-'+i+'"><span class="mu-no">'+(i+1)+'</span><div class="mu-col mu-grow"><span class="mu-h">'+it[0]+'</span><span class="mu-s">'+it[1]+'</span></div><span data-el="grip-'+i+'">'+I.grip+'</span></div>'; }).join('');
    return page('rank', head(ico('back')+'<span class="mu-head__title">Standings Ranking Criteria</span>'),
      '<div class="mu-card mu-pad mu-col" style="gap:8px" data-el="league"><div class="mu-row mu-row--between"><span class="mu-h">Advanced League System</span><span class="mu-toggle'+(adv?' is-on':'')+'" data-el="league-toggle"></span></div>'+steps+'</div>'+
      '<div class="mu-s">Hold &amp; drag to change order.</div><div data-el="crit">'+list+'</div><div class="mu-btn" data-el="save">Save</div>');
  }
  function toast(){
    return '<div class="mu-toast" data-el="toast"><span class="mu-toast__pdf">PDF</span><span class="mu-col"><b>Standings_FunPadel.pdf</b><span>Saved to Downloads</span></span></div>';
  }

  /* ---------- Hero (Figma "Hero illustration · Standings" 28337:306) ----------
     The activity's GameTime tab with its own players (photos from the hero
     design, assets/scoring/hero-faces/p0–p7). Standings first; the motion
     switches to Matches and back. The floating cards around the phone live
     in scoring-id.html; the hero flow below drives them too. */
  var HF = 'assets/scoring/hero-faces/p';
  var HN = ['Bayu G.','Gabriella T.','Budi S.','Fredy R.','Gilberta L.','Lagerta R.','Gilang K.','Leo V.'];
  var HS_ROWS = [['Bayu G.','4','4-0-0','+24','52'],['Budi S.','4','3-0-1','+12','49'],['Fredy R.','4','2-1-1','+5','46'],['Gabriella T.','4','2-0-2','+2','42'],
                 ['Gilberta L.','4','1-2-1','-3','36'],['Gilang K.','4','1-1-2','-8','32'],['Lagerta R.','4','0-2-2','-12','29'],['Leo V.','4','0-0-4','-20','27']];
  function hav(i, size){ return '<img class="mu-av'+(size?' mu-av--'+size:'')+'" src="'+HF+i+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function hteam(a, b, right){ return '<div class="mu-row"><span class="mu-pair">'+hav(a)+hav(b)+'</span><span class="mu-t mu-grow" style="font-weight:500">'+HN[a]+' / '+HN[b]+'</span>'+(right||'')+'</div>'; }
  function hround(n, t1, t2, r1, r2){
    return '<div class="mu-col" style="gap:6px"><span class="mu-cap">ROUND '+n+'</span><div class="mu-card mu-pad mu-col" style="gap:8px">'+
      '<div class="mu-row"><span class="mu-t mu-b mu-grow">Court A</span><span class="mu-link">Bench</span><span class="mu-link">Edit</span></div>'+hteam(t1[0],t1[1],r1)+hteam(t2[0],t2[1],r2)+'</div></div>';
  }
  function heroPage(){
    var people = [0,1,2,3,4,5].map(function(i){ return hav(i,22); }).join('');
    var rows = HS_ROWS.map(function(r, i){ return '<div class="mu-tr"><span'+(i===0?' style="font-weight:700"':'')+'>'+(i+1)+'&nbsp; '+r[0]+'</span><span class="c-g">'+r[1]+'</span><span class="c-wtl">'+r[2]+'</span><span class="c-d">'+r[3]+'</span><span class="c-p">'+r[4]+'</span></div>'; }).join('');
    return page('hero', head(ico('back')+'<span class="mu-head__sp"></span>'+ico('share')+ico('more')),
      '<div class="mu-title" style="font-size:14px">Fun Padel AYO Chapter Jakarta Area</div>'+
      '<div class="mu-s">Competitive · Padel · Jakarta</div>'+
      '<div class="mu-avs">'+people+'<span class="mu-s" style="font-weight:600">8/8 ›</span></div>'+
      '<div class="mu-tabs" style="margin:0 -12px"><span>Details</span><span>Discussion</span><span class="is-on">GameTime<span class="mu-new-badge">NEW</span></span></div>'+
      '<div class="mu-row mu-row--between"><span class="mu-t"><b>Americano</b> · Rotating Partner</span><span class="mu-ico">'+I.gear+'</span></div>'+
      '<div class="mu-row" data-el="h-tabs-row"><div class="mu-seg mu-seg--sm" data-el="h-seg" data-on="1" style="width:132px"><span class="mu-seg__knob"></span><span class="mu-seg__i" data-el="h-matches-tab">Matches</span><span class="mu-seg__i is-on" data-el="h-standings-tab">Standings</span></div><span class="mu-head__sp"></span><span class="mu-swap">↔</span></div>'+
      '<div data-el="h-standings"><div class="mu-table"><div class="mu-tr mu-tr--head"><span>PLAYERS</span><span class="c-g">G</span><span class="c-wtl">W-T-L</span><span class="c-d">Diff</span><span class="c-p">P</span></div>'+rows+'</div></div>'+
      '<div class="mu-col" style="gap:9px;display:none" data-el="h-matches">'+
        hround(1, [0,1], [2,3], SC(16), SC(8))+hround(2, [4,6], [5,7], SC(13), SC(11))+hround(3, [0,5], [2,7], '', PLUS())+
        '<div class="mu-btns"><span class="mu-btn mu-btn--line">End Session</span><span class="mu-btn">+ More Rounds</span></div></div>');
  }

  /* ---------- Cards: pages (first = static frame), scroll target, flow ---------- */
  var CARDS = {
    hero: {pages:[heroPage()], flow:'hero'},
    f01: {pages:[setup({fmt:'Americano'})], to:'formats', flow:'f01'},
    f02: {pages:[setup({fmt:'Mexicano'})], to:'formats', flow:'f02'},
    f03: {pages:[setup({fmt:'Custom'})], to:'formats', flow:'f03'},
    f04: {pages:[setup({fmt:'Americano', partner:'Fixed Partner'})], to:'partners', flow:'f04'},
    s01: {pages:[setup({sports:['Padel','Tennis','Lainnya ›']}), selectSport()], flow:'s01'},
    s02: {pages:[setup()], to:'criteria', extra:courtSheet, flow:'s02'},
    s03: {pages:[participants(), addParticipants()], flow:'s03'},
    s04: {pages:[ranking(false)], flow:'s04'},
    m01: {pages:[gd()], to:'round-1', flow:'m01'},
    m02: {pages:[gd(), inputScore()], to:'round-1', extra:numpad, flow:'m02'},
    m03: {pages:[gd()], to:'tabs-row', flow:'m03'},
    m04: {pages:[gd({r1:true})], toBottom:'footer', extra:moreDialog, flow:'m04'},
    k01: {pages:[gd({tab:1})], to:'table', flow:'k01'},
    k02: {pages:[ranking(false)], to:'crit', margin:24, flow:'k02'},
    k03: {pages:[ranking(true)], flow:'k03'},
    b01: {pages:[gd({tab:1, winner:true}), story()], extra:shareSheets, flow:'b01'},
    b02: {pages:[gd({tab:1, winner:true})], extra:function(){ return shareType('share-type')+toast(); }, open:'share-type', flow:'b02'},
    b03: {pages:[gd({tab:1, winner:true})], to:'winner', margin:40, flow:'b03'}
  };

  /* ---------- Build + placement ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOTION = !reduce && 'IntersectionObserver' in window;

  function build(stage){
    var c = CARDS[stage.dataset.mu]; if(!c) return;
    var inner = c.html ? c.html() : c.pages.join('') + (c.extra ? c.extra() : '');
    stage.innerHTML = '<div class="mu-phone" aria-hidden="true"><div class="mu-screen">'+inner+'<div class="mu-dim" data-el="dim"></div><span class="mu-tap"></span></div><span class="mu-cover"></span></div>';
    var first = stage.querySelector('.mu-page'); if(first) first.classList.add('is-active');
    // A card that is about a sheet shows it open in its static frame.
    if(c.open){ stage.querySelector('[data-el="'+c.open+'"]').classList.add('is-on'); stage.querySelector('[data-el="dim"]').classList.add('is-on'); }
    stage._mu = {card:c, initial: stage.querySelector('.mu-screen').innerHTML};
    place(stage, true);
    prep(stage);
  }
  function scaleOf(stage){ var p = stage.querySelector('.mu-phone'); return parseFloat(getComputedStyle(p).getPropertyValue('--mu-scale')) || 1; }
  function visibleBody(stage, pg){
    var phone = stage.querySelector('.mu-phone'), s = scaleOf(stage);
    var hd = pg.querySelector('.mu-head');
    return (stage.clientHeight - phone.offsetTop) / s - 10 - (hd ? hd.offsetHeight : 0);
  }
  // Where the card's content sits: near the top of the visible part of the
  // screen (to), or with its bottom at the bottom edge (toBottom).
  function targetY(stage){
    var c = stage._mu.card, pg = stage.querySelector('.mu-page'), sc = pg && pg.querySelector('.mu-scroll');
    if(!sc) return 0;
    if(c.to){ var t = sc.querySelector('[data-el="'+c.to+'"]'); if(t) return Math.max(0, t.offsetTop - (c.margin != null ? c.margin : 6)); }
    if(c.toBottom){ var b = sc.querySelector('[data-el="'+c.toBottom+'"]'); if(b) return Math.max(0, b.offsetTop + b.offsetHeight - visibleBody(stage, pg) + 10); }
    return 0;
  }
  // With motion the screen rests at the top and the flow scrolls it down;
  // without, it rests on the content (the Figma frame).
  function place(stage, instant){
    if(!stage._mu) return;
    measure(stage);
    var sc = stage.querySelector('.mu-page .mu-scroll'); if(!sc) return;
    setY(sc, MOTION ? 0 : targetY(stage), instant);
  }
  // Visible part of the screen in screen px; sheets end at its bottom edge.
  function measure(stage){
    var phone = stage.querySelector('.mu-phone'), scr = stage.querySelector('.mu-screen');
    if(!stage.clientHeight) return;
    var vis = Math.min(scr.offsetHeight, (stage.clientHeight - phone.offsetTop) / scaleOf(stage) - 10);
    scr.style.setProperty('--mu-vis-h', vis+'px');
    scr.style.setProperty('--mu-sheet-bottom', Math.max(0, scr.offsetHeight - vis)+'px');
  }
  function setY(sc, y, instant, dur){
    if(instant) sc.classList.add('no-anim');
    sc.style.transitionDuration = dur ? dur+'ms' : '';
    sc.style.setProperty('--mu-y', (-y)+'px');
    if(instant){ sc.offsetHeight; sc.classList.remove('no-anim'); }
  }

  /* ---------- Motion ---------- */
  var STOP = {};
  function Player(stage){ this.stage = stage; this.run = 0; }
  Player.prototype.start = function(){
    var self = this, id = ++this.run, flow = FLOWS[this.stage._mu.card.flow];
    var api = makeApi(this, id);
    // Between loops the screen fades out under a white cover, resets to its
    // opening state and fades back in, so the end of one run never jumps
    // straight into the start of the next.
    var cover = this.stage.querySelector('.mu-cover');
    (function loop(){
      api.wait(700).then(function(){ return flow(api); })
        .then(function(){ return api.wait(2200); })
        .then(function(){ cover.classList.add('is-on'); return api.wait(320); })
        .then(function(){ self.reset(); return api.wait(150); })
        .then(function(){ cover.classList.remove('is-on'); return api.wait(450); })
        .then(loop, function(e){ if(e !== STOP) throw e; });
    })();
  };
  Player.prototype.stop = function(){ this.run++; this.reset(); this.stage.querySelector('.mu-cover').classList.remove('is-on'); };
  Player.prototype.reset = function(){
    var scr = this.stage.querySelector('.mu-screen');
    scr.innerHTML = this.stage._mu.initial;
    scr.querySelectorAll('.mu-page').forEach(function(p){ p.classList.add('no-anim'); });
    place(this.stage, true);
    prep(this.stage);
    scr.offsetHeight;
    scr.querySelectorAll('.mu-page').forEach(function(p){ p.classList.remove('no-anim'); });
  };
  // Opening state of a flow (when it differs from the static Figma frame),
  // applied as soon as the card is built and after every reset.
  function prep(stage){
    var f = PREP[stage._mu.card.flow];
    if(MOTION && f) f(makeApi({stage:stage, run:0}, 0));
  }

  function makeApi(player, id){
    var stage = player.stage;
    function scr(){ return stage.querySelector('.mu-screen'); }
    function alive(){ if(player.run !== id) throw STOP; }
    function point(t){
      var b = scr().getBoundingClientRect(), s = b.width / scr().offsetWidth, a = t.getBoundingClientRect();
      return {x:(a.left + a.width/2 - b.left)/s, y:(a.top + a.height/2 - b.top)/s};
    }
    var api = {
      stage: stage,
      wait: function(ms){ return new Promise(function(res, rej){ setTimeout(function(){ player.run === id ? res() : rej(STOP); }, ms); }); },
      el: function(n){ return scr().querySelector('[data-el="'+n+'"]'); },
      // A touch: the marker appears on the element, presses, and lifts. It
      // never travels between targets, so it always sits on what is touched.
      tap: function(n, hold){
        alive();
        var t = typeof n === 'string' ? api.el(n) : n, mk = scr().querySelector('.mu-tap'); if(!t) return api.wait(0);
        var p = point(t);
        mk.className = 'mu-tap'; mk.style.left = p.x+'px'; mk.style.top = p.y+'px';
        mk.offsetHeight; mk.classList.add('is-on');
        // Resolves at the moment of the press, so whatever the touch does
        // (select, open, navigate) happens right then, not after the finger
        // lifts. The marker lifts and fades on its own a moment later.
        return api.wait(150).then(function(){
          mk.classList.add('is-down');
          if(hold) return api.wait(hold);
          var tok = mk._tok = (mk._tok || 0) + 1;
          setTimeout(function(){ if(mk._tok === tok) mk.classList.remove('is-down', 'is-on'); }, 240);
        });
      },
      hideTap: function(){ var mk = scr().querySelector('.mu-tap'); mk.classList.remove('is-down', 'is-on'); },
      go: function(name){
        alive();
        var cur = scr().querySelector('.mu-page.is-active'), nxt = scr().querySelector('[data-page="'+name+'"]');
        if(cur){ cur.classList.remove('is-active'); cur.classList.add('is-behind'); }
        nxt.classList.remove('is-behind'); nxt.classList.add('is-active');
        return api.wait(600);
      },
      back: function(name){
        alive();
        var cur = scr().querySelector('.mu-page.is-active'), prv = scr().querySelector('[data-page="'+name+'"]');
        if(cur) cur.classList.remove('is-active');
        prv.classList.remove('is-behind'); prv.classList.add('is-active');
        return api.wait(600);
      },
      sheet: function(n, on){ alive(); api.el('dim').classList.toggle('is-on', on); api.el(n).classList.toggle('is-on', on); return api.wait(520); },
      type: function(n, text, speed){
        var el = api.el(n), i = 0;
        el.style.color = '';
        function step(){ alive(); el.textContent = text.slice(0, ++i); return i < text.length ? api.wait(speed || 140).then(step) : api.wait(250); }
        el.textContent = ''; return step();
      },
      // Scroll the active page: to a y, to an element (top), or to the card's own target.
      scroll: function(y, dur){
        alive();
        var sc = scr().querySelector('.mu-page.is-active .mu-scroll');
        setY(sc, Math.max(0, Math.min(y, api.maxY())), false, dur || 900);   // never past the end of the content
        return api.wait((dur || 900) + 150);
      },
      scrollTo: function(n, margin, dur){ var t = api.el(n); return api.scroll(t.offsetTop - (margin == null ? 6 : margin), dur); },
      scrollBottom: function(n, dur){
        var t = api.el(n), pg = t.closest('.mu-page');
        return api.scroll(t.offsetTop + t.offsetHeight - visibleBody(stage, pg) + 10, dur);
      },
      jump: function(y){ setY(scr().querySelector('.mu-page.is-active .mu-scroll'), y, true); },
      toTarget: function(){ return api.wait(300).then(function(){ return api.scroll(targetY(stage), 1100); }); },
      maxY: function(){ var pg = scr().querySelector('.mu-page.is-active'), sc = pg.querySelector('.mu-scroll'); return Math.max(0, sc.offsetHeight - visibleBody(stage, pg)); },
      select: function(group, item){ [].forEach.call(api.el(group).children, function(c){ c.classList.toggle('is-on', c === api.el(item)); }); },
      radio: function(row){ var l = api.el(row).parentNode; [].forEach.call(l.querySelectorAll('.mu-radio'), function(r){ r.classList.remove('is-on'); }); api.el(row).querySelector('.mu-radio').classList.add('is-on'); },
      // Press and hold a row's grip, carry it up `by` places, drop it.
      drag: function(listEl, from, by){
        alive();
        var list = api.el(listEl), rows = [].slice.call(list.children), row = rows[from];
        var mk = scr().querySelector('.mu-tap'), grip = row.querySelector('[data-el^="grip"]');
        return api.tap(grip, 380).then(function(){
          row.classList.add('is-drag');
          var lift = 0; for(var i = from - by; i < from; i++){ lift += rows[i].offsetHeight; rows[i].style.transform = 'translateY('+row.offsetHeight+'px)'; }
          row.style.transform = 'translateY('+(-lift)+'px)';
          // Hand the marker to the row (at the grip) so it rides up with it.
          mk.style.left = (grip.offsetLeft + grip.offsetWidth/2)+'px'; mk.style.top = (grip.offsetTop + grip.offsetHeight/2)+'px'; row.appendChild(mk);
          return api.wait(900);
        }).then(function(){
          rows.forEach(function(r){ r.classList.add('no-move'); r.style.transform = ''; });
          list.insertBefore(row, rows[from - by]);
          [].forEach.call(list.children, function(r, i){ r.querySelector('.mu-no').textContent = String(i + 1); });
          list.offsetHeight; rows.forEach(function(r){ r.classList.remove('no-move'); });
          api.hideTap(); scr().appendChild(mk); return api.wait(350);
        }).then(function(){ row.classList.remove('is-drag'); return api.wait(200); });
      }
    };
    return api;
  }

  function on(el, cls, v){ el.classList.toggle(cls, v !== false); }
  // Opening state: scrolled to the formats, which are not shown yet.
  function formatPrep(a){
    [].forEach.call(a.el('formats').children, function(t){ t.classList.remove('is-on'); t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; });
    a.el('partners').style.opacity = '0';
    a.jump(targetY(a.stage));
  }
  function formatFlow(a, fmt, partner){
    var tiles = [].slice.call(a.el('formats').children), parts = a.el('partners');
    var p = a.wait(300);
    tiles.forEach(function(t){ p = p.then(function(){ t.style.opacity = ''; t.style.transform = ''; return a.wait(140); }); });
    return p.then(function(){ return a.wait(350); })
      .then(function(){ return a.tap('tile-'+fmt); })
      .then(function(){ a.select('formats', 'tile-'+fmt); parts.innerHTML = partnerRows(fmt, null); return a.wait(250); })
      .then(function(){ parts.style.opacity = ''; return a.wait(700); })
      .then(function(){ return a.tap(partner); })
      .then(function(){ a.radio(partner); return a.wait(600); })
      // Close by scrolling on down the screen to Continue, and stop there.
      .then(function(){ return a.scroll(a.maxY(), 1600); });
  }
  var PREP = {f01: formatPrep, f02: formatPrep, f03: formatPrep,
    // K03 opens with the league system off: points hidden and at 0, and no
    // "Advanced League System" criterion yet (kept aside to re-insert).
    k03: function(a){
      a.el('league-toggle').classList.remove('is-on');
      a.el('league-steps').style.display = 'none';
      ['win','draw','loss'].forEach(function(k){ a.el('pt-'+k).textContent = '0'; });
      var row = a.el('crit-0'); if(row){ a.stage._advRow = row; row.parentNode.removeChild(row); }   // safe to run twice
      [].forEach.call(a.el('crit').children, function(r, i){ r.querySelector('.mu-no').textContent = String(i + 1); });
    },
    // F04 opens scrolled to the formats, Americano chosen, no pairing yet.
    f04: function(a){ a.select('formats', 'tile-Americano'); a.el('partners').innerHTML = partnerRows('Americano', null); a.jump(a.el('formats').offsetTop - 6); }};
  var FLOWS = {
    // Format cards (Americano, Mexicano, Custom): the format area starts
    // empty, the three formats appear, one is picked, then its pairing
    // options appear with none chosen and one is picked.
    f01: function(a){ return formatFlow(a, 'Americano', 'p-RotatingPartner'); },
    f02: function(a){ return formatFlow(a, 'Mexicano', 'p-FixedPartner'); },
    f03: function(a){ return formatFlow(a, 'Custom', 'p-Doubles2vs2'); },
    // F04 · Tipe pasangan: opens on Americano with no pairing chosen; taps
    // through Rotating, Fixed and Mixed, scrolls a little so Singles is fully
    // in view before it is picked, then scrolls on down to Continue.
    f04: function(a){
      function pick(id){ return a.tap(id).then(function(){ a.radio(id); return a.wait(450); }); }
      return a.wait(300)
        .then(function(){ return pick('p-RotatingPartner'); })
        .then(function(){ return pick('p-FixedPartner'); })
        .then(function(){ return pick('p-MixedPartner'); })
        .then(function(){ return a.scrollBottom('p-Singles', 700); })
        .then(function(){ return pick('p-Singles'); })
        .then(function(){ return a.wait(300); })
        .then(function(){ return a.scroll(a.maxY(), 1500); });
    },
    // S01 · Cabor & mode: Setup → Select Sport → back with Squash → Casual.
    s01: function(a){
      return a.tap('sport-Lainnya').then(function(){ return a.go('sport'); })
        .then(function(){ return a.tap('pick-Squash'); })
        .then(function(){ a.el('pick-Padel').querySelector('.mu-radio').classList.remove('is-on'); on(a.el('pick-Squash').querySelector('.mu-radio'), 'is-on'); return a.wait(450); })
        .then(function(){ var c = a.el('sport-Lainnya'), p = a.el('sport-Padel'); p.classList.remove('is-on'); c.textContent = 'Squash'; on(c, 'is-on'); return a.back('setup'); })
        .then(function(){ return a.tap('mode-1'); })
        .then(function(){ a.el('mode').dataset.on = '1'; a.el('mode-0').classList.remove('is-on'); on(a.el('mode-1'), 'is-on');
          a.el('info').innerHTML = '<div class="mu-t mu-b">Just for fun</div><div class="mu-s">Scores won\'t affect your skill rating.</div>'; return a.wait(300); });
    },
    // S02 · Lapangan: scroll to courts, + court → Court 2 → Edit Court Name → renamed.
    s02: function(a){
      return a.toTarget().then(function(){ return a.tap('courts-plus'); }).then(function(){
          a.el('courts-n').textContent = '2';
          var row = document.createElement('div'); row.className = 'mu-field mu-new'; row.dataset.el = 'court-2'; row.textContent = 'Court 2';
          a.el('court-list').appendChild(row); return a.wait(400); })
        .then(function(){ return a.scrollTo('courts', 40, 600); })
        .then(function(){ return a.tap('court-2'); })
        .then(function(){ return a.sheet('court-sheet', true); })
        .then(function(){ return a.type('court-input', 'Blue Court', 110); })
        .then(function(){ return a.tap('court-done'); })
        .then(function(){ a.el('court-2').textContent = 'Blue Court'; return a.sheet('court-sheet', false); });
    },
    // S03 · Pemain & tim: + → Add Participants (pick 3) → 4 players, Create on.
    s03: function(a){
      var picks = ['maya','bayu','tari'], n = 0;
      function pick(k){ return a.tap('pick-'+k).then(function(){ on(a.el('pick-'+k).querySelector('.mu-check'), 'is-on'); a.el('add-n').textContent = String(++n); return a.wait(200); }); }
      return a.tap('add-tile').then(function(){ return a.go('add'); })
        // Maya is in view; scroll the list down a little so Bayu and Tari clear the Add button.
        .then(function(){ return pick(picks[0]); })
        .then(function(){ return a.scrollTo('pick-bayu', 6, 700); })
        .then(function(){ return pick(picks[1]); }).then(function(){ return pick(picks[2]); })
        .then(function(){ return a.tap('add-btn'); })
        .then(function(){
          var g = a.el('grid');
          var addTile = a.el('add-tile');
          picks.forEach(function(k){ var s = document.createElement('span'); s.className = 'mu-person mu-new'; s.innerHTML = av(k,40)+NAME[k]; g.insertBefore(s, addTile); });
          a.el('count').textContent = '4'; return a.back('participants'); });
    },
    // S04 · Aturan peringkat: drag Number of Wins above Total Points.
    s04: function(a){ return a.scrollTo('crit', 30, 800).then(function(){ return a.drag('crit', 1, 1); }); },
    // M01 · Ronde: scroll through the rounds to the footer and back.
    m01: function(a){
      return a.toTarget().then(function(){ return a.wait(600); })
        .then(function(){ return a.scrollTo('round-2', 6, 1100); }).then(function(){ return a.wait(500); })
        .then(function(){ return a.scrollBottom('footer', 900); }).then(function(){ return a.wait(700); })
        .then(function(){ return a.scrollTo('round-1', 6, 1100); });
    },
    // M02 · Input skor: + Score → Input Score → numpad 16 → numpad 8 → Save.
    m02: function(a){
      function numpadFor(box, label, digits, val){
        return a.tap(box).then(function(){ on(a.el(box), 'is-focus'); a.el('np-label').textContent = label; a.el('np-val').textContent = ''; return a.sheet('numpad', true); })
          .then(function(){ var p = Promise.resolve(); digits.split('').forEach(function(d){ p = p.then(function(){ return a.tap('key-'+d); }).then(function(){ a.el('np-val').textContent += d; return a.wait(260); }); }); return p; })
          .then(function(){ return a.tap('np-done'); })
          .then(function(){ a.el(val).textContent = digits; a.el(box).classList.remove('is-focus'); return a.sheet('numpad', false); });
      }
      return a.toTarget().then(function(){ return a.tap('plus-1'); }).then(function(){ return a.go('input'); })
        .then(function(){ return numpadFor('box-a', 'Fajar R. / Maya L.', '16', 'val-a'); })
        .then(function(){ return numpadFor('box-b', 'Bayu A. / Tari A.', '8', 'val-b'); })
        .then(function(){ return a.tap('save'); })
        .then(function(){ a.el('s1a').outerHTML = SC(16,'s1a'); a.el('plus-1').outerHTML = SC(8,'s1b'); return a.back('gd'); });
    },
    // M03 · Penyesuaian: Re-Shuffle is highlighted and the pairs are redrawn.
    m03: function(a){
      var next = [['t1a','fajar','sinta'],['t1b','raka','tari'],['t2a','maya','dika'],['t2b','bayu','nina']];
      return a.toTarget().then(function(){ return a.tap('reshuffle'); })
        .then(function(){ on(a.el('reshuffle'), 'is-hl'); next.forEach(function(n){ on(a.el(n[0]), 'is-shuffling'); }); return a.wait(450); })
        .then(function(){ next.forEach(function(n){ var row = a.el(n[0]); row.querySelector('.mu-pair').outerHTML = pair(n[1], n[2]); row.querySelector('.mu-grow').textContent = NAME[n[1]]+' / '+NAME[n[2]]; }); return a.wait(80); })
        .then(function(){ next.forEach(function(n){ a.el(n[0]).classList.remove('is-shuffling'); }); return a.wait(700); })
        .then(function(){ a.el('reshuffle').classList.remove('is-hl'); return a.wait(200); });
    },
    // M04 · Kendali sesi: down to the footer, + More Rounds → confirm → Round 3.
    m04: function(a){
      return a.toTarget().then(function(){ return a.tap('more-rounds'); }).then(function(){ return a.sheet('dialog', true); })
        .then(function(){ return a.tap('confirm'); })
        .then(function(){ a.sheet('dialog', false);
          var slot = a.el('round-slot'); slot.innerHTML = round(3, ['fajar','nina'], ['dika','maya'], '', PLUS(), 'round-3'); slot.firstChild.classList.add('mu-new');
          return a.wait(500); })
        .then(function(){ return a.scrollBottom('footer', 900); });
    },
    // K01 · Klasemen: scroll down the table and back.
    k01: function(a){
      return a.toTarget().then(function(){ return a.wait(700); })
        .then(function(){ return a.scroll(a.maxY(), 1400); }).then(function(){ return a.wait(900); })
        .then(function(){ return a.scroll(targetYOf(a), 1100); });
    },
    // K02 · Aturan fleksibel: drag Point Difference above Number of Wins.
    k02: function(a){ return a.toTarget().then(function(){ return a.drag('crit', 2, 1); }); },
    // K03 · Poin liga: set the league points, then scroll down the criteria.
    // K03 · Poin liga: switch Advanced League System on, the points rows
    // appear at 0; Win goes to 3 and Draw to 1 (one tap each step), then the
    // screen scrolls down the criteria to Save.
    k03: function(a){
      function plus(k, times){ var p = Promise.resolve(); for(var i = 0; i < times; i++) p = p.then(function(){ return a.tap('plus-'+k); }).then(function(){ var v = a.el('pt-'+k); v.textContent = String(+v.textContent + 1); return a.wait(260); }); return p; }
      return a.wait(300).then(function(){ return a.tap('league-toggle'); })
        .then(function(){
          on(a.el('league-toggle'), 'is-on');
          var st = a.el('league-steps'); st.style.display = ''; st.classList.add('mu-new');
          var list = a.el('crit'), adv = a.stage._advRow; if(adv){ list.insertBefore(adv, list.firstChild); adv.classList.add('mu-new'); }
          [].forEach.call(list.children, function(r, i){ r.querySelector('.mu-no').textContent = String(i + 1); });
          return a.wait(500); })
        .then(function(){ return plus('win', 3); })
        .then(function(){ return plus('draw', 1); })
        .then(function(){ return a.wait(500); })
        .then(function(){ return a.scroll(a.maxY(), 1600); });
    },
    // B01 · Bagikan: share → Share Activity → Standings → Share Standings → Stories.
    b01: function(a){
      return a.tap('share').then(function(){ return a.sheet('share-options', true); })
        .then(function(){ return a.tap('opt-standings'); })
        .then(function(){ a.el('share-options').classList.remove('is-on'); a.el('share-type').classList.add('is-on'); return a.wait(600); })
        .then(function(){ return a.tap('stories'); })
        .then(function(){ a.el('share-type').classList.remove('is-on'); a.el('dim').classList.remove('is-on'); return a.go('story'); });
    },
    // B02 · PDF: Download → progress → saved toast.
    b02: function(a){
      var sh = a.el('share-type'); sh.classList.add('no-anim'); sh.classList.remove('is-on'); a.el('dim').classList.remove('is-on'); sh.offsetHeight; sh.classList.remove('no-anim');
      return a.wait(500).then(function(){ return a.sheet('share-type', true); }).then(function(){ return a.wait(500); })
        .then(function(){ return a.tap('pdf'); }).then(function(){ on(a.el('pdf'), 'is-busy'); a.el('pdf-label').textContent = 'Downloading…'; return a.wait(1100); })
        .then(function(){ a.el('pdf').classList.remove('is-busy'); a.el('pdf-label').innerHTML = I.download.replace('<svg','<svg class="mu-inline"')+' Downloaded'; on(a.el('toast'), 'is-on'); return a.wait(1800); })
        .then(function(){ a.el('toast').classList.remove('is-on'); return a.wait(300); });
    },
    // Hero: scroll the standings, switch to Matches (the toast pops and the
    // PadelLevels rating ticks up as the score lands), scroll the rounds,
    // then back to Standings.
    hero: function(a){
      var art = a.stage.closest('[data-hero-art]');
      var toast = art && art.querySelector('[data-hf="toast"]'), pl = art && art.querySelector('[data-hf="pl-val"]'), plUp = art && art.querySelector('[data-hf="pl-up"]'), score = art && art.querySelector('.hx-score');
      function tab(matches){
        var seg = a.el('h-seg'); seg.dataset.on = matches ? '0' : '1';
        a.el('h-matches-tab').classList.toggle('is-on', matches); a.el('h-standings-tab').classList.toggle('is-on', !matches);
        a.el('h-matches').style.display = matches ? '' : 'none'; a.el('h-standings').style.display = matches ? 'none' : '';
        var c = a.el(matches ? 'h-matches' : 'h-standings'); c.classList.remove('mu-new'); c.offsetHeight; c.classList.add('mu-new');
      }
      function tick(from, to, ms){
        if(!pl) return a.wait(0);
        var t0 = performance.now();
        return new Promise(function(res){ (function f(now){ var k = Math.min(1, (now - t0) / ms); pl.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2); k < 1 ? requestAnimationFrame(f) : res(); })(t0); });
      }
      if(pl) pl.textContent = '3.30'; if(plUp) plUp.classList.remove('is-in'); if(toast) toast.classList.remove('is-pop', 'is-in'); if(score) score.classList.remove('is-in');
      return a.wait(500)
        .then(function(){ return a.scroll(a.maxY(), 1600); })       // down the standings to 8th place
        .then(function(){ return a.wait(800); })
        .then(function(){ return a.tap('h-matches-tab'); })
        .then(function(){ tab(true); return a.wait(450); })
        .then(function(){ if(toast){ toast.classList.add('is-in', 'is-pop'); } if(plUp) plUp.classList.add('is-in'); if(score) score.classList.add('is-in'); return tick(3.30, 3.42, 900); })
        .then(function(){ return a.wait(400); })
        .then(function(){ return a.scroll(a.maxY(), 1500); })
        .then(function(){ return a.wait(900); })
        .then(function(){ return a.scrollTo('h-tabs-row', 6, 1000); })
        .then(function(){ return a.tap('h-standings-tab'); })
        .then(function(){ tab(false); return a.wait(300); })
        .then(function(){ return a.scroll(0, 900); });
    },
    // B03 · Banner juara: scroll to the banner, the trophy rises and sparkles.
    b03: function(a){
      a.el('trophy').classList.add('is-hidden');
      return a.toTarget().then(function(){ var t = a.el('trophy'); t.classList.remove('is-hidden'); t.classList.add('is-play'); return a.wait(2600); });
    }
  };
  function targetYOf(a){ return targetY(a.el('table').closest('.mu-stage')); }

  /* ---------- Init ----------
     Cards from other files (e.g. the AVM page, components/mini-ui/avm/*.js)
     are added with AyoMiniUI.add({cards, flows, prep}) after this script; any
     stage whose card exists is built then. AyoMiniUI.h exposes the templates
     and icons above so those files draw with the same parts. */
  var stages = [];
  var io = MOTION ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      var st = e.target, p = st._player || (st._player = new Player(st));
      if(e.isIntersecting && !p.playing){ p.playing = true; p.start(); }
      else if(!e.isIntersecting && p.playing){ p.playing = false; p.stop(); }
    });
  }, {threshold:.5}) : null;
  function init(){
    [].forEach.call(document.querySelectorAll('[data-mu]'), function(st){
      if(st._mu || !CARDS[st.dataset.mu]) return;
      build(st); stages.push(st);
      if(io && st._mu.card.flow) io.observe(st);
    });
  }
  init();

  var rt;
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ stages.forEach(function(st){ if(!st._player || !st._player.playing){ place(st, true); prep(st); } }); }, 150); });
  window.AyoMiniUI = {
    refresh: function(root){ (root || document).querySelectorAll('[data-mu]').forEach(function(st){ if(st._mu && (!st._player || !st._player.playing)){ place(st, true); prep(st); } }); },
    add: function(defs){
      Object.keys(defs.cards || {}).forEach(function(k){ CARDS[k] = defs.cards[k]; });
      Object.keys(defs.flows || {}).forEach(function(k){ FLOWS[k] = defs.flows[k]; });
      Object.keys(defs.prep || {}).forEach(function(k){ PREP[k] = defs.prep[k]; });
      init();
    },
    h: {I:I, ico:ico, av:av, pair:pair, head:head, page:page, on:on, partnerRows:partnerRows, SC:SC, PLUS:PLUS, targetY:targetY},
    motion: MOTION
  };
})();
