# Modeling Problems with Graphs

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- Chapter 1


- [← Previous](index.html)
- [Next →](isomorphism.html)

\

## The purpose of this chapter

Before you begin learning about specific problems in graph theory, I want to convince you that graph theory is useful. Well, of course I would say that—I’m a graph theorist! However, one of the reasons I’m firmly convinced that graph theory is one of the most highly applicable areas of math is that I often find it fruitful to think about the world graph-theoretically even when I’m not trying to solve problems in graph theory.

This comes easier to me, because I’ve spent many years with all this graph-theoretic language at my fingertips. It will not come easily to you at first, when you don’t know any graph theory. So one of them things I want to do here is to show you how I think about turning a problem into a graph. Stop and think about it yourself! Think about it with each new example.

I want to limit myself to examples that are simple enough to fully explain in this chapter. However, I also want to give complete examples that I can fully describe to you. Finally, I want to give you a variety of examples: I want to show you different types of problems in graph theory, and I want to show you very different flavors of applications, as well.

I will ask many questions about the graphs in this chapter, and I will often give formal mathematical names for the answers to those questions. However, I will not answer the questions here, and you should not feel obligated to learn any of the fancy terminology yet: the only terms I am asking you to learn at this point are those set aside in a “**Definition 1.x**” paragraph. If you become curious about the other ideas mentioned here—good! However, you will have to wait until a later chapter.

\

## Coloring Switzerland

![](../images/switzerland.png)

A map of Switzerland (coordinates from [\[93\]](../appendix/bibliography.html#ref-SwitzerlandGIS))

Switzerland (formally known as the Swiss Confederation) is made up of cantons. On a map, you will often see these drawn in different colors, to make the borders between different cantons clearer to see. As a result, it’s particularly important to choose the colors for each canton so that adjacent cantons receive different colors.

I have used five different colors to color the map in [Figure 1.1](#fig:switzerland-map). This is a bit unfortunate, because the color palette I’ve picked out to use throughout this book contains only four colors. Several of the cantons are given a checkerboard pattern instead of a solid color, which makes it somewhat harder to see where the borders lie.

Could we color the map of Switzerland with four colors?[<sup>1</sup>](#fn1) And what is the minimum number of colors needed? The answer to that question is called the chromatic number of the graph that describes the problem—but to say that properly, we first have to say what a graph is.

This is not the same “graph” that you would encounter in high school algebra! Blame the Greeks: in Greek, the root “graph” just means “picture”, and there are quite a few things in mathematics that we want to draw pictures of, so there is some overlap in terminology as well.

Unfortunately, the word is particularly awkward in the context of graph theory, because here the graphs are specifically not pictures! Instead, a graph is going to be exactly the mathematical object that we need to ask questions like, “How many colors are necessary to color the cantons of Switzerland?” Before giving the definition, it’s worth thinking about the things we do and don’t need to know:

- We don’t need to know that the canton of Thurgau is in the north part of eastern Switzerland, nor that it’s shaped roughly like a shark (in my opinion).

- We also don’t need to know that it’s called “Thurgau”, as opposed to “Thurgovia” (its anglicized name) or “” (the numerical label it is given in [Figure 1.1](#fig:switzerland-map)) or anything else. We will need to refer to the cantons individually somehow, or else it would be very hard to talk about which cantons get which colors. However, it doesn’t matter at all which names we give them.

- We do need to know that Thurgau (or 20, or whatever we choose to call it) borders Schaffhausen (14), Sankt Gallen (17), and Zürich (1): if we want to color the map so that adjacent cantons get different colors, then these are the colors we’ll need to distinguish.

![](../images/1-1.png) ![](../images/1-2.png)

Two schematic representations of the Switzerland graph

For example, consider the diagrams in [Figure 1.2](#fig:switzerland-graph), in which the cantons have been replaced by short numerical labels or even just plain dots, and their placement only loosely reflects their geographic location. This is just as good for our purposes; maybe even better, because it does not include any distracting details!

Even having a diagram at all is a concession to our human needs. If we wanted to try to use a computer to solve the problem, we might simply enter the following (which, under the hood, is how the two diagrams in [Figure 1.2](#fig:switzerland-graph) were generated):

    (1) -- (5) (1) -- (9) (1) -- (14) (1) -- (17) (1) -- (19) (1) -- (20) (2) -- (3) (2) -- (4) (2) -- (6) (2) -- (7) (2) -- (10) (2) -- (11) (2) -- (22) (2) -- (23) (2) -- (24) (2) -- (26) (3) -- (5) (3) -- (6) (3) -- (7) (3) -- (9) (3) -- (19) (4) -- (5) (4) -- (6) (4) -- (7) (4) -- (8) (4) -- (18) (4) -- (21) (4) -- (23) (5) -- (7) (5) -- (8) (5) -- (9) (5) -- (17) (6) -- (7) (8) -- (17) (8) -- (18) (9) -- (19) (10) -- (22) (10) -- (24) (11) -- (13) (11) -- (19) (11) -- (26) (12) -- (13) (13) -- (19) (13) -- (26) (14) -- (20) (15) -- (16) (15) -- (17) (16) -- (17) (17) -- (18) (17) -- (20) (18) -- (21) (21) -- (23) (22) -- (23) (22) -- (24) (22) -- (25) (24) -- (26);

With that in mind, let us finally give the definition of a graph, which will reflect all of these thoughts and only keep what is truly important. This definition can be used in many ways, to capture all kinds of relationships between all kinds of objects; I hope that the examples in this chapter give you an intuitive understanding of how to use it.

**Definition 1.1**. *A **graph** is a pair where:*

- *is a set of arbitrary objects called **vertices**; a single one is called a **vertex**. In the Switzerland graph, is the set of the cantons. We write for the set of vertices of a graph .*

- *is a set of **edges**: each edge is an unordered pair of vertices, or just a set of two vertices. In the Switzerland graph, is the set of all pairs of cantons that share a border. We write for the set of edges of a graph .*

Since an edge is a set of two vertices, it should be written with the notation , but to avoid too many symbols in notation that is used all the time, graph theorists often skip the curly brackets and just write . I will do the same in this book, only using set notation when it’s necessary to avoid ambiguity. For example, we should not represent an edge in the Switzerland graph as “”, because it’s not clear if this means or .

There is a lot of secondary terminology to describe the relationship between edges and vertices in a graph. Here are a few of the most important terms:

**Definition 1.2**. *Vertices and in a graph are **adjacent** when has an edge ; we also say that is a **neighbor** of (and vice versa).*

**Definition 1.3**. *The **endpoints** of the edge are the vertices and . An edge is **incident** to its endpoints, and vice versa: and are incident to , and is incident to and .*

It’s also okay to say that an edge goes between and , or joins and , for example; these are not really technical terms, but just English words used in the ordinary way to convey relationships in a graph. As long as it’s clear what you mean, the exact words you use are flexible. Avoid using words like “connect” or “connected” informally, though: they have a technical meaning in graph theory.

In [Chapter 19](../hard/coloring.html) we will define a *coloring* of a graph to be a function from to some set  whose elements we will call “colors”. An actual non-mathematical coloring of a map, such as in [Figure 1.1](#fig:switzerland-map), can be described by such a function: for example, might describe coloring Thurgau blue. In this model of coloring, we will see how to prove lower and upper bounds on the number of colors needed.

\

## The seven dwarfs

One day, the seven dwarfs of fairytale [<sup>2</sup>](#fn2) wanted to play cards. Unfortunately, they only have one deck of cards. Their favorite card game, Hearts, is a four-player game, so only four dwarfs can play at a time. If the dwarfs switch in and out of the game, how many rounds will they need to play so that every dwarf has gone up against every other dwarf at least once?

It seems reasonable to start with two games that don’t overlap very much: for example, a game with dwarfs 1–4 followed by a game with dwarfs 4–7. After that, though, we might need some help keeping track of which dwarf has already played which other dwarf. Since this is a property of different pairs of dwarfs, it is natural to model it with a graph whose vertices are the dwarfs. [Figure 1.3(a)](#fig:dwarf-game-1) shows the pairs of dwarfs that face each other in the first game; [Figure 1.3(b)](#fig:dwarf-union) shows the status after both games; finally, [Figure 1.3(c)](#fig:dwarf-complement) shows the pairs of dwarfs that have yet to face each other.

![](../images/1-3.png)

The first card game

![](../images/1-4.png)

The first two games

![](../images/1-5.png)

The missing matchups

The seven dwarfs

I admit that I chose this example with an ulterior motive: to illustrate a few common operations on graphs. Graphs are built out of sets, and the fundamental operations of set theory—union, intersection, and complement—all show up graph theory, as well.

The graph in [Figure 1.3(b)](#fig:dwarf-union) is assembled out of two graphs: the graph in [Figure 1.3(a)](#fig:dwarf-game-1) which tracks only the first card game, and a similar graph (not pictured) which tracks only the second card game. This is the operation we’ll define to be the union of two graphs.

**Definition 1.4**. *The **union** of two graphs and is the graph with all vertices and edges appearing in at least one of the two graphs: and .*

*The union is called a **disjoint union** if and share no vertices or edges.*

Is the union in [Figure 1.3(b)](#fig:dwarf-union) a disjoint union?

No; even though the graphs of the two card games share no edges, vertex 4 appears in both graphs.

We could also define the graph intersection to be the graph that only keeps the vertices and edges common between and , but that is a much less common operation.

Finally, we get to the complement. This is an awkward operation to define in set theory. If is the set of all objects not appearing in , then we can probably all agree that a complement like contains the element , but does it contain the element ? What about the color purple? So in serious set theory, it’s much more common to use the relative complement, or set difference, : the set of all objects appearing in , but not . We will see plenty of set differences in this book too, but fortunately, there is a natural notion of complement when it comes to graphs.

In what sense is the graph in [Figure 1.3(c)](#fig:dwarf-complement) a complement of the graph in [Figure 1.3(b)](#fig:dwarf-union)?

The graphs have the same vertices, but the graph in [Figure 1.3(c)](#fig:dwarf-complement) has exactly the edges that [Figure 1.3(b)](#fig:dwarf-union) does not have.

This is the definition we make in general:

**Definition 1.5**. *The **complement** of a graph is the graph with such that two vertices and are adjacent in exactly when they are not adjacent in .*

It would be unkind of us to use the dwarfs as an example of unions and complements without addressing their concerns about how to schedule their card games. Graphs can help with that as well. We can get a preliminary answer just by counting edges.

How many pairs of dwarfs are there, and how many face each other in each game? What does this tell us?

Altogether, there are pairs [<sup>3</sup>](#fn3) of dwarfs: we choose two dwarfs in ways, and divide by because order doesn’t matter. In each card game, dwarfs face each other, so at least games are necessary, which rounds up to .

Unfortunately, if the dwarfs play two games as in [Figure 1.3](#fig:seven-dwarfs), they can’t finish by playing two more. A single card game can only take care of of the remaining edges in [Figure 1.3(c)](#fig:dwarf-complement), so at leas three more card games are needed. (See if you can find card games that will do it!) We can’t avoid arriving at the graph in [Figure 1.3(c)](#fig:dwarf-complement) entirely, either! It occurs whenever there are two card games that only have one dwarf in common. But if this never happens, then every dwarf needs at least three games to face all other dwarfs, and this leads to an even longer solution. Ultimately, at least five card games are necessary, however we schedule them.

\

## The Towers of Hanoi

The Towers of Hanoi puzzle was invented in 1883 by Édouard Lucas [\[6\]](../appendix/bibliography.html#ref-Ball05); it is now so popular its origins have been nearly forgotten. In this puzzle, you have three pegs, and some number of disks of different sizes stacked on the pegs. Initially, all the disks are placed on one peg, sorted by size (with the smallest disk on top), as shown in [Figure 1.4](#fig:towers-of-hanoi).

![](../images/1-6.png)

The Towers of Hanoi puzzle

You are allowed to move the disks in a limited way: in a single move, you can lift the top disk on a peg, and put it down on another peg, provided you do not place a larger disk on top of a smaller one. Placing a larger disk on a smaller one is always forbidden. The goal of the puzzle is to move all the disks from one peg to another.

How can we model this puzzle as a graph? This is a much trickier question than in the previous section, and the answer may be counter-intuitive the first time you see something like it. When I’ve asked the question to clever students new to graph theory, they’ve been tempted to start with either the disks or the pegs as the vertices, which turns out not to lead us anywhere fruitful.

To arrive at a useful answer, I suggest thinking as follows: how can we define a graph that will know everything about the rules of this puzzle, so that when we try to use graph theory to solve it, we will not need to know anything? Our graph does not need to be a small, efficient representation of the rules, either. On the contrary: if the solution to the puzzle (which may be a very long sequence of moves) is to be found anywhere in the graph, then the graph will have to be pretty big.

The strategy we take to model the Towers of Hanoi puzzle as a graph is to do the following:

- Let the vertex set be the set of all possible states of the puzzle. For example, the picture in [Figure 1.4](#fig:towers-of-hanoi) is just one of the vertices. If we take the smallest disk and move it to the middle peg, the result is a different state of the puzzle, represented by another vertex. Our final goal is to have all the disks stacked up on a different peg, which is yet another vertex.

- Let the edge set be the set of all possible pairs where it’s possible to turn state  into state by making a single move. Or, phrased more concisely: let two states be adjacent if a single move can turn into .

  (This is a symmetric relationship: if we can move a disk from one peg to another, we can always move it back.)

In a graph, our edges should be unordered pairs, but the rule “a single move can turn into ” seems like an ordered relationship. Is this a problem?

Not in this case, because if we can move a disk from one peg to another, we can always move it back, so the relationship is symmetric. Puzzles where we cannot always reverse a move we make are more difficult to model.

![](../images/1-7.png)

The graph representing a -disk Towers of Hanoi puzzle

As you might imagine, this definition of results in a large graph indeed. So in [Figure 1.5](#fig:towers-of-hanoi-graph), the graph is illustrated for a version of the puzzle with only disks: a small one and a large one. The two-digit label on each vertex records the positions of the two disks: the first digit records the position of the bigger disk, and the second digit records the position of the smaller disk. In this way, the two-digit number describes the state of the two-disk Towers of Hanoi puzzle. (In our definition, we said that is the set of all possible states of the puzzle, but we didn’t specify how the states of the puzzle are encoded. That’s because it doesn’t really matter!)

In [Figure 1.5](#fig:towers-of-hanoi-graph), which vertices represent our starting state and our final state?

The vertices , , and are the three vertices in which both disks are stacked on the same peg; we want to get from one of these to another.

What do the edges from vertex to vertices , , and represent?

The smaller disk can be moved from peg to peg or peg ; these moves give us the edges from to and . The bigger disk can only be moved from peg to peg , giving the edge from to ; it cannot be moved to peg , because it cannot be placed on top of the smaller disk.

Now that we have the graph, how do we think about solving the puzzle? To answer that question, let’s think about what happens in the world of graph theory when we attempt to solve the puzzle by moving disks around. Each time we lift a disk and move it to a different peg, we go from one state of the puzzle to another: from one vertex to another. Suppose we make moves; then we can imagine recording the entire history of the moves we’ve made as a sequence in which each term is a vertex in the Towers of Hanoi graph. The moves that we’ve made are valid moves if it’s the case that for all , the pair is an edge of the Towers of Hanoi graph.

In graph-theoretic terminology, such a sequence is called a *walk* from to , or an “ walk” for short; see [Chapter 3](walks.html) for more details. When we’re talking about puzzles like the Towers of Hanoi, that’s a very metaphorical walk: you could picture a little figure standing on the diagram in [Figure 1.5](#fig:towers-of-hanoi-graph) and walking along the edges, but that figure exists only in your imagination. It would become a much more literal walk in the Switzerland graph from the previous section! Suppose that you live in Zürich, and you decide to go on a hike through Switzerland until you reach Geneva. Then the sequence of cantons you walk through (updated every time you cross a border between cantons) will be a walk in the Switzerland graph: a walk where is the Canton of Zürich and is the Canton of Geneva.

A solution to the Towers of Hanoi puzzle is a walk with very specific starting and ending vertices: we want to start in a vertex corresponding to all disks being on a single peg, and we want to end in a vertex corresponding to all disks being on some other single peg. The *length* of this walk, , is the number of moves that we needed to make, so our second goal might be to minimize this length and find the shortest solution.

The question of finding minimum-length walks in a graph is not only useful for puzzles. If you were to ask your phone for walking directions from Zürich to Geneva, it would consult a much bigger graph: the graph of possible pedestrian locations in Switzerland, at a fairly low resolution, and with additional metadata such as walking times that we’re not considering yet. However, in that bigger graph, it would solve essentially the same problem of finding a minimum-length walk!

\

## A tiling puzzle

Here is a different kind of puzzle. (I promise that graph theory is not just good for puzzles! However, puzzles are a very convenient application: they usually have much simpler rules than the real world, so we can describe them cleanly using graph theory, and puzzle creators often at least try to make their puzzles fun.)

Suppose that you have an infinite supply of zigzag-shaped tiles made up of five squares. How many of them can you place on a grid without overlap? One possible optimal solution to this problem is shown in [Figure 1.6](#fig:z-tiling-puzzle).

![](../images/1-8.png)

A solution to fitting zigzag tiles in a grid without overlap

How did I find this solution? I did it by encoding the problem as a graph and using some tools in Mathematica’s graph theory library. It’s not obvious how to represent this as a graph theory problem, but here is what I ended up doing:

- Let the vertices be all ways to place a single tile on the grid.

- Put an edge between two vertices if the tile placements they represent are incompatible: the tiles would overlap.

How many vertices does this graph have?

The middle square of a tile can be in any of the squares that are not on the edges of the grid. Once we pick where the middle square goes, there are ways to orient the tile, for a total of placements.

A solution to the puzzle is a collection of locations where we’ve placed tiles, so it’s a set of vertices in this graph.

Which sets of vertices are valid solutions to the puzzle?

A set of vertices tells us where to place tiles, but it’s only a valid solution if none of the tiles we place overlap. Overlapping tiles are represented by edges, so we want a set in which no two vertices are adjacent.

A set of vertices with no edges between them is called an *independent set* in a graph, and we will look at the problem of finding these in [Chapter 18](../hard/cliques.html).

In fact, there is a second way to think about the problem that’s equally good. We could have defined two vertices to be adjacent if the tiles would not overlap: this graph would be the complement of the graph we originally defined. In the complement graph, a conflict-free solution corresponds to a *clique*: a set of vertices in which any two vertices are adjacent. Cliques and independent sets are both important; though the problems they solve are equivalent, as we see here, sometimes one is more natural than the other to think about, and sometimes we study the relationship between the two problems.

Finding the largest independent set in a -vertex graph is a lot for a human, but not out of the reach of computer algorithms. It took my laptop seconds to find the largest independent set in the graph: less time than it took me to describe the problem to my computer!

\

## Taking photos efficiently

Here is an application of graph theory to engineering.[<sup>4</sup>](#fn4) Suppose you want to inspect a manufactured part for quality by first taking photos of it from many different angles. You don’t have to do this yourself: you have a many-jointed robot arm with a camera at the end, and the robot arm can move around to take the pictures for you. How can you program the robot arm to take the photos as efficiently as possible?

Just as in the Towers of Hanoi puzzle, we can describe this problem in terms of walks through a graph, though the setup and our goals are both different. This leads us to a good model of the problem with graph theory: if we want the robot arm’s trajectory to be a sequence of vertices in a graph, then each vertex should be a position the robot arm can be in. We may as well limit the vertices to just the positions in which we want the robot arm to take a photo—those are the interesting ones.

Why not take our vertex set to be the set of all positions the robot arm can be in?

The only reason not to is that there might be too many of these. In fact, if you imagine the robot arm moving continuously, there might be infinitely many vertices, which is definitely too many!

Just as in the Towers of Hanoi graph, we want our edges to represent ways that the robot arm can move. However, in principle, from any position, the robot arm can twist itself around to move to any other position. There might not be a good notion of “elementary” motions: we might even end up making all pairs of vertices adjacent.

Which relevant piece of information is missing from such a model?

The time that it takes for the robot arm to move from one position to another.

In such an application, it makes sense to consider a *weighted graph* (discussed in more detail in [Chapter 9](../trees/spanning.html)). Each edge in the graph represents a movement of the robot arm from one state to another, and it may well be that every pair of states has an edge between them. However, some motions take more time than others, so each of our edges has a nonnegative real number linked to it: the time to complete that motion. That’s what a weighted graph is: each edge has a number on it that we call its *weight*, or perhaps its *cost*.

The example of the robot arm is only one instance of this problem appearing in applications: there are many situations that can be modeled by visiting all the vertices of a graph as efficiently as possible!

If we have a walk in a weighted graph, what quantity measures how good it is?

Instead of the length of the walk, we measure its total cost (or total weight): the sum of the weights of the edges. In our application, that’s the time it takes the robot to visit all the photo-taking positions and take all the photos.

![](../images/1-9.png)

The knight graph

![](../images/1-10.png)

A Hamilton path in the graph

The knight’s tour problem

An ordinary graph can be thought of as a weighted graph in which every edge has the same weight, which might as well be . (We can also pretend that every edge the graph doesn’t have is present with a weight of , so that we really really don’t want to use it in an efficient solution.) In this case, a perfect solution to the problem would be a walk through the graph that visits every vertex exactly once: if there are vertices, the walk takes edges, which is the least number possible. In such a case, the graph has a *Hamilton path*: these are discussed in [Chapter 17](../hard/hamilton.html) of this book.

Here is another example of two very different problems becoming the same when considered from the point of view of graph theory. In chess, the “knight’s tour” problem is to move a knight around the chessboard and visit each square exactly once. The graph we consider for this problem is the knight graph, shown in [Figure 1.7(a)](#fig:knight-graph-intro): the graph with a vertex for every square of the chessboard, and edges representing the valid knight moves. A Hamilton path in this graph, shown in [Figure 1.7(b)](#fig:knight-tour-intro), is precisely a knight’s tour of the chessboard.

\

## Match the cars and drivers

A final flavor of puzzle that is secretly all about graph theory is the “logic grid puzzle”, or “matching puzzle”. Here is a beginner-level example.

Five friends named Rod, Sal, Teresa, Victor, and Whitney own cars in five different colors: white, blue, black, red, and green. The following three things are known about the colors of their cars:

1.  Neither Victor nor Teresa own a car in a color that appears on the United States flag (red, white, or blue).

2.  Even though the sounds of their names would suggest it, Rod’s car is not red and Whitney’s car is not white.

3.  Rod and Victor like bright colors, and would not drive a black or white car.

Given this information, can you identify the color of the car each of them drives?

The classic way to solve a puzzle like this is to draw a grid to represent the data; in this case, the rows would be the people in the problem, and the columns would be the colors. Then, the cells of the grid representing impossible combinations are shaded in to eliminate them: in [Figure 1.8(a)](#fig:logic-grid), this is shown with a number in each shaded cell indicating the statement that lets us eliminate it. From there, we can try to make deductions and use them to eliminate more cells. I have given you an example that has a unique solution, so you can try solving it, if you like.

![](../images/1-11.png)

Logic grid representing the puzzle

![](../images/1-12.png)

Bipartite graph representing the puzzle

Two ways to think about matching cars to people

[Figure 1.8(b)](#fig:logic-bipartite-graph) shows another way to think about the logic puzzle: as a graph. In this graph,

- The vertices come in two types: five vertices representing the people (labeled R, S, T, V, W in the diagram) and five vertices representing the colors (labeled , , , , in the diagram).

- There is an edge from each person to each car the three conditions permit them to drive.

This graph is called a *bipartite graph* because its vertices can be split into two non-overlapping sets such that all edges have one endpoint in each set. In this case, the two sets are the people and the cars. The solution to the puzzle is a *perfect matching* in the graph: a set of edges that have each of the vertices as an endpoint exactly once. Both of these concepts will be introduced in detail in [Chapter 13](../matching/bipartite.html).

How many edges does a perfect matching contain?

In this problem, it will be edges. In general, if our graph has vertices, a perfect matching should have edges, because each of the edges has endpoints, covering of the vertices.

[Figure 1.8(b)](#fig:logic-bipartite-graph) is not necessarily the best visualization if you want to try to solve the logic puzzle. However, thinking about the problem as a graph is rewarding for two reasons:

1.  We can make connections to other problems that look superfically different in how they’re phrased, but turn out to be the same problem in the language of graph theory.

    Perfect matchings are not just for logic grid puzzles! On a college campus, they can be used for matching together instructors with classes, or interns with internships, or roommates in college dorms. They are also a common subroutine for more complicated optimization problems.

2.  There are general graph-theoretic guarantees that apply to all these applications equally well. Later on in this book, we will see what conditions guarantee the existence of a perfect matching, and even investigate whether the solution is unique.

Suppose a graph has vertices. Then a perfect matching should have edges, which is . How can we make sense of this?

In a graph with vertices (or any other odd number), a perfect matching cannot exist—so it’s okay that our formula gives a nonsense answer. If we have objects, we cannot divide them into pairs; one object will be left out at the end.

\

## Practice problems

1.  Describe how to use a graph to model each of the following puzzles:

    1.  A word ladder puzzle, in which one word must be transformed into another by changing one letter at a time. For example, if the goal were to get from “graph” to “Euler”, one possible solution might be:

    2.  A pure loop puzzle, in which several squares of an grid are shaded, and the goal is to draw a closed loop through the unshaded squares that visits each of them exactly once. Such a puzzle and its solution are shown in the first diagram below.

        ![](../images/1-13.png) ![](../images/1-14.png)

    3.  A star battle puzzle, in which an grid is divided into several regions, and a star must be placed in each region so that no two stars occupy the same row or column, and no two stars are adjacent even diagonally. Such a puzzle and its solution are shown in the second diagram above.

2.  The country of Hungary is divided into regions, which are further subdivided into counties (and the capital, Budapest, which is not part of any county). Look these up on a map of Hungary; then, draw a graph diagram, similar to one of the diagrams in [Figure 1.2](#fig:switzerland-graph),

    1.  of the regions, if you just want a bit of practice, or

    2.  of the counties and Budapest, if you want to draw a bigger graph.

3.  Briefly explain (without checking any cases by brute force) why the cantons of Switzerland cannot be colored with just three colors so that no two adjacent cantons have the same color.

4.  To study the graph representing a -disk Towers of Hanoi puzzle, we might label the states by -digit sequences through ; each digit represents the location of a disk, from largest to smallest.

    For this problem, let denote the -disk Towers of Hanoi graph; [Figure 1.5](#fig:towers-of-hanoi-graph) is a diagram of .

    1.  Draw only one part of : the part containing the vertices 111, 112, 113, 121, 122, 123, 131, 132, and 133.

    2.  Extrapolate from what you’ve done to draw all of .

    3.  How many vertices does have, as a function of ?

    4.  How many edges does have? What about ? What about , as a function of ?

5.  The zigzag tile graph from this chapter is too large for you to draw by hand, so let’s look at a much simpler problem of the same type.

    Suppose we are trying to place square tiles on a grid without overlap.

    1.  Draw a diagram of the graph where the vertices are ways to place a single tile on the grid (there should be vertices), with an edge between two vertices when the tile placements they represent are incompatible.

    2.  Find an independent set in the graph representing the “boring” solution, which places four square tiles covering the entire grid.

    3.  Find some other interesting non-overlapping tile placement in the grid, and find the independent set in your graph that corresponds to it.

6.  This is more of a puzzle than a graph-theoretical question: find a way to fit zigzag-shaped tiles into an grid with no overlaps. (How do we know that this is optimal without the use of a computer program?)

7.  Find a way to color the tiling below using only 3 colors so that no two tiles that share a border have the same color.

    ![](../images/1-15.png)

8.  A knight in chess moves by jumping to another square two steps in one direction and one step in a perpendicular direction. (Some knight moves are illustrated in [Figure 1.7](#fig:knight-tour-intro).)

    1.  Find a knight’s tour of the chessboard, shown below.

        ![](../images/1-16.png)

    2.  Prove that all such tours must begin and end on a dark-colored square.

\

## Footnotes

1.  If you already know a bit of the relevant theory, and think that you’ve heard of a powerful result that solves this problem: Switzerland has a bit of a surprise for you! The full solution takes a bit more work.[↩︎](#fnref1)

2.  To avoid any potential entanglements with Disney, I will use the traditional names for the seven dwarfs: Dwarf 1 through Dwarf 7.[↩︎](#fnref2)

3.  If you haven’t seen binomial coefficients yet in your mathematical career, the only one you’ll need to know for of graph theory is : this counts the number of unordered pairs of objects, or the number of possible edges an -vertex graph could have.[↩︎](#fnref3)

4.  I found it in a 2022 paper by Bottin, Boschetti, and Rosati [\[11\]](../appendix/bibliography.html#ref-Bottin22), but I am not an expert in robotics, so I don’t know enough to put that paper in the context of its field—I just thought it was cool.[↩︎](#fnref4)

\

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- Chapter 1


- [← Previous](index.html)
- [Next →](isomorphism.html)

\

[Start Doing Graph Theory](../book.html) © 2025 by [Mikhail Lavrov](../author.html) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)![](https://mirrors.creativecommons.org/presskit/icons/cc.svg)![](https://mirrors.creativecommons.org/presskit/icons/by.svg)![](https://mirrors.creativecommons.org/presskit/icons/sa.svg)

<!--
## Source links

- [Home](../index.html)
- [Contents](../contents.html)
- [Part I](index.html)
- [Next →](isomorphism.html)
- [[93]](../appendix/bibliography.html#ref-SwitzerlandGIS)
- [Chapter 19](../hard/coloring.html)
- [[6]](../appendix/bibliography.html#ref-Ball05)
- [Chapter 3](walks.html)
- [Chapter 18](../hard/cliques.html)
- [Chapter 9](../trees/spanning.html)
- [Chapter 17](../hard/hamilton.html)
- [Chapter 13](../matching/bipartite.html)
- [[11]](../appendix/bibliography.html#ref-Bottin22)
- [Start Doing Graph Theory](../book.html)
- [Mikhail Lavrov](../author.html)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
-->
