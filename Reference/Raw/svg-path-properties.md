# svg-path-properties

## Calculate the length, point and tangent at distance for an SVG path, to use it with node, Canvas or SVG element

[](https://github.com/rveciana/svg-path-properties) ![Example](./example.svg)

SVG comes with the **getTotalLength()** and **getPointAtLength()** methods, which are useful for animations or adding markers at the paths.

Calculating these values using Node or the Canvas element can be quite complicated. This library allows doing this and more things.

View on [Github](https://github.com/rveciana/svg-path-properties)

## Usage

The usage is very simple, just pass the path into the class and call the needed methods:

      var path = require("svg-path-properties");
      var properties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
      var length = properties.getTotalLength();
      var point = properties.getPointAtLength(200);
      var tangent = properties.getTangentAtLength(200);
      var allProperties = properties.getPropertiesAtLength(200);

- **getTotalLength()** gives the length of the path in pixels, as in the SVG function
- **getPointAtLength(pixels)** gives the position of the path at the *pixels* distance, as in the SVG function
- **getTangentAtLength(pixels)** gives the normalized tangent of the path at the *pixels* distance. SVG hasn't got this function
- **getPropertiesAtLength(pixels)** gives the position of the path and the normalized at the *pixels* distance, so the function has to be calculated once for performance reasons

## Install

To use it with npm, just type:

    npm install svg-path-properties

To it in the browser, add:

    <script src="https://npmcdn.com/svg-path-properties/build/path-properties.js">

## Tests and examples

- [Visual tests for all path types](tests.html)
- [Canvas + getTotalLength() application: Animated path on a map](tests.htmlhttp://bl.ocks.org/rveciana/209fa7efeb01f05fa4a544a76ac8ed91)
- [Point-along-a-path example made with Canvas instead of SVG](http://bl.ocks.org/rveciana/77655c3c0e3073c19da34af6dc84c4b9)

## Credits

To calculate the functions and parsing the paths, I've taken information and code from several places. They are basically these

- <http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5>
- <https://gist.github.com/tunght13488/6744e77c242cc7a94859>
- <http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier>
- <http://pomax.github.io/bezierinfo>
- <https://github.com/jkroso/parse-svg-path>

<!--
## Source links

- [https://github.com/rveciana/svg-path-properties](https://github.com/rveciana/svg-path-properties)
- [Visual tests for all path types](tests.html)
- [Canvas + getTotalLength() application: Animated path on a map](tests.htmlhttp://bl.ocks.org/rveciana/209fa7efeb01f05fa4a544a76ac8ed91)
- [Point-along-a-path example made with Canvas instead of SVG](http://bl.ocks.org/rveciana/77655c3c0e3073c19da34af6dc84c4b9)
- [http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5](http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5)
- [https://gist.github.com/tunght13488/6744e77c242cc7a94859](https://gist.github.com/tunght13488/6744e77c242cc7a94859)
- [http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier](http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier)
- [http://pomax.github.io/bezierinfo](http://pomax.github.io/bezierinfo)
- [https://github.com/jkroso/parse-svg-path](https://github.com/jkroso/parse-svg-path)
-->
