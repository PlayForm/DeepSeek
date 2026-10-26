# Path

Extends **[`Item`](./reference-item.md)**, **[`PathItem`](./reference-pathitem.md)**

The path item represents a path in a Paper.js project.

## Constructors

Creates a new path item and places it at the top of the active layer.

- #### Parameters:

- `segments:` Array of [`Segment`](./reference-segment.md) objects — An array of segments (or points
  to be converted to segments) that will be added to the path — optional

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

Creates a new path item from an object description and places it at the top of the active layer.

- #### Parameters:

- `object:` `Object` — an object containing properties to be set on the path

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:

Creates a new path item from SVG path-data and places it at the top of the active layer. A path
holds a single sub-path: further `M` commands are ignored, and the commands that follow them
continue the same path. Use [`CompoundPath`](./reference-compoundpath.md) or
[`PathItem.create(pathData)`](./reference-pathitem.md#create-pathdata) to create items with multiple
sub-paths.

- #### Parameters:

- `pathData:` `String` — the SVG path-data that describes the geometry of this path

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

### Shaped Paths

Creates a linear path item from two points describing a line.

- #### Parameters:

- `from:` [`Point`](./reference-point.md) — the line’s starting point

- `to:` [`Point`](./reference-point.md) — the line’s ending point

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a linear path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a circular path item.

- #### Parameters:

- `center:` [`Point`](./reference-point.md) — the center point of the circle

- `radius:` `Number` — the radius of the circle

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a circular path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a rectangular path item, with optionally rounded corners.

- #### Parameters:

- `rectangle:` [`Rectangle`](./reference-rectangle.md) — the rectangle object describing the
  geometry of the rectangular path to be created

- `radius:` [`Size`](./reference-size.md) — the size of the rounded corners — optional, default:
  `null`

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:The same, with rounder corners

Creates a rectangular path item from a point and a size object.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the rectangle’s top-left corner.

- `size:` [`Size`](./reference-size.md) — the rectangle’s size.

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a rectangular path item from the passed points. These do not necessarily need to be the top
left and bottom right corners, the constructor figures out how to fit a rectangle between them.

- #### Parameters:

- `from:` [`Point`](./reference-point.md) — the first point defining the rectangle

- `to:` [`Point`](./reference-point.md) — the second point defining the rectangle

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a rectangular path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:

#### Example:

#### Example:

Creates an elliptical path item.

- #### Parameters:

- `rectangle:` [`Rectangle`](./reference-rectangle.md) — the rectangle circumscribing the ellipse

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates an elliptical path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

#### Example:Placing by center and radius

Creates a circular arc path item.

- #### Parameters:

- `from:` [`Point`](./reference-point.md) — the starting point of the circular arc

- `through:` [`Point`](./reference-point.md) — the point the arc passes through

- `to:` [`Point`](./reference-point.md) — the end point of the arc

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates an circular arc path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a regular polygon shaped path item. As in Illustrator, it stands on a flat bottom edge, and
its segments run counterclockwise from its top vertex, or with an even number of sides, from the
right end of its top edge.

- #### Parameters:

- `center:` [`Point`](./reference-point.md) — the center point of the polygon

- `sides:` `Number` — the number of sides of the polygon

- `radius:` `Number` — the radius of the polygon

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a regular polygon shaped path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a star shaped path item.

The largest of `radius1` and `radius2` will be the outer radius of the star. The smallest of radius1
and radius2 will be the inner radius.

- #### Parameters:

- `center:` [`Point`](./reference-point.md) — the center point of the star

- `points:` `Number` — the number of points of the star

- `radius1:` `Number`

- `radius2:` `Number`

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

Creates a star shaped path item from the properties described by an object literal.

- #### Parameters:

- `object:` `Object` — an object containing properties describing the path’s attributes

- #### Returns:

- [`Path`](./reference-path.md) — the newly created path

#### Example:

## Properties

The segments contained within the path. Segments that define a
[`segment.name`](./reference-segment.md#name) can also be accessed by name.

- #### Type:

- Array of [`Segment`](./reference-segment.md) objects

#### Example:Accessing segments by name:

The first Segment contained within the path.

Read only.

- #### Type:

- [`Segment`](./reference-segment.md)

The last Segment contained within the path.

Read only.

- #### Type:

- [`Segment`](./reference-segment.md)

The curves contained within the path.

Read only.

- #### Type:

- Array of [`Curve`](./reference-curve.md) objects

The first Curve contained within the path.

Read only.

- #### Type:

- [`Curve`](./reference-curve.md)

The last Curve contained within the path.

Read only.

- #### Type:

- [`Curve`](./reference-curve.md)

Specifies whether the path is closed. If it is closed, Paper.js connects the first and last
segments.

- #### Type:

- `Boolean`

#### Example:

The approximate length of the path.

Read only.

- #### Type:

- `Number`

The area that the path’s geometry is covering. Self-intersecting paths can contain sub-areas that
cancel each other out.

Read only.

- #### Type:

- `Number`

Specifies whether the path and all its segments are selected. Cannot be `true` on an empty path.

- #### Type:

- `Boolean`

#### Example:A path is fully selected, if all of its segments are selected:

## Methods

Adds one or more segments to the end of the [`segments`](./reference-path.md#segments) array of this
path.

- #### Parameters:

- `segment:` [`Segment`](./reference-segment.md)⟋[`Point`](./reference-point.md)⟋Array of `Numbers`
  — the segment or point to be added.

- #### Returns:

- [`Segment`](./reference-segment.md)`⟋Array of `[`Segment`](./reference-segment.md)` objects` — the
  added segment(s). This is not necessarily the same object, e.g. if the segment to be added already
  belongs to another path.

#### Example:Adding segments to a path using point objects:

#### Example:Adding segments to a path using arrays containing number pairs:

#### Example:Adding segments to a path using objects:

#### Example:Adding a segment with handles to a path:

Inserts one or more segments at a given index in the list of this path’s segments.

- #### Parameters:

- `index:` `Number` — the index at which to insert the segment

- `segment:` [`Segment`](./reference-segment.md)⟋[`Point`](./reference-point.md) — the segment or
  point to be inserted.

- #### Returns:

- [`Segment`](./reference-segment.md) — the added segment. This is not necessarily the same object,
  e.g. if the segment to be added already belongs to another path

#### Example:Inserting a segment:

#### Example:Inserting multiple segments:

Adds an array of segments (or types that can be converted to segments) to the end of the
[`segments`](./reference-path.md#segments) array.

- #### Parameters:

- `segments:` Array of [`Segment`](./reference-segment.md) objects

- #### Returns:

- `Array of `[`Segment`](./reference-segment.md)` objects` — an array of the added segments. These
  segments are not necessarily the same objects, e.g. if the segment to be added already belongs to
  another path

#### Example:Adding an array of Point objects:

#### Example:Adding an array of \[x, y\] arrays:

#### Example:Adding segments from one path to another:

Inserts an array of segments at a given index in the path’s
[`segments`](./reference-path.md#segments) array.

- #### Parameters:

- `index:` `Number` — the index at which to insert the segments

- `segments:` Array of [`Segment`](./reference-segment.md) objects — the segments to be inserted

- #### Returns:

- `Array of `[`Segment`](./reference-segment.md)` objects` — an array of the added segments. These
  segments are not necessarily the same objects, e.g. if the segment to be added already belongs to
  another path

Removes the segment at the specified index of the path’s [`segments`](./reference-path.md#segments)
array.

- #### Parameters:

- `index:` `Number` — the index of the segment to be removed

- #### Returns:

- [`Segment`](./reference-segment.md) — the removed segment

#### Example:Removing a segment from a path:

Removes all segments from the path’s [`segments`](./reference-path.md#segments) array.

- #### Returns:

- `Array of `[`Segment`](./reference-segment.md)` objects` — an array containing the removed
  segments

Removes the segments from the specified `from` index to the `to` index from the path’s
[`segments`](./reference-path.md#segments) array. On closed paths, `from` can be bigger than `to`,
to remove the segments from `from` to the end and then from the beginning up to `to`, wrapping
around the closing curve.

- #### Parameters:

- `from:` `Number` — the beginning index, inclusive

- `to:` `Number` — the ending index, exclusive — optional, default: `segments.length`

- #### Returns:

- `Array of `[`Segment`](./reference-segment.md)` objects` — an array containing the removed
  segments, in the order in which they appeared along the path

#### Example:Removing segments from a path:

Checks if any of the curves in the path have curve handles set. Handles of which both coordinates
are 0 within a tolerance of 1e-12 count as not set, see
[`point.isZero`](./reference-point.md#iszero)().

- #### Returns:

- `Boolean` — `true` if the path has curve handles set, `false` otherwise

- #### See also:

- [`segment.hasHandles`](./reference-segment.md#hashandles)`()`

- [`curve.hasHandles`](./reference-curve.md#hashandles)`()`

Clears the path’s handles by setting their coordinates to zero, turning the path into a polygon (or
a polyline if it isn’t closed).

Divides the path on the curve at the given offset or location into two curves, by inserting a new
segment at the given location.

- #### Parameters:

- `location:` `Number`⟋[`CurveLocation`](./reference-curvelocation.md) — the offset or location on
  the path at which to divide the existing curve by inserting a new segment

- #### Returns:

- [`Segment`](./reference-segment.md) — the newly inserted segment if the location is valid, `null`
  otherwise

- #### See also:

- [`curve.divideAt(location)`](./reference-curve.md#divideat-location)

Splits the path at the given offset or location. After splitting, the path will be open. If the path
was open already, splitting will result in two paths.

- #### Parameters:

- `location:` `Number`⟋[`CurveLocation`](./reference-curvelocation.md) — the offset or location at
  which to split the path

- #### Returns:

- [`Path`](./reference-path.md)`⟋``null` — the newly created path after splitting, if any

#### Example:

#### Example:Splitting an open path Draw a V shaped path:

#### Example:Splitting a closed path

Joins the path with the other specified path, which will be removed in the process. They can be
joined if the first or last segments of either path lie in the same location. Locations are
optionally compare with a provide `tolerance` value.

If `null` or `this` is passed as the other path, the path will be joined with itself if the first
and last segment are in the same location.

- #### Parameters:

- `path:` [`Path`](./reference-path.md) — the path to join this path with; `null` or `this` to join
  the path with itself

- `tolerance:` `Number` — the tolerance with which to decide if two segments are to be considered
  the same location when joining — optional, default: `0`

#### Example:Joining two paths:

#### Example:Joining two paths that share a point at the start or end of their segments array:

#### Example:Joining two paths that connect at two points:

Reduces the path by removing straight curves that have a length of 0. With `options.simplify`, it
also removes straight curves that are almost 0 in length, and unnecessary segments between two
collinear straight curves.

- #### Options:

- `options.simplify: ``Boolean` — also remove almost zero-length curves and segments between
  collinear straight curves — default: `false`

- #### Parameters:

- `options:` `Object` — the reduce options — optional

- #### Returns:

- [`Path`](./reference-path.md) — the reduced path

Attempts to create a new shape item with same geometry as this path item, and inherits all settings
from it, similar to [`item.clone`](./reference-item.md#clone)().

- #### Parameters:

- `insert:` `Boolean` — specifies whether the new shape should be inserted into the scene graph.
  When set to `true`, it is inserted above the path item — optional, default: `true`

- #### Returns:

- [`Shape`](./reference-shape.md) — the newly created shape item with the same geometry as this path
  item if it can be matched, `null` otherwise

- #### See also:

- [`shape.toPath(insert)`](./reference-shape.md#topath-insert)

### Positions on Paths and Curves

Returns the curve location of the specified point if it lies on the path, `null` otherwise.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point on the path

- #### Returns:

- [`CurveLocation`](./reference-curvelocation.md)`⟋``null` — the curve location of the specified
  point

Returns the length of the path from its beginning up to up to the specified point if it lies on the
path, `null` otherwise.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point on the path

- #### Returns:

- `Number``⟋``null` — the length of the path up to the specified point

Returns the curve location of the specified offset on the path, or `null` if the offset exceeds the
length of the path.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`CurveLocation`](./reference-curvelocation.md) — the curve location at the specified offset

Calculates the point on the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`Point`](./reference-point.md) — the point at the given offset

#### Example:Finding the point on a path at a given offset:

#### Example:Iterating over the length of a path:

Calculates the normalized tangent vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`Point`](./reference-point.md) — the normalized tangent vector at the given offset

#### Example:Working with the tangent vector at a given offset:

#### Example:Iterating over the length of a path:

Calculates the normal vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`Point`](./reference-point.md) — the normal vector at the given offset

#### Example:Working with the normal vector at a given offset:

#### Example:Iterating over the length of a path:

Calculates the weighted tangent vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`Point`](./reference-point.md) — the weighted tangent vector at the given offset

Calculates the weighted normal vector of the path at the given offset.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- [`Point`](./reference-point.md) — the weighted normal vector at the given offset

Calculates the curvature of the path at the given offset. Curvatures indicate how sharply a path
changes direction. A straight line has zero curvature, where as a circle has a constant curvature.
The path’s radius at the given offset is the reciprocal value of its curvature.

- #### Parameters:

- `offset:` `Number` — the offset on the path, where `0` is at the beginning of the path and
  [`path.length`](./reference-path.md#length) at the end

- #### Returns:

- `Number` — the normal vector at the given offset

Calculates path offsets where the path is tangential to the provided tangent. Note that tangents at
the start or end are included. Tangents at segment points are returned even if only one of their
handles is collinear with the provided tangent.

- #### Parameters:

- `tangent:` [`Point`](./reference-point.md) — the tangent to which the path must be tangential

- #### Returns:

- `Array of ``Numbers` — path offsets where the path is tangential to the provided tangent

## Properties inherited from [`Item`](./reference-item.md)

The key of the host’s node that the item represents, in a project backed by a host document, see
[`project.host`](./reference-project.md#host). It can only be set once, on an item created by a
script, to register the key that the host gave its new node.

- #### Type:

- `Number`

The unique id of the item.

Read only.

- #### Type:

- `Number`

The class name of the item as a string.

- #### Values:

- `'Group'`, `'Layer'`, `'Path'`, `'CompoundPath'`, `'Shape'`, `'Raster'`, `'SymbolItem'`,
  `'PointText'`

- #### Type:

- `String`

The name of the item. If the item has a name, it can be accessed by name through its parent’s
children list.

- #### Type:

- `String`

#### Example:

The path style of the item.

Styles set on a [`Group`](./reference-group.md) or [`Layer`](./reference-layer.md) are applied to
the children that it contains at that moment. Items added to it later do not receive them.

- #### Type:

- [`Style`](./reference-style.md)

#### Example:Applying several styles to an item in one go, by passing an object to its style property:

#### Example:Copying the style of another item:

#### Example:Applying the same style object to multiple items:

Specifies whether the item is locked. When set to `true`, item interactions with the mouse are
disabled.

- #### Default:

- `false`

- #### Type:

- `Boolean`

#### Example:

Specifies whether the item is visible. When set to `false`, the item won’t be drawn.

- #### Default:

- `true`

- #### Type:

- `Boolean`

#### Example:Hiding an item:

The blend mode with which the item is composited onto the canvas. Both the standard canvas
compositing modes, as well as the new CSS blend modes are supported. Where the canvas doesn’t
support a CSS blend mode natively, it draws as `'normal'`. Paper.js’s own modes `'add'`,
`'subtract'`, `'average'`, `'pin-light'` and `'negation'` are emulated, which can have an impact on
performance.

- #### Values:

- `'normal'`, `'multiply'`, `'screen'`, `'overlay'`, `'soft-light'`, `'hard- light'`,
  `'color-dodge'`, `'color-burn'`, `'darken'`, `'lighten'`, `'difference'`, `'exclusion'`, `'hue'`,
  `'saturation'`, `'luminosity'`, `'color'`, `'add'`, `'subtract'`, `'average'`, `'pin-light'`,
  `'negation'`, `'source-over'`, `'source-in'`, `'source-out'`, `'source-atop'`,
  `'destination-over'`, `'destination-in'`, `'destination-out'`, `'destination-atop'`, `'lighter'`,
  `'darker'`, `'copy'`, `'xor'`

- #### Default:

- `'normal'`

- #### Type:

- `String`

#### Example:Setting an item's blend mode:

The opacity of the item as a value between `0` and `1`.

- #### Default:

- `1`

- #### Type:

- `Number`

#### Example:Making an item 50% transparent:

Specifies whether the item functions as a guide. When set to `true`, the item is drawn as usual, but
left out of hit-tests and mouse interactions. Hit-tests only find guides when `options.guides` is
set, and then only them, see [`hitTest(point[, options])`](./reference-item.md#hittest-point).

- #### Default:

- `false`

- #### Type:

- `Boolean`

Specifies whether, and how, the item pushes aside the text of the
[`AreaText`](./reference-areatext.md) items below it in its layer: `null`, or an object with
`offset`, the space kept between them, and `invert`, to let the text flow inside it instead. `true`
sets the defaults.

- #### Default:

- `null`

- #### Type:

- `Object`

#### Example:

    var circle = new Path.Circle({ center: [100, 100], radius: 40 });
    circle.textWrap = { offset: 10 };

Specifies whether the item is selected. This will also return `true` for
[`Group`](./reference-group.md) items if they are partially selected, e.g. groups containing
selected or partially selected paths.

Paper.js draws the visual outlines of selected items on top of your project. This can be useful for
debugging, as it allows you to see the construction of paths, position of path curves, individual
segment points and bounding boxes of symbol and raster items.

- #### Default:

- `false`

- #### Type:

- `Boolean`

- #### See also:

- [`project.selectedItems`](./reference-project.md#selecteditems)

- [`segment.selected`](./reference-segment.md#selected)

- [`curve.selected`](./reference-curve.md#selected)

- [`point.selected`](./reference-point.md#selected)

#### Example:Selecting an item:

Specifies whether the item defines a clip mask. This can only be set on paths and compound paths,
and only if the item is already contained within a clipping group.

- #### Default:

- `false`

- #### Type:

- `Boolean`

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

The item’s position within the parent item’s coordinate system. By default, this is the
[`rectangle.center`](./reference-rectangle.md#center) of the item’s
[`bounds`](./reference-item.md#bounds) rectangle.

- #### Type:

- [`Point`](./reference-point.md)

#### Example:Changing the position of a path:

#### Example:Changing the x coordinate of an item's position:

The item’s pivot point specified in the item coordinate system, defining the point around which all
transformations are hinging. This is also the reference point for
[`position`](./reference-item.md#position). By default, it is set to `null`, meaning the
[`rectangle.center`](./reference-rectangle.md#center) of the item’s
[`bounds`](./reference-item.md#bounds) rectangle is used as pivot.

- #### Default:

- `null`

- #### Type:

- [`Point`](./reference-point.md)

The bounding rectangle of the item excluding stroke width.

- #### Type:

- [`Rectangle`](./reference-rectangle.md)

The bounding rectangle of the item including stroke width.

Setting it fits the item’s [`bounds`](./reference-item.md#bounds) into the given rectangle minus the
extent of the stroke on each side, also where this extent changes with the item’s proportions, as
with miters. A rectangle smaller than the stroke itself shrinks the bounds to its center.

- #### Type:

- [`Rectangle`](./reference-rectangle.md)

The bounding rectangle of the item including handles.

- #### Type:

- [`Rectangle`](./reference-rectangle.md)

The bounding rectangle of the item without any matrix transformations.

Typical use case would be drawing a frame around the object where you want to draw something of the
same size, position, rotation, and scaling, like a selection frame.

- #### Type:

- [`Rectangle`](./reference-rectangle.md)

The current rotation angle of the item, as described by its [`matrix`](./reference-item.md#matrix).
Please note that this only returns meaningful values for items with
[`applyMatrix`](./reference-item.md#applymatrix) set to `false`, meaning they do not directly bake
transformations into their content.

- #### Type:

- `Number`

The current scale factor of the item, as described by its [`matrix`](./reference-item.md#matrix).
Please note that this only returns meaningful values for items with
[`applyMatrix`](./reference-item.md#applymatrix) set to `false`, meaning they do not directly bake
transformations into their content.

- #### Type:

- [`Point`](./reference-point.md)

The item’s transformation matrix, defining position and dimensions in relation to its parent item in
which it is contained.

- #### Type:

- [`Matrix`](./reference-matrix.md)

The item’s global transformation matrix in relation to the global project coordinate space. Note
that the view’s transformations resulting from zooming and panning are not factored in.

Read only.

- #### Type:

- [`Matrix`](./reference-matrix.md)

The item’s global matrix in relation to the view coordinate space. This means that the view’s
transformations resulting from zooming and panning are factored in.

Read only.

- #### Type:

- [`Matrix`](./reference-matrix.md)

Controls whether the transformations applied to the item (e.g. through
[`transform(matrix)`](./reference-item.md#transform-matrix),
[`rotate(angle)`](./reference-item.md#rotate-angle),
[`scale(scale)`](./reference-item.md#scale-scale), etc.) are stored in its
[`matrix`](./reference-item.md#matrix) property, or whether they are directly applied to its
contents or children (passed on to the segments in [`Path`](./reference-path.md) items, the children
of [`Group`](./reference-group.md) items, etc.).

- #### Default:

- `true`

- #### Type:

- `Boolean`

### Project Hierarchy

The project that this item belongs to.

Read only.

- #### Type:

- [`Project`](./reference-project.md)

The view that this item belongs to.

Read only.

- #### Type:

- [`View`](./reference-view.md)

The scope that this item belongs to, through its project.

Read only.

- #### Type:

- [`PaperScope`](./reference-paperscope.md)

The layer that this item is contained within.

Read only.

- #### Type:

- [`Layer`](./reference-layer.md)

The item that this item is contained within.

- #### Type:

- [`Item`](./reference-item.md)

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

The children items contained within this item. Items that define a
[`name`](./reference-item.md#name) can also be accessed by name.

Only [`Group`](./reference-group.md), [`Layer`](./reference-layer.md) and
[`CompoundPath`](./reference-compoundpath.md) items can have children. On all other items, such as
[`Path`](./reference-path.md), [`Shape`](./reference-shape.md), [`Raster`](./reference-raster.md),
[`SymbolItem`](./reference-symbolitem.md) and [`PointText`](./reference-pointtext.md), `children` is
`undefined`.

**Please note:** The children array should not be modified directly using array functions. To remove
single items from the children list, use [`item.remove`](./reference-item.md#remove)(), to remove
all items from the children list, use [`item.removeChildren`](./reference-item.md#removechildren)().
To add items to the children list, use [`item.addChild(item)`](./reference-item.md#addchild-item) or
[`item.insertChild(index, item)`](./reference-item.md#insertchild-index-item).

- #### Type:

- Array of [`Item`](./reference-item.md) objects

#### Example:Accessing items in the children array:

#### Example:Accessing children by name:

#### Example:Passing an array of items to item.children:

The first item contained within this item. This is a shortcut for accessing `item.children[0]`.

Read only.

- #### Type:

- [`Item`](./reference-item.md)

The last item contained within this item.This is a shortcut for accessing
`item.children[item.children.length - 1]`.

Read only.

- #### Type:

- [`Item`](./reference-item.md)

The next item on the same level as this item.

Read only.

- #### Type:

- [`Item`](./reference-item.md)

The previous item on the same level as this item.

Read only.

- #### Type:

- [`Item`](./reference-item.md)

The index of this item within the list of its parent’s children.

- #### Type:

- `Number`

### Stroke Style

The color of the stroke.

- #### Type:

- [`Color`](./reference-color.md)⟋`null`

#### Example:Setting the stroke color of a path:

The width of the stroke.

- #### Type:

- `Number`

#### Example:Setting an item's stroke width:

The shape to be used at the beginning and end of open [`Path`](./reference-path.md) items, when they
have a stroke.

- #### Values:

- `'round'`, `'square'`, `'butt'`

- #### Default:

- `'butt'`

- #### Type:

- `String`

#### Example:A look at the different stroke caps:

The shape to be used at the segments and corners of [`Path`](./reference-path.md) items when they
have a stroke.

- #### Values:

- `'miter'`, `'round'`, `'bevel'`

- #### Default:

- `'miter'`

- #### Type:

- `String`

#### Example:A look at the different stroke joins:

The dash offset of the stroke.

- #### Default:

- `0`

- #### Type:

- `Number`

Specifies whether the stroke is to be drawn taking the current affine transformation into account
(the default behavior), or whether it should appear as a non-scaling stroke. On text, non-scaling
strokes are exact for uniform scaling only, as the glyphs are always stroked through the
transformation.

- #### Default:

- `true`

- #### Type:

- `Boolean`

Specifies an array containing the dash and gap lengths of the stroke.

- #### Default:

- `[]`

- #### Type:

- Array of `Numbers`

#### Example:

The miter limit of the stroke. When two line segments meet at a sharp angle and miter joins have
been specified for [`item.strokeJoin`](./reference-item.md#strokejoin), it is possible for the miter
to extend far beyond the [`item.strokeWidth`](./reference-item.md#strokewidth) of the path. The
miterLimit imposes a limit on the ratio of the miter length to the
[`item.strokeWidth`](./reference-item.md#strokewidth).

- #### Default:

- `10`

- #### Type:

- `Number`

The order in which the fill and the stroke are painted, as in SVG’s `paint-order`, named after what
is painted first: `'fill'` paints the fill first, `'stroke'` paints the stroke first, so the fill
covers its inner half.

- #### Values:

- `'fill'`, `'stroke'`

- #### Default:

- `'fill'`

- #### Type:

- `String`

### Fill Style

The fill color of the item.

- #### Type:

- [`Color`](./reference-color.md)⟋`null`

#### Example:Setting the fill color of a path to red:

The fill-rule with which the shape gets filled. Please note that only modern browsers support
fill-rules other than `'nonzero'`.

- #### Values:

- `'nonzero'`, `'evenodd'`

- #### Default:

- `'nonzero'`

- #### Type:

- `String`

### Shadow Style

The shadow color.

- #### Type:

- [`Color`](./reference-color.md)⟋`null`

#### Example:Creating a circle with a black shadow:

The shadow’s blur radius.

- #### Default:

- `0`

- #### Type:

- `Number`

The shadow’s offset.

- #### Default:

- `0`

- #### Type:

- [`Point`](./reference-point.md)

### Selection Style

The color the item is highlighted with when selected. If the item does not specify its own color,
the color defined by its layer is used instead.

- #### Type:

- [`Color`](./reference-color.md)⟋`null`

### Event Handlers

Item level handler function to be called on each frame of an animation. The function receives an
event object which contains information about the frame event:

- #### Type:

- `Function`⟋`null`

- #### Options:

- `event.count: ``Number` — the number of times the frame event was fired

- `event.time: ``Number` — the total amount of time passed since the first frame event in seconds

- `event.delta: ``Number` — the time passed in seconds since the last frame event

- #### See also:

- [`view.onFrame`](./reference-view.md#onframe)

#### Example:Creating an animation:

The function to be called when the mouse button is pushed down on the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseDown`](./reference-view.md#onmousedown)

#### Example:Press the mouse button down on the circle shaped path, to make it red:

#### Example:Press the mouse on the circle shaped paths to remove them:

The function to be called when the mouse position changes while the mouse is being dragged over the
item. The function receives a [`MouseEvent`](./reference-mouseevent.md) object which contains
information about the mouse event. Note that such mouse events bubble up the scene graph hierarchy
and will reach the view, unless they are stopped with
[`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning `false` from the
handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseDrag`](./reference-view.md#onmousedrag)

#### Example:Press and drag the mouse on the blue circle to move it:

The function to be called when the mouse button is released over the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseUp`](./reference-view.md#onmouseup)

#### Example:Release the mouse button over the circle shaped path, to make it red:

The function to be called when the mouse clicks on the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onClick`](./reference-view.md#onclick)

#### Example:Click on the circle shaped path, to make it red:

#### Example:Click on the circle shaped paths to remove them:

The function to be called when the mouse double clicks on the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onDoubleClick`](./reference-view.md#ondoubleclick)

#### Example:Double click on the circle shaped path, to make it red:

#### Example:Double click on the circle shaped paths to remove them:

The function to be called repeatedly while the mouse moves over the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseMove`](./reference-view.md#onmousemove)

#### Example:Move over the circle shaped path, to change its opacity:

The function to be called when the mouse moves over the item. This function will only be called
again, once the mouse moved outside of the item first. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseEnter`](./reference-view.md#onmouseenter)

#### Example:When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set back to black.

The function to be called when the mouse moves out of the item. The function receives a
[`MouseEvent`](./reference-mouseevent.md) object which contains information about the mouse event.
Note that such mouse events bubble up the scene graph hierarchy and will reach the view, unless they
are stopped with [`event.stopPropagation`](./reference-event.md#stoppropagation)() or by returning
`false` from the handler.

- #### Type:

- `Function`⟋`null`

- #### See also:

- [`view.onMouseLeave`](./reference-view.md#onmouseleave)

#### Example:Move the mouse over the circle shaped path and then move it out of it again to set its fill color to red:

## Methods inherited from [`Item`](./reference-item.md)

Sets the properties of the passed object literal on this item to the values defined in the object
literal, if the item has property of the given name (or a setter defined for it).

- #### Parameters:

- `props:` `Object`

- #### Returns:

- [`Item`](./reference-item.md) — the item itself

#### Example:Setting properties through an object literal

Clones the item within the same project and places the copy above the item.

- #### Options:

- `insert: undefined` — specifies whether the copy should be inserted into the scene graph. When set
  to `true`, it is inserted above the original — default: `true`

- `deep: undefined` — specifies whether the item’s children should also be cloned — default: `true`

- #### Parameters:

- `options:` `Object` — optional, default: `{ insert: true, deep: true }`

- #### Returns:

- [`Item`](./reference-item.md) — the newly cloned item

#### Example:Cloning items:

Copies the content of the specified item over to this item.

- #### Parameters:

- `source:` [`Item`](./reference-item.md) — the item to copy the content from

Copies all attributes of the specified item over to this item. This includes its style, visibility,
matrix, pivot, blend-mode, opacity, selection state, data, name, etc.

- #### Parameters:

- `source:` [`Item`](./reference-item.md) — the item to copy the attributes from

- `excludeMatrix:` `Boolean` — whether to exclude the transformation matrix when copying all
  attributes

Rasterizes the item into a newly created Raster object. The item itself is not removed after
rasterization.

- #### Options:

- `options.resolution: ``Number` — the desired resolution to be used when rasterizing, in pixels per
  inch (DPI). If not specified, the value of `view.resolution` is used by default. — default:
  `view.resolution`

- `options.raster: `[`Raster`](./reference-raster.md) — specifies a raster to be reused when
  rasterizing. If the raster has the desired size already, then the underlying canvas is reused and
  no new memory needs to be allocated. If no raster is provided, a new raster item is created and
  returned instead. — default: `null`

- `options.insert: ``Boolean` — specifies whether the raster should be inserted into the scene
  graph. When set to `true`, it is inserted above the rasterized item. — default: `true`

- #### Parameters:

- `options:` `Object` — the rasterization options — optional, default: `{}`

- #### Returns:

- [`Raster`](./reference-raster.md) — the reused raster or the newly created raster item

#### Example:Rasterizing an item:

### Geometric Tests

Checks whether the item’s geometry contains the given point.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point to check for

- #### Returns:

- `Boolean`

#### Example:Click within and outside the star below Create a star shaped path:

- #### Parameters:

- `rect:` [`Rectangle`](./reference-rectangle.md) — the rectangle to check against

- #### Returns:

- `Boolean`

Checks whether the item overlaps with the given item: whether their outlines cross, or one contains
the other, as [`rectangle.intersects(rect)`](./reference-rectangle.md#intersects-rect) does for
rectangles. Items other than paths and shapes are checked through their bounds. To only check
whether outlines cross, use
[`pathItem.getIntersections(path)`](./reference-pathitem.md#getintersections-path).

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if the items overlap, `false` otherwise

### Hit-testing, Fetching and Matching Items

Performs a hit-test on the item and its children (if it is a [`Group`](./reference-group.md) or
[`Layer`](./reference-layer.md)) at the location of the specified point, returning the first found
hit.

The options object allows you to control the specifics of the hit-test. Without options, `fill`,
`stroke` and `segments` are hit-tested. As soon as an options object is passed, only the hit-tests
that it sets to `true` are performed. It may contain a combination of the following values:

- #### Options:

- `options.tolerance: ``Number` — the tolerance of the hit-test, in project coordinates — default:
  [`paperScope.settings`](./reference-paperscope.md#settings)`.hitTolerance`

- `options.class: ``Function` — only hit-test against a specific item class, or any of its
  sub-classes, by providing the constructor function against which an `instanceof` check is
  performed: `Group`, `Layer`, `Path`, `CompoundPath`, `Shape`, `Raster`, `SymbolItem`, `PointText`,
  …

- `options.match: ``Function` — a match function to be called for each found hit result: Return
  `true` to return the result, `false` to keep searching

- `options.fill: ``Boolean` — hit-test the fill of items

- `options.stroke: ``Boolean` — hit-test the stroke of path items, taking into account the setting
  of stroke color and width

- `options.segments: ``Boolean` — hit-test for [`segment.point`](./reference-segment.md#point) of
  [`Path`](./reference-path.md) items

- `options.curves: ``Boolean` — hit-test the curves of path items, without taking the stroke color
  or width into account

- `options.handles: ``Boolean` — hit-test for the handles
  ([`segment.handleIn`](./reference-segment.md#handlein) /
  [`segment.handleOut`](./reference-segment.md#handleout)) of path segments.

- `options.ends: ``Boolean` — only hit-test for the first or last segment points of open path items

- `options.position: ``Boolean` — hit-test the [`item.position`](./reference-item.md#position) of of
  items, which depends on the setting of [`item.pivot`](./reference-item.md#pivot)

- `options.center: ``Boolean` — hit-test the [`rectangle.center`](./reference-rectangle.md#center)
  of the bounding rectangle of items ([`item.bounds`](./reference-item.md#bounds))

- `options.bounds: ``Boolean` — hit-test the corners and side-centers of the bounding rectangle of
  items ([`item.bounds`](./reference-item.md#bounds))

- `options.guides: ``Boolean` — only hit-test items that have
  [`item.guide`](./reference-item.md#guide) set to `true`

- `options.selected: ``Boolean` — only hit selected items

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point where the hit-test should be performed (in
  global coordinates system).

- `options:` `Object` — optional, default:
  `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`

- #### Returns:

- [`HitResult`](./reference-hitresult.md) — a hit result object describing what exactly was hit or
  `null` if nothing was hit

Performs a hit-test on the item and its children (if it is a [`Group`](./reference-group.md) or
[`Layer`](./reference-layer.md)) at the location of the specified point, returning all found hits.

The options object allows you to control the specifics of the hit- test. See
[`hitTest(point[, options])`](./reference-item.md#hittest-point) for a list of all options.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point where the hit-test should be performed (in
  global coordinates system).

- `options:` `Object` — optional, default:
  `{ fill: true, stroke: true, segments: true, tolerance: settings.hitTolerance }`

- #### Returns:

- `Array of `[`HitResult`](./reference-hitresult.md)` objects` — hit result objects for all hits,
  describing what exactly was hit or `null` if nothing was hit

- #### See also:

- [`hitTest(point[, options])`](./reference-item.md#hittest-point)`;`

Checks whether the item matches the criteria described by the given object, by iterating over all of
its properties and matching against their values through
[`matches(name, compare)`](./reference-item.md#matches-name-compare).

See [`project.getItems(options)`](./reference-project.md#getitems-options) for a selection of
illustrated examples.

- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against

- #### Returns:

- `Boolean` — `true` if the item matches all the criteria, `false` otherwise

- #### See also:

- [`getItems(options)`](./reference-item.md#getitems-options)

Checks whether the item matches the given criteria. Extended matching is possible by providing a
compare function or a regular expression. Matching points, colors only work as a comparison of the
full object, not partial matching (e.g. only providing the x-coordinate to match all points with
that x-value). Partial matching does work for [`item.data`](./reference-item.md#data).

See [`project.getItems(options)`](./reference-project.md#getitems-options) for a selection of
illustrated examples.

- #### Parameters:

- `name:` `String` — the name of the state to match against

- `compare:` `Object` — the value, function or regular expression to compare against

- #### Returns:

- `Boolean` — `true` if the item matches the state, `false` otherwise

- #### See also:

- [`getItems(options)`](./reference-item.md#getitems-options)

Fetch the descendants (children or children of children) of this item that match the properties in
the specified object. Extended matching is possible by providing a compare function or regular
expression. Matching points, colors only work as a comparison of the full object, not partial
matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial
matching does work for [`item.data`](./reference-item.md#data).

Matching items against a rectangular area is also possible, by setting either `options.inside` or
`options.overlapping` to a rectangle describing the area in which the items either have to be fully
or partly contained.

See [`project.getItems(options)`](./reference-project.md#getitems-options) for a selection of
illustrated examples.

- #### Options:

- `options.recursive: ``Boolean` — whether to loop recursively through all children, or stop at the
  current level — default: `true`

- `options.match: ``Function` — a match function to be called for each item, allowing the definition
  of more flexible item checks that are not bound to properties. If no other match properties are
  defined, this function can also be passed instead of the `options` object

- `options.class: ``Function` — the constructor function of the item type to match against

- `options.inside: `[`Rectangle`](./reference-rectangle.md) — the rectangle in which the items need
  to be fully contained

- `options.overlapping: `[`Rectangle`](./reference-rectangle.md) — the rectangle with which the
  items need to at least partly overlap

- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against

- #### Returns:

- `Array of `[`Item`](./reference-item.md)` objects` — the list of matching descendant items, in
  their stacking order from bottom to top, with each item listed before its own descendants

- #### See also:

- [`matches(options)`](./reference-item.md#matches-options)

Fetch the first descendant (child or child of child) of this item that matches the properties in the
specified object. Extended matching is possible by providing a compare function or regular
expression. Matching points, colors only work as a comparison of the full object, not partial
matching (e.g. only providing the x- coordinate to match all points with that x-value). Partial
matching does work for [`item.data`](./reference-item.md#data). See
[`project.getItems(match)`](./reference-project.md#getitems-match) for a selection of illustrated
examples.

- #### Parameters:

- `options:` `Object`⟋`Function` — the criteria to match against

- #### Returns:

- [`Item`](./reference-item.md) — the first descendant item matching the given criteria

- #### See also:

- [`getItems(options)`](./reference-item.md#getitems-options)

### Importing / Exporting JSON and SVG

Exports (serializes) the item with its content and child items to a JSON data string.

- #### Options:

- `options.asString: ``Boolean` — whether the JSON is returned as a `Object` or a `String`
  — default: `true`

- `options.precision: ``Number` — the amount of fractional digits in numbers used in JSON data
  — default: `5`

- #### Parameters:

- `options:` `Object` — the serialization options — optional

- #### Returns:

- `String` — the exported JSON data

Imports (deserializes) the stored JSON data into this item. If the data describes an item of the
same class or a parent class of the item, the data is imported into the item itself. If not, the
imported item is added to this item’s [`item.children`](./reference-item.md#children) list. Note
that not all type of items can have children.

- #### Parameters:

- `json:` `String` — the JSON data to import from

- #### Returns:

- [`Item`](./reference-item.md)

Exports the item with its content and child items as an SVG DOM.

- #### Options:

- `options.bounds: ``String``⟋`[`Rectangle`](./reference-rectangle.md) — the bounds of the area to
  export, either as a string (`‘view’`, `content’`), or a [`Rectangle`](./reference-rectangle.md)
  object: `'view'` uses the view bounds, `'content'` uses the stroke bounds of all content
  — default: `‘view’`

- `options.matrix: `[`Matrix`](./reference-matrix.md) — the matrix with which to transform the
  exported content: If `options.bounds` is set to `'view'`, `paper.view.matrix` is used, for all
  other settings of `options.bounds` the identity matrix is used. — default: `paper.view.matrix`

- `options.asString: ``Boolean` — whether a SVG node or a `String` is to be returned — default:
  `false`

- `options.precision: ``Number` — the amount of fractional digits in numbers used in SVG data
  — default: `5`

- `options.matchShapes: ``Boolean` — whether path items should tried to be converted to SVG shape
  items (rect, circle, ellipse, line, polyline, polygon), if their geometries match — default:
  `false`

- `options.embedImages: ``Boolean` — whether raster images should be embedded as base64 data inlined
  in the xlink:href attribute, or kept as a link to their external URL. — default: `true`

- `options.reuseImages: ``Boolean` — whether raster images with the same content should only be
  exported once into the `<defs>` element, and placed through `<use>` elements referencing it
  — default: `false`

- `options.idPrefix: ``String` — a prefix for the ids generated for definitions such as gradients,
  clip paths and symbols, to keep them unique when several exported SVGs are placed in one document
  — default: `’’`

- `options.reduceAttributes: ``Boolean` — wether to only include style attributes in the SVG output
  that differ from their parents, or to always include them (much faster but leading to
  redundancies). — default: `true`

- \[options.processNode\] {Function} the function to process the SVG node made for each exported
  item, receiving an object with the \`item\` and its \`node\`: It can change the node, e.g. to add
  attributes that Paper.js doesn't export, or return a node to replace it with. It is called before
  the item's name, style, visibility and data are set on the node, which replace attributes of the
  same names.

- #### Parameters:

- `options:` `Object` — the export options — optional

- #### Returns:

- `SVGElement``⟋``String` — the item converted to an SVG node or a `String` depending on
  `option.asString` value

Converts the provided SVG content into Paper.js items and adds them to the this item’s children
list. Note that the item is not cleared first. You can call
[`item.removeChildren`](./reference-item.md#removechildren)() to do so.

`<symbol>` elements are imported as [`SymbolDefinition`](./reference-symboldefinition.md) items, and
the `<use>` elements that place them as [`SymbolItem`](./reference-symbolitem.md) items. The styles
that `<use>` elements inherit don’t reach the symbols’ content.

The layers in SVG content that Paper.js exported come back as [`Layer`](./reference-layer.md) items
inside the imported group. To make the layers of a project’s SVG the layers of a project again, add
them to it with `item.children.slice().forEach(project.addLayer, project)`.

URLs are fetched as they are, so validate URLs that come from untrusted sources first, especially on
servers, where they could reach internal addresses.

- #### Options:

- `options.expandShapes: ``Boolean` — whether imported shape items should be expanded to path items
  — default: `false`

- \[options.crossOrigin\] {String} the {@link Raster#crossOrigin} value of the rasters created for
  \` \` elements, to load their images with CORS

- `options.onLoad: ``Function` — the callback function to call once the SVG content is loaded from
  the given URL receiving two arguments: the converted `item` and the original `svg` data as a
  string. Only required when loading from external resources.

- `options.onError: ``Function` — the callback function to call if an error occurs during loading.
  Only required when loading from external resources.

- `options.insert: ``Boolean` — whether the imported items should be added to the item that
  `importSVG()` is called on — default: `true`

- `options.applyMatrix: ``Boolean` — whether the imported items should have their transformation
  matrices applied to their contents or not — default:
  [`paperScope.settings`](./reference-paperscope.md#settings)`.applyMatrix`

- \[options.processItem\] {Function} the function to process the item made for each imported SVG
  element, receiving an object with the \`item\` and its \`node\`: It can read attributes that
  Paper.js doesn't import, or return an item to replace it with. It is called after the element's
  attributes and data are applied to the item, so it can extend \`item.data\`. A replacement item
  doesn't receive them: copy them over from \`item\` as needed.

- #### Parameters:

- `svg:` `SVGElement`⟋`String` — the SVG content to import, either as a SVG DOM node, a string
  containing SVG content, or a string describing the URL of the SVG file to fetch.

- `options:` `Object` — the import options — optional

- #### Returns:

- [`Item`](./reference-item.md) — the newly created Paper.js item containing the converted SVG
  content

Imports the provided external SVG file, converts it into Paper.js items and adds them to the this
item’s children list. Note that the item is not cleared first. You can call
[`item.removeChildren`](./reference-item.md#removechildren)() to do so.

- #### Parameters:

- `svg:` `SVGElement`⟋`String` — the URL of the SVG file to fetch.

- `onLoad:` `Function` — the callback function to call once the SVG content is loaded from the given
  URL receiving two arguments: the converted `item` and the original `svg` data as a string. Only
  required when loading from external files.

- #### Returns:

- [`Item`](./reference-item.md) — the newly created Paper.js item containing the converted SVG
  content

### Hierarchy Operations

Adds the specified item as a child of this item at the end of the its
[`children`](./reference-item.md#children) list. You can use this function for groups, compound
paths and layers.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to be added as a child

- #### Returns:

- [`Item`](./reference-item.md) — the added item, or `null` if adding was not possible

Inserts the specified item as a child of this item at the specified index in its
[`children`](./reference-item.md#children) list. You can use this function for groups, compound
paths and layers.

- #### Parameters:

- `index:` `Number` — the index at which to insert the item

- `item:` [`Item`](./reference-item.md) — the item to be inserted as a child

- #### Returns:

- [`Item`](./reference-item.md) — the inserted item, or `null` if inserting was not possible

Adds the specified items as children of this item at the end of the its children list. You can use
this function for groups, compound paths and layers.

- #### Parameters:

- `items:` Array of [`Item`](./reference-item.md) objects — the items to be added as children

- #### Returns:

- `Array of `[`Item`](./reference-item.md)` objects` — the added items, or `null` if adding was not
  possible

Inserts the specified items as children of this item at the specified index in its
[`children`](./reference-item.md#children) list. You can use this function for groups, compound
paths and layers.

- #### Parameters:

- `index:` `Number`

- `items:` Array of [`Item`](./reference-item.md) objects — the items to be appended as children

- #### Returns:

- `Array of `[`Item`](./reference-item.md)` objects` — the inserted items, or `null` if inserted was
  not possible

Inserts this item above the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item above which it should be inserted

- #### Returns:

- [`Item`](./reference-item.md) — the inserted item, or `null` if inserting was not possible

Inserts this item below the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item below which it should be inserted

- #### Returns:

- [`Item`](./reference-item.md) — the inserted item, or `null` if inserting was not possible

Sends this item to the back of all other items within the same parent.

Brings this item to the front of all other items within the same parent.

Adds it to the specified owner, which can be either a [`Item`](./reference-item.md) or a
[`Project`](./reference-project.md).

- #### Parameters:

- `owner:`
  [`Project`](./reference-project.md)⟋[`Layer`](./reference-layer.md)⟋[`Group`](./reference-group.md)⟋[`CompoundPath`](./reference-compoundpath.md)
  — the item or project to add the item to

- #### Returns:

- [`Item`](./reference-item.md) — the item itself, if it was successfully added

Clones the item and adds it to the specified owner, which can be either a
[`Item`](./reference-item.md) or a [`Project`](./reference-project.md).

- #### Parameters:

- `owner:`
  [`Project`](./reference-project.md)⟋[`Layer`](./reference-layer.md)⟋[`Group`](./reference-group.md)⟋[`CompoundPath`](./reference-compoundpath.md)
  — the item or project to copy the item to

- #### Returns:

- [`Item`](./reference-item.md) — the new copy of the item, if it was successfully added

Removes the item and all its children from the project. The item is not destroyed and can be
inserted again after removal.

- #### Returns:

- `Boolean` — `true` if the item was removed, `false` otherwise

Replaces this item with the provided new items which will take its place in the project hierarchy
instead, in the given order. This also ungroups a group, e.g. `group.replaceWith(…group.children)`,
but note that the items keep their own matrices, see
[`group.ungroup`](./reference-group.md#ungroup)().

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the items that will replace this item

- #### Returns:

- `Boolean` — `true` if the item was replaced, `false` otherwise

Removes all of the item’s [`children`](./reference-item.md#children) (if any).

- #### Returns:

- `Array of `[`Item`](./reference-item.md)` objects` — an array containing the removed items

Removes the children from the specified `start` index to and excluding the `end` index from the
parent’s [`children`](./reference-item.md#children) array.

- #### Parameters:

- `start:` `Number` — the beginning index, inclusive

- `end:` `Number` — the ending index, exclusive — optional, default: `children.length`

- #### Returns:

- `Array of `[`Item`](./reference-item.md)` objects` — an array containing the removed items

Reverses the order of the item’s children

### Tests

Specifies whether the item has any content or not. The meaning of what content is differs from type
to type. For example, a [`Group`](./reference-group.md) with no children, a
[`TextItem`](./reference-textitem.md) with no text content and a [`Path`](./reference-path.md) with
no segments all are considered empty.

- #### Parameters:

- `recursively:` `Boolean` — whether an item with children should be considered empty if all its
  descendants are empty — optional, default: `false`

- #### Returns:

- `Boolean`

### Style Tests

Checks whether the item has a visible fill, a fill color with an alpha above 0. Hit-tests also hit
transparent fills, see [`hitTest`](./reference-item.md#hittest).

- #### Returns:

- `Boolean` — `true` if the item has a visible fill, `false` otherwise

Checks whether the item has a stroke.

- #### Returns:

- `Boolean` — `true` if the item has a stroke, `false` otherwise

Checks whether the item has a shadow.

- #### Returns:

- `Boolean` — `true` if the item has a shadow, `false` otherwise

### Hierarchy Tests

Checks if the item contains any children items.

- #### Returns:

- `Boolean` — `true` it has one or more children, `false` otherwise

Checks whether the item and all its parents are inserted into scene graph or not.

- #### Returns:

- `Boolean` — `true` if the item is inserted into the scene graph, `false` otherwise

Checks if this item is above the specified item in the stacking order of the project. If one item is
a descendant of the other, neither is above the other and `false` is returned.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if it is above the specified item, `false` otherwise

Checks if the item is below the specified item in the stacking order of the project. If one item is
a descendant of the other, neither is below the other and `false` is returned.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if it is below the specified item, `false` otherwise

Checks whether the specified item is the parent of the item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if it is the parent of the item, `false` otherwise

Checks whether the specified item is a child of the item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` it is a child of the item, `false` otherwise

Checks if the item is contained within the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if it is inside the specified item, `false` otherwise

Checks if the item is an ancestor of the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if the item is an ancestor of the specified item, `false` otherwise

Checks if the item is an a sibling of the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md) — the item to check against

- #### Returns:

- `Boolean` — `true` if the item is aa sibling of the specified item, `false` otherwise

Checks whether the item is grouped with the specified item.

- #### Parameters:

- `item:` [`Item`](./reference-item.md)

- #### Returns:

- `Boolean` — `true` if the items are grouped together, `false` otherwise

### Transform Functions

Translates (moves) the item by the given offset views.

- #### Parameters:

- `delta:` [`Point`](./reference-point.md) — the offset to translate the item by

Rotates the item by a given angle around the given center point.

Angles are oriented clockwise and measured in degrees.

- #### Parameters:

- `angle:` `Number` — the rotation angle

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

- #### See also:

- [`matrix.rotate(angle[, center])`](./reference-matrix.md#rotate-angle)

#### Example:Rotating an item:

#### Example:Rotating an item around a specific point:

Scales the item by the given value from its center point, or optionally from a supplied point.

- #### Parameters:

- `scale:` `Number` — the scale factor

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

#### Example:Scaling an item from its center point:

#### Example:Scaling an item from a specific point:

Scales the item by the given values from its center point, or optionally from a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal scale factor

- `ver:` `Number` — the vertical scale factor

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

#### Example:Scaling an item horizontally by 300%:

Shears the item by the given value from its center point, or optionally by a supplied point.

- #### Parameters:

- `shear:` [`Point`](./reference-point.md) — the horizontal and vertical shear factors as a point

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

- #### See also:

- [`matrix.shear(shear[, center])`](./reference-matrix.md#shear-shear)

Shears the item by the given values from its center point, or optionally by a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal shear factor

- `ver:` `Number` — the vertical shear factor

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

- #### See also:

- [`matrix.shear(hor, ver[, center])`](./reference-matrix.md#shear-hor-ver)

Skews the item by the given angles from its center point, or optionally by a supplied point.

- #### Parameters:

- `skew:` [`Point`](./reference-point.md) — the horizontal and vertical skew angles in degrees

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

- #### See also:

- [`matrix.shear(skew[, center])`](./reference-matrix.md#shear-skew)

Skews the item by the given angles from its center point, or optionally by a supplied point.

- #### Parameters:

- `hor:` `Number` — the horizontal skew angle in degrees

- `ver:` `Number` — the vertical sskew angle in degrees

- `center:` [`Point`](./reference-point.md) — optional, default:
  [`item.position`](./reference-item.md#position)

- #### See also:

- [`matrix.shear(hor, ver[, center])`](./reference-matrix.md#shear-hor-ver)

Transform the item.

- #### Parameters:

- `matrix:` [`Matrix`](./reference-matrix.md) — the matrix by which the item shall be transformed

Converts the specified point from global project coordinate space to the item’s own local coordinate
space.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point to be transformed

- #### Returns:

- [`Point`](./reference-point.md) — the transformed point as a new instance

Converts the specified point from the item’s own local coordinate space to the global project
coordinate space.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point to be transformed

- #### Returns:

- [`Point`](./reference-point.md) — the transformed point as a new instance

Converts the specified point from the parent’s coordinate space to item’s own local coordinate
space.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point to be transformed

- #### Returns:

- [`Point`](./reference-point.md) — the transformed point as a new instance

Converts the specified point from the item’s own local coordinate space to the parent’s coordinate
space.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point to be transformed

- #### Returns:

- [`Point`](./reference-point.md) — the transformed point as a new instance

Transform the item so that its [`bounds`](./reference-item.md#bounds) are centered in the specified
rectangle and fitted to it as described by `fit`.

- #### Parameters:

- `rectangle:` [`Rectangle`](./reference-rectangle.md)

- `fit:` `String`⟋`Boolean` — how to fit the item, as in CSS’s `object-fit`: `'contain'` fits all of
  it within the rectangle, `'cover'` makes it cover the whole rectangle, and `'fill'` stretches it
  to the rectangle, changing its aspect ratio. The deprecated `true` and `false` stand for `'cover'`
  and `'contain'`. — optional, default: `‘contain’`

#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle:

#### Example:Fitting an item to the bounding rectangle of another item's bounding rectangle, covering all of it:

#### Example:Fitting an item to the bounding rectangle of the view

### Event Handling

Attaches an event handler to the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`,
  `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `function:` `Function` — the function to be called when the event occurs, receiving a
  [`MouseEvent`](./reference-mouseevent.md) or [`Event`](./reference-event.md) object as its sole
  argument

- #### Returns:

- [`Item`](./reference-item.md) — this item itself, so calls can be chained

#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

Attaches one or more event handlers to the item.

- #### Parameters:

- `object:` `Object` — an object containing one or more of the following properties: `frame`,
  `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`,
  `mouseleave`

- #### Returns:

- [`Item`](./reference-item.md) — this item itself, so calls can be chained

#### Example:Change the fill color of the path to red when the mouse enters its shape and back to black again, when it leaves its shape.

#### Example:When you click the mouse, you create new circle shaped items. When you move the mouse over the item, its fill color is set to red. When you move the mouse outside again, its fill color is set black.

Detach an event handler from the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`,
  `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `function:` `Function` — the function to be detached

- #### Returns:

- [`Item`](./reference-item.md) — this item itself, so calls can be chained

Detach one or more event handlers to the item.

- #### Parameters:

- `object:` `Object` — an object containing one or more of the following properties: `frame`,
  `mousedown`, `mouseup`, `mousedrag`, `click`, `doubleclick`, `mousemove`, `mouseenter`,
  `mouseleave`

- #### Returns:

- [`Item`](./reference-item.md) — this item itself, so calls can be chained

Emit an event on the item.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`,
  `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- `event:` `Object` — an object literal containing properties describing the event

- #### Returns:

- `Boolean` — `true` if the event had listeners, `false` otherwise

Check if the item has one or more event handlers of the specified type.

- #### Parameters:

- `type:` `String` — the type of event: `‘frame’`, `mousedown’`, `‘mouseup’`, `‘mousedrag’`,
  `‘click’`, `‘doubleclick’`, `‘mousemove’`, `‘mouseenter’`, `‘mouseleave’`

- #### Returns:

- `Boolean` — `true` if the item has one or more event handlers of the specified type, `false`
  otherwise

### Remove On Event

Removes the item when the events specified in the passed options object occur.

- #### Options:

- `options.move: ``Boolean` — remove the item when the next
  [`tool.onMouseMove`](./reference-tool.md#onmousemove) event is fired.

- `options.drag: ``Boolean` — remove the item when the next
  [`tool.onMouseDrag`](./reference-tool.md#onmousedrag) event is fired.

- `options.down: ``Boolean` — remove the item when the next
  [`tool.onMouseDown`](./reference-tool.md#onmousedown) event is fired.

- `options.up: ``Boolean` — remove the item when the next
  [`tool.onMouseUp`](./reference-tool.md#onmouseup) event is fired.

- #### Parameters:

- `options:` `Object`

#### Example:Click and drag below:

Removes the item when the next [`tool.onMouseMove`](./reference-tool.md#onmousemove) event is fired.

#### Example:Move your mouse below:

Removes the item when the next [`tool.onMouseDown`](./reference-tool.md#onmousedown) event is fired.

#### Example:Click a few times below:

Removes the item when the next [`tool.onMouseDrag`](./reference-tool.md#onmousedrag) event is fired.

#### Example:Click and drag below:

Removes the item when the next [`tool.onMouseUp`](./reference-tool.md#onmouseup) event is fired.

#### Example:Click a few times below:

### Tweening Functions

Tween item between two states.

- #### Options:

- `options.duration: ``Number` — the duration of the tweening

- `options.easing: ``Function``⟋``String` — an easing function or the type of the easing:
  `‘linear’ ‘easeInQuad’ ‘easeOutQuad’ ‘easeInOutQuad’ ‘easeInCubic’ ‘easeOutCubic’ ‘easeInOutCubic’ ‘easeInQuart’ ‘easeOutQuart’ ‘easeInOutQuart’ ‘easeInQuint’ ‘easeOutQuint’ ‘easeInOutQuint’ ‘easeInSine’ ‘easeOutSine’ ‘easeInOutSine’ ‘easeInExpo’ ‘easeOutExpo’ ‘easeInOutExpo’ ‘easeInCirc’ ‘easeOutCirc’ ‘easeInOutCirc’`
  — default: `‘linear’`

- `options.start: ``Boolean` — whether to start tweening automatically — default: `true`

- #### Parameters:

- `from:` `Object` — the state at the start of the tweening

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration

- #### Returns:

- [`Tween`](./reference-tween.md)

#### Example:Tween fillColor:

#### Example:Tween rotation:

Tween item to a state.

- #### Parameters:

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration

- #### Returns:

- [`Tween`](./reference-tween.md)

- #### See also:

- [`item.tween(from, to, options)`](./reference-item.md#tween-from-to-options)

#### Example:Tween a nested property with relative values

Tween item.

- #### Parameters:

- `options:` `Object`⟋`Number` — the options or the duration

- #### Returns:

- [`Tween`](./reference-tween.md)

- #### See also:

- [`item.tween(from, to, options)`](./reference-item.md#tween-from-to-options)

#### Example:Start an empty tween and just use the update callback:

Tween item to a state.

- #### Parameters:

- `to:` `Object` — the state at the end of the tweening

- `options:` `Object`⟋`Number` — the options or the duration

- #### Returns:

- [`Tween`](./reference-tween.md)

- #### See also:

- [`item.tween(to, options)`](./reference-item.md#tween-to-options)

Tween item from a state to its state before the tweening.

- #### Parameters:

- `from:` `Object` — the state at the start of the tweening

- `options:` `Object`⟋`Number` — the options or the duration

- #### Returns:

- [`Tween`](./reference-tween.md)

- #### See also:

- [`item.tween(from, to, options)`](./reference-item.md#tween-from-to-options)

#### Example:Tween fillColor from red to the path's initial fillColor:

## Properties inherited from [`PathItem`](./reference-pathitem.md)

Returns a point that is guaranteed to be inside the path.

Read only.

- #### Type:

- [`Point`](./reference-point.md)

Specifies whether the path as a whole is oriented clock-wise, by looking at the path’s area. Note
that self-intersecting paths and sub-paths of different orientation can result in areas that cancel
each other out.

- #### Type:

- `Boolean`

- #### See also:

- [`path.area`](./reference-path.md#area)

- [`compoundPath.area`](./reference-compoundpath.md#area)

The path’s geometry, formatted as SVG style path data.

- #### Type:

- `String`

## Methods inherited from [`PathItem`](./reference-pathitem.md)

### Boolean Path Operations

Unites the geometry of the specified path with this path’s geometry and returns the result as a new
path item. With an array of paths, the result covers the areas inside any of them or this path. Each
path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene
  graph, above all paths involved in the operation — default: `true`

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md)⟋Array of [`PathItem`](./reference-pathitem.md)
  objects — the path or paths to unite with

- `options:` `Object` — the boolean operation options — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — the resulting path item

#### Example:

#### Example:Uniting many paths at once:

Intersects the geometry of the specified path with this path’s geometry and returns the result as a
new path item. With an array of paths, the result covers the areas inside all of them and this path.
Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene
  graph, above all paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating all paths as areas when
  determining which parts of the paths are to be kept in the result, or whether the first path is
  only to be split at intersections, keeping the parts of the curves that intersect with the areas
  of all other paths. — default: `true`

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md)⟋Array of [`PathItem`](./reference-pathitem.md)
  objects — the path or paths to intersect with

- `options:` `Object` — the boolean operation options — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — the resulting path item

#### Example:

Subtracts the geometry of the specified path from this path’s geometry and returns the result as a
new path item. With an array of paths, the result covers the areas inside this path and outside all
of them. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene
  graph, above all paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating all paths as areas when
  determining which parts of the paths are to be kept in the result, or whether the first path is
  only to be split at intersections, removing the parts of the curves that intersect with the area
  of any other path. — default: `true`

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md)⟋Array of [`PathItem`](./reference-pathitem.md)
  objects — the path or paths to subtract

- `options:` `Object` — the boolean operation options — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — the resulting path item

#### Example:

Excludes the intersection of the geometry of the specified path with this path’s geometry and
returns the result as a new path item. With an array of paths, the result covers the areas inside an
odd number of the paths, this one included. Each path keeps its own fill rule.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene
  graph, above all paths involved in the operation — default: `true`

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md)⟋Array of [`PathItem`](./reference-pathitem.md)
  objects — the path or paths to exclude the intersection of

- `options:` `Object` — the boolean operation options — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — the resulting path item

#### Example:

Splits the geometry of this path along the geometry of the specified path returns the result as a
new group item. This is equivalent to calling
[`subtract(path)`](./reference-pathitem.md#subtract-path) and
[`intersect(path)`](./reference-pathitem.md#intersect-path) and putting the results into a new
group.

- #### Options:

- `options.insert: ``Boolean` — whether the resulting item should be inserted back into the scene
  graph, above both paths involved in the operation — default: `true`

- `options.trace: ``Boolean` — whether the tracing method is used, treating both paths as areas when
  determining which parts of the paths are to be kept in the result, or whether the first path is
  only to be split at intersections. — default: `true`

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md) — the path to divide by

- `options:` `Object` — the boolean operation options — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — the resulting path item

Fixes the orientation of the sub-paths of a compound-path, assuming that non of its sub-paths
intersect, by reorienting them so that they are of different winding direction than their containing
paths, except for disjoint sub-paths, i.e. islands, which are oriented so that they have the same
winding direction as the the biggest path.

- #### Parameters:

- `nonZero:` `Boolean` — controls if the non-zero fill-rule is to be applied, by counting the
  winding of each nested path and discarding sub-paths that do not contribute to the final result
  — optional, default: `false`

- `clockwise:` `Boolean` — if provided, the orientation of the root paths will be set to the
  orientation specified by `clockwise`, otherwise the orientation of the largest root child is used.
  — optional

- #### Returns:

- [`PathItem`](./reference-pathitem.md) — a reference to the item itself, reoriented

### Path Intersections and Locations

Returns all intersections between two [`PathItem`](./reference-pathitem.md) items as an array of
[`CurveLocation`](./reference-curvelocation.md) objects.
[`CompoundPath`](./reference-compoundpath.md) items are also supported.

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md) — the other item to find the intersections with
  — optional

- `include:` `Function` — a callback function that can be used to filter out undesired locations
  right while they are collected. When defined, it shall return `true` to include a location,
  `false` otherwise. — optional

- #### Returns:

- `Array of `[`CurveLocation`](./reference-curvelocation.md)` objects` — the locations of all
  intersection between the paths

- #### See also:

- [`getCrossings(path)`](./reference-pathitem.md#getcrossings-path)

#### Example:Finding the intersections between two paths

Returns all crossings between two [`PathItem`](./reference-pathitem.md) items as an array of
[`CurveLocation`](./reference-curvelocation.md) objects.
[`CompoundPath`](./reference-compoundpath.md) items are also supported. Crossings are intersections
where the paths actually are crossing each other, as opposed to simply touching.

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md) — the other item to find the crossings with

- #### Returns:

- `Array of `[`CurveLocation`](./reference-curvelocation.md)` objects` — the locations of all
  crossings between the paths

- #### See also:

- [`getIntersections(path)`](./reference-pathitem.md#getintersections-path)

Returns the nearest location on the path item to the specified point.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point for which we search the nearest location

- #### Returns:

- [`CurveLocation`](./reference-curvelocation.md) — the location on the path that’s the closest to
  the specified point

Returns the nearest point on the path item to the specified point.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point for which we search the nearest point

- #### Returns:

- [`Point`](./reference-point.md) — the point on the path that’s the closest to the specified point

#### Example:

### Path Manipulation

Reverses the orientation of the path item. When called on
[`CompoundPath`](./reference-compoundpath.md) items, each of the nested paths is reversed. On
[`Path`](./reference-path.md) items, the sequence of [`path.segments`](./reference-path.md#segments)
is reversed.

Flattens the curves in path items to a sequence of straight lines, by subdividing them enough times
until the specified maximum error is met.

- #### Parameters:

- `flatness:` `Number` — the maximum error between the flattened lines and the original curves
  — optional, default: `0.25`

#### Example:Flattening a circle shaped path:

Smooths the path item without changing the amount of segments in the path or moving the segments’
locations, by smoothing and adjusting the angle and length of the segments’ handles based on the
position and distance of neighboring segments.

Smoothing works both for open paths and closed paths, and can be applied to the full path, as well
as a sub-range of it. If a range is defined using the `options.from` and `options.to` properties,
only the curve handles inside that range are touched. If one or both limits of the range are
specified in negative indices, the indices are wrapped around the end of the curve. That way, a
smoothing range in a close path can even wrap around the connection between the last and the first
segment.

Four different smoothing methods are available:

- `'continuous'` smooths the path item by adjusting its curve handles so that the first and second
  derivatives of all involved curves are continuous across their boundaries.

    This method tends to result in the smoothest results, but does not allow for further
    parametrization of the handles.

- `'asymmetric'` is based on the same principle as `'continuous'` but uses different factors so that
  the result is asymmetric. This used to the only method available until v0.10.0, and is currently
  still the default when no method is specified, for reasons of backward compatibility. It will
  eventually be removed.

- `'catmull-rom'` uses the Catmull-Rom spline to smooth the segment.

    The optionally passed factor controls the knot parametrization of the algorithm:

    - `0.0`: the standard, uniform Catmull-Rom spline
    - `0.5`: the centripetal Catmull-Rom spline, guaranteeing no self-intersections
    - `1.0`: the chordal Catmull-Rom spline

- `'geometric'` use a simple heuristic and empiric geometric method to smooth the segment’s handles.
  The handles were weighted, meaning that big differences in distances between the segments will
  lead to probably undesired results.

    The optionally passed factor defines the tension parameter (`0…1`), controlling the amount of
    smoothing as a factor by which to scale each handle.

- #### Options:

- `options.type: ``String` — the type of smoothing method: `‘continuous’`, `‘asymmetric’`,
  `‘catmull-rom’`, `‘geometric’` — default: `‘asymmetric’`

- `options.factor: ``Number` — the factor parameterizing the smoothing method — default: `0.5` for
  `'catmull-rom'`, `0.4` for `'geometric'`

- `options.from: ``Number``⟋`[`Segment`](./reference-segment.md)`⟋`[`Curve`](./reference-curve.md) —
  the segment or curve at which to start smoothing, if not the full path shall be smoothed
  (inclusive). This can either be a segment index, or a segment or curve object that is part of the
  path. If the passed number is negative, the index is wrapped around the end of the path.

- `options.to: ``Number``⟋`[`Segment`](./reference-segment.md)`⟋`[`Curve`](./reference-curve.md) —
  the segment or curve to which the handles of the path shall be processed (inclusive). This can
  either be a segment index, or a segment or curve object that is part of the path. If the passed
  number is negative, the index is wrapped around the end of the path.

- #### Parameters:

- `options:` `Object` — the smoothing options — optional

- #### See also:

- [`segment.smooth([options])`](./reference-segment.md#smooth)

#### Example:Smoothing a closed shape:

#### Example:

#### Example:Smoothing ranges of paths, using segments, curves or indices:

Fits a sequence of as few curves as possible through the path’s anchor points, ignoring the path
items’s curve-handles, with an allowed maximum error. When called on
[`CompoundPath`](./reference-compoundpath.md) items, each of the nested paths is simplified. On
[`Path`](./reference-path.md) items, the [`path.segments`](./reference-path.md#segments) array is
processed and replaced by the resulting sequence of fitted curves.

This method can be used to process and simplify the point data received from a mouse or touch
device.

- #### Parameters:

- `tolerance:` `Number` — the allowed maximum error when fitting the curves through the segment
  points — optional, default: `2.5`

- #### Returns:

- `Boolean` — `true` if the method was capable of fitting curves through the path’s segment points,
  `false` otherwise

#### Example:Click and drag below to draw to draw a line, when you release the mouse, the is made smooth using path.simplify():

Interpolates between the two specified path items and uses the result as the geometry for this path
item. The number of children and segments in the two paths involved in the operation should be the
same.

- #### Parameters:

- `from:` [`PathItem`](./reference-pathitem.md) — the path item defining the geometry when `factor`
  is `0`

- `to:` [`PathItem`](./reference-pathitem.md) — the path item defining the geometry when `factor` is
  `1`

- `factor:` `Number` — the interpolation coefficient, typically between `0` and `1`, but
  extrapolation is possible too

Compares the geometry of two paths to see if they describe the same shape, detecting cases where
paths start in different segments or even use different amounts of curves to describe the same
shape, as long as their orientation is the same, and their segments and handles really result in the
same visual appearance of curves.

- #### Parameters:

- `path:` [`PathItem`](./reference-pathitem.md) — the path to compare this path’s geometry with

- #### Returns:

- `Boolean` — `true` if two paths describe the same shape, `false` otherwise

### Postscript Style Drawing Commands

On a normal empty [`Path`](./reference-path.md), the point is simply added as the path’s first
segment. If called on a [`CompoundPath`](./reference-compoundpath.md), a new
[`Path`](./reference-path.md) is created as a child and the point is added as its first segment.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the point in which to start the path

Adds a straight curve to the path, from the the last segment in the path to the specified point.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the destination point of the newly added straight curve

Adds an arc from the position of the last segment in the path, passing through the specified
`through` point, to the specified `to` point, by adding one or more segments to the path.

- #### Parameters:

- `through:` [`Point`](./reference-point.md) — the point where the arc should pass through

- `to:` [`Point`](./reference-point.md) — the point where the arc should end

#### Example:

#### Example:Interactive example. Click and drag in the view below:

Adds an arc from the position of the last segment in the path to the specified point, by adding one
or more segments to the path.

- #### Parameters:

- `to:` [`Point`](./reference-point.md) — the point where the arc should end

- `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction
  — optional, default: `true`

#### Example:

#### Example:Interactive example. Click and drag in the view below:

Adds a curve from the last segment in the path through the specified `through` point, to the
specified destination point by adding one segment to the path.

- #### Parameters:

- `through:` [`Point`](./reference-point.md) — the point through which the curve should pass

- `to:` [`Point`](./reference-point.md) — the destination point of the newly added curve

- `time:` `Number` — the curve-time parameter at which the `through` point is to be located
  — optional, default: `0.5`

#### Example:Interactive example. Move your mouse around the view below:

Adds a cubic bezier curve to the path, from the last segment to the specified destination point,
with the curve itself defined by two specified handles.

- #### Parameters:

- `handle1:` [`Point`](./reference-point.md) — the location of the first handle of the newly added
  curve in absolute coordinates, out of which the relative values for
  [`segment.handleOut`](./reference-segment.md#handleout) of its first segment are calculated

- `handle2:` [`Point`](./reference-point.md) — the location of the second handle of the newly added
  curve in absolute coordinates, out of which the relative values for
  [`segment.handleIn`](./reference-segment.md#handlein) of its second segment are calculated

- `to:` [`Point`](./reference-point.md) — the destination point of the newly added curve

Adds a quadratic bezier curve to the path, from the last segment to the specified destination point,
with the curve itself defined by the specified handle.

Note that Paper.js only stores cubic curves, so the handle is actually converted.

- #### Parameters:

- `handle:` [`Point`](./reference-point.md) — the location of the handle of the newly added
  quadratic curve in absolute coordinates, out of which the relative values for
  [`segment.handleOut`](./reference-segment.md#handleout) of the resulting cubic curve’s first
  segment and [`segment.handleIn`](./reference-segment.md#handlein) of its second segment are
  calculated

- `to:` [`Point`](./reference-point.md) — the destination point of the newly added curve

Closes the path. When closed, Paper.js connects the first and last segment of the path with an
additional curve. The difference to setting [`path.closed`](./reference-path.md#closed) to `true` is
that this will also merge the first segment with the last if they lie in the same location.

- #### See also:

- [`path.closed`](./reference-path.md#closed)

### Relative Drawing Commands

If called on a [`CompoundPath`](./reference-compoundpath.md), a new [`Path`](./reference-path.md) is
created as a child and a point is added as its first segment relative to the position of the last
segment of the current path.

- #### Parameters:

- `to:` [`Point`](./reference-point.md)

Adds a straight curve to the path, from the the last segment in the path to the `to` vector
specified relatively to it.

- #### Parameters:

- `point:` [`Point`](./reference-point.md) — the vector describing the destination of the newly
  added straight curve

#### Example:

#### Example:Drawing a spiral using lineBy:

Adds an arc from the position of the last segment in the path, passing through the specified
`through` vector, to the specified `to` vector, all specified relatively to it by these given
vectors, by adding one or more segments to the path.

- #### Parameters:

- `through:` [`Point`](./reference-point.md) — the vector where the arc should pass through

- `to:` [`Point`](./reference-point.md) — the vector where the arc should end

Adds an arc from the position of the last segment in the path to the `to` vector specified
relatively to it, by adding one or more segments to the path.

- #### Parameters:

- `to:` [`Point`](./reference-point.md) — the vector where the arc should end

- `clockwise:` `Boolean` — specifies whether the arc should be drawn in clockwise direction
  — optional, default: `true`

Adds a curve from the last segment in the path through the specified `through` vector, to the
specified `to` vector, all specified relatively to it by these given vectors, by adding one segment
to the path.

- #### Parameters:

- `through:` [`Point`](./reference-point.md) — the vector through which the curve should pass

- `to:` [`Point`](./reference-point.md) — the destination vector of the newly added curve

- `time:` `Number` — the curve-time parameter at which the `through` point is to be located
  — optional, default: `0.5`

Adds a cubic bezier curve to the path, from the last segment to the to the specified `to` vector,
with the curve itself defined by two specified handles.

- #### Parameters:

- `handle1:` [`Point`](./reference-point.md) — the location of the first handle of the newly added
  curve

- `handle2:` [`Point`](./reference-point.md) — the location of the second handle of the newly added
  curve

- `to:` [`Point`](./reference-point.md) — the destination point of the newly added curve

Adds a quadratic bezier curve to the path, from the last segment to the specified destination point,
with the curve itself defined by the specified handle.

Note that Paper.js only stores cubic curves, so the handle is actually converted.

- #### Parameters:

- `handle:` [`Point`](./reference-point.md) — the handle of the newly added quadratic curve out of
  which the values for [`segment.handleOut`](./reference-segment.md#handleout) of the resulting
  cubic curve’s first segment and [`segment.handleIn`](./reference-segment.md#handlein) of its
  second segment are calculated

- `to:` [`Point`](./reference-point.md) — the destination point of the newly added curve

<!--
## Source links

- [Item](./reference-item.md) - source: /reference/item
- [PathItem](./reference-pathitem.md) - source: /reference/pathitem
- [Segment](./reference-segment.md) - source: /reference/segment
- [Path](./reference-path.md) - source: /reference/path
- [CompoundPath](./reference-compoundpath.md) - source: /reference/compoundpath
- [PathItem.create(pathData)](./reference-pathitem.md#create-pathdata) - source: /reference/pathitem#create-pathdata
- [Point](./reference-point.md) - source: /reference/point
- [Rectangle](./reference-rectangle.md) - source: /reference/rectangle
- [Size](./reference-size.md) - source: /reference/size
- [segment.name](./reference-segment.md#name) - source: /reference/segment#name
- [Curve](./reference-curve.md) - source: /reference/curve
- [segments](./reference-path.md#segments) - source: /reference/path#segments
- [point.isZero](./reference-point.md#iszero) - source: /reference/point#iszero
- [segment.hasHandles](./reference-segment.md#hashandles) - source: /reference/segment#hashandles
- [curve.hasHandles](./reference-curve.md#hashandles) - source: /reference/curve#hashandles
- [CurveLocation](./reference-curvelocation.md) - source: /reference/curvelocation
- [curve.divideAt(location)](./reference-curve.md#divideat-location) - source: /reference/curve#divideat-location
- [item.clone](./reference-item.md#clone) - source: /reference/item#clone
- [Shape](./reference-shape.md) - source: /reference/shape
- [shape.toPath(insert)](./reference-shape.md#topath-insert) - source: /reference/shape#topath-insert
- [path.length](./reference-path.md#length) - source: /reference/path#length
- [project.host](./reference-project.md#host) - source: /reference/project#host
- [Group](./reference-group.md) - source: /reference/group
- [Layer](./reference-layer.md) - source: /reference/layer
- [Style](./reference-style.md) - source: /reference/style
- [hitTest(point[, options])](./reference-item.md#hittest-point) - source: /reference/item#hittest-point
- [AreaText](./reference-areatext.md) - source: /reference/areatext
- [project.selectedItems](./reference-project.md#selecteditems) - source: /reference/project#selecteditems
- [segment.selected](./reference-segment.md#selected) - source: /reference/segment#selected
- [curve.selected](./reference-curve.md#selected) - source: /reference/curve#selected
- [point.selected](./reference-point.md#selected) - source: /reference/point#selected
- [rectangle.center](./reference-rectangle.md#center) - source: /reference/rectangle#center
- [bounds](./reference-item.md#bounds) - source: /reference/item#bounds
- [position](./reference-item.md#position) - source: /reference/item#position
- [matrix](./reference-item.md#matrix) - source: /reference/item#matrix
- [applyMatrix](./reference-item.md#applymatrix) - source: /reference/item#applymatrix
- [Matrix](./reference-matrix.md) - source: /reference/matrix
- [transform(matrix)](./reference-item.md#transform-matrix) - source: /reference/item#transform-matrix
- [rotate(angle)](./reference-item.md#rotate-angle) - source: /reference/item#rotate-angle
- [scale(scale)](./reference-item.md#scale-scale) - source: /reference/item#scale-scale
- [Project](./reference-project.md) - source: /reference/project
- [View](./reference-view.md) - source: /reference/view
- [PaperScope](./reference-paperscope.md) - source: /reference/paperscope
- [name](./reference-item.md#name) - source: /reference/item#name
- [Raster](./reference-raster.md) - source: /reference/raster
- [SymbolItem](./reference-symbolitem.md) - source: /reference/symbolitem
- [PointText](./reference-pointtext.md) - source: /reference/pointtext
- [item.remove](./reference-item.md#remove) - source: /reference/item#remove
- [item.removeChildren](./reference-item.md#removechildren) - source: /reference/item#removechildren
- [item.addChild(item)](./reference-item.md#addchild-item) - source: /reference/item#addchild-item
- [item.insertChild(index, item)](./reference-item.md#insertchild-index-item) - source: /reference/item#insertchild-index-item
- [Color](./reference-color.md) - source: /reference/color
- [item.strokeJoin](./reference-item.md#strokejoin) - source: /reference/item#strokejoin
- [item.strokeWidth](./reference-item.md#strokewidth) - source: /reference/item#strokewidth
- [view.onFrame](./reference-view.md#onframe) - source: /reference/view#onframe
- [MouseEvent](./reference-mouseevent.md) - source: /reference/mouseevent
- [event.stopPropagation](./reference-event.md#stoppropagation) - source: /reference/event#stoppropagation
- [view.onMouseDown](./reference-view.md#onmousedown) - source: /reference/view#onmousedown
- [view.onMouseDrag](./reference-view.md#onmousedrag) - source: /reference/view#onmousedrag
- [view.onMouseUp](./reference-view.md#onmouseup) - source: /reference/view#onmouseup
- [view.onClick](./reference-view.md#onclick) - source: /reference/view#onclick
- [view.onDoubleClick](./reference-view.md#ondoubleclick) - source: /reference/view#ondoubleclick
- [view.onMouseMove](./reference-view.md#onmousemove) - source: /reference/view#onmousemove
- [view.onMouseEnter](./reference-view.md#onmouseenter) - source: /reference/view#onmouseenter
- [view.onMouseLeave](./reference-view.md#onmouseleave) - source: /reference/view#onmouseleave
- [rectangle.intersects(rect)](./reference-rectangle.md#intersects-rect) - source: /reference/rectangle#intersects-rect
- [pathItem.getIntersections(path)](./reference-pathitem.md#getintersections-path) - source: /reference/pathitem#getintersections-path
- [paperScope.settings](./reference-paperscope.md#settings) - source: /reference/paperscope#settings
- [segment.point](./reference-segment.md#point) - source: /reference/segment#point
- [segment.handleIn](./reference-segment.md#handlein) - source: /reference/segment#handlein
- [segment.handleOut](./reference-segment.md#handleout) - source: /reference/segment#handleout
- [item.pivot](./reference-item.md#pivot) - source: /reference/item#pivot
- [item.guide](./reference-item.md#guide) - source: /reference/item#guide
- [HitResult](./reference-hitresult.md) - source: /reference/hitresult
- [matches(name, compare)](./reference-item.md#matches-name-compare) - source: /reference/item#matches-name-compare
- [project.getItems(options)](./reference-project.md#getitems-options) - source: /reference/project#getitems-options
- [getItems(options)](./reference-item.md#getitems-options) - source: /reference/item#getitems-options
- [item.data](./reference-item.md#data) - source: /reference/item#data
- [matches(options)](./reference-item.md#matches-options) - source: /reference/item#matches-options
- [project.getItems(match)](./reference-project.md#getitems-match) - source: /reference/project#getitems-match
- [item.children](./reference-item.md#children) - source: /reference/item#children
- [SymbolDefinition](./reference-symboldefinition.md) - source: /reference/symboldefinition
- [group.ungroup](./reference-group.md#ungroup) - source: /reference/group#ungroup
- [TextItem](./reference-textitem.md) - source: /reference/textitem
- [hitTest](./reference-item.md#hittest) - source: /reference/item#hittest
- [matrix.rotate(angle[, center])](./reference-matrix.md#rotate-angle) - source: /reference/matrix#rotate-angle
- [matrix.shear(shear[, center])](./reference-matrix.md#shear-shear) - source: /reference/matrix#shear-shear
- [matrix.shear(hor, ver[, center])](./reference-matrix.md#shear-hor-ver) - source: /reference/matrix#shear-hor-ver
- [matrix.shear(skew[, center])](./reference-matrix.md#shear-skew) - source: /reference/matrix#shear-skew
- [Event](./reference-event.md) - source: /reference/event
- [tool.onMouseMove](./reference-tool.md#onmousemove) - source: /reference/tool#onmousemove
- [tool.onMouseDrag](./reference-tool.md#onmousedrag) - source: /reference/tool#onmousedrag
- [tool.onMouseDown](./reference-tool.md#onmousedown) - source: /reference/tool#onmousedown
- [tool.onMouseUp](./reference-tool.md#onmouseup) - source: /reference/tool#onmouseup
- [Tween](./reference-tween.md) - source: /reference/tween
- [item.tween(from, to, options)](./reference-item.md#tween-from-to-options) - source: /reference/item#tween-from-to-options
- [item.tween(to, options)](./reference-item.md#tween-to-options) - source: /reference/item#tween-to-options
- [path.area](./reference-path.md#area) - source: /reference/path#area
- [compoundPath.area](./reference-compoundpath.md#area) - source: /reference/compoundpath#area
- [subtract(path)](./reference-pathitem.md#subtract-path) - source: /reference/pathitem#subtract-path
- [intersect(path)](./reference-pathitem.md#intersect-path) - source: /reference/pathitem#intersect-path
- [getCrossings(path)](./reference-pathitem.md#getcrossings-path) - source: /reference/pathitem#getcrossings-path
- [segment.smooth([options])](./reference-segment.md#smooth) - source: /reference/segment#smooth
- [path.closed](./reference-path.md#closed) - source: /reference/path#closed
- [Global Scope](./reference-global.md) - source: /reference/global
- [Gradient](./reference-gradient.md) - source: /reference/gradient
- [GradientStop](./reference-gradientstop.md) - source: /reference/gradientstop
- [Tool](./reference-tool.md) - source: /reference/tool
- [ToolEvent](./reference-toolevent.md) - source: /reference/toolevent
- [Key](./reference-key.md) - source: /reference/key
- [KeyEvent](./reference-keyevent.md) - source: /reference/keyevent
- [PaperScript](./reference-paperscript.md) - source: /reference/paperscript
-->
