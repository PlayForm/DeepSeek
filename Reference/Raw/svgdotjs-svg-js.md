 ![svgdotjs](https://avatars.githubusercontent.com/u/22855482?s=60&v=4)**svg.js** Public

- Sponsor
- Notifications You must be signed in to change notification settings
- Fork 1.1k
- Star 11.8k You must be signed in to star a repository

## About

The lightweight library for manipulating and animating SVG

[svgjs.dev](https://svgjs.dev) animation javascript svg svgjs [Readme](#readme-ov-file) [License](#License-1-ov-file) [Contributing](#contributing-ov-file) Activity Custom properties **11.8k** stars **263** watching **1.1k** forks Report repository**5** Branches **117** TagsOpen more actions menu[![Fuzzyma](https://avatars.githubusercontent.com/u/3540542?v=4&size=40)](/Fuzzyma)Fuzzymarelease 3.2.8 Aug 4, 2026 4b8809b · Aug 4, 2026 1,570 Commits Open commit details1,570 Commits

| Name | Name | Last commit message | Last commit date |
|----|----|----|----|
| .config | .config | Modernize development toolchain | Jul 17, 2026 |
| .github | .github | Fix event cleanup and Corepack setup | Jul 16, 2026 |
| bench | bench | update dependencies | Jun 18, 2024 |
| playgrounds | playgrounds | dependency updates, easier formatting | Jun 12, 2023 |
| spec | spec | Simplify transform runner bookkeeping | Jul 29, 2026 |
| src | src | Simplify transform runner bookkeeping | Jul 29, 2026 |
| .gitignore | .gitignore | Fix published package entry points | Jul 16, 2026 |
| .oxfmtrc.json | .oxfmtrc.json | Modernize development toolchain | Jul 17, 2026 |
| .oxlintrc.json | .oxlintrc.json | Modernize development toolchain | Jul 17, 2026 |
| .travis.yml | .travis.yml | Fix event cleanup and Corepack setup | Jul 16, 2026 |
| CHANGELOG.md | CHANGELOG.md | release 3.2.8 | Aug 4, 2026 |
| LICENSE.txt | LICENSE.txt | fix playgrounds, delete unneeded files | Dec 1, 2018 |
| README.md | README.md | dependency updates, easier formatting | Jun 12, 2023 |
| package.json | package.json | release 3.2.8 | Aug 4, 2026 |
| pnpm-lock.yaml | pnpm-lock.yaml | Modernize development toolchain | Jul 17, 2026 |
| pnpm-workspace.yaml | pnpm-workspace.yaml | Modernize development toolchain | Jul 17, 2026 |
| svg.js.d.ts | svg.js.d.ts | Clean animation API state and declarations | Jul 29, 2026 |
| tsconfig.json | tsconfig.json | add more events to sugar (fixes [\#1217](https://github.com/svgdotjs/svg.js/issues/1217)) | Sep 3, 2023 |
|  |  |  |  |

# SVG.js


[![Build Status](https://camo.githubusercontent.com/4f6b530dc4710b6ad118912670104b4da9bf8e65eaf04a39aea8bd00cbeb5197/68747470733a2f2f7472617669732d63692e6f72672f737667646f746a732f7376672e6a732e7376673f6272616e63683d6d6173746572)](https://travis-ci.org/svgdotjs/svg.js) [![Coverage Status](https://camo.githubusercontent.com/791505b4389e231713bd255618d94690b0a5fa06124762a6aecb0dbe7bad18af/68747470733a2f2f636f766572616c6c732e696f2f7265706f732f6769746875622f737667646f746a732f7376672e6a732f62616467652e7376673f6272616e63683d6d6173746572)](https://coveralls.io/github/svgdotjs/svg.js?branch=master) [![Cdnjs](https://camo.githubusercontent.com/a94933b2f028a4c9e66bec7803358eb5f84637cb2e85ac49001b455f70fc1396/68747470733a2f2f696d672e736869656c64732e696f2f63646e6a732f762f7376672e6a732e737667)](https://cdnjs.com/libraries/svg.js) [![jsdelivr](https://camo.githubusercontent.com/6de39104106b0842f85031b0b2d750519aa343786208f12fe5e8f7ea3c2a1bf5/68747470733a2f2f62616467656e2e6e65742f6a7364656c6976722f762f6e706d2f40737667646f746a732f7376672e6a73)](https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js) [![Join the chat at https://gitter.im/svgdotjs/svg.js](https://camo.githubusercontent.com/fc7363461d9a793908d38527614a19211f84379ef1dad7877b9a13b1aafd2237/68747470733a2f2f6261646765732e6769747465722e696d2f737667646f746a732f7376672e6a732e737667)](https://gitter.im/svgdotjs/svg.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Twitter](https://camo.githubusercontent.com/0a6505005b6146b3c95d22c0f6c5a45124be89cc578ff95b2165cec4977f47db/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f547769747465722d407376675f5f6a732d677265656e2e737667)](https://twitter.com/svg_js)

**A lightweight library for manipulating and animating SVG, without any dependencies.**

SVG.js is licensed under the terms of the MIT License.

## Installation


#### Npm:


`npm install @svgdotjs/svg.js`

#### Yarn:


`yarn add @svgdotjs/svg.js`

#### CDNs:


<https://cdnjs.com/libraries/svg.js>\
<https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js>\
<https://unpkg.com/@svgdotjs/svg.js>

## Documentation


Check [svgjs.dev](https://svgjs.dev/docs/3.0/) to learn more.

[![Donate](https://camo.githubusercontent.com/604e3db9c8751116b3f765aad0353ec7ded655bbe8aaacbc38d8c4a6b784b3ed/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d50617950616c2d677265656e2e737667)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ulima.ums%40googlemail.com&lc=US&item_name=SVG.JS&currency_code=EUR&bn=PP-DonationsBF%3Abtn_donate_74x21.png%3ANonHostedGuest) or [![Sponsor](https://camo.githubusercontent.com/650f6931af93f2ac991c3696609f4ab068ecc3a3b2932b3962ece12356735e00/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f53706f6e736f722d7376672e6a732d677265656e2e737667)](https://github.com/sponsors/Fuzzyma)

## About

The lightweight library for manipulating and animating SVG

[svgjs.dev](https://svgjs.dev) animation javascript svg svgjs [Readme](#readme-ov-file) [License](#License-1-ov-file) [Contributing](#contributing-ov-file) Activity Custom properties **11.8k** stars **263** watching **1.1k** forks Report repository

## Releases 39 (39)

Release 3.2.6 Latest Jul 17, 2026+ 38 releases

## Sponsor this project

- [![@Fuzzyma](https://avatars.githubusercontent.com/u/3540542?s=64&v=4)](/Fuzzyma)**Fuzzyma** Ulrich-Matthias SchäferSponsor @Fuzzyma

Learn more about GitHub Sponsors

## Used by 190K (190K)

[![@jeromesigg](https://avatars.githubusercontent.com/u/23478949?s=64&v=4)![@open-source-uct](https://avatars.githubusercontent.com/u/326765316?s=64&v=4)![@ValentinML525](https://avatars.githubusercontent.com/u/216724229?s=64&v=4)![@syahrulrzk](https://avatars.githubusercontent.com/u/62525690?s=64&v=4)![@bizbaeja](https://avatars.githubusercontent.com/u/75407823?s=64&v=4)+ 192,786](/svgdotjs/svg.js/network/dependents)

## Contributors 90 (90)

- [![@Fuzzyma](https://avatars.githubusercontent.com/u/3540542?s=64&v=4)](/Fuzzyma)
- [![@dotnetCarpenter](https://avatars.githubusercontent.com/u/43763?s=64&v=4)](/dotnetCarpenter)
- [![@RmiTtro](https://avatars.githubusercontent.com/u/21284258?s=64&v=4)](/RmiTtro)
- [![@wout](https://avatars.githubusercontent.com/u/107324?s=64&v=4)](/wout)
- [![@snowyplover](https://avatars.githubusercontent.com/u/3581191?s=64&v=4)](/snowyplover)
- [![@kabentley](https://avatars.githubusercontent.com/u/33296803?s=64&v=4)](/kabentley)
- [![@pklingem](https://avatars.githubusercontent.com/u/46536?s=64&v=4)](/pklingem)
- [![@alexewerlof](https://avatars.githubusercontent.com/u/835750?s=64&v=4)](/alexewerlof)
- [![@GSchutz](https://avatars.githubusercontent.com/u/1896145?s=64&v=4)](/GSchutz)
- [![@visionm45](https://avatars.githubusercontent.com/u/63524849?s=64&v=4)](/visionm45)
- [![@nobuti](https://avatars.githubusercontent.com/u/1366843?s=64&v=4)](/nobuti)
- [![@niceilm](https://avatars.githubusercontent.com/u/2839849?s=64&v=4)](/niceilm)
- [![@pragdave](https://avatars.githubusercontent.com/u/10648?s=64&v=4)](/pragdave)
- [![@gormster](https://avatars.githubusercontent.com/u/152158?s=64&v=4)](/gormster)

+ 76 contributors

## Languages

- JavaScript 98.3%
- Other 1.7%

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fsvgdotjs%2Fsvg.js`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=svgdotjs%2Fsvg.js`
- svgdotjs - source: `/svgdotjs`
- svg.js - source: `/svgdotjs/svg.js`
- Issues - source: `/svgdotjs/svg.js/issues`
- Pull requests - source: `/svgdotjs/svg.js/pulls`
- Actions - source: `/svgdotjs/svg.js/actions`
- Projects - source: `/svgdotjs/svg.js/projects`
- Security and quality - source: `/svgdotjs/svg.js/security`
- Insights - source: `/svgdotjs/svg.js/pulse`
- Sponsor - source: `/sponsors/Fuzzyma`
- Notifications - source: `/login?return_to=%2Fsvgdotjs%2Fsvg.js`
- [svgjs.dev](https://svgjs.dev)
- animation - source: `/topics/animation`
- javascript - source: `/topics/javascript`
- svg - source: `/topics/svg`
- svgjs - source: `/topics/svgjs`
- Activity - source: `/svgdotjs/svg.js/activity`
- Custom properties - source: `/svgdotjs/svg.js/custom-properties`
- 1.1k forks - source: `/svgdotjs/svg.js/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fsvgdotjs%2Fsvg.js&report=svgdotjs+%28user%29`
- 5 Branches - source: `/svgdotjs/svg.js/branches`
- 117 Tags - source: `/svgdotjs/svg.js/tags`
- /Fuzzyma - source: `/Fuzzyma`
- Fuzzyma - source: `/svgdotjs/svg.js/commits?author=Fuzzyma`
- release 3.2.8 - source: `/svgdotjs/svg.js/commit/4b8809b1554c44a84f8992cdbda60480336cc040`
- 1,570 Commits - source: `/svgdotjs/svg.js/commits/master/`
- .config - source: `/svgdotjs/svg.js/tree/master/.config`
- Modernize development toolchain - source: `/svgdotjs/svg.js/commit/26519a5d2660faa7d0b8cf329b36c18b2e87fdd6`
- .github - source: `/svgdotjs/svg.js/tree/master/.github`
- Fix event cleanup and Corepack setup - source: `/svgdotjs/svg.js/commit/14db829fdabcbacfcbcb6882dc7040ed8668db02`
- bench - source: `/svgdotjs/svg.js/tree/master/bench`
- update dependencies - source: `/svgdotjs/svg.js/commit/a1c23d3838f6551f01894be40c8894398467c541`
- playgrounds - source: `/svgdotjs/svg.js/tree/master/playgrounds`
- dependency updates, easier formatting - source: `/svgdotjs/svg.js/commit/03322672782a6318b019eff33fe44ec800d6f12c`
- spec - source: `/svgdotjs/svg.js/tree/master/spec`
- Simplify transform runner bookkeeping - source: `/svgdotjs/svg.js/commit/06f6254472609ba104b8073339708e20952b18ae`
- src - source: `/svgdotjs/svg.js/tree/master/src`
- .gitignore - source: `/svgdotjs/svg.js/blob/master/.gitignore`
- Fix published package entry points - source: `/svgdotjs/svg.js/commit/e2d50e83eee5662e11ad589b67c67afd7fca2dfb`
- .oxfmtrc.json - source: `/svgdotjs/svg.js/blob/master/.oxfmtrc.json`
- .oxlintrc.json - source: `/svgdotjs/svg.js/blob/master/.oxlintrc.json`
- .travis.yml - source: `/svgdotjs/svg.js/blob/master/.travis.yml`
- CHANGELOG.md - source: `/svgdotjs/svg.js/blob/master/CHANGELOG.md`
- LICENSE.txt - source: `/svgdotjs/svg.js/blob/master/LICENSE.txt`
- fix playgrounds, delete unneeded files - source: `/svgdotjs/svg.js/commit/51dafe62e02c4298859ac8f1c5945899241fac23`
- README.md - source: `/svgdotjs/svg.js/blob/master/README.md`
- package.json - source: `/svgdotjs/svg.js/blob/master/package.json`
- pnpm-lock.yaml - source: `/svgdotjs/svg.js/blob/master/pnpm-lock.yaml`
- pnpm-workspace.yaml - source: `/svgdotjs/svg.js/blob/master/pnpm-workspace.yaml`
- svg.js.d.ts - source: `/svgdotjs/svg.js/blob/master/svg.js.d.ts`
- Clean animation API state and declarations - source: `/svgdotjs/svg.js/commit/2b7a1dc3f231f9c1fdf38e4320312241d1391c7b`
- tsconfig.json - source: `/svgdotjs/svg.js/blob/master/tsconfig.json`
- add more events to sugar ( - source: `/svgdotjs/svg.js/commit/2a8b5ea3fb6b3a62ed53d367b6d16d1515422ab9`
- [#1217](https://github.com/svgdotjs/svg.js/issues/1217)
- [https://travis-ci.org/svgdotjs/svg.js](https://travis-ci.org/svgdotjs/svg.js)
- [https://coveralls.io/github/svgdotjs/svg.js?branch=master](https://coveralls.io/github/svgdotjs/svg.js?branch=master)
- [https://cdnjs.com/libraries/svg.js](https://cdnjs.com/libraries/svg.js)
- [https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js](https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js)
- [https://gitter.im/svgdotjs/svg.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge](https://gitter.im/svgdotjs/svg.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
- [https://twitter.com/svg_js](https://twitter.com/svg_js)
- [https://unpkg.com/@svgdotjs/svg.js](https://unpkg.com/@svgdotjs/svg.js)
- [svgjs.dev](https://svgjs.dev/docs/3.0/)
- [https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ulima.ums%40googlemail.com&lc=US&item_name=SVG.JS&currency_code=EUR&bn=PP-DonationsBF%3Abtn_donate_74x21.png%3ANonHostedGuest](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ulima.ums%40googlemail.com&lc=US&item_name=SVG.JS&currency_code=EUR&bn=PP-DonationsBF%3Abtn_donate_74x21.png%3ANonHostedGuest)
- [https://github.com/sponsors/Fuzzyma](https://github.com/sponsors/Fuzzyma)
- Releases - source: `/svgdotjs/svg.js/releases`
- Release 3.2.6 Latest Jul 17, 2026 - source: `/svgdotjs/svg.js/releases/tag/3.2.6`
- Learn more about GitHub Sponsors - source: `/sponsors`
- Used by - source: `/svgdotjs/svg.js/network/dependents`
- Contributors - source: `/svgdotjs/svg.js/graphs/contributors`
- /dotnetCarpenter - source: `/dotnetCarpenter`
- /RmiTtro - source: `/RmiTtro`
- /wout - source: `/wout`
- /snowyplover - source: `/snowyplover`
- /kabentley - source: `/kabentley`
- /pklingem - source: `/pklingem`
- /alexewerlof - source: `/alexewerlof`
- /GSchutz - source: `/GSchutz`
- /visionm45 - source: `/visionm45`
- /nobuti - source: `/nobuti`
- /niceilm - source: `/niceilm`
- /pragdave - source: `/pragdave`
- /gormster - source: `/gormster`
- JavaScript 98.3% - source: `/svgdotjs/svg.js/search?l=javascript`
- Other 1.7% - source: `/svgdotjs/svg.js/search?l=Other`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
