# Paths

- [ Previous ](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_shapes)
- [ Next ](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Fills_and_strokes)

The [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path) element is
the most powerful element in the SVG library of
[basic shapes](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_shapes).
It can be used to create lines, curves, arcs, and more. Paths create complex shapes by combining
multiple straight lines or curved lines. Complex shapes composed only of straight lines can be
created as
[`<polyline>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_shapes#polyline)
elements. While `<polyline>` and `<path>` elements can create similar-looking shapes, `<polyline>`
elements require a lot of small straight lines to simulate curves and don't scale well to larger
sizes. A good understanding of paths is important when drawing SVGs. While creating complex paths
using an XML editor or text editor is not recommended, understanding how they work will allow you to
identify and repair display issues in SVGs. The shape of a `<path>` element is defined by one
parameter: [`d`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d). (See more
in
[basic shapes](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_shapes).)
The `d` attribute contains a series of commands and parameters used by those commands. Each of the
commands is instantiated (for example, creating a class, naming and locating it) by a specific
letter. For instance, the "Move to" command is called with the letter `M` — to move to (`10`, `10`)
you would start your command with `M 10 10`. When the parser runs into this letter, it knows it
first needs to move to a point (without drawing a connecting line). All of the commands also come in
two variants. An **uppercase letter** specifies absolute coordinates on the page, and a **lowercase
letter** specifies relative coordinates (e.g., _move 10px up and 7px to the left from the last
point_). Coordinates in the `d` parameter are **always unitless** and hence in the user coordinate
system. Later, we will learn how paths can be transformed to suit other needs.

## [Line commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths#line_commands)

There are five line commands for
[`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path) nodes. The first
command is the "Move To" or `M`, which was described above. It takes at least two parameters,
starting with an `x` and `y` coordinate to move to. If the cursor was already somewhere on the page,
no line is drawn to connect the two positions. The "Move To" command appears at the beginning of
paths to specify where the drawing should start. For example:

```
M x y
(or)
m dx dy

```

More than one coordinate pair can follow a "Move To" command. Only the first pair moves the cursor;
every pair after it draws a line, exactly as though a "Line To" command had been used. So
`M 10 10 90 10 90 90` is equivalent to `M 10 10 L 90 10 L 90 90`. Pairs following `m` draw lines
relative to the current position, in the same way. For example, this path uses a single `M` command
with three coordinate pairs to draw two connected line segments: In the following example there's
only a point at (`10`, `10`). Note, though, that it wouldn't show up if a path was just drawn
normally. For example: There are three commands that draw lines. The most generic is the "Line To"
command, called with `L`. `L` takes two parameters—x and y coordinates—and draws a line from the
current position to a new position.

```
L x y
(or)
l dx dy

```

There are two abbreviated forms for drawing horizontal and vertical lines. `H` draws a horizontal
line, and `V` draws a vertical line. Both commands only take one parameter since they only move in
one direction.

```
H x
(or)
h dx

V y
(or)
v dy

```

An easy place to start is by drawing a shape. We will start with a rectangle (the same type that
could be more easily made with a
[`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect) element). It's
composed of horizontal and vertical lines only. We can shorten the above path declaration a little
bit by using the "Close Path" command, called with `Z`. This command draws a straight line from the
current position back to the first unclosed point (first point after the last `Z` command if there
is one, or the first point in the path otherwise), and closes off the path with a line joint. It is
often placed at the end of a path node, although not always. There is no difference between the
uppercase and lowercase command.

```
Z
(or)
z

```

So our path above could be shortened to: The relative forms of these commands can also be used to
draw the same picture. Relative commands are called by using lowercase letters, and rather than
moving the cursor to an exact coordinate, they move it relative to its last position. For instance,
since our rectangle is 80×80, the `<path>` element could have been written as: The path will move to
point (`10`, `10`) and then move horizontally 80 points to the right, then 80 points down, then 80
points to the left, and then back to the start. In these examples, it would probably be more
intuitive to use the
[`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon) or
[`<polyline>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline)
elements. However, paths are used so often in drawing SVG that developers may be more comfortable
using them instead. There is no real performance penalty or bonus for using one or the other.

## [Curve commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths#curve_commands)

There are three different commands that can be used to create smooth curves. Two of those curves are
[Bézier curves](https://developer.mozilla.org/en-US/docs/Glossary/Bezier_curve), and the third is an
"arc" or part of a circle. You might have already gained practical experience with Bézier curves
using path tools in Inkscape, Illustrator or Photoshop. There are an infinite number of Bézier
curves, but only two are available in `<path>` elements: a cubic one, called with `C`, and a
quadratic one, called with `Q`.

### [Bézier Curves](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths#b%C3%A9zier_curves)

The cubic curve, `C`, is the slightly more complex curve. Cubic Béziers take in two control points
for each point. Therefore, to create a cubic Bézier, three sets of coordinates need to be specified.

```
C x1 y1, x2 y2, x y
(or)
c dx1 dy1, dx2 dy2, dx dy

```

The last set of coordinates here (`x`, `y`) specify where the line should end. The other two are
control points. (`x1`, `y1`) is the control point for the start of the curve, and (`x2`, `y2`) is
the control point for the end. The control points essentially describe the slope of the line
starting at each point. The Bézier function then creates a smooth curve that transfers from the
slope established at the beginning of the line, to the slope at the other end. The example above
creates nine cubic Bézier curves. As the curves move toward the right, the control points become
spread out horizontally. As the curves move downward, they become further separated from the end
points. The thing to note here is that the curve starts in the direction of the first control point,
and then bends so that it arrives along the direction of the second control point. Several Bézier
curves can be strung together to create extended, smooth shapes. Often, the control point on one
side of a point will be a reflection of the control point used on the other side to keep the slope
constant. In this case, a shortcut version of the cubic Bézier can be used, designated by the
command `S` (or `s`).

```
S x2 y2, x y
(or)
s dx2 dy2, dx dy

```

`S` produces the same type of curve as earlier—but if it follows another `S` command or a `C`
command, the first control point is assumed to be a reflection of the one used previously. If the
`S` command doesn't follow another `S` or `C` command, then the current position of the cursor is
used as the first control point. The result is not the same as what the `Q` command would have
produced with the same parameters, but is similar. An example of this syntax is shown below, and in
the figure to the left the specified control points are shown in red, and the inferred control point
in blue. The other type of Bézier curve, the quadratic curve called with `Q`, is actually a simpler
curve than the cubic one. It requires one control point which determines the slope of the curve at
both the start point and the end point. It takes two parameters: the control point and the end point
of the curve. **Note:** The co-ordinate deltas for `q` are both relative to the previous point (that
is, `dx` and `dy` are not relative to `dx1` and `dy1`).

```
Q x1 y1, x y
(or)
q dx1 dy1, dx dy

```

As with the cubic Bézier curve, there is a shortcut for stringing together multiple quadratic
Béziers, called with `T`.

```
T x y
(or)
t dx dy

```

This shortcut looks at the previous control point used and infers a new one from it. This means that
after the first control point, fairly complex shapes can be made by specifying only end points. This
only works if the previous command was a `Q` or a `T` command. If not, then the control point is
assumed to be the same as the previous point, and only lines will be drawn. Both curves produce
similar results, although the cubic one allows greater freedom in exactly what the curve looks like.
Deciding which curve to use is situational and depends on the amount of symmetry the line has.

### [Arcs](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths#arcs)

The other type of curved line that can be created using SVG is the arc, called with the `A` command.
Arcs are sections of circles or ellipses. For a given x-radius and y-radius, there are two ellipses
that can connect any two points (as long as they're within the radius of the circle). Along either
of those circles, there are two possible paths that can be taken to connect the points—so in any
situation, there are four possible arcs available. Because of that, arcs require quite a few
parameters:

```
A rx ry x-axis-rotation large-arc-flag sweep-flag x y
a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy

```

At its start, the arc element takes in two parameters for the x-radius and y-radius. If needed, see
[`<ellipse>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse)s and how
they behave. The final two parameters designate the x and y coordinates to end the stroke. Together,
these four values define the basic structure of the arc. The third parameter describes the rotation
of the arc. This is best explained with an example: The example shows a `<path>` element that goes
diagonally across the page. At its center, two elliptical arcs have been cut out (x radius = `30`, y
radius = `50`). In the first one, the x-axis-rotation has been left at `0`, so the ellipse that the
arc travels around (shown in gray) is oriented straight up and down. For the second arc, though, the
x-axis-rotation is set to `-45` degrees. This rotates the ellipse so that it is aligned with its
minor axis along the path direction, as shown by the second ellipse in the example image. For the
unrotated ellipse in the image above, there are only two different arcs and not four to choose from
because the line drawn from the start and end of the arc goes through the center of the ellipse. In
a slightly modified example the two ellipses that form the four different arcs can be seen: Notice
that each of the blue ellipses are formed by two arcs, depending on traveling clockwise or
counter-clockwise. Each ellipse has one short arc and one long arc. The two ellipses are just mirror
images of each other. They are flipped along the line formed from the start→end points. If the
start→end points are farther than the ellipse's `x` and `y` radius can reach, the ellipse's radii
will be minimally expanded so it could reach the start→end points. The interactive codepen at the
bottom of this page demonstrates this well. To determine if an ellipse's radii are large enough to
require expanding, a system of equations would need to be solved, such as
[this on wolfram alpha](<https://www.wolframalpha.com/input/?i=solve+((110+-+x)%5E2%2F36%5E2)+%2B+((215+-+y)%5E2%2F60%5E2)+%3D+1,+((150.71+-+x)%5E2%2F36%5E2)+%2B+((170.29+-+y)%5E2%2F60%5E2)+%3D+1> "External link (opens in new tab)").
This computation is for the non-rotated ellipse with start→end (`110`, `215`)→(`150.71`, `170.29`).
The solution, (`x`, `y`), is the center of the ellipse(s). The solution will be
[imaginary](<https://www.wolframalpha.com/input/?i=solve+((110+-+x)%5E2%2F30%5E2)+%2B+((215+-+y)%5E2%2F50%5E2)+%3D+1,+((162.55+-+x)%5E2%2F30%5E2)+%2B+((162.45+-+y)%5E2%2F50%5E2)+%3D+1> "External link (opens in new tab)")
if the ellipse's radii are too small. This second computation is for the non-rotated ellipse with
start→end (`110`, `215`)→(`162.55`, `162.45`). The solution has a small imaginary component because
the ellipse was just barely expanded. The four different paths mentioned above are determined by the
next two parameter flags. As mentioned earlier, there are still two possible ellipses for the path
to travel around and two different possible paths on both ellipses, giving four possible paths. The
first parameter is the `large-arc-flag`. It determines if the arc should be greater than or less
than 180 degrees; in the end, this flag determines which direction the arc will travel around a
given circle. The second parameter is the `sweep-flag`. It determines if the arc should begin moving
at positive angles or negative ones, which essentially picks which of the two circles will be
traveled around. The example below shows all four possible combinations, along with the two circles
for each case. Arcs are an easy way to create pieces of circles or ellipses in drawings. For
instance, a pie chart would require a different arc for each piece. If transitioning to SVG from
[`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas), arcs can
be the hardest thing to learn, but are also much more powerful. Complete circles and ellipses are
the only shapes that SVG arcs have trouble drawing. Because the start and end points for any path
going around a circle are the same point, there are an infinite number of circles that could be
chosen, and the actual path is undefined. It's possible to approximate them by making the start and
end points of the path slightly askew, and then connecting them with another path segment. For
example, it's possible to make a circle with an arc for each semi-circle. At that point, it's often
easier to use a real
[`<circle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle) or
[`<ellipse>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse) node
instead. This interactive demo might help understand the concepts behind SVG arcs.

- [ Previous ](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_shapes)
- [ Next ](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Fills_and_strokes)

## Help improve MDN

[Learn how to contribute](https://developer.mozilla.org/en-US/docs/MDN/Community/Getting_started)
This page was last modified on Aug 31, 2026 by
[MDN contributors](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths/contributors.txt).
[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/svg/tutorials/svg_from_scratch/paths/index.md?plain=1 "Folder: en-us/web/svg/tutorials/svg_from_scratch/paths (Opens in a new tab)")
•
[Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FTutorials%2FSVG_from_scratch%2FPaths&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fsvg%2Ftutorials%2Fsvg_from_scratch%2Fpaths%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FTutorials%2FSVG_from_scratch%2FPaths%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fsvg%2Ftutorials%2Fsvg_from_scratch%2Fpaths%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2Fc956b5fc0c588115bc8e5972952fff985d4bd335%0A*+Document+last+modified%3A+2026-08-31T01%3A03%3A55.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")
[MDN](https://developer.mozilla.org/) Your blueprint for a better internet.

- [](https://github.com/mdn/)
- [](https://bsky.app/profile/developer.mozilla.org)
- [](https://x.com/mozdevnet)
- [](https://mastodon.social/@mdn)
- [](https://developer.mozilla.org/en-US/blog/rss.xml)

MDN

- [ About ](https://developer.mozilla.org/en-US/about)
- [ Blog ](https://developer.mozilla.org/en-US/blog/)
- [ Mozilla careers ](https://www.mozilla.org/en-US/careers/listings/)
- [ Advertise with us ](https://developer.mozilla.org/en-US/advertising)
- [ MDN Plus ](https://developer.mozilla.org/en-US/plus)
- [ Product help ](https://support.mozilla.org/products/mdn-plus)

Contribute

- [ MDN Community ](https://developer.mozilla.org/en-US/community)
- [ Community resources ](https://developer.mozilla.org/en-US/docs/MDN/Community)
- [ Writing guidelines ](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines)
- [ MDN Discord ](https://developer.mozilla.org/discord)
- [ MDN on GitHub ](https://github.com/mdn)

Developers

- [ Web technologies ](https://developer.mozilla.org/en-US/docs/Web)
- [ Learn web development ](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [ Guides ](https://developer.mozilla.org/en-US/docs/MDN/Guides)
- [ Tutorials ](https://developer.mozilla.org/en-US/docs/MDN/Tutorials)
- [ Glossary ](https://developer.mozilla.org/en-US/docs/Glossary)
- [ Hacks blog ](https://hacks.mozilla.org/)

[Mozilla](https://www.mozilla.org/)

- [Website Privacy Notice](https://www.mozilla.org/privacy/websites/)
- [Telemetry Settings](https://www.mozilla.org/en-US/privacy/websites/data-preferences/)
- [Legal](https://www.mozilla.org/about/legal/terms/mozilla)
- [Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/)

Portions of this content are ©1998–2026 by individual mozilla.org contributors. Content available
under
[a Creative Commons license](https://developer.mozilla.org/docs/MDN/Writing_guidelines/Attrib_copyright_license).
