!SVG.js logo

# SVG.js

2.7 3.0 3.1 3.2

# SVG.js

The lightweight library for manipulating and animating SVG.

[Star](https://github.com/svgdotjs/svg.js)

\

## Why choose SVG.js?

SVG.js has no dependencies and aims to be as small as possible while providing close to complete coverage of the SVG spec. If you're not convinced yet, here are a few highlights.

\

## It's speedy.

SVG.js is fast. Obviously not as fast as vanilla js, but many times faster than the competition:

Index:

- `rects`: **`generate 10000 rects`**
- `fill`: **`generate 10000 rects with fill color`**
- `gradient`: **`generate 10000 rects with gradient fill`**

*Less is better. Tested on an Intel Core i7-4702MQ @ 2.2GHz.*

\

## Easy readable, uncluttered syntax.

Creating and manipulating SVG using JavaScript alone is pretty verbose. For example, just creating a simple pink square requires quite a lot of code:

SVG.js provides a syntax that is concise and easy to read. Doing the same as the vanilla js example above:

    // SVG.js
    var draw = SVG().addTo('#drawing')
      , rect = draw.rect(100, 100).fill('#f06')

That's just **two** lines of code instead of **ten**! And a whole lot less repetition.

\

## Go crazy with animations

\

## There is more...

- animations on size, position, transformations, color, ...
- painless extension thanks to the modular structure
- various useful plugins available
- unified api between shape types with move, size, center, ...
- binding events to elements
- full support for opacity masks and clipping paths
- text paths, even animated
- element groups
- dynamic gradients and patterns
- fully documented (you're looking at it :)

### License

SVG.js is licensed under the terms of the [MIT License](https://github.com/svgdotjs/svg.js/blob/master/LICENSE.txt).

### Changelog

Wondering what has changed in the latest releases? Have a look at the [change log](https://github.com/svgdotjs/svg.js/blob/master/CHANGELOG.md).

<!--
## Source links

- SVG.js - source: `/docs/3.2`
- Installation - source: `/docs/3.2/installation`
- Getting started - source: `/docs/3.2/getting-started`
- Container Elements - source: `/docs/3.2/container-elements`
- SVG.Svg - source: `/docs/3.2/container-elements/#svg-svg`
- SVG.G - source: `/docs/3.2/container-elements/#svg-g`
- SVG.Symbol - source: `/docs/3.2/container-elements/#svg-symbol`
- SVG.Defs - source: `/docs/3.2/container-elements/#svg-defs`
- SVG.A - source: `/docs/3.2/container-elements/#svg-a`
- Other Elements - source: `/docs/3.2/shape-elements`
- General Handling of svg.js elements - source: `/docs/3.2/shape-elements/#general-handling-of-svg-js-elements`
- SVG.Dom - source: `/docs/3.2/shape-elements/#svg-bare`
- SVG.Rect - source: `/docs/3.2/shape-elements/#svg-rect`
- SVG.Circle - source: `/docs/3.2/shape-elements/#svg-circle`
- SVG.Ellipse - source: `/docs/3.2/shape-elements/#svg-ellipse`
- SVG.Line - source: `/docs/3.2/shape-elements/#svg-line`
- SVG.Polyline - source: `/docs/3.2/shape-elements/#svg-polyline`
- SVG.Polygon - source: `/docs/3.2/shape-elements/#svg-polygon`
- SVG.Path - source: `/docs/3.2/shape-elements/#svg-path`
- SVG.Text - source: `/docs/3.2/shape-elements/#svg-text`
- SVG.TextPath - source: `/docs/3.2/shape-elements/#svg-textpath`
- SVG.Tspan - source: `/docs/3.2/shape-elements/#svg-tspan`
- SVG.Image - source: `/docs/3.2/shape-elements/#svg-image`
- SVG.Gradient - source: `/docs/3.2/shape-elements/#svg-gradient`
- SVG.Stop - source: `/docs/3.2/shape-elements/#svg-stop`
- SVG.Pattern - source: `/docs/3.2/shape-elements/#svg-pattern`
- SVG.Mask - source: `/docs/3.2/shape-elements/#svg-mask`
- SVG.ClipPath - source: `/docs/3.2/shape-elements/#svg-clippath`
- SVG.Use - source: `/docs/3.2/shape-elements/#svg-use`
- SVG.Marker - source: `/docs/3.2/shape-elements/#svg-marker`
- SVG.Style - source: `/docs/3.2/shape-elements/#svg-style`
- SVG.ForeignObject - source: `/docs/3.2/shape-elements/#svg-foreignobject`
- Referencing / Creating Elements - source: `/docs/3.2/referencing-creating-elements`
- Referencing using CSS selectors - source: `/docs/3.2/referencing-creating-elements/#using-css-selectors`
- Referencing existing DOM elements - source: `/docs/3.2/referencing-creating-elements/#existing-dom-elements`
- Using jQuery or Zepto - source: `/docs/3.2/referencing-creating-elements/#using-jquery-or-zepto`
- Circular reference - source: `/docs/3.2/referencing-creating-elements/#circular-reference`
- Child references - source: `/docs/3.2/referencing-creating-elements/#child-references`
- Parent references - source: `/docs/3.2/referencing-creating-elements/#parent-references`
- URI references - source: `/docs/3.2/referencing-creating-elements/#uri-references`
- Creating Elements - source: `/docs/3.2/referencing-creating-elements/#creating-elements`
- Manipulating - source: `/docs/3.2/manipulating`
- Attributes - source: `/docs/3.2/manipulating/#attributes`
- Positioning - source: `/docs/3.2/manipulating/#positioning`
- Resizing - source: `/docs/3.2/manipulating/#resizing`
- Syntactic sugar - source: `/docs/3.2/manipulating/#syntactic-sugar`
- Transforming - source: `/docs/3.2/manipulating/#transforming`
- Styles - source: `/docs/3.2/manipulating/#styles`
- Classes - source: `/docs/3.2/manipulating/#classes`
- Data - source: `/docs/3.2/manipulating/#data`
- Memory - source: `/docs/3.2/manipulating/#memory`
- Document Tree - source: `/docs/3.2/manipulating/#document-tree`
- Arranging - source: `/docs/3.2/manipulating/#arranging`
- Geometry - source: `/docs/3.2/manipulating/#geometry`
- Animating - source: `/docs/3.2/animating`
- Animate - source: `/docs/3.2/animating/#animate`
- SVG.Runner - source: `/docs/3.2/animating/#svg-runner`
- Easing - source: `/docs/3.2/animating/#easing`
- SVG.Timeline - source: `/docs/3.2/animating/#svg-timeline`
- Controllers - source: `/docs/3.2/animating/#controllers`
- Orchestrate Animations - source: `/docs/3.2/animating/#orchestrate-animations`
- Events - source: `/docs/3.2/events`
- Basic events - source: `/docs/3.2/events/#basic-events`
- Event listeners - source: `/docs/3.2/events/#event-listeners`
- Custom events - source: `/docs/3.2/events/#custom-events`
- Classes - source: `/docs/3.2/classes`
- SVG.Box - source: `/docs/3.2/classes/#svg-box`
- SVG.List - source: `/docs/3.2/classes/#svg-list`
- SVG.Array - source: `/docs/3.2/classes/#svg-array`
- SVG.PointArray - source: `/docs/3.2/classes/#svg-pointarray`
- SVG.PathArray - source: `/docs/3.2/classes/#svg-patharray`
- SVG.Color - source: `/docs/3.2/classes/#svg-color`
- SVG.Matrix - source: `/docs/3.2/classes/#svg-matrix`
- SVG.Number - source: `/docs/3.2/classes/#svg-number`
- SVG.Point - source: `/docs/3.2/classes/#svg-point`
- SVG.EventTarget - source: `/docs/3.2/classes/#svg-eventtarget`
- Importing / Exporting - source: `/docs/3.2/importing-exporting`
- Extending - source: `/docs/3.2/extending`
- SVG.extend - source: `/docs/3.2/extending/#svg-extend`
- Subclassing - source: `/docs/3.2/extending/#subclassing`
- Tutorials / Examples - source: `/docs/3.2/tutorials`
- Plugins - source: `/docs/3.2/plugins`
- svg.easing.js - source: `/docs/3.2/plugins/svg-easing-js`
- svg.draggable.js - source: `/docs/3.2/plugins/svg-draggable-js`
- svg.filter.js - source: `/docs/3.2/plugins/svg-filter-js`
- svg.topath.js - source: `/docs/3.2/plugins/svg-topath-js`
- svg.topoly.js - source: `/docs/3.2/plugins/svg-topoly-js`
- svg.panzoom.js - source: `/docs/3.2/plugins/svg-panzoom-js`
- ngx-svg - source: `/docs/3.2/plugins/ngx-svg`
- Contributing - source: `/docs/3.2/contributing`
- Coding Style - source: `/docs/3.2/contributing/coding-style`
- Documentation - source: `/docs/3.2/contributing/documentation`
- Compatibility - source: `/docs/3.2/compatibility`
- FAQ - source: `/docs/3.2/faq`
- Two SVG's are generated when I initialize SVG.js. Is that a bug? - source: `/docs/3.2/faq/#two-svg-s-are-generated-when-i-initialize-svg-js-is-that-a-bug`
- Can SVG.js run on Node.js? - source: `/docs/3.2/faq/#can-svg-js-run-on-node-js`
- How can I modify an element that already exists in the dom? - source: `/docs/3.2/faq/#how-can-i-modify-an-element-that-already-exists-in-the-dom`
- I need help getting something to work... - source: `/docs/3.2/faq/#i-need-help-getting-something-to-work`
- I found a bug. Where do I report it? - source: `/docs/3.2/faq/#i-found-a-bug-where-do-i-report-it`
- Where can I find tutorials? - source: `/docs/3.2/faq/#where-can-i-find-tutorials`
- How do I contribute or fix something in the docs? - source: `/docs/3.2/faq/#how-do-i-contribute-or-fix-something-in-the-docs`
- Acknowledgements & Thanks - source: `/docs/3.2/acknowledgements-thanks`
- Node.js - source: `/docs/3.2/node-js`
- Setup - source: `/docs/3.2/node-js/#setup`
- SVG.registerWindow() - source: `/docs/3.2/node-js/#svg-registerwindow`
- SVG.getWindow() - source: `/docs/3.2/node-js/#svg-getwindow`
- SVG.withWindow() - source: `/docs/3.2/node-js/#svg-withwindow`
- [Star](https://github.com/svgdotjs/svg.js)
- move - source: `/docs/3.2/manipulating/#move`
- center - source: `/docs/3.2/manipulating/#center`
- [MIT License](https://github.com/svgdotjs/svg.js/blob/master/LICENSE.txt)
- [change log](https://github.com/svgdotjs/svg.js/blob/master/CHANGELOG.md)
- [SVG.js](http://svgdotjs.github.io/)
- [Wout Fierens](https://github.com/wout/)
-->
