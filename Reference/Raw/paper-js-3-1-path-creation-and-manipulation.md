Menu

# Path Creation and Manipulation

Relevant source files

- [examples/Tools/BezierTool.html](https://github.com/paperjs/paper.js/blob/92775f52/examples/Tools/BezierTool.html)
- [src/basic/Line.js](https://github.com/paperjs/paper.js/blob/92775f52/src/basic/Line.js)
- [src/path/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js)
- [src/path/CurveLocation.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js)
- [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)
- [src/path/PathFitter.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js)
- [src/path/PathFlattener.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js)
- [src/path/PathItem.Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js)
- [src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)
- [src/util/CollisionDetection.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js)
- [src/util/Numerical.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/Numerical.js)
- [test/index.html](https://github.com/paperjs/paper.js/blob/92775f52/test/index.html)
- [test/tests/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Curve.js)
- [test/tests/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path.js)
- [test/tests/Path_Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Boolean.js)
- [test/tests/Path_Intersections.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Intersections.js)
- [test/tests/Style.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Style.js)

This document explains how to create and manipulate paths in Paper.js. Paths are one of the core
components of Paper.js and represent vector shapes composed of connected segments and curves. For
information about boolean operations on paths (unite, intersect, subtract, etc.), see
[Boolean Operations](./paperjs-paper.js-3.2-boolean-operations.md). For detailed information about
curves and segments, see [Curves and Segments](./paperjs-paper.js-3.3-curves-and-segments.md).

## Path Structure Overview

- [src/path/Path.js 15-21](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L15-L21)
- [src/path/Path.js 22-27](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L22-L27)
- [src/path/Path.js 169-177](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L177)
- [src/path/Path.js 199-207](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L199-L207)

## Creating Paths

Paper.js provides multiple ways to create paths:

### Using Constructors

You can create a new path using the `Path` constructor:

```
// Create an empty pathvar path = new Path(); // Create a path with segmentsvar path = new Path([point1, point2, point3]); // Create a path with propertiesvar path = new Path({    segments: [[20, 20], [80, 80], [140, 20]],    fillColor: 'black',    closed: true}); // Create a path from SVG path datavar path = new Path('M100,50c0,27.614-22.386,50-50,50S0,77.614,0,50S22.386,0,50,0S100,22.386,100,50');
```

Sources:
[src/path/Path.js 28-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L28-L127)

### Using Shape Constructors

Paper.js provides convenient constructors for common shapes:

Sources: [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)

### From SVG Path Data

You can create paths from SVG path data strings using the constructor or `setPathData()` method:

```
// Create a new path from SVG path datavar path = new Path('M100,100L200,100L150,200z'); // Set path data to existing pathvar path = new Path();path.setPathData('M100,100L200,100L150,200z');
```

Sources:
[src/path/PathItem.js 127-249](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L127-L249)

## Working with Segments

Paths in Paper.js are made up of segments. Each segment consists of a point and optional handles
(handleIn and handleOut) that control the curvature around the point.

### Accessing Segments

```
// Get all segmentsvar segments = path.segments; // Get first and last segmentsvar firstSegment = path.firstSegment;var lastSegment = path.lastSegment; // Get segment at specific indexvar segment = path.segments[2];
```

Sources:
[src/path/Path.js 169-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L216)

### Adding Segments

```
// Add a segment at the end of the pathpath.add(new Point(100, 100)); // Add multiple segmentspath.add([100, 200], [200, 300]); // Add a segment with handlespath.add(new Segment(    new Point(100, 20),    new Point(-50, 0),  // handle in    new Point(50, 0)    // handle out));
```

- [src/path/Path.js 481-558](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L481-L558)
- [src/path/Path.js 604-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L604-L611)
- [src/path/Path.js 654-657](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L654-L657)

### Inserting Segments

```
// Insert a segment at a specific indexpath.insert(1, new Point(50, 50)); // Insert multiple segments at a specific indexpath.insert(1, [new Point(50, 50), new Point(70, 70)]);
```

- [src/path/Path.js 595-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L595-L603)
- [src/path/Path.js 609-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L609-L611)
- [src/path/Path.js 669-671](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L669-L671)

### Removing Segments

```
// Remove a segmentpath.removeSegment(1); // Remove segments in a rangepath.removeSegments(1, 3); // Remove all segmentspath.removeSegments();
```

Sources:
[src/path/Path.js 696-780](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L696-L780)
[src/path/Path.js 782-783](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L782-L783)

## Working with Curves

Curves in Paper.js are automatically created between consecutive segments. Each curve is a cubic
Bézier curve defined by four points: the two segment points and their handles.

Sources:
[src/path/Curve.js 14-26](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L14-L26)
[src/path/Path.js 224-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L224-L257)

### Accessing Curves

```
// Get all curvesvar curves = path.curves; // Get first and last curvesvar firstCurve = path.firstCurve;var lastCurve = path.lastCurve;
```

Sources:
[src/path/Path.js 224-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L224-L257)

### Manipulating Curves

Curves can be manipulated indirectly by adjusting segment handles:

```
// Adjust curve shape by modifying segment handlespath.segments[1].handleIn = new Point(-20, -10);path.segments[1].handleOut = new Point(20, 10); // Clear handles to convert a curve to a straight linepath.segments[1].clearHandles(); // Clear all handlespath.clearHandles();
```

Sources:
[src/path/Path.js 792-809](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L792-L809)
[src/path/Curve.js 580-583](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L580-L583)

## Path Manipulation

### Path Geometry Properties

```
// Get path lengthvar length = path.length; // Get path areavar area = path.area; // Check if path is closedvar isClosed = path.closed; // Close pathpath.closed = true;
```

Sources:
[src/path/Path.js 816-852](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L816-L852)
[src/path/Path.js 276-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L276-L296)

### Dividing and Splitting Paths

```
// Divide a path at a specific locationvar newSegment = path.divideAt(location); // Split a path at a location, creating two separate pathsvar newPath = path.splitAt(location);
```

Sources:
[src/path/Path.js 968-1042](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L968-L1042)
[src/path/Curve.js 454-515](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L454-L515)

### Path Simplification

```
// Simplify a path to reduce the number of segmentspath.simplify(); // Control the level of simplificationpath.simplify(10); // Higher value means more aggressive simplification
```

The `simplify()` method uses the `PathFitter` class to fit a smooth curve with fewer segments to the
original path, using an algorithm based on "An Algorithm for Automatically Fitting Digitized Curves"
by Philip J. Schneider.

Sources:
[src/path/PathFitter.js 22-242](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L22-L242)

### Path Flattening

```
// Flatten curves to straight line segmentspath.flatten(); // Control the flatness (maximum allowed distance between the// original curve and the flattened representation)path.flatten(0.5);
```

The `flatten()` method uses the `PathFlattener` class to convert curves into a sequence of straight
lines by recursively subdividing curves until they are within a specified tolerance of a straight
line.

Sources:
[src/path/PathFlattener.js 18-167](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js#L18-L167)

### Smoothing Paths

```
// Smooth a pathpath.smooth(); // Specify smoothing optionspath.smooth({    type: 'continuous',    factor: 0.5});
```

Paper.js supports four different smoothing methods:

- `'continuous'`: Smooths with continuous first and second derivatives
- `'asymmetric'`: The legacy method (default for backward compatibility)
- `'catmull-rom'`: Uses the Catmull-Rom spline algorithm
- `'geometric'`: Uses a simple geometric method

Sources:
[src/path/PathItem.js 457-527](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L457-L527)

## Path Selection

Paper.js provides visual selection of paths for editing and debugging:

```
// Select a pathpath.selected = true; // Fully select a path (including all segments)path.fullySelected = true; // Select specific segmentspath.segments[1].selected = true;
```

Sources:
[src/path/Path.js 853-967](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L853-L967)

## Path Operations with Other Paths

### Joining Paths

```
// Join two pathsvar path1 = new Path([0, 0], [50, 0]);var path2 = new Path([50, 0], [100, 50]);path1.join(path2);// Result: path1 now contains points [0, 0], [50, 0], [100, 50]// and path2 is removed
```

Sources:
[src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)

### Finding Intersections

```
// Find all intersections between two pathsvar intersections = path1.getIntersections(path2); // Get intersection pointsfor (var i = 0; i < intersections.length; i++) {    var point = intersections[i].point;}
```

Intersection detection is handled through the `CurveLocation` class, which provides methods to find
and manage locations on curves.

Sources:
[src/path/PathItem.js 321-339](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L339)
[src/path/CurveLocation.js 29-499](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js#L29-L499)

## Example: Building a Path Interactively

The following is an example of how to create an interactive Bézier curve editor:

```
// Create a new pathvar path = new Path();path.strokeColor = 'black'; // Add initial segmentspath.add(new Point(30, 75));path.add(new Point(100, 20));path.add(new Point(170, 75)); // Select the path to show handlespath.fullySelected = true; // Now you can adjust segment points and handles interactively
```

This code creates a path with three points and shows all the control points and handles for editing.
You can then manipulate the path through interactions like dragging points or handles.

Sources:
[examples/Tools/BezierTool.html 8-79](https://github.com/paperjs/paper.js/blob/92775f52/examples/Tools/BezierTool.html#L8-L79)

## Implementation Details

The Path class extends PathItem, which provides common functionality for path-based items. The
`Path` constructor handles various initialization scenarios, including creation from segments,
points, SVG path data, or an object literal with properties.

When segments are modified, curves between segments are automatically updated. Paper.js maintains
segment and curve indices, so when segments are added or removed, all affected indices are updated.

Boolean operations, covered in another section
[Boolean Operations](./paperjs-paper.js-3.2-boolean-operations.md), allow for complex path
combinations including unite, subtract, intersect, exclude, and divide.

- [src/path/Path.js 88-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L88-L127)
- [src/path/Path.js 139-156](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L139-L156)
- [src/path/PathItem.Boolean.js 29-46](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L29-L46)

Refresh this wiki

- [Path Creation and Manipulation](#path-creation-and-manipulation)
- [Path Structure Overview](#path-structure-overview)
- [Creating Paths](#creating-paths)
- [Using Constructors](#using-constructors)
- [Using Shape Constructors](#using-shape-constructors)
- [From SVG Path Data](#from-svg-path-data)
- [Working with Segments](#working-with-segments)
- [Accessing Segments](#accessing-segments)
- [Adding Segments](#adding-segments)
- [Inserting Segments](#inserting-segments)
- [Removing Segments](#removing-segments)
- [Working with Curves](#working-with-curves)
- [Accessing Curves](#accessing-curves)
- [Manipulating Curves](#manipulating-curves)
- [Path Manipulation](#path-manipulation)
- [Path Geometry Properties](#path-geometry-properties)
- [Dividing and Splitting Paths](#dividing-and-splitting-paths)
- [Path Simplification](#path-simplification)
- [Path Flattening](#path-flattening)
- [Smoothing Paths](#smoothing-paths)
- [Path Selection](#path-selection)
- [Path Operations with Other Paths](#path-operations-with-other-paths)
- [Joining Paths](#joining-paths)
- [Finding Intersections](#finding-intersections)
- [Example: Building a Path Interactively](#example-building-a-path-interactively)
- [Implementation Details](#implementation-details)

<!--
## Source links

- [examples/Tools/BezierTool.html](https://github.com/paperjs/paper.js/blob/92775f52/examples/Tools/BezierTool.html)
- [src/basic/Line.js](https://github.com/paperjs/paper.js/blob/92775f52/src/basic/Line.js)
- [src/path/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js)
- [src/path/CurveLocation.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js)
- [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)
- [src/path/PathFitter.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js)
- [src/path/PathFlattener.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js)
- [src/path/PathItem.Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js)
- [src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)
- [src/util/CollisionDetection.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js)
- [src/util/Numerical.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/Numerical.js)
- [test/index.html](https://github.com/paperjs/paper.js/blob/92775f52/test/index.html)
- [test/tests/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Curve.js)
- [test/tests/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path.js)
- [test/tests/Path_Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Boolean.js)
- [test/tests/Path_Intersections.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Intersections.js)
- [test/tests/Style.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Style.js)
- [Boolean Operations](./paperjs-paper.js-3.2-boolean-operations.md) - source: /paperjs/paper.js/3.2-boolean-operations
- [Curves and Segments](./paperjs-paper.js-3.3-curves-and-segments.md) - source: /paperjs/paper.js/3.3-curves-and-segments
- [src/path/Path.js 15-21](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L15-L21)
- [src/path/Path.js 22-27](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L22-L27)
- [src/path/Path.js 169-177](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L177)
- [src/path/Path.js 199-207](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L199-L207)
- [src/path/Path.js 28-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L28-L127)
- [src/path/PathItem.js 127-249](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L127-L249)
- [src/path/Path.js 169-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L216)
- [src/path/Path.js 481-558](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L481-L558)
- [src/path/Path.js 604-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L604-L611)
- [src/path/Path.js 654-657](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L654-L657)
- [src/path/Path.js 595-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L595-L603)
- [src/path/Path.js 609-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L609-L611)
- [src/path/Path.js 669-671](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L669-L671)
- [src/path/Path.js 696-780](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L696-L780)
- [src/path/Path.js 782-783](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L782-L783)
- [src/path/Curve.js 14-26](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L14-L26)
- [src/path/Path.js 224-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L224-L257)
- [src/path/Path.js 792-809](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L792-L809)
- [src/path/Curve.js 580-583](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L580-L583)
- [src/path/Path.js 816-852](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L816-L852)
- [src/path/Path.js 276-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L276-L296)
- [src/path/Path.js 968-1042](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L968-L1042)
- [src/path/Curve.js 454-515](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L454-L515)
- [src/path/PathFitter.js 22-242](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L22-L242)
- [src/path/PathFlattener.js 18-167](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js#L18-L167)
- [src/path/PathItem.js 457-527](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L457-L527)
- [src/path/Path.js 853-967](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L853-L967)
- [src/path/PathItem.js 321-339](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L339)
- [src/path/CurveLocation.js 29-499](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js#L29-L499)
- [examples/Tools/BezierTool.html 8-79](https://github.com/paperjs/paper.js/blob/92775f52/examples/Tools/BezierTool.html#L8-L79)
- [src/path/Path.js 88-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L88-L127)
- [src/path/Path.js 139-156](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L139-L156)
- [src/path/PathItem.Boolean.js 29-46](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L29-L46)
-->
