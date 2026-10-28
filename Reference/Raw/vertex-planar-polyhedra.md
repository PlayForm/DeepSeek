# Polyhedra

- [Home](../index.html)
- [Contents](../contents.html)
- [Part VI](index.html)
- Chapter 23


- [← Previous](testing.html)
- [Next →](coloring-maps.html)

\

## The purpose of this chapter

To a graph theorist, Euler’s formula is a theorem about planar graphs. To almost every other mathematician, it is a theorem about three-dimensional solids. In this chapter, we’ll see the connection, and put graph theory to work in understanding 3D geometry.

In the middle of this chapter is a section on dual graphs, which I’ve included here because the duality between Platonic solids is a particularly striking instance of dual graphs at work.

The discharging method used to prove [Theorem 23.3](#thm:descartes) is a common way to use Euler’s formula in proofs; it is also not a proof strategy that’s easy to come up with on your own. So I think it’s a particularly valuable proof to study, in case you ever encounter a problem in which this method can be used.

\

## The Platonic solids

Regular polygons in the plane are abundant. For every $n \ge 3$, it is possible to draw a polygon with $n$ equal sides and $n$ equal angles. The sides can be however long we want them to be, but the angles must all have measure $\frac{n-2}{n} \cdot 180^\circ$ (or $\frac{n-2}{n} \cdot \pi$, in radians). The reason for this is that we can divide a regular $n$-sided polygon (or $n$-gon) into $n-2$ triangles by drawing lines between its corners: two ways to do this are shown in [Figure 23.1](#fig:polygons). In a triangle, the sum of angles is always $180^\circ$; adding up the angles of all triangles gives $(n-2) \cdot 180^\circ$, but this is also equal to the sum of all $n$ angles of the regular $n$-gon.

![](../images/23-1.png)

A regular $7$-gon

![](../images/23-2.png)

$5$ triangles in a $7$-gon

![](../images/23-3.png)

A regular $8$-gon

![](../images/23-4.png)

$6$ triangles in an $8$-gon

Dividing regular polygons into triangles

Things change when we go up to $3$ dimensions. The $3$-dimensional version of a polygon is called a **polyhedron**. (The plural is “polyhedra”.) This is a shape with flat polygonal faces which come together at their sides and at their corners. If we want a polyhedron to be as regular as possible, then we can ask for the faces to be congruent regular polygons, with an equal number of them meeting at every corner.

This much regularity is a lot to ask for! In fact, there are only five possibilities once we ask for this much, shown in [Figure 23.2](#fig:platonic-solids). They are known as the *Platonic solids*, named after their description in Plato’s *Timaeus*, where Plato connects four of them to the four classical elements. They were analyzed more geometrically in Euclid’s *Elements*, and have been studied since then both mathematically and mystically [\[38\]](../appendix/bibliography.html#ref-GardnerPlatonic).

![](../images/23-5.png)

Tetrahedron

![](../images/23-6.png)

Cube

![](../images/23-7.png)

Octahedron

![](../images/23-8.png)

Dodecahedron

![](../images/23-9.png)

Icosahedron

The Platonic solids

How many sides do the Platonic solids have?

Going from left to right in [Figure 23.2](#fig:platonic-solids): $4$, $6$, $8$, $12$, and $20$. The Greek names of the solids refer to the number of sides: “tetra-” is a prefix that means $4$, “octa-” means $8$, and so on.

We will try to understand why there are just five of these solids. For this, it is necessary to connect the problem to graph theory somehow. You can probably already guess how we do it, by looking at the diagrams in [Figure 23.2](#fig:platonic-solids), and maybe recognizing the cube ([Figure 23.2(b)](#fig:platonic-cube)) and dodecahedron ([Figure 23.2(d)](#fig:platonic-dodecahedron)) from previous chapters. Each Platonic solid has an associated graph called its *skeleton graph*. Its vertices are the corners of the polyhedron, and its edges are the line segments where two of the polygonal faces meet.

(Actually, these objects are also called “vertices” and “edges” by geometers studying polyhedra. This is not a coincidence: graph theory gets its terminology from geometry, and not the other way around!)

However, the skeleton graphs of the Platonic solids are not just any kind of graph. They are planar graphs, and they have a plane embedding in which the faces (the polygonal sides of the polyhedron) become the faces of the plane embedding. This allows us to use the theory of planar graphs we have developed in the previous two chapters to solve a geometric problem.

There are two ways to get an intuition for how a polyhedron can be turned into a planar graph. One way is to imagine the polyhedron to be made of rubber; then, inflate the polyhedron until it becomes spherical, bending the edges into arcs on the sphere. (You should imagine the edges to be painted on, so that they do not get completely forgotten in this process.) Then, poke a hole in the rubber sphere, and stretch it out until it is flat; the drawing of the polyhedron on the sphere turns into a drawing in the plane.

Is this possible for any polyhedron you can imagine?

No: some polyhedra have “holes” in them, and will inflate to a shape that is not a sphere. All five of the Platonic solids do inflate to spheres.

For some reason, mathematicians often feel that arguments involving imaginary rubber spheres are insufficiently rigorous. So here is another approach that is both visual and can be made rigorous. Hold the polyhedron above a horizontal plane, oriented so that a face on top is parallel to this plane. Place a bright light slightly above that face, close enough so that an observer at the bright light would see the top face and nothing else. Then the vertices and edges of the polyhedron will cast a shadow onto the horizontal plane, and that shadow will exactly be a plane embedding of the skeleton graph. An example is shown in [Figure 23.3(a)](#fig:cube-projection).

The reason I say this can be made rigorous is that the projection via bright light can be described mathematically: for example, if the bright light is at point $(0,0,1)$ in $\mathbb R^3$, and the horizontal plane is the plane $z=0$, then the shadow of a point $(x,y,z)$ has coordinates $(\frac{x}{1-z}, \frac{y}{1-z}, 0)$. Geometrically, the bright light, a point on the polyhedron, and its shadow are collinear.

![](../images/23-10.png)

The shadow of a cube

![](../images/23-11.png)

A plane embedding of the cube

Going from a polyhedron to a planar graph

We still need to take care to make sure that no edges cross in the shadow. A sufficient condition for this is to start with a *convex polyhedron*: one with the property that if two points $A$, $B$ are contained in the polyhedron, then so is the entire line segment $\overline{AB}$. When a ray of light shines on a convex polyhedron, it always enters the interior of the polyhedron once (through the top face) and exits once. For two edges to cross in the shadow, the ray of light pointing at that crossing would need to enter and exit multiple times: once in the top face, and once for each edge that intersects at the crossing.

All of the polyhedra we consider in this chapter will be convex, and so all of them can be described as planar graphs—not just the Platonic solids. This correspondence can be taken even further, though. In general, a graph has a plane embedding exactly when it has a spherical embedding: when it can be drawn on the surface of a sphere without crossing. The reason is that we can take a spherical embedding and turn it into a plane embedding in exactly the same way that we’ve just done it for a polyhedron. Going the other way, a plane embedding can be drawn on the sphere just by using a small portion of the sphere that looks basically flat. We do this (with a certain very large sphere) every time we draw a picture in the dirt with a stick.

\

## Classifying the Platonic solids

In two dimensions, there are infinitely many regular polygons. So why are there only five Platonic solids in three dimensions? This is, in part, something we can prove from Euler’s formula, with a quibble I will mention at the end of this section.

We can describe a Platonic solid by a pair $(p,q)$ where every face has $p$ sides, and $q$ faces meet at every vertex. Geometrically, we must have $p \ge 3$ and $q \ge 3$.

Why $p\ge 3$?

A polygon cannot have fewer than $3$ sides.

Why $q\ge 3$?

If we try to have only two polygons meet at a vertex, they end up lying flat against each other. I suppose I can’t stop you from declaring that gluing two regular $n$-gons back-to-back is a Platonic solid with $2$ faces at every vertex, but Plato wouldn’t have been on board with this.

We can further narrow down the options for $p$ and $q$ by using the properties of a planar graph. (The planar graph must be connected, because a Platonic solid should be connected: two cubes floating in space next to each other are not a Platonic solid.)

**Theorem 23.1**. *There are only five possibilities for the pair $(p,q)$ in a Platonic solid.*

*Proof.* We can write down two equations for $n$ (the number of vertices), $m$ (the number of edges), and $r$ (the number of faces) in terms of $p$ and $q$.

- The graph is a $q$-regular graph, so by the handshake lemma ([Lemma 4.1](../beginning/degrees.html#handshake-lemma)), $nq = 2m$.

- Every face has length $p$, so by the face length formula ([Lemma 21.3](../planar/planar.html#lemma:face-length-formula)), $rp = 2m$.

We also have Euler’s formula ([Theorem 21.4](../planar/planar.html#thm:euler-formula)): $n - m + r = 2$. Replacing $n$ by $\frac{2m}{q}$ and $r$ by $\frac{2m}{p}$, we get $$\frac{2m}{q} - m + \frac{2m}{p} = 2 \implies \frac1q - \frac12 + \frac1p = \frac1m.$$ From here, the constraint that lets us narrow down the pairs $(p,q)$ is that $\frac1m > 0$. Therefore $\frac1q - \frac12 + \frac1p > 0$, or $\frac1p + \frac1q > \frac12$.

How can we get a total bigger than $\frac12$ here? Let’s do casework on $p$:

- If $p=3$ (every face is a triangle) then $\frac1q > \frac12 - \frac1p = \frac16$, so $q < 6$.

  We can have $q=3$ (three triangles meet at every vertex), giving us the tetrahedron.

  We can have $q=4$ (four triangles meet at every vertex), giving us the octahedron.

  We can have $q=5$ (five triangles meet at every vertex), giving us the icosahedron.

- If $p=4$ (every face is a square) then $\frac1q > \frac12 - \frac1p = \frac14$, so $q < 4$.

  We can have $q=3$ (three squares meet at every vertex), giving us the cube.

- If $p=5$ (every face is a pentagon) then $\frac1q > \frac12 - \frac1p = 0.3$, so $q < \frac1{0.3} = 3\frac13$.

  We can have $q=3$ (three pentagons meet at every vertex), giving us the dodecahedron.

These are the only possibilities: if $p \ge 6$, then not even $q=3$ is small enough for the inequality $\frac1p + \frac1q > \frac12$ to hold. ◻

In each of these cases, once we know $p$ and $q$, we can solve for $n$, $m$, and $r$.

What must $n$, $m$, and $r$ be if $(p,q) = (3,4)$?

Starting from Euler’s formula $n-m+r=2$, we can substitute $n=\frac{2m}{q} = \frac 12m$ and $r = \frac{2m}{p} = \frac 23m$ to get $\frac 12m - m + \frac 23m = 2$, or $\frac 16m = 2$. Therefore $m=12$, and now we can back-substitute to get $n = \frac 12m = 6$ and $r = \frac 23m = 8$. This is the octahedron: it has $n=6$ vertices, $r=8$ faces, and $m=12$ edges.

In general, the equation $\frac1q - \frac12 + \frac1p = \frac1m$, which can be rearranged to get $m = \frac{1}{1/p + 1/q - 1/2}$. Then $n = \frac{2m}{q}$ and $r = \frac{2m}{p}$ tells us the number of vertices and the number of faces. Here is the complete table (where $\langle q\rangle \times n$ stands for the degree sequence $q,q,\dots,q$ of length $n$):

|              | Vertices  | Degrees   | Edges  | Faces                      |
|--------------|-----------|-----------|--------|----------------------------|
| Tetrahedron  | 4         | $\langle3\rangle \times 4$ | 6      | 4![](../images/23-12.png)  |
| Cube         | 8         | $\langle3\rangle \times 8$ | 12     | 6![](../images/23-13.png)  |
| Octahedron   | 6         | $\langle4\rangle \times 6$ | 12     | 8![](../images/23-14.png)  |
| Dodecahedron | 20        | $\langle20\rangle \times 3$ | 30     | 12![](../images/23-15.png) |
| Icosahedron  | 12        | $\langle12\rangle \times 5$ | 30     | 20![](../images/23-16.png) |

I promised to mention a quibble I have with calling this a complete classification of the Platonic solids. Well, first of all, it is only a classification of the skeleton graphs of those solids: we have not (and will not) engage with the 3D geometry. Even so, one thing is missing.

How could there, conceivably, be another regular planar graph where every face in a plane embedding has the same length, other than the ones in [Figure 23.2](#fig:platonic-solids)?

It’s possible that there are several different non-isomorphic graphs corresponding to a single pair $(p,q)$.

So is there a second icosahedron where the faces attach differently? There is not, but that takes some effort to prove. In principle, it’s a finite problem: up to isomorphism, there are only finitely many graphs with $20$ or fewer vertices, and we could simply check them all and verify that none of them have the regularity properties we asked for.

It would be nice to have a more elegant argument, though. For the smaller Platonic solids, this is achievable. For example, the pair $(p,q) = (3,3)$ must correspond to a $3$-regular, $4$-vertex graph, and there is only one such graph: the complete graph $K_4$. Slightly more complicated, but similar arguments work for $(p,q) = (3,4)$ and $(p,q) = (4,3)$; since I know it’s possible to handle these two cases in a slick way, I will leave it for you to discover in the exercises at the end of this chapter. I am not aware of any arguments for $(p,q) = (3,5)$ and $(p,q) = (5,3)$ that do not require a substantial amount of suffering, so I will not make you deal with those cases.

\

## Dual graphs

If you look at the table counting vertices, edges, and faces in the Platonic solids, you may notice an interesting pattern: the five solids can be divided into two and a half pairs for which these counts are related. The triple $(n,m,r)$ counting the vertices, edges, and faces is $(8,12,6)$ for the cube and it is $(6,12,8)$ (the reverse) for the octahedron; it is $(20,30,12)$ for the dodecahedron and $(12,30,20)$ (the reverse) for the icosahedron.

Why “two and a half” pairs?

The tetrahedron can be paired with itself, because it has the same number of vertices and faces.

There is another correspondence between vertices and faces that you may have noticed before. The face length formula for plane embeddings is very similar to the handshake lemma: if $F_1, F_2, \dots, F_r$ are the faces and $x_1, x_2, \dots, x_n$ are the vertices, then $$\sum_{i=1}^r \operatorname{len}(F_i) = 2m = \sum_{i=1}^n \deg(x_i).$$ Is this a coincidence?

Mathematicians should always be on the lookout for such “coincidences”, because it often turns out that they reveal a deeper idea. In this case, it leads to the definition of dual graphs.

The **dual graph** of a plane embedding is not really a graph, but a multigraph whose vertices are the faces of the plane embedding; for every edge in the plane embedding, there is an edge in the dual graph between the faces that meet there. For example, [Figure 23.4(d)](#fig:dual-end) shows the dual graph of the plane embedding in [Figure 23.4(a)](#fig:dual-start).

The definition mentions that the dual graph is actually a multigraph. When does it have loops?

When the original plane embedding has an edge with the same face on both sides. A vertex of degree $1$ guarantees that this will happen, though it is not the only way.

What about parallel edges?

The dual graph has parallel edges when two faces border each other along multiple edges. A vertex of degree $2$ guarantees that this will happen, though it is not the only way.

![](../images/23-17.png)

A plane embedding

![](../images/23-18.png)

Careful setup

![](../images/23-19.png)

Drawing the edges

![](../images/23-20.png)

The dual graph

The dual graph of a plane embedding

The mere existence of the dual graph, carefully defined, is enough to derive the face length formula as a consequence of the handshake lemma. For relationships like those between the Platonic solids to holds, something more has to happen: the dual graph must itself be a planar graph (or multigraph).

**Proposition 23.2**. *The dual graph of a plane embedding is also planar.*

*Proof.* [Figure 23.4](#fig:dual-graph) shows the process of carefully constructing the dual graph in such a way that we get a plane embedding of the dual graph at the same time.

Begin by drawing a dual vertex somewhere in the interior of each face, and marking a crossing point somewhere in the middle of each edge. This is shown in [Figure 23.4(b)](#fig:dual-setup).

Next, to draw a dual edge between the dual vertices inside faces $F_i$ and $F_j$, we draw a curve from the dual vertex inside $F_i$, to the crossing point on the edge that $F_i$ and $F_j$ share, to the dual vertex inside $F_j$.

We still need to be careful to avoid crossings, but the setup means we need to be less careful. In order to know that this construction can always be carried out, we only need to know one thing: inside a face $F_i$, we can draw non-intersecting curves from the dual vertex to all the crossing points on the boundary of $F_i$. This is a “local” geometric claim that doesn’t require us to consider the plane embedding as a whole. ◻

There are several properties that the dual graph isn’t required to have, but that it will have in sufficiently nice cases. For example, strictly speaking, it is incorrect to refer to the “dual graph of $G$”, where $G$ is a planar graph. The dual graph is defined based on a plane embedding of $G$, not based on $G$ itself. Sometimes we can get legitimately different dual graphs by choosing a different plane embedding, though the graph in [Figure 23.4(a)](#fig:dual-start) and the skeleton graphs of the Platonic solids do not allow this.

From the plane embeddings we’ve seen so far, can you give an example where two different ones are guaranteed to give non-isomorphic dual graphs?

In [Chapter 21](../planar/planar.html), [Figure 21.5(a)](../planar/planar.html#fig:embedding-1) and [Figure 21.5(b)](../planar/planar.html#fig:embedding-2) showed two plane embeddings of the same graph where the faces had different lengths. The dual graphs we get from these embeddings will not be isomorphic, because their vertices will have different degrees.

In [Figure 23.4(c)](#fig:dual-drawing), only the color indicates which edges are edges of the original plane embedding, and which edges are edges of the dual graph. Here, the dual relationship holds in both directions: each vertex of the original plane embedding lies in a face of (the plane embedding of) the dual graph. In such a scenario, taking the dual graph twice brings us back to where we started, up to isomorphism. However, it is not guaranteed to happen; it is even possible for a plane embedding to have more vertices than the dual graph has faces.

Given a connected plane embedding with $n$ vertices, $m$ edges, and $r$ faces, however, the dual graph will always have $n$ faces (as well as $m$ edges and $r$ vertices). The number of edges and vertices in the dual graph follows from the definition, but the number of faces follows from Euler’s formula. Applied to the original plane embedding, it tells us that $n - m + r = 2$. Meanwhile, if we suppose that a plane embedding of the dual graph has $n'$ faces, then $r - m + n' = 2$; together, these two equations imply that $n = n'$.

Must the dual graph of a plane embedding always be connected?

Yes: given any two faces $F$ and $F'$ (which are vertices of the dual graph), draw any curve from the inside of $F$ to the inside of $F'$, only making sure it does not pass through any vertex. The faces that the curve passes through form an $F-F'$ walk in the dual graph.

Finally, there is more to the story of duality in the case of Platonic solids (and some other polyhedra). For the skeleton graph of a polyhedron, we can construct a dual graph in a way that reflects the geometry of the polyhedron, by doing the following:

1.  For the dual vertex corresponding to a face $F$ of the polyhedron, draw a point in the geometric center of face $F$.

2.  For the dual edge connecting adjacent faces $F$ and $F'$, draw a line segment between the two points in the centers of $F$ and $F'$.

Because the dual vertices are adjacent exactly when the corresponding faces are adjacent, this is still a geometric realization of the dual graph. (It is not a plane embedding because it’s all happening in three dimensions.)

This kind of dual turns the cube into the octahedron (and vice versa) geometrically, not just graph-theoretically; the same is true for the icosahedron and dodecahedron!

In general, though, this construction is not guaranteed to turn a polyhedron into another polyhedron. What could go wrong?

The resulting points and line segments do not necessarily form faces that lie flat! If the dual graph has a face of length $4$ or more, then the points on the boundary of that face might not end up lying on a single plane.

\

## Archimedean solids

The definition of a Platonic solid is the most restrictive generalization of a regular polygon to three dimensions. A slightly less restrictive, and still very interesting, definition is that of an *Archimedean solid*.

These are convex polyhedra whose faces are all regular polygons, and whose vertices are all symmetric to each other (that is, for any two vertices, there is some rotation or reflection of the polyhedron that can move one to the other). Notably missing from this definition is any kind of symmetry between faces: in an Archimedean solid, the faces do not all have to be the same!

The truncated tetrahedron is one small example of an Archimedean solid. Geometrically, it is obtained as follows: start with a tetrahedron, and cut off each vertex a third of the way along its edge, as shown in the picture below. The truncation process is shown in [Figure 23.5](#fig:truncation).

![](../images/23-21.png)

Tetrahedron

![](../images/23-22.png)

Truncated tetrahedron

Truncating a tetrahedron

The truncated tetrahedron has two types of faces: four hexagons (left over from the original faces of the tetrahedron) and four triangles (from where the cuts were made).

As with the Platonic solids, we can at the very least determine the global face, vertex, and edge counts from a local description of what is happening at every vertex. Let’s see how, using the truncated tetrahedron as an example. (Imagine that we don’t have the diagram in [Figure 23.5(b)](#fig:truncated-tetrahedron) to use as a reference.)

Every vertex of the truncated tetrahedron is a third of the way along some edge of the tetrahedron. The two faces that meet there are two hexagons (from the two faces of the tetrahedron that met along that edge) and one triangle (from the cut that created that vertex). This is all the “local information” we will need. The variables we will solve for are:

1.  $m$, the number of edges.

2.  $n$, the number of vertices.

3.  $r_3$, the number of $3$-sided faces (triangles).

4.  $r_6$, the number of $6$-sided faces (hexagons).

We will need four equations, because there are four variables. Euler’s formula is one of them: it tells us that $n - m + (r_3 + r_6) = 2$. It is tempting to use the face length formula, which tells us that $3r_3 + 6r_6 = 2m$, but this is less convenient because it involves three variables; instead, we take the handshake lemma, which tells us that $3n = 2m$. For the other two equations, we use the the local information about what happens at each vertex.

If there are $n$ vertices, and each vertex the corner of one of the $r_3$ triangles, what is $r_3$ in terms of $n$?

There is a $3$-to-$1$ correspondence between vertices and triangles: each vertex has $1$ triangle, but each triangle has $3$ vertices. So $n = 3r_3$.

What about the relationship between $n$ and $r_6$?

Here, the correspondence is $6$-to-$2$: each vertex has $2$ hexagons that meet there, and each hexagon has $6$ vertices at its corners. So $2n = 6r_6$.

In general, such equations are determined by two quantities: the number of sides each type of face has, and the number of faces of that type that meet at each vertex.

Now we can write Euler’s formula solely in terms of $n$, by replacing each variable by a multiple of $n$: since $m = \frac32n$ and $r_3 = r_6 = \frac13n$, Euler’s formula turns into $$n - \frac32n + \frac13n + \frac13n = 2.$$ When we simplify, we get $n=12$. Therefore $m = \frac32n = 18$, $r_3 = \frac13n = 4$, and $r_6 = \frac13n = 4$: exactly the parameters of a truncated tetrahedron!

There is a way to make this process more systematic, while also generalizing it to be able to deal with even less regular polyhedra.

To do so, we define the *angle defect* at a corner of a polyhedron to be $2\pi$ minus the sum of the angles of the polygons meeting at that corner. (We’ll work in radians from now on; in degrees, we’d take $360^\circ$ instead of $2\pi$.) Since the angle defect would always be $0$ if the corner were flat, this is a measure of how much the polyhedron “bends” at a corner.

For a convex polyhedron (or any polyhedron for which Euler’s formula holds), no matter how many vertices there are, the total amount of “bend” must be the same. This was originally shown by René Descartes, the inventor of coordinate geometry [\[34\]](../appendix/bibliography.html#ref-Federico82):

**Theorem 23.3**. *In any convex polyhedron, the sum of all angle defects is $4\pi$.*

*Proof.* This could be done by solving a system of equations, but there is a more elegant proof by a strategy called the “discharging method”. We take the skeleton graph of the polyhedron, and put a “charge” of $+2\pi$ on each vertex, $+2\pi$ on each face, and $-2\pi$ on each edge. The total charge on the graph is $2\pi n - 2\pi m + 2\pi r$, and we’ve chosen our initial charges so that the total charge would simplify to $4\pi$ by Euler’s formula.

In physics, positive and negative electric charges cancel. Probably. I’m not a physicist. In this proof, we will move around the charges we’ve placed on the polyhedron to cancel them, while not changing the overall sum. First, from each face, we move $+\pi$ charge on to each of its edges. This leaves each edge at charge $0$; it started at $-2\pi$, but gained $+\pi$ from each of the two faces it borders. However, each face has now gone into the negatives: a face of length $l$ now has charge $-(l-2)\pi$.

In an $l$-sided polygon, the sum of angles is $(l-2)\pi$ (as observed at the beginning of this chapter for regular polygons). So we can bring each face up to zero charge with a second transformation: for every corner of every face, if that corner makes an angle of $\theta$ on that face in the polyhedron, we move $\theta$ charge from the vertex at that corner to the face.

When we’re done, the faces and edges all have charge $0$, while the remaining charge at each vertex is exactly the angle defect. However, the sum of the charges has remained at $4\pi$ throughout, proving the formula. ◻

[Theorem 23.3](#thm:descartes) can be used to quickly count the vertices in any Archimedean solid. For example, in the truncated tetrahedron, a regular triangle and two regular hexagons meet at each vertex, forming one angle of measure $\frac\pi3$ and two angles of measure $\frac{2\pi}{3}$. This means that the angle defect at each vertex is $2\pi - \frac\pi3 - 2(\frac{2\pi}{3}) = \frac\pi3$. The total angle defect is $4\pi$, so there must be $\frac{4\pi}{\pi/3} = 12$ vertices.

\

## Practice problems

1.  Draw a plane embedding of the skeleton graph of the dodecahedron.

2.  The skeleton graph of the icosahedron is pancyclic: it has a cycle of every length from $3$ to $12$. Verify this by finding a cycle of each length.

3.  Determine the dual graph of any plane embedding of any $n$-vertex tree, up to isomorphism.

    (This example goes to show that two planar graphs with isomorphic duals are not, themselves, necessarily isomorphic.)

4.  Here are five different plane embeddings of a graph $G$:

    - ![](../images/23-23.png)
    - ![](../images/23-24.png)
    - ![](../images/23-25.png)
    - ![](../images/23-26.png)
    - ![](../images/23-27.png)

    For each plane embedding, draw the dual graph. Determine which of these graphs are isomorphic to each other, and which are not.

5.  By going from a plane embedding to a spherical embedding and back to a plane embedding (using the projection technique in [Figure 23.3](#fig:polyhedra-to-planar)), prove that for any face $F$ of a plane embedding of $G$, there is a plane embedding of $G$ where $F$ is the outer face.

6.  A uniform $n$-gonal prism is a prism with $n+2$ faces: two regular $n$-gons on the top and bottom, and $n$ squares around the sides.

    1.  Draw a plane embedding of the skeleton graph of a uniform $n$-gonal prism where $n$ is some very big number—like $6$. Explain how to draw such a plane embedding for any value of $n$.

    2.  Draw the dual graph of the plane embedding you drew in part (a). Describe the structure of this dual graph for arbitrary values of $n$.

    3.  Geometrically, what does the dual polyhedron of the $n$-gonal prism look like?

7.  1.  (AIME 2004) A convex polyhedron $P$ has $26$ vertices, $60$ edges, $36$ faces, $24$ of which are triangular, and $12$ of which are quadrilaterals. A space diagonal is a line segment connecting two non-adjacent vertices that do not belong to the same face. How many space diagonals does $P$ have?

    2.  How many of the numbers given in part (a) are redundant information?

8.  Here are few more questions about Archimedean solids.

    1.  An icosidodecahedron is an Archimedean solid with $12$ pentagonal faces (like a dodecahedron) and $20$ triangular faces (like an icosahedron). How many vertices and edges does it have? How many faces of each type meet at each vertex?

    2.  A snub cube is an Archimedean solid with four triangles and one square meeting at every vertex. How many vertices and edges does it have, and how many faces of each type?

    3.  What about the truncated icosidodecahedron, in which a $4$-sided face, a $6$-sided face, and a $10$-sided face meet at every vertex?

9.  Suppose that $G$ is an $n$-vertex planar multigraph such that (for at least one plane embedding of $G$) the dual graph is isomorphic to $G$. (We call such a multigraph self-dual.)

    1.  How many edges must $G$ have, in terms of $n$?

    2.  Find an example of such a graph $G$ for all $n \ge 2$.

10. In this problem you will prove that the standard octahedron and cube are the only possible Platonic solids with their parameters, at least from the point of view of graph theory.

    1.  It follows from [Theorem 23.1](#thm:platonic) that any Platonic solid with $(p,q)=(3,4)$ is a $4$-regular $6$-vertex graph. Prove that there is only one such graph (up to isomorphism).

    2.  It follows from [Theorem 23.1](#thm:platonic) that any Platonic solid with $(p,q)=(4,3)$ is a $3$-regular $8$-vertex graph. Unfortunately, there are multiple such graphs. However, the graph must also have a plane embedding in which every face has length $4$, and by a practice problem at the end of [Chapter 21](../planar/planar.html), it must be bipartite.

        Prove that there is only one bipartite $3$-regular $8$-vertex graph (up to isomorphism).

\

- [Home](../index.html)
- [Contents](../contents.html)
- [Part VI](index.html)
- Chapter 23


- [← Previous](testing.html)
- [Next →](coloring-maps.html)

\

[Start Doing Graph Theory](../book.html) © 2025 by [Mikhail Lavrov](../author.html) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)![](https://mirrors.creativecommons.org/presskit/icons/cc.svg)![](https://mirrors.creativecommons.org/presskit/icons/by.svg)![](https://mirrors.creativecommons.org/presskit/icons/sa.svg)

<!--
## Source links

- [Home](../index.html)
- [Contents](../contents.html)
- [Part VI](index.html)
- [← Previous](testing.html)
- [Next →](coloring-maps.html)
- [[38]](../appendix/bibliography.html#ref-GardnerPlatonic)
- [Lemma 4.1](../beginning/degrees.html#handshake-lemma)
- [Lemma 21.3](../planar/planar.html#lemma:face-length-formula)
- [Theorem 21.4](../planar/planar.html#thm:euler-formula)
- [Chapter 21](../planar/planar.html)
- [Figure 21.5(a)](../planar/planar.html#fig:embedding-1)
- [Figure 21.5(b)](../planar/planar.html#fig:embedding-2)
- [[34]](../appendix/bibliography.html#ref-Federico82)
- [Start Doing Graph Theory](../book.html)
- [Mikhail Lavrov](../author.html)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
-->
