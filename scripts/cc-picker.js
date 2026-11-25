/* AYO — country-code picker for phone fields ([data-cc] on partner-*.html,
   avm-*.html). Flag emoji don't render on Windows and some Android/Linux
   browsers, and an <option> can't hold an image, so the native <select> is
   kept (it still carries the form value and resets with the form) but taken
   out of reach, and a button + listbox with drawn flags (.flag--xx, chrome.css)
   is put over it. Changing the select from here dispatches "change", so any
   other listeners still run. Keyboard: Enter/Space/↓ open; ↑/↓, Home/End,
   first letter move; Enter/Space pick; Esc/Tab close. */
(function(){
  'use strict';
  var uid = 0;
  [].forEach.call(document.querySelectorAll('[data-cc]'), function(root){
    var sel = root.querySelector('select');
    if(!sel) return;
    var flag = root.querySelector('.flag'), code = root.querySelector('[class$="cc__code"]');
    var opts = [].slice.call(sel.options);
    var id = 'cc-list-' + (++uid);
    var nameOf = function(o){ return o.textContent.replace(/\s*\(\+\d+\)\s*$/, ''); };

    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.style.pointerEvents = 'none';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cc-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    root.appendChild(btn);

    var list = document.createElement('ul');
    list.className = 'cc-list';
    list.id = id;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', sel.getAttribute('aria-label') || 'Country code');
    list.tabIndex = -1;
    list.innerHTML = opts.map(function(o, i){
      return '<li role="option" id="' + id + '-' + i + '" data-i="' + i + '"><span class="flag flag--' + o.dataset.flag + '" aria-hidden="true"></span>' +
        '<span>' + nameOf(o) + '</span><b>' + o.value + '</b></li>';
    }).join('');
    root.appendChild(list);
    var items = [].slice.call(list.children);
    var active = 0;

    function sync(){
      var i = sel.selectedIndex, o = opts[i];
      if(flag) flag.className = flag.className.replace(/\bflag--\w+/, 'flag--' + o.dataset.flag);
      if(code) code.textContent = o.value;
      items.forEach(function(li, k){ li.setAttribute('aria-selected', String(k === i)); });
      btn.setAttribute('aria-label', (sel.getAttribute('aria-label') || 'Country code') + ': ' + nameOf(o) + ' ' + o.value);
    }
    function setActive(i){
      active = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function(li, k){ li.classList.toggle('is-active', k === active); });
      list.setAttribute('aria-activedescendant', items[active].id);
      var li = items[active];
      if(li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if(li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    }
    function isOpen(){ return list.classList.contains('is-open'); }
    function open(){
      if(isOpen()) return;
      list.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      setActive(sel.selectedIndex);
      list.focus({preventScroll:true});
      document.addEventListener('pointerdown', outside, true);
    }
    function close(refocus){
      if(!isOpen()) return;
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', outside, true);
      if(refocus) btn.focus({preventScroll:true});
    }
    function outside(e){ if(!root.contains(e.target)) close(false); }
    function pick(i){
      if(i !== sel.selectedIndex){
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', {bubbles:true}));
      }
      sync();
      close(true);
    }

    btn.addEventListener('click', function(e){ e.stopPropagation(); isOpen() ? close(true) : open(); });
    btn.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); open(); }
    });
    list.addEventListener('click', function(e){
      e.stopPropagation();
      var li = e.target.closest('li'); if(li) pick(+li.dataset.i);
    });
    list.addEventListener('pointermove', function(e){
      var li = e.target.closest('li'); if(li && +li.dataset.i !== active) setActive(+li.dataset.i);
    });
    list.addEventListener('keydown', function(e){
      var k = e.key;
      if(k === 'ArrowDown'){ e.preventDefault(); setActive(active + 1); }
      else if(k === 'ArrowUp'){ e.preventDefault(); setActive(active - 1); }
      else if(k === 'Home'){ e.preventDefault(); setActive(0); }
      else if(k === 'End'){ e.preventDefault(); setActive(items.length - 1); }
      else if(k === 'Enter' || k === ' '){ e.preventDefault(); pick(active); }
      else if(k === 'Escape'){ e.preventDefault(); close(true); }
      else if(k === 'Tab'){ close(false); }
      else if(k.length === 1 && /\S/.test(k)){
        var q = k.toLowerCase();
        for(var n = 1; n <= items.length; n++){
          var j = (active + n) % items.length;
          if(nameOf(opts[j]).toLowerCase().indexOf(q) === 0){ setActive(j); break; }
        }
      }
    });
    list.addEventListener('focusout', function(e){ if(!root.contains(e.relatedTarget)) close(false); });
    sel.addEventListener('change', sync);
    if(sel.form) sel.form.addEventListener('reset', function(){ setTimeout(sync, 0); });
    sync();
  });
})();
