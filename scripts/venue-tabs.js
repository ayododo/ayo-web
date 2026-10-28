/* Feature categories — real tabs: click, arrow keys, Home/End, and the roving
   tabindex a tablist is supposed to have, so only the selected tab is a tab
   stop and the arrows move between them. */
(function(){
  var list = document.querySelector('.avm-cats[role="tablist"]');
  if(!list) return;
  var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
  if(tabs.length < 2) return;

  function show(i, moveFocus){
    tabs.forEach(function(t, j){
      var on = i === j;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if(panel) panel.hidden = !on;
    });
    if(moveFocus) tabs[i].focus();
  }

  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ show(i); });
    t.addEventListener('keydown', function(e){
      var n = null;
      if(e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if(e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if(e.key === 'Home') n = 0;
      else if(e.key === 'End') n = tabs.length - 1;
      if(n === null) return;
      e.preventDefault();
      show(n, true);
    });
  });
})();
