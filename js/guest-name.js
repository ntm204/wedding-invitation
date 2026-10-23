// Mã hoá tên khách thành chuỗi ngắn, an toàn trong URL. Dùng chung cho invite.html và js/invite.js.
// a–z, 0–9 giữ nguyên; A–W: dấu (mũ/trăng/móc × thanh) ngay sau chữ; X: đ; Y: đảo hoa/thường so với mặc định
// (chữ đầu từ viết hoa); Z + 3 ký tự: ký tự khác theo mã Unicode; _: dấu cách; -: " & ".
(function () {
  var MODS = ['', '̂', '̆', '̛'], TONES = ['', '̀', '́', '̉', '̃', '̣'];
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function startsWord(previous) { return !/\p{L}/u.test(previous || ''); }

  function encode(name) {
    var chars = Array.from(name.normalize('NFC').replace(/\s+/g, ' ').trim()), out = '', previous = '';
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      if (c === ' ' && chars[i + 1] === '&' && chars[i + 2] === ' ') { out += '-'; previous = ' '; i += 2; continue; }
      if (c === ' ') { out += '_'; previous = c; continue; }
      if (/[0-9]/.test(c)) { out += c; previous = c; continue; }
      var lower = c.toLowerCase(), parts = Array.from(lower.normalize('NFD')), base = parts[0];
      var mod = 0, tone = 0, ok = c.length === 1 && (/[a-z]/.test(base) || lower === 'đ');
      parts.slice(1).forEach(function (mark) {
        var m = MODS.indexOf(mark), t = TONES.indexOf(mark);
        if (m > 0 && !mod) mod = m; else if (t > 0 && !tone) tone = t; else ok = false;
      });
      if (ok) {
        if ((c !== lower) !== startsWord(previous)) out += 'Y';
        out += lower === 'đ' ? 'X' : base;
        if (mod || tone) out += String.fromCharCode(64 + mod * 6 + tone);
      } else {
        var cp = c.codePointAt(0);
        out += 'Z' + B64[cp >> 12 & 63] + B64[cp >> 6 & 63] + B64[cp & 63];
      }
      previous = c;
    }
    return out;
  }

  function decode(code) {
    var out = '', toggle = false;
    for (var i = 0; i < code.length; i++) {
      var c = code[i];
      if (c === '_') out += ' ';
      else if (c === '-') out += ' & ';
      else if (/[0-9]/.test(c)) out += c;
      else if (c === 'Y') toggle = true;
      else if (c === 'Z') {
        var digits = code.slice(i + 1, i + 4).split('').map(function (d) { return B64.indexOf(d); });
        if (digits.length < 3 || digits.indexOf(-1) >= 0) throw new Error('bad code');
        out += String.fromCodePoint(digits[0] << 12 | digits[1] << 6 | digits[2]); i += 3;
      } else if (/[a-zX]/.test(c)) {
        var letter = c === 'X' ? 'đ' : c, next = code[i + 1];
        if (next && next >= 'A' && next <= 'W') {
          var n = next.charCodeAt(0) - 64;
          letter = (letter + MODS[Math.floor(n / 6)] + TONES[n % 6]).normalize('NFC'); i++;
        }
        if (startsWord(Array.from(out).pop()) !== toggle) letter = letter.toUpperCase();
        out += letter; toggle = false;
      } else throw new Error('bad code');
    }
    return out;
  }

  window.GuestName = { encode: encode, decode: decode };
})();
