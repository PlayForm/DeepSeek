# Directed Acyclic Graphs

- [Home](../index.html)
- [Contents](../contents.html)
- [Part III](index.html)
- Chapter 12


- [← Previous](cayley.html)
- [Next →](../matchings/index.html)

\

## The purpose of this chapter

It may be a slightly odd choice to put a chapter on directed acyclic graphs in the part of the book about trees, but I think there is a thematic fit. We will see some analogies between directed acyclic graphs and trees. (Or should it be forests?)

Additionally, just as trees can help us study connected graphs, directed acyclic graphs can help us study the connectedness of digraphs, via strongly connected components and condensations. This is mostly a coincidence, though; the use of directed acyclic graphs is very different from the use of trees. However, in this way, we can take a second look at some of the concepts from [Chapter 3](../beginning/walks.html), and how they change when the graph is directed.

Since we’ll be dealing exclusively with directed graphs for the entire chapter, be sure to keep the definitions and results from the second half of [Chapter 7](../degrees/multigraphs.html) in mind as you read.

\

## Directed acyclic graphs

[Figure 12.1(a)](#fig:ksu-classes) shows one example of the kind of graph we will study in this chapter—loosely inspired by real life. It represents the course prerequisite relationship between several math courses offered at Kennesaw State University. It also includes one fictional course: MATH 3333, which is what I imagine the course number for a course on random graphs would be. (MATH 3333 doesn’t really exist, but I have often thought that if it did, it would have been so fun to teach.)

With or without this fictional innovation, there is one important property that the digraph in [Figure 12.1(a)](#fig:ksu-classes) should have, from the point of view of graph theory. Unless something is very wrong, it should not have a cycle!

What would go wrong if we had a cycle? For example, what would go wrong if we added an arc $(3322, 2202)$?

There would be no way to take the courses in the cycle while obeying the prerequisites. Each course in the set $\{2202, 2203, 3322\}$ has a prerequisite in that set, giving no starting point.

This is such a common restriction (equally applicable to course offerings, baking recipes, or assembly lines) that the directed graphs obeying it have their own name.

**Definition 12.1**. *An **directed acyclic graph**, or sometimes “dag” for short, is a directed graph that contains no cycles.*

![](../images/12-1.png)

Do not use as academic advice

![](../images/12-2.png)

An example of a research tree

Two examples of directed acyclic graphs

[Figure 12.1(b)](#fig:tech-tree) shows another example of a directed acyclic graph: my own simplified representation of a research tree from a game like *Civilization*. This one also represents prerequisites: this time, for acquiring new technologies in the game. We imagine that, for example, until a civilization masters the use of writing, it cannot possibly hope to invent the calendar: hence the arc from the “writing” node to the “calendar” node.

Although this structure is called a research tree, it doesn’t exactly resemble the undirected graphs we call trees in every way. For one, we don’t require the digraph to be connected. (If we also included all the German classes at KSU in [Figure 12.1(a)](#fig:ksu-classes), we would probably not see any arcs between the two types of classes.) This means that there is no lower bound on the number of arcs; we should be comparing directed acyclic graphs to forests, not trees. However, the upper bound on the number of arcs is much weaker as well.

Suppose you can alter the course of history and change the relationships between the $8$ technologies in [Figure 12.1(b)](#fig:tech-tree) to any directed acyclic graph you like. What is the maximum number of arcs you can make?

If the only requirement is to avoid cycles, we can have up to $28$ arcs, by arranging the $8$ technologies in a line and drawing arcs from each technology to all those that come after it.

This $28$-arc solution has some redundant arcs: if arcs $(x,y)$ and $(y,z)$ exist, then as far as modeling prerequisites goes, there is no need for arc $(x,z)$. But redundancy can’t take all the blame.

What is the maximum number of arcs if we never include arc $(x,z)$ as long as both $(x,y)$ and $(y,z)$ exist?

We can still get up to $16$ arcs by dividing the technologies into four “basic” and four “advanced” ones, and adding an arc from each basic technology to each advanced technology.

There are some parallels between directed acyclic graphs and trees, though. In trees, we have learned to look for leaves: vertices of degree $1$. In directed acyclic graphs, we instead look for *sources* (vertices of indegree $0$, as defined in [Chapter 7](../degrees/multigraphs.html)) and *sinks* (vertices of outdegree $0$).

**Lemma 12.1**. *Every directed acyclic graph has at least one source and at least one sink.*

*Proof.* As far as the existence of a source goes, this is exactly the contrapositive of [Theorem 7.2](../degrees/multigraphs.html#thm:no-sink-cycle), and the existence of a sink is the contrapositive of a “mirror version” of that theorem. But we can also prove this result from scratch.

Let $D$ be a directed acyclic graph, and let the walk $(x_0, x_1, \dots, x_l)$ represent the longest path in $D$. There cannot be an arc $(y,x_0)$ for any $y \in V(D)$: if $y$ is a vertex on the path, then a cycle is created, and if not, then the walk $(y, x_0, x_1, \dots, x_l)$ represents a longer path. Therefore $x_0$ is a source.

Similarly, there cannot be an arc $(x_l, z)$ for any $z \in V(D)$: if $z$ is a vertex on the path, then a cycle is created, and if not, then the walk $(x_0, x_1, \dots, x_l, z)$ represents a longer path. Therefore $x_l$ is a sink. ◻

The parallel is not only in the proof technique (which, by the way, could be directly adapted to a proof of [Lemma 10.5](../trees/properties.html#lemma:leaves) on the existence of leaves in a tree). Just like leaves, sources and sinks are the best choice when writing a proof by induction on directed acyclic graphs, or when coming up with a recursive algorithm. Although it’s true that for every vertex $x$ in a directed acyclic graph $D$, the digraph $D-x$ also has no cycles, it is still best to remove a source or sink, because they’re often easiest to put back.

To give an example, suppose we are given a directed acyclic graph $D$, and want to compute the length of a longest path in $D$. To do so, we’ll set ourselves a slightly harder task: for every vertex $x \in V(D)$, we will compute the value $f(x)$ equal to the length of the longest path in $D$ ending at $x$. (If we want the absolute longest path, simply find the largest value of $f$ over all vertices.)

If the directed acyclic graph $D$ has only one vertex, we will assign that vertex a value of $0$, because $D$ cannot have a path of any positive length. If $D$ has more vertices, then we compute $f$ recursively: let $x$ be any sink in $D$, and apply our algorithm to $D-x$.

In $D$, for any vertex $y \ne x$, the value $f(y)$ should be the same as in $D-x$. There cannot be any path ending at $y$ that goes through $x$, because it’s impossible for a path to leave $x$. So we only need to evaluate $f(x)$. To do this, let $y_1, y_2, \dots, y_k$ be the vertices with an arc to $x$: then every path to $x$ is either the length-$0$ path that starts at $x$, or enters $x$ via some $y_i$, so we define $$f(x) := \max\{0, f(y_1), f(y_2), \dots, f(y_k)\}.$$ Now we have computed $f$ for every vertex of $D$.

If all we needed was a longest path in $D$, and we did not care where it ended, why did we decide to compute $f(x)$?

If we want to work recursively, but only compute longest paths, we might miss the longest path in $D$ if it didn’t extend a longest path in a subgraph of $D$.

Why is it necessary for the removed vertex $x$ to be a sink?

If $x$ is not a sink, then in going from $D-x$ to $D$, we might have to change many other $f$-values in addition to $f(x)$.

\

## Topological orders

Suppose you buy a piece of furniture which comes disassembled with a set of instructions for how to put it together. In principle, the necessary steps could form an arbitrary directed acyclic graph, and there is some freedom in deciding which steps to perform before which others. However, the instructions probably list the steps in order, to avoid confusion.

Given a directed acyclic graph $D$, a **topological order** of $D$ is a generalization of this idea. It is a sequence $x_1, x_2, \dots, x_n$ listing all the vertices of $D$ such that for every arc $(x_i, x_j) \in E(D)$, vertex $x_i$ comes before vertex $x_j$ in the topological order: $i < j$. For example, given the class prerequisites shown in [Figure 12.1(a)](#fig:ksu-classes), one possible topological order is $$1190, 2202, 2203, 2306, 2390, 3260, 3204, 3322, 3332, 3333, 4260, 4310, 4361, 4362, 4381, 4382$$ which puts the courses in numerical order. (I assume that most departments in most universities make sure that the numerical order on their courses is also a topological order, though it is not always the only order or the best order in which to take the courses.)

**Proposition 12.2**. *Every directed acyclic graph $D$ has a topological order.*

*Proof.* We induct on the vertices of $D$. If $D$ has only one vertex, then there is only way to list the vertices in a sequence, and it is vacuously a topological order.

Let $n>1$; suppose $D$ has $n$ vertices, and that every $(n-1)$-vertex directed acyclic graph has a topological order. By [Lemma 12.1](#lemma:dag-source-sink), $D$ has a sink $x$. By the inductive hypothesis, $D-x$ has a topological order $x_1, x_2, \dots, x_{n-1}$. Let $x_n = x$. Then for every arc $(x_i, x_j)$, we consider three cases:

- If $i<n$ and $j<n$, then $(x_i, x_j)$ is an arc of $D-x$, and since we chose $x_1, x_2, \dots, x_{n-1}$ to be a topological order of $D-x$, we must have $i<j$.

- If $i<n$ and $j=n$, then $i<j$ by substitution, with no need for graph theory.

- The case $i=n$ and $j<n$ is impossible, because $x_n = x$ is a sink, and there are no arcs out of it.

In all possible cases, $i<j$, and so $x_1, x_2, \dots, x_n$ is a topological order of $D$. By induction, topological orders exist for directed acyclic graphs with any number of vertices. ◻

Can a directed graph $D$ have a topological order if it has a cycle?

No: if $D$ has a topological order $x_1, x_2, \dots, x_n$, then no path that leaves $x_i$ can return it, because all arcs only take you forward in the topological order. Therefore $D$ cannot contain any cycles.

[Proposition 12.2](#prop:top-order) is a good illustration of how we can use [Lemma 12.1](#lemma:dag-source-sink) to prove properties of directed acyclic graphs by induction. However, in many cases, it also makes induction (and recursive algorithms) unnecessary. For example, the algorithm in our previous section for computing the longest directed graph can now be rephrased more directly. First, choose a topological order $x_1, x_2, \dots, x_n$. Then, for each $i=1,2,\dots,n$, compute $f(x_i)$ by using the values of some of the previous vertices $f(x_1), f(x_2), \dots, f(x_{i-1})$.

\

## Strongly connected

We will now abandon directed acyclic graphs for a moment and turn to a seemingly unrelated topic: the question of what it means for a directed graph to be connected.

In [Chapter 8](../degrees/euler.html), we had to develop one definition of connectedness for directed graphs. We defined a *weakly connected* digraph to be a digraph whose underlying graph is connected. This is not always the wrong definition, and in fact, we developed it with the best intentions possible: it was the definition we needed! However, I also find it vaguely unsatisfying, because it doesn’t tell us anything about directed walks at all.

The opposite approach is to directly copy the definition of connectedness. We will say that a directed graph $D$ is *strongly connected* if, for every $x \in V(D)$ and every $y\in V(D)$, there is a directed $x-y$ walk. Because we could have chosen $y,x$ instead of $x,y$, there must also be a directed $y-x$ walk. (For directed graphs that are not strongly connected, this is not guaranteed to be true.)

Is a directed path graph $\overrightarrow{P_n}$ strongly connected? What about a directed cycle graph $\overrightarrow{C_n}$?

The directed path graph is not strongly connected for $n>1$: in fact, it’s a directed acyclic graph! You can never get to an earlier vertex from a later vertex.

Meanwhile, $\overrightarrow{C_n}$ is strongly connected: for any $x$ and any $y$, if you follow the cycle starting at $x$, you will eventually reach $y$.

It’s useful to observe that [Theorem 3.1](../beginning/walks.html#thm:walk-to-path) (and its proof) continue to work for directed graphs: whenever there is an $x-y$ walk, there is also a $x-y$ path.

We used connectedness in undirected graphs to define connected components, and we could use strong connectedness to define strongly connected components in the same way: using equivalence relations. Since we have a second chance to look at such a problem, though, let’s take that chance to arrive at our destination differently.

We will define a *strongly connected component* of a digraph $D$ to be a maximal strongly connected subgraph of $D$: a subgraph $D'$ which is strongly connected, and which is not a subgraph of any other strongly connected subgraph of $D$. In other words, we cannot add any more vertices or arcs of $D$ to $D'$ and still get a strongly connected result.

![](../images/12-3.png)

A numerical maze

![](../images/12-4.png)

A strongly connected component

Strongly connected components in a numerical maze

[Figure 12.2](#fig:strong-component-example) shows an example of a strongly connected component in the same numerical maze that we used as an example in [Chapter 7](../degrees/multigraphs.html). The subgraph induced by the marked vertices in [Figure 12.2(b)](#fig:maze-strong-component) is a large strongly connected component in the directed graph. From any marked vertex, it is possible to reach any other; the other vertices either cannot be reached from the marked vertices, or cannot reach any marked vertex.

I found the strongly connected component by starting with just vertex $11$ and looking for cycles. Whenever I found a cycle that contained a marked vertex, I also marked every other vertex of the cycle.

Why does this guarantee that the result is a strongly connected component?

From every vertex on the cycle, we can reach the marked vertex on the cycle, and from there, we already know we can reach every previously-marked vertex. This strategy also works in reverse.

Compared to what we did in [Chapter 3](../beginning/walks.html), we’ve definitely done less work to define what a strongly connected component is. However, now we must do more work to ensure that the definition behaves:

**Theorem 12.3**. *If $D_1, D_2, \dots, D_k$ are the strongly connected components of a directed graph $D$, then $V(D_1), V(D_2), \dots, V(D_k)$ are a partition of $V(D)$.*

*Proof.* When we say that $V(D_1), V(D_2), \dots, V(D_k)$ are a partition of $V(D)$, we say two things: first, that every $x \in V(D)$ is in $V(D_i)$ for some $i$, and second, that no $x \in V(D)$ is in both $V(D_i)$ and $V(D_j)$ where $i\ne j$.

For the first claim, to find a strongly connected component containing a vertex $x$, start with the subgraph consisting of $x$ alone.

Why is this subgraph strongly connected?

There is only one thing to check: that there is an $x-x$ walk. The sequence $(x)$ is an $x-x$ walk of length $0$.

Either this subgraph is a strongly connected component, or else (by the contrapositive of that definition) it must be contained in a bigger strongly connected subgraph. That subgraph, in turn, is either a strongly connected component, or contained in a bigger strongly connected subgraph. We can skip to the end by applying the extremal principle: take a strongly connected subgraph containing $x$ which has as many vertices and arcs as possible. From the way we chose it, we know that it cannot be contained in a larger strongly connected subgraph, so it satisfies the definition of a strongly connected component.

For the second claim, suppose for the sake of contradiction that $x \in V(D_i) \cap V(D_j)$ for some $i \ne j$. The contradiction is this: the union of directed graphs $D_i \cup D_j$ is a bigger strongly connected subgraph of $D$. To see this, take any $y \in V(D_i \cup D_j)$ and $z \in V(D_i \cup D_j)$. Then there is a $y-x$ walk: if $y \in V(D_i)$, this is true because $x \in V(D_i)$ and $D_i$ is strongly connected, and if $y \in V(D_j)$, this is true because $x \in V(D_j)$ and $D_j$ is strongly connected. There is also an $x-z$ walk, for the same reason.

Joining these walks together, we get a $y-z$ walk, proving that $D_i \cup D_j$ is strongly connected. But then $D_i$ and $D_j$ are both subgraphs of $D_i \cup D_j$, which is a strongly connected subgraph of $D$, so they cannot be strongly connected components. This contradiction tells us that $x$ cannot be in two different strongly connected components, proving the theorem. ◻

The proof of [Theorem 12.3](#thm:strong-partition) is a special case of the general proof that, given an equivalence relation on a set $S$, its equivalence classes form a partition of $S$. If you look closely, you can see where elements of this proof rely on the three defining properties of an equivalence relation.

Be careful, however: it is not true that $D$ is equal to $D_1 \cup D_2 \cup \dots \cup D_k$, the union of its strongly connected components! As we are about to see, there are other arcs $D$ might have.

\

## Condensations

When we worked with undirected graphs, the connected components told us the whole story of which vertices can reach which other vertices: there is an $x-y$ walk in $G$ if and only if $x$ and $y$ are in the same connected component of $G$. With directed graphs and strongly connected components, this is no longer true.

Why are strongly connected components different?

If $x$ and $y$ are in different strongly connected components, there can still be either an $x-y$ walk or a $y-x$ walk; just not both.

We can, however, guarantee at least one thing: if we know the relationship between two vertices $x$ and $y$, then the same relationship holds between every vertex $x'$ in $x$’s strongly connected component and every vertex $y'$ in $y$’s strongly connected component. For example, if there is an $x-y$ walk, then there is also an $x'-y'$ walk: we go from $x'$ to $x$ to $y$ to $y'$.

For this reason, once we find the strongly connected components $D_1, D_2, \dots, D_k$ of a digraph $D$, we can summarize the relationship between different strongly connected components much more concisely. We define a new directed graph called the *condensation* of $D$ to be the directed graph whose vertices are $D_1, D_2, \dots, D_k$, with an arc $(D_i, D_j)$ if $i\ne j$ and there is an $x-y$ walk where $x \in V(D_i)$ and $y \in V(D_j)$.

To give an example of this, I will add a frankly unnecessary twist to a classic puzzle. In this puzzle, two white knights and two black knights are placed on a $3\times 3$ chessboard, as shown in the leftmost vertex of [Figure 12.3](#fig:condensation). The knights move as in ordinary chess: two squares in one direction and one square in a perpendicular direction. The objective of the puzzle is to switch the positions of the black and white squares. The puzzle can be solved if black and white must take turns, but for the purposes of this example, I will not require this.

![](../images/12-5.png)

The condensation of the state digraph of the four knights puzzle

My unnecessary twist is to allow moves where a knight captures a knight of the opposite color. Obviously, once you do this, you have no hope of solving the puzzle, since you can’t put back the captured piece. It also means that if we want to define a graph whose vertices are the possible states of the puzzle, it must be a directed graph: some moves cannot be undone.

[Figure 12.3](#fig:condensation) doesn’t show this state digraph, but rather, its condensation. Each $3\times 3$ board shows a single vertex of its strongly connected component.

What are the strongly connected components of this digraph, then?

For each possible collection of pieces we can have, there is a strongly connected component. By making moves that are not captures, we can rearrange the pieces however we like; a capture takes us to a different strongly connected component. For example, each of the rightmost $3\times 3$ boards, with only one knight on it, represents a strongly connected component with $8$ vertices, one for each possible position of the remaining knight.

You might notice something else about [Figure 12.3](#fig:condensation): it is a directed acyclic graph. This is not an accident, but it is true in general.

**Theorem 12.4**. *The condensation of any directed graph is a directed acyclic graph.*

*Proof.* Let $D$ be a directed graph, and suppose for the sake of contradiction that the condensation of $D$ contains a cycle. Let $(D_0,D_1,\dots,D_{l-1},D_0)$ represent one such cycle; each $D_i$ here is a vertex of the condensation, so it is a strongly connected component of $D$.

By definition of the condensation, for each $i=0,1,\dots,l-1$, there is some $x_i \in V(D_i)$ and some $y_{i+1} \in V(D_{i+1})$ such that $(x_i, y_{i+1})$ is an arc of $D$; when $i=l-1$, there is some $y_0 \in V(D_0)$ such that $(x_{l-1}, y_0)$ is an arc. Because each $D_i$ is strongly connected, it has a $y_i - x_i$ path. Using the arcs $(x_i, y_{i+1})$ to join these paths together, we obtain a cycle $C$ containing a vertex from multiple strongly connected components.

But then, the union $D_0 \cup D_1 \cup \dots \cup D_{l-1}$ is strongly connected: if $z_i \in V(D_i)$ and $z_j \in V(D_j)$, there is a $z_i - x_i$ walk in $D_i$, an $x_i - y_j$ walk that follows cycle $C$, and a $y_j - z_j$ walk in $V(D_j)$, so there is a $z_i - z_j$ walk. This invalidates the assumption that the individual $D_i$’s are strongly connected components, since they are contained in a bigger strongly connected subgraph. ◻

This result makes it easy to use the condensation as a reference to see which vertices in the original digraph can reach which other vertices. To see if there is an $x-y$ walk, look up the strongly connected components of $x$ and $y$, and see if there is an $x-y$ walk between them in the condensation. Not only are we potentially reducing the size of the problem, we are also simplifying it, because now we are working with a directed acyclic graph.

What is the condensation of a directed acyclic graph $D$?

It is essentially $D$ itself: each strongly connected component of $D$ is just a vertex. Once we follow an arc out of a vertex $x$, we can never return to $x$, because that would imply the existence of a cycle.

\

## Practice problems

1.  Draw the condensation of the graph in [Figure 12.2](#fig:strong-component-example).

2.  Medieval alchemists valued above all the following seven materials:

    - Alkahest: the universal solvent, made by adding crushed Bluemyrtle to molten Firemetal.

    - Bluemyrtle: a plant that can only be harvested with tools made of Firemetal.

    - Calomel: a dry powder left after dissolving Gold in Alkahest.

    - Dreadwater: the infusion of Bluemyrtle in plain water.

    - Elixir: a potent potion obtained by adding Gold powder to Dreadwater.

    - Firemetal: a mystical transformation of Gold.

    - Gold: could be transmuted from common dirt by adding Alkahest and Dreadwater.

    Let $H$ be the directed graph whose vertices are these compounds, with an arcs $(x,y)$ representing that $x$ is needed to synthesize $y$.

    1.  Find a cycle in $H$, and explain why this would have been a problem for medieval alchemists.

    2.  Describe the strongly connected components of $H$.

    3.  Suppose that you are a very rich medieval alchemist with an unlimited supply of Gold. For you, the graph $H$ must be modified to delete all arcs to this vertex, since you don’t need anything else to synthesize it.

        Find a topological order of the modified graph.

3.  In the directed graph shown below, find an arc $(x,y)$ such that if it is reversed (deleted and replaced by $(y,x)$), the result is a directed acyclic graph. Give a topological order of the result.

    ![](../images/12-6.png)

4.  If $S$ is a set of integers, let the divisibility digraph of $S$ be the directed acyclic graph with vertex set $S$ and an arc $(x,y)$ whenever $x \ne y$ and $y$ is divisible by $x$. For example, if $S = \{2,3,6\}$, then the divisibility digraph of $S$ has arc set $\{(2,6), (3,6)\}$.

    1.  Draw a diagram of the divisibility digraph of $\{2,3,4,6,8,9,10,12\}$.

    2.  Prove that for every set $S$, the default order of the vertices (from smallest to largest) is a topological order of the divisibility digraph.

    3.  For the divisibility digraph in (a), find a different topological order: one in which $3$ comes after $8$.

    4.  Let $D$ be the divisibility digraph of the set $\{1,2,\dots,100\}$. Which vertex in this graph has indegree $1$ and outdegree $32$?

5.  A game is played with two piles of stones. On a turn, a player picks a pile which is not empty, and takes one or more stones from it. The game ends once both piles are empty.

    We can represent this game by a digraph whose vertices are the states, with arcs representing the valid moves. Let $D_{n,m}$ be the digraph we get when the game is played with a pile of size $n$ and a pile of size $m$.

    1.  Draw a diagram of $D_{3,2}$. (It should have $12$ vertices.)

    2.  Why is $D_{n,m}$ always a directed acyclic graph?

    3.  Find a topological order of $D_{3,2}$. (There are many.)

6.  Prove that in the four knights puzzle, from the first position shown below, we can reach the second position (solving the classical puzzle) but not the third.

    - ![](../images/12-7.png)
    - ![](../images/12-8.png)
    - ![](../images/12-9.png)

7.  Call a vertex $x$ in a directed graph $D$ “safe” if it is impossible to leave $x$ and get lost: for every vertex $y$ such that $D$ has an $x-y$ walk, $D$ also has a $y-x$ walk.

    Prove that every directed graph has a safe vertex.

8.  Let $T$ be an $n$-vertex tree.

    1.  How many directed acyclic graphs are there whose underlying graph is $T$?

    2.  How many of these directed graphs have exactly one sink?

9.  A well-known brainteaser asks the following question: given a $5\times 5$ grid, how many ways are there to go from the bottom left vertex to the top right vertex while only going up or to the right? We can phrase this in terms of directed graphs: how many paths are there from the bottom left vertex to the top right vertex of the first graph below?

    ![](../images/12-10.png) ![](../images/12-11.png)

    1.  Solve this brainteaser; see if you can generalize to $n\times n$ grids with a combinatorial formula.

    2.  How many paths are there from the bottom left vertex to the top right vertex in the second graph above? See if you can generalize this problem, as well.

    3.  How can this problem be solved efficiently for arbitrary directed acyclic graphs?

10. (AIME 2007) A frog is placed at the origin on the number line, and moves according to the following rule: in a given move, the frog advances to either the closest point with a greater integer coordinate that is a multiple of $3$, or to the closest point with a greater integer coordinate that is a multiple of $13$. A “move sequence” is a sequence of coordinates which correspond to valid moves, beginning with $0$, and ending with $39$. For example, $0, 3, 6, 13, 15, 26, 39$ is a move sequence. How many move sequences are possible for the frog?

\

- [Home](../index.html)
- [Contents](../contents.html)
- [Part III](index.html)
- Chapter 12


- [← Previous](cayley.html)
- [Next →](../matchings/index.html)

\

[Start Doing Graph Theory](../book.html) © 2025 by [Mikhail Lavrov](../author.html) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)![](https://mirrors.creativecommons.org/presskit/icons/cc.svg)![](https://mirrors.creativecommons.org/presskit/icons/by.svg)![](https://mirrors.creativecommons.org/presskit/icons/sa.svg)

<!--
## Source links

- [Home](../index.html)
- [Contents](../contents.html)
- [Part III](index.html)
- [← Previous](cayley.html)
- [Next →](../matchings/index.html)
- [Chapter 3](../beginning/walks.html)
- [Chapter 7](../degrees/multigraphs.html)
- [Theorem 7.2](../degrees/multigraphs.html#thm:no-sink-cycle)
- [Lemma 10.5](../trees/properties.html#lemma:leaves)
- [Chapter 8](../degrees/euler.html)
- [Theorem 3.1](../beginning/walks.html#thm:walk-to-path)
- [Start Doing Graph Theory](../book.html)
- [Mikhail Lavrov](../author.html)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
-->
