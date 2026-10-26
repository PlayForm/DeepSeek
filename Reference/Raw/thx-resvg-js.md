# resvg-js


- [![GitHub CI Status](https://github.com/thx/resvg-js/actions/workflows/CI.yaml/badge.svg?branch=main)](https://github.com/yisibl/resvg-js/actions/workflows/CI.yaml?query=event%3Apush+branch%3Amain)
- [![@resvg/resvg-js npm version](https://camo.githubusercontent.com/f002e231e9ad5411a49f54d9d140a2eb29a55e1720e03daeb0e752d1e7e34a4b/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js)
- [![@resvg/resvg-js downloads](https://camo.githubusercontent.com/c0c233a9f6b4f4feb46372bf5e9e89c18e10ee0edfac4125a405b083eb83c55f/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f646d2f4072657376672f72657376672d6a732e7376673f73616e6974697a653d74727565)](https://npmcharts.com/compare/@resvg/resvg-js?minimal=true)
- [![Rust 1.65+](https://camo.githubusercontent.com/7c811ef78a65cca3c014d36045bd07867e5cabe5155bd558db84b2c6ded1f2df/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f727573742d312e36352b2d6f72616e67652e737667)](https://www.rust-lang.org)

> resvg-js is a high-performance SVG renderer and toolkit, powered by Rust based [resvg](https://github.com/RazrFalcon/resvg/), with Node.js backend using [napi-rs](https://github.com/napi-rs/napi-rs), also a pure WebAssembly backend.

Please use all lowercase `resvg-js` when referencing project names.

## Playground


<https://resvg-js.vercel.app>

## Features


- Fast, safe and zero dependencies, with correct output.
- Convert SVG to PNG, includes cropping, scaling and setting the background color.
- Support system fonts and custom fonts in SVG text.
- `v2`: Gets the width and height of the SVG and the generated PNG.
- `v2`: Support for outputting simplified SVG strings, such as converting shapes(rect, circle, etc) to `<path>`.
- `v2`: Support WebAssembly.
- `v2`: Support to get SVG bounding box and crop according to bounding box.
- `v2`: Support for loading images of external links in `<image>`.
- No need for node-gyp and postinstall, the `.node` file has been compiled for you.
- Cross-platform support, including [Apple M Chips](https://www.apple.com/newsroom/2020/11/apple-unleashes-m1/).
- Support for running as native addons in Deno.

## Installation


### Node.js


npm i @resvg/resvg-js

### Browser(Wasm)


\<script src="https://unpkg.com/@resvg/resvg-wasm"\>\</script\>

## Docs


- Node.js see [index.d.ts](./thx-resvg-js-blob-main-index.d.ts.md)
- Wasm see [wasm/index.d.ts](./thx-resvg-js-blob-main-wasm-index.d.ts.md)

## Example


### [Node.js Example](./thx-resvg-js-blob-main-example-index.js.md)


This example will load Source Han Serif, and then render the SVG to PNG.

node example/index.js\
\
Loaded 1 font faces in 0ms.\
Font './example/SourceHanSerifCN-Light-subset.ttf':0 found in 0.006ms.\
✨ Done in 55.65491008758545 ms

### [Deno Example](./thx-resvg-js-blob-main-example-index-deno.js.md)


deno run --unstable --allow-read --allow-write --allow-ffi example/index-deno.js\
\
\[2022-11-16T15:03:29Z DEBUG resvg_js::fonts\] Loaded 1 font faces in 0.067ms.\
\[2022-11-16T15:03:29Z DEBUG resvg_js::fonts\] Font './example/SourceHanSerifCN-Light-subset.ttf':0 found in 0.001ms.\
Original SVG Size: 1324 x 687\
Output PNG Size  : 1200 x 623\
✨ Done in 66 ms

| SVG | PNG |
|----|----|
| [![](./thx-resvg-js-raw-main-example-text.svg.md)](/thx/resvg-js/blob/main/example/text.svg) | [![](./thx-resvg-js-raw-main-example-text-out.png.md)](/thx/resvg-js/blob/main/example/text-out.png) |

## Usage


### Node.js


const { promises } = require('fs')\
const { join } = require('path')\
const { Resvg } = require('@resvg/resvg-js')\
\
async function main() {\
  const svg = await promises.readFile(join(\_\_dirname, './text.svg'))\
  const opts = {\
    background: 'rgba(238, 235, 230, .9)',\
    fitTo: {\
      mode: 'width',\
      value: 1200,\
    },\
    font: {\
      fontFiles: \['./example/SourceHanSerifCN-Light-subset.ttf'\], // Load custom fonts.\
      loadSystemFonts: false, // It will be faster to disable loading system fonts.\
      // defaultFontFamily: 'Source Han Serif CN Light', // You can omit this.\
    },\
  }\
  const resvg = new Resvg(svg, opts)\
  const pngData = resvg.render()\
  const pngBuffer = pngData.asPng()\
\
  console.info('Original SVG Size:', \`\${resvg.width} x \${resvg.height}\`)\
  console.info('Output PNG Size  :', \`\${pngData.width} x \${pngData.height}\`)\
\
  await promises.writeFile(join(\_\_dirname, './text-out.png'), pngBuffer)\
}\
\
main()

### Bun


Starting with [Bun 0.8.1](https://github.com/oven-sh/bun/issues/172#issuecomment-1692930718), resvg-js can be run directly in Bun without any modification to the JS files, and is fully compatible with the syntax in Node.js.

bun example/index.js

### Deno


Starting with [Deno 1.26.1](https://github.com/denoland/deno/releases/tag/v1.26.1), there is support for running Native Addons directly from Node.js. This allows for performance that is close to that found in Node.js.

deno run --unstable --allow-read --allow-write --allow-ffi example/index-deno.js

import \* as path from 'https://deno.land/std@0.159.0/path/mod.ts'\
import { Resvg } from 'npm:@resvg/resvg-js'\
const \_\_dirname = path.dirname(path.fromFileUrl(import.meta.url))\
\
const svg = await Deno.readFile(path.join(\_\_dirname, './text.svg'))\
const opts = {\
  fitTo: {\
    mode: 'width',\
    value: 1200,\
  },\
}\
\
const t = performance.now()\
const resvg = new Resvg(svg, opts)\
const pngData = resvg.render()\
const pngBuffer = pngData.asPng()\
console.info('Original SVG Size:', \`\${resvg.width} x \${resvg.height}\`)\
console.info('Output PNG Size  :', \`\${pngData.width} x \${pngData.height}\`)\
console.info('✨ Done in', performance.now() - t, 'ms')\
\
await Deno.writeFile(path.join(\_\_dirname, './text-out-deno.png'), pngBuffer)

### WebAssembly


This package also ships a pure WebAssembly artifact built with `wasm-bindgen` to run in browsers.

#### Browser


\<script src="https://unpkg.com/@resvg/resvg-wasm"\>\</script\>\
\<script\>\
  ;(async function () {\
    // The Wasm must be initialized first\
    await resvg.initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))\
\
    const font = await fetch('./fonts/Pacifico-Regular.woff2')\
    if (!font.ok) return\
\
    const fontData = await font.arrayBuffer()\
    const buffer = new Uint8Array(fontData)\
\
    const opts = {\
      fitTo: {\
        mode: 'width', // If you need to change the size\
        value: 800,\
      },\
      font: {\
        fontBuffers: \[buffer\], // New in 2.5.0, loading custom fonts\
      },\
    }\
\
    const svg = '\<svg\> ... \</svg\>' // Input SVG, String or Uint8Array\
    const resvgJS = new resvg.Resvg(svg, opts)\
    const pngData = resvgJS.render(svg, opts) // Output PNG data, Uint8Array\
    const pngBuffer = pngData.asPng()\
    const svgURL = URL.createObjectURL(new Blob(\[pngData\], { type: 'image/png' }))\
    document.getElementById('output').src = svgURL\
  })()\
\</script\>

See [playground](./thx-resvg-js-blob-main-wasm-index.html.md), it is also possible to [call Wasm in Node.js](./thx-resvg-js-blob-main-example-wasm-node.js.md), but it is slower.

## Sample Benchmark


npm i benny@3.x sharp@0.x @types/sharp svg2img@0.x\
npm run bench

Running "resize width" suite...\
  resvg-js(Rust):\
    12 ops/s\
\
  sharp:\
    9 ops/s\
\
  skr-canvas(Rust):\
    7 ops/s\
\
  svg2img(canvg and node-canvas):\
    6 ops/s

## Support matrix


|  | Node.js 12 | Node.js 14 | Node.js 16 | Node.js 18 | Node.js 20 | Node.js 22 | npm |
|----|----|----|----|----|----|----|----|
| Windows x64 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/0304b7f3255972f943c0a67b33b81d1f8ed575536445ececeeb0d972fa9a4dc6/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d77696e33322d7836342d6d7376632e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-win32-x64-msvc) |
| Windows x32 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/959de4946633b4a2868cf0cf5919c880a644f812703952945f4584f2bd220e5d/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d77696e33322d696133322d6d7376632e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-win32-ia32-msvc) |
| Windows arm64 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/3a9df42f0d1ff9f17b29019c031461f2bb57d4d800d5f3849cc2e50544d0f9f9/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d77696e33322d61726d36342d6d7376632e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-win32-arm64-msvc) |
| macOS x64 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/e9a9db5fa885c7ff4dc7d335fca36b16d8cd7809c60ee1ca1893dccccd90ee3a/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d64617277696e2d7836342e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-darwin-x64) |
| macOS arm64(M Chips) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/49392e8d0a23289e9a05e6cec1a2a385936d91b432bb2392ce28be16205e1c1e/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d64617277696e2d61726d36342e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-darwin-arm64) |
| Linux x64 gnu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/f8cc2e0b26163d2aaac1474d58b24efb7d592d1d310ca289eba1eea080f76e1c/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d6c696e75782d7836342d676e752e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-gnu) |
| Linux x64 musl | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/4c64a67e1efb4723928bfcb837dea6ec255473aa227d705b173d48e8d3b8a670/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d6c696e75782d7836342d6d75736c2e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-musl) |
| Linux arm gnu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/233f04009e18e2a4f683ac9d44d3f6c72d802909ec2dc7e3e8a68ce7b07a7d9b/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d6c696e75782d61726d2d676e756561626968662e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm-gnueabihf) |
| Linux arm64 gnu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/4f68548fe9ec3140c9427be1288932d442b2355d24a63e126077c0d438b59032/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d6c696e75782d61726d36342d676e752e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-gnu) |
| Linux arm64 musl | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/ec069ca7b4b4306bba46831be86762370e9d98f763729862db230dd779915d9b/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d6c696e75782d61726d36342d6d75736c2e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-musl) |
| Android arm64 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/f8d31d7aa1c478e2b3785d8706ae18c8a79325735aba8907748d46bf123869aa/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d616e64726f69642d61726d36342e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-android-arm64) |
| Android armv7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [![npm version](https://camo.githubusercontent.com/4767a7c74130d5a3d4d6356dd6718c7fa486ea92bc56c689fdd998dfd3122f81/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f4072657376672f72657376672d6a732d616e64726f69642d61726d2d656162692e7376673f73616e6974697a653d74727565)](https://www.npmjs.com/package/@resvg/resvg-js-android-arm-eabi) |

## Test or Contributing


- Install latest `Rust`

- Install `Node.js@10+` which fully supported `Node-API`

- Install `wasm-pack`

  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh

  Normally `wasm-pack` will install `wasm-bindgen` automatically, but if the installation [fails due to network reasons](https://github.com/rustwasm/wasm-pack-template/issues/44#issuecomment-521657516), please try to install it manually.

  cargo install wasm-bindgen-cli

  On computers with Apple M chips, the following error message may appear:

  > Error: failed to download from <https://github.com/WebAssembly/binaryen/releases/download/version_90/binaryen-version_90-x86_64-apple-darwin.tar.gz>

  Please install binaryen manually:

  brew install binaryen

### Build Node.js bindings


npm i\
npm run build\
npm test

### Build WebAssembly bindings


npm i\
npm run build:wasm\
npm run test:wasm

### Upgrade Yarn


This project uses Yarn v4. To upgrade to a newer version, run:

yarn set version stable

This will automatically download the latest stable Yarn from `repo.yarnpkg.com` and update the `yarnPath` in `.yarnrc.yml`.

> **Note**: If the yarn executable fails to start due to a missing binary, temporarily modify `yarnPath` in `.yarnrc.yml` to your current version to bootstrap, then run the upgrade command.

## Roadmap


I will consider implementing the following features, if you happen to be interested, please feel free to discuss with me or submit a PR.

- Support async API
- Upgrade to napi-rs v2
- Support WebAssembly
- Output usvg-simplified SVG string
- Support for getting SVG Bounding box
- Support for generating more lossless bitmap formats, e.g. avif, webp, JPEG XL

## Release package


We use GitHub actions to automatically publish npm packages.

\# 1.0.0 =\> 1.0.1\
npm version patch\
\
\# or 1.0.0 =\> 1.1.0\
npm version minor

## License


Please use all lowercase `resvg-js` when referencing project names.

[MPLv2.0](https://www.mozilla.org/en-US/MPL/)

Copyright (c) 2021-present, yisibl(一丝)

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fthx%2Fresvg-js.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fthx%2Fresvg-js
- [GitHub Copilot Write better code with AI](https://github.com/features/copilot)
- [GitHub Copilot app Direct agents from issue to merge](https://github.com/features/ai/github-app)
- [MCP Registry Integrate external tools](https://github.com/mcp)
- [Actions Automate any workflow](https://github.com/features/actions)
- [Codespaces Instant dev environments](https://github.com/features/codespaces)
- [Issues Plan and track work](https://github.com/features/issues)
- [Code Review Manage code changes](https://github.com/features/code-review)
- [Code Quality Enforce quality at merge](https://github.com/features/code-quality)
- [GitHub Advanced Security Find and fix vulnerabilities](https://github.com/security/advanced-security)
- [Code security Secure your code as you build](https://github.com/security/advanced-security/code-security)
- [Secret protection Stop leaks before they start](https://github.com/security/advanced-security/secret-protection)
- [Why GitHub](https://github.com/why-github)
- [Documentation](https://docs.github.com)
- [Blog](https://github.blog)
- [Changelog](https://github.blog/changelog)
- [Marketplace](https://github.com/marketplace)
- [View all features](https://github.com/features)
- [Enterprises](https://github.com/enterprise)
- [Small and medium teams](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [App Modernization](https://github.com/solutions/use-case/app-modernization)
- [DevSecOps](https://github.com/solutions/use-case/devsecops)
- [DevOps](https://github.com/solutions/use-case/devops)
- [CI/CD](https://github.com/solutions/use-case/ci-cd)
- [View all use cases](https://github.com/solutions/use-case)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [View all solutions](https://github.com/solutions)
- [AI](https://github.com/resources/articles?topic=ai)
- [Software Development](https://github.com/resources/articles?topic=software-development)
- [DevOps](https://github.com/resources/articles?topic=devops)
- [Security](https://github.com/resources/articles?topic=security)
- [View all topics](https://github.com/resources/articles)
- [Customer stories](https://github.com/customer-stories)
- [Events & webinars](https://github.com/resources/events)
- [Ebooks & reports](https://github.com/resources/whitepapers)
- [Business insights](https://github.com/solutions/executive-insights)
- [GitHub Skills](https://skills.github.com)
- [Customer support](https://support.github.com)
- [Community forum](https://github.com/orgs/community/discussions)
- [Trust center](https://github.com/trust-center)
- [Partners](https://github.com/partners)
- [View all resources](https://github.com/resources)
- [GitHub Sponsors Fund open source developers](https://github.com/open-source/sponsors)
- [Security Lab](https://securitylab.github.com)
- [Maintainer Community](https://maintainers.github.com)
- [GitHub Stars](https://stars.github.com)
- [Archive Program](https://archiveprogram.github.com)
- [Topics](https://github.com/topics)
- [Trending](https://github.com/trending)
- [Collections](https://github.com/collections)
- [Copilot for Business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Pricing](https://github.com/pricing)
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=thx%2Fresvg-js.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=thx%2Fresvg-js
- [thx](./thx.md) - source: /thx
- [resvg-js](./thx-resvg-js.md) - source: /thx/resvg-js
- [Issues 52](./thx-resvg-js-issues.md) - source: /thx/resvg-js/issues
- [Pull requests 26](./thx-resvg-js-pulls.md) - source: /thx/resvg-js/pulls
- [Actions](./thx-resvg-js-actions.md) - source: /thx/resvg-js/actions
- [Projects](./thx-resvg-js-projects.md) - source: /thx/resvg-js/projects
- [Security and quality](./thx-resvg-js-security.md) - source: /thx/resvg-js/security
- [Insights](./thx-resvg-js-pulse.md) - source: /thx/resvg-js/pulse
- [Notifications](./login?return_to=%2Fthx%2Fresvg-js.md) - source: /login?return_to=%2Fthx%2Fresvg-js
- [resvg-js.vercel.app/](https://resvg-js.vercel.app/)
- [nodejs](./topics-nodejs.md) - source: /topics/nodejs
- [rust](./topics-rust.md) - source: /topics/rust
- [svg](./topics-svg.md) - source: /topics/svg
- [wasm](./topics-wasm.md) - source: /topics/wasm
- [Activity](./thx-resvg-js-activity.md) - source: /thx/resvg-js/activity
- [Custom properties](./thx-resvg-js-custom-properties.md) - source: /thx/resvg-js/custom-properties
- [82 forks](./thx-resvg-js-forks.md) - source: /thx/resvg-js/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fthx%2Fresvg-js&report=thx+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fthx%2Fresvg-js&report=thx+%28user%29
- [29 Branches](./thx-resvg-js-branches.md) - source: /thx/resvg-js/branches
- [37 Tags](./thx-resvg-js-tags.md) - source: /thx/resvg-js/tags
- [dependabot[bot]](./thx-resvg-js-commits?author=dependabot%5Bbot%5D.md) - source: /thx/resvg-js/commits?author=dependabot%5Bbot%5D
- [yisibl](./thx-resvg-js-commits?author=yisibl.md) - source: /thx/resvg-js/commits?author=yisibl
- [chore(deps): bump flatted from 3.2.6 to 3.4.2](./thx-resvg-js-commit-9de8ddd9dd62293006d849dd846a3b91ba992f23.md) - source: /thx/resvg-js/commit/9de8ddd9dd62293006d849dd846a3b91ba992f23
- [409 Commits](./thx-resvg-js-commits-main.md) - source: /thx/resvg-js/commits/main/
- [.cargo](./thx-resvg-js-tree-main-.cargo.md) - source: /thx/resvg-js/tree/main/.cargo
- [fix: enable static link for windows-msvc (](./thx-resvg-js-commit-83517cedc0afcdadd7a4cdb64edcd4bb0a891648.md) - source: /thx/resvg-js/commit/83517cedc0afcdadd7a4cdb64edcd4bb0a891648
- [#308](https://github.com/thx/resvg-js/pull/308)
- [.github/ workflows](./thx-resvg-js-tree-main-.github-workflows.md) - source: /thx/resvg-js/tree/main/.github/workflows
- [chore(ci): add font mounting and debug commands for Linux binding tests](./thx-resvg-js-commit-ca777cd1abbb5f9ec9ab9951a4bf585bf5a71251.md) - source: /thx/resvg-js/commit/ca777cd1abbb5f9ec9ab9951a4bf585bf5a71251
- [.husky](./thx-resvg-js-tree-main-.husky.md) - source: /thx/resvg-js/tree/main/.husky
- [👻 init](./thx-resvg-js-commit-ca60aaed9846365b339ffdd94014514d74651be1.md) - source: /thx/resvg-js/commit/ca60aaed9846365b339ffdd94014514d74651be1
- [.yarn/ releases](./thx-resvg-js-tree-main-.yarn-releases.md) - source: /thx/resvg-js/tree/main/.yarn/releases
- [chore(ci): migrating CI to napi-rs v3 and yarn v4.12.0](./thx-resvg-js-commit-0910270c765f3b49d8f6fc56fa75a9eab2ac5376.md) - source: /thx/resvg-js/commit/0910270c765f3b49d8f6fc56fa75a9eab2ac5376
- [__test__](./thx-resvg-js-tree-main-__test__.md) - source: /thx/resvg-js/tree/main/__test__
- [refactor: extract cropByBBox logic and prevent overflow panics](./thx-resvg-js-commit-6d2e209d4cd0d6c91b44be81ac6b8bc5c390d825.md) - source: /thx/resvg-js/commit/6d2e209d4cd0d6c91b44be81ac6b8bc5c390d825
- [benchmark](./thx-resvg-js-tree-main-benchmark.md) - source: /thx/resvg-js/tree/main/benchmark
- [chore: remove bench-related dependencies](./thx-resvg-js-commit-aa93f748f2831c25b80cdb295a4bfffd5c989650.md) - source: /thx/resvg-js/commit/aa93f748f2831c25b80cdb295a4bfffd5c989650
- [example](./thx-resvg-js-tree-main-example.md) - source: /thx/resvg-js/tree/main/example
- [npm](./thx-resvg-js-tree-main-npm.md) - source: /thx/resvg-js/tree/main/npm
- [2.7.0-alpha.2](./thx-resvg-js-commit-8697a26bda4408c074e1afd264ff601e5e29b328.md) - source: /thx/resvg-js/commit/8697a26bda4408c074e1afd264ff601e5e29b328
- [scripts](./thx-resvg-js-tree-main-scripts.md) - source: /thx/resvg-js/tree/main/scripts
- [feat: more aggressive GC to prevent continued growth of memory usage](./thx-resvg-js-commit-9ddc1e8b1cb721ac0d656a1e9502b8b9ed33e361.md) - source: /thx/resvg-js/commit/9ddc1e8b1cb721ac0d656a1e9502b8b9ed33e361
- [src](./thx-resvg-js-tree-main-src.md) - source: /thx/resvg-js/tree/main/src
- [wasm](./thx-resvg-js-tree-main-wasm.md) - source: /thx/resvg-js/tree/main/wasm
- [.editorconfig](./thx-resvg-js-blob-main-.editorconfig.md) - source: /thx/resvg-js/blob/main/.editorconfig
- [style: rust indent changed from 2 to 4 spaces](./thx-resvg-js-commit-8288cd939123afd95015a8ab5c395096bff81cd6.md) - source: /thx/resvg-js/commit/8288cd939123afd95015a8ab5c395096bff81cd6
- [.eslintignore](./thx-resvg-js-blob-main-.eslintignore.md) - source: /thx/resvg-js/blob/main/.eslintignore
- [refactor: wasm binding and test](./thx-resvg-js-commit-8e925aae30c386b009da413b671f33ba36801408.md) - source: /thx/resvg-js/commit/8e925aae30c386b009da413b671f33ba36801408
- [.eslintrc.yml](./thx-resvg-js-blob-main-.eslintrc.yml.md) - source: /thx/resvg-js/blob/main/.eslintrc.yml
- [chore: add deno example](./thx-resvg-js-commit-530611351e4159e62caffa164bde110b8b17b6fb.md) - source: /thx/resvg-js/commit/530611351e4159e62caffa164bde110b8b17b6fb
- [.gitattributes](./thx-resvg-js-blob-main-.gitattributes.md) - source: /thx/resvg-js/blob/main/.gitattributes
- [1.1.0](./thx-resvg-js-commit-dff92961d2dc5159481ccd21a80a28332f3a0a9d.md) - source: /thx/resvg-js/commit/dff92961d2dc5159481ccd21a80a28332f3a0a9d
- [.gitignore](./thx-resvg-js-blob-main-.gitignore.md) - source: /thx/resvg-js/blob/main/.gitignore
- [chore: upgrade yarn from v1 to v3](./thx-resvg-js-commit-92eea4f90d032cfe2aa78a03a99d144ad37d2168.md) - source: /thx/resvg-js/commit/92eea4f90d032cfe2aa78a03a99d144ad37d2168
- [.npmignore](./thx-resvg-js-blob-main-.npmignore.md) - source: /thx/resvg-js/blob/main/.npmignore
- [feat: upgrade to napi2 (](./thx-resvg-js-commit-a24d2586ef478697eadae5262469f8f4a69cb66d.md) - source: /thx/resvg-js/commit/a24d2586ef478697eadae5262469f8f4a69cb66d
- [#41](https://github.com/thx/resvg-js/pull/41)
- [.prettierignore](./thx-resvg-js-blob-main-.prettierignore.md) - source: /thx/resvg-js/blob/main/.prettierignore
- [.yarnrc.yml](./thx-resvg-js-blob-main-.yarnrc.yml.md) - source: /thx/resvg-js/blob/main/.yarnrc.yml
- [CHANGELOG.md](./thx-resvg-js-blob-main-CHANGELOG.md.md) - source: /thx/resvg-js/blob/main/CHANGELOG.md
- [Cargo.toml](./thx-resvg-js-blob-main-Cargo.toml.md) - source: /thx/resvg-js/blob/main/Cargo.toml
- [feat: add catch_unwind protection to render to prevent Node.js proces…](./thx-resvg-js-commit-4b2adf32c34e1176b64cda579badac256ba6df7a.md) - source: /thx/resvg-js/commit/4b2adf32c34e1176b64cda579badac256ba6df7a
- [LICENSE](./thx-resvg-js-blob-main-LICENSE.md) - source: /thx/resvg-js/blob/main/LICENSE
- [README.md](./thx-resvg-js-blob-main-README.md.md) - source: /thx/resvg-js/blob/main/README.md
- [build.rs](./thx-resvg-js-blob-main-build.rs.md) - source: /thx/resvg-js/blob/main/build.rs
- [bundle.js](./thx-resvg-js-blob-main-bundle.js.md) - source: /thx/resvg-js/blob/main/bundle.js
- [feat: build wasm package](./thx-resvg-js-commit-432427495ee652b4689f4a699a30850932511847.md) - source: /thx/resvg-js/commit/432427495ee652b4689f4a699a30850932511847
- [index.d.ts](./thx-resvg-js-blob-main-index.d.ts.md) - source: /thx/resvg-js/blob/main/index.d.ts
- [feat: add a square parameter to cropByBBox() so it always generat…](./thx-resvg-js-commit-9b18c973a20ef268b93ea45ada3b203cdcfa363c.md) - source: /thx/resvg-js/commit/9b18c973a20ef268b93ea45ada3b203cdcfa363c
- [index.js](./thx-resvg-js-blob-main-index.js.md) - source: /thx/resvg-js/blob/main/index.js
- [test: new class API](./thx-resvg-js-commit-5a0946cfa298fddebbcb13babb3010c542739001.md) - source: /thx/resvg-js/commit/5a0946cfa298fddebbcb13babb3010c542739001
- [js-binding.d.ts](./thx-resvg-js-blob-main-js-binding.d.ts.md) - source: /thx/resvg-js/blob/main/js-binding.d.ts
- [feat: migration napi-rs V2 to V3](./thx-resvg-js-commit-46ec7509ea1d0e35cc6946abbeec4b59ade64b61.md) - source: /thx/resvg-js/commit/46ec7509ea1d0e35cc6946abbeec4b59ade64b61
- [js-binding.js](./thx-resvg-js-blob-main-js-binding.js.md) - source: /thx/resvg-js/blob/main/js-binding.js
- [package.json](./thx-resvg-js-blob-main-package.json.md) - source: /thx/resvg-js/blob/main/package.json
- [renovate.json](./thx-resvg-js-blob-main-renovate.json.md) - source: /thx/resvg-js/blob/main/renovate.json
- [chore: core dependencies disable automatic upgrades](./thx-resvg-js-commit-58db40d638a870547d14499dedb814e9404a2303.md) - source: /thx/resvg-js/commit/58db40d638a870547d14499dedb814e9404a2303
- [rust-toolchain.toml](./thx-resvg-js-blob-main-rust-toolchain.toml.md) - source: /thx/resvg-js/blob/main/rust-toolchain.toml
- [chore: napi-build@2.3.1 requires rustc 1.88](./thx-resvg-js-commit-6d70155dccfa18bc46617e97fc06f0c4a8fbec8a.md) - source: /thx/resvg-js/commit/6d70155dccfa18bc46617e97fc06f0c4a8fbec8a
- [rustfmt.toml](./thx-resvg-js-blob-main-rustfmt.toml.md) - source: /thx/resvg-js/blob/main/rustfmt.toml
- [tsconfig.json](./thx-resvg-js-blob-main-tsconfig.json.md) - source: /thx/resvg-js/blob/main/tsconfig.json
- [wasm-binding.ts](./thx-resvg-js-blob-main-wasm-binding.ts.md) - source: /thx/resvg-js/blob/main/wasm-binding.ts
- [refactor(wasm): change the fontsBuffers option to fontBuffers](./thx-resvg-js-commit-093b8393f87601acbd549654317eb63c74851c04.md) - source: /thx/resvg-js/commit/093b8393f87601acbd549654317eb63c74851c04
- [yarn.lock](./thx-resvg-js-blob-main-yarn.lock.md) - source: /thx/resvg-js/blob/main/yarn.lock
- [https://github.com/yisibl/resvg-js/actions/workflows/CI.yaml?query=event%3Apush+branch%3Amain](https://github.com/yisibl/resvg-js/actions/workflows/CI.yaml?query=event%3Apush+branch%3Amain)
- [https://www.npmjs.com/package/@resvg/resvg-js](https://www.npmjs.com/package/@resvg/resvg-js)
- [https://npmcharts.com/compare/@resvg/resvg-js?minimal=true](https://npmcharts.com/compare/@resvg/resvg-js?minimal=true)
- [https://www.rust-lang.org](https://www.rust-lang.org)
- [resvg](https://github.com/RazrFalcon/resvg/)
- [napi-rs](https://github.com/napi-rs/napi-rs)
- [https://resvg-js.vercel.app](https://resvg-js.vercel.app)
- [Apple M Chips](https://www.apple.com/newsroom/2020/11/apple-unleashes-m1/)
- [wasm/index.d.ts](./thx-resvg-js-blob-main-wasm-index.d.ts.md) - source: /thx/resvg-js/blob/main/wasm/index.d.ts
- [Node.js Example](./thx-resvg-js-blob-main-example-index.js.md) - source: /thx/resvg-js/blob/main/example/index.js
- [Deno Example](./thx-resvg-js-blob-main-example-index-deno.js.md) - source: /thx/resvg-js/blob/main/example/index-deno.js
- [/thx/resvg-js/blob/main/example/text.svg](./thx-resvg-js-blob-main-example-text.svg.md) - source: /thx/resvg-js/blob/main/example/text.svg
- [/thx/resvg-js/blob/main/example/text-out.png](./thx-resvg-js-blob-main-example-text-out.png.md) - source: /thx/resvg-js/blob/main/example/text-out.png
- [Bun 0.8.1](https://github.com/oven-sh/bun/issues/172#issuecomment-1692930718)
- [Deno 1.26.1](https://github.com/denoland/deno/releases/tag/v1.26.1)
- [playground](./thx-resvg-js-blob-main-wasm-index.html.md) - source: /thx/resvg-js/blob/main/wasm/index.html
- [call Wasm in Node.js](./thx-resvg-js-blob-main-example-wasm-node.js.md) - source: /thx/resvg-js/blob/main/example/wasm-node.js
- [https://www.npmjs.com/package/@resvg/resvg-js-win32-x64-msvc](https://www.npmjs.com/package/@resvg/resvg-js-win32-x64-msvc)
- [https://www.npmjs.com/package/@resvg/resvg-js-win32-ia32-msvc](https://www.npmjs.com/package/@resvg/resvg-js-win32-ia32-msvc)
- [https://www.npmjs.com/package/@resvg/resvg-js-win32-arm64-msvc](https://www.npmjs.com/package/@resvg/resvg-js-win32-arm64-msvc)
- [https://www.npmjs.com/package/@resvg/resvg-js-darwin-x64](https://www.npmjs.com/package/@resvg/resvg-js-darwin-x64)
- [https://www.npmjs.com/package/@resvg/resvg-js-darwin-arm64](https://www.npmjs.com/package/@resvg/resvg-js-darwin-arm64)
- [https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-gnu](https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-gnu)
- [https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-musl](https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-musl)
- [https://www.npmjs.com/package/@resvg/resvg-js-linux-arm-gnueabihf](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm-gnueabihf)
- [https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-gnu](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-gnu)
- [https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-musl](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-musl)
- [https://www.npmjs.com/package/@resvg/resvg-js-android-arm64](https://www.npmjs.com/package/@resvg/resvg-js-android-arm64)
- [https://www.npmjs.com/package/@resvg/resvg-js-android-arm-eabi](https://www.npmjs.com/package/@resvg/resvg-js-android-arm-eabi)
- [fails due to network reasons](https://github.com/rustwasm/wasm-pack-template/issues/44#issuecomment-521657516)
- [https://github.com/WebAssembly/binaryen/releases/download/version_90/binaryen-version_90-x86_64-appl](https://github.com/WebAssembly/binaryen/releases/download/version_90/binaryen-version_90-x86_64-apple-darwin.tar.gz)
- [MPLv2.0](https://www.mozilla.org/en-US/MPL/)
- [Releases](./thx-resvg-js-releases.md) - source: /thx/resvg-js/releases
- [v2.6.2 Latest Mar 26, 2024](./thx-resvg-js-releases-tag-v2.6.2.md) - source: /thx/resvg-js/releases/tag/v2.6.2
- [Contributors](./thx-resvg-js-graphs-contributors.md) - source: /thx/resvg-js/graphs/contributors
- [/yisibl](./yisibl.md) - source: /yisibl
- [/renovate[bot]](./renovate[bot].md) - source: /renovate[bot]
- [/zimond](./zimond.md) - source: /zimond
- [/renovate-bot](./renovate-bot.md) - source: /renovate-bot
- [/dependabot[bot]](./dependabot[bot].md) - source: /dependabot[bot]
- [/Brooooooklyn](./Brooooooklyn.md) - source: /Brooooooklyn
- [/axelhzf](./axelhzf.md) - source: /axelhzf
- [/XhmikosR](./XhmikosR.md) - source: /XhmikosR
- [/Nkay](./Nkay.md) - source: /Nkay
- [/JoKalliauer](./JoKalliauer.md) - source: /JoKalliauer
- [/CGQAQ](./CGQAQ.md) - source: /CGQAQ
- [/hadeeb](./hadeeb.md) - source: /hadeeb
- [/antmelnyk](./antmelnyk.md) - source: /antmelnyk
- [/Zagrios](./Zagrios.md) - source: /Zagrios
- [TypeScript 33.1%](./thx-resvg-js-search?l=typescript.md) - source: /thx/resvg-js/search?l=typescript
- [Rust 25.3%](./thx-resvg-js-search?l=rust.md) - source: /thx/resvg-js/search?l=rust
- [JavaScript 24.8%](./thx-resvg-js-search?l=javascript.md) - source: /thx/resvg-js/search?l=javascript
- [HTML 16.8%](./thx-resvg-js-search?l=html.md) - source: /thx/resvg-js/search?l=html
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
