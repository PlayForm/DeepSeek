# @playform/lib-dsh-bundle

The BUNDLE is the build tooling of the DSH UI family: the harness client-bundle envelope and the
stylesheet compile, in one package the UI packages take as a devDependency.

```js
import { Bundle } from "@playform/lib-dsh-bundle";

await Bundle(process.cwd(), "Source/Bundle.ts");
```

## The two steps

- **`Bundle(Directory, Entry)`** bundles the package's client entry to CJS with esbuild, keeps
  `react`, `react-dom` and `react/jsx-runtime` external, compiles every `.scss` import through the
  stylesheet plugin, wraps the output in `window.__ModuleLoader__.load({ id, factory(require) })`,
  and writes `Target/Client.bundle.js`.
- **`Stylesheet(Directory)`** is the esbuild plugin behind it: a `.scss` resolve becomes a JS module
  whose default export is the compiled CSS text.
- **`Compile(File, LoadPaths)`** is one sass compile, expanded, with no charset header.
- **`Publish(Directory)`** is the material's build: it copies the partials to `Target/Stylesheet`
  and compiles `Base.css` beside them.

## The standalone promise

Every path the package reads and writes is derived from the `Directory` it is handed, and the load
paths walk up from that directory, so a standalone install resolves its own dependencies and a
hoisted monorepo resolves the root one. Nothing here reaches into `Maintain/`.

Contract: [SCHEME.md](./SCHEME.md). License: CC0-1.0.
