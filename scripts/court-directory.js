/* ==========================================================================
   AYO — Court Directory (court-directory.html)
   Draws the alphabetical list and the pagination.

   - 48 regencies a page, filled down column 1 then column 2 (Figma 26230:2699).
   - The page lives in the URL (?page=3), so every page has its own address
     and can be linked or crawled. Clicks swap the list in place and push the
     new URL; Back/Forward work through popstate.
   - Pagination truncates as 1 … (cur-2 … cur+2) … last (Figma note); phones
     use cur±1 so the row fits beside the icon-only Prev/Next buttons.
   ========================================================================== */
(function () {
  'use strict';

  /* SAMPLE DATA — a stand-in list of Indonesian regencies so the page can be
     built and reviewed. Replace with the real list of regencies that have
     courts on AYO (and their detail-page URLs) when the API is available. */
  var REGIONS = [
    'Aceh Barat', 'Aceh Besar', 'Aceh Selatan', 'Aceh Tengah', 'Aceh Timur', 'Aceh Utara', 'Agam', 'Asahan',
    'Badung', 'Balangan', 'Bandung', 'Bandung Barat', 'Bangka', 'Bangkalan', 'Bangli', 'Banjar', 'Banjarnegara',
    'Bantaeng', 'Bantul', 'Banyuasin', 'Banyumas', 'Banyuwangi', 'Barito Kuala', 'Barito Selatan', 'Barito Utara',
    'Barru', 'Batang', 'Batu Bara', 'Bekasi', 'Belitung', 'Belu', 'Bengkalis', 'Bengkulu Utara', 'Berau', 'Bima',
    'Bintan', 'Bireuen', 'Blitar', 'Blora', 'Boalemo', 'Bogor', 'Bojonegoro', 'Bombana', 'Bondowoso', 'Bone',
    'Bone Bolango', 'Boyolali', 'Brebes', 'Buleleng', 'Bulukumba', 'Bungo', 'Buton',
    'Ciamis', 'Cianjur', 'Cilacap', 'Cirebon',
    'Dairi', 'Deli Serdang', 'Demak', 'Dharmasraya', 'Dompu', 'Donggala',
    'Ende', 'Enrekang', 'Flores Timur',
    'Garut', 'Gianyar', 'Gorontalo', 'Gowa', 'Gresik', 'Grobogan', 'Gunungkidul',
    'Halmahera Utara', 'Indragiri Hilir', 'Indragiri Hulu', 'Indramayu',
    'Jayapura', 'Jember', 'Jembrana', 'Jeneponto', 'Jepara', 'Jombang',
    'Kampar', 'Karanganyar', 'Karangasem', 'Karawang', 'Karimun', 'Karo', 'Kebumen', 'Kediri', 'Kendal',
    'Ketapang', 'Klaten', 'Klungkung', 'Kolaka', 'Konawe', 'Kotawaringin Barat', 'Kotawaringin Timur',
    'Kubu Raya', 'Kudus', 'Kuningan', 'Kupang', 'Kutai Barat', 'Kutai Kartanegara', 'Kutai Timur',
    'Labuhanbatu', 'Lamongan', 'Lampung Selatan', 'Lampung Tengah', 'Lampung Timur', 'Langkat', 'Lebak',
    'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Lombok Utara', 'Lumajang', 'Luwu',
    'Madiun', 'Magelang', 'Magetan', 'Majalengka', 'Majene', 'Malang', 'Mamuju', 'Mandailing Natal',
    'Manggarai', 'Maros', 'Merauke', 'Mimika', 'Minahasa', 'Mojokerto', 'Muara Enim', 'Musi Banyuasin',
    'Nganjuk', 'Ngawi', 'Ogan Ilir', 'Ogan Komering Ilir',
    'Pacitan', 'Padang Pariaman', 'Pamekasan', 'Pandeglang', 'Pangandaran', 'Pangkajene dan Kepulauan',
    'Paser', 'Pasuruan', 'Pati', 'Pekalongan', 'Pelalawan', 'Pemalang', 'Pesisir Selatan', 'Pidie', 'Pinrang',
    'Ponorogo', 'Pringsewu', 'Probolinggo', 'Purbalingga', 'Purwakarta', 'Purworejo',
    'Rembang', 'Rokan Hilir', 'Rokan Hulu',
    'Sambas', 'Sampang', 'Sanggau', 'Semarang', 'Serang', 'Serdang Bedagai', 'Siak', 'Sidenreng Rappang',
    'Sidoarjo', 'Sikka', 'Simalungun', 'Sinjai', 'Sintang', 'Situbondo', 'Sleman', 'Soppeng', 'Sragen',
    'Subang', 'Sukabumi', 'Sukoharjo', 'Sumbawa', 'Sumedang', 'Sumenep',
    'Tabanan', 'Takalar', 'Tangerang', 'Tanah Bumbu', 'Tanah Datar', 'Tanah Laut', 'Tasikmalaya', 'Tegal',
    'Temanggung', 'Toba', 'Toli-Toli', 'Trenggalek', 'Tuban', 'Tulungagung',
    'Wajo', 'Wonogiri', 'Wonosobo'
  ].sort(function (a, b) { return a.localeCompare(b, 'id'); });

  var PER_PAGE = 48;
  var PREFIX = 'Lapangan Padel Kabupaten';
  var ICON = 'assets/icons/';

  var cols = document.querySelector('[data-cdir-cols]');
  var pager = document.querySelector('[data-cdir-pager]');
  var count = document.querySelector('[data-cdir-count]');
  if (!cols || !pager) return;

  var total = Math.max(1, Math.ceil(REGIONS.length / PER_PAGE));
  var phone = matchMedia('(max-width: 560px)');

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }

  function pageFromUrl() {
    var n = parseInt(new URLSearchParams(location.search).get('page'), 10);
    return isNaN(n) ? 1 : Math.min(Math.max(n, 1), total);
  }
  function urlFor(n) { return n === 1 ? location.pathname : location.pathname + '?page=' + n; }

  /* TODO: point each row at its regency page once those exist. */
  function rowHTML(name) {
    return '<li><a class="cdir__row" href="#">' +
      '<span class="cdir__label"><span class="cdir__prefix">' + PREFIX + '</span>' +
      '<span class="cdir__name">' + esc(name) + '</span></span>' +
      '<img class="cdir__chev" src="' + ICON + 'chevron-right.svg" alt="" width="16" height="16">' +
    '</a></li>';
  }

  /* 1 … (cur-w … cur+w) … last. A gap is only drawn when it hides at least
     one page — "1 … 2" would be silly, so that case just shows the 2. */
  function pageList(cur) {
    var w = phone.matches ? 1 : 2;
    var lo = Math.max(2, cur - w), hi = Math.min(total - 1, cur + w);
    var out = [1];
    if (lo > 2) out.push(lo === 3 ? 2 : null);
    for (var i = lo; i <= hi; i++) out.push(i);
    if (hi < total - 1) out.push(hi === total - 2 ? total - 1 : null);
    if (total > 1) out.push(total);
    return out;
  }

  function navHTML(dir, cur) {
    var target = dir === 'prev' ? cur - 1 : cur + 1;
    var off = target < 1 || target > total;
    var label = dir === 'prev' ? 'Prev' : 'Next';
    var icon = '<img src="' + ICON + 'page-' + dir + '.svg" alt="" width="16" height="16">';
    return '<a class="cdir__nav" ' + (off ? 'aria-disabled="true" tabindex="-1"' : 'href="' + urlFor(target) + '" data-page="' + target + '"') +
      ' aria-label="' + (dir === 'prev' ? 'Previous page' : 'Next page') + '">' +
      (dir === 'prev' ? icon + '<span>' + label + '</span>' : '<span>' + label + '</span>' + icon) +
    '</a>';
  }

  function render(cur) {
    var slice = REGIONS.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
    var half = Math.ceil(slice.length / 2);
    cols.innerHTML =
      '<ul class="cdir__col">' + slice.slice(0, half).map(rowHTML).join('') + '</ul>' +
      '<ul class="cdir__col">' + slice.slice(half).map(rowHTML).join('') + '</ul>';

    if (count) count.textContent = 'Page ' + cur + ' of ' + total;

    pager.innerHTML = navHTML('prev', cur) +
      '<ol class="cdir__pages">' + pageList(cur).map(function (n) {
        if (n === null) return '<li><span class="cdir__page cdir__gap" aria-hidden="true">…</span></li>';
        if (n === cur) return '<li><span class="cdir__page" aria-current="page">' + n + '</span></li>';
        return '<li><a class="cdir__page" href="' + urlFor(n) + '" data-page="' + n + '" aria-label="Page ' + n + '">' + n + '</a></li>';
      }).join('') + '</ol>' +
      navHTML('next', cur);
    pager.hidden = total < 2;
  }

  var current = pageFromUrl();
  render(current);

  pager.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-page]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // let new-tab clicks through
    e.preventDefault();
    current = +a.getAttribute('data-page');
    history.pushState({ page: current }, '', urlFor(current));
    render(current);
    /* Back to the top of the list, not the page — the header above it would
       just push the new rows out of view again. */
    var list = document.querySelector('.cdir__list');
    var top = list.getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  addEventListener('popstate', function () { current = pageFromUrl(); render(current); });
  /* The truncation window differs between phone and desktop. */
  (phone.addEventListener ? phone.addEventListener.bind(phone, 'change') : phone.addListener.bind(phone))(function () { render(current); });
})();
