# Path Creation and Manipulation
Relevant source files
  * [test/tests/Path_Intersections.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Intersections.js)


This document explains how to create and manipulate paths in Paper.js. Paths are one of the core components of Paper.js and represent vector shapes composed of connected segments and curves. For information about boolean operations on paths (unite, intersect, subtract, etc.), see [Boolean Operations](https://deepwiki.com/paperjs/paper.js/3.2-boolean-operations). For detailed information about curves and segments, see [Curves and Segments](https://deepwiki.com/paperjs/paper.js/3.3-curves-and-segments).
## Path Structure Overview
Sources: [src/path/Path.js15-21](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L15-L21) [src/path/Path.js22-27](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L22-L27) [src/path/Path.js169-177](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L177) [src/path/Path.js199-207](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L199-L207)
## Creating Paths
Paper.js provides multiple ways to create paths:
### Using Constructors
You can create a new path using the `Path` constructor:

```

```

// Create an empty path



var path = new Path();




// Create a path with segments



var path = new Path([point1, point2, point3]);




// Create a path with properties



var path = new Path({




    segments: [[20, 20], [80, 80], [140, 20]],




    fillColor: 'black',




    closed: true



});



// Create a path from SVG path data



var path = new Path('M100,50c0,27.614-22.386,50-50,50S0,77.614,0,50S22.386,0,50,0S100,22.386,100,50');


```

```

Sources: [src/path/Path.js28-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L28-L127)
### Using Shape Constructors
Paper.js provides convenient constructors for common shapes:
Sources: [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)
### From SVG Path Data
You can create paths from SVG path data strings using the constructor or `setPathData()` method:

```

```

// Create a new path from SVG path data



var path = new Path('M100,100L200,100L150,200z');




// Set path data to existing path



var path = new Path();




path.setPathData('M100,100L200,100L150,200z');


```

```

Sources: [src/path/PathItem.js127-249](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L127-L249)
## Working with Segments
Paths in Paper.js are made up of segments. Each segment consists of a point and optional handles (handleIn and handleOut) that control the curvature around the point.
### Accessing Segments

```

```

// Get all segments



var segments = path.segments;




// Get first and last segments



var firstSegment = path.firstSegment;




var lastSegment = path.lastSegment;




// Get segment at specific index



var segment = path.segments[2];


```

```

Sources: [src/path/Path.js169-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L169-L216)
### Adding Segments

```

```

// Add a segment at the end of the path



path.add(new Point(100, 100));




// Add multiple segments



path.add([100, 200], [200, 300]);




// Add a segment with handles



path.add(new Segment(




    new Point(100, 20),




    new Point(-50, 0),  // handle in




    new Point(50, 0// handle out



));

```

```

Sources: [src/path/Path.js481-558](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L481-L558) [src/path/Path.js604-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L604-L611) [src/path/Path.js654-657](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L654-L657)
### Inserting Segments

```

```

// Insert a segment at a specific index



path.insert(1, new Point(50, 50));




// Insert multiple segments at a specific index



path.insert(1, [new Point(50, 50), new Point(70, 70)]);


```

```

Sources: [src/path/Path.js595-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L595-L603) [src/path/Path.js609-611](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L609-L611) [src/path/Path.js669-671](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L669-L671)
### Removing Segments

```

```

// Remove a segment



path.removeSegment(1);




// Remove segments in a range



path.removeSegments(1, 3);




// Remove all segments



path.removeSegments();


```

```

Sources: [src/path/Path.js696-780](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L696-L780) [src/path/Path.js782-783](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L782-L783)
## Working with Curves
Curves in Paper.js are automatically created between consecutive segments. Each curve is a cubic Bézier curve defined by four points: the two segment points and their handles.
Sources: [src/path/Curve.js14-26](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L14-L26) [src/path/Path.js224-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L224-L257)
### Accessing Curves

```

```

// Get all curves



var curves = path.curves;




// Get first and last curves



var firstCurve = path.firstCurve;




var lastCurve = path.lastCurve;


```

```

Sources: [src/path/Path.js224-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L224-L257)
### Manipulating Curves
Curves can be manipulated indirectly by adjusting segment handles:

```

```

// Adjust curve shape by modifying segment handles



path.segments[1].handleIn = new Point(-20, -10);




path.segments[1].handleOut = new Point(20, 10);




// Clear handles to convert a curve to a straight line



path.segments[1].clearHandles();




// Clear all handles



path.clearHandles();


```

```

Sources: [src/path/Path.js792-809](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L792-L809) [src/path/Curve.js580-583](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L580-L583)
## Path Manipulation
### Path Geometry Properties

```

```

// Get path length



var length = path.length;




// Get path area



var area = path.area;




// Check if path is closed



var isClosed = path.closed;




// Close path



path.closed = true;


```

```

Sources: [src/path/Path.js816-852](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L816-L852) [src/path/Path.js276-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L276-L296)
### Dividing and Splitting Paths

```

```

// Divide a path at a specific location



var newSegment = path.divideAt(location);




// Split a path at a location, creating two separate paths



var newPath = path.splitAt(location);


```

```

Sources: [src/path/Path.js968-1042](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L968-L1042) [src/path/Curve.js454-515](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L454-L515)
### Path Simplification

```

```

// Simplify a path to reduce the number of segments



path.simplify();




// Control the level of simplification



path.simplify(10); // Higher value means more aggressive simplification


```

```

The `simplify()` method uses the `PathFitter` class to fit a smooth curve with fewer segments to the original path, using an algorithm based on "An Algorithm for Automatically Fitting Digitized Curves" by Philip J. Schneider.
Sources: [src/path/PathFitter.js22-242](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L22-L242)
### Path Flattening

```

```

// Flatten curves to straight line segments



path.flatten();




// Control the flatness (maximum allowed distance between the


// original curve and the flattened representation)



path.flatten(0.5);


```

```

The `flatten()` method uses the `PathFlattener` class to convert curves into a sequence of straight lines by recursively subdividing curves until they are within a specified tolerance of a straight line.
Sources: [src/path/PathFlattener.js18-167](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js#L18-L167)
### Smoothing Paths

```

```

// Smooth a path



path.smooth();




// Specify smoothing options



path.smooth({




    type: 'continuous',




    factor: 0.5



});

```

```

Paper.js supports four different smoothing methods:
  * `'continuous'`: Smooths with continuous first and second derivatives
  * `'asymmetric'`: The legacy method (default for backward compatibility)
  * `'catmull-rom'`: Uses the Catmull-Rom spline algorithm
  * `'geometric'`: Uses a simple geometric method


Sources: [src/path/PathItem.js457-527](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L457-L527)
## Path Selection
Paper.js provides visual selection of paths for editing and debugging:

```

```

// Select a path



path.selected = true;




// Fully select a path (including all segments)



path.fullySelected = true;




// Select specific segments



path.segments[1].selected = true;


```

```

Sources: [src/path/Path.js853-967](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L853-L967)
## Path Operations with Other Paths
### Joining Paths

```

```

// Join two paths



var path1 = new Path([0, 0], [50, 0]);




var path2 = new Path([50, 0], [100, 50]);




path1.join(path2);



// Result: path1 now contains points [0, 0], [50, 0], [100, 50]


// and path2 is removed

```

```

Sources: [src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)
### Finding Intersections

```

```

// Find all intersections between two paths



var intersections = path1.getIntersections(path2);




// Get intersection points



for (var= 0; i  intersections.length; i++) {




    var point = intersections[i].point;



```

```

Intersection detection is handled through the `CurveLocation` class, which provides methods to find and manage locations on curves.
Sources: [src/path/PathItem.js321-339](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L339) [src/path/CurveLocation.js29-499](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js#L29-L499)
## Example: Building a Path Interactively
The following is an example of how to create an interactive Bézier curve editor:

```

```

// Create a new path



var path = new Path();




path.strokeColor = 'black';




// Add initial segments



path.add(new Point(30, 75));




path.add(new Point(100, 20));




path.add(new Point(170, 75));




// Select the path to show handles



path.fullySelected = true;




// Now you can adjust segment points and handles interactively

```

```

This code creates a path with three points and shows all the control points and handles for editing. You can then manipulate the path through interactions like dragging points or handles.
Sources: [examples/Tools/BezierTool.html8-79](https://github.com/paperjs/paper.js/blob/92775f52/examples/Tools/BezierTool.html#L8-L79)
## Implementation Details
The Path class extends PathItem, which provides common functionality for path-based items. The `Path` constructor handles various initialization scenarios, including creation from segments, points, SVG path data, or an object literal with properties.
When segments are modified, curves between segments are automatically updated. Paper.js maintains segment and curve indices, so when segments are added or removed, all affected indices are updated.
Boolean operations, covered in another section [Boolean Operations](https://deepwiki.com/paperjs/paper.js/3.2-boolean-operations), allow for complex path combinations including unite, subtract, intersect, exclude, and divide.
Sources: [src/path/Path.js88-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L88-L127) [src/path/Path.js139-156](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L139-L156) [src/path/PathItem.Boolean.js29-46](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L29-L46)
Refresh this wiki
Enter email to refresh
### On this page
  * [Path Creation and Manipulation](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#path-creation-and-manipulation)
  * [Path Structure Overview](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#path-structure-overview)
  * [Using Shape Constructors](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#using-shape-constructors)
  * [Path Geometry Properties](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#path-geometry-properties)
  * [Dividing and Splitting Paths](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#dividing-and-splitting-paths)
  * [Path Operations with Other Paths](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#path-operations-with-other-paths)
  * [Example: Building a Path Interactively](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#example-building-a-path-interactively)
  * [Implementation Details](https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation#implementation-details)


