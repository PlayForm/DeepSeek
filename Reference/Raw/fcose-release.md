###  Cytoscape.js News & tutorials
# Cytoscape.js-fcose 2.0.0 released
fCoSE 2.0.0 has been released. This release
  * adds support for user-specified placement constraints,
  * allows per-element values for some layout options, and
  * fixes miscellaneous bugs.


### Constraint support
fCoSE now supports user-specified placement constraints as well as its full support for compound graphs. These constraints may be defined for simple nodes. Supported constraint types are:
  * **Fixed node constraint:** The user may provide _exact_ desired positions for a set of nodes called _fixed nodes_.

An example of fixed node constraints
  * **Alignment constraint:** This constraint aims to align two or more nodes (with respect to their centers) vertically or horizontally.

An example of alignment constraints
  * **Relative placement constraint:** The user may constrain the position of a node relative to another node in either vertical or horizontal direction.

An example of relative placement constraints
These constraints can also be added _incrementally_ on a given layout while maintaining the user’s _mental map_.
An example of adding constraints incrementally
A demo page can be accessed [here](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html) to try out the layout interactively. A series of videos showing fCoSE layout in action is available in [YouTube](https://youtube.com/playlist?list=PLJA9by_crwfaCK6gkAMIQ8OPp-k2NOi2H).
### Per-element values for layout options
fCoSE now also supports per-element values for `nodeRepulsion`, `idealEdgeLength` and `edgeElasticity` options via functions. This feature gives more flexibility to the users while laying out their graphs.
An example of a layout that uses edge weights as the ideal edge length
Please report any feature request or bug report about fCoSE [here](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/issues/new).
Thank you for using Cytoscape.js.
