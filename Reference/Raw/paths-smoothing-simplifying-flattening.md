# Smoothing, Simplifying & Flattening

Paper.js offers two different ways to smooth a path.

[`path.smooth()`](./reference-path.md#smooth) smooths a path by changing its segment handles without adding or removing segment points.

[`path.simplify()`](./reference-path.md#simplify) smooths a path by analyzing its [`path.segments`](./reference-path.md#segments) array and replacing it with a more optimal set of segments, reducing memory usage and speeding up drawing.

## Smoothing Paths

Paper.js allows you to automatically smooth paths using the [`path.smooth()`](./reference-path.md#smooth) function. This function calculates the optimal values for the handles of the path's segment points to create curves that flow smoothly through them. The segments are not moved and the current handle settings of the path's segments are ignored.

In the following example, we create a rectangle shaped path, create a copy of it and smooth the copy. As you can see, only the handle positions are changed. The segment points remain unchanged.

 

 

var path = new Path({

    segments: \[\[30, 75\], \[30, 25\], \[80, 25\], \[80, 75\]\],

    strokeColor: 'black',

    closed: true

});

 

// Select the path, so we can see its handles:

path.fullySelected = true;

 

// Create a copy of the path and move it 100pt to the right:

var copy = path.clone();

copy.fullySelected = true;

copy.position.x += 100;

 

// Smooth the segments of the copy:

copy.smooth();

Click and drag in the view below to draw a line, when you release the mouse, the path is smoothed using [`path.smooth()`](./reference-path.md#smooth):

## Simplifying Paths

[`path.simplify()`](./reference-path.md#simplify) smooths a path by simplifying it. The path.segments array is analyzed and replaced by a more optimal set of segments, reducing memory usage and speeding up drawing.

The [`path.simplify()`](./reference-path.md#simplify) function has an optional `tolerance` parameter, which specifies the maximum distance the simplifying algorithm is allowed to deviate from the original path. This value is set to `2.5` by default. Setting it to a lower value, produces a more correct path but with more segment points. Setting it to a higher value leads to a smoother curve and less segment points, but the shape of the path will be more different than the original.

## Flattening Paths

[`path.flatten(error)`](./reference-path.md#flatten-error) converts the curves in a path to straight lines with a maximum specified error. The resulting lines are guaranteed to not be further away than the amount specified by the `error` parameter.

In the following example, we create a circle shaped path and straighten it using [`path.flatten(20)`](./reference-path.md#flatten-error):

 

 

// Create a circle shaped path at { x: 80, y: 50 }

// with a radius of 35:

var path = new Path.Circle({

    center: \[80, 50\],

    radius: 35

});

 

// Select the path, so we can inspect its segments:

path.selected = true;

 

// Create a copy of the path and move it by 150 points:

var copy = path.clone();

copy.position.x += 150;

 

// Flatten the copied path, with a maximum error of 4 points:

copy.flatten(4);

<!--
## Source links

- [path.smooth()](./reference-path.md#smooth) - source: /reference/path#smooth
- [path.simplify()](./reference-path.md#simplify) - source: /reference/path#simplify
- [path.segments](./reference-path.md#segments) - source: /reference/path#segments
- [path.flatten(error)](./reference-path.md#flatten-error) - source: /reference/path#flatten-error
- Getting Started - source: `/tutorials/getting-started/`
- Working with Paper.js - source: `/tutorials/getting-started/working-with-paper-js/`
- Using JavaScript Directly - source: `/tutorials/getting-started/using-javascript-directly/`
- PaperScript Interoperability - source: `/tutorials/getting-started/paperscript-interoperability/`
- Geometry - source: `/tutorials/geometry/`
- Point, Size and Rectangle - source: `/tutorials/geometry/point-size-and-rectangle/`
- Object Conversion - source: `/tutorials/geometry/object-conversion/`
- Mathematical Operations - source: `/tutorials/geometry/mathematical-operations/`
- Vector Geometry - source: `/tutorials/geometry/vector-geometry/`
- [Paths](./tutorials-paths.md) - source: /tutorials/paths/
- Working with Path Items - source: `/tutorials/paths/working-with-path-items/`
- Creating Predefined Shapes - source: `/tutorials/paths/creating-predefined-shapes/`
- Using Color and Style - source: `/tutorials/paths/using-color-and-style/`
- Interaction - source: `/tutorials/interaction/`
- Creating Mouse Tools - source: `/tutorials/interaction/creating-mouse-tools/`
- Mouse Tool Events - source: `/tutorials/interaction/mouse-tool-events/`
- Working with Mouse Vectors - source: `/tutorials/interaction/working-with-mouse-vectors/`
- Keyboard Interaction - source: `/tutorials/interaction/keyboard-interaction/`
- Project & Items - source: `/tutorials/project-items/`
- Working with Items - source: `/tutorials/project-items/working-with-items/`
- Transforming Items - source: `/tutorials/project-items/transforming-items/`
- Project Hierarchy - source: `/tutorials/project-items/project-hierarchy/`
- Working with Symbols - source: `/tutorials/project-items/working-with-symbols/`
- Images - source: `/tutorials/images/`
- Working with Rasters - source: `/tutorials/images/working-with-rasters/`
- Using Pixel Colors - source: `/tutorials/images/using-pixel-colors/`
- Color Averaging Image Areas - source: `/tutorials/images/color-averaging-image-areas/`
- Animation - source: `/tutorials/animation/`
- Creating Animations - source: `/tutorials/animation/creating-animations/`
-->
