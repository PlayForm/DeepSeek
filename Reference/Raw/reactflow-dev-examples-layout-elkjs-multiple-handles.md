[Examples](https://reactflow.dev/examples "Examples")[Layout](https://reactflow.dev/examples/layout/dagre "Layout")
Elkjs Multiple Handles
# Elkjs Multiple Handles
This example demonstrates how to configure [elkjs ](https://github.com/kieler/elkjs) to use specific handles (called ‘ports’ in elkjs). This is helpful to reduce edge crossings and have more control over the layout. The important things to configure are unique ids for the handles / ports, the actual ports for elkjs with a correct side property and `'org.eclipse.elk.portConstraints' : 'FIXED_ORDER'` for all nodes.

```
import { useEffect } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
importtype Edge, useNodesInitialized, useReactFlow } from '@xyflow/react';

importtype ElkNode } from './nodes';

// elk layouting options can be found here:
// https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.edgeNodeBetweenLayers': '40',
  'elk.spacing.nodeNode': '40',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',


const elk = new ELK();

// uses elkjs to give each node a layouted position
export const getLayoutedNodes = async (nodes: ElkNode[], edges: Edge[]) => {
  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes.map((n) => {
      const targetPorts = n.data.targetHandles.map((t) => ({
        id: t.id,

        // ⚠️ it's important to let elk know on which side the port is
        // in this example targets are on the left (WEST) and sources on the right (EAST)
        properties: {
          side: 'WEST',

      }));

      const sourcePorts = n.data.sourceHandles.map((s) => ({
        id: s.id,
        properties: {
          side: 'EAST',

      }));

      return {
        id: n.id,
        width: n.width ?? 150,
        height: n.height ?? 50,
        // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
        properties: {
          'org.eclipse.elk.portConstraints': 'FIXED_ORDER',

        // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
        ports: [{ id: n.id }, ...targetPorts, ...sourcePorts],


    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.sourceHandle || e.source],
      targets: [e.targetHandle || e.target],
    })),


  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((lgNode) => lgNode.id === node.id);

    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,




  return layoutedNodes;


export default function useLayoutNodes() {
  const nodesInitialized = useNodesInitialized();
  constgetNodes, getEdges, setNodes, fitView= useReactFlowElkNode>();

  useEffect(() => {
    if (nodesInitialized) {
      const layoutNodes = async () => {
        const layoutedNodes = await getLayoutedNodes(getNodes() as ElkNode[], getEdges());

        setNodes(layoutedNodes);
        fitView();


      layoutNodes();

  }, [nodesInitialized, getNodes, getEdges, setNodes, fitView]);

  return null;

```

Last updated on October 11, 2026
