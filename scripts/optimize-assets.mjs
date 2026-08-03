import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const root = process.cwd();
const canonicalIcon = path.join(root, "src", "app", "icon.png");
const source = await readFile(canonicalIcon);

const pngOptions = {
  compressionLevel: 9,
  effort: 10,
  palette: true,
  quality: 100,
};

await Promise.all([
  sharp(source)
    .resize(512, 512, { fit: "contain" })
    .png(pngOptions)
    .toFile(canonicalIcon),
  sharp(source)
    .resize(256, 256, { fit: "contain" })
    .png(pngOptions)
    .toFile(path.join(root, "public", "logonobg.png")),
]);

console.log("Optimized app icon (512px) and displayed logo (256px).");
