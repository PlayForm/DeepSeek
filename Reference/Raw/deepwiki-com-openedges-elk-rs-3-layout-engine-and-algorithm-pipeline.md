# Layout Engine and Algorithm Pipeline
Relevant source files
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/elk_layered.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/elk_layered.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/mod.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/mod.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/layered_phases.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/layered_phases.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/mod.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/mod.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/layered_meta_data_provider.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/layered_meta_data_provider.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/layered_options.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/layered_options.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/mod.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/options/mod.rs)
  * [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs)
  * [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/mod.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/mod.rs)
  * [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/options/topdown_size_approximator_util.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/options/topdown_size_approximator_util.rs)
  * [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs)
  * [plugins/org.eclipse.elk.graph.json/src/bin/model_parity_layout_runner.rs](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.graph.json/src/bin/model_parity_layout_runner.rs)
  * [scripts/compare_model_parity_layouts.py](https://github.com/openedges/elk-rs/blob/21916802/scripts/compare_model_parity_layouts.py)
  * [scripts/generate_full_trace_manifest.py](https://github.com/openedges/elk-rs/blob/21916802/scripts/generate_full_trace_manifest.py)
  * [scripts/java/ElkPhaseTraceExporter.java](https://github.com/openedges/elk-rs/blob/21916802/scripts/java/ElkPhaseTraceExporter.java)
  * [scripts/run_full_trace_parity.sh](https://github.com/openedges/elk-rs/blob/21916802/scripts/run_full_trace_parity.sh)


This page provides an overview of the layout orchestration in `elk-rs`. It describes how the `RecursiveGraphLayoutEngine` handles hierarchical graphs, how the `ElkLayered` engine executes the 5-phase Sugiyama pipeline, and how intermediate processors are integrated to transform the graph between phases.
## Recursive Layout Orchestration
The entry point for most layout requests is the `RecursiveGraphLayoutEngine`. Its primary responsibility is to traverse the `ElkGraph` hierarchy and dispatch subgraphs to their respective algorithm providers based on the `CoreOptions::ALGORITHM` property.
### Hierarchy Handling
The engine supports different strategies for nested graphs:
  * **Recursive Bottom-Up** : It typically processes child nodes first, sizes them, and then lays out the parent.
  * **Hierarchy Handling** : If an algorithm supports `GraphFeature::Compound`, the engine can pass the entire sub-hierarchy to a single algorithm execution [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs96-106](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs#L96-L106)
  * **Top-Down Layout** : For specific structures, the engine can distribute available space from parents down to children [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs108-113](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs#L108-L113)


### Algorithm Dispatch
The engine uses a `LayoutAlgorithmResolver` to map algorithm IDs (e.g., `"layered"`, `"force"`) to concrete `AbstractLayoutProvider` implementations [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs79-83](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs#L79-L83)
Sources: [plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs24-156](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.core/src/org/eclipse/elk/core/recursive_graph_layout_engine.rs#L24-L156)
## The Layered Algorithm Pipeline (ElkLayered)
`ElkLayered` is the implementation of the layered (Sugiyama-style) layout. It organizes the layout process into five distinct phases, interspersed with "Intermediate Processors" that handle specific constraints like labels, self-loops, and ports.
### The 5-Phase Pipeline
The core logic is orchestrated in `elk_layered.rs`, which executes the following sequence:  
| Phase  | Name  | Responsibility  | Child Page  |  
| --- | --- | --- | --- |  
| **Phase 1**  | Cycle Breaking  | Reverses edges to make the graph a Directed Acyclic Graph (DAG).  | [Phase 1: Cycle Breaking](https://deepwiki.com/openedges/elk-rs/3.1-phase-1:-cycle-breaking)  |  
| **Phase 2**  | Layering  | Assigns nodes to discrete vertical or horizontal layers.  |  
| **Phase 3**  | Crossing Minimization  | Reorders nodes within layers to reduce edge crossings.  | [Phase 3: Crossing Minimization](https://deepwiki.com/openedges/elk-rs/3.3-phase-3:-crossing-minimization)  |  
| **Phase 4**  | Node Placement  | Assigns final coordinates to nodes to straighten edges.  | [Phase 4: Node Placement](https://deepwiki.com/openedges/elk-rs/3.4-phase-4:-node-placement)  |  
| **Phase 5**  | Edge Routing  | Calculates bend points and routing paths for edges.  |  
### Pipeline Orchestration Diagram
The following diagram shows how `ElkLayered` bridges the high-level `IGraphLayoutEngine` request to the specific phase implementations.
**Engine to Phase Mapping**
Sources: [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/elk_layered.rs1-250](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/elk_layered.rs#L1-L250) [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/layered_phases.rs1-50](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/layered_phases.rs#L1-L50)
## Intermediate Processors
Between the major phases, `elk-rs` runs a variety of `ILayoutProcessor` implementations. These are managed via the `IntermediateProcessorStrategy` enum [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs35-94](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs#L35-L94)
Key roles of intermediate processors include:
  * **Graph Transformation** : Splitting long edges into dummy nodes (`LongEdgeSplitter`) and joining them back (`LongEdgeJoiner`).
  * **Label Handling** : Inserting dummy nodes to reserve space for edge and node labels.
  * **Port Processing** : Sorting ports and calculating positions based on constraints.
  * **Compound Support** : Handling margins and coordinate offsets for hierarchical nodes.


For details, see [Intermediate Processors](https://deepwiki.com/openedges/elk-rs/3.6-intermediate-processors).
Sources: [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs1-150](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/intermediate/intermediate_processor_strategy.rs#L1-L150)
## Parity and Trace Recording
To ensure the Rust implementation matches the original Java ELK behavior, the pipeline includes a comprehensive tracing system.
  * **Trace Recorder** : Captures a JSON snapshot of the `LGraph` after every processor execution [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs76-149](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs#L76-L149)
  * **Step-by-Step Comparison** : The `compare_phase_traces.py` script compares Java snapshots against Rust snapshots to identify the exact processor where a divergence occurs [scripts/compare_phase_traces.py164-194](https://github.com/openedges/elk-rs/blob/21916802/scripts/compare_phase_traces.py#L164-L194)


**Trace Recording Architecture**
Sources: [plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs1-200](https://github.com/openedges/elk-rs/blob/21916802/plugins/org.eclipse.elk.alg.layered/src/org/eclipse/elk/alg/layered/trace_recorder.rs#L1-L200) [scripts/compare_phase_traces.py1-100](https://github.com/openedges/elk-rs/blob/21916802/scripts/compare_phase_traces.py#L1-L100) [scripts/java/ElkPhaseTraceExporter.java75-158](https://github.com/openedges/elk-rs/blob/21916802/scripts/java/ElkPhaseTraceExporter.java#L75-L158)
## Detailed Phase Documentation
  * **[Phase 1: Cycle Breaking](https://deepwiki.com/openedges/elk-rs/3.1-phase-1:-cycle-breaking)** : Strategies for removing cycles in the graph.
  * : Algorithms for assigning nodes to layers (e.g., Network Simplex).
  * **[Phase 3: Crossing Minimization](https://deepwiki.com/openedges/elk-rs/3.3-phase-3:-crossing-minimization)** : Heuristics like Barycenter and Median for reducing edge crossings.
  * **[Phase 4: Node Placement](https://deepwiki.com/openedges/elk-rs/3.4-phase-4:-node-placement)** : Determining exact X/Y coordinates (e.g., Brandes-Köpf).
  * : Orthogonal, polyline, and spline routing strategies.
  * **[Intermediate Processors](https://deepwiki.com/openedges/elk-rs/3.6-intermediate-processors)** : The transformation steps between phases.
  * **[Hierarchical and Compound Graph Handling](https://deepwiki.com/openedges/elk-rs/3.7-hierarchical-and-compound-graph-handling)** : Managing nested graph structures.


Refresh this wiki
Enter email to refresh
### On this page
  * [Layout Engine and Algorithm Pipeline](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#layout-engine-and-algorithm-pipeline)
  * [Recursive Layout Orchestration](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#recursive-layout-orchestration)
  * [The Layered Algorithm Pipeline (ElkLayered)](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#the-layered-algorithm-pipeline-elklayered)
  * [Pipeline Orchestration Diagram](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#pipeline-orchestration-diagram)
  * [Intermediate Processors](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#intermediate-processors)
  * [Parity and Trace Recording](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#parity-and-trace-recording)
  * [Detailed Phase Documentation](https://deepwiki.com/openedges/elk-rs/3-layout-engine-and-algorithm-pipeline#detailed-phase-documentation)


