[**46** Branches](https://github.com/kieler/elkjs/branches)[](https://github.com/kieler/elkjs/tags)
Go to file
Open more actions menu
[Merge pull request](https://github.com/kieler/elkjs/commit/bddee3a807b5ff6324a1f1af79d1f95105637458) [#406](https://github.com/kieler/elkjs/pull/406) [from kieler/mka/update-ci-actions](https://github.com/kieler/elkjs/commit/bddee3a807b5ff6324a1f1af79d1f95105637458)
Open commit detailsfailure
Oct 28, 2026
[bddee3a](https://github.com/kieler/elkjs/commit/bddee3a807b5ff6324a1f1af79d1f95105637458) · Oct 28, 2026
[246 Commits](https://github.com/kieler/elkjs/commits/master/)
Open commit details
246 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   | [Update .github/workflows/ci.yml](https://github.com/kieler/elkjs/commit/0cd2bb4efe761e8fdbef07c76950214ae5134a0f "Update .github/workflows/ci.yml")  | Oct 28, 2026  |  
|   | Mar 9, 2026  |  
| [gradle/wrapper](https://github.com/kieler/elkjs/tree/master/gradle/wrapper "This path skips through empty directories")  | [gradle/wrapper](https://github.com/kieler/elkjs/tree/master/gradle/wrapper "This path skips through empty directories")  | [Modernize toolchain to build on JDK 21](https://github.com/kieler/elkjs/commit/a83a9ec087112df5e26be2915803c4fb4cae4578 "Modernize toolchain to build on JDK 21

- Bump gradle wrapper from 7.2 \(which does not support Java 21\) to
  8.10 \(stable, Java 21 supported\).
- Bump GWT from 2.11.0 to 2.13.0 \(released Feb 2025; runs on Java
  11-21 and supports Java 12-17 language features\).
- Relax the build.gradle Java gate from \[8, 17\] to \[8, 21\].

This lets the project build on the current LTS without affecting the
language level of the compiled output. Required for the next commit's
xtext-gradle-plugin 4.0.0 bump \(which requires Gradle 8+\).")  | Apr 18, 2026  |  
|  [Merge pull request](https://github.com/kieler/elkjs/commit/9e76a96f6cc6ccbe72a9e7920b618ca9faa39ef9 "Merge pull request #378 from MayCXC/fix/hoist-fakeworker-declaration

Hoist FakeWorker out of conditional") [#378](https://github.com/kieler/elkjs/pull/378) [from MayCXC/fix/hoist-fakeworker-declaration](https://github.com/kieler/elkjs/commit/9e76a96f6cc6ccbe72a9e7920b618ca9faa39ef9 "Merge pull request #378 from MayCXC/fix/hoist-fakeworker-declaration

Hoist FakeWorker out of conditional")  | Aug 5, 2026  |  
| [unify formatting of license headers](https://github.com/kieler/elkjs/commit/89affeddd598baf260a6402cf699a5eb2d5ba9c5 "unify formatting of license headers")  | Jul 8, 2026  |  
|   |   | [unify formatting of license headers](https://github.com/kieler/elkjs/commit/89affeddd598baf260a6402cf699a5eb2d5ba9c5 "unify formatting of license headers")  | Jul 8, 2026  |  
|   |   |  [update to newest babel to fix vulnerabilities (](https://github.com/kieler/elkjs/commit/dc252061f1fe9073bd1e6ad70dc7b8cd51b9dc80 "update to newest babel to fix vulnerabilities \(#287\)")[#287](https://github.com/kieler/elkjs/pull/287)[)](https://github.com/kieler/elkjs/commit/dc252061f1fe9073bd1e6ad70dc7b8cd51b9dc80 "update to newest babel to fix vulnerabilities \(#287\)")  | Jul 5, 2024  |  
|   |   | [Use project properties for elk and emfgwt repos](https://github.com/kieler/elkjs/commit/320e566fe811d177bca98d4f5ce65a33b137a94f "Use project properties for elk and emfgwt repos")  | Jul 12, 2017  |  
|   |   | [Added Gitpod configuration](https://github.com/kieler/elkjs/commit/80978032a52c3dd101f315afb348ce8f5e4dcf25 "Added Gitpod configuration")  | Sep 27, 2019  |  
|   |   | [update license and headers to secondary license gpl3](https://github.com/kieler/elkjs/commit/277085ecc7cf17c1d62bb99b76d5a6a2f0364fff "update license and headers to secondary license gpl3")  | Jul 7, 2026  |  
|   |   | [Add CatColab and mermaid to example users list in README](https://github.com/kieler/elkjs/commit/722f1a3f63016e64f534a8b445283d4d31a88d0e "Add CatColab and mermaid to example users list in README")  | Sep 17, 2026  |  
|   |   |  [Merge pull request](https://github.com/kieler/elkjs/commit/e12bc69bbb2950cde98fd5e94c22eb96b843317e "Merge pull request #379 from MayCXC/fix/issue-291-disco

Restore DisCo by upgrading toolchain to fix #291 race") [#379](https://github.com/kieler/elkjs/pull/379) [from MayCXC/fix/issue-291-disco](https://github.com/kieler/elkjs/commit/e12bc69bbb2950cde98fd5e94c22eb96b843317e "Merge pull request #379 from MayCXC/fix/issue-291-disco

Restore DisCo by upgrading toolchain to fix #291 race")  | Aug 5, 2026  |  
|   |   |   | Aug 11, 2018  |  
|   |   |  [Using latest GWT 2.10 and update other versions (](https://github.com/kieler/elkjs/commit/5b6e18ae99e3b099bc0ff167e985fd791dd40ab3 "Using latest GWT 2.10 and update other versions \(#185\)

* Updated to gradle 7.2 to allow compilation with Java17

* Make build script compatible with gradle 7.x

* Bump GWT to 2.10

* Use latest xtext and guava to allow running java 17

* Test further java and node versions during ci

* Update gwt maven group id")[#185](https://github.com/kieler/elkjs/pull/185)[)](https://github.com/kieler/elkjs/commit/5b6e18ae99e3b099bc0ff167e985fd791dd40ab3 "Using latest GWT 2.10 and update other versions \(#185\)

* Updated to gradle 7.2 to allow compilation with Java17

* Make build script compatible with gradle 7.x

* Bump GWT to 2.10

* Use latest xtext and guava to allow running java 17

* Test further java and node versions during ci

* Update gwt maven group id")  | Nov 17, 2022  |  
|   |   |  [Using latest GWT 2.10 and update other versions (](https://github.com/kieler/elkjs/commit/5b6e18ae99e3b099bc0ff167e985fd791dd40ab3 "Using latest GWT 2.10 and update other versions \(#185\)

* Updated to gradle 7.2 to allow compilation with Java17

* Make build script compatible with gradle 7.x

* Bump GWT to 2.10

* Use latest xtext and guava to allow running java 17

* Test further java and node versions during ci

* Update gwt maven group id")[#185](https://github.com/kieler/elkjs/pull/185)[)](https://github.com/kieler/elkjs/commit/5b6e18ae99e3b099bc0ff167e985fd791dd40ab3 "Using latest GWT 2.10 and update other versions \(#185\)

* Updated to gradle 7.2 to allow compilation with Java17

* Make build script compatible with gradle 7.x

* Bump GWT to 2.10

* Use latest xtext and guava to allow running java 17

* Test further java and node versions during ci

* Update gwt maven group id")  | Nov 17, 2022  |  
|   |   |  [Merge pull request](https://github.com/kieler/elkjs/commit/9a2ef6f249cdd325902c10bded548c0877363ccb "Merge pull request #404 from kieler/dependabot/npm_and_yarn/qs-6.17.0

Bump qs from 6.15.2 to 6.17.0") [#404](https://github.com/kieler/elkjs/pull/404) [from kieler/dependabot/npm_and_yarn/qs-6.17.0](https://github.com/kieler/elkjs/commit/9a2ef6f249cdd325902c10bded548c0877363ccb "Merge pull request #404 from kieler/dependabot/npm_and_yarn/qs-6.17.0

Bump qs from 6.15.2 to 6.17.0")  | Oct 28, 2026  |  
|   |   |   | Sep 9, 2026  |  
| View all files |  
The [Eclipse Layout Kernel (ELK)](https://www.eclipse.org/elk/) implements an infrastructure to connect diagram editors or viewers to automatic layout algorithms. This library takes the layout-relevant part of ELK and makes it available to the JavaScript world. ELK's flagship is a layer-based layout algorithm that is particularly suited for node-link diagrams with an inherent direction and ports (explicit attachment points on a node's border). It is based on the ideas originally introduced by Sugiyama et al. An example can be seen in the screenshot below.
Note that elkjs is not a diagramming framework itself - it computes positions for the elements of a diagram.
elkjs is the successor of [klayjs](https://github.com/kieler/klayjs).
#### Demonstrator
You can see elkjs [live in action](https://rtsys.informatik.uni-kiel.de/elklive/) in conjunction with TypeFox's [sprotty](https://github.com/eclipse/sprotty) diagramming framework. In case elklive happens to be down you can use the published [docker container](https://github.com/kieler/elk-live/pkgs/container/elk-live) to run and host it yourself.
# FAQs and Recurring Issues
The following list includes some recurring topics that may have been addressed in issues already:
  * [#100](https://github.com/kieler/elkjs/issues/100), [elk#355](https://github.com/eclipse/elk/issues/355), [elk#627](https://github.com/eclipse/elk/issues/627) - How to consider previous layout results, including
    * dynamic layout, and
    * incrementally adding nodes and edges to an existing layout.
  * [elk#315](https://github.com/eclipse/elk/issues/315): Standalone edge routing.
  * [#85](https://github.com/kieler/elkjs/issues/85) elkjs itself is a graph layout engine _only_. In other words, no rendering, styling, etc. is provided.
  * [#127](https://github.com/kieler/elkjs/issues/127), [#141](https://github.com/kieler/elkjs/issues/141), [#142](https://github.com/kieler/elkjs/issues/142) - Issues due to the underlying code transpilation by GWT and/or due to the outdated usage of js modules:
    * `g is not defined`,
    * `Can't resolve web-worker`, and
    * general usage as part of react, webpack, etc.
    * [#6](https://github.com/kieler/elkjs/issues/6) Poor modularization
    * Contributions here are welcome!


# Installation
The latest released version:

```
npm install elkjs
```

Development version based on ELK's `master` branch.

```
npm install elkjs@next
```

# Releases and Versioning
Releases are partly synchronized with ELK's versions: the minor version number is always the same but the revision number may diverge. For instance, elkjs 0.3.0 equals the functionality of ELK 0.3.0 but elkjs 0.3.2 may be different from ELK 0.3.2. This is necessary as there may be fixes that solely concern elkjs and should be released independently of ELK.
# Files
The library consists of two main files:
  * `elk-api.js`: Provides the API and only the API.
  * `elk-worker.js`: Provides the code that actually knows how to lay out a graph. This is the file that is generated from ELK's Java code base using GWT.


Two further files are provided:
  * `elk.bundled.js`: A bundled version of the two previous files, ready to be dropped into a browser's `<script>` tag. The file is processed by [browserify](http://browserify.org/) and the `ELK` is exposed as a global variable (if run in a browser).
  * `main.js`: Main file of the node.js module. Allows to conveniently write `require('elkjs')` instead of composing the files from above.


# Example
A small example using node.js, for further use cases see the next section.

```
const ELK = require('elkjs')
const elk = new ELK()

const graph = {
  id: "root",
  layoutOptions: { 'elk.algorithm': 'layered' },
  children: [
    { id: "n1", width: 30, height: 30 },
    { id: "n2", width: 30, height: 30 },
    { id: "n3", width: 30, height: 30 }
  ],
  edges: [
    { id: "e1", sources: [ "n1" ], targets: [ "n2" ] },
    { id: "e2", sources: [ "n1" ], targets: [ "n3" ] }
  ]
}

elk.layout(graph)
   .then(console.log)
   .catch(console.error)
```

Note that in case you get errors, you may want to switch to the non-minified version to get a proper stack trace.
## Layout Options
You can use _layout options_ to configure the layout algorithm. For that you attach a `layoutOptions` object to the graph element that holds key/value pairs representing the desired layout options. See, for instance, `root` in the example above. It is possible to only use the suffix of a layout option: `algorithm` instead of `org.eclipse.elk.layered`. However, if the suffix is not unique the layout option may be ignored. To be safe, you should always start the layout options with the `elk.` part. A list of all options and further details of their exact effects is available in [ELK's documentation](http://www.eclipse.org/elk/reference.html).
It is possible to pass global layout options as part of the `layout` method's second argument. The options are then applied to every graph element unless the element specifies the option itself:

```
elk.layout(graph, {
  layoutOptions: { ... }
})
```

Additionally, `ELK`'s constructor accepts an object with layout options that is used with every `layout` call that does not specify layout options:

```
const elk = new ELK({
  defaultLayoutOptions: { ... }
})
```

# Usage
Since laying out diagrams can be a time-consuming job (even for the computer), and since we don't want to freeze your UI, Web Workers are supported out of the box. The following examples illustrate how the library can be used either with and without a Web Worker.
## node.js

```
const ELK = require('elkjs')
// without web worker
const elk = new ELK()

elk.layout(graph)
   .then(console.log)
```


```
const ELK = require('elkjs')
// with web worker
const elk = new ELK({
  workerUrl: './node_modules/elkjs/lib/elk-worker.min.js'
})

elk.layout(graph)
   .then(console.log)
```

Since version 10.x, node.js comes with a worker threads implementation that is similar to, but not equal to, a browser's `Worker` class. To ease implementation on our side, we use a library, `web-worker`, that provides a wrapper around node's `worker_threads`, which is API-compatible to a browser's `Worker. Any other library that provides the standard Web Worker methods should be fine though. The package is not installed automatically to avoid the unnecessary dependency for everyone who is not interested in using a web worker. A warning is raised if one requests a web worker without having installed the package. elkjs falls back to the non-Web Worker version in that case.
## Browser

```
html
  script src="./elk.bundled.js"</script
  script type="text/javascript"
    const elk = new ELK()

    elk.layout(graph)
       .then(function(g) {
         document.body.innerHTML = "<pre>" + JSON.stringify(g, null, " ") + "</pre>"
       })
  </script
</html
```


```
html
  script src="./elk-api.js"</script <!-- use elk-api.js here! -->
  script type="text/javascript"
    const elk = new ELK({
      workerUrl: './elk-worker.js'
    })

    elk.layout(graph)
       .then(function(g) {
         document.body.innerHTML = "<pre>" + JSON.stringify(g, null, " ") + "</pre>"
       })
  </script
</html
```

## Typescript

```
import ELK from 'elkjs/lib/elk.bundled.js'
const elk = new ELK()


import ELK from 'elkjs/lib/elk-api'
const elk = new ELK({
  workerUrl: './elk-worker.min.js'
})
```

## Debugging
For debugging purposes you may want to use the non-minified versions that are available as well. In this case the non-minified webworker version can be configured like so:

```
const ELK = require('elkjs/lib/elk-api.js')
const elk = new ELK({
    workerFactory: function(url) { // the value of 'url' is irrelevant here
        const { Worker } = require('elkjs/lib/elk-worker.js') // non-minified
        return new Worker(url)
    }
})
```

The elkjs library provides a single object: the `ELK`. The `ELK` has a constructor that can be used to construct it:
  * `new ELK(options)` - the `ELK` can be fed with options, all of which are optional: 
    * `defaultLayoutOptions` - an object with default layout options specified as key/value pairs that are used if no further layout options are passed to the `layout(graph, options)` method (see below). Default: `{}`.
    * `algorithms` - an array of algorithm ids (only the suffix). Default: `[ 'layered', 'stress', 'mrtree', 'radial', 'force', 'disco' ]`. Note that the `box`, `fixed`, and `random` layouters are always included.
    * `workerUrl` - a path to the `elk-worker.js` script. As a consequence the `ELK` will use a Web Worker to execute the layout. Default: `undefined`.


Apart from that the `ELK` offers the following methods:
  * `layout(graph, options)`
    * `graph` - the graph to be laid out in [ELK JSON](http://www.eclipse.org/elk/documentation/tooldevelopers/graphdatastructure/jsonformat.html). Mandatory!
    * `options` - a configuration object. Optional. 
      * `layoutOptions`: its most important purpose is to pass _global_ layout options. That is, layout options that are applied to every graph element unless the element specifies the option itself.
      * `logging`: boolean (_since 0.6.0_). Whether logging information shall be passed back as part of the laid out graph. `false` by default.
      * `measureExecutionTime`: boolean (_since 0.6.0_). Whether execution time (in seconds) information shall be passed back as part of the laid out graph. `false` by default.
    * returns a `Promise`, which passes either the laid out graph on success or a (hopefully helpful) error on failure.
  * `knownLayoutOptions()`
    * returns an array of of known layout options. For each option additional information such as its `id` and `group` is given.
  * `knownLayoutAlgorithms()`
    * returns an array of registered layout algorithms (see above) alongside further information about each algorithm.
  * `knownLayoutCategories()`
    * returns an array of registered layout categories.
  * `terminateWorker()` - in case a Web Worker is used, the worker's `terminate()` method is called.


The three methods starting with `known` basically return information that, in the Java world, would be retrieved from the [`LayoutMetaDataService`](http://www.eclipse.org/elk/documentation/algorithmdevelopers/metadatalanguage.html).
# Logging and Execution Times
(_Since 0.6.0_)
ELK provides some means to log debug information during layout algorithm execution. The details can be found in the [_Algorithm Debugging_](https://www.eclipse.org/elk/documentation/algorithmdevelopers/algorithmdebugging.html) section of ELK's documentation. Not all of it is available in elkjs though, for instance, it is not possible to save intermediate results of the laid out graphs. Furthermore, while internally execution time is measured in _nanoseconds_ on the Java side, in elkjs we have to resort to _milliseconds_. Note that the returned execution times are in seconds. For small graphs this may often result in execution times being reported as `0`.
See below an example call and the example output.

```
elk.layout(simpleGraph, {
    layoutOptions: {
        'algorithm': 'layered'
    },
    logging: true,
    measureExecutionTime: true
})
```


```
{
  "id": "root",
  "children": [ ... ],
  "edges": [ ... ],
  "logging": {
    "name": "Recursive Graph Layout",
    "executionTime": 0.000096,
    "children": [ {
      "name": "Layered layout",
      "logs": [
        "ELK Layered uses the following 17 modules:",
        "   Slot 01: org.eclipse.elk.alg.layered.p1cycles.GreedyCycleBreaker",
            [ ... ]
        "   Slot 16: org.eclipse.elk.alg.layered.intermediate.ReversedEdgeRestorer"
      ],
      "executionTime": 0.000072,
      "children": [ { "name": "Greedy cycle removal", "executionTime": 0.000002 },
                      [ ... ]
                    { "name": "Restoring reversed edges", "executionTime": 0 } ]
    } ]
  }
}
```

# Building
For building, a checkout of the [ELK](https://github.com/eclipse/elk) repository is required and should be located in the same directory as the checkout of this repository. Like so:

```
some_dir/
 ├── elkjs
 └── elk

```


```
npm install
npm run build
```

For a new release, the following version numbers have to be changed:
  * `version` in `package.json`,
  * `melk` in `build.gradle`, and
  * don't forget to checkout the correct release tag of ELK's repository.


Afterwards you can find the created files in the `lib` folder.
Current procedure

```
git checkout -b releases/0.x.x
# Check that the version numbers are correct, if necessary update versions and commit the changes
npm install
npm run build
npm run test
# Add ./lib/ directory and commit
git tag 0.x.x
# Push release branch and tags to remote
git push --tags --set-upstream origin releases/0.x.x
# Create a new release on Github for the new tag and afterwards publish to npm
Once the release is published on Github, the release on npm will be automatically triggered
```

Afterwards the following version numbers have to be changed to the next release number:
  * `version` in `package.json`,
  * `melk` in `build.gradle`.


## Incorrect npm tags
Incorrectly tagged versions on npm can be updated with `npm dist-tag add elkjs@<version> <latest/next>`.
# Links
In the following a list of asorted links to other projects and sites that may prove helpful:
  * [Execution time comparison to Java ELK](https://github.com/kieler/elk-speed)
  * How to specify [node label placement](http://kieler.github.io/klayjs-d3/examples/node_labels/)
  * How to enforce certain [node positioning](http://kieler.github.io/klayjs-d3/examples/interactive/) (topological)


# Example Users of elkjs
  * [mermaid](https://github.com/mermaid-js/mermaid) - A markdown inspired diagramming tool
  * Schematics 
    * [netlistsvg](https://github.com/nturley/netlistsvg) - electronic and gate level schematics as SVG
    * [d3-hwschematic](https://github.com/Nic30/d3-hwschematic) - interactive digital circuit analysis and documentation, particularly for FPGA-based designs
  * Cytoscape [adapter](https://github.com/cytoscape/cytoscape.js-elk)
  * [reaflow](https://reaflow.dev) - Node-based editor built on elkjs in React
  * [reactflow](https://reactflow.dev) - React component for building node-based editors and interactive diagrams
  * Wrapping elkjs into a [docker-based microservice](https://github.com/elbosso/elkjsmicroservice)
  * [sprotty](https://github.com/eclipse/sprotty) - A diagramming framework
  * [capellambse-context-diagrams](https://github.com/DSD-DBS/capellambse-context-diagrams) - Generating systems engineering context diagrams for [Capella](https://www.eclipse.org/capella/) in Python
  * Used to layout the [dataflow viewer](https://github.com/vega/editor/pull/1023) in the [Vega Editor](https://vega.github.io/editor/#/)
  * [CatColab](https://catcolab.org/) - a collaborative environment for formal, interoperable, conceptual modeling


Note: We are happy to extend this list further, so please contact us if you have a project to add
# Thanks
  * [@automata](https://github.com/automata) for the very first `klayjs` version
  * [@aranega](https://github.com/aranega) for making emfgwt work for us
  * [@EyMaddis](https://github.com/EyMaddis) for valuable API discussions
  * The team working on the layout algorithms 
    * the vast number of students that contributed to ELK


## About
ELK's layout algorithms for JavaScript
[diagram-layout](https://github.com/topics/diagram-layout)[graph-layout](https://github.com/topics/graph-layout)[layered-layout](https://github.com/topics/layered-layout)[layout-algorithm](https://github.com/topics/layout-algorithm)
**2.9k** stars
**35** watching
[ forks](https://github.com/kieler/elkjs/forks)
## 
[ 0.12.1Latest Oct 28, 2026 ](https://github.com/kieler/elkjs/releases/tag/0.12.1)
## 
[+ 62,848](https://github.com/kieler/elkjs/network/dependents)
## 
## Languages
  * [JavaScript72.3%](https://github.com/kieler/elkjs/search?l=javascript)
  * [Java14.6%](https://github.com/kieler/elkjs/search?l=java)
  * [HTML8.9%](https://github.com/kieler/elkjs/search?l=html)
  * [Xtend4.2%](https://github.com/kieler/elkjs/search?l=xtend)


You can’t perform that action at this time. 
