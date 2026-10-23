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
  document.querySelector('main').inert = true;
  veil.tabIndex = -1;
  veil.focus({ preventScroll: true });

  veil.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') { event.preventDefault(); btn.focus(); }
    if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === btn) {
      event.preventDefault(); btn.click();
    }
  });
  btn.addEventListener('click', function () {
    if (veil.classList.contains('lifting')) return;
    btn.setAttribute('aria-disabled', 'true');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo(0, 0);

    veil.classList.add('lifting');
    setTimeout(function () {
      veil.hidden = true;
      root.classList.remove('veiled');
      var main = document.querySelector('main'); main.inert = false;
      root.classList.add('invitation-open');
      main.focus({ preventScroll: true });
      window.dispatchEvent(new Event('invitation:open'));
    }, still ? 0 : (+veil.dataset.wait || 850));
  });
})();
