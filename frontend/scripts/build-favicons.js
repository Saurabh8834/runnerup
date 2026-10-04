const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src = 'C:/Users/soura/.gemini/antigravity-ide/brain/1df06dd8-e74f-46fa-8e89-1d81ba88b060/.user_uploaded/media_1791025431830.png';

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

async function run() {
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log('Cropping logo at:', { minX, minY, cropW, cropH });

  const cropped = await sharp(src)
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .toBuffer();

  // Create standard square 512x512 with logo centered and 20px padding
  const icon512 = await sharp(cropped)
    .resize(472, 472, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .resize(512, 512)
    .png()
    .toBuffer();

  const icon192 = await sharp(icon512).resize(192, 192).png().toBuffer();
  const icon180 = await sharp(icon512).resize(180, 180).png().toBuffer();
  const icon48 = await sharp(icon512).resize(48, 48).png().toBuffer();
  const icon32 = await sharp(icon512).resize(32, 32).png().toBuffer();
  const icon16 = await sharp(icon512).resize(16, 16).png().toBuffer();

  const icoBuffer = createIco([
    { width: 48, height: 48, buffer: icon48 },
    { width: 32, height: 32, buffer: icon32 },
    { width: 16, height: 16, buffer: icon16 },
  ]);

  const base64Png = icon512.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>
`;

  const cwd = process.cwd();
  const writes = [
    { file: path.join(cwd, 'public/icon.png'), data: icon512 },
    { file: path.join(cwd, 'public/icon-512.png'), data: icon512 },
    { file: path.join(cwd, 'public/icon-192.png'), data: icon192 },
    { file: path.join(cwd, 'public/apple-touch-icon.png'), data: icon180 },
    { file: path.join(cwd, 'public/runnerup-mark.png'), data: icon512 },
    { file: path.join(cwd, 'public/favicon.ico'), data: icoBuffer },
    { file: path.join(cwd, 'public/favicon.svg'), data: Buffer.from(svgContent, 'utf8') },
    { file: path.join(cwd, 'src/app/icon.png'), data: icon512 },
    { file: path.join(cwd, 'src/app/favicon.ico'), data: icoBuffer },
    { file: path.join(cwd, 'src/app/icon.svg'), data: Buffer.from(svgContent, 'utf8') },
  ];

  for (const w of writes) {
    fs.writeFileSync(w.file, w.data);
    console.log('Wrote', path.relative(cwd, w.file), w.data.length, 'bytes');
  }
  console.log('All favicon files generated successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
