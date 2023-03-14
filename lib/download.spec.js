// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { describe, expect, test } = require("@jest/globals");
const { getAssetsToDownload } = require("./download");

const allAssets = [
  { url: "https://bogus1.com", name: "win32-ia32-node.napi.glibc.node" },
  { url: "https://bogus2.com", name: "win32-x64-node.napi.glibc.node" },
  { url: "https://bogus3.com", name: "linux-x64-node.napi.glibc.node" },
  { url: "https://bogus4.com", name: "linux-arm64-node.napi.glibc.node" },
  { url: "https://bogus5.com", name: "linux-arm-node.napi.glibc.node" },
  { url: "https://bogus6.com", name: "linux-x64-musl-node.napi.musl.node" },
  { url: "https://bogus7.com", name: "darwin-x64.arm64-node.napi.glibc.node" },
];

describe("Download", () => {
  test("Download all assets", () => {
    const assets = getAssetsToDownload(allAssets);
    expect(assets).toEqual(allAssets);
  });
  test("Download all Win32", () => {
    const assets = getAssetsToDownload(allAssets, { win32: [] });
    const expectedAssets = assets.filter((a) => a.name.includes("win32"));

    expect(assets).toEqual(expectedAssets);
  });
  test("Download only Win32-x64", () => {
    const assets = getAssetsToDownload(allAssets, { win32: ["x64"] });
    const expectedAssets = assets.filter(
      (a) => a.name.includes("win32") && a.name.includes("x64")
    );

    expect(assets).toEqual(expectedAssets);
  });
  test("Download darwin", () => {
    const assets = getAssetsToDownload(allAssets, { darwin: ["x64", "arm64"] });
    const expectedAssets = allAssets.filter((a) => a.name.includes("darwin"));

    expect(assets).toEqual(expectedAssets);
  });
  test("Download darwin arm64", () => {
    const assets = getAssetsToDownload(allAssets, { darwin: ["arm64"] });
    const expectedAssets = allAssets.filter((a) => a.name.includes("darwin"));

    expect(assets).toEqual(expectedAssets);
  });
  test("Download all linux", () => {
    const assets = getAssetsToDownload(allAssets, { linux: [] });
    const expectedAssets = allAssets.filter((a) => a.name.includes("linux"));

    expect(assets).toEqual(expectedAssets);
  });
  test("Download linux arm64", () => {
    const assets = getAssetsToDownload(allAssets, { linux: ["arm64"] });
    const expectedAssets = allAssets.filter(
      (a) => a.name.includes("linux") && a.name.includes("arm64")
    );

    expect(assets).toEqual(expectedAssets);
  });
  test("Download alpine", () => {
    const assets = getAssetsToDownload(allAssets, { alpine: [] });

		expect(assets).toEqual([]);
  });
});
