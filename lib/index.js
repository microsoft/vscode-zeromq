// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

"use strict";

const path = require("path");
const download = require("./download");
const fs = require("fs");

const VERSION = "6.0.0-beta.16";

module.exports.downloadZeromq = async () => {
  const destination = path.join(__dirname, "..", "..", "zeromq", "prebuilds");
  if (fs.existsSync(destination)) {
    throw new Error("zeromq package does not exist in node modules folder");
  }
  const options = {
    version: VERSION,
    token: process.env["GITHUB_TOKEN"],
    destination,
  };
  await download(options);
};
