[![](./svg-svgo-raw-main-logo-logo-web.svg.md)](/svg/svgo/blob/main/logo/logo-web.svg)

- [![npm](https://camo.githubusercontent.com/eb8988f721887a88d75c97e6530c5384171ed8cf88467601ffd9dfb5bbbc30af/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f7376676f)](https://npmjs.org/package/svgo)
- [![chat](https://camo.githubusercontent.com/4dd535ad4d808f2586390a041d395362a08508fc0e9e596df2854ea08a49f708/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f383135313636373231333135383331383638)](https://discord.gg/z8jX8NYxrE)
- [![docs](https://camo.githubusercontent.com/760fd346fa4f8161b715a1b480d92a9c7965a5f7d00e452d20beda0a0a2e5083/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f646f63732d7376676f2e6465762d626c7565)](https://svgo.dev/)


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

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=svg%2Fsvgo.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=svg%2Fsvgo
- [svg](./svg.md) - source: /svg
- [svgo](./svg-svgo.md) - source: /svg/svgo
- [Issues 193](./svg-svgo-issues.md) - source: /svg/svgo/issues
- [Pull requests 83](./svg-svgo-pulls.md) - source: /svg/svgo/pulls
- [Actions](./svg-svgo-actions.md) - source: /svg/svgo/actions
- [Security and quality 4](./svg-svgo-security.md) - source: /svg/svgo/security
- [Insights](./svg-svgo-pulse.md) - source: /svg/svgo/pulse
- [Notifications](./login?return_to=%2Fsvg%2Fsvgo.md) - source: /login?return_to=%2Fsvg%2Fsvgo
- [svgo.dev/](https://svgo.dev/)
- [cli](./topics-cli.md) - source: /topics/cli
- [hacktoberfest](./topics-hacktoberfest.md) - source: /topics/hacktoberfest
- [javascript](./topics-javascript.md) - source: /topics/javascript
- [minification](./topics-minification.md) - source: /topics/minification
- [nodejs](./topics-nodejs.md) - source: /topics/nodejs
- [optimization](./topics-optimization.md) - source: /topics/optimization
- [svg](./topics-svg.md) - source: /topics/svg
- [svgo](./topics-svgo.md) - source: /topics/svgo
- [Activity](./svg-svgo-activity.md) - source: /svg/svgo/activity
- [Custom properties](./svg-svgo-custom-properties.md) - source: /svg/svgo/custom-properties
- [1.5k forks](./svg-svgo-forks.md) - source: /svg/svgo/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo&report=svg+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fsvg%2Fsvgo&report=svg+%28user%29
- [6 Branches](./svg-svgo-branches.md) - source: /svg/svgo/branches
- [113 Tags](./svg-svgo-tags.md) - source: /svg/svgo/tags
- [KTibow](./svg-svgo-commits?author=KTibow.md) - source: /svg/svgo/commits?author=KTibow
- [claude](./svg-svgo-commits?author=claude.md) - source: /svg/svgo/commits?author=claude
- [chore(regression): make screenshots deterministic and stop ignoring f…](./svg-svgo-commit-96e756b1c5aedeb3d6b8532033060bcd17bbb76e.md) - source: /svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e
- [1,649 Commits](./svg-svgo-commits-main.md) - source: /svg/svgo/commits/main/
- [.github](./svg-svgo-tree-main-.github.md) - source: /svg/svgo/tree/main/.github
- [chore: secure actions (](./svg-svgo-commit-3b47945780ecaa10e9bc4279cbf0637026d2f6cd.md) - source: /svg/svgo/commit/3b47945780ecaa10e9bc4279cbf0637026d2f6cd
- [#2278](https://github.com/svg/svgo/pull/2278)
- [bin](./svg-svgo-tree-main-bin.md) - source: /svg/svgo/tree/main/bin
- [chore: convert project to us ECMAScript modules (preserving CJS compa…](./svg-svgo-commit-2442f742398f6c40bcf83b5c34e4a71a023adae1.md) - source: /svg/svgo/commit/2442f742398f6c40bcf83b5c34e4a71a023adae1
- [docs](./svg-svgo-tree-main-docs.md) - source: /svg/svgo/tree/main/docs
- [fix(removeScripts): sanitize foreignObject content (](./svg-svgo-commit-fd51e474a300417d9361d9302d596b1763146327.md) - source: /svg/svgo/commit/fd51e474a300417d9361d9302d596b1763146327
- [#2264](https://github.com/svg/svgo/pull/2264)
- [lib](./svg-svgo-tree-main-lib.md) - source: /svg/svgo/tree/main/lib
- [perf: cache parsed inline style declarations (](./svg-svgo-commit-68c0660ad3c95f3a6f2aa7fd24e7236bb9ed61ce.md) - source: /svg/svgo/commit/68c0660ad3c95f3a6f2aa7fd24e7236bb9ed61ce
- [#2281](https://github.com/svg/svgo/pull/2281)
- [logo](./svg-svgo-tree-main-logo.md) - source: /svg/svgo/tree/main/logo
- [Remove the executable flag from files. (](./svg-svgo-commit-21d24006fd1bc97e6a47723d983b0b428d50a7a9.md) - source: /svg/svgo/commit/21d24006fd1bc97e6a47723d983b0b428d50a7a9
- [#1439](https://github.com/svg/svgo/pull/1439)
- [patches](./svg-svgo-tree-main-patches.md) - source: /svg/svgo/tree/main/patches
- [feat: upgrade sax to 1.6.1 (](./svg-svgo-commit-e955ec79e08f44f20198fd8216e685611ec62330.md) - source: /svg/svgo/commit/e955ec79e08f44f20198fd8216e685611ec62330
- [#2257](https://github.com/svg/svgo/pull/2257)
- [plugins](./svg-svgo-tree-main-plugins.md) - source: /svg/svgo/tree/main/plugins
- [perf: compile removeAttrs patterns once per run (](./svg-svgo-commit-7dac404f83608ab552c6e784e8dfa3ad04264b28.md) - source: /svg/svgo/commit/7dac404f83608ab552c6e784e8dfa3ad04264b28
- [#2284](https://github.com/svg/svgo/pull/2284)
- [scripts](./svg-svgo-tree-main-scripts.md) - source: /svg/svgo/tree/main/scripts
- [chore: revamp how we export types (](./svg-svgo-commit-747cc722d933cb49058eb32b494acd43b6a4ad03.md) - source: /svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03
- [#2118](https://github.com/svg/svgo/pull/2118)
- [test](./svg-svgo-tree-main-test.md) - source: /svg/svgo/tree/main/test
- [.gitattributes](./svg-svgo-blob-main-.gitattributes.md) - source: /svg/svgo/blob/main/.gitattributes
- [chore: migrate package management to pnpm (](./svg-svgo-commit-1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0.md) - source: /svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0
- [#2243](https://github.com/svg/svgo/pull/2243)
- [.gitignore](./svg-svgo-blob-main-.gitignore.md) - source: /svg/svgo/blob/main/.gitignore
- [chore: cache regression screenshots (](./svg-svgo-commit-4e9b9aed2a4607cf28025871151421d5bfe86484.md) - source: /svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484
- [#2267](https://github.com/svg/svgo/pull/2267)
- [.prettierignore](./svg-svgo-blob-main-.prettierignore.md) - source: /svg/svgo/blob/main/.prettierignore
- [.prettierrc](./svg-svgo-blob-main-.prettierrc.md) - source: /svg/svgo/blob/main/.prettierrc
- [chore: update prettier and eslint (](./svg-svgo-commit-22533f1ffe82978e0d4c6ff502bf3651eaaf13fe.md) - source: /svg/svgo/commit/22533f1ffe82978e0d4c6ff502bf3651eaaf13fe
- [#1885](https://github.com/svg/svgo/pull/1885)
- [CONTRIBUTING.md](./svg-svgo-blob-main-CONTRIBUTING.md.md) - source: /svg/svgo/blob/main/CONTRIBUTING.md
- [LICENSE](./svg-svgo-blob-main-LICENSE.md) - source: /svg/svgo/blob/main/LICENSE
- [Cleanup LICENSE (](./svg-svgo-commit-ce2ce0de481c72a8ec82dbf112f6822afbb4d4ce.md) - source: /svg/svgo/commit/ce2ce0de481c72a8ec82dbf112f6822afbb4d4ce
- [#1157](https://github.com/svg/svgo/pull/1157)
- [README.md](./svg-svgo-blob-main-README.md.md) - source: /svg/svgo/blob/main/README.md
- [docs: add sponsor message to readme (](./svg-svgo-commit-e4cb29bebcc9820ac979dfc05106b512cc5de986.md) - source: /svg/svgo/commit/e4cb29bebcc9820ac979dfc05106b512cc5de986
- [#2285](https://github.com/svg/svgo/pull/2285)
- [cspell.jsonc](./svg-svgo-blob-main-cspell.jsonc.md) - source: /svg/svgo/blob/main/cspell.jsonc
- [eslint.config.mjs](./svg-svgo-blob-main-eslint.config.mjs.md) - source: /svg/svgo/blob/main/eslint.config.mjs
- [test: migrate from Jest to Vitest (](./svg-svgo-commit-318a6322593398fd271dfa2615a01776041ba95c.md) - source: /svg/svgo/commit/318a6322593398fd271dfa2615a01776041ba95c
- [#2252](https://github.com/svg/svgo/pull/2252)
- [package.json](./svg-svgo-blob-main-package.json.md) - source: /svg/svgo/blob/main/package.json
- [chore: prepare v4.1.0 release (](./svg-svgo-commit-5765cbe4e0a930dca648c6b81d335b1522cd7375.md) - source: /svg/svgo/commit/5765cbe4e0a930dca648c6b81d335b1522cd7375
- [#2275](https://github.com/svg/svgo/pull/2275)
- [pnpm-lock.yaml](./svg-svgo-blob-main-pnpm-lock.yaml.md) - source: /svg/svgo/blob/main/pnpm-lock.yaml
- [chore: optimize fixtures in a bounded worker pool (](./svg-svgo-commit-dcaf957c6eb34832844de11ef2792e3e0e8db5dd.md) - source: /svg/svgo/commit/dcaf957c6eb34832844de11ef2792e3e0e8db5dd
- [#2265](https://github.com/svg/svgo/pull/2265)
- [pnpm-workspace.yaml](./svg-svgo-blob-main-pnpm-workspace.yaml.md) - source: /svg/svgo/blob/main/pnpm-workspace.yaml
- [rollup.config.js](./svg-svgo-blob-main-rollup.config.js.md) - source: /svg/svgo/blob/main/rollup.config.js
- [docs: write v2 to v3 migration guide (](./svg-svgo-commit-a9d27dfe25422cdc97c02e9742c94a3a76ea9dbb.md) - source: /svg/svgo/commit/a9d27dfe25422cdc97c02e9742c94a3a76ea9dbb
- [#2177](https://github.com/svg/svgo/pull/2177)
- [tsconfig.build.json](./svg-svgo-blob-main-tsconfig.build.json.md) - source: /svg/svgo/blob/main/tsconfig.build.json
- [tsconfig.json](./svg-svgo-blob-main-tsconfig.json.md) - source: /svg/svgo/blob/main/tsconfig.json
- [test(typescript): drop tsd for vitest type testing API](./svg-svgo-commit-0b97fedd00a3001f1da616f61578c2c12e6cde1f.md) - source: /svg/svgo/commit/0b97fedd00a3001f1da616f61578c2c12e6cde1f
- [vitest.config.js](./svg-svgo-blob-main-vitest.config.js.md) - source: /svg/svgo/blob/main/vitest.config.js
- [/svg/svgo/blob/main/logo/logo-web.svg](./svg-svgo-blob-main-logo-logo-web.svg.md) - source: /svg/svgo/blob/main/logo/logo-web.svg
- [https://npmjs.org/package/svgo](https://npmjs.org/package/svgo)
- [https://discord.gg/z8jX8NYxrE](https://discord.gg/z8jX8NYxrE)
- [Sponsor SVGO on Open Collective](https://opencollective.com/svgo)
- [Plugins | SVGO Documentation](https://svgo.dev/docs/plugins/)
- [Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/)
- [Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/#plugins-list)
- [MIT license](https://github.com/svg/svgo/blob/main/LICENSE)
- [André Castillo](https://github.com/DerianAndre)
- [Releases](./svg-svgo-releases.md) - source: /svg/svgo/releases
- [v4.1.0 Latest Aug 24, 2026](./svg-svgo-releases-tag-v4.1.0.md) - source: /svg/svgo/releases/tag/v4.1.0
- [Used by](./svg-svgo-network-dependents.md) - source: /svg/svgo/network/dependents
- [Contributors](./svg-svgo-graphs-contributors.md) - source: /svg/svgo/graphs/contributors
- [/GreLI](./GreLI.md) - source: /GreLI
- [/TrySound](./TrySound.md) - source: /TrySound
- [/SethFalco](./SethFalco.md) - source: /SethFalco
- [/XhmikosR](./XhmikosR.md) - source: /XhmikosR
- [/strarsis](./strarsis.md) - source: /strarsis
- [/KTibow](./KTibow.md) - source: /KTibow
- [/caub](./caub.md) - source: /caub
- [/johnkenny54](./johnkenny54.md) - source: /johnkenny54
- [/silentroach](./silentroach.md) - source: /silentroach
- [/deepsweet](./deepsweet.md) - source: /deepsweet
- [/lahmatiy](./lahmatiy.md) - source: /lahmatiy
- [/davidleston](./davidleston.md) - source: /davidleston
- [/Yeti-or](./Yeti-or.md) - source: /Yeti-or
- [/dependabot[bot]](./dependabot[bot].md) - source: /dependabot[bot]
- [JavaScript 97.9%](./svg-svgo-search?l=javascript.md) - source: /svg/svgo/search?l=javascript
- [TypeScript 2.1%](./svg-svgo-search?l=typescript.md) - source: /svg/svgo/search?l=typescript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
