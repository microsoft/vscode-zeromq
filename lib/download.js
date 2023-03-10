// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-check
"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const https = require("https");
const util = require("util");
const url = require("url");
const URL = url.URL;
const child_process = require("child_process");
const proxy_from_env = require("proxy-from-env");

const packageVersion = require("../package.json").version;
const fsUnlink = util.promisify(fs.unlink);
const fsExists = util.promisify(fs.exists);
const fsMkdir = util.promisify(fs.mkdir);

const isWindows = os.platform() === "win32";

const REPO = "microsoft/zeromq-prebuilt";

function isGithubUrl(_url) {
  return url.parse(_url).hostname === "api.github.com";
}

function downloadWin(url, dest, opts) {
  return new Promise((resolve, reject) => {
    let userAgent;
    if (opts.headers["user-agent"]) {
      userAgent = opts.headers["user-agent"];
      delete opts.headers["user-agent"];
    }
    const headerValues = Object.keys(opts.headers)
      .map((key) => `\\"${key}\\"=\\"${opts.headers[key]}\\"`)
      .join("; ");
    const headers = `@{${headerValues}}`;
    console.log("Downloading with Invoke-WebRequest");
    dest = sanitizePathForPowershell(dest);
    let iwrCmd = `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -URI ${url} -UseBasicParsing -OutFile ${dest} -Headers ${headers}`;
    if (userAgent) {
      iwrCmd += " -UserAgent " + userAgent;
    }
    if (opts.proxy) {
      iwrCmd += " -Proxy " + opts.proxy;

      try {
        const { username, password } = new URL(opts.proxy);
        if (username && password) {
          const decodedPassword = decodeURIComponent(password);
          iwrCmd += ` -ProxyCredential (New-Object PSCredential ('${username}', (ConvertTo-SecureString '${decodedPassword}' -AsPlainText -Force)))`;
        }
      } catch (err) {
        reject(err);
      }
    }

    iwrCmd = `powershell "${iwrCmd}"`;

    child_process.exec(iwrCmd, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function download(_url, dest, opts) {
  const proxy = proxy_from_env.getProxyForUrl(url.parse(_url));
  if (proxy !== "") {
    var HttpsProxyAgent = require("https-proxy-agent");
    opts = {
      ...opts,
      agent: new HttpsProxyAgent(proxy),
      proxy,
    };
  }
  const dir = path.dirname(dest);
  if (!(await fsExists(dir))) {
    await fsMkdir(dir, { recursive: true });
  }

  if (isWindows) {
    // This alternative strategy shouldn't be necessary but sometimes on Windows the file does not get closed,
    // so unzipping it fails, and I don't know why.
    return downloadWin(_url, dest, opts);
  }

  if (opts.headers && opts.headers.authorization && !isGithubUrl(_url)) {
    delete opts.headers.authorization;
  }

  return new Promise((resolve, reject) => {
    console.log(`Download options: ${JSON.stringify(opts)}`);
    const outFile = fs.createWriteStream(dest);
    const mergedOpts = {
      ...url.parse(_url),
      ...opts,
    };
    https
      .get(mergedOpts, (response) => {
        if (response.statusCode === 302) {
          console.log("Following redirect to: " + response.headers.location);
          return download(response.headers.location, dest, opts).then(
            resolve,
            reject
          );
        } else if (response.statusCode !== 200) {
          reject(new Error("Download failed with " + response.statusCode));
          return;
        }

        response.pipe(outFile);
        outFile.on("finish", () => {
          resolve();
        });
      })
      .on("error", async (err) => {
        await fsUnlink(dest);
        reject(err);
      });
  });
}

function get(_url, opts) {
  console.log(`GET ${_url}`);

  const proxy = proxy_from_env.getProxyForUrl(url.parse(_url));
  if (proxy !== "") {
    var HttpsProxyAgent = require("https-proxy-agent");
    opts = {
      ...opts,
      agent: new HttpsProxyAgent(proxy),
    };
  }

  return new Promise((resolve, reject) => {
    let result = "";
    opts = {
      ...url.parse(_url),
      ...opts,
    };
    https.get(opts, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error("Request failed: " + response.statusCode));
      }

      response.on("data", (d) => {
        result += d.toString();
      });

      response.on("end", () => {
        resolve(result);
      });

      response.on("error", (e) => {
        reject(e);
      });
    });
  });
}

function getApiUrl(repo, tag) {
  return `https://api.github.com/repos/${repo}/releases/tags/${tag}`;
}

/**
 * @param {{ force: boolean; token: string; version: string; }} opts
 * @returns {Promise<{url: string; name: string; }[]>}
 */
async function getAssetsFromGithubApi(opts) {
  const downloadOpts = {
    headers: {
      "user-agent": "vscode-zeromq",
    },
  };

  if (opts.token) {
    downloadOpts.headers.authorization = `token ${opts.token}`;
  }

  console.log(`Finding release for ${opts.version}`);
  const release = await get(getApiUrl(REPO, opts.version), downloadOpts);
  let jsonRelease;
  try {
    jsonRelease = JSON.parse(release);
  } catch (e) {
    throw new Error("Malformed API response: " + e.stack);
  }

  if (!jsonRelease.assets) {
    throw new Error("Bad API response: " + JSON.stringify(release));
  }
  const assets = jsonRelease.assets.filter(
    (a) => a.name.endsWith(".node") && a.name.includes("node.napi.")
  );
  if (!assets.length) {
    throw new Error("No assets found to download");
  }
  console.log(
    `Found ${assets.length} assets (${assets
      .map((a) => a.name)
      .join(", ")}) to be downloaded for vscode-zeromq`
  );
  return assets.map((a) => ({ url: a.url, name: a.name }));
}

/**
 * @param {{ force: boolean; token: string; version: string; destination: string; }} opts
 * @param {{url: string; name: string; }} asset
 * @return {Promise<string>} Downloaded file name
 */
async function getAssetFromGithubApi(opts, asset) {
  const assetParts = asset.name.split("-");
  let platform = "";
  let libc = "glibc";
  let arch = "";
  if (asset.name.includes("win32")) {
    platform = "win32";
  } else if (asset.name.includes("linux")) {
    platform = "linux";
  } else if (asset.name.includes("darwin")) {
    platform = "darwin";
  }
  if (asset.name.includes("glibc")) {
    libc = "glibc";
  } else if (asset.name.includes("musl")) {
    libc = "musl";
  }
  if (asset.name.includes("arm64")) {
    arch = "arm64";
  } else if (asset.name.includes("arm")) {
    arch = "arm";
  } else if (asset.name.includes("ia32")) {
    arch = "ia32";
  } else if (asset.name.includes("x64")) {
    arch = "x64";
  }

  const targetFile = `node.napi.${libc}.node`;
  const folder = `${platform}-${arch}`;

  if (!platform) {
    throw new Error("Platform not found in asset name: " + asset.name);
  }
  if (!arch) {
    throw new Error("Arch not found in asset name: " + asset.name);
  }

  const assetDownloadPath = path.join(opts.destination, folder, targetFile);
  // We can just use the cached binary
  if (!opts.force && (await fsExists(assetDownloadPath))) {
    console.log("Using cached download: " + assetDownloadPath);
    return assetDownloadPath;
  }

  const downloadOpts = {
    headers: {
      "user-agent": "vscode-zeromq",
    },
  };

  if (opts.token) {
    downloadOpts.headers.authorization = `token ${opts.token}`;
  }

  console.log(`Downloading from ${asset.url} into ${assetDownloadPath}`);

  downloadOpts.headers.accept = "application/octet-stream";
  await download(asset.url, assetDownloadPath, downloadOpts);
  return assetDownloadPath;
}

// Handle whitespace in filepath as powershell split's path with whitespaces
function sanitizePathForPowershell(path) {
  path = path.replace(/ /g, "` "); // replace whitespace with "` " as solution provided here https://stackoverflow.com/a/18537344/7374562
  return path;
}

/**
 * @param {{ force: boolean; token: string; version: string; destination: string; }} opts
 * @param {{ asset: string; target: string; }[]} assets
 * @return {Promise<string>} File path to the downloaded asset
 */
module.exports = async (opts) => {
  if (!opts.version) {
    return Promise.reject(new Error("Missing version"));
  }
  if (!opts.destination) {
    return Promise.reject(new Error("Missing destination"));
  }

  try {
    const assets = await getAssetsFromGithubApi(opts);
    await Promise.all(
      assets.map((asset) => getAssetFromGithubApi(opts, asset))
    );
  } catch (e) {
    throw e;
  }
};
