[**5** Branches](https://github.com/jwagner/simplex-noise.js/branches)[](https://github.com/jwagner/simplex-noise.js/tags)
Go to file
Open more actions menu
Jul 26, 2024
[6bfff87](https://github.com/jwagner/simplex-noise.js/commit/6bfff874f5f0efed6375a9bf27fbd39b3cec6b4e) · Jul 26, 2024
[143 Commits](https://github.com/jwagner/simplex-noise.js/commits/main/)
Open commit details
143 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   | [use tsx for module-compatibility tests](https://github.com/jwagner/simplex-noise.js/commit/d278637cd9186ce0034e15250e9b82c65aca4f9e "use tsx for module-compatibility tests")  | Jul 10, 2024  |  
| [.github/workflows](https://github.com/jwagner/simplex-noise.js/tree/main/.github/workflows "This path skips through empty directories")  | [.github/workflows](https://github.com/jwagner/simplex-noise.js/tree/main/.github/workflows "This path skips through empty directories")  | [remove node versions from the future](https://github.com/jwagner/simplex-noise.js/commit/1c4821361de7b4799e9a03d5c1d93384b0ac049e "remove node versions from the future")  | Jul 10, 2024  |  
|   | Jul 23, 2022  |  
|   |   |   | Jul 23, 2022  |  
| [Performance and test improvements](https://github.com/jwagner/simplex-noise.js/commit/66087595756d57211d18c6f5a229bff1ebdc3178 "Performance and test improvements")  | Jul 23, 2022  |  
|   |   | [Performance and test improvements](https://github.com/jwagner/simplex-noise.js/commit/66087595756d57211d18c6f5a229bff1ebdc3178 "Performance and test improvements")  | Jul 23, 2022  |  
| [use tsx for module-compatibility tests](https://github.com/jwagner/simplex-noise.js/commit/d278637cd9186ce0034e15250e9b82c65aca4f9e "use tsx for module-compatibility tests")  | Jul 10, 2024  |  
|   |   |   | Dec 30, 2016  |  
|   |   | [Makes module/packet structure more compatible](https://github.com/jwagner/simplex-noise.js/commit/0d7e90df9f0e20aaa4673b9c0c818d61181ded16 "Makes module/packet structure more compatible")  | Aug 22, 2021  |  
|   |   | [Adding a setup to investigate the JIT output](https://github.com/jwagner/simplex-noise.js/commit/8d3d2844337355c8ba564c3c79d17e47ffea9a1b "Adding a setup to investigate the JIT output")  | Jul 23, 2022  |  
|   |   | [Converts simplex-noise.js to typescript](https://github.com/jwagner/simplex-noise.js/commit/1f4a4748d00af40f1ca82d6710af45e92e038216 "Converts simplex-noise.js to typescript")  | Aug 22, 2021  |  
|   |   |   | Feb 10, 2018  |  
|   |   |   | Jul 26, 2024  |  
|   |   | [Makes module/packet structure more compatible](https://github.com/jwagner/simplex-noise.js/commit/0d7e90df9f0e20aaa4673b9c0c818d61181ded16 "Makes module/packet structure more compatible")  | Aug 22, 2021  |  
|   |   | [use tsx for module-compatibility tests](https://github.com/jwagner/simplex-noise.js/commit/d278637cd9186ce0034e15250e9b82c65aca4f9e "use tsx for module-compatibility tests")  | Jul 10, 2024  |  
|   |   |   | Jul 26, 2024  |  
|   |   | [Draft of a new tree shakeable API](https://github.com/jwagner/simplex-noise.js/commit/fe89dba7b2e5ff70ceea3d17221ae2592c5cbafd "Draft of a new tree shakeable API")  | Jul 23, 2022  |  
|   |   |   | Jul 26, 2024  |  
|   |   | [Draft of a new tree shakeable API](https://github.com/jwagner/simplex-noise.js/commit/fe89dba7b2e5ff70ceea3d17221ae2592c5cbafd "Draft of a new tree shakeable API")  | Jul 23, 2022  |  
|   |   | [Makes module/packet structure more compatible](https://github.com/jwagner/simplex-noise.js/commit/0d7e90df9f0e20aaa4673b9c0c818d61181ded16 "Makes module/packet structure more compatible")  | Aug 22, 2021  |  
|   |   | [Makes module/packet structure more compatible](https://github.com/jwagner/simplex-noise.js/commit/0d7e90df9f0e20aaa4673b9c0c818d61181ded16 "Makes module/packet structure more compatible")  | Aug 22, 2021  |  
| View all files |  
[API Documentation](https://29a.ch/simplex-noise/docs/modules.html)
simplex-noise.js is a simplex noise implementation in Javascript/TypeScript. It works in the browser and Node.js, using CommonJS and ES Modules. It is self-contained (dependency-free), relatively small (about 2k minified and gzipped) and fairly fast (about 20 nanoseconds for a sample of 2d noise) and tree shakeable.
## Demos & Real World Examples
  * [Synthwave Demo](https://29a.ch/sandbox/2022/simplex-noise-synthwave/) shown in the header
  * Simple 2D plasma on [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001)
  * [3D voxel world generation](https://29a.ch/sandbox/2012/voxelworld/) example
  * Film grain in [analog film emulator](https://29a.ch/film-emulator/)
  * [Applying volumetric wood grain to 3D prints](https://29a.ch/sandbox/2021/3d-print-texturizer/)


Created something awesome with simplex-noise? Let me know so I can add it to the list.
## Installation
`npm i -S simplex-noise`
## Usage Examples
### ES Module Import

```
// import the noise functions you need
import { createNoise2D } from 'simplex-noise';
```

### CommonJS Require

```
// import the noise functions you need
const { createNoise2D } = require('simplex-noise');
```


```
// initialize the noise function
const noise2D = createNoise2D();
// returns a value between -1 and 1
console.log(noise2D(x, y));
```


```
const noise3D = createNoise3D();
console.log(noise3D(x, y, z));
```


```
const noise4D = createNoise4D();
console.log(noise4D(x, y, z, w));
```

### Using a seed value
By default simplex-noise.js will use Math.random() to seed the noise. You can pass in a PRNG function to use your own seed value.

```
# install the alea prng
npm install -S alea
```


```
import alea from 'alea';
// create a new random function based on the seed
const prng = alea('seed');
// use the seeded random function to initialize the noise function
const noise2D = createNoise2D(prng);
console.log(noise2D(x, y));
```

The ALEA PRNG used in the example above can be found in the [alea](https://npmjs.org/package/alea) npm package.
## Benchmarks
simplex-noise.js is reasonably quick. According to `perf/index.js` I can perform about 70 million `noise2D()` calls/second on a single thread on my desktop (Ryzen 5950X).

```
$ node perf/index.js
noise2D: 72,916,215 ops/sec ±1%
noise3D: 47,855,199 ops/sec ±0%
noise4D: 35,564,111 ops/sec ±0%

```

## Migrating from 3.x to 4.x
### random initialization

```
// 3.x
import SimplexNoise from 'simplex-noise';
const simplex = new SimplexNoise();
const value2d = simplex.noise2D(x, y);
// 4.x
// import the functions you need
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();
const value2d = noise2D(x, y);
```

### Initialization with a seed

```
// 3.x
import SimplexNoise from 'simplex-noise';
const simplex = new SimplexNoise('seed');
const value2d = simplex.noise2D(x, y);
// 4.x
// npm install -S alea
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
const noise2D = createNoise2D(alea('seed'));
const value2d = noise2D(x, y);

// IMPORTANT: If you use multiple noise functions (for example 2d and 3d)
// and want compatible output with 3.x you will need to pass a fresh instance
// of alea to each create call. If you reuse the alea instance you will
// get different outputs compared to simplex-noise 3.x.
const seed = 'seed';
const noise2D = createNoise2D(alea(seed));
const noise3D = createNoise3D(alea(seed));
```

### Emulating the 3.x and older API

```
const simplex = {
  noise2D: createNoise2D(alea(seed)),
  noise3D: createNoise3D(alea(seed)),
  noise4D: createNoise4D(alea(seed)),
};
```

## Changelog
### 4.0.3
  * Additional tweaks to **PURE** annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).


### 4.0.2
  * Tweaked **PURE** annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).


### 4.0.1
  * Explicitly defined the return type of `createNoise4D` to be `NoiseFunction4D`. Contributed by [satelllte](https://github.com/satelllte).


### 4.0.0
⚠️ **This release changes the API and the output of the noise functions.** ⚠️
  * Reworked the API so that the noise functions can be imported individually. When combined with tree shaking this helps with build sizes.
  * Removed the built in version of the ALEA PRNG to focus the library to do only one thing. If you want to continue to use it you'll have to install and import it separately.
  * Noise functions are a bit faster (~ 20 - 30%).
  * Noise values can be different from previous versions
  * Input coordinates bigger than 2^31 may not result in a noisy output anymore. If you have a use case that is affected by this change, please file an issue.
  * Test coverage is now at 100%.
  * A big thank you to @mreinstein, @redblobgames and everyone else involved for their comments and PRs which motivated me to create this new version.


### 3.0.1
  * Include simplex-noise.ts as source file, fixes sourcemap warnings.


### 3.0.0
  * Changed module structure. When using bundlers that import the es module even using require() the import might need to be updated.
  * Dependency update
  * Setting sideEffects: false in package.json
  * Added snapshot tests
  * Code converted to typescript, the package can of course still be used from regular JS
  * Dropped bower
  * Added support for es modules


### 2.4.0
  * Included a PRNG based on ALEA to directly allow seeding
  * Included typescript definitions


### 2.3.0
⚠️ **This release changes the output of the noise functions.** ⚠️
In the future such changes will be released as a new major version.
  * Corrected generation of permutation table
  * Moved tests to mocha/chai
  * Cleanup


### 2.2.0
  * Small performance improvement for 2D noise


### 2.1.1
  * Increased entropy by fixing a little initialization issue.


### 2.1.0
  * AMD support


### 2.0.0
  * Changed node.js api, SimplexNoise is now exported directly.
  * Added unit tests


### 1.0.0
  * Initial Release


## License
Copyright (c) 2022 Jonas Wagner, licensed under the MIT License (enclosed)
## Credits
This is mostly a direct javascript port of the [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java) by Stefan Gustavson and Peter Eastman.
The initial typescript definition has been provided by [Neonit](https://github.com/Neonit).
## About
A fast simplex noise implementation in Javascript / Typescript.
[demo](https://github.com/topics/demo)[gfx](https://github.com/topics/gfx)[javascript](https://github.com/topics/javascript)[nodejs](https://github.com/topics/nodejs)[noise-functions](https://github.com/topics/noise-functions)[procedural](https://github.com/topics/procedural)[procedural-art](https://github.com/topics/procedural-art)[procedural-generation](https://github.com/topics/procedural-generation)[procedural-terrain](https://github.com/topics/procedural-terrain)[procedural-textures](https://github.com/topics/procedural-textures)[simplex](https://github.com/topics/simplex)[typescript](https://github.com/topics/typescript)
**1.9k** stars
**27** watching
[ forks](https://github.com/jwagner/simplex-noise.js/forks)
## 
[ 4.0.3Latest Jul 26, 2024 ](https://github.com/jwagner/simplex-noise.js/releases/tag/4.0.3)
## 
## Languages
  * [TypeScript84.2%](https://github.com/jwagner/simplex-noise.js/search?l=typescript)
  * [JavaScript8.8%](https://github.com/jwagner/simplex-noise.js/search?l=javascript)
  * [Shell4.2%](https://github.com/jwagner/simplex-noise.js/search?l=shell)
  * [Dockerfile2.3%](https://github.com/jwagner/simplex-noise.js/search?l=dockerfile)
  * [HTML0.5%](https://github.com/jwagner/simplex-noise.js/search?l=html)


You can’t perform that action at this time. 
