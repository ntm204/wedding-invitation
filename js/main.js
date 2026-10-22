// Bản Việt: tấm sơn mài khảm vỏ trứng thành vầng trăng theo nhịp cuộn, hộp trầu (nắp khảm, lòng sơn son có trầu cau), thớ giấy dó, nút sao chép số điện thoại.
(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Khảm vỏ trứng ──
  var DEN = '#16100D', VANG = '#C9A45C';
  var EGG = ['#F4ECDD', '#EFE6D3', '#E9DEC8', '#F7F1E6', '#E4D7BE'];
  var EGG_HUN = ['#D9C8A8', '#CDB894', '#C1A983', '#B59C76']; // vỏ trứng hun: tông ấm, đậm hơn, để đánh khối

  function seeded(n) { return function () { n = (n * 16807) % 2147483647; return n / 2147483647; }; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t * t * (3 - 2 * t); }

  // Cắt đa giác lồi theo nửa mặt phẳng nx*x + ny*y <= d
  function clip(poly, nx, ny, d) {
    var out = [], n = poly.length;
    for (var i = 0; i < n; i += 2) {
      var ax = poly[i], ay = poly[i + 1], bx = poly[(i + 2) % n], by = poly[(i + 3) % n];
      var da = nx * ax + ny * ay - d, db = nx * bx + ny * by - d;
      if (da <= 0) out.push(ax, ay);
      if ((da <= 0) !== (db <= 0)) { var t = da / (da - db); out.push(ax + (bx - ax) * t, ay + (by - ay) * t); }
    }
    return out;
  }

  // Chia vùng thành các mảnh vỏ trứng (ô Voronoi), chừa khe sơn giữa các mảnh
  // o: { x0, y0, x1, y1, sp (cỡ mảnh), inside(x, y), circle: {cx, cy, r} | null, rect: {x0, y0, x1, y1} | null, seed, gap }
  function mosaic(o) {
    var rnd = seeded(o.seed), sp = o.sp, sites = [], grid = {};
    var cols = Math.ceil((o.x1 - o.x0) / sp) + 4, rows = Math.ceil((o.y1 - o.y0) / sp) + 4;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var x = o.x0 - 2 * sp + (i + .5 + (rnd() - .5) * .85) * sp, y = o.y0 - 2 * sp + (j + .5 + (rnd() - .5) * .85) * sp;
      grid[i + ',' + j] = sites.length; sites.push([x, y, i, j]);
    }
    var cells = [];
    sites.forEach(function (s) {
      if (!o.inside(s[0], s[1])) return;
      var r = sp * 1.7, poly = [s[0] - r, s[1] - r, s[0] + r, s[1] - r, s[0] + r, s[1] + r, s[0] - r, s[1] + r];
      for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) {
        if (!di && !dj) continue;
        var k = grid[(s[2] + di) + ',' + (s[3] + dj)]; if (k === undefined) continue;
        var n = sites[k], nx = n[0] - s[0], ny = n[1] - s[1];
        poly = clip(poly, nx, ny, nx * (s[0] + n[0]) / 2 + ny * (s[1] + n[1]) / 2);
      }
      if (o.circle) {
        var c = o.circle, dx = s[0] - c.cx, dy = s[1] - c.cy;
        if (Math.sqrt(dx * dx + dy * dy) > c.r - 2.2 * sp) for (var a = 0; a < 48; a++) {
          var ca = Math.cos(a / 48 * Math.PI * 2), sa = Math.sin(a / 48 * Math.PI * 2);
          poly = clip(poly, ca, sa, ca * c.cx + sa * c.cy + c.r);
        }
      }
      if (o.rect) { var R = o.rect; poly = clip(poly, -1, 0, -R.x0); poly = clip(poly, 1, 0, R.x1); poly = clip(poly, 0, -1, -R.y0); poly = clip(poly, 0, 1, R.y1); }
      if (poly.length < 6) return;
      var cx = 0, cy = 0, m = poly.length / 2;
      for (var q = 0; q < poly.length; q += 2) { cx += poly[q]; cy += poly[q + 1]; }
      cx /= m; cy /= m;
      var avg = 0;
      for (q = 0; q < poly.length; q += 2) avg += Math.sqrt((poly[q] - cx) * (poly[q] - cx) + (poly[q + 1] - cy) * (poly[q + 1] - cy));
      avg /= m;
      var shrink = Math.max(.35, 1 - o.gap / (avg || 1));
      for (q = 0; q < poly.length; q += 2) { poly[q] = cx + (poly[q] - cx) * shrink; poly[q + 1] = cy + (poly[q + 1] - cy) * shrink; }
      cells.push({ pts: poly, cx: cx, cy: cy, tone: EGG[Math.floor(rnd() * EGG.length)], r: rnd() });
    });
    return cells;
  }

  // Một mảnh vỏ trứng: màu ngà không đều, mép trên sáng hơn như mặt vỏ cong
  function cell(c, m, scale, alpha) {
    var p = m.pts;
    c.globalAlpha = alpha;
    c.beginPath();
    for (var i = 0; i < p.length; i += 2) {
      var x = m.cx + (p[i] - m.cx) * scale, y = m.cy + (p[i + 1] - m.cy) * scale;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath(); c.fillStyle = m.tone; c.fill();
    c.globalAlpha = alpha * .35; c.strokeStyle = '#FFFFFF'; c.lineWidth = .5; c.stroke();
    c.globalAlpha = 1;
  }

  // Mặt sơn mài: đen ánh nâu cánh gián, vệt bóng sau khi mài, vài vảy vàng dát
  function lacquer(c, W, H, hx, hy, seed) {
    var rnd = seeded(seed);
    c.globalAlpha = 1; c.fillStyle = DEN; c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(hx, hy, 0, hx, hy, Math.max(W, H) * .8);
    g.addColorStop(0, 'rgba(96,48,26,.62)'); g.addColorStop(.55, 'rgba(60,30,18,.25)'); g.addColorStop(1, 'rgba(22,16,13,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var s = c.createLinearGradient(0, 0, W, H);
    s.addColorStop(0, 'rgba(255,240,220,0)'); s.addColorStop(.48, 'rgba(255,240,220,0)'); s.addColorStop(.52, 'rgba(255,240,220,.05)'); s.addColorStop(.58, 'rgba(255,240,220,0)'); s.addColorStop(1, 'rgba(255,240,220,0)');
    c.fillStyle = s; c.fillRect(0, 0, W, H);
    for (var i = 0; i < Math.round(W * H / 9000); i++) {
      var x = rnd() * W, y = rnd() * H, z = .8 + rnd() * 2.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + z * (rnd() + .3), y + z * (rnd() - .5)); c.lineTo(x + z * (rnd() - .5), y + z * (rnd() + .3)); c.closePath();
      c.globalAlpha = .35 + rnd() * .5; c.fillStyle = VANG; c.fill();
    }
    c.globalAlpha = 1;
  }

  // Vầng trăng khảm vỏ trứng; mảnh được khảm dần theo vòng như tay thợ
  function moon(W, H) {
    var r = Math.min(W * .36, H * .2, 230), cx = W / 2, cy = Math.max(r + 40, H * .32);
    var cells = mosaic({ x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r, sp: Math.max(11, r / 12.5), seed: 1212, gap: 1.15,
      inside: function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }, circle: { cx: cx, cy: cy, r: r } });
    var rnd = seeded(31);
    cells.forEach(function (m) {
      var a = (Math.atan2(m.cx - cx, cy - m.cy) / (Math.PI * 2) + 1) % 1; m.key = a * .8 + rnd() * .2;
      // Ánh sáng từ trên trái: nửa dưới phải dùng vỏ trứng hun, càng ra mép càng đậm
      var shade = ((m.cx - cx) * .55 + (m.cy - cy) * .83) / r;
      if (rnd() < clamp(shade * .9 + .05)) m.tone = EGG_HUN[Math.min(EGG_HUN.length - 1, Math.floor(clamp(shade) * EGG_HUN.length * rnd() * 1.6))];
    });
    cells.slice().sort(function (a, b) { return a.key - b.key; }).forEach(function (m, i, arr) { m.t = i / arr.length * .86; });
    return { cx: cx, cy: cy, r: r, cells: cells };
  }
  function drawMoonBase(c, W, H, mo) {
    lacquer(c, W, H, mo.cx, mo.cy * .9, 7);
    c.beginPath(); c.arc(mo.cx, mo.cy, mo.r + 10, 0, Math.PI * 2); c.strokeStyle = VANG; c.globalAlpha = .75; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.arc(mo.cx, mo.cy, mo.r + 16, 0, Math.PI * 2); c.globalAlpha = .3; c.stroke();
    c.globalAlpha = 1;
  }
  function drawMoon(c, mo, p) {
    mo.cells.forEach(function (m) {
      var f = clamp((p - m.t) / .12);
      if (f > 0) cell(c, m, .5 + .5 * ease(f), ease(f));
    });
  }

  // Nắp hộp trầu: viền khảm vỏ trứng (4 cạnh cắt thẳng như đã mài), hai chỉ vàng, mề đay trăng phía trên
  function drawLid(c, W, H) {
    lacquer(c, W, H, W * .5, H * .25, 11);
    var m = 14, b = 11, my = m + b + 54, mr = 34;
    var strips = [
      { x0: m, y0: m, x1: W - m, y1: m + b }, { x0: m, y0: H - m - b, x1: W - m, y1: H - m },
      { x0: m, y0: m + b, x1: m + b, y1: H - m - b }, { x0: W - m - b, y0: m + b, x1: W - m, y1: H - m - b }
    ];
    strips.forEach(function (R, i) {
      mosaic({ x0: R.x0, y0: R.y0, x1: R.x1, y1: R.y1, sp: 5.2, seed: 5 + i, gap: .7, rect: R, circle: null,
        inside: function (x, y) { return x >= R.x0 && x <= R.x1 && y >= R.y0 && y <= R.y1; } })
        .forEach(function (k) { cell(c, k, 1, 1); });
    });
    mosaic({ x0: W / 2 - mr, y0: my - mr, x1: W / 2 + mr, y1: my + mr, sp: 5.6, seed: 9, gap: .65,
      inside: function (x, y) { return (x - W / 2) * (x - W / 2) + (y - my) * (y - my) <= mr * mr; }, circle: { cx: W / 2, cy: my, r: mr } })
      .forEach(function (k) { cell(c, k, 1, 1); });
    c.strokeStyle = VANG; c.lineWidth = 1;
    c.globalAlpha = .75; c.strokeRect(m - 4.5, m - 4.5, W - 2 * m + 9, H - 2 * m + 9);
    c.globalAlpha = .6; c.strokeRect(m + b + 4.5, m + b + 4.5, W - 2 * (m + b) - 9, H - 2 * (m + b) - 9);
    c.beginPath(); c.arc(W / 2, my, mr + 6, 0, Math.PI * 2); c.globalAlpha = .75; c.stroke();
    c.globalAlpha = 1;
  }

  // Lòng hộp: ngoài sơn then, trong sơn son; lá trầu (hình tim, mũi nhọn dài) và quả cau
  function leafTrau(c, x, y, ang, h, w, rnd) {
    c.save(); c.translate(x, y); c.rotate(ang);
    var k = .94 + rnd() * .12; // hai nửa lá hơi lệch nhau như lá thật
    function half(sd, q) {
      c.bezierCurveTo(sd * w * .05 * q, -h * .94, sd * w * .14 * q, -h * .87, sd * w * .27 * q, -h * .79);
      c.bezierCurveTo(sd * w * .6 * q, -h * .6, sd * w * .66 * q, -h * .3, sd * w * .5 * q, -h * .13);
      c.bezierCurveTo(sd * w * .36 * q, -h * .01, sd * w * .13 * q, h * .03, 0, -h * .05);
    }
    c.beginPath(); c.moveTo(0, -h); half(1, k);
    c.moveTo(0, -h); half(-1, 2 - k);
    var g = c.createLinearGradient(-w * .6, -h * .2, w * .6, -h * .7);
    g.addColorStop(0, '#2B5120'); g.addColorStop(.5, '#4A7A2E'); g.addColorStop(1, '#2F5A22');
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(18,36,12,.6)'; c.lineWidth = .8; c.stroke();
    c.save(); c.clip();
    var hl = c.createRadialGradient(-w * .16, -h * .58, 0, -w * .16, -h * .58, w * .55);
    hl.addColorStop(0, 'rgba(225,240,180,.3)'); hl.addColorStop(1, 'rgba(225,240,180,0)');
    c.fillStyle = hl; c.fillRect(-w, -h * 1.1, w * 2, h * 1.3);
    // Gân lá trầu: gân giữa và hai cặp gân cong chạy từ cuống lên gần mũi lá
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -h * .05); c.quadraticCurveTo(w * .02, -h * .5, 0, -h * .97);
    c.strokeStyle = 'rgba(200,222,150,.62)'; c.lineWidth = 1.3; c.stroke();
    [[.17, .3, .9], [.33, .22, .7]].forEach(function (v) {
      [-1, 1].forEach(function (sd) {
        c.beginPath(); c.moveTo(0, -h * .06);
        c.bezierCurveTo(sd * w * v[0] * 1.6, -h * v[1], sd * w * v[0] * 1.5, -h * (v[2] - .25), sd * w * .04, -h * v[2]);
        c.strokeStyle = 'rgba(200,222,150,.36)'; c.lineWidth = .9; c.stroke();
      });
    });
    // Gân nhỏ nối ngang
    for (var i = 0; i < 9; i++) {
      var t = .2 + rnd() * .55, sd = rnd() < .5 ? -1 : 1, x0 = sd * w * .06, y0 = -h * t;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(sd * w * (.18 + rnd() * .2), y0 + h * (rnd() * .06 - .03));
      c.strokeStyle = 'rgba(200,222,150,.16)'; c.lineWidth = .6; c.stroke();
    }
    c.restore();
    c.beginPath(); c.moveTo(0, -h * .05); c.quadraticCurveTo(w * .03, h * .06, -w * .02, h * .14); c.strokeStyle = '#55642A'; c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke();
    c.restore();
  }
  // Quả cau hình trứng, đầu có núm đài; cau bổ đôi lộ ruột trắng ngà vân nâu loang
  function egg(c, rx, ry) {
    c.beginPath(); c.moveTo(0, -ry);
    c.bezierCurveTo(rx * .62, -ry, rx, -ry * .45, rx, ry * .1);
    c.bezierCurveTo(rx, ry * .62, rx * .5, ry, 0, ry);
    c.bezierCurveTo(-rx * .5, ry, -rx, ry * .62, -rx, ry * .1);
    c.bezierCurveTo(-rx, -ry * .45, -rx * .62, -ry, 0, -ry);
    c.closePath();
  }
  function cau(c, x, y, rx, ry, ang, halved, rnd) {
    c.save(); c.translate(x, y); c.rotate(ang);
    if (!halved) {
      egg(c, rx, ry);
      var g = c.createRadialGradient(-rx * .35, -ry * .35, 0, 0, ry * .1, ry * 1.15);
      g.addColorStop(0, '#E2C766'); g.addColorStop(.45, '#B9A944'); g.addColorStop(.8, '#8C8A32'); g.addColorStop(1, '#5F6522');
      c.fillStyle = g; c.fill();
      c.save(); c.clip();
      var blush = c.createRadialGradient(rx * .45, ry * .45, 0, rx * .45, ry * .45, rx * 1.1);
      blush.addColorStop(0, 'rgba(214,120,40,.55)'); blush.addColorStop(1, 'rgba(214,120,40,0)');
      c.fillStyle = blush; c.fillRect(-rx, -ry, rx * 2, ry * 2);
      c.restore();
      c.strokeStyle = 'rgba(50,45,12,.5)'; c.lineWidth = .8; egg(c, rx, ry); c.stroke();
      // Núm đài cau: các lá đài nhỏ úp lên đầu quả
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 + (i - 2) * .42;
        c.beginPath(); c.ellipse(Math.cos(a) * rx * .2, -ry * .88 + Math.sin(a) * rx * .12 + rx * .12, rx * .2, rx * .1, a, 0, Math.PI * 2);
        c.fillStyle = '#6B5E24'; c.fill();
      }
    } else {
      egg(c, rx, ry); c.fillStyle = '#A9692A'; c.fill();
      c.strokeStyle = 'rgba(70,35,10,.6)'; c.lineWidth = .8; c.stroke();
      // Thớ xơ vỏ cau
      c.save(); egg(c, rx, ry); c.clip();
      for (var f = 0; f < 46; f++) {
        var fa = f / 46 * Math.PI * 2;
        c.beginPath(); c.moveTo(Math.cos(fa) * rx * .76, Math.sin(fa) * ry * .78); c.lineTo(Math.cos(fa) * rx * 1.02, Math.sin(fa) * ry * 1.02);
        c.strokeStyle = 'rgba(232,170,90,.35)'; c.lineWidth = .7; c.stroke();
      }
      c.restore();
      c.save(); c.translate(0, ry * .04); egg(c, rx * .7, ry * .72); c.fillStyle = '#EFE1C2'; c.fill(); c.clip();
      // Vân ruột cau: các đường nâu lượn loang, không đều
      c.strokeStyle = 'rgba(128,74,42,.5)'; c.lineCap = 'round';
      for (var v = 0; v < 11; v++) {
        var y0 = -ry * .7 + v / 10 * ry * 1.4, amp = rx * (.1 + rnd() * .14), ph = rnd() * 6;
        c.beginPath(); c.moveTo(-rx, y0);
        for (var xx = -rx; xx <= rx; xx += rx / 6) c.lineTo(xx, y0 + Math.sin(xx / rx * 3.2 + ph) * amp + (rnd() - .5) * amp * .5);
        c.lineWidth = .7 + rnd() * 1.1; c.stroke();
      }
      c.restore();
    }
    c.restore();
  }
  function drawRuot(c, W, H) {
    var rnd = seeded(21);
    c.fillStyle = DEN; c.fillRect(0, 0, W, H);
    var t = 12, g = c.createRadialGradient(W / 2, H * .45, 10, W / 2, H * .5, Math.max(W, H) * .7);
    g.addColorStop(0, '#8A3324'); g.addColorStop(.6, '#6A2218'); g.addColorStop(1, '#4A1610');
    c.fillStyle = g; c.fillRect(t, t, W - 2 * t, H - 2 * t);
    var sh = c.createLinearGradient(0, t, 0, t + 30);
    sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sh; c.fillRect(t, t, W - 2 * t, 30);
    c.strokeStyle = VANG; c.globalAlpha = .65; c.lineWidth = 1; c.strokeRect(t + 6.5, t + 6.5, W - 2 * t - 13, H - 2 * t - 13); c.globalAlpha = 1;
    var bx = W / 2, by = H * .64, h = Math.min(W * .54, H * .42);
    c.save(); c.shadowColor = 'rgba(25,4,2,.5)'; c.shadowBlur = 16; c.shadowOffsetY = 7;
    leafTrau(c, bx - 10, by, -.5, h * .86, h * .56, rnd);
    leafTrau(c, bx + 12, by + 2, .42, h * .9, h * .58, rnd);
    leafTrau(c, bx, by + 6, -.04, h, h * .62, rnd);
    cau(c, bx - W * .19, by + h * .1, h * .15, h * .19, -.25, true, rnd);
    cau(c, bx + W * .17, by + h * .06, h * .14, h * .18, .3, false, rnd);
    cau(c, bx + W * .25, by + h * .2, h * .13, h * .17, -.15, false, rnd);
    c.restore();
  }

  // ── Gắn vào trang ──

  // Thớ giấy dó: sợi dài và vụn vỏ cây li ti
  function makeDo() {
    var n = 260, cv = document.createElement('canvas'); cv.width = cv.height = n;
    var c = cv.getContext('2d'), rnd = seeded(3);
    c.lineCap = 'round';
    for (var i = 0; i < 150; i++) {
      var x = rnd() * n, y = rnd() * n, a = rnd() * Math.PI * 2, l = 10 + rnd() * 34;
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a + .5) * l / 2, y + Math.sin(a + .5) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.strokeStyle = 'rgba(120,90,60,' + (.05 + rnd() * .08) + ')'; c.lineWidth = .5 + rnd() * .6; c.stroke();
    }
    for (i = 0; i < 70; i++) { c.beginPath(); c.arc(rnd() * n, rnd() * n, .4 + rnd() * .9, 0, Math.PI * 2); c.fillStyle = 'rgba(90,60,40,' + (.12 + rnd() * .2) + ')'; c.fill(); }
    return cv.toDataURL('image/png');
  }
  try { document.documentElement.style.setProperty('--do-grain', 'url(' + makeDo() + ')'); } catch (e) {}

  function fit(cv) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth || window.innerWidth, H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c: c, W: W, H: H, dpr: dpr };
  }

  var hero = document.getElementById('hero'), moonCv = document.querySelector('canvas[data-mosaic="moon"]'), lidCv = document.querySelector('canvas[data-mosaic="lid"]'), ruotCv = document.querySelector('canvas[data-mosaic="ruot"]');
  var M = null;
  function setup() {
    if (lidCv && lidCv.offsetParent !== null) { var L = fit(lidCv); drawLid(L.c, L.W, L.H); }
    if (ruotCv && ruotCv.offsetParent !== null) { var Q = fit(ruotCv); drawRuot(Q.c, Q.W, Q.H); }
    var f = fit(moonCv), mo = moon(f.W, f.H), base = document.createElement('canvas');
    base.width = moonCv.width; base.height = moonCv.height;
    var bc = base.getContext('2d'); bc.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
    drawMoonBase(bc, f.W, f.H, mo);
    M = { c: f.c, mo: mo, base: base, last: -1 };
  }
  function progress() {
    var r = hero.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - window.innerHeight) / .9);
  }
  // Lúc mở trang đã khảm sẵn một phần trăng; cuộn hết phần đầu là trăng tròn
  function paint() {
    var p = still ? 1 : .3 + .7 * progress(), key = Math.round(p * 600);
    if (key === M.last) return;
    M.last = key;
    var c = M.c;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(M.base, 0, 0); c.restore();
    drawMoon(c, M.mo, p);
  }
  setup(); paint();
  var ticking = false, resizeId;
  if (!still) window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; paint(); }); } }, { passive: true });
  window.addEventListener('resize', function () { clearTimeout(resizeId); resizeId = setTimeout(function () { setup(); paint(); }, 200); });

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
