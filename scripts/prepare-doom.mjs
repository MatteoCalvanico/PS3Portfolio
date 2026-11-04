import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { deflateSync } from "node:zlib";

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assets = JSON.parse(
  await readFile(new URL("./doom-assets.json", import.meta.url), "utf8"),
);
const destination = resolve(root, "public/games/doom");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
await mkdir(destination, { recursive: true });

for (const asset of assets) {
  if (
    !/^[a-zA-Z0-9._-]+$/.test(asset.file) ||
    !/^[a-f0-9]{64}$/.test(asset.sha256) ||
    !asset.url.startsWith("https://")
  )
    throw new Error("Invalid DOOM asset manifest");
  const target = resolve(destination, asset.file);
  let existing;
  try {
    existing = await readFile(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (existing && hash(existing) === asset.sha256) continue;
  const temporary = `${target}.${process.pid}.download`;
  console.log(`Preparing DOOM: ${asset.file}`);
  try {
    await run("curl", [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--retry",
      "2",
      "--connect-timeout",
      "20",
      "--max-time",
      "120",
      "--output",
      temporary,
      asset.url,
    ]);
    if (hash(await readFile(temporary)) !== asset.sha256)
      throw new Error(`Checksum mismatch: ${asset.file}`);
    await rename(temporary, target);
  } catch (error) {
    throw new Error(
      `Could not prepare ${asset.file}. Check your connection and run npm run prepare:doom again. ${error.message}`,
      { cause: error },
    );
  } finally {
    await rm(temporary, { force: true });
  }
}

// Extract the original transparent menu logo from the verified shareware WAD.
const wad = await readFile(resolve(destination, "doom1.wad"));
const lumps = new Map();
for (
  let i = 0, count = wad.readUInt32LE(4), directory = wad.readUInt32LE(8);
  i < count;
  i++
) {
  const offset = directory + i * 16;
  lumps.set(
    wad.toString("ascii", offset + 8, offset + 16).replace(/\0.*$/, ""),
    wad.subarray(
      wad.readUInt32LE(offset),
      wad.readUInt32LE(offset) + wad.readUInt32LE(offset + 4),
    ),
  );
}
const patch = lumps.get("M_DOOM"),
  palette = lumps.get("PLAYPAL");
const width = patch.readUInt16LE(0),
  height = patch.readUInt16LE(2);
const rgba = Buffer.alloc(width * height * 4);
for (let x = 0; x < width; x++) {
  let offset = patch.readUInt32LE(8 + x * 4);
  while (patch[offset] !== 255) {
    const y = patch[offset],
      length = patch[offset + 1];
    for (let row = 0; row < length; row++) {
      const color = patch[offset + 3 + row] * 3,
        position = ((y + row) * width + x) * 4;
      palette.copy(rgba, position, color, color + 3);
      rgba[position + 3] = 255;
    }
    offset += length + 4;
  }
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]),
    result = Buffer.alloc(body.length + 8);
  result.writeUInt32BE(data.length);
  body.copy(result, 4);
  result.writeUInt32BE(crc32(body), body.length + 4);
  return result;
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
const rows = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y++)
  rgba.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
await mkdir(resolve(root, "public/assets"), { recursive: true });
await writeFile(
  resolve(root, "public/assets/doom-shareware.png"),
  Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
console.log("DOOM assets verified and ready.");
