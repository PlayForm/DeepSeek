Last indexed: 9 May 2025 ([415674](https://github.com/kieler/elkjs/commits/4156746a))
  * [Java to JavaScript Compilation](https://deepwiki.com/kieler/elkjs/4.1-java-to-javascript-compilation)


# Usage Guide
Relevant source files
  * [test/mocha/testRaiseException.js](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testRaiseException.js)


This guide provides practical instructions for using elkjs, a JavaScript library derived from the Eclipse Layout Kernel (ELK) that computes positions for the elements of a graph diagram. The guide covers installation, basic usage patterns, and how to use elkjs in different environments including Node.js and browsers. For architectural details about how the system is structured internally, see [Architecture](https://deepwiki.com/kieler/elkjs/2-architecture).
## 1. Installation
The elkjs library can be installed via npm, which is the recommended method for both Node.js and browser-based applications.
### Basic Installation

```

```

npm install elkjs

```

```

### Development Version
For the latest development version based on ELK's `master` branch:

```

```

npm install elkjs@next

```

```

Sources: [README.md49-56](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L49-L56)
## 2. Basic Usage
At its core, using elkjs involves creating an ELK instance and passing a graph to its layout method. The following example demonstrates the basic workflow:

```

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

```

The `layout` method returns a Promise that resolves to the laid out graph with positions for nodes and edge routing information.
Sources: [README.md74-95](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L74-L95)
### Graph Structure
The input graph follows the ELK JSON format with the following key components:
For detailed information about the graph structure, see [Graph Structure](https://deepwiki.com/kieler/elkjs/3.3-graph-structure).
Sources: [README.md75-95](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L75-L95)
## 3. Environment-Specific Usage
Elkjs can be used in various JavaScript environments, including Node.js and browsers. Each environment has its own specific setup requirements.
### 3.1 Node.js Usage
#### Basic Usage in Node.js

```

```

const ELK = require('elkjs')


const elk = new ELK()



elk.layout(graph)


   .then(console.log)

```

```

#### With Web Worker in Node.js
Using a Web Worker in Node.js requires additional setup:

```

```

const ELK = require('elkjs')


const elk = new ELK({


  workerUrl: './node_modules/elkjs/lib/elk-worker.min.js'


})



elk.layout(graph)


   .then(console.log)

```

```

Note: To use Web Workers in Node.js, you need to install the `web-worker` package:

```

```

npm install web-worker

```

```

This package provides a Web Worker implementation that's compatible with the browser's Worker API.
Sources: [README.md144-175](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L144-L175)
### 3.2 Browser Usage
There are two main approaches to using elkjs in a browser: bundled version and separate files.
#### Bundled Version

```

```

<script src="./elk.bundled.js"></script>


<script type="text/javascript">


  const elk = new ELK()



  elk.layout(graph)


     .then(function(g) {


       document.body.innerHTML = "<pre>" + JSON.stringify(g, null, " ") + "</pre>"


     })


</script>

```

```

#### Separate Files (with Web Worker)

```

```

<script src="./elk-api.js"></script>


<script type="text/javascript">


  const elk = new ELK({


    workerUrl: './elk-worker.js'


  })



  elk.layout(graph)


     .then(function(g) {


       document.body.innerHTML = "<pre>" + JSON.stringify(g, null, " ") + "</pre>"


     })


</script>

```

```

The separate files approach allows you to leverage Web Workers for non-blocking layout calculations.
Sources: [README.md178-206](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L178-L206)
### 3.3 TypeScript Usage
Elkjs provides TypeScript type definitions for better IDE integration and type safety.

```

```

// Using the bundled version


import ELK from 'elkjs/lib/elk.bundled.js'


const elk = new ELK()



// Using with Web Worker


import ELK from 'elkjs/lib/elk-api'


const elk = new ELK({


  workerUrl: './elk-worker.min.js'


})

```

```

Sources: [README.md208-218](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L208-L218)
## 4. Understanding elkjs Components
The following diagram illustrates the relationship between the key files in the elkjs library and how they're used in different environments:
Files and their purposes:
  * `elk-api.js`: Provides the API interface
  * `elk-worker.js`: Contains the layout algorithm code (compiled from Java with GWT)
  * `elk.bundled.js`: Combines both API and worker code for simple browser usage
  * `main.js`: Entry point for Node.js module


Sources: [README.md62-70](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L62-L70)
## 5. Configuration Options
### 5.1 ELK Constructor Options
When creating an ELK instance, you can provide several configuration options:

```

```

const elk = new ELK({


  defaultLayoutOptions: { ... },  // Default layout options for all graphs


  algorithms: [ ... ],            // Array of algorithm IDs to include


  workerUrl: '...'                // Path to elk-worker.js (enables Web Worker mode)


});

```

```

Sources: [README.md237-242](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L237-L242)
### 5.2 Layout Options
Layout options can be specified at multiple levels:
  1. **Default layout options** in the ELK constructor:

```

```

const elk = new ELK({


  defaultLayoutOptions: { 'elk.algorithm': 'layered' }


})

```

```

  2. **Global layout options** in the layout method:

```

```

elk.layout(graph, {


  layoutOptions: { 'elk.algorithm': 'layered' }


})

```

```

  3. **Element-specific layout options** in the graph itself:

```

```

const graph = {


  id: "root",


  layoutOptions: { 'elk.algorithm': 'layered' },


  children: [ ... ]


}

```

```



Layout options are applied with the following precedence (highest to lowest):
  1. Element-specific options
  2. Global options (in layout method)
  3. Default options (in constructor)


Sources: [README.md99-131](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L99-L131)
### 5.3 Common Layout Options
Some frequently used layout options include:  
| Option  | Description  | Example Value  |  
| --- | --- | --- |  
| `elk.algorithm`  | The layout algorithm to use  |  `'layered'`, `'stress'`, `'mrtree'`  |  
| `elk.spacing.nodeNode`  | Spacing between nodes  |  
| `elk.direction`  | Layout direction  |  `'DOWN'`, `'RIGHT'`, `'UP'`, `'LEFT'`  |  
| `elk.layered.spacing.nodeNodeBetweenLayers`  | Spacing between layers (for layered algorithm)  |  
| `elk.layered.nodePlacement.strategy`  | Node placement strategy  |  `'SIMPLE'`, `'NETWORK_SIMPLEX'`  |  
For a complete list of layout options, see [Layout Configuration](https://deepwiki.com/kieler/elkjs/5.3-layout-configuration).
## 6. Web Worker Integration
Web Workers are used to prevent freezing the UI during computation-intensive layout operations. They run in a separate thread from the main JavaScript execution thread.
### 6.1 Why Use Web Workers
For large graphs, layout computation can be time-consuming and block the UI in browser environments. Web Workers solve this issue by performing the layout in a background thread.
### 6.2 Configuring Web Workers
To enable Web Workers:
  1. In browsers:

```

```

const elk = new ELK({


  workerUrl: './elk-worker.js'


})

```

```

  2. In Node.js:

```

```

const elk = new ELK({


  workerUrl: './node_modules/elkjs/lib/elk-worker.min.js'


})

```

```

Remember to install the `web-worker` package for Node.js.


Sources: [README.md134-140](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L134-L140) [README.md154-174](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L154-L174) [README.md193-205](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L193-L205)
### 6.3 Terminating Web Workers
To terminate a Web Worker when it's no longer needed:

```

```

elk.terminateWorker()

```

```

This helps free up resources, especially in long-running applications.
Sources: [README.md260](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L260-L260)
## 7. Advanced Features
### 7.1 Logging and Execution Times
Since version 0.6.0, elkjs supports logging debug information and measuring execution times:

```

```

elk.layout(graph, {


    layoutOptions: {


        'algorithm': 'layered'


    },


    logging: true,               // Enable logging


    measureExecutionTime: true   // Measure execution time


})

```

```

This adds a `logging` property to the result graph, containing logs and execution time measurements:

```

```

{


  "id": "root",


  "children": [ ... ],


  "edges": [ ... ],


  "logging": {


    "name": "Recursive Graph Layout",


    "executionTime": 0.000096,   // Seconds


    "children": [ ... ]


  }


}

```

```

Note that execution times are in seconds, and for small graphs, they may often be reported as `0` due to millisecond precision limitations.
Sources: [README.md266-310](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L266-L310)
### 7.2 Algorithm Information
Elkjs provides methods to query information about available layout algorithms, options, and categories:

```

```

// Get information about available layout algorithms


elk.knownLayoutAlgorithms()


   .then(console.log)



// Get information about available layout options


elk.knownLayoutOptions()


   .then(console.log)



// Get information about layout categories


elk.knownLayoutCategories()


   .then(console.log)

```

```

Sources: [README.md252-260](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L252-L260)
### 7.3 Error Handling
Layout operations can fail for various reasons, such as invalid graph structures or unsupported configurations. Since the `layout` method returns a Promise, you can handle errors using standard Promise error handling:

```

```

elk.layout(graph)


   .then(result => {


      // Handle successful layout


   })


   .catch(error => {


      // Handle layout error


      console.error('Layout failed:', error.message);


   })

```

```

A common pattern for error handling is to provide a fallback layout or visual indication when layout fails.
Sources: [test/mocha/testRaiseException.js27-32](https://github.com/kieler/elkjs/blob/4156746a/test/mocha/testRaiseException.js#L27-L32)
## 8. Debugging
For debugging purposes, you can use non-minified versions of the elkjs files:

```

```

const ELK = require('elkjs/lib/elk-api.js')


const elk = new ELK({


    workerFactory: function(url) { // the value of 'url' is irrelevant here


        const { Worker } = require('elkjs/lib/elk-worker.js') // non-minified


        return new Worker(url)



})

```

```

Using non-minified versions provides more readable stack traces and error messages when problems occur.
Sources: [README.md220-231](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L220-L231)
## 9. Common Use Cases
Elkjs is used in various graph visualization scenarios:
  1. **Node-based editors** - For creating visual programming environments or workflow editors
  2. **Data flow diagrams** - Visualizing data processing pipelines
  3. **Network visualizations** - Displaying network topologies
  4. **Circuit diagrams** - For electronic and gate level schematics
  5. **System engineering diagrams** - For visualizing system components and relationships


For specific examples of projects using elkjs, see the README section on "Example Users of elkjs".
Sources: [README.md366-379](https://github.com/kieler/elkjs/blob/4156746a/README.md?plain=1#L366-L379)
Dismiss
Refresh this wiki
Enter email to refresh
### On this page
  * [3. Environment-Specific Usage](https://deepwiki.com/kieler/elkjs/5-usage-guide#3-environment-specific-usage)
  * [With Web Worker in Node.js](https://deepwiki.com/kieler/elkjs/5-usage-guide#with-web-worker-in-nodejs)
  * [Separate Files (with Web Worker)](https://deepwiki.com/kieler/elkjs/5-usage-guide#separate-files-with-web-worker)
  * [4. Understanding elkjs Components](https://deepwiki.com/kieler/elkjs/5-usage-guide#4-understanding-elkjs-components)
  * [5. Configuration Options](https://deepwiki.com/kieler/elkjs/5-usage-guide#5-configuration-options)
  * [5.1 ELK Constructor Options](https://deepwiki.com/kieler/elkjs/5-usage-guide#51-elk-constructor-options)
  * [5.3 Common Layout Options](https://deepwiki.com/kieler/elkjs/5-usage-guide#53-common-layout-options)
  * [6. Web Worker Integration](https://deepwiki.com/kieler/elkjs/5-usage-guide#6-web-worker-integration)
  * [6.1 Why Use Web Workers](https://deepwiki.com/kieler/elkjs/5-usage-guide#61-why-use-web-workers)
  * [6.2 Configuring Web Workers](https://deepwiki.com/kieler/elkjs/5-usage-guide#62-configuring-web-workers)
  * [6.3 Terminating Web Workers](https://deepwiki.com/kieler/elkjs/5-usage-guide#63-terminating-web-workers)
  * [7.1 Logging and Execution Times](https://deepwiki.com/kieler/elkjs/5-usage-guide#71-logging-and-execution-times)
  * [7.2 Algorithm Information](https://deepwiki.com/kieler/elkjs/5-usage-guide#72-algorithm-information)


