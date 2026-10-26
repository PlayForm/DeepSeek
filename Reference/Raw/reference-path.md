# Path

Extends **`Item`**, **`PathItem`**

The path item represents a path in a Paper.js project.

## Constructors

[**`Path`**`([segments])`](#path) [**`Path`**`([segments])`](#path)

Creates a new path item and places it at the top of the active layer.

- #### Parameters:

- `segments:` Array of `Segment` objects — An array of segments (or points to be converted to segments) that will be added to the path — optional


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:Create an empty path and add segments to it:

    var path = new Path();
    path.strokeColor = 'black';
    path.add(new Point(30, 30));
    path.add(new Point(100, 100));

#### Example:Create a path with two segments:

    var segments = [new Point(30, 30), new Point(100, 100)];
    var path = new Path(segments);
    path.strokeColor = 'black';

[**`Path`**`(object)`](#path-object) [**`Path`**`(object)`](#path-object)

Creates a new path item from an object description and places it at the top of the active layer.

- #### Parameters:

- `object:` `Object` — an object containing properties to be set on the path


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:

[**`Path`**`(pathData)`](#path-pathData) [**`Path`**`(pathData)`](#path-pathData)

Creates a new path item from SVG path-data and places it at the top of the active layer. A path holds a single sub-path: further `M` commands are ignored, and the commands that follow them continue the same path. Use `CompoundPath` or `PathItem.create(pathData)` to create items with multiple sub-paths.

- #### Parameters:

- `pathData:` `String` — the SVG path-data that describes the geometry of this path


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

### Shaped Paths

[**`Path.Line`**`(from, to)`](#path-line-from-to) [**`Path.Line`**`(from, to)`](#path-line-from-to)

Creates a linear path item from two points describing a line.

- #### Parameters:

- `from:` `Point` — the line’s starting point

- `to:` `Point` — the line’s ending point


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Line`**`(object)`](#path-line-object) [**`Path.Line`**`(object)`](#path-line-object)

Creates a linear path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Circle`**`(center, radius)`](#path-circle-center-radius) [**`Path.Circle`**`(center, radius)`](#path-circle-center-radius)

Creates a circular path item.

- #### Parameters:

- `center:` `Point` — the center point of the circle

- `radius:` `Number` — the radius of the circle


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Circle`**`(object)`](#path-circle-object) [**`Path.Circle`**`(object)`](#path-circle-object)

Creates a circular path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Rectangle`**`(rectangle[, radius])`](#path-rectangle-rectangle) [**`Path.Rectangle`**`(rectangle[, radius])`](#path-rectangle-rectangle)

Creates a rectangular path item, with optionally rounded corners.

- #### Parameters:

- `rectangle:` `Rectangle` — the rectangle object describing the geometry of the rectangular path to be created

- `radius:` `Size` — the size of the rounded corners — optional, default: `null`


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:The same, with rounder corners

[**`Path.Rectangle`**`(point, size)`](#path-rectangle-point-size) [**`Path.Rectangle`**`(point, size)`](#path-rectangle-point-size)

Creates a rectangular path item from a point and a size object.

- #### Parameters:

- `point:` `Point` — the rectangle’s top-left corner.

- `size:` `Size` — the rectangle’s size.


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Rectangle`**`(from, to)`](#path-rectangle-from-to) [**`Path.Rectangle`**`(from, to)`](#path-rectangle-from-to)

Creates a rectangular path item from the passed points. These do not necessarily need to be the top left and bottom right corners, the constructor figures out how to fit a rectangle between them.

- #### Parameters:

- `from:` `Point` — the first point defining the rectangle

- `to:` `Point` — the second point defining the rectangle


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Rectangle`**`(object)`](#path-rectangle-object) [**`Path.Rectangle`**`(object)`](#path-rectangle-object)

Creates a rectangular path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:

#### Example:

#### Example:

[**`Path.Ellipse`**`(rectangle)`](#path-ellipse-rectangle) [**`Path.Ellipse`**`(rectangle)`](#path-ellipse-rectangle)

Creates an elliptical path item.

- #### Parameters:

- `rectangle:` `Rectangle` — the rectangle circumscribing the ellipse


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Ellipse`**`(object)`](#path-ellipse-object) [**`Path.Ellipse`**`(object)`](#path-ellipse-object)

Creates an elliptical path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:Placing by center and radius

[**`Path.Arc`**`(from, through, to)`](#path-arc-from-through-to) [**`Path.Arc`**`(from, through, to)`](#path-arc-from-through-to)

Creates a circular arc path item.

- #### Parameters:

- `from:` `Point` — the starting point of the circular arc

- `through:` `Point` — the point the arc passes through

- `to:` `Point` — the end point of the arc


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Arc`**`(object)`](#path-arc-object) [**`Path.Arc`**`(object)`](#path-arc-object)

Creates an circular arc path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.RegularPolygon`**`(center, sides, radius)`](#path-regularpolygon-center-sides-radius) [**`Path.RegularPolygon`**`(center, sides, radius)`](#path-regularpolygon-center-sides-radius)

Creates a regular polygon shaped path item. As in Illustrator, it stands on a flat bottom edge, and its segments run counterclockwise from its top vertex, or with an even number of sides, from the right end of its top edge.

- #### Parameters:

- `center:` `Point` — the center point of the polygon

- `sides:` `Number` — the number of sides of the polygon

- `radius:` `Number` — the radius of the polygon


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.RegularPolygon`**`(object)`](#path-regularpolygon-object) [**`Path.RegularPolygon`**`(object)`](#path-regularpolygon-object)

Creates a regular polygon shaped path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Star`**`(center, points, radius1, radius2)`](#path-star-center-points-radius1-radius2) [**`Path.Star`**`(center, points, radius1, radius2)`](#path-star-center-points-radius1-radius2)

Creates a star shaped path item.

The largest of `radius1` and `radius2` will be the outer radius of the star. The smallest of radius1 and radius2 will be the inner radius.

- #### Parameters:

- `center:` `Point` — the center point of the star

- `points:` `Number` — the number of points of the star

- `radius1:` `Number`

- `radius2:` `Number`


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

[**`Path.Star`**`(object)`](#path-star-object) [**`Path.Star`**`(object)`](#path-star-object)

Creates a star shaped path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes


- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

## Properties

[**`segments`**](#segments) [**`segments`**](#segments)

The segments contained within the path. Segments that define a `segment.name` can also be accessed by name.

- #### Type:

- Array of `Segment` objects

#### Example:Accessing segments by name:

[**`firstSegment`**](#firstsegment) [**`firstSegment`**](#firstsegment)

The first Segment contained within the path.

Read only.

- #### Type:

- `Segment`

[**`lastSegment`**](#lastsegment) [**`lastSegment`**](#lastsegment)

The last Segment contained within the path.

Read only.

- #### Type:

- `Segment`

[**`curves`**](#curves) [**`curves`**](#curves)

The curves contained within the path.

Read only.

- #### Type:

- Array of `Curve` objects

[**`firstCurve`**](#firstcurve) [**`firstCurve`**](#firstcurve)

The first Curve contained within the path.

Read only.

- #### Type:

- `Curve`

[**`lastCurve`**](#lastcurve) [**`lastCurve`**](#lastcurve)

The last Curve contained within the path.

Read only.

- #### Type:

- `Curve`

[**`closed`**](#closed) [**`closed`**](#closed)

Specifies whether the path is closed. If it is closed, Paper.js connects the first and last segments.

- #### Type:

- `Boolean`

#### Example:

[**`length`**](#length) [**`length`**](#length)

The approximate length of the path.

Read only.

- #### Type:

- `Number`

[**`area`**](#area) [**`area`**](#area)

The area that the path’s geometry is covering. Self-intersecting paths can contain sub-areas that cancel each other out.

Read only.

- #### Type:

- `Number`

[**`fullySelected`**](#fullyselected) [**`fullySelected`**](#fullyselected)

Specifies whether the path and all its segments are selected. Cannot be `true` on an empty path.

- #### Type:

- `Boolean`

#### Example:A path is fully selected, if all of its segments are selected:

## Methods

[**`add`**`(...segment)`](#add-segment) [**`add`**`(...segment)`](#add-segment)

Adds one or more segments to the end of the [`segments`](./reference-path.md#segments) array of this path.

- #### Parameters:

- `segment:` `Segment`⟋`Point`⟋Array of `Numbers` — the segment or point to be added.


- #### Returns:

- `Segment``⟋Array of ``Segment`` objects` — the added segment(s). This is not necessarily the same object, e.g. if the segment to be added already belongs to another path.

#### Example:Adding segments to a path using point objects:

#### Example:Adding segments to a path using arrays containing number pairs:

#### Example:Adding segments to a path using objects:

#### Example:Adding a segment with handles to a path:

[**`insert`**`(index, segment)`](#insert-index-segment) [**`insert`**`(index, segment)`](#insert-index-segment)

Inserts one or more segments at a given index in the list of this path’s segments.

- #### Parameters:

- `index:` `Number` — the index at which to insert the segment

- `segment:` `Segment`⟋`Point` — the segment or point to be inserted.


- #### Returns:

- `Segment` — the added segment. This is not necessarily the same object, e.g. if the segment to be added already belongs to another path

#### Example:Inserting a segment:

#### Example:Inserting multiple segments:

[**`addSegments`**`(segments)`](#addsegments-segments) [**`addSegments`**`(segments)`](#addsegments-segments)

Adds an array of segments (or types that can be converted to segments) to the end of the [`segments`](./reference-path.md#segments) array.

- #### Parameters:

- `segments:` Array of `Segment` objects


- #### Returns:

- `Array of ``Segment`` objects` — an array of the added segments. These segments are not necessarily the same objects, e.g. if the segment to be added already belongs to another path

#### Example:Adding an array of Point objects:

#### Example:Adding an array of \[x, y\] arrays:

#### Example:Adding segments from one path to another:

[**`insertSegments`**`(index, segments)`](#insertsegments-index-segments) [**`insertSegments`**`(index, segments)`](#insertsegments-index-segments)

Inserts an array of segments at a given index in the path’s [`segments`](./reference-path.md#segments) array.

- #### Parameters:

- `index:` `Number` — the index at which to insert the segments

- `segments:` Array of `Segment` objects — the segments to be inserted


- #### Returns:

- `Array of ``Segment`` objects` — an array of the added segments. These segments are not necessarily the same objects, e.g. if the segment to be added already belongs to another path

[**`removeSegment`**`(index)`](#removesegment-index) [**`removeSegment`**`(index)`](#removesegment-index)

Removes the segment at the specified index of the path’s [`segments`](./reference-path.md#segments) array.

- #### Parameters:

- `index:` `Number` — the index of the segment to be removed


- #### Returns:

- `Segment` — the removed segment

#### Example:Removing a segment from a path:

[**`removeSegments`**`()`](#removesegments) [**`removeSegments`**`()`](#removesegments)

Removes all segments from the path’s [`segments`](./reference-path.md#segments) array.

- #### Returns:

- `Array of ``Segment`` objects` — an array containing the removed segments

[**`removeSegments`**`(from[, to])`](#removesegments-from) [**`removeSegments`**`(from[, to])`](#removesegments-from)

Removes the segments from the specified `from` index to the `to` index from the path’s [`segments`](./reference-path.md#segments) array. On closed paths, `from` can be bigger than `to`, to remove the segments from `from` to the end and then from the beginning up to `to`, wrapping around the closing curve.

- #### Parameters:

- `from:` `Number` — the beginning index, inclusive

- `to:` `Number` — the ending index, exclusive — optional, default: `segments.length`


- #### Returns:

- `Array of ``Segment`` objects` — an array containing the removed segments, in the order in which they appeared along the path

#### Example:Removing segments from a path:

[**`hasHandles`**`()`](#hashandles) [**`hasHandles`**`()`](#hashandles)

Checks if any of the curves in the path have curve handles set. Handles of which both coordinates are 0 within a tolerance of 1e-12 count as not set, see `point.isZero`().

- #### Returns:

- `Boolean` — `true` if the path has curve handles set, `false` otherwise


- #### See also:

- `segment.hasHandles``()`

- `curve.hasHandles``()`

[**`clearHandles`**`()`](#clearhandles) [**`clearHandles`**`()`](#clearhandles)

Clears the path’s handles by setting their coordinates to zero, turning the path into a polygon (or a polyline if it isn’t closed).

[**`divideAt`**`(location)`](#divideat-location) [**`divideAt`**`(location)`](#divideat-location)

Divides the path on the curve at the given offset or location into two curves, by inserting a new segment at the given location.

- #### Parameters:

- `location:` `Number`⟋`CurveLocation` — the offset or location on the path at which to divide the existing curve by inserting a new segment


- #### Returns:

- `Segment` — the newly inserted segment if the location is valid, `null` otherwise


- #### See also:

- `curve.divideAt(location)`

[**`splitAt`**`(location)`](#splitat-location) [**`splitAt`**`(location)`](#splitat-location)

Splits the path at the given offset or location. After splitting, the path will be open. If the path was open already, splitting will result in two paths.

- #### Parameters:

- `location:` `Number`⟋`CurveLocation` — the offset or location at which to split the path


- #### Returns:

- [`Path`](./reference-path.md)`⟋``null` — the newly created path after splitting, if any

#### Example:

#### Example:Splitting an open path Draw a V shaped path:

#### Example:Splitting a closed path

[**`join`**`(path[, tolerance])`](#join-path) [**`join`**`(path[, tolerance])`](#join-path)

Joins the path with the other specified path, which will be removed in the process. They can be joined if the first or last segments of either path lie in the same location. Locations are optionally compare with a provide `tolerance` value.

If `null` or `this` is passed as the other path, the path will be joined with itself if the first and last segment are in the same location.

- #### Parameters:

- `path:` [`Path`](./reference-path.md) — the path to join this path with; `null` or `this` to join the path with itself

- `tolerance:` `Number` — the tolerance with which to decide if two segments are to be considered the same location when joining — optional, default: `0`

#### Example:Joining two paths:

#### Example:Joining two paths that share a point at the start or end of their segments array:

#### Example:Joining two paths that connect at two points:

[**`reduce`**`([options])`](#reduce) [**`reduce`**`([options])`](#reduce)

Reduces the path by removing straight curves that have a length of 0. With `options.simplify`, it also removes straight curves that are almost 0 in length, and unnecessary segments between two collinear straight curves.

- #### Options:

- `options.simplify: ``Boolean` — also remove almost zero-length curves and segments between collinear straight curves — default: `false`


- #### Parameters:

- `options:` `Object` — the reduce options — optional


- #### Returns:

- [`Path`](./reference-path.md) — the reduced path

[**`toShape`**`([insert])`](#toshape) [**`toShape`**`([insert])`](#toshape)

Attempts to create a new shape item with same geometry as this path item, and inherits all settings from it, similar to `item.clone`().

- #### Parameters:

- `insert:` `Boolean` — specifies whether the new shape should be inserted into the scene graph. When set to `true`, it is inserted above the path item — optional, default: `true`


- #### Returns:

- `Shape` — the newly created shape item with the same geometry as this path item if it can be matched, `null` otherwise


- #### See also:

- `shape.toPath(insert)`

### Positions on Paths and Curves

[**`getLocationOf`**`(point)`](#getlocationof-point) [**`getLocationOf`**`(point)`](#getlocationof-point)

Returns the curve location of the specified point if it lies on the path, `null` otherwise.

- #### Parameters:

- `point:` `Point` — the point on the path


- #### Returns:

- `CurveLocation``⟋``null` — the curve location of the specified point

[**`getOffsetOf`**`(point)`](#getoffsetof-point) [**`getOffsetOf`**`(point)`](#getoffsetof-point)

Returns the length of the path from its beginning up to up to the specified point if it lies on the path, `null` otherwise.

- #### Parameters:

- `point:` `Point` — the point on the path


- #### Returns:

- `Number``⟋``null` — the length of the path up to the specified point

[**`getLocationAt`**`(offset)`](#getlocationat-offset) [**`getLocationAt`**`(offset)`](#getlocationat-offset)

Returns the curve location of the specified offset on the path, or `null` if the offset exceeds the length of the path.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `CurveLocation` — the curve location at the specified offset

[**`getPointAt`**`(offset)`](#getpointat-offset) [**`getPointAt`**`(offset)`](#getpointat-offset)

Calculates the point on the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Point` — the point at the given offset

#### Example:Finding the point on a path at a given offset:

#### Example:Iterating over the length of a path:

[**`getTangentAt`**`(offset)`](#gettangentat-offset) [**`getTangentAt`**`(offset)`](#gettangentat-offset)

Calculates the normalized tangent vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Point` — the normalized tangent vector at the given offset

#### Example:Working with the tangent vector at a given offset:

#### Example:Iterating over the length of a path:

[**`getNormalAt`**`(offset)`](#getnormalat-offset) [**`getNormalAt`**`(offset)`](#getnormalat-offset)

Calculates the normal vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Point` — the normal vector at the given offset

#### Example:Working with the normal vector at a given offset:

#### Example:Iterating over the length of a path:

[**`getWeightedTangentAt`**`(offset)`](#getweightedtangentat-offset) [**`getWeightedTangentAt`**`(offset)`](#getweightedtangentat-offset)

Calculates the weighted tangent vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Point` — the weighted tangent vector at the given offset

[**`getWeightedNormalAt`**`(offset)`](#getweightednormalat-offset) [**`getWeightedNormalAt`**`(offset)`](#getweightednormalat-offset)

Calculates the weighted normal vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Point` — the weighted normal vector at the given offset

[**`getCurvatureAt`**`(offset)`](#getcurvatureat-offset) [**`getCurvatureAt`**`(offset)`](#getcurvatureat-offset)

Calculates the curvature of the path at the given offset. Curvatures indicate how sharply a path changes direction. A straight line has zero curvature, where as a circle has a constant curvature. The path’s radius at the given offset is the reciprocal value of its curvature.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and [`path.length`](./reference-path.md#length) at the end


- #### Returns:

- `Number` — the normal vector at the given offset

[**`getOffsetsWithTangent`**`(tangent)`](#getoffsetswithtangent-tangent) [**`getOffsetsWithTangent`**`(tangent)`](#getoffsetswithtangent-tangent)

Calculates path offsets where the path is tangential to the provided tangent. Note that tangents at the start or end are included. Tangents at segment points are returned even if only one of their handles is collinear with the provided tangent.

- #### Parameters:

- `tangent:` `Point` — the tangent to which the path must be tangential


- #### Returns:

- `Array of ``Numbers` — path offsets where the path is tangential to the provided tangent

## Properties inherited from `Item`

[**`key`**](#key) [**`key`**](#key)

The key of the host’s node that the item represents, in a project backed by a host document, see `project.host`. It can only be set once, on an item created by a script, to register the key that the host gave its new node.

- #### Type:

- `Number`

[**`id`**](#id) [**`id`**](#id)

The unique id of the item.

Read only.

- #### Type:

- `Number`

[**`className`**](#classname) [**`className`**](#classname)

The class name of the item as a string.

- #### Values:

- `'Group'`, `'Layer'`, `'Path'`, `'CompoundPath'`, `'Shape'`, `'Raster'`, `'SymbolItem'`, `'PointText'`


- #### Type:

- `String`

[**`name`**](#name) [**`name`**](#name)

The name of the item. If the item has a name, it can be accessed by name through its parent’s children list.

- #### Type:

- `String`

#### Example:

[**`style`**](#style) [**`style`**](#style)

The path style of the item.

Styles set on a `Group` or `Layer` are applied to the children that it contains at that moment. Items added to it later do not receive them.

- #### Type:

- `Style`

#### Example:Applying several styles to an item in one go, by passing an object to its style property:

#### Example:Copying the style of another item:

#### Example:Applying the same style object to multiple items:

[**`locked`**](#locked) [**`locked`**](#locked)

Specifies whether the item is locked. When set to `true`, item interactions with the mouse are disabled.

- #### Default:

- `false`


- #### Type:

- `Boolean`

#### Example:

[**`visible`**](#visible) [**`visible`**](#visible)

Specifies whether the item is visible. When set to `false`, the item won’t be drawn.

- #### Default:

- `true`


- #### Type:

- `Boolean`

#### Example:Hiding an item:

[**`blendMode`**](#blendmode) [**`blendMode`**](#blendmode)

The blend mode with which the item is composited onto the canvas. Both the standard canvas compositing modes, as well as the new CSS blend modes are supported. Where the canvas doesn’t support a CSS blend mode natively, it draws as `'normal'`. Paper.js’s own modes `'add'`, `'subtract'`, `'average'`, `'pin-light'` and `'negation'` are emulated, which can have an impact on performance.

- #### Values:

- `'normal'`, `'multiply'`, `'screen'`, `'overlay'`, `'soft-light'`, `'hard- light'`, `'color-dodge'`, `'color-burn'`, `'darken'`, `'lighten'`, `'difference'`, `'exclusion'`, `'hue'`, `'saturation'`, `'luminosity'`, `'color'`, `'add'`, `'subtract'`, `'average'`, `'pin-light'`, `'negation'`, `'source-over'`, `'source-in'`, `'source-out'`, `'source-atop'`, `'destination-over'`, `'destination-in'`, `'destination-out'`, `'destination-atop'`, `'lighter'`, `'darker'`, `'copy'`, `'xor'`


- #### Default:

- `'normal'`


- #### Type:

- `String`

#### Example:Setting an item's blend mode:

[**`opacity`**](#opacity) [**`opacity`**](#opacity)

The opacity of the item as a value between `0` and `1`.

- #### Default:

- `1`


- #### Type:

- `Number`

#### Example:Making an item 50% transparent:

[**`guide`**](#guide) [**`guide`**](#guide)

Specifies whether the item functions as a guide. When set to `true`, the item is drawn as usual, but left out of hit-tests and mouse interactions. Hit-tests only find guides when `options.guides` is set, and then only them, see [`hitTest(point, options])`.

- #### Default:

- `false`


- #### Type:

- `Boolean`

[**`textWrap`**](#textwrap) [**`textWrap`**](#textwrap)

Specifies whether, and how, the item pushes aside the text of the `AreaText` items below it in its layer: `null`, or an object with `offset`, the space kept between them, and `invert`, to let the text flow inside it instead. `true` sets the defaults.

- #### Default:

- `null`


- #### Type:

- `Object`

#### Example:

    var circle = new Path.Circle({ center: [100, 100], radius: 40 });
    circle.textWrap = { offset: 10 };

[**`selected`**](#selected) [**`selected`**](#selected)

Specifies whether the item is selected. This will also return `true` for `Group` items if they are partially selected, e.g. groups containing selected or partially selected paths.

Paper.js draws the visual outlines of selected items on top of your project. This can be useful for debugging, as it allows you to see the construction of paths, position of path curves, individual segment points and bounding boxes of symbol and raster items.

- #### Default:

- `false`


- #### Type:

- `Boolean`


- #### See also:

- `project.selectedItems`

- `segment.selected`

- `curve.selected`

- `point.selected`

#### Example:Selecting an item:

[**`clipMask`**](#clipmask) [**`clipMask`**](#clipmask)

Specifies whether the item defines a clip mask. This can only be set on paths and compound paths, and only if the item is already contained within a clipping group.

- #### Default:

- `false`


- #### Type:

- `Boolean`

[**`data`**](#data) [**`data`**](#data)

A plain javascript object which can be used to store arbitrary data on the item.

- #### Type:

- `Object`

#### Example:

    var path = new Path();
    path.data.remember = 'milk';

#### Example:

    var path = new Path();
    path.data.malcolm = new Point(20, 30);
    console.log(path.data.malcolm.x); // 20

#### Example:

    var path = new Path();
    path.data = {
        home: 'Omicron Theta',
        found: 2338,
        pets: ['Spot']
    };
    console.log(path.data.pets.length); // 1

#### Example:

    var path = new Path({
        data: {
            home: 'Omicron Theta',
            found: 2338,
            pets: ['Spot']
        }
    });
    console.log(path.data.pets.length); // 1

### Position and Bounding Boxes

[**`position`**](#position) [**`position`**](#position)

The item’s position within the parent item’s coordinate system. By default, this is the `rectangle.center` of the item’s `bounds` rectangle.

- #### Type:

- `Point`

#### Example:Changing the position of a path:

#### Example:Changing the x coordinate of an item's position:

[**`pivot`**](#pivot) [**`pivot`**](#pivot)

The item’s pivot point specified in the item coordinate system, defining the point around which all transformations are hinging. This is also the reference point for `position`. By default, it is set to `null`, meaning the `rectangle.center` of the item’s `bounds` rectangle is used as pivot.

- #### Default:

- `null`


- #### Type:

- `Point`

[**`bounds`**](#bounds) [**`bounds`**](#bounds)

The bounding rectangle of the item excluding stroke width.

- #### Type:

- `Rectangle`

[**`strokeBounds`**](#strokebounds) [**`strokeBounds`**](#strokebounds)

The bounding rectangle of the item including stroke width.

Setting it fits the item’s `bounds` into the given rectangle minus the extent of the stroke on each side, also where this extent changes with the item’s proportions, as with miters. A rectangle smaller than the stroke itself shrinks the bounds to its center.

- #### Type:

- `Rectangle`

[**`handleBounds`**](#handlebounds) [**`handleBounds`**](#handlebounds)

The bounding rectangle of the item including handles.

- #### Type:

- `Rectangle`

[**`internalBounds`**](#internalbounds) [**`internalBounds`**](#internalbounds)

The bounding rectangle of the item without any matrix transformations.

Typical use case would be drawing a frame around the object where you want to draw something of the same size, position, rotation, and scaling, like a selection frame.

- #### Type:

- `Rectangle`

[**`rotation`**](#rotation) [**`rotation`**](#rotation)

The current rotation angle of the item, as described by its `matrix`. Please note that this only returns meaningful values for items with `applyMatrix` set to `false`, meaning they do not directly bake transformations into their content.

- #### Type:

- `Number`

[**`scaling`**](#scaling) [**`scaling`**](#scaling)

The current scale factor of the item, as described by its `matrix`. Please note that this only returns meaningful values for items with `applyMatrix` set to `false`, meaning they do not directly bake transformations into their content.

- #### Type:

- `Point`

[**`matrix`**](#matrix) [**`matrix`**](#matrix)

The item’s transformation matrix, defining position and dimensions in relation to its parent item in which it is contained.

- #### Type:

- `Matrix`

[**`globalMatrix`**](#globalmatrix) [**`globalMatrix`**](#globalmatrix)

The item’s global transformation matrix in relation to the global project coordinate space. Note that the view’s transformations resulting from zooming and panning are not factored in.

Read only.

- #### Type:

- `Matrix`

[**`viewMatrix`**](#viewmatrix) [**`viewMatrix`**](#viewmatrix)

The item’s global matrix in relation to the view coordinate space. This means that the view’s transformations resulting from zooming and panning are factored in.

Read only.

- #### Type:

- `Matrix`

[**`applyMatrix`**](#applymatrix) [**`applyMatrix`**](#applymatrix)

Controls whether the transformations applied to the item (e.g. through `transform(matrix)`, `rotate(angle)`, `scale(scale)`, etc.) are stored in its `matrix` property, or whether they are directly applied to its contents or children (passed on to the segments in [`Path`](./reference-path.md) items, the children of `Group` items, etc.).

- #### Default:

- `true`


- #### Type:

- `Boolean`

### Project Hierarchy

[**`project`**](#project) [**`project`**](#project)

The project that this item belongs to.

Read only.

- #### Type:

- `Project`

[**`view`**](#view) [**`view`**](#view)

The view that this item belongs to.

Read only.

- #### Type:

- `View`

[**`scope`**](#scope) [**`scope`**](#scope)

The scope that this item belongs to, through its project.

Read only.

- #### Type:

- `PaperScope`

[**`layer`**](#layer) [**`layer`**](#layer)

The layer that this item is contained within.

Read only.

- #### Type:

- `Layer`

[**`parent`**](#parent) [**`parent`**](#parent)

The item that this item is contained within.

- #### Type:

- `Item`

#### Example:

    var path = new Path();

    // New items are placed in the active layer:
    console.log(path.parent == project.activeLayer); // true

    var group = new Group();
    group.addChild(path);

    // Now the parent of the path has become the group:
    console.log(path.parent == group); // true

#### Example:Setting the parent of the item to another item

    var path = new Path();

    // New items are placed in the active layer:
    console.log(path.parent == project.activeLayer); // true

    var group = new Group();
    path.parent = group;

    // Now the parent of the path has become the group:
    console.log(path.parent == group); // true

    // The path is now contained in the children list of group:
    console.log(group.children[0] == path); // true

#### Example:Setting the parent of an item in the constructor

    var group = new Group();

    var path = new Path({
        parent: group
    });

    // The parent of the path is the group:
    console.log(path.parent == group); // true

    // The path is contained in the children list of group:
    console.log(group.children[0] == path); // true

[**`children`**](#children) [**`children`**](#children)

The children items contained within this item. Items that define a `name` can also be accessed by name.

Only `Group`, `Layer` and `CompoundPath` items can have children. On all other items, such as [`Path`](./reference-path.md), `Shape`, `Raster`, `SymbolItem` and `PointText`, `children` is `undefined`.

**Please note:** The children array should not be modified directly using array functions. To remove single items from the children list, use `item.remove`(), to remove all items from the children list, use `item.removeChildren`(). To add items to the children list, use `item.addChild(item)` or `item.insertChild(index, item)`.

- #### Type:

- Array of `Item` objects

#### Example:Accessing items in the children array:

#### Example:Accessing children by name:

#### Example:Passing an array of items to item.children:

[**`firstChild`**](#firstchild) [**`firstChild`**](#firstchild)

The first item contained within this item. This is a shortcut for accessing `item.children[0]`.

Read only.

- #### Type:

- `Item`

[**`lastChild`**](#lastchild) [**`lastChild`**](#lastchild)

The last item contained within this item.This is a shortcut for accessing `item.children[item.children.length - 1]`.

Read only.

- #### Type:

- `Item`

[**`nextSibling`**](#nextsibling) [**`nextSibling`**](#nextsibling)

The next item on the same level as this item.

Read only.

- #### Type:

- `Item`

[**`previousSibling`**](#previoussibling) [**`previousSibling`**](#previoussibling)

The previous item on the same level as this item.

Read only.

- #### Type:

- `Item`

[**`index`**](#index) [**`index`**](#index)

The index of this item within the list of its parent’s children.

- #### Type:

- `Number`

### Stroke Style

[**`strokeColor`**](#strokecolor) [**`strokeColor`**](#strokecolor)

The color of the stroke.

- #### Type:

- `Color`⟋`null`

#### Example:Setting the stroke color of a path:

[**`strokeWidth`**](#strokewidth) [**`strokeWidth`**](#strokewidth)

The width of the stroke.

- #### Type:

- `Number`

#### Example:Setting an item's stroke width:

[**`strokeCap`**](#strokecap) [**`strokeCap`**](#strokecap)

The shape to be used at the beginning and end of open [`Path`](./reference-path.md) items, when they have a stroke.

- #### Values:

- `'round'`, `'square'`, `'butt'`


- #### Default:

- `'butt'`


- #### Type:

- `String`

#### Example:A look at the different stroke caps:

[**`strokeJoin`**](#strokejoin) [**`strokeJoin`**](#strokejoin)

The shape to be used at the segments and corners of [`Path`](./reference-path.md) items when they have a stroke.

- #### Values:

- `'miter'`, `'round'`, `'bevel'`


- #### Default:

- `'miter'`


- #### Type:

- `String`

#### Example:A look at the different stroke joins:

[**`dashOffset`**](#dashoffset) [**`dashOffset`**](#dashoffset)

The dash offset of the stroke.

- #### Default:

- `0`


- #### Type:

- `Number`

[**`strokeScaling`**](#strokescaling) [**`strokeScaling`**](#strokescaling)

Specifies whether the stroke is to be drawn taking the current affine transformation into account (the default behavior), or whether it should appear as a non-scaling stroke. On text, non-scaling strokes are exact for uniform scaling only, as the glyphs are always stroked through the transformation.

- #### Default:

- `true`


- #### Type:

- `Boolean`

[**`dashArray`**](#dasharray) [**`dashArray`**](#dasharray)

Specifies an array containing the dash and gap lengths of the stroke.

- #### Default:

- `[]`


- #### Type:

- Array of `Numbers`

#### Example:

[**`miterLimit`**](#miterlimit) [**`miterLimit`**](#miterlimit)

The miter limit of the stroke. When two line segments meet at a sharp angle and miter joins have been specified for `item.strokeJoin`, it is possible for the miter to extend far beyond the `item.strokeWidth` of the path. The miterLimit imposes a limit on the ratio of the miter length to the `item.strokeWidth`.

- #### Default:

- `10`


- #### Type:

- `Number`

[**`paintOrder`**](#paintorder) [**`paintOrder`**](#paintorder)

The order in which the fill and the stroke are painted, as in SVG’s `paint-order`, named after what is painted first: `'fill'` paints the fill first, `'stroke'` paints the stroke first, so the fill covers its inner half.

- #### Values:

- `'fill'`, `'stroke'`


- #### Default:

- `'fill'`


- #### Type:

- `String`

### Fill Style

[**`fillColor`**](#fillcolor) [**`fillColor`**](#fillcolor)

The fill color of the item.

- #### Type:

- `Color`⟋`null`

#### Example:Setting the fill color of a path to red:

[**`fillRule`**](#fillrule) [**`fillRule`**](#fillrule)

The fill-rule with which the shape gets filled. Please note that only modern browsers support fill-rules other than `'nonzero'`.

- #### Values:

- `'nonzero'`, `'evenodd'`


- #### Default:

- `'nonzero'`


- #### Type:

- `String`

### Shadow Style

[**`shadowColor`**](#shadowcolor) [**`shadowColor`**](#shadowcolor)

The shadow color.

- #### Type:

- `Color`⟋`null`

#### Example:Creating a circle with a black shadow:

[**`shadowBlur`**](#shadowblur) [**`shadowBlur`**](#shadowblur)

The shadow’s blur radius.

- #### Default:

- `0`


- #### Type:

- `Number`

[**`shadowOffset`**](#shadowoffset) [**`shadowOffset`**](#shadowoffset)

The shadow’s offset.

- #### Default:

- `0`


- #### Type:

- `Point`

### Selection Style

[**`selectedColor`**](#selectedcolor) [**`selectedColor`**](#selectedcolor)

The color the item is highlighted with when selected. If the item does not specify its own color, the color defined by its layer is used instead.

- #### Type:

- `Color`⟋`null`

### Event Handlers

[**`onFrame`**](#onframe) [**`onFrame`**](#onframe)

Item level handler function to be called on each frame of an animation. The function receives an event object which contains information about the frame event:

- #### Type:

- `Function`⟋`null`


- #### Options:

- `event.count: ``Number` — the number of times the frame event was fired

- `event.time: ``Number` — the total amount of time passed since the first frame event in seconds

- `event.delta: ``Number` — the time passed in seconds since the last frame event


- #### See also:

- `view.onFrame`

#### Example:Creating an animation:

[**`onMouseDown`**](#onmousedown) [**`onMouseDown`**](#onmousedown)

The function to be called when the mouse button is pushed down on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseDown`

#### Example:Press the mouse button down on the circle shaped path, to make it red:

#### Example:Press the mouse on the circle shaped paths to remove them:

[**`onMouseDrag`**](#onmousedrag) [**`onMouseDrag`**](#onmousedrag)

The function to be called when the mouse position changes while the mouse is being dragged over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseDrag`

#### Example:Press and drag the mouse on the blue circle to move it:

[**`onMouseUp`**](#onmouseup) [**`onMouseUp`**](#onmouseup)

The function to be called when the mouse button is released over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseUp`

#### Example:Release the mouse button over the circle shaped path, to make it red:

[**`onClick`**](#onclick) [**`onClick`**](#onclick)

The function to be called when the mouse clicks on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onClick`

#### Example:Click on the circle shaped path, to make it red:

#### Example:Click on the circle shaped paths to remove them:

[**`onDoubleClick`**](#ondoubleclick) [**`onDoubleClick`**](#ondoubleclick)

The function to be called when the mouse double clicks on the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onDoubleClick`

#### Example:Double click on the circle shaped path, to make it red:

#### Example:Double click on the circle shaped paths to remove them:

[**`onMouseMove`**](#onmousemove) [**`onMouseMove`**](#onmousemove)

The function to be called repeatedly while the mouse moves over the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseMove`

#### Example:Move over the circle shaped path, to change its opacity:

[**`onMouseEnter`**](#onmouseenter) [**`onMouseEnter`**](#onmouseenter)

The function to be called when the mouse moves over the item. This function will only be called again, once the mouse moved outside of the item first. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseEnter`

#### Example:When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

[**`onMouseLeave`**](#onmouseleave) [**`onMouseLeave`**](#onmouseleave)

The function to be called when the mouse moves out of the item. The function receives a `MouseEvent` object which contains information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they are stopped with `event.stopPropagation`() or by returning `false` from the handler.

- #### Type:

- `Function`⟋`null`


- #### See also:

- `view.onMouseLeave`

#### Example:Move the mouse over the circle shaped path and then move it out of it again to set its fill color to red:

## Methods inherited from `Item`

[**`set`**`(props)`](#set-props) [**`set`**`(props)`](#set-props)

Sets the properties of the passed object literal on this item to the values defined in the object literal, if the item has property of the given name (or a setter defined for it).

- #### Parameters:

- `props:` `Object`


- #### Returns:

- `Item` — the item itself

#### Example:Setting properties through an object literal

[**`clone`**`([options])`](#clone) [**`clone`**`([options])`](#clone)

Clones the item within the same project and places the copy above the item.

- #### Options:

- `insert: undefined` — specifies whether the copy should be inserted into the scene graph. When set to `true`, it is inserted above the original — default: `true`

- `deep: undefined` — specifies whether the item’s children should also be cloned — default: `true`


- #### Parameters:

- `options:` `Object` — optional, default: `{ insert: true, deep: true }`


- #### Returns:

- `Item` — the newly cloned item

#### Example:Cloning items:

[**`copyContent`**`(source)`](#copycontent-source) [**`copyContent`**`(source)`](#copycontent-source)

Copies the content of the specified item over to this item.

- #### Parameters:

- `source:` `Item` — the item to copy the content from

[**`copyAttributes`**`(source, excludeMatrix)`](#copyattributes-source-excludeMatrix) [**`copyAttributes`**`(source, excludeMatrix)`](#copyattributes-source-excludeMatrix)

Copies all attributes of the specified item over to this item. This includes its style, visibility, matrix, pivot, blend-mode, opacity, selection state, data, name, etc.

- #### Parameters:

- `source:` `Item` — the item to copy the attributes from

- `excludeMatrix:` `Boolean` — whether to exclude the transformation matrix when copying all attributes

[**`rasterize`**`([options])`](#rasterize) [**`rasterize`**`([options])`](#rasterize)

Rasterizes the item into a newly created Raster object. The item itself is not removed after rasterization.

- #### Options:

- `options.resolution: ``Number` — the desired resolution to be used when rasterizing, in pixels per inch (DPI). If not specified, the value of `view.resolution` is used by default. — default: `view.resolution`

- `options.raster: ``Raster` — specifies a raster to be reused when rasterizing. If the raster has the desired size already, then the underlying canvas is reused and no new memory needs to be allocated. If no raster is provided, a new raster item is created and returned instead. — default: `null`

- `options.insert: ``Boolean` — specifies whether the raster should be inserted into the scene graph. When set to `true`, it is inserted above the rasterized item. — default: `true`


- #### Parameters:

- `options:` `Object` — the rasterization options — optional, default: `{}`


- #### Returns:

- `Raster` — the reused raster or the newly created raster item

#### Example:Rasterizing an item:

### Geometric Tests

[**`contains`**`(point)`](#contains-point) [**`contains`**`(point)`](#contains-point)

Checks whether the item’s geometry contains the given point.

- #### Parameters:

- `point:` `Point` — the point to check for


- #### Returns:

- `Boolean`

#### Example:Click within and outside the star below Create a star shaped path:

[**`isInside`**`(rect)`](#isinside-rect) [**`isInside`**`(rect)`](#isinside-rect)

- #### Parameters:

- `rect:` `Rectangle` — the rectangle to check against


- #### Returns:

- `Boolean`

[**`intersects`**`(item)`](#intersects-item) [**`intersects`**`(item)`](#intersects-item)

Checks whether the item overlaps with the given item: whether their outlines cross, or one contains the other, as `rectangle.intersects(rect)` does for rectangles. Items other than paths and shapes are checked through their bounds. To only check whether outlines cross, use `pathItem.getIntersections(path)`.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if the items overlap, `false` otherwise

### Hit-testing, Fetching and Matching Items

[**`hitTest`**`(point[, options])`](#hittest-point) [**`hitTest`**`(point[, options])`](#hittest-point)

Performs a hit-test on the item and its children (if it is a `Group` or `Layer`) at the location of the specified point, returning the first found hit.

The options object allows you to control the specifics of the hit-test. Without options, `fill`, `stroke` and `segments` are hit-tested. As soon as an options object is passed, only the hit-tests that it sets to `true` are performed. It may contain a combination of the following values:

- #### Options:

- `options.tolerance: ``Number` — the tolerance of the hit-test, in project coordinates — default: `paperScope.settings``.hitTolerance`

- `options.class: ``Function` — only hit-test against a specific item class, or any of its sub-classes, by providing the constructor function against which an `instanceof` check is performed: `Group`, `Layer`, `Path`, `CompoundPath`, `Shape`, `Raster`, `SymbolItem`, `PointText`, …

- `options.match: ``Function` — a match function to be called for each found hit result: Return `true` to return the result, `false` to keep searching

- `options.fill: ``Boolean` — hit-test the fill of items

- `options.stroke: ``Boolean` — hit-test the stroke of path items, taking into account the setting of stroke color and width

- `options.segments: ``Boolean` — hit-test for `segment.point` of [`Path`](./reference-path.md) items

- `options.curves: ``Boolean` — hit-test the curves of path items, without taking the stroke color or width into account

- `options.handles: ``Boolean` — hit-test for the handles (`segment.handleIn` / `segment.handleOut`) of path segments.

- `options.ends: ``Boolean` — only hit-test for the first or last segment points of open path items

- `options.position: ``Boolean` — hit-test the `item.position` of of items, which depends on the setting of `item.pivot`

- `options.center: ``Boolean` — hit-test the `rectangle.center` of the bounding rectangle of items (`item.bounds`)

- `options.bounds: ``Boolean` — hit-test the corners and side-centers of the bounding rectangle of items (`item.bounds`)

- `options.guides: ``Boolean` — only hit-test items that have `item.guide` set to `true`

- `options.selected: ``Boolean` — only hit selected items


- #### Parameters:

- `point:` `Point` — the point where the hit-test should be performed (in global coordinates system).

- `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`


- #### Returns:

- `HitResult` — a hit result object describing what exactly was hit or `null` if nothing was hit

[**`hitTestAll`**`(point[, options])`](#hittestall-point) [**`hitTestAll`**`(point[, options])`](#hittestall-point)

Performs a hit-test on the item and its children (if it is a `Group` or `Layer`) at the location of the specified point, returning all found hits.

The options object allows you to control the specifics of the hit- test. See [`hitTest(point, options])` for a list of all options.

- #### Parameters:

- `point:` `Point` — the point where the hit-test should be performed (in global coordinates system).

- `options:` `Object` — optional, default: `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`


- #### Returns:

- `Array of ``HitResult`` objects` — hit result objects for all hits, describing what exactly was hit or `null` if nothing was hit


- #### See also:

- [`hitTest(point, options])``;`

[**`matches`**`(options)`](#matches-options) [**`matches`**`(options)`](#matches-options)

Checks whether the item matches the criteria described by the given object, by iterating over all of its properties and matching against their values through `matches(name, compare)`.

See `project.getItems(options)` for a selection of illustrated examples.

- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against


- #### Returns:

- `Boolean` — `true` if the item matches all the criteria, `false` otherwise


- #### See also:

- `getItems(options)`

[**`matches`**`(name, compare)`](#matches-name-compare) [**`matches`**`(name, compare)`](#matches-name-compare)

Checks whether the item matches the given criteria. Extended matching is possible by providing a compare function or a regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x-coordinate to match all points with that x-value). Partial matching does work for `item.data`.

See `project.getItems(options)` for a selection of illustrated examples.

- #### Parameters:

- `name:` `String` — the name of the state to match against

- `compare:` `Object` — the value, function or regular expression to compare against


- #### Returns:

- `Boolean` — `true` if the item matches the state, `false` otherwise


- #### See also:

- `getItems(options)`

[**`getItems`**`(options)`](#getitems-options) [**`getItems`**`(options)`](#getitems-options)

Fetch the descendants (children or children of children) of this item that match the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for `item.data`.

Matching items against a rectangular area is also possible, by setting either `options.inside` or `options.overlapping` to a rectangle describing the area in which the items either have to be fully or partly contained.

See `project.getItems(options)` for a selection of illustrated examples.

- #### Options:

- `options.recursive: ``Boolean` — whether to loop recursively through all children, or stop at the current level — default: `true`

- `options.match: ``Function` — a match function to be called for each item, allowing the definition of more flexible item checks that are not bound to properties. If no other match properties are defined, this function can also be passed instead of the `options` object

- `options.class: ``Function` — the constructor function of the item type to match against

- `options.inside: ``Rectangle` — the rectangle in which the items need to be fully contained

- `options.overlapping: ``Rectangle` — the rectangle with which the items need to at least partly overlap


- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against


- #### Returns:

- `Array of ``Item`` objects` — the list of matching descendant items, in their stacking order from bottom to top, with each item listed before its own descendants


- #### See also:

- `matches(options)`

[**`getItem`**`(options)`](#getitem-options) [**`getItem`**`(options)`](#getitem-options)

Fetch the first descendant (child or child of child) of this item that matches the properties in the specified object. Extended matching is possible by providing a compare function or regular expression. Matching points, colors only work as a comparison of the full object, not partial matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial matching does work for `item.data`. See `project.getItems(match)` for a selection of illustrated examples.

- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against


- #### Returns:

- `Item` — the first descendant item matching the given criteria


- #### See also:

- `getItems(options)`

### Importing / Exporting JSON and SVG

[**`exportJSON`**`([options])`](#exportjson) [**`exportJSON`**`([options])`](#exportjson)

Exports (serializes) the item with its content and child items to a JSON data string.

- #### Options:

- `options.asString: ``Boolean` — whether the JSON is returned as a `Object` or a `String` — default: `true`

- `options.precision: ``Number` — the amount of fractional digits in numbers used in JSON data — default: `5`


- #### Parameters:

- `options:` `Object` — the serialization options — optional


- #### Returns:

- `String` — the exported JSON data

[**`importJSON`**`(json)`](#importjson-json) [**`importJSON`**`(json)`](#importjson-json)

Imports (deserializes) the stored JSON data into this item. If the data describes an item of the same class or a parent class of the item, the data is imported into the item itself. If not, the imported item is added to this item’s `item.children` list. Note that not all type of items can have children.

- #### Parameters:

- `json:` `String` — the JSON data to import from


- #### Returns:

- `Item`

[**`exportSVG`**`([options])`](#exportsvg) [**`exportSVG`**`([options])`](#exportsvg)

Exports the item with its content and child items as an SVG DOM.

- #### Options:

- `options.bounds: ``String``⟋``Rectangle` — the bounds of the area to export, either as a string (`‘view’`, `content’`), or a `Rectangle` object: `'view'` uses the view bounds, `'content'` uses the stroke bounds of all content — default: `‘view’`

- `options.matrix: ``Matrix` — the matrix with which to transform the exported content: If `options.bounds` is set to `'view'`, `paper.view.matrix` is used, for all other settings of `options.bounds` the identity matrix is used. — default: `paper.view.matrix`

- `options.asString: ``Boolean` — whether a SVG node or a `String` is to be returned — default: `false`

- `options.precision: ``Number` — the amount of fractional digits in numbers used in SVG data — default: `5`

- `options.matchShapes: ``Boolean` — whether path items should tried to be converted to SVG shape items (rect, circle, ellipse, line, polyline, polygon), if their geometries match — default: `false`

- `options.embedImages: ``Boolean` — whether raster images should be embedded as base64 data inlined in the xlink:href attribute, or kept as a link to their external URL. — default: `true`

- `options.reuseImages: ``Boolean` — whether raster images with the same content should only be exported once into the `<defs>` element, and placed through `<use>` elements referencing it — default: `false`

- `options.idPrefix: ``String` — a prefix for the ids generated for definitions such as gradients, clip paths and symbols, to keep them unique when several exported SVGs are placed in one document — default: `’’`

- `options.reduceAttributes: ``Boolean` — wether to only include style attributes in the SVG output that differ from their parents, or to always include them (much faster but leading to redundancies). — default: `true`

- \[options.processNode\] {Function} the function to process the SVG node made for each exported item, receiving an object with the \`item\` and its \`node\`: It can change the node, e.g. to add attributes that Paper.js doesn't export, or return a node to replace it with. It is called before the item's name, style, visibility and data are set on the node, which replace attributes of the same names.


- #### Parameters:

- `options:` `Object` — the export options — optional


- #### Returns:

- `SVGElement``⟋``String` — the item converted to an SVG node or a `String` depending on `option.asString` value

[**`importSVG`**`(svg[, options])`](#importsvg-svg) [**`importSVG`**`(svg[, options])`](#importsvg-svg)

Converts the provided SVG content into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call `item.removeChildren`() to do so.

`<symbol>` elements are imported as `SymbolDefinition` items, and the `<use>` elements that place them as `SymbolItem` items. The styles that `<use>` elements inherit don’t reach the symbols’ content.

The layers in SVG content that Paper.js exported come back as `Layer` items inside the imported group. To make the layers of a project’s SVG the layers of a project again, add them to it with `item.children.slice().forEach(project.addLayer, project)`.

URLs are fetched as they are, so validate URLs that come from untrusted sources first, especially on servers, where they could reach internal addresses.

- #### Options:

- `options.expandShapes: ``Boolean` — whether imported shape items should be expanded to path items — default: `false`

- \[options.crossOrigin\] {String} the {@link Raster#crossOrigin} value of the rasters created for \`
  \` elements, to load their images with CORS

- `options.onLoad: ``Function` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external resources.

- `options.onError: ``Function` — the callback function to call if an error occurs during loading. Only required when loading from external resources.

- `options.insert: ``Boolean` — whether the imported items should be added to the item that `importSVG()` is called on — default: `true`

- `options.applyMatrix: ``Boolean` — whether the imported items should have their transformation matrices applied to their contents or not — default: `paperScope.settings``.applyMatrix`

- \[options.processItem\] {Function} the function to process the item made for each imported SVG element, receiving an object with the \`item\` and its \`node\`: It can read attributes that Paper.js doesn't import, or return an item to replace it with. It is called after the element's attributes and data are applied to the item, so it can extend \`item.data\`. A replacement item doesn't receive them: copy them over from \`item\` as needed.


- #### Parameters:

- `svg:` `SVGElement`⟋`String` — the SVG content to import, either as a SVG DOM node, a string containing SVG content, or a string describing the URL of the SVG file to fetch.

- `options:` `Object` — the import options — optional


- #### Returns:

- `Item` — the newly created Paper.js item containing the converted SVG content

[**`importSVG`**`(svg, onLoad)`](#importsvg-svg-onLoad) [**`importSVG`**`(svg, onLoad)`](#importsvg-svg-onLoad)

Imports the provided external SVG file, converts it into Paper.js items and adds them to the this item’s children list. Note that the item is not cleared first. You can call `item.removeChildren`() to do so.

- #### Parameters:

- `svg:` `SVGElement`⟋`String` — the URL of the SVG file to fetch.

- `onLoad:` `Function` — the callback function to call once the SVG content is loaded from the given URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only required when loading from external files.


- #### Returns:

- `Item` — the newly created Paper.js item containing the converted SVG content

### Hierarchy Operations

[**`addChild`**`(item)`](#addchild-item) [**`addChild`**`(item)`](#addchild-item)

Adds the specified item as a child of this item at the end of the its `children` list. You can use this function for groups, compound paths and layers.

- #### Parameters:

- `item:` `Item` — the item to be added as a child


- #### Returns:

- `Item` — the added item, or `null` if adding was not possible

[**`insertChild`**`(index, item)`](#insertchild-index-item) [**`insertChild`**`(index, item)`](#insertchild-index-item)

Inserts the specified item as a child of this item at the specified index in its `children` list. You can use this function for groups, compound paths and layers.

- #### Parameters:

- `index:` `Number` — the index at which to insert the item

- `item:` `Item` — the item to be inserted as a child


- #### Returns:

- `Item` — the inserted item, or `null` if inserting was not possible

[**`addChildren`**`(items)`](#addchildren-items) [**`addChildren`**`(items)`](#addchildren-items)

Adds the specified items as children of this item at the end of the its children list. You can use this function for groups, compound paths and layers.

- #### Parameters:

- `items:` Array of `Item` objects — the items to be added as children


- #### Returns:

- `Array of ``Item`` objects` — the added items, or `null` if adding was not possible

[**`insertChildren`**`(index, items)`](#insertchildren-index-items) [**`insertChildren`**`(index, items)`](#insertchildren-index-items)

Inserts the specified items as children of this item at the specified index in its `children` list. You can use this function for groups, compound paths and layers.

- #### Parameters:

- `index:` `Number`

- `items:` Array of `Item` objects — the items to be appended as children


- #### Returns:

- `Array of ``Item`` objects` — the inserted items, or `null` if inserted was not possible

[**`insertAbove`**`(item)`](#insertabove-item) [**`insertAbove`**`(item)`](#insertabove-item)

Inserts this item above the specified item.

- #### Parameters:

- `item:` `Item` — the item above which it should be inserted


- #### Returns:

- `Item` — the inserted item, or `null` if inserting was not possible

[**`insertBelow`**`(item)`](#insertbelow-item) [**`insertBelow`**`(item)`](#insertbelow-item)

Inserts this item below the specified item.

- #### Parameters:

- `item:` `Item` — the item below which it should be inserted


- #### Returns:

- `Item` — the inserted item, or `null` if inserting was not possible

[**`sendToBack`**`()`](#sendtoback) [**`sendToBack`**`()`](#sendtoback)

Sends this item to the back of all other items within the same parent.

[**`bringToFront`**`()`](#bringtofront) [**`bringToFront`**`()`](#bringtofront)

Brings this item to the front of all other items within the same parent.

[**`addTo`**`(owner)`](#addto-owner) [**`addTo`**`(owner)`](#addto-owner)

Adds it to the specified owner, which can be either a `Item` or a `Project`.

- #### Parameters:

- `owner:` `Project`⟋`Layer`⟋`Group`⟋`CompoundPath` — the item or project to add the item to


- #### Returns:

- `Item` — the item itself, if it was successfully added

[**`copyTo`**`(owner)`](#copyto-owner) [**`copyTo`**`(owner)`](#copyto-owner)

Clones the item and adds it to the specified owner, which can be either a `Item` or a `Project`.

- #### Parameters:

- `owner:` `Project`⟋`Layer`⟋`Group`⟋`CompoundPath` — the item or project to copy the item to


- #### Returns:

- `Item` — the new copy of the item, if it was successfully added

[**`remove`**`()`](#remove) [**`remove`**`()`](#remove)

Removes the item and all its children from the project. The item is not destroyed and can be inserted again after removal.

- #### Returns:

- `Boolean` — `true` if the item was removed, `false` otherwise

[**`replaceWith`**`(...item)`](#replacewith-item) [**`replaceWith`**`(...item)`](#replacewith-item)

Replaces this item with the provided new items which will take its place in the project hierarchy instead, in the given order. This also ungroups a group, e.g. `group.replaceWith(…group.children)`, but note that the items keep their own matrices, see `group.ungroup`().

- #### Parameters:

- `item:` `Item` — the items that will replace this item


- #### Returns:

- `Boolean` — `true` if the item was replaced, `false` otherwise

[**`removeChildren`**`()`](#removechildren) [**`removeChildren`**`()`](#removechildren)

Removes all of the item’s `children` (if any).

- #### Returns:

- `Array of ``Item`` objects` — an array containing the removed items

[**`removeChildren`**`(start[, end])`](#removechildren-start) [**`removeChildren`**`(start[, end])`](#removechildren-start)

Removes the children from the specified `start` index to and excluding the `end` index from the parent’s `children` array.

- #### Parameters:

- `start:` `Number` — the beginning index, inclusive

- `end:` `Number` — the ending index, exclusive — optional, default: `children.length`


- #### Returns:

- `Array of ``Item`` objects` — an array containing the removed items

[**`reverseChildren`**`()`](#reversechildren) [**`reverseChildren`**`()`](#reversechildren)

Reverses the order of the item’s children

### Tests

[**`isEmpty`**`([recursively])`](#isempty) [**`isEmpty`**`([recursively])`](#isempty)

Specifies whether the item has any content or not. The meaning of what content is differs from type to type. For example, a `Group` with no children, a `TextItem` with no text content and a [`Path`](./reference-path.md) with no segments all are considered empty.

- #### Parameters:

- `recursively:` `Boolean` — whether an item with children should be considered empty if all its descendants are empty — optional, default: `false`


- #### Returns:

- `Boolean`

### Style Tests

[**`hasFill`**`()`](#hasfill) [**`hasFill`**`()`](#hasfill)

Checks whether the item has a visible fill, a fill color with an alpha above 0. Hit-tests also hit transparent fills, see `hitTest`.

- #### Returns:

- `Boolean` — `true` if the item has a visible fill, `false` otherwise

[**`hasStroke`**`()`](#hasstroke) [**`hasStroke`**`()`](#hasstroke)

Checks whether the item has a stroke.

- #### Returns:

- `Boolean` — `true` if the item has a stroke, `false` otherwise

[**`hasShadow`**`()`](#hasshadow) [**`hasShadow`**`()`](#hasshadow)

Checks whether the item has a shadow.

- #### Returns:

- `Boolean` — `true` if the item has a shadow, `false` otherwise

### Hierarchy Tests

[**`hasChildren`**`()`](#haschildren) [**`hasChildren`**`()`](#haschildren)

Checks if the item contains any children items.

- #### Returns:

- `Boolean` — `true` it has one or more children, `false` otherwise

[**`isInserted`**`()`](#isinserted) [**`isInserted`**`()`](#isinserted)

Checks whether the item and all its parents are inserted into scene graph or not.

- #### Returns:

- `Boolean` — `true` if the item is inserted into the scene graph, `false` otherwise

[**`isAbove`**`(item)`](#isabove-item) [**`isAbove`**`(item)`](#isabove-item)

Checks if this item is above the specified item in the stacking order of the project. If one item is a descendant of the other, neither is above the other and `false` is returned.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if it is above the specified item, `false` otherwise

[**`isBelow`**`(item)`](#isbelow-item) [**`isBelow`**`(item)`](#isbelow-item)

Checks if the item is below the specified item in the stacking order of the project. If one item is a descendant of the other, neither is below the other and `false` is returned.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if it is below the specified item, `false` otherwise

[**`isParent`**`(item)`](#isparent-item) [**`isParent`**`(item)`](#isparent-item)

Checks whether the specified item is the parent of the item.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if it is the parent of the item, `false` otherwise

[**`isChild`**`(item)`](#ischild-item) [**`isChild`**`(item)`](#ischild-item)

Checks whether the specified item is a child of the item.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` it is a child of the item, `false` otherwise

[**`isDescendant`**`(item)`](#isdescendant-item) [**`isDescendant`**`(item)`](#isdescendant-item)

Checks if the item is contained within the specified item.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if it is inside the specified item, `false` otherwise

[**`isAncestor`**`(item)`](#isancestor-item) [**`isAncestor`**`(item)`](#isancestor-item)

Checks if the item is an ancestor of the specified item.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if the item is an ancestor of the specified item, `false` otherwise

[**`isSibling`**`(item)`](#issibling-item) [**`isSibling`**`(item)`](#issibling-item)

Checks if the item is an a sibling of the specified item.

- #### Parameters:

- `item:` `Item` — the item to check against


- #### Returns:

- `Boolean` — `true` if the item is aa sibling of the specified item, `false` otherwise

[**`isGroupedWith`**`(item)`](#isgroupedwith-item) [**`isGroupedWith`**`(item)`](#isgroupedwith-item)

Checks whether the item is grouped with the specified item.

- #### Parameters:

- `item:` `Item`


- #### Returns:

- `Boolean` — `true` if the items are grouped together, `false` otherwise

### Transform Functions

[**`translate`**`(delta)`](#translate-delta) [**`translate`**`(delta)`](#translate-delta)

Translates (moves) the item by the given offset views.

- #### Parameters:

- `delta:` `Point` — the offset to translate the item by

[**`rotate`**`(angle[, center])`](#rotate-angle) [**`rotate`**`(angle[, center])`](#rotate-angle)

Rotates the item by a given angle around the given center point.

Angles are oriented clockwise and measured in degrees.

- #### Parameters:

- `angle:` `Number` — the rotation angle

- `center:` `Point` — optional, default: `item.position`


- #### See also:

- [`matrix.rotate(angle, center])`

#### Example:Rotating an item:

#### Example:Rotating an item around a specific point:

[**`scale`**`(scale[, center])`](#scale-scale) [**`scale`**`(scale[, center])`](#scale-scale)

Scales the item by the given value from its center point, or optionally from a supplied point.

- #### Parameters:

- `scale:` `Number` — the scale factor

- `center:` `Point` — optional, default: `item.position`

#### Example:Scaling an item from its center point:

#### Example:Scaling an item from a specific point:

[**`scale`**`(hor, ver[, center])`](#scale-hor-ver) [**`scale`**`(hor, ver[, center])`](#scale-hor-ver)

Scales the item by the given values from its center point, or optionally from a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal scale factor

- `ver:` `Number` — the vertical scale factor

- `center:` `Point` — optional, default: `item.position`

#### Example:Scaling an item horizontally by 300%:

[**`shear`**`(shear[, center])`](#shear-shear) [**`shear`**`(shear[, center])`](#shear-shear)

Shears the item by the given value from its center point, or optionally by a supplied point.

- #### Parameters:

- `shear:` `Point` — the horizontal and vertical shear factors as a point

- `center:` `Point` — optional, default: `item.position`


- #### See also:

- [`matrix.shear(shear, center])`

[**`shear`**`(hor, ver[, center])`](#shear-hor-ver) [**`shear`**`(hor, ver[, center])`](#shear-hor-ver)

Shears the item by the given values from its center point, or optionally by a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal shear factor

- `ver:` `Number` — the vertical shear factor

- `center:` `Point` — optional, default: `item.position`


- #### See also:

- [`matrix.shear(hor, ver, center])`

[**`skew`**`(skew[, center])`](#skew-skew) [**`skew`**`(skew[, center])`](#skew-skew)

Skews the item by the given angles from its center point, or optionally by a supplied point.

- #### Parameters:

- `skew:` `Point` — the horizontal and vertical skew angles in degrees

- `center:` `Point` — optional, default: `item.position`


- #### See also:

- [`matrix.shear(skew, center])`

[**`skew`**`(hor, ver[, center])`](#skew-hor-ver) [**`skew`**`(hor, ver[, center])`](#skew-hor-ver)

Skews the item by the given angles from its center point, or optionally by a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal skew angle in degrees

- `ver:` `Number` — the vertical sskew angle in degrees

- `center:` `Point` — optional, default: `item.position`


- #### See also:

- [`matrix.shear(hor, ver, center])`

[**`transform`**`(matrix)`](#transform-matrix) [**`transform`**`(matrix)`](#transform-matrix)

Transform the item.

- #### Parameters:

- `matrix:` `Matrix` — the matrix by which the item shall be transformed

[**`globalToLocal`**`(point)`](#globaltolocal-point) [**`globalToLocal`**`(point)`](#globaltolocal-point)

Converts the specified point from global project coordinate space to the item’s own local coordinate space.

- #### Parameters:

- `point:` `Point` — the point to be transformed


- #### Returns:

- `Point` — the transformed point as a new instance

[**`localToGlobal`**`(point)`](#localtoglobal-point) [**`localToGlobal`**`(point)`](#localtoglobal-point)

Converts the specified point from the item’s own local coordinate space to the global project coordinate space.

- #### Parameters:

- `point:` `Point` — the point to be transformed


- #### Returns:

- `Point` — the transformed point as a new instance

[**`parentToLocal`**`(point)`](#parenttolocal-point) [**`parentToLocal`**`(point)`](#parenttolocal-point)

Converts the specified point from the parent’s coordinate space to item’s own local coordinate space.

- #### Parameters:

- `point:` `Point` — the point to be transformed


- #### Returns:

- `Point` — the transformed point as a new instance

[**`localToParent`**`(point)`](#localtoparent-point) [**`localToParent`**`(point)`](#localtoparent-point)

Converts the specified point from the item’s own local coordinate space to the parent’s coordinate space.

- #### Parameters:

- `point:` `Point` — the point to be transformed


- #### Returns:

- `Point` — the transformed point as a new instance

[**`fitBounds`**`(rectangle[, fit])`](#fitbounds-rectangle) [**`fitBounds`**`(rectangle[, fit])`](#fitbounds-rectangle)

Transform the item so that its `bounds` are centered in the specified rectangle and fitted to it as described by `fit`.

- #### Parameters:

- `rectangle:` `Rectangle`

- `fit:` `String`⟋`Boolean` — how to fit the item, as in CSS’s `object-fit`: `'contain'` fits all of it within the rectangle, `'cover'` makes it cover the whole rectangle, and `'fill'` stretches it to the rectangle, changing its aspect ratio. The deprecated `true` and `false` stand for `'cover'` and `'contain'`. — optional, default: `‘contain’`

#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle:

#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle, covering all of it:

#### Example:Fitting an item to the bounding rectangle of the view

### Event Handling

[**`on`**`(type, function)`](#on-type-function) [**`on`**`(type, function)`](#on-type-function)

Attaches an event handler to the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `function:` `Function` — the function to be called when the event occurs, receiving a `MouseEvent` or `Event` object as its sole argument


- #### Returns:

- `Item` — this item itself, so calls can be chained

#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

[**`on`**`(object)`](#on-object) [**`on`**`(object)`](#on-object)

Attaches one or more event handlers to the item.

- #### Parameters:

- `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`


- #### Returns:

- `Item` — this item itself, so calls can be chained

#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set black.

[**`off`**`(type, function)`](#off-type-function) [**`off`**`(type, function)`](#off-type-function)

Detach an event handler from the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `function:` `Function` — the function to be detached


- #### Returns:

- `Item` — this item itself, so calls can be chained

[**`off`**`(object)`](#off-object) [**`off`**`(object)`](#off-object)

Detach one or more event handlers to the item.

- #### Parameters:

- `object:` `Object` — an object containing one or more of the following properties: `frame`, `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`, `mouseleave`


- #### Returns:

- `Item` — this item itself, so calls can be chained

[**`emit`**`(type, event)`](#emit-type-event) [**`emit`**`(type, event)`](#emit-type-event)

Emit an event on the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `event:` `Object` — an object literal containing properties describing the event


- #### Returns:

- `Boolean` — `true` if the event had listeners, `false` otherwise

[**`responds`**`(type)`](#responds-type) [**`responds`**`(type)`](#responds-type)

Check if the item has one or more event handlers of the specified type.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`, `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`


- #### Returns:

- `Boolean` — `true` if the item has one or more event handlers of the specified type, `false` otherwise

### Remove On Event

[**`removeOn`**`(options)`](#removeon-options) [**`removeOn`**`(options)`](#removeon-options)

Removes the item when the events specified in the passed options object occur.

- #### Options:

- `options.move: ``Boolean` — remove the item when the next `tool.onMouseMove` event is fired.

- `options.drag: ``Boolean` — remove the item when the next `tool.onMouseDrag` event is fired.

- `options.down: ``Boolean` — remove the item when the next `tool.onMouseDown` event is fired.

- `options.up: ``Boolean` — remove the item when the next `tool.onMouseUp` event is fired.


- #### Parameters:

- `options:` `Object`

#### Example:Click and drag below:

[**`removeOnMove`**`()`](#removeonmove) [**`removeOnMove`**`()`](#removeonmove)

Removes the item when the next `tool.onMouseMove` event is fired.

#### Example:Move your mouse below:

[**`removeOnDown`**`()`](#removeondown) [**`removeOnDown`**`()`](#removeondown)

Removes the item when the next `tool.onMouseDown` event is fired.

#### Example:Click a few times below:

[**`removeOnDrag`**`()`](#removeondrag) [**`removeOnDrag`**`()`](#removeondrag)

Removes the item when the next `tool.onMouseDrag` event is fired.

#### Example:Click and drag below:

[**`removeOnUp`**`()`](#removeonup) [**`removeOnUp`**`()`](#removeonup)

Removes the item when the next `tool.onMouseUp` event is fired.

#### Example:Click a few times below:

### Tweening Functions

[**`tween`**`(from, to, options)`](#tween-from-to-options) [**`tween`**`(from, to, options)`](#tween-from-to-options)

Tween item between two states.

- #### Options:

- `options.duration: ``Number` — the duration of the tweening

- `options.easing: ``Function``⟋``String` — an easing function or the type of the easing: `‘linear’ ‘easeInQuad’ ‘easeOutQuad’ ‘easeInOutQuad’ ‘easeInCubic’ ‘easeOutCubic’ ‘easeInOutCubic’ ‘easeInQuart’ ‘easeOutQuart’ ‘easeInOutQuart’ ‘easeInQuint’ ‘easeOutQuint’ ‘easeInOutQuint’ ‘easeInSine’ ‘easeOutSine’ ‘easeInOutSine’ ‘easeInExpo’ ‘easeOutExpo’ ‘easeInOutExpo’ ‘easeInCirc’ ‘easeOutCirc’ ‘easeInOutCirc’` — default: `‘linear’`

- `options.start: ``Boolean` — whether to start tweening automatically — default: `true`


- #### Parameters:

- `from:` `Object` — the state at the start of the tweening

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration


- #### Returns:

- `Tween`

#### Example:Tween fillColor:

#### Example:Tween rotation:

[**`tween`**`(to, options)`](#tween-to-options) [**`tween`**`(to, options)`](#tween-to-options)

Tween item to a state.

- #### Parameters:

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration


- #### Returns:

- `Tween`


- #### See also:

- `item.tween(from, to, options)`

#### Example:Tween a nested property with relative values

[**`tween`**`(options)`](#tween-options) [**`tween`**`(options)`](#tween-options)

Tween item.

- #### Parameters:

- `options:` `Object`⟋`Number` — the options or the duration


- #### Returns:

- `Tween`


- #### See also:

- `item.tween(from, to, options)`

#### Example:Start an empty tween and just use the update callback:

[**`tweenTo`**`(to, options)`](#tweento-to-options) [**`tweenTo`**`(to, options)`](#tweento-to-options)

Tween item to a state.

- #### Parameters:

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration


- #### Returns:

- `Tween`


- #### See also:

- `item.tween(to, options)`

[**`tweenFrom`**`(from, options)`](#tweenfrom-from-options) [**`tweenFrom`**`(from, options)`](#tweenfrom-from-options)

Tween item from a state to its state before the tweening.

- #### Parameters:

- `from:` `Object` — the state at the start of the tweening

- `options:` `Object`⟋`Number` — the options or the duration


- #### Returns:

- `Tween`


- #### See also:

- `item.tween(from, to, options)`

#### Example:Tween fillColor from red to the path's initial fillColor:

## Properties inherited from `PathItem`

[**`interiorPoint`**](#interiorpoint) [**`interiorPoint`**](#interiorpoint)

Returns a point that is guaranteed to be inside the path.

Read only.

- #### Type:

- `Point`

[**`clockwise`**](#clockwise) [**`clockwise`**](#clockwise)

Specifies whether the path as a whole is oriented clock-wise, by looking at the path’s area. Note that self-intersecting paths and sub-paths of different orientation can result in areas that cancel each other out.

- #### Type:

- `Boolean`


- #### See also:

- [`path.area`](./reference-path.md#area)

- `compoundPath.area`

[**`pathData`**](#pathdata) [**`pathData`**](#pathdata)

The path’s geometry, formatted as SVG style path data.

- #### Type:

- `String`

## Methods inherited from `PathItem`

### Boolean Path Operations

[**`unite`**`(path[, options])`](#unite-path) [**`unite`**`(path[, options])`](#unite-path)

Unites the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside any of them or this path. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`


- #### Parameters:

- `path:` `PathItem`⟋Array of `PathItem` objects — the path or paths to unite with

- `options:` `Object` — the boolean operation options — optional


- #### Returns:

- `PathItem` — the resulting path item

#### Example:

#### Example:Uniting many paths at once:

[**`intersect`**`(path[, options])`](#intersect-path) [**`intersect`**`(path[, options])`](#intersect-path)

Intersects the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside all of them and this path. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating all paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, keeping the parts of the curves that intersect with the areas of all other paths. — default: `true`


- #### Parameters:

- `path:` `PathItem`⟋Array of `PathItem` objects — the path or paths to intersect with

- `options:` `Object` — the boolean operation options — optional


- #### Returns:

- `PathItem` — the resulting path item

#### Example:

[**`subtract`**`(path[, options])`](#subtract-path) [**`subtract`**`(path[, options])`](#subtract-path)

Subtracts the geometry of the specified path from this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside this path and outside all of them. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating all paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections, removing the parts of the curves that intersect with the area of any other path. — default: `true`


- #### Parameters:

- `path:` `PathItem`⟋Array of `PathItem` objects — the path or paths to subtract

- `options:` `Object` — the boolean operation options — optional


- #### Returns:

- `PathItem` — the resulting path item

#### Example:

[**`exclude`**`(path[, options])`](#exclude-path) [**`exclude`**`(path[, options])`](#exclude-path)

Excludes the intersection of the geometry of the specified path with this path’s geometry and returns the result as a new path item. With an array of paths, the result covers the areas inside an odd number of the paths, this one included. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene graph, above all paths involved in the operation — default: `true`


- #### Parameters:

- `path:` `PathItem`⟋Array of `PathItem` objects — the path or paths to exclude the intersection of

- `options:` `Object` — the boolean operation options — optional


- #### Returns:

- `PathItem` — the resulting path item

#### Example:

[**`divide`**`(path[, options])`](#divide-path) [**`divide`**`(path[, options])`](#divide-path)

Splits the geometry of this path along the geometry of the specified path returns the result as a new group item. This is equivalent to calling `subtract(path)` and `intersect(path)` and putting the results into a new group.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene graph, above both paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating both paths as areas when determining which parts of the paths are to be kept in the result, or whether the first path is only to be split at intersections. — default: `true`


- #### Parameters:

- `path:` `PathItem` — the path to divide by

- `options:` `Object` — the boolean operation options — optional


- #### Returns:

- `PathItem` — the resulting path item

[**`reorient`**`([nonZero[, clockwise]])`](#reorient) [**`reorient`**`([nonZero[, clockwise]])`](#reorient)

Fixes the orientation of the sub-paths of a compound-path, assuming that non of its sub-paths intersect, by reorienting them so that they are of different winding direction than their containing paths, except for disjoint sub-paths, i.e. islands, which are oriented so that they have the same winding direction as the the biggest path.

- #### Parameters:

- `nonZero:` `Boolean` — controls if the non-zero fill-rule is to be applied, by counting the winding of each nested path and discarding sub-paths that do not contribute to the final result — optional, default: `false`

- `clockwise:` `Boolean` — if provided, the orientation of the root paths will be set to the orientation specified by `clockwise`, otherwise the orientation of the largest root child is used. — optional


- #### Returns:

- `PathItem` — a reference to the item itself, reoriented

### Path Intersections and Locations

[**`getIntersections`**`([path[, include]])`](#getintersections) [**`getIntersections`**`([path[, include]])`](#getintersections)

Returns all intersections between two `PathItem` items as an array of `CurveLocation` objects. `CompoundPath` items are also supported.

- #### Parameters:

- `path:` `PathItem` — the other item to find the intersections with — optional

- `include:` `Function` — a callback function that can be used to filter out undesired locations right while they are collected. When defined, it shall return `true` to include a location, `false` otherwise. — optional


- #### Returns:

- `Array of ``CurveLocation`` objects` — the locations of all intersection between the paths


- #### See also:

- `getCrossings(path)`

#### Example:Finding the intersections between two paths

[**`getCrossings`**`(path)`](#getcrossings-path) [**`getCrossings`**`(path)`](#getcrossings-path)

Returns all crossings between two `PathItem` items as an array of `CurveLocation` objects. `CompoundPath` items are also supported. Crossings are intersections where the paths actually are crossing each other, as opposed to simply touching.

- #### Parameters:

- `path:` `PathItem` — the other item to find the crossings with


- #### Returns:

- `Array of ``CurveLocation`` objects` — the locations of all crossings between the paths


- #### See also:

- `getIntersections(path)`

[**`getNearestLocation`**`(point)`](#getnearestlocation-point) [**`getNearestLocation`**`(point)`](#getnearestlocation-point)

Returns the nearest location on the path item to the specified point.

- #### Parameters:

- `point:` `Point` — the point for which we search the nearest location


- #### Returns:

- `CurveLocation` — the location on the path that’s the closest to the specified point

[**`getNearestPoint`**`(point)`](#getnearestpoint-point) [**`getNearestPoint`**`(point)`](#getnearestpoint-point)

Returns the nearest point on the path item to the specified point.

- #### Parameters:

- `point:` `Point` — the point for which we search the nearest point


- #### Returns:

- `Point` — the point on the path that’s the closest to the specified point

#### Example:

### Path Manipulation

[**`reverse`**`()`](#reverse) [**`reverse`**`()`](#reverse)

Reverses the orientation of the path item. When called on `CompoundPath` items, each of the nested paths is reversed. On [`Path`](./reference-path.md) items, the sequence of [`path.segments`](./reference-path.md#segments) is reversed.

[**`flatten`**`([flatness])`](#flatten) [**`flatten`**`([flatness])`](#flatten)

Flattens the curves in path items to a sequence of straight lines, by subdividing them enough times until the specified maximum error is met.

- #### Parameters:

- `flatness:` `Number` — the maximum error between the flattened lines and the original curves — optional, default: `0.25`

#### Example:Flattening a circle shaped path:

[**`smooth`**`([options])`](#smooth) [**`smooth`**`([options])`](#smooth)

Smooths the path item without changing the amount of segments in the path or moving the segments’ locations, by smoothing and adjusting the angle and length of the segments’ handles based on the position and distance of neighboring segments.

Smoothing works both for open paths and closed paths, and can be applied to the full path, as well as a sub-range of it. If a range is defined using the `options.from` and `options.to` properties, only the curve handles inside that range are touched. If one or both limits of the range are specified in negative indices, the indices are wrapped around the end of the curve. That way, a smoothing range in a close path can even wrap around the connection between the last and the first segment.

Four different smoothing methods are available:

- `'continuous'` smooths the path item by adjusting its curve handles so that the first and second derivatives of all involved curves are continuous across their boundaries.

  This method tends to result in the smoothest results, but does not allow for further parametrization of the handles.

- `'asymmetric'` is based on the same principle as `'continuous'` but uses different factors so that the result is asymmetric. This used to the only method available until v0.10.0, and is currently still the default when no method is specified, for reasons of backward compatibility. It will eventually be removed.

- `'catmull-rom'` uses the Catmull-Rom spline to smooth the segment.

  The optionally passed factor controls the knot parametrization of the algorithm:

  - `0.0`: the standard, uniform Catmull-Rom spline
  - `0.5`: the centripetal Catmull-Rom spline, guaranteeing no self-intersections
  - `1.0`: the chordal Catmull-Rom spline

- `'geometric'` use a simple heuristic and empiric geometric method to smooth the segment’s handles. The handles were weighted, meaning that big differences in distances between the segments will lead to probably undesired results.

  The optionally passed factor defines the tension parameter (`0…1`), controlling the amount of smoothing as a factor by which to scale each handle.


- #### Options:

- `options.type: ``String` — the type of smoothing method: `‘continuous’`, `‘asymmetric’`, `‘catmull-rom’`, `‘geometric’` — default: `‘asymmetric’`

- `options.factor: ``Number` — the factor parameterizing the smoothing method — default: `0.5` for `'catmull-rom'`, `0.4` for `'geometric'`

- `options.from: ``Number``⟋``Segment``⟋``Curve` — the segment or curve at which to start smoothing, if not the full path shall be smoothed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.

- `options.to: ``Number``⟋``Segment``⟋``Curve` — the segment or curve to which the handles of the path shall be processed (inclusive). This can either be a segment index, or a segment or curve object that is part of the path. If the passed number is negative, the index is wrapped around the end of the path.


- #### Parameters:

- `options:` `Object` — the smoothing options — optional


- #### See also:

- [`segment.smooth(options])`

#### Example:Smoothing a closed shape:

#### Example:

#### Example:Smoothing ranges of paths, using segments, curves or indices:

[**`simplify`**`([tolerance])`](#simplify) [**`simplify`**`([tolerance])`](#simplify)

Fits a sequence of as few curves as possible through the path’s anchor points, ignoring the path items’s curve-handles, with an allowed maximum error. When called on `CompoundPath` items, each of the nested paths is simplified. On [`Path`](./reference-path.md) items, the [`path.segments`](./reference-path.md#segments) array is processed and replaced by the resulting sequence of fitted curves.

This method can be used to process and simplify the point data received from a mouse or touch device.

- #### Parameters:

- `tolerance:` `Number` — the allowed maximum error when fitting the curves through the segment points — optional, default: `2.5`


- #### Returns:

- `Boolean` — `true` if the method was capable of fitting curves through the path’s segment points, `false` otherwise

#### Example:Click and drag below to draw to draw a line, when you release the mouse, the is made smooth using path.simplify():

[**`interpolate`**`(from, to, factor)`](#interpolate-from-to-factor) [**`interpolate`**`(from, to, factor)`](#interpolate-from-to-factor)

Interpolates between the two specified path items and uses the result as the geometry for this path item. The number of children and segments in the two paths involved in the operation should be the same.

- #### Parameters:

- `from:` `PathItem` — the path item defining the geometry when `factor` is `0`

- `to:` `PathItem` — the path item defining the geometry when `factor` is `1`

- `factor:` `Number` — the interpolation coefficient, typically between `0` and `1`, but extrapolation is possible too

[**`compare`**`(path)`](#compare-path) [**`compare`**`(path)`](#compare-path)

Compares the geometry of two paths to see if they describe the same shape, detecting cases where paths start in different segments or even use different amounts of curves to describe the same shape, as long as their orientation is the same, and their segments and handles really result in the same visual appearance of curves.

- #### Parameters:

- `path:` `PathItem` — the path to compare this path’s geometry with


- #### Returns:

- `Boolean` — `true` if two paths describe the same shape, `false` otherwise

### Postscript Style Drawing Commands

[**`moveTo`**`(point)`](#moveto-point) [**`moveTo`**`(point)`](#moveto-point)

On a normal empty [`Path`](./reference-path.md), the point is simply added as the path’s first segment. If called on a `CompoundPath`, a new [`Path`](./reference-path.md) is created as a child and the point is added as its first segment.

- #### Parameters:

- `point:` `Point` — the point in which to start the path

[**`lineTo`**`(point)`](#lineto-point) [**`lineTo`**`(point)`](#lineto-point)

Adds a straight curve to the path, from the the last segment in the path to the specified point.

- #### Parameters:

- `point:` `Point` — the destination point of the newly added straight curve

[**`arcTo`**`(through, to)`](#arcto-through-to) [**`arcTo`**`(through, to)`](#arcto-through-to)

Adds an arc from the position of the last segment in the path, passing through the specified `through` point, to the specified `to` point, by adding one or more segments to the path.

- #### Parameters:

- `through:` `Point` — the point where the arc should pass through

- `to:` `Point` — the point where the arc should end

#### Example:

#### Example:Interactive example. Click and drag in the view below:

[**`arcTo`**`(to[, clockwise])`](#arcto-to) [**`arcTo`**`(to[, clockwise])`](#arcto-to)

Adds an arc from the position of the last segment in the path to the specified point, by adding one or more segments to the path.

- #### Parameters:

- `to:` `Point` — the point where the arc should end

- `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`

#### Example:

#### Example:Interactive example. Click and drag in the view below:

[**`curveTo`**`(through, to[, time])`](#curveto-through-to) [**`curveTo`**`(through, to[, time])`](#curveto-through-to)

Adds a curve from the last segment in the path through the specified `through` point, to the specified destination point by adding one segment to the path.

- #### Parameters:

- `through:` `Point` — the point through which the curve should pass

- `to:` `Point` — the destination point of the newly added curve

- `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`

#### Example:Interactive example. Move your mouse around the view below:

[**`cubicCurveTo`**`(handle1, handle2, to)`](#cubiccurveto-handle1-handle2-to) [**`cubicCurveTo`**`(handle1, handle2, to)`](#cubiccurveto-handle1-handle2-to)

Adds a cubic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by two specified handles.

- #### Parameters:

- `handle1:` `Point` — the location of the first handle of the newly added curve in absolute coordinates, out of which the relative values for `segment.handleOut` of its first segment are calculated

- `handle2:` `Point` — the location of the second handle of the newly added curve in absolute coordinates, out of which the relative values for `segment.handleIn` of its second segment are calculated

- `to:` `Point` — the destination point of the newly added curve

[**`quadraticCurveTo`**`(handle, to)`](#quadraticcurveto-handle-to) [**`quadraticCurveTo`**`(handle, to)`](#quadraticcurveto-handle-to)

Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.

Note that Paper.js only stores cubic curves, so the handle is actually converted.

- #### Parameters:

- `handle:` `Point` — the location of the handle of the newly added quadratic curve in absolute coordinates, out of which the relative values for `segment.handleOut` of the resulting cubic curve’s first segment and `segment.handleIn` of its second segment are calculated

- `to:` `Point` — the destination point of the newly added curve

[**`closePath`**`()`](#closepath) [**`closePath`**`()`](#closepath)

Closes the path. When closed, Paper.js connects the first and last segment of the path with an additional curve. The difference to setting [`path.closed`](./reference-path.md#closed) to `true` is that this will also merge the first segment with the last if they lie in the same location.

- #### See also:

- [`path.closed`](./reference-path.md#closed)

### Relative Drawing Commands

[**`moveBy`**`(to)`](#moveby-to) [**`moveBy`**`(to)`](#moveby-to)

If called on a `CompoundPath`, a new [`Path`](./reference-path.md) is created as a child and a point is added as its first segment relative to the position of the last segment of the current path.

- #### Parameters:

- `to:` `Point`

[**`lineBy`**`(point)`](#lineby-point) [**`lineBy`**`(point)`](#lineby-point)

Adds a straight curve to the path, from the the last segment in the path to the `to` vector specified relatively to it.

- #### Parameters:

- `point:` `Point` — the vector describing the destination of the newly added straight curve

#### Example:

#### Example:Drawing a spiral using lineBy:

[**`arcBy`**`(through, to)`](#arcby-through-to) [**`arcBy`**`(through, to)`](#arcby-through-to)

Adds an arc from the position of the last segment in the path, passing through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one or more segments to the path.

- #### Parameters:

- `through:` `Point` — the vector where the arc should pass through

- `to:` `Point` — the vector where the arc should end

[**`arcBy`**`(to[, clockwise])`](#arcby-to) [**`arcBy`**`(to[, clockwise])`](#arcby-to)

Adds an arc from the position of the last segment in the path to the `to` vector specified relatively to it, by adding one or more segments to the path.

- #### Parameters:

- `to:` `Point` — the vector where the arc should end

- `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction — optional, default: `true`

[**`curveBy`**`(through, to[, time])`](#curveby-through-to) [**`curveBy`**`(through, to[, time])`](#curveby-through-to)

Adds a curve from the last segment in the path through the specified `through` vector, to the specified `to` vector, all specified relatively to it by these given vectors, by adding one segment to the path.

- #### Parameters:

- `through:` `Point` — the vector through which the curve should pass

- `to:` `Point` — the destination vector of the newly added curve

- `time:` `Number` — the curve-time parameter at which the `through` point is to be located — optional, default: `0.5`

[**`cubicCurveBy`**`(handle1, handle2, to)`](#cubiccurveby-handle1-handle2-to) [**`cubicCurveBy`**`(handle1, handle2, to)`](#cubiccurveby-handle1-handle2-to)

Adds a cubic bezier curve to the path, from the last segment to the to the specified `to` vector, with the curve itself defined by two specified handles.

- #### Parameters:

- `handle1:` `Point` — the location of the first handle of the newly added curve

- `handle2:` `Point` — the location of the second handle of the newly added curve

- `to:` `Point` — the destination point of the newly added curve

[**`quadraticCurveBy`**`(handle, to)`](#quadraticcurveby-handle-to) [**`quadraticCurveBy`**`(handle, to)`](#quadraticcurveby-handle-to)

Adds a quadratic bezier curve to the path, from the last segment to the specified destination point, with the curve itself defined by the specified handle.

Note that Paper.js only stores cubic curves, so the handle is actually converted.

- #### Parameters:

- `handle:` `Point` — the handle of the newly added quadratic curve out of which the values for `segment.handleOut` of the resulting cubic curve’s first segment and `segment.handleIn` of its second segment are calculated

- `to:` `Point` — the destination point of the newly added curve

<!--
## Source links

- Item - source: `/reference/item`
- PathItem - source: `/reference/pathitem`
- Segment - source: `/reference/segment`
- [Path](./reference-path.md) - source: /reference/path
- CompoundPath - source: `/reference/compoundpath`
- PathItem.create(pathData) - source: `/reference/pathitem#create-pathdata`
- Point - source: `/reference/point`
- Rectangle - source: `/reference/rectangle`
- Size - source: `/reference/size`
- segment.name - source: `/reference/segment#name`
- Curve - source: `/reference/curve`
- [segments](./reference-path.md#segments) - source: /reference/path#segments
- point.isZero - source: `/reference/point#iszero`
- segment.hasHandles - source: `/reference/segment#hashandles`
- curve.hasHandles - source: `/reference/curve#hashandles`
- CurveLocation - source: `/reference/curvelocation`
- curve.divideAt(location) - source: `/reference/curve#divideat-location`
- item.clone - source: `/reference/item#clone`
- Shape - source: `/reference/shape`
- shape.toPath(insert) - source: `/reference/shape#topath-insert`
- [path.length](./reference-path.md#length) - source: /reference/path#length
- project.host - source: `/reference/project#host`
- Group - source: `/reference/group`
- Layer - source: `/reference/layer`
- Style - source: `/reference/style`
- hitTest(point[, options]) - source: `/reference/item#hittest-point`
- AreaText - source: `/reference/areatext`
- project.selectedItems - source: `/reference/project#selecteditems`
- segment.selected - source: `/reference/segment#selected`
- curve.selected - source: `/reference/curve#selected`
- point.selected - source: `/reference/point#selected`
- rectangle.center - source: `/reference/rectangle#center`
- bounds - source: `/reference/item#bounds`
- position - source: `/reference/item#position`
- matrix - source: `/reference/item#matrix`
- applyMatrix - source: `/reference/item#applymatrix`
- Matrix - source: `/reference/matrix`
- transform(matrix) - source: `/reference/item#transform-matrix`
- rotate(angle) - source: `/reference/item#rotate-angle`
- scale(scale) - source: `/reference/item#scale-scale`
- Project - source: `/reference/project`
- View - source: `/reference/view`
- PaperScope - source: `/reference/paperscope`
- name - source: `/reference/item#name`
- Raster - source: `/reference/raster`
- SymbolItem - source: `/reference/symbolitem`
- PointText - source: `/reference/pointtext`
- item.remove - source: `/reference/item#remove`
- item.removeChildren - source: `/reference/item#removechildren`
- item.addChild(item) - source: `/reference/item#addchild-item`
- item.insertChild(index, item) - source: `/reference/item#insertchild-index-item`
- Color - source: `/reference/color`
- item.strokeJoin - source: `/reference/item#strokejoin`
- item.strokeWidth - source: `/reference/item#strokewidth`
- view.onFrame - source: `/reference/view#onframe`
- MouseEvent - source: `/reference/mouseevent`
- event.stopPropagation - source: `/reference/event#stoppropagation`
- view.onMouseDown - source: `/reference/view#onmousedown`
- view.onMouseDrag - source: `/reference/view#onmousedrag`
- view.onMouseUp - source: `/reference/view#onmouseup`
- view.onClick - source: `/reference/view#onclick`
- view.onDoubleClick - source: `/reference/view#ondoubleclick`
- view.onMouseMove - source: `/reference/view#onmousemove`
- view.onMouseEnter - source: `/reference/view#onmouseenter`
- view.onMouseLeave - source: `/reference/view#onmouseleave`
- rectangle.intersects(rect) - source: `/reference/rectangle#intersects-rect`
- pathItem.getIntersections(path) - source: `/reference/pathitem#getintersections-path`
- paperScope.settings - source: `/reference/paperscope#settings`
- segment.point - source: `/reference/segment#point`
- segment.handleIn - source: `/reference/segment#handlein`
- segment.handleOut - source: `/reference/segment#handleout`
- item.pivot - source: `/reference/item#pivot`
- item.guide - source: `/reference/item#guide`
- HitResult - source: `/reference/hitresult`
- matches(name, compare) - source: `/reference/item#matches-name-compare`
- project.getItems(options) - source: `/reference/project#getitems-options`
- getItems(options) - source: `/reference/item#getitems-options`
- item.data - source: `/reference/item#data`
- matches(options) - source: `/reference/item#matches-options`
- project.getItems(match) - source: `/reference/project#getitems-match`
- item.children - source: `/reference/item#children`
- SymbolDefinition - source: `/reference/symboldefinition`
- group.ungroup - source: `/reference/group#ungroup`
- TextItem - source: `/reference/textitem`
- hitTest - source: `/reference/item#hittest`
- matrix.rotate(angle[, center]) - source: `/reference/matrix#rotate-angle`
- matrix.shear(shear[, center]) - source: `/reference/matrix#shear-shear`
- matrix.shear(hor, ver[, center]) - source: `/reference/matrix#shear-hor-ver`
- matrix.shear(skew[, center]) - source: `/reference/matrix#shear-skew`
- Event - source: `/reference/event`
- tool.onMouseMove - source: `/reference/tool#onmousemove`
- tool.onMouseDrag - source: `/reference/tool#onmousedrag`
- tool.onMouseDown - source: `/reference/tool#onmousedown`
- tool.onMouseUp - source: `/reference/tool#onmouseup`
- Tween - source: `/reference/tween`
- item.tween(from, to, options) - source: `/reference/item#tween-from-to-options`
- item.tween(to, options) - source: `/reference/item#tween-to-options`
- [path.area](./reference-path.md#area) - source: /reference/path#area
- compoundPath.area - source: `/reference/compoundpath#area`
- subtract(path) - source: `/reference/pathitem#subtract-path`
- intersect(path) - source: `/reference/pathitem#intersect-path`
- getCrossings(path) - source: `/reference/pathitem#getcrossings-path`
- segment.smooth([options]) - source: `/reference/segment#smooth`
- [path.closed](./reference-path.md#closed) - source: /reference/path#closed
- Global Scope - source: `/reference/global`
- Gradient - source: `/reference/gradient`
- GradientStop - source: `/reference/gradientstop`
- Tool - source: `/reference/tool`
- ToolEvent - source: `/reference/toolevent`
- Key - source: `/reference/key`
- KeyEvent - source: `/reference/keyevent`
- PaperScript - source: `/reference/paperscript`
-->
