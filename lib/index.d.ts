// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Options = {
  win32?: ("x64" | "ia32" | "arm64")[];
  linux?: ("x64" | "arm64" | "armhf" | "arm")[];
  darwin?: ("x64" | "arm64")[];
  alpine?: ("x64" | "arm64")[];
};

/**
 * Downloads the ZMQ binaries.
 *
 * @param {Options} options If not provided, then downloads all binaries for all platforms + archs.
 * @return {*}  {Promise<void>}
 */
export declare function downloadZMQ(options: Options): Promise<void>;
