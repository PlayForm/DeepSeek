( ERD )( Data Visualization )
# Tuning Edge Animations in Reactflow for Optimal Performance
Text by Junki Saito
PublishedJan 28, 2025
Liam ERD faced performance issues with React Flow's stroke-dasharray edge animation on large datasets. We replaced it with a custom SVG solution, significantly improving speed and user experience.
Liam ERD relies on the incredible capabilities of React Flow to visualize complex data models—like tables and relationships—on the web. We’re genuinely grateful for how React Flow enables rapid development and a beautiful user experience right out of the box. That said, when you’re working with truly massive datasets, you need to make sure your app still runs at top speed. In this post, I’ll walk you through how we tackled performance issues related to edge animations and the steps we took to keep everything running smoothly.
## The Challenge: Animated Edges and Performance Bottlenecks
One of the standout features in React Flow is the effortless animation you can apply to edges. By simply toggling `animated` to true, you get a dashed-line effect that makes relationships feel alive. We loved this feature—it instantly added a sense of dynamic flow.
React Flow Demo for animated edges in React Flow with animated=true.

```

 * This code is written in Stackblitz
@see https://stackblitz.com/edit/sb1-74jfdcqt?file=src%2FApp.tsx

const initialNodes = [

    id: '1',
    type: 'input',
    data: { label: 'Input Node' },
    position: { x: 250, y: 25 },


    id: '2',
    data: { label: 'Default Node' },
    position: { x: 100, y: 125 },


    id: '3',
    type: 'output',
    data: { label: 'Output Node' },
    position: { x: 250, y: 250 },



const initialEdges = [

    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true


    id: 'e2-3',
    source: '2',
    target: '3',
    animated: false



function App() {
  return (
ReactFlow
      nodes={initialNodes}
      edges={initialEdges}



```

The issue arose when we started rendering a huge number of edges for large ERDs, like in [Mastodon](https://docs.joinmastodon.org/), which can involve over 100 tables and countless relationships. We noticed a significant dip in responsiveness whenever we hovered over or dragged around nodes—some browsers handled it better than others, but overall, it was clear that the animations were holding back performance.
## Identifying the Root Cause: The Culprit - stroke-dasharray
After digging in, we discovered that React Flow’s edge animations rely on the CSS property `stroke-dasharray`.
CSS style for animated edges in React Flow with animated=true.
While it does create a neat dashed effect, it can seriously push your CPU when you have lots of SVG elements doing the same thing at once. Multiple user reports and bug threads confirmed that `stroke-dasharray` can be a major slowdown:
  * [High CPU utilisation when CSS animating stroke-dashoffset - Chromium](https://issues.chromium.org/issues/40958492)
  * [Locked fps of animation · Issue #1003 · svgdotjs/svg.js - Github](https://github.com/svgdotjs/svg.js/issues/1003)


In our case, with hundreds of edges animated simultaneously, `stroke-dasharray` quickly became the main bottleneck.
## The Goal: Retain Animation, Regain Smoothness
We still wanted the user experience of visually “flowing” edges. It’s a small detail that helps people see how tables and relationships link together in real time. But we absolutely had to solve the lag problem.
## Our Solution: A Custom Animated Edge
To tackle this, we sidestepped the default animation approach in React Flow and crafted our own:
  1. **Bypassing React Flow's animated props** : We disabled the library’s `animated` prop on edges to stop using `stroke-dasharray`.
  2. **Eliminating`stroke-dasharray` entirely**: We cut it out for both animations and any default styling.
  3. **Implementing a Custom approach** : We built a `CustomEdge` component that animates an SVG object along the edge path, as outlined in the [React Flow docs](https://reactflow.dev/components/edges/animated-svg-edge). This gave us the same visual flair—minus the performance hit.


```
const PARTICLE_COUNT = 6
const ANIMATE_DURATION = 6

type Props = EdgePropsRelationshipEdgeType

export const RelationshipEdge: FCProps= ({
  data,

  const [edgePath] = getBezierPath({



  return (

BaseEdge
={id}
        path={edgePath}

/* data.isHighlighted will be true if the edge should be highlighted. */}
data?.isHighlighted 
...Array(PARTICLE_COUNT)].map((_, i) => (
ellipse
={`particle-${i}-${ANIMATE_DURATION}`}
="5"
="1.2"
            fill="url(#myGradient)"

/* The <animateMotion> element defines how an element moves along a motion path.  */}
animateMotion
              begin={`${i * (ANIMATE_DURATION / PARTICLE_COUNT)}s`}
={`${ANIMATE_DURATION}s`}
              repeatCount="indefinite"
              rotate="auto"
              path={edgePath}
              calcMode="spline"
              keySplines="0.42, 0, 0.58, 1.0"

ellipse




```

By implementing these three approaches, the appearance changed from looking like Before gif image to looking like After gif image.  
| Before  | After  |  
| --- | --- |  
You can see exactly how we did it in our Pull Request:
[ 🚸 Add animated particles to highlighted relationship edges by junkisai · Pull Request #367 · liam-hq/liam github.com ](https://github.com/liam-hq/liam/pull/367)
## Results: Measuring the Improvement
We ran before-and-after tests using Chrome DevTools to measure frame drops. Our test steps:
  1. Hover over the “Accounts” table node in Mastodon’s ERD: [Mastodon’s schema.rb](https://liambx.com/erd/p/github.com/mastodon/mastodon/blob/e2f085e2b2cec08dc1f5ae825730c2a3bf62e054/db/schema.rb)
  2. Wait 3 seconds, then remove the hover.


Demonstration of actions for comparison.
**Findings** :
  * **Before** : We saw consistent frame drops of around 5 frames at a time.
  * **After** : Frame drops went down to 2–3 frames at a time.


Not surprisingly, our changes made the overall experience smoother and more responsive—no more choppy dragging or sluggish hover states.
## Optimizing React Flow for Scalable Products
By digging into React Flow’s edge animation logic and crafting a custom approach, we found a sweet spot between visual polish and raw performance. Disabling `stroke-dasharray` and opting for a more controlled animation model let us keep the dynamic look of animated edges while ensuring that our largest ERDs run like butter. We hope this helps anyone else wrestling with performance challenges on React Flow—you can absolutely keep those animations, as long as you give them some thoughtful tweaks.
Liam ERD required a highly scalable node-based engine to efficiently render large, interconnected schemas. That drove our choice of React Flow, which effortlessly manages 100+ tables and hundreds of edges while allowing the fine-grained control we need for selective highlighting and custom animations. Since Liam ERD relies on type-safe schema transformations, React Flow’s robust TypeScript support proved indispensable. Its performance tuning capabilities, including the custom animation optimizations we described, make it ideally suited for complex database diagrams. If your product demands large-scale interactive data modeling or specialized node behavior, React Flow is an excellent foundation to build upon.
For more insights into Liam ERD and what we’ve been working on, feel free to check out our introduction post:
[ Introducing Liam ERD - Liam ERD liambx.com ](https://liambx.com/blog/liam-erd-introduction)
Text byJunki Saito
Junki Saito is a front-end web developer at ROUTE06, Inc., working on Liam. Specializing in TypeScript and React, he leverages his extensive practical experience to provide solutions to technical challenges faced by web engineers in their daily development tasks.
Last edited onDec 4, 2025
[PreviousVisual Data Stories with Gen-AI](https://liambx.com/blog/visual-data-stories-in-the-generative-ai-era)
[NextAnnouncing Liam ERD Integration with tbls](https://liambx.com/blog/liam-erd-with-tbls)
[Categories](https://liambx.com/blog/categories)


[Glossary](https://liambx.com/glossary)


## Related Blogs
  * ## [What We Did to Gain 3,000 GitHub Stars for the Liam Repository Text by Takashi Masuda](https://liambx.com/blog/liam-github-3k-stars)
  * ## [Which ER Diagram Tool is Right for You? (2025 Edition) Text by Yukina Funama](https://liambx.com/blog/er-diagram-tool-trends-2025)
  * ## [How to Implement Cmd-K Search in the Browser? A Comparison of fuse.js and Orama Text by Tsuyoshi Hoshino](https://liambx.com/blog/comparison-of-fuse-js-and-orama)
  * ## [The History and Future of ER Diagrams: How AI is Transforming Data Modeling Text by Takafumi Endo](https://liambx.com/blog/er-diagrams-history-future-database-modeling)


