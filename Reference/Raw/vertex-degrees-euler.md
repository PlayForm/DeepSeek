# Euler Tours

- [Home](../index.html)
- [Contents](../contents.html)
- [Part II](index.html)
- Chapter 8


- [← Previous](multigraphs.html)
- [Next →](../trees/index.html)

\

## The purpose of this chapter

This chapter concludes the part of this book devoted to vertex degrees. It is an application of the concept of vertex degrees, as well as some results from [Chapter 4](../beginning/degrees.html), to solve a problem that could be said to be the beginning of graph theory.

There is a striking contrast in graph theory between the theory of Euler tours and Eulerian graphs, discussed in this chapter, and the theorem of Hamilton cycles and Hamiltonian graphs, discussed in [Chapter 17](../hard/hamilton.html). Superficially, the two problems are very similar, yet we are able to pin down the exact circumstances in which an Euler tour exists; for Hamiltonian cycles, hard work is required in most cases.

Everything we say about the Euler tour problem for graphs remains true for multigraphs, with no substantial change. For directed graphs, the situation is a bit more complicated, and it is discussed at the end of the chapter. However, many of the important applications of Euler tours, such as the one in [Chapter 20](../hard/line.html), are applications to directed graphs, so this is an important case of the problem to understand.

\

## Don’t lift your pencil!

![](../images/8-1.png)

Can you draw this figure without lifting your pencil?

![](../images/8-2.png)

Solution to the challenge in [Figure 8.1(a)](#fig:challenge-1)

![](../images/8-3.png)

Modeling the puzzle as a multigraph

Drawing without lifting your pencil

You might have seen a brainteaser like this before! Look at the diagram in [Figure 8.1(a)](#fig:challenge-1). Can you draw this shape on paper without lifting your pencil (or pen), and without going over the same line more than once?

You can: [Figure 8.1(b)](#fig:solution-1) shows you one particularly symmetric way to do it. (To make it clear what the solution is, the lines are bent away from each other slightly to indicate where the path does or does not cross itself.) As a bonus, the path in [Figure 8.1(b)](#fig:solution-1) returns to where it started.

This is a book on graph theory, though, not on pencil drawings. So what does this question have to do with graph theory? This is the same question that this book started with: how do we model this problem as a graph?

The places in the drawing that matter most are the places where several lines meet: when tracing the drawing with your pencil, those are the only places where we make a decision. So it makes sense to have a vertex for each of those points. The rest of the drawing consists of lines that go from one such point to another, and their shape does not matter for solving the puzzle: only the starting and ending point matters. So for every such line, we will add an edge between the two vertices it joins. If we apply idea to [Figure 8.1(a)](#fig:challenge-1), the result is shown in [Figure 8.1(c)](#fig:challenge-multigraph).

The result is a multigraph; how did that happen?

We get parallel edges whenever there are two or more lines that start and end at the same pair of intersection points.

What sort of graph-theoretic object are we looking for when we solve the brainteaser?

We are looking for a walk in the graph which uses every edge exactly once.

There are two other well-known puzzles that are an instance of the same type of problem. One is the five rooms puzzle, shown in [Figure 8.2(a)](#fig:five-rooms). Here, five rooms are connected by a total of $16$ doors, and the challenge is to plot a path through the rooms that passes exactly once through every door.

![](../images/8-4.png)

The five rooms puzzle

![](../images/8-5.png)

The bridges of Königsberg

Two more puzzles equivalent to pencil drawing

What should the vertices and edges be in the multigraph that makes the five rooms puzzle equivalent to the pencil-drawing puzzle?

There should be six vertices: one for each room, where we consider the outside region to be a room as well. Each door between two rooms should be an edge incident to both rooms.

Another such puzzle, the problem of the seven bridges of Königsberg, has historical significance. It was first studied by Leonhard Euler, in 1736 [\[6\]](../appendix/bibliography.html#ref-Ball05), and it may be one of the first mathematical problems to be abstracted into a graph-theoretic model before being solved. (It predates modern graph theory, so the terminology used by Euler was quite different from what you are reading here.) The problem itself is based on a map of the city of Königsberg, shown somewhat abstractly in [Figure 8.2(b)](#fig:konigsberg). In Euler’s time, there were seven bridges connecting the two sides of the river and the two large islands in the middle of the river. The challenge was to find a path through the city that crossed each bridge exactly once.

What should the vertices and edges be in the multigraph that models the bridges of Königsberg?

There should be a vertex for each of the four landmasses, with an edge for every bridge.

The problem we are solving in all three of these puzzles is named in Euler’s honor.

**Definition 8.1**. *A walk that contains every edge of a graph or multigraph exactly once is called an **Euler walk**. If, additionally, the Euler walk is closed, it is called an **Euler tour**.*

All three puzzles we have looked at are about finding an Euler walk. Even though the solution in [Figure 8.1(b)](#fig:solution-1) happens to be an Euler tour, we have not had a reason to consider Euler tours for their own sake so far. However, you are about to see in this chapter that Euler tours are actually the more fundamental and more natural object. This is reflected in the following definition:

**Definition 8.2**. *A graph or multigraph is called **Eulerian** if it has an Euler tour.*

\

## First steps

The key to determining whether an Euler walk or Euler tour exists turns out to depend on the degree of the vertices. To simplify terminology just for this chapter, we will call a vertex *odd* or *even* if it has odd degree or even degree, respectively.

The following result does not completely answer our question, but is easier to prove than the main theorem of this chapter, so it is where we will begin. I will give the proof in the language of multigraphs, so that we can be sure it works even then.

**Lemma 8.1**. *In an Eulerian multigraph, every vertex must be even.*

*Proof.* Let $G$ be an Eulerian multigraph, and let the walk $$(x_0, e_1, x_1, e_2, x_2, \dots, e_m, x_m)$$ with $x_m = x_0$ be an Euler tour of $G$. We prove a stronger statement: if a vertex $x$ appears $k$ times among $x_1, \dots, x_m$, then $\deg_G(x) = 2k$. Intuitively, the argument for this is that if we follow the Euler tour around $G$, then every time the tour enters and leaves $x$, it uses $2$ more edges incident to $x$.

Formally, let $I$ be the set $\{i : 1 \le i \le m \text{ and } x_i = x\}$: the set of all positive positions in the Euler tour where $x$ appears. If $|I|=k$, then the $k$ edges $\{e_i : i \in I\}$ and the $k$ edges $\{e_{i+1} : i \in I\}$ are all the edges incident to $x$, contributing $2k$ to $\deg_G(x)$. This has two caveats:

- If $x = x_i = x_{i+1}$ for some $i$, then edge $e_i$ is double-counted in the argument above. However, in this case, edge $e_i$ is a loop with both endpoints at $x$, contributing $2$ to $\deg_G(x)$: it should be double-counted.

- If $x = x_m$, then there is no edge $e_{m+1}$ to count. However, in this case, $x = x_0$ as well, so edge $e_1$ should be counted instead.

So in both unusual cases, the total contribution to the degree of $x$ is still $2k$.

Every edge of $G$ appears in the Euler tour exactly once, and so by counting the contribution of edges $e_1, \dots, e_m$ to the degree of $x$, we compute the degree completely. This shows that $\deg_G(x) = 2k$, an even number; since $x$ was arbitrary, all vertices must be even. ◻

Why doesn’t [Lemma 8.1](#lemma:even-is-necessary) solve the problem completely?

If every vertex in a multigraph is even, the lemma doesn’t guarantee that the multigraph really does have an Euler tour.

In other words, we have shown that the condition “every vertex in $G$ is even” is a necessary condition for $G$ to be Eulerian: that is, $G$ can’t be Eulerian without it. We have not determined whether it is a sufficient condition for $G$ to be Eulerian: whether all graphs that satisfy the condition do in fact have Euler tours.

If $(x_0, e_1, x_1, e_2, x_2, \dots, e_m, x_m)$ were an Euler walk, but not an Euler tour, what would change in the proof of [Lemma 8.1](#lemma:even-is-necessary)?

When $x=x_m$, it would no longer be true that $x=x_0$ as well, so the degree of $x$ would be $2k-1$ rather than $2k$: $x$ would be odd. Also, when $x=x_0$, the argument wouldn’t “notice” the contribution of edge $e_1$ to $x$’s degree, because $I$ only contains positive integers, so $x$ would be odd in this cases as well.

Following this reasoning carefully gives us the following claim:

**Lemma 8.2**. *If a multigraph $G$ has an $x-y$ Euler walk, where $x\ne y$, then vertices $x$ and $y$ must be odd, while all other vertices must be even.*

Which of the puzzles in [Figure 8.2](#fig:euler-puzzles) have solutions?

Neither puzzle has a solution. If we convert them to multigraphs, then in both cases there will be four odd vertices. However, [Lemma 8.2](#lemma:necessary-for-walk) implies that a graph with an Euler walk can have at most two odd vertices.

The condition “at most two odd vertices” is a bit more complicated than the condition “no odd vertices”, but that’s not the real reason that Euler tours are taken to be more fundamental than Euler walks.

Imagine for a moment that we had a method for finding Euler tours, but not Euler walks, and suppose that we were faced with a graph $G$ where only two vertices, $x$ and $y$, were odd. Well, we could fix this quite easily: we could simply add an edge $e$ with endpoints $x$ and $y$. In the new graph [<sup>1</sup>](#fn1) $H$, all vertices would be even, so $H$ would have an Euler tour.

In our imagination, we already have a method for finding Euler tours, so we could easily find an Euler tour in $H$. That Euler tour would have to use the new edge $e$ at some point. Well, if we simply delete edge $e$ from the tour, we could follow the tour starting from $x$ and visit all the other edges, ending at $y$. This is an Euler walk in $G$.

Outside our imagination, we don’t have any systematic method of finding Euler walks or Euler tours, yet. However, this argument lets us reduce the Euler walk problem to the Euler tour problem. It tells us that all we need to focus on is finding Euler tours in graphs where all vertices are even. As soon as we find an algorithm to do this, we will immediately have an algorithm for Euler walks as well!

\

## Cycle decompositions

Let’s take a detour [<sup>2</sup>](#fn2) and consider cycle decompositions.

In general, a decomposition of $G$ is a set of subgraphs $\{G_1, G_2, \dots, G_k\}$ such that every edge of $G$ is an edge of exactly one subgraph $G_i$. We have already seen one kind of decomposition: the decomposition of a graph into its connected components. We will encounter two other examples of decompositions later: $1$-factorizations in [Chapter 16](../matchings/general.html) and ear decompositions in [Chapter 25](../connectivity/cut-vertices.html).

In particular, a *cycle decomposition* of $G$ is a set of cycles in $G$ such that every edge of $G$ is an edge of exactly one of the cycles. This uses the terminology in a straightforward way, but one thing is awkward: the notation. We cannot write a cycle decomposition $\{C_1, C_2, \dots, C_k\}$, because the notation $C_n$ already refers to the $n$-vertex cycle graph. When we must, we resort to a standard option all mathematicians take when not allowed to use subscripts: use superscripts instead, writing the cycle decomposition as $\{C^{(1)}, C^{(2)}, \dots, C^{(k)}\}$.

When studying the Euler tour problem in 1912, Oswald Veblen realized that a single closed walk and a collection of many cycles share a common feature: in both cases, if they visit a vertex $k$ times, they use $2k$ edges incident to that vertex. Therefore the necessary condition for Eulerian graphs is also necessary for having a cycle decomposition. However, Veblen was able to prove [\[102\]](../appendix/bibliography.html#ref-Veblen12) that for cycle decompositions, this condition is both necessary and sufficient!

A key step of this proof uses [Theorem 4.4](../beginning/degrees.html#thm:min-degree-cycle): if a graph has minimum degree at least $2$, then it contains a cycle. We proved this theorem for simple graphs, but if you go back and examine our argument, you should be able to convince yourself that it can be carried out in multigraphs as well.

Alternatively, there is a way to generalize the theorem to multigraphs without looking at the proof of [Theorem 4.4](../beginning/degrees.html#thm:min-degree-cycle) at all. How?

If a multigraph has a loop, it has a cycle of length $1$, and if it has two parallel edges, it has a cycle of length $2$. In both cases, we already get the conclusion we want. If the multigraph has neither of these, then we can think of it as a simple graph.

**Theorem 8.3**. *A graph has a cycle decomposition if and only if all of its vertices are even.*

*Proof.* Suppose first that $G$ is a graph with a cycle decomposition $\mathcal D$, and let $x$ be an arbitrary vertex of $G$.

Cycles are $2$-regular graphs, so for every cycle $C \in \mathcal D$ with $x \in V(C)$, $\deg_C(x) = 2$. Together, the cycles in $\mathcal D$ include each edge of $G$ exactly once, so we can split up the degree $\deg_G(x)$ as a sum over the degree of $x$ on cycles. Let $\mathcal D_x$ be the set of all cycles in $\mathcal D$ containing $x$: then $$\deg_G(x) = \sum_{C \in \mathcal D_x} \deg_C(x) = \sum_{C \in \mathcal D_x} 2 = 2|\mathcal D_x|.$$ In particular, $\deg_G(x)$ must be even.

This argument shows that the condition is necessary; now, we must prove that it is sufficient. So let $G$ be a graph in which all vertices are even; our task is to find a cycle decomposition of $G$. We will do this by strong induction on the number of edges in $G$. As our base case, if $G$ has $0$ edges, then the empty set is a cycle decomposition: it includes every edge exactly once, because there are no edges to include.

Suppose $G$ has $m>0$ edges. Pick any connected component of $G$ that has at least one edge. In that component, no vertices can have degree $0$: an isolated vertex would be a component with no edges, all by itself. Also, no vertices can have degree $1$: by assumption, all vertices in $G$ are even. Therefore the component has minimum degree at least $2$. By [Theorem 4.4](../beginning/degrees.html#thm:min-degree-cycle), this component contains a cycle $C$.

![](../images/8-6.png)

The initial graph $G$

![](../images/8-7.png)

Deleting a cycle $C$

![](../images/8-8.png)

Vertex degrees in $G-C$

Finding a cycle decomposition, one cycle at a time

In $G-E(C)$ (the graph we get by deleting the edges of $C$, leaving the vertices as they are), all vertices are still even: the degree of every vertex that lies on $C$ goes down by $2$, and all other degrees are unchanged. (An example of such a deletion is illustrated in [Figure 8.3](#fig:veblen-example).) Also, $G-E(C)$ has fewer than $m$ edges (since $C$ has at least one edge), so our induction hypothesis applies to it: $G - E(C)$ has a cycle decomposition. Add $C$ to that cycle decomposition, and we get a cycle decomposition of $G$.

By induction, a cycle decomposition exists for any number of edges. ◻

This proof also gives us an algorithm for finding a cycle decomposition. Simply find any cycle, set it aside, and repeat with the remainder of the graph until we are out of edges. How do we find a cycle? Well, the proof of [Theorem 4.4](../beginning/degrees.html#thm:min-degree-cycle) begins by taking a longest path, but this is done only to simplify the proof. Really, we can build up a path by aimless wandering through the graph, taking care only not to leave a vertex by the same edge we used to enter it. As soon as we revisit the vertex, we obtain a cycle in the same way that we obtained it from the longest path.

\

## Gluing cycles together

Before we go on, let me clear the air about one thing: the condition that all vertices are even is not sufficient to guarantee that a graph is Eulerian. However, the exception is rather silly.

How can you find a graph where all vertices are even, but which does not have an Euler tour? (Small examples include a multigraph with $2$ edges and a simple graph with $6$ edges.)

Just make sure that your graph has multiple connected components with edges in them! A walk can never jump from one component to another, so you can never include all edges of the graph in a single walk.

This is a minor quibble; we will be fine if we restrict our attention to connected graphs. We can even allow graphs with multiple components, as long as all components except for one are merely isolated vertices. The cycle decomposition we get from [Theorem 8.3](#thm:veblen) is the key ingredient in putting together an Euler tour.

**Theorem 8.4**. *A graph is Eulerian if and only if it is connected (except possibly for isolated vertices) and all of its vertices are even.*

*Proof.* We know that both parts of this condition are necessary: by [Lemma 8.1](#lemma:even-is-necessary), all vertices must be even, and we have just discussed why the graph cannot have two components with edges. It remains to show that together, these two conditions are sufficient.

Let $G$ be a graph which has only one connected component aside from isolated vertices, and in which every vertex of $G$ is even. For simplicity, delete all the isolated vertices (which will not affect our argument) so that we can simply assume $G$ is connected. (If $G$ has only isolated vertices, then a walk of length $0$ is an Euler tour.) The first thing we’ll do is use [Theorem 8.3](#thm:veblen) to find a cycle decomposition $\mathcal D$ of $G$.

Next, we’ll build an Euler tour step by step. This is a proof by algorithm. Throughout this process, we will update the following objects:

- a “partial tour” $PT$, which is a closed walk that uses each edge at most once, but might miss some edges.

- A subgraph $H$ whose edges are exactly the edges missed by $PT$.

- A set $\mathcal U$ of “unprocessed cycles”: a cycle decomposition of $H$.

Initially, we’ll take $PT$ to be a walk representing one cycle $C \in \mathcal D$. Let $H = G - E(C)$, and let $\mathcal U = \mathcal D - \{C\}$. We will stop when $\mathcal U = \varnothing$.

One by one, we will remove a cycle from $\mathcal U$, and splice it into $PT$. To make this possible, it’s important to find a cycle in $\mathcal U$ that contains one of the vertices visited by $PT$.

There must always be such a cycle! Assuming otherwise, let $S$ be the set of vertices visited by $PT$: $S$ is not empty, but also does not contain any vertices of the cycles in $\mathcal U$. Every edge of $G$ is either used by $PT$ (and joins two vertices in $S$) or is an edge of a cycle in $\mathcal U$ (and joins two vertices not in $S$). No edge of $G$ has exactly one endpoint in $S$, and by [Lemma 3.2](../beginning/walks.html#lemma:disconnected), $G$ is not connected, which is a contradiction.

So let’s suppose that we have found such a cycle $C$. Let $PT$ be the closed walk $$(x_0, x_1, x_2, \dots, x_{l-1}, x_0)$$ and let $C\in \mathcal U$ be a cycle containing a vertex $x_i$. Choose a closed walk $$(y_0, y_1, y_2, \dots, y_{k-1}, y_0)$$ to represent $C$ with the property that $y_0 = x_i$. Then to incorporate $C$ into $PT$, replace $PT$ by the closed walk $$(x_0, x_1, x_2, \dots, x_{i-1}, \underbrace{y_0, y_1, y_2, \dots, y_{k-1}, y_0}, x_{i+1}, \dots, x_{l-1}, x_0).$$ That is, the vertex $x_i$ is replaced by the entire closed walk representing $C$. Replace $H$ by $H - E(C)$, and $\mathcal U$ by $\mathcal U - \{C\}$.

After this process, every edge used by the old $PT$ is still used by the new $PT$, and so is every edge in $E(C)$: after all, $E(C) = \{y_0 y_1, y_1y_2, \dots, y_{k-1}y-0\}$, and all of these appear as pairs of consecutive vertices in the new $PT$. Therefore $H$ is still the subgraph whose edges are exactly the edges missed by $PT$, and $\mathcal U$ is still a cycle decomposition of $H$. Also, it’s still true that the new $PT$ uses every edge at most once: all of the new edges came from $H$, so they did not appear in the old $PT$.

Repeat this until $\mathcal U$ is empty. Throughout the algorithm, it’s been true that all edges of $G$ are either part of $PT$, or part of a cycle in $\mathcal U$. Now that there are no cycles in $\mathcal U$, all edges must be part of $PT$, so $PT$ is an Euler tour. ◻

To truly understand the proof and the algorithm, let’s go through an example, finding an Euler tour of the graph in [Figure 8.4(a)](#fig:example-eulerian-graph). We will begin with a cycle decomposition. The one shown in [Figure 8.4(b)](#fig:example-cycle-decomposition) is actually not the best one to use—life would be easier for us if we had fewer longer cycles. The decomposition with many short cycles will let us see more steps of the algorithm in action.

![](../images/8-9.png)

A modified cube graph

![](../images/8-1x.png)

A cycle decomposition $\{C^{(1)}, C^{(2)}, C^{(3)}, C^{(4)}\}$

A graph and its cycle decomposition, in preparation for finding an Euler tour

1.  Initially, our partial tour $PT$ is a walk $(1,5,7,1)$ representing $C^{(1)}$.

2.  Next, we want to add a cycle that shares a vertex with $PT$: that is, we can’t use $C^{(2)}$. Let’s take $C^{(4)}$ instead; $C^{(3)}$ would also work.

    The only vertex of $C^{(4)}$ appearing on $PT$ is vertex $5$. So we choose to represent $C^{(4)}$ by the closed walk $(5, 3, 4, 6, 5)$, and replace the $5$ in $PT$ by this closed walk: now, $$PT = (1, \underbrace{5, 3, 4, 6, 5}, 7, 1).$$

3.  At this point, $PT$ has lots of vertices, so we can add either remaining cycle. Let’s add $C^{(2)}$. It shares vertex $4$ with $PT$, so we represent $C^{(2)}$ by $(4, 2, 8, 4)$ and splice it into $PT$: now, $$PT = (1, 5, 3, \underbrace{4, 2, 8, 4}, 6, 5, 7, 1).$$

4.  Finally, only $C^{(3)}$ is left to add; it shares many vertices with $PT$, but in particular, it shares vertex $1$, so we choose to represent it by $(1, 2, 6, 8, 7, 3, 1)$. We replace the first occurrence of $1$ in $PT$ by this closed walk, getting the final result: $$PT = (\underbrace{1, 2, 6, 8, 7, 3, 1}, 5, 3, 4, 2, 8, 4, 6, 5, 7, 1).$$

To check that $PT$ is an Euler tour for yourself, draw all the vertices of the graph in [Figure 8.4(a)](#fig:example-eulerian-graph), with no edges between them. Then, follow $PT$, drawing each edge as you use it. As you go, check that you never draw an edge more than once; at the end, check that you have drawn all of [Figure 8.4(a)](#fig:example-eulerian-graph).

\

## Variations on Euler tours

Of course, now that we have an algorithm for Euler tours, we immediately have an algorithm for Euler walks, as well as a test for their existence. The only thing that changes is that a graph with two odd vertices can still have an Euler walk.

In a graph with exactly two odd vertices, is it possible for them to be in different connected components?

It is not: if this happened, then looking at one of those components by itself, we’d see a subgraph with only one odd vertex. However, by [Corollary 4.2](../beginning/degrees.html#cor:odd-vertices) to the handshake lemma, the number of odd vertices in any graph is even.

Can you think of a way to modify the algorithm for Euler tours so that it finds an $x-y$ Euler walk instead?

Instead of a partial tour $PT$, begin with a partial walk $PW$ representing an $x-y$ path $P$, and let $H = G - E(P)$. In $H$, all vertices are even, so we can take $\mathcal U$ to be a cycle decomposition of $H$. From here, the algorithm can be continued as before.

Another interesting problem is the problem of finding Euler tours in a directed graph. The first novelty in the directed setting is that we no longer check for whether a vertex is even: entering and leaving a vertex has a different effect on its indegree and outdegree.

If a directed graph $D$ has an Euler tour, what can you say about the degree of a vertex that appears on the tour $k$ times?

Each arc into the vertex adds $1$ to its indegree, and each arc out of the vertex adds $1$ to its outdegree. Thus, the vertex will have indegree $k$ and outdegree $k$.

What, then, is the corresponding necessary condition for a digraph to be Eulerian?

Every vertex must have an indegree equal to its outdegree. (We can call such vertices *balanced*.)

To prove a necessary and sufficient condition for directed graphs, we must retrace the steps we took in the undirected setting. The only new ingredient is the result we use to find a single cycle; we proved it in [Chapter 7](../degrees/multigraphs.html). Can you anticipate it before it is used?

**Lemma 8.5**. *A digraph has a cycle decomposition if and only if all of its vertices are balanced.*

*Proof.* Suppose first that $D$ is a digraph with a cycle decomposition $\mathcal D$, and let $x$ be an arbitrary vertex of $D$.

In the directed cycle graph $\overrightarrow{C_n}$, every vertex has indegree $1$ and outdegree $1$. Together, the cycles in $\mathcal D$ include each arc of $D$ exactly once, so we can split up the indegree and outdegree of $x$ as a sum over cycles. Let $\mathcal D_x$ be the set of all cycles in $\mathcal D$ containing $x$: then $$\begin{aligned}  \deg^+_D(x) &= \sum_{C \in \mathcal D_x} \deg^+_C(x) = \sum_{C \in \mathcal D_x} 1 = |\mathcal D_x|, \text{ and} \\  \deg^-_D(x) &= \sum_{C \in \mathcal D_x} \deg^-_C(x) = \sum_{C \in \mathcal D_x} 1 = |\mathcal D_x|. \end{aligned}$$ In particular, $\deg^+_D(x) = \deg^-_D(x)$: $x$ is balanced.

This argument shows that the degree condition is necessary; now, we must prove that it is sufficient. So let $D$ be a digraph in which all vertices are balanced; our task is to find a cycle decomposition of $D$. We will do this by strong induction on the number of arcs in $D$. As our base case, if $D$ has $0$ arcs, then the empty set is a cycle decomposition: it includes every arc exactly once, because there are no arcs to include.

Suppose $D$ has $m>0$ arcs; the same is true if we pass to $D'$ by deleting all isolated vertices of $D$. If a balanced vertex has outdegree $0$, it also has indegree $0$, so it is an isolated vertex; therefore for all $x \in V(D')$, $\deg^+(x) \ge 1$. By [Theorem 7.2](../degrees/multigraphs.html#thm:no-sink-cycle), $D'$ contains a cycle $C$.

Delete the arcs of $C$ from $D$ to get a digraph $D-E(C)$ with fewer arcs: by the induction hypothesis, it has a cycle decomposition. Add $C$ to that decomposition to obtain a cycle decomposition of $D$, completing the proof. ◻

Starting from a cycle decomposition, the algorithm for finding an Euler tour is the same as it was for undirected graphs. However, there is a further difficulty with stating the final result. We do not know exactly which graphs it applies to, because do not yet know what it means for a directed graph to be connected.

I will give you the statement first, and then we will determine what it means. This is the proper way to go about it: we figure out what we should prove by figuring out the assumptions we need to use.

**Corollary 8.6**. *A directed graph is Eulerian if and only if it is weakly connected (except possibly for isolated vertices) and all of its vertices are balanced.*

The proof is the same as the proof of [Theorem 8.4](#thm:eulerian): we start with a cycle decomposition, and splice the cycles into a partial Euler tour, one by one.

Looking at the proof of [Theorem 8.4](#thm:eulerian), where did we need the graph to be connected?

We needed it to be impossible for the partial tour $PT$ and the unused cycles $\mathcal U$ to have no vertices in common.

So the notion of connectedness we need is simply that it should be impossible to split the vertices of our digraph $D$ into two sets, with no arcs between them in either direction: that’s what we’d get if $PT$ and the cycles of $\mathcal U$ shared no vertices. This is a notion of connectedness that ignores the orientations of the arcs.

Formally, we call a digraph $D$ *weakly connected* if the underlying graph is connected. Now we know what [Corollary 8.6](#cor:eulerian-digraph) means!

\

## Practice problems

1.  The classic brainteaser in the “draw without lifting your pencil” genre is the picture of a stylized house shown below:

    ![](../images/8-14.png)

    In order to draw this picture without lifting your pencil or retracing any line, where must you start and end? (Of course, you can always swap the start and end.)

2.  Find a cycle decomposition of the circulant graph $\operatorname{Ci}_{10}(1,2)$, and use it to find an Euler tour of $\operatorname{Ci}_{10}(1,2)$.

3.  Find an Euler tour of the $4$-dimensional hypercube graph, $Q_4$.

4.  Let $G$ be the graph below. Find a vertex $x$ such that $G-x$ is Eulerian.

    ![](../images/8-15.png)

5.  The graph below is not Eulerian, because some of its vertices are odd. What is the maximum length of a closed walk in this graph that does not use any edge more than once? Prove your answer.

    ![](../images/8-16.png)

6.  In the complete graph $K_7$, every vertex has degree $6$, so by [Theorem 8.3](#thm:veblen), $K_7$ has a cycle decomposition.

    1.  Suppose we wanted to decompose $K_7$ into as few cycles as possible. How many cycles would we want to use, and of what lengths? Give an example of such a decomposition.

    2.  Suppose we wanted to decompose $K_7$ into as many cycles as possible. How many cycles would we want to use, and of what lengths? Give an example of such a decomposition.

7.  Suppose that the complete graph $K_n$, where $95 < n < 105$, has a cycle decomposition in which every cycle has length $5$. What must the value of $n$ be?

8.  Prove that every connected graph has a “double tour”: a closed walk which uses every edge exactly two times, once in each direction. (That is, for every edge $xy$, the walk contains one segment $\dots, x, y, \dots$ and one segment $\dots, y, x, \dots$.)

9.  This exercise presents part of a method due to Noga Alon [\[2\]](../appendix/bibliography.html#ref-Alon03) for finding perfect matchings (which we will cover in detail starting in [Chapter 13](../matchings/bipartite.html)) using Euler tours.

    1.  Let $G$ be a *bipartite graph*: that is, $V(G)$ is the union of two sets $A$ and $B$, with $A \cap B = \varnothing$, such that all edges of $G$ have one endpoint in $A$ and one endpoint in $B$.

        Prove that if every vertex of $G$ is even, then $G$ has an even number of edges.

    2.  Let $G$ be a graph in which every vertex is even and (as in part (a)) the number of edges is even. Prove that $G$ has a spanning subgraph $H$ such that for every vertex $x$, $\deg_H(x) = \frac12 \deg_G(x)$.

    3.  Prove by induction on $k$ that for all $k \ge 0$, every $2^k$-regular bipartite graph has a $1$-regular spanning subgraph.

10. (BMO 1977) Prove that for each integer $n>1$ it is possible to construct a necklace having $2n^2$ beads in all, these being of $2n$ different colors, in such a way that for each pair of different colors there is at least one pair of adjacent beads of these two colors. Is it possible to do the same using $2n^2-1$ beads in all? Give a reason for your answer.

\

## Footnotes

1.  Or multigraph: even if $G$ is a simple graph, it might already have an edge $xy$, so we need to switch to a multigraph model to add edge $e$.[↩︎](#fnref1)

2.  Heh-heh.[↩︎](#fnref2)

\

- [Home](../index.html)
- [Contents](../contents.html)
- [Part II](index.html)
- Chapter 8


- [← Previous](multigraphs.html)
- [Next →](../trees/index.html)

\

[Start Doing Graph Theory](../book.html) © 2025 by [Mikhail Lavrov](../author.html) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)![](https://mirrors.creativecommons.org/presskit/icons/cc.svg)![](https://mirrors.creativecommons.org/presskit/icons/by.svg)![](https://mirrors.creativecommons.org/presskit/icons/sa.svg)

<!--
## Source links

- [Home](../index.html)
- [Contents](../contents.html)
- [Part II](index.html)
- [← Previous](multigraphs.html)
- [Next →](../trees/index.html)
- [Chapter 4](../beginning/degrees.html)
- [Chapter 17](../hard/hamilton.html)
- [Chapter 20](../hard/line.html)
- [[6]](../appendix/bibliography.html#ref-Ball05)
- [Chapter 16](../matchings/general.html)
- [Chapter 25](../connectivity/cut-vertices.html)
- [[102]](../appendix/bibliography.html#ref-Veblen12)
- [Theorem 4.4](../beginning/degrees.html#thm:min-degree-cycle)
- [Lemma 3.2](../beginning/walks.html#lemma:disconnected)
- [Corollary 4.2](../beginning/degrees.html#cor:odd-vertices)
- [Chapter 7](../degrees/multigraphs.html)
- [Theorem 7.2](../degrees/multigraphs.html#thm:no-sink-cycle)
- [[2]](../appendix/bibliography.html#ref-Alon03)
- [Chapter 13](../matchings/bipartite.html)
- [Start Doing Graph Theory](../book.html)
- [Mikhail Lavrov](../author.html)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
-->
