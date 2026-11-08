// Draws the Yemood logo and writes every icon the web app and the Android wrapper use.
//
//   npm install --no-save sharp
//   node scripts/build-yemood-brand.mjs
//
// Outputs (all committed, so a normal build never needs sharp):
//   apps/web/public/        icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png,
//                           apple-touch-icon.png, favicon.ico, og-image.png
//   mobile/android-overrides/app/src/main/res/
//                           launcher icons (legacy square + round) and the adaptive-icon layers
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const webPublic = path.join(root, "apps/web/public");
const androidRes = path.join(root, "mobile/android-overrides/app/src/main/res");

const COLOR = {
  tealLight: "#19C2B0",
  navy: "#0B3C5D",
  ink: "#0B2540",
  gold: "#FFC83D",
  coral: "#FF6B57",
  mint: "#7FE5D3",
  cream: "#FFF4E0",
};

const gradientDefs = `
  <defs>
    <linearGradient id="yem-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${COLOR.tealLight}"/>
      <stop offset="1" stop-color="${COLOR.navy}"/>
    </linearGradient>
    <radialGradient id="yem-glow" cx="0.25" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

// A happy face in a speech bubble: "mood" plus "chat", with a little confetti.
const confetti = `
  <circle cx="92" cy="112" r="11" fill="${COLOR.coral}"/>
  <rect x="392" y="84" width="24" height="24" rx="5" fill="#FFFFFF" fill-opacity="0.9" transform="rotate(24 404 96)"/>
  <circle cx="432" cy="176" r="9" fill="${COLOR.gold}"/>
  <circle cx="436" cy="352" r="12" fill="${COLOR.mint}"/>
  <rect x="70" y="262" width="20" height="20" rx="4" fill="${COLOR.gold}" transform="rotate(-18 80 272)"/>
  <circle cx="146" cy="70" r="7" fill="#FFFFFF" fill-opacity="0.85"/>
  <circle cx="372" cy="436" r="8" fill="${COLOR.coral}"/>`;

const face = `
  <path d="M237.9 374.7 A130 130 0 1 0 172.4 345.6 L126 416 Z"
        fill="${COLOR.gold}" stroke="${COLOR.ink}" stroke-width="14" stroke-linejoin="round"/>
  <ellipse cx="216" cy="230" rx="13" ry="21" fill="${COLOR.ink}"/>
  <ellipse cx="296" cy="230" rx="13" ry="21" fill="${COLOR.ink}"/>
  <circle cx="182" cy="282" r="15" fill="${COLOR.coral}" fill-opacity="0.55"/>
  <circle cx="330" cy="282" r="15" fill="${COLOR.coral}" fill-opacity="0.55"/>
  <path d="M200 278 Q256 342 312 278" fill="none" stroke="${COLOR.ink}" stroke-width="15" stroke-linecap="round"/>`;

/** The artwork scaled around the centre of the 512 canvas. */
function artwork(scale, withConfetti) {
  const shift = 256 * (1 - scale);
  const art = `${withConfetti ? confetti : ""}${face}`;
  return `<g transform="translate(${shift} ${shift}) scale(${scale})">${art}</g>`;
}

function svgDoc(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradientDefs}${body}</svg>`;
}

const background = (radius) =>
  `<rect width="512" height="512" rx="${radius}" fill="url(#yem-bg)"/>` +
  `<rect width="512" height="512" rx="${radius}" fill="url(#yem-glow)"/>`;

const SVG = {
  /** Rounded app icon, used as favicon and for the regular PNG sizes. */
  icon: svgDoc(background(112) + artwork(1, true)),
  /** Full-bleed, art kept inside the 80% safe circle, for maskable icons. */
  maskable: svgDoc(background(0) + artwork(0.66, true)),
  /** Android legacy round icon. */
  round: svgDoc(
    `<clipPath id="yem-circle"><circle cx="256" cy="256" r="256"/></clipPath>` +
      `<g clip-path="url(#yem-circle)">${background(0)}${artwork(0.8, true)}</g>`,
  ),
  /** Adaptive icon foreground: transparent, art inside the 66% safe zone. */
  foreground: svgDoc(artwork(0.62, true)),
};

function writeFile(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, data);
}

async function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();
}

/** An .ico that holds PNG images; every browser accepts this form. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function writeWebIcons() {
  writeFile(path.join(webPublic, "icon.svg"), SVG.icon);
  writeFile(path.join(webPublic, "icon-192.png"), await png(SVG.icon, 192));
  writeFile(path.join(webPublic, "icon-512.png"), await png(SVG.icon, 512));
  writeFile(path.join(webPublic, "icon-maskable-512.png"), await png(SVG.maskable, 512));
  writeFile(path.join(webPublic, "apple-touch-icon.png"), await png(SVG.maskable, 180));
  const sizes = [16, 32, 48];
  const images = await Promise.all(
    sizes.map(async (size) => ({ size, data: await png(SVG.icon, size) })),
  );
  writeFile(path.join(webPublic, "favicon.ico"), ico(images));
}

const DENSITIES = [
  { name: "mdpi", launcher: 48, layer: 108 },
  { name: "hdpi", launcher: 72, layer: 162 },
  { name: "xhdpi", launcher: 96, layer: 216 },
  { name: "xxhdpi", launcher: 144, layer: 324 },
  { name: "xxxhdpi", launcher: 192, layer: 432 },
];

const ADAPTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/yemood_icon_background"/>
    <foreground android:drawable="@mipmap/yemood_icon_foreground"/>
</adaptive-icon>
`;

const BACKGROUND_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <gradient
        android:angle="315"
        android:startColor="${COLOR.tealLight}"
        android:endColor="${COLOR.navy}"
        android:type="linear"/>
</shape>
`;

async function writeAndroidIcons() {
  for (const { name, launcher, layer } of DENSITIES) {
    const dir = path.join(androidRes, `mipmap-${name}`);
    writeFile(path.join(dir, "ic_launcher.png"), await png(SVG.maskable, launcher));
    writeFile(path.join(dir, "ic_launcher_round.png"), await png(SVG.round, launcher));
    writeFile(path.join(dir, "yemood_icon_foreground.png"), await png(SVG.foreground, layer));
  }
  const anydpi = path.join(androidRes, "mipmap-anydpi-v26");
  writeFile(path.join(anydpi, "ic_launcher.xml"), ADAPTIVE_XML);
  writeFile(path.join(anydpi, "ic_launcher_round.xml"), ADAPTIVE_XML);
  writeFile(path.join(androidRes, "drawable/yemood_icon_background.xml"), BACKGROUND_XML);
}

const OG_TEXT = `
  <text x="540" y="300" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="128" fill="${COLOR.cream}">Yemood</text>
  <text x="544" y="368" font-family="DejaVu Sans, sans-serif" font-size="40" fill="${COLOR.cream}" fill-opacity="0.92">Party games with your friends</text>
  <text x="544" y="438" font-family="DejaVu Sans, sans-serif" font-size="44" fill="${COLOR.gold}">ألعاب جماعية مع الأصدقاء</text>`;

async function writeOgImage() {
  const art = (await png(SVG.icon, 360)).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    ${gradientDefs}
    <rect width="1200" height="630" fill="url(#yem-bg)"/>
    <rect width="1200" height="630" fill="url(#yem-glow)"/>
    <image x="120" y="135" width="360" height="360" href="data:image/png;base64,${art}"/>
    ${OG_TEXT}
  </svg>`;
  const image = await sharp(Buffer.from(svg), { density: 192 })
    .resize(1200, 630)
    .png()
    .toBuffer();
  writeFile(path.join(webPublic, "og-image.png"), image);
}

await writeWebIcons();
await writeAndroidIcons();
await writeOgImage();
