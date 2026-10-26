# clipper2-wasm

[![](https://img.jsdelivr.com/github.com/ErikSom.png) ErikSom](/?query=author%3A%20ErikSom) esm

- [![clipper2-wasm JS library on GitHub](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/github.svg)](https://github.com/ErikSom/Clipper2-WASM/)
- [![clipper2-wasm JS library on npm](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/npm.svg)](https://www.npmjs.com/package/clipper2-wasm)
- [![Download clipper2-wasm JS library](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/download.svg)](https://registry.npmjs.org/clipper2-wasm/-/clipper2-wasm-0.4.0.tgz)

WebAssembly port of the Clipper2 library for polygon clipping and offsetting

Version 0.4.0 License BSL-1.0 ![clipper2-wasm has no homepage](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/globe.disabled.svg) [![clipper2-wasm JS library on GitHub](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/github.svg)](https://github.com/ErikSom/Clipper2-WASM/) [![clipper2-wasm JS library on npm](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/npm.svg)](https://www.npmjs.com/package/clipper2-wasm) [![Download clipper2-wasm JS library](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/download.svg)](https://registry.npmjs.org/clipper2-wasm/-/clipper2-wasm-0.4.0.tgz) Keywords clipper polygon clipping offsetting wasm webassembly INSTALL Type: Version:

- Static
- Latest Patch
- Latest Minor
- Latest Major
- 
- 0.4.0
- 0.3.0
- 0.2.1
- 0.2.0
- 0.1.0
- 0.0.9
- 0.0.8
- 0.0.7
- 0.0.6
- 0.0.5
- 0.0.4
- 0.0.3
- 0.0.2
- 0.0.1

\<script src=" <https://cdn.jsdelivr.net/npm/clipper2-wasm@0.4.0/dist/umd/clipper2z.min.js> "\>\</script\> [Learn more](./documentation.md#id-npm)

- [![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/book.svg) Readme](/package/npm/clipper2-wasm)
- [![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/settings.svg) Files](?tab=files)
- [![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/statistics.svg) Statistics](?tab=stats)
- [Browse CDN ![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/external-link.svg)](https://cdn.jsdelivr.net/npm/clipper2-wasm/)

[![npm version](https://badge.fury.io/js/clipper2-wasm.svg)](https://badge.fury.io/js/clipper2-wasm)

# Clipper2 WASM

The **Clipper2** library performs **intersection**, **union**, **difference** and **XOR** boolean operations on both simple and complex polygons. It also performs polygon offsetting and constrained Delaunay triangulation.

## Documentation:

For Clipper2 documentation please see the [Extensive HTML documentation](http://www.angusj.com/clipper2/Docs/Overview.htm)

## Live examples:

- [Basic](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/basic.html)
- [SVG-Tools](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/svg-tools.html)
- [Rect Clip](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/rectclip.html)
- [Offset](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/offset.html)
- [Minkowski](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/minkowski.html)
- [Rect Clip Lines](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/rectclip-lines.html)
- [Triangulation](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/triangulation.html)

## Download lib

ES6: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/es/>

UMD: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/umd/>

## Usage:

For ES6 see the examples here: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/es>

For UMD see the examples here: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/umd>

## Typescript example:

    import { Clipper2ZFactoryFunction, MainModule } from 'clipper2-wasm/dist/clipper2z';
    import * as _Clipper2ZFactory from 'clipper2-wasm/dist/umd/clipper2z';

    const Clipper2ZFactory: Clipper2ZFactoryFunction = _Clipper2ZFactory;

    Clipper2ZFactory({
        locateFile: () => {
            return 'path/to/your/clipper2z.wasm'
        },
    }).then((Clipper2Z: MainModule) => {
        console.log('Clipper2Z', Clipper2Z);
    })

## Benchmark vs Clipper1 WASM: (Apple M2 Pro)

Clipper1 WASM repository: <https://github.com/xaviergonz/js-angusj-clipper> ![image](https://img.jsdelivr.com/github.com/user-attachments/assets/59543ebe-e501-46f6-b1cc-c2f9f32d5b18)

See implementation: <https://github.com/ErikSom/Clipper2-WASM/tree/main/clipper2-wasm/examples/benchmark>

Made possible by: <https://github.com/AngusJohnson/Clipper2>

Huge thanks to [@Birch-san](https://www.github.com/Birch-san) with an outstanding wasm port example: <https://github.com/Birch-san/box2d-wasm/>

Statistics

- month
- quarter
- year
- 
- Q3 2026
- September 2026
- August 2026
- July 2026
- Q2 2026
- June 2026
- May 2026
- April 2026
- Q1 2026
- March 2026
- February 2026
- January 2026
- 
- 2025
- Q4 2025
- December 2025
- November 2025
- October 2025
- Q3 2025
- September 2025
- August 2025
- July 2025
- Q2 2025
- June 2025
- May 2025
- April 2025
- Q1 2025
- March 2025
- February 2025
- January 2025
- 
- 2024
- Q4 2024
- December 2024
- November 2024
- October 2024
- Q3 2024
- September 2024
- August 2024
- July 2024
- Q2 2024
- June 2024
- May 2024
- April 2024
- Q1 2024
- March 2024
- February 2024
- January 2024
- 
- 2023
- Q4 2023
- December 2023
- November 2023
- October 2023
- Q3 2023
- September 2023
- August 2023
- July 2023
- Q2 2023
- June 2023
- May 2023
- April 2023
- Q1 2023
- March 2023
- February 2023
- January 2023
- 
- 2022
- Q4 2022
- December 2022
- November 2022
- October 2022
- Q3 2022
- September 2022
- August 2022
- July 2022
- Q2 2022
- June 2022
- May 2022
- April 2022
- Q1 2022
- March 2022
- February 2022
- January 2022
- 
- 2021
- Q4 2021
- December 2021
- November 2021
- October 2021
- Q3 2021
- September 2021
- August 2021
- July 2021
- Q2 2021
- June 2021
- May 2021
- April 2021
- Q1 2021
- March 2021
- February 2021
- January 2021
- 
- 2020
- Q4 2020
- December 2020

Requests 17 221

Bandwidth 1 012 MB

Top version - 0.2.1 16 035 Full clipper2-wasm Download Stats The 24940th most popular on jsDelivr [![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/twitter-white.svg) Share](https://twitter.com/intent/tweet?text=clipper2-wasm%20is%20the%2024940th%20most%20popular%20package%20on%20%40jsDelivr%20CDN%2C%20with%2017%20221%20hits%20in%20the%20last%20month%3A%20https%3A%2F%2Fwww.jsdelivr.com%2Fpackage%2Fnpm%2Fclipper2-wasm) Keywords clipper polygon clipping offsetting wasm webassembly Get a badge for your package ![](https://data.jsdelivr.com/v1/package/npm/clipper2-wasm/badge) ![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/copy-btn-black.svg) ![](https://www.jsdelivr.com/assets/e281cc058fcdd33984b08139ee2372c92ae506c7/img/icons/alternate-btn.svg)

<!--
## Source links

- [/](./index.md) - source: /
- [About Us](./about.md) - source: /about
- [Network](./network.md) - source: /network
- [Stats](./statistics.md) - source: /statistics
- [Sponsors](./sponsors.md) - source: /sponsors
- [Purge cache](./tools-purge.md) - source: /tools/purge
- [GitHub](./github.md) - source: /github
- [Google Hosted Libraries](./google.md) - source: /google
- [unpkg](./unpkg.md) - source: /unpkg
- [Skypack](./skypack.md) - source: /skypack
- [esm.sh](./esmsh.md) - source: /esmsh
- [Blog](./blog.md) - source: /blog/
- [Newsletter](https://jsdelivr.us11.list-manage.com/subscribe?u=0c85fe2c9a60310df9a3d6751&id=283887f736)
- [esm.run](./esm.md) - source: /esm
- [Open Source CDN](./documentation.md) - source: /documentation
- [Public API](./docs-data.jsdelivr.com.md) - source: /docs/data.jsdelivr.com
- [Globalping](https://globalping.io)
- [GitHub](https://github.com/jsdelivr/jsdelivr)
- [Twitter](https://twitter.com/jsDelivr)
- [Discord](./discord.md) - source: /discord
- [ErikSom](./?query=author%3A%20ErikSom.md) - source: /?query=author%3A%20ErikSom
- [https://github.com/ErikSom/Clipper2-WASM/](https://github.com/ErikSom/Clipper2-WASM/)
- [https://www.npmjs.com/package/clipper2-wasm](https://www.npmjs.com/package/clipper2-wasm)
- [https://registry.npmjs.org/clipper2-wasm/-/clipper2-wasm-0.4.0.tgz](https://registry.npmjs.org/clipper2-wasm/-/clipper2-wasm-0.4.0.tgz)
- [https://cdn.jsdelivr.net/npm/clipper2-wasm@0.4.0/dist/umd/clipper2z.min.js](https://cdn.jsdelivr.net/npm/clipper2-wasm@0.4.0/dist/umd/clipper2z.min.js)
- [Learn more](./documentation.md#id-npm) - source: /documentation#id-npm
- [Readme](./package-npm-clipper2-wasm.md) - source: /package/npm/clipper2-wasm
- [Files](?tab=files)
- [Statistics](?tab=stats)
- [Browse CDN](https://cdn.jsdelivr.net/npm/clipper2-wasm/)
- [https://badge.fury.io/js/clipper2-wasm](https://badge.fury.io/js/clipper2-wasm)
- [Extensive HTML documentation](http://www.angusj.com/clipper2/Docs/Overview.htm)
- [Basic](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/basic.html)
- [SVG-Tools](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/svg-tools.html)
- [Rect Clip](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/rectclip.html)
- [Offset](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/offset.html)
- [Minkowski](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/minkowski.html)
- [Rect Clip Lines](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/rectclip-lines.html)
- [Triangulation](https://eriksom.github.io/Clipper2-WASM/clipper2-wasm/examples/es/triangulation.html)
- [https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/es/](https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/es/)
- [https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/umd/](https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/umd/)
- [https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/es](https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/es)
- [https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/umd](https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/umd)
- [https://github.com/xaviergonz/js-angusj-clipper](https://github.com/xaviergonz/js-angusj-clipper)
- [https://github.com/ErikSom/Clipper2-WASM/tree/main/clipper2-wasm/examples/benchmark](https://github.com/ErikSom/Clipper2-WASM/tree/main/clipper2-wasm/examples/benchmark)
- [https://github.com/AngusJohnson/Clipper2](https://github.com/AngusJohnson/Clipper2)
- [@Birch-san](https://www.github.com/Birch-san)
- [https://github.com/Birch-san/box2d-wasm/](https://github.com/Birch-san/box2d-wasm/)
- [Share](https://twitter.com/intent/tweet?text=clipper2-wasm%20is%20the%2024940th%20most%20popular%20package%20on%20%40jsDelivr%20CDN%2C%20with%2017%20221%20hits%20in%20the%20last%20month%3A%20https%3A%2F%2Fwww.jsdelivr.com%2Fpackage%2Fnpm%2Fclipper2-wasm)
- [jsDelivr team and contributors](./about.md#people) - source: /about#people
- [Dmitriy Akulov](https://dakulov.com/)
- [Our History](./history.md) - source: /history
- [Custom OSS CDN](./oss-cdn.md) - source: /oss-cdn
- [Status](https://status.jsdelivr.com/)
- [Terms & Policies](./terms.md) - source: /terms
- [d@jsdelivr.com](mailto:d@jsdelivr.com)
- [Making jsDelivr’s Origin More Reliable at Scale](https://www.jsdelivr.com/blog/making-jsdelivrs-origin-more-reliable-at-scale/)
- [Making More npm Packages Work with jsDelivr ESM mode](https://www.jsdelivr.com/blog/making-more-npm-packages-work-with-jsdelivr-esm/)
- [jsDelivr will continue to serve CocoaPods packages](https://www.jsdelivr.com/blog/jsdelivr-will-continue-to-serve-cocoapods-packages/)
- [News: Globalping grows and goes independent](https://www.jsdelivr.com/blog/news-globalping-grows-and-goes-independent/)
- [jsDelivr May outage postmortem](https://www.jsdelivr.com/blog/jsdelivr-may-outage-postmortem/)
-->
