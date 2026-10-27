# Generative examples - the two Paper.js constructions

The two Paper.js examples the icon generator borrows its composition from. Both are distilled from
the fetched pages in `Raw/paperjs-division-raster.md` and `Raw/paperjs-qbertify.md`; the pages are
canvas demos, so their code lives in the page's `paperscript` block rather than in the extracted
text. This note keeps the algorithm.

## Division Raster - recursive subdivision

Source: https://paperjs.org/examples/division-raster/ (after Jonathan Puckey's JPEG Raster).

The construction: take a rectangle, split it along its longer axis into two halves, and repeat on
each half until a depth or a size limit is reached. Each leaf keeps a value sampled from the region
it covers; the leaf edges are the drawing.

```js
// one split
var size = this.bounds.size.clone();
var isLandscape = size.width > size.height;
size /= isLandscape ? [2, 1] : [1, 2];
// two children: the original half and the other half
```

What the icon generator takes from it: a **mosaic ground**. The frame interior is subdivided
recursively; the split axis alternates with the rectangle's aspect, the depth comes from the
package's structure (file count, function count), and each leaf becomes a small cell that carries a
glyph or a tone. The result is a field whose cell pattern differs for every package, because the
subdivision is driven by the same counts that drive the motif.

## Q*bertify - isometric cube tiling

Source: https://paperjs.org/examples/q-bertify/.

The construction: one regular hexagon is split into three rhombi by joining alternating hexagon
vertices to the centre. That three-face tile is stamped on an isometric grid, and each tile's faces
are shaded from one sampled colour.

```js
var hexagon = new Path.RegularPolygon({ center, sides: 6, radius: 50 });
for (var i = 0; i < 2; i++) {
	var path = new Path({ closed: true });
	for (var j = 0; j < 3; j++) path.add(hexagon.segments[(i * 2 + j) % 6].clone());
	path.add(hexagon.bounds.center);
}
// grid: copy.position += size * [x + (y % 2 ? 0.5 : 0), y * 0.75];
// shading: top face brightness * 1.5, right face * 0.5
```

What the icon generator takes from it: an **isometric tiling family**. The icon becomes a hexagon
tiled by rhombi in three tones (top, left, right), so a flat motif reads as a stack of volumes. The
three tones map to the icon's ink, accent, and accent2 slots; the tile count and the row offset are
fixed by the grid, so the construction is deterministic.

## Why these two

They are the two ways the reference sheet gets richness without losing the silhouette: subdivision
makes a field of cells, isometry makes a field of volumes. Both are pure geometry - no raster input
is needed in the icon pipeline, only the construction rule.
