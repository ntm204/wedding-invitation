// Màn hình chào: đọc mã ?m= trong link, hiện đúng tên khách mời; bấm "Mở thiệp" để vào trang.
(function () {
  var list = window.GUESTS || {};
  var code = (new URLSearchParams(location.search).get('m') || '').trim().toLowerCase();
  var name = code && Object.prototype.hasOwnProperty.call(list, code) ? list[code] : '';

  if (name) {
    document.querySelectorAll('[data-guest]').forEach(function (el) { el.textContent = name; });
    document.title = 'Kính mời ' + name + ' · Minh & Thuỷ';
  }

  var veil = document.getElementById('veil'), btn = document.getElementById('veil-open');
  var root = document.documentElement;
  root.classList.add('veiled');
  btn.focus({ preventScroll: true });

  btn.addEventListener('click', function () {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo(0, 0);
    root.classList.remove('veiled');
    veil.classList.add('lifting');
    setTimeout(function () { veil.hidden = true; }, still ? 0 : (+veil.dataset.wait || 1100));
  });
})();
