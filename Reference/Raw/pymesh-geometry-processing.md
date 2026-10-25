# Geometry Processing Functions[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#geometry-processing-functions "Permalink to this headline")
## Boolean opertions[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#boolean-opertions "Permalink to this headline") 

`pymesh.``boolean`(_mesh_1_ , _mesh_2_ , _operation_ , _engine='auto'_ , _with_timing=False_ , _exact_mesh_file=None_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.boolean "Permalink to this definition") 
    
Perform boolean operations on input meshes.  
| Parameters:  | 
  * **mesh_1** () – The first input mesh, .
  * **mesh_2** () – The second input mesh, .
  * **operation** (`string`) – The name of the operation. Valid choices are:
    * `intersection`: 
    * `union`: 
    * `difference`: 
    * `symmetric_difference`: (∖)∪(∖)
  * **engine** (`string`) – (optional) Boolean engine name. Valid engines include:
    * `auto`: Using the default boolean engine (`igl` for 3D and `clipper` for 2D). This is the default.
    * `cork`: [Cork 3D boolean libary](https://github.com/gilbo/cork)
    * `cgal`: [CGAL 3D boolean operations on Nef Polyhedra](http://doc.cgal.org/latest/Nef_3/index.html)
    * `corefinement`: The undocumented CGAL boolean function that does not use Nef Polyhedra.
    * `igl`: [libigl’s 3D boolean support](https://github.com/libigl/libigl)
    * `clipper`: [Clipper 2D boolean library](http://www.angusj.com/delphi/clipper.php)
    * `carve`: [Carve solid geometry library](https://code.google.com/p/carve/)
  * **with_timing** (`boolean`) – (optional) Whether to time the code.
  * **exact_mesh_file** (`str`) – (optional) Filename to store the XML serialized exact output.

 |  
| --- | --- |  
Returns: The output mesh.
The following attributes are defined in the output mesh:
>   * “source”: An array of 0s and 1s indicating which input mesh an output face comes from.
>   * “source_face”: An array of indices, one per output face, into the concatenated faces of the input meshes.
> 

While all solid geometry operations can be done as a sequence of binary boolean operations. It is beneficial sometimes to use [`pymesh.CSGTree`](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.CSGTree "pymesh.CSGTree") for carrying out more complex operations. 

_class_`pymesh.``CSGTree`(_tree_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.CSGTree "Permalink to this definition") 
    
Contructive Solid Geometry Tree.
Perhaps the best way of describing supported operations is using context free grammar:
  * `mesh` operation: This operation is always a leaf node of the tree.

```
>>> tree = pymesh.CSGTree({"mesh": mesh});

```

  * `union` operation:

```
>>> tree = pymesh.CSGTree({"union":
...         [TREE_1, TREE_2, ..., TREE_N]
...     });

```

  * `intersection` operations:

```
>>> tree = pymesh.CSGTree({"intersection":
...         [TREE_1, TREE_2, ..., TREE_N]
...     });

```

  * `difference` operations:

```
>>> tree = pymesh.CSGTree({"difference":
...         [TREE_1, TREE_2]
...     });

```

  * `symmetric_difference` operations:

```
>>> tree = pymesh.CSGTree({"symmetric_difference":
...         [TREE_1, TREE_2]
...     });

```



Where `TREE_X` could be any of the nodes defined above.
A tree can be build up incrementally:

```
>>> left_tree = pymesh.CSGTree({"mesh": mesh_1});
>>> right_tree = pymesh.CSGTree({"mesh": mesh_2});
>>> tree = pymesh.CSGTree({"union": [left_tree, right_tree]});
>>> mesh = tree.mesh;

```

Or constructed from a dict:

```
>>> tree = pymesh.CSGTree({"union":
...         [{"mesh": mesh_1}, {"mesh": mesh_2}]
...     });
>>> mesh = tree.mesh

```

## Convex hull[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#convex-hull "Permalink to this headline") 

`pymesh.``convex_hull`(_mesh_ , _engine='auto'_ , _with_timing=False_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.convex_hull "Permalink to this definition") 
    
Compute the convex hull of an input mesh.  
| Parameters:  | 
  * **mesh** () – The input mesh.
  * **engine** (`string`) – (optional) Convex hull engine name. Valid names are:
    * auto: Using the default engine.
    * qhull: [Qhull convext hull library](http://www.qhull.org/)
    * 

cgal: CGAL convex hull module (

    * triangle: Triangle convex hull engine.
    * tetgen: Tetgen convex hull engine.
  * **with_timing** (`boolean`) – (optional) Whether to time the code

 |  
| --- | --- |  
Returns: The output mesh representing the convex hull. (and running time if with_timing is true.)
The following attributes are defined in the output mesh:
>   * “source_vertex”: An array of source vertex indices into the input mesh.
> 

## Outer hull[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#outer-hull "Permalink to this headline") 

`pymesh.``compute_outer_hull`(_mesh_ , _engine='auto'_ , _all_layers=False_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.compute_outer_hull "Permalink to this definition") 
    
Compute the outer hull of the input mesh.  
| Parameters:  | 
  * **engine** (`str`) – (optional) Outer hull engine name. Valid engines are:
    * `auto`: Using the default engine (`igl`).
    * `igl`: [libigl’s outer hull support](https://github.com/libigl/libigl)
  * **all_layers** (`bool`) – (optional) If true, recursively peel outer hull layers.

 |  
| --- | --- |  
| Returns:  |  If `all_layers` is false, just return the outer hull mesh. 

If `all_layers` is ture, return a recursively peeled outer hull
     layers, from the outer most layer to the inner most layer. The following mesh attirbutes are defined in each outer hull mesh:
  * `flipped`: A per-face attribute that is true if a face in outer hull is orientated differently comparing to its corresponding face in the input mesh.
  * `face_sources`: A per-face attribute that specifies the index of the source face in the input mesh.

 |  
## Mesh arrangement[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#mesh-arrangement "Permalink to this headline") 

`pymesh.``partition_into_cells`(_mesh_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.partition_into_cells "Permalink to this definition") 
    
Resolve all-intersections of the input mesh and extract cell partitions induced by the mesh. A cell-partition is subset of the ambient space where any pair of points belonging the partition can be connected by a curve without ever going through any mesh faces.  
| Parameters:  |  **mesh** () – The input mesh.  |  
| --- | --- |  
Returns: The output mesh with all intersections resolved and a list of meshes representing individual cells.
The following attributes are defined in the output mesh:
>   * `source_face`: the original face index.
>   * `patches`: the scalar field marking manifold patches (A set of connected faces connected by manifold edges).
>   * `cells`: a per-face scalar field indicating the cell id on the positive side of each face.
>   * `winding_number`: the scalar field indicating the piece-wise constant winding number of the cell on the positive side of each face.
> 

## Minkowski sum[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#minkowski-sum "Permalink to this headline") 

`pymesh.``minkowski_sum`(_mesh_ , _path_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.minkowski_sum "Permalink to this definition") 
    
Perform Minkowski sum of a mesh with a poly-line.  
| Parameters:  | 
  * **mesh** () – Input mesh.
  * **path** (`numpy.ndarray`) – a matrix. Each row represents a node in the poly-line.

 |  
| --- | --- |  
Returns: A mesh representing the Minkowski sum of the inputs.
## Subdivision[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#subdivision "Permalink to this headline") 

`pymesh.``subdivide`(_mesh_ , _order=1_ , _method='simple'_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.subdivide "Permalink to this definition") 
    
Subdivide the input mesh.  
| Parameters:  | 
  * **mesh** – Input triangle mesh.
  * **order** – (optional) Subdivision order.
  * **method** – (optional) Subdivision method. Choices are “simple” and “loop”.

 |  
| --- | --- |  
| Returns:  |  Returns the subdivided mesh. The per-face attribute “ori_face_index” tracks the original face index from the input mesh.  |  
## Winding number query[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#winding-number-query "Permalink to this headline") 

`pymesh.``compute_winding_number`(_mesh_ , _queries_ , _engine='auto'_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.compute_winding_number "Permalink to this definition") 
    
Compute winding number with respect to mesh at queries.  
| Parameters:  | 
  * **mesh** () – The mesh for which winding number is evaluated.
  * **queries** (`numpy.ndarray`) – N by 3 matrix of query points at which winding number is evaluated.
  * **engine** (`string`) – (optional) Winding number computing engine name:
    * `auto`: use default engine (which is `igl`).
    * `igl`: use libigl’s [generalized winding number](https://libigl.github.io/tutorial/#generalized-winding-number).
    * `fast_winding_number`: use code from [fast winding number](http://www.dgp.toronto.edu/projects/fast-winding-numbers/) paper. It is faster than `igl` but can be less accurate sometimes.

 |  
| --- | --- |  
| Returns:  |  A list of size N, represent the winding numbers at each query points in order.  |  
## Slicing mesh[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#slicing-mesh "Permalink to this headline") 

`pymesh.``slice_mesh`(_mesh_ , _direction_ , _N_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.slice_mesh "Permalink to this definition") 
    
Slice a given 3D mesh N times along certain direciton.  
| Parameters:  | 
  * **mesh** () – The mesh to be sliced.
  * **direction** (`numpy.ndaray`) – Direction orthogonal to the slices.
  * **N** (_int_) – Number of slices.

 |  
| --- | --- |  
| Returns:  |  A list of N objects, each representing a single slice.  |  
## Distance to mesh query[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#distance-to-mesh-query "Permalink to this headline") 

`pymesh.``distance_to_mesh`(_mesh_ , _pts_ , _engine='auto'_)[¶](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#pymesh.distance_to_mesh "Permalink to this definition") 
    
Compute the distance from a set of points to a mesh.  
| Parameters:  | 
  * **mesh** () – A input mesh.
  * **pts** (`numpy.ndarray`) – A array of query points.
  * **engine** (`string`) – BVH engine name. Valid choices are “cgal”, “geogram”, “igl” if all dependencies are used. The default is “auto” where an available engine is automatically picked.

 |  
| --- | --- |  
| Returns:  |  Three values are returned.
>   * `squared_distances`: squared distances from each point to mesh.
>   * `face_indices` : the closest face to each point.
>   * 

`closest_points`: the point on mesh that is closest to each
    query point.
> 

 |  
### Navigation
  * [PyMesh API Reference](https://pymesh.readthedocs.io/en/latest/api.html)
    * [Mesh Data Structure](https://pymesh.readthedocs.io/en/latest/api_mesh.html)
    * [Reading and Writing Meshes](https://pymesh.readthedocs.io/en/latest/api_meshio.html)
    * [Procedural Mesh Generation](https://pymesh.readthedocs.io/en/latest/api_procedural_mesh_generation.html)
    * [Geometry Processing Functions](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html)
      * [Winding number query](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#winding-number-query)
      * [Distance to mesh query](https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html#distance-to-mesh-query)
    * [Finite Element Matrix Assembly](https://pymesh.readthedocs.io/en/latest/api_matrix_assembly.html)
    * [Sparse Linear System Solver](https://pymesh.readthedocs.io/en/latest/api_sparse_solver.html)
    * [Miscellaneous functions](https://pymesh.readthedocs.io/en/latest/api_misc.html)


### Related Topics
  * [Documentation overview](https://pymesh.readthedocs.io/en/latest/index.html)
    * [PyMesh API Reference](https://pymesh.readthedocs.io/en/latest/api.html)
      * Previous: [Mesh Generation](https://pymesh.readthedocs.io/en/latest/api_mesh_generation.html "previous chapter")
      * Next: [Finite Element Matrix Assembly](https://pymesh.readthedocs.io/en/latest/api_matrix_assembly.html "next chapter")


### Quick search
©2018, Qingnan Zhou. | Powered by [Sphinx 1.7.9](http://sphinx-doc.org/) & [Alabaster 0.7.12](https://github.com/bitprophet/alabaster) | [Page source](https://pymesh.readthedocs.io/en/latest/_sources/api_geometry_processing.rst.txt)
