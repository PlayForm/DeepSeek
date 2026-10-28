Last indexed: 9 May 2025 ([415674](https://github.com/kieler/elkjs/commits/4156746a))
  * [Java to JavaScript Compilation](https://deepwiki.com/kieler/elkjs/4.1-java-to-javascript-compilation)


# Layout Configuration
Relevant source files
  * [test/mocha/testRaiseException.js](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testRaiseException.js)


This page provides detailed documentation on how to configure layout options and algorithms in elkjs. Layout configuration is essential for customizing the appearance and behavior of graph layouts in your applications. For general usage of elkjs in different environments, see [Usage Guide](https://deepwiki.com/kieler/elkjs/5-usage-guide) and its subsections [Node.js Usage](https://deepwiki.com/kieler/elkjs/5.1-node.js-usage) and [Browser Usage](https://deepwiki.com/kieler/elkjs/5.2-browser-usage).
## Overview of Layout Configuration
The elkjs library provides extensive configuration capabilities through layout options that control the behavior of the layout algorithms. The configuration system follows three fundamental principles:
  1. **Hierarchical application** : Layout options can be applied at different levels (global, graph, node, edge)
  2. **Cascading override** : More specific options override more general ones
  3. **Algorithm-specific options** : Each layout algorithm supports its own set of specialized options


Sources: [README.md99-132](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L99-L132)
## Layout Option Specification
Layout options can be specified at three different points:
### 1. Constructor-Level Options
Options specified during ELK construction become the default for all layout operations:

```

```

const elk = new ELK({


  defaultLayoutOptions: {


    'elk.layered.spacing.nodeNodeBetweenLayers': 30,


    'elk.direction': 'DOWN'


  }


})

```

```

These options are used when no specific options are provided to the `layout()` method.
### 2. Layout Method Options
Options can be passed as the second argument to the `layout()` method:

```

```

elk.layout(graph, {


  layoutOptions: {


    'elk.algorithm': 'layered',


    'elk.spacing.nodeNode': 40


  }


})

```

```

These options apply to the entire graph but can be overridden by element-specific options.
### 3. Element-Specific Options
Options can be attached directly to graph elements:

```

```

const graph = {


  id: "root",


  layoutOptions: { 'elk.direction': 'RIGHT' },


  children: [



      id: "node1", 


      width: 30, 


      height: 30,


      layoutOptions: { 'elk.position': '(10, 20)' }



  ],


  edges: [{


    id: "edge1",


    sources: ["node1"],


    targets: ["node2"],


    layoutOptions: { 'elk.edgeLabels.placement': 'CENTER' }


  }]


}

```

```

Sources: [README.md99-132](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L99-L132) [test/mocha/testOptions.js21-33](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L21-L33) [test/mocha/testOptions.js160-183](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L160-L183)
## Layout Option Precedence
When conflicting layout options are specified at different levels, they follow this precedence order (highest to lowest):
For example, a layout option set on a specific node will override the same option specified at the graph level.
Sources: [test/mocha/testOptions.js52-63](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L52-L63)
## Layout Algorithms
Elkjs includes several layout algorithms, each suitable for different types of graphs and layout requirements. The layout algorithm is selected using the `elk.algorithm` option.
### Core Layout Algorithms  
| Algorithm ID  | Full ID  | Description  | Use Case  |  
| --- | --- | --- | --- |  
| `layered`  | `org.eclipse.elk.layered`  | Layer-based layout for directed graphs  | Hierarchical diagrams, data flow  |  
| `stress`  | `org.eclipse.elk.stress`  | Force-directed layout based on stress minimization  | General-purpose, undirected graphs  |  
| `mrtree`  | `org.eclipse.elk.mrtree`  | Tree layout supporting multiple roots  | Tree structures  |  
| `radial`  | `org.eclipse.elk.radial`  | Places nodes in concentric circles  | Radial hierarchies  |  
| `force`  | `org.eclipse.elk.force`  | Force-based layout  | Undirected graphs  |  
| `disco`  | `org.eclipse.elk.disco`  | Disconnected components layout  | Graphs with separate components  |  
| `org.eclipse.elk.box`  | Simple box layout  | Container packing  |  
| `fixed`  | `org.eclipse.elk.fixed`  | Fixed positions layout  | Pre-positioned nodes  |  
| `random`  | `org.eclipse.elk.random`  | Random positioning  | Testing, initial positioning  |  
| `sporeCompaction`  | `elk.sporeCompaction`  | Compacts a graph layout  | Post-processing  |  
| `sporeOverlap`  | `elk.sporeOverlap`  | Removes overlaps between nodes  | Post-processing  |  
| `rectpacking`  | `elk.rectpacking`  | Rectangle packing algorithm  | Container packing  |  
You can query the available algorithms programmatically:

```

```

elk.knownLayoutAlgorithms()


   .then(algorithms => console.log(algorithms))

```

```

Sources: [README.md233-263](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L233-L263) [test/mocha/testLayouters.js34-74](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testLayouters.js#L34-L74)
## Commonly Used Layout Options
### General Layout Options  
| Option ID  | Description  | Example Value  |  
| --- | --- | --- |  
| `elk.algorithm`  | Layout algorithm to use  | `"layered"`  |  
| `elk.direction`  | Overall layout direction  |  `"RIGHT"`, `"DOWN"`  |  
| `elk.spacing.nodeNode`  | Space between nodes  |  
| `elk.padding`  | Padding inside a container  | `"[left=5, top=5, right=5, bottom=5]"`  |  
### Algorithm-Specific Options
#### Layered Algorithm Options  
| Option ID  | Description  | Example Value  |  
| --- | --- | --- |  
| `elk.layered.spacing.nodeNodeBetweenLayers`  | Spacing between layers  |  
| `elk.layered.nodePlacement.strategy`  | Node placement strategy  | `"NETWORK_SIMPLEX"`  |  
| `elk.layered.crossingMinimization.strategy`  | Crossing minimization strategy  | `"LAYER_SWEEP"`  |  
#### Constraint Options  
| Option ID  | Description  | Example Value  |  
| --- | --- | --- |  
| `elk.position`  | Fixed position of a node  | `"(100, 200)"`  |  
| `layerConstraint`  | Constraint on layer assignment  |  `"FIRST"`, `"LAST"`  |  
Sources: [README.md99-122](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L99-L122) [test/mocha/testOptions.js39-96](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L39-L96)
## Special Value Formats
Some layout options accept complex values with specific formats:
### ElkPadding Format
Padding is specified using a bracketed string with side values:

```
[left=5, top=10, right=5, bottom=10]

```

Example:

```

```

layoutOptions: { 'elk.padding': '[left=2, top=3, right=3, bottom=2]' }

```

```

### KVector Format
2D coordinates are specified using parenthesized pairs:

```
(x, y)

```

Example:

```

```

layoutOptions: { 'position': '(23, 43)' }

```

```

### KVectorChain Format
A sequence of points for edge bend points:

```
( {x1,y1}, {x2,y2}, {x3,y3} )

```

Example:

```

```

layoutOptions: { 'bendPoints': '( {1,2}, {3,4} )' }

```

```

Sources: [test/mocha/testOptions.js65-127](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L65-L127)
## Layout Configuration Flow
The following diagram illustrates how layout options flow through the system during a layout operation:
Sources: [README.md140-206](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L140-L206)
## Querying Layout Metadata
Elkjs provides methods to query available layout options and algorithms:
### Available Layout Options

```

```

elk.knownLayoutOptions()


   .then(options => console.log(options))

```

```

This returns an array of layout option descriptions, including:
  * `id`: The option identifier
  * `name`: Human-readable name
  * `description`: Description of the option
  * `type`: Data type (e.g., `"string"`, `"int"`, `"double"`)
  * `group`: Option group


### Available Layout Algorithms

```

```

elk.knownLayoutAlgorithms()


   .then(algorithms => console.log(algorithms))

```

```

### Layout Categories

```

```

elk.knownLayoutCategories()


   .then(categories => console.log(categories))

```

```

Sources: [README.md233-263](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L233-L263)
## Error Handling
When layout configuration is invalid, elkjs will throw exceptions. Common errors include:
  1. **Unsupported algorithm** : When specifying a non-existent algorithm
  2. **Invalid option values** : When option values don't match the expected format
  3. **Constraint violations** : When constraints are incompatible with the layout


Example of handling layout errors:

```

```

elk.layout(graph)


   .then(result => {


      // Process successful layout


   })


   .catch(error => {


      // Handle layout error


      console.error('Layout error:', error.message);


   });

```

```

Sources: [test/mocha/testOptions.js129-139](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L129-L139) [test/mocha/testRaiseException.js24-53](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testRaiseException.js#L24-L53)
## Advanced Configuration Examples
### Layered Layout with Custom Spacing

```

```

const graph = {


  id: "root",


  layoutOptions: { 


    'elk.algorithm': 'layered',


    'elk.direction': 'RIGHT',


    'elk.layered.spacing.nodeNodeBetweenLayers': 50,


    'elk.spacing.nodeNode': 20


  },


  children: [/* nodes */],


  edges: [/* edges */]


}

```

```

### Fixed Positions with Constraints

```

```

const graph = {


  id: "root",


  layoutOptions: { 'elk.algorithm': 'fixed' },


  children: [



      id: "n1", 


      width: 30, 


      height: 30,


      layoutOptions: { 'position': '(100, 100)' }


    },



      id: "n2", 


      width: 30, 


      height: 30,


      layoutOptions: { 'position': '(200, 100)' }



  ],


  edges: [/* edges */]


}

```

```

Sources: [README.md72-95](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L72-L95) [test/mocha/testOptions.js82-100](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testOptions.js#L82-L100)
## Related Documentation
For more information on using elkjs in different environments, see:


For details on the API itself, see:


Dismiss
Refresh this wiki
Enter email to refresh
### On this page
  * [Overview of Layout Configuration](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#overview-of-layout-configuration)
  * [Layout Option Specification](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#layout-option-specification)
  * [1. Constructor-Level Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#1-constructor-level-options)
  * [2. Layout Method Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#2-layout-method-options)
  * [3. Element-Specific Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#3-element-specific-options)
  * [Layout Option Precedence](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#layout-option-precedence)
  * [Commonly Used Layout Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#commonly-used-layout-options)
  * [Algorithm-Specific Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#algorithm-specific-options)
  * [Layered Algorithm Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#layered-algorithm-options)
  * [Layout Configuration Flow](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#layout-configuration-flow)
  * [Querying Layout Metadata](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#querying-layout-metadata)
  * [Available Layout Options](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#available-layout-options)
  * [Available Layout Algorithms](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#available-layout-algorithms)
  * [Advanced Configuration Examples](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#advanced-configuration-examples)
  * [Layered Layout with Custom Spacing](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#layered-layout-with-custom-spacing)
  * [Fixed Positions with Constraints](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration#fixed-positions-with-constraints)


