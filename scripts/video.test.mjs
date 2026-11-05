import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

test('hero defers downloads, chooses mobile video, pauses offscreen and honors reduced motion', () => {
  let observe;
  let motionChanged;
  let visibilityChanged;
  let plays = 0;
  let pauses = 0;
  let loads = 0;
  const source = { dataset: { src: 'desktop.mp4', mobileSrc: 'mobile.mp4' } };
  const video = { dataset: {}, querySelector: () => source, pause: () => pauses++, play: () => { plays++; return Promise.resolve(); }, load: () => loads++ };
  const preference = { matches: true, addEventListener: (_, fn) => { motionChanged = fn; } };
  const doc = { hidden: false, querySelector: () => video, addEventListener: (_, fn) => { visibilityChanged = fn; } };
  const snippet = readFileSync(new URL('../app.js', import.meta.url), 'utf8').split("  const video = document.querySelector('.hero-film');")[1];
  vm.runInNewContext(`(() => { const video = document.querySelector('.hero-film'); ${snippet}`, {
    document: doc, motionPreference: preference, saveData: false, stopWheel() {},
    matchMedia: () => ({ matches: true }),
    IntersectionObserver: class { constructor(fn) { observe = fn; } observe() {} },
  });
  observe([{ isIntersecting: true }]);
  assert.equal(loads, 0);
  assert.equal(source.src, undefined);
  preference.matches = false; motionChanged();
  assert.equal(source.src, 'mobile.mp4');
  assert.equal(loads, 1);
  assert.equal(plays, 1);
  observe([{ isIntersecting: false }]);
  assert.ok(pauses >= 2);
  observe([{ isIntersecting: true }]);
  assert.equal(loads, 1);
  doc.hidden = true; visibilityChanged();
  assert.ok(pauses >= 3);
});
