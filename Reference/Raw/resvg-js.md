[**29** Branches](https://github.com/thx/resvg-js/branches)[](https://github.com/thx/resvg-js/tags)
Go to file Open more actions menu and
[chore(deps): bump flatted from 3.2.6 to 3.4.2](https://github.com/thx/resvg-js/commit/9de8ddd9dd62293006d849dd846a3b91ba992f23)
Open commit detailsfailure Mar 26, 2026
[9de8ddd](https://github.com/thx/resvg-js/commit/9de8ddd9dd62293006d849dd846a3b91ba992f23) · Mar 26,
2026 [409 Commits](https://github.com/thx/resvg-js/commits/main/) Open commit details 409 Commits

| Name | Name | Last commit message                                                                                                                                                             | Last commit date |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
|      |      | [fix: enable static link for windows-msvc (](https://github.com/thx/resvg-js/commit/83517cedc0afcdadd7a4cdb64edcd4bb0a891648 "fix: enable static link for windows-msvc \(#308\) |

- static link for windows

- add windows i686 for static
  link")[#308](https://github.com/thx/resvg-js/pull/308)[)](https://github.com/thx/resvg-js/commit/83517cedc0afcdadd7a4cdb64edcd4bb0a891648
  "fix: enable static link for windows-msvc \(#308\)

- static link for windows

- add windows i686 for static link") | Mar 7, 2024 |  
  | [.github/workflows](https://github.com/thx/resvg-js/tree/main/.github/workflows "This path skips through empty directories")
  |
  [.github/workflows](https://github.com/thx/resvg-js/tree/main/.github/workflows "This path skips through empty directories")
  | [chore(ci): add font mounting and debug commands for Linux binding
  tests](https://github.com/thx/resvg-js/commit/ca777cd1abbb5f9ec9ab9951a4bf585bf5a71251
  "chore\(ci\): add font mounting and debug commands for Linux binding tests

This feature was originally introduced in PR #209, and we need to retain it to prevent font-related
tests from failing.

- Add font directory mounting for SVG rendering tests
- Add find command to verify font files exist") | Jan 22, 2026 |  
  | | | | Oct 8, 2021 |  
  | [.yarn/releases](https://github.com/thx/resvg-js/tree/main/.yarn/releases "This path skips through empty directories")
  |
  [.yarn/releases](https://github.com/thx/resvg-js/tree/main/.yarn/releases "This path skips through empty directories")
  |
  [chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0](https://github.com/thx/resvg-js/commit/0910270c765f3b49d8f6fc56fa75a9eab2ac5376 "chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0")
  | Jan 15, 2026 |  
  | | | [refactor: extract `cropByBBox` logic and prevent overflow
  panics](https://github.com/thx/resvg-js/commit/6d2e209d4cd0d6c91b44be81ac6b8bc5c390d825 "refactor:
  extract `cropByBBox` logic and prevent overflow panics

- Add `CropContext/CropResult` structs to encapsulate crop calculations
- Extract `crop_by_bbox_inner\(\)` for shared NAPI/WASM implementation
- Performance optimization: Add `cropped_empty` flag to skip rendering when crop yields no visible
  content
- Skip resvg rendering for empty crops to avoid IntRect overflow panics
- Move cropByBBox tests to dedicated `index-bbox.spec.ts`") | Jan 28, 2026 |  
  | | | [chore: remove bench-related
  dependencies](https://github.com/thx/resvg-js/commit/aa93f748f2831c25b80cdb295a4bfffd5c989650
  "chore: remove bench-related dependencies

Also disable skr-canvas in the bench") | Feb 7, 2023 |  
| | | [refactor: extract `cropByBBox` logic and prevent overflow
panics](https://github.com/thx/resvg-js/commit/6d2e209d4cd0d6c91b44be81ac6b8bc5c390d825 "refactor:
extract `cropByBBox` logic and prevent overflow panics

- Add `CropContext/CropResult` structs to encapsulate crop calculations
- Extract `crop_by_bbox_inner\(\)` for shared NAPI/WASM implementation
- Performance optimization: Add `cropped_empty` flag to skip rendering when crop yields no visible
  content
- Skip resvg rendering for empty crops to avoid IntRect overflow panics
- Move cropByBBox tests to dedicated `index-bbox.spec.ts`") | Jan 28, 2026 |  
  | | Jan 28, 2026 |  
  | | | [feat: more aggressive GC to prevent continued growth of memory
  usage](https://github.com/thx/resvg-js/commit/9ddc1e8b1cb721ac0d656a1e9502b8b9ed33e361 "feat: more
  aggressive GC to prevent continued growth of memory usage

Previously, resvg-js exhibited persistent RSS growth during continuous operation, which appeared to
be a memory leak but was not!

This occurred because memory allocated for SVG rendering in Rust was not detected by Node.js \(V8\)
by default. Consequently, the garbage collector failed to trigger promptly, leading to the observed
steady increase in RSS.

In this PR, I use `adjust_external_memory\(\)` via napi-rs to inform V8 about this “external memory
held by JS objects.” This allows the GC to collect it as early as possible based on actual memory
pressure, thereby stabilizing RSS.

---

I also added a memory test script. Running it shows that the RSS has stabilized at a consistent
value. The exact amount of memory required depends on the size of the generated images and the
complexity of the SVG.

`node scripts/test-memory.mjs`

```bash
RSS 💾 | heapTotal | heapUsed | external | arrayBuffers
+4.81 MB | +256 KB | +724.13 KB | +233.66 KB | +72.56 KB
+110.66 MB | +1.75 MB | +36.5 KB | +1.98 MB | -4.08 KB
+211.25 MB | +1.75 MB | +43.77 KB | +3.8 MB | -4.08 KB
+307.7 MB | +1.75 MB | +43.77 KB | +3.8 MB | -4.08 KB
+308.03 MB | +1.75 MB | +53.5 KB | +3.8 MB | -4.08 KB
+308.17 MB | +1.75 MB | +77.3 KB | +3.8 MB | -4.08 KB
+308.41 MB | +1.75 MB | -701.08 KB | +3.8 MB | -4.08 KB
+308.48 MB | +1.75 MB | -771.61 KB | +3.8 MB | -4.08 KB
+308.64 MB | +1.75 MB | -769.99 KB | +3.8 MB | -4.08 KB
+308.69 MB | +1.75 MB | -738.31 KB | +3.8 MB | -4.08 KB
+308.69 MB | +768 KB | -739.51 KB | +3.8 MB | -4.08 KB
+308.7 MB | +768 KB | -740.52 KB | +3.8 MB | -4.08 KB
+309.02 MB | +768 KB | -731.91 KB | +3.8 MB | -4.08 KB
+309.19 MB | +768 KB | -731.88 KB | +3.8 MB | -4.08 KB
+309.19 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
+309.39 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
+309.39 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
+309.5 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
+309.59 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
+309.59 MB | +768 KB | -731.84 KB | +3.8 MB | -4.08 KB
```

---

This refactors the commit from the previous version:

- d2d51c60a18a08d57ff8ad41c9bcae4ac13c85f7
- e553a3a3d07146ea0641f2021cf2e5725d4e146f

Fixes: #216") | Jan 22, 2026 |  
| [refactor: extract `cropByBBox` logic and prevent overflow
panics](https://github.com/thx/resvg-js/commit/6d2e209d4cd0d6c91b44be81ac6b8bc5c390d825 "refactor:
extract `cropByBBox` logic and prevent overflow panics

- Add `CropContext/CropResult` structs to encapsulate crop calculations
- Extract `crop_by_bbox_inner\(\)` for shared NAPI/WASM implementation
- Performance optimization: Add `cropped_empty` flag to skip rendering when crop yields no visible
  content
- Skip resvg rendering for empty crops to avoid IntRect overflow panics
- Move cropByBBox tests to dedicated `index-bbox.spec.ts`") | Jan 28, 2026 |  
  | | Jan 28, 2026 |  
  | | |
  [style: rust indent changed from 2 to 4 spaces](https://github.com/thx/resvg-js/commit/8288cd939123afd95015a8ab5c395096bff81cd6 "style: rust indent changed from 2 to 4 spaces")
  | May 21, 2022 |  
  | | |
  [refactor: wasm binding and test](https://github.com/thx/resvg-js/commit/8e925aae30c386b009da413b671f33ba36801408 "refactor: wasm binding and test")
  | Feb 22, 2022 |  
  | | | | Nov 17, 2022 |  
  | | | | Nov 10, 2021 |  
  | | |
  [chore: upgrade yarn from v1 to v3](https://github.com/thx/resvg-js/commit/92eea4f90d032cfe2aa78a03a99d144ad37d2168 "chore: upgrade yarn from v1 to v3")
  | Jul 7, 2022 |  
  | | | | Dec 24, 2021 |  
  | | |
  [chore: upgrade yarn from v1 to v3](https://github.com/thx/resvg-js/commit/92eea4f90d032cfe2aa78a03a99d144ad37d2168 "chore: upgrade yarn from v1 to v3")
  | Jul 7, 2022 |  
  | | |
  [chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0](https://github.com/thx/resvg-js/commit/0910270c765f3b49d8f6fc56fa75a9eab2ac5376 "chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0")
  | Jan 15, 2026 |  
  | | | | Jan 28, 2026 |  
  | | | [feat: add catch_unwind protection to render to prevent Node.js
  proces…](https://github.com/thx/resvg-js/commit/4b2adf32c34e1176b64cda579badac256ba6df7a "feat:
  add catch_unwind protection to render to prevent Node.js process crashes

- Use catch_unwind in the resvg-js Rust layer to capture panics, converting them into explicit
  errors to prevent direct panics from crashing the Node.js process.
  doc.rust-lang.org/book/ch09-01-unrecoverable-errors-with-panic.html
- Remove unwrap\(\) at critical points in the resvg-js rendering pipeline.") | Jan 27, 2026 |  
  | | | | Oct 8, 2021 |  
  | | |
  [chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0](https://github.com/thx/resvg-js/commit/0910270c765f3b49d8f6fc56fa75a9eab2ac5376 "chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0")
  | Jan 15, 2026 |  
  | | |
  [style: rust indent changed from 2 to 4 spaces](https://github.com/thx/resvg-js/commit/8288cd939123afd95015a8ab5c395096bff81cd6 "style: rust indent changed from 2 to 4 spaces")
  | May 21, 2022 |  
  | | |
  [feat: build wasm package](https://github.com/thx/resvg-js/commit/432427495ee652b4689f4a699a30850932511847 "feat: build wasm package")
  | Feb 15, 2022 |  
  | | | [feat: add a `square` parameter to `cropByBBox()` so it always
  generat…](https://github.com/thx/resvg-js/commit/9b18c973a20ef268b93ea45ada3b203cdcfa363c "feat:
  add a `square` parameter to `cropByBBox\(\)` so it always generates square images

When the bounding box is not square, we sometimes want the cropped image to remain square. For
example, in scenarios like user avatars.") | Sep 24, 2025 |  
| | | | Feb 22, 2022 |  
| | |
[feat: migration napi-rs V2 to V3](https://github.com/thx/resvg-js/commit/46ec7509ea1d0e35cc6946abbeec4b59ade64b61 "feat: migration napi-rs V2 to V3")
| Jan 15, 2026 |  
| | | | Jan 28, 2026 |  
| | | | Jan 28, 2026 |  
| | | [chore: core dependencies disable automatic
upgrades](https://github.com/thx/resvg-js/commit/58db40d638a870547d14499dedb814e9404a2303 "chore:
core dependencies disable automatic upgrades

In particular, resvg is usually not automatically upgraded, because we use a modified fork.") | Mar
30, 2023 |  
| | |
[chore: `napi-build@2.3.1` requires rustc 1.88](https://github.com/thx/resvg-js/commit/6d70155dccfa18bc46617e97fc06f0c4a8fbec8a "chore: `napi-build@2.3.1` requires rustc 1.88")
| Jan 9, 2026 |  
| | |
[style: rust indent changed from 2 to 4 spaces](https://github.com/thx/resvg-js/commit/8288cd939123afd95015a8ab5c395096bff81cd6 "style: rust indent changed from 2 to 4 spaces")
| May 21, 2022 |  
| | | | Oct 8, 2021 |  
| | |
[refactor(wasm): change the `fontsBuffers` option to `fontBuffers`](https://github.com/thx/resvg-js/commit/093b8393f87601acbd549654317eb63c74851c04 "refactor(wasm): change the `fontsBuffers` option to `fontBuffers`")
| Sep 5, 2023 |  
| | | [chore(deps): bump flatted from 3.2.6 to
3.4.2](https://github.com/thx/resvg-js/commit/9de8ddd9dd62293006d849dd846a3b91ba992f23
"chore\(deps\): bump flatted from 3.2.6 to 3.4.2

Bumps \[flatted\]\(https://github.com/WebReflection/flatted\) from 3.2.6 to 3.4.2.

- \[Commits\]\(https://github.com/WebReflection/flatted/compare/v3.2.6...v3.4.2\)

---

updated-dependencies:

- dependency-name: flatted dependency-version: 3.4.2 dependency-type: indirect ...

Signed-off-by: dependabot\[bot\] <support@github.com>") | Mar 26, 2026 |  
| View all files |

# resvg-js

> resvg-js is a high-performance SVG renderer and toolkit, powered by Rust based
> [resvg](https://github.com/RazrFalcon/resvg/), with Node.js backend using
> [napi-rs](https://github.com/napi-rs/napi-rs), also a pure WebAssembly backend. Please use all
> lowercase `resvg-js` when referencing project names.

## Playground

<https://resvg-js.vercel.app>

## Features

- Fast, safe and zero dependencies, with correct output.
- Convert SVG to PNG, includes cropping, scaling and setting the background color.
- Support system fonts and custom fonts in SVG text.
- `v2`: Gets the width and height of the SVG and the generated PNG.
- `v2`: Support for outputting simplified SVG strings, such as converting shapes(rect, circle, etc)
  to `<path>`.
- `v2`: Support WebAssembly.
- `v2`: Support to get SVG bounding box and crop according to bounding box.
- `v2`: Support for loading images of external links in `<image>`.
- No need for node-gyp and postinstall, the `.node` file has been compiled for you.
- Cross-platform support, including
  [Apple M Chips](https://www.apple.com/newsroom/2020/11/apple-unleashes-m1/).
- Support for running as native addons in Deno.

## Installation

### Node.js

```
npm i @resvg/resvg-js
```

### Browser(Wasm)

```
script src="https://unpkg.com/@resvg/resvg-wasm"</script
```

- Node.js see [index.d.ts](https://github.com/thx/resvg-js/blob/main/index.d.ts)
- Wasm see [wasm/index.d.ts](https://github.com/thx/resvg-js/blob/main/wasm/index.d.ts)

## Example

### [Node.js Example](https://github.com/thx/resvg-js/blob/main/example/index.js)

This example will load Source Han Serif, and then render the SVG to PNG.

```
node example/index.js

Loaded 1 font faces in 0ms.
Font './example/SourceHanSerifCN-Light-subset.ttf':0 found in 0.006ms.
✨ Done in 55.65491008758545 ms
```

### [Deno Example](https://github.com/thx/resvg-js/blob/main/example/index-deno.js)

```
deno run --unstable --allow-read --allow-write --allow-ffi example/index-deno.js

[2022-11-16T15:03:29Z DEBUG resvg_js::fonts] Loaded 1 font faces in 0.067ms.
[2022-11-16T15:03:29Z DEBUG resvg_js::fonts] Font './example/SourceHanSerifCN-Light-subset.ttf':0 found in 0.001ms.
Original SVG Size: 1324 x 687
Output PNG Size  : 1200 x 623
✨ Done in 66 ms
```

| SVG | PNG |
| --- | --- |

## Usage

### Node.js

```
const { promises } = require('fs')
const { join } = require('path')
const { Resvg } = require('@resvg/resvg-js')

async function main() {
  const svg = await promises.readFile(join(__dirname, './text.svg'))
  const opts = {
    background: 'rgba(238, 235, 230, .9)',
    fitTo: {
      mode: 'width',
      value: 1200,
    },
    font: {
      fontFiles: ['./example/SourceHanSerifCN-Light-subset.ttf'], // Load custom fonts.
      loadSystemFonts: false, // It will be faster to disable loading system fonts.
      // defaultFontFamily: 'Source Han Serif CN Light', // You can omit this.
    },
  }
  const resvg = new Resvg(svg, opts)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  console.info('Original SVG Size:', `${resvg.width} x ${resvg.height}`)
  console.info('Output PNG Size  :', `${pngData.width} x ${pngData.height}`)

  await promises.writeFile(join(__dirname, './text-out.png'), pngBuffer)
}

main()
```

Starting with [Bun 0.8.1](https://github.com/oven-sh/bun/issues/172#issuecomment-1692930718),
resvg-js can be run directly in Bun without any modification to the JS files, and is fully
compatible with the syntax in Node.js.

```
bun example/index.js
```

Starting with [Deno 1.26.1](https://github.com/denoland/deno/releases/tag/v1.26.1), there is support
for running Native Addons directly from Node.js. This allows for performance that is close to that
found in Node.js.

```
deno run --unstable --allow-read --allow-write --allow-ffi example/index-deno.js
```

```
import * as path from 'https://deno.land/std@0.159.0/path/mod.ts'
import { Resvg } from 'npm:@resvg/resvg-js'
const __dirname = path.dirname(path.fromFileUrl(import.meta.url))

const svg = await Deno.readFile(path.join(__dirname, './text.svg'))
const opts = {
  fitTo: {
    mode: 'width',
    value: 1200,
  },
}

const t = performance.now()
const resvg = new Resvg(svg, opts)
const pngData = resvg.render()
const pngBuffer = pngData.asPng()
console.info('Original SVG Size:', `${resvg.width} x ${resvg.height}`)
console.info('Output PNG Size  :', `${pngData.width} x ${pngData.height}`)
console.info('✨ Done in', performance.now() - t, 'ms')

await Deno.writeFile(path.join(__dirname, './text-out-deno.png'), pngBuffer)
```

### WebAssembly

This package also ships a pure WebAssembly artifact built with `wasm-bindgen` to run in browsers.

#### Browser

```
script src="https://unpkg.com/@resvg/resvg-wasm"</script
script
  ;(async function () {
    // The Wasm must be initialized first
    await resvg.initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))

    const font = await fetch('./fonts/Pacifico-Regular.woff2')
    if (!font.ok) return

    const fontData = await font.arrayBuffer()
    const buffer = new Uint8Array(fontData)

    const opts = {
      fitTo: {
        mode: 'width', // If you need to change the size
        value: 800,
      },
      font: {
        fontBuffers: [buffer], // New in 2.5.0, loading custom fonts
      },
    }

    const svg = '<svg> ... </svg>' // Input SVG, String or Uint8Array
    const resvgJS = new resvg.Resvg(svg, opts)
    const pngData = resvgJS.render(svg, opts) // Output PNG data, Uint8Array
    const pngBuffer = pngData.asPng()
    const svgURL = URL.createObjectURL(new Blob([pngData], { type: 'image/png' }))
    document.getElementById('output').src = svgURL
  })()
</script
```

See [playground](https://github.com/thx/resvg-js/blob/main/wasm/index.html), it is also possible to
[call Wasm in Node.js](https://github.com/thx/resvg-js/blob/main/example/wasm-node.js), but it is
slower.

## Sample Benchmark

```
npm i benny@3.x sharp@0.x @types/sharp svg2img@0.x
npm run bench
```

```
Running "resize width" suite...
  resvg-js(Rust):
    12 ops/s

  sharp:
    9 ops/s

  skr-canvas(Rust):
    7 ops/s

  svg2img(canvg and node-canvas):
    6 ops/s
```

## Support matrix

| Node.js 12           | Node.js 14 | Node.js 16 | Node.js 18 | Node.js 20 | Node.js 22 | npm |
| -------------------- | ---------- | ---------- | ---------- | ---------- | ---------- | --- |
| Windows x64          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Windows x32          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Windows arm64        | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| macOS x64            | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| macOS arm64(M Chips) | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Linux x64 gnu        | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Linux x64 musl       | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Linux arm gnu        | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Linux arm64 gnu      | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Linux arm64 musl     | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Android arm64        | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |
| Android armv7        | ✓          | ✓          | ✓          | ✓          | ✓          | ✓   |

## Test or Contributing

- Install latest `Rust`
- Install `Node.js@10+` which fully supported `Node-API`
- Install `wasm-pack`

```
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

Normally `wasm-pack` will install `wasm-bindgen` automatically, but if the installation
[fails due to network reasons](https://github.com/rustwasm/wasm-pack-template/issues/44#issuecomment-521657516),
please try to install it manually.

```
cargo install wasm-bindgen-cli
```

On computers with Apple M chips, the following error message may appear:

> Error: failed to download from
> <https://github.com/WebAssembly/binaryen/releases/download/version_90/binaryen-version_90-x86_64-apple-darwin.tar.gz>
> Please install binaryen manually:

```
brew install binaryen
```

### Build Node.js bindings

```
npm i
npm run build
npm test
```

### Build WebAssembly bindings

```
npm i
npm run build:wasm
npm run test:wasm
```

### Upgrade Yarn

This project uses Yarn v4. To upgrade to a newer version, run:

```
yarn set version stable
```

This will automatically download the latest stable Yarn from `repo.yarnpkg.com` and update the
`yarnPath` in `.yarnrc.yml`.

> **Note** : If the yarn executable fails to start due to a missing binary, temporarily modify
> `yarnPath` in `.yarnrc.yml` to your current version to bootstrap, then run the upgrade command.

## Roadmap

I will consider implementing the following features, if you happen to be interested, please feel
free to discuss with me or submit a PR.

- Support async API
- Upgrade to napi-rs v2
- Support WebAssembly
- Output usvg-simplified SVG string
- Support for getting SVG Bounding box
- Support for generating more lossless bitmap formats, e.g. avif, webp, JPEG XL

## Release package

We use GitHub actions to automatically publish npm packages.

```
# 1.0.0 => 1.0.1
npm version patch

# or 1.0.0 => 1.1.0
npm version minor
```

## License

Please use all lowercase `resvg-js` when referencing project names. Copyright (c) 2021-present,
yisibl(一丝)

## About

A high-performance SVG renderer and toolkit, powered by Rust based resvg and napi-rs. **2.0k** stars
**12** watching [ forks](https://github.com/thx/resvg-js/forks)

##

[ v2.6.2Latest Mar 26, 2024 ](https://github.com/thx/resvg-js/releases/tag/v2.6.2)

##

## Languages

- [TypeScript33.1%](https://github.com/thx/resvg-js/search?l=typescript)
- [Rust25.3%](https://github.com/thx/resvg-js/search?l=rust)
- [JavaScript24.8%](https://github.com/thx/resvg-js/search?l=javascript)
- [HTML16.8%](https://github.com/thx/resvg-js/search?l=html)

You can’t perform that action at this time.
