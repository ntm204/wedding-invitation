import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
test('all emitted media references resolve, images have responsive layout hints', () => {
  for (const match of html.matchAll(/(?:src|href|data-src|data-mobile-src|poster)="(assets\/[^" ]+)"/g)) assert.ok(existsSync(path.join(root, 'dist', match[1])), match[1]);
  const images = [...html.matchAll(/<img\b[^>]+>/g)];
  assert.ok(images.length >= 14);
  for (const [tag] of images) for (const attribute of ['srcset=', 'sizes=', 'width=', 'height=', 'decoding="async"', 'loading="lazy"']) assert.ok(tag.includes(attribute), attribute);
  for (const match of html.matchAll(/(assets\/[^ ,"]+\.webp) \d+w/g)) assert.ok(existsSync(path.join(root, 'dist', match[1])));
});
test('video is deferred, has poster and smaller mobile variant', () => {
  assert.match(html, /preload="none"/);
  assert.doesNotMatch(html, /<source src=/);
  assert.match(html, /poster="assets\/hero-[^" ]+\.webp"/);
  const mobile = html.match(/data-mobile-src="([^"]+)"/)[1];
  assert.ok(statSync(path.join(root, 'dist', mobile)).size < statSync(path.join(root, 'assets/hero.mp4')).size);
});
