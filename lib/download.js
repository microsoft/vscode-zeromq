// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-check
"use strict";

const path = require("path");
const fs = require("fs");
const util = require("util");

const fsCopyFile = util.promisify(fs.copyFile);
const fsMkdir = util.promisify(fs.mkdir);
const fsReadDir = util.promisify(fs.readdir);

/**
 * @param {{ destination: string; }} opts
 * @param {{ 'win32'?: ('x64' | 'arm64')[]; 'linux'?: ('arm' | 'x64' | 'arm64' | 'armhf')[]; 'darwin'?: ('x64' | 'arm64')[]; 'alpine'?: ('x64' | 'arm64')[] }} platformOptions If not provided, then downloads all binaries for all platforms and archs.
 * @return {Promise<void>} File path to the downloaded asset
 */
module.exports.download = async (opts) => {
  if (!opts.destination) {
    return Promise.reject(new Error("Missing destination"));
  }

  // If we have files in prebuilds folder, use them
  const prebuildRoot = path.join(__dirname, "..", "prebuilds");
  const prebuildFolders = await fsReadDir(prebuildRoot);
  if (prebuildFolders.length === 0) {
    throw new Error("no prebuilds folder in vscode-zeromq");
  }

  /** @type Set<string> */
  const foldersToCreate = new Set();
  prebuildFolders.forEach((folder) => {
    foldersToCreate.add(path.join(opts.destination, folder));
  });
  console.log(
    "Creating destination folders for prebuilds: ",
    Array.from(foldersToCreate)
  );
  await Promise.all(
    Array.from(foldersToCreate).map((folder) =>
      fsMkdir(folder, { recursive: true })
    )
  );

  /** @type string[] */
  const filesToCopy = [];
  await Promise.all(
    prebuildFolders.map(async (prebuildFolder) => {
      const files = await fsReadDir(path.join(prebuildRoot, prebuildFolder));
      filesToCopy.push(...files.map((file) => path.join(prebuildFolder, file)));
    })
  );
  // Copy the files across.
  await Promise.all(
    filesToCopy.map((file) => {
      const newFileName = file.includes("zeromq.") ? file.replaceAll("zeromq.", "node.napi.") : file;
      console.info(
        `Copying file ${file} from ${prebuildRoot} to ${path.join(opts.destination, path.basename(newFileName))}`
      );
      return fsCopyFile(
        path.join(prebuildRoot, file),
        path.join(opts.destination, file)
      );
    })
  );
};
