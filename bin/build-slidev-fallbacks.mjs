#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: node bin/build-slidev-fallbacks.mjs <deck-slug>");
  process.exit(1);
}

const source = path.join("slides", slug, "slides.md");
const deckRoot = path.join("_site", "slides", slug);
const indexPath = path.join(deckRoot, "index.html");
const assetsRoot = path.join(deckRoot, "assets");
const routeBase = `/slides/${slug}/`;

if (!fs.existsSync(source)) {
  console.error(`Slidev source not found: ${source}`);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error(`Slidev build entry not found: ${indexPath}`);
  process.exit(1);
}

if (!fs.existsSync(assetsRoot)) {
  console.error(`Slidev assets not found: ${assetsRoot}`);
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
const indexBundleMatch = indexHtml.match(
  /<script\b[^>]*\bsrc="[^"]*\/assets\/(index-[^"]+\.js)"/,
);
const indexBundle = indexBundleMatch?.[1];

if (!indexBundle) {
  console.error(`Slidev index bundle not found in ${indexPath}`);
  process.exit(1);
}

const indexBundlePath = path.join(assetsRoot, indexBundle);
let indexBundleContent = fs.readFileSync(indexBundlePath, "utf8");

const navigationPathNeedle = `return\`${routeBase}\${`;
const patchedNavigationPathNeedle = "return`/${";
const navigationPathMatchCount =
  indexBundleContent.split(navigationPathNeedle).length - 1;
const patchedNavigationPathMatchCount =
  indexBundleContent.split(patchedNavigationPathNeedle).length - 1;

if (navigationPathMatchCount === 1) {
  indexBundleContent = indexBundleContent.replace(
    navigationPathNeedle,
    patchedNavigationPathNeedle,
  );
  fs.writeFileSync(indexBundlePath, indexBundleContent);
} else if (
  navigationPathMatchCount === 0 &&
  patchedNavigationPathMatchCount === 1
) {
  console.log(`Slidev navigation base already patched in ${indexBundlePath}`);
} else {
  console.error(
    `Expected one Slidev navigation path to patch, found ${navigationPathMatchCount}`,
  );
  process.exit(1);
}

const markdown = fs.readFileSync(source, "utf8");
const body = markdown.replace(/^---[\s\S]*?---\s*/, "");
const parsedSlideCount = body
  .split(/\n-{3,}\n/)
  .filter((slide) => slide.trim())
  .length;
const builtSlideCount = [
  ...indexBundleContent.matchAll(/\{no:\d+,meta:/g),
].length;
const slideCount = builtSlideCount || parsedSlideCount;

const copyIndex = (route) => {
  const routeDir = path.join(deckRoot, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync(indexPath, path.join(routeDir, "index.html"));
};

for (let i = 1; i <= slideCount; i += 1) {
  copyIndex(String(i));
  copyIndex(path.join("presenter", String(i)));
}

for (const route of ["entry", "overview", "notes", "notes-edit", "presenter"]) {
  copyIndex(route);
}

if (navigationPathMatchCount === 1)
  console.log(`Patched Slidev navigation base in ${indexBundlePath}`);
console.log(`Created Slidev fallbacks for ${slideCount} slides in ${deckRoot}`);
