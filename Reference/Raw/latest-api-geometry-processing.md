# Geometry Processing Functions[¶](#geometry-processing-functions)

## Boolean opertions[¶](#boolean-opertions)

`pymesh.boolean`

- *mesh_1*
- *mesh_2*
- *operation*
- *engine='auto'*
- *with_timing=False*
- *exact_mesh_file=None*

Perform boolean operations on input meshes.

| Field | Value |
|----|----|
| Parameters: | **mesh_1** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The first input mesh, M 1. ; **mesh_2** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The second input mesh, M 2. ; **operation** (`string`) – The name of the operation. Valid choices are: `intersection`: M 1∩M 2 ; `union`: M 1∪M 2 ; `difference`: M 1∖M 2 ; `symmetric_difference`: (M 1∖M 2)∪(M 2∖M 1) ; **engine** (`string`) – (optional) Boolean engine name. Valid engines include: `auto`: Using the default boolean engine (`igl` for 3D and `clipper` for 2D). This is the default. ; `cork`: [Cork 3D boolean libary](https://github.com/gilbo/cork) ; `cgal`: [CGAL 3D boolean operations on Nef Polyhedra](http://doc.cgal.org/latest/Nef_3/index.html) ; `corefinement`: The undocumented CGAL boolean function that does not use Nef Polyhedra. ; `igl`: [libigl’s 3D boolean support](https://github.com/libigl/libigl) ; `clipper`: [Clipper 2D boolean library](http://www.angusj.com/delphi/clipper.php) ; `carve`: [Carve solid geometry library](https://code.google.com/p/carve/) ; **with_timing** (`boolean`) – (optional) Whether to time the code. ; **exact_mesh_file** (`str`) – (optional) Filename to store the XML serialized exact output. |

Returns: The output mesh.

The following attributes are defined in the output mesh:

> - “source”: An array of 0s and 1s indicating which input mesh an output face comes from.
> - “source_face”: An array of indices, one per output face, into the concatenated faces of the input meshes.

While all solid geometry operations can be done as a sequence of binary boolean operations. It is beneficial sometimes to use [`pymesh.CSGTree`](#pymesh.CSGTree) for carrying out more complex operations.

class `pymesh.CSGTree`

- *tree*

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

`pymesh.convex_hull`

- *mesh*
- *engine='auto'*
- *with_timing=False*

Compute the convex hull of an input mesh.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The input mesh. ; **engine** (`string`) – (optional) Convex hull engine name. Valid names are: auto: Using the default engine. ; qhull: [Qhull convext hull library](http://www.qhull.org/) ; cgal: CGAL convex hull module (: [2D](https://doc.cgal.org/latest/Convex_hull_2/index.html), [3D](https://doc.cgal.org/latest/Convex_hull_3/index.html)) ; triangle: Triangle convex hull engine. ; tetgen: Tetgen convex hull engine. ; **with_timing** (`boolean`) – (optional) Whether to time the code |

Returns: The output mesh representing the convex hull. (and running time if with_timing is true.)

The following attributes are defined in the output mesh:

> - “source_vertex”: An array of source vertex indices into the input mesh.

## Outer hull[¶](#outer-hull)

`pymesh.compute_outer_hull`

- *mesh*
- *engine='auto'*
- *all_layers=False*

Compute the outer hull of the input mesh.

| Field | Value |
|----|----|
| Parameters: | **engine** (`str`) – (optional) Outer hull engine name. Valid engines are: `auto`: Using the default engine (`igl`). ; `igl`: [libigl’s outer hull support](https://github.com/libigl/libigl) ; **all_layers** (`bool`) – (optional) If true, recursively peel outer hull layers. |
| Returns: | If `all_layers` is false, just return the outer hull mesh. If `all_layers` is ture, return a recursively peeled outer hull: layers, from the outer most layer to the inner most layer. The following mesh attirbutes are defined in each outer hull mesh: `flipped`: A per-face attribute that is true if a face in outer hull is orientated differently comparing to its corresponding face in the input mesh. ; `face_sources`: A per-face attribute that specifies the index of the source face in the input mesh. |

## Mesh arrangement[¶](#mesh-arrangement)

`pymesh.partition_into_cells`

- *mesh*

Resolve all-intersections of the input mesh and extract cell partitions induced by the mesh. A cell-partition is subset of the ambient space where any pair of points belonging the partition can be connected by a curve without ever going through any mesh faces.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The input mesh. |

Returns: The output mesh with all intersections resolved and a list of meshes representing individual cells.

The following attributes are defined in the output mesh:

> - `source_face`: the original face index.
> - `patches`: the scalar field marking manifold patches (A set of connected faces connected by manifold edges).
> - `cells`: a per-face scalar field indicating the cell id on the positive side of each face.
> - `winding_number`: the scalar field indicating the piece-wise constant winding number of the cell on the positive side of each face.

## Minkowski sum[¶](#minkowski-sum)

`pymesh.minkowski_sum`

- *mesh*
- *path*

Perform Minkowski sum of a mesh with a poly-line.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – Input mesh. ; **path** (`numpy.ndarray`) – a n i m e s 3 matrix. Each row represents a node in the poly-line. |

Returns: A mesh representing the Minkowski sum of the inputs.

## Subdivision[¶](#subdivision)

`pymesh.subdivide`

- *mesh*
- *order=1*
- *method='simple'*

Subdivide the input mesh.

| Field | Value |
|----|----|
| Parameters: | **mesh** – Input triangle mesh. ; **order** – (optional) Subdivision order. ; **method** – (optional) Subdivision method. Choices are “simple” and “loop”. |
| Returns: | Returns the subdivided mesh. The per-face attribute “ori_face_index” tracks the original face index from the input mesh. |

## Winding number query[¶](#winding-number-query)

`pymesh.compute_winding_number`

- *mesh*
- *queries*
- *engine='auto'*

Compute winding number with respect to mesh at queries.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The mesh for which winding number is evaluated. ; **queries** (`numpy.ndarray`) – N by 3 matrix of query points at which winding number is evaluated. ; **engine** (`string`) – (optional) Winding number computing engine name: `auto`: use default engine (which is `igl`). ; `igl`: use libigl’s [generalized winding number](https://libigl.github.io/tutorial/#generalized-winding-number). ; `fast_winding_number`: use code from [fast winding number](http://www.dgp.toronto.edu/projects/fast-winding-numbers/) paper. It is faster than `igl` but can be less accurate sometimes. |
| Returns: | A list of size N, represent the winding numbers at each query points in order. |

## Slicing mesh[¶](#slicing-mesh)

`pymesh.slice_mesh`

- *mesh*
- *direction*
- *N*

Slice a given 3D mesh N times along certain direciton.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – The mesh to be sliced. ; **direction** (`numpy.ndaray`) – Direction orthogonal to the slices. ; **N** (*int*) – Number of slices. |
| Returns: | A list of N [`Mesh`](api_mesh.html#pymesh.Mesh) objects, each representing a single slice. |

## Distance to mesh query[¶](#distance-to-mesh-query)

`pymesh.distance_to_mesh`

- *mesh*
- *pts*
- *engine='auto'*

Compute the distance from a set of points to a mesh.

| Field | Value |
|----|----|
| Parameters: | **mesh** ([`Mesh`](api_mesh.html#pymesh.Mesh)) – A input mesh. ; **pts** (`numpy.ndarray`) – A N×d i m array of query points. ; **engine** (`string`) – BVH engine name. Valid choices are “cgal”, “geogram”, “igl” if all dependencies are used. The default is “auto” where an available engine is automatically picked. |
| Returns: | Three values are returned. `squared_distances`: squared distances from each point to mesh. ; `face_indices` : the closest face to each point. ; `closest_points`: the point on mesh that is closest to each: query point. |

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
