Discussion options
Quote reply
## 
[ Rameshmariappan ](https://github.com/Rameshmariappan) [ Nov 19, 2024 ](https://github.com/xyflow/xyflow/discussions/4830#discussion-7513114)  
|  I am using ELK.js with subflows and implementing a nested path structure. If there are multiple paths (e.g., 11a and 11b), I want to render the paths hierarchically, with 11a appearing before 11b as expected. However, in my current implementation, the path that is modified last (e.g., 11b) is rendered first. How can I ensure that the paths are always rendered in the correct hierarchical order, regardless of the modification sequence?  |  
| --- |  
You must be logged in to vote
All reactions
##  2 comments 
Comment options
Quote reply
### 
[ ZahidChandio ](https://github.com/ZahidChandio) [ Nov 27, 2024 ](https://github.com/xyflow/xyflow/discussions/4830#discussioncomment-11392903)  
|  [@moklick](https://github.com/moklick), [@bcakmakoglu](https://github.com/bcakmakoglu), [@chrtze](https://github.com/chrtze). Could you please provide some references regarding this? In addition to aligning with the above requirement, I need to ensure the child nodes are centered relative to their parent nodes. Here are the ELK layout options and the method I’m using: 
```
export const getLayoutedElements = async (
  nodes: any[],
  edges: any
): Promise<{ nodes: any[]; edges: any[] }> => {
  const elk = new ELK();
  const isHorizontal = false;

  let defaultHeight = 150;
  let defaultWidth = 300;
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => {
      if (node?.type === 'action') {
        defaultHeight = 257;
        defaultWidth = 350;
      }
      return {
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        width: node?.width || defaultWidth,
        height: node?.height || defaultHeight,
        properties: { alignment: 'TOP' }
      };
    }),
    edges
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes =
      layoutedGraph.children?.map((node: any) => ({
        ...node,
        position: { x: node.x, y: node.y } // Map ELK x, y to React Flow's position
      })) || [];

    const layoutedEdges = layoutedGraph.edges || [];

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (err) {
    console.error('Error during layout:', err);
    return { nodes, edges }; // Return the original input as fallback
  }
};

```
Here is a sample JSON of the initial nodes and edges: 
```
{
  "nodes": [
    { "id": "1", "type": "workflow", "position": { "x": 212, "y": 12 }, "width": 300, "height": 153 },
    { "id": "14eb58a7-c523-4b91-8039-85ee72843871", "type": "workflow", "position": { "x": 212, "y": 215 }, "width": 300, "height": 153 },
    { "id": "p-17c8a59f-681c-4777-8dfb-05711f477699", "type": "placeholder", "position": { "x": 12, "y": 418 }, "width": 300, "height": 150 },
    { "id": "5de102fd-1741-4725-b249-d1e131e9e387", "type": "workflow", "position": { "x": 412, "y": 418 }, "width": 300, "height": 153 },
    { "id": "p-5de102fd-1741-4725-b249-d1e131e9e387", "type": "placeholder", "position": { "x": 212, "y": 621 }, "width": 300, "height": 150 }
  ],
  "edges": [
    { "id": "e1-14eb58a7-c523-4b91-8039-85ee72843871", "source": "1", "target": "14eb58a7-c523-4b91-8039-85ee72843871", "type": "workflow" },
    { "id": "e14eb58a7-c523-4b91-8039-85ee72843871-p1", "source": "14eb58a7-c523-4b91-8039-85ee72843871", "target": "5de102fd-1741-4725-b249-d1e131e9e387", "type": "branch", "data": { "name": "Branch A", "label": "Branch A" } },
    { "id": "e5de102fd-1741-4725-b249-d1e131e9e387-p1", "source": "5de102fd-1741-4725-b249-d1e131e9e387", "target": "p-5de102fd-1741-4725-b249-d1e131e9e387", "type": "workflow" },
    { "id": "e14eb58a7-c523-4b91-8039-85ee72843871-p2", "source": "14eb58a7-c523-4b91-8039-85ee72843871", "target": "p-17c8a59f-681c-4777-8dfb-05711f477699", "type": "branch", "data": { "name": "Branch B", "label": "Branch B" } }
  ]
}

```
The result I am getting with the current options.  |  
| --- |  
You must be logged in to vote
All reactions
0 replies 
Comment options
Quote reply
### 
[ ZahidChandio ](https://github.com/ZahidChandio) [ Nov 27, 2024 ](https://github.com/xyflow/xyflow/discussions/4830#discussioncomment-11392912)  
|  [@moklick](https://github.com/moklick), [@bcakmakoglu](https://github.com/bcakmakoglu), [@chrtze](https://github.com/chrtze). You've provided valuable insights to many developers. I have been struggling for weeks to resolve this. Could you please shed some light on this? Thank you!  |  
| --- |  
You must be logged in to vote
All reactions
0 replies 
[Sign up for free](https://github.com/join?source=comment-repo) **to join this conversation on GitHub**. Already have an account? [Sign in to comment](https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fxyflow%2Fxyflow%2Fdiscussions%2F4830)
Category 
Labels 
None yet 
2 participants 
You can’t perform that action at this time. 
