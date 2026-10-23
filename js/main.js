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
  // Only the cue line reads --story-progress; setting it on .hero restyled the whole hero.
  var cue = hero.querySelector('.scroll-cue span') || hero, written = new Map();
  function write(el, name, value) {
    var key = written.get(el) || {}; if (key[name] === value) return;
    key[name] = value; written.set(el, key); el.style.setProperty(name, value);
  }
  var photos = Array.from(document.querySelectorAll('.ph'));
  var pending = false, frame = 0, position = 0, target = 0, previousTime = 0;
  function render(now) {
    pending = false;
    var delta = previousTime ? Math.min(64, now - previousTime) : 16;
    previousTime = now;
    // Measure everything before writing: interleaving forced a style recalc per photo.
    var h = innerHeight, r = hero.getBoundingClientRect();
    var rects = photos.map(function (photo) { return photo.getBoundingClientRect(); });
    target = query.matches ? 0 : Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - h)));
    position += (target - position) * (1 - Math.exp(-delta / 150));
    if (Math.abs(target - position) < .001) position = target;
    write(cue, '--story-progress', position.toFixed(4));
    write(portrait, '--drift', (-position * 26).toFixed(2) + 'px');
    photos.forEach(function (photo, i) {
      var bounds = rects[i];
      if (bounds.bottom > -80 && bounds.top < h + 80) {
        var travel = query.matches ? 0 : Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - h / 2) / h));
        write(photo, '--photo-drift', (travel * 14).toFixed(2) + 'px');
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

// A continuous thread records the reading journey; scrolling back never erases it.
(function () {
  var main = document.getElementById('invitation');
  var svg = document.querySelector('.story-thread');
  if (!main || !svg) return;
  var line = svg.querySelector('#thread-spine'), windowRect = svg.querySelector('.thread-window');
  var piercings = svg.querySelector('.thread-piercings');
  var trace = svg.querySelector('.thread-trace'), mask = svg.querySelector('#thread-reveal');
  var light = svg.querySelector('.thread-ply-light'), shade = svg.querySelector('.thread-ply-shade');
  var stitches = svg.querySelector('#thread-stitches'), paper = svg.querySelector('.thread-paper');
  var buried = svg.querySelector('.thread-buried'), crossingGroup = svg.querySelector('.thread-crossings');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var reached = 0, drawn = 0, total = 1, length = 1, samples = [], scheduled = false, last = 0;
  var table = { x: [0], y: [0], at: [0] }, scale = 1;
  // Scroll metrics are read in scroll/resize events, while layout is still clean;
  // reading them inside the frame forced a recalc after the parallax style writes.
  var mainTop = 0, viewTop = 0, viewHeight = innerHeight, pageHeight = 0;
  function measure() { viewTop = scrollY; viewHeight = innerHeight; pageHeight = document.documentElement.scrollHeight; }
  var layoutFrame = 0, layoutKey = '', crossings = [], opened = document.documentElement.classList.contains('invitation-open');
  function element(tag, attributes, parent) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    parent.appendChild(node);
    return node;
  }
  function layout() {
    layoutFrame = 0;
    var width = svg.getBoundingClientRect().width, center = width / 2;
    var start = main.getBoundingClientRect().top + scrollY;
    mainTop = start; measure();
    var chapters = Array.from(document.querySelectorAll('.block')).map(function (section) {
      return section.getBoundingClientRect().top + scrollY - start + parseFloat(getComputedStyle(section, '::before').top) + 10;
    });
    var nextTotal = main.scrollHeight, key = [width, nextTotal].concat(chapters).join(',');
    if (key === layoutKey) return;
    layoutKey = key;
    var oldLength = length, oldReached = reached, oldDrawn = drawn;
    total = nextTotal;
    var spread = width > 24 ? 1.5 : .85;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + total);
    mask.setAttribute('height', total);
    stitches.setAttribute('height', total); paper.setAttribute('height', total);
    // The path and its arc-length table are built together: getPointAtLength
    // re-measures the whole page-long path on every call and blocked loading for seconds.
    var d = '', run = 0, penX = 0, penY = 0;
    table = { x: [], y: [], at: [] };
    function plot(x, y) {
      run += Math.hypot(x - penX, y - penY); penX = x; penY = y;
      table.x.push(x); table.y.push(y); table.at.push(run);
    }
    function steps(polygon) { return Math.max(1, Math.ceil(polygon / .5)); }
    function moveTo(x, y) { d += 'M ' + x + ' ' + y; penX = x; penY = y; plot(x, y); }
    function lineTo(x, y) { d += ' L ' + x + ' ' + y; plot(x, y); }
    function quadTo(x1, y1, x, y) {
      d += ' Q ' + x1 + ' ' + y1 + ' ' + x + ' ' + y;
      var x0 = penX, y0 = penY, n = steps(Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x - x1, y - y1));
      for (var i = 1; i <= n; i++) {
        var t = i / n, u = 1 - t;
        plot(u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y);
      }
    }
    function curveTo(x1, y1, x2, y2, x, y) {
      d += ' C ' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' ' + x + ' ' + y;
      var x0 = penX, y0 = penY, n = steps(Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2));
      for (var i = 1; i <= n; i++) {
        var t = i / n, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
        plot(a * x0 + b * x1 + c * x2 + e * x, a * y0 + b * y1 + c * y2 + e * y);
      }
    }
    moveTo(center - 2, -4);
    curveTo(center - 6, 28, center + 4, 54, center, 96);
    var previousY = 96, previousX = center;
    piercings.replaceChildren(); buried.replaceChildren(); crossingGroup.replaceChildren(); crossings = [];
    chapters.forEach(function (y, i) {
      // The seam meets the chapter number, then passes underneath the sheet.
      var x = center + (i % 2 ? -2 : 1) * spread;
      var distance = Math.max(30, y - previousY);
      curveTo(previousX + (i % 2 ? 6 : -6) * spread, previousY + distance * .32,
        x + (i % 2 ? -5 : 5) * spread, y - distance * .25, x, y - 32);
      if (i === 0 || i === 3) {
        // Two slack loops; the second pass crosses above the first at (x, y - 18).
        var turn = i === 0 ? 1 : -1, bend = turn * spread;
        curveTo(x, y - 27, x - 3 * bend, y - 24, x, y - 18);
        curveTo(x + 14 * bend, y + 4, x - 14 * bend, y + 5, x - 7 * bend, y - 9);
        curveTo(x - 5 * bend, y - 14, x - 2 * bend, y - 17, x, y - 18);
        crossings.push({ distance: run });
        curveTo(x + 5 * bend, y - 21, x + 4 * bend, y - 9, x, y - 1);
      } else {
        quadTo(x - 1, y - 7, x, y - 1);
      }
      // Keep ONE continuous path: SVG dash progress restarts at each M command.
      // A separate paper mask hides the small length that passes under the sheet.
      lineTo(x + .4, y + 7); quadTo(x + 1, y + 17, x, y + 28);
      element('rect', { x: x - 4, y: y, width: 8, height: 6 }, buried);
      [y - .3, y + 6.3].forEach(function (cy, j) {
        var cx = x + j * .4;
        element('ellipse', { cx: cx, cy: cy, rx: 1.4, ry: .7, transform: 'rotate(-18 ' + cx + ' ' + cy + ')' }, piercings);
      });
      previousY = y + 28; previousX = x;
    });
    curveTo(center + 6, previousY + (total - previousY) * .38, center - 5, total - 75, center, total - 30);
    quadTo(center + 4, total - 16, center - 4, total - 12);
    line.setAttribute('d', d);
    // One native measurement keeps the dash mask exact; the table is scaled to it.
    length = line.getTotalLength();
    scale = run / (length || 1);
    crossings.forEach(function (crossing) { crossing.distance /= scale; });
    // Two fine plies twist around the actual curve, including its loops.
    // Geometry is rebuilt only on layout changes; scroll updates just the reveal.
    var paths = ['', ''], highY = 0, active = [false, false];
    samples = [{ y: 0, distance: 0 }];
    for (var s = 0; s <= length; s += 1.25) {
      var point = pointAt(s);
      var next = pointAt(Math.min(length, s + .7));
      var dx = next.x - point.x, dy = next.y - point.y, norm = Math.hypot(dx, dy) || 1;
      for (var ply = 0; ply < 2; ply++) {
        // Only the front-facing part catches light. A slowly varying pitch keeps
        // the material soft instead of making a repeating metallic zigzag.
        var phase = s * Math.PI * 2 / 7.5 + .28 * Math.sin(s / 43) + ply * Math.PI;
        var twist = Math.sin(phase) * (width > 24 ? .54 : .43);
        var visiblePly = Math.cos(phase) > -.15;
        if (visiblePly) paths[ply] += (active[ply] ? 'L' : 'M') + (point.x - dy / norm * twist).toFixed(2) + ' ' + (point.y + dx / norm * twist).toFixed(2);
        active[ply] = visiblePly;
      }
      highY = Math.max(highY, point.y);
      samples.push({ y: highY, distance: s });
    }
    samples.push({ y: total, distance: length });
    shade.setAttribute('d', paths[0]); light.setAttribute('d', paths[1]);
    crossings.forEach(function (crossing) {
      var bridge = '';
      for (var offset = -3.5; offset <= 3.5; offset += .5) {
        var p = pointAt(crossing.distance + offset);
        bridge += (offset === -3.5 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2);
      }
      crossing.node = element('g', { opacity: 0 }, crossingGroup);
      element('path', { d: bridge, class: 'thread-crossing-shadow' }, crossing.node);
      element('path', { d: bridge, class: 'thread-body' }, crossing.node);
      element('path', { d: bridge, class: 'thread-crossing-light', transform: 'translate(-.25 -.15)' }, crossing.node);
    });
    trace.setAttribute('stroke-dasharray', length + ' ' + length);
    // Resize and font reflow preserve the revealed proportion without a blank frame.
    reached = Math.min(length, oldReached / oldLength * length);
    drawn = Math.min(length, oldDrawn / oldLength * length);
    render();
    schedule();
  }
  function pointAt(distance) {
    var at = table.at, last = at.length - 1, target = Math.max(0, Math.min(at[last], distance * scale));
    var low = 0, high = last;
    while (low < high) {
      var middle = (low + high) >> 1;
      if (at[middle] < target) low = middle + 1; else high = middle;
    }
    var before = Math.max(0, low - 1), t = (target - at[before]) / (at[low] - at[before] || 1);
    return { x: table.x[before] + (table.x[low] - table.x[before]) * t, y: table.y[before] + (table.y[low] - table.y[before]) * t };
  }
  function distanceAt(y) {
    var low = 0, high = samples.length - 1;
    while (low < high) {
      var middle = Math.floor((low + high) / 2);
      if (samples[middle].y < y) low = middle + 1; else high = middle;
    }
    var after = samples[low], before = samples[Math.max(0, low - 1)];
    var t = (y - before.y) / (after.y - before.y || 1);
    return before.distance + (after.distance - before.distance) * Math.max(0, Math.min(1, t));
  }
  function render() {
    var tip = pointAt(drawn);
    windowRect.setAttribute('height', Math.max(0, tip.y).toFixed(2));
    trace.setAttribute('stroke-dashoffset', Math.max(0, length - drawn).toFixed(2));
    crossings.forEach(function (crossing) {
      crossing.node.setAttribute('opacity', Math.max(0, Math.min(1, (drawn - crossing.distance - 2) / 2)).toFixed(2));
    });
    svg.classList.add('is-ready');
  }
  function paint(now) {
    scheduled = false;
    if (!opened) return;
    var dt = last ? Math.min(64, now - last) : 16; last = now;
    var visible = Math.max(0, viewTop - mainTop + viewHeight * .78);
    reached = reduced.matches ? length : Math.max(reached, distanceAt(Math.min(total, visible)));
    if (viewTop + viewHeight >= pageHeight - 4) reached = length;
    // Ease in arc length, so a loop is traced in order instead of popping in at one Y.
    drawn = reduced.matches ? reached : drawn + (reached - drawn) * (1 - Math.exp(-dt / 280));
    if (Math.abs(reached - drawn) < .15) drawn = reached;
    render();
    if (drawn !== reached) schedule();
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  function scheduleLayout() { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); }
  addEventListener('scroll', function () { measure(); schedule(); }, { passive: true });
  addEventListener('resize', function () { measure(); scheduleLayout(); });
  addEventListener('load', scheduleLayout);
  addEventListener('invitation:open', function () { opened = true; last = 0; measure(); schedule(); });
  reduced.addEventListener('change', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleLayout).observe(main);
  layout();
})();
