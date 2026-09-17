// Mechanical slicing of approved ImageGen artwork for independent web layers.
// Original artwork is preserved. Coordinates use the original 1672 × 941 canvas.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
const root = fileURLToPath(new URL('../public/assets/castle/', import.meta.url));
await mkdir(`${root}layers`, { recursive: true });
async function slice(source, name, rect) {
  await sharp(`${root}${source}`).extract(rect).png().toFile(`${root}layers/${name}.png`);
}
async function frame(source, name, outer, hole) {
  const { data, info } = await sharp(`${root}${source}`).extract(outer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = hole.top; y < hole.top + hole.height; y++) {
    for (let x = hole.left; x < hole.left + hole.width; x++) data[(y * info.width + x) * 4 + 3] = 0;
  }
  await sharp(data, { raw: info }).png().toFile(`${root}layers/${name}.png`);
}
await slice('entrance-source.png', 'door-left', { left: 450, top: 108, width: 386, height: 833 });
await slice('entrance-source.png', 'door-right', { left: 836, top: 108, width: 387, height: 833 });
await frame('entrance-source.png', 'entrance-frame', { left: 0, top: 0, width: 1672, height: 941 }, { left: 450, top: 108, width: 773, height: 833 });
const portraits = [
  ['illusion', { left: 547, top: 110, width: 439, height: 650 }, { left: 25, top: 48, width: 383, height: 570 }],
  ['spells', { left: 126, top: 156, width: 390, height: 320 }, { left: 25, top: 42, width: 336, height: 246 }],
  ['craft', { left: 1038, top: 151, width: 480, height: 339 }, { left: 32, top: 45, width: 428, height: 263 }],
  ['curiosity', { left: 1064, top: 536, width: 405, height: 265 }, { left: 28, top: 38, width: 346, height: 196 }],
];
for (const [id, outer, hole] of portraits) {
  await frame('hall.png', `${id}-frame`, outer, hole);
  await slice('hall.png', `${id}-art`, { left: outer.left + hole.left, top: outer.top + hole.top, width: hole.width, height: hole.height });
}
console.log('Prepared 2 door leaves, transparent entrance surround and 4 independent art/frame pairs.');
