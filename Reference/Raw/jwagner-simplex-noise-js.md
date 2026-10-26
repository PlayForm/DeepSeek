[Skip to content](#start-of-content) Sign in Appearance settings Sign in Sign up Appearance settings {{ message }}

 ![jwagner](https://avatars.githubusercontent.com/u/293536?s=60&v=4)**simplex-noise.js** Public

- Notifications You must be signed in to change notification settings
- Fork 128
- Star 1.9k You must be signed in to star a repository

## About

A fast simplex noise implementation in Javascript / Typescript.

demo gfx javascript nodejs noise-functions procedural procedural-art procedural-generation procedural-terrain procedural-textures simplex typescript [Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) Activity **1.9k** stars **27** watching **128** forks Report repository**5** Branches **9** TagsOpen more actions menu[![jwagner](https://avatars.githubusercontent.com/u/293536?v=4&size=40)](/jwagner)jwagnerprepare 4.0.3 release Jul 26, 2024 6bfff87 · Jul 26, 2024 143 Commits Open commit details143 Commits

| Name | Name | Last commit message | Last commit date |
|----|----|----|----|
| .devcontainer | .devcontainer | use tsx for module-compatibility tests | Jul 10, 2024 |
| .github/workflows | .github/workflows | remove node versions from the future | Jul 10, 2024 |
| doc | doc | Readme improvements | Jul 23, 2022 |
| examples | examples | Fixing plasma example | Jul 23, 2022 |
| perf | perf | Performance and test improvements | Jul 23, 2022 |
| snapshots | snapshots | Performance and test improvements | Jul 23, 2022 |
| test | test | use tsx for module-compatibility tests | Jul 10, 2024 |
| .editorconfig | .editorconfig | introduce jscs | Dec 30, 2016 |
| .eslintrc.js | .eslintrc.js | Makes module/packet structure more compatible | Aug 22, 2021 |
| .gitignore | .gitignore | Adding a setup to investigate the JIT output | Jul 23, 2022 |
| .mocharc.json | .mocharc.json | Converts simplex-noise.js to typescript | Aug 22, 2021 |
| LICENSE | LICENSE | Update LICENSE | Feb 10, 2018 |
| README.md | README.md | prepare 4.0.3 release | Jul 26, 2024 |
| build.sh | build.sh | Makes module/packet structure more compatible | Aug 22, 2021 |
| package-lock.json | package-lock.json | use tsx for module-compatibility tests | Jul 10, 2024 |
| package.json | package.json | prepare 4.0.3 release | Jul 26, 2024 |
| release-docs.sh | release-docs.sh | Draft of a new tree shakeable API | Jul 23, 2022 |
| simplex-noise.ts | simplex-noise.ts | prepare 4.0.3 release | Jul 26, 2024 |
| tsconfig-commonjs.json | tsconfig-commonjs.json | Draft of a new tree shakeable API | Jul 23, 2022 |
| tsconfig-esm.json | tsconfig-esm.json | Makes module/packet structure more compatible | Aug 22, 2021 |
| tsconfig.json | tsconfig.json | Makes module/packet structure more compatible | Aug 22, 2021 |
|  |  |  |  |

[![Tests](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml/badge.svg)](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml) [![TypeScript](https://camo.githubusercontent.com/a6ed1655e865a26dfcec492b68d0fa0ed6d8b7c1aaf3b974bfbe28f2b71e6232/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2533432532462533452d547970655363726970742d2532333030373463312e737667)](http://www.typescriptlang.org/)

[!simplex-noise.js header](/jwagner/simplex-noise.js/blob/main/doc/github-header-fs8.png) [API Documentation](https://29a.ch/simplex-noise/docs/modules.html)

simplex-noise.js is a simplex noise implementation in Javascript/TypeScript. It works in the browser and Node.js, using CommonJS and ES Modules. It is self-contained (dependency-free), relatively small (about 2k minified and gzipped) and fairly fast (about 20 nanoseconds for a sample of 2d noise) and tree shakeable.

## Demos & Real World Examples


- [Synthwave Demo](https://29a.ch/sandbox/2022/simplex-noise-synthwave/) shown in the header
- Simple 2D plasma on [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001)
- [3D voxel world generation](https://29a.ch/sandbox/2012/voxelworld/) example
- Film grain in [analog film emulator](https://29a.ch/film-emulator/)
- [Applying volumetric wood grain to 3D prints](https://29a.ch/sandbox/2021/3d-print-texturizer/)

Created something awesome with simplex-noise? Let me know so I can add it to the list.

## Installation


`npm i -S simplex-noise`

## Usage Examples


### ES Module Import


// import the noise functions you need\
import { createNoise2D } from 'simplex-noise';

### CommonJS Require


// import the noise functions you need\
const { createNoise2D } = require('simplex-noise');

### 2D


// initialize the noise function\
const noise2D = createNoise2D();\
// returns a value between -1 and 1\
console.log(noise2D(x, y));

### 3D


const noise3D = createNoise3D();\
console.log(noise3D(x, y, z));

### 4D


const noise4D = createNoise4D();\
console.log(noise4D(x, y, z, w));

### Using a seed value


By default simplex-noise.js will use Math.random() to seed the noise. You can pass in a PRNG function to use your own seed value.

\# install the alea prng\
npm install -S alea

import alea from 'alea';\
// create a new random function based on the seed\
const prng = alea('seed');\
// use the seeded random function to initialize the noise function\
const noise2D = createNoise2D(prng);\
console.log(noise2D(x, y));

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


// 3.x\
import SimplexNoise from 'simplex-noise';\
const simplex = new SimplexNoise();\
const value2d = simplex.noise2D(x, y);\
// 4.x\
// import the functions you need\
import { createNoise2D } from 'simplex-noise';\
const noise2D = createNoise2D();\
const value2d = noise2D(x, y);

### Initialization with a seed


// 3.x\
import SimplexNoise from 'simplex-noise';\
const simplex = new SimplexNoise('seed');\
const value2d = simplex.noise2D(x, y);\
// 4.x\
// npm install -S alea\
import { createNoise2D } from 'simplex-noise';\
import alea from 'alea';\
const noise2D = createNoise2D(alea('seed'));\
const value2d = noise2D(x, y);\
\
// IMPORTANT: If you use multiple noise functions (for example 2d and 3d)\
// and want compatible output with 3.x you will need to pass a fresh instance\
// of alea to each create call. If you reuse the alea instance you will\
// get different outputs compared to simplex-noise 3.x.\
const seed = 'seed';\
const noise2D = createNoise2D(alea(seed));\
const noise3D = createNoise3D(alea(seed));

### Emulating the 3.x and older API


const simplex = {\
  noise2D: createNoise2D(alea(seed)),\
  noise3D: createNoise3D(alea(seed)),\
  noise4D: createNoise4D(alea(seed)),\
};

## Changelog


### 4.0.3


- Additional tweaks to **PURE** annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).

### 4.0.2


- Tweaked **PURE** annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).

### 4.0.1


- Explicitly defined the return type of `createNoise4D` to be `NoiseFunction4D`. Contributed by [satelllte](https://github.com/satelllte).

### 4.0.0


⚠️ **This release changes the API and the output of the noise functions.** ⚠️

- Reworked the API so that the noise functions can be imported individually. When combined with tree shaking this helps with build sizes.
- Removed the built in version of the ALEA PRNG to focus the library to do only one thing. If you want to continue to use it you'll have to install and import it separately.
- Noise functions are a bit faster (~ 20 - 30%).
- Noise values can be different from previous versions
- Input coordinates bigger than 2^31 may not result in a noisy output anymore. If you have a use case that is affected by this change, please file an issue.
- Test coverage is now at 100%.
- A big thank you to @mreinstein, @redblobgames and everyone else involved for their comments and PRs which motivated me to create this new version.

### 3.0.1


- Include simplex-noise.ts as source file, fixes sourcemap warnings.

### 3.0.0


- Changed module structure. When using bundlers that import the es module even using require() the import might need to be updated.
- Dependency update
- Setting sideEffects: false in package.json
- Added snapshot tests
- Code converted to typescript, the package can of course still be used from regular JS
- Dropped bower
- Added support for es modules

### 2.4.0


- Included a PRNG based on ALEA to directly allow seeding
- Included typescript definitions

### 2.3.0


⚠️ **This release changes the output of the noise functions.** ⚠️

In the future such changes will be released as a new major version.

- Corrected generation of permutation table
- Moved tests to mocha/chai
- Cleanup

### 2.2.0


- Small performance improvement for 2D noise

### 2.1.1


- Increased entropy by fixing a little initialization issue.

### 2.1.0


- AMD support

### 2.0.0


- Changed node.js api, SimplexNoise is now exported directly.
- Added unit tests

### 1.0.0


- Initial Release

## License


Copyright (c) 2022 Jonas Wagner, licensed under the MIT License (enclosed)

## Credits


This is mostly a direct javascript port of the [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java) by Stefan Gustavson and Peter Eastman.

The initial typescript definition has been provided by [Neonit](https://github.com/Neonit).

## About

A fast simplex noise implementation in Javascript / Typescript.

demo gfx javascript nodejs noise-functions procedural procedural-art procedural-generation procedural-terrain procedural-textures simplex typescript [Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) Activity **1.9k** stars **27** watching **128** forks Report repository

## Releases 8 (8)

4.0.3 Latest Jul 26, 2024+ 7 releases

## Contributors 10 (10)

- [![@jwagner](https://avatars.githubusercontent.com/u/293536?s=64&v=4)](/jwagner)
- [![@satelllte](https://avatars.githubusercontent.com/u/20585619?s=64&v=4)](/satelllte)
- [![@dependabot\[bot\]](https://avatars.githubusercontent.com/in/29110?s=64&v=4)](/dependabot%5Bbot%5D)
- [![@espadrine](https://avatars.githubusercontent.com/u/100689?s=64&v=4)](/espadrine)
- [![@dmnsgn](https://avatars.githubusercontent.com/u/1636460?s=64&v=4)](/dmnsgn)
- [![@viljami](https://avatars.githubusercontent.com/u/2721718?s=64&v=4)](/viljami)
- [![@tophattom](https://avatars.githubusercontent.com/u/654307?s=64&v=4)](/tophattom)
- [![@Sietsem](https://avatars.githubusercontent.com/u/1254264?s=64&v=4)](/Sietsem)
- [![@Neonit](https://avatars.githubusercontent.com/u/1565916?s=64&v=4)](/Neonit)
- [![@deathcap](https://avatars.githubusercontent.com/u/5897956?s=64&v=4)](/deathcap)

## Languages

- TypeScript 84.2%
- JavaScript 8.8%
- Shell 4.2%
- Dockerfile 2.3%
- HTML 0.5%

You can’t perform that action at this time.

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fjwagner%2Fsimplex-noise.js`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=jwagner%2Fsimplex-noise.js`
- jwagner - source: `/jwagner`
- simplex-noise.js - source: `/jwagner/simplex-noise.js`
- Issues 5 - source: `/jwagner/simplex-noise.js/issues`
- Pull requests 2 - source: `/jwagner/simplex-noise.js/pulls`
- Discussions - source: `/jwagner/simplex-noise.js/discussions`
- Actions - source: `/jwagner/simplex-noise.js/actions`
- Projects - source: `/jwagner/simplex-noise.js/projects`
- Wiki - source: `/jwagner/simplex-noise.js/wiki`
- Security and quality - source: `/jwagner/simplex-noise.js/security`
- Insights - source: `/jwagner/simplex-noise.js/pulse`
- Notifications - source: `/login?return_to=%2Fjwagner%2Fsimplex-noise.js`
- demo - source: `/topics/demo`
- gfx - source: `/topics/gfx`
- javascript - source: `/topics/javascript`
- nodejs - source: `/topics/nodejs`
- noise-functions - source: `/topics/noise-functions`
- procedural - source: `/topics/procedural`
- procedural-art - source: `/topics/procedural-art`
- procedural-generation - source: `/topics/procedural-generation`
- procedural-terrain - source: `/topics/procedural-terrain`
- procedural-textures - source: `/topics/procedural-textures`
- simplex - source: `/topics/simplex`
- typescript - source: `/topics/typescript`
- Activity - source: `/jwagner/simplex-noise.js/activity`
- 128 forks - source: `/jwagner/simplex-noise.js/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fjwagner%2Fsimplex-noise.js&report=jwagner+%28user%29`
- 5 Branches - source: `/jwagner/simplex-noise.js/branches`
- 9 Tags - source: `/jwagner/simplex-noise.js/tags`
- jwagner - source: `/jwagner/simplex-noise.js/commits?author=jwagner`
- prepare 4.0.3 release - source: `/jwagner/simplex-noise.js/commit/6bfff874f5f0efed6375a9bf27fbd39b3cec6b4e`
- 143 Commits - source: `/jwagner/simplex-noise.js/commits/main/`
- .devcontainer - source: `/jwagner/simplex-noise.js/tree/main/.devcontainer`
- use tsx for module-compatibility tests - source: `/jwagner/simplex-noise.js/commit/d278637cd9186ce0034e15250e9b82c65aca4f9e`
- .github/ workflows - source: `/jwagner/simplex-noise.js/tree/main/.github/workflows`
- remove node versions from the future - source: `/jwagner/simplex-noise.js/commit/1c4821361de7b4799e9a03d5c1d93384b0ac049e`
- doc - source: `/jwagner/simplex-noise.js/tree/main/doc`
- Readme improvements - source: `/jwagner/simplex-noise.js/commit/4d3af659fb20ff359ec6cd147b0206ea0d078d66`
- examples - source: `/jwagner/simplex-noise.js/tree/main/examples`
- Fixing plasma example - source: `/jwagner/simplex-noise.js/commit/bd64f2223801bbcffec0151671e9af7b3cea2345`
- perf - source: `/jwagner/simplex-noise.js/tree/main/perf`
- Performance and test improvements - source: `/jwagner/simplex-noise.js/commit/66087595756d57211d18c6f5a229bff1ebdc3178`
- snapshots - source: `/jwagner/simplex-noise.js/tree/main/snapshots`
- test - source: `/jwagner/simplex-noise.js/tree/main/test`
- .editorconfig - source: `/jwagner/simplex-noise.js/blob/main/.editorconfig`
- introduce jscs - source: `/jwagner/simplex-noise.js/commit/dbe8c4bcf7b6fce5227f72a1da05de844248f2ee`
- .eslintrc.js - source: `/jwagner/simplex-noise.js/blob/main/.eslintrc.js`
- Makes module/packet structure more compatible - source: `/jwagner/simplex-noise.js/commit/0d7e90df9f0e20aaa4673b9c0c818d61181ded16`
- .gitignore - source: `/jwagner/simplex-noise.js/blob/main/.gitignore`
- Adding a setup to investigate the JIT output - source: `/jwagner/simplex-noise.js/commit/8d3d2844337355c8ba564c3c79d17e47ffea9a1b`
- .mocharc.json - source: `/jwagner/simplex-noise.js/blob/main/.mocharc.json`
- Converts simplex-noise.js to typescript - source: `/jwagner/simplex-noise.js/commit/1f4a4748d00af40f1ca82d6710af45e92e038216`
- LICENSE - source: `/jwagner/simplex-noise.js/blob/main/LICENSE`
- Update LICENSE - source: `/jwagner/simplex-noise.js/commit/3f1ad19a5b3972c4a6add7c35a7360110d9d12ef`
- README.md - source: `/jwagner/simplex-noise.js/blob/main/README.md`
- build.sh - source: `/jwagner/simplex-noise.js/blob/main/build.sh`
- package-lock.json - source: `/jwagner/simplex-noise.js/blob/main/package-lock.json`
- package.json - source: `/jwagner/simplex-noise.js/blob/main/package.json`
- release-docs.sh - source: `/jwagner/simplex-noise.js/blob/main/release-docs.sh`
- Draft of a new tree shakeable API - source: `/jwagner/simplex-noise.js/commit/fe89dba7b2e5ff70ceea3d17221ae2592c5cbafd`
- simplex-noise.ts - source: `/jwagner/simplex-noise.js/blob/main/simplex-noise.ts`
- tsconfig-commonjs.json - source: `/jwagner/simplex-noise.js/blob/main/tsconfig-commonjs.json`
- tsconfig-esm.json - source: `/jwagner/simplex-noise.js/blob/main/tsconfig-esm.json`
- tsconfig.json - source: `/jwagner/simplex-noise.js/blob/main/tsconfig.json`
- [https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml)
- [http://www.typescriptlang.org/](http://www.typescriptlang.org/)
- /jwagner/simplex-noise.js/blob/main/doc/github-header-fs8.png - source: `/jwagner/simplex-noise.js/blob/main/doc/github-header-fs8.png`
- [API Documentation](https://29a.ch/simplex-noise/docs/modules.html)
- [Synthwave Demo](https://29a.ch/sandbox/2022/simplex-noise-synthwave/)
- [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001)
- [3D voxel world generation](https://29a.ch/sandbox/2012/voxelworld/)
- [analog film emulator](https://29a.ch/film-emulator/)
- [Applying volumetric wood grain to 3D prints](https://29a.ch/sandbox/2021/3d-print-texturizer/)
- [alea](https://npmjs.org/package/alea)
- [Damien Seguin](https://github.com/dmnsgn)
- [satelllte](https://github.com/satelllte)
- [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java)
- [Neonit](https://github.com/Neonit)
- Releases - source: `/jwagner/simplex-noise.js/releases`
- 4.0.3 Latest Jul 26, 2024 - source: `/jwagner/simplex-noise.js/releases/tag/4.0.3`
- Contributors - source: `/jwagner/simplex-noise.js/graphs/contributors`
- /satelllte - source: `/satelllte`
- /dependabot[bot] - source: `/dependabot[bot]`
- /espadrine - source: `/espadrine`
- /dmnsgn - source: `/dmnsgn`
- /viljami - source: `/viljami`
- /tophattom - source: `/tophattom`
- /Sietsem - source: `/Sietsem`
- /Neonit - source: `/Neonit`
- /deathcap - source: `/deathcap`
- TypeScript 84.2% - source: `/jwagner/simplex-noise.js/search?l=typescript`
- JavaScript 8.8% - source: `/jwagner/simplex-noise.js/search?l=javascript`
- Shell 4.2% - source: `/jwagner/simplex-noise.js/search?l=shell`
- Dockerfile 2.3% - source: `/jwagner/simplex-noise.js/search?l=dockerfile`
- HTML 0.5% - source: `/jwagner/simplex-noise.js/search?l=html`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
