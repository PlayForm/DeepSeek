# clipper2-wasm

[ ErikSom](https://www.jsdelivr.com/?query=author%3A%20ErikSom) WebAssembly port of the Clipper2
library for polygon clipping and offsetting Version 0.4.0 License BSL-1.0 Keywords
clipperpolygonclippingoffsettingwasmwebassembly INSTALL Type: Version:

- Latest Patch
- Latest Minor
- Latest Major

<script src=" <https://cdn.jsdelivr.net/npm/clipper2-wasm@0.4.0/dist/umd/clipper2z.min.js> "></script>

[ Readme](https://www.jsdelivr.com/package/npm/clipper2-wasm)
[ Files](https://www.jsdelivr.com/package/npm/clipper2-wasm?tab=files)
[ Statistics](https://www.jsdelivr.com/package/npm/clipper2-wasm?tab=stats)
[Browse CDN ](https://cdn.jsdelivr.net/npm/clipper2-wasm/)

# Clipper2 WASM

The **Clipper2** library performs **intersection** , **union** , **difference** and **XOR** boolean
operations on both simple and complex polygons. It also performs polygon offsetting and constrained
Delaunay triangulation.

## Documentation:

For Clipper2 documentation please see the
[Extensive HTML documentation](http://www.angusj.com/clipper2/Docs/Overview.htm)

## Live examples:

## Download lib

ES6: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/es/> UMD:
<https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/dist/umd/>

## Usage:

For ES6 see the examples here:
<https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/es> For UMD see the
examples here: <https://github.com/ErikSom/Clipper2-WASM/tree/main/CPP/clipper2-wasm/examples/umd>

## Typescript example:

```
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

```

## Benchmark vs Clipper1 WASM: (Apple M2 Pro)

Clipper1 WASM repository: <https://github.com/xaviergonz/js-angusj-clipper> See implementation:
<https://github.com/ErikSom/Clipper2-WASM/tree/main/clipper2-wasm/examples/benchmark> Made possible
by: <https://github.com/AngusJohnson/Clipper2> Huge thanks to
[@Birch-san](https://www.github.com/Birch-san) with an outstanding wasm port example:
<https://github.com/Birch-san/box2d-wasm/> Statistics

- quarter
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
- Q4 2020
- December 2020

Requests 20 337 Bandwidth 1 200 MB Top version - 0.2.1 21 760 Full clipper2-wasm Download Stats The
24686th most popular on jsDelivr
[ Share](https://twitter.com/intent/tweet?text=clipper2-wasm%20is%20the%2024686th%20most%20popular%20package%20on%20%40jsDelivr%20CDN%2C%20with%2020%20337%20hits%20in%20the%20last%20month%3A%20https%3A%2F%2Fwww.jsdelivr.com%2Fpackage%2Fnpm%2Fclipper2-wasm)
Keywords clipper polygon clipping offsetting wasm webassembly Get a badge for your package
