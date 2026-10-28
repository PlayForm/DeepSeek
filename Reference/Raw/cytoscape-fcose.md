# cytoscape-fcose


## Description


fCoSE (pron. "f-cosay", **f** ast **Co** mpound **S** pring **E** mbedder), is a faster version of our earlier compound spring embedder algorithm named [CoSE](https://github.com/cytoscape/cytoscape.js-cose-bilkent), implemented as a Cytoscape.js extension by [i-Vis Lab](http://cs.bilkent.edu.tr/~ivis/) in Bilkent University.

Here are some demos: **simple**, **compound**, and **constraints**, respectively:

- [![](https://camo.githubusercontent.com/24f8d3c5f8680cf7a34f53a8bef18223fd8b0659282d398ea150dae56a49b871/68747470733a2f2f7777772e63732e62696c6b656e742e6564752e74722f7e697669732f696d616765732f64656d6f312e706e67)](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html)
- [![](https://camo.githubusercontent.com/17852cfa70dd039597a58f2d9f0572b4f4df725b9fc55cb162cc1d0a1eee8df3/68747470733a2f2f7777772e63732e62696c6b656e742e6564752e74722f7e697669732f696d616765732f64656d6f322e706e67)](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html)
- [![](https://camo.githubusercontent.com/f169aa5962da66efda57e3014ae51c676a58a44c3292717ca9b0bd757aae4824/68747470733a2f2f7777772e63732e62696c6b656e742e6564752e74722f7e697669732f696d616765732f64656d6f332e706e67)](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html)

fCoSE layout algorithm combines the speed of spectral layout with the aesthetics of force-directed layout. fCoSE runs up to 2 times as fast as CoSE while achieving similar aesthetics.

[![](./iVis-at-Bilkent-cytoscape.js-fcose-raw-master-demo-demo.gif.md)](/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif) [![demo.gif](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/raw/master/demo/demo.gif)](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif)

[](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif)

Furthermore, fCoSE also supports a fairly rich set of constraint types (i.e., fixed position, vertical/horizontal alignment and relative placement).

[![](./iVis-at-Bilkent-cytoscape.js-fcose-raw-master-demo-incrementalConstraints.gif.md)](/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif) [![incrementalConstraints.gif](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/raw/master/demo/incrementalConstraints.gif)](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif)

[](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif)

You can see constraint support in action in the following videos: [fixed node](https://youtu.be/vRZVlwntzGY), [alignment](https://youtu.be/O5rddJ7DteU), [relative placement](https://youtu.be/Xcm87bT50RA), [hybrid](https://youtu.be/KRAQHmnTvUA), [real life graphs](https://youtu.be/vTPy9G2ALcI). Constraints can also be added [incrementally](https://youtu.be/DTm2WmzwP4k) on a given layout.

Please cite the following when you use this layout:

H. Balci and U. Dogrusoz, "[fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support](https://doi.org/10.1109/TVCG.2021.3095303)," in IEEE Transactions on Visualization and Computer Graphics, 28(12), pp. 4582-4593, 2022.

U. Dogrusoz, E. Giral, A. Cetintas, A. Civril and E. Demir, "[A Layout Algorithm For Undirected Compound Graphs](http://www.sciencedirect.com/science/article/pii/S0020025508004799)", Information Sciences, 179, pp. 980-994, 2009.

## Dependencies


- Cytoscape.js ^3.2.0
- cose-base ^2.0.0
- cytoscape-layout-utilities.js (optional for packing disconnected components) ^1.0.0

## Documentation


fCoSE supports user-defined placement constraints as well as its full support for compound graphs. These constraints may be defined for simple nodes. Supported constraint types are:

- **Fixed node constraint:** The user may provide *exact* desired positions for a set of nodes called *fixed nodes*. For example, in order to position node *n1* to *(x: 100, y: 200)* and node *n2* to *(x: 200, y: -300)* as a result of the layout, `fixedNodeConstraint` option should be set as follows:

  fixedNodeConstraint: \[{nodeId: 'n1', position: {x: 100, y: 200}},\
    {nodeId: 'n2', position: {x: 200, y: -300}}\],

- **Alignment constraint:** This constraint aims to align two or more nodes (with respect to their centers) vertically or horizontally. For example, for the vertical alignment of nodes {*n1, n2, n3*} and {*n4, n5*}, and horizontal alignment of nodes {*n2, n4*} as a result of the layout, `alignmentConstraint` option should be set as follows:

  alignmentConstraint: {vertical: \[\['n1', 'n2', 'n3'\], \['n4', 'n5'\]\], horizontal: \[\['n2', 'n4'\]\]},

      ***Note:** Alignment constraints in a direction must be given in most compact form. Example: `['n1', 'n2', 'n3']` instead of `['n1', 'n2'], ['n1', 'n3']`.*

- **Relative placement constraint:** The user may constrain the position of a node relative to another node in either vertical or horizontal direction. For example, in order to position node *n1* to be above of node *n2* by at least 100 pixels and position node *n3* to be on the left of node *n4* by at least 75 pixels as a result of the layout, `relativePlacementConstraint` option should be set as follows:

  relativePlacementConstraint: \[{top: 'n1', bottom: 'n2', gap: 100}, \
     {left: 'n3', right: 'n4', gap: 75}\],

  The `gap` property is optional. If it is omitted, average `idealEdgeLength` is used as the gap value.

## Usage instructions


Download the library:

- via npm: `npm install cytoscape-fcose`,
- via bower: `bower install cytoscape-fcose`, or
- via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

import cytoscape from 'cytoscape';\
import fcose from 'cytoscape-fcose';\
\
cytoscape.use( fcose );

CommonJS require:

let cytoscape = require('cytoscape');\
let fcose = require('cytoscape-fcose');\
\
cytoscape.use( fcose ); // register extension

AMD:

require(\['cytoscape', 'cytoscape-fcose'\], function( cytoscape, fcose ){\
  fcose( cytoscape ); // register extension\
});

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed. Just add the following files:

```
<script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>
<script src="https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js"></script>
```

## API


When calling the layout, e.g. `cy.layout({ name: 'fcose', ... })`, the following options are supported:

var defaultOptions = {\
\
  // 'draft', 'default' or 'proof' \
  // - "draft" only applies spectral layout \
  // - "default" improves the quality with incremental layout (fast cooling rate)\
  // - "proof" improves the quality with incremental layout (slow cooling rate) \
  quality: "default",\
  // Use random node positions at beginning of layout\
  // if this is set to false, then quality option must be "proof"\
  randomize: true, \
  // Whether or not to animate the layout\
  animate: true, \
  // Duration of animation in ms, if enabled\
  animationDuration: 1000, \
  // Easing of animation, if enabled\
  animationEasing: undefined, \
  // Fit the viewport to the repositioned nodes\
  fit: true, \
  // Padding around layout\
  padding: 30,\
  // Whether to include labels in node dimensions. Valid in "proof" quality\
  nodeDimensionsIncludeLabels: false,\
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions\
  uniformNodeDimensions: false,\
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized\
  packComponents: true,\
  // Layout step - all, transformed, enforced, cose - for debug purpose only\
  step: "all",\
  \
  /\* spectral layout options \*/\
  \
  // False for random, true for greedy sampling\
  samplingType: true,\
  // Sample size to construct distance matrix\
  sampleSize: 25,\
  // Separation amount between nodes\
  nodeSeparation: 75,\
  // Power iteration tolerance\
  piTol: 0.0000001,\
  \
  /\* incremental layout options \*/\
  \
  // Node repulsion (non overlapping) multiplier\
  nodeRepulsion: node =\> 4500,\
  // Ideal edge (non nested) length\
  idealEdgeLength: edge =\> 50,\
  // Divisor to compute edge forces\
  edgeElasticity: edge =\> 0.45,\
  // Nesting factor (multiplier) to compute ideal edge length for nested edges\
  nestingFactor: 0.1,\
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required\
  numIter: 2500,\
  // For enabling tiling\
  tile: true,\
  // The comparison function to be used while sorting nodes during tiling operation.\
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.\
  // It works similar to \`\`compareFunction\`\` parameter of \`\`Array.prototype.sort()\`\`\
  // If node1 is less then node2 by some ordering criterion \`\`tilingCompareBy(nodeId1, nodeId2)\`\` must return a negative value\
  // If node1 is greater then node2 by some ordering criterion \`\`tilingCompareBy(nodeId1, nodeId2)\`\` must return a positive value\
  // If node1 is equal to node2 by some ordering criterion \`\`tilingCompareBy(nodeId1, nodeId2)\`\` must return 0\
  tilingCompareBy: undefined, \
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)\
  tilingPaddingVertical: 10,\
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)\
  tilingPaddingHorizontal: 10,\
  // Gravity force (constant)\
  gravity: 0.25,\
  // Gravity range (constant) for compounds\
  gravityRangeCompound: 1.5,\
  // Gravity force (constant) for compounds\
  gravityCompound: 1.0,\
  // Gravity range (constant)\
  gravityRange: 3.8, \
  // Initial cooling factor for incremental layout  \
  initialEnergyOnIncremental: 0.3,\
\
  /\* constraint options \*/\
\
  // Fix desired nodes to predefined positions\
  // \[{nodeId: 'n1', position: {x: 100, y: 200}}, {...}\]\
  fixedNodeConstraint: undefined,\
  // Align desired nodes in vertical/horizontal direction\
  // {vertical: \[\['n1', 'n2'\], \[...\]\], horizontal: \[\['n2', 'n4'\], \[...\]\]}\
  alignmentConstraint: undefined,\
  // Place two nodes relatively in vertical/horizontal direction\
  // \[{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}\]\
  relativePlacementConstraint: undefined,\
\
  /\* layout event callbacks \*/\
  ready: () =\> {}, // on layoutready\
  stop: () =\> {} // on layoutstop\
};

To be able to use `packComponents` option, `cytoscape-layout-utilities` extension should also be registered in the application. Packing related [options](https://github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities#default-options) should be set via `cytoscape-layout-utilities` extension. If they are not set, fCoSE uses default options.

## Build targets


- `npm run test` : Run Mocha tests in `./test`
- `npm run build` : Build `./src/**` into `cytoscape-fcose.js`
- `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
- `npm run dev` : Automatically build on changes with live reloading with webpack dev server
- `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.

## Publishing instructions


This project is set up to automatically be published to npm and bower. To publish:

1.  Build the extension : `npm run build:release`
2.  Commit the build : `git commit -am "Build for release"`
3.  Bump the version number and tag: `npm version major|minor|patch`
4.  Push to origin: `git push && git push --tags`
5.  Publish to npm: `npm publish .`
6.  If publishing to bower for the first time, you'll need to run `bower register cytoscape-fcose https://github.com/iVis-at-Bilkent/cytoscape.js-fcose.git`
7.  [Make a new release](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/releases/new) for Zenodo.

## Team


- [Hasan Balcı](https://github.com/hasanbalci) and [Ugur Dogrusoz](https://github.com/ugurdogrusoz) of [i-Vis at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis)

<!--
## Source links

- [/](./index.md) - source: /
- [/login?return_to=https%3A%2F%2Fgithub.com%2FiVis-at-Bilkent%2Fcytoscape.js-fcose](./login?return_to=https%3A%2F%2Fgithub.com%2FiVis-at-Bilkent%2Fcytoscape.js-fcose.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2FiVis-at-Bilkent%2Fcytoscape.js-fcose
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=iVis-at-Bilkent%2Fcytoscape.js-fcose.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=iVis-at-Bilkent%2Fcytoscape.js-fcose
- [iVis-at-Bilkent](./iVis-at-Bilkent.md) - source: /iVis-at-Bilkent
- [cytoscape.js-fcose](./iVis-at-Bilkent-cytoscape.js-fcose.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose
- [Issues 12](./iVis-at-Bilkent-cytoscape.js-fcose-issues.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/issues
- [Pull requests](./iVis-at-Bilkent-cytoscape.js-fcose-pulls.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/pulls
- [Actions](./iVis-at-Bilkent-cytoscape.js-fcose-actions.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/actions
- [Projects](./iVis-at-Bilkent-cytoscape.js-fcose-projects.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/projects
- [Security and quality](./iVis-at-Bilkent-cytoscape.js-fcose-security.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/security
- [Insights](./iVis-at-Bilkent-cytoscape.js-fcose-pulse.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/pulse
- [Notifications](./login?return_to=%2FiVis-at-Bilkent%2Fcytoscape.js-fcose.md) - source: /login?return_to=%2FiVis-at-Bilkent%2Fcytoscape.js-fcose
- [graph-algorithms](./topics-graph-algorithms.md) - source: /topics/graph-algorithms
- [graph-drawing](./topics-graph-drawing.md) - source: /topics/graph-drawing
- [graphviz](./topics-graphviz.md) - source: /topics/graphviz
- [Activity](./iVis-at-Bilkent-cytoscape.js-fcose-activity.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/activity
- [Custom properties](./iVis-at-Bilkent-cytoscape.js-fcose-custom-properties.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/custom-properties
- [31 forks](./iVis-at-Bilkent-cytoscape.js-fcose-forks.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2FiVis-at-Bilkent%2Fcytoscape.js-fcose&report=iVis-at-Bilkent+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2FiVis-at-Bilkent%2Fcytoscape.js-fcose&report=iVis-at-Bilkent+%28user%29
- [9 Branches](./iVis-at-Bilkent-cytoscape.js-fcose-branches.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/branches
- [9 Tags](./iVis-at-Bilkent-cytoscape.js-fcose-tags.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/tags
- [/hasanbalci](./hasanbalci.md) - source: /hasanbalci
- [hasanbalci](./iVis-at-Bilkent-cytoscape.js-fcose-commits?author=hasanbalci.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commits?author=hasanbalci
- [2.2.0](./iVis-at-Bilkent-cytoscape.js-fcose-commit-78afcf96512a409abc903699277ad616c02dfad9.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/78afcf96512a409abc903699277ad616c02dfad9
- [220 Commits](./iVis-at-Bilkent-cytoscape.js-fcose-commits-master.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commits/master/
- [demo](./iVis-at-Bilkent-cytoscape.js-fcose-tree-master-demo.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/tree/master/demo
- [Update package files and README](./iVis-at-Bilkent-cytoscape.js-fcose-commit-a27dbfbb3b52ed641ba649d746bf4d7958f37f45.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/a27dbfbb3b52ed641ba649d746bf4d7958f37f45
- [src](./iVis-at-Bilkent-cytoscape.js-fcose-tree-master-src.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/tree/master/src
- [Resolve](./iVis-at-Bilkent-cytoscape.js-fcose-commit-39a6f8629d0e711e011ee3fc898335918db136c8.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/39a6f8629d0e711e011ee3fc898335918db136c8
- [#60](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/issues/60)
- [test](./iVis-at-Bilkent-cytoscape.js-fcose-tree-master-test.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/tree/master/test
- [Initial commit](./iVis-at-Bilkent-cytoscape.js-fcose-commit-e56256f3fe696ddc601d072bfa26a9a268d7ffa6.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/e56256f3fe696ddc601d072bfa26a9a268d7ffa6
- [.babelrc](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-.babelrc.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/.babelrc
- [.eslintignore](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-.eslintignore.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/.eslintignore
- [.eslintrc](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-.eslintrc.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/.eslintrc
- [.gitignore](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-.gitignore.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/.gitignore
- [Update package files](./iVis-at-Bilkent-cytoscape.js-fcose-commit-4d2eaf630200cf8f4f88ed5c6eb5a031d073740a.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/4d2eaf630200cf8f4f88ed5c6eb5a031d073740a
- [CITATION.cff](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-CITATION.cff.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/CITATION.cff
- [Update CITATION.cff](./iVis-at-Bilkent-cytoscape.js-fcose-commit-a032e9ff7dd7fc9fec6e3ac778998b9cd601b306.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/a032e9ff7dd7fc9fec6e3ac778998b9cd601b306
- [LICENSE](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-LICENSE.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/LICENSE
- [Changes before release](./iVis-at-Bilkent-cytoscape.js-fcose-commit-9b7b7993526b1cb913e69f11a3aef0abb268906f.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/9b7b7993526b1cb913e69f11a3aef0abb268906f
- [README.md](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-README.md.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/README.md
- [bower.json](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-bower.json.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/bower.json
- [Remove numeric.js dependency](./iVis-at-Bilkent-cytoscape.js-fcose-commit-4c6aca6e501f46c5c40d246f573854869035f2f7.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/4c6aca6e501f46c5c40d246f573854869035f2f7
- [cytoscape-fcose.js](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-cytoscape-fcose.js.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/cytoscape-fcose.js
- [package-lock.json](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-package-lock.json.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/package-lock.json
- [package.json](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-package.json.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/package.json
- [webpack.config.js](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-webpack.config.js.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/webpack.config.js
- [Update webpack config file](./iVis-at-Bilkent-cytoscape.js-fcose-commit-7390ec031b1d9b0ecc532d59fed6ec80fa9264fd.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/commit/7390ec031b1d9b0ecc532d59fed6ec80fa9264fd
- [CoSE](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [i-Vis Lab](http://cs.bilkent.edu.tr/~ivis/)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html)
- [/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-demo-demo.gif.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif
- [https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/demo.gif)
- [/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif](./iVis-at-Bilkent-cytoscape.js-fcose-blob-master-demo-incrementalConstraints.gif.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif
- [https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/blob/master/demo/incrementalConstraints.gif)
- [fixed node](https://youtu.be/vRZVlwntzGY)
- [alignment](https://youtu.be/O5rddJ7DteU)
- [relative placement](https://youtu.be/Xcm87bT50RA)
- [hybrid](https://youtu.be/KRAQHmnTvUA)
- [real life graphs](https://youtu.be/vTPy9G2ALcI)
- [incrementally](https://youtu.be/DTm2WmzwP4k)
- [fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support](https://doi.org/10.1109/TVCG.2021.3095303)
- [A Layout Algorithm For Undirected Compound Graphs](http://www.sciencedirect.com/science/article/pii/S0020025508004799)
- [options](https://github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities#default-options)
- [Make a new release](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/releases/new)
- [Hasan Balcı](https://github.com/hasanbalci)
- [Ugur Dogrusoz](https://github.com/ugurdogrusoz)
- [i-Vis at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis)
- [Releases](./iVis-at-Bilkent-cytoscape.js-fcose-releases.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/releases
- [v2.2.0 Latest Jan 17, 2023](./iVis-at-Bilkent-cytoscape.js-fcose-releases-tag-v2.2.0.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/releases/tag/v2.2.0
- [Used by](./iVis-at-Bilkent-cytoscape.js-fcose-network-dependents.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/network/dependents
- [Contributors](./iVis-at-Bilkent-cytoscape.js-fcose-graphs-contributors.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/graphs/contributors
- [/ugurdogrusoz](./ugurdogrusoz.md) - source: /ugurdogrusoz
- [JavaScript 100%](./iVis-at-Bilkent-cytoscape.js-fcose-search?l=javascript.md) - source: /iVis-at-Bilkent/cytoscape.js-fcose/search?l=javascript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
