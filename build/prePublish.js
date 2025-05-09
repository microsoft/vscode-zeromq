// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

"use strict";

const path = require("path");
const { download } = require("./download");
const fs = require("fs");

const VERSION = "16.0.0-beta.16.14";

/**
 * Downloads the ZMQ binaries.
 */
async function downloadZMQ() {
  const destination = path.join(__dirname, "..", "prebuilds");
  if (fs.existsSync(path.dirname(destination))) {
    fs.rmSync(destination, { force: true, recursive: true });
  }
  fs.mkdirSync(destination);
  const downloadOptions = {
    version: VERSION,
    token: process.env["GITHUB_TOKEN"],
    destination,
    force: true,
  };
  await download(downloadOptions);
}

downloadZMQ()
  .then(() => process.exit(0))
  .catch((ex) => {
    console.error("Failed to download ZMQ", ex);
    process.exit(1);
  });
