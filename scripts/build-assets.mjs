/**
 * Generates the raster brand assets from the vector mark, plus the placeholder
 * hero photography used when the curated originals are not present.
 *
 *   node scripts/build-assets.mjs
 *
 * Outputs (all under public/):
 *   icon.png            512×512  — app icon, schema.org logo, PWA icon
 *   apple-icon.png      180×180  — iOS home screen
 *   favicon.ico         16/32/48 — legacy browsers
 *   images/residence-social.jpg  — fallback social card when the hero art is missing
 *   images/residence-*.{webp,avif}, images/residence-mobile-*.{webp,avif},
 *   images/investment-1440.webp, leaflet/layers*.png — only if missing
 *
 * Replace the placeholder photography with the licensed originals documented in
 * docs/hero-assets.md; this script never overwrites existing files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const imagesDir = path.join(publicDir, "images");
const leafletDir = path.join(publicDir, "leaflet");
const sourceDir = path.join(root, ".preview-assets");
const heroSource = path.join(sourceDir, "hero-source.jpg");
const investmentSource = path.join(sourceDir, "investment-source.jpg");

const NAVY = "#061C33";

/** The brand mark: src/app/icon.svg is the single source of truth. */
const mark = fs.readFileSync(path.join(root, "src", "app", "icon.svg"), "utf8");

const markSvg = (size) => Buffer.from(mark.replace("<svg ", `<svg width="${size}" height="${size}" `));

async function brandIcons() {
  const sizes = [512, 180, 96, 48, 32, 16];
  const pngs = new Map();
  for (const size of sizes) {
    const buffer = await sharp(markSvg(size)).png({ compressionLevel: 9 }).toBuffer();
    pngs.set(size, buffer);
  }
  await fs.promises.writeFile(path.join(publicDir, "icon.png"), pngs.get(512));
  await fs.promises.writeFile(path.join(publicDir, "apple-icon.png"), pngs.get(180));
  console.log("public/icon.png (512), public/apple-icon.png (180)");

  // ICO container with 16/32/48 entries (PNG payloads are valid in .ico).
  const entries = [16, 32, 48].map((size) => ({ size, buffer: pngs.get(size) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + entries.length * 16;
  const directory = [];
  for (const entry of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 0);
    dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 1);
    dir.writeUInt8(0, 2); // palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // colour planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(entry.buffer.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += entry.buffer.length;
    directory.push(dir);
  }
  await fs.promises.writeFile(
    path.join(publicDir, "favicon.ico"),
    Buffer.concat([header, ...directory, ...entries.map((entry) => entry.buffer)]),
  );
  console.log("public/favicon.ico (16/32/48)");
}

const writeIfMissing = async (file, builder) => {
  if (fs.existsSync(file)) {
    console.log(`kept   ${path.relative(root, file)}`);
    return;
  }
  const info = await builder();
  console.log(`wrote  ${path.relative(root, file)}  ${info.width}x${info.height}`);
};

async function placeholderPhotography() {
  if (!fs.existsSync(heroSource) || !fs.existsSync(investmentSource)) {
    console.log("skip   hero placeholders (.preview-assets source art not present)");
    return;
  }
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(leafletDir, { recursive: true });

  const crop = (source, width, ratioW, ratioH, format, quality) =>
    sharp(source)
      .resize(width, Math.round((width * ratioH) / ratioW), { fit: "cover", position: "attention", kernel: "lanczos3" })
      .toFormat(format, { quality })
      .toFile(path.basename("x"));

  const shoot = (source, ratioW, ratioH) => async (name, width, format, quality) => {
    const file = path.join(imagesDir, `${name}.${format === "jpeg" ? "jpg" : format}`);
    await writeIfMissing(file, async () => {
      let pipe = sharp(source).resize(width, Math.round((width * ratioH) / ratioW), {
        fit: "cover",
        position: "attention",
        kernel: "lanczos3",
      });
      if (width > 1400) pipe = pipe.sharpen({ sigma: 1.1 });
      return pipe.toFormat(format, { quality }).toFile(file);
    });
    void crop;
  };

  const hero = shoot(heroSource, 8, 5);
  for (const width of [1600, 2400, 3200]) {
    await hero(`residence-${width}`, width, "webp", 78);
    await hero(`residence-${width}`, width, "avif", 60);
  }
  const mobile = shoot(heroSource, 3, 4);
  for (const width of [768, 1280]) {
    await mobile(`residence-mobile-${width}`, width, "webp", 78);
    await mobile(`residence-mobile-${width}`, width, "avif", 60);
  }
  await shoot(heroSource, 1200, 630)("residence-social", 1200, "jpeg", 82);
  await shoot(investmentSource, 8, 5)("investment-1440", 1440, "webp", 78);

  await writeIfMissing(path.join(leafletDir, "layers.png"), async () => {
    const box = await sharp({ create: { width: 12, height: 10, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toBuffer();
    return sharp({ create: { width: 20, height: 20, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: box, left: 4, top: 5 }])
      .png()
      .toFile(path.join(leafletDir, "layers.png"));
  });
  await writeIfMissing(path.join(leafletDir, "layers-2x.png"), async () => {
    const box = await sharp({ create: { width: 24, height: 20, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toBuffer();
    return sharp({ create: { width: 40, height: 40, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: box, left: 8, top: 10 }])
      .png()
      .toFile(path.join(leafletDir, "layers-2x.png"));
  });
}

fs.mkdirSync(publicDir, { recursive: true });
await brandIcons();
await placeholderPhotography();
console.log(`\nDone. Theme colour: ${NAVY}`);
