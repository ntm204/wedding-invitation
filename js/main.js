// Giấy dó, nét chỉ duyên, chuyển động kể chuyện và album.
(function () {

  function seeded(n) { return function () { n = (n * 16807) % 2147483647; return n / 2147483647; }; }
  // ── Gắn vào trang ──

  // Thớ giấy dó: sợi dài và vụn vỏ cây li ti
  function makeDo() {
    var n = 260, cv = document.createElement('canvas'); cv.width = cv.height = n;
    var c = cv.getContext('2d'), rnd = seeded(3);
    c.lineCap = 'round';
    for (var i = 0; i < 65; i++) {
      var x = rnd() * n, y = rnd() * n, a = rnd() * Math.PI * 2, l = 10 + rnd() * 34;
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a + .5) * l / 2, y + Math.sin(a + .5) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.strokeStyle = 'rgba(120,90,60,' + (.018 + rnd() * .025) + ')'; c.lineWidth = .5 + rnd() * .6; c.stroke();
    }
    for (i = 0; i < 35; i++) { c.beginPath(); c.arc(rnd() * n, rnd() * n, .4 + rnd() * .9, 0, Math.PI * 2); c.fillStyle = 'rgba(90,60,40,' + (.04 + rnd() * .06) + ')'; c.fill(); }
    return cv.toDataURL('image/png');
  }
  try { document.documentElement.style.setProperty('--do-grain', 'url(' + makeDo() + ')'); } catch (e) {}

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

// Motion grammar: uncover ink, draw gold, open photographic panels.
(function () {
  var motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (!entry.isIntersecting) return;
        // Reveal once per page visit. Returning to read never restarts the entrance.
        el.classList.add('in-view');
        observer.unobserve(el);
      });
    }, { threshold: 0, rootMargin: '80px 0px -32px 0px' });
    document.querySelectorAll('.block').forEach(function (section) {
      Array.from(section.children).forEach(function (el, i) {
        if (el.classList.contains('album')) return;
        el.classList.add('motion-ink');
        el.style.setProperty('--enter-delay', Math.min(i * 45, 180) + 'ms');
        observer.observe(el);
      });
    });
    document.querySelectorAll('.ph').forEach(function (el, i) {
      el.classList.add('motion-photo');
      el.classList.toggle('from-right', i % 2 === 1);
      observer.observe(el);
    });
    document.querySelectorAll('.cuoi > *').forEach(function (el, i) {
      el.classList.add('motion-ink'); el.style.setProperty('--enter-delay', i * 80 + 'ms'); observer.observe(el);
    });
    motionQuery.addEventListener('change', function (event) {
      reduced = event.matches;
      if (reduced) {
        observer.disconnect();
        document.querySelectorAll('.motion-ink, .motion-photo').forEach(function (el) { el.classList.add('in-view'); });
      }
    });
  }
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

// Native scrolling drives a small, damped photographic offset. No wheel interception.
(function () {
  var query = matchMedia('(prefers-reduced-motion: reduce)');
  var hero = document.querySelector('.hero'), portrait = document.querySelector('.hero-portrait');
  var photos = Array.from(document.querySelectorAll('.ph'));
  var pending = false, frame = 0, position = 0, target = 0, previousTime = 0;
  function render(now) {
    pending = false;
    var delta = previousTime ? Math.min(64, now - previousTime) : 16;
    previousTime = now;
    var h = innerHeight, r = hero.getBoundingClientRect();
    target = query.matches ? 0 : Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - h)));
    position += (target - position) * (1 - Math.exp(-delta / 150));
    if (Math.abs(target - position) < .001) position = target;
    hero.style.setProperty('--story-progress', position.toFixed(4));
    portrait.style.setProperty('--drift', (-position * 26).toFixed(2) + 'px');
    photos.forEach(function (photo) {
      var bounds = photo.getBoundingClientRect();
      if (bounds.bottom > -80 && bounds.top < h + 80) {
        var travel = query.matches ? 0 : Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - h / 2) / h));
        photo.style.setProperty('--photo-drift', (travel * 14).toFixed(2) + 'px');
      }
    });
    if (position !== target) schedule();
  }
  function schedule() { if (!pending) { pending = true; frame = requestAnimationFrame(render); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  query.addEventListener('change', function () { cancelAnimationFrame(frame); pending = false; position = 0; schedule(); });
  schedule();
})();
