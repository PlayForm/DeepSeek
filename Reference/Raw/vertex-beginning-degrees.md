# The Degree of a Vertex

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- Chapter 4


- [← Previous](walks.html)
- [Next →](../degrees/index.html)

\

## The purpose of this chapter

After this chapter, I have a whole part of the textbook devoted to the degrees of vertices and the properties of graphs that we can deduce from them. Originally, I had placed this chapter at the beginning of that part, but after writing more of the book, I realized that an introduction to the basics of vertex degrees is too fundamental: the ideas in this chapter will appear over and over again.

To reflect this, I’ve moved this chapter to be the end of the first part of the textbook. After finishing it, you should feel a bit more free to skip around this book depending on what you’re interested in. You may still need to read each part of the textbook in order, and I do assume the knowledge of some things that are covered in previous parts, but there’s less interdependence.

The first half of this chapter consists of computational problems that I find fairly light-hearted; the second half contains some more serious proofs, and it may be a spike in difficulty. If you’re new to writing proofs in graph theory, it is important to study the proof of [Lemma 4.6](#lemma:avg-degree) until you are comfortable with it; it is a good example of how (and why) to induct on the number of vertices in a graph.

\

## The hypercube graphs

Before we begin discussing vertex degrees, let me introduce a new family of graphs to you: the hypercube graphs. The family of hypercube graphs generalizes the cube graph previously mentioned in [Chapter 3](../beginning/walks.html):

**Definition 4.1**. *The **$n$-dimensional hypercube graph $Q_n$** has:*

- *Vertex set $V(Q_n) = \{0,1\}^n$, which we will denote with $n$-bit strings $b_1b_2\dots b_n$. For example, $V(Q_2) = \{00, 01, 10, 11\}$.*

- *An edge between every pair of vertices that differ only in one position. For example, in $Q_3$, vertex $010$ is adjacent to vertices $110$, $000$, and $011$.*

*The $3$-dimensional hypercube graph $Q_3$ is also known as the **cube graph**.*

In $Q_4$, what are the neighbors of vertex $0101$?

Vertices $1101$, $0001$, $0111$, and $0100$: we get $1101$ by flipping the first bit, $0001$ by flipping the second bit, $0111$ by flipping the third bit, and $0100$ by flipping the fourth bit.

![](../images/4-1.png)

$Q_2$

![](../images/4-2.png)

$Q_3$

![](../images/4-3.png)

$Q_4$

Three hypercube graphs of three different dimensions

In [Appendix B](../appendix/induction.html), I give an alternate, recursive definition of $Q_n$: useful when proving any of its properties by induction on $n$.

[Figure 4.1](#fig:hypercube-graphs) shows three examples of hypercube graphs: $Q_2$, $Q_3$, and $Q_4$. You may notice that $Q_2$ resembles a $2$-dimensional square, and $Q_3$ resembles a $3$-dimensional cube; in general, $Q_n$ is the graph that describes the geometrical structure of an $n$-dimensional hypercube. However, $Q_n$ also has a variety of applications that have nothing to do with geometry:

- For computer scientists, it is the graph of $n$-bit sequences with adjacency defined by flipping bits. When is that kind of adjacency useful? For example, when designing error-correcting codes, which need to detect accidental bit flips. The code words in an error correcting code are vertices of $Q_n$ all at a high distance from each other.

- We can also think of the vertices of $Q_n$ as subsets of the set $\{1,2,\dots,n\}$, where an $n$-bit string $b_1 b_2 \dots b_n$ corresponds to the subset $B = \{i : b_i = 1\}$. With this interpretation, the graph theory behind $Q_n$ can tell us about the combinatorics of set families.

- In graph theory, $Q_n$ can be useful as a simple construction of a graph with many vertices and lots of symmetry; additionally, despite having relatively few edges for how many vertices it has, none of the vertices are very far apart.

But “relatively few edges for how many vertices it has” is a vague statement. How many vertices does $Q_n$ have, and how many edges?

To count the vertices, it’s enough to think about the number of ways to choose an element $b_1b_2 \dots b_n \in Q_n$: for each bit $b_i$, there are $2$ choices, and each choice can be made independently of the others, so there are $2^n$ choices overall.

To find the number of edges in $Q_n$, we will first develop a bit of the theory of vertex degrees, which will make the problem much easier.

\

## The handshake lemma

Let’s begin with the main definition:

**Definition 4.2**. *The **degree** of a vertex is the number of incident edges it has. The degree of vertex $x$ in a graph $G$ is written $\deg_G(x)$, or just $\deg(x)$ if the graph is clear from context.*

[Figure 4.2](#fig:degree-example) shows an $8$-vertex graph with vertices labeled according to their degree.

![](../images/4-4.png)

An $8$-vertex graph labeled with the degrees of its vertices

In a graph with $8$ vertices, what is the largest number that could be the degree of a vertex?

$7$: if a vertex $x$ is adjacent to every other vertex, then $\deg(x) = 7$. In general, in an $n$-vertex graph, the largest degree possible is $n-1$.

There is a lot of associated terminology.

**Definition 4.3**. *An **isolated vertex** is a vertex whose degree is $0$; a **leaf** is a vertex whose degree is $1$.*

Isolated vertices are interesting because they are the smallest possible connected components in a graph. Leaves are less obviously notable; we will (appropriately) find out what’s interesting about them when we study trees in [Chapter 10](../trees/properties.html).

**Definition 4.4**. *The **maximum degree** $\Delta(G)$ of a graph $G$ is the largest degree of any vertex. The **minimum degree** $\delta(G)$ of a graph $G$ is the smallest degree of any vertex.*

The notation $\Delta(G)$ and $\delta(G)$ is only the beginning of a general trend to use Greek letters for numerical properties of graphs; for the important properties, these letters are mostly standard. (If you are unfamiliar with the Greek alphabet, $\Delta$ and $\delta$ are an uppercase and lowercase “delta”, respectively; this is a “d” for “degree”, uppercase for maximum and lowercase for minimum. It’s not entirely random.)

The handshake lemma, or degree sum formula, is the first tool that gives degrees any sort of purpose. In my opinion, it is one of the main results from graph theory that mathematicians from all fields should know: not just for its statement, but to use as a way of thinking about graphs. The other result that I’d put in that category is Hall’s theorem ([Theorem 15.1](../matchings/hall.html#thm:hall)), which we’ll prove in [Chapter 15](../matchings/hall.html).

**Lemma 4.1** (Handshake lemma). *In any graph $G$, the vertex degrees add up to twice the number of edges: $$\sum_{v \in V(G)} \deg_G(v) = 2 |E(G)|.$$*

*Proof.* Many proofs exist; for the sake of practice, let’s do a proof by induction. We will prove that for any graph with $m$ edges, the sum of degrees is $2m$, by induction on $m$.

The base case is $m=0$. Here, we have a graph with no edges. No matter how many vertices we have, their degrees are all $0$, the sum of the degrees is $0$, and $2m$ is also $0$.

Assume that the degree sum formula holds for all $(m-1)$-edge graphs. Let $G$ be a graph with $m \ge 1$ edges, and let $xy$ be any edge of $G$. We can apply the induction hypothesis to $G-xy$ (the graph we get by deleting edge $xy$ from $G$), a graph with $m-1$ edges.

What is the relationship between the degrees of $G$ and the degrees of $G - xy$? Both $x$ and $y$ have one extra incident edge in $G$ that they don’t have in $G-xy$: edge $xy$ itself. So $$\deg_G (x) = 1 + \deg_{G-xy}(x) \text{ and } \deg_G(y) = 1 + \deg_{G-xy}(y).$$ For any other vertex $v$, $G-xy$ and $G$ have the same number of edges, so we have $$\deg_G(v) = \deg_{G-xy}(v).$$ Also, $G-xy$ and $G$ have the same set of vertices. So if we add up the vertex degrees in $G-xy$ and $G$, the result is that $$\sum_{v \in V(G)} \deg_G(v) = 2 + \sum_{v \in V(G-xy)} \deg_{G-xy}(v).$$ Applying the induction hypothesis, we get that the degree sum in $G-xy$ is $2(m-1)$, so the degree sum in $G$ is $2(m-1) + 2 = 2m$.

By induction, the degree sum formula holds for all graphs. ◻

Using the handshake lemma, we can immediately answer our earlier question: how many edges does the hypercube $Q_n$ have? There are $2^n$ vertices in $Q_n$, and each of them has $n$ neighbors: every bit sequence $b_1 b_2 \dots b_n$ has $n$ places in which a bit an be toggled. So the sum of degrees is $n \cdot 2^n$, and therefore the number of edges is $n \cdot 2^{n-1}$.

Here are some other questions we can answer quickly using the handshake lemma:

**Problem 4.1**. *In particular, $Q_3$ has $8$ vertices of degree $3$. Can we have a $7$-vertex graph where all the vertices have degree $3$?*

*Answer to [Problem 4.1](#problem:7-vertex-cubic-graph).* No: then the degree sum would be $7 \cdot 3 = 21$, so there would be $10.5$ edges, which is impossible. ◻

**Problem 4.2**. *A soccer ball has $12$ black pentagonal panels (and some white hexagonal panels I’m too lazy to count). Panels are stitched along their edges, and meet at corners; at each corner, a pentagon and two hexagons meet. How many edges are there where two panels meet?*

*Answer to [Problem 4.2](#problem:soccer-ball).* Each black pentagon has $5$ corners, which will be the $12 \cdot 5 = 60$ vertices of our graph; the edges will be the edges where panels meet. Here, each vertex has degree $3$, so the sum of degrees is $60 \cdot 3 = 180$, and there are $90$ edges.

(Some slightly fancier logic can convince us that there are $20$ hexagons; see the practice problems at the end of this chapter.) ◻

**Problem 4.3**. *Suppose you have a graph $G$ with $9$ vertices and $20$ edges. What can the minimum degree $\delta(G)$ of this graph be?*

*Answer to [Problem 4.3](#problem:minimum-degree).* Since the sum of the degrees is $2 \cdot 20 = 40$, the average of the degrees is $\frac{40}{9} \approx 4.44$. So the minimum degree can be at most $4$: if every vertex had degree $5$ or more, then the sum of degrees would be at least $5 \cdot 9 = 45$. We can find $9$-vertex, $20$-edge graphs with a minimum degree of each of $0$, $1$, $2$, $3$, or $4$; try it yourself! ◻

![](../images/4-5.png)

An full binary tree with $8$ vertices; the marked vertices are leaves.

**Problem 4.4**. *In computer science, a full binary tree is a graph where every vertex is adjacent to up to $3$ vertices: a parent and up to $2$ children. Every vertex except one (the root) has a parent; every vertex has either $0$ children or $2$ children. (The parent-child relationship is symmetric.) [Figure 4.3](#fig:full-binary-tree) shows a $9$-vertex full binary tree; $5$ of its vertices are leaves. In a $99$-vertex full binary tree, how many leaves would there be?*

*Answer to [Problem 4.4](#problem:full-binary-tree).* Suppose there are $k$ leaves, which each have degree $1$; there is $1$ root, with degree $2$, leaving $99-k-1$ vertices with degree $3$ (a parent and $2$ children). So the total degree is $k + 2 + 3(99-k-1)$ or $3 \cdot 99 - 2k - 1$.

By the handshake lemma, this is twice the number of edges. But we can count the edges differently! Each edge is between a parent and a child; all $98$ vertices except the root have a parent, so there are $98$ edges. Setting $3 \cdot 99 - 2k - 1$ equal to $2\cdot 98$ and solving for $k$, we get $k=50$: there must be $50$ leaves. ◻

We can generalize the answer to [Problem 4.1](#problem:7-vertex-cubic-graph):

**Corollary 4.2**. *Every graph $G$ must have an even number of vertices (possibly $0$) whose degree is odd.*

*Proof.* What is the parity of the sum of degrees of $G$: is it odd or even?

One way to answer that question is simply to add up all the degrees. Starting from $0$ (an even number), when we add an even degree to the total, it does not change the parity; when we add an odd degree to the total, it flips the parity. So if the number of odd degrees is even, the parity is flipped an even number of times, and ends at an even number; if the number of odd degrees is odd, the parity is flipped an odd number of times, and ends at an odd number.

Another way to answer the question, however, is to use the handshake lemma. The sum of degrees of $G$ is definitely an even number, because it’s twice the number of edges!

For the two answers to agree, as we know they must, there must be an even number of vertices with odd degree. ◻

\

## Degrees and connectedness

Here’s another way we can use the minimum degree of a graph:

**Proposition 4.3**. *Let $G$ be a graph with $n$ vertices whose minimum degree $\delta(G)$ is at least $\frac{n-1}{2}$. Then $G$ is connected.*

*Proof.* We want to show that given any two vertices $x$ and $y$, $G$ must have an $x-y$ walk.

This is definitely true if $xy$ is an edge of $G$: in this case, the sequence $(x,y)$ is an $x-y$ walk. So let’s suppose that $xy \notin E(G)$.

There are $n-2$ vertices in $G$ other than $x$ and $y$. Of these $n-2$ vertices, at least $\frac{n-1}{2}$ are adjacent to $x$, and at least $\frac{n-1}{2}$ are adjacent to $y$. Together, $\frac{n-1}{2} + \frac{n-1}{2}$ adds up to more than $n-2$, so there must be some overlap! That overlap is a vertex $z$ adjacent to both $x$ and $y$.

In this case, $(x,z,y)$ is an $x-y$ walk, completing our proof. ◻

(Actually, we’ve shown more: we’ve shown that the distance between any two vertices is at most $2$. In such cases, we say that $G$ has *diameter* at most $2$: more on this topic in [Chapter 5](../degrees/regular.html).)

[Proposition 4.3](#prop:min-degree-connected) is a very common type of theorem to prove; it is, in some sense, our first glimpse of extremal graph theory. Extremal graph theory is the sub-discipline of graph theory that explores the relationships between possible values of different graph properties. Here are a couple of ways this can go:

- Suppose we consider two numerical invariants of graphs: $x(G)$ and $y(G)$. It is very rare that knowing $x(G)$ will tell us $y(G)$, if we’ve bothered to define both numbers at all. However, maybe knowing $x(G)$ will give us a range of possible values of $y(G)$: there is a region in the $xy$-plane where the points $(x(G), y(G))$ can go.

  To describe that region, it’s natural to explore its boundaries. That’s why extremal graph theory is “extremal”: it studies the extreme (highest or lowest) values that one invariant can have, based on another. We might describe the relationship between the two invariants by an inequality: for example, the inequality $\delta(G) \le \Delta(G)$ is a rather silly statement of extremal graph theory.

- Suppose we consider a numerical invariant $x(G)$ and a property $P$ that a graph $G$ either has or does not have. Then the “extremal” question we can ask is this: among graphs that have $P$, what is the range of possible values of $x(G)$? What about graphs that do not have $P$? Using this, we might be able to deduce whether a graph $G$ has property $P$ or not, based on the value of $x(G)$.

[Proposition 4.3](#prop:min-degree-connected) is an example of the second type of statement, describing the relationship between minimum degree and connectedness. It is very common in extremal graph theory to ask: what is a lower bound $\delta(G) \ge \underline{\phantom{n/2}}$ that will guarantee that $G$ has a certain property?

Of course, we have to try to find a good lower bound. It is much easier to prove the statement, “If an $n$-vertex graph $G$ has minimum degree $n-1$, then $G$ is connected,” because the only $n$-vertex graph $G$ with minimum degree $n-1$ is the complete graph $K_n$. However, [Proposition 4.3](#prop:min-degree-connected) is stronger: it applies to more graphs. Is it as strong as possible?

To answer that question, we look for a so-called “extremal example”. If we can find a graph $G$ which just barely fails the condition $\delta(G) \ge \frac{n-1}{2}$, but is not connected, then we know that [Proposition 4.3](#prop:min-degree-connected) cannot be improved any further: that graph $G$ is the limit. (Ideally, we’d find such a graph for many possible values of $n$, to give an example that applies to all situations.)

There is such an example. Suppose $n$ is even, and $G$ has two connected components which are complete graphs with $\frac n2$ vertices each. Then each vertex is adjacent to the $\frac n2 - 1$ other vertices in its component, and $\delta(G) = \frac n2 - 1$, yet $G$ is not connected.

Suppose that $n$ is odd: $n=2k+1$ for some $k$. What is the largest possible degree in a graph $G$ which is not connected?

It is $k-1$, which we can achieve when one component of $G$ is a $k$-vertex complete graph, and the other is a $(k+1)$-vertex complete graph.

How do we know we can’t do better than this example?

The next integer after $k-1$ is $k$, which is exactly equal to $\frac{n-1}{2}$: at this point, by [Proposition 4.3](#prop:min-degree-connected), we know that the graph must be connected.

\

## Degrees and cycles

The following theorem, and [Corollary 4.7](#cor:n-edge-cycle) in the next section, will both be very useful to us many times in future chapters; notably, in [Chapter 8](../degrees/euler.html) to find cycle decompositions and in [Chapter 10](../trees/properties.html) to study graphs with no cycles. In the meantime, they will show a few other ways we can use vertex degrees in proofs.

**Theorem 4.4**. *Every graph $G$ whose minimum degree $\delta(G)$ is at least $2$ contains a cycle.*

*Proof.* Let the walk $(x_0, x_1, \dots, x_l)$ represent a longest path in $G$.

We know $\delta(G) \ge 2$ and therefore in particular $\deg(x_l) \ge 2$. Is it possible that $x_l$ has a neighbor $y$ which is not one of $x_0, x_1, \dots, x_{l-1}$? No! In that case, the walk $(x_0, x_1, \dots, x_l, y)$ would represent a longer path.

So $x_l$ has at least two neighbors, and they are all in the set $\{x_0, x_1, \dots, x_{l-1}\}$. [Figure 4.4(a)](#fig:going-back-to-xi) shows an example in which the walk representing the longest path is $(1,2,3,4,5,6,7)$, and $x_l = 7$ is adjacent to vertices $2$, $4$, and $6$.

One of $x_l$’s neighbors is $x_{l-1}$: the previous vertex on the path. This doesn’t help us. But there must be another vertex $x_i$ with $i < l-1$ which is also adjacent to $x_l$.

Then the closed walk $(x_i, x_{i+1}, \dots, x_l, x_i)$ represents the cycle we wanted. ◻

How do we know that a longest path in $G$ exists?

There’s an upper limit to the length of a path: in an $n$-vertex graph, there can be no path of length $n$ or larger, because such a path would need to contain $n+1$ different vertices.

Why does this matter for our proof?

If we begin our proof by taking a longest path in $G$, then it had better be the case that such an object exists. We could not begin a proof by saying, “Let $(x_0, x_1, x_2, \dots, x_l)$ be a longest walk in $G$,” because there are often arbitrarily long walks.

![](../images/4-6.png)

From a longest path to a cycle

![](../images/4-7.png)

An extremal example

Illustrations for [Theorem 4.4](#thm:min-degree-cycle) and [Proposition 4.5](#prop:min-degree-long-cycle)

What if we raise the minimum degree, and assume $\delta(G) \ge 3$, or $\delta(G) \ge 10$? In that case, we have greater flexibility in choosing vertex $x_i$, because $x_l$ will have more neighbors among $\{x_0, x_1, \dots, x_{l-2}\}$. One possible way to use that flexibility is to strengthen the result in [Theorem 4.4](#thm:min-degree-cycle) by choosing the vertex $x_i$ that will give us the longest cycle. For example, in [Figure 4.4(a)](#fig:going-back-to-xi), going from vertex $7$ back to vertex $4$ gives us a cycle of length $4$, but going back all the way to vertex $2$ gives a cycle of length $6$.

What lower bound can we prove on the length of this cycle, in terms of $\delta(G)$? This is an instance in which, if you are feeling sufficiently motivated, you should stop reading and take a moment to try to state, and prove, a stronger result on your own.

If not, join me and continue!

**Proposition 4.5**. *Every graph $G$ with $\delta(G) \ge 2$ contains a cycle of length at least $\delta(G)+1$.*

*Proof.* As in the proof of [Theorem 4.4](#thm:min-degree-cycle), if the walk $(x_0, x_1, \dots, x_l)$ represents a longest path in $G$, then $x_l$ has at least $\delta(G)$ neighbors, which are all in the set $\{x_0, x_1, \dots, x_{l-1}\}$.

We are still going to continue by choosing a vertex $x_i$ adjacent to $x_l$ and looking at the closed walk $(x_i, x_{i+1}, \dots, x_l, x_i)$, but we’re trying to find a long cycle.

Which $x_i$ should we pick to make the closed walk as long as possible?

The $x_i$ with the least value of $i$.

As long as $\delta(G) \ge 2$, the $x_i$ with the least $i$ will come before $x_{l-1}$, so the closed walk $(x_i, x_{i+1}, \dots, x_l, x_i)$ really will represent a cycle. (All that’s necessary here is that it has length at least $3$.) What’s more, the vertices of the cycle include $x_l$ as well as every neighbor of $x_l$, because we went back to the earliest neighbor we could. This tells us that the cycle has at least $\delta(G)+1$ vertices, and therefore its length is at least $\delta(G)+1$. ◻

As before, we should ask if this is the best possible result: can we find examples where no cycle has length more than $\delta(G)+1$? One example where we cannot exceed this is a complete graph: in $K_n$, the minimum degree is $n-1$ and no cycle has length more than $n$.

[Figure 4.4(b)](#fig:no-long-cycle) shows a more satisfying kind of example, in my opinion. Here, we take the union of several copies of $K_n$ that overlap in individual vertices. If we arrange them with some care, then the minimum degree is still $n-1$ and there is still no cycle of length more than $n$. But the number of vertices can be made arbitrarily large, so it is clear that it’s not the limiting factor.

\

## Average degree

Even if you have lots and lots and lots of edges, your minimum degree can be very small. For example, a $100$-vertex graph might consist of a $99$-vertex complete graph and a single isolated vertex. This has $4851$ edges, which is close to the maximum number of edges a $100$-vertex graph can have: $4950$. And yet the minimum degree is $0$, and we can’t apply any nice results like [Theorem 4.4](#thm:min-degree-cycle) to this graph.

The following lemma partially solves this problem, and is very commonly used in extremal graph theory. It was first proved by Pál Erdős in 1964 [\[30\]](../appendix/bibliography.html#ref-Erdos64) to solve a problem relating average degree to the existence of certain subgraphs, though special cases of it were used even earlier.

**Lemma 4.6**. *Let $G$ be a graph with average degree at least $d$, where $d$ is a positive integer. Then $G$ contains a subgraph $H$ with $\delta(H) > \frac d2$.*

*Proof.* We induct on $n$, the number of vertices in $G$. (This proof carefully follows the induction template from [Appendix B](../appendix/induction.html), to avoid any errors.)

When $n \le d$, the theorem “holds trivially”: that is, when $n \le d$, the highest possible degree in $G$ is $d-1$, so $G$ cannot have average degree $d$ or more to begin with! We could use that as our base case, but it’s a bit more satisfying to use $n=d+1$.

In this case, the highest possible degree in the graph is $d$. The average degree can only be this high if every vertex has degree $d$: if $G = K_{d+1}$. In this case, $G$ itself is the subgraph $H$ we’re looking for. This base case also holds.

Either way, suppose that the theorem holds for all $(n-1)$-vertex graphs with average degree at least $d$. Let $G$ be an $n$-vertex graph with average degree at least $d$.

At this point, let’s say something about average degree. If $G$ has vertices $x_1, x_2, \dots, x_n$, then the average of the degrees is $$\frac{\deg(x_1) + \deg(x_2) + \dots + \deg(x_n)}{n} = \frac{2|E(G)|}{n},$$ by the handshake lemma. This equation tells us that the average degree of $G$ is $\frac12 n$ times the number of edges in $G$. In particular, the statement “$G$ has average degree at least $d$” is equivalent to the statement “$G$ has at least $\frac12 nd$ edges”.

We’re assuming $G$ has average degree at least $d$, so we’re assuming that $G$ has at least $\frac12 nd$ edges. Also, if $\delta(G) > \frac d2$, then we are already done: we were looking for a subgraph with this minimum degree, and $G$ itself can be that subgraph! So we can add on a further assumption for free: that $G$ has a vertex $x$ with $\deg(x) \le \frac d2$.

In that case, let $G' = G-x$: the graph obtained from $G$ by deleting $x$. We know that $G'$ has $n-1$ vertices and at least $\frac12 nd - \frac d2$ edges: we started with at least $\frac12 nd$ edges, and we lost at most $\frac d2$ of them from deleting $x$. This simplifies to $\frac12(n-1)d$, so $G'$ has at least $\frac12(n-1)d$ edges, which means $G'$ has average degree at least $d$, too!

By applying the induction hypothesis to $G'$, we learn that $G'$ has a subgraph $H$ with $\delta(H) > \frac d2$. Since $H$ is a subgraph of $G'$, and $G'$ is a subgraph of $G$, we have found the subgraph of $G$ we wanted.

By induction, the theorem holds for graphs with any number of vertices. ◻

Using [Lemma 4.6](#lemma:avg-degree), we can convert minimum-degree results to average-degree results. For example, we can use [Lemma 4.6](#lemma:avg-degree) to turn [Theorem 4.4](#thm:min-degree-cycle) into a result about average degree—or, equivalently, about the number of edges.

**Corollary 4.7**. *If $G$ has $n$ vertices and at least $n$ edges, then $G$ contains a cycle.*

*Proof.* If $G$ has $n$ vertices and at least $n$ edges, it has average degree at least $d=2$. By [Lemma 4.6](#lemma:avg-degree), $G$ has a subgraph $H$ with $\delta(H) > \frac d2 = 1$. If $\delta(H) > 1$, then $\delta(H) \ge 2$, so by [Theorem 4.4](#thm:min-degree-cycle), $H$ contains a cycle. This is also a cycle in $G$. ◻

Is the lower bound “at least $n$ edges” in [Corollary 4.7](#cor:n-edge-cycle) the best lower bound possible?

Yes: a graph with $n$ vertices and $n-1$ edges does not need to contain a cycle. For example, the graph $P_n$ has $n$ vertices, $n-1$ edges, and no cycles.

\

## Practice problems

1.  Suppose that $G$ is a graph with $5$ vertices and $7$ edges. For which pairs $(a,b)$ is it possible that $\delta(G) = a$ and $\Delta(G) = b$?

    For the cases where it is possible, give an example. For the cases where it is not possible, explain why not.

2.  The five *Platonic solids* (defined in more detail in [Chapter 23](../planar/polyhedra.html)) are:

    - The tetrahedron, which has $4$ vertices and $4$ triangular faces, with $3$ faces meeting at every corner.

    - The cube, which has $8$ vertices and $6$ square faces, with $3$ faces meeting at every corner.

    - The octahedron, which has $6$ vertices and $8$ triangular faces, with $4$ faces meeting at every corner.

    - The dodecahedron, which has $20$ vertices and $12$ pentagonal faces, with $3$ faces meeting at every corner.

    - The icosahedron, which has $12$ vertices and $20$ triangular faces, with $5$ faces meeting at every corner.

    In each case, find the number of edges where two faces meet.

3.  Let’s return to the soccer ball in [Problem 4.2](#problem:soccer-ball). Let the soccer ball have $12$ pentagons and $x$ hexagons. Each pentagon borders $5$ hexagons; each hexagon borders $3$ pentagons and $3$ other hexagons.

    Consider a different graph describing the soccer ball: its vertices are the pentagonal and hexagonal panels, and two vertices are adjacent whenever the panels are stitched together.

    1.  Use the handshake lemma to compute the number of edges in this graph.

    2.  Use the handshake lemma on a subgraph of this graph to find the number of edges corresponding to hexagon-to-hexagon boundaries.

    3.  Solve for $x$.

4.  Prove that when $n\ge 3$, every $n$-vertex graph with at least $\binom n2 - (n-2)$ edges is connected.

    (You should think of this bound in the following way: every $n$-vertex graph which is missing at most $n-2$ edges is connected.)

    Is this the best bound possible? Is there an example of an $n$-vertex graph with $\binom n2 - (n-2)$ edges which is not connected?

5.  Let $G_n$ be the subgraph of $Q_n$ induced by the vertices in which the total number of $1$’s is either $1$ or $2$. (For example, the vertices of $G_3$ are $\{001, 010, 100, 011, 101, 110\}$.)

    1.  Draw a diagram of $G_4$, and find the degree of each vertex.

    2.  How many edges does $G_n$ have, as a function of $n$?

6.  1.  A connected graph $G$ has the property that for every edge $xy$, $\deg(x) = \deg(y)$. Prove that all vertices of $G$ have the same degree.

    2.  A connected graph $G$ has the property that for every vertex $x$, the degree of $x$ is at most the average degree of the neighbors of $x$. That is, if the neighbors of $x$ are $y_1, y_2, \dots, y_k$, then $$\deg(x) \le \frac{\deg(y_1) + \deg(y_2) + \dots + \deg(y_k)}{k}.$$ Prove that all vertices of $G$ have the same degree.

7.  An open problem called Conway’s $99$-graph problem is to determine whether there is a $99$-vertex graph with the following properties:

    - Every two adjacent vertices have exactly one common neighbor;

    - Every two non-adjacent vertices have exactly two common neighbors.

    If such a graph exists, then every vertex in it must have the same degree, $d$. What is $d$?

    (I am not asking you to find the graph. John Conway offered a \$1000 reward [\[20\]](../appendix/bibliography.html#ref-Conway17) for a solution to the problem! That gives you an idea of how hard that would be.)

8.  (IMO 1971) Prove that for every positive integer $m$ we can find a finite set $S$ of points in the plane, such that given any point $A$ of $S$, there are exactly $m$ points in $S$ at unit distance from $A$.

\

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- Chapter 4


- [← Previous](walks.html)
- [Next →](../degrees/index.html)

\

[Start Doing Graph Theory](../book.html) © 2025 by [Mikhail Lavrov](../author.html) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)![](https://mirrors.creativecommons.org/presskit/icons/cc.svg)![](https://mirrors.creativecommons.org/presskit/icons/by.svg)![](https://mirrors.creativecommons.org/presskit/icons/sa.svg)

<!--
## Source links

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- [← Previous](walks.html)
- [Next →](../degrees/index.html)
- [Chapter 3](../beginning/walks.html)
- [Appendix B](../appendix/induction.html)
- [Chapter 10](../trees/properties.html)
- [Theorem 15.1](../matchings/hall.html#thm:hall)
- [Chapter 15](../matchings/hall.html)
- [Chapter 5](../degrees/regular.html)
- [Chapter 8](../degrees/euler.html)
- [[30]](../appendix/bibliography.html#ref-Erdos64)
- [Chapter 23](../planar/polyhedra.html)
- [[20]](../appendix/bibliography.html#ref-Conway17)
- [Start Doing Graph Theory](../book.html)
- [Mikhail Lavrov](../author.html)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
-->
