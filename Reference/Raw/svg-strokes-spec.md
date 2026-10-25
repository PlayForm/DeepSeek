[↑ Jump to Table of Contents](https://svgwg.org/specs/strokes/#toc)[→ Pop Out Sidebar](https://svgwg.org/specs/strokes/#toc)

# SVG Strokes

## W3C Editor’s Draft _14 September 2025_

This version: <https://svgwg.org/specs/strokes/>

Latest version: <http://www.w3.org/TR/svg-strokes/>

GitHub repository: <https://github.com/w3c/svgwg/tree/main/specs/strokes>

Feedback: www-svg@w3.org with subject line “`[svg-strokes] …  _message topic_ …`”
([archive](https://lists.w3.org/Archives/Public/www-svg/))

Editors: Cameron McCormack, Mozilla Corporation <cam@mcc.id.au> Dirk Schulze, Adobe Systems
<dschulze@adobe.com> [Copyright](http://www.w3.org/Consortium/Legal/ipr-notice#Copyright) © 2025 ®
(, [ERCIM](http://www.ercim.eu/), [Keio](http://www.keio.ac.jp/),
[Beihang](http://ev.buaa.edu.cn/)). W3C
[liability](http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer),
[trademark](http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks) and
[document use](http://www.w3.org/Consortium/Legal/copyright-documents) rules apply.

## Abstract

This specification defines properties for controlling the appearance of strokes painted for SVG
shapes.

## Status of This Document

_This section describes the status of this document at the time of its publication. Other documents
may supersede this document. A list of current W3C publications and the latest revision of this
technical report can be found in the[W3C technical reports index](https://www.w3.org/TR/) at
https://www.w3.org/TR/_. This document is the 14 September 2025 **Editor’s Draft** of SVG Strokes.
The purpose of this specification is to define a number of improved SVG stroking features. This
specification is an early draft that largely contains features that were dropped during the
development of SVG 2. In the future, this specification will supercede the
[SVG 2 Stroke definition](https://www.w3.org/TR/SVG2/painting.html#StrokeProperties), however at
this time the [SVG 2 Stroke definition](https://www.w3.org/TR/SVG2/painting.html#StrokeProperties)
must be considered the normative definition. Comments on this Editor’s Draft are welcome. Comments
can be sent to www-svg@w3.org, the public email list for issues related to vector graphics on the
Web. This list is [archived](https://lists.w3.org/Archives/Public/www-svg/) and senders must agree
to have their message publicly archived from their first posting. To subscribe send an email to
www-svg-request@w3.org with the word `subscribe` in the subject line. This document has been
produced by the [W3C SVG Working Group](https://www.w3.org/Graphics/SVG/WG) as part of the
[Graphics Activity](https://www.w3.org/Graphics/Activity) within the
[W3C Interaction Domain](https://www.w3.org/Interaction/). The goals of the W3C SVG Working Group
are discussed in the [W3C SVG Charter](https://www.w3.org/Graphics/SVG/svg-2019.html). The W3C SVG
Working Group maintains a public Web page, <https://www.w3.org/Graphics/SVG/>, that contains further
background information. The authors of this document are the SVG Working Group participants. This
document was produced by a group operating under the
[5 February 2004 W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/). W3C
maintains a [public list of any patent disclosures](https://www.w3.org/2004/01/pp-impl/19480/status)
made in connection with the deliverables of the group; that page also includes instructions for
disclosing a patent. An individual who has actual knowledge of a patent which the individual
believes contains
[Essential Claim(s)](https://www.w3.org/Consortium/Patent-Policy-20040205/#def-essential) must
disclose the information in accordance with
[section 6 of the W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/#sec-Disclosure).
Publication as a Editor’s Draft does not imply endorsement by the W3C Membership. This is a draft
document and may be updated, replaced or obsoleted by other documents at any time. It is
inappropriate to cite this document as other than work in progress. A list of current W3C
Recommendations and other technical documents can be found at <https://www.w3.org/TR/>. W3C
publications may be updated, replaced, or obsoleted by other documents at any time. This document is
governed by the [1 August 2014 W3C Process Document](https://www.w3.org/2014/Process-20140801/).

## 1. Introduction

_This section is non-normative._ SVG graphical elements that define a shape – elements,
[basic shapes](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement), and
[text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) – are
rendered by being **filled** , which is painting the interior of the object, and **stroked** , which
is painting along the outline of the object. This specification describes how SVG graphical elements
are stroked, by [defining a number of properties](https://svgwg.org/specs/strokes/#StrokeProperties)
that control the appearance of a stroke and by
[specifying the shape of an element's stroke](https://svgwg.org/specs/strokes/#StrokeShape). SVG 2
supports multiple strokes, which we will need updated wording to handle in this specification.

### 1.1. Module interactions

This module replaces and extends the definition of stroking properties in SVG 2 (the "Stroke
properties" section in the "Painting: Filling, Stroking and Marker Symbols" chapter).
[[SVG2]](https://svgwg.org/specs/strokes/#ref-SVG2)

## 2. Stroke properties

In this section, we define a number of properties that allow the author to control different aspects
of a stroke, including its paint, thickness, position, use of dashing, and joining and capping of
path segments. In all cases, all stroking properties which are affected by directionality, such as
those having to do with dash patterns, must be rendered such that the stroke operation starts at the
same point at which the graphics element starts. In particular, for elements, the start of the path
is the first point of the initial "moveto" command. For stroking properties such as dash patterns
whose computations are dependent on progress along the outline of the graphics element, distance
calculations are required to utilize the SVG user agent's standard
[Distance along a path](https://svgwg.org/svg2-draft/paths.html#DistanceAlongAPath) algorithms. When
stroking is performed using a complex paint server, such as a gradient or a pattern, the stroke
operation must be identical to the result that would have occurred if the geometric shape defined by
the geometry of the current graphics element and its associated stroking properties were converted
to an equivalent element and then filled using the given paint server.

### 2.1. Specifying stroke paint: the ‘stroke’ property

| Name:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | stroke                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Initial:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | none                                                                                                                                                                       |
| Applies to:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement)             |
| Inherited:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | yes                                                                                                                                                                        |
| Percentages:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | N/A                                                                                                                                                                        |
| Media:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | visual                                                                                                                                                                     |
| Computed value:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | as specified, but with [<color>](https://www.w3.org/TR/css3-values/#colors) values computed and [<url>](https://www.w3.org/TR/css3-values/#url-value) values made absolute |
| yes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| The [stroke](https://svgwg.org/specs/strokes/#StrokeProperty) property paints along the outline of the given graphical element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A subpath (see [Paths](https://svgwg.org/svg2-draft/paths.html)) consisting of a single [moveto](https://svgwg.org/svg2-draft/paths.html#PathDataMovetoCommands) shall not be stroked. Any zero length subpath shall not be stroked if the [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) property has a value of butt but shall be stroked if the [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) property has a value of round or square, producing respectively a circle or a square centered at the given point. Examples of zero length subpaths include 'M 10,10 L 10,10', 'M 20,20 h 0', 'M 30,30 z' and 'M 40,40 c 0,0 0,0 0,0'. |
| The above paragraph should be redundant with the stroke shape computation requirements below. In this section, we should phrase the requirements descriptively rather than normatively.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| SVG 2 Requirement:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Include a way to specify stroke position.                                                                                                                                  |
| ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ---                                                                                                                                                                        |
| Resolution:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [SVG 2 shall include a way to specify stroke position.](https://www.w3.org/2011/10/28-svg-irc#T18-09-48)                                                                   |
| Purpose:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | To allow a stroke to be inside or outside the path.                                                                                                                        |
| Owner:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Cameron ([ACTION-3162](https://www.w3.org/Graphics/SVG/WG/track/actions/3162))                                                                                             |
| Note:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | See [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_position).                                                                                    |

### 2.2. Specifying stroke alignment: the ‘stroke-alignment’ property

| Name:                                                                                      | stroke-alignment                                                                                                                                               |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                     | center                                                                                                                                                         | inner | outer |
| Initial:                                                                                   | center                                                                                                                                                         |
| Applies to:                                                                                | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                 | yes                                                                                                                                                            |
| Percentages:                                                                               | N/A                                                                                                                                                            |
| Media:                                                                                     | visual                                                                                                                                                         |
| Computed value:                                                                            | as specified                                                                                                                                                   |
| yes                                                                                        |
| This property allows the author to align a stroke along the outline of the current object. |

center

This value indicates that the stroke for each subpath is positioned along the outline of the current
stroke. The extends of the stroke increase to both sides of the outline accordingly dependent on the
[stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty).

inner

This value indicates that the stroke area is defined by the outline of each subpath of the current
object and the computed value of the
[stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) property as offset orthogonal
from the outline into the fill area of each subpath. The
[stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) property must be ignored.

outer

This value indicates that the stroke area is defined by the outline of each subpath of the current
object and the computed value of the
[stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) property as offset orthogonal
from the outline away from the fill area of each subpath. The fill area of the current object is
defined by the [fill-rule](https://svgwg.org/svg2-draft/painting.html#FillRuleProperty) property.
Does that require updates on the stroke computation? How does this apply to open path segments? One
suggestion is to alias 'outside' to 'left' and 'inside' to 'right' for open paths. How are end caps
handled? PART OF ABOVE ISSUE: From top to bottom: 1. Stroke with 'stroke-alignment' 'center'
value. 2. Fill region. 3. Stroke with 'stroke-alignment' 'inside' value per spec (? stroke only
paints inside fill region). 4. Stroke with 'stroke-alignment' 'outside' value (implemented by
blocking out fill region). 5. Stroke with 'stroke-alignment' 'inside' value, alternative
interpretation. 6. Stroke with 'stroke-alignment' 'outside' value per spec (?). 7. Stroke with
'stroke-alignment' alternative 'left' value; pink shows round line-cap. How does this apply to paths
with loops? Is the region inside the red circle in the below figure part of the stroked (as shown)?
Are internal edges stroked if the fill rule is 'nonzero'; if so how? (Shown without stroking below.)
PART OF ABOVE ISSUE: Top row: Normal stroke. Stroke left. Stroke right. Middle row: Fill rule
'nonzero', no stroke. Stroke outside. Stroke inside. Bottom row: Fill rule 'evenodd', no stroke.
Stroke outside. Stroke inside. How are dashes handled? Are they based on original path? PART OF
ABOVE ISSUE: From left to right: 1. Normal dash pattern. 2. Dash pattern based on dash pattern or
original path. Note light-gray region which is from "inside" dash part (simply using clipping path
does not yield proper result). 3. Dash pattern based on center of offset path. Light gray represents
dash pattern based on center of inset path.

| SVG 2 Requirement: | Allow more author control over positions of dashes.                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Resolution:        | [SVG 2 shall allow more author control over positions of dashes.](https://www.w3.org/2011/10/28-svg-irc#T18-17-51) |
| Purpose:           | To allow things like aligning dashes at rectangle corners or along paths, needed for mapping.                      |
| Owner:             | Cameron ([ACTION-3163](https://www.w3.org/Graphics/SVG/WG/track/actions/3163))                                     |
| Note:              | See [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_dash_adjustment).                     |

### 2.3. Stroke paint opacity: the ‘stroke-opacity’ property

| Name:                                                                                                                                                                                                                                                                                                                                                                                                                                         | stroke-opacity                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Initial:                                                                                                                                                                                                                                                                                                                                                                                                                                      | 1                                                                                                                                                              |
| Applies to:                                                                                                                                                                                                                                                                                                                                                                                                                                   | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                                                                                                                                                                                                                                                    | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                                                                                                                                                                                                                                                  | N/A                                                                                                                                                            |
| Media:                                                                                                                                                                                                                                                                                                                                                                                                                                        | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                                                                                                                                                                                                                                                               | as specified, but clamped to the range [0, 1]                                                                                                                  |
| yes                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| The [stroke-opacity](https://svgwg.org/specs/strokes/#StrokeOpacityProperty) property specifies the opacity of the painting operation used to stroke the current object. (See [Painting shapes and text](https://svgwg.org/svg2-draft/render.html#PaintingShapesAndText).) As with [fill-opacity](https://svgwg.org/svg2-draft/painting.html#FillOpacityProperty), a value of 0 means fully transparent, and a value of 1 means fully opaque. |
| See also the [opacity](https://svgwg.org/svg2-draft/render.html#ObjectAndGroupOpacityProperties) property, which specifies group opacity.                                                                                                                                                                                                                                                                                                     |

### 2.4. Stroke width: the ‘stroke-width’ property

| Name:                                                                                                                                                                                                        | stroke-width                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                       |
| Initial:                                                                                                                                                                                                     | 1px                                                                                                                                                            |
| Applies to:                                                                                                                                                                                                  | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                   | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                 | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units))                                                        |
| Media:                                                                                                                                                                                                       | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                              | absolute length or percentage                                                                                                                                  |
| yes                                                                                                                                                                                                          |
| This property specifies the width of the stroke on the current object. A zero value causes no stroke to be painted. A negative value is [invalid](https://svgwg.org/svg2-draft/types.html#TermInvalidValue). |

### 2.5. Drawing caps at the ends of strokes: the ‘stroke-linecap’ property

| Name:                                                                                                                                                                               | stroke-linecap                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                              | butt                                                                                                                                                           | round | square |
| Initial:                                                                                                                                                                            | butt                                                                                                                                                           |
| Applies to:                                                                                                                                                                         | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                          | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                        | N/A                                                                                                                                                            |
| Media:                                                                                                                                                                              | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                     | as specified                                                                                                                                                   |
| yes                                                                                                                                                                                 |
| [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) specifies the shape to be used at the end of open subpaths when they are stroked. The possible values are: |

butt This value indicates that the stroke for each subpath does not extend beyond its two endpoints.
A zero length subpath will therefore not have any stroke.

round

This value indicates that at each end of each subpath, the shape representing the stroke will be
extended by a half circle with a radius equal to the stroke width. If a subpath has zero length,
then the resulting effect is that the stroke for that subpath consists solely of a full circle
centered at the subpath's point.

square

This value indicates that at the end of each subpath, the shape representing the stroke will be
extended by a rectangle with the same width as the stroke width and whose length is half of the
stroke width. If a subpath has zero length, then the resulting effect is that the stroke for that
subpath consists solely of a square with side length equal to the stroke width, centered at the
subpath's point, and oriented such that two of its sides are parallel to the effective tangent at
that subpath's point. See
[‘path’ element implementation notes](https://svgwg.org/svg2-draft/paths.html#PathElementImplementationNotes)
for details on how to determine the tangent at a zero-length subpath. The three types of line caps.
See the definition of the [cap shape](https://svgwg.org/specs/strokes/#TermCapShape) below for a
more precise description of the shape a line cap will have.

### 2.6. Controlling line joins: the ‘stroke-linejoin’ and ‘stroke-miterlimit’ properties

| Name:                                                                                                                                                                                                                                                                                                     | stroke-linejoin                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                                                    | miter                                                                                                                                                          | miter-clip | round | bevel | arcs |
| Initial:                                                                                                                                                                                                                                                                                                  | miter                                                                                                                                                          |
| Applies to:                                                                                                                                                                                                                                                                                               | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                                                                                                                | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                                                                                                              | N/A                                                                                                                                                            |
| Media:                                                                                                                                                                                                                                                                                                    | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                                                                                                                           | as specified                                                                                                                                                   |
| yes                                                                                                                                                                                                                                                                                                       |
| [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) specifies the shape to be used at the corners of paths or basic shapes when they are stroked. For further details see the [path implementation notes](https://svgwg.org/svg2-draft/paths.html#PathElementImplementationNotes). |

miter This value indicates that a sharp corner is to be used to join path segments. The corner is
formed by extending the outer edges of the stroke at the tangents of the path segments until they
intersect. If the [stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) is
exceeded, the line join falls back to bevel (see below).

miter-clip This value is the same as miter but if the
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) is exceeded, the
miter is clipped at a miter length equal to the
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) value multiplied by
the stroke width (see below).

round This value indicates that a round corner is to be used to join path segments. The corner is a
circular sector centered on the join point.

bevel This value indicates that a bevelled corner is to be used to join path segments. The bevel
shape is a triangle that fills the area between the two stroked segments.

arcs This value indicates that an arcs corner is to be used to join path segments. The arcs shape is
formed by extending the outer edges of the stroke at the join point with arcs that have the same
curvature as the outer edges at the join point. The miter-clip and arcs values are new in SVG 2. The
miter-clip value offers a more consistent presentation for a path with multiple joins as well as
better behavior when a path is animated. The arcs value provides a better looking join when the path
segments at the join are curved. Adding 'arcs' line join was resolved at the
[Rigi Kaltbad group meeting](https://www.w3.org/2012/09/19-svg-minutes.html#item08). Adding
'miter-clip' line join was resolved at the
[Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item03). Four types of
line joins.

| Name:                                                                                                                                                                                                                                                                                                                                                                                                                      | stroke-miterlimit                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Initial:                                                                                                                                                                                                                                                                                                                                                                                                                   | 4                                                                                                                                                              |
| Applies to:                                                                                                                                                                                                                                                                                                                                                                                                                | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                                                                                                                                                                                                                                 | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                                                                                                                                                                                                                               | N/A                                                                                                                                                            |
| Media:                                                                                                                                                                                                                                                                                                                                                                                                                     | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                                                                                                                                                                                                                                            | as specified                                                                                                                                                   |
| yes                                                                                                                                                                                                                                                                                                                                                                                                                        |
| When two line segments meet at a sharp angle and a value of miter, miter-clip, or arcs has been specified for [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty), it is possible for the join to extend far beyond the thickness of the line stroking the path. The [stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) imposes a limit on the extent of the line join. |

<number>
     The limit on the extent of a miter, miter-clip, or arcs line join as a multiple of the [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) value. The value of [stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) must be a [<number>](https://www.w3.org/TR/css3-values/#numbers) greater than or equal to 1. Any other value is an error (see [Error processing](https://svgwg.org/svg2-draft/implnote.html#ErrorProcessing)). 
For the miter or the miter-clip values, given the angle θ between the segments in local coordinate system, the miter length is calculated by: 
‘stroke-width’miter length=‘stroke-width’sin⁡

```
miter length = stroke-width / sin(theta / 2)
```

If the miter length divided by the stroke width exceeds the
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) then for the value:

miter the join is converted to a bevel;

miter-clip the miter is clipped by a line perpendicular to the line bisecting the angle between the
two path segments at a distance of the value of miter length from the intersection of the two path
segments. Effect on line join when
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) is exceeded. The
olive-green dashed lines shows the position of the miter limit when the
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) value is 1.5. The
gray regions shows what the joins would look like without a miter limit. For the arcs value, the
_miter length_ is calculated along a circular arc that is tangent to the line bisecting the angle
between the two segments at the point the two segments intersect and passes through the end point of
the join. The line join is clipped, if necessary, by a line perpendicular to this arc at a _miter
length_ equal to the value of the
[stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) value multiplied by
the stroke width. The effect of 'stroke-miterlimit' on an 'arcs' line join was resolved at
[Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item12). See the
definition of the [line join shape](https://svgwg.org/specs/strokes/#TermLineJoinShape) below for a
more precise description of the shape a line join will have.

### 2.7. Dashing strokes: the ‘stroke-dasharray’, ‘stroke-dashoffset’, ‘stroke-dashcorner’ and ‘stroke-dashadjust’ properties

| Name:                                                                                                                                                                        | stroke-dasharray                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                       | none                                                                                                                                                           | [<dasharray>](https://svgwg.org/specs/strokes/#DataTypeDasharray) |
| Initial:                                                                                                                                                                     | none                                                                                                                                                           |
| Applies to:                                                                                                                                                                  | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                   | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                 | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units))                                                        |
| Media:                                                                                                                                                                       | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                              | absolute lengths or percentages for <dasharray>, or keyword specified                                                                                          |
| yes ([non-additive](https://svgwg.org/specs/animations/#AdditionAttributes))                                                                                                 |
| where:                                                                                                                                                                       |
| <dasharray> = [ [<length>](https://www.w3.org/TR/css3-values/#lengths)                                                                                                       | [<percentage>](https://www.w3.org/TR/css3-values/#percentages)                                                                                                 | [<number>](https://www.w3.org/TR/css3-values/#numbers) ]#*        |
| The [stroke-dasharray](https://svgwg.org/specs/strokes/#StrokeDasharrayProperty) property controls the pattern of dashes and gaps used to form the shape of a path's stroke. |

none Indicates that no dashing is used.

<dasharray>

Specifies a dashing pattern to use. A
[<dasharray>](https://svgwg.org/specs/strokes/#DataTypeDasharray) is a list of comma and/or white
space separated lengths and percentages. Each value specifies a length along the path for which the
stroke is to be painted (a _dash_) and not painted (a _gap_). Every second value in the list
beginning with the first one specifies the length of a dash, and every other value specifies the
length of a gap between the dashes. If the list has an odd number of values, then it is repeated to
yield an even number of values. (Thus, the rendering behavior of stroke-dasharray: 5,3,2 is
equivalent to stroke-dasharray: 5,3,2,5,3,2.) The resulting even-length dashing pattern is repeated
along each subpath. The dashing pattern is reset and begins again at the start of each subpath. If
any value in the list is negative, the
[<dasharray>](https://svgwg.org/specs/strokes/#DataTypeDasharray) value is
[invalid](https://svgwg.org/svg2-draft/types.html#TermInvalidValue). If all of the values in the
list are zero, then the stroke is rendered as if a value of none were specified. A dashed stroke.
The dashing pattern is 20,10. The red line shows the actual path that is stroked.

| Name:                                                                                                                                                                                                                                                                               | stroke-dashoffset                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                              |
| Initial:                                                                                                                                                                                                                                                                            | 0                                                                                                                                                              |
| Applies to:                                                                                                                                                                                                                                                                         | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                                                                                          | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                                                                                        | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units))                                                        |
| Media:                                                                                                                                                                                                                                                                              | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                                                                                                     | absolute length or percentage                                                                                                                                  |
| yes                                                                                                                                                                                                                                                                                 |
| The [stroke-dashoffset](https://svgwg.org/specs/strokes/#StrokeDashoffsetProperty) property specifies the distance into the repeated dash pattern to start the stroke dashing at the beginning of the path. If the value is negative, then the effect is the same as dash offset d: |
| ‘stroke-dashoffset’d=s-‘stroke-dashoffset’mods                                                                                                                                                                                                                                      |

```
d = s - (abs(stroke-dashoffset) mod s)
```

where s is the sum of the dash array values. A dashed stroke with a non-zero dash offset. The
dashing pattern is 20,10 and the dash offset is 15. The red line shows the actual path that is
stroked. See the definition of [dash positions](https://svgwg.org/specs/strokes/#TermDashPositions)
below for a more precise description of positions along a path that dashes will be placed.

| Name:                                                                                                                                                                                                                                                                                                                                                                      | stroke-dashcorner                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value:                                                                                                                                                                                                                                                                                                                                                                     | none                                                                                                                                                           | [<length>](https://www.w3.org/TR/css3-values/#lengths) |
| Initial:                                                                                                                                                                                                                                                                                                                                                                   | none                                                                                                                                                           |
| Applies to:                                                                                                                                                                                                                                                                                                                                                                | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited:                                                                                                                                                                                                                                                                                                                                                                 | yes                                                                                                                                                            |
| Percentages:                                                                                                                                                                                                                                                                                                                                                               | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units))                                                        |
| Media:                                                                                                                                                                                                                                                                                                                                                                     | visual                                                                                                                                                         |
| Computed value:                                                                                                                                                                                                                                                                                                                                                            | absolute length or keyword specified                                                                                                                           |
| yes                                                                                                                                                                                                                                                                                                                                                                        |
| This is a new feature, added to allow better control of dashing at the vertices of a shape, such as at the four corners of a rectangle.                                                                                                                                                                                                                                    |
| The [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) property controls whether a dash is always painted at the vertices of a stroked shape. The points at which a dash corner is painted include the start and end points of every segment within the shape's [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath). |
| This will not help with placing a corner dash on a with rounded corners, as they will also be placed at the points between the arcs forming the rounded corners and the straight line segments.                                                                                                                                                                            |

none Indicates that no dashes are required to be painted at the vertices of the shape.

<length>
    Specifies that a dash of the given length is to be painted at each vertex of the shape. For an open shape, the first corner dash is positioned so that it begins at the start of the path, and the last corner dash so that it ends at the end of the path. The other corner dashes of an open shape, and all corner dashes of a closed shape, are positioned so that they are centered on their vertex.
Should the corner dash at the first and last vertex of an open shape be half the length of the others? Should this be author controllable?
Should there be a way to specify a padding, so that any dash pattern between the corner dashes does not not run up against them?
The [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) property also controls how the dash pattern given by [stroke-dasharray](https://svgwg.org/specs/strokes/#StrokeDasharrayProperty) is repeated. When none is used, the dash pattern is repeated over the entire length of the subpath. When any other value is used, the dash pattern is repeated separately on each path segment in the space between the segment's two adjacent corner dashes.
Need to define what happens when corner dashes would overlap.
A rectangle painted with a dashed stroke and with corner dashes. The dashing pattern is 0,8 and the corner dash length is 32.  
| Name:  | stroke-dashadjust  |  
| --- | --- |  
| Value:  | none | [stretch | compress] [dashes | gaps]?  |  
| Initial:  | none  |  
| Applies to:  |  [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement)  |  
| Inherited:  | yes  |  
| Percentages:  | N/A  |  
| Media:  | visual  |  
| Computed value:  | as specified  |  
| yes  |  
This is a new feature, added to allow for more visually pleasing stroke dash patterns.
The [stroke-dashadjust](https://svgwg.org/specs/strokes/#StrokeDashadjustProperty) property specifies whether and how a stroke's dash pattern will be adjusted so that it is repeated a whole number of times along an element's subpaths.

none Indicates that no adjustment of the dash pattern takes place.

stretch Indicates that when the dash pattern does not fit into a subpath a whole number times, the
dashes or gaps (or both) will be lengthened so that it does.

compress Indicates that when the dash pattern does not fit into a subpath a whole number times, the
dashes or gaps (or both) will be shortened so that it does.

dashes Indicates that when a dash pattern is to be stretched or compressed, only the length of the
dashes will be adjusted; the gaps will remain as specified.

gaps Indicates that when a dash pattern is to be stretched or compressed, only the length of the
gaps will be adjusted; the dashes will remain as specified. Do we need to be able to choose to
stretch or compress? If neither the dashes or gaps keyword is given, both the dashes and the gaps
will be adjusted. The target length that a dash pattern will be adjusted to depends on the value of
the [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) property:

1. If [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) is none, then
   the dash pattern will be adjusted to fit within the length of the subpath a whole number of
   times.
2. If [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) has any other
   value, including a zero length, then the dash pattern will be adjusted differently for each
   segment of the subpath such that it fits between the two corner dashes at the ends of the segment
   a whole number of times.

The adjustment of dash and gap length in a dash pattern is done by scaling the lengths by a factor,
which is the number closest to 1 that will result in the dash pattern fitting in the target length a
whole number of times. If stretch is used, the factor is a number between 1 and 2, while if compress
is used, the factor is a number between 0 and 1. If there is no appropriate factor that can be
chosen – for example if stretch is used but the dash pattern is longer than the target length, or if
gaps was specified but all of the gaps in the dash pattern are zero – then no adjustment is
performed. Should there be an auto value which means round to the closest number of whole
repetitions? Does the compression or expansion of the dashes and gaps happen after an odd-lengthed
dash array is doubled so that it has an even number of entries or before? Probably after. Do we want
to allow control of whether the stroke ends with a dash or with a gap? For a closed path, you
probably want a gap at the end, while for a non-closed path, a dash at the end is probably better.
Omit control for this, but just do it automatically based on whether the path is closed? The same
dash stroke used on three different paths, adjusted to fit a whole number of times on each.

## 3. Computing the shape of the stroke

| SVG 2 Requirement:                                                                                                                                                                                                                                                                                                                         | Specify stroke dashing more precisely.                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Resolution:                                                                                                                                                                                                                                                                                                                                | [SVG 2 shall specify stroke dashing more precisely.](https://www.w3.org/2011/10/28-svg-irc#T18-14-14) |
| Purpose:                                                                                                                                                                                                                                                                                                                                   | To define dash starting point on basic shapes and path segments.                                      |
| Owner:                                                                                                                                                                                                                                                                                                                                     | Cameron (no action)                                                                                   |
| Something in this section needs to reference so that dash lengths are in the author's path length space.                                                                                                                                                                                                                                   |
| This section doesn't handle [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) and [stroke-dashadjust](https://svgwg.org/specs/strokes/#StrokeDashadjustProperty) yet.                                                                                                                                         |
| The stroke shape of an element is the shape that is filled by the [stroke](https://svgwg.org/specs/strokes/#StrokeProperty) property. The following algorithm describes what the stroke shape of a or [basic shape](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement) is, taking into account the stroking properties above: |
| This should include text elements too, but should we keep stroke dashing on text?                                                                                                                                                                                                                                                          |

1. Let shape be an empty shape.
2. Let path be the [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath) of
   the element.
3. For each subpath of path: 1. Let positions be the
   [dash positions](https://svgwg.org/specs/strokes/#TermDashPositions) for the subpath. 2. For each
   pair <start, end> in positions:
    1. Let dash be the shape that includes, for all distances between start and end along the
       subpath, all points that lie on the line perpendicular to the subpath at that distance and
       which are within distance
       [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) of the point on the
       subpath at that position.
    2. Set dash to be the union of dash and the starting
       [cap shape](https://svgwg.org/specs/strokes/#TermCapShape) for the subpath at position start.
    3. Set dash to be the union of dash and the ending
       [cap shape](https://svgwg.org/specs/strokes/#TermCapShape) for the subpath at position end.
    4. Let index and last be the indexes of the path segments in the subpath at distance start and
       end along the subpath. It does not matter whether any zero length segments are included when
       choosing index and last.
    5. While index < last:
    6. Set dash to be the union of dash and the
       [line join shape](https://svgwg.org/specs/strokes/#TermLineJoinShape) for the subpath at
       segment index index.
    7. Set index to index + 1.
    8. Set shape to be the union of shape and stroke.
4. Return shape.

The dash positions for a given subpath of the
[equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath) of a or
[basic shape](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement) is a sequence of pairs
of values, which represent the starting and ending distance along the subpath for each of the dashes
that form the subpath's stroke. It is determined as follows:

1. Let pathlength be the length of the subpath.
2. Let dashes be the list of values of
   [stroke-dasharray](https://svgwg.org/specs/strokes/#StrokeDasharrayProperty) on the element,
   converted to user units, repeated if necessary so that it has an even number of elements; if the
   property has the value none, then the list has a single value 0.
3. Let count be the number of values in dashes.
4. Let sum be the sum of the values in dashes.
5. If sum = 0, then return a sequence with the single pair <0, pathlength>.
6. Let positions be an empty sequence.
7. Let offset be the value of the
   [stroke-dashoffset](https://svgwg.org/specs/strokes/#StrokeDashoffsetProperty) property on the
   element.
8. If offset is negative, then set offset to sum − abs(offset).
9. Set offset to offset mod sum.
10. Let index be the smallest integer such that sum(dashesi, 0 ≤ i ≤ index) ≥ offset.
11. Let dashlength be min(sum(dashesi, 0 ≤ i ≤ index) − offset, pathlength).
12. If index mod 2 = 0, then append to positions the pair <0, dashlength>.
13. Let position be dashlength.
14. While position < pathlength: 1. Set index to (index + 1) mod count. 2. Let dashlength be
    min(dashesindex, pathlength − position). 3. If index mod 2 = 0, then append to positions the
    pair <position, position + dashlength>. 4. Set position to position + dashlength.
15. Return positions.

The starting and ending cap shapes at a given position along a subpath are determined as follows:

1. If [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) is butt, then return
   an empty shape.
2. Otherwise, if [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) is round,
   then: 1. If this is a starting cap, then return a semicircle of radius
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) positioned such that:
    - Its straight edge is parallel to the line perpendicular to the subpath at distance position
      along it.
    - The midpoint of its straight edge is at the point that is along the subpath at distance
      position.
    - The direction from the midpoint of its arc to the midpoint of its straight edge is the same as
      the direction of the subpath at distance position along it. 2. Otherwise, this is an ending
      cap. Return a semicircle of radius
      [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) positioned such that:
    - Its straight edge is parallel to the line perpendicular to the subpath at distance position
      along it.
    - The midpoint of its straight edge is at the point that is along the subpath at distance
      position.
    - The direction from the midpoint of its straight edge to the midpoint of its arc is the same as
      the direction of the subpath at distance position along it.
3. Otherwise, [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) is square: 1.
   If this is a starting cap, then return a rectangle with side lengths
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) and
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) / 2 positioned such that:
    - Its longer edges, A and B, are parallel to the line perpendicular to the subpath at distance
      position along it.
    - The midpoint of A is at start.
    - The direction from the midpoint of B to the midpoint of A is the same as the direction of the
      subpath at distance position along it. 2. Otherwise, this is an ending cap. Return a rectangle
      with side lengths [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) and
      [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) / 2 positioned such that:
    - Its longer edges, A and B, are parallel to the line perpendicular to the subpath at distance
      position along it.
    - The midpoint of A is at end.
    - The direction from the midpoint of A to the midpoint of B is the same as the direction of the
      subpath at distance position along it.

The three different [stroke-linecap](https://svgwg.org/specs/strokes/#StrokeLinecapProperty) values
used on paths with a single, non-zero length subpath. The white line is the path itself and the
thick gray area is the stroke. On the top row, the green lines indicate the perpendicular to the
tangent at the path endpoints and the pink areas are the caps. The bottom row shows the stroke
without the perpendicular and cap highlighting. The line join shape for a given segment of a subpath
is determined as follows:

1. Let P be the point at the end of the segment.
2. Let A be the line parallel to the tangent at the end of the segment.
3. Let B be the line parallel to the tangent at the start of the following segment.
4. If A and B are the same line, then return an empty shape.
5. Let Aleft and Aright be lines parallel to A at a distance of
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) / 2 to the left and to the
   right of A relative to the subpath direction, respectively.
6. Let Bleft and Bright be lines parallel to B at a distance of
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty) / 2 to the left and to the
   right of B, relative to the subpath direction, respectively.
7. Let P1, P2 and P3 be points determined as follows: 1. If the smaller angle between A and B is on
   the right of these lines, considering the direction of the subpath, then P1 and P2 are the points
   on Aleft and Bleft closest to P, and P3 is the intersection of Aleft and Bleft. 2. Otherwise, P1
   and P2 are the points on Aright and Bright closest to P, and P3 is the intersection of Aright and
   Bright.
8. Let bevel be the triangle formed from the three points P, P1 and P2.
9. If [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) is round, then
   return the union of bevel and a circular sector of radius
   [stroke-width](https://svgwg.org/specs/strokes/#StrokeWidthProperty), centered on P, and which
   has P1 and P2 as the two endpoints of the arc.
10. If [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) is arcs, then find
    the circles that are tangent to the stroke edges at P1 and P2 with the same curvature as the
    edges at those points (see below). If both curvatures are zero fall through to miter-clip.
    Extend the stroke edges using these circles (or a line, in the case of zero curvature). If the
    two circles (or circle and line) do not intersect, fall through to miter-clip. If the two
    circles (or circle and line) intersect, the line join region is defined by the lines that
    connect P with P1 and P2 and the arcs defined by the circles (or arc and line) between the
    closest intersection point to P, and P1 and P2. Next calculate the _miter limit_ as defined in
    the [stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty) section. Clip
    any part of the line join region that extends past the miter limit. Return the resulting region.
    Note that the curvatures are calculated in user-space before any transforms are applied.
11. If [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) is miter or
    miter-clip then the line join region is the union of bevel and the triangle formed from the
    three points P1, P2 and P3.
12. Let θ be the angle between A and B. If 1 / sin(θ / 2) ≤
    [stroke-miterlimit](https://svgwg.org/specs/strokes/#StrokeMiterlimitProperty), then return the
    line join region.
13. If [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) is miter-clip,
    then clip any part of the line join region that extends past the miter limit and return this
    region.
14. Return bevel.

Construction of a round line join shape, shown in pink. The white line is the original path, which
has two segments that come to a point, and the gray region is the stroke. Construction of an arcs
line join shape, shown in pink. The white line is the original path, which has two segments that
come to a point, and the gray region is the stroke. The dashed lines show circles that are tangent
to and have the curvature of the segments at the join. The olive-green circles (concentric with the
dashed circles) define the join shape.

### 3.1. Computing the circles for the arcs 'stroke-linejoin'

The arcs [stroke-linejoin](https://svgwg.org/specs/strokes/#StrokeLinejoinProperty) requires finding
circles that are both tangent to and have the same curvatures as the outer stroke edges at the ends
of path segments. To find one of these circles, first calculate the curvature κ of the path segment
at its end (see below). Next, find the radius of a circle corresponding to this curvature: r = 1/κ.
Increase or decrease the radius by one half of the stroke width to account for the stroke: = r ± ½
stroke-width. The center of the circle will be on a line normal to the path end a distance of away
from the outer stroke edge at the end. For a line: the curvature is infinite. Extend the outer
stroke edge by a line. For an elliptical arc: κ(t)=(sin2⁡t+cos2⁡t

```
$$\kappa(t) = {{r_x r_y}\over{(r_x^2 \sin^2 t + r_y^2 \cos^2 t)^{3/2}}}$$
```

where: t=arctan⁡(tan⁡θ)

```
$$t = \arctan \left( {r_y \over r_x} \tan \theta \right)$$
```

The parameter θ at the beginning or end of an arc segment can be found by using the formulas in the
[Elliptical arc implementation notes](https://svgwg.org/svg2-draft/implnote.html#ArcImplementationNotes).
(Note, some renderers convert elliptical arcs to cubic Béziers prior to rendering so the equations
here may not be needed.) For a quadratic Bézier: κ(0)=(−)×(−)−

```
$$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over|P_1-P_0|^3}$$
```

κ(1)=(−)×(−)−

```
$$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over|P_1-P_0|^3}$$
```

Where κ(0) and κ(1) are the signed curvatures at the start and end of the path segment respectively,
and the P's are the three points that define the quadratic Bézier. For a cubic Bézier: κ(0)=(−)×(−)−

```
$$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over|P_1-P_0|^3}$$
```

κ(1)=(−)×(−)−

```
$$\kappa(1) = {2\over3}{(P_3-P_2)\times((P_1-P_2)+(P_3-P_2))\over|P_3-P_2|^3}$$
```

Where κ(0) and κ(1) are the signed curvatures at the start and end of the path segment respectively,
and the P's are the four points that define the cubic Bézier. Note, if and , or and are degenerate,
the curvature will be infinite and a line should be used in constructing the join.

## 4. References

### 4.1. Normative references

**[RFC2119]**
[Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119), S.
Bradner, March 1997. Available at https://tools.ietf.org/html/rfc2119.

**[SVG2]** [Scalable Vector Graphics (SVG) 2](https://www.w3.org/TR/2015/WD-SVG2-20150409/), N.
Andronikos, T. Bah, A. Bellamy-Royds, B. Birtles, C. Concolato, E. Dahlström, C. Lilley, C.
McCormack, D. Schepers, D. Schulze, R. Schwerdtfeger, S. Takagi, J. Watt, eds. World Wide Web
Consortium, 09 April 2015. This edition of SVG 2 is https://www.w3.org/TR/2015/WD-SVG2-20150409/.
The [latest edition of SVG 2](https://www.w3.org/TR/SVG2/) is available at
https://www.w3.org/TR/SVG2/.

## 5. Changes since SVG 2

- Added the [stroke-alignment](https://svgwg.org/specs/strokes/#StrokeAlignmentProperty),
  [stroke-dashadjust](https://svgwg.org/specs/strokes/#StrokeDashadjustProperty) and
  [stroke-dashcorner](https://svgwg.org/specs/strokes/#StrokeDashcornerProperty) properties.

*[W3C]: World Wide Web Consortium *[MIT]: Massachusetts Institute of Technology *[ERCIM]: European
Research Consortium for Informatics and Mathematics
