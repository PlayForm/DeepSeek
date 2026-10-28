[![](https://raw.githubusercontent.com/kieler/elkjs/master/doc/elk_logo_with_text.svg)](https://raw.githubusercontent.com/kieler/elkjs/master/doc/elk_logo_with_text.svg)

[![npm version](https://camo.githubusercontent.com/881744ea51d4edc12a1b01edbb2d2d267b979ec65c8da76eed4107e697bc5100/68747470733a2f2f62616467652e667572792e696f2f6a732f656c6b6a732e737667)](https://badge.fury.io/js/elkjs)

The [Eclipse Layout Kernel (ELK)](https://www.eclipse.org/elk/) implements an infrastructure to connect diagram editors or viewers to automatic layout algorithms. This library takes the layout-relevant part of ELK and makes it available to the JavaScript world. ELK's flagship is a layer-based layout algorithm that is particularly suited for node-link diagrams with an inherent direction and ports (explicit attachment points on a node's border). It is based on the ideas originally introduced by Sugiyama et al. An example can be seen in the screenshot below.

Note that elkjs is not a diagramming framework itself - it computes positions for the elements of a diagram.

elkjs is the successor of [klayjs](https://github.com/kieler/klayjs).

#### Demonstrator


You can see elkjs [live in action](https://rtsys.informatik.uni-kiel.de/elklive/) in conjunction with TypeFox's [sprotty](https://github.com/eclipse/sprotty) diagramming framework. In case elklive happens to be down you can use the published [docker container](https://github.com/kieler/elk-live/pkgs/container/elk-live) to run and host it yourself.

[![](https://raw.githubusercontent.com/kieler/elkjs/master/doc/example_complexRouter.svg)](https://raw.githubusercontent.com/kieler/elkjs/master/doc/example_complexRouter.svg)

# FAQs and Recurring Issues


The following list includes some recurring topics that may have been addressed in issues already:

- [\#100](https://github.com/kieler/elkjs/issues/100), [elk#355](https://github.com/eclipse/elk/issues/355), [elk#627](https://github.com/eclipse/elk/issues/627) - How to consider previous layout results, including

  - dynamic layout, and
  - incrementally adding nodes and edges to an existing layout.

- [elk#315](https://github.com/eclipse/elk/issues/315): Standalone edge routing.

- [\#85](https://github.com/kieler/elkjs/issues/85) elkjs itself is a graph layout engine *only*. In other words, no rendering, styling, etc. is provided.

- [\#127](https://github.com/kieler/elkjs/issues/127), [\#141](https://github.com/kieler/elkjs/issues/141), [\#142](https://github.com/kieler/elkjs/issues/142) - Issues due to the underlying code transpilation by GWT and/or due to the outdated usage of js modules:

  - `g is not defined`,
  - `Can't resolve web-worker`, and
  - general usage as part of react, webpack, etc.
  - [\#6](https://github.com/kieler/elkjs/issues/6) Poor modularization
  - Contributions here are welcome!

# Installation


The latest released version:

npm install elkjs

Development version based on ELK's `master` branch.

npm install elkjs@next

# Releases and Versioning


Releases are partly synchronized with ELK's versions: the minor version number is always the same but the revision number may diverge. For instance, elkjs 0.3.0 equals the functionality of ELK 0.3.0 but elkjs 0.3.2 may be different from ELK 0.3.2. This is necessary as there may be fixes that solely concern elkjs and should be released independently of ELK.

# Files


The library consists of two main files:

- `elk-api.js`: Provides the API and only the API.
- `elk-worker.js`: Provides the code that actually knows how to lay out a graph. This is the file that is generated from ELK's Java code base using GWT.

Two further files are provided:

- `elk.bundled.js`: A bundled version of the two previous files, ready to be dropped into a browser's `<script>` tag. The file is processed by [browserify](http://browserify.org/) and the `ELK` is exposed as a global variable (if run in a browser).
- `main.js`: Main file of the node.js module. Allows to conveniently write `require('elkjs')` instead of composing the files from above.

# Example


A small example using node.js, for further use cases see the next section.

const ELK = require('elkjs')\
const elk = new ELK()\
\
const graph = {\
  id: "root",\
  layoutOptions: { 'elk.algorithm': 'layered' },\
  children: \[\
    { id: "n1", width: 30, height: 30 },\
    { id: "n2", width: 30, height: 30 },\
    { id: "n3", width: 30, height: 30 }\
  \],\
  edges: \[\
    { id: "e1", sources: \[ "n1" \], targets: \[ "n2" \] },\
    { id: "e2", sources: \[ "n1" \], targets: \[ "n3" \] }\
  \]\
}\
\
elk.layout(graph)\
   .then(console.log)\
   .catch(console.error)

Note that in case you get errors, you may want to switch to the non-minified version to get a proper stack trace.

## Layout Options


You can use *layout options* to configure the layout algorithm. For that you attach a `layoutOptions` object to the graph element that holds key/value pairs representing the desired layout options. See, for instance, `root` in the example above. It is possible to only use the suffix of a layout option: `algorithm` instead of `org.eclipse.elk.layered`. However, if the suffix is not unique the layout option may be ignored. To be safe, you should always start the layout options with the `elk.` part. A list of all options and further details of their exact effects is available in [ELK's documentation](http://www.eclipse.org/elk/reference.html).

It is possible to pass global layout options as part of the `layout` method's second argument. The options are then applied to every graph element unless the element specifies the option itself:

elk.layout(graph, {\
  layoutOptions: { ... }\
})

Additionally, `ELK`'s constructor accepts an object with layout options that is used with every `layout` call that does not specify layout options:

const elk = new ELK({\
  defaultLayoutOptions: { ... }\
})

# Usage


Since laying out diagrams can be a time-consuming job (even for the computer), and since we don't want to freeze your UI, Web Workers are supported out of the box. The following examples illustrate how the library can be used either with and without a Web Worker.

## node.js


const ELK = require('elkjs')\
// without web worker\
const elk = new ELK()\
\
elk.layout(graph)\
   .then(console.log)

const ELK = require('elkjs')\
// with web worker\
const elk = new ELK({\
  workerUrl: './node_modules/elkjs/lib/elk-worker.min.js'\
})\
\
elk.layout(graph)\
   .then(console.log)

Since version 10.x, node.js comes with a worker threads implementation that is similar to, but not equal to, a browser's `Worker` class. To ease implementation on our side, we use a library, `web-worker`, that provides a wrapper around node's `worker_threads`, which is API-compatible to a browser's \`Worker. Any other library that provides the standard Web Worker methods should be fine though. The package is not installed automatically to avoid the unnecessary dependency for everyone who is not interested in using a web worker. A warning is raised if one requests a web worker without having installed the package. elkjs falls back to the non-Web Worker version in that case.

## Browser


\<html\>\
  \<script src="./elk.bundled.js"\>\</script\>\
  \<script type="text/javascript"\>\
    const elk = new ELK()\
\
    elk.layout(graph)\
       .then(function(g) {\
         document.body.innerHTML = "\<pre\>" + JSON.stringify(g, null, " ") + "\</pre\>"\
       })\
  \</script\>\
\</html\>

\<html\>\
  \<script src="./elk-api.js"\>\</script\> \<!-- use elk-api.js here! --\>\
  \<script type="text/javascript"\>\
    const elk = new ELK({\
      workerUrl: './elk-worker.js'\
    })\
\
    elk.layout(graph)\
       .then(function(g) {\
         document.body.innerHTML = "\<pre\>" + JSON.stringify(g, null, " ") + "\</pre\>"\
       })\
  \</script\>\
\</html\>

## Typescript


import ELK from 'elkjs/lib/elk.bundled.js'\
const elk = new ELK()\
\
\
import ELK from 'elkjs/lib/elk-api'\
const elk = new ELK({\
  workerUrl: './elk-worker.min.js'\
})

## Debugging


For debugging purposes you may want to use the non-minified versions that are available as well. In this case the non-minified webworker version can be configured like so:

const ELK = require('elkjs/lib/elk-api.js')\
const elk = new ELK({\
    workerFactory: function(url) { // the value of 'url' is irrelevant here\
        const { Worker } = require('elkjs/lib/elk-worker.js') // non-minified\
        return new Worker(url)\
    }\
})

# API


The elkjs library provides a single object: the `ELK`. The `ELK` has a constructor that can be used to construct it:

- `new ELK(options)` - the `ELK` can be fed with options, all of which are optional:
  - `defaultLayoutOptions` - an object with default layout options specified as key/value pairs that are used if no further layout options are passed to the `layout(graph, options)` method (see below). Default: `{}`.
  - `algorithms` - an array of algorithm ids (only the suffix). Default: `[ 'layered', 'stress', 'mrtree', 'radial', 'force', 'disco' ]`. Note that the `box`, `fixed`, and `random` layouters are always included.
  - `workerUrl` - a path to the `elk-worker.js` script. As a consequence the `ELK` will use a Web Worker to execute the layout. Default: `undefined`.

Apart from that the `ELK` offers the following methods:

- `layout(graph, options)`
  - `graph` - the graph to be laid out in [ELK JSON](http://www.eclipse.org/elk/documentation/tooldevelopers/graphdatastructure/jsonformat.html). Mandatory!
  - `options` - a configuration object. Optional.
    - `layoutOptions`: its most important purpose is to pass *global* layout options. That is, layout options that are applied to every graph element unless the element specifies the option itself.
    - `logging`: boolean (*since 0.6.0*). Whether logging information shall be passed back as part of the laid out graph. `false` by default.
    - `measureExecutionTime`: boolean (*since 0.6.0*). Whether execution time (in seconds) information shall be passed back as part of the laid out graph. `false` by default.
  - returns a `Promise`, which passes either the laid out graph on success or a (hopefully helpful) error on failure.
- `knownLayoutOptions()`
  - returns an array of of known layout options. For each option additional information such as its `id` and `group` is given.
- `knownLayoutAlgorithms()`
  - returns an array of registered layout algorithms (see above) alongside further information about each algorithm.
- `knownLayoutCategories()`
  - returns an array of registered layout categories.
- `terminateWorker()` - in case a Web Worker is used, the worker's `terminate()` method is called.

The three methods starting with `known` basically return information that, in the Java world, would be retrieved from the [`LayoutMetaDataService`](http://www.eclipse.org/elk/documentation/algorithmdevelopers/metadatalanguage.html).

# Logging and Execution Times


(*Since 0.6.0*)

ELK provides some means to log debug information during layout algorithm execution. The details can be found in the [*Algorithm Debugging*](https://www.eclipse.org/elk/documentation/algorithmdevelopers/algorithmdebugging.html) section of ELK's documentation. Not all of it is available in elkjs though, for instance, it is not possible to save intermediate results of the laid out graphs. Furthermore, while internally execution time is measured in *nanoseconds* on the Java side, in elkjs we have to resort to *milliseconds*. Note that the returned execution times are in seconds. For small graphs this may often result in execution times being reported as `0`.

See below an example call and the example output.

elk.layout(simpleGraph, {\
    layoutOptions: {\
        'algorithm': 'layered'\
    },\
    logging: true,\
    measureExecutionTime: true\
})

{\
  "id": "root",\
  "children": \[ ... \],\
  "edges": \[ ... \],\
  "logging": {\
    "name": "Recursive Graph Layout",\
    "executionTime": 0.000096,\
    "children": \[ {\
      "name": "Layered layout",\
      "logs": \[\
        "ELK Layered uses the following 17 modules:",\
        "   Slot 01: org.eclipse.elk.alg.layered.p1cycles.GreedyCycleBreaker",\
            \[ ... \]\
        "   Slot 16: org.eclipse.elk.alg.layered.intermediate.ReversedEdgeRestorer"\
      \],\
      "executionTime": 0.000072,\
      "children": \[ { "name": "Greedy cycle removal", "executionTime": 0.000002 },\
                      \[ ... \]\
                    { "name": "Restoring reversed edges", "executionTime": 0 } \]\
    } \]\
  }\
}

# Building


[![Open in Gitpod](https://camo.githubusercontent.com/6a4edb76a7e92e0faad09a11e42cba7c39803ee6723f8cb1b801f91113d59695/68747470733a2f2f676974706f642e696f2f627574746f6e2f6f70656e2d696e2d676974706f642e737667)](https://gitpod.io/#https://github.com/kieler/elkjs)

For building, a checkout of the [ELK](https://github.com/eclipse/elk) repository is required and should be located in the same directory as the checkout of this repository. Like so:

```
some_dir/
 ├── elkjs
 └── elk
```

npm install\
npm run build

For a new release, the following version numbers have to be changed:

- `version` in `package.json`,
- `melk` in `build.gradle`, and
- don't forget to checkout the correct release tag of ELK's repository.

Afterwards you can find the created files in the `lib` folder.

Current procedure

git checkout -b releases/0.x.x\
\# Check that the version numbers are correct, if necessary update versions and commit the changes\
npm install\
npm run build\
npm run test\
\# Add ./lib/ directory and commit\
git tag 0.x.x\
\# Push release branch and tags to remote\
git push --tags --set-upstream origin releases/0.x.x\
\# Create a new release on Github for the new tag and afterwards publish to npm\
Once the release is published on Github, the release on npm will be automatically triggered

Afterwards the following version numbers have to be changed to the next release number:

- `version` in `package.json`,
- `melk` in `build.gradle`.

## Incorrect npm tags


Incorrectly tagged versions on npm can be updated with `npm dist-tag add elkjs@<version> <latest/next>`.

# Links


In the following a list of asorted links to other projects and sites that may prove helpful:

- [Execution time comparison to Java ELK](https://github.com/kieler/elk-speed)
- How to specify [node label placement](http://kieler.github.io/klayjs-d3/examples/node_labels/)
- How to enforce certain [node positioning](http://kieler.github.io/klayjs-d3/examples/interactive/) (topological)

# Example Users of elkjs


- [mermaid](https://github.com/mermaid-js/mermaid) - A markdown inspired diagramming tool
- Schematics
  - [netlistsvg](https://github.com/nturley/netlistsvg) - electronic and gate level schematics as SVG
  - [d3-hwschematic](https://github.com/Nic30/d3-hwschematic) - interactive digital circuit analysis and documentation, particularly for FPGA-based designs
- Cytoscape [adapter](https://github.com/cytoscape/cytoscape.js-elk)
- [reaflow](https://reaflow.dev) - Node-based editor built on elkjs in React
- [reactflow](https://reactflow.dev) - React component for building node-based editors and interactive diagrams
- Wrapping elkjs into a [docker-based microservice](https://github.com/elbosso/elkjsmicroservice)
- [sprotty](https://github.com/eclipse/sprotty) - A diagramming framework
- [Eclipse 4diac](https://www.fordiac.org)
- [capellambse-context-diagrams](https://github.com/DSD-DBS/capellambse-context-diagrams) - Generating systems engineering context diagrams for [Capella](https://www.eclipse.org/capella/) in Python
- Used to layout the [dataflow viewer](https://github.com/vega/editor/pull/1023) in the [Vega Editor](https://vega.github.io/editor/#/)
- [CatColab](https://catcolab.org/) - a collaborative environment for formal, interoperable, conceptual modeling

Note: We are happy to extend this list further, so please contact us if you have a project to add

# Thanks


- [@automata](https://github.com/automata) for the very first `klayjs` version
- [@aranega](https://github.com/aranega) for making emfgwt work for us
- [@EyMaddis](https://github.com/EyMaddis) for valuable API discussions
- The team working on the layout algorithms
  - [@spoenemann](https://github.com/spoenemann)
  - [@le-cds](https://github.com/le-cds)
  - [@uruuru](https://github.com/uruuru)
  - [@eNBeWe](https://github.com/eNBeWe)
  - the vast number of students that contributed to ELK

<!--
## Source links

- [/](./index.md) - source: /
- [/login?return_to=https%3A%2F%2Fgithub.com%2Fkieler%2Felkjs](./login?return_to=https%3A%2F%2Fgithub.com%2Fkieler%2Felkjs.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fkieler%2Felkjs
- [GitHub Repository hosting, code review, and collaboration](https://github.com/platform)
- [Copilot AI coding agent for tasks, projects and automated work](https://github.com/features/copilot)
- [Actions CI/CD and automation](https://github.com/features/actions)
- [Code Quality Quality analysis, fixes, and enforcement](https://github.com/features/code-quality)
- [Codespaces Cloud development environments](https://github.com/features/codespaces)
- [Code Security Vulnerability detection and remediation](https://github.com/security/advanced-security/code-security)
- [Secret Protection Secret scanning and leak prevention](https://github.com/security/advanced-security/secret-protection)
- [All Features](https://github.com/features)
- [Documentation](https://docs.github.com/en)
- [Training](https://learn.github.com/skills)
- [Certifications](https://learn.github.com/credentials)
- [Build with Copilot](https://github.com/features/ai)
- [Customize Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-copilot-overview)
- [Integrations](https://github.com/marketplace)
- [Trending repos](https://github.com/trending)
- [GitHub Sponsors](https://github.com/open-source/sponsors)
- [Events](https://github.com/resources/events)
- [Changelog Your source for the latest features, improvements, and fixes across GitHub products, all i](https://github.blog/changelog/)
- [Enterprises](https://github.com/enterprise)
- [Team](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [Why GitHub](https://github.com/why-github)
- [Customer Stories](https://github.com/customer-stories)
- [Business insights](https://github.com/solutions/executive-insights)
- [Trust Center](https://github.com/trust-center)
- [GitHub Advanced Security Enterprise-grade code security](https://github.com/security/advanced-security)
- [Copilot for business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Resource center](https://github.com/resources)
- [Blog](https://github.blog/)
- [Community Forum](https://github.com/orgs/community/discussions)
- [Customer support](https://help.github.com/)
- [GitHub Status](https://www.githubstatus.com/)
- [About](https://github.com/about)
- [Partners](https://github.com/partners)
- [GitHub Universe The event for developers, by developers — talks, workshops, and what’s next for GitH](https://githubuniverse.com/)
- [Pricing](https://github.com/pricing)
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=kieler%2Felkjs.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=kieler%2Felkjs
- [kieler](./kieler.md) - source: /kieler
- [elkjs](./kieler-elkjs.md) - source: /kieler/elkjs
- [Issues 92](./kieler-elkjs-issues.md) - source: /kieler/elkjs/issues
- [Pull requests 6](./kieler-elkjs-pulls.md) - source: /kieler/elkjs/pulls
- [Actions](./kieler-elkjs-actions.md) - source: /kieler/elkjs/actions
- [Projects](./kieler-elkjs-projects.md) - source: /kieler/elkjs/projects
- [Security and quality](./kieler-elkjs-security.md) - source: /kieler/elkjs/security
- [Insights](./kieler-elkjs-pulse.md) - source: /kieler/elkjs/pulse
- [Notifications](./login?return_to=%2Fkieler%2Felkjs.md) - source: /login?return_to=%2Fkieler%2Felkjs
- [diagram-layout](./topics-diagram-layout.md) - source: /topics/diagram-layout
- [graph-layout](./topics-graph-layout.md) - source: /topics/graph-layout
- [layered-layout](./topics-layered-layout.md) - source: /topics/layered-layout
- [layout-algorithm](./topics-layout-algorithm.md) - source: /topics/layout-algorithm
- [Activity](./kieler-elkjs-activity.md) - source: /kieler/elkjs/activity
- [Custom properties](./kieler-elkjs-custom-properties.md) - source: /kieler/elkjs/custom-properties
- [127 forks](./kieler-elkjs-forks.md) - source: /kieler/elkjs/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fkieler%2Felkjs&report=kieler+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fkieler%2Felkjs&report=kieler+%28user%29
- [46 Branches](./kieler-elkjs-branches.md) - source: /kieler/elkjs/branches
- [21 Tags](./kieler-elkjs-tags.md) - source: /kieler/elkjs/tags
- [/soerendomroes](./soerendomroes.md) - source: /soerendomroes
- [soerendomroes](./kieler-elkjs-commits?author=soerendomroes.md) - source: /kieler/elkjs/commits?author=soerendomroes
- [Merge pull request](./kieler-elkjs-commit-bddee3a807b5ff6324a1f1af79d1f95105637458.md) - source: /kieler/elkjs/commit/bddee3a807b5ff6324a1f1af79d1f95105637458
- [#406](https://github.com/kieler/elkjs/pull/406)
- [246 Commits](./kieler-elkjs-commits-master.md) - source: /kieler/elkjs/commits/master/
- [.github](./kieler-elkjs-tree-master-.github.md) - source: /kieler/elkjs/tree/master/.github
- [Update .github/workflows/ci.yml](./kieler-elkjs-commit-0cd2bb4efe761e8fdbef07c76950214ae5134a0f.md) - source: /kieler/elkjs/commit/0cd2bb4efe761e8fdbef07c76950214ae5134a0f
- [doc](./kieler-elkjs-tree-master-doc.md) - source: /kieler/elkjs/tree/master/doc
- [fix svg for readme](./kieler-elkjs-commit-debda185454caa835c7d60ed00ea1d756e43be86.md) - source: /kieler/elkjs/commit/debda185454caa835c7d60ed00ea1d756e43be86
- [gradle/ wrapper](./kieler-elkjs-tree-master-gradle-wrapper.md) - source: /kieler/elkjs/tree/master/gradle/wrapper
- [Modernize toolchain to build on JDK 21](./kieler-elkjs-commit-a83a9ec087112df5e26be2915803c4fb4cae4578.md) - source: /kieler/elkjs/commit/a83a9ec087112df5e26be2915803c4fb4cae4578
- [src](./kieler-elkjs-tree-master-src.md) - source: /kieler/elkjs/tree/master/src
- [Merge pull request](./kieler-elkjs-commit-9e76a96f6cc6ccbe72a9e7920b618ca9faa39ef9.md) - source: /kieler/elkjs/commit/9e76a96f6cc6ccbe72a9e7920b618ca9faa39ef9
- [#378](https://github.com/kieler/elkjs/pull/378)
- [test](./kieler-elkjs-tree-master-test.md) - source: /kieler/elkjs/tree/master/test
- [unify formatting of license headers](./kieler-elkjs-commit-89affeddd598baf260a6402cf699a5eb2d5ba9c5.md) - source: /kieler/elkjs/commit/89affeddd598baf260a6402cf699a5eb2d5ba9c5
- [typings](./kieler-elkjs-tree-master-typings.md) - source: /kieler/elkjs/tree/master/typings
- [.babelrc](./kieler-elkjs-blob-master-.babelrc.md) - source: /kieler/elkjs/blob/master/.babelrc
- [update to newest babel to fix vulnerabilities (](./kieler-elkjs-commit-dc252061f1fe9073bd1e6ad70dc7b8cd51b9dc80.md) - source: /kieler/elkjs/commit/dc252061f1fe9073bd1e6ad70dc7b8cd51b9dc80
- [#287](https://github.com/kieler/elkjs/pull/287)
- [.gitignore](./kieler-elkjs-blob-master-.gitignore.md) - source: /kieler/elkjs/blob/master/.gitignore
- [Use project properties for elk and emfgwt repos](./kieler-elkjs-commit-320e566fe811d177bca98d4f5ce65a33b137a94f.md) - source: /kieler/elkjs/commit/320e566fe811d177bca98d4f5ce65a33b137a94f
- [.gitpod.yml](./kieler-elkjs-blob-master-.gitpod.yml.md) - source: /kieler/elkjs/blob/master/.gitpod.yml
- [Added Gitpod configuration](./kieler-elkjs-commit-80978032a52c3dd101f315afb348ce8f5e4dcf25.md) - source: /kieler/elkjs/commit/80978032a52c3dd101f315afb348ce8f5e4dcf25
- [LICENSE.md](./kieler-elkjs-blob-master-LICENSE.md.md) - source: /kieler/elkjs/blob/master/LICENSE.md
- [update license and headers to secondary license gpl3](./kieler-elkjs-commit-277085ecc7cf17c1d62bb99b76d5a6a2f0364fff.md) - source: /kieler/elkjs/commit/277085ecc7cf17c1d62bb99b76d5a6a2f0364fff
- [README.md](./kieler-elkjs-blob-master-README.md.md) - source: /kieler/elkjs/blob/master/README.md
- [Add CatColab and mermaid to example users list in README](./kieler-elkjs-commit-722f1a3f63016e64f534a8b445283d4d31a88d0e.md) - source: /kieler/elkjs/commit/722f1a3f63016e64f534a8b445283d4d31a88d0e
- [build.gradle](./kieler-elkjs-blob-master-build.gradle.md) - source: /kieler/elkjs/blob/master/build.gradle
- [Merge pull request](./kieler-elkjs-commit-e12bc69bbb2950cde98fd5e94c22eb96b843317e.md) - source: /kieler/elkjs/commit/e12bc69bbb2950cde98fd5e94c22eb96b843317e
- [#379](https://github.com/kieler/elkjs/pull/379)
- [gradle.properties](./kieler-elkjs-blob-master-gradle.properties.md) - source: /kieler/elkjs/blob/master/gradle.properties
- [Last changes for v0.4.1](./kieler-elkjs-commit-dd3f6aa60e6b967e0f55bf6a6b7a752f745a4053.md) - source: /kieler/elkjs/commit/dd3f6aa60e6b967e0f55bf6a6b7a752f745a4053
- [gradlew](./kieler-elkjs-blob-master-gradlew.md) - source: /kieler/elkjs/blob/master/gradlew
- [Using latest GWT 2.10 and update other versions (](./kieler-elkjs-commit-5b6e18ae99e3b099bc0ff167e985fd791dd40ab3.md) - source: /kieler/elkjs/commit/5b6e18ae99e3b099bc0ff167e985fd791dd40ab3
- [#185](https://github.com/kieler/elkjs/pull/185)
- [gradlew.bat](./kieler-elkjs-blob-master-gradlew.bat.md) - source: /kieler/elkjs/blob/master/gradlew.bat
- [package-lock.json](./kieler-elkjs-blob-master-package-lock.json.md) - source: /kieler/elkjs/blob/master/package-lock.json
- [Merge pull request](./kieler-elkjs-commit-9a2ef6f249cdd325902c10bded548c0877363ccb.md) - source: /kieler/elkjs/commit/9a2ef6f249cdd325902c10bded548c0877363ccb
- [#404](https://github.com/kieler/elkjs/pull/404)
- [package.json](./kieler-elkjs-blob-master-package.json.md) - source: /kieler/elkjs/blob/master/package.json
- [Bump serialize-javascript and mocha](./kieler-elkjs-commit-383320a7502c51ba97d74ea19267064ba581d1c4.md) - source: /kieler/elkjs/commit/383320a7502c51ba97d74ea19267064ba581d1c4
- [https://raw.githubusercontent.com/kieler/elkjs/master/doc/elk_logo_with_text.svg](https://raw.githubusercontent.com/kieler/elkjs/master/doc/elk_logo_with_text.svg)
- [https://badge.fury.io/js/elkjs](https://badge.fury.io/js/elkjs)
- [Eclipse Layout Kernel (ELK)](https://www.eclipse.org/elk/)
- [klayjs](https://github.com/kieler/klayjs)
- [live in action](https://rtsys.informatik.uni-kiel.de/elklive/)
- [sprotty](https://github.com/eclipse/sprotty)
- [docker container](https://github.com/kieler/elk-live/pkgs/container/elk-live)
- [https://raw.githubusercontent.com/kieler/elkjs/master/doc/example_complexRouter.svg](https://raw.githubusercontent.com/kieler/elkjs/master/doc/example_complexRouter.svg)
- [#100](https://github.com/kieler/elkjs/issues/100)
- [elk#355](https://github.com/eclipse/elk/issues/355)
- [elk#627](https://github.com/eclipse/elk/issues/627)
- [elk#315](https://github.com/eclipse/elk/issues/315)
- [#85](https://github.com/kieler/elkjs/issues/85)
- [#127](https://github.com/kieler/elkjs/issues/127)
- [#141](https://github.com/kieler/elkjs/issues/141)
- [#142](https://github.com/kieler/elkjs/issues/142)
- [#6](https://github.com/kieler/elkjs/issues/6)
- [browserify](http://browserify.org/)
- [ELK's documentation](http://www.eclipse.org/elk/reference.html)
- [ELK JSON](http://www.eclipse.org/elk/documentation/tooldevelopers/graphdatastructure/jsonformat.html)
- [LayoutMetaDataService](http://www.eclipse.org/elk/documentation/algorithmdevelopers/metadatalanguage.html)
- [Algorithm Debugging](https://www.eclipse.org/elk/documentation/algorithmdevelopers/algorithmdebugging.html)
- [https://gitpod.io/#https://github.com/kieler/elkjs](https://gitpod.io/#https://github.com/kieler/elkjs)
- [ELK](https://github.com/eclipse/elk)
- [Execution time comparison to Java ELK](https://github.com/kieler/elk-speed)
- [node label placement](http://kieler.github.io/klayjs-d3/examples/node_labels/)
- [node positioning](http://kieler.github.io/klayjs-d3/examples/interactive/)
- [mermaid](https://github.com/mermaid-js/mermaid)
- [netlistsvg](https://github.com/nturley/netlistsvg)
- [d3-hwschematic](https://github.com/Nic30/d3-hwschematic)
- [adapter](https://github.com/cytoscape/cytoscape.js-elk)
- [reaflow](https://reaflow.dev)
- [reactflow](https://reactflow.dev)
- [docker-based microservice](https://github.com/elbosso/elkjsmicroservice)
- [Eclipse 4diac](https://www.fordiac.org)
- [capellambse-context-diagrams](https://github.com/DSD-DBS/capellambse-context-diagrams)
- [Capella](https://www.eclipse.org/capella/)
- [dataflow viewer](https://github.com/vega/editor/pull/1023)
- [Vega Editor](https://vega.github.io/editor/#/)
- [CatColab](https://catcolab.org/)
- [@automata](https://github.com/automata)
- [@aranega](https://github.com/aranega)
- [@EyMaddis](https://github.com/EyMaddis)
- [@spoenemann](https://github.com/spoenemann)
- [@le-cds](https://github.com/le-cds)
- [@uruuru](https://github.com/uruuru)
- [@eNBeWe](https://github.com/eNBeWe)
- [Releases](./kieler-elkjs-releases.md) - source: /kieler/elkjs/releases
- [0.12.1 Latest Oct 28, 2026](./kieler-elkjs-releases-tag-0.12.1.md) - source: /kieler/elkjs/releases/tag/0.12.1
- [Used by](./kieler-elkjs-network-dependents.md) - source: /kieler/elkjs/network/dependents
- [Contributors](./kieler-elkjs-graphs-contributors.md) - source: /kieler/elkjs/graphs/contributors
- [/uruuru](./uruuru.md) - source: /uruuru
- [/Eddykasp](./Eddykasp.md) - source: /Eddykasp
- [/dependabot[bot]](./dependabot[bot].md) - source: /dependabot[bot]
- [/skieffer](./skieffer.md) - source: /skieffer
- [/spoenemann](./spoenemann.md) - source: /spoenemann
- [/tuckergordon](./tuckergordon.md) - source: /tuckergordon
- [/MayCXC](./MayCXC.md) - source: /MayCXC
- [/Copilot](./Copilot.md) - source: /Copilot
- [/akx](./akx.md) - source: /akx
- [/amcdnl](./amcdnl.md) - source: /amcdnl
- [/boogiebug](./boogiebug.md) - source: /boogiebug
- [/johnnyghost](./johnnyghost.md) - source: /johnnyghost
- [/saulshanabrook](./saulshanabrook.md) - source: /saulshanabrook
- [JavaScript 72.3%](./kieler-elkjs-search?l=javascript.md) - source: /kieler/elkjs/search?l=javascript
- [Java 14.6%](./kieler-elkjs-search?l=java.md) - source: /kieler/elkjs/search?l=java
- [HTML 8.9%](./kieler-elkjs-search?l=html.md) - source: /kieler/elkjs/search?l=html
- [Xtend 4.2%](./kieler-elkjs-search?l=xtend.md) - source: /kieler/elkjs/search?l=xtend
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
