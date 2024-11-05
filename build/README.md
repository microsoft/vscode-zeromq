# Steps to publish a new version

* Update the `VERSION` in `prePublish.js` file
  * This is the version of the file(s) downloaded from https://github.com/microsoft/zeromq-prebuilt/releases/tag/16.0.0-beta.16.12
* Bump the version in package.json
* Run the pipeline https://dev.azure.com/monacotools/Monaco/_build?definitionId=469&_a=summary and ensure to tick the box `Publish @vscode/vscode-zeromq`
