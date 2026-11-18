/* ==========================================================================
   AYO — Mini UI renderer + motion player
   Figma: Scoring key features, section 28109:21823. Flow order follows the
   Scoring staging board 28125:11094 (multi-page slots S01, S02, S03, M02,
   M04, B01: only Step 1 is drawn in Figma; the other steps play here).

   Usage:  <div class="mu-stage" data-mu="s02"></div>
   data-mu picks a CARD below. A card is one or more pages, an optional
   scroll target for its static frame, and an optional FLOW (the motion).
   Flows start when the card is half in view, loop with a pause, and stop
   (resetting to the static frame) when it leaves. With reduced motion the
   static frame is all that shows.
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

  /* ---------- Small templates ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var I = {
    back: S+'<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>',
    close: S+'<path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>',
    share: S+'<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.7 7.4-4.3"/><path d="m8.3 13.3 7.4 4.3"/></svg>',
    more: S+'<circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>',
    plus: S+'<path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    chev: S+'<path d="m9 6 6 6-6 6"/></svg>',
    cam: S+'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    grip: '<svg class="mu-grip" viewBox="0 0 10 14" aria-hidden="true"><g fill="currentColor"><circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/><circle cx="2.5" cy="7" r="1.2"/><circle cx="7.5" cy="7" r="1.2"/><circle cx="2.5" cy="12" r="1.2"/><circle cx="7.5" cy="12" r="1.2"/></g></svg>'
  };
  function ico(n, el){ return '<span class="mu-ico"'+(el?' data-el="'+el+'"':'')+'>'+I[n]+'</span>'; }
  function av(k, size){ return '<img class="mu-av'+(size?' mu-av--'+size:'')+'" src="'+AV+k+'.webp" alt="" width="40" height="40" decoding="async">'; }
  function pair(a, b){ return '<span class="mu-pair">'+av(a)+av(b)+'</span>'; }
  function head(inner){ return '<div class="mu-head">'+inner+'</div>'; }
  function page(name, top, body, extra){
    return '<div class="mu-page" data-page="'+name+'">'+top+'<div class="mu-body"><div class="mu-scroll">'+body+'</div></div>'+(extra||'')+'</div>';
  }

  /* ---------- Screens ---------- */
  function setup(o){
    o = o || {};
    var fmt = o.fmt || 'Americano', partner = o.partner || 'Rotating Partner';
    var sports = o.sports || ['Padel','Tennis','Badminton','Pickleball'];
    var chips = sports.map(function(s, i){ return '<span class="mu-chip'+(i===0?' is-on':'')+'" data-el="sport-'+s.replace(/\W/g,'')+'">'+s+'</span>'; }).join('');
    var tiles = ['Custom','Americano','Mexicano'].map(function(t){ return '<span class="mu-tile'+(t===fmt?' is-on':'')+'">'+t+'</span>'; }).join('');
    var rows = fmt === 'Custom' ? [['Singles · 1 vs 1',''],['Doubles · 2 vs 2','']] :
      [['Rotating Partner','Partners rotate every match.'],['Fixed Partner','Same partner in every match.'],['Mixed Partner','Mixed pairs from two groups.'],['Singles','Individuals compete 1 vs 1.']];
    var on = fmt === 'Custom' ? 'Doubles · 2 vs 2' : partner;
    var list = rows.map(function(r){ return '<div class="mu-li"><div class="mu-col mu-grow"><span class="mu-h">'+r[0]+'</span>'+(r[1]?'<span class="mu-s">'+r[1]+'</span>':'')+'</div><span class="mu-radio'+(r[0]===on?' is-on':'')+'"></span></div>'; }).join('');
    return page('setup', head(ico('back')+'<span class="mu-head__title">Create GameTime</span>'),
      '<div class="mu-h">Sport Categories</div>'+
      '<div class="mu-chips" data-el="sports">'+chips+'</div>'+
      '<div class="mu-seg" data-el="mode" data-on="0"><span class="mu-seg__knob"></span><span class="mu-seg__i is-on" data-el="mode-0">Competitive</span><span class="mu-seg__i" data-el="mode-1">Casual</span></div>'+
      '<div class="mu-tint" data-el="info"><div class="mu-t mu-b">This is for your intense matches</div><div class="mu-s">Scores affect your skill rating.</div></div>'+
      '<div class="mu-tiles" data-el="formats">'+tiles+'</div>'+
      '<div class="mu-list" data-el="partners">'+list+'</div>'+
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
      '<div class="mu-grid" data-el="grid"><span class="mu-person">'+av('fajar',40)+'Fajar R.</span></div>',
      '<span class="mu-fab" data-el="fab">'+I.plus+'</span><div class="mu-foot"><div class="mu-btn mu-btn--off" data-el="create">Create GameTime</div></div>');
  }
  function addParticipants(){
    var rows = ['maya','bayu','tari','raka'].map(function(k){
      return '<div class="mu-li" data-el="pick-'+k+'">'+av(k,22)+'<div class="mu-col mu-grow"><span class="mu-h">'+FULL[k]+'</span><span class="mu-s">@'+FULL[k].toLowerCase().replace(' ','')+'</span></div><span class="mu-check"></span></div>'; }).join('');
    return page('add', head(ico('close')+'<span class="mu-head__title">Add Participants</span>'),
      '<div class="mu-field is-focus" data-el="search"><span data-el="q" class="mu-caret" style="color:#787373">Participant name</span></div>'+
      '<div class="mu-cap">RECENT PLAYERS</div><div class="mu-list">'+rows+'</div>',
      '<div class="mu-foot"><div class="mu-btn mu-btn--dark" data-el="add-btn">Add (<span data-el="add-n">0</span>)</div></div>');
  }
  function team(a, b, right){ return '<div class="mu-row">'+pair(a,b)+'<span class="mu-t mu-grow" style="font-weight:500">'+NAME[a]+' / '+NAME[b]+'</span>'+(right||'')+'</div>'; }
  function round(n, t1, t2, r1, r2, el){
    return '<div class="mu-col" style="gap:6px" data-el="'+(el||'round-'+n)+'"><span class="mu-cap">ROUND '+n+'</span><div class="mu-card mu-pad mu-col" style="gap:8px">'+
      '<div class="mu-row"><span class="mu-t mu-b mu-grow">Court A</span><span class="mu-link">Bench</span><span class="mu-link">Edit</span></div>'+
      team(t1[0],t1[1],r1)+team(t2[0],t2[1],r2)+'</div></div>';
  }
  var PLUS = function(el){ return '<span class="mu-pill"'+(el?' data-el="'+el+'"':'')+'>+ Score</span>'; };
  var SC = function(v, el){ return '<span class="mu-score"'+(el?' data-el="'+el+'"':'')+'>'+v+'</span>'; };
  function winner(){
    return '<div class="mu-card mu-pad mu-col" style="gap:8px" data-el="winner"><span class="mu-pill" style="background:#f4f4f5;color:#17171a;align-self:flex-start">WINNER · AMERICANO</span>'+
      '<div class="mu-row">'+av('fajar',32)+'<div class="mu-col mu-grow"><span class="mu-h" style="font-size:12.5px">Fajar Rahman</span><span class="mu-s">@fajarrahman</span></div>'+
      '<span style="width:26px;height:26px;border-radius:50%;background:#fff1de;color:#b4610e;display:flex;align-items:center;justify-content:center;font-size:13px">★</span></div></div>';
  }
  function table(n){
    var rows = STANDINGS.slice(0, n||8).map(function(r, i){
      return '<div class="mu-tr"><span'+(i===0?' style="font-weight:700"':'')+'>'+(i+1)+'&nbsp; '+FULL[r[0]]+'</span><span class="c-g">'+r[1]+'</span><span class="c-wtl">'+r[2]+'</span><span class="c-d">'+r[3]+'</span><span class="c-p">'+r[4]+'</span></div>'; }).join('');
    return '<div class="mu-table" data-el="table"><div class="mu-tr mu-tr--head"><span>PLAYERS</span><span class="c-g">G</span><span class="c-wtl">W-T-L</span><span class="c-d">Diff</span><span class="c-p">P</span></div>'+rows+'</div>';
  }
  function gd(o){
    o = o || {};
    var top = head(ico('back')+'<span class="mu-head__sp"></span>'+ico('share','share')+ico('more'));
    var people = ['fajar','maya','bayu','tari','raka','sinta'].map(function(k){ return av(k,22); }).join('');
    var body = '<div class="mu-title">Fun Padel Kawan AYO</div><div class="mu-s">Padel · 8 players · 10 Aug 2026</div>'+
      '<div class="mu-avs">'+people+'<span class="mu-s" style="font-weight:600">8/8 ›</span></div>'+
      '<div class="mu-t"><b>Americano</b> · Rotating Partner</div>'+
      '<div class="mu-seg" data-on="'+(o.tab||0)+'"><span class="mu-seg__knob"></span><span class="mu-seg__i'+(o.tab?'':' is-on')+'">Matches</span><span class="mu-seg__i'+(o.tab?' is-on':'')+'">Standings</span></div>';
    if(o.tab){ body += (o.winner?winner():'')+table(); }
    else {
      body += round(1, ['fajar','maya'], ['bayu','tari'], o.r1 ? SC(16,'s1a') : '<span data-el="s1a"></span>', o.r1 ? SC(8,'s1b') : PLUS('plus-1'));
      body += round(2, ['raka','sinta'], ['dika','nina'], '', PLUS());
      body += '<div data-el="round-slot"></div>';
      if(o.footer) body += '<div class="mu-btns" data-el="footer"><span class="mu-btn mu-btn--line">End Session</span><span class="mu-btn" data-el="more-rounds">+ More Rounds</span></div>';
    }
    return page('gd', top, body);
  }
  function inputScore(){
    function side(a, b, el){ return '<div class="mu-col" style="flex:1;align-items:center;gap:5px"><span class="mu-pair">'+av(a,32)+av(b,32)+'</span><span class="mu-s">'+NAME[a]+' / '+NAME[b]+'</span></div>'; }
    return page('input', head(ico('close')+'<span class="mu-head__title">Round 1 · Court A</span><span class="mu-head__sp"></span><span class="mu-h" data-el="save">Save</span>'),
      '<div class="mu-row" style="align-items:flex-start;padding-top:6px">'+side('fajar','maya')+side('bayu','tari')+'</div>'+
      '<div class="mu-row"><div class="mu-scorebox" data-el="box-a">–<b data-el="val-a">0</b>+</div><div class="mu-scorebox" data-el="box-b">–<b data-el="val-b">0</b>+</div></div>'+
      '<div class="mu-h" style="margin-top:4px">Match Photos</div><div class="mu-photo">'+'<span class="mu-ico">'+I.cam+'</span></div>');
  }
  function numpad(){
    var keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'].map(function(k){ return '<span data-el="key-'+(k||'none')+'">'+k+'</span>'; }).join('');
    return '<div class="mu-sheet" data-el="numpad"><span class="mu-sheet__bar"></span><div class="mu-field is-focus"><div class="mu-s" style="font-size:9px">Score · <span data-el="np-label">Fajar R. / Maya L.</span></div><span data-el="np-val" class="mu-caret mu-b" style="font-size:13px"></span></div><div class="mu-keys">'+keys+'</div><div class="mu-btn mu-btn--line" data-el="np-done">Done</div></div>';
  }
  function courtSheet(){
    return '<div class="mu-sheet" data-el="court-sheet"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Edit Court Name</span><div class="mu-field is-focus"><div class="mu-s" style="font-size:9px">Court Name</div><span data-el="court-input" class="mu-caret">Court 2</span></div><div class="mu-btn mu-btn--dark" data-el="court-done">Done</div></div>';
  }
  function moreDialog(){
    return '<div class="mu-dialog" data-el="dialog"><span class="mu-h" style="font-size:13px">Add More Rounds?</span><span class="mu-s">Add a new round with the same number of matches as the previous one.</span><div class="mu-btns" style="margin-top:6px"><span class="mu-btn mu-btn--line">Back</span><span class="mu-btn mu-btn--dark" data-el="confirm">Confirm</span></div></div>';
  }
  function shareSheets(){
    return '<div class="mu-sheet" data-el="share-options"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Share Activity</span>'+
      '<div class="mu-list"><div class="mu-li" data-el="opt-standings"><span class="mu-h mu-grow">Standings</span>'+ico('chev')+'</div><div class="mu-li"><span class="mu-h mu-grow">Matches</span>'+ico('chev')+'</div></div></div>'+
      '<div class="mu-sheet" data-el="share-type"><span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Share Standings</span>'+
      // Generic glyphs, not the WhatsApp / Facebook / Instagram logos.
      '<div class="mu-chan"><span><i>W</i>WhatsApp</span><span><i>f</i>Facebook</span><span><i>◎</i>Instagram</span><span><i>↗</i>Copy Link</span></div>'+
      '<div class="mu-s" style="text-align:center">or</div><div class="mu-btns"><span class="mu-btn mu-btn--line">Feed</span><span class="mu-btn mu-btn--line" data-el="stories">Stories</span></div>'+
      '<div class="mu-btn mu-btn--line">Download Standings (PDF)</div></div>';
  }
  function story(){
    var rows = STANDINGS.slice(0,3).map(function(r, i){ return '<div class="mu-story__row"><span>'+(i+1)+'</span>'+av(r[0],22)+'<span>'+FULL[r[0]]+'</span><b>'+r[4]+'</b></div>'; }).join('');
    return '<div class="mu-page" data-page="story"><div class="mu-story"><span class="mu-story__logo">AYO</span><span class="mu-s" style="color:rgba(255,255,255,.7)">Fun Padel Kawan AYO · Americano</span>'+rows+'<span class="mu-s" style="color:rgba(255,255,255,.6);margin-top:auto">Yuk coba buat Americano di aplikasi AYO!</span></div></div>';
  }
  function ranking(adv, drag){
    var items = [['Total Points','Points earned during the match.'],['Number of Wins','Games won.'],['Point Difference','Points scored minus conceded.'],['Set Difference','Sets won minus lost.'],['Head-to-Head','Direct result between the two.']];
    if(adv) items.unshift(['Advanced League System','Points from win / draw / loss.']);
    if(drag){ var x = items.splice(2,1)[0]; items.splice(1,0,x); }
    var steps = adv ? [['Win Points',3],['Draw Points',1],['Loss Points',0]].map(function(p){ return '<div class="mu-row mu-row--between"><span class="mu-t" style="color:#787373">'+p[0]+'</span><span class="mu-step"><i>–</i>'+p[1]+'<span>+</span></span></div>'; }).join('') : '';
    var list = items.map(function(it, i){ return '<div class="mu-crit'+(drag&&i===1?' is-drag':'')+'"><span class="mu-no">'+(i+1)+'</span><div class="mu-col mu-grow"><span class="mu-h">'+it[0]+'</span><span class="mu-s">'+it[1]+'</span></div>'+I.grip+'</div>'; }).join('');
    return page('rank', head(ico('back')+'<span class="mu-head__title">Standings Ranking Criteria</span>'),
      '<div class="mu-card mu-pad mu-col" style="gap:8px"><div class="mu-row mu-row--between"><span class="mu-h">Advanced League System</span><span class="mu-toggle'+(adv?' is-on':'')+'"></span></div>'+steps+'</div>'+
      '<div class="mu-s">Hold &amp; drag to change order.</div><div data-el="crit">'+list+'</div><div class="mu-btn">Save</div>');
  }
  function shareTypeOnly(){
    // The card only shows the top ~240px of the screen, so the sheet is lifted
    // to end there and keep "Download Standings (PDF)" in view.
    return '<div class="mu-page is-active" data-page="sheet" style="background:#8c8c8c"><div class="mu-sheet is-on" style="transition:none;bottom:146px;border-radius:16px">'+
      '<span class="mu-sheet__bar"></span><span class="mu-h" style="font-size:13px">Share Standings</span>'+
      '<div class="mu-chan"><span><i>W</i>WhatsApp</span><span><i>f</i>Facebook</span><span><i>◎</i>Instagram</span><span><i>↗</i>Copy Link</span></div>'+
      '<div class="mu-s" style="text-align:center">or</div><div class="mu-btns"><span class="mu-btn mu-btn--line">Feed</span><span class="mu-btn mu-btn--line">Stories</span></div>'+
      '<div class="mu-btn mu-btn--line">Download Standings (PDF)</div></div></div>';
  }

  /* ---------- Cards: pages (first = static frame), scroll target, flow ---------- */
  var CARDS = {
    f01: {pages:[setup({fmt:'Americano'})], to:'formats'},
    f02: {pages:[setup({fmt:'Mexicano'})], to:'formats'},
    f03: {pages:[setup({fmt:'Custom'})], to:'formats'},
    f04: {pages:[setup({fmt:'Americano', partner:'Fixed Partner'})], to:'partners'},
    s01: {pages:[setup({sports:['Padel','Tennis','Lainnya ›']}), selectSport()], flow:'s01'},
    s02: {pages:[setup()], to:'criteria', extra:courtSheet, flow:'s02'},
    s03: {pages:[participants(), addParticipants()], flow:'s03'},
    s04: {pages:[ranking(false,false)]},
    m01: {pages:[gd()], to:'round-1'},
    m02: {pages:[gd(), inputScore()], to:'round-1', extra:numpad, flow:'m02'},
    m03: {pages:[gd({r1:true})], to:'round-1'},
    m04: {pages:[gd({r1:true, footer:true})], toBottom:'footer', extra:moreDialog, flow:'m04'},
    k01: {pages:[gd({tab:1})], to:'table'},
    k02: {pages:[ranking(false,true)], to:'crit', margin:24},
    k03: {pages:[ranking(true,false)]},
    b01: {pages:[gd({tab:1, winner:true}), story()], extra:shareSheets, flow:'b01'},
    b02: {html: shareTypeOnly},
    b03: {pages:[gd({tab:1, winner:true})], to:'winner', margin:40}
  };

  /* ---------- Build ---------- */
  function build(stage){
    var c = CARDS[stage.dataset.mu]; if(!c) return;
    var inner = c.html ? c.html() : c.pages.join('') + (c.extra ? c.extra() : '');
    stage.innerHTML = '<div class="mu-phone" aria-hidden="true"><div class="mu-screen">'+inner+'<div class="mu-dim" data-el="dim"></div><span class="mu-tap"></span></div></div>';
    var first = stage.querySelector('.mu-page'); if(first) first.classList.add('is-active');
    stage._mu = {card:c, initial: stage.querySelector('.mu-screen').innerHTML};
    place(stage, true);
  }
  function scaleOf(stage){ var p = stage.querySelector('.mu-phone'); return parseFloat(getComputedStyle(p).getPropertyValue('--mu-scale')) || 1; }
  // Scroll the active page so the card's target sits near the top (or the
  // bottom, for toBottom) of the part of the screen the card shows.
  function place(stage, instant){
    var c = stage._mu && stage._mu.card; if(!c) return;
    var pg = stage.querySelector('.mu-page'); if(!pg) return;
    var sc = pg.querySelector('.mu-scroll'); if(!sc) return;
    var y = 0;
    if(c.to){ var t = sc.querySelector('[data-el="'+c.to+'"]'); if(t) y = Math.max(0, t.offsetTop - (c.margin != null ? c.margin : 6)); }
    if(c.toBottom){ var b = sc.querySelector('[data-el="'+c.toBottom+'"]'); if(b) y = Math.max(0, b.offsetTop + b.offsetHeight - visibleBody(stage, pg) + 10); }
    setY(sc, y, instant);
  }
  function visibleBody(stage, pg){
    var phone = stage.querySelector('.mu-phone'), s = scaleOf(stage);
    var hd = pg.querySelector('.mu-head');
    return (stage.clientHeight - phone.offsetTop) / s - 10 - (hd ? hd.offsetHeight : 0);
  }
  function setY(sc, y, instant){
    if(instant) sc.classList.add('no-anim');
    sc.style.setProperty('--mu-y', (-y)+'px');
    if(instant){ sc.offsetHeight; sc.classList.remove('no-anim'); }
  }

  /* ---------- Motion ---------- */
  var STOP = {};
  function Player(stage){ this.stage = stage; this.run = 0; }
  Player.prototype.start = function(){
    var self = this, id = ++this.run, flow = FLOWS[this.stage._mu.card.flow];
    var api = makeApi(this, id);
    (function loop(){
      api.wait(900).then(function(){ return flow(api); })
        .then(function(){ return api.wait(2600); })
        .then(function(){ self.reset(); return api.wait(600); })
        .then(loop, function(e){ if(e !== STOP) throw e; });
    })();
  };
  Player.prototype.stop = function(){ this.run++; this.reset(); };
  Player.prototype.reset = function(){
    var scr = this.stage.querySelector('.mu-screen');
    scr.innerHTML = this.stage._mu.initial;
    scr.querySelectorAll('.mu-page').forEach(function(p){ p.classList.add('no-anim'); });
    place(this.stage, true);
    scr.offsetHeight;
    scr.querySelectorAll('.mu-page').forEach(function(p){ p.classList.remove('no-anim'); });
  };

  function makeApi(player, id){
    var stage = player.stage;
    function scr(){ return stage.querySelector('.mu-screen'); }
    function alive(){ if(player.run !== id) throw STOP; }
    var api = {
      wait: function(ms){ return new Promise(function(res, rej){ setTimeout(function(){ player.run === id ? res() : rej(STOP); }, ms); }); },
      el: function(n){ return scr().querySelector('[data-el="'+n+'"]'); },
      tap: function(n){
        alive();
        var t = api.el(n), mk = scr().querySelector('.mu-tap'); if(!t) return api.wait(0);
        var s = scaleOf(stage), a = t.getBoundingClientRect(), b = scr().getBoundingClientRect();
        var x = (a.left + a.width/2 - b.left)/s, y = (a.top + a.height/2 - b.top)/s;
        var first = !mk.classList.contains('is-on');
        if(first){ mk.style.transition = 'none'; mk.style.transform = 'translate('+x+'px,'+y+'px)'; mk.offsetHeight; mk.style.transition = ''; mk.classList.add('is-on'); }
        else mk.style.transform = 'translate('+x+'px,'+y+'px)';
        return api.wait(first ? 450 : 650).then(function(){ mk.classList.remove('is-press'); mk.offsetHeight; mk.classList.add('is-press'); return api.wait(380); });
      },
      hideTap: function(){ var mk = scr().querySelector('.mu-tap'); mk.classList.remove('is-on'); },
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
      scrollTo: function(n, margin){
        alive();
        var t = api.el(n), sc = t.closest('.mu-scroll');
        setY(sc, Math.max(0, t.offsetTop - (margin == null ? 6 : margin)));
        return api.wait(800);
      },
      scrollBottom: function(n){
        alive();
        var t = api.el(n), sc = t.closest('.mu-scroll'), pg = t.closest('.mu-page');
        setY(sc, Math.max(0, t.offsetTop + t.offsetHeight - visibleBody(stage, pg) + 10));
        return api.wait(800);
      }
    };
    return api;
  }

  function on(el, cls, v){ el.classList.toggle(cls, v !== false); }
  var FLOWS = {
    // S01 · Cabor & mode: Setup → Select Sport → back with Squash → Casual.
    s01: function(a){
      return a.tap('sport-Lainnya').then(function(){ return a.go('sport'); })
        .then(function(){ return a.tap('pick-Squash'); })
        .then(function(){ a.el('pick-Padel').querySelector('.mu-radio').classList.remove('is-on'); on(a.el('pick-Squash').querySelector('.mu-radio'), 'is-on'); return a.wait(450); })
        .then(function(){ a.hideTap(); var c = a.el('sport-Lainnya'), p = a.el('sport-Padel'); p.classList.remove('is-on'); c.textContent = 'Squash'; on(c, 'is-on'); return a.back('setup'); })
        .then(function(){ return a.tap('mode-1'); })
        .then(function(){ a.el('mode').dataset.on = '1'; a.el('mode-0').classList.remove('is-on'); on(a.el('mode-1'), 'is-on');
          a.el('info').innerHTML = '<div class="mu-t mu-b">Just for fun</div><div class="mu-s">Scores won\'t affect your skill rating.</div>'; a.hideTap(); return a.wait(300); });
    },
    // S02 · Lapangan: + court → Court 2 → Edit Court Name sheet → renamed.
    s02: function(a){
      return a.tap('courts-plus').then(function(){
          a.el('courts-n').textContent = '2';
          var row = document.createElement('div'); row.className = 'mu-field mu-new'; row.dataset.el = 'court-2'; row.textContent = 'Court 2';
          a.el('court-list').appendChild(row); a.hideTap(); return a.wait(400); })
        .then(function(){ return a.scrollTo('courts', 40); })
        .then(function(){ return a.tap('court-2'); })
        .then(function(){ a.hideTap(); return a.sheet('court-sheet', true); })
        .then(function(){ return a.type('court-input', 'VIP Lounge', 110); })
        .then(function(){ return a.tap('court-done'); })
        .then(function(){ a.hideTap(); a.el('court-2').textContent = 'VIP Lounge'; return a.sheet('court-sheet', false); });
    },
    // S03 · Pemain & tim: + → Add Participants (pick 3) → 4 players, Create on.
    s03: function(a){
      var picks = ['maya','bayu','tari'], n = 0;
      function pick(k){ return a.tap('pick-'+k).then(function(){ on(a.el('pick-'+k).querySelector('.mu-check'), 'is-on'); a.el('add-n').textContent = String(++n); return a.wait(200); }); }
      return a.tap('fab').then(function(){ a.hideTap(); return a.go('add'); })
        .then(function(){ return pick(picks[0]); }).then(function(){ return pick(picks[1]); }).then(function(){ return pick(picks[2]); })
        .then(function(){ return a.tap('add-btn'); })
        .then(function(){ a.hideTap();
          var g = a.el('grid');
          picks.forEach(function(k){ var s = document.createElement('span'); s.className = 'mu-person mu-new'; s.innerHTML = av(k,40)+NAME[k]; g.appendChild(s); });
          a.el('count').textContent = '4'; a.el('create').classList.remove('mu-btn--off'); return a.back('participants'); });
    },
    // M02 · Input skor: + Score → Input Score → numpad 16 → numpad 8 → Save.
    m02: function(a){
      function numpadFor(box, label, digits, val){
        return a.tap(box).then(function(){ a.hideTap(); on(a.el(box), 'is-focus'); a.el('np-label').textContent = label; a.el('np-val').textContent = ''; return a.sheet('numpad', true); })
          .then(function(){ var p = Promise.resolve(); digits.split('').forEach(function(d){ p = p.then(function(){ return a.tap('key-'+d); }).then(function(){ a.el('np-val').textContent += d; }); }); return p; })
          .then(function(){ return a.tap('np-done'); })
          .then(function(){ a.hideTap(); a.el(val).textContent = digits; a.el(box).classList.remove('is-focus'); return a.sheet('numpad', false); });
      }
      return a.tap('plus-1').then(function(){ a.hideTap(); return a.go('input'); })
        .then(function(){ return numpadFor('box-a', 'Fajar R. / Maya L.', '16', 'val-a'); })
        .then(function(){ return numpadFor('box-b', 'Bayu A. / Tari A.', '8', 'val-b'); })
        .then(function(){ return a.tap('save'); })
        .then(function(){ a.hideTap(); a.el('s1a').outerHTML = SC(16,'s1a'); a.el('plus-1').outerHTML = SC(8,'s1b'); return a.back('gd'); });
    },
    // M04 · Kendali sesi: + More Rounds → confirm → Round 3 appears.
    m04: function(a){
      return a.tap('more-rounds').then(function(){ a.hideTap(); return a.sheet('dialog', true); })
        .then(function(){ return a.tap('confirm'); })
        .then(function(){ a.hideTap(); a.sheet('dialog', false);
          var slot = a.el('round-slot'); slot.innerHTML = round(3, ['fajar','nina'], ['dika','maya'], '', PLUS(), 'round-3'); slot.firstChild.classList.add('mu-new');
          return a.wait(500); })
        .then(function(){ return a.scrollBottom('footer'); });
    },
    // B01 · Bagikan: share → Share Activity → Standings → Share Standings → Stories.
    b01: function(a){
      return a.tap('share').then(function(){ a.hideTap(); return a.sheet('share-options', true); })
        .then(function(){ return a.tap('opt-standings'); })
        .then(function(){ a.hideTap(); a.el('share-options').classList.remove('is-on'); a.el('share-type').classList.add('is-on'); return a.wait(600); })
        .then(function(){ return a.tap('stories'); })
        .then(function(){ a.hideTap(); a.el('share-type').classList.remove('is-on'); a.el('dim').classList.remove('is-on'); return a.go('story'); });
    }
  };

  /* ---------- Init ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stages = [].slice.call(document.querySelectorAll('[data-mu]'));
  stages.forEach(build);
  var io = (!reduce && 'IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      var st = e.target, p = st._player || (st._player = new Player(st));
      if(e.isIntersecting && !p.playing){ p.playing = true; p.start(); }
      else if(!e.isIntersecting && p.playing){ p.playing = false; p.stop(); }
    });
  }, {threshold:.5}) : null;
  stages.forEach(function(st){ if(io && st._mu && st._mu.card.flow) io.observe(st); });

  var rt;
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ stages.forEach(function(st){ if(!st._player || !st._player.playing) place(st, true); }); }, 150); });
  window.AyoMiniUI = { refresh: function(root){ (root || document).querySelectorAll('[data-mu]').forEach(function(st){ if(!st._player || !st._player.playing) place(st, true); }); } };
})();
