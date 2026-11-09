# SCHEME - @playform/lib-dsh-bundle

The contract of the family's build tooling. Everything below is what `Source/` does today; nothing
else is claimed.

## The surface

`Bundle(Directory, Entry)`, `Stylesheet(Directory)`, `Compile(File, LoadPaths)` and
`Publish(Directory)`, named exports of the package entry (`Source/Library.ts`).

## The contract

| Call                       | What it does                           | What it writes            |
| -------------------------- | -------------------------------------- | ------------------------- |
| `Bundle(Directory, Entry)` | bundles the entry and compiles sheets  | `Target/Client.bundle.js` |
| `Stylesheet(Directory)`    | the esbuild plugin: `.scss` to CSS     | none (a plugin)           |
| `Compile(File, LoadPaths)` | one sass compile of one sheet          | none (returns text)       |
| `Publish(Directory)`       | copies the partials, compiles the base | `Target/Stylesheet/`      |

## The standalone promise

`Bundle` reads the package name from `<Directory>/package.json`; every path is derived from
`Directory`; and the load paths are every existing `node_modules` from `Directory` up to the file
system root. A standalone install resolves its own dependencies, a hoisted monorepo resolves the
root one, and no step reads `Maintain/`.
