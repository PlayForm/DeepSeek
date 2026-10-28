[**3** Branches](https://github.com/cytoscape/cytoscape.js-elk/branches)[](https://github.com/cytoscape/cytoscape.js-elk/tags)
Go to file
Open more actions menu
Apr 10, 2026
[8cf1168](https://github.com/cytoscape/cytoscape.js-elk/commit/8cf116841e241626752b6be79053217f9b9e9101) · Apr 10, 2026
[128 Commits](https://github.com/cytoscape/cytoscape.js-elk/commits/master/)
Open commit details
128 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
| [Upgrade to elk@0.9 and revise webpack config](https://github.com/cytoscape/cytoscape.js-elk/commit/651409c6ddfb441e4cbbdc1698cea427f059967d "Upgrade to elk@0.9 and revise webpack config")  | Nov 26, 2024  |  
|   | Nov 26, 2024  |  
| [Adding functional layoutOptions](https://github.com/cytoscape/cytoscape.js-elk/commit/0366945e0177d8a6abcf90696fa300a7e6834438 "Adding functional layoutOptions")  | Jun 5, 2023  |  
|   |   | [chore(build): upgrade to Babel 7 using `npx babel-upgrade`](https://github.com/cytoscape/cytoscape.js-elk/commit/16dfdd43683298da9656efc1759d014337ace4c5 "chore\(build\): upgrade to Babel 7 using `npx babel-upgrade`")  | Dec 4, 2020  |  
|   |   |   | Dec 6, 2017  |  
|   |   | [chore: upgrade ESLint + add & fix some prefer-*s](https://github.com/cytoscape/cytoscape.js-elk/commit/8b6f0b0d09ed03143454cb8ca081318e52ea1bf0 "chore: upgrade ESLint + add & fix some prefer-*s")  | Jan 25, 2021  |  
|   |   |   | Feb 9, 2021  |  
|   |   |   | Dec 6, 2017  |  
|   |   |   | Jan 7, 2020  |  
|   |   |   | Nov 26, 2024  |  
|   |   |   | Nov 26, 2024  |  
|   |   | [Upgrade to elk@0.9 and revise webpack config](https://github.com/cytoscape/cytoscape.js-elk/commit/651409c6ddfb441e4cbbdc1698cea427f059967d "Upgrade to elk@0.9 and revise webpack config")  | Nov 26, 2024  |  
| View all files |  
# cytoscape-elk
## Description
The [elk](https://github.com/OpenKieler/elkjs) layout algorithm adapter for Cytoscape.js
[ELK](https://www.eclipse.org/elk/) is a set of layout algorithms implemented by the Eclipse Foundation in Java. The source code is compiled to JS by the [ELK.js](https://github.com/kieler/elkjs) project using GWT. This Cytoscape extension adds support for the ELK layout aglorithms in Cytoscape.
## Dependencies
  * Cytoscape.js >= 3.2.0
  * elkjs >= 0.9.2


## Usage instructions
Download the library:
  * via npm or yarn: `npm install cytoscape-elk` or `yarn add cytoscape-elk`,
  * via direct download in the repository (probably from a tag).


Import the library as appropriate for your project:
ES import:

```
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';

cytoscape.use( elk );
```

CommonJS require:

```
let cytoscape = require('cytoscape');
let elk = require('cytoscape-elk');

cytoscape.use( elk ); // register extension
```

AMD:

```
require(['cytoscape', 'cytoscape-elk'], function( cytoscape, elk ){
  elk( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.

```
var options = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  nodeLayoutOptions: undefined, // Per-node options function
  elk: {
    // All options are available at http://www.eclipse.org/elk/reference.html
    //
    // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
    // E.g. for 'org.eclipse.elk.direction' use:
    // 'elk.direction'
    //
    // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
    // 'elk.direction': 'DOWN'
    //
    // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
    // Example (downwards layered layout):
    'algorithm': 'layered',
    'elk.direction': 'DOWN',
  },
  priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

cy.layout( options ).run();
```

You can set layout options per node by defining a `nodeLayoutOptions` function which is called on a per-node basis. This is useful for tweaking the layout of a particular node, like for [setting its partition](https://www.eclipse.org/elk/reference/options/org-eclipse-elk-partitioning-partition.html) for the layered layout. For instance, if you want to store these options within the node's `scratch` object, you can do something like this:

```
nodeLayoutOptions: node => n.scratch('layoutOptions')
```

The set of `options.elk.algorithm` values that are supported by ELK.js follows:
  * `box` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=box)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-box.html)) Pack the nodes like boxes.
  * `disco` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=disco)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-disco.html)) Pack the (disconnected) components. A secondary layout may be applied to each component via `options.elk.componentLayoutAlgorithm`.
  * `force` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=force)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-force.html)) Apply a basic force-directed layout.
  * `layered` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html)) Apply a hierarchical layout, appropriate for DAGs and trees.
  * `mrtree` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=mrtree) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-mrtree.html)) Apply a traditional, hierarchical tree layout.
  * `random` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=random)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-random.html)) Apply random positions to the nodes.
  * `stress` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=stress)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-stress.html)) Apply a force-directed layout.


See the [ELK.js documentation](https://github.com/OpenKieler/elkjs) and the [ELK algorithm options documentation](https://www.eclipse.org/elk/reference/algorithms.html) for more information.
## Build targets
  * `npm run test` : Run Mocha tests in `./test`
  * `npm run build` : Build `./src/**` into `cytoscape.js-elk`
  * `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
  * `npm run dev` : Automatically build on changes with live reloading with webpack dev server
  * `npm run lint` : Run eslint on the source


N.b. all builds use babel, so modern ES features can be used in the `src`.
## Publishing instructions
This project is set up to automatically be published to npm. To publish:
  1. Build the extension : `npm run build`
  2. Commit the build : `git commit -am "Build for release"`
  3. Bump the version number and tag: `npm version major|minor|patch`
  4. Push to origin: `git push && git push --tags`
  5. Publish to npm: `npm publish .`


## About
The ELK layout algorithm adapter for Cytoscape.js
**56** stars
**6** watching
[ forks](https://github.com/cytoscape/cytoscape.js-elk/forks)
## 
[19tags](https://github.com/cytoscape/cytoscape.js-elk/tags)
## 
[+ 315](https://github.com/cytoscape/cytoscape.js-elk/network/dependents)
## 
## Languages
  * [JavaScript100%](https://github.com/cytoscape/cytoscape.js-elk/search?l=javascript)


You can’t perform that action at this time. 
