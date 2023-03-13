// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

"use strict";

const path = require("path");
const download = require("./download");
const fs = require("fs");
const promisfy = require("util").promisify;
const RmDir = promisfy(fs.rm);

const VERSION = "6.0.0-beta.16";

module.exports.downloadZMQ = async () => {
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
  const options = {
    version: VERSION,
    token: process.env["GITHUB_TOKEN"],
    destination,
  };
  await download(options);
};
