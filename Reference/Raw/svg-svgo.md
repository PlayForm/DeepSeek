[Skip to content](#start-of-content) Sign in Appearance settings Sign in Sign up Appearance settings {{ message }} [](./svg-svgo.md) ![svg](https://avatars.githubusercontent.com/u/2473585?s=60&v=4)**[svgo](./svg-svgo.md)** Public

- 
- Notifications You must be signed in to change notification settings
- Fork 1.5k
- Star 22.8k You must be signed in to star a repository

## About

SVG Optimizer for Node.js and CLI. ⚙️

[svgo.dev/](https://svgo.dev/)cli hacktoberfest javascript minification nodejs optimization svg svgo [Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) [Contributing](#contributing-ov-file) [Security policy](#security-ov-file) Activity Custom properties **22.8k** stars **235** watching **1.5k** forks Report repository **6** Branches **113** TagsOpen more actions menuKTibow and claudechore(regression): make screenshots deterministic and stop ignoring f…Open commit details success Oct 24, 2026 96e756b · Oct 24, 2026 1,649 Commits Open commit details1,649 Commits

| Name | Name | Last commit message | Last commit date |
|----|----|----|----|
| .github | .github | chore: secure actions ([\#2278](https://github.com/svg/svgo/pull/2278)) | Aug 24, 2026 |
| bin | bin | chore: convert project to us ECMAScript modules (preserving CJS compa… | Jan 3, 2024 |
| docs | docs | fix(removeScripts): sanitize foreignObject content ([\#2264](https://github.com/svg/svgo/pull/2264)) | Aug 22, 2026 |
| lib | lib | perf: cache parsed inline style declarations ([\#2281](https://github.com/svg/svgo/pull/2281)) | Aug 25, 2026 |
| logo | logo | Remove the executable flag from files. ([\#1439](https://github.com/svg/svgo/pull/1439)) | Mar 20, 2021 |
| patches | patches | feat: upgrade sax to 1.6.1 ([\#2257](https://github.com/svg/svgo/pull/2257)) | Aug 15, 2026 |
| plugins | plugins | perf: compile removeAttrs patterns once per run ([\#2284](https://github.com/svg/svgo/pull/2284)) | Aug 25, 2026 |
| scripts | scripts | chore: revamp how we export types ([\#2118](https://github.com/svg/svgo/pull/2118)) | May 4, 2025 |
| test | test | chore(regression): make screenshots deterministic and stop ignoring f… | Oct 24, 2026 |
| .gitattributes | .gitattributes | chore: migrate package management to pnpm ([\#2243](https://github.com/svg/svgo/pull/2243)) | Aug 10, 2026 |
| .gitignore | .gitignore | chore: cache regression screenshots ([\#2267](https://github.com/svg/svgo/pull/2267)) | Aug 23, 2026 |
| .prettierignore | .prettierignore | chore: migrate package management to pnpm ([\#2243](https://github.com/svg/svgo/pull/2243)) | Aug 10, 2026 |
| .prettierrc | .prettierrc | chore: update prettier and eslint ([\#1885](https://github.com/svg/svgo/pull/1885)) | Dec 15, 2023 |
| CONTRIBUTING.md | CONTRIBUTING.md | chore: cache regression screenshots ([\#2267](https://github.com/svg/svgo/pull/2267)) | Aug 23, 2026 |
| LICENSE | LICENSE | Cleanup LICENSE ([\#1157](https://github.com/svg/svgo/pull/1157)) | Feb 13, 2021 |
| README.md | README.md | docs: add sponsor message to readme ([\#2285](https://github.com/svg/svgo/pull/2285)) | Aug 27, 2026 |
| cspell.jsonc | cspell.jsonc | chore(regression): make screenshots deterministic and stop ignoring f… | Oct 24, 2026 |
| eslint.config.mjs | eslint.config.mjs | test: migrate from Jest to Vitest ([\#2252](https://github.com/svg/svgo/pull/2252)) | Aug 13, 2026 |
| package.json | package.json | chore: prepare v4.1.0 release ([\#2275](https://github.com/svg/svgo/pull/2275)) | Aug 24, 2026 |
| pnpm-lock.yaml | pnpm-lock.yaml | chore: optimize fixtures in a bounded worker pool ([\#2265](https://github.com/svg/svgo/pull/2265)) | Aug 22, 2026 |
| pnpm-workspace.yaml | pnpm-workspace.yaml | feat: upgrade sax to 1.6.1 ([\#2257](https://github.com/svg/svgo/pull/2257)) | Aug 15, 2026 |
| rollup.config.js | rollup.config.js | docs: write v2 to v3 migration guide ([\#2177](https://github.com/svg/svgo/pull/2177)) | Oct 11, 2025 |
| tsconfig.build.json | tsconfig.build.json | chore: revamp how we export types ([\#2118](https://github.com/svg/svgo/pull/2118)) | May 4, 2025 |
| tsconfig.json | tsconfig.json | test(typescript): drop tsd for vitest type testing API | Aug 16, 2026 |
| vitest.config.js | vitest.config.js | test(typescript): drop tsd for vitest type testing API | Aug 16, 2026 |
|  |  |  |  |

[!](/svg/svgo/blob/main/logo/logo-web.svg)

# SVGO [![npm](https://camo.githubusercontent.com/eb8988f721887a88d75c97e6530c5384171ed8cf88467601ffd9dfb5bbbc30af/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f7376676f)](https://npmjs.org/package/svgo) [![chat](https://camo.githubusercontent.com/4dd535ad4d808f2586390a041d395362a08508fc0e9e596df2854ea08a49f708/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f383135313636373231333135383331383638)](https://discord.gg/z8jX8NYxrE) [![docs](https://camo.githubusercontent.com/760fd346fa4f8161b715a1b480d92a9c7965a5f7d00e452d20beda0a0a2e5083/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f646f63732d7376676f2e6465762d626c7565)](https://svgo.dev/)


SVGO, short for SVG Optimizer, is a Node.js library and command-line application for optimizing SVG files.

> 💖 [Sponsor SVGO on Open Collective](https://opencollective.com/svgo) to support continued improvements in stability and performance.

## Why?


SVG files, especially those exported from vector editors, usually contain a lot of redundant information. This includes editor metadata, comments, hidden elements, default or suboptimal values, and other stuff that can be safely removed or converted without impacting rendering.

## Installation


You can install SVGO globally through npm, yarn, or pnpm. Alternatively, drop the global flag (`global`/`-g`) to use it in your Node.js project.

\# npm\
npm install -g svgo\
\
\# yarn\
yarn global add svgo\
\
\# pnpm\
pnpm add -g svgo

## Command-line usage


Process single files:

svgo one.svg two.svg -o one.min.svg two.min.svg

Process a directory of files recursively with `-r`/`--recursive` and `-f`/`--folder`:

svgo -rf path/to/directory_with_svgs -o path/to/output_directory

Help for advanced usage:

svgo --help

## Configuration


SVGO has a plugin architecture. You can read more about all plugins in [Plugins \| SVGO Documentation](https://svgo.dev/docs/plugins/), and the default plugins in [Preset Default \| SVGO Documentation](https://svgo.dev/docs/preset-default/).

SVGO reads the configuration from `svgo.config.mjs` or the `--config path/to/config.mjs` command-line option. Some other parameters can be configured though command-line options too.

**`svgo.config.mjs`**

export default {\
  multipass: false, // boolean\
  datauri: 'base64', // 'base64'\|'enc'\|'unenc'\
  js2svg: {\
    indent: 4, // number\
    pretty: false, // boolean\
  },\
  plugins: \[\
    'preset-default', // built-in plugins enabled by default\
    'prefixIds', // enable built-in plugins by name\
\
    // enable built-in plugins with an object to configure plugins\
    {\
      name: 'prefixIds',\
      params: {\
        prefix: 'uwu',\
      },\
    },\
  \],\
};

### Default preset


Instead of configuring SVGO from scratch, you can tweak the default preset to suit your needs by configuring or disabling the respective plugin.

**`svgo.config.mjs`**

export default {\
  plugins: \[\
    {\
      name: 'preset-default',\
      params: {\
        overrides: {\
          // disable a default plugin\
          cleanupIds: false,\
\
          // customize the params of a default plugin\
          inlineStyles: {\
            onlyMatchedOnce: false,\
          },\
        },\
      },\
    },\
  \],\
};

You can find a list of the default plugins in the order they run in [Preset Default \| SVGO Documentation](https://svgo.dev/docs/preset-default/#plugins-list).

### Custom plugins


You can also specify custom plugins:

**`svgo.config.mjs`**

import importedPlugin from './imported-plugin';\
\
export default {\
  plugins: \[\
    // plugin imported from another JavaScript file\
    importedPlugin,\
\
    // plugin defined inline\
    {\
      name: 'customPlugin',\
      params: {\
        paramName: 'paramValue',\
      },\
      fn: (ast, params, info) =\> {},\
    },\
  \],\
};

## API usage


SVGO provides a few low level utilities.

### optimize


The core of SVGO is `optimize` function.

import { optimize } from 'svgo';\
\
const result = optimize(svgString, {\
  path: 'path-to.svg', // recommended\
  multipass: true, // all other config fields are available here\
});\
\
const optimizedSvgString = result.data;

### loadConfig


If you write a tool on top of SVGO you may want to resolve the `svgo.config.mjs` file.

import { loadConfig } from 'svgo';\
\
const config = await loadConfig();

You can also specify a path and customize the current working directory.

const config = await loadConfig(configFile, cwd);

## License and Copyright


This software is released under the terms of the [MIT license](https://github.com/svg/svgo/blob/main/LICENSE).

Logo by [André Castillo](https://github.com/DerianAndre).

## About

SVG Optimizer for Node.js and CLI. ⚙️

[svgo.dev/](https://svgo.dev/)cli hacktoberfest javascript minification nodejs optimization svg svgo [Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) [Contributing](#contributing-ov-file) [Security policy](#security-ov-file) Activity Custom properties **22.8k** stars **235** watching **1.5k** forks Report repository

## Releases 77

v4.1.0 Latest Aug 24, 2026+ 76 releases

## Sponsor this project

- ![](https://github.githubassets.com/assets/open_collective-0a706523753d.svg)[opencollective.com/svgo](https://opencollective.com/svgo)

## Used by 17M

[ ![@BenjaminJAnderson](https://avatars.githubusercontent.com/u/45207455?s=64&v=4)![@tarekazz1](https://avatars.githubusercontent.com/u/184146862?s=64&v=4)![@BhodiSea](https://avatars.githubusercontent.com/u/216463319?s=64&v=4)![@ali-security](https://avatars.githubusercontent.com/u/121376304?s=64&v=4)![@psy-repos-javascript](https://avatars.githubusercontent.com/u/93031662?s=64&v=4)+ 17,053,331](/svg/svgo/network/dependents)

## Contributors 208

- [![@GreLI](https://avatars.githubusercontent.com/u/1467392?s=64&v=4)](/GreLI)
- [![@TrySound](https://avatars.githubusercontent.com/u/5635476?s=64&v=4)](/TrySound)
- [![@SethFalco](https://avatars.githubusercontent.com/u/22801583?s=64&v=4)](/SethFalco)
- [![@XhmikosR](https://avatars.githubusercontent.com/u/349621?s=64&v=4)](/XhmikosR)
- [![@strarsis](https://avatars.githubusercontent.com/u/9271436?s=64&v=4)](/strarsis)
- [![@KTibow](https://avatars.githubusercontent.com/u/10727862?s=64&v=4)](/KTibow)
- [![@caub](https://avatars.githubusercontent.com/u/3134574?s=64&v=4)](/caub)
- [![@johnkenny54](https://avatars.githubusercontent.com/u/45182853?s=64&v=4)](/johnkenny54)
- [![@silentroach](https://avatars.githubusercontent.com/u/166803?s=64&v=4)](/silentroach)
- [![@deepsweet](https://avatars.githubusercontent.com/u/266822?s=64&v=4)](/deepsweet)
- [![@lahmatiy](https://avatars.githubusercontent.com/u/270491?s=64&v=4)](/lahmatiy)
- [![@davidleston](https://avatars.githubusercontent.com/u/1719826?s=64&v=4)](/davidleston)
- [![@Yeti-or](https://avatars.githubusercontent.com/u/1813468?s=64&v=4)](/Yeti-or)
- [![@dependabot\[bot\]](https://avatars.githubusercontent.com/in/29110?s=64&v=4)](/dependabot%5Bbot%5D)

+ 194 contributors

## Languages

- JavaScript 97.9%
- TypeScript 2.1%

You can’t perform that action at this time.

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=svg%2Fsvgo`
- svg - source: `/svg`
- [svgo](./svg-svgo.md) - source: /svg/svgo
- Issues 193 - source: `/svg/svgo/issues`
- Pull requests 83 - source: `/svg/svgo/pulls`
- Actions - source: `/svg/svgo/actions`
- Security and quality 4 - source: `/svg/svgo/security`
- Insights - source: `/svg/svgo/pulse`
- Notifications - source: `/login?return_to=%2Fsvg%2Fsvgo`
- [svgo.dev/](https://svgo.dev/)
- cli - source: `/topics/cli`
- hacktoberfest - source: `/topics/hacktoberfest`
- javascript - source: `/topics/javascript`
- minification - source: `/topics/minification`
- nodejs - source: `/topics/nodejs`
- optimization - source: `/topics/optimization`
- svg - source: `/topics/svg`
- svgo - source: `/topics/svgo`
- Activity - source: `/svg/svgo/activity`
- Custom properties - source: `/svg/svgo/custom-properties`
- 1.5k forks - source: `/svg/svgo/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo&report=svg+%28user%29`
- 6 Branches - source: `/svg/svgo/branches`
- 113 Tags - source: `/svg/svgo/tags`
- KTibow - source: `/svg/svgo/commits?author=KTibow`
- claude - source: `/svg/svgo/commits?author=claude`
- chore(regression): make screenshots deterministic and stop ignoring f… - source: `/svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e`
- 1,649 Commits - source: `/svg/svgo/commits/main/`
- .github - source: `/svg/svgo/tree/main/.github`
- chore: secure actions ( - source: `/svg/svgo/commit/3b47945780ecaa10e9bc4279cbf0637026d2f6cd`
- [#2278](https://github.com/svg/svgo/pull/2278)
- bin - source: `/svg/svgo/tree/main/bin`
- chore: convert project to us ECMAScript modules (preserving CJS compa… - source: `/svg/svgo/commit/2442f742398f6c40bcf83b5c34e4a71a023adae1`
- docs - source: `/svg/svgo/tree/main/docs`
- fix(removeScripts): sanitize foreignObject content ( - source: `/svg/svgo/commit/fd51e474a300417d9361d9302d596b1763146327`
- [#2264](https://github.com/svg/svgo/pull/2264)
- lib - source: `/svg/svgo/tree/main/lib`
- perf: cache parsed inline style declarations ( - source: `/svg/svgo/commit/68c0660ad3c95f3a6f2aa7fd24e7236bb9ed61ce`
- [#2281](https://github.com/svg/svgo/pull/2281)
- logo - source: `/svg/svgo/tree/main/logo`
- Remove the executable flag from files. ( - source: `/svg/svgo/commit/21d24006fd1bc97e6a47723d983b0b428d50a7a9`
- [#1439](https://github.com/svg/svgo/pull/1439)
- patches - source: `/svg/svgo/tree/main/patches`
- feat: upgrade sax to 1.6.1 ( - source: `/svg/svgo/commit/e955ec79e08f44f20198fd8216e685611ec62330`
- [#2257](https://github.com/svg/svgo/pull/2257)
- plugins - source: `/svg/svgo/tree/main/plugins`
- perf: compile removeAttrs patterns once per run ( - source: `/svg/svgo/commit/7dac404f83608ab552c6e784e8dfa3ad04264b28`
- [#2284](https://github.com/svg/svgo/pull/2284)
- scripts - source: `/svg/svgo/tree/main/scripts`
- chore: revamp how we export types ( - source: `/svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03`
- [#2118](https://github.com/svg/svgo/pull/2118)
- test - source: `/svg/svgo/tree/main/test`
- .gitattributes - source: `/svg/svgo/blob/main/.gitattributes`
- chore: migrate package management to pnpm ( - source: `/svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0`
- [#2243](https://github.com/svg/svgo/pull/2243)
- .gitignore - source: `/svg/svgo/blob/main/.gitignore`
- chore: cache regression screenshots ( - source: `/svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484`
- [#2267](https://github.com/svg/svgo/pull/2267)
- .prettierignore - source: `/svg/svgo/blob/main/.prettierignore`
- .prettierrc - source: `/svg/svgo/blob/main/.prettierrc`
- chore: update prettier and eslint ( - source: `/svg/svgo/commit/22533f1ffe82978e0d4c6ff502bf3651eaaf13fe`
- [#1885](https://github.com/svg/svgo/pull/1885)
- CONTRIBUTING.md - source: `/svg/svgo/blob/main/CONTRIBUTING.md`
- LICENSE - source: `/svg/svgo/blob/main/LICENSE`
- Cleanup LICENSE ( - source: `/svg/svgo/commit/ce2ce0de481c72a8ec82dbf112f6822afbb4d4ce`
- [#1157](https://github.com/svg/svgo/pull/1157)
- README.md - source: `/svg/svgo/blob/main/README.md`
- docs: add sponsor message to readme ( - source: `/svg/svgo/commit/e4cb29bebcc9820ac979dfc05106b512cc5de986`
- [#2285](https://github.com/svg/svgo/pull/2285)
- cspell.jsonc - source: `/svg/svgo/blob/main/cspell.jsonc`
- eslint.config.mjs - source: `/svg/svgo/blob/main/eslint.config.mjs`
- test: migrate from Jest to Vitest ( - source: `/svg/svgo/commit/318a6322593398fd271dfa2615a01776041ba95c`
- [#2252](https://github.com/svg/svgo/pull/2252)
- package.json - source: `/svg/svgo/blob/main/package.json`
- chore: prepare v4.1.0 release ( - source: `/svg/svgo/commit/5765cbe4e0a930dca648c6b81d335b1522cd7375`
- [#2275](https://github.com/svg/svgo/pull/2275)
- pnpm-lock.yaml - source: `/svg/svgo/blob/main/pnpm-lock.yaml`
- chore: optimize fixtures in a bounded worker pool ( - source: `/svg/svgo/commit/dcaf957c6eb34832844de11ef2792e3e0e8db5dd`
- [#2265](https://github.com/svg/svgo/pull/2265)
- pnpm-workspace.yaml - source: `/svg/svgo/blob/main/pnpm-workspace.yaml`
- rollup.config.js - source: `/svg/svgo/blob/main/rollup.config.js`
- docs: write v2 to v3 migration guide ( - source: `/svg/svgo/commit/a9d27dfe25422cdc97c02e9742c94a3a76ea9dbb`
- [#2177](https://github.com/svg/svgo/pull/2177)
- tsconfig.build.json - source: `/svg/svgo/blob/main/tsconfig.build.json`
- tsconfig.json - source: `/svg/svgo/blob/main/tsconfig.json`
- test(typescript): drop tsd for vitest type testing API - source: `/svg/svgo/commit/0b97fedd00a3001f1da616f61578c2c12e6cde1f`
- vitest.config.js - source: `/svg/svgo/blob/main/vitest.config.js`
- /svg/svgo/blob/main/logo/logo-web.svg - source: `/svg/svgo/blob/main/logo/logo-web.svg`
- [https://npmjs.org/package/svgo](https://npmjs.org/package/svgo)
- [https://discord.gg/z8jX8NYxrE](https://discord.gg/z8jX8NYxrE)
- [Sponsor SVGO on Open Collective](https://opencollective.com/svgo)
- [Plugins | SVGO Documentation](https://svgo.dev/docs/plugins/)
- [Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/)
- [Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/#plugins-list)
- [MIT license](https://github.com/svg/svgo/blob/main/LICENSE)
- [André Castillo](https://github.com/DerianAndre)
- Releases - source: `/svg/svgo/releases`
- v4.1.0 Latest Aug 24, 2026 - source: `/svg/svgo/releases/tag/v4.1.0`
- Used by - source: `/svg/svgo/network/dependents`
- Contributors - source: `/svg/svgo/graphs/contributors`
- /GreLI - source: `/GreLI`
- /TrySound - source: `/TrySound`
- /SethFalco - source: `/SethFalco`
- /XhmikosR - source: `/XhmikosR`
- /strarsis - source: `/strarsis`
- /KTibow - source: `/KTibow`
- /caub - source: `/caub`
- /johnkenny54 - source: `/johnkenny54`
- /silentroach - source: `/silentroach`
- /deepsweet - source: `/deepsweet`
- /lahmatiy - source: `/lahmatiy`
- /davidleston - source: `/davidleston`
- /Yeti-or - source: `/Yeti-or`
- /dependabot[bot] - source: `/dependabot[bot]`
- JavaScript 97.9% - source: `/svg/svgo/search?l=javascript`
- TypeScript 2.1% - source: `/svg/svgo/search?l=typescript`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
