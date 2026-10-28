# ELK Layered

![Preview Image](../../img_gen/org-eclipse-elk-layered_preview_layered_layout.png)

| Property              | Value                             |
|-----------------------|-----------------------------------|
| *Identifier:*         | `org.eclipse.elk.layered`         |
| *Meta Data Provider:* | `options.LayeredMetaDataProvider` |

## Description

Layer-based algorithm provided by the Eclipse Layout Kernel. Arranges as many edges as possible into one direction by placing nodes into subsequent layers. This implementation supports different routing styles (straight, orthogonal, splines); if orthogonal routing is selected, arbitrary port constraints are respected, thus enabling the layout of block diagrams such as actor-oriented models or circuit schematics. Furthermore, full layout of compound graphs with cross-hierarchy edges is supported when the respective option is activated on the top level.

## Category: Layered

The layer-based method was introduced by Sugiyama, Tagawa and Toda in 1981. It emphasizes the direction of edges by pointing as many edges as possible into the same direction. The nodes are arranged in layers, which are sometimes called “hierarchies”, and then reordered such that the number of edge crossings is minimized. Afterwards, concrete coordinates are computed for the nodes and edge bend points.

## Supported Graph Features

| Name | Description |
|----|----|
| Self Loops | Edges connecting a node with itself. |
| Inside Self Loops | Self-loops routed through a node instead of around it. |
| Multi Edges | Multiple edges with the same source and target node. |
| Edge Labels | Labels that are associated with edges. |
| Ports | Edges are connected to nodes over ports. |
| Compound | Edges that connect nodes from different hierarchy levels and are incident to compound nodes. |
| Clusters | Edges that connect nodes from different clusters, but not the cluster parent nodes. |

## Supported Options

| Option | Default Value |
|----|----|
| [Activate Inside Self Loops](../../reference/options/org-eclipse-elk-insideSelfLoops-activate.html) | `false` |
| [Add Unnecessary Bendpoints](../../reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html) | `false` |
| [Additional Port Space](../../reference/options/org-eclipse-elk-spacing-portsSurrounding.html) | `new ElkMargin(0)` |
| [Additional Wrapped Edges Spacing](../../reference/options/org-eclipse-elk-layered-wrapping-additionalEdgeSpacing.html) | `10` |
| [Alignment](../../reference/options/org-eclipse-elk-alignment.html) | `Alignment.AUTOMATIC` |
| [Allow Non-Flow Ports To Switch Sides](../../reference/options/org-eclipse-elk-layered-allowNonFlowPortsToSwitchSides.html) | `false` |
| [Aspect Ratio](../../reference/options/org-eclipse-elk-aspectRatio.html) | `1.6f` |
| [BK Edge Straightening](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-edgeStraightening.html) | `EdgeStraighteningStrategy.IMPROVE_STRAIGHTNESS` |
| [BK Fixed Alignment](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-fixedAlignment.html) | `FixedAlignment.NONE` |
| [Comment Box](../../reference/options/org-eclipse-elk-commentBox.html) | `false` |
| [Comment Comment Spacing](../../reference/options/org-eclipse-elk-spacing-commentComment.html) | `10` |
| [Comment Node Spacing](../../reference/options/org-eclipse-elk-spacing-commentNode.html) | `10` |
| [Components Spacing](../../reference/options/org-eclipse-elk-spacing-componentComponent.html) | `20f` |
| [Connected Components Compaction](../../reference/options/org-eclipse-elk-layered-compaction-connectedComponents.html) | `false` |
| [Consider Model Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-strategy.html) | `OrderingStrategy.NONE` |
| [Consider Model Order for Components](../../reference/options/org-eclipse-elk-layered-considerModelOrder-components.html) | `ComponentOrderingStrategy.NONE` |
| [Consider Port Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-portModelOrder.html) | `false` |
| [Content Alignment](../../reference/options/org-eclipse-elk-contentAlignment.html) | `ContentAlignment.topLeft()` |
| [Correction Factor for Wrapping](../../reference/options/org-eclipse-elk-layered-wrapping-correctionFactor.html) | `1.0` |
| [Crossing Counter Node Order Influence](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterNodeInfluence.html) | `0` |
| [Crossing Counter Port Order Influence](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterPortInfluence.html) | `0` |
| [Crossing Minimization Enforced Group Orders](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmEnforcedGroupOrders.html) | `#[1, 2, 6, 7, 10, 11]` |
| [Crossing Minimization Group Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmGroupOrderStrategy.html) | `GroupOrderStrategy.ONLY_WITHIN_GROUP` |
| [Crossing Minimization Strategy](../../reference/options/org-eclipse-elk-layered-crossingMinimization-strategy.html) | `CrossingMinimizationStrategy.LAYER_SWEEP` |
| [Cutting Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-strategy.html) | `CuttingStrategy.MSD` |
| [Cycle Breaking Group Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbGroupOrderStrategy.html) | `GroupOrderStrategy.ONLY_WITHIN_GROUP` |
| [Cycle Breaking Preferred Source Id](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredSourceId.html) | `<not defined>` |
| [Cycle Breaking Preferred Target Id](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredTargetId.html) | `<not defined>` |
| [Cycle Breaking Strategy](../../reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html) | `CycleBreakingStrategy.GREEDY` |
| [Debug Mode](../../reference/options/org-eclipse-elk-debugMode.html) | `false` |
| [Direction](../../reference/options/org-eclipse-elk-direction.html) | `Direction.UNDEFINED` |
| [Direction Congruency](../../reference/options/org-eclipse-elk-layered-directionCongruency.html) | `DirectionCongruency.READING_DIRECTION` |
| [Direction Priority](../../reference/options/org-eclipse-elk-layered-priority-direction.html) | `0` |
| [Distance Penalty When Improving Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-distancePenalty.html) | `2.0` |
| [Edge Center Label Placement Strategy](../../reference/options/org-eclipse-elk-layered-edgeLabels-centerLabelPlacementStrategy.html) | `CenterEdgeLabelPlacementStrategy.MEDIAN_LAYER` |
| [Edge Edge Between Layer Spacing](../../reference/options/org-eclipse-elk-layered-spacing-edgeEdgeBetweenLayers.html) | `10` |
| [Edge Label Placement](../../reference/options/org-eclipse-elk-edgeLabels-placement.html) | `EdgeLabelPlacement.CENTER` |
| [Edge Label Side Selection](../../reference/options/org-eclipse-elk-layered-edgeLabels-sideSelection.html) | `EdgeLabelSideSelection.SMART_DOWN` |
| [Edge Label Spacing](../../reference/options/org-eclipse-elk-spacing-edgeLabel.html) | `2` |
| [Edge Node Between Layers Spacing](../../reference/options/org-eclipse-elk-layered-spacing-edgeNodeBetweenLayers.html) | `10` |
| [Edge Node Spacing](../../reference/options/org-eclipse-elk-spacing-edgeNode.html) | `10` |
| [Edge Routing](../../reference/options/org-eclipse-elk-edgeRouting.html) | `EdgeRouting.ORTHOGONAL` |
| [Edge Spacing](../../reference/options/org-eclipse-elk-spacing-edgeEdge.html) | `10` |
| [Edge Thickness](../../reference/options/org-eclipse-elk-edge-thickness.html) | `1` |
| [Favor Straight Edges Over Balancing](../../reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html) | `<not defined>` |
| [Feedback Edges](../../reference/options/org-eclipse-elk-layered-feedbackEdges.html) | `false` |
| [Fixed Graph Size](../../reference/options/org-eclipse-elk-nodeSize-fixedGraphSize.html) | `false` |
| [Force Node Model Order](../../reference/options/org-eclipse-elk-layered-crossingMinimization-forceNodeModelOrder.html) | `false` |
| [Generate Position and Layer IDs](../../reference/options/org-eclipse-elk-layered-generatePositionAndLayerIds.html) | `false` |
| [Graph Wrapping Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-strategy.html) | `WrappingStrategy.OFF` |
| [Greedy Switch Activation Threshold](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-activationThreshold.html) | `40` |
| [Greedy Switch Crossing Minimization](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-type.html) | `GreedySwitchType.TWO_SIDED` |
| [Greedy Switch Crossing Minimization (hierarchical)](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical-type.html) | `GreedySwitchType.OFF` |
| [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cycleBreakingId.html) | `0` |
| [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-crossingMinimizationId.html) | `0` |
| [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-componentGroupId.html) | `0` |
| [Hierarchical Sweepiness](../../reference/options/org-eclipse-elk-layered-crossingMinimization-hierarchicalSweepiness.html) | `0.1` |
| [Hierarchy Handling](../../reference/options/org-eclipse-elk-hierarchyHandling.html) | `HierarchyHandling.INHERIT` |
| [High Degree Node Maximum Tree Height](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treeHeight.html) | `5` |
| [High Degree Node Threshold](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-threshold.html) | `16` |
| [High Degree Node Treatment](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treatment.html) | `false` |
| [Horizontal spacing between Label and Port](../../reference/options/org-eclipse-elk-spacing-labelPortHorizontal.html) | `1` |
| [Hypernode](../../reference/options/org-eclipse-elk-hypernode.html) | `false` |
| [Improve Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveCuts.html) | `true` |
| [Improve Wrapped Edges](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveWrappedEdges.html) | `true` |
| [In Layer Predecessor of](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerPredOf.html) | `null` |
| [In Layer Successor of](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerSuccOf.html) | `null` |
| [Individual Spacing](../../reference/options/org-eclipse-elk-spacing-individual_org-eclipse-elk-layered.html) | `<not defined>` |
| [Inline Edge Labels](../../reference/options/org-eclipse-elk-edgeLabels-inline.html) | `false` |
| [Inside Self Loop](../../reference/options/org-eclipse-elk-insideSelfLoops-yo.html) | `false` |
| [interactive Layout](../../reference/options/org-eclipse-elk-interactiveLayout.html) | `false` |
| [Interactive Reference Point](../../reference/options/org-eclipse-elk-layered-interactiveReferencePoint.html) | `InteractiveReferencePoint.CENTER` |
| [Junction Points](../../reference/options/org-eclipse-elk-junctionPoints.html) | `new KVectorChain()` |
| [Label Node Spacing](../../reference/options/org-eclipse-elk-spacing-labelNode.html) | `5` |
| [Label Spacing](../../reference/options/org-eclipse-elk-spacing-labelLabel.html) | `0` |
| [Layer Bound](../../reference/options/org-eclipse-elk-layered-layering-coffmanGraham-layerBound.html) | `Integer.MAX_VALUE` |
| [Layer Choice Constraint](../../reference/options/org-eclipse-elk-layered-layering-layerChoiceConstraint.html) | `null` |
| [Layer Constraint](../../reference/options/org-eclipse-elk-layered-layering-layerConstraint.html) | `LayerConstraint.NONE` |
| [Layer ID](../../reference/options/org-eclipse-elk-layered-layering-layerId.html) | `-1` |
| [Layer Unzipping Strategy](../../reference/options/org-eclipse-elk-layered-layerUnzipping-strategy.html) | `LayerUnzippingStrategy.NONE` |
| [Layout Partition](../../reference/options/org-eclipse-elk-partitioning-partition.html) | `<not defined>` |
| [Layout Partitioning](../../reference/options/org-eclipse-elk-partitioning-activate.html) | `false` |
| [Linear Segments Deflection Dampening](../../reference/options/org-eclipse-elk-layered-nodePlacement-linearSegments-deflectionDampening.html) | `0.3` |
| [Long Edge Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-longEdgeStrategy.html) | `LongEdgeOrderingStrategy.DUMMY_NODE_OVER` |
| [Manually Specified Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-cuts.html) | `<not defined>` |
| [Margins](../../reference/options/org-eclipse-elk-margins.html) | `new ElkMargin()` |
| [Max Node Promotion Iterations](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-maxIterations.html) | `0` |
| [Merge Edges](../../reference/options/org-eclipse-elk-layered-mergeEdges.html) | `false` |
| [Merge Hierarchy-Crossing Edges](../../reference/options/org-eclipse-elk-layered-mergeHierarchyEdges.html) | `true` |
| [Minimize Edge Length Heuristic](../../reference/options/org-eclipse-elk-layered-layerUnzipping-minimizeEdgeLength.html) | `false` |
| [MSD Freedom](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-msd-freedom.html) | `1` |
| [No Layout](../../reference/options/org-eclipse-elk-noLayout.html) | `false` |
| [No Model Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-noModelOrder.html) | `false` |
| [Node Flexibility](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html) | `<not defined>` |
| [Node Flexibility Default](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-default.html) | `NodeFlexibility.NONE` |
| [Node Flexibility Recompute Node Placement](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-recomputeNodePlacement.html) | `null` |
| [Node Label Padding](../../reference/options/org-eclipse-elk-nodeLabels-padding.html) | `new ElkPadding(5)` |
| [Node Label Placement](../../reference/options/org-eclipse-elk-nodeLabels-placement.html) | `NodeLabelPlacement.fixed()` |
| [Node Layering Strategy](../../reference/options/org-eclipse-elk-layered-layering-strategy.html) | `LayeringStrategy.NETWORK_SIMPLEX` |
| [Node Node Between Layers Spacing](../../reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html) | `20` |
| [Node Placement Strategy](../../reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html) | `NodePlacementStrategy.BRANDES_KOEPF` |
| [Node Promotion Strategy](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-strategy.html) | `NodePromotionStrategy.NONE` |
| [Node Self Loop Spacing](../../reference/options/org-eclipse-elk-spacing-nodeSelfLoop.html) | `10` |
| [Node Size Constraints](../../reference/options/org-eclipse-elk-nodeSize-constraints.html) | `EnumSet.noneOf(SizeConstraint)` |
| [Node Size Minimum](../../reference/options/org-eclipse-elk-nodeSize-minimum.html) | `new KVector(0, 0)` |
| [Node Size Options](../../reference/options/org-eclipse-elk-nodeSize-options.html) | `EnumSet.of(SizeOptions.DEFAULT_MINIMUM_SIZE)` |
| [Node Spacing](../../reference/options/org-eclipse-elk-spacing-nodeNode.html) | `20` |
| [Padding](../../reference/options/org-eclipse-elk-padding.html) | `new ElkPadding(12)` |
| [Port Alignment](../../reference/options/org-eclipse-elk-portAlignment-default.html) | `PortAlignment.JUSTIFIED` |
| [Port Alignment (East)](../../reference/options/org-eclipse-elk-portAlignment-east.html) | `<not defined>` |
| [Port Alignment (North)](../../reference/options/org-eclipse-elk-portAlignment-north.html) | `<not defined>` |
| [Port Alignment (South)](../../reference/options/org-eclipse-elk-portAlignment-south.html) | `<not defined>` |
| [Port Alignment (West)](../../reference/options/org-eclipse-elk-portAlignment-west.html) | `<not defined>` |
| [Port Anchor Offset](../../reference/options/org-eclipse-elk-port-anchor.html) | `<not defined>` |
| [Port Border Offset](../../reference/options/org-eclipse-elk-port-borderOffset.html) | `0` |
| [Port Constraints](../../reference/options/org-eclipse-elk-portConstraints.html) | `PortConstraints.UNDEFINED` |
| [Port Index](../../reference/options/org-eclipse-elk-port-index2.html) | `<not defined>` |
| [Port Label Placement](../../reference/options/org-eclipse-elk-portLabels-placement.html) | `PortLabelPlacement.outside()` |
| [Port Labels Next to Port](../../reference/options/org-eclipse-elk-portLabels-nextToPortIfPossible.html) | `false` |
| [Port Side](../../reference/options/org-eclipse-elk-port-side.html) | `PortSide.UNDEFINED` |
| [Port Sorting Strategy](../../reference/options/org-eclipse-elk-layered-portSortingStrategy.html) | `PortSortingStrategy.INPUT_ORDER` |
| [Port Spacing](../../reference/options/org-eclipse-elk-spacing-portPort.html) | `10` |
| [Position](../../reference/options/org-eclipse-elk-position.html) | `<not defined>` |
| [Position Choice Constraint](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionChoiceConstraint.html) | `null` |
| [Position ID](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionId.html) | `-1` |
| [Post Compaction Constraint Calculation](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-constraints.html) | `ConstraintCalculationStrategy.SCANLINE` |
| [Post Compaction Strategy](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-strategy.html) | `GraphCompactionStrategy.NONE` |
| [Priority](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-layered.html) | `0` |
| [Randomization Seed](../../reference/options/org-eclipse-elk-randomSeed.html) | `1` |
| [Reset Alternation on Long Edges](../../reference/options/org-eclipse-elk-layered-layerUnzipping-resetOnLongEdges.html) | `true` |
| [Self-Loop Distribution](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopDistribution.html) | `SelfLoopDistributionStrategy.NORTH` |
| [Self-Loop Ordering](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopOrdering.html) | `SelfLoopOrderingStrategy.STACKED` |
| [Semi-Interactive Crossing Minimization](../../reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html) | `false` |
| [Separate Connected Components](../../reference/options/org-eclipse-elk-separateConnectedComponents.html) | `true` |
| [Shortness Priority](../../reference/options/org-eclipse-elk-layered-priority-shortness_org-eclipse-elk-layered.html) | `0` |
| [Sloped Edge Zone Width](../../reference/options/org-eclipse-elk-layered-edgeRouting-polyline-slopedEdgeZoneWidth.html) | `2.0` |
| [Sloppy Spline Layer Spacing Factor](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-sloppy-layerSpacingFactor.html) | `0.2` |
| [Spacing Base Value](../../reference/options/org-eclipse-elk-layered-spacing-baseValue.html) | `<not defined>` |
| [Spline Routing Mode](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-mode.html) | `SplineRoutingMode.SLOPPY` |
| [Straightness Priority](../../reference/options/org-eclipse-elk-layered-priority-straightness.html) | `0` |
| [Thoroughness](../../reference/options/org-eclipse-elk-layered-thoroughness.html) | `7` |
| [Topdown Hierarchical Node Aspect Ratio](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeAspectRatio.html) | `1.414` |
| [Topdown Hierarchical Node Width](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeWidth.html) | `150` |
| [Topdown Layout](../../reference/options/org-eclipse-elk-topdownLayout.html) | `false` |
| [Topdown Node Type](../../reference/options/org-eclipse-elk-topdown-nodeType.html) | `TopdownNodeTypes.HIERARCHICAL_NODE` |
| [Topdown Scale Factor](../../reference/options/org-eclipse-elk-topdown-scaleFactor.html) | `1` |
| [Treat Port Labels as Group](../../reference/options/org-eclipse-elk-portLabels-treatAsGroup.html) | `true` |
| [Unzipping Layer Split](../../reference/options/org-eclipse-elk-layered-layerUnzipping-layerSplit.html) | `2` |
| [Upper Bound On Width \[MinWidth Layerer\]](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperBoundOnWidth.html) | `4` |
| [Upper Layer Estimation Scaling Factor \[MinWidth Layerer\]](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperLayerEstimationScalingFactor.html) | `2` |
| [Valid Indices for Wrapping](../../reference/options/org-eclipse-elk-layered-wrapping-validify-forbiddenIndices.html) | `<not defined>` |
| [Validification Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-validify-strategy.html) | `ValidifyStrategy.GREEDY` |
| [Vertical spacing between Label and Port](../../reference/options/org-eclipse-elk-spacing-labelPortVertical.html) | `1` |

[](../../reference/algorithms.html)

Algorithms

[](../../reference/algorithms/org-eclipse-elk-conn-gmf-layouter-Draw2D.html)

Draw2D Layout

[](../../reference/algorithms/org-eclipse-elk-box.html)

ELK Box

[](../../reference/algorithms/org-eclipse-elk-disco.html)

ELK DisCo

[](../../reference/algorithms/org-eclipse-elk-fixed.html)

ELK Fixed

[](../../reference/algorithms/org-eclipse-elk-force.html)

ELK Force

[](../../reference/algorithms/org-eclipse-elk-layered.html)

ELK Layered

[](../../reference/algorithms/org-eclipse-elk-mrtree.html)

ELK Mr. Tree

[](../../reference/algorithms/org-eclipse-elk-radial.html)

ELK Radial

[](../../reference/algorithms/org-eclipse-elk-random.html)

ELK Randomizer

[](../../reference/algorithms/org-eclipse-elk-rectpacking.html)

ELK Rectangle Packing

[](../../reference/algorithms/org-eclipse-elk-sporeCompaction.html)

ELK SPOrE Compaction

[](../../reference/algorithms/org-eclipse-elk-sporeOverlap.html)

ELK SPOrE Overlap Removal

[](../../reference/algorithms/org-eclipse-elk-stress.html)

ELK Stress

[](../../reference/algorithms/org-eclipse-elk-topdownpacking.html)

ELK Top-down Packing

[](../../reference/algorithms/org-eclipse-elk-vertiflex.html)

ELK VertiFlex

[](../../reference/algorithms/org-eclipse-elk-graphviz-circo.html)

Graphviz Circo

[](../../reference/algorithms/org-eclipse-elk-graphviz-dot.html)

Graphviz Dot

[](../../reference/algorithms/org-eclipse-elk-graphviz-fdp.html)

Graphviz FDP

[](../../reference/algorithms/org-eclipse-elk-graphviz-neato.html)

Graphviz Neato

[](../../reference/algorithms/org-eclipse-elk-graphviz-twopi.html)

Graphviz Twopi

[](../../reference/algorithms/org-eclipse-elk-alg-libavoid.html)

Libavoid

[](../../reference/options.html)

Layout Options

[](../../reference/options/org-eclipse-elk-insideSelfLoops-activate.html)

Activate Inside Self Loops

[](../../reference/options/org-eclipse-elk-graphviz-adaptPortPositions.html)

Adapt Port Positions

[](../../reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html)

Add Unnecessary Bendpoints

[](../../reference/options/org-eclipse-elk-spacing-portsSurrounding.html)

Additional Port Space

[](../../reference/options/org-eclipse-elk-radial-rotation-computeAdditionalWedgeSpace.html)

Additional Wedge Space

[](../../reference/options/org-eclipse-elk-layered-wrapping-additionalEdgeSpacing.html)

Additional Wrapped Edges Spacing

[](../../reference/options/org-eclipse-elk-alignment.html)

Alignment

[](../../reference/options/org-eclipse-elk-layered-allowNonFlowPortsToSwitchSides.html)

Allow Non-Flow Ports To Switch Sides

[](../../reference/options/org-eclipse-elk-alg-libavoid-anglePenalty.html)

Angle Penalty

[](../../reference/options/org-eclipse-elk-animate.html)

Animate

[](../../reference/options/org-eclipse-elk-animTimeFactor.html)

Animation Time Factor

[](../../reference/options/org-eclipse-elk-radial-wedgeCriteria.html)

Annulus Wedge Criteria

[](../../reference/options/org-eclipse-elk-aspectRatio.html)

Aspect Ratio

[](../../reference/options/org-eclipse-elk-bendPoints.html)

Bend Points

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-edgeStraightening.html)

BK Edge Straightening

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-fixedAlignment.html)

BK Fixed Alignment

[](../../reference/options/org-eclipse-elk-box-packingMode.html)

Box Layout Mode

[](../../reference/options/org-eclipse-elk-radial-centerOnRoot.html)

Center On Root

[](../../reference/options/org-eclipse-elk-childAreaHeight.html)

Child Area Height

[](../../reference/options/org-eclipse-elk-childAreaWidth.html)

Child Area Width

[](../../reference/options/org-eclipse-elk-alg-libavoid-clusterCrossingPenalty.html)

Cluster Crossing Penalty

[](../../reference/options/org-eclipse-elk-commentBox.html)

Comment Box

[](../../reference/options/org-eclipse-elk-spacing-commentComment.html)

Comment Comment Spacing

[](../../reference/options/org-eclipse-elk-spacing-commentNode.html)

Comment Node Spacing

[](../../reference/options/org-eclipse-elk-radial-compactor.html)

Compaction

[](../../reference/options/org-eclipse-elk-rectpacking-packing-compaction-iterations.html)

Compaction iterations

[](../../reference/options/org-eclipse-elk-radial-compactionStepSize.html)

Compaction Step Size

[](../../reference/options/org-eclipse-elk-compaction-compactionStrategy.html)

Compaction Strategy

[](../../reference/options/org-eclipse-elk-rectpacking-packing-strategy.html)

Compaction Strategy

[](../../reference/options/org-eclipse-elk-spacing-componentComponent.html)

Components Spacing

[](../../reference/options/org-eclipse-elk-graphviz-concentrate.html)

Concentrate Edges

[](../../reference/options/org-eclipse-elk-layered-compaction-connectedComponents.html)

Connected Components Compaction

[](../../reference/options/org-eclipse-elk-disco-componentCompaction-strategy.html)

Connected Components Compaction Strategy

[](../../reference/options/org-eclipse-elk-disco-componentCompaction-componentLayoutAlgorithm.html)

Connected Components Layout Algorithm

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-strategy.html)

Consider Model Order

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-components.html)

Consider Model Order for Components

[](../../reference/options/org-eclipse-elk-vertiflex-considerNodeModelOrder.html)

Consider node model order

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-portModelOrder.html)

Consider Port Order

[](../../reference/options/org-eclipse-elk-contentAlignment.html)

Content Alignment

[](../../reference/options/org-eclipse-elk-layered-wrapping-correctionFactor.html)

Correction Factor for Wrapping

[](../../reference/options/org-eclipse-elk-processingOrder-spanningTreeCostFunction.html)

Cost Function for Spanning Tree

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterNodeInfluence.html)

Crossing Counter Node Order Influence

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterPortInfluence.html)

Crossing Counter Port Order Influence

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmEnforcedGroupOrders.html)

Crossing Minimization Enforced Group Orders

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmGroupOrderStrategy.html)

Crossing Minimization Group Ordering Strategy

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-strategy.html)

Crossing Minimization Strategy

[](../../reference/options/org-eclipse-elk-alg-libavoid-crossingPenalty.html)

Crossing Penalty

[](../../reference/options/org-eclipse-elk-rectpacking-currentPosition.html)

Current position of a node in the order of nodes

[](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-strategy.html)

Cutting Strategy

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbGroupOrderStrategy.html)

Cycle Breaking Group Ordering Strategy

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredSourceId.html)

Cycle Breaking Preferred Source Id

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredTargetId.html)

Cycle Breaking Preferred Target Id

[](../../reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html)

Cycle Breaking Strategy

[](../../reference/options/org-eclipse-elk-disco-debug-discoGraph.html)

DCGraph

[](../../reference/options/org-eclipse-elk-debugMode.html)

Debug Mode

[](../../reference/options/org-eclipse-elk-alg-libavoid-processTimeout.html)

Default process timeout.

[](../../reference/options/org-eclipse-elk-stress-desiredEdgeLength.html)

Desired Edge Length

[](../../reference/options/org-eclipse-elk-rectpacking-desiredPosition.html)

Desired index of node

[](../../reference/options/org-eclipse-elk-direction.html)

Direction

[](../../reference/options/org-eclipse-elk-layered-directionCongruency.html)

Direction Congruency

[](../../reference/options/org-eclipse-elk-layered-priority-direction.html)

Direction Priority

[](../../reference/options/org-eclipse-elk-graphviz-neatoModel.html)

Distance Model

[](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-distancePenalty.html)

Distance Penalty When Improving Cuts

[](../../reference/options/org-eclipse-elk-force-repulsion.html)

Eades Repulsion

[](../../reference/options/org-eclipse-elk-layered-edgeLabels-centerLabelPlacementStrategy.html)

Edge Center Label Placement Strategy

[](../../reference/options/org-eclipse-elk-json-edgeCoords.html)

Edge Coords

[](../../reference/options/org-eclipse-elk-layered-spacing-edgeEdgeBetweenLayers.html)

Edge Edge Between Layer Spacing

[](../../reference/options/org-eclipse-elk-mrtree-edgeEndTextureLength.html)

Edge End Texture Length

[](../../reference/options/org-eclipse-elk-edgeLabels-placement.html)

Edge Label Placement

[](../../reference/options/org-eclipse-elk-layered-edgeLabels-sideSelection.html)

Edge Label Side Selection

[](../../reference/options/org-eclipse-elk-spacing-edgeLabel.html)

Edge Label Spacing

[](../../reference/options/org-eclipse-elk-vertiflex-layoutStrategy.html)

Edge layout strategy

[](../../reference/options/org-eclipse-elk-layered-spacing-edgeNodeBetweenLayers.html)

Edge Node Between Layers Spacing

[](../../reference/options/org-eclipse-elk-spacing-edgeNode.html)

Edge Node Spacing

[](../../reference/options/org-eclipse-elk-edgeRouting.html)

Edge Routing

[](../../reference/options/org-eclipse-elk-mrtree-edgeRoutingMode.html)

Edge Routing Mode

[](../../reference/options/org-eclipse-elk-spacing-edgeEdge.html)

Edge Spacing

[](../../reference/options/org-eclipse-elk-edge-thickness.html)

Edge Thickness

[](../../reference/options/org-eclipse-elk-edge-type.html)

Edge Type

[](../../reference/options/org-eclipse-elk-alg-libavoid-enableHyperedgesFromCommonSource.html)

Enable Hyperedges From Common Source

[](../../reference/options/org-eclipse-elk-graphviz-epsilon.html)

Epsilon

[](../../reference/options/org-eclipse-elk-expandNodes.html)

Expand Nodes

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html)

Favor Straight Edges Over Balancing

[](../../reference/options/org-eclipse-elk-layered-feedbackEdges.html)

Feedback Edges

[](../../reference/options/org-eclipse-elk-polyomino-fill.html)

Fill Polyominoes

[](../../reference/options/org-eclipse-elk-nodeSize-fixedGraphSize.html)

Fixed Graph Size

[](../../reference/options/org-eclipse-elk-stress-fixed.html)

Fixed Position

[](../../reference/options/org-eclipse-elk-alg-libavoid-fixedSharedPathPenalty.html)

Fixed Shared Path Penalty

[](../../reference/options/org-eclipse-elk-vertiflex-verticalConstraint.html)

Fixed vertical position

[](../../reference/options/org-eclipse-elk-font-name.html)

Font Name

[](../../reference/options/org-eclipse-elk-font-size.html)

Font Size

[](../../reference/options/org-eclipse-elk-force-model.html)

Force Model

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-forceNodeModelOrder.html)

Force Node Model Order

[](../../reference/options/org-eclipse-elk-force-temperature.html)

FR Temperature

[](../../reference/options/org-eclipse-elk-layered-generatePositionAndLayerIds.html)

Generate Position and Layer IDs

[](../../reference/options/org-eclipse-elk-layered-wrapping-strategy.html)

Graph Wrapping Strategy

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-activationThreshold.html)

Greedy Switch Activation Threshold

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-type.html)

Greedy Switch Crossing Minimization

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical-type.html)

Greedy Switch Crossing Minimization (hierarchical)

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-componentGroupId.html)

Group ID of the Node Type

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-crossingMinimizationId.html)

Group ID of the Node Type

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cycleBreakingId.html)

Group ID of the Node Type

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-hierarchicalSweepiness.html)

Hierarchical Sweepiness

[](../../reference/options/org-eclipse-elk-hierarchyHandling.html)

Hierarchy Handling

[](../../reference/options/org-eclipse-elk-hierarchyHandling_org-eclipse-elk-graphviz-dot.html)

Hierarchy Handling (Graphviz Dot)

[](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treeHeight.html)

High Degree Node Maximum Tree Height

[](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-threshold.html)

High Degree Node Threshold

[](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treatment.html)

High Degree Node Treatment

[](../../reference/options/org-eclipse-elk-spacing-labelPortHorizontal.html)

Horizontal spacing between Label and Port

[](../../reference/options/org-eclipse-elk-hypernode.html)

Hypernode

[](../../reference/options/org-eclipse-elk-alg-libavoid-idealNudgingDistance.html)

Ideal Nudging Distance

[](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveCuts.html)

Improve Cuts

[](../../reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingJunctions.html)

Improve Hyperedge Routes

[](../../reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingAddingAndDeletingJunctions.html)

Improve Hyperedge Routes Add/Delete

[](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveWrappedEdges.html)

Improve Wrapped Edges

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerPredOf.html)

In Layer Predecessor of

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerSuccOf.html)

In Layer Successor of

[](../../reference/options/org-eclipse-elk-rectpacking-inNewRow.html)

In new Row

[](../../reference/options/org-eclipse-elk-spacing-individual.html)

Individual Spacing

[](../../reference/options/org-eclipse-elk-spacing-individual_org-eclipse-elk-layered.html)

Individual Spacing (ELK Layered)

[](../../reference/options/org-eclipse-elk-edgeLabels-inline.html)

Inline Edge Labels

[](../../reference/options/org-eclipse-elk-insideSelfLoops-yo.html)

Inside Self Loop

[](../../reference/options/org-eclipse-elk-interactive.html)

Interactive

[](../../reference/options/org-eclipse-elk-interactiveLayout.html)

interactive Layout

[](../../reference/options/org-eclipse-elk-layered-interactiveReferencePoint.html)

Interactive Reference Point

[](../../reference/options/org-eclipse-elk-stress-iterationLimit.html)

Iteration Limit

[](../../reference/options/org-eclipse-elk-force-iterations.html)

Iterations

[](../../reference/options/org-eclipse-elk-graphviz-iterationsFactor.html)

Iterations Factor

[](../../reference/options/org-eclipse-elk-junctionPoints.html)

Junction Points

[](../../reference/options/org-eclipse-elk-graphviz-labelAngle.html)

Label Angle

[](../../reference/options/org-eclipse-elk-graphviz-labelDistance.html)

Label Distance

[](../../reference/options/org-eclipse-elk-labelManager.html)

Label Manager

[](../../reference/options/org-eclipse-elk-labels-labelManager.html)

Label Manager

[](../../reference/options/org-eclipse-elk-spacing-labelNode.html)

Label Node Spacing

[](../../reference/options/org-eclipse-elk-spacing-labelLabel.html)

Label Spacing

[](../../reference/options/org-eclipse-elk-layered-layering-coffmanGraham-layerBound.html)

Layer Bound

[](../../reference/options/org-eclipse-elk-layered-layering-layerChoiceConstraint.html)

Layer Choice Constraint

[](../../reference/options/org-eclipse-elk-layered-layering-layerConstraint.html)

Layer Constraint

[](../../reference/options/org-eclipse-elk-vertiflex-layerDistance.html)

Layer distance

[](../../reference/options/org-eclipse-elk-layered-layering-layerId.html)

Layer ID

[](../../reference/options/org-eclipse-elk-graphviz-layerSpacingFactor.html)

Layer Spacing Factor

[](../../reference/options/org-eclipse-elk-layered-layerUnzipping-strategy.html)

Layer Unzipping Strategy

[](../../reference/options/org-eclipse-elk-algorithm.html)

Layout Algorithm

[](../../reference/options/org-eclipse-elk-layoutAncestors.html)

Layout Ancestors

[](../../reference/options/org-eclipse-elk-stress-dimension.html)

Layout Dimension

[](../../reference/options/org-eclipse-elk-partitioning-partition.html)

Layout Partition

[](../../reference/options/org-eclipse-elk-partitioning-activate.html)

Layout Partitioning

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-linearSegments-deflectionDampening.html)

Linear Segments Deflection Dampening

[](../../reference/options/org-eclipse-elk-disco-debug-discoPolys.html)

List of Polyominoes

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-longEdgeStrategy.html)

Long Edge Ordering Strategy

[](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-cuts.html)

Manually Specified Cuts

[](../../reference/options/org-eclipse-elk-margins.html)

Margins

[](../../reference/options/org-eclipse-elk-alg-libavoid-isCluster.html)

Marks a node as a cluster

[](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-maxIterations.html)

Max Node Promotion Iterations

[](../../reference/options/org-eclipse-elk-graphviz-maxiter.html)

Max. Iterations

[](../../reference/options/org-eclipse-elk-maxAnimTime.html)

Maximal Animation Time

[](../../reference/options/org-eclipse-elk-layered-mergeEdges.html)

Merge Edges

[](../../reference/options/org-eclipse-elk-layered-mergeHierarchyEdges.html)

Merge Hierarchy-Crossing Edges

[](../../reference/options/org-eclipse-elk-minAnimTime.html)

Minimal Animation Time

[](../../reference/options/org-eclipse-elk-layered-layerUnzipping-minimizeEdgeLength.html)

Minimize Edge Length Heuristic

[](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-msd-freedom.html)

MSD Freedom

[](../../reference/options/org-eclipse-elk-noLayout.html)

No Layout

[](../../reference/options/org-eclipse-elk-layered-considerModelOrder-noModelOrder.html)

No Model Order

[](../../reference/options/org-eclipse-elk-topdownpacking-nodeArrangement-strategy.html)

Node arrangement strategy

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html)

Node Flexibility

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-default.html)

Node Flexibility Default

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-recomputeNodePlacement.html)

Node Flexibility Recompute Node Placement

[](../../reference/options/org-eclipse-elk-nodeLabels-padding.html)

Node Label Padding

[](../../reference/options/org-eclipse-elk-nodeLabels-placement.html)

Node Label Placement

[](../../reference/options/org-eclipse-elk-layered-layering-strategy.html)

Node Layering Strategy

[](../../reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html)

Node Node Between Layers Spacing

[](../../reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html)

Node Placement Strategy

[](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-strategy.html)

Node Promotion Strategy

[](../../reference/options/org-eclipse-elk-spacing-nodeSelfLoop.html)

Node Self Loop Spacing

[](../../reference/options/org-eclipse-elk-nodeSize-constraints.html)

Node Size Constraints

[](../../reference/options/org-eclipse-elk-nodeSize-minimum.html)

Node Size Minimum

[](../../reference/options/org-eclipse-elk-nodeSize-options.html)

Node Size Options

[](../../reference/options/org-eclipse-elk-spacing-nodeNode.html)

Node Spacing

[](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalSegmentsConnectedToShapes.html)

Nudge Orthogonal Segments

[](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalTouchingColinearSegments.html)

Nudge Orthogonal Touching Colinear Segments

[](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeSharedPathsWithCommonEndPoint.html)

Nudge Shared Paths With Common Endpoint

[](../../reference/options/org-eclipse-elk-topdown-sizeCategories.html)

Number of size categories

[](../../reference/options/org-eclipse-elk-omitNodeMicroLayout.html)

Omit Node Micro Layout

[](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-optimizationGoal.html)

Optimization Goal

[](../../reference/options/org-eclipse-elk-radial-orderId.html)

Order ID

[](../../reference/options/org-eclipse-elk-rectpacking-orderBySize.html)

Order nodes by height

[](../../reference/options/org-eclipse-elk-compaction-orthogonal.html)

Orthogonal Compaction

[](../../reference/options/org-eclipse-elk-radial-rotation-outgoingEdgeAngles.html)

Outgoing Edge Angles

[](../../reference/options/org-eclipse-elk-graphviz-overlapMode.html)

Overlap Removal

[](../../reference/options/org-eclipse-elk-padding.html)

Padding

[](../../reference/options/org-eclipse-elk-alg-libavoid-penaliseOrthogonalSharedPathsAtConnEnds.html)

Penalise Orthogonal Shared Paths

[](../../reference/options/org-eclipse-elk-alg-libavoid-performUnifyingNudgingPreprocessingStep.html)

Perform Unifying Nudging Preprocessing

[](../../reference/options/org-eclipse-elk-polyomino-highLevelSort.html)

Polyomino Primary Sorting Criterion

[](../../reference/options/org-eclipse-elk-polyomino-lowLevelSort.html)

Polyomino Secondary Sorting Criterion

[](../../reference/options/org-eclipse-elk-polyomino-traversalStrategy.html)

Polyomino Traversal Strategy

[](../../reference/options/org-eclipse-elk-portAlignment-default.html)

Port Alignment

[](../../reference/options/org-eclipse-elk-portAlignment-east.html)

Port Alignment (East)

[](../../reference/options/org-eclipse-elk-portAlignment-north.html)

Port Alignment (North)

[](../../reference/options/org-eclipse-elk-portAlignment-south.html)

Port Alignment (South)

[](../../reference/options/org-eclipse-elk-portAlignment-west.html)

Port Alignment (West)

[](../../reference/options/org-eclipse-elk-port-anchor.html)

Port Anchor Offset

[](../../reference/options/org-eclipse-elk-port-borderOffset.html)

Port Border Offset

[](../../reference/options/org-eclipse-elk-portConstraints.html)

Port Constraints

[](../../reference/options/org-eclipse-elk-alg-libavoid-portDirectionPenalty.html)

Port Direction Penalty

[](../../reference/options/org-eclipse-elk-port-index2.html)

Port Index

[](../../reference/options/org-eclipse-elk-portLabels-placement.html)

Port Label Placement

[](../../reference/options/org-eclipse-elk-portLabels-nextToPortIfPossible.html)

Port Labels Next to Port

[](../../reference/options/org-eclipse-elk-port-side.html)

Port Side

[](../../reference/options/org-eclipse-elk-layered-portSortingStrategy.html)

Port Sorting Strategy

[](../../reference/options/org-eclipse-elk-spacing-portPort.html)

Port Spacing

[](../../reference/options/org-eclipse-elk-position.html)

Position

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionChoiceConstraint.html)

Position Choice Constraint

[](../../reference/options/org-eclipse-elk-mrtree-compaction.html)

Position Constraint

[](../../reference/options/org-eclipse-elk-mrtree-positionConstraint.html)

Position Constraint

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionId.html)

Position ID

[](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-constraints.html)

Post Compaction Constraint Calculation

[](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-strategy.html)

Post Compaction Strategy

[](../../reference/options/org-eclipse-elk-priority.html)

Priority

[](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-box.html)

Priority (ELK Box)

[](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-force.html)

Priority (ELK Force)

[](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-layered.html)

Priority (ELK Layered)

[](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-mrtree.html)

Priority (ELK Mr. Tree)

[](../../reference/options/org-eclipse-elk-progressBar.html)

Progress Bar

[](../../reference/options/org-eclipse-elk-radial-radius.html)

Radius

[](../../reference/options/org-eclipse-elk-randomSeed.html)

Randomization Seed

[](../../reference/options/org-eclipse-elk-force-repulsivePower.html)

Repulsive Power

[](../../reference/options/org-eclipse-elk-layered-layerUnzipping-resetOnLongEdges.html)

Reset Alternation on Long Edges

[](../../reference/options/org-eclipse-elk-resolvedAlgorithm.html)

Resolved Layout Algorithm

[](../../reference/options/org-eclipse-elk-alg-libavoid-reverseDirectionPenalty.html)

Reverse Direction Penalty

[](../../reference/options/org-eclipse-elk-processingOrder-preferredRoot.html)

Root node for spanning tree construction

[](../../reference/options/org-eclipse-elk-processingOrder-rootSelection.html)

Root selection for spanning tree

[](../../reference/options/org-eclipse-elk-radial-rotate.html)

Rotate

[](../../reference/options/org-eclipse-elk-rectpacking-packing-compaction-rowHeightReevaluation.html)

Row Height Reevaluation

[](../../reference/options/org-eclipse-elk-scaleFactor.html)

Scale Factor

[](../../reference/options/org-eclipse-elk-mrtree-searchOrder.html)

Search Order

[](../../reference/options/org-eclipse-elk-alg-libavoid-segmentPenalty.html)

Segment Penalty

[](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopDistribution.html)

Self-Loop Distribution

[](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopOrdering.html)

Self-Loop Ordering

[](../../reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html)

Semi-Interactive Crossing Minimization

[](../../reference/options/org-eclipse-elk-separateConnectedComponents.html)

Separate Connected Components

[](../../reference/options/org-eclipse-elk-alg-libavoid-shapeBufferDistance.html)

Shape Buffer Distance

[](../../reference/options/org-eclipse-elk-json-shapeCoords.html)

Shape Coords

[](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-lastPlaceShift.html)

Shift Last Placed.

[](../../reference/options/org-eclipse-elk-layered-priority-shortness.html)

Shortness Priority

[](../../reference/options/org-eclipse-elk-layered-priority-shortness_org-eclipse-elk-layered.html)

Shortness Priority (ELK Layered)

[](../../reference/options/org-eclipse-elk-layered-edgeRouting-polyline-slopedEdgeZoneWidth.html)

Sloped Edge Zone Width

[](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-sloppy-layerSpacingFactor.html)

Sloppy Spline Layer Spacing Factor

[](../../reference/options/org-eclipse-elk-softwrappingFuzziness.html)

Softwrapping Fuzziness

[](../../reference/options/org-eclipse-elk-radial-sorter.html)

Sorter

[](../../reference/options/org-eclipse-elk-layered-spacing-baseValue.html)

Spacing Base Value

[](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-mode.html)

Spline Routing Mode

[](../../reference/options/org-eclipse-elk-layered-priority-straightness.html)

Straightness Priority

[](../../reference/options/org-eclipse-elk-stress-epsilon.html)

Stress Epsilon

[](../../reference/options/org-eclipse-elk-structure-structureExtractionStrategy.html)

Structure Extraction Strategy

[](../../reference/options/org-eclipse-elk-radial-rotation-targetAngle.html)

Target Angle

[](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-targetWidth.html)

Target Width

[](../../reference/options/org-eclipse-elk-layered-thoroughness.html)

Thoroughness

[](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeAspectRatio.html)

Topdown Hierarchical Node Aspect Ratio

[](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeWidth.html)

Topdown Hierarchical Node Width

[](../../reference/options/org-eclipse-elk-topdownLayout.html)

Topdown Layout

[](../../reference/options/org-eclipse-elk-topdown-nodeType.html)

Topdown Node Type

[](../../reference/options/org-eclipse-elk-topdown-scaleCap.html)

Topdown Scale Cap

[](../../reference/options/org-eclipse-elk-topdown-scaleFactor.html)

Topdown Scale Factor

[](../../reference/options/org-eclipse-elk-topdown-sizeApproximator.html)

Topdown Size Approximator

[](../../reference/options/org-eclipse-elk-radial-optimizationCriteria.html)

Translation Optimization

[](../../reference/options/org-eclipse-elk-portLabels-treatAsGroup.html)

Treat Port Labels as Group

[](../../reference/options/org-eclipse-elk-processingOrder-treeConstruction.html)

Tree Construction Strategy

[](../../reference/options/org-eclipse-elk-mrtree-treeLevel.html)

Tree Level

[](../../reference/options/org-eclipse-elk-rectpacking-trybox.html)

Try box layout first

[](../../reference/options/org-eclipse-elk-underlyingLayoutAlgorithm.html)

Underlying Layout Algorithm

[](../../reference/options/org-eclipse-elk-layered-layerUnzipping-layerSplit.html)

Unzipping Layer Split

[](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperBoundOnWidth.html)

Upper Bound On Width \[MinWidth Layerer\]

[](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperLayerEstimationScalingFactor.html)

Upper Layer Estimation Scaling Factor \[MinWidth Layerer\]

[](../../reference/options/org-eclipse-elk-overlapRemoval-maxIterations.html)

Upper limit for iterations of overlap removal

[](../../reference/options/org-eclipse-elk-layered-wrapping-validify-forbiddenIndices.html)

Valid Indices for Wrapping

[](../../reference/options/org-eclipse-elk-validateGraph.html)

Validate Graph

[](../../reference/options/org-eclipse-elk-validateOptions.html)

Validate Options

[](../../reference/options/org-eclipse-elk-layered-wrapping-validify-strategy.html)

Validification Strategy

[](../../reference/options/org-eclipse-elk-spacing-labelPortVertical.html)

Vertical spacing between Label and Port

[](../../reference/options/org-eclipse-elk-topdown-sizeCategoriesHierarchicalNodeWeight.html)

Weight of a node containing children for determining the graph size

[](../../reference/options/org-eclipse-elk-mrtree-weighting.html)

Weighting of Nodes

[](../../reference/options/org-eclipse-elk-overlapRemoval-runScanline.html)

Whether to run a supplementary scanline overlap check.

[](../../reference/options/org-eclipse-elk-rectpacking-whiteSpaceElimination-strategy.html)

White Space Approximation Strategy

[](../../reference/options/org-eclipse-elk-topdownpacking-whitespaceElimination-strategy.html)

Whitespace elimination strategy

[](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-strategy.html)

Width Approximation Strategy

[](../../reference/options/org-eclipse-elk-zoomToFit.html)

Zoom to Fit

[](../../reference/groups.html)

Layout Option Groups

[](../../reference/groups/org-eclipse-elk-box.html)

box

[](../../reference/groups/org-eclipse-elk-compaction.html)

compaction

[](../../reference/groups/org-eclipse-elk-layered-compaction.html)

compaction

[](../../reference/groups/org-eclipse-elk-layered-compaction-postCompaction.html)

compaction.postCompaction

[](../../reference/groups/org-eclipse-elk-disco-componentCompaction.html)

componentCompaction

[](../../reference/groups/org-eclipse-elk-layered-considerModelOrder.html)

considerModelOrder

[](../../reference/groups/org-eclipse-elk-layered-considerModelOrder-groupModelOrder.html)

considerModelOrder.groupModelOrder

[](../../reference/groups/org-eclipse-elk-layered-crossingMinimization.html)

crossingMinimization

[](../../reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitch.html)

crossingMinimization.greedySwitch

[](../../reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical.html)

crossingMinimization.greedySwitchHierarchical

[](../../reference/groups/org-eclipse-elk-layered-cycleBreaking.html)

cycleBreaking

[](../../reference/groups/org-eclipse-elk-disco-debug.html)

debug

[](../../reference/groups/org-eclipse-elk-edge.html)

edge

[](../../reference/groups/org-eclipse-elk-edgeLabels.html)

edgeLabels

[](../../reference/groups/org-eclipse-elk-layered-edgeLabels.html)

edgeLabels

[](../../reference/groups/org-eclipse-elk-layered-edgeRouting.html)

edgeRouting

[](../../reference/groups/org-eclipse-elk-layered-edgeRouting-polyline.html)

edgeRouting.polyline

[](../../reference/groups/org-eclipse-elk-layered-edgeRouting-splines.html)

edgeRouting.splines

[](../../reference/groups/org-eclipse-elk-layered-edgeRouting-splines-sloppy.html)

edgeRouting.splines.sloppy

[](../../reference/groups/org-eclipse-elk-font.html)

font

[](../../reference/groups/org-eclipse-elk-layered-highDegreeNodes.html)

highDegreeNodes

[](../../reference/groups/org-eclipse-elk-insideSelfLoops.html)

insideSelfLoops

[](../../reference/groups/org-eclipse-elk-json.html)

json

[](../../reference/groups/org-eclipse-elk-layered-layering.html)

layering

[](../../reference/groups/org-eclipse-elk-layered-layering-coffmanGraham.html)

layering.coffmanGraham

[](../../reference/groups/org-eclipse-elk-layered-layering-minWidth.html)

layering.minWidth

[](../../reference/groups/org-eclipse-elk-layered-layering-nodePromotion.html)

layering.nodePromotion

[](../../reference/groups/org-eclipse-elk-layered-layerUnzipping.html)

layerUnzipping

[](../../reference/groups/org-eclipse-elk-topdownpacking-nodeArrangement.html)

nodeArrangement

[](../../reference/groups/org-eclipse-elk-nodeLabels.html)

nodeLabels

[](../../reference/groups/org-eclipse-elk-layered-nodePlacement.html)

nodePlacement

[](../../reference/groups/org-eclipse-elk-layered-nodePlacement-bk.html)

nodePlacement.bk

[](../../reference/groups/org-eclipse-elk-layered-nodePlacement-linearSegments.html)

nodePlacement.linearSegments

[](../../reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex.html)

nodePlacement.networkSimplex

[](../../reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html)

nodePlacement.networkSimplex.nodeFlexibility

[](../../reference/groups/org-eclipse-elk-nodeSize.html)

nodeSize

[](../../reference/groups/org-eclipse-elk-overlapRemoval.html)

overlapRemoval

[](../../reference/groups/org-eclipse-elk-packing.html)

packing

[](../../reference/groups/org-eclipse-elk-rectpacking-packing-compaction.html)

packing.compaction

[](../../reference/groups/org-eclipse-elk-partitioning.html)

partitioning

[](../../reference/groups/org-eclipse-elk-polyomino.html)

polyomino

[](../../reference/groups/org-eclipse-elk-port.html)

port

[](../../reference/groups/org-eclipse-elk-portAlignment.html)

portAlignment

[](../../reference/groups/org-eclipse-elk-portLabels.html)

portLabels

[](../../reference/groups/org-eclipse-elk-layered-priority.html)

priority

[](../../reference/groups/org-eclipse-elk-processingOrder.html)

processingOrder

[](../../reference/groups/org-eclipse-elk-radial-rotation.html)

rotation

[](../../reference/groups/org-eclipse-elk-layered-spacing.html)

spacing

[](../../reference/groups/org-eclipse-elk-spacing.html)

spacing

[](../../reference/groups/org-eclipse-elk-structure.html)

structure

[](../../reference/groups/org-eclipse-elk-topdown.html)

topdown

[](../../reference/groups/org-eclipse-elk-rectpacking-whiteSpaceElimination.html)

whiteSpaceElimination

[](../../reference/groups/org-eclipse-elk-topdownpacking-whitespaceElimination.html)

whitespaceElimination

[](../../reference/groups/org-eclipse-elk-rectpacking-widthApproximation.html)

widthApproximation

[](../../reference/groups/org-eclipse-elk-layered-wrapping.html)

wrapping

[](../../reference/groups/org-eclipse-elk-layered-wrapping-cutting.html)

wrapping.cutting

[](../../reference/groups/org-eclipse-elk-layered-wrapping-cutting-msd.html)

wrapping.cutting.msd

[](../../reference/groups/org-eclipse-elk-layered-wrapping-multiEdge.html)

wrapping.multiEdge

[](../../reference/groups/org-eclipse-elk-layered-wrapping-singleEdge.html)

wrapping.singleEdge

[](../../reference/groups/org-eclipse-elk-layered-wrapping-validify.html)

wrapping.validify

[![Incubation](https://www.eclipse.org/images/egg-incubation.png)](https://www.eclipse.org/projects/what-is-incubation.php)

<!--
## Source links

- [Eclipse Layout Kernel™](https://www.eclipse.org/elk/)
- [Downloads](../../downloads.html)
- [Getting Started](../../gettingstarted.html)
- [Documentation](../../documentation.html)
- [Reference](../../reference.html)
- [Support](../../support.html)
- [Blog Posts](../../blog.html)
- [GitHub](https://github.com/eclipse-elk/elk)
- [Activate Inside Self Loops](../../reference/options/org-eclipse-elk-insideSelfLoops-activate.html)
- [Add Unnecessary Bendpoints](../../reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html)
- [Additional Port Space](../../reference/options/org-eclipse-elk-spacing-portsSurrounding.html)
- [Additional Wrapped Edges Spacing](../../reference/options/org-eclipse-elk-layered-wrapping-additionalEdgeSpacing.html)
- [Alignment](../../reference/options/org-eclipse-elk-alignment.html)
- [Allow Non-Flow Ports To Switch Sides](../../reference/options/org-eclipse-elk-layered-allowNonFlowPortsToSwitchSides.html)
- [Aspect Ratio](../../reference/options/org-eclipse-elk-aspectRatio.html)
- [BK Edge Straightening](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-edgeStraightening.html)
- [BK Fixed Alignment](../../reference/options/org-eclipse-elk-layered-nodePlacement-bk-fixedAlignment.html)
- [Comment Box](../../reference/options/org-eclipse-elk-commentBox.html)
- [Comment Comment Spacing](../../reference/options/org-eclipse-elk-spacing-commentComment.html)
- [Comment Node Spacing](../../reference/options/org-eclipse-elk-spacing-commentNode.html)
- [Components Spacing](../../reference/options/org-eclipse-elk-spacing-componentComponent.html)
- [Connected Components Compaction](../../reference/options/org-eclipse-elk-layered-compaction-connectedComponents.html)
- [Consider Model Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-strategy.html)
- [Consider Model Order for Components](../../reference/options/org-eclipse-elk-layered-considerModelOrder-components.html)
- [Consider Port Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-portModelOrder.html)
- [Content Alignment](../../reference/options/org-eclipse-elk-contentAlignment.html)
- [Correction Factor for Wrapping](../../reference/options/org-eclipse-elk-layered-wrapping-correctionFactor.html)
- [Crossing Counter Node Order Influence](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterNodeInfluence.html)
- [Crossing Counter Port Order Influence](../../reference/options/org-eclipse-elk-layered-considerModelOrder-crossingCounterPortInfluence.html)
- [Crossing Minimization Enforced Group Orders](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmEnforcedGroupOrders.html)
- [Crossing Minimization Group Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cmGroupOrderStrategy.html)
- [Crossing Minimization Strategy](../../reference/options/org-eclipse-elk-layered-crossingMinimization-strategy.html)
- [Cutting Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-strategy.html)
- [Cycle Breaking Group Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbGroupOrderStrategy.html)
- [Cycle Breaking Preferred Source Id](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredSourceId.html)
- [Cycle Breaking Preferred Target Id](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cbPreferredTargetId.html)
- [Cycle Breaking Strategy](../../reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html)
- [Debug Mode](../../reference/options/org-eclipse-elk-debugMode.html)
- [Direction](../../reference/options/org-eclipse-elk-direction.html)
- [Direction Congruency](../../reference/options/org-eclipse-elk-layered-directionCongruency.html)
- [Direction Priority](../../reference/options/org-eclipse-elk-layered-priority-direction.html)
- [Distance Penalty When Improving Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-distancePenalty.html)
- [Edge Center Label Placement Strategy](../../reference/options/org-eclipse-elk-layered-edgeLabels-centerLabelPlacementStrategy.html)
- [Edge Edge Between Layer Spacing](../../reference/options/org-eclipse-elk-layered-spacing-edgeEdgeBetweenLayers.html)
- [Edge Label Placement](../../reference/options/org-eclipse-elk-edgeLabels-placement.html)
- [Edge Label Side Selection](../../reference/options/org-eclipse-elk-layered-edgeLabels-sideSelection.html)
- [Edge Label Spacing](../../reference/options/org-eclipse-elk-spacing-edgeLabel.html)
- [Edge Node Between Layers Spacing](../../reference/options/org-eclipse-elk-layered-spacing-edgeNodeBetweenLayers.html)
- [Edge Node Spacing](../../reference/options/org-eclipse-elk-spacing-edgeNode.html)
- [Edge Routing](../../reference/options/org-eclipse-elk-edgeRouting.html)
- [Edge Spacing](../../reference/options/org-eclipse-elk-spacing-edgeEdge.html)
- [Edge Thickness](../../reference/options/org-eclipse-elk-edge-thickness.html)
- [Favor Straight Edges Over Balancing](../../reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html)
- [Feedback Edges](../../reference/options/org-eclipse-elk-layered-feedbackEdges.html)
- [Fixed Graph Size](../../reference/options/org-eclipse-elk-nodeSize-fixedGraphSize.html)
- [Force Node Model Order](../../reference/options/org-eclipse-elk-layered-crossingMinimization-forceNodeModelOrder.html)
- [Generate Position and Layer IDs](../../reference/options/org-eclipse-elk-layered-generatePositionAndLayerIds.html)
- [Graph Wrapping Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-strategy.html)
- [Greedy Switch Activation Threshold](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-activationThreshold.html)
- [Greedy Switch Crossing Minimization](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitch-type.html)
- [Greedy Switch Crossing Minimization (hierarchical)](../../reference/options/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical-type.html)
- [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-cycleBreakingId.html)
- [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-crossingMinimizationId.html)
- [Group ID of the Node Type](../../reference/options/org-eclipse-elk-layered-considerModelOrder-groupModelOrder-componentGroupId.html)
- [Hierarchical Sweepiness](../../reference/options/org-eclipse-elk-layered-crossingMinimization-hierarchicalSweepiness.html)
- [Hierarchy Handling](../../reference/options/org-eclipse-elk-hierarchyHandling.html)
- [High Degree Node Maximum Tree Height](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treeHeight.html)
- [High Degree Node Threshold](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-threshold.html)
- [High Degree Node Treatment](../../reference/options/org-eclipse-elk-layered-highDegreeNodes-treatment.html)
- [Horizontal spacing between Label and Port](../../reference/options/org-eclipse-elk-spacing-labelPortHorizontal.html)
- [Hypernode](../../reference/options/org-eclipse-elk-hypernode.html)
- [Improve Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveCuts.html)
- [Improve Wrapped Edges](../../reference/options/org-eclipse-elk-layered-wrapping-multiEdge-improveWrappedEdges.html)
- [In Layer Predecessor of](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerPredOf.html)
- [In Layer Successor of](../../reference/options/org-eclipse-elk-layered-crossingMinimization-inLayerSuccOf.html)
- [Individual Spacing](../../reference/options/org-eclipse-elk-spacing-individual_org-eclipse-elk-layered.html)
- [Inline Edge Labels](../../reference/options/org-eclipse-elk-edgeLabels-inline.html)
- [Inside Self Loop](../../reference/options/org-eclipse-elk-insideSelfLoops-yo.html)
- [interactive Layout](../../reference/options/org-eclipse-elk-interactiveLayout.html)
- [Interactive Reference Point](../../reference/options/org-eclipse-elk-layered-interactiveReferencePoint.html)
- [Junction Points](../../reference/options/org-eclipse-elk-junctionPoints.html)
- [Label Node Spacing](../../reference/options/org-eclipse-elk-spacing-labelNode.html)
- [Label Spacing](../../reference/options/org-eclipse-elk-spacing-labelLabel.html)
- [Layer Bound](../../reference/options/org-eclipse-elk-layered-layering-coffmanGraham-layerBound.html)
- [Layer Choice Constraint](../../reference/options/org-eclipse-elk-layered-layering-layerChoiceConstraint.html)
- [Layer Constraint](../../reference/options/org-eclipse-elk-layered-layering-layerConstraint.html)
- [Layer ID](../../reference/options/org-eclipse-elk-layered-layering-layerId.html)
- [Layer Unzipping Strategy](../../reference/options/org-eclipse-elk-layered-layerUnzipping-strategy.html)
- [Layout Partition](../../reference/options/org-eclipse-elk-partitioning-partition.html)
- [Layout Partitioning](../../reference/options/org-eclipse-elk-partitioning-activate.html)
- [Linear Segments Deflection Dampening](../../reference/options/org-eclipse-elk-layered-nodePlacement-linearSegments-deflectionDampening.html)
- [Long Edge Ordering Strategy](../../reference/options/org-eclipse-elk-layered-considerModelOrder-longEdgeStrategy.html)
- [Manually Specified Cuts](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-cuts.html)
- [Margins](../../reference/options/org-eclipse-elk-margins.html)
- [Max Node Promotion Iterations](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-maxIterations.html)
- [Merge Edges](../../reference/options/org-eclipse-elk-layered-mergeEdges.html)
- [Merge Hierarchy-Crossing Edges](../../reference/options/org-eclipse-elk-layered-mergeHierarchyEdges.html)
- [Minimize Edge Length Heuristic](../../reference/options/org-eclipse-elk-layered-layerUnzipping-minimizeEdgeLength.html)
- [MSD Freedom](../../reference/options/org-eclipse-elk-layered-wrapping-cutting-msd-freedom.html)
- [No Layout](../../reference/options/org-eclipse-elk-noLayout.html)
- [No Model Order](../../reference/options/org-eclipse-elk-layered-considerModelOrder-noModelOrder.html)
- [Node Flexibility](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html)
- [Node Flexibility Default](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-default.html)
- [Node Flexibility Recompute Node Placement](../../reference/options/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility-recomputeNodePlacement.html)
- [Node Label Padding](../../reference/options/org-eclipse-elk-nodeLabels-padding.html)
- [Node Label Placement](../../reference/options/org-eclipse-elk-nodeLabels-placement.html)
- [Node Layering Strategy](../../reference/options/org-eclipse-elk-layered-layering-strategy.html)
- [Node Node Between Layers Spacing](../../reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html)
- [Node Placement Strategy](../../reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html)
- [Node Promotion Strategy](../../reference/options/org-eclipse-elk-layered-layering-nodePromotion-strategy.html)
- [Node Self Loop Spacing](../../reference/options/org-eclipse-elk-spacing-nodeSelfLoop.html)
- [Node Size Constraints](../../reference/options/org-eclipse-elk-nodeSize-constraints.html)
- [Node Size Minimum](../../reference/options/org-eclipse-elk-nodeSize-minimum.html)
- [Node Size Options](../../reference/options/org-eclipse-elk-nodeSize-options.html)
- [Node Spacing](../../reference/options/org-eclipse-elk-spacing-nodeNode.html)
- [Padding](../../reference/options/org-eclipse-elk-padding.html)
- [Port Alignment](../../reference/options/org-eclipse-elk-portAlignment-default.html)
- [Port Alignment (East)](../../reference/options/org-eclipse-elk-portAlignment-east.html)
- [Port Alignment (North)](../../reference/options/org-eclipse-elk-portAlignment-north.html)
- [Port Alignment (South)](../../reference/options/org-eclipse-elk-portAlignment-south.html)
- [Port Alignment (West)](../../reference/options/org-eclipse-elk-portAlignment-west.html)
- [Port Anchor Offset](../../reference/options/org-eclipse-elk-port-anchor.html)
- [Port Border Offset](../../reference/options/org-eclipse-elk-port-borderOffset.html)
- [Port Constraints](../../reference/options/org-eclipse-elk-portConstraints.html)
- [Port Index](../../reference/options/org-eclipse-elk-port-index2.html)
- [Port Label Placement](../../reference/options/org-eclipse-elk-portLabels-placement.html)
- [Port Labels Next to Port](../../reference/options/org-eclipse-elk-portLabels-nextToPortIfPossible.html)
- [Port Side](../../reference/options/org-eclipse-elk-port-side.html)
- [Port Sorting Strategy](../../reference/options/org-eclipse-elk-layered-portSortingStrategy.html)
- [Port Spacing](../../reference/options/org-eclipse-elk-spacing-portPort.html)
- [Position](../../reference/options/org-eclipse-elk-position.html)
- [Position Choice Constraint](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionChoiceConstraint.html)
- [Position ID](../../reference/options/org-eclipse-elk-layered-crossingMinimization-positionId.html)
- [Post Compaction Constraint Calculation](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-constraints.html)
- [Post Compaction Strategy](../../reference/options/org-eclipse-elk-layered-compaction-postCompaction-strategy.html)
- [Priority](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-layered.html)
- [Randomization Seed](../../reference/options/org-eclipse-elk-randomSeed.html)
- [Reset Alternation on Long Edges](../../reference/options/org-eclipse-elk-layered-layerUnzipping-resetOnLongEdges.html)
- [Self-Loop Distribution](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopDistribution.html)
- [Self-Loop Ordering](../../reference/options/org-eclipse-elk-layered-edgeRouting-selfLoopOrdering.html)
- [Semi-Interactive Crossing Minimization](../../reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html)
- [Separate Connected Components](../../reference/options/org-eclipse-elk-separateConnectedComponents.html)
- [Shortness Priority](../../reference/options/org-eclipse-elk-layered-priority-shortness_org-eclipse-elk-layered.html)
- [Sloped Edge Zone Width](../../reference/options/org-eclipse-elk-layered-edgeRouting-polyline-slopedEdgeZoneWidth.html)
- [Sloppy Spline Layer Spacing Factor](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-sloppy-layerSpacingFactor.html)
- [Spacing Base Value](../../reference/options/org-eclipse-elk-layered-spacing-baseValue.html)
- [Spline Routing Mode](../../reference/options/org-eclipse-elk-layered-edgeRouting-splines-mode.html)
- [Straightness Priority](../../reference/options/org-eclipse-elk-layered-priority-straightness.html)
- [Thoroughness](../../reference/options/org-eclipse-elk-layered-thoroughness.html)
- [Topdown Hierarchical Node Aspect Ratio](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeAspectRatio.html)
- [Topdown Hierarchical Node Width](../../reference/options/org-eclipse-elk-topdown-hierarchicalNodeWidth.html)
- [Topdown Layout](../../reference/options/org-eclipse-elk-topdownLayout.html)
- [Topdown Node Type](../../reference/options/org-eclipse-elk-topdown-nodeType.html)
- [Topdown Scale Factor](../../reference/options/org-eclipse-elk-topdown-scaleFactor.html)
- [Treat Port Labels as Group](../../reference/options/org-eclipse-elk-portLabels-treatAsGroup.html)
- [Unzipping Layer Split](../../reference/options/org-eclipse-elk-layered-layerUnzipping-layerSplit.html)
- [Upper Bound On Width [MinWidth Layerer]](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperBoundOnWidth.html)
- [Upper Layer Estimation Scaling Factor [MinWidth Layerer]](../../reference/options/org-eclipse-elk-layered-layering-minWidth-upperLayerEstimationScalingFactor.html)
- [Valid Indices for Wrapping](../../reference/options/org-eclipse-elk-layered-wrapping-validify-forbiddenIndices.html)
- [Validification Strategy](../../reference/options/org-eclipse-elk-layered-wrapping-validify-strategy.html)
- [Vertical spacing between Label and Port](../../reference/options/org-eclipse-elk-spacing-labelPortVertical.html)
- [Algorithms](../../reference/algorithms.html)
- [Draw2D Layout](../../reference/algorithms/org-eclipse-elk-conn-gmf-layouter-Draw2D.html)
- [ELK Box](../../reference/algorithms/org-eclipse-elk-box.html)
- [ELK DisCo](../../reference/algorithms/org-eclipse-elk-disco.html)
- [ELK Fixed](../../reference/algorithms/org-eclipse-elk-fixed.html)
- [ELK Force](../../reference/algorithms/org-eclipse-elk-force.html)
- [ELK Layered](../../reference/algorithms/org-eclipse-elk-layered.html)
- [ELK Mr. Tree](../../reference/algorithms/org-eclipse-elk-mrtree.html)
- [ELK Radial](../../reference/algorithms/org-eclipse-elk-radial.html)
- [ELK Randomizer](../../reference/algorithms/org-eclipse-elk-random.html)
- [ELK Rectangle Packing](../../reference/algorithms/org-eclipse-elk-rectpacking.html)
- [ELK SPOrE Compaction](../../reference/algorithms/org-eclipse-elk-sporeCompaction.html)
- [ELK SPOrE Overlap Removal](../../reference/algorithms/org-eclipse-elk-sporeOverlap.html)
- [ELK Stress](../../reference/algorithms/org-eclipse-elk-stress.html)
- [ELK Top-down Packing](../../reference/algorithms/org-eclipse-elk-topdownpacking.html)
- [ELK VertiFlex](../../reference/algorithms/org-eclipse-elk-vertiflex.html)
- [Graphviz Circo](../../reference/algorithms/org-eclipse-elk-graphviz-circo.html)
- [Graphviz Dot](../../reference/algorithms/org-eclipse-elk-graphviz-dot.html)
- [Graphviz FDP](../../reference/algorithms/org-eclipse-elk-graphviz-fdp.html)
- [Graphviz Neato](../../reference/algorithms/org-eclipse-elk-graphviz-neato.html)
- [Graphviz Twopi](../../reference/algorithms/org-eclipse-elk-graphviz-twopi.html)
- [Libavoid](../../reference/algorithms/org-eclipse-elk-alg-libavoid.html)
- [Layout Options](../../reference/options.html)
- [Adapt Port Positions](../../reference/options/org-eclipse-elk-graphviz-adaptPortPositions.html)
- [Additional Wedge Space](../../reference/options/org-eclipse-elk-radial-rotation-computeAdditionalWedgeSpace.html)
- [Angle Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-anglePenalty.html)
- [Animate](../../reference/options/org-eclipse-elk-animate.html)
- [Animation Time Factor](../../reference/options/org-eclipse-elk-animTimeFactor.html)
- [Annulus Wedge Criteria](../../reference/options/org-eclipse-elk-radial-wedgeCriteria.html)
- [Bend Points](../../reference/options/org-eclipse-elk-bendPoints.html)
- [Box Layout Mode](../../reference/options/org-eclipse-elk-box-packingMode.html)
- [Center On Root](../../reference/options/org-eclipse-elk-radial-centerOnRoot.html)
- [Child Area Height](../../reference/options/org-eclipse-elk-childAreaHeight.html)
- [Child Area Width](../../reference/options/org-eclipse-elk-childAreaWidth.html)
- [Cluster Crossing Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-clusterCrossingPenalty.html)
- [Compaction](../../reference/options/org-eclipse-elk-radial-compactor.html)
- [Compaction iterations](../../reference/options/org-eclipse-elk-rectpacking-packing-compaction-iterations.html)
- [Compaction Step Size](../../reference/options/org-eclipse-elk-radial-compactionStepSize.html)
- [Compaction Strategy](../../reference/options/org-eclipse-elk-compaction-compactionStrategy.html)
- [Compaction Strategy](../../reference/options/org-eclipse-elk-rectpacking-packing-strategy.html)
- [Concentrate Edges](../../reference/options/org-eclipse-elk-graphviz-concentrate.html)
- [Connected Components Compaction Strategy](../../reference/options/org-eclipse-elk-disco-componentCompaction-strategy.html)
- [Connected Components Layout Algorithm](../../reference/options/org-eclipse-elk-disco-componentCompaction-componentLayoutAlgorithm.html)
- [Consider node model order](../../reference/options/org-eclipse-elk-vertiflex-considerNodeModelOrder.html)
- [Cost Function for Spanning Tree](../../reference/options/org-eclipse-elk-processingOrder-spanningTreeCostFunction.html)
- [Crossing Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-crossingPenalty.html)
- [Current position of a node in the order of nodes](../../reference/options/org-eclipse-elk-rectpacking-currentPosition.html)
- [DCGraph](../../reference/options/org-eclipse-elk-disco-debug-discoGraph.html)
- [Default process timeout.](../../reference/options/org-eclipse-elk-alg-libavoid-processTimeout.html)
- [Desired Edge Length](../../reference/options/org-eclipse-elk-stress-desiredEdgeLength.html)
- [Desired index of node](../../reference/options/org-eclipse-elk-rectpacking-desiredPosition.html)
- [Distance Model](../../reference/options/org-eclipse-elk-graphviz-neatoModel.html)
- [Eades Repulsion](../../reference/options/org-eclipse-elk-force-repulsion.html)
- [Edge Coords](../../reference/options/org-eclipse-elk-json-edgeCoords.html)
- [Edge End Texture Length](../../reference/options/org-eclipse-elk-mrtree-edgeEndTextureLength.html)
- [Edge layout strategy](../../reference/options/org-eclipse-elk-vertiflex-layoutStrategy.html)
- [Edge Routing Mode](../../reference/options/org-eclipse-elk-mrtree-edgeRoutingMode.html)
- [Edge Type](../../reference/options/org-eclipse-elk-edge-type.html)
- [Enable Hyperedges From Common Source](../../reference/options/org-eclipse-elk-alg-libavoid-enableHyperedgesFromCommonSource.html)
- [Epsilon](../../reference/options/org-eclipse-elk-graphviz-epsilon.html)
- [Expand Nodes](../../reference/options/org-eclipse-elk-expandNodes.html)
- [Fill Polyominoes](../../reference/options/org-eclipse-elk-polyomino-fill.html)
- [Fixed Position](../../reference/options/org-eclipse-elk-stress-fixed.html)
- [Fixed Shared Path Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-fixedSharedPathPenalty.html)
- [Fixed vertical position](../../reference/options/org-eclipse-elk-vertiflex-verticalConstraint.html)
- [Font Name](../../reference/options/org-eclipse-elk-font-name.html)
- [Font Size](../../reference/options/org-eclipse-elk-font-size.html)
- [Force Model](../../reference/options/org-eclipse-elk-force-model.html)
- [FR Temperature](../../reference/options/org-eclipse-elk-force-temperature.html)
- [Hierarchy Handling (Graphviz Dot)](../../reference/options/org-eclipse-elk-hierarchyHandling_org-eclipse-elk-graphviz-dot.html)
- [Ideal Nudging Distance](../../reference/options/org-eclipse-elk-alg-libavoid-idealNudgingDistance.html)
- [Improve Hyperedge Routes](../../reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingJunctions.html)
- [Improve Hyperedge Routes Add/Delete](../../reference/options/org-eclipse-elk-alg-libavoid-improveHyperedgeRoutesMovingAddingAndDeletingJunctions.html)
- [In new Row](../../reference/options/org-eclipse-elk-rectpacking-inNewRow.html)
- [Individual Spacing](../../reference/options/org-eclipse-elk-spacing-individual.html)
- [Interactive](../../reference/options/org-eclipse-elk-interactive.html)
- [Iteration Limit](../../reference/options/org-eclipse-elk-stress-iterationLimit.html)
- [Iterations](../../reference/options/org-eclipse-elk-force-iterations.html)
- [Iterations Factor](../../reference/options/org-eclipse-elk-graphviz-iterationsFactor.html)
- [Label Angle](../../reference/options/org-eclipse-elk-graphviz-labelAngle.html)
- [Label Distance](../../reference/options/org-eclipse-elk-graphviz-labelDistance.html)
- [Label Manager](../../reference/options/org-eclipse-elk-labelManager.html)
- [Label Manager](../../reference/options/org-eclipse-elk-labels-labelManager.html)
- [Layer distance](../../reference/options/org-eclipse-elk-vertiflex-layerDistance.html)
- [Layer Spacing Factor](../../reference/options/org-eclipse-elk-graphviz-layerSpacingFactor.html)
- [Layout Algorithm](../../reference/options/org-eclipse-elk-algorithm.html)
- [Layout Ancestors](../../reference/options/org-eclipse-elk-layoutAncestors.html)
- [Layout Dimension](../../reference/options/org-eclipse-elk-stress-dimension.html)
- [List of Polyominoes](../../reference/options/org-eclipse-elk-disco-debug-discoPolys.html)
- [Marks a node as a cluster](../../reference/options/org-eclipse-elk-alg-libavoid-isCluster.html)
- [Max. Iterations](../../reference/options/org-eclipse-elk-graphviz-maxiter.html)
- [Maximal Animation Time](../../reference/options/org-eclipse-elk-maxAnimTime.html)
- [Minimal Animation Time](../../reference/options/org-eclipse-elk-minAnimTime.html)
- [Node arrangement strategy](../../reference/options/org-eclipse-elk-topdownpacking-nodeArrangement-strategy.html)
- [Nudge Orthogonal Segments](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalSegmentsConnectedToShapes.html)
- [Nudge Orthogonal Touching Colinear Segments](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeOrthogonalTouchingColinearSegments.html)
- [Nudge Shared Paths With Common Endpoint](../../reference/options/org-eclipse-elk-alg-libavoid-nudgeSharedPathsWithCommonEndPoint.html)
- [Number of size categories](../../reference/options/org-eclipse-elk-topdown-sizeCategories.html)
- [Omit Node Micro Layout](../../reference/options/org-eclipse-elk-omitNodeMicroLayout.html)
- [Optimization Goal](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-optimizationGoal.html)
- [Order ID](../../reference/options/org-eclipse-elk-radial-orderId.html)
- [Order nodes by height](../../reference/options/org-eclipse-elk-rectpacking-orderBySize.html)
- [Orthogonal Compaction](../../reference/options/org-eclipse-elk-compaction-orthogonal.html)
- [Outgoing Edge Angles](../../reference/options/org-eclipse-elk-radial-rotation-outgoingEdgeAngles.html)
- [Overlap Removal](../../reference/options/org-eclipse-elk-graphviz-overlapMode.html)
- [Penalise Orthogonal Shared Paths](../../reference/options/org-eclipse-elk-alg-libavoid-penaliseOrthogonalSharedPathsAtConnEnds.html)
- [Perform Unifying Nudging Preprocessing](../../reference/options/org-eclipse-elk-alg-libavoid-performUnifyingNudgingPreprocessingStep.html)
- [Polyomino Primary Sorting Criterion](../../reference/options/org-eclipse-elk-polyomino-highLevelSort.html)
- [Polyomino Secondary Sorting Criterion](../../reference/options/org-eclipse-elk-polyomino-lowLevelSort.html)
- [Polyomino Traversal Strategy](../../reference/options/org-eclipse-elk-polyomino-traversalStrategy.html)
- [Port Direction Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-portDirectionPenalty.html)
- [Position Constraint](../../reference/options/org-eclipse-elk-mrtree-compaction.html)
- [Position Constraint](../../reference/options/org-eclipse-elk-mrtree-positionConstraint.html)
- [Priority](../../reference/options/org-eclipse-elk-priority.html)
- [Priority (ELK Box)](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-box.html)
- [Priority (ELK Force)](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-force.html)
- [Priority (ELK Mr. Tree)](../../reference/options/org-eclipse-elk-priority_org-eclipse-elk-mrtree.html)
- [Progress Bar](../../reference/options/org-eclipse-elk-progressBar.html)
- [Radius](../../reference/options/org-eclipse-elk-radial-radius.html)
- [Repulsive Power](../../reference/options/org-eclipse-elk-force-repulsivePower.html)
- [Resolved Layout Algorithm](../../reference/options/org-eclipse-elk-resolvedAlgorithm.html)
- [Reverse Direction Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-reverseDirectionPenalty.html)
- [Root node for spanning tree construction](../../reference/options/org-eclipse-elk-processingOrder-preferredRoot.html)
- [Root selection for spanning tree](../../reference/options/org-eclipse-elk-processingOrder-rootSelection.html)
- [Rotate](../../reference/options/org-eclipse-elk-radial-rotate.html)
- [Row Height Reevaluation](../../reference/options/org-eclipse-elk-rectpacking-packing-compaction-rowHeightReevaluation.html)
- [Scale Factor](../../reference/options/org-eclipse-elk-scaleFactor.html)
- [Search Order](../../reference/options/org-eclipse-elk-mrtree-searchOrder.html)
- [Segment Penalty](../../reference/options/org-eclipse-elk-alg-libavoid-segmentPenalty.html)
- [Shape Buffer Distance](../../reference/options/org-eclipse-elk-alg-libavoid-shapeBufferDistance.html)
- [Shape Coords](../../reference/options/org-eclipse-elk-json-shapeCoords.html)
- [Shift Last Placed.](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-lastPlaceShift.html)
- [Shortness Priority](../../reference/options/org-eclipse-elk-layered-priority-shortness.html)
- [Softwrapping Fuzziness](../../reference/options/org-eclipse-elk-softwrappingFuzziness.html)
- [Sorter](../../reference/options/org-eclipse-elk-radial-sorter.html)
- [Stress Epsilon](../../reference/options/org-eclipse-elk-stress-epsilon.html)
- [Structure Extraction Strategy](../../reference/options/org-eclipse-elk-structure-structureExtractionStrategy.html)
- [Target Angle](../../reference/options/org-eclipse-elk-radial-rotation-targetAngle.html)
- [Target Width](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-targetWidth.html)
- [Topdown Scale Cap](../../reference/options/org-eclipse-elk-topdown-scaleCap.html)
- [Topdown Size Approximator](../../reference/options/org-eclipse-elk-topdown-sizeApproximator.html)
- [Translation Optimization](../../reference/options/org-eclipse-elk-radial-optimizationCriteria.html)
- [Tree Construction Strategy](../../reference/options/org-eclipse-elk-processingOrder-treeConstruction.html)
- [Tree Level](../../reference/options/org-eclipse-elk-mrtree-treeLevel.html)
- [Try box layout first](../../reference/options/org-eclipse-elk-rectpacking-trybox.html)
- [Underlying Layout Algorithm](../../reference/options/org-eclipse-elk-underlyingLayoutAlgorithm.html)
- [Upper limit for iterations of overlap removal](../../reference/options/org-eclipse-elk-overlapRemoval-maxIterations.html)
- [Validate Graph](../../reference/options/org-eclipse-elk-validateGraph.html)
- [Validate Options](../../reference/options/org-eclipse-elk-validateOptions.html)
- [Weight of a node containing children for determining the graph size](../../reference/options/org-eclipse-elk-topdown-sizeCategoriesHierarchicalNodeWeight.html)
- [Weighting of Nodes](../../reference/options/org-eclipse-elk-mrtree-weighting.html)
- [Whether to run a supplementary scanline overlap check.](../../reference/options/org-eclipse-elk-overlapRemoval-runScanline.html)
- [White Space Approximation Strategy](../../reference/options/org-eclipse-elk-rectpacking-whiteSpaceElimination-strategy.html)
- [Whitespace elimination strategy](../../reference/options/org-eclipse-elk-topdownpacking-whitespaceElimination-strategy.html)
- [Width Approximation Strategy](../../reference/options/org-eclipse-elk-rectpacking-widthApproximation-strategy.html)
- [Zoom to Fit](../../reference/options/org-eclipse-elk-zoomToFit.html)
- [Layout Option Groups](../../reference/groups.html)
- [box](../../reference/groups/org-eclipse-elk-box.html)
- [compaction](../../reference/groups/org-eclipse-elk-compaction.html)
- [compaction](../../reference/groups/org-eclipse-elk-layered-compaction.html)
- [compaction.postCompaction](../../reference/groups/org-eclipse-elk-layered-compaction-postCompaction.html)
- [componentCompaction](../../reference/groups/org-eclipse-elk-disco-componentCompaction.html)
- [considerModelOrder](../../reference/groups/org-eclipse-elk-layered-considerModelOrder.html)
- [considerModelOrder.groupModelOrder](../../reference/groups/org-eclipse-elk-layered-considerModelOrder-groupModelOrder.html)
- [crossingMinimization](../../reference/groups/org-eclipse-elk-layered-crossingMinimization.html)
- [crossingMinimization.greedySwitch](../../reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitch.html)
- [crossingMinimization.greedySwitchHierarchical](../../reference/groups/org-eclipse-elk-layered-crossingMinimization-greedySwitchHierarchical.html)
- [cycleBreaking](../../reference/groups/org-eclipse-elk-layered-cycleBreaking.html)
- [debug](../../reference/groups/org-eclipse-elk-disco-debug.html)
- [edge](../../reference/groups/org-eclipse-elk-edge.html)
- [edgeLabels](../../reference/groups/org-eclipse-elk-edgeLabels.html)
- [edgeLabels](../../reference/groups/org-eclipse-elk-layered-edgeLabels.html)
- [edgeRouting](../../reference/groups/org-eclipse-elk-layered-edgeRouting.html)
- [edgeRouting.polyline](../../reference/groups/org-eclipse-elk-layered-edgeRouting-polyline.html)
- [edgeRouting.splines](../../reference/groups/org-eclipse-elk-layered-edgeRouting-splines.html)
- [edgeRouting.splines.sloppy](../../reference/groups/org-eclipse-elk-layered-edgeRouting-splines-sloppy.html)
- [font](../../reference/groups/org-eclipse-elk-font.html)
- [highDegreeNodes](../../reference/groups/org-eclipse-elk-layered-highDegreeNodes.html)
- [insideSelfLoops](../../reference/groups/org-eclipse-elk-insideSelfLoops.html)
- [json](../../reference/groups/org-eclipse-elk-json.html)
- [layering](../../reference/groups/org-eclipse-elk-layered-layering.html)
- [layering.coffmanGraham](../../reference/groups/org-eclipse-elk-layered-layering-coffmanGraham.html)
- [layering.minWidth](../../reference/groups/org-eclipse-elk-layered-layering-minWidth.html)
- [layering.nodePromotion](../../reference/groups/org-eclipse-elk-layered-layering-nodePromotion.html)
- [layerUnzipping](../../reference/groups/org-eclipse-elk-layered-layerUnzipping.html)
- [nodeArrangement](../../reference/groups/org-eclipse-elk-topdownpacking-nodeArrangement.html)
- [nodeLabels](../../reference/groups/org-eclipse-elk-nodeLabels.html)
- [nodePlacement](../../reference/groups/org-eclipse-elk-layered-nodePlacement.html)
- [nodePlacement.bk](../../reference/groups/org-eclipse-elk-layered-nodePlacement-bk.html)
- [nodePlacement.linearSegments](../../reference/groups/org-eclipse-elk-layered-nodePlacement-linearSegments.html)
- [nodePlacement.networkSimplex](../../reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex.html)
- [nodePlacement.networkSimplex.nodeFlexibility](../../reference/groups/org-eclipse-elk-layered-nodePlacement-networkSimplex-nodeFlexibility.html)
- [nodeSize](../../reference/groups/org-eclipse-elk-nodeSize.html)
- [overlapRemoval](../../reference/groups/org-eclipse-elk-overlapRemoval.html)
- [packing](../../reference/groups/org-eclipse-elk-packing.html)
- [packing.compaction](../../reference/groups/org-eclipse-elk-rectpacking-packing-compaction.html)
- [partitioning](../../reference/groups/org-eclipse-elk-partitioning.html)
- [polyomino](../../reference/groups/org-eclipse-elk-polyomino.html)
- [port](../../reference/groups/org-eclipse-elk-port.html)
- [portAlignment](../../reference/groups/org-eclipse-elk-portAlignment.html)
- [portLabels](../../reference/groups/org-eclipse-elk-portLabels.html)
- [priority](../../reference/groups/org-eclipse-elk-layered-priority.html)
- [processingOrder](../../reference/groups/org-eclipse-elk-processingOrder.html)
- [rotation](../../reference/groups/org-eclipse-elk-radial-rotation.html)
- [spacing](../../reference/groups/org-eclipse-elk-layered-spacing.html)
- [spacing](../../reference/groups/org-eclipse-elk-spacing.html)
- [structure](../../reference/groups/org-eclipse-elk-structure.html)
- [topdown](../../reference/groups/org-eclipse-elk-topdown.html)
- [whiteSpaceElimination](../../reference/groups/org-eclipse-elk-rectpacking-whiteSpaceElimination.html)
- [whitespaceElimination](../../reference/groups/org-eclipse-elk-topdownpacking-whitespaceElimination.html)
- [widthApproximation](../../reference/groups/org-eclipse-elk-rectpacking-widthApproximation.html)
- [wrapping](../../reference/groups/org-eclipse-elk-layered-wrapping.html)
- [wrapping.cutting](../../reference/groups/org-eclipse-elk-layered-wrapping-cutting.html)
- [wrapping.cutting.msd](../../reference/groups/org-eclipse-elk-layered-wrapping-cutting-msd.html)
- [wrapping.multiEdge](../../reference/groups/org-eclipse-elk-layered-wrapping-multiEdge.html)
- [wrapping.singleEdge](../../reference/groups/org-eclipse-elk-layered-wrapping-singleEdge.html)
- [wrapping.validify](../../reference/groups/org-eclipse-elk-layered-wrapping-validify.html)
- [https://www.eclipse.org/projects/what-is-incubation.php](https://www.eclipse.org/projects/what-is-incubation.php)
- [https://www.eclipse.org](https://www.eclipse.org)
- [Eclipse Foundation](http://www.eclipse.org/)
- [Privacy Policy](http://www.eclipse.org/legal/privacy.php)
- [Website Terms of Use](http://www.eclipse.org/legal/termsofuse.php)
- [Copyright Agent](http://www.eclipse.org/legal/copyright.php)
- [Legal](http://www.eclipse.org/legal)
-->
