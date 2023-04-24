// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

"use strict";

const path = require("path");
const { download } = require("./download");
const fs = require("fs");
const promisfy = require("util").promisify;
const FSRmDir = promisfy(fs.rm);
const FSStat = promisfy(fs.stat);

/**
 * Downloads the ZMQ binaries.
 *
 * @export
 * @return {*}  {Promise<void>}
 */
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
  await deleteZmqFolder("prebuilds");

  const downloadOptions = {
    destination,
  };
  await download(downloadOptions);
};

async function deleteZmqFolder(folderName) {
  const destination = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "zeromq",
    folderName
  );
  const exists = FSStat(destination)
    .then(() => true)
    .catch(() => false);
  if (await exists) {
    console.log("Deleting existing zeromq binaries", destination);
    await FSRmDir(destination, { recursive: true });
  }
}
