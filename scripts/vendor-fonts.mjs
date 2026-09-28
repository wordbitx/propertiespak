/**
 * Copies the self-hosted brand fonts out of the @fontsource packages into
 * `src/app/fonts/`, where `next/font/local` picks them up.
 *
 *   node scripts/vendor-fonts.mjs
 *
 * Why self-host: a Google Fonts fetch at build time makes `next build` depend
 * on fonts.googleapis.com (it fails in offline/CI sandboxes) and adds a
 * render-blocking third-party request, which costs LCP points. Both families
 * are licensed under the SIL Open Font License 1.1; the licences are copied
 * alongside the binaries.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src", "app", "fonts");

const vendors = [
  {
    package: "@fontsource-variable/plus-jakarta-sans",
    files: [
      "plus-jakarta-sans-latin-wght-normal.woff2",
      "plus-jakarta-sans-latin-ext-wght-normal.woff2",
      "plus-jakarta-sans-latin-wght-italic.woff2",
    ],
    licence: "LICENSE",
    rename: (file) => file.replace("plus-jakarta-sans-", "jakarta-").replace("-wght-", "-"),
  },
  {
    package: "@fontsource-variable/inter",
    files: ["inter-latin-wght-normal.woff2", "inter-latin-ext-wght-normal.woff2", "inter-latin-wght-italic.woff2"],
    licence: "LICENSE",
    rename: (file) => file.replace("inter-", "inter-").replace("-wght-", "-"),
  },
];

fs.mkdirSync(target, { recursive: true });

for (const vendor of vendors) {
  const from = path.join(root, "node_modules", vendor.package, "files");
  const licence = path.join(root, "node_modules", vendor.package, vendor.licence);
  if (!fs.existsSync(from)) {
    console.error(`Missing ${vendor.package} — run \`npm install\` first.`);
    process.exit(1);
  }
  for (const file of vendor.files) {
    const source = path.join(from, file);
    if (!fs.existsSync(source)) {
      console.error(`Missing ${file} in ${vendor.package}`);
      process.exit(1);
    }
    const destination = path.join(target, vendor.rename(file));
    fs.copyFileSync(source, destination);
    console.log(`${path.relative(root, destination)}  ${(fs.statSync(destination).size / 1024).toFixed(1)} kB`);
  }
  if (fs.existsSync(licence)) {
    const destination = path.join(target, `${vendor.package.split("/")[1].replace("variable/", "")}.LICENSE.txt`);
    fs.copyFileSync(licence, destination);
    console.log(`${path.relative(root, destination)}`);
  }
}
