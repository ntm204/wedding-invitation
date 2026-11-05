import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');

const cache = path.join(root, '.media-cache');
mkdirSync(cache, { recursive: true });
// Only remove the fixed build directory, never original assets.
rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, 'assets'), { recursive: true });
const digest = file => createHash('sha256').update(readFileSync(file)).update('media-v2').digest('hex').slice(0, 10);
const publish = file => { cpSync(path.join(cache, file), path.join(output, 'assets', file)); return `assets/${file}`; };
let html = readFileSync(path.join(root, 'index.html'), 'utf8');
const sizesFor = name => name.startsWith('memory-') ? '(max-width: 600px) 210px, 300px'
  : name === 'story' ? '(max-width: 809px) calc(100vw - 50px), (max-width: 1199px) calc((100vw - 160px) * .67 - 10px), 610px'
  : name === 'floral' ? '(max-width: 809px) 121px, (max-width: 1199px) 27vw, 346px'
  : name.startsWith('venue-') ? '(max-width: 600px) 70vw, 400px'
  : name === 'flowers' ? '(max-width: 600px) 100vw, 50vw'
  : name === 'footer' ? '100vw' : '(max-width: 600px) 60vw, 400px';
for (const tag of [...html.matchAll(/<img\b[^>]*src="(assets\/[^"?]+\.(?:jpg|png|webp))"[^>]*>/g)]) {
  const input = path.join(root, tag[1]);
  const name = path.parse(input).name;
  const id = digest(input);
  const metadata = await sharp(input).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const limit = name === 'footer' ? 1920 : name === 'flowers' ? 1440 : name.startsWith('venue-') ? 800 : name.startsWith('memory-') ? 640 : 1200;
  const maxWidth = Math.min(width, limit);
  const widths = [...new Set([320, 640, 960, maxWidth].filter(w => w <= maxWidth))].sort((a, b) => a - b);
  const variants = [];
  for (const w of widths) {
    const filename = `${name}-${id}-${w}.webp`;
    if (!existsSync(path.join(cache, filename))) await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(path.join(cache, filename));
    variants.push(`${publish(filename)} ${w}w`);
  }
  const fallback = `assets/${name}-${id}-${maxWidth}.webp`;
  html = html.replace(tag[0], tag[0].replace(`src="${tag[1]}"`, `src="${fallback}" srcset="${variants.join(', ')}" sizes="${sizesFor(name)}" width="${width}" height="${height}" decoding="async"`));
}
const video = path.join(root, 'assets', 'hero.mp4');
const videoId = digest(video);
function ffmpeg(args) {
  const result = spawnSync(process.env.FFMPEG_PATH || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...args], { encoding: 'utf8', timeout: 180000, windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Video optimization requires FFmpeg (or FFMPEG_PATH). ${result.error?.message || result.stderr}`);
}
const poster = `hero-${videoId}-poster.webp`;
if (!existsSync(path.join(cache, poster))) {
  const frame = path.join(cache, `hero-${videoId}-frame.png`);
  ffmpeg(['-i', video, '-frames:v', '1', '-vf', "scale=w='min(1280,iw)':h=-2", frame]);
  await sharp(frame).webp({ quality: 80 }).toFile(path.join(cache, poster));
  rmSync(frame);
}
const posterUrl = publish(poster);
cpSync(path.join(cache, poster), path.join(root, 'assets', 'hero-poster.webp'));
const videoUrls = [];
for (const width of [720, 1280]) {
  const filename = `hero-${videoId}-${width}.mp4`;
  if (!existsSync(path.join(cache, filename))) {
    const temporary = path.join(cache, `${filename}.tmp.mp4`);
    ffmpeg(['-i', video, '-an', '-vf', `scale=w='min(${width},iw)':h=-2`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', temporary]);
    renameSync(temporary, path.join(cache, filename));
  }
  videoUrls.push(publish(filename));
}
html = html.replace('poster="assets/hero-poster.webp"', `poster="${posterUrl}"`)
  .replace('data-src="assets/hero.mp4"', `data-src="${videoUrls[1]}" data-mobile-src="${videoUrls[0]}"`)
  .replace('</head>', `  <link rel="preload" as="image" href="${posterUrl}" fetchpriority="high">\n</head>`);
for (const filename of ['caslon.woff2', 'didact.woff2', 'licorice.woff2', 'inter.woff2', 'inter-medium.woff2', 'poppins.woff2', 'favicon.svg']) cpSync(path.join(root, 'assets', filename), path.join(output, 'assets', filename));
for (const filename of ['style.css', 'app.js']) cpSync(path.join(root, filename), path.join(output, filename));
writeFileSync(path.join(output, 'index.html'), html);
console.log('Built dist/: responsive WebP images, compressed video variants and hero poster.');
