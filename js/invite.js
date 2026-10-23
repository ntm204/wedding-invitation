// Màn hình chào: đọc tên khách trong link (tạo ở trang ẩn invite.html), hiện đúng tên; chạm thiệp để vào trang.
(function () {
  var search = location.search.slice(1), key = new URLSearchParams(search).get('k'), name = '';
  // Link mới: /?<mã tên> (js/guest-name.js). Phần sau "&" là tham số mạng xã hội tự thêm, như fbclid.
  var code = search.split('&')[0];
  try {
    if (key) {
      // Link cũ ?k= (base64url UTF-8) vẫn mở được.
      var raw = atob(key.replace(/-/g, '+').replace(/_/g, '/'));
      name = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(raw, function (c) { return c.charCodeAt(0); }));
    } else if (/^[\w-]+$/.test(code) && window.GuestName) {
      name = window.GuestName.decode(code);
    }
    name = name.trim().slice(0, 80);
  } catch (e) { name = ''; }

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
