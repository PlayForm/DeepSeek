# ELK Layered  
| Property  | Value  |  
| --- | --- |  
| _Identifier:_  | `org.eclipse.elk.layered`  |  
| _Meta Data Provider:_  | `options.LayeredMetaDataProvider`  |  
## Description
Layer-based algorithm provided by the Eclipse Layout Kernel. Arranges as many edges as possible into one direction by placing nodes into subsequent layers. This implementation supports different routing styles (straight, orthogonal, splines); if orthogonal routing is selected, arbitrary port constraints are respected, thus enabling the layout of block diagrams such as actor-oriented models or circuit schematics. Furthermore, full layout of compound graphs with cross-hierarchy edges is supported when the respective option is activated on the top level.
## Category: Layered
The layer-based method was introduced by Sugiyama, Tagawa and Toda in 1981. It emphasizes the direction of edges by pointing as many edges as possible into the same direction. The nodes are arranged in layers, which are sometimes called “hierarchies”, and then reordered such that the number of edge crossings is minimized. Afterwards, concrete coordinates are computed for the nodes and edge bend points.
## Supported Graph Features  
| Name  | Description  |  
| --- | --- |  
| Self Loops  | Edges connecting a node with itself.  |  
| Inside Self Loops  | Self-loops routed through a node instead of around it.  |  
| Multi Edges  | Multiple edges with the same source and target node.  |  
| Edge Labels  | Labels that are associated with edges.  |  
| Ports  | Edges are connected to nodes over ports.  |  
| Compound  | Edges that connect nodes from different hierarchy levels and are incident to compound nodes.  |  
| Clusters  | Edges that connect nodes from different clusters, but not the cluster parent nodes.  |  
## Supported Options  
| Option  | Default Value  |  
| --- | --- |  
| [Activate Inside Self Loops](https://eclipse.dev/elk/reference/options/org-eclipse-elk-insideSelfLoops-activate.html)  | `false`  |  
| [Add Unnecessary Bendpoints](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html)  | `false`  |  
| [Additional Port Space](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-portsSurrounding.html)  | `new ElkMargin(0)`  |  
| [Additional Wrapped Edges Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-additionalEdgeSpacing.html)  |  
| `Alignment.AUTOMATIC`  |  
| [Allow Non-Flow Ports To Switch Sides](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-allowNonFlowPortsToSwitchSides.html)  | `false`  |  
| `1.6f`  |  
| `EdgeStraighteningStrategy.IMPROVE_STRAIGHTNESS`  |  
| `FixedAlignment.NONE`  |  
| `false`  |  
| [Comment Comment Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-commentComment.html)  |  
| [Comment Node Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-commentNode.html)  |  
| `20f`  |  
| [Connected Components Compaction](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-connectedComponents.html)  | `false`  |  
| `OrderingStrategy.NONE`  |  
| [Consider Model Order for Components](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-components.html)  | `ComponentOrderingStrategy.NONE`  |  
| `false`  |  
| `ContentAlignment.topLeft()`  |  
| [Correction Factor for Wrapping](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-correctionFactor.html)  | `1.0`  |  
| [Crossing Counter Node Order Influence](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterNodeInfluence.html)  |  
| [Crossing Counter Port Order Influence](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterPortInfluence.html)  |  
| [Crossing Minimization Enforced Group Orders](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmEnforcedGroupOrders.html)  | `#[1, 2, 6, 7, 10, 11]`  |  
| [Crossing Minimization Group Ordering Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmGroupOrderStrategy.html)  | `GroupOrderStrategy.ONLY_WITHIN_GROUP`  |  
| [Crossing Minimization Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-strategy.html)  | `CrossingMinimizationStrategy.LAYER_SWEEP`  |  
| `CuttingStrategy.MSD`  |  
| [Cycle Breaking Group Ordering Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbGroupOrderStrategy.html)  | `GroupOrderStrategy.ONLY_WITHIN_GROUP`  |  
| [Cycle Breaking Preferred Source Id](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredSourceId.html)  | `<not defined>`  |  
| [Cycle Breaking Preferred Target Id](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredTargetId.html)  | `<not defined>`  |  
| [Cycle Breaking Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html)  | `CycleBreakingStrategy.GREEDY`  |  
| `false`  |  
| `Direction.UNDEFINED`  |  
| `DirectionCongruency.READING_DIRECTION`  |  
 |  
| [Distance Penalty When Improving Cuts ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-multiEdge-distancePenalty.html)  | `2.0`  |  
| [Edge Center Label Placement Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeLabels-centerLabelPlacementStrategy.html)  | `CenterEdgeLabelPlacementStrategy.MEDIAN_LAYER`  |  
| [Edge Edge Between Layer Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-edgeEdgeBetweenLayers.html)  |  
| [Edge Label Placement](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edgeLabels-placement.html)  | `EdgeLabelPlacement.CENTER`  |  
| [Edge Label Side Selection](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeLabels-sideSelection.html)  | `EdgeLabelSideSelection.SMART_DOWN`  |  
 |  
| [Edge Node Between Layers Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-edgeNodeBetweenLayers.html)  |  
 |  
| `EdgeRouting.ORTHOGONAL`  |  
 |  
 |  
| [Favor Straight Edges Over Balancing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html)  | `<not defined>`  |  
| `false`  |  
| `false`  |  
| [Force Node Model Order](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-forceNodeModelOrder.html)  | `false`  |  
| [Generate Position and Layer IDs](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-generatePositionAndLayerIds.html)  | `false`  |  
| [Graph Wrapping Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-strategy.html)  | `WrappingStrategy.OFF`  |  
| [Greedy Switch Activation Threshold](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-activationThreshold.html)  |  
| [Greedy Switch Crossing Minimization](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-type.html)  | `GreedySwitchType.TWO_SIDED`  |  
| [Greedy Switch Crossing Minimization (hierarchical)](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical-type.html)  | `GreedySwitchType.OFF`  |  
| [Group ID of the Node Type](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cycleBreakingId.html)  |  
| [Group ID of the Node Type](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-crossingMinimizationId.html)  |  
| [Group ID of the Node Type](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-componentGroupId.html)  |  
| [Hierarchical Sweepiness](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-hierarchicalSweepiness.html)  | `0.1`  |  
| `HierarchyHandling.INHERIT`  |  
| [High Degree Node Maximum Tree Height](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-treeHeight.html)  |  
| [High Degree Node Threshold](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-threshold.html)  |  
| [High Degree Node Treatment](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-treatment.html)  | `false`  |  
| [Horizontal spacing between Label and Port](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelPortHorizontal.html)  |  
| `false`  |  
| `true`  |  
| `true`  |  
| [In Layer Predecessor of](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerPredOf.html)  | `null`  |  
| `null`  |  
| `<not defined>`  |  
| `false`  |  
| `false`  |  
| `false`  |  
| [Interactive Reference Point](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-interactiveReferencePoint.html)  | `InteractiveReferencePoint.CENTER`  |  
| `new KVectorChain()`  |  
 |  
 |  
| `Integer.MAX_VALUE`  |  
| [Layer Choice Constraint](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-layerChoiceConstraint.html)  | `null`  |  
| `LayerConstraint.NONE`  |  
 |  
| [Layer Unzipping Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-strategy.html)  | `LayerUnzippingStrategy.NONE`  |  
| `<not defined>`  |  
| `false`  |  
| [Linear Segments Deflection Dampening](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-linearSegments-deflectionDampening.html)  | `0.3`  |  
| [Long Edge Ordering Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-longEdgeStrategy.html)  | `LongEdgeOrderingStrategy.DUMMY_NODE_OVER`  |  
| [Manually Specified Cuts](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-cutting-cuts.html)  | `<not defined>`  |  
| `new ElkMargin()`  |  
| [Max Node Promotion Iterations](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-nodePromotion-maxIterations.html)  |  
| `false`  |  
| [Merge Hierarchy-Crossing Edges](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-mergeHierarchyEdges.html)  | `true`  |  
| [Minimize Edge Length Heuristic](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-minimizeEdgeLength.html)  | `false`  |  
 |  
| `false`  |  
| `false`  |  
| `<not defined>`  |  
| [Node Flexibility Default](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-default.html)  | `NodeFlexibility.NONE`  |  
| [Node Flexibility Recompute Node Placement](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-recomputeNodePlacement.html)  | `null`  |  
| `new ElkPadding(5)`  |  
| [Node Label Placement](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeLabels-placement.html)  | `NodeLabelPlacement.fixed()`  |  
| [Node Layering Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-strategy.html)  | `LayeringStrategy.NETWORK_SIMPLEX`  |  
| [Node Node Between Layers Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html)  |  
| [Node Placement Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html)  | `NodePlacementStrategy.BRANDES_KOEPF`  |  
| [Node Promotion Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-nodePromotion-strategy.html)  | `NodePromotionStrategy.NONE`  |  
| [Node Self Loop Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-nodeSelfLoop.html)  |  
| [Node Size Constraints](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeSize-constraints.html)  | `EnumSet.noneOf(SizeConstraint)`  |  
| `new KVector(0, 0)`  |  
| `EnumSet.of(SizeOptions.DEFAULT_MINIMUM_SIZE)`  |  
 |  
| `new ElkPadding(12)`  |  
| `PortAlignment.JUSTIFIED`  |  
| [Port Alignment (East)](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-east.html)  | `<not defined>`  |  
| [Port Alignment (North)](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-north.html)  | `<not defined>`  |  
| [Port Alignment (South)](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-south.html)  | `<not defined>`  |  
| [Port Alignment (West)](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-west.html)  | `<not defined>`  |  
| `<not defined>`  |  
 |  
| `PortConstraints.UNDEFINED`  |  
| `<not defined>`  |  
| [Port Label Placement](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-placement.html)  | `PortLabelPlacement.outside()`  |  
| [Port Labels Next to Port](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-nextToPortIfPossible.html)  | `false`  |  
| `PortSide.UNDEFINED`  |  
| [Port Sorting Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-portSortingStrategy.html)  | `PortSortingStrategy.INPUT_ORDER`  |  
 |  
| `<not defined>`  |  
| [Position Choice Constraint](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-positionChoiceConstraint.html)  | `null`  |  
 |  
| [Post Compaction Constraint Calculation](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-postCompaction-constraints.html)  | `ConstraintCalculationStrategy.SCANLINE`  |  
| [Post Compaction Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-postCompaction-strategy.html)  | `GraphCompactionStrategy.NONE`  |  
 |  
 |  
| [Reset Alternation on Long Edges](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-resetOnLongEdges.html)  | `true`  |  
| [Self-Loop Distribution](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopDistribution.html)  | `SelfLoopDistributionStrategy.NORTH`  |  
| `SelfLoopOrderingStrategy.STACKED`  |  
| [Semi-Interactive Crossing Minimization](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html)  | `false`  |  
| [Separate Connected Components](https://eclipse.dev/elk/reference/options/org-eclipse-elk-separateConnectedComponents.html)  | `true`  |  
 |  
| [Sloped Edge Zone Width](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-polyline-slopedEdgeZoneWidth.html)  | `2.0`  |  
| [Sloppy Spline Layer Spacing Factor](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-splines-sloppy-layerSpacingFactor.html)  | `0.2`  |  
| `<not defined>`  |  
| `SplineRoutingMode.SLOPPY`  |  
| [Straightness Priority](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-priority-straightness.html)  |  
 |  
| [Topdown Hierarchical Node Aspect Ratio](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-hierarchicalNodeAspectRatio.html)  | `1.414`  |  
| [Topdown Hierarchical Node Width](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-hierarchicalNodeWidth.html)  | `150`  |  
| `false`  |  
| `TopdownNodeTypes.HIERARCHICAL_NODE`  |  
| [Topdown Scale Factor](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-scaleFactor.html)  |  
| [Treat Port Labels as Group](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-treatAsGroup.html)  | `true`  |  
| [Unzipping Layer Split](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-layerSplit.html)  |  
| [Upper Bound On Width [MinWidth Layerer]](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-minWidth-upperBoundOnWidth.html)  |  
| [Upper Layer Estimation Scaling Factor [MinWidth Layerer]](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-minWidth-upperLayerEstimationScalingFactor.html)  |  
| [Valid Indices for Wrapping](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-validify-forbiddenIndices.html)  | `<not defined>`  |  
| [Validification Strategy](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-validify-strategy.html)  | `ValidifyStrategy.GREEDY`  |  
| [Vertical spacing between Label and Port](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelPortVertical.html)  |  
[
  * Algorithms  ](https://eclipse.dev/elk/reference/algorithms.html) [
  * Draw2D Layout  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-conn-gmf-layouter-Draw2D.html) [
  * ELK Box  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-box.html) [
  * ELK DisCo  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-disco.html) [
  * ELK Fixed  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-fixed.html) [
  * ELK Force  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-force.html) [
  * ELK Layered  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html) [
  * ELK Mr. Tree  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-mrtree.html) [
  * ELK Radial  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-radial.html) [
  * ELK Randomizer  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-random.html) [
  * ELK Rectangle Packing  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-rectpacking.html) [
  * ELK SPOrE Compaction  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-sporeCompaction.html) [
  * ELK SPOrE Overlap Removal  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-sporeOverlap.html) [
  * ELK Stress  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-stress.html) [
  * ELK Top-down Packing  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-topdownpacking.html) [
  * ELK VertiFlex  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-vertiflex.html) [
  * Graphviz Circo  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-graphviz-circo.html) [
  * Graphviz Dot  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-graphviz-dot.html) [
  * Graphviz FDP  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-graphviz-fdp.html) [
  * Graphviz Neato  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-graphviz-neato.html) [
  * Graphviz Twopi  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-graphviz-twopi.html) [
  * Libavoid  ](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-alg-libavoid.html) [
  * Layout Options  ](https://eclipse.dev/elk/reference/options.html) [
  * Activate Inside Self Loops  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-insideSelfLoops-activate.html) [
  * Adapt Port Positions  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-adaptPortPositions.html) [
  * Add Unnecessary Bendpoints  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html) [
  * Additional Port Space  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-portsSurrounding.html) [
  * Additional Wedge Space  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-rotation-computeAdditionalWedgeSpace.html) [
  * Additional Wrapped Edges Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-additionalEdgeSpacing.html) [
  * Alignment  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alignment.html) [
  * Allow Non-Flow Ports To Switch Sides  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-allowNonFlowPortsToSwitchSides.html) [
  * Angle Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-anglePenalty.html) [
  * Animate  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-animate.html) [
  * Animation Time Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-animTimeFactor.html) [
  * Annulus Wedge Criteria  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-wedgeCriteria.html) [
  * Aspect Ratio  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-aspectRatio.html) [
  * Bend Points  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-bendPoints.html) [
  * BK Edge Straightening  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-bk-edgeStraightening.html) [
  * BK Fixed Alignment  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-bk-fixedAlignment.html) [
  * Box Layout Mode  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-box-packingMode.html) [
  * Center On Root  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-centerOnRoot.html) [
  * Child Area Height  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-childAreaHeight.html) [
  * Child Area Width  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-childAreaWidth.html) [
  * Cluster Crossing Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-clusterCrossingPenalty.html) [
  * Comment Box  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-commentBox.html) [
  * Comment Comment Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-commentComment.html) [
  * Comment Node Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-commentNode.html) [
  * Compaction  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-compactor.html) [
  * Compaction iterations  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-packing-compaction-iterations.html) [
  * Compaction Step Size  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-compactionStepSize.html) [
  * Compaction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-compaction-compactionStrategy.html) [
  * Compaction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-packing-strategy.html) [
  * Components Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-componentComponent.html) [
  * Concentrate Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-concentrate.html) [
  * Connected Components Compaction  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-connectedComponents.html) [
  * Connected Components Compaction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-disco-componentCompaction-strategy.html) [
  * Connected Components Layout Algorithm  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-disco-componentCompaction-componentLayoutAlgorithm.html) [
  * Consider Model Order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-strategy.html) [
  * Consider Model Order for Components  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-components.html) [
  * Consider node model order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-vertiflex-considerNodeModelOrder.html) [
  * Consider Port Order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-portModelOrder.html) [
  * Content Alignment  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-contentAlignment.html) [
  * Correction Factor for Wrapping  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-correctionFactor.html) [
  * Cost Function for Spanning Tree  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-processingOrder-spanningTreeCostFunction.html) [
  * Crossing Counter Node Order Influence  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterNodeInfluence.html) [
  * Crossing Counter Port Order Influence  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterPortInfluence.html) [
  * Crossing Minimization Enforced Group Orders  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmEnforcedGroupOrders.html) [
  * Crossing Minimization Group Ordering Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmGroupOrderStrategy.html) [
  * Crossing Minimization Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-strategy.html) [
  * Crossing Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-crossingPenalty.html) [
  * Current position of a node in the order of nodes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-currentPosition.html) [
  * Cutting Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-cutting-strategy.html) [
  * Cycle Breaking Group Ordering Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbGroupOrderStrategy.html) [
  * Cycle Breaking Preferred Source Id  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredSourceId.html) [
  * Cycle Breaking Preferred Target Id  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredTargetId.html) [
  * Cycle Breaking Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html) [
  * DCGraph  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-disco-debug-discoGraph.html) [
  * Debug Mode  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-debugMode.html) [
  * Default process timeout.  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-processTimeout.html) [
  * Desired Edge Length  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-stress-desiredEdgeLength.html) [
  * Desired index of node  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-desiredPosition.html) [
  * Direction  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-direction.html) [
  * Direction Congruency  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-directionCongruency.html) [
  * Direction Priority  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-priority-direction.html) [
  * Distance Model  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-neatoModel.html) [
  * Distance Penalty When Improving Cuts  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-multiEdge-distancePenalty.html) [
  * Eades Repulsion  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-force-repulsion.html) [
  * Edge Center Label Placement Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeLabels-centerLabelPlacementStrategy.html) [
  * Edge Coords  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-json-edgeCoords.html) [
  * Edge Edge Between Layer Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-edgeEdgeBetweenLayers.html) [
  * Edge End Texture Length  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-edgeEndTextureLength.html) [
  * Edge Label Placement  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edgeLabels-placement.html) [
  * Edge Label Side Selection  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeLabels-sideSelection.html) [
  * Edge Label Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-edgeLabel.html) [
  * Edge layout strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-vertiflex-layoutStrategy.html) [
  * Edge Node Between Layers Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-edgeNodeBetweenLayers.html) [
  * Edge Node Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-edgeNode.html) [
  * Edge Routing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edgeRouting.html) [
  * Edge Routing Mode  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-edgeRoutingMode.html) [
  * Edge Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-edgeEdge.html) [
  * Edge Thickness  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edge-thickness.html) [
  * Edge Type  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edge-type.html) [
  * Enable Hyperedges From Common Source  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-enableHyperedgesFromCommonSource.html) [
  * Epsilon  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-epsilon.html) [
  * Expand Nodes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-expandNodes.html) [
  * Favor Straight Edges Over Balancing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html) [
  * Feedback Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-feedbackEdges.html) [
  * Fill Polyominoes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-polyomino-fill.html) [
  * Fixed Graph Size  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeSize-fixedGraphSize.html) [
  * Fixed Position  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-stress-fixed.html) [
  * Fixed Shared Path Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-fixedSharedPathPenalty.html) [
  * Fixed vertical position  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-vertiflex-verticalConstraint.html) [
  * Font Name  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-font-name.html) [
  * Font Size  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-font-size.html) [
  * Force Model  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-force-model.html) [
  * Force Node Model Order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-forceNodeModelOrder.html) [
  * FR Temperature  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-force-temperature.html) [
  * Generate Position and Layer IDs  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-generatePositionAndLayerIds.html) [
  * Graph Wrapping Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-strategy.html) [
  * Greedy Switch Activation Threshold  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-activationThreshold.html) [
  * Greedy Switch Crossing Minimization  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-type.html) [
  * Greedy Switch Crossing Minimization (hierarchical)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical-type.html) [
  * Group ID of the Node Type  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-componentGroupId.html) [
  * Group ID of the Node Type  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-crossingMinimizationId.html) [
  * Group ID of the Node Type  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cycleBreakingId.html) [
  * Hierarchical Sweepiness  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-hierarchicalSweepiness.html) [
  * Hierarchy Handling  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-hierarchyHandling.html) [
  * Hierarchy Handling (Graphviz Dot)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-hierarchyHandling_org-eclipse-elk-graphviz-dot.html) [
  * High Degree Node Maximum Tree Height  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-treeHeight.html) [
  * High Degree Node Threshold  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-threshold.html) [
  * High Degree Node Treatment  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-highDegreeNodes-treatment.html) [
  * Horizontal spacing between Label and Port  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelPortHorizontal.html) [
  * Hypernode  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-hypernode.html) [
  * Ideal Nudging Distance  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-idealNudgingDistance.html) [
  * Improve Cuts  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveCuts.html) [
  * Improve Hyperedge Routes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingJunctions.html) [
  * Improve Hyperedge Routes Add/Delete  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingAddingAndDeletingJunctions.html) [
  * Improve Wrapped Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveWrappedEdges.html) [
  * In Layer Predecessor of  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerPredOf.html) [
  * In Layer Successor of  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerSuccOf.html) [
  * In new Row  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-inNewRow.html) [
  * Individual Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-individual.html) [
  * Individual Spacing (ELK Layered)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-individual_org-eclipse-elk-layered.html) [
  * Inline Edge Labels  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-edgeLabels-inline.html) [
  * Inside Self Loop  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-insideSelfLoops-yo.html) [
  * Interactive  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-interactive.html) [
  * interactive Layout  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-interactiveLayout.html) [
  * Interactive Reference Point  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-interactiveReferencePoint.html) [
  * Iteration Limit  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-stress-iterationLimit.html) [
  * Iterations  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-force-iterations.html) [
  * Iterations Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-iterationsFactor.html) [
  * Junction Points  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-junctionPoints.html) [
  * Label Angle  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-labelAngle.html) [
  * Label Distance  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-labelDistance.html) [
  * Label Manager  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-labelManager.html) [
  * Label Manager  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-labels-labelManager.html) [
  * Label Node Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelNode.html) [
  * Label Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelLabel.html) [
  * Layer Bound  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-coffmanGraham-layerBound.html) [
  * Layer Choice Constraint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-layerChoiceConstraint.html) [
  * Layer Constraint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-layerConstraint.html) [
  * Layer distance  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-vertiflex-layerDistance.html) [
  * Layer ID  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-layerId.html) [
  * Layer Spacing Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-layerSpacingFactor.html) [
  * Layer Unzipping Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-strategy.html) [
  * Layout Algorithm  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-algorithm.html) [
  * Layout Ancestors  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layoutAncestors.html) [
  * Layout Dimension  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-stress-dimension.html) [
  * Layout Partition  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-partitioning-partition.html) [
  * Layout Partitioning  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-partitioning-activate.html) [
  * Linear Segments Deflection Dampening  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-linearSegments-deflectionDampening.html) [
  * List of Polyominoes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-disco-debug-discoPolys.html) [
  * Long Edge Ordering Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-longEdgeStrategy.html) [
  * Manually Specified Cuts  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-cutting-cuts.html) [
  * Margins  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-margins.html) [
  * Marks a node as a cluster  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-isCluster.html) [
  * Max Node Promotion Iterations  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-nodePromotion-maxIterations.html) [
  * Max. Iterations  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-maxiter.html) [
  * Maximal Animation Time  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-maxAnimTime.html) [
  * Merge Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-mergeEdges.html) [
  * Merge Hierarchy-Crossing Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-mergeHierarchyEdges.html) [
  * Minimal Animation Time  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-minAnimTime.html) [
  * Minimize Edge Length Heuristic  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-minimizeEdgeLength.html) [
  * MSD Freedom  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-cutting-msd-freedom.html) [
  * No Layout  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-noLayout.html) [
  * No Model Order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-considerModelOrder-noModelOrder.html) [
  * Node arrangement strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdownpacking-nodeArrangement-strategy.html) [
  * Node Flexibility  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html) [
  * Node Flexibility Default  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-default.html) [
  * Node Flexibility Recompute Node Placement  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-recomputeNodePlacement.html) [
  * Node Label Padding  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeLabels-padding.html) [
  * Node Label Placement  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeLabels-placement.html) [
  * Node Layering Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-strategy.html) [
  * Node Node Between Layers Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html) [
  * Node Placement Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html) [
  * Node Promotion Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-nodePromotion-strategy.html) [
  * Node Self Loop Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-nodeSelfLoop.html) [
  * Node Size Constraints  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeSize-constraints.html) [
  * Node Size Minimum  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeSize-minimum.html) [
  * Node Size Options  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-nodeSize-options.html) [
  * Node Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-nodeNode.html) [
  * Nudge Orthogonal Segments  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalSegmentsConnectedToShapes.html) [
  * Nudge Orthogonal Touching Colinear Segments  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalTouchingColinearSegments.html) [
  * Nudge Shared Paths With Common Endpoint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-nudgeSharedPathsWithCommonEndPoint.html) [
  * Number of size categories  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-sizeCategories.html) [
  * Omit Node Micro Layout  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-omitNodeMicroLayout.html) [
  * Optimization Goal  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-widthApproximation-optimizationGoal.html) [
  * Order ID  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-orderId.html) [
  * Order nodes by height  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-orderBySize.html) [
  * Orthogonal Compaction  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-compaction-orthogonal.html) [
  * Outgoing Edge Angles  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-rotation-outgoingEdgeAngles.html) [
  * Overlap Removal  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-graphviz-overlapMode.html) [
  * Padding  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-padding.html) [
  * Penalise Orthogonal Shared Paths  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-penaliseOrthogonalSharedPathsAtConnEnds.html) [
  * Perform Unifying Nudging Preprocessing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-performUnifyingNudgingPreprocessingStep.html) [
  * Polyomino Primary Sorting Criterion  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-polyomino-highLevelSort.html) [
  * Polyomino Secondary Sorting Criterion  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-polyomino-lowLevelSort.html) [
  * Polyomino Traversal Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-polyomino-traversalStrategy.html) [
  * Port Alignment  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-default.html) [
  * Port Alignment (East)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-east.html) [
  * Port Alignment (North)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-north.html) [
  * Port Alignment (South)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-south.html) [
  * Port Alignment (West)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portAlignment-west.html) [
  * Port Anchor Offset  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-port-anchor.html) [
  * Port Border Offset  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-port-borderOffset.html) [
  * Port Constraints  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portConstraints.html) [
  * Port Direction Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-portDirectionPenalty.html) [
  * Port Index  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-port-index2.html) [
  * Port Label Placement  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-placement.html) [
  * Port Labels Next to Port  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-nextToPortIfPossible.html) [
  * Port Side  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-port-side.html) [
  * Port Sorting Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-portSortingStrategy.html) [
  * Port Spacing  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-portPort.html) [
  * Position  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-position.html) [
  * Position Choice Constraint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-positionChoiceConstraint.html) [
  * Position Constraint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-compaction.html) [
  * Position Constraint  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-positionConstraint.html) [
  * Position ID  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-positionId.html) [
  * Post Compaction Constraint Calculation  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-postCompaction-constraints.html) [
  * Post Compaction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-compaction-postCompaction-strategy.html) [
  * Priority  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-priority.html) [
  * Priority (ELK Box)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-priority_org-eclipse-elk-box.html) [
  * Priority (ELK Force)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-priority_org-eclipse-elk-force.html) [
  * Priority (ELK Layered)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-priority_org-eclipse-elk-layered.html) [
  * Priority (ELK Mr. Tree)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-priority_org-eclipse-elk-mrtree.html) [
  * Progress Bar  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-progressBar.html) [
  * Radius  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-radius.html) [
  * Randomization Seed  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-randomSeed.html) [
  * Repulsive Power  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-force-repulsivePower.html) [
  * Reset Alternation on Long Edges  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-resetOnLongEdges.html) [
  * Resolved Layout Algorithm  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-resolvedAlgorithm.html) [
  * Reverse Direction Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-reverseDirectionPenalty.html) [
  * Root node for spanning tree construction  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-processingOrder-preferredRoot.html) [
  * Root selection for spanning tree  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-processingOrder-rootSelection.html) [
  * Rotate  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-rotate.html) [
  * Row Height Reevaluation  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-packing-compaction-rowHeightReevaluation.html) [
  * Scale Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-scaleFactor.html) [
  * Search Order  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-searchOrder.html) [
  * Segment Penalty  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-segmentPenalty.html) [
  * Self-Loop Distribution  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopDistribution.html) [
  * Self-Loop Ordering  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopOrdering.html) [
  * Semi-Interactive Crossing Minimization  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html) [
  * Separate Connected Components  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-separateConnectedComponents.html) [
  * Shape Buffer Distance  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-alg-libavoid-shapeBufferDistance.html) [
  * Shape Coords  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-json-shapeCoords.html) [
  * Shift Last Placed.  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-widthApproximation-lastPlaceShift.html) [
  * Shortness Priority  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-priority-shortness.html) [
  * Shortness Priority (ELK Layered)  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-priority-shortness_org-eclipse-elk-layered.html) [
  * Sloped Edge Zone Width  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-polyline-slopedEdgeZoneWidth.html) [
  * Sloppy Spline Layer Spacing Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-splines-sloppy-layerSpacingFactor.html) [
  * Softwrapping Fuzziness  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-softwrappingFuzziness.html) [
  * Sorter  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-sorter.html) [
  * Spacing Base Value  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-baseValue.html) [
  * Spline Routing Mode  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-edgeRouting-splines-mode.html) [
  * Straightness Priority  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-priority-straightness.html) [
  * Stress Epsilon  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-stress-epsilon.html) [
  * Structure Extraction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-structure-structureExtractionStrategy.html) [
  * Target Angle  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-rotation-targetAngle.html) [
  * Target Width  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-widthApproximation-targetWidth.html) [
  * Thoroughness  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-thoroughness.html) [
  * Topdown Hierarchical Node Aspect Ratio  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-hierarchicalNodeAspectRatio.html) [
  * Topdown Hierarchical Node Width  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-hierarchicalNodeWidth.html) [
  * Topdown Layout  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdownLayout.html) [
  * Topdown Node Type  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-nodeType.html) [
  * Topdown Scale Cap  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-scaleCap.html) [
  * Topdown Scale Factor  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-scaleFactor.html) [
  * Topdown Size Approximator  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-sizeApproximator.html) [
  * Translation Optimization  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-radial-optimizationCriteria.html) [
  * Treat Port Labels as Group  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-portLabels-treatAsGroup.html) [
  * Tree Construction Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-processingOrder-treeConstruction.html) [
  * Tree Level  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-treeLevel.html) [
  * Try box layout first  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-trybox.html) [
  * Underlying Layout Algorithm  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-underlyingLayoutAlgorithm.html) [
  * Unzipping Layer Split  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layerUnzipping-layerSplit.html) [
  * Upper Bound On Width [MinWidth Layerer]  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-minWidth-upperBoundOnWidth.html) [
  * Upper Layer Estimation Scaling Factor [MinWidth Layerer]  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-minWidth-upperLayerEstimationScalingFactor.html) [
  * Upper limit for iterations of overlap removal  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-overlapRemoval-maxIterations.html) [
  * Valid Indices for Wrapping  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-validify-forbiddenIndices.html) [
  * Validate Graph  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-validateGraph.html) [
  * Validate Options  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-validateOptions.html) [
  * Validification Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-wrapping-validify-strategy.html) [
  * Vertical spacing between Label and Port  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-labelPortVertical.html) [
  * Weight of a node containing children for determining the graph size  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdown-sizeCategoriesHierarchicalNodeWeight.html) [
  * Weighting of Nodes  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-mrtree-weighting.html) [
  * Whether to run a supplementary scanline overlap check.  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-overlapRemoval-runScanline.html) [
  * White Space Approximation Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-whiteSpaceElimination-strategy.html) [
  * Whitespace elimination strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-topdownpacking-whitespaceElimination-strategy.html) [
  * Width Approximation Strategy  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-rectpacking-widthApproximation-strategy.html) [
  * Zoom to Fit  ](https://eclipse.dev/elk/reference/options/org-eclipse-elk-zoomToFit.html) [
  * Layout Option Groups  ](https://eclipse.dev/elk/reference/groups.html) [
  * compaction  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-compaction.html) [
  * compaction  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-compaction.html) [
  * compaction.postCompaction  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-compaction-postCompaction.html) [
  * componentCompaction  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-disco-componentCompaction.html) [
  * considerModelOrder  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-considerModelOrder.html) [
  * considerModelOrder.groupModelOrder  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-considerModelOrder-groupModelOrder.html) [
  * crossingMinimization  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-crossingMinimization.html) [
  * crossingMinimization.greedySwitch  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitch.html) [
  * crossingMinimization.greedySwitchHierarchical  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical.html) [
  * cycleBreaking  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-cycleBreaking.html) [
  * debug  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-disco-debug.html) [
  * edge  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-edge.html) [
  * edgeLabels  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-edgeLabels.html) [
  * edgeLabels  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-edgeLabels.html) [
  * edgeRouting  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-edgeRouting.html) [
  * edgeRouting.polyline  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-edgeRouting-polyline.html) [
  * edgeRouting.splines  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-edgeRouting-splines.html) [
  * edgeRouting.splines.sloppy  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-edgeRouting-splines-sloppy.html) [
  * font  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-font.html) [
  * highDegreeNodes  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-highDegreeNodes.html) [
  * insideSelfLoops  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-insideSelfLoops.html) [
  * json  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-json.html) [
  * layering  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-layering.html) [
  * layering.coffmanGraham  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-layering-coffmanGraham.html) [
  * layering.minWidth  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-layering-minWidth.html) [
  * layering.nodePromotion  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-layering-nodePromotion.html) [
  * layerUnzipping  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-layerUnzipping.html) [
  * nodeArrangement  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-topdownpacking-nodeArrangement.html) [
  * nodeLabels  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-nodeLabels.html) [
  * nodePlacement  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-nodePlacement.html) [
  * nodePlacement.bk  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-nodePlacement-bk.html) [
  * nodePlacement.linearSegments  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-nodePlacement-linearSegments.html) [
  * nodePlacement.networkSimplex  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex.html) [
  * nodePlacement.networkSimplex.nodeFlexibility  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html) [
  * nodeSize  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-nodeSize.html) [
  * overlapRemoval  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-overlapRemoval.html) [
  * packing  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-packing.html) [
  * packing.compaction  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-rectpacking-packing-compaction.html) [
  * partitioning  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-partitioning.html) [
  * polyomino  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-polyomino.html) [
  * port  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-port.html) [
  * portAlignment  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-portAlignment.html) [
  * portLabels  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-portLabels.html) [
  * priority  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-priority.html) [
  * processingOrder  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-processingOrder.html) [
  * rotation  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-radial-rotation.html) [
  * spacing  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-spacing.html) [
  * spacing  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-spacing.html) [
  * structure  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-structure.html) [
  * topdown  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-topdown.html) [
  * whiteSpaceElimination  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-rectpacking-whiteSpaceElimination.html) [
  * whitespaceElimination  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-topdownpacking-whitespaceElimination.html) [
  * widthApproximation  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-rectpacking-widthApproximation.html) [
  * wrapping  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping.html) [
  * wrapping.cutting  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping-cutting.html) [
  * wrapping.cutting.msd  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping-cutting-msd.html) [
  * wrapping.multiEdge  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping-multiEdge.html) [
  * wrapping.singleEdge  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping-singleEdge.html) [
  * wrapping.validify  ](https://eclipse.dev/elk/reference/groups/org-eclipse-elk-layered-wrapping-validify.html) 

