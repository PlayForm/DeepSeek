[Skip to content](#start-of-content) Sign in Appearance settings Sign in Sign up Appearance settings {{ message }}

[](./mathandy-svgpathtools.md) ![mathandy](https://avatars.githubusercontent.com/u/3175485?s=60&v=4)**[svgpathtools](./mathandy-svgpathtools.md)** Public

- Notifications You must be signed in to change notification settings
- Fork 162
- Star 640 You must be signed in to star a repository

## About

A collection of tools for manipulating and analyzing SVG Path objects and Bezier curves.

[Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) [Contributing](#contributing-ov-file) [Security policy](#security-ov-file) Activity **640** stars **14** watching **162** forks Report repository**22** Branches **30** TagsOpen more actions menu[![mathandy](https://avatars.githubusercontent.com/u/3175485?v=4&size=40)](/mathandy)mathandyMerge PR [\#253](https://github.com/mathandy/svgpathtools/pull/253): svg2paths: don't crash on a \<path\> with no d attribute Open commit details success Oct 7, 2026 15b500e · Oct 7, 2026 385 Commits Open commit details385 Commits

| Name | Name | Last commit message | Last commit date |
|----|----|----|----|
| .github/workflows | .github/workflows | Apply CodeRabbit review suggestions from PR [\#249](https://github.com/mathandy/svgpathtools/pull/249) | Sep 5, 2026 |
| examples | examples | remove all wildcard imports | Feb 4, 2023 |
| svgpathtools | svgpathtools | svg2paths: don't crash on a \<path\> with no d attribute | Oct 6, 2026 |
| test | test | Also assert the returned attributes in the no-d path test | Oct 7, 2026 |
| .gitignore | .gitignore | do not ignore .github directory | Sep 18, 2021 |
| CONTRIBUTING.md | CONTRIBUTING.md | minor improvements | Nov 2, 2018 |
| LICENSE.txt | LICENSE.txt | initial commit | Jul 6, 2016 |
| LICENSE2.txt | LICENSE2.txt | initial commit | Jul 6, 2016 |
| MANIFEST.in | MANIFEST.in | improve distribution to PyPI | Oct 29, 2016 |
| README.ipynb | README.ipynb | remove broken build shield | Feb 13, 2023 |
| README.md | README.md | remove broken build shield | Feb 13, 2023 |
| SECURITY.md | SECURITY.md | Create SECURITY.md | Sep 21, 2021 |
| decorated_ellipse.svg | decorated_ellipse.svg | initial commit | Jul 6, 2016 |
| donate-button.svg | donate-button.svg | add donate button | Aug 13, 2021 |
| offset_curves.svg | offset_curves.svg | improved README curve offsetting example | Jul 11, 2016 |
| output1.svg | output1.svg | add ability to preserve svg-attributes | Jul 16, 2016 |
| output2.svg | output2.svg | initial commit | Jul 6, 2016 |
| output_intersections.svg | output_intersections.svg | initial commit | Jul 6, 2016 |
| path.svg | path.svg | initial commit | Jul 6, 2016 |
| requirements.txt | requirements.txt | add scipy to requirements file | Nov 10, 2021 |
| setup.cfg | setup.cfg | Drop comment from pydocstyle config | Sep 5, 2026 |
| setup.py | setup.py | Update version to 1.8.0 | Sep 5, 2026 |
| test.svg | test.svg | initial commit | Jul 6, 2016 |
| vectorframes.svg | vectorframes.svg | initial commit | Jul 6, 2016 |
|  |  |  |  |

[![Donate](https://camo.githubusercontent.com/e7d506bc437b2f1c47b5fa4605744c9353d029415e176663d692a2b34a970ea0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f646f6e6174652d70617970616c2d627269676874677265656e)](https://www.paypal.com/donate?business=4SKJ27AM4EYYA&no_recurring=0&item_name=Support+the+creator+of+svgpathtools?++He%27s+a+student+and+would+appreciate+it.&currency_code=USD) [![Python](https://camo.githubusercontent.com/a57377fc3c24869a7d80bc2d158eae38e42f6177e79de9a02468d7cee4307a2d/68747470733a2f2f696d672e736869656c64732e696f2f707970692f707976657273696f6e732f73766770617468746f6f6c732e737667)](https://camo.githubusercontent.com/a57377fc3c24869a7d80bc2d158eae38e42f6177e79de9a02468d7cee4307a2d/68747470733a2f2f696d672e736869656c64732e696f2f707970692f707976657273696f6e732f73766770617468746f6f6c732e737667) [![PyPI](https://camo.githubusercontent.com/5481b6f926a839d394906ba1a6d9559e98545c20fec8a0791a78309ab39e33d7/68747470733a2f2f696d672e736869656c64732e696f2f707970692f762f73766770617468746f6f6c73)](https://pypi.org/project/svgpathtools/) [![PyPI - Downloads](https://camo.githubusercontent.com/73bf17d187877b1567f0b6c6e9a0412f1c7dc2348a8d3b002db71ff72f203fcd/68747470733a2f2f696d672e736869656c64732e696f2f707970692f646d2f73766770617468746f6f6c733f636f6c6f723d79656c6c6f77)](https://pypistats.org/packages/svgpathtools)

# svgpathtools


svgpathtools is a collection of tools for manipulating and analyzing SVG Path objects and Bézier curves.

## Features


svgpathtools contains functions designed to **easily read, write and display SVG files** as well as *a large selection of geometrically-oriented tools* to **transform and analyze path elements**.

Additionally, the submodule *bezier.py* contains tools for for working with general **nth order Bezier curves stored as n-tuples**.

Some included tools:

- **read**, **write**, and **display** SVG files containing Path (and other) SVG elements
- convert Bézier path segments to **numpy.poly1d** (polynomial) objects
- convert polynomials (in standard form) to their Bézier form
- compute **tangent vectors** and (right-hand rule) **normal vectors**
- compute **curvature**
- break discontinuous paths into their **continuous subpaths**.
- efficiently compute **intersections** between paths and/or segments
- find a **bounding box** for a path or segment
- **reverse** segment/path orientation
- **crop** and **split** paths and segments
- **smooth** paths (i.e. smooth away kinks to make paths differentiable)
- **transition maps** from path domain to segment domain and back (T2t and t2T)
- compute **area** enclosed by a closed path
- compute **arc length**
- compute **inverse arc length**
- convert RGB color tuples to hexadecimal color strings and back

## Prerequisites


- **numpy**
- **svgwrite**
- **scipy** (optional, but recommended for performance)

## Setup


\$ pip install svgpathtools

### Alternative Setup


You can download the source from Github and install by using the command (from inside the folder containing setup.py):

\$ python setup.py install

## Credit where credit's due


Much of the core of this module was taken from [the svg.path (v2.0) module](https://github.com/regebro/svg.path). Interested svg.path users should see the compatibility notes at bottom of this readme.

## Basic Usage


### Classes


The svgpathtools module is primarily structured around four path segment classes: `Line`, `QuadraticBezier`, `CubicBezier`, and `Arc`. There is also a fifth class, `Path`, whose objects are sequences of (connected or disconnected <sup>[1](#f1)</sup>) path segment objects.

- `Line(start, end)`

- `Arc(start, radius, rotation, large_arc, sweep, end)` Note: See docstring for a detailed explanation of these parameters

- `QuadraticBezier(start, control, end)`

- `CubicBezier(start, control1, control2, end)`

- `Path(*segments)`

See the relevant docstrings in *path.py* or the [official SVG specifications](http://www.w3.org/TR/SVG/paths.html) for more information on what each parameter means.

1 Warning: Some of the functionality in this library has not been tested on discontinuous Path objects. A simple workaround is provided, however, by the `Path.continuous_subpaths()` method. [↩](#a1)

from \_\_future\_\_ import division, print_function

\# Coordinates are given as points in the complex plane\
from svgpathtools import Path, Line, QuadraticBezier, CubicBezier, Arc\
seg1 = CubicBezier(300+100j, 100+100j, 200+200j, 200+300j)  \# A cubic beginning at (300, 100) and ending at (200, 300)\
seg2 = Line(200+300j, 250+350j)  \# A line beginning at (200, 300) and ending at (250, 350)\
path = Path(seg1, seg2)  \# A path traversing the cubic and then the line\
\
\# We could alternatively created this Path object using a d-string\
from svgpathtools import parse_path\
path_alt = parse_path('M 300 100 C 100 100 200 200 200 300 L 250 350')\
\
\# Let's check that these two methods are equivalent\
print(path)\
print(path_alt)\
print(path == path_alt)\
\
\# On a related note, the Path.d() method returns a Path object's d-string\
print(path.d())\
print(parse_path(path.d()) == path)

```
Path(CubicBezier(start=(300+100j), control1=(100+100j), control2=(200+200j), end=(200+300j)),
     Line(start=(200+300j), end=(250+350j)))
Path(CubicBezier(start=(300+100j), control1=(100+100j), control2=(200+200j), end=(200+300j)),
     Line(start=(200+300j), end=(250+350j)))
True
M 300.0,100.0 C 100.0,100.0 200.0,200.0 200.0,300.0 L 250.0,350.0
True
```

The `Path` class is a mutable sequence, so it behaves much like a list. So segments can **append** ed, **insert** ed, set by index, **del** eted, **enumerate** d, **slice** d out, etc.

\# Let's append another to the end of it\
path.append(CubicBezier(250+350j, 275+350j, 250+225j, 200+100j))\
print(path)\
\
\# Let's replace the first segment with a Line object\
path\[0\] = Line(200+100j, 200+300j)\
print(path)\
\
\# You may have noticed that this path is connected and now is also closed (i.e. path.start == path.end)\
print("path is continuous? ", path.iscontinuous())\
print("path is closed? ", path.isclosed())\
\
\# The curve the path follows is not, however, smooth (differentiable)\
from svgpathtools import kinks, smoothed_path\
print("path contains non-differentiable points? ", len(kinks(path)) \> 0)\
\
\# If we want, we can smooth these out (Experimental and only for line/cubic paths)\
\# Note:  smoothing will always works (except on 180 degree turns), but you may want \
\# to play with the maxjointsize and tightness parameters to get pleasing results\
\# Note also: smoothing will increase the number of segments in a path\
spath = smoothed_path(path)\
print("spath contains non-differentiable points? ", len(kinks(spath)) \> 0)\
print(spath)\
\
\# Let's take a quick look at the path and its smoothed relative\
\# The following commands will open two browser windows to display path and spaths\
from svgpathtools import disvg\
from time import sleep\
disvg(path) \
sleep(1)  \# needed when not giving the SVGs unique names (or not using timestamp)\
disvg(spath)\
print("Notice that path contains {} segments and spath contains {} segments."\
      "".format(len(path), len(spath)))

```
Path(CubicBezier(start=(300+100j), control1=(100+100j), control2=(200+200j), end=(200+300j)),
     Line(start=(200+300j), end=(250+350j)),
     CubicBezier(start=(250+350j), control1=(275+350j), control2=(250+225j), end=(200+100j)))
Path(Line(start=(200+100j), end=(200+300j)),
     Line(start=(200+300j), end=(250+350j)),
     CubicBezier(start=(250+350j), control1=(275+350j), control2=(250+225j), end=(200+100j)))
path is continuous?  True
path is closed?  True
path contains non-differentiable points?  True
spath contains non-differentiable points?  False
Path(Line(start=(200+101.5j), end=(200+298.5j)),
     CubicBezier(start=(200+298.5j), control1=(200+298.505j), control2=(201.057124638+301.057124638j), end=(201.060660172+301.060660172j)),
     Line(start=(201.060660172+301.060660172j), end=(248.939339828+348.939339828j)),
     CubicBezier(start=(248.939339828+348.939339828j), control1=(249.649982143+349.649982143j), control2=(248.995+350j), end=(250+350j)),
     CubicBezier(start=(250+350j), control1=(275+350j), control2=(250+225j), end=(200+100j)),
     CubicBezier(start=(200+100j), control1=(199.62675237+99.0668809257j), control2=(200+100.495j), end=(200+101.5j)))
Notice that path contains 3 segments and spath contains 6 segments.
```

### Reading SVGSs


The **svg2paths()** function converts an svgfile to a list of Path objects and a separate list of dictionaries containing the attributes of each said path.\
Note: Line, Polyline, Polygon, and Path SVG elements can all be converted to Path objects using this function.

\# Read SVG into a list of path objects and list of dictionaries of attributes \
from svgpathtools import svg2paths, wsvg\
paths, attributes = svg2paths('test.svg')\
\
\# Update: You can now also extract the svg-attributes by setting\
\# return_svg_attributes=True, or with the convenience function svg2paths2\
from svgpathtools import svg2paths2\
paths, attributes, svg_attributes = svg2paths2('test.svg')\
\
\# Let's print out the first path object and the color it was in the SVG\
\# We'll see it is composed of two CubicBezier objects and, in the SVG file it \
\# came from, it was red\
redpath = paths\[0\]\
redpath_attribs = attributes\[0\]\
print(redpath)\
print(redpath_attribs\['stroke'\])

```
Path(CubicBezier(start=(10.5+80j), control1=(40+10j), control2=(65+10j), end=(95+80j)),
     CubicBezier(start=(95+80j), control1=(125+150j), control2=(150+150j), end=(180+80j)))
red
```

### Writing SVGSs (and some geometric functions and methods)


The **wsvg()** function creates an SVG file from a list of path. This function can do many things (see docstring in *paths2svg.py* for more information) and is meant to be quick and easy to use. Note: Use the convenience function **disvg()** (or set 'openinbrowser=True') to automatically attempt to open the created svg file in your default SVG viewer.

\# Let's make a new SVG that's identical to the first\
wsvg(paths, attributes=attributes, svg_attributes=svg_attributes, filename='output1.svg')

[!output1.svg](/mathandy/svgpathtools/blob/master/output1.svg)

There will be many more examples of writing and displaying path data below.

### The .point() method and transitioning between path and path segment parameterizations


SVG Path elements and their segments have official parameterizations. These parameterizations can be accessed using the `Path.point()`, `Line.point()`, `QuadraticBezier.point()`, `CubicBezier.point()`, and `Arc.point()` methods. All these parameterizations are defined over the domain 0 \<= t \<= 1.

**Note:** In this document and in inline documentation and doctrings, I use a capital `T` when referring to the parameterization of a Path object and a lower case `t` when referring speaking about path segment objects (i.e. Line, QaudraticBezier, CubicBezier, and Arc objects).\
Given a `T` value, the `Path.T2t()` method can be used to find the corresponding segment index, `k`, and segment parameter, `t`, such that `path.point(T)=path[k].point(t)`.\
There is also a `Path.t2T()` method to solve the inverse problem.

\# Example:\
\
\# Let's check that the first segment of redpath starts \
\# at the same point as redpath\
firstseg = redpath\[0\] \
print(redpath.point(0) == firstseg.point(0) == redpath.start == firstseg.start)\
\
\# Let's check that the last segment of redpath ends on the same point as redpath\
lastseg = redpath\[-1\] \
print(redpath.point(1) == lastseg.point(1) == redpath.end == lastseg.end)\
\
\# This next boolean should return False as redpath is composed multiple segments\
print(redpath.point(0.5) == firstseg.point(0.5))\
\
\# If we want to figure out which segment of redpoint the \
\# point redpath.point(0.5) lands on, we can use the path.T2t() method\
k, t = redpath.T2t(0.5)\
print(redpath\[k\].point(t) == redpath.point(0.5))

```
True
True
False
True
```

### Bezier curves as NumPy polynomial objects


Another great way to work with the parameterizations for `Line`, `QuadraticBezier`, and `CubicBezier` objects is to convert them to `numpy.poly1d` objects. This is done easily using the `Line.poly()`, `QuadraticBezier.poly()` and `CubicBezier.poly()` methods.\
There's also a `polynomial2bezier()` function in the pathtools.py submodule to convert polynomials back to Bezier curves.

**Note:** cubic Bezier curves are parameterized as $`B(t) = P_{0}(1 - t)^{3} + 3P_{1}(1 - t)^{2}t + 3P_{2}(1 - t)t^{2} + P_{3}t^{3}`$ where $`P_{0}`$, $`P_{1}`$, $`P_{2}`$, and $`P_{3}`$ are the control points `start`, `control1`, `control2`, and `end`, respectively, that svgpathtools uses to define a CubicBezier object. The `CubicBezier.poly()` method expands this polynomial to its standard form $`B(t) = c_{0}t^{3} + c_{1}t^{2} + c_{2}t + c3`$ where \$\$\begin{bmatrix}c_0\c_1\c_2\c_3\end{bmatrix} = \begin{bmatrix} -1 & 3 & -3 & 1\\ 3 & -6 & -3 & 0\\ -3 & 3 & 0 & 0\\ 1 & 0 & 0 & 0\\ \end{bmatrix} \begin{bmatrix}P_0\P_1\P_2\P_3\end{bmatrix}\$\$

`QuadraticBezier.poly()` and `Line.poly()` are [defined similarly](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#General_definition).

\# Example:\
b = CubicBezier(300+100j, 100+100j, 200+200j, 200+300j)\
p = b.poly()\
\
\# p(t) == b.point(t)\
print(p(0.235) == b.point(0.235))\
\
\# What is p(t)?  It's just the cubic b written in standard form.  \
bpretty = "{}\*(1-t)^3 + 3\*{}\*(1-t)^2\*t + 3\*{}\*(1-t)\*t^2 + {}\*t^3".format(\*b.bpoints())\
print("The CubicBezier, b.point(x) = \n\n" + \
      bpretty + "\n\n" + \
      "can be rewritten in standard form as \n\n" +\
      str(p).replace('x','t'))

```
True
The CubicBezier, b.point(x) = 

(300+100j)*(1-t)^3 + 3*(100+100j)*(1-t)^2*t + 3*(200+200j)*(1-t)*t^2 + (200+300j)*t^3

can be rewritten in standard form as 

                3                2
(-400 + -100j) t + (900 + 300j) t - 600 t + (300 + 100j)
```

The ability to convert between Bezier objects to NumPy polynomial objects is very useful. For starters, we can take turn a list of Bézier segments into a NumPy array

### Numpy Array operations on Bézier path segments


[Example available here](https://github.com/mathandy/svgpathtools/blob/master/examples/compute-many-points-quickly-using-numpy-arrays.py)

To further illustrate the power of being able to convert our Bezier curve objects to numpy.poly1d objects and back, lets compute the unit tangent vector of the above CubicBezier object, b, at t=0.5 in four different ways.

### Tangent vectors (and more on NumPy polynomials)


t = 0.5\
\### Method 1: the easy way\
u1 = b.unit_tangent(t)\
\
\### Method 2: another easy way \
\# Note: This way will fail if it encounters a removable singularity.\
u2 = b.derivative(t)/abs(b.derivative(t))\
\
\### Method 2: a third easy way \
\# Note: This way will also fail if it encounters a removable singularity.\
dp = p.deriv() \
u3 = dp(t)/abs(dp(t))\
\
\### Method 4: the removable-singularity-proof numpy.poly1d way  \
\# Note: This is roughly how Method 1 works\
from svgpathtools import real, imag, rational_limit\
dx, dy = real(dp), imag(dp)  \# dp == dx + 1j\*dy \
p_mag2 = dx\*\*2 + dy\*\*2  \# p_mag2(t) = \|p(t)\|\*\*2\
\# Note: abs(dp) isn't a polynomial, but abs(dp)\*\*2 is, and,\
\#  the limit\_{t-\>t0}\[f(t) / abs(f(t))\] == \
\# sqrt(limit\_{t-\>t0}\[f(t)\*\*2 / abs(f(t))\*\*2\])\
from cmath import sqrt\
u4 = sqrt(rational_limit(dp\*\*2, p_mag2, t))\
\
print("unit tangent check:", u1 == u2 == u3 == u4)\
\
\# Let's do a visual check\
mag = b.length()/4  \# so it's not hard to see the tangent line\
tangent_line = Line(b.point(t), b.point(t) + mag\*u1)\
disvg(\[b, tangent_line\], 'bg', nodes=\[b.point(t)\])

```
unit tangent check: True
```

### Translations (shifts), reversing orientation, and normal vectors


\# Speaking of tangents, let's add a normal vector to the picture\
n = b.normal(t)\
normal_line = Line(b.point(t), b.point(t) + mag\*n)\
disvg(\[b, tangent_line, normal_line\], 'bgp', nodes=\[b.point(t)\])\
\
\# and let's reverse the orientation of b! \
\# the tangent and normal lines should be sent to their opposites\
br = b.reversed()\
\
\# Let's also shift b_r over a bit to the right so we can view it next to b\
\# The simplest way to do this is br = br.translated(3\*mag),  but let's use \
\# the .bpoints() instead, which returns a Bezier's control points\
br.start, br.control1, br.control2, br.end = \[3\*mag + bpt for bpt in br.bpoints()\]  \# \
\
tangent_line_r = Line(br.point(t), br.point(t) + mag\*br.unit_tangent(t))\
normal_line_r = Line(br.point(t), br.point(t) + mag\*br.normal(t))\
wsvg(\[b, tangent_line, normal_line, br, tangent_line_r, normal_line_r\], \
     'bgpkgp', nodes=\[b.point(t), br.point(t)\], filename='vectorframes.svg', \
     text=\["b's tangent", "br's tangent"\], text_path=\[tangent_line, tangent_line_r\])

[!vectorframes.svg](/mathandy/svgpathtools/blob/master/vectorframes.svg)

### Rotations and Translations


\# Let's take a Line and an Arc and make some pictures\
top_half = Arc(start=-1, radius=1+2j, rotation=0, large_arc=1, sweep=1, end=1)\
midline = Line(-1.5, 1.5)\
\
\# First let's make our ellipse whole\
bottom_half = top_half.rotated(180)\
decorated_ellipse = Path(top_half, bottom_half)\
\
\# Now let's add the decorations\
for k in range(12):\
    decorated_ellipse.append(midline.rotated(30\*k))\
    \
\# Let's move it over so we can see the original Line and Arc object next\
\# to the final product\
decorated_ellipse = decorated_ellipse.translated(4+0j)\
wsvg(\[top_half, midline, decorated_ellipse\], filename='decorated_ellipse.svg')

[!decorated_ellipse.svg](/mathandy/svgpathtools/blob/master/decorated_ellipse.svg)

### arc length and inverse arc length


Here we'll create an SVG that shows off the parametric and geometric midpoints of the paths from `test.svg`. We'll need to compute use the `Path.length()`, `Line.length()`, `QuadraticBezier.length()`, `CubicBezier.length()`, and `Arc.length()` methods, as well as the related inverse arc length methods `.ilength()` function to do this.

\# First we'll load the path data from the file test.svg\
paths, attributes = svg2paths('test.svg')\
\
\# Let's mark the parametric midpoint of each segment\
\# I say "parametric" midpoint because Bezier curves aren't \
\# parameterized by arclength \
\# If they're also the geometric midpoint, let's mark them\
\# purple and otherwise we'll mark the geometric midpoint green\
min_depth = 5\
error = 1e-4\
dots = \[\]\
ncols = \[\]\
nradii = \[\]\
for path in paths:\
    for seg in path:\
        parametric_mid = seg.point(0.5)\
        seg_length = seg.length()\
        if seg.length(0.5)/seg.length() == 1/2:\
            dots += \[parametric_mid\]\
            ncols += \['purple'\]\
            nradii += \[5\]\
        else:\
            t_mid = seg.ilength(seg_length/2)\
            geo_mid = seg.point(t_mid)\
            dots += \[parametric_mid, geo_mid\]\
            ncols += \['red', 'green'\]\
            nradii += \[5\] \* 2\
\
\# In 'output2.svg' the paths will retain their original attributes\
wsvg(paths, nodes=dots, node_colors=ncols, node_radii=nradii, \
     attributes=attributes, filename='output2.svg')

[!output2.svg](/mathandy/svgpathtools/blob/master/output2.svg)

### Intersections between Bezier curves


\# Let's find all intersections between redpath and the other \
redpath = paths\[0\]\
redpath_attribs = attributes\[0\]\
intersections = \[\]\
for path in paths\[1:\]:\
    for (T1, seg1, t1), (T2, seg2, t2) in redpath.intersect(path):\
        intersections.append(redpath.point(T1))\
        \
disvg(paths, filename='output_intersections.svg', attributes=attributes,\
      nodes = intersections, node_radii = \[5\]\*len(intersections))

[!output_intersections.svg](/mathandy/svgpathtools/blob/master/output_intersections.svg)

### An Advanced Application: Offsetting Paths


Here we'll find the [offset curve](https://en.wikipedia.org/wiki/Parallel_curve) for a few paths.

from svgpathtools import parse_path, Line, Path, wsvg\
def offset_curve(path, offset_distance, steps=1000):\
    """Takes in a Path object, \`path\`, and a distance,\
    \`offset_distance\`, and outputs an piecewise-linear approximation \
    of the 'parallel' offset curve."""\
    nls = \[\]\
    for seg in path:\
        ct = 1\
        for k in range(steps):\
            t = k / steps\
            offset_vector = offset_distance \* seg.normal(t)\
            nl = Line(seg.point(t), seg.point(t) + offset_vector)\
            nls.append(nl)\
    connect_the_dots = \[Line(nls\[k\].end, nls\[k+1\].end) for k in range(len(nls)-1)\]\
    if path.isclosed():\
        connect_the_dots.append(Line(nls\[-1\].end, nls\[0\].end))\
    offset_path = Path(\*connect_the_dots)\
    return offset_path\
\
\# Examples:\
path1 = parse_path("m 288,600 c -52,-28 -42,-61 0,-97 ")\
path2 = parse_path("M 151,395 C 407,485 726.17662,160 634,339").translated(300)\
path3 = parse_path("m 117,695 c 237,-7 -103,-146 457,0").translated(500+400j)\
paths = \[path1, path2, path3\]\
\
offset_distances = \[10\*k for k in range(1,51)\]\
offset_paths = \[\]\
for path in paths:\
    for distances in offset_distances:\
        offset_paths.append(offset_curve(path, distances))\
\
\# Let's take a look\
wsvg(paths + offset_paths, 'g'\*len(paths) + 'r'\*len(offset_paths), filename='offset_curves.svg')

[!offset_curves.svg](/mathandy/svgpathtools/blob/master/offset_curves.svg)

## Compatibility Notes for users of svg.path (v2.0)


- renamed Arc.arc attribute as Arc.large_arc

- Path.d() : For behavior similar <sup>[2](#f2)</sup> to svg.path (v2.0), set both useSandT and use_closed_attrib to be True.

2 The behavior would be identical, but the string formatting used in this method has been changed to use default format (instead of the General format, {:G}), for inceased precision. [↩](#a2)

## Licence


This module is under a MIT License.

## About

A collection of tools for manipulating and analyzing SVG Path objects and Bezier curves.

[Readme](#readme-ov-file) [MIT license](#MIT-1-ov-file) [Contributing](#contributing-ov-file) [Security policy](#security-ov-file) Activity **640** stars **14** watching **162** forks Report repository

## Releases

30 tags

## Used by 1.8K (1.8K)

[ ![@sacovo](https://avatars.githubusercontent.com/u/3640273?s=64&v=4)![@sethfischer](https://avatars.githubusercontent.com/u/2492233?s=64&v=4)![@maxk2222](https://avatars.githubusercontent.com/u/117130112?s=64&v=4)![@suyiiyii](https://avatars.githubusercontent.com/u/143583484?s=64&v=4)![@OpenReloading](https://avatars.githubusercontent.com/u/340181410?s=64&v=4)+ 1,768](/mathandy/svgpathtools/network/dependents)

## Contributors 34 (34)

- [![@mathandy](https://avatars.githubusercontent.com/u/3175485?s=64&v=4)](/mathandy)
- [![@SebKuzminsky](https://avatars.githubusercontent.com/u/400548?s=64&v=4)](/SebKuzminsky)
- [![@claude](https://avatars.githubusercontent.com/u/81847?s=64&v=4)](/claude)
- [![@FlyingSamson](https://avatars.githubusercontent.com/u/59110786?s=64&v=4)](/FlyingSamson)
- [![@kennyweiss](https://avatars.githubusercontent.com/u/5626552?s=64&v=4)](/kennyweiss)
- [![@tatarize](https://avatars.githubusercontent.com/u/3302478?s=64&v=4)](/tatarize)
- [![@derVedro](https://avatars.githubusercontent.com/u/4129535?s=64&v=4)](/derVedro)
- [![@jpcofr](https://avatars.githubusercontent.com/u/2237933?s=64&v=4)](/jpcofr)
- [![@elenzil](https://avatars.githubusercontent.com/u/4194028?s=64&v=4)](/elenzil)
- [![@mxgrey](https://avatars.githubusercontent.com/u/1307217?s=64&v=4)](/mxgrey)
- [![@andersgb](https://avatars.githubusercontent.com/u/1473004?s=64&v=4)](/andersgb)
- [![@bouhek](https://avatars.githubusercontent.com/u/37497935?s=64&v=4)](/bouhek)
- [![@abey79](https://avatars.githubusercontent.com/u/49431240?s=64&v=4)](/abey79)
- [![@Erfouni](https://avatars.githubusercontent.com/u/232311059?s=64&v=4)](/Erfouni)

+ 20 contributors

## Languages

- Python 100%

You can’t perform that action at this time.

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fmathandy%2Fsvgpathtools`
- [GitHub Copilot Write better code with AI](https://github.com/features/copilot)
- [GitHub Copilot app Direct agents from issue to merge](https://github.com/features/ai/github-app)
- [MCP Registry Integrate external tools](https://github.com/mcp)
- [Actions Automate any workflow](https://github.com/features/actions)
- [Codespaces Instant dev environments](https://github.com/features/codespaces)
- [Issues Plan and track work](https://github.com/features/issues)
- [Code Review Manage code changes](https://github.com/features/code-review)
- [Code Quality Enforce quality at merge](https://github.com/features/code-quality)
- [GitHub Advanced Security Find and fix vulnerabilities](https://github.com/security/advanced-security)
- [Code security Secure your code as you build](https://github.com/security/advanced-security/code-security)
- [Secret protection Stop leaks before they start](https://github.com/security/advanced-security/secret-protection)
- [Why GitHub](https://github.com/why-github)
- [Documentation](https://docs.github.com)
- [Blog](https://github.blog)
- [Changelog](https://github.blog/changelog)
- [Marketplace](https://github.com/marketplace)
- [View all features](https://github.com/features)
- [Enterprises](https://github.com/enterprise)
- [Small and medium teams](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [App Modernization](https://github.com/solutions/use-case/app-modernization)
- [DevSecOps](https://github.com/solutions/use-case/devsecops)
- [DevOps](https://github.com/solutions/use-case/devops)
- [CI/CD](https://github.com/solutions/use-case/ci-cd)
- [View all use cases](https://github.com/solutions/use-case)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [View all solutions](https://github.com/solutions)
- [AI](https://github.com/resources/articles?topic=ai)
- [Software Development](https://github.com/resources/articles?topic=software-development)
- [DevOps](https://github.com/resources/articles?topic=devops)
- [Security](https://github.com/resources/articles?topic=security)
- [View all topics](https://github.com/resources/articles)
- [Customer stories](https://github.com/customer-stories)
- [Events & webinars](https://github.com/resources/events)
- [Ebooks & reports](https://github.com/resources/whitepapers)
- [Business insights](https://github.com/solutions/executive-insights)
- [GitHub Skills](https://skills.github.com)
- [Customer support](https://support.github.com)
- [Community forum](https://github.com/orgs/community/discussions)
- [Trust center](https://github.com/trust-center)
- [Partners](https://github.com/partners)
- [View all resources](https://github.com/resources)
- [GitHub Sponsors Fund open source developers](https://github.com/open-source/sponsors)
- [Security Lab](https://securitylab.github.com)
- [Maintainer Community](https://maintainers.github.com)
- [GitHub Stars](https://stars.github.com)
- [Archive Program](https://archiveprogram.github.com)
- [Topics](https://github.com/topics)
- [Trending](https://github.com/trending)
- [Collections](https://github.com/collections)
- [Copilot for Business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Pricing](https://github.com/pricing)
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=mathandy%2Fsvgpathtools`
- mathandy - source: `/mathandy`
- [svgpathtools](./mathandy-svgpathtools.md) - source: /mathandy/svgpathtools
- Issues 62 - source: `/mathandy/svgpathtools/issues`
- Pull requests 2 - source: `/mathandy/svgpathtools/pulls`
- Discussions - source: `/mathandy/svgpathtools/discussions`
- Actions - source: `/mathandy/svgpathtools/actions`
- Projects - source: `/mathandy/svgpathtools/projects`
- Wiki - source: `/mathandy/svgpathtools/wiki`
- Security and quality - source: `/mathandy/svgpathtools/security`
- Insights - source: `/mathandy/svgpathtools/pulse`
- Notifications - source: `/login?return_to=%2Fmathandy%2Fsvgpathtools`
- Activity - source: `/mathandy/svgpathtools/activity`
- 162 forks - source: `/mathandy/svgpathtools/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fmathandy%2Fsvgpathtools&report=mathandy+%28user%29`
- 22 Branches - source: `/mathandy/svgpathtools/branches`
- 30 Tags - source: `/mathandy/svgpathtools/tags`
- mathandy - source: `/mathandy/svgpathtools/commits?author=mathandy`
- Merge PR - source: `/mathandy/svgpathtools/commit/15b500ef3dc23336b114f40fb18d957483d3968f`
- [#253](https://github.com/mathandy/svgpathtools/pull/253)
- 385 Commits - source: `/mathandy/svgpathtools/commits/master/`
- .github/ workflows - source: `/mathandy/svgpathtools/tree/master/.github/workflows`
- Apply CodeRabbit review suggestions from PR - source: `/mathandy/svgpathtools/commit/e16c603a8845542c293a2294f6b2ba5097a05c02`
- [#249](https://github.com/mathandy/svgpathtools/pull/249)
- examples - source: `/mathandy/svgpathtools/tree/master/examples`
- remove all wildcard imports - source: `/mathandy/svgpathtools/commit/d9515ea39962cd044eb624fd068a82cf37d12e8c`
- svgpathtools - source: `/mathandy/svgpathtools/tree/master/svgpathtools`
- svg2paths: don't crash on a <path> with no d attribute - source: `/mathandy/svgpathtools/commit/d89f733f0f161ef974b1ee3b23107e4ad15d4a19`
- test - source: `/mathandy/svgpathtools/tree/master/test`
- Also assert the returned attributes in the no-d path test - source: `/mathandy/svgpathtools/commit/d9de536a50749601746c97a9f863362f7b93d12b`
- .gitignore - source: `/mathandy/svgpathtools/blob/master/.gitignore`
- do not ignore .github directory - source: `/mathandy/svgpathtools/commit/c5f49de5fe692d29e7eb94097d8f12efec719c19`
- CONTRIBUTING.md - source: `/mathandy/svgpathtools/blob/master/CONTRIBUTING.md`
- minor improvements - source: `/mathandy/svgpathtools/commit/d810653b63b29ff4536a8d691dc397b6ba4761e4`
- LICENSE.txt - source: `/mathandy/svgpathtools/blob/master/LICENSE.txt`
- initial commit - source: `/mathandy/svgpathtools/commit/9b3d6fe5e3513e03235822e4bbf5352abef46dd2`
- LICENSE2.txt - source: `/mathandy/svgpathtools/blob/master/LICENSE2.txt`
- MANIFEST.in - source: `/mathandy/svgpathtools/blob/master/MANIFEST.in`
- improve distribution to PyPI - source: `/mathandy/svgpathtools/commit/08e8dc71ff37c35247e75aaba17745f98d9d266a`
- README.ipynb - source: `/mathandy/svgpathtools/blob/master/README.ipynb`
- remove broken build shield - source: `/mathandy/svgpathtools/commit/dc2f6e90cc771237c3645599ee20c3c397aede6c`
- README.md - source: `/mathandy/svgpathtools/blob/master/README.md`
- SECURITY.md - source: `/mathandy/svgpathtools/blob/master/SECURITY.md`
- Create SECURITY.md - source: `/mathandy/svgpathtools/commit/be33f182fb831c7675b023680a64a49d5bef38a7`
- decorated_ellipse.svg - source: `/mathandy/svgpathtools/blob/master/decorated_ellipse.svg`
- donate-button.svg - source: `/mathandy/svgpathtools/blob/master/donate-button.svg`
- add donate button - source: `/mathandy/svgpathtools/commit/5ea0fb226df4e3e589d38544e0c7fdc96866ab31`
- offset_curves.svg - source: `/mathandy/svgpathtools/blob/master/offset_curves.svg`
- improved README curve offsetting example - source: `/mathandy/svgpathtools/commit/0c682bf4d89022b937cbb0de2408ae172085e6ad`
- output1.svg - source: `/mathandy/svgpathtools/blob/master/output1.svg`
- add ability to preserve svg-attributes - source: `/mathandy/svgpathtools/commit/15d186ff33af1f9bfbe1f2ea9e36a9d61ad3ff68`
- output2.svg - source: `/mathandy/svgpathtools/blob/master/output2.svg`
- output_intersections.svg - source: `/mathandy/svgpathtools/blob/master/output_intersections.svg`
- path.svg - source: `/mathandy/svgpathtools/blob/master/path.svg`
- requirements.txt - source: `/mathandy/svgpathtools/blob/master/requirements.txt`
- add scipy to requirements file - source: `/mathandy/svgpathtools/commit/3a6711a5e74743cf17ecf8938374399fa01583ae`
- setup.cfg - source: `/mathandy/svgpathtools/blob/master/setup.cfg`
- Drop comment from pydocstyle config - source: `/mathandy/svgpathtools/commit/10c472beb5581c2350d886ecf0ec4de7758c3090`
- setup.py - source: `/mathandy/svgpathtools/blob/master/setup.py`
- Update version to 1.8.0 - source: `/mathandy/svgpathtools/commit/bcbbb74705c6916c5fe659b7a7ae3708390f946c`
- test.svg - source: `/mathandy/svgpathtools/blob/master/test.svg`
- vectorframes.svg - source: `/mathandy/svgpathtools/blob/master/vectorframes.svg`
- [https://www.paypal.com/donate?business=4SKJ27AM4EYYA&no_recurring=0&item_name=Support+the+creator+of+svgpathtools?++He%27s+a+student+and+would+appreciate+it.&currency_code=USD](https://www.paypal.com/donate?business=4SKJ27AM4EYYA&no_recurring=0&item_name=Support+the+creator+of+svgpathtools?++He%27s+a+student+and+would+appreciate+it.&currency_code=USD)
- [https://camo.githubusercontent.com/a57377fc3c24869a7d80bc2d158eae38e42f6177e79de9a02468d7cee4307a2d/68747470733a2f2f696d672e736869656c64732e696f2f707970692f707976657273696f6e732f73766770617468746f6f6c732e737667](https://camo.githubusercontent.com/a57377fc3c24869a7d80bc2d158eae38e42f6177e79de9a02468d7cee4307a2d/68747470733a2f2f696d672e736869656c64732e696f2f707970692f707976657273696f6e732f73766770617468746f6f6c732e737667)
- [https://pypi.org/project/svgpathtools/](https://pypi.org/project/svgpathtools/)
- [https://pypistats.org/packages/svgpathtools](https://pypistats.org/packages/svgpathtools)
- [the svg.path (v2.0) module](https://github.com/regebro/svg.path)
- [official SVG specifications](http://www.w3.org/TR/SVG/paths.html)
- [defined similarly](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#General_definition)
- [Example available here](https://github.com/mathandy/svgpathtools/blob/master/examples/compute-many-points-quickly-using-numpy-arrays.py)
- [offset curve](https://en.wikipedia.org/wiki/Parallel_curve)
- Releases - source: `/mathandy/svgpathtools/releases`
- Used by - source: `/mathandy/svgpathtools/network/dependents`
- Contributors - source: `/mathandy/svgpathtools/graphs/contributors`
- /SebKuzminsky - source: `/SebKuzminsky`
- /claude - source: `/claude`
- /FlyingSamson - source: `/FlyingSamson`
- /kennyweiss - source: `/kennyweiss`
- /tatarize - source: `/tatarize`
- /derVedro - source: `/derVedro`
- /jpcofr - source: `/jpcofr`
- /elenzil - source: `/elenzil`
- /mxgrey - source: `/mxgrey`
- /andersgb - source: `/andersgb`
- /bouhek - source: `/bouhek`
- /abey79 - source: `/abey79`
- /Erfouni - source: `/Erfouni`
- Python 100% - source: `/mathandy/svgpathtools/search?l=python`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
