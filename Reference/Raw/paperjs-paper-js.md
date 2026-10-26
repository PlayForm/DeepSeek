# Paper.js - The Swiss Army Knife of Vector Graphics Scripting [![CI](https://github.com/paperjs/paper.js/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/paperjs/paper.js/actions/workflows/ci.yml) [![NPM](https://camo.githubusercontent.com/8d54c3bd0b034847afc2e9371a9ce38ae17c6b48b11f55afd00612727b3e3ff9/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f70617065722e737667)](https://www.npmjs.com/package/paper)

If you want to work with Paper.js, simply download the latest "stable" version from
<http://paperjs.org/download/>

- Website: <http://paperjs.org/>
- Questions: <https://stackoverflow.com/questions/tagged/paperjs>
- Discussion forum: <https://groups.google.com/group/paperjs>
- Mainline source code: <https://github.com/paperjs/paper.js>
- Twitter: [@paperjs](https://twitter.com/paperjs)
- Latest releases: <http://paperjs.org/download/>
- Pre-built development versions:
  [`prebuilt/module`](https://github.com/paperjs/paper.js/tree/prebuilt/module) and
  [`prebuilt/dist`](https://github.com/paperjs/paper.js/tree/prebuilt/dist) branches.

## Installing Paper.js

The recommended way to install and maintain Paper.js as a dependency in your project is through the
[Node.js Package Manager (NPM)](https://www.npmjs.com/) for browsers, Node.js or Electron.

If NPM is already installed, simply type one of these commands in your project folder:

npm install paper

Upon execution, you will find a `paper` folder inside the project's `node_modules` folder.

For more information on how to install Node.js and NPM, read the chapter
[Installing Node.js and NPM](#installing-nodejs-and-npm).

### Using Paper.js with a Bundler

With a bundler such as webpack, Rollup, esbuild or Vite, import Paper.js and set it up with a canvas
element:

import paper from 'paper'\
// Or, with CommonJS: const paper = require('paper')\
\
paper.setup(document.getElementById('canvas'))\
\
const { Path } = paper\
const circle = new Path.Circle({\
  center: paper.view.center,\
  radius: 30,\
  fillColor: 'red'\
})\
\
paper.view.onFrame = event =\> {\
  circle.rotate(1)\
}

The module exports the global `paper` scope as its default export, with all classes as its
properties. Use `paper.view` and `paper.project` after calling `paper.setup()`, rather than
importing them, as they only exist from then on. To use the core version without PaperScript, import
`'paper/dist/paper-core'` instead. With TypeScript, the default import requires `esModuleInterop`.

### Which Version to Use

The various distributions come with two different pre-build versions of Paper.js, in minified and
normal variants:

- `paper-full.js` – The full version for the browser, including PaperScript support and Acorn.js
- `paper-core.js` – The core version for the browser, without PaperScript support nor Acorn.js. You
  can use this to shave off some bytes and compilation time when working with JavaScript directly.

### Installing Node.js and NPM

Node.js comes with the Node Package Manager (NPM). There are many tutorials explaining the different
ways to install Node.js on different platforms. It is generally not recommended to install Node.js
through OS-supplied package managers, as the its development cycles move fast and these versions are
often out-of-date.

On macOS, [Homebrew](https://brew.sh/) is a good option if one version of Node.js that is kept up to
date with `brew upgrade` is enough:\
<https://treehouse.github.io/installation-guides/mac/node-mac.html>

[NVM](https://github.com/creationix/nvm) can be used instead to install and maintain multiple
versions of Node.js on the same platform, as often required by different projects:\
<https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/>

Homebrew is recommended on macOS also if you intend to install Paper.js with rendering to the Canvas
on Node.js, as described in the next paragraph.

For Linux, see <https://nodejs.org/download/> to locate 32-bit and 64-bit Node.js binaries as well
as sources, or use NVM, as described in the paragraph above.

### Installing Paper.js Using NPM

Paper.js comes in three different versions on NPM: `paper`, `paper-jsdom` and `paper-jsdom-canvas`.
Depending on your use case, you need to required a different one:

- `paper` is the main library, and can be used directly in a browser context, e.g. a web browser or
  worker.
- `paper-jsdom` is a shim module for Node.js, offering headless use with SVG importing and exporting
  through [jsdom](https://github.com/tmpvar/jsdom).
- `paper-jsdom-canvas` is a shim module for Node.js, offering canvas rendering through
  [Node-Canvas](https://github.com/Automattic/node-canvas) as well as SVG importing and exporting
  through [jsdom](https://github.com/tmpvar/jsdom).

In order to install `paper-jsdom-canvas`, you need the
[Cairo Graphics library](https://cairographics.org/) installed in your system:

### Installing Native Dependencies

Paper.js relies on [Node-Canvas](https://github.com/Automattic/node-canvas) for rendering, which in
turn relies on the native libraries [Cairo](https://cairographics.org/) and
[Pango](https://www.pango.org/).

#### Installing Native Dependencies on macOS

Paper.js relies on Node-Canvas for rendering, which in turn relies on Cairo and Pango. The easiest
way to install Cairo is through [Homebrew](https://brew.sh/), by issuing the command:

```
brew install cairo pango
```

Note that currently there is an issue on macOS with Cairo. If the above causes errors, the following
will most likely fix it:

```
PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig/ npm install paper
```

Also, whenever you would like to update the modules, you will need to execute:

```
PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig/ npm update
```

If you keep forgetting about this requirement, or would like to be able to type simple and clean
commands, add this to your `.bash_profile` file:

```
# PKG Config for Pango / Cairo
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig
```

After adding this line, your commands should work in the expected way:

```
npm install paper
npm update
```

#### Installing Native Dependencies on Debian/Ubuntu Linux

```
sudo apt-get install pkg-config libcairo2-dev libpango1.0-dev libssl-dev libjpeg62-dev libgif-dev
```

You might also need to install the build-essential package if you don't usually build from c++
sources:

```
sudo apt-get install build-essential
```

#### Installing Native Dependencies for Electron

In order to build Node-Canvas for use of `paper-jsdom-canvas` in Electron, which is likely to use a
different version of V8 than the Node binary installed in your system, you need to manually specify
the location of Electron’s headers. Follow these steps to do so:

[Electron — Using Native Node Modules](https://electron.atom.io/docs/tutorial/using-native-node-modules/)

#### After Native Dependencies have been installed

You should now be able to install the Paper.js module with jsdom and Canvas rendering from NPM:

```
npm install paper-jsdom-canvas
```

## Development

The main Paper.js source tree is hosted on [GitHub](https://github.com/paperjs/paper.js/). `git` is
required to create a clone of the repository, and can be easily installed through your preferred
package manager on your platform.

### Get the Source

```
git clone --recursive git://github.com/paperjs/paper.js.git
cd paper.js
```

To refresh your clone and fetch changes from origin, run:

```
git fetch origin
```

To update the `jsdoc-toolkit` submodule, used to generate the documentation, run:

```
git submodule update  --init --recursive
```

### Setting Up For Building

Paper.js uses [Gulp.js](https://gulpjs.com/) for building, and has a couple of dependencies as NPM
modules. Read the chapter [Installing Node.js and NPM](#installing-nodejs-and-npm) if you still need
to install these.

Development uses [pnpm](https://pnpm.io/), which needs to be installed too. See
[Installing pnpm](https://pnpm.io/installation) for details.

In order to be able to build Paper.js, after checking out the repository, paper has dependencies
that need to be installed. Install them by issuing the following commands from the Paper.js
directory:

```
pnpm install
```

### Building the Library

The Paper.js sources are distributed across many separate files, organised in subfolders inside the
`src` folder. To compile them all into distributable files, you can run the `build` task:

```
pnpm build
```

You will then find the built library files inside the `dist` folder, named `paper-full.js` and
`paper-core.js`, along with their minified versions. Read more about this in
[Which Version to Use?](#which-version-to-use).

### Running Directly from Separate Source Files

As a handy alternative to building the library after each change to try it out in your scripts,
there is the `load` task, that replaces the built libraries with symbolic links to the
`scrc/load.js` script. This script then load the library directly from all the separate source files
in the `src` folder, through the [Prepro.js](https://github.com/lehni/prepro.js) JavaScript
preprocessing library.

This means you can switch between loading from sources and loading a built library simply by
running.

```
pnpm load
```

And to go back to a built library

```
pnpm build
```

Note that your PaperScripts examples do not need to change, they can keep loading
`dist/paper-full.js`, which will always do the right thing. Note also that `src/load.js` handles
both browsers and Node.js, as supported by Prepro.js.

### Other Build Tasks

Create a final zipped distribution file inside the `dist` folder:

```
pnpm dist
```

### Branch structure

Since the release of version `0.9.22`, Paper.js has adopted aspects of the Git- Flow workflow. All
development is taking place in the [`develop`](https://github.com/paperjs/paper.js/tree/develop)
branch, which is only merged into [`main`](https://github.com/paperjs/paper.js/tree/main) when a new
release occurs.

As of version `0.9.26`, the `dist` folder is excluded on all branches, and the building is now part
of the `pnpm publish` process by way of the `prepublish` script.

We also offer prebuilt versions of the latest state of the `develop` branch on
[`prebuilt/module`](https://github.com/paperjs/paper.js/tree/prebuilt/module) and
[`prebuilt/dist`](https://github.com/paperjs/paper.js/tree/prebuilt/dist).

### Building the Documentation

Similarly to building the library, you can run the `docs` task to build the documentation:

```
pnpm docs
```

Your docs will then be located at `dist/docs`.

### Testing

The tests run with [Vitest](https://vitest.dev/), on Node.js and in Chromium through
[Playwright](https://playwright.dev/), against the library built from the sources:

```
pnpm test
```

To run them only on Node.js, or only in the browser:

```
pnpm test:node
pnpm test:browser
```

The browser tests need Chromium for Playwright, which this installs once:

```
pnpm exec playwright install chromium
```

Once the library is built in `dist`, the tests run against that instead. Select another build than
`paper-full.js` with `PAPER_BUILD`, e.g. `PAPER_BUILD=hosted pnpm test:node`. Vitest also runs
single files, and watches for changes with `pnpm exec vitest`.

The screenshot tests in `test/screenshots` compare what the library draws with reference images.
Rendering differs between systems, so they run in Playwright's Docker image, which needs
[Docker](https://www.docker.com/):

```
pnpm test:screenshots
```

To write new reference images, after adding a test or changing what it draws, and review them in
`test/screenshots/__screenshots__` before committing:

```
pnpm test:screenshots --update
```

### Contributing [![Open Source Helpers](https://camo.githubusercontent.com/b3d693f8660dc383e3b21fef1f27c7ab5e544dd6c620f1c51a982afc12a040ea/68747470733a2f2f7777772e636f64657472696167652e636f6d2f70617065726a732f70617065722e6a732f6261646765732f75736572732e737667)](https://www.codetriage.com/paperjs/paper.js)

The main Paper.js source tree is hosted on GitHub, thus you should create a fork of the repository
in which you perform development. See <https://help.github.com/articles/fork-a-repo/>.

We prefer that you send a
[pull request on GitHub](https://help.github.com/articles/about-pull-requests/) which will then be
merged into the official main line repository.

Also, in your first contribution, add yourself to the end of `AUTHORS.md` (which of course is
optional).

In addition to contributing code you can also triage issues which may include reproducing bug
reports or asking for vital information, such as version numbers or reproduction instructions. If
you would like to start triaging issues, one easy way to get started is to
[subscribe to paper.js on CodeTriage](https://www.codetriage.com/paperjs/paper.js).

**Get the source (for contributing):**

If you want to contribute to the project you will have to
[make a fork](https://help.github.com/articles/fork-a-repo/). Then do this:

```
git clone --recursive git@github.com:yourusername/paper.js.git
cd paper.js
git remote add upstream git@github.com:paperjs/paper.js.git
```

To then fetch changes from upstream, run

```
git fetch upstream
```

#### Creating and Submitting a Patch

As mentioned above, we prefer that you send a
[pull request](https://help.github.com/articles/about-pull-requests/) on GitHub:

1.  Create a fork of the upstream repository by visiting <https://github.com/paperjs/paper.js/fork>.
    If you feel insecure, here's a great guide: <https://help.github.com/articles/fork-a-repo/>

2.  Clone of your repository: `git clone https://yourusername@github.com/yourusername/paper.js.git`

3.  This is important: Create a so-called _topic branch_ based on the `develop` branch:
    `git checkout -tb name-of-my-patch develop` where `name-of-my-patch` is a short but descriptive
    name of the patch you're about to create. Don't worry about the perfect name though -- you can
    change this name at any time later on.

4.  Hack! Make your changes, additions, etc., and describe them for the changelog in a file of their
    own in `changelog/unreleased`, see its
    [README](./paperjs-paper.js-blob-develop-changelog-unreleased-README.md.md). Commit them then
    push them to your GitHub fork: `git push origin name-of-my-patch`

5.  Send a pull request to the upstream repository's owner by visiting your repository's site at
    GitHub (i.e. <https://github.com/yourusername/paper.js>) and press the "Pull Request" button.
    Make sure you are creating the pull request to the `develop` branch, not the `main` branch.
    Here's a good guide on pull requests: <https://help.github.com/articles/about-pull-requests/>

##### Use one topic branch per feature:

Don't mix different kinds of patches in the same branch. Instead, merge them all together into your
`develop` branch (or develop everything in your `develop` branch and then cherry-pick-and-merge into
the different topic branches). Git provides for an extremely flexible workflow, which in many ways
causes more confusion than it helps you when new to collaborative software development. The guides
provided by GitHub at <https://help.github.com/> are a really good starting point and reference. If
you are fixing an issue, a convenient way to name the branch is to use the issue number as a prefix,
like this: `git checkout -tb issue-937-feature-add-text-styling`.

For a list of authors and contributors, please see
[AUTHORS](https://github.com/paperjs/paper.js/blob/main/AUTHORS.md).

## License

Distributed under the MIT license. See
[LICENSE](https://github.com/paperjs/paper.js/blob/main/LICENSE.txt) for details.

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fpaperjs%2Fpaper.js.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fpaperjs%2Fpaper.js
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=paperjs%2Fpaper.js.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=paperjs%2Fpaper.js
- [paperjs](./paperjs.md) - source: /paperjs
- [paper.js](./paperjs-paper.js.md) - source: /paperjs/paper.js
- [Issues 24](./paperjs-paper.js-issues.md) - source: /paperjs/paper.js/issues
- [Pull requests 1](./paperjs-paper.js-pulls.md) - source: /paperjs/paper.js/pulls
- [Actions](./paperjs-paper.js-actions.md) - source: /paperjs/paper.js/actions
- [Projects](./paperjs-paper.js-projects.md) - source: /paperjs/paper.js/projects
- [Security and quality](./paperjs-paper.js-security.md) - source: /paperjs/paper.js/security
- [Insights](./paperjs-paper.js-pulse.md) - source: /paperjs/paper.js/pulse
- [Notifications](./login?return_to=%2Fpaperjs%2Fpaper.js.md) - source: /login?return_to=%2Fpaperjs%2Fpaper.js
- [@lehni](https://github.com/lehni)
- [@puckey](https://github.com/puckey)
- [paperjs.org](http://paperjs.org)
- [Activity](./paperjs-paper.js-activity.md) - source: /paperjs/paper.js/activity
- [Custom properties](./paperjs-paper.js-custom-properties.md) - source: /paperjs/paper.js/custom-properties
- [1.3k forks](./paperjs-paper.js-forks.md) - source: /paperjs/paper.js/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fpaperjs%2Fpaper.js&report=paperjs+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fpaperjs%2Fpaper.js&report=paperjs+%28user%29
- [97 Branches](./paperjs-paper.js-branches.md) - source: /paperjs/paper.js/branches
- [71 Tags](./paperjs-paper.js-tags.md) - source: /paperjs/paper.js/tags
- [/lehni](./lehni.md) - source: /lehni
- [lehni](./paperjs-paper.js-commits?author=lehni.md) - source: /paperjs/paper.js/commits?author=lehni
- [Hosted: Mark the changes of children reordered other than by inserts](./paperjs-paper.js-commit-357f0dc34b74a9487e669557e3413b89190dff81.md) - source: /paperjs/paper.js/commit/357f0dc34b74a9487e669557e3413b89190dff81
- [7,741 Commits](./paperjs-paper.js-commits-develop.md) - source: /paperjs/paper.js/commits/develop/
- [.github](./paperjs-paper.js-tree-develop-.github.md) - source: /paperjs/paper.js/tree/develop/.github
- [Tests: Add screenshots of text items](./paperjs-paper.js-commit-f4051abb109b0a90a2e09ac70a37adc29d01a163.md) - source: /paperjs/paper.js/commit/f4051abb109b0a90a2e09ac70a37adc29d01a163
- [.husky](./paperjs-paper.js-tree-develop-.husky.md) - source: /paperjs/paper.js/tree/develop/.husky
- [Check the branch in the pre-push hook itself](./paperjs-paper.js-commit-cf80b06a06a3601af5665d5b02d385796699b868.md) - source: /paperjs/paper.js/commit/cf80b06a06a3601af5665d5b02d385796699b868
- [.vscode](./paperjs-paper.js-tree-develop-.vscode.md) - source: /paperjs/paper.js/tree/develop/.vscode
- [Switch from Yarn to pnpm](./paperjs-paper.js-commit-531abb3c1453e07e092a2fa40c26858b72d8ead4.md) - source: /paperjs/paper.js/commit/531abb3c1453e07e092a2fa40c26858b72d8ead4
- [changelog/ unreleased](./paperjs-paper.js-tree-develop-changelog-unreleased.md) - source: /paperjs/paper.js/tree/develop/changelog/unreleased
- [Run the library in strict mode](./paperjs-paper.js-commit-fd642d2253a35d3580bea5b703a2a965c1ad31cb.md) - source: /paperjs/paper.js/commit/fd642d2253a35d3580bea5b703a2a965c1ad31cb
- [dist](./paperjs-paper.js-tree-develop-dist.md) - source: /paperjs/paper.js/tree/develop/dist
- [Switch back to load.js versions on develop branch.](./paperjs-paper.js-commit-dc314cc803ed20a2336b08010f045c81cdffe5e2.md) - source: /paperjs/paper.js/commit/dc314cc803ed20a2336b08010f045c81cdffe5e2
- [examples](./paperjs-paper.js-tree-develop-examples.md) - source: /paperjs/paper.js/tree/develop/examples
- [Effect: Rename title to label](./paperjs-paper.js-commit-07c15f6aac783621c023031ffd55075c0a727e79.md) - source: /paperjs/paper.js/commit/07c15f6aac783621c023031ffd55075c0a727e79
- [gulp](./paperjs-paper.js-tree-develop-gulp.md) - source: /paperjs/paper.js/tree/develop/gulp
- [Add pattern colors through PatternDefinition](./paperjs-paper.js-commit-758ad0f2259a4f43ab41810b8c8a8e3777ccb24c.md) - source: /paperjs/paper.js/commit/758ad0f2259a4f43ab41810b8c8a8e3777ccb24c
- [packages](./paperjs-paper.js-tree-develop-packages.md) - source: /paperjs/paper.js/tree/develop/packages
- [Release version 0.16.0](./paperjs-paper.js-commit-b40ff9d3c76d59f497f808d0d31f73a98a644d8e.md) - source: /paperjs/paper.js/commit/b40ff9d3c76d59f497f808d0d31f73a98a644d8e
- [projects](./paperjs-paper.js-tree-develop-projects.md) - source: /paperjs/paper.js/tree/develop/projects
- [Introduce paper-jsdom and paper-jsdom-canvas submodules.](./paperjs-paper.js-commit-2bac4e71e03fc8a481d060258af968a4f66cdae0.md) - source: /paperjs/paper.js/commit/2bac4e71e03fc8a481d060258af968a4f66cdae0
- [src](./paperjs-paper.js-tree-develop-src.md) - source: /paperjs/paper.js/tree/develop/src
- [test](./paperjs-paper.js-tree-develop-test.md) - source: /paperjs/paper.js/tree/develop/test
- [.editorconfig](./paperjs-paper.js-blob-develop-.editorconfig.md) - source: /paperjs/paper.js/blob/develop/.editorconfig
- [Tests: Move from QUnit to Vitest, on Node and in Chromium](./paperjs-paper.js-commit-fa21f6fd1da31a5e2ccfe19a1c92d991b5302fef.md) - source: /paperjs/paper.js/commit/fa21f6fd1da31a5e2ccfe19a1c92d991b5302fef
- [.gitignore](./paperjs-paper.js-blob-develop-.gitignore.md) - source: /paperjs/paper.js/blob/develop/.gitignore
- [.gitmodules](./paperjs-paper.js-blob-develop-.gitmodules.md) - source: /paperjs/paper.js/blob/develop/.gitmodules
- [Switch from submodules to workspace packages](./paperjs-paper.js-commit-70bf1876cd2fea8598bb981c2ee64479e104522f.md) - source: /paperjs/paper.js/commit/70bf1876cd2fea8598bb981c2ee64479e104522f
- [.jshintrc](./paperjs-paper.js-blob-develop-.jshintrc.md) - source: /paperjs/paper.js/blob/develop/.jshintrc
- [Use == false instead of === false for all options that default to…](./paperjs-paper.js-commit-ffa7e16f482c0f6ad8d2df493d2b26def6b3b452.md) - source: /paperjs/paper.js/commit/ffa7e16f482c0f6ad8d2df493d2b26def6b3b452
- [.nvmrc](./paperjs-paper.js-blob-develop-.nvmrc.md) - source: /paperjs/paper.js/blob/develop/.nvmrc
- [Node.js: Use Node 24 in .nvmrc, as in CI](./paperjs-paper.js-commit-73667ece10a07d530818cb3814a487d474b882c3.md) - source: /paperjs/paper.js/commit/73667ece10a07d530818cb3814a487d474b882c3
- [.prettierignore](./paperjs-paper.js-blob-develop-.prettierignore.md) - source: /paperjs/paper.js/blob/develop/.prettierignore
- [Limit ESLint and Prettier to the tests](./paperjs-paper.js-commit-b81fe6fcb9b0d8b0912544c5daf5bda1353bef2b.md) - source: /paperjs/paper.js/commit/b81fe6fcb9b0d8b0912544c5daf5bda1353bef2b
- [.tm_properties](./paperjs-paper.js-blob-develop-.tm_properties.md) - source: /paperjs/paper.js/blob/develop/.tm_properties
- [Turn off invisible spaces in TextMate2.](./paperjs-paper.js-commit-383bed4d05e6de284081b8007f45b10770744980.md) - source: /paperjs/paper.js/commit/383bed4d05e6de284081b8007f45b10770744980
- [AUTHORS.md](./paperjs-paper.js-blob-develop-AUTHORS.md.md) - source: /paperjs/paper.js/blob/develop/AUTHORS.md
- [Update year, author email addresses and links](./paperjs-paper.js-commit-db82f41151be5cd4a347ab368ac093c633551acf.md) - source: /paperjs/paper.js/commit/db82f41151be5cd4a347ab368ac093c633551acf
- [CHANGELOG.md](./paperjs-paper.js-blob-develop-CHANGELOG.md.md) - source: /paperjs/paper.js/blob/develop/CHANGELOG.md
- [Move unreleased changelog entries out of 0.16.0](./paperjs-paper.js-commit-6f0c52b93a6ff1f4bb0edb07a99b3ddba724d9b3.md) - source: /paperjs/paper.js/commit/6f0c52b93a6ff1f4bb0edb07a99b3ddba724d9b3
- [LICENSE.txt](./paperjs-paper.js-blob-develop-LICENSE.txt.md) - source: /paperjs/paper.js/blob/develop/LICENSE.txt
- [README.md](./paperjs-paper.js-blob-develop-README.md.md) - source: /paperjs/paper.js/blob/develop/README.md
- [RULES.md](./paperjs-paper.js-blob-develop-RULES.md.md) - source: /paperjs/paper.js/blob/develop/RULES.md
- [Add .github templates](./paperjs-paper.js-commit-09e146eba84747a54b649c5aafdc59e61e138596.md) - source: /paperjs/paper.js/commit/09e146eba84747a54b649c5aafdc59e61e138596
- [bower.json](./paperjs-paper.js-blob-develop-bower.json.md) - source: /paperjs/paper.js/blob/develop/bower.json
- [CI: Replace Travis with GitHub Actions](./paperjs-paper.js-commit-dfd147ad813441e0892f78698242688980d7c7a8.md) - source: /paperjs/paper.js/commit/dfd147ad813441e0892f78698242688980d7c7a8
- [eslint.config.mjs](./paperjs-paper.js-blob-develop-eslint.config.mjs.md) - source: /paperjs/paper.js/blob/develop/eslint.config.mjs
- [gulpfile.js](./paperjs-paper.js-blob-develop-gulpfile.js.md) - source: /paperjs/paper.js/blob/develop/gulpfile.js
- [package.json](./paperjs-paper.js-blob-develop-package.json.md) - source: /paperjs/paper.js/blob/develop/package.json
- [Node.js: Map the files to an empty file in the browser field](./paperjs-paper.js-commit-6035490faf906eb666a17007473fe403ab8239a4.md) - source: /paperjs/paper.js/commit/6035490faf906eb666a17007473fe403ab8239a4
- [pnpm-lock.yaml](./paperjs-paper.js-blob-develop-pnpm-lock.yaml.md) - source: /paperjs/paper.js/blob/develop/pnpm-lock.yaml
- [pnpm-workspace.yaml](./paperjs-paper.js-blob-develop-pnpm-workspace.yaml.md) - source: /paperjs/paper.js/blob/develop/pnpm-workspace.yaml
- [Drop PhantomJS through a pnpm override](./paperjs-paper.js-commit-53553bac09d393f2ba259dfb5cb31858484d20ac.md) - source: /paperjs/paper.js/commit/53553bac09d393f2ba259dfb5cb31858484d20ac
- [prettier.config.mjs](./paperjs-paper.js-blob-develop-prettier.config.mjs.md) - source: /paperjs/paper.js/blob/develop/prettier.config.mjs
- [vitest.config.mjs](./paperjs-paper.js-blob-develop-vitest.config.mjs.md) - source: /paperjs/paper.js/blob/develop/vitest.config.mjs
- [Tests: Add screenshots of drawing and SVG import](./paperjs-paper.js-commit-379280bde077f264708e7011e052e04a0abbaaa3.md) - source: /paperjs/paper.js/commit/379280bde077f264708e7011e052e04a0abbaaa3
- [https://github.com/paperjs/paper.js/actions/workflows/ci.yml](https://github.com/paperjs/paper.js/actions/workflows/ci.yml)
- [https://www.npmjs.com/package/paper](https://www.npmjs.com/package/paper)
- [http://paperjs.org/download/](http://paperjs.org/download/)
- [http://paperjs.org/](http://paperjs.org/)
- [https://stackoverflow.com/questions/tagged/paperjs](https://stackoverflow.com/questions/tagged/paperjs)
- [https://groups.google.com/group/paperjs](https://groups.google.com/group/paperjs)
- [https://github.com/paperjs/paper.js](https://github.com/paperjs/paper.js)
- [@paperjs](https://twitter.com/paperjs)
- [prebuilt/module](https://github.com/paperjs/paper.js/tree/prebuilt/module)
- [prebuilt/dist](https://github.com/paperjs/paper.js/tree/prebuilt/dist)
- [Node.js Package Manager (NPM)](https://www.npmjs.com/)
- [Homebrew](https://brew.sh/)
- [https://treehouse.github.io/installation-guides/mac/node-mac.html](https://treehouse.github.io/installation-guides/mac/node-mac.html)
- [NVM](https://github.com/creationix/nvm)
- [https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/)
- [https://nodejs.org/download/](https://nodejs.org/download/)
- [jsdom](https://github.com/tmpvar/jsdom)
- [Node-Canvas](https://github.com/Automattic/node-canvas)
- [Cairo Graphics library](https://cairographics.org/)
- [Pango](https://www.pango.org/)
- [Electron — Using Native Node Modules](https://electron.atom.io/docs/tutorial/using-native-node-modules/)
- [GitHub](https://github.com/paperjs/paper.js/)
- [Gulp.js](https://gulpjs.com/)
- [pnpm](https://pnpm.io/)
- [Installing pnpm](https://pnpm.io/installation)
- [Prepro.js](https://github.com/lehni/prepro.js)
- [develop](https://github.com/paperjs/paper.js/tree/develop)
- [main](https://github.com/paperjs/paper.js/tree/main)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Docker](https://www.docker.com/)
- [https://www.codetriage.com/paperjs/paper.js](https://www.codetriage.com/paperjs/paper.js)
- [https://help.github.com/articles/fork-a-repo/](https://help.github.com/articles/fork-a-repo/)
- [pull request on GitHub](https://help.github.com/articles/about-pull-requests/)
- [https://github.com/paperjs/paper.js/fork](https://github.com/paperjs/paper.js/fork)
- [README](./paperjs-paper.js-blob-develop-changelog-unreleased-README.md.md) - source: /paperjs/paper.js/blob/develop/changelog/unreleased/README.md
- [https://github.com/yourusername/paper.js](https://github.com/yourusername/paper.js)
- [https://help.github.com/](https://help.github.com/)
- [AUTHORS](https://github.com/paperjs/paper.js/blob/main/AUTHORS.md)
- [LICENSE](https://github.com/paperjs/paper.js/blob/main/LICENSE.txt)
- [Releases](./paperjs-paper.js-releases.md) - source: /paperjs/paper.js/releases
- [v0.16.0 Latest Oct 21, 2026](./paperjs-paper.js-releases-tag-v0.16.0.md) - source: /paperjs/paper.js/releases/tag/v0.16.0
- [Contributors](./paperjs-paper.js-graphs-contributors.md) - source: /paperjs/paper.js/graphs/contributors
- [/puckey](./puckey.md) - source: /puckey
- [/hkrish](./hkrish.md) - source: /hkrish
- [/sasensi](./sasensi.md) - source: /sasensi
- [/sapics](./sapics.md) - source: /sapics
- [/iconexperience](./iconexperience.md) - source: /iconexperience
- [/jridgewell](./jridgewell.md) - source: /jridgewell
- [/AWagenheim](./AWagenheim.md) - source: /AWagenheim
- [/jaroles](./jaroles.md) - source: /jaroles
- [/rdworth](./rdworth.md) - source: /rdworth
- [/skierons](./skierons.md) - source: /skierons
- [/megawac](./megawac.md) - source: /megawac
- [/adroitwhiz](./adroitwhiz.md) - source: /adroitwhiz
- [/msand](./msand.md) - source: /msand
- [JavaScript 98.9%](./paperjs-paper.js-search?l=javascript.md) - source: /paperjs/paper.js/search?l=javascript
- [Other 1.1%](./paperjs-paper.js-search?l=Other.md) - source: /paperjs/paper.js/search?l=Other
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
