# vscode-zeromq

This is an npm module for using zeromq binaries build in Azure Pipelines in a Node project. It is used by the [Jupyter Extension for VS Code](https://github.com/microsoft/vscode-jupyter-internal).
The binaries can be found in the releases section of the [zeromq-prebuilt](https://github.com/microsoft/zeromq-prebuilt) repo.

# How it works

* The npm package `zeromq` is installed as a node dependency.
* This npm package is installed as a dev dependency.
* As part of the post install, the exported function `downloadZMQ` should be invoked as follows:
```typescript
const { downloadZMQ } = require('vscode-zeromq');
// Download all binaries for all platforms and all architectures into the `node_modules/zeromq/prebuilds` folder.
await downloadZMQ()
```
	* This will replace all of the binaries found in the `zeromq` module with the prebuilt binaries.


# Usage example
Run the following as a `postinstall` step (with the desired arguments).

```typescript
const { downloadZMQ } = require('vscode-zeromq');
// Download all binaries for all platforms and all architectures
await downloadZMQ()
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
