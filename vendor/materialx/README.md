# MaterialX Vendor Assets

These files are the official MaterialX JavaScript shader generator assets used by the constant-parameter MaterialX preview mode:

- `JsMaterialXGenShader.js`
- `JsMaterialXGenShader.wasm`
- `JsMaterialXGenShader.data`

They were downloaded from the MaterialX Web Viewer static site:

```text
https://academysoftwarefoundation.github.io/MaterialX/
```

The app loads them locally so GitHub Pages can generate ESSL shaders without a build step or a runtime fetch from GitHub.
