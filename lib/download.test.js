// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { getAssetsToDownload, parseAsset } = require("./download");
const assert = require("assert");

const allAssets = [
  { url: "https://bogus1.com", name: "win32-ia32.zip" },
  { url: "https://bogus2.com", name: "win32-x64.zip" },
  { url: "https://bogus3.com", name: "linux-x64.zip" },
  { url: "https://bogus4.com", name: "linux-arm64.glibc.zip" },
  { url: "https://bogus5.com", name: "linux-arm-glibc.zip" },
  { url: "https://bogus6.com", name: "alpine-x64-musl.zip" },
  { url: "https://bogus7.com", name: "darwin-x64.zip" },
  { url: "https://bogus7.com", name: "darwin-arm64.zip" },
];

const test = (name, fn) => {
  fn();
  console.log(`\x1b[32m%s\x1b[0m`, `✓ `, name);
};

test("Download all assets", () => {
  const assets = getAssetsToDownload(allAssets);
  assert.deepStrictEqual(assets, allAssets);
});
test("Download all Win32", () => {
  const assets = getAssetsToDownload(allAssets, { win32: [] });
  const expectedAssets = assets.filter((a) => a.name.includes("win32"));

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download only Win32-x64", () => {
  const assets = getAssetsToDownload(allAssets, { win32: ["x64"] });
  const expectedAssets = assets.filter(
    (a) => a.name.includes("win32") && a.name.includes("x64")
  );

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download darwin", () => {
  const assets = getAssetsToDownload(allAssets, { darwin: ["x64", "arm64"] });
  const expectedAssets = allAssets.filter((a) => a.name.includes("darwin"));

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download darwin arm64", () => {
  const assets = getAssetsToDownload(allAssets, { darwin: ["arm64"] });
  const expectedAssets = allAssets.filter(
    (a) => a.name.includes("darwin") && a.name.includes("arm64")
  );

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download all linux", () => {
  const assets = getAssetsToDownload(allAssets, { linux: [] });
  const expectedAssets = allAssets.filter(
    (a) => a.name.includes("linux") && !a.name.includes("musl")
  );

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download linux arm64", () => {
  const assets = getAssetsToDownload(allAssets, { linux: ["arm64"] });
  const expectedAssets = allAssets.filter(
    (a) => a.name.includes("linux") && a.name.includes("arm64")
  );

  assert.deepStrictEqual(assets, expectedAssets);
});
test("Download alpine", () => {
  const assets = getAssetsToDownload(allAssets, { alpine: [] });
  const expectedAssets = allAssets.filter((a) => a.name.includes("alpine"));

  assert.deepStrictEqual(assets, expectedAssets);
  assert.strictEqual(assets.length, 1);
});
test("Parse Assets", () => {
  const url = "https://bogus1.com";

  assert.deepStrictEqual(parseAsset({ url, name: "win32-ia32.zip" }), {
    url,
    name: "win32-ia32.zip",
    platform: "win32",
    archs: ["ia32"],
  });

  assert.deepStrictEqual(parseAsset({ url, name: "win32-x64.zip" }), {
    url,
    name: "win32-x64.zip",
    platform: "win32",
    archs: ["x64"],
  });

  assert.deepStrictEqual(parseAsset({ url, name: "linux-arm.zip" }), {
    url,
    name: "linux-arm.zip",
    platform: "linux",
    archs: ["arm"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "linux-arm64.zip" }), {
    url,
    name: "linux-arm64.zip",
    platform: "linux",
    archs: ["arm64"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "linux-arm64.zip" }), {
    url,
    name: "linux-arm64.zip",
    platform: "linux",
    archs: ["arm64"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "linux-x64.zip" }), {
    url,
    name: "linux-x64.zip",
    platform: "linux",
    archs: ["x64"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "alpine-x64-musl.zip" }), {
    url,
    name: "alpine-x64-musl.zip",
    platform: "alpine",
    archs: ["x64"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "darwin-x64.zip" }), {
    url,
    name: "darwin-x64.zip",
    platform: "darwin",
    archs: ["x64"],
  });
  assert.deepStrictEqual(parseAsset({ url, name: "darwin-arm64.zip" }), {
    url,
    name: "darwin-arm64.zip",
    platform: "darwin",
    archs: ["arm64"],
  });
});
