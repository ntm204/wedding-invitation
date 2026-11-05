import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function setup() {
  const listeners = {};
  const frames = new Map();
  const preference = { matches: false, addEventListener() {} };
  let id = 0;
  const context = { scrollY: 0, innerHeight: 800, navigator: {},
    document: { documentElement: { classList: { add() {} }, scrollHeight: 2800 }, body: {}, addEventListener() {} },
    performance: { now: () => 0 }, matchMedia: () => preference,
    addEventListener: (type, fn) => { listeners[type] = fn; },
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    getComputedStyle: () => ({ overflowY: 'visible' }),
  };
  context.window = { scrollTo: ({ top }) => { context.scrollY = top; } };
  const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8').split("  const nav =")[0] + '\n})();';
  vm.runInNewContext(source, context);
  const wheel = (deltaY, extra = {}) => {
    let prevented = false;
    listeners.wheel({ deltaY, deltaX: 0, deltaMode: 0, cancelable: true,
      target: { closest: () => false, parentElement: context.document.body },
      preventDefault: () => { prevented = true; }, ...extra });
    return prevented;
  };
  const tick = time => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); };
  return { context, wheel, tick, preference, listeners, frames };
}
test('wheel eases toward destination and settles without an endless animation', () => {
  const s = setup();
  assert.equal(s.wheel(120), true);
  assert.equal(s.context.scrollY, 0);
  s.tick(16);
  assert.ok(s.context.scrollY > 0 && s.context.scrollY < 120);
  for (let time = 32; time < 1600; time += 16) s.tick(time);
  assert.ok(Math.abs(s.context.scrollY - 120) <= 1);
  assert.equal(s.frames.size, 0);
});
test('reversing wheel changes target, clamps at page edge, pointer cancels', () => {
  const s = setup(); s.wheel(120); s.wheel(-60); s.tick(16);
  assert.ok(s.context.scrollY < 60);
  s.listeners.pointerdown(); assert.equal(s.frames.size, 0);
  s.wheel(99999);
  for (let time = 32; time < 2000; time += 16) s.tick(time);
  assert.ok(s.context.scrollY <= 2000);
});
test('reduced motion, trackpad, zoom, horizontal and nested controls stay native', () => {
  const s = setup();
  assert.equal(s.wheel(12), false);
  assert.equal(s.wheel(120, { ctrlKey: true }), false);
  assert.equal(s.wheel(120, { deltaX: 180 }), false);
  assert.equal(s.wheel(120, { target: { closest: () => true } }), false);
  s.context.getComputedStyle = () => ({ overflowY: 'auto' });
  assert.equal(s.wheel(120, { target: { closest: () => false, scrollHeight: 500, clientHeight: 100, parentElement: s.context.document.body } }), false);
  s.preference.matches = true;
  assert.equal(s.wheel(120), false);
  assert.equal(s.frames.size, 0);
});
