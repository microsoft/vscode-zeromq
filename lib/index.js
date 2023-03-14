// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

"use strict";

const path = require("path");
const download = require("./download");
const fs = require("fs");
const promisfy = require("util").promisify;
const RmDir = promisfy(fs.rm);

const VERSION = "6.0.0-beta.16";

/**
 * Downloads the ZMQ binaries.
 *
 * @export
 * @param {{ 'win32'?: ('x64' | 'ia32' | 'arm64')[]; 'linux'?: ('x64' | 'arm64' | 'armhf')[]; 'darwin'?: ('x64' | 'arm64')[]; 'alpine'?: ('x64' | 'arm64')[]; }} options If not provided, then downloads all binaries for all platforms and archs.
 * @return {*}  {Promise<void>}
 */
module.exports.downloadZMQ = async (options) => {
  const destination = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "zeromq",
    "prebuilds"
  );
  if (!fs.existsSync(path.dirname(destination))) {
    throw new Error(
      `zeromq package does not exist in node modules folder (${path.dirname(
        destination
      )})`
    );
  }
  // Delete to ensure we always download (this guarantees the fact that the binaries are what we expect them to be).
  if (fs.existsSync(destination)) {
    console.log("Deleting existing zeromq binaries", destination);
    await RmDir(destination, { recursive: true });
  }

  const downloadOptions = {
    version: VERSION,
    token: process.env["GITHUB_TOKEN"],
    destination,
  };
  await download(downloadOptions, options);
};
