# Path
Extends , 
The path item represents a path in a Paper.js project.
## Constructors
[`**Path**([segments])`](https://paperjs.org/reference/path/#path)
[`**Path**([segments])`](https://paperjs.org/reference/path/#path)
Creates a new path item and places it at the top of the active layer.
#### Parameters:
  * `segments:` Array of [`Segment`](https://paperjs.org/reference/segment) objects — An array of segments (or points to be converted to segments) that will be added to the path — optional 


#### Returns:
  * — the newly created path 


#### Example:Create an empty path and add segments to it:

```
var path = new Path();
path.strokeColor = 'black';
path.add(new Point(30, 30));
path.add(new Point(100, 100));
```

#### Example:Create a path with two segments:

```
var segments = [new Point(30, 30), new Point(100, 100)];
var path = new Path(segments);
path.strokeColor = 'black';
```

[`**Path**(object)`](https://paperjs.org/reference/path/#path-object)
[`**Path**(object)`](https://paperjs.org/reference/path/#path-object)
Creates a new path item from an object description and places it at the top of the active layer.
#### Parameters:
  * `object:` `Object` — an object containing properties to be set on the path 


#### Returns:
  * — the newly created path 


#### Example:
#### Example:
[`**Path**(pathData)`](https://paperjs.org/reference/path/#path-pathData)
[`**Path**(pathData)`](https://paperjs.org/reference/path/#path-pathData)
Creates a new path item from SVG path-data and places it at the top of the active layer. A path holds a single sub-path: further `M` commands are ignored, and the commands that follow them continue the same path. Use [`CompoundPath`](https://paperjs.org/reference/compoundpath) or [`PathItem.create(pathData)`](https://paperjs.org/reference/pathitem#create-pathdata) to create items with multiple sub-paths.
#### Parameters:
  * `pathData:` `String` — the SVG path-data that describes the geometry of this path 


#### Returns:
  * — the newly created path 


#### Example:
### Shaped Paths
[`**Path.Line**(from, to)`](https://paperjs.org/reference/path/#path-line-from-to)
[`**Path.Line**(from, to)`](https://paperjs.org/reference/path/#path-line-from-to)
Creates a linear path item from two points describing a line.
#### Parameters:
  * `from:` [`Point`](https://paperjs.org/reference/point) — the line’s starting point 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the line’s ending point 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Line**(object)`](https://paperjs.org/reference/path/#path-line-object)
[`**Path.Line**(object)`](https://paperjs.org/reference/path/#path-line-object)
Creates a linear path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Circle**(center, radius)`](https://paperjs.org/reference/path/#path-circle-center-radius)
[`**Path.Circle**(center, radius)`](https://paperjs.org/reference/path/#path-circle-center-radius)
Creates a circular path item.
#### Parameters:
  * `center:` [`Point`](https://paperjs.org/reference/point) — the center point of the circle 
  * `radius:` `Number` — the radius of the circle 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Circle**(object)`](https://paperjs.org/reference/path/#path-circle-object)
[`**Path.Circle**(object)`](https://paperjs.org/reference/path/#path-circle-object)
Creates a circular path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Rectangle**(rectangle[, radius])`](https://paperjs.org/reference/path/#path-rectangle-rectangle)
[`**Path.Rectangle**(rectangle[, radius])`](https://paperjs.org/reference/path/#path-rectangle-rectangle)
Creates a rectangular path item, with optionally rounded corners.
#### Parameters:
  * `rectangle:` [`Rectangle`](https://paperjs.org/reference/rectangle) — the rectangle object describing the geometry of the rectangular path to be created 
  * `radius:` [`Size`](https://paperjs.org/reference/size) — the size of the rounded corners — optional, default: `null`


#### Returns:
  * — the newly created path 


#### Example:
#### Example:The same, with rounder corners
[`**Path.Rectangle**(point, size)`](https://paperjs.org/reference/path/#path-rectangle-point-size)
[`**Path.Rectangle**(point, size)`](https://paperjs.org/reference/path/#path-rectangle-point-size)
Creates a rectangular path item from a point and a size object.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the rectangle’s top-left corner. 
  * `size:` [`Size`](https://paperjs.org/reference/size) — the rectangle’s size. 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Rectangle**(from, to)`](https://paperjs.org/reference/path/#path-rectangle-from-to)
[`**Path.Rectangle**(from, to)`](https://paperjs.org/reference/path/#path-rectangle-from-to)
Creates a rectangular path item from the passed points. These do not necessarily need to be the top left and bottom right corners, the constructor figures out how to fit a rectangle between them.
#### Parameters:
  * `from:` [`Point`](https://paperjs.org/reference/point) — the first point defining the rectangle 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the second point defining the rectangle 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Rectangle**(object)`](https://paperjs.org/reference/path/#path-rectangle-object)
[`**Path.Rectangle**(object)`](https://paperjs.org/reference/path/#path-rectangle-object)
Creates a rectangular path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
#### Example:
#### Example:
#### Example:
[`**Path.Ellipse**(rectangle)`](https://paperjs.org/reference/path/#path-ellipse-rectangle)
[`**Path.Ellipse**(rectangle)`](https://paperjs.org/reference/path/#path-ellipse-rectangle)
Creates an elliptical path item.
#### Parameters:
  * `rectangle:` [`Rectangle`](https://paperjs.org/reference/rectangle) — the rectangle circumscribing the ellipse 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Ellipse**(object)`](https://paperjs.org/reference/path/#path-ellipse-object)
[`**Path.Ellipse**(object)`](https://paperjs.org/reference/path/#path-ellipse-object)
Creates an elliptical path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
#### Example:Placing by center and radius
[`**Path.Arc**(from, through, to)`](https://paperjs.org/reference/path/#path-arc-from-through-to)
[`**Path.Arc**(from, through, to)`](https://paperjs.org/reference/path/#path-arc-from-through-to)
Creates a circular arc path item.
#### Parameters:
  * `from:` [`Point`](https://paperjs.org/reference/point) — the starting point of the circular arc 
  * `through:` [`Point`](https://paperjs.org/reference/point) — the point the arc passes through 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the end point of the arc 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Arc**(object)`](https://paperjs.org/reference/path/#path-arc-object)
[`**Path.Arc**(object)`](https://paperjs.org/reference/path/#path-arc-object)
Creates an circular arc path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.RegularPolygon**(center, sides, radius)`](https://paperjs.org/reference/path/#path-regularpolygon-center-sides-radius)
[`**Path.RegularPolygon**(center, sides, radius)`](https://paperjs.org/reference/path/#path-regularpolygon-center-sides-radius)
Creates a regular polygon shaped path item. As in Illustrator, it stands on a flat bottom edge, and its segments run counterclockwise from its top vertex, or with an even number of sides, from the right end of its top edge.
#### Parameters:
  * `center:` [`Point`](https://paperjs.org/reference/point) — the center point of the polygon 
  * `sides:` `Number` — the number of sides of the polygon 
  * `radius:` `Number` — the radius of the polygon 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.RegularPolygon**(object)`](https://paperjs.org/reference/path/#path-regularpolygon-object)
[`**Path.RegularPolygon**(object)`](https://paperjs.org/reference/path/#path-regularpolygon-object)
Creates a regular polygon shaped path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Star**(center, points, radius1, radius2)`](https://paperjs.org/reference/path/#path-star-center-points-radius1-radius2)
[`**Path.Star**(center, points, radius1, radius2)`](https://paperjs.org/reference/path/#path-star-center-points-radius1-radius2)
Creates a star shaped path item.
The largest of `radius1` and `radius2` will be the outer radius of the star. The smallest of radius1 and radius2 will be the inner radius.
#### Parameters:
  * `center:` [`Point`](https://paperjs.org/reference/point) — the center point of the star 
  * `points:` `Number` — the number of points of the star 
  * `radius1:` `Number`
  * `radius2:` `Number`


#### Returns:
  * — the newly created path 


#### Example:
[`**Path.Star**(object)`](https://paperjs.org/reference/path/#path-star-object)
[`**Path.Star**(object)`](https://paperjs.org/reference/path/#path-star-object)
Creates a star shaped path item from the properties described by an object literal.
#### Parameters:
  * `object:` `Object` — an object containing properties describing the path’s attributes 


#### Returns:
  * — the newly created path 


#### Example:
## Properties
The segments contained within the path. Segments that define a [`segment.name`](https://paperjs.org/reference/segment#name) can also be accessed by name.
#### Type:
  * Array of [`Segment`](https://paperjs.org/reference/segment) objects 


#### Example:Accessing segments by name:
The first Segment contained within the path.
Read only.
#### Type:


The last Segment contained within the path.
Read only.
#### Type:


The curves contained within the path.
Read only.
#### Type:
  * Array of [`Curve`](https://paperjs.org/reference/curve) objects 


The first Curve contained within the path.
Read only.
#### Type:


The last Curve contained within the path.
Read only.
#### Type:


Specifies whether the path is closed. If it is closed, Paper.js connects the first and last segments.
#### Type:
  * `Boolean`


#### Example:
The approximate length of the path.
Read only.
#### Type:
  * `Number`


The area that the path’s geometry is covering. Self-intersecting paths can contain sub-areas that cancel each other out.
Read only.
#### Type:
  * `Number`


Specifies whether the path and all its segments are selected. Cannot be `true` on an empty path.
#### Type:
  * `Boolean`


#### Example:A path is fully selected, if all of its segments are selected:
## Methods
[`**add**(...segment)`](https://paperjs.org/reference/path/#add-segment)
[`**add**(...segment)`](https://paperjs.org/reference/path/#add-segment)
Adds one or more segments to the end of the [`segments`](https://paperjs.org/reference/path#segments) array of this path.
#### Parameters:
  * `segment:` [`Segment`](https://paperjs.org/reference/segment)⟋[`Point`](https://paperjs.org/reference/point)⟋Array of `Numbers` — the segment or point to be added. 


#### Returns:
  * `[`Segment`](https://paperjs.org/reference/segment)⟋Array of [`Segment`](https://paperjs.org/reference/segment) objects` — the added segment(s). This is not necessarily the same object, e.g. if the segment to be added already belongs to another path. 


#### Example:Adding segments to a path using point objects:
#### Example:Adding segments to a path using arrays containing number pairs:
#### Example:Adding segments to a path using objects:
#### Example:Adding a segment with handles to a path:
[`**insert**(index, segment)`](https://paperjs.org/reference/path/#insert-index-segment)
[`**insert**(index, segment)`](https://paperjs.org/reference/path/#insert-index-segment)
Inserts one or more segments at a given index in the list of this path’s segments.
#### Parameters:
  * `index:` `Number` — the index at which to insert the segment 
  * `segment:` [`Segment`](https://paperjs.org/reference/segment)⟋[`Point`](https://paperjs.org/reference/point) — the segment or point to be inserted. 


#### Returns:
  * — the added segment. This is not necessarily the same object, e.g. if the segment to be added already belongs to another path 


#### Example:Inserting a segment:
#### Example:Inserting multiple segments:
[`**addSegments**(segments)`](https://paperjs.org/reference/path/#addsegments-segments)
[`**addSegments**(segments)`](https://paperjs.org/reference/path/#addsegments-segments)
Adds an array of segments (or types that can be converted to segments) to the end of the [`segments`](https://paperjs.org/reference/path#segments) array.
#### Parameters:
  * `segments:` Array of [`Segment`](https://paperjs.org/reference/segment) objects 


#### Returns:
  * `Array of [`Segment`](https://paperjs.org/reference/segment) objects` — an array of the added segments. These segments are not necessarily the same objects, e.g. if the segment to be added already belongs to another path 


#### Example:Adding an array of Point objects:
#### Example:Adding an array of [x, y] arrays:
#### Example:Adding segments from one path to another:
[`**insertSegments**(index, segments)`](https://paperjs.org/reference/path/#insertsegments-index-segments)
[`**insertSegments**(index, segments)`](https://paperjs.org/reference/path/#insertsegments-index-segments)
Inserts an array of segments at a given index in the path’s [`segments`](https://paperjs.org/reference/path#segments) array.
#### Parameters:
  * `index:` `Number` — the index at which to insert the segments 
  * `segments:` Array of [`Segment`](https://paperjs.org/reference/segment) objects — the segments to be inserted 


#### Returns:
  * `Array of [`Segment`](https://paperjs.org/reference/segment) objects` — an array of the added segments. These segments are not necessarily the same objects, e.g. if the segment to be added already belongs to another path 


[`**removeSegment**(index)`](https://paperjs.org/reference/path/#removesegment-index)
[`**removeSegment**(index)`](https://paperjs.org/reference/path/#removesegment-index)
Removes the segment at the specified index of the path’s [`segments`](https://paperjs.org/reference/path#segments) array.
#### Parameters:
  * `index:` `Number` — the index of the segment to be removed 


#### Returns:
  * — the removed segment 


#### Example:Removing a segment from a path:
[`**removeSegments**()`](https://paperjs.org/reference/path/#removesegments)
[`**removeSegments**()`](https://paperjs.org/reference/path/#removesegments)
Removes all segments from the path’s [`segments`](https://paperjs.org/reference/path#segments) array.
#### Returns:
  * `Array of [`Segment`](https://paperjs.org/reference/segment) objects` — an array containing the removed segments 


[`**removeSegments**(from[, to])`](https://paperjs.org/reference/path/#removesegments-from)
[`**removeSegments**(from[, to])`](https://paperjs.org/reference/path/#removesegments-from)
Removes the segments from the specified `from` index to the `to` index from the path’s [`segments`](https://paperjs.org/reference/path#segments) array. On closed paths, `from` can be bigger than `to`, to remove the segments from `from` to the end and then from the beginning up to `to`, wrapping around the closing curve.
#### Parameters:
  * `from:` `Number` — the beginning index, inclusive 
  * `to:` `Number` — the ending index, exclusive — optional, default: `segments.length`


#### Returns:
  * `Array of [`Segment`](https://paperjs.org/reference/segment) objects` — an array containing the removed segments, in the order in which they appeared along the path 


#### Example:Removing segments from a path:
[`**hasHandles**()`](https://paperjs.org/reference/path/#hashandles)
[`**hasHandles**()`](https://paperjs.org/reference/path/#hashandles)
Checks if any of the curves in the path have curve handles set. Handles of which both coordinates are 0 within a tolerance of 1e-12 count as not set, see [`point.isZero`](https://paperjs.org/reference/point#iszero)().
#### Returns:
  * ``Boolean`` — `true` if the path has curve handles set, `false` otherwise 


#### See also:
  * `[`segment.hasHandles`](https://paperjs.org/reference/segment#hashandles)()`
  * `[`curve.hasHandles`](https://paperjs.org/reference/curve#hashandles)()`


[`**clearHandles**()`](https://paperjs.org/reference/path/#clearhandles)
[`**clearHandles**()`](https://paperjs.org/reference/path/#clearhandles)
Clears the path’s handles by setting their coordinates to zero, turning the path into a polygon (or a polyline if it isn’t closed).
[`**divideAt**(location)`](https://paperjs.org/reference/path/#divideat-location)
[`**divideAt**(location)`](https://paperjs.org/reference/path/#divideat-location)
Divides the path on the curve at the given offset or location into two curves, by inserting a new segment at the given location.
#### Parameters:
  * `location:` `Number`⟋[`CurveLocation`](https://paperjs.org/reference/curvelocation) — the offset or location on the path at which to divide the existing curve by inserting a new segment 


#### Returns:
  * — the newly inserted segment if the location is valid, `null` otherwise 


#### See also:
  * `[`curve.divideAt(location)`](https://paperjs.org/reference/curve#divideat-location)`


[`**splitAt**(location)`](https://paperjs.org/reference/path/#splitat-location)
[`**splitAt**(location)`](https://paperjs.org/reference/path/#splitat-location)
Splits the path at the given offset or location. After splitting, the path will be open. If the path was open already, splitting will result in two paths.
#### Parameters:
  * `location:` `Number`⟋[`CurveLocation`](https://paperjs.org/reference/curvelocation) — the offset or location at which to split the path 


#### Returns:
  * `[`Path`](https://paperjs.org/reference/path)⟋`null`` — the newly created path after splitting, if any 


#### Example:
#### Example:Splitting an open path Draw a V shaped path:
#### Example:Splitting a closed path
[`**join**(path[, tolerance])`](https://paperjs.org/reference/path/#join-path)
[`**join**(path[, tolerance])`](https://paperjs.org/reference/path/#join-path)
Joins the path with the other specified path, which will be removed in the process. They can be joined if the first or last segments of either path lie in the same location. Locations are optionally compare with a provide `tolerance` value.
If `null` or `this` is passed as the other path, the path will be joined with itself if the first and last segment are in the same location.
#### Parameters:
  * `path:` [`Path`](https://paperjs.org/reference/path) — the path to join this path with; `null` or `this` to join the path with itself 
  * `tolerance:` `Number` — the tolerance with which to decide if two segments are to be considered the same location when joining — optional, default: `0`


#### Example:Joining two paths:
#### Example:Joining two paths that share a point at the start or end of their segments array:
#### Example:Joining two paths that connect at two points:
[`**reduce**([options])`](https://paperjs.org/reference/path/#reduce)
[`**reduce**([options])`](https://paperjs.org/reference/path/#reduce)
Reduces the path by removing straight curves that have a length of 0. With `options.simplify`, it also removes straight curves that are almost 0 in length, and unnecessary segments between two collinear straight curves.
#### Options:
  * `options.simplify: `Boolean`` — also remove almost zero-length curves and segments between collinear straight curves — default: `false`


#### Parameters:
  * `options:` `Object` — the reduce options — optional 


#### Returns:
  * — the reduced path 


[`**toShape**([insert])`](https://paperjs.org/reference/path/#toshape)
[`**toShape**([insert])`](https://paperjs.org/reference/path/#toshape)
Attempts to create a new shape item with same geometry as this path item, and inherits all settings from it, similar to [`item.clone`](https://paperjs.org/reference/item#clone)().
#### Parameters:
  * `insert:` `Boolean` — specifies whether the new shape should be inserted into the scene graph. When set to `true`, it is inserted above the path item — optional, default: `true`


#### Returns:
  * — the newly created shape item with the same geometry as this path item if it can be matched, `null` otherwise 


#### See also:
  * `[`shape.toPath(insert)`](https://paperjs.org/reference/shape#topath-insert)`


### Positions on Paths and Curves
[`**getLocationOf**(point)`](https://paperjs.org/reference/path/#getlocationof-point)
[`**getLocationOf**(point)`](https://paperjs.org/reference/path/#getlocationof-point)
Returns the curve location of the specified point if it lies on the path, `null` otherwise.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point on the path 


#### Returns:
  * `[`CurveLocation`](https://paperjs.org/reference/curvelocation)⟋`null`` — the curve location of the specified point 


[`**getOffsetOf**(point)`](https://paperjs.org/reference/path/#getoffsetof-point)
[`**getOffsetOf**(point)`](https://paperjs.org/reference/path/#getoffsetof-point)
Returns the length of the path from its beginning up to up to the specified point if it lies on the path, `null` otherwise.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point on the path 


#### Returns:
  * ``Number`⟋`null`` — the length of the path up to the specified point 


[`**getLocationAt**(offset)`](https://paperjs.org/reference/path/#getlocationat-offset)
[`**getLocationAt**(offset)`](https://paperjs.org/reference/path/#getlocationat-offset)
Returns the curve location of the specified offset on the path, or `null` if the offset exceeds the length of the path.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the curve location at the specified offset 


[`**getPointAt**(offset)`](https://paperjs.org/reference/path/#getpointat-offset)
[`**getPointAt**(offset)`](https://paperjs.org/reference/path/#getpointat-offset)
Calculates the point on the path at the given offset.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the point at the given offset 


#### Example:Finding the point on a path at a given offset:
#### Example:Iterating over the length of a path:
[`**getTangentAt**(offset)`](https://paperjs.org/reference/path/#gettangentat-offset)
[`**getTangentAt**(offset)`](https://paperjs.org/reference/path/#gettangentat-offset)
Calculates the normalized tangent vector of the path at the given offset.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the normalized tangent vector at the given offset 


#### Example:Working with the tangent vector at a given offset:
#### Example:Iterating over the length of a path:
[`**getNormalAt**(offset)`](https://paperjs.org/reference/path/#getnormalat-offset)
[`**getNormalAt**(offset)`](https://paperjs.org/reference/path/#getnormalat-offset)
Calculates the normal vector of the path at the given offset.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the normal vector at the given offset 


#### Example:Working with the normal vector at a given offset:
#### Example:Iterating over the length of a path:
[`**getWeightedTangentAt**(offset)`](https://paperjs.org/reference/path/#getweightedtangentat-offset)
[`**getWeightedTangentAt**(offset)`](https://paperjs.org/reference/path/#getweightedtangentat-offset)
Calculates the weighted tangent vector of the path at the given offset.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the weighted tangent vector at the given offset 


[`**getWeightedNormalAt**(offset)`](https://paperjs.org/reference/path/#getweightednormalat-offset)
[`**getWeightedNormalAt**(offset)`](https://paperjs.org/reference/path/#getweightednormalat-offset)
Calculates the weighted normal vector of the path at the given offset.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * — the weighted normal vector at the given offset 


[`**getCurvatureAt**(offset)`](https://paperjs.org/reference/path/#getcurvatureat-offset)
[`**getCurvatureAt**(offset)`](https://paperjs.org/reference/path/#getcurvatureat-offset)
Calculates the curvature of the path at the given offset. Curvatures indicate how sharply a path changes direction. A straight line has zero curvature, where as a circle has a constant curvature. The path’s radius at the given offset is the reciprocal value of its curvature.
#### Parameters:
  * `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](https://paperjs.org/reference/path#length) at the end 


#### Returns:
  * ``Number`` — the normal vector at the given offset 


[`**getOffsetsWithTangent**(tangent)`](https://paperjs.org/reference/path/#getoffsetswithtangent-tangent)
[`**getOffsetsWithTangent**(tangent)`](https://paperjs.org/reference/path/#getoffsetswithtangent-tangent)
Calculates path offsets where the path is tangential to the provided tangent. Note that tangents at the start or end are included. Tangents at segment points are returned even if only one of their handles is collinear with the provided tangent.
#### Parameters:
  * `tangent:` [`Point`](https://paperjs.org/reference/point) — the tangent to which the path must be tangential 


#### Returns:
  * `Array of `Numbers`` — path offsets where the path is tangential to the provided tangent 


## Properties inherited from [`Item`](https://paperjs.org/reference/item)
The key of the host’s node that the item represents, in a project backed by a host document, see [`project.host`](https://paperjs.org/reference/project#host). It can only be set once, on an item created by a script, to register the key that the host gave its new node.
#### Type:
  * `Number`


The unique id of the item.
Read only.
#### Type:
  * `Number`


The class name of the item as a string.
#### Values:
  * `'Group'`, `'Layer'`, `'Path'`, `'CompoundPath'`, `'Shape'`, `'Raster'`, `'SymbolItem'`, `'PointText'`


#### Type:
  * `String`


The name of the item. If the item has a name, it can be accessed by name through its parent’s children list.
#### Type:
  * `String`


#### Example:
The path style of the item.
Styles set on a [`Group`](https://paperjs.org/reference/group) or [`Layer`](https://paperjs.org/reference/layer) are applied to the children that it contains at that moment. Items added to it later do not receive them.
#### Type:


#### Example:Applying several styles to an item in one go, by passing an object to its style property:
#### Example:Copying the style of another item:
#### Example:Applying the same style object to multiple items:
Specifies whether the item is locked. When set to `true`, item interactions with the mouse are disabled.
#### Default:
  * `false`


#### Type:
  * `Boolean`


#### Example:
Specifies whether the item is visible. When set to `false`, the item won’t be drawn.
#### Default:
  * `true`


#### Type:
  * `Boolean`


#### Example:Hiding an item:
The blend mode with which the item is composited onto the canvas. Both the standard canvas compositing modes, as well as the new CSS blend modes are supported. Where the canvas doesn’t support a CSS blend mode natively, it draws as `'normal'`. Paper.js’s own modes `'add'`, `'subtract'`, `'average'`, `'pin-light'` and `'negation'` are emulated, which can have an impact on performance.
#### Values:
  * `'normal'`, `'multiply'`, `'screen'`, `'overlay'`, `'soft-light'`, `'hard- light'`, `'color-dodge'`, `'color-burn'`, `'darken'`, `'lighten'`, `'difference'`, `'exclusion'`, `'hue'`, `'saturation'`, `'luminosity'`, `'color'`, `'add'`, `'subtract'`, `'average'`, `'pin-light'`, `'negation'`, `'source-over'`, `'source-in'`, `'source-out'`, `'source-atop'`, `'destination-over'`, `'destination-in'`, `'destination-out'`, `'destination-atop'`, `'lighter'`, `'darker'`, `'copy'`, `'xor'`


#### Default:
  * `'normal'`


#### Type:
  * `String`


#### Example:Setting an item's blend mode:
The opacity of the item as a value between `0` and `1`.
#### Default:


#### Type:
  * `Number`


#### Example:Making an item 50% transparent:
Specifies whether the item functions as a guide. When set to `true`, the item is drawn as usual, but left out of hit-tests and mouse interactions. Hit-tests only find guides when `options.guides` is set, and then only them, see [`hitTest(point[, options])`](https://paperjs.org/reference/item#hittest-point).
#### Default:
  * `false`


#### Type:
  * `Boolean`


Specifies whether, and how, the item pushes aside the text of the [`AreaText`](https://paperjs.org/reference/areatext) items below it in its layer: `null`, or an object with `offset`, the space kept between them, and `invert`, to let the text flow inside it instead. `true` sets the defaults.
#### Default:
  * `null`


#### Type:
  * `Object`


#### Example:

```
var circle = new Path.Circle({ center: [100, 100], radius: 40 });
circle.textWrap = { offset: 10 };
```

Specifies whether the item is selected. This will also return `true` for [`Group`](https://paperjs.org/reference/group) items if they are partially selected, e.g. groups containing selected or partially selected paths.
Paper.js draws the visual outlines of selected items on top of your project. This can be useful for debugging, as it allows you to see the construction of paths, position of path curves, individual segment points and bounding boxes of symbol and raster items.
#### Default:
  * `false`


#### Type:
  * `Boolean`


#### See also:
  * `[`project.selectedItems`](https://paperjs.org/reference/project#selecteditems)`
  *   *   * 

#### Example:Selecting an item:
Specifies whether the item defines a clip mask. This can only be set on paths and compound paths, and only if the item is already contained within a clipping group.
#### Default:
  * `false`


#### Type:
  * `Boolean`


A plain javascript object which can be used to store arbitrary data on the item.
#### Type:
  * `Object`


#### Example:

```
var path = new Path();
path.data.remember = 'milk';
```

#### Example:

```
var path = new Path();
path.data.malcolm = new Point(20, 30);
console.log(path.data.malcolm.x); // 20
```

#### Example:

```
var path = new Path();
path.data = {
    home: 'Omicron Theta',
    found: 2338,
    pets: ['Spot']
};
console.log(path.data.pets.length); // 1
```

#### Example:

```
var path = new Path({
    data: {
        home: 'Omicron Theta',
        found: 2338,
        pets: ['Spot']
    }
});
console.log(path.data.pets.length); // 1
```

### Position and Bounding Boxes
The item’s position within the parent item’s coordinate system. By default, this is the [`rectangle.center`](https://paperjs.org/reference/rectangle#center) of the item’s [`bounds`](https://paperjs.org/reference/item#bounds) rectangle.
#### Type:


#### Example:Changing the position of a path:
#### Example:Changing the x coordinate of an item's position:
The item’s pivot point specified in the item coordinate system, defining the point around which all transformations are hinging. This is also the reference point for [`position`](https://paperjs.org/reference/item#position). By default, it is set to `null`, meaning the [`rectangle.center`](https://paperjs.org/reference/rectangle#center) of the item’s [`bounds`](https://paperjs.org/reference/item#bounds) rectangle is used as pivot.
#### Default:
  * `null`


#### Type:


The bounding rectangle of the item excluding stroke width.
#### Type:


The bounding rectangle of the item including stroke width.
Setting it fits the item’s [`bounds`](https://paperjs.org/reference/item#bounds) into the given rectangle minus the extent of the stroke on each side, also where this extent changes with the item’s proportions, as with miters. A rectangle smaller than the stroke itself shrinks the bounds to its center.
#### Type:


The bounding rectangle of the item including handles.
#### Type:


The bounding rectangle of the item without any matrix transformations.
Typical use case would be drawing a frame around the object where you want to draw something of the same size, position, rotation, and scaling, like a selection frame.
#### Type:


The current rotation angle of the item, as described by its [`matrix`](https://paperjs.org/reference/item#matrix). Please note that this only returns meaningful values for items with [`applyMatrix`](https://paperjs.org/reference/item#applymatrix) set to `false`, meaning they do not directly bake transformations into their content.
#### Type:
  * `Number`


The current scale factor of the item, as described by its [`matrix`](https://paperjs.org/reference/item#matrix). Please note that this only returns meaningful values for items with [`applyMatrix`](https://paperjs.org/reference/item#applymatrix) set to `false`, meaning they do not directly bake transformations into their content.
#### Type:


The item’s transformation matrix, defining position and dimensions in relation to its parent item in which it is contained.
#### Type:


The item’s global transformation matrix in relation to the global project coordinate space. Note that the view’s transformations resulting from zooming and panning are not factored in.
Read only.
#### Type:


The item’s global matrix in relation to the view coordinate space. This means that the view’s transformations resulting from zooming and panning are factored in.
Read only.
#### Type:


Controls whether the transformations applied to the item (e.g. through [`transform(matrix)`](https://paperjs.org/reference/item#transform-matrix), [`rotate(angle)`](https://paperjs.org/reference/item#rotate-angle), [`scale(scale)`](https://paperjs.org/reference/item#scale-scale), etc.) are stored in its [`matrix`](https://paperjs.org/reference/item#matrix) property, or whether they are directly applied to its contents or children (passed on to the segments in [`Path`](https://paperjs.org/reference/path) items, the children of [`Group`](https://paperjs.org/reference/group) items, etc.).
#### Default:
  * `true`


#### Type:
  * `Boolean`


### Project Hierarchy
The project that this item belongs to.
Read only.
#### Type:


The view that this item belongs to.
Read only.
#### Type:


The scope that this item belongs to, through its project.
Read only.
#### Type:


The layer that this item is contained within.
Read only.
#### Type:


The item that this item is contained within.
#### Type:


#### Example:

```
var path = new Path();

// New items are placed in the active layer:
console.log(path.parent == project.activeLayer); // true

var group = new Group();
group.addChild(path);

// Now the parent of the path has become the group:
console.log(path.parent == group); // true
```

#### Example:Setting the parent of the item to another item

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

#### Example:Setting the parent of an item in the constructor

```
var group = new Group();

var path = new Path({
    parent: group
});

// The parent of the path is the group:
console.log(path.parent == group); // true

// The path is contained in the children list of group:
console.log(group.children[0] == path); // true
```

The children items contained within this item. Items that define a [`name`](https://paperjs.org/reference/item#name) can also be accessed by name.
Only [`Group`](https://paperjs.org/reference/group), [`Layer`](https://paperjs.org/reference/layer) and [`CompoundPath`](https://paperjs.org/reference/compoundpath) items can have children. On all other items, such as [`Path`](https://paperjs.org/reference/path), [`Shape`](https://paperjs.org/reference/shape), [`Raster`](https://paperjs.org/reference/raster), [`SymbolItem`](https://paperjs.org/reference/symbolitem) and [`PointText`](https://paperjs.org/reference/pointtext), `children` is `undefined`.
**Please note:** The children array should not be modified directly using array functions. To remove single items from the children list, use [`item.remove`](https://paperjs.org/reference/item#remove)(), to remove all items from the children list, use [`item.removeChildren`](https://paperjs.org/reference/item#removechildren)(). To add items to the children list, use [`item.addChild(item)`](https://paperjs.org/reference/item#addchild-item) or [`item.insertChild(index, item)`](https://paperjs.org/reference/item#insertchild-index-item).
#### Type:
  * Array of [`Item`](https://paperjs.org/reference/item) objects 


#### Example:Accessing items in the children array:
#### Example:Accessing children by name:
#### Example:Passing an array of items to item.children:
The first item contained within this item. This is a shortcut for accessing `item.children[0]`.
Read only.
#### Type:


The last item contained within this item.This is a shortcut for accessing `item.children[item.children.length - 1]`.
Read only.
#### Type:


The next item on the same level as this item.
Read only.
#### Type:


The previous item on the same level as this item.
Read only.
#### Type:


The index of this item within the list of its parent’s children.
#### Type:
  * `Number`


### Stroke Style
The color of the stroke.
#### Type:
  * [`Color`](https://paperjs.org/reference/color)⟋`null`


#### Example:Setting the stroke color of a path:
The width of the stroke.
#### Type:
  * `Number`


#### Example:Setting an item's stroke width:
The shape to be used at the beginning and end of open [`Path`](https://paperjs.org/reference/path) items, when they have a stroke.
#### Values:
  * `'round'`, `'square'`, `'butt'`


#### Default:
  * `'butt'`


#### Type:
  * `String`


#### Example:A look at the different stroke caps:
The shape to be used at the segments and corners of [`Path`](https://paperjs.org/reference/path) items when they have a stroke.
#### Values:
  * `'miter'`, `'round'`, `'bevel'`


#### Default:
  * `'miter'`


#### Type:
  * `String`


#### Example:A look at the different stroke joins:
The dash offset of the stroke.
#### Default:


#### Type:
  * `Number`


Specifies whether the stroke is to be drawn taking the current affine transformation into account (the default behavior), or whether it should appear as a non-scaling stroke. On text, non-scaling strokes are exact for uniform scaling only, as the glyphs are always stroked through the transformation.
#### Default:
  * `true`


#### Type:
  * `Boolean`


Specifies an array containing the dash and gap lengths of the stroke.
#### Default:
  * `[]`


#### Type:
  * Array of `Numbers`


#### Example:
The miter limit of the stroke. When two line segments meet at a sharp angle and miter joins have been specified for [`item.strokeJoin`](https://paperjs.org/reference/item#strokejoin), it is possible for the miter to extend far beyond the [`item.strokeWidth`](https://paperjs.org/reference/item#strokewidth) of the path. The miterLimit imposes a limit on the ratio of the miter length to the [`item.strokeWidth`](https://paperjs.org/reference/item#strokewidth).
#### Default:
  * `10`


#### Type:
  * `Number`


The order in which the fill and the stroke are painted, as in SVG’s `paint-order`, named after what is painted first: `'fill'` paints the fill first, `'stroke'` paints the stroke first, so the fill covers its inner half.
#### Values:
  * `'fill'`, `'stroke'`


#### Default:
  * `'fill'`


#### Type:
  * `String`


### Fill Style
The fill color of the item.
#### Type:
  * [`Color`](https://paperjs.org/reference/color)⟋`null`


#### Example:Setting the fill color of a path to red:
The fill-rule with which the shape gets filled. Please note that only modern browsers support fill-rules other than `'nonzero'`.
#### Values:
  * `'nonzero'`, `'evenodd'`


#### Default:
  * `'nonzero'`


#### Type:
  * `String`


### Shadow Style
The shadow color.
#### Type:
  * [`Color`](https://paperjs.org/reference/color)⟋`null`


#### Example:Creating a circle with a black shadow:
The shadow’s blur radius.
#### Default:


#### Type:
  * `Number`


The shadow’s offset.
#### Default:


#### Type:


### Selection Style
The color the item is highlighted with when selected. If the item does not specify its own color, the color defined by its layer is used instead.
#### Type:
  * [`Color`](https://paperjs.org/reference/color)⟋`null`


### Event Handlers
Item level handler function to be called on each frame of an animation. The function receives an event object which contains information about the frame event:
#### Type:
  * `Function`⟋`null`


#### Options:
  * `event.count: `Number`` — the number of times the frame event was fired
  * `event.time: `Number`` — the total amount of time passed since the first frame event in seconds
  * `event.delta: `Number`` — the time passed in seconds since the last frame event


#### See also:
  * 

#### Example:Creating an animation:
The function to be called when the mouse button is pushed down on the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * 

#### Example:Press the mouse button down on the circle shaped path, to make it red:
#### Example:Press the mouse on the circle shaped paths to remove them:
The function to be called when the mouse position changes while the mouse is being dragged over the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * 

#### Example:Press and drag the mouse on the blue circle to move it:
The function to be called when the mouse button is released over the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * 

#### Example:Release the mouse button over the circle shaped path, to make it red:
The function to be called when the mouse clicks on the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * 

#### Example:Click on the circle shaped path, to make it red:
#### Example:Click on the circle shaped paths to remove them:
The function to be called when the mouse double clicks on the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * `[`view.onDoubleClick`](https://paperjs.org/reference/view#ondoubleclick)`


#### Example:Double click on the circle shaped path, to make it red:
#### Example:Double click on the circle shaped paths to remove them:
The function to be called repeatedly while the mouse moves over the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * 

#### Example:Move over the circle shaped path, to change its opacity:
The function to be called when the mouse moves over the item. This function will only be called again, once the mouse moved outside of the item first. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * `[`view.onMouseEnter`](https://paperjs.org/reference/view#onmouseenter)`


#### Example:When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.
#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.
The function to be called when the mouse moves out of the item. The function receives a [`MouseEvent`](https://paperjs.org/reference/mouseevent) object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with [`event.stopPropagation`](https://paperjs.org/reference/event#stoppropagation)() or by returning `false` from the handler.
#### Type:
  * `Function`⟋`null`


#### See also:
  * `[`view.onMouseLeave`](https://paperjs.org/reference/view#onmouseleave)`


#### Example:Move the mouse over the circle shaped path and then move it out of it again to set its fill color to red:
## Methods inherited from [`Item`](https://paperjs.org/reference/item)
[`**set**(props)`](https://paperjs.org/reference/path/#set-props)
[`**set**(props)`](https://paperjs.org/reference/path/#set-props)
Sets the properties of the passed object literal on this item to the values defined in the object literal, if the item has property of the given name (or a setter defined for it).
#### Parameters:
  * `props:` `Object`


#### Returns:
  * — the item itself 


#### Example:Setting properties through an object literal
[`**clone**([options])`](https://paperjs.org/reference/path/#clone)
[`**clone**([options])`](https://paperjs.org/reference/path/#clone)
Clones the item within the same project and places the copy above the item.
#### Options:
  * `insert: undefined` — specifies whether the copy should be inserted into the scene graph. When set to `true`, it is inserted above the original — default: `true`
  * `deep: undefined` — specifies whether the item’s children should also be cloned — default: `true`


#### Parameters:
  * `options:` `Object` — optional, default: `{ insert: true, deep: true }`


#### Returns:
  * — the newly cloned item 


#### Example:Cloning items:
[`**copyContent**(source)`](https://paperjs.org/reference/path/#copycontent-source)
[`**copyContent**(source)`](https://paperjs.org/reference/path/#copycontent-source)
Copies the content of the specified item over to this item.
#### Parameters:
  * `source:` [`Item`](https://paperjs.org/reference/item) — the item to copy the content from 


[`**copyAttributes**(source, excludeMatrix)`](https://paperjs.org/reference/path/#copyattributes-source-excludeMatrix)
[`**copyAttributes**(source, excludeMatrix)`](https://paperjs.org/reference/path/#copyattributes-source-excludeMatrix)
Copies all attributes of the specified item over to this item. This includes its style, visibility, matrix, pivot, blend-mode, opacity, selection state, data, name, etc.
#### Parameters:
  * `source:` [`Item`](https://paperjs.org/reference/item) — the item to copy the attributes from 
  * `excludeMatrix:` `Boolean` — whether to exclude the transformation matrix when copying all attributes 


[`**rasterize**([options])`](https://paperjs.org/reference/path/#rasterize)
[`**rasterize**([options])`](https://paperjs.org/reference/path/#rasterize)
Rasterizes the item into a newly created Raster object. The item itself is not removed after rasterization.
#### Options:
  * `options.resolution: `Number`` — the desired resolution to be used when rasterizing, in pixels per inch (DPI). If not specified, the value of `view.resolution` is used by default. — default: `view.resolution`
  * `options.raster: [`Raster`](https://paperjs.org/reference/raster)` — specifies a raster to be reused when rasterizing. If the raster has the desired size already, then the underlying canvas is reused and no new memory needs to be allocated. If no raster is provided, a new raster item is created and returned instead. — default: `null`
  * `options.insert: `Boolean`` — specifies whether the raster should be inserted into the scene graph. When set to `true`, it is inserted above the rasterized item. — default: `true`


#### Parameters:
  * `options:` `Object` — the rasterization options — optional, default: `{}`


#### Returns:
  * — the reused raster or the newly created raster item 


#### Example:Rasterizing an item:
### Geometric Tests
[`**contains**(point)`](https://paperjs.org/reference/path/#contains-point)
[`**contains**(point)`](https://paperjs.org/reference/path/#contains-point)
Checks whether the item’s geometry contains the given point.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point to check for 


#### Returns:
  * ``Boolean``


#### Example:Click within and outside the star below Create a star shaped path:
[`**isInside**(rect)`](https://paperjs.org/reference/path/#isinside-rect)
[`**isInside**(rect)`](https://paperjs.org/reference/path/#isinside-rect)
#### Parameters:
  * `rect:` [`Rectangle`](https://paperjs.org/reference/rectangle) — the rectangle to check against 


#### Returns:
  * ``Boolean``


[`**intersects**(item)`](https://paperjs.org/reference/path/#intersects-item)
[`**intersects**(item)`](https://paperjs.org/reference/path/#intersects-item)
Checks whether the item overlaps with the given item: whether their outlines cross, or one contains the other, as [`rectangle.intersects(rect)`](https://paperjs.org/reference/rectangle#intersects-rect) does for rectangles. Items other than paths and shapes are checked through their bounds. To only check whether outlines cross, use [`pathItem.getIntersections(path)`](https://paperjs.org/reference/pathitem#getintersections-path).
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if the items overlap, `false` otherwise 


### Hit-testing, Fetching and Matching Items
[`**hitTest**(point[, options])`](https://paperjs.org/reference/path/#hittest-point)
[`**hitTest**(point[, options])`](https://paperjs.org/reference/path/#hittest-point)
Performs a hit-test on the item and its children (if it is a [`Group`](https://paperjs.org/reference/group) or [`Layer`](https://paperjs.org/reference/layer)) at the location of the specified point, returning the first found hit.
The options object allows you to control the specifics of the hit-test. Without options, `fill`, `stroke` and `segments` are hit-tested. As soon as an options object is passed, only the hit-tests that it sets to `true` are performed. It may contain a combination of the following values:
#### Options:
  * `options.tolerance: `Number`` — the tolerance of the hit-test, in project coordinates — default: `[`paperScope.settings`](https://paperjs.org/reference/paperscope#settings).hitTolerance`
  * `options.class: `Function`` — only hit-test against a specific item class, or any of its sub-classes, by providing the constructor function against which an `instanceof` check is performed: `Group`, `Layer`, `Path`, `CompoundPath`, `Shape`, `Raster`, `SymbolItem`, `PointText`, …
  * `options.match: `Function`` — a match function to be called for each found hit result: Return `true` to return the result, `false` to keep searching
  * `options.fill: `Boolean`` — hit-test the fill of items
  * `options.stroke: `Boolean`` — hit-test the stroke of path items, taking into account the setting of stroke color and width
  * `options.segments: `Boolean`` — hit-test for [`segment.point`](https://paperjs.org/reference/segment#point) of [`Path`](https://paperjs.org/reference/path) items
  * `options.curves: `Boolean`` — hit-test the curves of path items, without taking the stroke color or width into account
  * `options.handles: `Boolean`` — hit-test for the handles ([`segment.handleIn`](https://paperjs.org/reference/segment#handlein) / [`segment.handleOut`](https://paperjs.org/reference/segment#handleout)) of path segments.
  * `options.ends: `Boolean`` — only hit-test for the first or last segment points of open path items
  * `options.position: `Boolean`` — hit-test the [`item.position`](https://paperjs.org/reference/item#position) of of items, which depends on the setting of [`item.pivot`](https://paperjs.org/reference/item#pivot)
  * `options.center: `Boolean`` — hit-test the [`rectangle.center`](https://paperjs.org/reference/rectangle#center) of the bounding rectangle of items ([`item.bounds`](https://paperjs.org/reference/item#bounds))
  * `options.bounds: `Boolean`` — hit-test the corners and side-centers of the bounding rectangle of items ([`item.bounds`](https://paperjs.org/reference/item#bounds))
  * `options.guides: `Boolean`` — only hit-test items that have [`item.guide`](https://paperjs.org/reference/item#guide) set to `true`
  * `options.selected: `Boolean`` — only hit selected items


#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point where the hit-test should be performed (in global coordinates system). 
  * `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`


#### Returns:
  * — a hit result object describing what exactly was hit or `null` if nothing was hit 


[`**hitTestAll**(point[, options])`](https://paperjs.org/reference/path/#hittestall-point)
[`**hitTestAll**(point[, options])`](https://paperjs.org/reference/path/#hittestall-point)
Performs a hit-test on the item and its children (if it is a [`Group`](https://paperjs.org/reference/group) or [`Layer`](https://paperjs.org/reference/layer)) at the location of the specified point, returning all found hits.
The options object allows you to control the specifics of the hit- test. See [`hitTest(point[, options])`](https://paperjs.org/reference/item#hittest-point) for a list of all options.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point where the hit-test should be performed (in global coordinates system). 
  * `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`


#### Returns:
  * `Array of [`HitResult`](https://paperjs.org/reference/hitresult) objects` — hit result objects for all hits, describing what exactly was hit or `null` if nothing was hit 


#### See also:
  * `[`hitTest(point[, options])`](https://paperjs.org/reference/item#hittest-point);`


[`**matches**(options)`](https://paperjs.org/reference/path/#matches-options)
[`**matches**(options)`](https://paperjs.org/reference/path/#matches-options)
Checks whether the item matches the criteria described by the given object, by iterating over all of its properties and matching against their values through [`matches(name, compare)`](https://paperjs.org/reference/item#matches-name-compare).
See [`project.getItems(options)`](https://paperjs.org/reference/project#getitems-options) for a selection of illustrated examples.
#### Parameters:
  * `options:` `Object`⟋`Function` — the criteria to match against 


#### Returns:
  * ``Boolean`` — `true` if the item matches all the criteria, `false` otherwise 


#### See also:
  * `[`getItems(options)`](https://paperjs.org/reference/item#getitems-options)`


[`**matches**(name, compare)`](https://paperjs.org/reference/path/#matches-name-compare)
[`**matches**(name, compare)`](https://paperjs.org/reference/path/#matches-name-compare)
Checks whether the item matches the given criteria. Extended matching is possible by providing a compare function or a regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x-coordinate to match all points with that x-value). Partial matching does work for [`item.data`](https://paperjs.org/reference/item#data).
See [`project.getItems(options)`](https://paperjs.org/reference/project#getitems-options) for a selection of illustrated examples.
#### Parameters:
  * `name:` `String` — the name of the state to match against 
  * `compare:` `Object` — the value, function or regular expression to compare against 


#### Returns:
  * ``Boolean`` — `true` if the item matches the state, `false` otherwise 


#### See also:
  * `[`getItems(options)`](https://paperjs.org/reference/item#getitems-options)`


[`**getItems**(options)`](https://paperjs.org/reference/path/#getitems-options)
[`**getItems**(options)`](https://paperjs.org/reference/path/#getitems-options)
Fetch the descendants (children or children of children) of this item that match the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for [`item.data`](https://paperjs.org/reference/item#data).
Matching items against a rectangular area is also possible, by setting either `options.inside` or `options.overlapping` to a rectangle describing the area in which the items either have to be fully or partly contained.
See [`project.getItems(options)`](https://paperjs.org/reference/project#getitems-options) for a selection of illustrated examples.
#### Options:
  * `options.recursive: `Boolean`` — whether to loop recursively through all children, or stop at the current level — default: `true`
  * `options.match: `Function`` — a match function to be called for each item, allowing the definition of more flexible item checks that are not bound to properties. If no other match properties are defined, this function can also be passed instead of the `options` object
  * `options.class: `Function`` — the constructor function of the item type to match against
  * `options.inside: [`Rectangle`](https://paperjs.org/reference/rectangle)` — the rectangle in which the items need to be fully contained
  * `options.overlapping: [`Rectangle`](https://paperjs.org/reference/rectangle)` — the rectangle with which the items need to at least partly overlap


#### Parameters:
  * `options:` `Object`⟋`Function` — the criteria to match against 


#### Returns:
  * `Array of [`Item`](https://paperjs.org/reference/item) objects` — the list of matching descendant items, in their stacking order from bottom to top, with each item listed before its own descendants 


#### See also:
  * 

[`**getItem**(options)`](https://paperjs.org/reference/path/#getitem-options)
[`**getItem**(options)`](https://paperjs.org/reference/path/#getitem-options)
Fetch the first descendant (child or child of child) of this item that matches the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for [`item.data`](https://paperjs.org/reference/item#data). See [`project.getItems(match)`](https://paperjs.org/reference/project#getitems-match) for a selection of illustrated examples.
#### Parameters:
  * `options:` `Object`⟋`Function` — the criteria to match against 


#### Returns:
  * — the first descendant item matching the given criteria 


#### See also:
  * `[`getItems(options)`](https://paperjs.org/reference/item#getitems-options)`


### Importing / Exporting JSON and SVG
[`**exportJSON**([options])`](https://paperjs.org/reference/path/#exportjson)
[`**exportJSON**([options])`](https://paperjs.org/reference/path/#exportjson)
Exports (serializes) the item with its content and child items to a JSON data string.
#### Options:
  * `options.asString: `Boolean`` — whether the JSON is returned as a `Object` or a `String` — default: `true`
  * `options.precision: `Number`` — the amount of fractional digits in numbers used in JSON data — default: `5`


#### Parameters:
  * `options:` `Object` — the serialization options — optional 


#### Returns:
  * ``String`` — the exported JSON data 


[`**importJSON**(json)`](https://paperjs.org/reference/path/#importjson-json)
[`**importJSON**(json)`](https://paperjs.org/reference/path/#importjson-json)
Imports (deserializes) the stored JSON data into this item. If the data describes an item of the same class or a parent class of the item, the data is imported into the item itself. If not, the imported item is added to this item’s [`item.children`](https://paperjs.org/reference/item#children) list. Note that not all type of items can have children.
#### Parameters:
  * `json:` `String` — the JSON data to import from 


#### Returns:
  * 

[`**exportSVG**([options])`](https://paperjs.org/reference/path/#exportsvg)
[`**exportSVG**([options])`](https://paperjs.org/reference/path/#exportsvg)
Exports the item with its content and child items as an SVG DOM.
#### Options:
  * `options.bounds: `String`⟋[`Rectangle`](https://paperjs.org/reference/rectangle)` — the bounds of the area to export, either as a string (`‘view’`, `content’`), or a [`Rectangle`](https://paperjs.org/reference/rectangle) object: `'view'` uses the view bounds, `'content'` uses the stroke bounds of all content — default: `‘view’`
  * `options.matrix: [`Matrix`](https://paperjs.org/reference/matrix)` — the matrix with which to transform the exported content: If `options.bounds` is set to `'view'`, `paper.view.matrix` is used, for all other settings of `options.bounds` the identity matrix is used. — default: `paper.view.matrix`
  * `options.asString: `Boolean`` — whether a SVG node or a `String` is to be returned — default: `false`
  * `options.precision: `Number`` — the amount of fractional digits in numbers used in SVG data — default: `5`
  * `options.matchShapes: `Boolean`` — whether path items should tried to be converted to SVG shape items (rect, circle, ellipse, line, polyline, polygon), if their geometries match — default: `false`
  * `options.embedImages: `Boolean`` — whether raster images should be embedded as base64 data inlined in the xlink:href attribute, or kept as a link to their external URL. — default: `true`
  * `options.reuseImages: `Boolean`` — whether raster images with the same content should only be exported once into the `<defs>` element, and placed through `<use>` elements referencing it — default: `false`
  * `options.idPrefix: `String`` — a prefix for the ids generated for definitions such as gradients, clip paths and symbols, to keep them unique when several exported SVGs are placed in one document — default: `’’`
  * `options.reduceAttributes: `Boolean`` — wether to only include style attributes in the SVG output that differ from their parents, or to always include them (much faster but leading to redundancies). — default: `true`
  * [options.processNode] {Function} the function to process the SVG node made for each exported item, receiving an object with the `item` and its `node`: It can change the node, e.g. to add attributes that Paper.js doesn't export, or return a node to replace it with. It is called before the item's name, style, visibility and data are set on the node, which replace attributes of the same names.


#### Parameters:
  * `options:` `Object` — the export options — optional 


#### Returns:
  * ``SVGElement`⟋`String`` — the item converted to an SVG node or a `String` depending on `option.asString` value 


[`**importSVG**(svg[, options])`](https://paperjs.org/reference/path/#importsvg-svg)
[`**importSVG**(svg[, options])`](https://paperjs.org/reference/path/#importsvg-svg)
Converts the provided SVG content into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call [`item.removeChildren`](https://paperjs.org/reference/item#removechildren)() to do so.
`<symbol>` elements are imported as [`SymbolDefinition`](https://paperjs.org/reference/symboldefinition) items, and the `<use>` elements that place them as [`SymbolItem`](https://paperjs.org/reference/symbolitem) items. The styles that `<use>` elements inherit don’t reach the symbols’ content.
The layers in SVG content that Paper.js exported come back as [`Layer`](https://paperjs.org/reference/layer) items inside the imported group. To make the layers of a project’s SVG the layers of a project again, add them to it with `item.children.slice().forEach(project.addLayer, project)`.
URLs are fetched as they are, so validate URLs that come from untrusted sources first, especially on servers, where they could reach internal addresses.
#### Options:
  * `options.expandShapes: `Boolean`` — whether imported shape items should be expanded to path items — default: `false`
  * [options.crossOrigin] {String} the {@link Raster#crossOrigin} value of the rasters created for `` elements, to load their images with CORS
  * `options.onLoad: `Function`` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external resources.
  * `options.onError: `Function`` — the callback function to call if an error occurs during loading. Only required when loading from external resources.
  * `options.insert: `Boolean`` — whether the imported items should be added to the item that `importSVG()` is called on — default: `true`
  * `options.applyMatrix: `Boolean`` — whether the imported items should have their transformation matrices applied to their contents or not — default: `[`paperScope.settings`](https://paperjs.org/reference/paperscope#settings).applyMatrix`
  * [options.processItem] {Function} the function to process the item made for each imported SVG element, receiving an object with the `item` and its `node`: It can read attributes that Paper.js doesn't import, or return an item to replace it with. It is called after the element's attributes and data are applied to the item, so it can extend `item.data`. A replacement item doesn't receive them: copy them over from `item` as needed.


#### Parameters:
  * `svg:` `SVGElement`⟋`String` — the SVG content to import, either as a SVG DOM node, a string containing SVG content, or a string describing the URL of the SVG file to fetch. 
  * `options:` `Object` — the import options — optional 


#### Returns:
  * — the newly created Paper.js item containing the converted SVG content 


[`**importSVG**(svg, onLoad)`](https://paperjs.org/reference/path/#importsvg-svg-onLoad)
[`**importSVG**(svg, onLoad)`](https://paperjs.org/reference/path/#importsvg-svg-onLoad)
Imports the provided external SVG file, converts it into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call [`item.removeChildren`](https://paperjs.org/reference/item#removechildren)() to do so.
#### Parameters:
  * `svg:` `SVGElement`⟋`String` — the URL of the SVG file to fetch. 
  * `onLoad:` `Function` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external files. 


#### Returns:
  * — the newly created Paper.js item containing the converted SVG content 


### Hierarchy Operations
[`**addChild**(item)`](https://paperjs.org/reference/path/#addchild-item)
[`**addChild**(item)`](https://paperjs.org/reference/path/#addchild-item)
Adds the specified item as a child of this item at the end of the its [`children`](https://paperjs.org/reference/item#children) list. You can use this function for groups, compound paths and layers.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to be added as a child 


#### Returns:
  * — the added item, or `null` if adding was not possible 


[`**insertChild**(index, item)`](https://paperjs.org/reference/path/#insertchild-index-item)
[`**insertChild**(index, item)`](https://paperjs.org/reference/path/#insertchild-index-item)
Inserts the specified item as a child of this item at the specified index in its [`children`](https://paperjs.org/reference/item#children) list. You can use this function for groups, compound paths and layers.
#### Parameters:
  * `index:` `Number` — the index at which to insert the item 
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to be inserted as a child 


#### Returns:
  * — the inserted item, or `null` if inserting was not possible 


[`**addChildren**(items)`](https://paperjs.org/reference/path/#addchildren-items)
[`**addChildren**(items)`](https://paperjs.org/reference/path/#addchildren-items)
Adds the specified items as children of this item at the end of the its children list. You can use this function for groups, compound paths and layers.
#### Parameters:
  * `items:` Array of [`Item`](https://paperjs.org/reference/item) objects — the items to be added as children 


#### Returns:
  * `Array of [`Item`](https://paperjs.org/reference/item) objects` — the added items, or `null` if adding was not possible 


[`**insertChildren**(index, items)`](https://paperjs.org/reference/path/#insertchildren-index-items)
[`**insertChildren**(index, items)`](https://paperjs.org/reference/path/#insertchildren-index-items)
Inserts the specified items as children of this item at the specified index in its [`children`](https://paperjs.org/reference/item#children) list. You can use this function for groups, compound paths and layers.
#### Parameters:
  * `index:` `Number`
  * `items:` Array of [`Item`](https://paperjs.org/reference/item) objects — the items to be appended as children 


#### Returns:
  * `Array of [`Item`](https://paperjs.org/reference/item) objects` — the inserted items, or `null` if inserted was not possible 


[`**insertAbove**(item)`](https://paperjs.org/reference/path/#insertabove-item)
[`**insertAbove**(item)`](https://paperjs.org/reference/path/#insertabove-item)
Inserts this item above the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item above which it should be inserted 


#### Returns:
  * — the inserted item, or `null` if inserting was not possible 


[`**insertBelow**(item)`](https://paperjs.org/reference/path/#insertbelow-item)
[`**insertBelow**(item)`](https://paperjs.org/reference/path/#insertbelow-item)
Inserts this item below the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item below which it should be inserted 


#### Returns:
  * — the inserted item, or `null` if inserting was not possible 


[`**sendToBack**()`](https://paperjs.org/reference/path/#sendtoback)
[`**sendToBack**()`](https://paperjs.org/reference/path/#sendtoback)
Sends this item to the back of all other items within the same parent.
[`**bringToFront**()`](https://paperjs.org/reference/path/#bringtofront)
[`**bringToFront**()`](https://paperjs.org/reference/path/#bringtofront)
Brings this item to the front of all other items within the same parent.
[`**addTo**(owner)`](https://paperjs.org/reference/path/#addto-owner)
[`**addTo**(owner)`](https://paperjs.org/reference/path/#addto-owner)
Adds it to the specified owner, which can be either a [`Item`](https://paperjs.org/reference/item) or a [`Project`](https://paperjs.org/reference/project).
#### Parameters:
  * `owner:` [`Project`](https://paperjs.org/reference/project)⟋[`Layer`](https://paperjs.org/reference/layer)⟋[`Group`](https://paperjs.org/reference/group)⟋[`CompoundPath`](https://paperjs.org/reference/compoundpath) — the item or project to add the item to 


#### Returns:
  * — the item itself, if it was successfully added 


[`**copyTo**(owner)`](https://paperjs.org/reference/path/#copyto-owner)
[`**copyTo**(owner)`](https://paperjs.org/reference/path/#copyto-owner)
Clones the item and adds it to the specified owner, which can be either a [`Item`](https://paperjs.org/reference/item) or a [`Project`](https://paperjs.org/reference/project).
#### Parameters:
  * `owner:` [`Project`](https://paperjs.org/reference/project)⟋[`Layer`](https://paperjs.org/reference/layer)⟋[`Group`](https://paperjs.org/reference/group)⟋[`CompoundPath`](https://paperjs.org/reference/compoundpath) — the item or project to copy the item to 


#### Returns:
  * — the new copy of the item, if it was successfully added 


[`**remove**()`](https://paperjs.org/reference/path/#remove)
[`**remove**()`](https://paperjs.org/reference/path/#remove)
Removes the item and all its children from the project. The item is not destroyed and can be inserted again after removal.
#### Returns:
  * ``Boolean`` — `true` if the item was removed, `false` otherwise 


[`**replaceWith**(...item)`](https://paperjs.org/reference/path/#replacewith-item)
[`**replaceWith**(...item)`](https://paperjs.org/reference/path/#replacewith-item)
Replaces this item with the provided new items which will take its place in the project hierarchy instead, in the given order. This also ungroups a group, e.g. `group.replaceWith(…group.children)`, but note that the items keep their own matrices, see [`group.ungroup`](https://paperjs.org/reference/group#ungroup)().
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the items that will replace this item 


#### Returns:
  * ``Boolean`` — `true` if the item was replaced, `false` otherwise 


[`**removeChildren**()`](https://paperjs.org/reference/path/#removechildren)
[`**removeChildren**()`](https://paperjs.org/reference/path/#removechildren)
Removes all of the item’s [`children`](https://paperjs.org/reference/item#children) (if any).
#### Returns:
  * `Array of [`Item`](https://paperjs.org/reference/item) objects` — an array containing the removed items 


[`**removeChildren**(start[, end])`](https://paperjs.org/reference/path/#removechildren-start)
[`**removeChildren**(start[, end])`](https://paperjs.org/reference/path/#removechildren-start)
Removes the children from the specified `start` index to and excluding the `end` index from the parent’s [`children`](https://paperjs.org/reference/item#children) array.
#### Parameters:
  * `start:` `Number` — the beginning index, inclusive 
  * `end:` `Number` — the ending index, exclusive — optional, default: `children.length`


#### Returns:
  * `Array of [`Item`](https://paperjs.org/reference/item) objects` — an array containing the removed items 


[`**reverseChildren**()`](https://paperjs.org/reference/path/#reversechildren)
[`**reverseChildren**()`](https://paperjs.org/reference/path/#reversechildren)
Reverses the order of the item’s children
### Tests
[`**isEmpty**([recursively])`](https://paperjs.org/reference/path/#isempty)
[`**isEmpty**([recursively])`](https://paperjs.org/reference/path/#isempty)
Specifies whether the item has any content or not. The meaning of what content is differs from type to type. For example, a [`Group`](https://paperjs.org/reference/group) with no children, a [`TextItem`](https://paperjs.org/reference/textitem) with no text content and a [`Path`](https://paperjs.org/reference/path) with no segments all are considered empty.
#### Parameters:
  * `recursively:` `Boolean` — whether an item with children should be considered empty if all its descendants are empty — optional, default: `false`


#### Returns:
  * ``Boolean``


### Style Tests
[`**hasFill**()`](https://paperjs.org/reference/path/#hasfill)
[`**hasFill**()`](https://paperjs.org/reference/path/#hasfill)
Checks whether the item has a visible fill, a fill color with an alpha above 0. Hit-tests also hit transparent fills, see [`hitTest`](https://paperjs.org/reference/item#hittest).
#### Returns:
  * ``Boolean`` — `true` if the item has a visible fill, `false` otherwise 


[`**hasStroke**()`](https://paperjs.org/reference/path/#hasstroke)
[`**hasStroke**()`](https://paperjs.org/reference/path/#hasstroke)
Checks whether the item has a stroke.
#### Returns:
  * ``Boolean`` — `true` if the item has a stroke, `false` otherwise 


[`**hasShadow**()`](https://paperjs.org/reference/path/#hasshadow)
[`**hasShadow**()`](https://paperjs.org/reference/path/#hasshadow)
Checks whether the item has a shadow.
#### Returns:
  * ``Boolean`` — `true` if the item has a shadow, `false` otherwise 


### Hierarchy Tests
[`**hasChildren**()`](https://paperjs.org/reference/path/#haschildren)
[`**hasChildren**()`](https://paperjs.org/reference/path/#haschildren)
Checks if the item contains any children items.
#### Returns:
  * ``Boolean`` — `true` it has one or more children, `false` otherwise 


[`**isInserted**()`](https://paperjs.org/reference/path/#isinserted)
[`**isInserted**()`](https://paperjs.org/reference/path/#isinserted)
Checks whether the item and all its parents are inserted into scene graph or not.
#### Returns:
  * ``Boolean`` — `true` if the item is inserted into the scene graph, `false` otherwise 


[`**isAbove**(item)`](https://paperjs.org/reference/path/#isabove-item)
[`**isAbove**(item)`](https://paperjs.org/reference/path/#isabove-item)
Checks if this item is above the specified item in the stacking order of the project. If one item is a descendant of the other, neither is above the other and `false` is returned.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if it is above the specified item, `false` otherwise 


[`**isBelow**(item)`](https://paperjs.org/reference/path/#isbelow-item)
[`**isBelow**(item)`](https://paperjs.org/reference/path/#isbelow-item)
Checks if the item is below the specified item in the stacking order of the project. If one item is a descendant of the other, neither is below the other and `false` is returned.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if it is below the specified item, `false` otherwise 


[`**isParent**(item)`](https://paperjs.org/reference/path/#isparent-item)
[`**isParent**(item)`](https://paperjs.org/reference/path/#isparent-item)
Checks whether the specified item is the parent of the item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if it is the parent of the item, `false` otherwise 


[`**isChild**(item)`](https://paperjs.org/reference/path/#ischild-item)
[`**isChild**(item)`](https://paperjs.org/reference/path/#ischild-item)
Checks whether the specified item is a child of the item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` it is a child of the item, `false` otherwise 


[`**isDescendant**(item)`](https://paperjs.org/reference/path/#isdescendant-item)
[`**isDescendant**(item)`](https://paperjs.org/reference/path/#isdescendant-item)
Checks if the item is contained within the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if it is inside the specified item, `false` otherwise 


[`**isAncestor**(item)`](https://paperjs.org/reference/path/#isancestor-item)
[`**isAncestor**(item)`](https://paperjs.org/reference/path/#isancestor-item)
Checks if the item is an ancestor of the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if the item is an ancestor of the specified item, `false` otherwise 


[`**isSibling**(item)`](https://paperjs.org/reference/path/#issibling-item)
[`**isSibling**(item)`](https://paperjs.org/reference/path/#issibling-item)
Checks if the item is an a sibling of the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item) — the item to check against 


#### Returns:
  * ``Boolean`` — `true` if the item is aa sibling of the specified item, `false` otherwise 


[`**isGroupedWith**(item)`](https://paperjs.org/reference/path/#isgroupedwith-item)
[`**isGroupedWith**(item)`](https://paperjs.org/reference/path/#isgroupedwith-item)
Checks whether the item is grouped with the specified item.
#### Parameters:
  * `item:` [`Item`](https://paperjs.org/reference/item)


#### Returns:
  * ``Boolean`` — `true` if the items are grouped together, `false` otherwise 


### Transform Functions
[`**translate**(delta)`](https://paperjs.org/reference/path/#translate-delta)
[`**translate**(delta)`](https://paperjs.org/reference/path/#translate-delta)
Translates (moves) the item by the given offset views.
#### Parameters:
  * `delta:` [`Point`](https://paperjs.org/reference/point) — the offset to translate the item by 


[`**rotate**(angle[, center])`](https://paperjs.org/reference/path/#rotate-angle)
[`**rotate**(angle[, center])`](https://paperjs.org/reference/path/#rotate-angle)
Rotates the item by a given angle around the given center point.
Angles are oriented clockwise and measured in degrees.
#### Parameters:
  * `angle:` `Number` — the rotation angle 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### See also:
  * `[`matrix.rotate(angle[, center])`](https://paperjs.org/reference/matrix#rotate-angle)`


#### Example:Rotating an item:
#### Example:Rotating an item around a specific point:
[`**scale**(scale[, center])`](https://paperjs.org/reference/path/#scale-scale)
[`**scale**(scale[, center])`](https://paperjs.org/reference/path/#scale-scale)
Scales the item by the given value from its center point, or optionally from a supplied point.
#### Parameters:
  * `scale:` `Number` — the scale factor 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### Example:Scaling an item from its center point:
#### Example:Scaling an item from a specific point:
[`**scale**(hor, ver[, center])`](https://paperjs.org/reference/path/#scale-hor-ver)
[`**scale**(hor, ver[, center])`](https://paperjs.org/reference/path/#scale-hor-ver)
Scales the item by the given values from its center point, or optionally from a supplied point.
#### Parameters:
  * `hor:` `Number` — the horizontal scale factor 
  * `ver:` `Number` — the vertical scale factor 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### Example:Scaling an item horizontally by 300%:
[`**shear**(shear[, center])`](https://paperjs.org/reference/path/#shear-shear)
[`**shear**(shear[, center])`](https://paperjs.org/reference/path/#shear-shear)
Shears the item by the given value from its center point, or optionally by a supplied point.
#### Parameters:
  * `shear:` [`Point`](https://paperjs.org/reference/point) — the horizontal and vertical shear factors as a point 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### See also:
  * `[`matrix.shear(shear[, center])`](https://paperjs.org/reference/matrix#shear-shear)`


[`**shear**(hor, ver[, center])`](https://paperjs.org/reference/path/#shear-hor-ver)
[`**shear**(hor, ver[, center])`](https://paperjs.org/reference/path/#shear-hor-ver)
Shears the item by the given values from its center point, or optionally by a supplied point.
#### Parameters:
  * `hor:` `Number` — the horizontal shear factor 
  * `ver:` `Number` — the vertical shear factor 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### See also:
  * `[`matrix.shear(hor, ver[, center])`](https://paperjs.org/reference/matrix#shear-hor-ver)`


[`**skew**(skew[, center])`](https://paperjs.org/reference/path/#skew-skew)
[`**skew**(skew[, center])`](https://paperjs.org/reference/path/#skew-skew)
Skews the item by the given angles from its center point, or optionally by a supplied point.
#### Parameters:
  * `skew:` [`Point`](https://paperjs.org/reference/point) — the horizontal and vertical skew angles in degrees 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### See also:
  * `[`matrix.shear(skew[, center])`](https://paperjs.org/reference/matrix#shear-skew)`


[`**skew**(hor, ver[, center])`](https://paperjs.org/reference/path/#skew-hor-ver)
[`**skew**(hor, ver[, center])`](https://paperjs.org/reference/path/#skew-hor-ver)
Skews the item by the given angles from its center point, or optionally by a supplied point.
#### Parameters:
  * `hor:` `Number` — the horizontal skew angle in degrees 
  * `ver:` `Number` — the vertical sskew angle in degrees 
  * `center:` [`Point`](https://paperjs.org/reference/point) — optional, default: 


#### See also:
  * `[`matrix.shear(hor, ver[, center])`](https://paperjs.org/reference/matrix#shear-hor-ver)`


[`**transform**(matrix)`](https://paperjs.org/reference/path/#transform-matrix)
[`**transform**(matrix)`](https://paperjs.org/reference/path/#transform-matrix)
Transform the item.
#### Parameters:
  * `matrix:` [`Matrix`](https://paperjs.org/reference/matrix) — the matrix by which the item shall be transformed 


[`**globalToLocal**(point)`](https://paperjs.org/reference/path/#globaltolocal-point)
[`**globalToLocal**(point)`](https://paperjs.org/reference/path/#globaltolocal-point)
Converts the specified point from global project coordinate space to the item’s own local coordinate space.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point to be transformed 


#### Returns:
  * — the transformed point as a new instance 


[`**localToGlobal**(point)`](https://paperjs.org/reference/path/#localtoglobal-point)
[`**localToGlobal**(point)`](https://paperjs.org/reference/path/#localtoglobal-point)
Converts the specified point from the item’s own local coordinate space to the global project coordinate space.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point to be transformed 


#### Returns:
  * — the transformed point as a new instance 


[`**parentToLocal**(point)`](https://paperjs.org/reference/path/#parenttolocal-point)
[`**parentToLocal**(point)`](https://paperjs.org/reference/path/#parenttolocal-point)
Converts the specified point from the parent’s coordinate space to item’s own local coordinate space.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point to be transformed 


#### Returns:
  * — the transformed point as a new instance 


[`**localToParent**(point)`](https://paperjs.org/reference/path/#localtoparent-point)
[`**localToParent**(point)`](https://paperjs.org/reference/path/#localtoparent-point)
Converts the specified point from the item’s own local coordinate space to the parent’s coordinate space.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point to be transformed 


#### Returns:
  * — the transformed point as a new instance 


[`**fitBounds**(rectangle[, fit])`](https://paperjs.org/reference/path/#fitbounds-rectangle)
[`**fitBounds**(rectangle[, fit])`](https://paperjs.org/reference/path/#fitbounds-rectangle)
Transform the item so that its [`bounds`](https://paperjs.org/reference/item#bounds) are centered in the specified rectangle and fitted to it as described by `fit`.
#### Parameters:
  * `rectangle:` [`Rectangle`](https://paperjs.org/reference/rectangle)
  * `fit:` `String`⟋`Boolean` — how to fit the item, as in CSS’s `object-fit`: `'contain'` fits all of it within the rectangle, `'cover'` makes it cover the whole rectangle, and `'fill'` stretches it to the rectangle, changing its aspect ratio. The deprecated `true` and `false` stand for `'cover'` and `'contain'`. — optional, default: `‘contain’`


#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle:
#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle, covering all of it:
#### Example:Fitting an item to the bounding rectangle of the view
### Event Handling
[`**on**(type, function)`](https://paperjs.org/reference/path/#on-type-function)
[`**on**(type, function)`](https://paperjs.org/reference/path/#on-type-function)
Attaches an event handler to the item.
#### Parameters:
  * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
  * `function:` `Function` — the function to be called when the event occurs, receiving a [`MouseEvent`](https://paperjs.org/reference/mouseevent) or [`Event`](https://paperjs.org/reference/event) object as its sole argument 


#### Returns:
  * — this item itself, so calls can be chained 


#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.
[`**on**(object)`](https://paperjs.org/reference/path/#on-object)
[`**on**(object)`](https://paperjs.org/reference/path/#on-object)
Attaches one or more event handlers to the item.
#### Parameters:
  * `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`


#### Returns:
  * — this item itself, so calls can be chained 


#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.
#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set black.
[`**off**(type, function)`](https://paperjs.org/reference/path/#off-type-function)
[`**off**(type, function)`](https://paperjs.org/reference/path/#off-type-function)
Detach an event handler from the item.
#### Parameters:
  * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
  * `function:` `Function` — the function to be detached 


#### Returns:
  * — this item itself, so calls can be chained 


[`**off**(object)`](https://paperjs.org/reference/path/#off-object)
[`**off**(object)`](https://paperjs.org/reference/path/#off-object)
Detach one or more event handlers to the item.
#### Parameters:
  * `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`


#### Returns:
  * — this item itself, so calls can be chained 


[`**emit**(type, event)`](https://paperjs.org/reference/path/#emit-type-event)
[`**emit**(type, event)`](https://paperjs.org/reference/path/#emit-type-event)
Emit an event on the item.
#### Parameters:
  * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`
  * `event:` `Object` — an object literal containing properties describing the event 


#### Returns:
  * ``Boolean`` — `true` if the event had listeners, `false` otherwise 


[`**responds**(type)`](https://paperjs.org/reference/path/#responds-type)
[`**responds**(type)`](https://paperjs.org/reference/path/#responds-type)
Check if the item has one or more event handlers of the specified type.
#### Parameters:
  * `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`


#### Returns:
  * ``Boolean`` — `true` if the item has one or more event handlers of the specified type, `false` otherwise 


### Remove On Event
[`**removeOn**(options)`](https://paperjs.org/reference/path/#removeon-options)
[`**removeOn**(options)`](https://paperjs.org/reference/path/#removeon-options)
Removes the item when the events specified in the passed options object occur.
#### Options:
  * `options.move: `Boolean`` — remove the item when the next [`tool.onMouseMove`](https://paperjs.org/reference/tool#onmousemove) event is fired.
  * `options.drag: `Boolean`` — remove the item when the next [`tool.onMouseDrag`](https://paperjs.org/reference/tool#onmousedrag) event is fired.
  * `options.down: `Boolean`` — remove the item when the next [`tool.onMouseDown`](https://paperjs.org/reference/tool#onmousedown) event is fired.
  * `options.up: `Boolean`` — remove the item when the next [`tool.onMouseUp`](https://paperjs.org/reference/tool#onmouseup) event is fired.


#### Parameters:
  * `options:` `Object`


#### Example:Click and drag below:
[`**removeOnMove**()`](https://paperjs.org/reference/path/#removeonmove)
[`**removeOnMove**()`](https://paperjs.org/reference/path/#removeonmove)
Removes the item when the next [`tool.onMouseMove`](https://paperjs.org/reference/tool#onmousemove) event is fired.
#### Example:Move your mouse below:
[`**removeOnDown**()`](https://paperjs.org/reference/path/#removeondown)
[`**removeOnDown**()`](https://paperjs.org/reference/path/#removeondown)
Removes the item when the next [`tool.onMouseDown`](https://paperjs.org/reference/tool#onmousedown) event is fired.
#### Example:Click a few times below:
[`**removeOnDrag**()`](https://paperjs.org/reference/path/#removeondrag)
[`**removeOnDrag**()`](https://paperjs.org/reference/path/#removeondrag)
Removes the item when the next [`tool.onMouseDrag`](https://paperjs.org/reference/tool#onmousedrag) event is fired.
#### Example:Click and drag below:
[`**removeOnUp**()`](https://paperjs.org/reference/path/#removeonup)
[`**removeOnUp**()`](https://paperjs.org/reference/path/#removeonup)
Removes the item when the next [`tool.onMouseUp`](https://paperjs.org/reference/tool#onmouseup) event is fired.
#### Example:Click a few times below:
### Tweening Functions
[`**tween**(from, to, options)`](https://paperjs.org/reference/path/#tween-from-to-options)
[`**tween**(from, to, options)`](https://paperjs.org/reference/path/#tween-from-to-options)
Tween item between two states.
#### Options:
  * `options.duration: `Number`` — the duration of the tweening
  * `options.easing: `Function`⟋`String`` — an easing function or the type of the easing: `‘linear’ ‘easeInQuad’ ‘easeOutQuad’ ‘easeInOutQuad’ ‘easeInCubic’ ‘easeOutCubic’ ‘easeInOutCubic’ ‘easeInQuart’ ‘easeOutQuart’ ‘easeInOutQuart’ ‘easeInQuint’ ‘easeOutQuint’ ‘easeInOutQuint’ ‘easeInSine’ ‘easeOutSine’ ‘easeInOutSine’ ‘easeInExpo’ ‘easeOutExpo’ ‘easeInOutExpo’ ‘easeInCirc’ ‘easeOutCirc’ ‘easeInOutCirc’` — default: `‘linear’`
  * `options.start: `Boolean`` — whether to start tweening automatically — default: `true`


#### Parameters:
  * `from:` `Object` — the state at the start of the tweening 
  * `to:` `Object` — the state at the end of the tweening 
  * `options:` `Object`⟋`Number` — the options or the duration 


#### Returns:
  * 

#### Example:Tween fillColor:
#### Example:Tween rotation:
[`**tween**(to, options)`](https://paperjs.org/reference/path/#tween-to-options)
[`**tween**(to, options)`](https://paperjs.org/reference/path/#tween-to-options)
Tween item to a state.
#### Parameters:
  * `to:` `Object` — the state at the end of the tweening 
  * `options:` `Object`⟋`Number` — the options or the duration 


#### Returns:
  * 

#### See also:
  * `[`item.tween(from, to, options)`](https://paperjs.org/reference/item#tween-from-to-options)`


#### Example:Tween a nested property with relative values
[`**tween**(options)`](https://paperjs.org/reference/path/#tween-options)
[`**tween**(options)`](https://paperjs.org/reference/path/#tween-options)
Tween item.
#### Parameters:
  * `options:` `Object`⟋`Number` — the options or the duration 


#### Returns:
  * 

#### See also:
  * `[`item.tween(from, to, options)`](https://paperjs.org/reference/item#tween-from-to-options)`


#### Example:Start an empty tween and just use the update callback:
[`**tweenTo**(to, options)`](https://paperjs.org/reference/path/#tweento-to-options)
[`**tweenTo**(to, options)`](https://paperjs.org/reference/path/#tweento-to-options)
Tween item to a state.
#### Parameters:
  * `to:` `Object` — the state at the end of the tweening 
  * `options:` `Object`⟋`Number` — the options or the duration 


#### Returns:
  * 

#### See also:
  * `[`item.tween(to, options)`](https://paperjs.org/reference/item#tween-to-options)`


[`**tweenFrom**(from, options)`](https://paperjs.org/reference/path/#tweenfrom-from-options)
[`**tweenFrom**(from, options)`](https://paperjs.org/reference/path/#tweenfrom-from-options)
Tween item from a state to its state before the tweening.
#### Parameters:
  * `from:` `Object` — the state at the start of the tweening 
  * `options:` `Object`⟋`Number` — the options or the duration 


#### Returns:
  * 

#### See also:
  * `[`item.tween(from, to, options)`](https://paperjs.org/reference/item#tween-from-to-options)`


#### Example:Tween fillColor from red to the path's initial fillColor:
## Properties inherited from [`PathItem`](https://paperjs.org/reference/pathitem)
Returns a point that is guaranteed to be inside the path.
Read only.
#### Type:


Specifies whether the path as a whole is oriented clock-wise, by looking at the path’s area. Note that self-intersecting paths and sub-paths of different orientation can result in areas that cancel each other out.
#### Type:
  * `Boolean`


#### See also:
  *   * `[`compoundPath.area`](https://paperjs.org/reference/compoundpath#area)`


The path’s geometry, formatted as SVG style path data.
#### Type:
  * `String`


## Methods inherited from [`PathItem`](https://paperjs.org/reference/pathitem)
### Boolean Path Operations
[`**unite**(path[, options])`](https://paperjs.org/reference/path/#unite-path)
[`**unite**(path[, options])`](https://paperjs.org/reference/path/#unite-path)
Unites the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside any of them or this path. Each path keeps its own fill rule.
#### Options:
  * `options.insert: `Boolean`` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`


#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem)⟋Array of [`PathItem`](https://paperjs.org/reference/pathitem) objects — the path or paths to unite with 
  * `options:` `Object` — the boolean operation options — optional 


#### Returns:
  * — the resulting path item 


#### Example:
#### Example:Uniting many paths at once:
[`**intersect**(path[, options])`](https://paperjs.org/reference/path/#intersect-path)
[`**intersect**(path[, options])`](https://paperjs.org/reference/path/#intersect-path)
Intersects the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside all of them and this path. Each path keeps its own fill rule.
#### Options:
  * `options.insert: `Boolean`` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`
  * `options.trace: `Boolean`` — whether the tracing method is used, treating all paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, keeping the parts of the curves that intersect with the areas of all other paths. — default: `true`


#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem)⟋Array of [`PathItem`](https://paperjs.org/reference/pathitem) objects — the path or paths to intersect with 
  * `options:` `Object` — the boolean operation options — optional 


#### Returns:
  * — the resulting path item 


#### Example:
[`**subtract**(path[, options])`](https://paperjs.org/reference/path/#subtract-path)
[`**subtract**(path[, options])`](https://paperjs.org/reference/path/#subtract-path)
Subtracts the geometry of the specified path from this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside this path and outside all of them. Each path keeps its own fill rule.
#### Options:
  * `options.insert: `Boolean`` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`
  * `options.trace: `Boolean`` — whether the tracing method is used, treating all paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, removing the parts of the curves that intersect with the area of any other path. — default: `true`


#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem)⟋Array of [`PathItem`](https://paperjs.org/reference/pathitem) objects — the path or paths to subtract 
  * `options:` `Object` — the boolean operation options — optional 


#### Returns:
  * — the resulting path item 


#### Example:
[`**exclude**(path[, options])`](https://paperjs.org/reference/path/#exclude-path)
[`**exclude**(path[, options])`](https://paperjs.org/reference/path/#exclude-path)
Excludes the intersection of the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside an odd number of the paths, this one included. Each path keeps its own fill rule.
#### Options:
  * `options.insert: `Boolean`` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`


#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem)⟋Array of [`PathItem`](https://paperjs.org/reference/pathitem) objects — the path or paths to exclude the intersection of 
  * `options:` `Object` — the boolean operation options — optional 


#### Returns:
  * — the resulting path item 


#### Example:
[`**divide**(path[, options])`](https://paperjs.org/reference/path/#divide-path)
[`**divide**(path[, options])`](https://paperjs.org/reference/path/#divide-path)
Splits the geometry of this path along the geometry of the specified path returns the result as a new group item. This is equivalent to calling [`subtract(path)`](https://paperjs.org/reference/pathitem#subtract-path) and [`intersect(path)`](https://paperjs.org/reference/pathitem#intersect-path) and putting the results into a new group.
#### Options:
  * `options.insert: `Boolean`` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`
  * `options.trace: `Boolean`` — whether the tracing method is used, treating both paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections. — default: `true`


#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem) — the path to divide by 
  * `options:` `Object` — the boolean operation options — optional 


#### Returns:
  * — the resulting path item 


[`**reorient**([nonZero[, clockwise]])`](https://paperjs.org/reference/path/#reorient)
[`**reorient**([nonZero[, clockwise]])`](https://paperjs.org/reference/path/#reorient)
Fixes the orientation of the sub-paths of a compound-path, assuming that non of its sub-paths intersect, by reorienting them so that they are of different winding direction than their containing paths, except for disjoint sub-paths, i.e. islands, which are oriented so that they have the same winding direction as the the biggest path.
#### Parameters:
  * `nonZero:` `Boolean` — controls if the non-zero fill-rule is to be applied, by counting the winding of each nested path and discarding sub-paths that do not contribute to the final result — optional, default: `false`
  * `clockwise:` `Boolean` — if provided, the orientation of the root paths will be set to the orientation specified by `clockwise`, otherwise the orientation of the largest root child is used. — optional 


#### Returns:
  * — a reference to the item itself, reoriented 


### Path Intersections and Locations
[`**getIntersections**([path[, include]])`](https://paperjs.org/reference/path/#getintersections)
[`**getIntersections**([path[, include]])`](https://paperjs.org/reference/path/#getintersections)
Returns all intersections between two [`PathItem`](https://paperjs.org/reference/pathitem) items as an array of [`CurveLocation`](https://paperjs.org/reference/curvelocation) objects. [`CompoundPath`](https://paperjs.org/reference/compoundpath) items are also supported.
#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem) — the other item to find the intersections with — optional 
  * `include:` `Function` — a callback function that can be used to filter out undesired locations right while they are collected. When defined, it shall return `true` to include a location, `false` otherwise. — optional 


#### Returns:
  * `Array of [`CurveLocation`](https://paperjs.org/reference/curvelocation) objects` — the locations of all intersection between the paths 


#### See also:
  * `[`getCrossings(path)`](https://paperjs.org/reference/pathitem#getcrossings-path)`


#### Example:Finding the intersections between two paths
[`**getCrossings**(path)`](https://paperjs.org/reference/path/#getcrossings-path)
[`**getCrossings**(path)`](https://paperjs.org/reference/path/#getcrossings-path)
Returns all crossings between two [`PathItem`](https://paperjs.org/reference/pathitem) items as an array of [`CurveLocation`](https://paperjs.org/reference/curvelocation) objects. [`CompoundPath`](https://paperjs.org/reference/compoundpath) items are also supported. Crossings are intersections where the paths actually are crossing each other, as opposed to simply touching.
#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem) — the other item to find the crossings with 


#### Returns:
  * `Array of [`CurveLocation`](https://paperjs.org/reference/curvelocation) objects` — the locations of all crossings between the paths 


#### See also:
  * `[`getIntersections(path)`](https://paperjs.org/reference/pathitem#getintersections-path)`


[`**getNearestLocation**(point)`](https://paperjs.org/reference/path/#getnearestlocation-point)
[`**getNearestLocation**(point)`](https://paperjs.org/reference/path/#getnearestlocation-point)
Returns the nearest location on the path item to the specified point.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point for which we search the nearest location 


#### Returns:
  * — the location on the path that’s the closest to the specified point 


[`**getNearestPoint**(point)`](https://paperjs.org/reference/path/#getnearestpoint-point)
[`**getNearestPoint**(point)`](https://paperjs.org/reference/path/#getnearestpoint-point)
Returns the nearest point on the path item to the specified point.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point for which we search the nearest point 


#### Returns:
  * — the point on the path that’s the closest to the specified point 


#### Example:
### Path Manipulation
[`**reverse**()`](https://paperjs.org/reference/path/#reverse)
[`**reverse**()`](https://paperjs.org/reference/path/#reverse)
Reverses the orientation of the path item. When called on [`CompoundPath`](https://paperjs.org/reference/compoundpath) items, each of the nested paths is reversed. On [`Path`](https://paperjs.org/reference/path) items, the sequence of [`path.segments`](https://paperjs.org/reference/path#segments) is reversed.
[`**flatten**([flatness])`](https://paperjs.org/reference/path/#flatten)
[`**flatten**([flatness])`](https://paperjs.org/reference/path/#flatten)
Flattens the curves in path items to a sequence of straight lines, by subdividing them enough times until the specified maximum error is met.
#### Parameters:
  * `flatness:` `Number` — the maximum error between the flattened lines and the original curves — optional, default: `0.25`


#### Example:Flattening a circle shaped path:
[`**smooth**([options])`](https://paperjs.org/reference/path/#smooth)
[`**smooth**([options])`](https://paperjs.org/reference/path/#smooth)
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


#### Options:
  * `options.type: `String`` — the type of smoothing method: `‘continuous’`, `‘asymmetric’`, `‘catmull-rom’`, `‘geometric’` — default: `‘asymmetric’`
  * `options.factor: `Number`` — the factor parameterizing the smoothing method — default: `0.5` for `'catmull-rom'`, `0.4` for `'geometric'`
  * `options.from: `Number`⟋[`Segment`](https://paperjs.org/reference/segment)⟋[`Curve`](https://paperjs.org/reference/curve)` — the segment or curve at which to start smoothing, if not the full path shall be smoothed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.
  * `options.to: `Number`⟋[`Segment`](https://paperjs.org/reference/segment)⟋[`Curve`](https://paperjs.org/reference/curve)` — the segment or curve to which the handles of the path shall be processed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.


#### Parameters:
  * `options:` `Object` — the smoothing options — optional 


#### See also:
  * `[`segment.smooth([options])`](https://paperjs.org/reference/segment#smooth)`


#### Example:Smoothing a closed shape:
#### Example:
#### Example:Smoothing ranges of paths, using segments, curves or indices:
[`**simplify**([tolerance])`](https://paperjs.org/reference/path/#simplify)
[`**simplify**([tolerance])`](https://paperjs.org/reference/path/#simplify)
Fits a sequence of as few curves as possible through the path’s anchor points, ignoring the path items’s curve-handles, with an allowed maximum error. When called on [`CompoundPath`](https://paperjs.org/reference/compoundpath) items, each of the nested paths is simplified. On [`Path`](https://paperjs.org/reference/path) items, the [`path.segments`](https://paperjs.org/reference/path#segments) array is processed and replaced by the resulting sequence of fitted curves.
This method can be used to process and simplify the point data received from a mouse or touch device.
#### Parameters:
  * `tolerance:` `Number` — the allowed maximum error when fitting the curves through the segment points — optional, default: `2.5`


#### Returns:
  * ``Boolean`` — `true` if the method was capable of fitting curves through the path’s segment points, `false` otherwise 


#### Example:Click and drag below to draw to draw a line, when you release the mouse, the is made smooth using path.simplify():
[`**interpolate**(from, to, factor)`](https://paperjs.org/reference/path/#interpolate-from-to-factor)
[`**interpolate**(from, to, factor)`](https://paperjs.org/reference/path/#interpolate-from-to-factor)
Interpolates between the two specified path items and uses the result as the geometry for this path item. The number of children and segments in the two paths involved in the operation should be the same.
#### Parameters:
  * `from:` [`PathItem`](https://paperjs.org/reference/pathitem) — the path item defining the geometry when `factor` is `0`
  * `to:` [`PathItem`](https://paperjs.org/reference/pathitem) — the path item defining the geometry when `factor` is `1`
  * `factor:` `Number` — the interpolation coefficient, typically between `0` and `1`, but extrapolation is possible too 


[`**compare**(path)`](https://paperjs.org/reference/path/#compare-path)
[`**compare**(path)`](https://paperjs.org/reference/path/#compare-path)
Compares the geometry of two paths to see if they describe the same shape, detecting cases where paths start in different segments or even use different amounts of curves to describe the same shape, as long as their orientation is the same, and their segments and handles really result in the same visual appearance of curves.
#### Parameters:
  * `path:` [`PathItem`](https://paperjs.org/reference/pathitem) — the path to compare this path’s geometry with 


#### Returns:
  * ``Boolean`` — `true` if two paths describe the same shape, `false` otherwise 


### Postscript Style Drawing Commands
[`**moveTo**(point)`](https://paperjs.org/reference/path/#moveto-point)
[`**moveTo**(point)`](https://paperjs.org/reference/path/#moveto-point)
On a normal empty [`Path`](https://paperjs.org/reference/path), the point is simply added as the path’s first segment. If called on a [`CompoundPath`](https://paperjs.org/reference/compoundpath), a new [`Path`](https://paperjs.org/reference/path) is created as a child and the point is added as its first segment.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the point in which to start the path 


[`**lineTo**(point)`](https://paperjs.org/reference/path/#lineto-point)
[`**lineTo**(point)`](https://paperjs.org/reference/path/#lineto-point)
Adds a straight curve to the path, from the the last segment in the path to the specified point.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added straight curve 


[`**arcTo**(through, to)`](https://paperjs.org/reference/path/#arcto-through-to)
[`**arcTo**(through, to)`](https://paperjs.org/reference/path/#arcto-through-to)
Adds an arc from the position of the last segment in the path, passing through the specified `through` point, to the specified `to` point, by adding one or more segments to the path.
#### Parameters:
  * `through:` [`Point`](https://paperjs.org/reference/point) — the point where the arc should pass through 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the point where the arc should end 


#### Example:
#### Example:Interactive example. Click and drag in the view below:
[`**arcTo**(to[, clockwise])`](https://paperjs.org/reference/path/#arcto-to)
[`**arcTo**(to[, clockwise])`](https://paperjs.org/reference/path/#arcto-to)
Adds an arc from the position of the last segment in the path to the specified point, by adding one or more segments to the path.
#### Parameters:
  * `to:` [`Point`](https://paperjs.org/reference/point) — the point where the arc should end 
  * `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`


#### Example:
#### Example:Interactive example. Click and drag in the view below:
[`**curveTo**(through, to[, time])`](https://paperjs.org/reference/path/#curveto-through-to)
[`**curveTo**(through, to[, time])`](https://paperjs.org/reference/path/#curveto-through-to)
Adds a curve from the last segment in the path through the specified `through` point, to the specified destination point by adding one segment to the path.
#### Parameters:
  * `through:` [`Point`](https://paperjs.org/reference/point) — the point through which the curve should pass 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added curve 
  * `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`


#### Example:Interactive example. Move your mouse around the view below:
[`**cubicCurveTo**(handle1, handle2, to)`](https://paperjs.org/reference/path/#cubiccurveto-handle1-handle2-to)
[`**cubicCurveTo**(handle1, handle2, to)`](https://paperjs.org/reference/path/#cubiccurveto-handle1-handle2-to)
Adds a cubic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by two specified handles.
#### Parameters:
  * `handle1:` [`Point`](https://paperjs.org/reference/point) — the location of the first handle of the newly added curve in absolute coordinates, out of which the relative values for [`segment.handleOut`](https://paperjs.org/reference/segment#handleout) of its first segment are calculated 
  * `handle2:` [`Point`](https://paperjs.org/reference/point) — the location of the second handle of the newly added curve in absolute coordinates, out of which the relative values for [`segment.handleIn`](https://paperjs.org/reference/segment#handlein) of its second segment are calculated 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added curve 


[`**quadraticCurveTo**(handle, to)`](https://paperjs.org/reference/path/#quadraticcurveto-handle-to)
[`**quadraticCurveTo**(handle, to)`](https://paperjs.org/reference/path/#quadraticcurveto-handle-to)
Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.
Note that Paper.js only stores cubic curves, so the handle is actually converted.
#### Parameters:
  * `handle:` [`Point`](https://paperjs.org/reference/point) — the location of the handle of the newly added quadratic curve in absolute coordinates, out of which the relative values for [`segment.handleOut`](https://paperjs.org/reference/segment#handleout) of the resulting cubic curve’s first segment and [`segment.handleIn`](https://paperjs.org/reference/segment#handlein) of its second segment are calculated 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added curve 


[`**closePath**()`](https://paperjs.org/reference/path/#closepath)
[`**closePath**()`](https://paperjs.org/reference/path/#closepath)
Closes the path. When closed, Paper.js connects the first and last segment of the path with an additional curve. The difference to setting [`path.closed`](https://paperjs.org/reference/path#closed) to `true` is that this will also merge the first segment with the last if they lie in the same location.
#### See also:
  * 

### Relative Drawing Commands
[`**moveBy**(to)`](https://paperjs.org/reference/path/#moveby-to)
[`**moveBy**(to)`](https://paperjs.org/reference/path/#moveby-to)
If called on a [`CompoundPath`](https://paperjs.org/reference/compoundpath), a new [`Path`](https://paperjs.org/reference/path) is created as a child and a point is added as its first segment relative to the position of the last segment of the current path.
#### Parameters:


[`**lineBy**(point)`](https://paperjs.org/reference/path/#lineby-point)
[`**lineBy**(point)`](https://paperjs.org/reference/path/#lineby-point)
Adds a straight curve to the path, from the the last segment in the path to the `to` vector specified relatively to it.
#### Parameters:
  * `point:` [`Point`](https://paperjs.org/reference/point) — the vector describing the destination of the newly added straight curve 


#### Example:
#### Example:Drawing a spiral using lineBy:
[`**arcBy**(through, to)`](https://paperjs.org/reference/path/#arcby-through-to)
[`**arcBy**(through, to)`](https://paperjs.org/reference/path/#arcby-through-to)
Adds an arc from the position of the last segment in the path, passing through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one or more segments to the path.
#### Parameters:
  * `through:` [`Point`](https://paperjs.org/reference/point) — the vector where the arc should pass through 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the vector where the arc should end 


[`**arcBy**(to[, clockwise])`](https://paperjs.org/reference/path/#arcby-to)
[`**arcBy**(to[, clockwise])`](https://paperjs.org/reference/path/#arcby-to)
Adds an arc from the position of the last segment in the path to the `to` vector specified relatively to it, by adding one or more segments to the path.
#### Parameters:
  * `to:` [`Point`](https://paperjs.org/reference/point) — the vector where the arc should end 
  * `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`


[`**curveBy**(through, to[, time])`](https://paperjs.org/reference/path/#curveby-through-to)
[`**curveBy**(through, to[, time])`](https://paperjs.org/reference/path/#curveby-through-to)
Adds a curve from the last segment in the path through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one segment to the path.
#### Parameters:
  * `through:` [`Point`](https://paperjs.org/reference/point) — the vector through which the curve should pass 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination vector of the newly added curve 
  * `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`


[`**cubicCurveBy**(handle1, handle2, to)`](https://paperjs.org/reference/path/#cubiccurveby-handle1-handle2-to)
[`**cubicCurveBy**(handle1, handle2, to)`](https://paperjs.org/reference/path/#cubiccurveby-handle1-handle2-to)
Adds a cubic bezier curve to the path, from the last segment to the to the specified `to` vector, with the curve itself defined by two specified handles.
#### Parameters:
  * `handle1:` [`Point`](https://paperjs.org/reference/point) — the location of the first handle of the newly added curve 
  * `handle2:` [`Point`](https://paperjs.org/reference/point) — the location of the second handle of the newly added curve 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added curve 


[`**quadraticCurveBy**(handle, to)`](https://paperjs.org/reference/path/#quadraticcurveby-handle-to)
[`**quadraticCurveBy**(handle, to)`](https://paperjs.org/reference/path/#quadraticcurveby-handle-to)
Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.
Note that Paper.js only stores cubic curves, so the handle is actually converted.
#### Parameters:
  * `handle:` [`Point`](https://paperjs.org/reference/point) — the handle of the newly added quadratic curve out of which the values for [`segment.handleOut`](https://paperjs.org/reference/segment#handleout) of the resulting cubic curve’s first segment and [`segment.handleIn`](https://paperjs.org/reference/segment#handlein) of its second segment are calculated 
  * `to:` [`Point`](https://paperjs.org/reference/point) — the destination point of the newly added curve 


