![SVG.js logo](./docs-3.2-assets-images-logo-svg-js-01d-128.png.md)

# [SVG.js](./docs-3.2.md)

2.7 3.0 3.1 3.2

# SVG.js

The lightweight library for manipulating and animating SVG.

[Star](https://github.com/svgdotjs/svg.js)

\

## Why choose SVG.js?

SVG.js has no dependencies and aims to be as small as possible while providing close to complete
coverage of the SVG spec. If you're not convinced yet, here are a few highlights.

\

## It's speedy.

SVG.js is fast. Obviously not as fast as vanilla js, but many times faster than the competition:

Index:

- `rects`: **`generate 10000 rects`**
- `fill`: **`generate 10000 rects with fill color`**
- `gradient`: **`generate 10000 rects with gradient fill`**

_Less is better. Tested on an Intel Core i7-4702MQ @ 2.2GHz._

\

## Easy readable, uncluttered syntax.

Creating and manipulating SVG using JavaScript alone is pretty verbose. For example, just creating a
simple pink square requires quite a lot of code:

SVG.js provides a syntax that is concise and easy to read. Doing the same as the vanilla js example
above:

    // SVG.js
    var draw = SVG().addTo('#drawing')
      , rect = draw.rect(100, 100).fill('#f06')

That's just **two** lines of code instead of **ten**! And a whole lot less repetition.

\

## Go crazy with animations

\

## There is more...

- [animations](./docs-3.2-animating.md) on size, position, transformations, color, ...
- [painless extension](./docs-3.2-extending.md) thanks to the modular structure
- various [useful plugins](./docs-3.2-plugins.md) available
- unified api between shape types with [move](./docs-3.2-manipulating.md#move),
  [size](./docs-3.2-manipulating.md#resizing), [center](./docs-3.2-manipulating.md#center), ...
- [binding events](./docs-3.2-events.md) to elements
- full support for opacity [masks](./docs-3.2-shape-elements.md#svg-mask) and
  [clipping paths](./docs-3.2-shape-elements.md#svg-clippath)
- [text paths](./docs-3.2-shape-elements.md#svg-textpath), even animated
- element [groups](./docs-3.2-container-elements.md#svg-g)
- dynamic [gradients](./docs-3.2-shape-elements.md#svg-gradient) and
  [patterns](./docs-3.2-shape-elements.md#svg-pattern)
- fully documented (you're looking at it :)

### License

SVG.js is licensed under the terms of the
[MIT License](https://github.com/svgdotjs/svg.js/blob/master/LICENSE.txt).

### Changelog

Wondering what has changed in the latest releases? Have a look at the
[change log](https://github.com/svgdotjs/svg.js/blob/master/CHANGELOG.md).

<!--
## Source links

- [SVG.js](./docs-3.2.md) - source: /docs/3.2
- [Installation](./docs-3.2-installation.md) - source: /docs/3.2/installation
- [Getting started](./docs-3.2-getting-started.md) - source: /docs/3.2/getting-started
- [Container Elements](./docs-3.2-container-elements.md) - source: /docs/3.2/container-elements
- [SVG.Svg](./docs-3.2-container-elements.md#svg-svg) - source: /docs/3.2/container-elements/#svg-svg
- [SVG.G](./docs-3.2-container-elements.md#svg-g) - source: /docs/3.2/container-elements/#svg-g
- [SVG.Symbol](./docs-3.2-container-elements.md#svg-symbol) - source: /docs/3.2/container-elements/#svg-symbol
- [SVG.Defs](./docs-3.2-container-elements.md#svg-defs) - source: /docs/3.2/container-elements/#svg-defs
- [SVG.A](./docs-3.2-container-elements.md#svg-a) - source: /docs/3.2/container-elements/#svg-a
- [Other Elements](./docs-3.2-shape-elements.md) - source: /docs/3.2/shape-elements
- [General Handling of svg.js elements](./docs-3.2-shape-elements.md#general-handling-of-svg-js-elements) - source: /docs/3.2/shape-elements/#general-handling-of-svg-js-elements
- [SVG.Dom](./docs-3.2-shape-elements.md#svg-bare) - source: /docs/3.2/shape-elements/#svg-bare
- [SVG.Rect](./docs-3.2-shape-elements.md#svg-rect) - source: /docs/3.2/shape-elements/#svg-rect
- [SVG.Circle](./docs-3.2-shape-elements.md#svg-circle) - source: /docs/3.2/shape-elements/#svg-circle
- [SVG.Ellipse](./docs-3.2-shape-elements.md#svg-ellipse) - source: /docs/3.2/shape-elements/#svg-ellipse
- [SVG.Line](./docs-3.2-shape-elements.md#svg-line) - source: /docs/3.2/shape-elements/#svg-line
- [SVG.Polyline](./docs-3.2-shape-elements.md#svg-polyline) - source: /docs/3.2/shape-elements/#svg-polyline
- [SVG.Polygon](./docs-3.2-shape-elements.md#svg-polygon) - source: /docs/3.2/shape-elements/#svg-polygon
- [SVG.Path](./docs-3.2-shape-elements.md#svg-path) - source: /docs/3.2/shape-elements/#svg-path
- [SVG.Text](./docs-3.2-shape-elements.md#svg-text) - source: /docs/3.2/shape-elements/#svg-text
- [SVG.TextPath](./docs-3.2-shape-elements.md#svg-textpath) - source: /docs/3.2/shape-elements/#svg-textpath
- [SVG.Tspan](./docs-3.2-shape-elements.md#svg-tspan) - source: /docs/3.2/shape-elements/#svg-tspan
- [SVG.Image](./docs-3.2-shape-elements.md#svg-image) - source: /docs/3.2/shape-elements/#svg-image
- [SVG.Gradient](./docs-3.2-shape-elements.md#svg-gradient) - source: /docs/3.2/shape-elements/#svg-gradient
- [SVG.Stop](./docs-3.2-shape-elements.md#svg-stop) - source: /docs/3.2/shape-elements/#svg-stop
- [SVG.Pattern](./docs-3.2-shape-elements.md#svg-pattern) - source: /docs/3.2/shape-elements/#svg-pattern
- [SVG.Mask](./docs-3.2-shape-elements.md#svg-mask) - source: /docs/3.2/shape-elements/#svg-mask
- [SVG.ClipPath](./docs-3.2-shape-elements.md#svg-clippath) - source: /docs/3.2/shape-elements/#svg-clippath
- [SVG.Use](./docs-3.2-shape-elements.md#svg-use) - source: /docs/3.2/shape-elements/#svg-use
- [SVG.Marker](./docs-3.2-shape-elements.md#svg-marker) - source: /docs/3.2/shape-elements/#svg-marker
- [SVG.Style](./docs-3.2-shape-elements.md#svg-style) - source: /docs/3.2/shape-elements/#svg-style
- [SVG.ForeignObject](./docs-3.2-shape-elements.md#svg-foreignobject) - source: /docs/3.2/shape-elements/#svg-foreignobject
- [Referencing / Creating Elements](./docs-3.2-referencing-creating-elements.md) - source: /docs/3.2/referencing-creating-elements
- [Referencing using CSS selectors](./docs-3.2-referencing-creating-elements.md#using-css-selectors) - source: /docs/3.2/referencing-creating-elements/#using-css-selectors
- [Referencing existing DOM elements](./docs-3.2-referencing-creating-elements.md#existing-dom-elements) - source: /docs/3.2/referencing-creating-elements/#existing-dom-elements
- [Using jQuery or Zepto](./docs-3.2-referencing-creating-elements.md#using-jquery-or-zepto) - source: /docs/3.2/referencing-creating-elements/#using-jquery-or-zepto
- [Circular reference](./docs-3.2-referencing-creating-elements.md#circular-reference) - source: /docs/3.2/referencing-creating-elements/#circular-reference
- [Child references](./docs-3.2-referencing-creating-elements.md#child-references) - source: /docs/3.2/referencing-creating-elements/#child-references
- [Parent references](./docs-3.2-referencing-creating-elements.md#parent-references) - source: /docs/3.2/referencing-creating-elements/#parent-references
- [URI references](./docs-3.2-referencing-creating-elements.md#uri-references) - source: /docs/3.2/referencing-creating-elements/#uri-references
- [Creating Elements](./docs-3.2-referencing-creating-elements.md#creating-elements) - source: /docs/3.2/referencing-creating-elements/#creating-elements
- [Manipulating](./docs-3.2-manipulating.md) - source: /docs/3.2/manipulating
- [Attributes](./docs-3.2-manipulating.md#attributes) - source: /docs/3.2/manipulating/#attributes
- [Positioning](./docs-3.2-manipulating.md#positioning) - source: /docs/3.2/manipulating/#positioning
- [Resizing](./docs-3.2-manipulating.md#resizing) - source: /docs/3.2/manipulating/#resizing
- [Syntactic sugar](./docs-3.2-manipulating.md#syntactic-sugar) - source: /docs/3.2/manipulating/#syntactic-sugar
- [Transforming](./docs-3.2-manipulating.md#transforming) - source: /docs/3.2/manipulating/#transforming
- [Styles](./docs-3.2-manipulating.md#styles) - source: /docs/3.2/manipulating/#styles
- [Classes](./docs-3.2-manipulating.md#classes) - source: /docs/3.2/manipulating/#classes
- [Data](./docs-3.2-manipulating.md#data) - source: /docs/3.2/manipulating/#data
- [Memory](./docs-3.2-manipulating.md#memory) - source: /docs/3.2/manipulating/#memory
- [Document Tree](./docs-3.2-manipulating.md#document-tree) - source: /docs/3.2/manipulating/#document-tree
- [Arranging](./docs-3.2-manipulating.md#arranging) - source: /docs/3.2/manipulating/#arranging
- [Geometry](./docs-3.2-manipulating.md#geometry) - source: /docs/3.2/manipulating/#geometry
- [Animating](./docs-3.2-animating.md) - source: /docs/3.2/animating
- [Animate](./docs-3.2-animating.md#animate) - source: /docs/3.2/animating/#animate
- [SVG.Runner](./docs-3.2-animating.md#svg-runner) - source: /docs/3.2/animating/#svg-runner
- [Easing](./docs-3.2-animating.md#easing) - source: /docs/3.2/animating/#easing
- [SVG.Timeline](./docs-3.2-animating.md#svg-timeline) - source: /docs/3.2/animating/#svg-timeline
- [Controllers](./docs-3.2-animating.md#controllers) - source: /docs/3.2/animating/#controllers
- [Orchestrate Animations](./docs-3.2-animating.md#orchestrate-animations) - source: /docs/3.2/animating/#orchestrate-animations
- [Events](./docs-3.2-events.md) - source: /docs/3.2/events
- [Basic events](./docs-3.2-events.md#basic-events) - source: /docs/3.2/events/#basic-events
- [Event listeners](./docs-3.2-events.md#event-listeners) - source: /docs/3.2/events/#event-listeners
- [Custom events](./docs-3.2-events.md#custom-events) - source: /docs/3.2/events/#custom-events
- [Classes](./docs-3.2-classes.md) - source: /docs/3.2/classes
- [SVG.Box](./docs-3.2-classes.md#svg-box) - source: /docs/3.2/classes/#svg-box
- [SVG.List](./docs-3.2-classes.md#svg-list) - source: /docs/3.2/classes/#svg-list
- [SVG.Array](./docs-3.2-classes.md#svg-array) - source: /docs/3.2/classes/#svg-array
- [SVG.PointArray](./docs-3.2-classes.md#svg-pointarray) - source: /docs/3.2/classes/#svg-pointarray
- [SVG.PathArray](./docs-3.2-classes.md#svg-patharray) - source: /docs/3.2/classes/#svg-patharray
- [SVG.Color](./docs-3.2-classes.md#svg-color) - source: /docs/3.2/classes/#svg-color
- [SVG.Matrix](./docs-3.2-classes.md#svg-matrix) - source: /docs/3.2/classes/#svg-matrix
- [SVG.Number](./docs-3.2-classes.md#svg-number) - source: /docs/3.2/classes/#svg-number
- [SVG.Point](./docs-3.2-classes.md#svg-point) - source: /docs/3.2/classes/#svg-point
- [SVG.EventTarget](./docs-3.2-classes.md#svg-eventtarget) - source: /docs/3.2/classes/#svg-eventtarget
- [Importing / Exporting](./docs-3.2-importing-exporting.md) - source: /docs/3.2/importing-exporting
- [Extending](./docs-3.2-extending.md) - source: /docs/3.2/extending
- [SVG.extend](./docs-3.2-extending.md#svg-extend) - source: /docs/3.2/extending/#svg-extend
- [Subclassing](./docs-3.2-extending.md#subclassing) - source: /docs/3.2/extending/#subclassing
- [Tutorials / Examples](./docs-3.2-tutorials.md) - source: /docs/3.2/tutorials
- [Plugins](./docs-3.2-plugins.md) - source: /docs/3.2/plugins
- [svg.easing.js](./docs-3.2-plugins-svg-easing-js.md) - source: /docs/3.2/plugins/svg-easing-js
- [svg.draggable.js](./docs-3.2-plugins-svg-draggable-js.md) - source: /docs/3.2/plugins/svg-draggable-js
- [svg.filter.js](./docs-3.2-plugins-svg-filter-js.md) - source: /docs/3.2/plugins/svg-filter-js
- [svg.topath.js](./docs-3.2-plugins-svg-topath-js.md) - source: /docs/3.2/plugins/svg-topath-js
- [svg.topoly.js](./docs-3.2-plugins-svg-topoly-js.md) - source: /docs/3.2/plugins/svg-topoly-js
- [svg.panzoom.js](./docs-3.2-plugins-svg-panzoom-js.md) - source: /docs/3.2/plugins/svg-panzoom-js
- [ngx-svg](./docs-3.2-plugins-ngx-svg.md) - source: /docs/3.2/plugins/ngx-svg
- [Contributing](./docs-3.2-contributing.md) - source: /docs/3.2/contributing
- [Coding Style](./docs-3.2-contributing-coding-style.md) - source: /docs/3.2/contributing/coding-style
- [Documentation](./docs-3.2-contributing-documentation.md) - source: /docs/3.2/contributing/documentation
- [Compatibility](./docs-3.2-compatibility.md) - source: /docs/3.2/compatibility
- [FAQ](./docs-3.2-faq.md) - source: /docs/3.2/faq
- [Two SVG's are generated when I initialize SVG.js. Is that a bug?](./docs-3.2-faq.md#two-svg-s-are-generated-when-i-initialize-svg-js-is-that-a-bug) - source: /docs/3.2/faq/#two-svg-s-are-generated-when-i-initialize-svg-js-is-that-a-bug
- [Can SVG.js run on Node.js?](./docs-3.2-faq.md#can-svg-js-run-on-node-js) - source: /docs/3.2/faq/#can-svg-js-run-on-node-js
- [How can I modify an element that already exists in the dom?](./docs-3.2-faq.md#how-can-i-modify-an-element-that-already-exists-in-the-dom) - source: /docs/3.2/faq/#how-can-i-modify-an-element-that-already-exists-in-the-dom
- [I need help getting something to work...](./docs-3.2-faq.md#i-need-help-getting-something-to-work) - source: /docs/3.2/faq/#i-need-help-getting-something-to-work
- [I found a bug. Where do I report it?](./docs-3.2-faq.md#i-found-a-bug-where-do-i-report-it) - source: /docs/3.2/faq/#i-found-a-bug-where-do-i-report-it
- [Where can I find tutorials?](./docs-3.2-faq.md#where-can-i-find-tutorials) - source: /docs/3.2/faq/#where-can-i-find-tutorials
- [How do I contribute or fix something in the docs?](./docs-3.2-faq.md#how-do-i-contribute-or-fix-something-in-the-docs) - source: /docs/3.2/faq/#how-do-i-contribute-or-fix-something-in-the-docs
- [Acknowledgements & Thanks](./docs-3.2-acknowledgements-thanks.md) - source: /docs/3.2/acknowledgements-thanks
- [Node.js](./docs-3.2-node-js.md) - source: /docs/3.2/node-js
- [Setup](./docs-3.2-node-js.md#setup) - source: /docs/3.2/node-js/#setup
- [SVG.registerWindow()](./docs-3.2-node-js.md#svg-registerwindow) - source: /docs/3.2/node-js/#svg-registerwindow
- [SVG.getWindow()](./docs-3.2-node-js.md#svg-getwindow) - source: /docs/3.2/node-js/#svg-getwindow
- [SVG.withWindow()](./docs-3.2-node-js.md#svg-withwindow) - source: /docs/3.2/node-js/#svg-withwindow
- [Star](https://github.com/svgdotjs/svg.js)
- [move](./docs-3.2-manipulating.md#move) - source: /docs/3.2/manipulating/#move
- [center](./docs-3.2-manipulating.md#center) - source: /docs/3.2/manipulating/#center
- [MIT License](https://github.com/svgdotjs/svg.js/blob/master/LICENSE.txt)
- [change log](https://github.com/svgdotjs/svg.js/blob/master/CHANGELOG.md)
- [SVG.js](http://svgdotjs.github.io/)
- [Wout Fierens](https://github.com/wout/)
-->
