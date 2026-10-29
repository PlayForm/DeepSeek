[ Skip to main content ](https://design.gitlab.com/patterns/graph-canvas/#skipTarget)
# Graph canvas
Graph canvas is part of the [design system extended layer](https://design.gitlab.com/contribute/contributing) 🤝 Questions or feedback? Reach out to [#ux_coworking on Slack](https://gitlab.slack.com/channels/ux_coworking) or [@gitlab-com/gitlab-ux/designers on GitLab](https://gitlab.com/groups/gitlab-com/gitlab-ux/designers/-/group_members?with_inherited_permissions=exclude). 
## [Layout](https://design.gitlab.com/patterns/graph-canvas/#layout)
A graph canvas is a zoomable, pannable surface that renders nodes and their relationships. A graph reads in the direction of its layout. A left-to-right graph starts at the top-left of the canvas container and a top-to-bottom graph starts at the top-center. Keep the start of the graph clear so a user can orient themselves before anything else competes for attention.
The canvas container is divided into zones, and each kind of content has one home:
Graph canvas composition
  1. **Canvas container:** The region a user can pan and zoom.
  2. **Search, filter:** Search and/or filter options
  3. **Graph inset:** The padding between the outermost nodes and the edge of the canvas.
  4. **View controls:** Zoom and fit actions for the whole canvas.
  5. **Minimap:** A scaled-down rendering of the whole graph with an indicator for the visible viewport.
  6. **Legend slot:** Nothing by default. Use it for a legend when the canvas needs one.


Canvas-level actions that aren't navigation, for example a layout switch or an expand-to-full-screen action, belong in the page toolbar above the canvas rather than on the canvas container.
Content that describes a single node, such as its details or actions, doesn't belong in the canvas container. Open it in a [drawer](https://design.gitlab.com/components/drawer) or a [dynamic panel](https://design.gitlab.com/product-foundations/layout#panel-based-layout) so the canvas keeps its full extent.
### [Canvas container](https://design.gitlab.com/patterns/graph-canvas/#canvas-container)
The interactive region where a user pans and zooms the content is a [section container](https://design.gitlab.com/product-foundations/layout#section) with a dot grid background, which sets it apart from the page and gives a sense of motion when panning. It contains everything else in this section.
### [Search and filter](https://design.gitlab.com/patterns/graph-canvas/#search-and-filter)
[Search](https://design.gitlab.com/components/search) and [filter](https://design.gitlab.com/components/filter) controls are anchored to the top-left corner, `16px` (`spacing-scale.5`) from the nearest edges, so they sit at the start of the graph's reading direction. They act on the graph's content rather than its view: search locates a node, filter reduces which nodes are shown. Each is an [overlap container](https://design.gitlab.com/product-foundations/layout#overlap) that floats above the canvas container, and the graph inset is measured from their inner edge.
### [Graph inset](https://design.gitlab.com/patterns/graph-canvas/#graph-inset)
The graph inset is the minimum distance between any node and the canvas boundary. It gives the outermost nodes room to breathe and stops a node from sitting flush against an edge, where it reads as clipped.
  * The inset is `32px` (`spacing-scale.7`) on every side, the same value used to separate sections of content.
  * Where the view controls or the minimap sit, measure the inset from their inner edge rather than from the canvas edge. A node never renders beneath either of them when the graph is fit to view.
  * The inset applies when the graph is fit to view and on initial render. Once a user pans or zooms, nodes can move to the edge and beyond, which is expected.
  * When the graph is smaller than the available space, center it inside the inset rather than anchoring it to a corner.


Within the graph, spacing between nodes follows the [spacing scale](https://design.gitlab.com/product-foundations/spacing). Use `48px` (`spacing-scale.9`) between columns or rows of nodes in the flow direction, and `24px` (`spacing-scale.6`) between sibling nodes that share a column or row. The node itself is specified under [Node](https://design.gitlab.com/patterns/graph-canvas/#node).
### [View controls](https://design.gitlab.com/patterns/graph-canvas/#view-controls)
The view controls are anchored to the top-right corner, `16px` (`spacing-scale.5`) from the nearest edges, and stacked vertically, so they stay clear of the graph's reading direction and of the minimap. They're an [overlap container](https://design.gitlab.com/product-foundations/layout#overlap) that floats above the canvas container.
Use one vertical [button group](https://design.gitlab.com/components/button-group) of icon-only default buttons in this order, top to bottom:
  1. **Zoom in** : `search-plus` icon.
  2. **Zoom out** : `search-minus` icon.
  3. **Fit to view** : `maximize` icon. Centers the whole graph and zooms so it fits inside the graph inset. Fit to view never zooms above `100%`.
  4. **Reset zoom** : Shows the current zoom level as text, for example `100%`. Selecting it returns the canvas to `100%` without changing the pan position.


Zoom in and out step through `10%` increments between `10%` and `200%`. Every control has a tooltip that names the action and its keyboard shortcut, and is disabled at the end of its range.
### [Minimap](https://design.gitlab.com/patterns/graph-canvas/#minimap)
The minimap is anchored to the bottom-right corner, `16px` (`spacing-scale.5`) from the nearest edges. It renders every node at reduced scale and draws the current viewport as an outlined rectangle. Dragging the rectangle pans the canvas.
  * Default size is `160×96px`. Don't exceed a quarter of the canvas width.
  * Style it as an overlap container: `background.color.overlap`, `border.color.default`, and `gl-shadow-sm`.
  * Show it only when the whole graph doesn't fit in the viewport at the current zoom. A graph that fits doesn't need an overview.
  * Hide it when the canvas container is narrower than `480px`. Use a container query rather than a media query, so the minimap responds to the canvas, not the viewport.


### [Canvas behaviors](https://design.gitlab.com/patterns/graph-canvas/#canvas-behaviors)
#### [Initial view](https://design.gitlab.com/patterns/graph-canvas/#initial-view)
On first render, fit the graph to view if that results in a zoom of `50%` or more. Otherwise render at `50%` anchored to the start of the graph, so the first nodes are legible and the minimap shows the rest.
#### [Responsive adaptation](https://design.gitlab.com/patterns/graph-canvas/#responsive-adaptation)
The canvas container keeps a minimum height of `320px`. Below `480px` container width, hide the minimap and reduce the view controls to zoom in, zoom out, and fit to view. The graph inset doesn't shrink; a smaller canvas shows less of the graph rather than crowding its edges.
#### [Empty and loading states](https://design.gitlab.com/patterns/graph-canvas/#empty-and-loading-states)
When there are no nodes to show, hide the view controls and the minimap and show the [empty state](https://design.gitlab.com/patterns/empty-states) in the center of the canvas container. Don't show anything that invites navigation when there's nothing to navigate. While the graph loads, keep the canvas container at its final size so the navigation aids don't jump into place.
#### [Focus and stacking](https://design.gitlab.com/patterns/graph-canvas/#focus-and-stacking)
The canvas container is a positioned element that establishes its own stacking context. The view controls and minimap use `gl-z-1` inside that context and are never raised above the application chrome. Keyboard focus moves through the canvas container, then the view controls, then the minimap, matching their position in the DOM.
## [Guidelines](https://design.gitlab.com/patterns/graph-canvas/#guidelines)
### [When to use](https://design.gitlab.com/patterns/graph-canvas/#when-to-use)
  * Communicating relationships between entities as the primary information (for example, pipeline stages and jobs, or workflow steps).
  * Providing a more visual representation when the number and complexity of items make a linear list insufficient.
  * Helping a user understand structure through spatial reasoning (for example, logical branching compared to sequential execution).


### [When not to use](https://design.gitlab.com/patterns/graph-canvas/#when-not-to-use)
  * Monitoring the status of things rather than helping a user understand how things relate. A graph is usually the wrong call even when the underlying data has a graph shape. A list with a status column is always faster to scan, filter, and make accessible than a canvas.


## [Visualization](https://design.gitlab.com/patterns/graph-canvas/#visualization)
### [Sequence](https://design.gitlab.com/patterns/graph-canvas/#sequence)
A graph reads in one direction. Choose the direction that matches the data and keep it consistent across the whole canvas.
#### [Horizontal](https://design.gitlab.com/patterns/graph-canvas/#horizontal)
Use for sequential flows such as CI/CD pipelines and workflow builders, where execution order reads naturally horizontally from start to end (default being left to right).
Left-to-right
#### [Vertical](https://design.gitlab.com/patterns/graph-canvas/#vertical)
Use when hierarchy is the primary relationship (for example, dependency trees).
Default reading direction is from top to bottom.
Top-to-bottom
Refer to the [Layout](https://design.gitlab.com/patterns/graph-canvas/#layout) section above to understand where the graph sits on the canvas, how far it stays from the boundary, and where the minimap and view controls live.
A node is the unit a user reads, compares, and acts on. Every node kind shares the same structure so the graph reads as one system:
  * **Tile** : A rounded square that carries the node's state through a status color. Keep the tile the same size for every node kind so the graph reads as a grid.
  * **Status icon** : Sits centered inside the tile and pairs with the status color, so state is never communicated by color alone.
  * **Caption** : A single line directly under the tile that names the node. Truncate a long name with an ellipsis and expose the full name in a [tooltip](https://design.gitlab.com/components/tooltip).
  * **Secondary line** : An optional single line under the caption for one supporting detail. For example, an environment name or a change request number. Use only one per node kind so nodes stay scannable.


### [Connectors](https://design.gitlab.com/patterns/graph-canvas/#connectors)
A connector is a direct line between two nodes. Route a connector orthogonally, not as a free curve. Connectors that fan out from one node or fan in to one node share a single run between the two columns, so a busy graph reads as a set of lanes rather than a tangle.
### [Grouping box](https://design.gitlab.com/patterns/graph-canvas/#grouping-box)
Expanded
Collapsed
Use a grouping box when nodes belong to a distinct phase or tier within a larger flow and a user needs to reason about that phase as a unit, not just as individual nodes.
  * **Boundary** : A subtle enclosure that sets the group apart from the canvas without competing with the nodes inside it.
  * **Label** : Names the phase along the top edge of the boundary.
  * **Expand and collapse control** : Lets a user reduce the group to a single node and restore it. Use the [collapse](https://design.gitlab.com/components/collapse) component.
  * **Collapsed summary node** : Represents the whole group as one node. Its state reflects the worst status among its members, so a problem inside a collapsed group stays visible.


This section describes what each element communicates and how it behaves. Dimensions and design tokens for these elements are layout concerns, and belong with [positioning canvas overlays](https://design.gitlab.com/product-foundations/layout#position-canvas-overlays) in the layout foundations rather than in this pattern.
## Related
  * [Duo agents and flows](https://design.gitlab.com/patterns/duo-agents-and-flows)


Last updated at: Wednesday, October 28, 2026 at 4:19 PM
