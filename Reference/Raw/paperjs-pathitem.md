For the complete documentation index, see [llms.txt](https://paperjs.typogram.co/llms.txt). This page is also available as [Markdown](https://paperjs.typogram.co/paths/pathitem.md).
Extends 
The PathItem class is the base for any items that describe paths and offer standardised methods for drawing and path manipulation, such as `[Path](Path%20f91b7d17f1f747e1950d655ad8aaf2c5.md)` and `[CompoundPath](CompoundPath%200e46476761cb45a0ab9ed15d5e6dfffb.md)`.
##  Properties
  * `interiorPoint`
Returns a point that is guaranteed to be inside the path.
Read only.
    * Type:
    * `Point`
  * `clockwise`
Specifies whether the path as a whole is oriented clock-wise, by looking at the path’s area. Note that self-intersecting paths and sub-paths of different orientation can result in areas that cancel each other out.
    * Type:
    * `Boolean`
    * See also:
    * `path.area`
    * `compoundPath.area`
  * `pathData`
The path’s geometry, formatted as SVG style path data.
    * Type:
    * `String`


##  Methods
###  Boolean Path Operations
  * `unite(path[, options])`
Unites the geometry of the specified path with this path’s geometry and returns the result as a new path item.
    * Options:
    * `options.insert: Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
    * Parameters:
    * `path:` `PathItem` — the path to unite with
    * `options:` `Object` — the boolean operation options — optional
    * Returns:
    * `PathItem` — the resulting path item
  * `intersect(path[, options])`
Intersects the geometry of the specified path with this path’s geometry and returns the result as a new path item.
    * Options:
    * `options.insert: Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
    * `options.trace: Boolean` — whether the tracing method is used, treating both paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, keeping the parts of the curves that intersect with the area of the second path. — default: `true`
    * Parameters:
    * `path:` `PathItem` — the path to intersect with
    * `options:` `Object` — the boolean operation options — optional
    * Returns:
    * `PathItem` — the resulting path item
  * `subtract(path[, options])`
Subtracts the geometry of the specified path from this path’s geometry and returns the result as a new path item.
    * Options:
    * `options.insert: Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
    * `options.trace: Boolean` — whether the tracing method is used, treating both paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, removing the parts of the curves that intersect with the area of the second path. — default: `true`
    * Parameters:
    * `path:` `PathItem` — the path to subtract
    * `options:` `Object` — the boolean operation options — optional
    * Returns:
    * `PathItem` — the resulting path item
  * `exclude(path[, options])`
Excludes the intersection of the geometry of the specified path with this path’s geometry and returns the result as a new path item.
    * Options:
    * `options.insert: Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
    * Parameters:
    * `path:` `PathItem` — the path to exclude the intersection of
    * `options:` `Object` — the boolean operation options — optional
    * Returns:
    * `PathItem` — the resulting path item
  * `divide(path[, options])`
Splits the geometry of this path along the geometry of the specified path returns the result as a new group item. This is equivalent to calling `subtract(path)` and `intersect(path)` and putting the results into a new group.
    * Options:
    * `options.insert: Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
    * `options.trace: Boolean` — whether the tracing method is used, treating both paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections. — default: `true`
    * Parameters:
    * `path:` `PathItem` — the path to divide by
    * `options:` `Object` — the boolean operation options — optional
    * Returns:
    * `PathItem` — the resulting path item
  * `reorient([nonZero[, clockwise]])`
Fixes the orientation of the sub-paths of a compound-path, assuming that non of its sub-paths intersect, by reorienting them so that they are of different winding direction than their containing paths, except for disjoint sub-paths, i.e. islands, which are oriented so that they have the same winding direction as the the biggest path.
    * Parameters:
    * `nonZero:` `Boolean` — controls if the non-zero fill-rule is to be applied, by counting the winding of each nested path and discarding sub-paths that do not contribute to the final result — optional, default: `false`
    * `clockwise:` `Boolean` — if provided, the orientation of the root paths will be set to the orientation specified by `clockwise`, otherwise the orientation of the largest root child is used. — optional
    * Returns:
    * `PathItem` — a reference to the item itself, reoriented


###  Path Intersections and Locations
  * `getIntersections(path[, include])`
Returns all intersections between two `PathItem` items as an array of `CurveLocation` objects. `CompoundPath` items are also supported.
    * Parameters:
    * `path:` `PathItem` — the other item to find the intersections with
    * `include:` `Function` — a callback function that can be used to filter out undesired locations right while they are collected. When defined, it shall return `true` to include a location, `false` otherwise. — optional
    * Returns:
    * `Array of CurveLocation` objects — the locations of all intersection between the paths
    * See also:
    * `getCrossings(path)`
Example:Finding the intersections between two paths

```
var path = new Path.Rectangle(new Point(30, 25), new Size(50, 50));
path.strokeColor = 'black';
var secondPath = path.clone();
var intersectionGroup = new Group();
function onFrame(event) {
    secondPath.rotate(1);
    var intersections = path.getIntersections(secondPath);
    intersectionGroup.removeChildren();
    for (var i = 0; i < intersections.length; i++) {
        var intersectionPath = new Path.Circle({
            center: intersections[i].point,
            radius: 4,
            fillColor: 'red',
            parent: intersectionGroup

```

  * `getCrossings(path)`
Returns all crossings between two `PathItem` items as an array of `CurveLocation` objects. `CompoundPath` items are also supported. Crossings are intersections where the paths actually are crossing each other, as opposed to simply touching.
    * Parameters:
    * `path:` `PathItem` — the other item to find the crossings with
    * Returns:
    * `Array of CurveLocation` objects — the locations of all crossings between the paths
    * See also:
    * `getIntersections(path)`
  * `getNearestLocation(point)`
Returns the nearest location on the path item to the specified point.
    * Parameters:
    * `point:` `Point` — the point for which we search the nearest location
    * Returns:
    * `CurveLocation` — the location on the path that’s the closest to the specified point
  * `getNearestPoint(point)`
Returns the nearest point on the path item to the specified point.
    * Parameters:
    * `point:` `Point` — the point for which we search the nearest point
    * Returns:
    * `Point` — the point on the path that’s the closest to the specified point
Example:

```
var star = new Path.Star({
    center: view.center,
    points: 10,
    radius1: 30,
    radius2: 60,
    strokeColor: 'black'
var circle = new Path.Circle({
    center: view.center,
    radius: 3,
    fillColor: 'red'
function onMouseMove(event) {
    // Get the nearest point from the mouse position
    // to the star shaped path:
    var nearestPoint = star.getNearestPoint(event.point);
    // Move the red circle to the nearest point:
    circle.position = nearestPoint;

```



###  Path Manipulation
  * `reverse()`
Reverses the orientation of the path item. When called on `CompoundPath` items, each of the nested paths is reversed. On `Path` items, the sequence of `path.segments` is reversed.
  * `flatten([flatness])`
Flattens the curves in path items to a sequence of straight lines, by subdividing them enough times until the specified maximum error is met.
    * Parameters:
    * `flatness:` `Number` — the maximum error between the flattened lines and the original curves — optional, default: `0.25`
Example:Flattening a circle shaped path:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 35:
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
// Select the path, so we can inspect its segments:
path.selected = true;
// Create a copy of the path and move it by 150 points:
var copy = path.clone();
copy.position.x += 150;
// Flatten the copied path, with a maximum error of 4 points:
copy.flatten(4);
```

  * `smooth([options])`
Smooths the path item without changing the amount of segments in the path or moving the segments’ locations, by smoothing and adjusting the angle and length of the segments’ handles based on the position and distance of neighboring segments.
Smoothing works both for open paths and closed paths, and can be applied to the full path, as well as a sub-range of it. If a range is defined using the `options.from` and `options.to` properties, only the curve handles inside that range are touched. If one or both limits of the range are specified in negative indices, the indices are wrapped around the end of the curve. That way, a smoothing range in a close path can even wrap around the connection between the last and the first segment.
Four different smoothing methods are available:
    * `'continuous'` smooths the path item by adjusting its curve handles so that the first and second derivatives of all involved curves are continuous across their boundaries.
This method tends to result in the smoothest results, but does not allow for further parametrization of the handles.
    * `'asymmetric'` is based on the same principle as `'continuous'` but uses different factors so that the result is asymmetric. This used to the only method available until v0.10.0, and is currently still the default when no method is specified, for reasons of backward compatibility. It will eventually be removed.
    * `'catmull-rom'` uses the Catmull-Rom spline to smooth the segment.
The optionally passed factor controls the knot parametrization of the algorithm:
      * `0.0`: the standard, uniform Catmull-Rom spline
      * `0.5`: the centripetal Catmull-Rom spline, guaranteeing no self-intersections
      * `1.0`: the chordal Catmull-Rom spline
    * `'geometric'` use a simple heuristic and empiric geometric method to smooth the segment’s handles. The handles were weighted, meaning that big differences in distances between the segments will lead to probably undesired results.
The optionally passed factor defines the tension parameter (`0…1`), controlling the amount of smoothing as a factor by which to scale each handle.
    * Options:
    * `options.type: String` — the type of smoothing method: `‘continuous’`, `‘asymmetric’`, `‘catmull-rom’`, `‘geometric’` — default: `‘asymmetric’`
    * `options.factor: Number` — the factor parameterizing the smoothing method — default: `0.5` for `'catmull-rom'`, `0.4` for `'geometric'`
    * `options.from: Number`⟋`Segment`⟋`Curve` — the segment or curve at which to start smoothing, if not the full path shall be smoothed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.
    * `options.to: Number`⟋`Segment`⟋`Curve` — the segment or curve to which the handles of the path shall be processed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.
    * Parameters:
    * `options:` `Object` — the smoothing options — optional
    * See also:
    * `segment.smooth([options])`
Example:Smoothing a closed shape:

```
// Create a rectangular path with its top-left point at
// {x: 30, y: 25} and a size of {width: 50, height: 50}:
var path = new Path.Rectangle({
    point: [30, 25],
    size: [50, 50],
    strokeColor: 'black',
// Select the path, so we can see its handles:
path.fullySelected = true;
// Create a copy of the path and move it 100 to the right:
var copy = path.clone();
copy.position.x += 100;
// Smooth the segments of the copy:
copy.smooth({ type: 'continuous' });
```

Example:

```
var path = new Path();
path.strokeColor = 'black';
path.add(new Point(30, 50));
var y = 5;
var x = 3;
for (var i = 0; i < 28; i++) {
    y *= -1.1;
    x *= 1.1;
    path.lineBy(x, y);
// Create a copy of the path and move it 100 down:
var copy = path.clone();
copy.position.y += 120;
// Select the path, so we can see its handles:
copy.fullySelected = true;
// Smooth the path using centripetal Catmull-Rom splines:
copy.smooth({ type: 'catmull-rom', factor: 0.5 });
```

Example:Smoothing ranges of paths, using segments, curves or indices:

```
// Create 5 rectangles, next to each other:
var paths = [];
for (var i = 0; i < 5; i++) {
    paths.push(new Path.Rectangle({
        point: [30 + i * 100, 30],
        size: [50, 50],
        fullySelected: true
// Smooth a range, using segments:
paths[1].smooth({
    type: 'continuous',
    from: paths[1].segments[0],
    to: paths[1].segments[2]
// Smooth a range, using curves:
paths[2].smooth({
    type: 'continuous',
    from: paths[2].curves[0],
    to: paths[2].curves[1]
// Smooth a range, using indices:
paths[3].smooth({ type: 'continuous', from: 0, to: 2 });
// Smooth a range, using negative indices:
paths[4].smooth({ type: 'continuous', from: -1, to: 1 });
```

  * `simplify([tolerance])`
Fits a sequence of as few curves as possible through the path’s anchor points, ignoring the path items’s curve-handles, with an allowed maximum error. When called on `CompoundPath` items, each of the nested paths is simplified. On `Path` items, the `path.segments` array is processed and replaced by the resulting sequence of fitted curves.
This method can be used to process and simplify the point data received from a mouse or touch device.
    * Parameters:
    * `tolerance:` `Number` — the allowed maximum error when fitting the curves through the segment points — optional, default: `2.5`
    * Returns:
    * `Boolean` — `true` if the method was capable of fitting curves through the path’s segment points, `false` otherwise
Example:Click and drag below to draw to draw a line, when you release the mouse, the is made smooth using path.simplify():

```
var path;
function onMouseDown(event) {
    // If we already made a path before, deselect it:
    if (path) {
        path.selected = false;
    // Create a new path and add the position of the mouse
    // as its first segment. Select it, so we can see the
    // segment points:
    path = new Path({
        segments: [event.point],
        strokeColor: 'black',
        selected: true
function onMouseDrag(event) {
    // On every drag event, add a segment to the path
    // at the position of the mouse:
    path.add(event.point);
function onMouseUp(event) {
    // When the mouse is released, simplify the path:
    path.simplify();
    path.selected = true;

```

  * `interpolate(from, to, factor)`
Interpolates between the two specified path items and uses the result as the geometry for this path item. The number of children and segments in the two paths involved in the operation should be the same.
    * Parameters:
    * `from:` `PathItem` — the path item defining the geometry when `factor` is `0`
    * `to:` `PathItem` — the path item defining the geometry when `factor` is `1`
    * `factor:` `Number` — the interpolation coefficient, typically between `0` and `1`, but extrapolation is possible too
  * `compare(path)`
Compares the geometry of two paths to see if they describe the same shape, detecting cases where paths start in different segments or even use different amounts of curves to describe the same shape, as long as their orientation is the same, and their segments and handles really result in the same visual appearance of curves.
    * Parameters:
    * `path:` `PathItem` — the path to compare this path’s geometry with
    * Returns:
    * `Boolean` — `true` if two paths describe the same shape, `false` otherwise


###  Postscript Style Drawing Commands
  * `moveTo(point)`
On a normal empty `Path`, the point is simply added as the path’s first segment. If called on a `CompoundPath`, a new `Path` is created as a child and the point is added as its first segment.
    * Parameters:
    * `point:` `Point` — the point in which to start the path
  * `lineTo(point)`
Adds a straight curve to the path, from the the last segment in the path to the specified point.
    * Parameters:
    * `point:` `Point` — the destination point of the newly added straight curve
  * `arcTo(through, to)`
Adds an arc from the position of the last segment in the path, passing through the specified `through` point, to the specified `to` point, by adding one or more segments to the path.
    * Parameters:
    * `through:` `Point` — the point where the arc should pass through
    * `to:` `Point` — the point where the arc should end
Example:

```
var path = new Path();
path.strokeColor = 'black';
var firstPoint = new Point(30, 75);
path.add(firstPoint);
// The point through which we will create the arc:
var throughPoint = new Point(40, 40);
// The point at which the arc will end:
var toPoint = new Point(130, 75);
// Draw an arc through 'throughPoint' to 'toPoint'
path.arcTo(throughPoint, toPoint);
// Add a red circle shaped path at the position of 'throughPoint':
var circle = new Path.Circle(throughPoint, 3);
circle.fillColor = 'red';
```

Example:Interactive example. Click and drag in the view below:

```
var myPath;
function onMouseDrag(event) {
    // If we created a path before, remove it:
    if (myPath) {
        myPath.remove();
    // Create a new path and add a segment point to it
    // at {x: 150, y: 150):
    myPath = new Path();
    myPath.add(150, 150);
    // Draw an arc through the position of the mouse to 'toPoint'
    var toPoint = new Point(350, 150);
    myPath.arcTo(event.point, toPoint);
    // Select the path, so we can see its segments:
    myPath.selected = true;
// When the mouse is released, deselect the path
// and fill it with black.
function onMouseUp(event) {
    myPath.selected = false;
    myPath.fillColor = 'black';

```

  * `arcTo(to[, clockwise])`
Adds an arc from the position of the last segment in the path to the specified point, by adding one or more segments to the path.
    * Parameters:
    * `to:` `Point` — the point where the arc should end
    * `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`
Example:

```
var path = new Path();
path.strokeColor = 'black';
path.add(new Point(30, 75));
path.arcTo(new Point(130, 75));
var path2 = new Path();
path2.strokeColor = 'red';
path2.add(new Point(180, 25));
// To draw an arc in anticlockwise direction,
// we pass `false` as the second argument to arcTo:
path2.arcTo(new Point(280, 25), false);
```

Example:Interactive example. Click and drag in the view below:

```
var myPath;
// The mouse has to move at least 20 points before
// the next mouse drag event is fired:
tool.minDistance = 20;
// When the user clicks, create a new path and add
// the current mouse position to it as its first segment:
function onMouseDown(event) {
    myPath = new Path();
    myPath.strokeColor = 'black';
    myPath.add(event.point);
// On each mouse drag event, draw an arc to the current
// position of the mouse:
function onMouseDrag(event) {
    myPath.arcTo(event.point);

```

  * `curveTo(through, to[, time])`
Adds a curve from the last segment in the path through the specified `through` point, to the specified destination point by adding one segment to the path.
    * Parameters:
    * `through:` `Point` — the point through which the curve should pass
    * `to:` `Point` — the destination point of the newly added curve
    * `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`
Example:Interactive example. Move your mouse around the view below:

```
var myPath;
function onMouseMove(event) {
    // If we created a path before, remove it:
    if (myPath) {
        myPath.remove();
    // Create a new path and add a segment point to it
    // at {x: 150, y: 150):
    myPath = new Path();
    myPath.add(150, 150);
    // Draw a curve through the position of the mouse to 'toPoint'
    var toPoint = new Point(350, 150);
    myPath.curveTo(event.point, toPoint);
    // Select the path, so we can see its segments:
    myPath.selected = true;

```

  * `cubicCurveTo(handle1, handle2, to)`
Adds a cubic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by two specified handles.
    * Parameters:
    * `handle1:` `Point` — the location of the first handle of the newly added curve in absolute coordinates, out of which the relative values for `segment.handleOut` of its first segment are calculated
    * `handle2:` `Point` — the location of the second handle of the newly added curve in absolute coordinates, out of which the relative values for `segment.handleIn` of its second segment are calculated
    * `to:` `Point` — the destination point of the newly added curve
  * `quadraticCurveTo(handle, to)`
Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.
Note that Paper.js only stores cubic curves, so the handle is actually converted.
    * Parameters:
    * `handle:` `Point` — the location of the handle of the newly added quadratic curve in absolute coordinates, out of which the relative values for `segment.handleOut` of the resulting cubic curve’s first segment and `segment.handleIn` of its second segment are calculated
    * `to:` `Point` — the destination point of the newly added curve
  * `closePath()`
Closes the path. When closed, Paper.js connects the first and last segment of the path with an additional curve. The difference to setting `path.closed` to `true` is that this will also merge the first segment with the last if they lie in the same location.
    * See also:
    * `path.closed`


###  Relative Drawing Commands
  * `moveBy(to)`
If called on a `CompoundPath`, a new `Path` is created as a child and a point is added as its first segment relative to the position of the last segment of the current path.
    * Parameters:
    * `to:` `Point`
  * `lineBy(point)`
Adds a straight curve to the path, from the the last segment in the path to the `to` vector specified relatively to it.
    * Parameters:
    * `point:` `Point` — the vector describing the destination of the newly added straight curve
Example:

```
var path = new Path();
path.strokeColor = 'black';
// Add a segment at {x: 50, y: 50}
path.add(25, 25);
// Add a segment relative to the last segment of the path.
// 50 in x direction and 0 in y direction, becomes {x: 75, y: 25}
path.lineBy(50, 0);
// 0 in x direction and 50 in y direction, becomes {x: 75, y: 75}
path.lineBy(0, 50);
```

Example:Drawing a spiral using lineBy:

```
var path = new Path();
path.strokeColor = 'black';
// Add the first segment at {x: 50, y: 50}
path.add(view.center);
// Loop 500 times:
for (var i = 0; i < 500; i++) {
    // Create a vector with an ever increasing length
    // and an angle in increments of 45 degrees
    var vector = new Point({
        angle: i * 45,
        length: i / 2
    // Add the vector relatively to the last segment point:
    path.lineBy(vector);
// Smooth the handles of the path:
path.smooth();
// Uncomment the following line and click on 'run' to see
// the construction of the path:
// path.selected = true;
```

  * `arcBy(through, to)`
Adds an arc from the position of the last segment in the path, passing through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one or more segments to the path.
    * Parameters:
    * `through:` `Point` — the vector where the arc should pass through
    * `to:` `Point` — the vector where the arc should end
  * `arcBy(to[, clockwise])`
Adds an arc from the position of the last segment in the path to the `to` vector specified relatively to it, by adding one or more segments to the path.
    * Parameters:
    * `to:` `Point` — the vector where the arc should end
    * `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`
  * `curveBy(through, to[, time])`
Adds a curve from the last segment in the path through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one segment to the path.
    * Parameters:
    * `through:` `Point` — the vector through which the curve should pass
    * `to:` `Point` — the destination vector of the newly added curve
    * `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`
  * `cubicCurveBy(handle1, handle2, to)`
Adds a cubic bezier curve to the path, from the last segment to the to the specified `to` vector, with the curve itself defined by two specified handles.
    * Parameters:
    * `handle1:` `Point` — the location of the first handle of the newly added curve
    * `handle2:` `Point` — the location of the second handle of the newly added curve
    * `to:` `Point` — the destination point of the newly added curve
  * `quadraticCurveBy(handle, to)`
Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.
Note that Paper.js only stores cubic curves, so the handle is actually converted.
    * Parameters:
    * `handle:` `Point` — the handle of the newly added quadratic curve out of which the values for `segment.handleOut` of the resulting cubic curve’s first segment and `segment.handleIn` of its second segment are calculated
    * `to:` `Point` — the destination point of the newly added curve


##  Static Methods
  * `PathItem.create(pathData)`
Creates a path item from the given SVG path-data, determining if the data describes a plain path or a compound-path with multiple sub-paths.
    * Parameters:
    * `pathData:` `String` — the SVG path-data to parse
    * Returns:
    * `Path`⟋`CompoundPath` — the newly created path item
  * `PathItem.create(segments)`
Creates a path item from the given segments array, determining if the array describes a plain path or a compound-path with multiple sub-paths.
    * Parameters:
    * `segments:` Array of `Number[]` objects[] — the segments array to parse
    * Returns:
    * `Path`⟋`CompoundPath` — the newly created path item
  * `PathItem.create(object)`
Creates a path item from the given object, determining if the contained information describes a plain path or a compound-path with multiple sub-paths.
    * Parameters:
    * `object:` `Object` — an object containing the properties describing the item to be created
    * Returns:
    * `Path`⟋`CompoundPath` — the newly created path item


##  Properties inherited from `Item`
  * `id`
The unique id of the item.
Read only.
    * Type:
    * `Number`
  * `className`
The class name of the item as a string.
    * Values:
    * `'Group'`, `'Layer'`, `'Path'`, `'CompoundPath'`, `'Shape'`, `'Raster'`, `'SymbolItem'`, `'PointText'`
    * Type:
    * `String`
`name`
The name of the item. If the item has a name, it can be accessed by name through its parent’s children list.
    * Type:
    * `String`
Example:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
// Set the name of the path:
path.name = 'example';
// Create a group and add path to it as a child:
var group = new Group();
group.addChild(path);
// The path can be accessed by name:
group.children['example'].fillColor = 'red';
```

  * `style`
The path style of the item.
    * Type:
    * `Style`
Example:Applying several styles to an item in one go, by passing an object to its style property:

```
var circle = new Path.Circle({
    center: [80, 50],
    radius: 30
circle.style = {
    fillColor: 'blue',
    strokeColor: 'red',
    strokeWidth: 5

```

Example:Copying the style of another item:

```
var path = new Path.Circle({
    center: [50, 50],
    radius: 30,
    fillColor: 'red'
var path2 = new Path.Circle({
    center: new Point(180, 50),
    radius: 20
// Copy the path style of path:
path2.style = path.style;
```

Example:Applying the same style object to multiple items:

```
var myStyle = {
    fillColor: 'red',
    strokeColor: 'blue',
    strokeWidth: 4
var path = new Path.Circle({
    center: [50, 50],
    radius: 30
path.style = myStyle;
var path2 = new Path.Circle({
    center: new Point(150, 50),
    radius: 20
path2.style = myStyle;
```

  * `locked`
Specifies whether the item is locked. When set to `true`, item interactions with the mouse are disabled.
    * Default:
    * `false`
    * Type:
    * `Boolean`
Example:

```
var unlockedItem = new Path.Circle({
    center: view.center - [35, 0],
    radius: 30,
    fillColor: 'springgreen',
    onMouseDown: function() {
        this.fillColor = Color.random();
var lockedItem = new Path.Circle({
    center: view.center + [35, 0],
    radius: 30,
    fillColor: 'crimson',
    locked: true,
    // This event won't be triggered because the item is locked.
    onMouseDown: function() {
        this.fillColor = Color.random();
new PointText({
    content: 'Click on both circles to see which one is locked.',
    point: view.center - [0, 35],
    justification: 'center'

```

  * `visible`
Specifies whether the item is visible. When set to `false`, the item won’t be drawn.
    * Default:
    * Type:
    * `Boolean`
Example:Hiding an item:

```
var path = new Path.Circle({
    center: [50, 50],
    radius: 20,
    fillColor: 'red'
// Hide the path:
path.visible = false;
```

  * `blendMode`
The blend mode with which the item is composited onto the canvas. Both the standard canvas compositing modes, as well as the new CSS blend modes are supported. If blend-modes cannot be rendered natively, they are emulated. Be aware that emulation can have an impact on performance.
    * Values:
    * `'normal'`, `'multiply'`, `'screen'`, `'overlay'`, `'soft-light'`, `'hard- light'`, `'color-dodge'`, `'color-burn'`, `'darken'`, `'lighten'`, `'difference'`, `'exclusion'`, `'hue'`, `'saturation'`, `'luminosity'`, `'color'`, `'add'`, `'subtract'`, `'average'`, `'pin-light'`, `'negation'`, `'source-over'`, `'source-in'`, `'source-out'`, `'source-atop'`, `'destination-over'`, `'destination-in'`, `'destination-out'`, `'destination-atop'`, `'lighter'`, `'darker'`, `'copy'`, `'xor'`
    * Default:
    * `'normal'`
    * Type:
    * `String`
Example:Setting an item's blend mode:

```
// Create a white rectangle in the background
// with the same dimensions as the view:
var background = new Path.Rectangle(view.bounds);
background.fillColor = 'white';
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35,
    fillColor: 'red'
var circle2 = new Path.Circle({
    center: new Point(120, 50),
    radius: 35,
    fillColor: 'blue'
// Set the blend mode of circle2:
circle2.blendMode = 'multiply';
```

  * `opacity`
The opacity of the item as a value between `0` and `1`.
    * Default:
    * Type:
    * `Number`
Example:Making an item 50% transparent:

```
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35,
    fillColor: 'red'
var circle2 = new Path.Circle({
    center: new Point(120, 50),
    radius: 35,
    fillColor: 'blue',
    strokeColor: 'green',
    strokeWidth: 10
// Make circle2 50% transparent:
circle2.opacity = 0.5;
```

  * `selected`
Specifies whether the item is selected. This will also return `true` for `Group` items if they are partially selected, e.g. groups containing selected or partially selected paths.
Paper.js draws the visual outlines of selected items on top of your project. This can be useful for debugging, as it allows you to see the construction of paths, position of path curves, individual segment points and bounding boxes of symbol and raster items.
    * Default:
    * `false`
    * Type:
    * `Boolean`
    * See also:
    * `project.selectedItems`
    * `segment.selected`
    * `curve.selected`
    * `point.selected`
Example:Selecting an item:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
path.selected = true; // Select the path
```

  * `clipMask`
Specifies whether the item defines a clip mask. This can only be set on paths and compound paths, and only if the item is already contained within a clipping group.
    * Default:
    * `false`
    * Type:
    * `Boolean`
  * `data`
A plain javascript object which can be used to store arbitrary data on the item.
    * Type:
    * `Object`
Example:

```
var path = new Path();
path.data.remember = 'milk';
```

Example:

```
var path = new Path();
path.data.malcolm = new Point(20, 30);
console.log(path.data.malcolm.x); // 20
```

Example:

```
var path = new Path();
path.data = {
    home: 'Omicron Theta',
    found: 2338,
    pets: ['Spot']
console.log(path.data.pets.length); // 1
```

Example:

```
var path = new Path({
    data: {
        home: 'Omicron Theta',
        found: 2338,
        pets: ['Spot']
console.log(path.data.pets.length); // 1
```



###  Position and Bounding Boxes
  * `position`
The item’s position within the parent item’s coordinate system. By default, this is the `rectangle.center` of the item’s `bounds` rectangle.
    * Type:
    * `Point`
Example:Changing the position of a path:

```
// Create a circle at position { x: 10, y: 10 }
var circle = new Path.Circle({
    center: new Point(10, 10),
    radius: 10,
    fillColor: 'red'
// Move the circle to { x: 20, y: 20 }
circle.position = new Point(20, 20);
// Move the circle 100 points to the right and 50 points down
circle.position += new Point(100, 50);
```

Example:Changing the x coordinate of an item's position:

```
// Create a circle at position { x: 20, y: 20 }
var circle = new Path.Circle({
    center: new Point(20, 20),
    radius: 10,
    fillColor: 'red'
// Move the circle 100 points to the right
circle.position.x += 100;
```

  * `pivot`
The item’s pivot point specified in the item coordinate system, defining the point around which all transformations are hinging. This is also the reference point for `position`. By default, it is set to `null`, meaning the `rectangle.center` of the item’s `bounds` rectangle is used as pivot.
    * Default:
    * Type:
    * `Point`
  * `bounds`
The bounding rectangle of the item excluding stroke width.
    * Type:
    * `Rectangle`
  * `strokeBounds`
The bounding rectangle of the item including stroke width.
    * Type:
    * `Rectangle`
  * `handleBounds`
The bounding rectangle of the item including handles.
    * Type:
    * `Rectangle`
  * `internalBounds`
The bounding rectangle of the item without any matrix transformations.
Typical use case would be drawing a frame around the object where you want to draw something of the same size, position, rotation, and scaling, like a selection frame.
    * Type:
    * `Rectangle`
  * `rotation`
The current rotation angle of the item, as described by its `matrix`. Please note that this only returns meaningful values for items with `applyMatrix` set to `false`, meaning they do not directly bake transformations into their content.
    * Type:
    * `Number`
  * `scaling`
The current scale factor of the item, as described by its `matrix`. Please note that this only returns meaningful values for items with `applyMatrix` set to `false`, meaning they do not directly bake transformations into their content.
    * Type:
    * `Point`
  * `matrix`
The item’s transformation matrix, defining position and dimensions in relation to its parent item in which it is contained.
    * Type:
    * `Matrix`
  * `globalMatrix`
The item’s global transformation matrix in relation to the global project coordinate space. Note that the view’s transformations resulting from zooming and panning are not factored in.
Read only.
    * Type:
    * `Matrix`
  * `viewMatrix`
The item’s global matrix in relation to the view coordinate space. This means that the view’s transformations resulting from zooming and panning are factored in.
Read only.
    * Type:
    * `Matrix`
  * `applyMatrix`
Controls whether the transformations applied to the item (e.g. through `transform(matrix)`, `rotate(angle)`, `scale(scale)`, etc.) are stored in its `matrix` property, or whether they are directly applied to its contents or children (passed on to the segments in `Path` items, the children of `Group` items, etc.).
    * Default:
    * Type:
    * `Boolean`


###  Project Hierarchy
  * `project`
The project that this item belongs to.
Read only.
    * Type:
    * `Project`
  * `view`
The view that this item belongs to.
Read only.
    * Type:
  * `layer`
The layer that this item is contained within.
Read only.
    * Type:
    * `Layer`
  * `parent`
The item that this item is contained within.
    * Type:
Example:

```
var path = new Path();
// New items are placed in the active layer:
console.log(path.parent == project.activeLayer); // true
var group = new Group();
group.addChild(path);
// Now the parent of the path has become the group:
console.log(path.parent == group); // true
```

Example:Setting the parent of the item to another item

```
var path = new Path();
// New items are placed in the active layer:
console.log(path.parent == project.activeLayer); // true
var group = new Group();
path.parent = group;
// Now the parent of the path has become the group:
console.log(path.parent == group); // true
// The path is now contained in the children list of group:
console.log(group.children[0] == path); // true
```

Example:Setting the parent of an item in the constructor

```
var group = new Group();
var path = new Path({
    parent: group
// The parent of the path is the group:
console.log(path.parent == group); // true
// The path is contained in the children list of group:
console.log(group.children[0] == path); // true
```

  * `children`
The children items contained within this item. Items that define a `name` can also be accessed by name.
**Please note:** The children array should not be modified directly using array functions. To remove single items from the children list, use `item.remove`(), to remove all items from the children list, use `item.removeChildren`(). To add items to the children list, use `item.addChild(item)` or `item.insertChild(index, item)`.
    * Type:
    * Array of `Item` objects
Example:Accessing items in the children array:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
// Create a group and move the path into it:
var group = new Group();
group.addChild(path);
// Access the path through the group's children array:
group.children[0].fillColor = 'red';
```

Example:Accessing children by name:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
// Set the name of the path:
path.name = 'example';
// Create a group and move the path into it:
var group = new Group();
group.addChild(path);
// The path can be accessed by name:
group.children['example'].fillColor = 'orange';
```

Example:Passing an array of items to item.children:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 35
var group = new Group();
group.children = [path];
// The path is the first child of the group:
group.firstChild.fillColor = 'green';
```

  * `firstChild`
The first item contained within this item. This is a shortcut for accessing `item.children[0]`.
Read only.
    * Type:
  * `lastChild`
The last item contained within this item.This is a shortcut for accessing `item.children[item.children.length - 1]`.
Read only.
    * Type:
  * `nextSibling`
The next item on the same level as this item.
Read only.
    * Type:
  * `previousSibling`
The previous item on the same level as this item.
Read only.
    * Type:
  * `index`
The index of this item within the list of its parent’s children.
Read only.
    * Type:
    * `Number`


###  Stroke Style
  * `strokeColor`
The color of the stroke.
    * Type:
    * `Color`⟋`null`
Example:Setting the stroke color of a path:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 35:
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35
// Set its stroke color to RGB red:
circle.strokeColor = new Color(1, 0, 0);
```

  * `strokeWidth`
The width of the stroke.
    * Type:
    * `Number`
Example:Setting an item's stroke width:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 35:
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35,
    strokeColor: 'red'
// Set its stroke width to 10:
circle.strokeWidth = 10;
```

  * `strokeCap`
The shape to be used at the beginning and end of open `Path` items, when they have a stroke.
    * Values:
    * `'round'`, `'square'`, `'butt'`
    * Default:
    * `'butt'`
    * Type:
    * `String`
Example:A look at the different stroke caps:

```
var line = new Path({
    segments: [[80, 50], [420, 50]],
    strokeColor: 'black',
    strokeWidth: 20,
    selected: true
// Set the stroke cap of the line to be round:
line.strokeCap = 'round';
// Copy the path and set its stroke cap to be square:
var line2 = line.clone();
line2.position.y += 50;
line2.strokeCap = 'square';
// Make another copy and set its stroke cap to be butt:
var line2 = line.clone();
line2.position.y += 100;
line2.strokeCap = 'butt';
```

  * `strokeJoin`
The shape to be used at the segments and corners of `Path` items when they have a stroke.
    * Values:
    * `'miter'`, `'round'`, `'bevel'`
    * Default:
    * `'miter'`
    * Type:
    * `String`
Example:A look at the different stroke joins:

```
var path = new Path({
    segments: [[80, 100], [120, 40], [160, 100]],
    strokeColor: 'black',
    strokeWidth: 20,
    // Select the path, in order to see where the stroke is formed:
    selected: true
var path2 = path.clone();
path2.position.x += path2.bounds.width * 1.5;
path2.strokeJoin = 'round';
var path3 = path2.clone();
path3.position.x += path3.bounds.width * 1.5;
path3.strokeJoin = 'bevel';
```

  * `dashOffset`
The dash offset of the stroke.
    * Default:
    * Type:
    * `Number`
  * `strokeScaling`
Specifies whether the stroke is to be drawn taking the current affine transformation into account (the default behavior), or whether it should appear as a non-scaling stroke.
    * Default:
    * Type:
    * `Boolean`
  * `dashArray`
Specifies an array containing the dash and gap lengths of the stroke.
    * Default:
    * Type:
    * Array of `Numbers`
Example:

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 40,
    strokeWidth: 2,
    strokeColor: 'black'
// Set the dashed stroke to [10pt dash, 4pt gap]:
path.dashArray = [10, 4];
```

  * `miterLimit`
The miter limit of the stroke. When two line segments meet at a sharp angle and miter joins have been specified for `item.strokeJoin`, it is possible for the miter to extend far beyond the `item.strokeWidth` of the path. The miterLimit imposes a limit on the ratio of the miter length to the `item.strokeWidth`.
    * Default:
    * Type:
    * `Number`


###  Fill Style
  * `fillColor`
The fill color of the item.
    * Type:
    * `Color`⟋`null`
Example:Setting the fill color of a path to red:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 35:
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35
// Set the fill color of the circle to RGB red:
circle.fillColor = new Color(1, 0, 0);
```

  * `fillRule`
The fill-rule with which the shape gets filled. Please note that only modern browsers support fill-rules other than `'nonzero'`.
    * Values:
    * `'nonzero'`, `'evenodd'`
    * Default:
    * `'nonzero'`
    * Type:
    * `String`


###  Shadow Style
  * `shadowColor`
The shadow color.
    * Type:
    * `Color`⟋`null`
Example:Creating a circle with a black shadow:

```
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35,
    fillColor: 'white',
    // Set the shadow color of the circle to RGB black:
    shadowColor: new Color(0, 0, 0),
    // Set the shadow blur radius to 12:
    shadowBlur: 12,
    // Offset the shadow by { x: 5, y: 5 }
    shadowOffset: new Point(5, 5)

```

  * `shadowBlur`
The shadow’s blur radius.
    * Default:
    * Type:
    * `Number`
  * `shadowOffset`
The shadow’s offset.
    * Default:
    * Type:
    * `Point`


###  Selection Style
  * `selectedColor`
The color the item is highlighted with when selected. If the item does not specify its own color, the color defined by its layer is used instead.
    * Type:
    * `Color`⟋`null`


###  Event Handlers
  * `onFrame`
Item level handler function to be called on each frame of an animation. The function receives an event object which contains information about the frame event:
    * Type:
    * `Function`⟋`null`
    * Options:
    * `event.count: Number` — the number of times the frame event was fired
    * `event.time: Number` — the total amount of time passed since the first frame event in seconds
    * `event.delta: Number` — the time passed in seconds since the last frame event
    * See also:
    * `view.onFrame`
Example:Creating an animation:

```
// Create a rectangle shaped path with its top left point at:
// {x: 50, y: 25} and a size of {width: 50, height: 50}
var path = new Path.Rectangle(new Point(50, 25), new Size(50, 50));
path.fillColor = 'black';
path.onFrame = function(event) {
    // Every frame, rotate the path by 3 degrees:
    this.rotate(3);

```

  * `onMouseDown`
The function to be called when the mouse button is pushed down on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseDown`
Example:Press the mouse button down on the circle shaped path, to make it red:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse is pressed on the item,
// set its fill color to red:
path.onMouseDown = function(event) {
    this.fillColor = 'red';

```

Example:Press the mouse on the circle shaped paths to remove them:

```
// Loop 30 times:
for (var i = 0; i < 30; i++) {
    // Create a circle shaped path at a random position
    // in the view:
    var path = new Path.Circle({
        center: Point.random() * view.size,
        radius: 25,
        fillColor: 'black',
        strokeColor: 'white'
    // When the mouse is pressed on the item, remove it:
    path.onMouseDown = function(event) {
        this.remove();

```

  * `onMouseDrag`
The function to be called when the mouse position changes while the mouse is being dragged over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseDrag`
Example:Press and drag the mouse on the blue circle to move it:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 50,
    fillColor: 'blue'
// Install a drag event handler that moves the path along.
path.onMouseDrag = function(event) {
    path.position += event.delta;

```

  * `onMouseUp`
The function to be called when the mouse button is released over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseUp`
Example:Release the mouse button over the circle shaped path, to make it red:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse is released over the item,
// set its fill color to red:
path.onMouseUp = function(event) {
    this.fillColor = 'red';

```

  * `onClick`
The function to be called when the mouse clicks on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onClick`
Example:Click on the circle shaped path, to make it red:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse is clicked on the item,
// set its fill color to red:
path.onClick = function(event) {
    this.fillColor = 'red';

```

Example:Click on the circle shaped paths to remove them:

```
// Loop 30 times:
for (var i = 0; i < 30; i++) {
    // Create a circle shaped path at a random position
    // in the view:
    var path = new Path.Circle({
        center: Point.random() * view.size,
        radius: 25,
        fillColor: 'black',
        strokeColor: 'white'
    // When the mouse clicks on the item, remove it:
    path.onClick = function(event) {
        this.remove();

```

  * `onDoubleClick`
The function to be called when the mouse double clicks on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onDoubleClick`
Example:Double click on the circle shaped path, to make it red:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse is double clicked on the item,
// set its fill color to red:
path.onDoubleClick = function(event) {
    this.fillColor = 'red';

```

Example:Double click on the circle shaped paths to remove them:

```
// Loop 30 times:
for (var i = 0; i < 30; i++) {
    // Create a circle shaped path at a random position
    // in the view:
    var path = new Path.Circle({
        center: Point.random() * view.size,
        radius: 25,
        fillColor: 'black',
        strokeColor: 'white'
    // When the mouse is double clicked on the item, remove it:
    path.onDoubleClick = function(event) {
        this.remove();

```

  * `onMouseMove`
The function to be called repeatedly while the mouse moves over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseMove`
Example:Move over the circle shaped path, to change its opacity:

```
// Create a circle shaped path at the center of the view:
    var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse moves on top of the item, set its opacity
// to a random value between 0 and 1:
path.onMouseMove = function(event) {
    this.opacity = Math.random();

```

  * `onMouseEnter`
The function to be called when the mouse moves over the item. This function will only be called again, once the mouse moved outside of the item first. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseEnter`
Example:When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse enters the item, set its fill color to red:
path.onMouseEnter = function(event) {
    this.fillColor = 'red';
// When the mouse leaves the item, set its fill color to black:
path.onMouseLeave = function(event) {
    this.fillColor = 'black';

```

Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

```
function enter(event) {
    this.fillColor = 'red';
function leave(event) {
    this.fillColor = 'black';
// When the mouse is pressed:
function onMouseDown(event) {
    // Create a circle shaped path at the position of the mouse:
    var path = new Path.Circle(event.point, 25);
    path.fillColor = 'black';
    // When the mouse enters the item, set its fill color to red:
    path.onMouseEnter = enter;
    // When the mouse leaves the item, set its fill color to black:
    path.onMouseLeave = leave;

```

  * `onMouseLeave`
The function to be called when the mouse moves out of the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.
    * Type:
    * `Function`⟋`null`
    * See also:
    * `view.onMouseLeave`
Example:Move the mouse over the circle shaped path and then move it out of it again to set its fill color to red:

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse leaves the item, set its fill color to red:
path.onMouseLeave = function(event) {
    this.fillColor = 'red';

```



##  Methods inherited from `Item`
  * `set(props)`
Sets the properties of the passed object literal on this item to the values defined in the object literal, if the item has property of the given name (or a setter defined for it).
    * Parameters:
    * `props:` `Object`
    * Returns:
    * `Item` — the item itself
Example:Setting properties through an object literal

```
var circle = new Path.Circle({
    center: [80, 50],
    radius: 35
circle.set({
    strokeColor: 'red',
    strokeWidth: 10,
    fillColor: 'black',
    selected: true

```

  * `clone([options])`
Clones the item within the same project and places the copy above the item.
    * Options:
    * `insert: undefined` — specifies whether the copy should be inserted into the scene graph. When set to `true`, it is inserted above the original — default: `true`
    * `deep: undefined` — specifies whether the item’s children should also be cloned — default: `true`
    * Parameters:
    * `options:` `Object` — optional, default: `{ insert: true, deep: true }`
    * Returns:
    * `Item` — the newly cloned item
Example:Cloning items:

```
var circle = new Path.Circle({
    center: [50, 50],
    radius: 10,
    fillColor: 'red'
// Make 20 copies of the circle:
for (var i = 0; i < 20; i++) {
    var copy = circle.clone();
    // Distribute the copies horizontally, so we can see them:
    copy.position.x += i * copy.bounds.width;

```

  * `copyContent(source)`
Copies the content of the specified item over to this item.
    * Parameters:
    * `source:` `Item` — the item to copy the content from
  * `copyAttributes(source, excludeMatrix)`
Copies all attributes of the specified item over to this item. This includes its style, visibility, matrix, pivot, blend-mode, opacity, selection state, data, name, etc.
    * Parameters:
    * `source:` `Item` — the item to copy the attributes from
    * `excludeMatrix:` `Boolean` — whether to exclude the transformation matrix when copying all attributes
  * `rasterize([resolution[, insert]])`
Rasterizes the item into a newly created Raster object. The item itself is not removed after rasterization.
    * Parameters:
    * `resolution:` `Number` — the resolution of the raster in pixels per inch (DPI). If not specified, the value of `view.resolution` is used. — optional, default: `view.resolution`
    * `insert:` `Boolean` — specifies whether the raster should be inserted into the scene graph. When set to `true`, it is inserted above the original — optional, default: `true`
    * Returns:
    * `Raster` — the newly created raster item
Example:Rasterizing an item:

```
var circle = new Path.Circle({
    center: [50, 50],
    radius: 5,
    fillColor: 'red'
// Create a rasterized version of the path:
var raster = circle.rasterize();
// Move it 100pt to the right:
raster.position.x += 100;
// Scale the path and the raster by 300%, so we can compare them:
circle.scale(5);
raster.scale(5);
```



###  Geometric Tests
  * `contains(point)`
Checks whether the item’s geometry contains the given point.
    * Parameters:
    * `point:` `Point` — the point to check for
    * Returns:
    * `Boolean`
Example:Click within and outside the star below Create a star shaped path:

```
var path = new Path.Star({
    center: [50, 50],
    points: 12,
    radius1: 20,
    radius2: 40,
    fillColor: 'black'
// Whenever the user presses the mouse:
function onMouseDown(event) {
    // If the position of the mouse is within the path,
    // set its fill color to red, otherwise set it to
    // black:
    if (path.contains(event.point)) {
        path.fillColor = 'red';
    } else {
        path.fillColor = 'black';

```

  * `isInside(rect)`
    * Parameters:
    * `rect:` `Rectangle` — the rectangle to check against
    * Returns:
    * `Boolean`
  * `intersects(item)`
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean`


###  Hit-testing, Fetching and Matching Items
  * `hitTest(point[, options])`
Performs a hit-test on the item and its children (if it is a `Group` or `Layer`) at the location of the specified point, returning the first found hit.
The options object allows you to control the specifics of the hit- test and may contain a combination of the following values:
    * Options:
    * `options.tolerance: Number` — the tolerance of the hit-test — default: `paperScope.settings`.hitTolerance
    * `options.class: Function` — only hit-test against a specific item class, or any of its sub-classes, by providing the constructor function against which an `instanceof` check is performed: `Group`, `Layer`, `Path`, `CompoundPath`, `Shape`, `Raster`, `SymbolItem`, `PointText`, …
    * `options.match: Function` — a match function to be called for each found hit result: Return `true` to return the result, `false` to keep searching
    * `options.fill: Boolean` — hit-test the fill of items — default: `true`
    * `options.stroke: Boolean` — hit-test the stroke of path items, taking into account the setting of stroke color and width — default: `true`
    * `options.segments: Boolean` — hit-test for `segment.point` of `Path` items — default: `true`
    * `options.curves: Boolean` — hit-test the curves of path items, without taking the stroke color or width into account
    * `options.handles: Boolean` — hit-test for the handles (`segment.handleIn` / `segment.handleOut`) of path segments.
    * `options.ends: Boolean` — only hit-test for the first or last segment points of open path items
    * `options.position: Boolean` — hit-test the `item.position` of of items, which depends on the setting of `item.pivot`
    * `options.center: Boolean` — hit-test the `rectangle.center` of the bounding rectangle of items (`item.bounds`)
    * `options.bounds: Boolean` — hit-test the corners and side-centers of the bounding rectangle of items (`item.bounds`)
    * `options.guides: Boolean` — hit-test items that have `Item#guide` set to `true`
    * `options.selected: Boolean` — only hit selected items
    * Parameters:
    * `point:` `Point` — the point where the hit-test should be performed (in global coordinates system).
    * `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`
    * Returns:
    * `HitResult` — a hit result object describing what exactly was hit or `null` if nothing was hit
  * `hitTestAll(point[, options])`
Performs a hit-test on the item and its children (if it is a `Group` or `Layer`) at the location of the specified point, returning all found hits.
The options object allows you to control the specifics of the hit- test. See `hitTest(point[, options])` for a list of all options.
    * Parameters:
    * `point:` `Point` — the point where the hit-test should be performed (in global coordinates system).
    * `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`
    * Returns:
    * `Array of HitResult` objects — hit result objects for all hits, describing what exactly was hit or `null` if nothing was hit
    * See also:
    * `hitTest(point[, options])`;
  * `matches(options)`
Checks whether the item matches the criteria described by the given object, by iterating over all of its properties and matching against their values through `matches(name, compare)`.
See `project.getItems(options)` for a selection of illustrated examples.
    * Parameters:
    * `options:` `Object`⟋`Function` — the criteria to match against
    * Returns:
    * `Boolean` — `true` if the item matches all the criteria, `false` otherwise
    * See also:
    * `getItems(options)`
  * `matches(name, compare)`
Checks whether the item matches the given criteria. Extended matching is possible by providing a compare function or a regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x-coordinate to match all points with that x-value). Partial matching does work for `item.data`.
See `project.getItems(options)` for a selection of illustrated examples.
    * Parameters:
    * `name:` `String` — the name of the state to match against
    * `compare:` `Object` — the value, function or regular expression to compare against
    * Returns:
    * `Boolean` — `true` if the item matches the state, `false` otherwise
    * See also:
    * `getItems(options)`
  * `getItems(options)`
Fetch the descendants (children or children of children) of this item that match the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for `item.data`.
Matching items against a rectangular area is also possible, by setting either `options.inside` or `options.overlapping` to a rectangle describing the area in which the items either have to be fully or partly contained.
See `project.getItems(options)` for a selection of illustrated examples.
    * Options:
    * `options.recursive: Boolean` — whether to loop recursively through all children, or stop at the current level — default: `true`
    * `options.match: Function` — a match function to be called for each item, allowing the definition of more flexible item checks that are not bound to properties. If no other match properties are defined, this function can also be passed instead of the `options` object
    * `options.class: Function` — the constructor function of the item type to match against
    * `options.inside: Rectangle` — the rectangle in which the items need to be fully contained
    * `options.overlapping: Rectangle` — the rectangle with which the items need to at least partly overlap
    * Parameters:
    * `options:` `Object`⟋`Function` — the criteria to match against
    * Returns:
    * `Array of Item` objects — the list of matching descendant items
    * See also:
    * `matches(options)`
  * `getItem(options)`
Fetch the first descendant (child or child of child) of this item that matches the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for `item.data`. See `project.getItems(match)` for a selection of illustrated examples.
    * Parameters:
    * `options:` `Object`⟋`Function` — the criteria to match against
    * Returns:
    * `Item` — the first descendant item matching the given criteria
    * See also:
    * `getItems(options)`


###  Importing / Exporting JSON and SVG
  * `exportJSON([options])`
Exports (serializes) the item with its content and child items to a JSON data string.
    * Options:
    * `options.asString: Boolean` — whether the JSON is returned as a `Object` or a `String` — default: `true`
    * `options.precision: Number` — the amount of fractional digits in numbers used in JSON data — default: `5`
    * Parameters:
    * `options:` `Object` — the serialization options — optional
    * Returns:
    * `String` — the exported JSON data
  * `importJSON(json)`
Imports (deserializes) the stored JSON data into this item. If the data describes an item of the same class or a parent class of the item, the data is imported into the item itself. If not, the imported item is added to this item’s `item.children` list. Note that not all type of items can have children.
    * Parameters:
    * `json:` `String` — the JSON data to import from
    * Returns:
  * `exportSVG([options])`
  * `importSVG(svg[, options])`
Converts the provided SVG content into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call `item.removeChildren`() to do so.
    * Options:
    * `options.expandShapes: Boolean` — whether imported shape items should be expanded to path items — default: `false`
    * `options.onLoad: Function` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external resources.
    * `options.onError: Function` — the callback function to call if an error occurs during loading. Only required when loading from external resources.
    * `options.insert: Boolean` — whether the imported items should be added to the item that `importSVG()` is called on — default: `true`
    * `options.applyMatrix: Boolean` — whether the imported items should have their transformation matrices applied to their contents or not — default: `paperScope.settings`.applyMatrix
    * Parameters:
    * `svg:` `SVGElement`⟋`String` — the SVG content to import, either as a SVG DOM node, a string containing SVG content, or a string describing the URL of the SVG file to fetch.
    * `options:` `Object` — the import options — optional
    * Returns:
    * `Item` — the newly created Paper.js item containing the converted SVG content
  * `importSVG(svg, onLoad)`
Imports the provided external SVG file, converts it into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call `item.removeChildren`() to do so.
    * Parameters:
    * `svg:` `SVGElement`⟋`String` — the URL of the SVG file to fetch.
    * `onLoad:` `Function` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external files.
    * Returns:
    * `Item` — the newly created Paper.js item containing the converted SVG content


###  Hierarchy Operations
  * `addChild(item)`
Adds the specified item as a child of this item at the end of the its `children` list. You can use this function for groups, compound paths and layers.
    * Parameters:
    * `item:` `Item` — the item to be added as a child
    * Returns:
    * `Item` — the added item, or `null` if adding was not possible
  * `insertChild(index, item)`
Inserts the specified item as a child of this item at the specified index in its `children` list. You can use this function for groups, compound paths and layers.
    * Parameters:
    * `index:` `Number` — the index at which to insert the item
    * `item:` `Item` — the item to be inserted as a child
    * Returns:
    * `Item` — the inserted item, or `null` if inserting was not possible
  * `addChildren(items)`
Adds the specified items as children of this item at the end of the its children list. You can use this function for groups, compound paths and layers.
    * Parameters:
    * `items:` Array of `Item` objects — the items to be added as children
    * Returns:
    * `Array of Item` objects — the added items, or `null` if adding was not possible
  * `insertChildren(index, items)`
Inserts the specified items as children of this item at the specified index in its `children` list. You can use this function for groups, compound paths and layers.
    * Parameters:
    * `index:` `Number`
    * `items:` Array of `Item` objects — the items to be appended as children
    * Returns:
    * `Array of Item` objects — the inserted items, or `null` if inserted was not possible
  * `insertAbove(item)`
Inserts this item above the specified item.
    * Parameters:
    * `item:` `Item` — the item above which it should be inserted
    * Returns:
    * `Item` — the inserted item, or `null` if inserting was not possible
  * `insertBelow(item)`
Inserts this item below the specified item.
    * Parameters:
    * `item:` `Item` — the item below which it should be inserted
    * Returns:
    * `Item` — the inserted item, or `null` if inserting was not possible
  * `sendToBack()`
Sends this item to the back of all other items within the same parent.
  * `bringToFront()`
Brings this item to the front of all other items within the same parent.
  * `addTo(owner)`
Adds it to the specified owner, which can be either a `Item` or a `Project`.
    * Parameters:
    * `owner:` `Project`⟋`Layer`⟋`Group`⟋`CompoundPath` — the item or project to add the item to
    * Returns:
    * `Item` — the item itself, if it was successfully added
  * `copyTo(owner)`
Clones the item and adds it to the specified owner, which can be either a `Item` or a `Project`.
    * Parameters:
    * `owner:` `Project`⟋`Layer`⟋`Group`⟋`CompoundPath` — the item or project to copy the item to
    * Returns:
    * `Item` — the new copy of the item, if it was successfully added
  * `reduce(options)`
If this is a group, layer or compound-path with only one child-item, the child-item is moved outside and the parent is erased. Otherwise, the item itself is returned unmodified.
    * Parameters:
    * `options:`
    * Returns:
    * `Item` — the reduced item
  * `remove()`
Removes the item and all its children from the project. The item is not destroyed and can be inserted again after removal.
    * Returns:
    * `Boolean` — `true` if the item was removed, `false` otherwise
  * `replaceWith(item)`
Replaces this item with the provided new item which will takes its place in the project hierarchy instead.
    * Parameters:
    * `item:` `Item` — the item that will replace this item
    * Returns:
    * `Boolean` — `true` if the item was replaced, `false` otherwise
  * `removeChildren()`
Removes all of the item’s `children` (if any).
    * Returns:
    * `Array of Item` objects — an array containing the removed items
  * `removeChildren(start[, end])`
Removes the children from the specified `start` index to and excluding the `end` index from the parent’s `children` array.
    * Parameters:
    * `start:` `Number` — the beginning index, inclusive
    * `end:` `Number` — the ending index, exclusive — optional, default: `children.length`
    * Returns:
    * `Array of Item` objects — an array containing the removed items
  * `reverseChildren()`
Reverses the order of the item’s children


###  Tests
  * `isEmpty([recursively])`
Specifies whether the item has any content or not. The meaning of what content is differs from type to type. For example, a `Group` with no children, a `TextItem` with no text content and a `Path` with no segments all are considered empty.
    * Parameters:
    * `recursively:` `Boolean` — whether an item with children should be considered empty if all its descendants are empty — optional, default: `false`
    * Returns:
    * `Boolean`


###  Style Tests
  * `hasFill()`
Checks whether the item has a fill.
    * Returns:
    * `Boolean` — `true` if the item has a fill, `false` otherwise
  * `hasStroke()`
Checks whether the item has a stroke.
    * Returns:
    * `Boolean` — `true` if the item has a stroke, `false` otherwise
  * `hasShadow()`
Checks whether the item has a shadow.
    * Returns:
    * `Boolean` — `true` if the item has a shadow, `false` otherwise


###  Hierarchy Tests
  * `hasChildren()`
Checks if the item contains any children items.
    * Returns:
    * `Boolean` — `true` it has one or more children, `false` otherwise
  * `isInserted()`
Checks whether the item and all its parents are inserted into scene graph or not.
    * Returns:
    * `Boolean` — `true` if the item is inserted into the scene graph, `false` otherwise
  * `isAbove(item)`
Checks if this item is above the specified item in the stacking order of the project.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if it is above the specified item, `false` otherwise
  * `isBelow(item)`
Checks if the item is below the specified item in the stacking order of the project.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if it is below the specified item, `false` otherwise
  * `isParent(item)`
Checks whether the specified item is the parent of the item.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if it is the parent of the item, `false` otherwise
  * `isChild(item)`
Checks whether the specified item is a child of the item.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` it is a child of the item, `false` otherwise
  * `isDescendant(item)`
Checks if the item is contained within the specified item.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if it is inside the specified item, `false` otherwise
  * `isAncestor(item)`
Checks if the item is an ancestor of the specified item.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if the item is an ancestor of the specified item, `false` otherwise
  * `isSibling(item)`
Checks if the item is an a sibling of the specified item.
    * Parameters:
    * `item:` `Item` — the item to check against
    * Returns:
    * `Boolean` — `true` if the item is aa sibling of the specified item, `false` otherwise
  * `isGroupedWith(item)`
Checks whether the item is grouped with the specified item.
    * Parameters:
    * `item:` `Item`
    * Returns:
    * `Boolean` — `true` if the items are grouped together, `false` otherwise


###  Transform Functions
  * `translate(delta)`
Translates (moves) the item by the given offset views.
    * Parameters:
    * `delta:` `Point` — the offset to translate the item by
  * `rotate(angle[, center])`
Rotates the item by a given angle around the given center point.
Angles are oriented clockwise and measured in degrees.
    * Parameters:
    * `angle:` `Number` — the rotation angle
    * `center:` `Point` — optional, default: `item.position`
    * See also:
    * `matrix.rotate(angle[, center])`
Example:Rotating an item:

```
// Create a rectangle shaped path with its top left
// point at {x: 80, y: 25} and a size of {width: 50, height: 50}:
var path = new Path.Rectangle(new Point(80, 25), new Size(50, 50));
path.fillColor = 'black';
// Rotate the path by 30 degrees:
path.rotate(30);
```

Example:Rotating an item around a specific point:

```
// Create a rectangle shaped path with its top left
// point at {x: 175, y: 50} and a size of {width: 100, height: 100}:
var topLeft = new Point(175, 50);
var size = new Size(100, 100);
var path = new Path.Rectangle(topLeft, size);
path.fillColor = 'black';
// Draw a circle shaped path in the center of the view,
// to show the rotation point:
var circle = new Path.Circle({
    center: view.center,
    radius: 5,
    fillColor: 'white'
// Each frame rotate the path 3 degrees around the center point
// of the view:
function onFrame(event) {
    path.rotate(3, view.center);

```

  * `scale(scale[, center])`
Scales the item by the given value from its center point, or optionally from a supplied point.
    * Parameters:
    * `scale:` `Number` — the scale factor
    * `center:` `Point` — optional, default: `item.position`
Example:Scaling an item from its center point:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 20:
var circle = new Path.Circle({
    center: [80, 50],
    radius: 20,
    fillColor: 'red'
// Scale the path by 150% from its center point
circle.scale(1.5);
```

Example:Scaling an item from a specific point:

```
// Create a circle shaped path at { x: 80, y: 50 }
// with a radius of 20:
var circle = new Path.Circle({
    center: [80, 50],
    radius: 20,
    fillColor: 'red'
// Scale the path 150% from its bottom left corner
circle.scale(1.5, circle.bounds.bottomLeft);
```

  * `scale(hor, ver[, center])`
Scales the item by the given values from its center point, or optionally from a supplied point.
    * Parameters:
    * `hor:` `Number` — the horizontal scale factor
    * `ver:` `Number` — the vertical scale factor
    * `center:` `Point` — optional, default: `item.position`
Example:Scaling an item horizontally by 300%:

```
// Create a circle shaped path at { x: 100, y: 50 }
// with a radius of 20:
var circle = new Path.Circle({
    center: [100, 50],
    radius: 20,
    fillColor: 'red'
// Scale the path horizontally by 300%
circle.scale(3, 1);
```

  * `shear(shear[, center])`
Shears the item by the given value from its center point, or optionally by a supplied point.
    * Parameters:
    * `shear:` `Point` — the horizontal and vertical shear factors as a point
    * `center:` `Point` — optional, default: `item.position`
    * See also:
    * `matrix.shear(shear[, center])`
  * `shear(hor, ver[, center])`
Shears the item by the given values from its center point, or optionally by a supplied point.
    * Parameters:
    * `hor:` `Number` — the horizontal shear factor
    * `ver:` `Number` — the vertical shear factor
    * `center:` `Point` — optional, default: `item.position`
    * See also:
    * `matrix.shear(hor, ver[, center])`
  * `skew(skew[, center])`
Skews the item by the given angles from its center point, or optionally by a supplied point.
    * Parameters:
    * `skew:` `Point` — the horizontal and vertical skew angles in degrees
    * `center:` `Point` — optional, default: `item.position`
    * See also:
    * `matrix.shear(skew[, center])`
  * `skew(hor, ver[, center])`
Skews the item by the given angles from its center point, or optionally by a supplied point.
    * Parameters:
    * `hor:` `Number` — the horizontal skew angle in degrees
    * `ver:` `Number` — the vertical sskew angle in degrees
    * `center:` `Point` — optional, default: `item.position`
    * See also:
    * `matrix.shear(hor, ver[, center])`
  * `transform(matrix)`
Transform the item.
    * Parameters:
    * `matrix:` `Matrix` — the matrix by which the item shall be transformed
  * `globalToLocal(point)`
Converts the specified point from global project coordinate space to the item’s own local coordinate space.
    * Parameters:
    * `point:` `Point` — the point to be transformed
    * Returns:
    * `Point` — the transformed point as a new instance
  * `localToGlobal(point)`
Converts the specified point from the item’s own local coordinate space to the global project coordinate space.
    * Parameters:
    * `point:` `Point` — the point to be transformed
    * Returns:
    * `Point` — the transformed point as a new instance
  * `parentToLocal(point)`
Converts the specified point from the parent’s coordinate space to item’s own local coordinate space.
    * Parameters:
    * `point:` `Point` — the point to be transformed
    * Returns:
    * `Point` — the transformed point as a new instance
  * `localToParent(point)`
Converts the specified point from the item’s own local coordinate space to the parent’s coordinate space.
    * Parameters:
    * `point:` `Point` — the point to be transformed
    * Returns:
    * `Point` — the transformed point as a new instance
  * `fitBounds(rectangle[, fill])`
Transform the item so that its `bounds` fit within the specified rectangle, without changing its aspect ratio.
    * Parameters:
    * `rectangle:` `Rectangle`
    * `fill:` `Boolean` — optional, default: `false`
Example:Fitting an item to the bounding rectangle of another item's bounding rectangle:

```
// Create a rectangle shaped path with its top left corner
// at {x: 80, y: 25} and a size of {width: 75, height: 50}:
var path = new Path.Rectangle({
    point: [80, 25],
    size: [75, 50],
    fillColor: 'black'
// Create a circle shaped path with its center at {x: 80, y: 50}
// and a radius of 30.
var circlePath = new Path.Circle({
    center: [80, 50],
    radius: 30,
    fillColor: 'red'
// Fit the circlePath to the bounding rectangle of
// the rectangular path:
circlePath.fitBounds(path.bounds);
```

Example:Fitting an item to the bounding rectangle of another item's bounding rectangle with the fill parameter set to true:

```
// Create a rectangle shaped path with its top left corner
// at {x: 80, y: 25} and a size of {width: 75, height: 50}:
var path = new Path.Rectangle({
    point: [80, 25],
    size: [75, 50],
    fillColor: 'black'
// Create a circle shaped path with its center at {x: 80, y: 50}
// and a radius of 30.
var circlePath = new Path.Circle({
    center: [80, 50],
    radius: 30,
    fillColor: 'red'
// Fit the circlePath to the bounding rectangle of
// the rectangular path:
circlePath.fitBounds(path.bounds, true);
```

Example:Fitting an item to the bounding rectangle of the view

```
var path = new Path.Circle({
    center: [80, 50],
    radius: 30,
    fillColor: 'red'
// Fit the path to the bounding rectangle of the view:
path.fitBounds(view.bounds);
```



###  Event Handling
  * `on(type, function)`
Attaches an event handler to the item.
    * Parameters:
    * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
    * `function:` `Function` — the function to be called when the event occurs, receiving a `MouseEvent` or `Event` object as its sole argument
    * Returns:
    * `Item` — this item itself, so calls can be chained
Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25,
    fillColor: 'black'
// When the mouse enters the item, set its fill color to red:
path.on('mouseenter', function() {
    this.fillColor = 'red';
// When the mouse leaves the item, set its fill color to black:
path.on('mouseleave', function() {
    this.fillColor = 'black';

```

  * `on(object)`
Attaches one or more event handlers to the item.
    * Parameters:
    * `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`
    * Returns:
    * `Item` — this item itself, so calls can be chained
Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

```
// Create a circle shaped path at the center of the view:
var path = new Path.Circle({
    center: view.center,
    radius: 25
path.fillColor = 'black';
// When the mouse enters the item, set its fill color to red:
path.on({
    mouseenter: function(event) {
        this.fillColor = 'red';
    mouseleave: function(event) {
        this.fillColor = 'black';

```

Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set black.

```
var pathHandlers = {
    mouseenter: function(event) {
        this.fillColor = 'red';
    mouseleave: function(event) {
        this.fillColor = 'black';
// When the mouse is pressed:
function onMouseDown(event) {
    // Create a circle shaped path at the position of the mouse:
    var path = new Path.Circle({
        center: event.point,
        radius: 25,
        fillColor: 'black'
    // Attach the handers inside the object literal to the path:
    path.on(pathHandlers);

```

  * `off(type, function)`
Detach an event handler from the item.
    * Parameters:
    * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
    * `function:` `Function` — the function to be detached
    * Returns:
    * `Item` — this item itself, so calls can be chained
  * `off(object)`
Detach one or more event handlers to the item.
    * Parameters:
    * `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`
    * Returns:
    * `Item` — this item itself, so calls can be chained
  * `emit(type, event)`
Emit an event on the item.
    * Parameters:
    * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
    * `event:` `Object` — an object literal containing properties describing the event
    * Returns:
    * `Boolean` — `true` if the event had listeners, `false` otherwise
  * `responds(type)`
Check if the item has one or more event handlers of the specified type.
    * Parameters:
    * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
    * Returns:
    * `Boolean` — `true` if the item has one or more event handlers of the specified type, `false` otherwise


###  Remove On Event
  * `removeOn(options)`
Removes the item when the events specified in the passed options object occur.
    * Options:
    * `options.move: undefined` — {Boolean) remove the item when the next `tool.onMouseMove` event is fired.
    * `options.drag: undefined` — {Boolena) remove the item when the next `tool.onMouseDrag` event is fired.
    * `options.down: undefined` — {Boolean) remove the item when the next `tool.onMouseDown` event is fired.
    * `options.up: undefined` — {Boolean) remove the item when the next `tool.onMouseUp` event is fired.
    * Parameters:
    * `options:` `Object`
Example:Click and drag below:

```
function onMouseDrag(event) {
    // Create a circle shaped path at the mouse position,
    // with a radius of 10:
    var path = new Path.Circle({
        center: event.point,
        radius: 10,
        fillColor: 'black'
    // Remove the path on the next onMouseDrag or onMouseDown event:
    path.removeOn({
        drag: true,
        down: true

```

  * `removeOnMove()`
Removes the item when the next `tool.onMouseMove` event is fired.
Example:Move your mouse below:

```
function onMouseMove(event) {
    // Create a circle shaped path at the mouse position,
    // with a radius of 10:
    var path = new Path.Circle({
        center: event.point,
        radius: 10,
        fillColor: 'black'
    // On the next move event, automatically remove the path:
    path.removeOnMove();

```

  * `removeOnDown()`
Removes the item when the next `tool.onMouseDown` event is fired.
Example:Click a few times below:

```
function onMouseDown(event) {
    // Create a circle shaped path at the mouse position,
    // with a radius of 10:
    var path = new Path.Circle({
        center: event.point,
        radius: 10,
        fillColor: 'black'
    // Remove the path, next time the mouse is pressed:
    path.removeOnDown();

```

  * `removeOnDrag()`
Removes the item when the next `tool.onMouseDrag` event is fired.
Example:Click and drag below:

```
function onMouseDrag(event) {
    // Create a circle shaped path at the mouse position,
    // with a radius of 10:
    var path = new Path.Circle({
        center: event.point,
        radius: 10,
        fillColor: 'black'
    // On the next drag event, automatically remove the path:
    path.removeOnDrag();

```

  * `removeOnUp()`
Removes the item when the next `tool.onMouseUp` event is fired.
Example:Click a few times below:

```
function onMouseDown(event) {
    // Create a circle shaped path at the mouse position,
    // with a radius of 10:
    var path = new Path.Circle({
        center: event.point,
        radius: 10,
        fillColor: 'black'
    // Remove the path, when the mouse is released:
    path.removeOnUp();

```



###  Tweening Functions
  * `tween(from, to, options)`
Tween item between two states.
    * Options:
    * `options.duration: Number` — the duration of the tweening
    * `options.easing: Function`⟋`String` — an easing function or the type of the easing: `‘linear’ ‘easeInQuad’ ‘easeOutQuad’ ‘easeInOutQuad’ ‘easeInCubic’ ‘easeOutCubic’ ‘easeInOutCubic’ ‘easeInQuart’ ‘easeOutQuart’ ‘easeInOutQuart’ ‘easeInQuint’ ‘easeOutQuint’ ‘easeInOutQuint’` — default: `‘linear’`
    * `options.start: Boolean` — whether to start tweening automatically — default: `true`
    * Parameters:
    * `from:` `Object` — the state at the start of the tweening
    * `to:` `Object` — the state at the end of the tweening
    * `options:` `Object`⟋`Number` — the options or the duration
    * Returns:
    * `Tween`
Example:Tween fillColor:

```
var path = new Path.Circle({
    radius: view.bounds.height * 0.4,
    center: view.center
path.tween(
    { fillColor: 'blue' },
    { fillColor: 'red' },

```

Example:Tween rotation:

```
var path = new Shape.Rectangle({
    fillColor: 'red',
    center: [50, view.center.y],
    size: [60, 60]
path.tween({
    rotation: 180,
    'position.x': view.bounds.width - 50,
    'fillColor.hue': '+= 90'
    easing: 'easeInOutCubic',
    duration: 2000

```

  * `tween(to, options)`
Tween item to a state.
    * Parameters:
    * `to:` `Object` — the state at the end of the tweening
    * `options:` `Object`⟋`Number` — the options or the duration
    * Returns:
    * `Tween`
    * See also:
    * `item.tween(from, to, options)`
Example:Tween a nested property with relative values

```
var path = new Path.Rectangle({
    size: [100, 100],
    position: view.center,
    fillColor: 'red',
var delta = { x: path.bounds.width / 2, y: 0 };
path.tween({
    'segments[1].point': ['+=', delta],
    'segments[2].point.x': '-= 50'
}, 3000);
```

  * `tween(options)`
Tween item.
    * Parameters:
    * `options:` `Object`⟋`Number` — the options or the duration
    * Returns:
    * `Tween`
    * See also:
    * `item.tween(from, to, options)`
Example:Start an empty tween and just use the update callback:

```
var path = new Path.Circle({
    fillColor: 'blue',
    radius: view.bounds.height * 0.4,
    center: view.center,
var pathFrom = path.clone({ insert: false })
var pathTo = new Path.Rectangle({
    position: view.center,
    rectangle: path.bounds,
    insert: false
path.tween(2000).onUpdate = function(event) {
    path.interpolate(pathFrom, pathTo, event.factor)

```

  * `tweenTo(to, options)`
Tween item to a state.
    * Parameters:
    * `to:` `Object` — the state at the end of the tweening
    * `options:` `Object`⟋`Number` — the options or the duration
    * Returns:
    * `Tween`
    * See also:
    * `item.tween(to, options)`
  * `tweenFrom(from, options)`
Tween item from a state to its state before the tweening.
    * Parameters:
    * `from:` `Object` — the state at the start of the tweening
    * `options:` `Object`⟋`Number` — the options or the duration
    * Returns:
    * `Tween`
    * See also:
    * `item.tween(from, to, options)`
Example:Tween fillColor from red to the path's initial fillColor:

```
var path = new Path.Circle({
    fillColor: 'blue',
    radius: view.bounds.height * 0.4,
    center: view.center
path.tweenFrom({ fillColor: 'red' }, { duration: 1000 });
```



[ PreviousHitResult ](https://paperjs.typogram.co/project-and-items/hitresult)[ NextPath ](https://paperjs.typogram.co/paths/path)
Last updated 3 years ago
