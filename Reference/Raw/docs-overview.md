\
\

# Clipper2 - Polygon Clipping Offsetting & Triangulating

## Author & copyright:

Angus Johnson\
Copyright © 2010-2025\
[License, terms and conditions](./License.htm)\

## Summary:

[**Clipper2**](./_Body.htm) is an **open source freeware** software library (written in **C++**,
**C#** and **Delphi Pascal**) that performs line and polygon
[**clipping**](./Units/Clipper/Types/ClipType.htm),
[**offsetting**](./Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm) and
[**triangulating**](./Units/Clipper/Functions/Triangulate.htm).\
\
**Clipper2** is a major update of my original
[**Clipper**](https://sourceforge.net/projects/polyclipping/) library which I'm now calling
**Clipper1**. Clipper1 was written 15 years ago and while it still works very well, Clipper2 is just
[better](./Changes.htm). And Clipper2 has all the features of Clipper1 (plus more) that sets Clipper
apart from other polygon clipping libraries, including:

- being able to clip complex self-intersecting polygons
- support polygons with multiple filling rules (EvenOdd, NonZero, Positive, Negative)
- performing polygon offsetting and triangulating
- is numerically robust, and
- is free to use in both freeware and commercial applications

## Source Code and Compilers:

The **Clipper** library is maintained in three programming languages: **C++**, **C#** and **Delphi
Pascal**. (While I do most of the library's development in Delphi, I've made a habit of translating
it into **C++** and **C#** as a way of developing my skills in these languages too. And as a side
benefit, I often find bugs while making these translations.)\
\
The C++ code also contains a
[**header file**](https://github.com/AngusJohnson/Clipper2/blob/main/CPP/Clipper2Lib/include/clipper2/clipper.export.h)
that exports virtually all of the library's features via simple functions. So by compiling this
header into a [**DLL**](https://github.com/AngusJohnson/Clipper2/releases/tag/Clipper2_1.0.6_DLL) or
shared object, the library can be accessed by almost **any programming language**. And when
performance is critical, Delphi and C# users may even prefer accessing the library this way since
it'll be faster than the C# or Delphi compiled code (see chart [here](./Changes.htm)).\

- Delphi: compiles with any version of Delphi back to **Delphi 7**.
- C#: core library uses **Standard Library 2.0** but the sample code uses .NET5
- C++: requires **C++17** but could easily be modified to C++11.

## Download:

Latest Version: **2.0.0**\
Last Update: 17 December 2025\
[**Download from GitHub**](https://github.com/AngusJohnson/Clipper2)\

## Terminology:

![](../Images/int.png) Originally **clipping** referred to the process of removing or "cutting away"
parts of images that were outside a rectangular _clipping window_. However over time this process
has been generalized to include _clipping_ with non-rectangular _windows_, and to include union,
difference and XOR [**boolean operations**](./Units/Clipper/Types/ClipType.htm) too. And in this
library, instead of raster images being clipped, vector paths (**subjects**) are clipped with other
(**clip**) vector paths that define the clipping regions.\
\
**Paths** (see [**Path64**](https://www.angusj.com/clipper2/Docs/Units/Clipper/Types/Path64.htm) &
[**PathD**](https://www.angusj.com/clipper2/Docs/Units/Clipper/Types/PathD.htm)) are simply series
of straight line **segments**. These are defined by series of 2D coordinates (aka points or
vertices). Paths are **open** when their ends _don't_ join together. And open paths are sometimes
called **polylines**. Paths are **closed** when their ends _do_ join (with an implicit line segment
between the first and last vertices). Only context will determine whether paths are open or closed.
Closed paths are often called **polygons**, but more accurately, they are simply the **contours**
that outline polygon regions (see below). In this clipping library, _subject_ paths in clipping
operations may be open or closed, whereas _clip_ paths must be closed.\
\
**Simple polygons** are formed by single closed paths that don't self-intersect. **Complex
polygons** are polygons that aren't _simple_, whether because they self-intersect or because they
require more than one path to define their enclosed "filling" regions. **Polygon holes** are any
regions inside polygons that aren't filled. _Holes_ are defined by **inner** polygon contours that
are separate from and inside **outer** polygon contours. While the filling region of a _simple
polygon_ is unambiguous, the filling region of a _complex polygon_ is not. So complex polygons
require additional information (i.e. a [**filling rule**](./Units/Clipper/Types/FillRule.htm)) to
fully define which regions are filled, and which are not. In 2D graphics, there are two commonly
used filling rules - _EvenOdd_ and _NonZero_.\
\
Closed path **segments** are commonly referred to as **edges**. Edges are considered **touching**
when they are collinear and overlap, and polygons are _touching_ when they have _touching_ edges.

C++ Example: [?](#)

|                 |                                                                                                                                                                                                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 2 3 4 5 6 7 8 | `#include "clipper2/clipper.h"``#include <iomanip> ``using` `namespace` `Clipper2Lib;``using` `namespace` `std;  ``PathsD subject = {{{100,50},{9.5,79.4},{65.5,2.4},{65.5,97.6},{9.5,20.7}}};``PathsD clip = {{{20,20},{80,20},{80,80},{20,80}}};``PathsD solution = Intersect(subject, clip, FillRule::NonZero);``cout << setprecision(3) << solution << endl;` |

Console output:\
65.5,38.8, 80,43.5, 80,56.5, 65.5,61.2, 65.5,80, 52.7,80, 44.1,68.2, 20,76, 20,65, 30.9,50, 20,35,
20,24, 44.1,31.8, 52.7,20, 65.5,20 ![](../Images/intersection.svg)

## Coordinate Range:

In _Clipper2_ there are now two _Clipper_ classes - **Clipper64** and **ClipperD** - that perform
all clipping operations. While _Clipper64_ accepts Path64 paths, and _ClipperD_ accepts PathD paths,
both these classes still perform clipping operations using integer coordinates internally. This is
to ensure [**numerical robustness**](https://en.wikipedia.org/wiki/Robust_geometric_computation).
Because of this, _ClipperD_ performs double / integer conversions before and after clipping (by
scaling and de-scaling coordinates using the specified decimal precision).\
\
Even though Path64 paths _can_ be assigned using all 64bits, clipping can't be performed using quite
this full range. At a minimum there must be room to allow integer addition and subtraction without
overflow. To accommodate this (and the sign bit too), coordinates must at the very least remain
within 62bits (±4.6 × 10 <sup>18</sup> ). However, as coordinates extend beyond ±1.0 × 10
<sup>15</sup> , the algorithm that determines where segments intersect slowly degrades. (There are
algorithms that are
[**more accurate**](https://github.com/AngusJohnson/Clipper2/blob/main/CPP/BenchMark/GetIntersectPtBenchmark.cpp)
at the extremes of the coordinate range, but these algorithms are also significantly slower.) Given
this flexibility in ranges, and because range checking will affect performance, all range checking
is left to the discretion of the library user.\

## Clipping closed paths:

Clipping operations will always return [**Positive**](./Units/Clipper/Functions/IsPositive.htm)
oriented solutions (unless the Clipper object's
[**ReverseSolution**](./Units/Clipper.Engine/Classes/Clipper64/Properties/ReverseSolution.htm)
property has been enabled). This means that outer polygon contours will wind anti-clockwise (in
Cartesian coordinates), and inner _hole_ contours will wind clockwise. And because paths in clipping
solutions never intersect, both **EvenOdd** and **NonZero** filling would correctly apply to the
solution, though it's usual to apply the same [**FillRule**](./Units/Clipper/Types/FillRule.htm)
that was applied to the subject and clip paths during clipping.  \
\
A lot of effort has gone into returning solutions close to their simplest forms, but there's no way
to do this perfectly without significantly degrading performance. So there will, on occasions, be
solutions with polygons that are [**touching**](#touching). If this is problematic, then a follow up
**union** operation will frequently bring these solutions to their simplest forms.\
\
The Clipper class's
[**PreserveCollinear**](./Units/Clipper.Engine/Classes/Clipper64/Properties/PreserveCollinear.htm)
property only is only relevant when clipping **closed paths**. Paths will sometimes contain
consecutive collinear segments, where the shared vertex can be removed without altering path shape.
Removing these vertices simplifies path definitions and is generally (but not always) preferred in
clipping solutions. Nevertheless, where consecutive collinear segments create 180 degree 'spikes',
these will always be removed from closed solutions.\

## Clipping open paths:

![](../Images/intersection_open.svg) The library supports open path clipping, and this may also be
performed concurrently with closed path clipping. However, only **subject** paths may be open.
Except in [**union**](./Units/Clipper/Types/ClipType.htm) operations, the presence of closed subject
paths will have no effect on open path solutions. In **union** operations, open paths will be
clipped wherever they overlap _any_ closed paths (regardless of whether they are subject or clip
paths).\
\
Unlike closed path clipping, there's not always an obvious or _right_ way to clip open path segments
when they overlap (are collinear with) clipping boundaries. Sometimes these segments will be
included in clipping solutions, and sometimes not. When the adjacent (ie preceding and succeeding)
segments of an overlapping segment are both inside the clipping region, then the overlapping segment
will be included. When adjacent segments are both outside, then the overlapping segments will be
excluded. When one adjacent segment is inside and the other is outside, then the overlapping segment
will be included when the lower-most adjacent segment in inside the clipping region.

## Adding user-defined data to clipping paths:

With regard to clipping solutions, occasionally users will need to assign user-defined data to
vertices, including those created at path intersections. To facilitate this, the pre-processor
directive [**USINGZ**](./USINGZ.htm) can be set that adds an Int64 Z member to vertex definitions
(see [**Point64**](./Units/Clipper/Types/Point64.htm) and
[**PointD**](./Units/Clipper/Types/PointD.htm)). Z values can then be assigned to vertices prior to
clipping, and during clipping with newly created vertices at points of intersection (ie via a
user-defined [**ZCallback**](./Units/Clipper.Engine/Classes/Clipper64/Properties/ZCallback.htm)
function). Note however, that these Z values are **user defined** values and shouldn't be confused
with 3D geometries and 3D coordinates.)\

## Polygon Offsetting:

![](../Images/rabbit_offset.svg) Geometric **offsetting** refers to the process of creating
[**parallel curves**](https://en.wikipedia.org/wiki/Parallel_curve) that are offset a specified
distance from their starting positions.\
\
While all offsetting is performed by the
[**ClipperOffset**](./Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm) class in the
[**Clipper.Offset**](./Units/Clipper.Offset/_Body.htm) unit, the complexities of constructing and
using this class can usually be avoided by using instead the
[**InflatePaths**](./Units/Clipper/Functions/InflatePaths.htm) function in the
[**Clipper**](./Units/Clipper/_Body.htm) unit. This function can both inflate and shrink polygons
(using positive and negative offsets respectively). Offsetting can be performed using a number of
[**JoinTypes**](./Units/Clipper/Types/JoinType.htm) and
[**EndTypes**](./Units/Clipper/Types/EndType.htm). While both open paths and closed paths can be
offset, logically only closed paths can be shrunk (ie with negative offsets).\
\
Note: Offsetting shouldn't be confused with the process of polygon
[**translation**](<https://en.wikipedia.org/wiki/Translation_(geometry)>).\

## References:

The Library is based on but significantly extends Bala Vatti's polygon clipping algorithm as
described in
["A generic solution to polygon clipping"](https://dl.acm.org/doi/pdf/10.1145/129902.129906),
Communications of the ACM, Vol 35, Issue 7 (July 1992) pp 56-63.\
\
A section in
["Computer graphics and geometric modeling: implementation and algorithms"](http://books.google.com/books?q=vatti+clipping+agoston)
by By Max K. Agoston (Springer, 2005) discussing _Vatti Polygon Clipping_ was also helpful in
creating the initial Clipper implementation.\
\
The paper titled
["Polygon Offsetting by Computing Winding Numbers"](https://mcmains.me.berkeley.edu/pubs/DAC05OffsetPolygon.pdf)
by Chen & McMains (Paper no. DETC2005-85513, ASME 2005. Pages 565-575) contains helpful discussion
on the complexities of polygon offsetting together with some solutions.\
\

## See Also

[**Index**](_Body.htm), [Changes](Changes.htm), [License](License.htm),
[Clipper64](Units/Clipper.Engine/Classes/Clipper64/_Body.htm),
[Clipper64.PreserveCollinear](Units/Clipper.Engine/Classes/Clipper64/Properties/PreserveCollinear.htm),
[Clipper64.ReverseSolution](Units/Clipper.Engine/Classes/Clipper64/Properties/ReverseSolution.htm),
[Clipper64.ZCallback](Units/Clipper.Engine/Classes/Clipper64/Properties/ZCallback.htm),
[Clipper.Offset](Units/Clipper.Offset/_Body.htm),
[ClipperOffset](Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm),
[Clipper](Units/Clipper/_Body.htm), [InflatePaths](Units/Clipper/Functions/InflatePaths.htm),
[IsPositive](Units/Clipper/Functions/IsPositive.htm),
[Triangulate](Units/Clipper/Functions/Triangulate.htm),
[ClipType](Units/Clipper/Types/ClipType.htm), [EndType](Units/Clipper/Types/EndType.htm),
[FillRule](Units/Clipper/Types/FillRule.htm), [JoinType](Units/Clipper/Types/JoinType.htm),
[Point64](Units/Clipper/Types/Point64.htm), [PointD](Units/Clipper/Types/PointD.htm),
[USINGZ](USINGZ.htm)

\
\
Copyright © 2010-2024 Angus Johnson   -   Clipper2 2.0.0   -   Help file built on 17 Dec 2025\
\

<!--
## Source links

- [License, terms and conditions](./License.htm)
- [Clipper2](./_Body.htm)
- [clipping](./Units/Clipper/Types/ClipType.htm)
- [offsetting](./Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm)
- [triangulating](./Units/Clipper/Functions/Triangulate.htm)
- [Clipper](https://sourceforge.net/projects/polyclipping/)
- [better](./Changes.htm)
- [header file](https://github.com/AngusJohnson/Clipper2/blob/main/CPP/Clipper2Lib/include/clipper2/clipper.export.h)
- [DLL](https://github.com/AngusJohnson/Clipper2/releases/tag/Clipper2_1.0.6_DLL)
- [Download from GitHub](https://github.com/AngusJohnson/Clipper2)
- [Path64](https://www.angusj.com/clipper2/Docs/Units/Clipper/Types/Path64.htm)
- [PathD](https://www.angusj.com/clipper2/Docs/Units/Clipper/Types/PathD.htm)
- [filling rule](./Units/Clipper/Types/FillRule.htm)
- [numerical robustness](https://en.wikipedia.org/wiki/Robust_geometric_computation)
- [more accurate](https://github.com/AngusJohnson/Clipper2/blob/main/CPP/BenchMark/GetIntersectPtBenchmark.cpp)
- [Positive](./Units/Clipper/Functions/IsPositive.htm)
- [ReverseSolution](./Units/Clipper.Engine/Classes/Clipper64/Properties/ReverseSolution.htm)
- [PreserveCollinear](./Units/Clipper.Engine/Classes/Clipper64/Properties/PreserveCollinear.htm)
- [USINGZ](./USINGZ.htm)
- [Point64](./Units/Clipper/Types/Point64.htm)
- [PointD](./Units/Clipper/Types/PointD.htm)
- [ZCallback](./Units/Clipper.Engine/Classes/Clipper64/Properties/ZCallback.htm)
- [parallel curves](https://en.wikipedia.org/wiki/Parallel_curve)
- [Clipper.Offset](./Units/Clipper.Offset/_Body.htm)
- [InflatePaths](./Units/Clipper/Functions/InflatePaths.htm)
- [Clipper](./Units/Clipper/_Body.htm)
- [JoinTypes](./Units/Clipper/Types/JoinType.htm)
- [EndTypes](./Units/Clipper/Types/EndType.htm)
- [translation](https://en.wikipedia.org/wiki/Translation_(geometry))
- ["A generic solution to polygon clipping"](https://dl.acm.org/doi/pdf/10.1145/129902.129906)
- ["Computer graphics and geometric modeling: implementation and algorithms"](http://books.google.com/books?q=vatti+clipping+agoston)
- ["Polygon Offsetting by Computing Winding Numbers"](https://mcmains.me.berkeley.edu/pubs/DAC05OffsetPolygon.pdf)
- [Index](_Body.htm)
- [Changes](Changes.htm)
- [License](License.htm)
- [Clipper64](Units/Clipper.Engine/Classes/Clipper64/_Body.htm)
- [Clipper64.PreserveCollinear](Units/Clipper.Engine/Classes/Clipper64/Properties/PreserveCollinear.htm)
- [Clipper64.ReverseSolution](Units/Clipper.Engine/Classes/Clipper64/Properties/ReverseSolution.htm)
- [Clipper64.ZCallback](Units/Clipper.Engine/Classes/Clipper64/Properties/ZCallback.htm)
- [Clipper.Offset](Units/Clipper.Offset/_Body.htm)
- [ClipperOffset](Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm)
- [Clipper](Units/Clipper/_Body.htm)
- [InflatePaths](Units/Clipper/Functions/InflatePaths.htm)
- [IsPositive](Units/Clipper/Functions/IsPositive.htm)
- [Triangulate](Units/Clipper/Functions/Triangulate.htm)
- [ClipType](Units/Clipper/Types/ClipType.htm)
- [EndType](Units/Clipper/Types/EndType.htm)
- [FillRule](Units/Clipper/Types/FillRule.htm)
- [JoinType](Units/Clipper/Types/JoinType.htm)
- [Point64](Units/Clipper/Types/Point64.htm)
- [PointD](Units/Clipper/Types/PointD.htm)
- [USINGZ](USINGZ.htm)
-->
