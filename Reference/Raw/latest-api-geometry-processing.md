# Geometry Processing Functions[¶](#geometry-processing-functions)

## Boolean opertions[¶](#boolean-opertions)

`pymesh.``boolean`(*mesh_1*, *mesh_2*, *operation*, *engine='auto'*, *with_timing=False*, *exact_mesh_file=None*)[¶](#pymesh.boolean)  
Perform boolean operations on input meshes.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh_1</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – The first input mesh, <span><span><span><span><span>M</span> <span>1</span></span></span></span><span></span></span>.</li>
<li><strong>mesh_2</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – The second input mesh, <span><span><span><span><span>M</span> <span>2</span></span></span></span><span></span></span>.</li>
<li><p><strong>operation</strong> (<span><code class="docutils literal notranslate">string</code></span>) –</p>
<p>The name of the operation. Valid choices are:</p>
<ul>
<li><span><code class="docutils literal notranslate">intersection</code></span>: <span><span><span><span><span>M</span> <span>1</span></span><span>∩</span><span><span>M</span> <span>2</span></span></span></span><span></span></span></li>
<li><span><code class="docutils literal notranslate">union</code></span>: <span><span><span><span><span>M</span> <span>1</span></span><span>∪</span><span><span>M</span> <span>2</span></span></span></span><span></span></span></li>
<li><span><code class="docutils literal notranslate">difference</code></span>: <span><span><span><span><span>M</span> <span>1</span></span><span>∖</span><span><span>M</span> <span>2</span></span></span></span><span></span></span></li>
<li><span><code class="docutils literal notranslate">symmetric_difference</code></span>: <span><span><span><span>(</span><span><span>M</span> <span>1</span></span><span>∖</span><span><span>M</span> <span>2</span></span><span>)</span><span>∪</span><span>(</span><span><span>M</span> <span>2</span></span><span>∖</span><span><span>M</span> <span>1</span></span><span>)</span></span></span><span></span></span></li>
</ul></li>
<li><p><strong>engine</strong> (<span><code class="docutils literal notranslate">string</code></span>) –</p>
<p>(optional) Boolean engine name. Valid engines include:</p>
<ul>
<li><span><code class="docutils literal notranslate">auto</code></span>: Using the default boolean engine (<span><code class="docutils literal notranslate">igl</code></span> for 3D and <span><code class="docutils literal notranslate">clipper</code></span> for 2D). This is the default.</li>
<li><span><code class="docutils literal notranslate">cork</code></span>: <a href="https://github.com/gilbo/cork">Cork 3D boolean libary</a></li>
<li><span><code class="docutils literal notranslate">cgal</code></span>: <a href="http://doc.cgal.org/latest/Nef_3/index.html">CGAL 3D boolean operations on Nef Polyhedra</a></li>
<li><span><code class="docutils literal notranslate">corefinement</code></span>: The undocumented CGAL boolean function that does not use Nef Polyhedra.</li>
<li><span><code class="docutils literal notranslate">igl</code></span>: <a href="https://github.com/libigl/libigl">libigl’s 3D boolean support</a></li>
<li><span><code class="docutils literal notranslate">clipper</code></span>: <a href="http://www.angusj.com/delphi/clipper.php">Clipper 2D boolean library</a></li>
<li><span><code class="docutils literal notranslate">carve</code></span>: <a href="https://code.google.com/p/carve/">Carve solid geometry library</a></li>
</ul></li>
<li><strong>with_timing</strong> (<span><code class="docutils literal notranslate">boolean</code></span>) – (optional) Whether to time the code.</li>
<li><strong>exact_mesh_file</strong> (<span><code class="docutils literal notranslate">str</code></span>) – (optional) Filename to store the XML serialized exact output.</li>
</ul></td>
</tr>
</tbody>
</table>

Returns: The output mesh.

The following attributes are defined in the output mesh:

> - “source”: An array of 0s and 1s indicating which input mesh an output face comes from.
> - “source_face”: An array of indices, one per output face, into the concatenated faces of the input meshes.

While all solid geometry operations can be done as a sequence of binary boolean operations. It is beneficial sometimes to use [`pymesh.CSGTree`](#pymesh.CSGTree) for carrying out more complex operations.

*class* `pymesh.``CSGTree`(*tree*)[¶](#pymesh.CSGTree)  
Contructive Solid Geometry Tree.

Perhaps the best way of describing supported operations is using context free grammar:

- `mesh` operation: This operation is always a leaf node of the tree.

  \>\>\> tree = pymesh.CSGTree({"mesh": mesh});\

- `union` operation:

  \>\>\> tree = pymesh.CSGTree({"union":\
  ...         \[TREE_1, TREE_2, ..., TREE_N\]\
  ...     });\

- `intersection` operations:

  \>\>\> tree = pymesh.CSGTree({"intersection":\
  ...         \[TREE_1, TREE_2, ..., TREE_N\]\
  ...     });\

- `difference` operations:

  \>\>\> tree = pymesh.CSGTree({"difference":\
  ...         \[TREE_1, TREE_2\]\
  ...     });\

- `symmetric_difference` operations:

  \>\>\> tree = pymesh.CSGTree({"symmetric_difference":\
  ...         \[TREE_1, TREE_2\]\
  ...     });\

Where `TREE_X` could be any of the nodes defined above.

A tree can be build up incrementally:

\>\>\> left_tree = pymesh.CSGTree({"mesh": mesh_1});\
\>\>\> right_tree = pymesh.CSGTree({"mesh": mesh_2});\
\>\>\> tree = pymesh.CSGTree({"union": \[left_tree, right_tree\]});\
\>\>\> mesh = tree.mesh;\

Or constructed from a dict:

\>\>\> tree = pymesh.CSGTree({"union":\
...         \[{"mesh": mesh_1}, {"mesh": mesh_2}\]\
...     });\
\>\>\> mesh = tree.mesh\

## Convex hull[¶](#convex-hull)

`pymesh.``convex_hull`(*mesh*, *engine='auto'*, *with_timing=False*)[¶](#pymesh.convex_hull)  
Compute the convex hull of an input mesh.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – The input mesh.</li>
<li><p><strong>engine</strong> (<span><code class="docutils literal notranslate">string</code></span>) –</p>
<p>(optional) Convex hull engine name. Valid names are:</p>
<ul>
<li>auto: Using the default engine.</li>
<li>qhull: <a href="http://www.qhull.org/">Qhull convext hull library</a></li>
<li><dl>
<dt>cgal: CGAL convex hull module (</dt>
<dd>
<a href="https://doc.cgal.org/latest/Convex_hull_2/index.html">2D</a>, <a href="https://doc.cgal.org/latest/Convex_hull_3/index.html">3D</a>)
</dd>
</dl></li>
<li>triangle: Triangle convex hull engine.</li>
<li>tetgen: Tetgen convex hull engine.</li>
</ul></li>
<li><strong>with_timing</strong> (<span><code class="docutils literal notranslate">boolean</code></span>) – (optional) Whether to time the code</li>
</ul></td>
</tr>
</tbody>
</table>

Returns: The output mesh representing the convex hull. (and running time if with_timing is true.)

The following attributes are defined in the output mesh:

> - “source_vertex”: An array of source vertex indices into the input mesh.

## Outer hull[¶](#outer-hull)

`pymesh.``compute_outer_hull`(*mesh*, *engine='auto'*, *all_layers=False*)[¶](#pymesh.compute_outer_hull)  
Compute the outer hull of the input mesh.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><p><strong>engine</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate"><span class="bu">str</span></code></span>) –</p>
<p>(optional) Outer hull engine name. Valid engines are:</p>
<ul>
<li><span><code class="docutils literal notranslate">auto</code></span>: Using the default engine (<span><code class="docutils literal notranslate">igl</code></span>).</li>
<li><span><code class="docutils literal notranslate">igl</code></span>: <a href="https://github.com/libigl/libigl">libigl’s outer hull support</a></li>
</ul></li>
<li><strong>all_layers</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate"><span class="bu">bool</span></code></span>) – (optional) If true, recursively peel outer hull layers.</li>
</ul></td>
</tr>
<tr>
<th>Returns:</th>
<td><p>If <span><code class="docutils literal notranslate">all_layers</code></span> is false, just return the outer hull mesh.</p>
<dl>
<dt>If <span><code class="docutils literal notranslate">all_layers</code></span> is ture, return a recursively peeled outer hull</dt>
<dd>
<p>layers, from the outer most layer to the inner most layer.</p>
</dd>
</dl>
<p>The following mesh attirbutes are defined in each outer hull mesh:</p>
<ul>
<li><span><code class="docutils literal notranslate">flipped</code></span>: A per-face attribute that is true if a face in outer hull is orientated differently comparing to its corresponding face in the input mesh.</li>
<li><span><code class="docutils literal notranslate">face_sources</code></span>: A per-face attribute that specifies the index of the source face in the input mesh.</li>
</ul></td>
</tr>
</tbody>
</table>

## Mesh arrangement[¶](#mesh-arrangement)

`pymesh.``partition_into_cells`(*mesh*)[¶](#pymesh.partition_into_cells)  
Resolve all-intersections of the input mesh and extract cell partitions induced by the mesh. A cell-partition is subset of the ambient space where any pair of points belonging the partition can be connected by a curve without ever going through any mesh faces.

|  |  |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The input mesh. |

Returns: The output mesh with all intersections resolved and a list of meshes representing individual cells.

The following attributes are defined in the output mesh:

> - `source_face`: the original face index.
> - `patches`: the scalar field marking manifold patches (A set of connected faces connected by manifold edges).
> - `cells`: a per-face scalar field indicating the cell id on the positive side of each face.
> - `winding_number`: the scalar field indicating the piece-wise constant winding number of the cell on the positive side of each face.

## Minkowski sum[¶](#minkowski-sum)

`pymesh.``minkowski_sum`(*mesh*, *path*)[¶](#pymesh.minkowski_sum)  
Perform Minkowski sum of a mesh with a poly-line.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – Input mesh.</li>
<li><strong>path</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate">numpy.ndarray</code></span>) – a <span><span><span><span>n</span> <span>i</span> <span>m</span> <span>e</span> <span>s</span> <span>3</span></span></span><span></span></span> matrix. Each row represents a node in the poly-line.</li>
</ul></td>
</tr>
</tbody>
</table>

Returns: A mesh representing the Minkowski sum of the inputs.

## Subdivision[¶](#subdivision)

`pymesh.``subdivide`(*mesh*, *order=1*, *method='simple'*)[¶](#pymesh.subdivide)  
Subdivide the input mesh.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> – Input triangle mesh.</li>
<li><strong>order</strong> – (optional) Subdivision order.</li>
<li><strong>method</strong> – (optional) Subdivision method. Choices are “simple” and “loop”.</li>
</ul></td>
</tr>
<tr>
<th>Returns:</th>
<td><p>Returns the subdivided mesh. The per-face attribute “ori_face_index” tracks the original face index from the input mesh.</p></td>
</tr>
</tbody>
</table>

## Winding number query[¶](#winding-number-query)

`pymesh.``compute_winding_number`(*mesh*, *queries*, *engine='auto'*)[¶](#pymesh.compute_winding_number)  
Compute winding number with respect to mesh at queries.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – The mesh for which winding number is evaluated.</li>
<li><strong>queries</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate">numpy.ndarray</code></span>) – N by 3 matrix of query points at which winding number is evaluated.</li>
<li><p><strong>engine</strong> (<span><code class="docutils literal notranslate">string</code></span>) –</p>
<p>(optional) Winding number computing engine name:</p>
<ul>
<li><span><code class="docutils literal notranslate">auto</code></span>: use default engine (which is <span><code class="docutils literal notranslate">igl</code></span>).</li>
<li><span><code class="docutils literal notranslate">igl</code></span>: use libigl’s <a href="https://libigl.github.io/tutorial/#generalized-winding-number">generalized winding number</a>.</li>
<li><span><code class="docutils literal notranslate">fast_winding_number</code></span>: use code from <a href="http://www.dgp.toronto.edu/projects/fast-winding-numbers/">fast winding number</a> paper. It is faster than <span><code class="docutils literal notranslate">igl</code></span> but can be less accurate sometimes.</li>
</ul></li>
</ul></td>
</tr>
<tr>
<th>Returns:</th>
<td><p>A list of size N, represent the winding numbers at each query points in order.</p></td>
</tr>
</tbody>
</table>

## Slicing mesh[¶](#slicing-mesh)

`pymesh.``slice_mesh`(*mesh*, *direction*, *N*)[¶](#pymesh.slice_mesh)  
Slice a given 3D mesh N times along certain direciton.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – The mesh to be sliced.</li>
<li><strong>direction</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate">numpy.ndaray</code></span>) – Direction orthogonal to the slices.</li>
<li><strong>N</strong> (<em>int</em>) – Number of slices.</li>
</ul></td>
</tr>
<tr>
<th>Returns:</th>
<td><p>A list of N <a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a> objects, each representing a single slice.</p></td>
</tr>
</tbody>
</table>

## Distance to mesh query[¶](#distance-to-mesh-query)

`pymesh.``distance_to_mesh`(*mesh*, *pts*, *engine='auto'*)[¶](#pymesh.distance_to_mesh)  
Compute the distance from a set of points to a mesh.

<table>
<tbody>
<tr>
<th>Parameters:</th>
<td><ul>
<li><strong>mesh</strong> (<a href="api_mesh.html#pymesh.Mesh"><span><code class="sourceCode python xref py py-class docutils literal notranslate">Mesh</code></span></a>) – A input mesh.</li>
<li><strong>pts</strong> (<span><code class="sourceCode python xref py py-class docutils literal notranslate">numpy.ndarray</code></span>) – A <span><span><span><span>N</span><span>×</span><span>d</span> <span>i</span> <span>m</span></span></span><span></span></span> array of query points.</li>
<li><strong>engine</strong> (<span><code class="docutils literal notranslate">string</code></span>) – BVH engine name. Valid choices are “cgal”, “geogram”, “igl” if all dependencies are used. The default is “auto” where an available engine is automatically picked.</li>
</ul></td>
</tr>
<tr>
<th>Returns:</th>
<td><p>Three values are returned.</p>
<blockquote>
<ul>
<li><span><code class="docutils literal notranslate">squared_distances</code></span>: squared distances from each point to mesh.</li>
<li><span><code class="docutils literal notranslate">face_indices</code></span> : the closest face to each point.</li>
<li><dl>
<dt><span><code class="docutils literal notranslate">closest_points</code></span>: the point on mesh that is closest to each</dt>
<dd>
query point.
</dd>
</dl></li>
</ul>
</blockquote></td>
</tr>
</tbody>
</table>

[![Logo](_static/pymesh_logo.png)](index.html)

### Navigation

- [User Guide](user_guide.html)
- [PyMesh API Reference](api.html)
  - [Mesh Data Structure](api_mesh.html)
  - [Reading and Writing Meshes](api_meshio.html)
  - [Local Mesh Cleanup](api_local_mesh_cleanup.html)
  - [Procedural Mesh Generation](api_procedural_mesh_generation.html)
  - [Mesh Generation](api_mesh_generation.html)
  - [Geometry Processing Functions](#)
    - [Boolean opertions](#boolean-opertions)
    - [Convex hull](#convex-hull)
    - [Outer hull](#outer-hull)
    - [Mesh arrangement](#mesh-arrangement)
    - [Minkowski sum](#minkowski-sum)
    - [Subdivision](#subdivision)
    - [Winding number query](#winding-number-query)
    - [Slicing mesh](#slicing-mesh)
    - [Distance to mesh query](#distance-to-mesh-query)
  - [Finite Element Matrix Assembly](api_matrix_assembly.html)
  - [Sparse Linear System Solver](api_sparse_solver.html)
  - [Miscellaneous functions](api_misc.html)

### Related Topics

- [Documentation overview](index.html)
  - [PyMesh API Reference](api.html)
    - Previous: [Mesh Generation](api_mesh_generation.html)
    - Next: [Finite Element Matrix Assembly](api_matrix_assembly.html)

### Quick search

©2018, Qingnan Zhou. \| Powered by [Sphinx 1.7.9](http://sphinx-doc.org/) & [Alabaster 0.7.12](https://github.com/bitprophet/alabaster) \| [Page source](_sources/api_geometry_processing.rst.txt)

<!--
## Source links

- [Mesh](api_mesh.html#pymesh.Mesh)
- [Cork 3D boolean libary](https://github.com/gilbo/cork)
- [CGAL 3D boolean operations on Nef Polyhedra](http://doc.cgal.org/latest/Nef_3/index.html)
- [libigl’s 3D boolean support](https://github.com/libigl/libigl)
- [Clipper 2D boolean library](http://www.angusj.com/delphi/clipper.php)
- [Carve solid geometry library](https://code.google.com/p/carve/)
- [Qhull convext hull library](http://www.qhull.org/)
- [2D](https://doc.cgal.org/latest/Convex_hull_2/index.html)
- [3D](https://doc.cgal.org/latest/Convex_hull_3/index.html)
- [generalized winding number](https://libigl.github.io/tutorial/#generalized-winding-number)
- [fast winding number](http://www.dgp.toronto.edu/projects/fast-winding-numbers/)
- [index.html](index.html)
- [User Guide](user_guide.html)
- [PyMesh API Reference](api.html)
- [Mesh Data Structure](api_mesh.html)
- [Reading and Writing Meshes](api_meshio.html)
- [Local Mesh Cleanup](api_local_mesh_cleanup.html)
- [Procedural Mesh Generation](api_procedural_mesh_generation.html)
- [Mesh Generation](api_mesh_generation.html)
- [Finite Element Matrix Assembly](api_matrix_assembly.html)
- [Sparse Linear System Solver](api_sparse_solver.html)
- [Miscellaneous functions](api_misc.html)
- [Sphinx 1.7.9](http://sphinx-doc.org/)
- [Alabaster 0.7.12](https://github.com/bitprophet/alabaster)
- [Page source](_sources/api_geometry_processing.rst.txt)
-->
