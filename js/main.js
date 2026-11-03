// Sao chép số điện thoại và xem album.
(function () {
  // Sao chép số điện thoại
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      function done(label) { btn.textContent = label; setTimeout(function () { btn.textContent = 'Sao chép'; }, 1800); }
      function selectNum() {
        var r = document.createRange(); r.selectNodeContents(btn.parentNode.querySelector('.num'));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); done('Đã chọn');
      }
      try { navigator.clipboard.writeText(btn.getAttribute('data-num')).then(function () { done('Đã chép'); }, selectNum); }
      catch (e) { selectNum(); }
    });
  });
})();


(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var images = Array.from(document.querySelectorAll('.album img'));
  var box = document.querySelector('.lightbox'), current = 0, opener, timer;
  var large = box.querySelector('img'), caption = box.querySelector('figcaption');
  function show(i) {
    current = (i + images.length) % images.length;
    clearTimeout(timer);
    var source = images[current];
    large.classList.add('changing');
    timer = setTimeout(function () {
      large.src = source.src; large.alt = source.alt;
      caption.textContent = (current + 1) + ' / ' + images.length + ' · ' + source.alt;
      large.classList.remove('changing');
    }, reduced ? 0 : 140);
  }
  images.forEach(function (img, i) {
    var button = document.createElement('button'); button.type = 'button'; button.className = 'photo-open';
    button.setAttribute('aria-label', 'Xem ảnh: ' + img.alt);
    img.parentNode.insertBefore(button, img); button.appendChild(img);
    button.addEventListener('click', function () { opener = button; show(i); box.showModal(); document.documentElement.classList.add('photo-viewing'); });
  });
  var closeTimer;
  function closeGallery() {
    if (box.classList.contains('closing')) return;
    box.classList.add('closing');
    closeTimer = setTimeout(function () { box.close(); }, reduced ? 0 : 320);
  }
  box.querySelector('.lightbox-close').onclick = closeGallery;
  box.addEventListener('cancel', function (event) { event.preventDefault(); closeGallery(); });
  box.querySelector('.lightbox-prev').onclick = function () { show(current - 1); };
  box.querySelector('.lightbox-next').onclick = function () { show(current + 1); };
  box.addEventListener('click', function (e) { if (e.target === box) closeGallery(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });
  box.addEventListener('close', function () { clearTimeout(closeTimer); box.classList.remove('closing'); clearTimeout(timer); document.documentElement.classList.remove('photo-viewing'); if (opener) opener.focus({ preventScroll: true }); });
})();
