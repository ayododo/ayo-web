/* ==========================================================================
   AYO — Activity page category tabs
   Roving tabindex over [role=tablist], panels toggled with the hidden
   attribute. Shared by every activity detail page so the keyboard contract
   cannot drift between them.

   Markup contract:
     [role=tablist] > [role=tab][aria-controls=<panel id>]
     [role=tabpanel] with a matching id, all but the first carrying `hidden`
   ========================================================================== */
(function () {
  var list = document.querySelector('[data-act-tabs]');
  if (!list) return;

  var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
  if (tabs.length < 2) return;

  function show(i, moveFocus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', on);
      /* Roving tabindex: one stop for the whole set, then arrows move within
         it. Leaving every tab focusable would make Tab walk the group. */
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (moveFocus) tabs[i].focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();                       /* arrows would scroll the page */
      show(n, true);
    });
  });
})();
