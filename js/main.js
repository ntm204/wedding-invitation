// Hiệu ứng cuộn (tên thu về logo, album ảnh), đếm ngày J – n, nút sao chép số điện thoại.
(function () {
  // Co giãn chữ để mỗi nhóm vừa đúng bề ngang khung
  function fitAll() {
    var groups = {};
    document.querySelectorAll('.fit').forEach(function (el) { (groups[el.dataset.group] = groups[el.dataset.group] || []).push(el); });
    Object.keys(groups).forEach(function (k) {
      var size = Infinity;
      groups[k].forEach(function (el) {
        var box = el.parentNode, cs = getComputedStyle(box);
        var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        el.style.fontSize = '100px';
        var w = el.scrollWidth || 1;
        size = Math.min(size, 100 * avail / w);
      });
      groups[k].forEach(function (el) { el.style.fontSize = (size * .995) + 'px'; });
    });
  }

  var lock = document.getElementById('lock'), bar = document.getElementById('bar'), hero = document.getElementById('hero');
  var meta = hero.querySelector('.hero-meta');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, lockH = 0, y0 = 0, ticking = false;
  function layout() {
    fitAll();
    lockH = lock.offsetHeight;
    if (!still) hero.style.paddingTop = (lockH + 24) + 'px';
    y0 = Math.max(0, meta.offsetTop - lockH - 20);
    update();
  }
  function update() {
    ticking = false;
    if (still) return;
    var sc = window.scrollY;
    var target = 40 / Math.max(1, lockH - 9);
    // Tên trôi theo trang rồi dừng ở đầu, đồng thời thu nhỏ thành logo
    var y = Math.max(0, y0 - sc);
    var t = Math.min(1, Math.max(0, sc / (y0 + lockH * .7)));
    var s = 1 + (target - 1) * (t * t * (3 - 2 * t));
    var room = (meta.offsetTop - sc - y - 10) / lockH;
    if (sc < meta.offsetTop + meta.offsetHeight) s = Math.min(s, Math.max(target, room));
    s = Math.max(target, Math.min(1, s));
    lock.style.transform = 'translateY(' + y + 'px) scale(' + s + ')';
    bar.style.opacity = String(Math.max(0, Math.min(1, (1 - s) / (1 - target) * 6 - 5)));
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', layout);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  // Album: khung ảnh mở rộng và ảnh lùi nhẹ theo nhịp cuộn
  var shots = [].slice.call(document.querySelectorAll('[data-shot]'));
  function scrub() {
    var vh = window.innerHeight;
    shots.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var enter = Math.min(1, Math.max(0, (vh - r.top) / (vh * .65)));
      var pass = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      var e = enter * enter * (3 - 2 * enter);
      el.style.setProperty('--inset', ((1 - e) * 7).toFixed(2) + '%');
      el.style.setProperty('--zoom', (1.14 - .14 * pass).toFixed(4));
    });
  }
  if (!still) {
    var sTick = false;
    window.addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(function () { sTick = false; scrub(); }); } }, { passive: true });
    window.addEventListener('resize', scrub);
    scrub();
  }

  // J – ngày (giờ Việt Nam)
  var day = 864e5, wedding = Date.parse('2026-12-12T00:00:00+07:00');
  var today = Math.floor((Date.now() + 7 * 36e5) / day) * day - 7 * 36e5;
  var left = Math.round((wedding - today) / day);
  var jour = document.getElementById('jour'), note = document.getElementById('jour-note');
  if (left > 0) { jour.textContent = 'J – ' + left; note.textContent = 'còn ' + left + ' ngày · ' + left + (left === 1 ? ' day' : ' days') + ' to go'; }
  else if (left === 0) { jour.textContent = 'Jour J'; note.textContent = 'chính là hôm nay · today is the day'; }
  else { jour.textContent = 'Merci'; note.textContent = 'cảm ơn bạn đã đến · thank you for coming'; }

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
