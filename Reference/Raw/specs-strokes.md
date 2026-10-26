
[![W3C](https://www.w3.org/Icons/w3c_home)](https://www.w3.org/)

# SVG Strokes

## W3C Editor’s Draft *14 September 2025*

This version:  
<https://svgwg.org/specs/strokes/>

Latest version:  
<http://www.w3.org/TR/svg-strokes/>

GitHub repository:  
<https://github.com/w3c/svgwg/tree/main/specs/strokes>

Feedback:  
<www-svg@w3.org> with subject line “`[svg-strokes] … `*`message topic`*` …`” ([archive](https://lists.w3.org/Archives/Public/www-svg/))

Editors:  
Cameron McCormack, Mozilla Corporation \<<cam@mcc.id.au>\>

Dirk Schulze, Adobe Systems \<<dschulze@adobe.com>\>

[Copyright](http://www.w3.org/Consortium/Legal/ipr-notice#Copyright) © 2025 [<span class="abbr">W3C</span>](http://www.w3.org/)<sup>®</sup> ([<span class="abbr">MIT</span>](http://www.csail.mit.edu/), [<span class="abbr">ERCIM</span>](http://www.ercim.eu/), [Keio](http://www.keio.ac.jp/), [Beihang](http://ev.buaa.edu.cn/)). W3C [liability](http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer), [trademark](http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks) and [document use](http://www.w3.org/Consortium/Legal/copyright-documents) rules apply.

------------------------------------------------------------------------

## Abstract

This specification defines properties for controlling the appearance of strokes painted for SVG shapes.

## Status of This Document

*This section describes the status of this document at the time of its publication. Other documents may supersede this document. A list of current W3C publications and the latest revision of this technical report can be found in the [W3C technical reports index](https://www.w3.org/TR/) at https://www.w3.org/TR/*.

This document is the 14 September 2025 **Editor’s Draft** of SVG Strokes. The purpose of this specification is to define a number of improved SVG stroking features.

This specification is an early draft that largely contains features that were dropped during the development of SVG 2. In the future, this specification will supercede the [SVG 2 Stroke definition](https://www.w3.org/TR/SVG2/painting.html#StrokeProperties), however at this time the [SVG 2 Stroke definition](https://www.w3.org/TR/SVG2/painting.html#StrokeProperties) must be considered the normative definition.

Comments on this Editor’s Draft are welcome. Comments can be sent to <www-svg@w3.org>, the public email list for issues related to vector graphics on the Web. This list is [archived](https://lists.w3.org/Archives/Public/www-svg/) and senders must agree to have their message publicly archived from their first posting. To subscribe send an email to <www-svg-request@w3.org> with the word `subscribe` in the subject line.

This document has been produced by the [W3C SVG Working Group](https://www.w3.org/Graphics/SVG/WG) as part of the [Graphics Activity](https://www.w3.org/Graphics/Activity) within the [W3C Interaction Domain](https://www.w3.org/Interaction/). The goals of the W3C SVG Working Group are discussed in the [W3C SVG Charter](https://www.w3.org/Graphics/SVG/svg-2019.html). The W3C SVG Working Group maintains a public Web page, <https://www.w3.org/Graphics/SVG/>, that contains further background information. The authors of this document are the SVG Working Group participants.

This document was produced by a group operating under the [5 February 2004 W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/). W3C maintains a [public list of any patent disclosures](https://www.w3.org/2004/01/pp-impl/19480/status) made in connection with the deliverables of the group; that page also includes instructions for disclosing a patent. An individual who has actual knowledge of a patent which the individual believes contains [Essential Claim(s)](https://www.w3.org/Consortium/Patent-Policy-20040205/#def-essential) must disclose the information in accordance with [section 6 of the W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/#sec-Disclosure).

Publication as a Editor’s Draft does not imply endorsement by the W3C Membership. This is a draft document and may be updated, replaced or obsoleted by other documents at any time. It is inappropriate to cite this document as other than work in progress.

A list of current W3C Recommendations and other technical documents can be found at <https://www.w3.org/TR/>. W3C publications may be updated, replaced, or obsoleted by other documents at any time.

This document is governed by the [1 August 2014 W3C Process Document](https://www.w3.org/2014/Process-20140801/).

## 1. Introduction[](#intro)

*This section is non-normative.*

SVG graphical elements that define a shape – ‘[path](https://svgwg.org/svg2-draft/paths.html#PathElement)’ elements, [basic shapes](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement), and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) – are rendered by being **filled**, which is painting the interior of the object, and **stroked**, which is painting along the outline of the object.

This specification describes how SVG graphical elements are stroked, by [defining a number of properties](#StrokeProperties) that control the appearance of a stroke and by [specifying the shape of an element's stroke](#StrokeShape).

[](#issue1)SVG 2 supports multiple strokes, which we will need updated wording to handle in this specification.

### 1.1. Module interactions[](#placement)

This module replaces and extends the definition of stroking properties in SVG 2 (the "Stroke properties" section in the "Painting: Filling, Stroking and Marker Symbols" chapter). [\[SVG2\]](#ref-SVG2)

## 2. Stroke properties[](#StrokeProperties)

In this section, we define a number of properties that allow the author to control different aspects of a stroke, including its paint, thickness, position, use of dashing, and joining and capping of path segments.

In all cases, all stroking properties which are affected by directionality, such as those having to do with dash patterns, must be rendered such that the stroke operation starts at the same point at which the graphics element starts. In particular, for ‘[path](https://svgwg.org/svg2-draft/paths.html#PathElement)’ elements, the start of the path is the first point of the initial "moveto" command.

For stroking properties such as dash patterns whose computations are dependent on progress along the outline of the graphics element, distance calculations are required to utilize the SVG user agent's standard [Distance along a path](https://svgwg.org/svg2-draft/paths.html#DistanceAlongAPath) algorithms.

When stroking is performed using a complex paint server, such as a gradient or a pattern, the stroke operation must be identical to the result that would have occurred if the geometric shape defined by the geometry of the current graphics element and its associated stroking properties were converted to an equivalent ‘[path](https://svgwg.org/svg2-draft/paths.html#PathElement)’ element and then filled using the given paint server.

### 2.1. Specifying stroke paint: the ‘stroke’ property[](#SpecifyingStrokePaint)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke</span> |
| Value: | [\<paint\>](https://svgwg.org/svg2-draft/painting.html#SpecifyingPaint) |
| Initial: | none |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified, but with [\<color\>](https://www.w3.org/TR/css3-values/#colors) values computed and [\<url\>](https://www.w3.org/TR/css3-values/#url-value) values made absolute |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

The [stroke](#StrokeProperty) property paints along the outline of the given graphical element.

A subpath (see [Paths](https://svgwg.org/svg2-draft/paths.html)) consisting of a single [moveto](https://svgwg.org/svg2-draft/paths.html#PathDataMovetoCommands) shall not be stroked. Any zero length subpath shall not be stroked if the [stroke-linecap](#StrokeLinecapProperty) property has a value of butt but shall be stroked if the [stroke-linecap](#StrokeLinecapProperty) property has a value of round or square, producing respectively a circle or a square centered at the given point. Examples of zero length subpaths include 'M 10,10 L 10,10', 'M 20,20 h 0', 'M 30,30 z' and 'M 40,40 c 0,0 0,0 0,0'.

[](#issue2)The above paragraph should be redundant with the stroke shape computation requirements below. In this section, we should phrase the requirements descriptively rather than normatively.

|  |  |
|----|----|
| SVG 2 Requirement: | Include a way to specify stroke position. |
| Resolution: | [SVG 2 shall include a way to specify stroke position.](https://www.w3.org/2011/10/28-svg-irc#T18-09-48) |
| Purpose: | To allow a stroke to be inside or outside the path. |
| Owner: | Cameron ([ACTION-3162](https://www.w3.org/Graphics/SVG/WG/track/actions/3162)) |
| Note: | See [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_position). |

### 2.2. Specifying stroke alignment: the ‘stroke-alignment’ property[](#SpecifyingStrokeAlignment)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-alignment</span> |
| Value: | center \| inner \| outer |
| Initial: | center |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

This property allows the author to align a stroke along the outline of the current object.

center  
This value indicates that the stroke for each subpath is positioned along the outline of the current stroke. The extends of the stroke increase to both sides of the outline accordingly dependent on the [stroke-width](#StrokeWidthProperty).

inner  
This value indicates that the stroke area is defined by the outline of each subpath of the current object and the computed value of the [stroke-width](#StrokeWidthProperty) property as offset orthogonal from the outline into the fill area of each subpath.

The [stroke-linejoin](#StrokeLinejoinProperty) property must be ignored.

outer  
This value indicates that the stroke area is defined by the outline of each subpath of the current object and the computed value of the [stroke-width](#StrokeWidthProperty) property as offset orthogonal from the outline away from the fill area of each subpath.

The fill area of the current object is defined by the [fill-rule](https://svgwg.org/svg2-draft/painting.html#FillRuleProperty) property.

[](#issue4)Does that require updates on the stroke computation?

[](#issue5)How does this apply to open path segments? One suggestion is to alias 'outside' to 'left' and 'inside' to 'right' for open paths. How are end caps handled? ![](images/stroke-alignment-openpath.svg)

PART OF ABOVE ISSUE: From top to bottom: 1. Stroke with 'stroke-alignment' 'center' value. 2. Fill region. 3. Stroke with 'stroke-alignment' 'inside' value per spec (? stroke only paints inside fill region). 4. Stroke with 'stroke-alignment' 'outside' value (implemented by blocking out fill region). 5. Stroke with 'stroke-alignment' 'inside' value, alternative interpretation. 6. Stroke with 'stroke-alignment' 'outside' value per spec (?). 7. Stroke with 'stroke-alignment' alternative 'left' value; pink shows round line-cap.

[](#issue6)How does this apply to paths with loops? Is the region inside the red circle in the below figure part of the stroked (as shown)? Are internal edges stroked if the fill rule is 'nonzero'; if so how? (Shown without stroking below.) ![](images/stroke-alignment-loops.svg)

PART OF ABOVE ISSUE: Top row: Normal stroke. Stroke left. Stroke right. Middle row: Fill rule 'nonzero', no stroke. Stroke outside. Stroke inside. Bottom row: Fill rule 'evenodd', no stroke. Stroke outside. Stroke inside.

[](#issue7)How are dashes handled? Are they based on original path? ![](images/stroke-alignment-dashes.svg)

PART OF ABOVE ISSUE: From left to right: 1. Normal dash pattern. 2. Dash pattern based on dash pattern or original path. Note light-gray region which is from “inside” dash part (simply using clipping path does not yield proper result). 3. Dash pattern based on center of offset path. Light gray represents dash pattern based on center of inset path.

|  |  |
|----|----|
| SVG 2 Requirement: | Allow more author control over positions of dashes. |
| Resolution: | [SVG 2 shall allow more author control over positions of dashes.](https://www.w3.org/2011/10/28-svg-irc#T18-17-51) |
| Purpose: | To allow things like aligning dashes at rectangle corners or along paths, needed for mapping. |
| Owner: | Cameron ([ACTION-3163](https://www.w3.org/Graphics/SVG/WG/track/actions/3163)) |
| Note: | See [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_dash_adjustment). |

### 2.3. Stroke paint opacity: the ‘stroke-opacity’ property[](#StrokeOpacity)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-opacity</span> |
| Value: | [\<number\>](https://www.w3.org/TR/css3-values/#numbers) |
| Initial: | 1 |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified, but clamped to the range \[0, 1\] |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

The [stroke-opacity](#StrokeOpacityProperty) property specifies the opacity of the painting operation used to stroke the current object. (See [Painting shapes and text](https://svgwg.org/svg2-draft/render.html#PaintingShapesAndText).) As with [fill-opacity](https://svgwg.org/svg2-draft/painting.html#FillOpacityProperty), a value of 0 means fully transparent, and a value of 1 means fully opaque.

See also the [opacity](https://svgwg.org/svg2-draft/render.html#ObjectAndGroupOpacityProperties) property, which specifies group opacity.

### 2.4. Stroke width: the ‘stroke-width’ property[](#StrokeWidth)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-width</span> |
| Value: | [\<percentage\>](https://www.w3.org/TR/css3-values/#percentages) \| [\<length\>](https://www.w3.org/TR/css3-values/#lengths) |
| Initial: | 1px |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units)) |
| Media: | visual |
| Computed value: | absolute length or percentage |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

This property specifies the width of the stroke on the current object. A zero value causes no stroke to be painted. A negative value is [invalid](https://svgwg.org/svg2-draft/types.html#TermInvalidValue).

### 2.5. Drawing caps at the ends of strokes: the ‘stroke-linecap’ property[](#LineCaps)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-linecap</span> |
| Value: | butt \| round \| square |
| Initial: | butt |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

[stroke-linecap](#StrokeLinecapProperty) specifies the shape to be used at the end of open subpaths when they are stroked. The possible values are:

butt  
This value indicates that the stroke for each subpath does not extend beyond its two endpoints. A zero length subpath will therefore not have any stroke.

round  
This value indicates that at each end of each subpath, the shape representing the stroke will be extended by a half circle with a radius equal to the stroke width. If a subpath has zero length, then the resulting effect is that the stroke for that subpath consists solely of a full circle centered at the subpath's point.

square  
This value indicates that at the end of each subpath, the shape representing the stroke will be extended by a rectangle with the same width as the stroke width and whose length is half of the stroke width. If a subpath has zero length, then the resulting effect is that the stroke for that subpath consists solely of a square with side length equal to the stroke width, centered at the subpath's point, and oriented such that two of its sides are parallel to the effective tangent at that subpath's point. See [‘path’ element implementation notes](https://svgwg.org/svg2-draft/paths.html#PathElementImplementationNotes) for details on how to determine the tangent at a zero-length subpath.

![Image showing three paths, each with a different line cap.](images/linecap.svg)

The three types of line caps.

See the definition of the [cap shape](#TermCapShape) below for a more precise description of the shape a line cap will have.

### 2.6. Controlling line joins: the ‘stroke-linejoin’ and ‘stroke-miterlimit’ properties[](#LineJoin)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-linejoin</span> |
| Value: | miter \| miter-clip \| round \| bevel \| arcs |
| Initial: | miter |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

[stroke-linejoin](#StrokeLinejoinProperty) specifies the shape to be used at the corners of paths or basic shapes when they are stroked. For further details see the [path implementation notes](https://svgwg.org/svg2-draft/paths.html#PathElementImplementationNotes).

miter  
This value indicates that a sharp corner is to be used to join path segments. The corner is formed by extending the outer edges of the stroke at the tangents of the path segments until they intersect. If the [stroke-miterlimit](#StrokeMiterlimitProperty) is exceeded, the line join falls back to bevel (see below).

miter-clip  
This value is the same as miter but if the [stroke-miterlimit](#StrokeMiterlimitProperty) is exceeded, the miter is clipped at a miter length equal to the [stroke-miterlimit](#StrokeMiterlimitProperty) value multiplied by the stroke width (see below).

round  
This value indicates that a round corner is to be used to join path segments. The corner is a circular sector centered on the join point.

bevel  
This value indicates that a bevelled corner is to be used to join path segments. The bevel shape is a triangle that fills the area between the two stroked segments.

arcs  
This value indicates that an arcs corner is to be used to join path segments. The arcs shape is formed by extending the outer edges of the stroke at the join point with arcs that have the same curvature as the outer edges at the join point.

The miter-clip and arcs values are new in SVG 2. The miter-clip value offers a more consistent presentation for a path with multiple joins as well as better behavior when a path is animated. The arcs value provides a better looking join when the path segments at the join are curved.

Adding 'arcs' line join was resolved at the [Rigi Kaltbad group meeting](https://www.w3.org/2012/09/19-svg-minutes.html#item08).

Adding 'miter-clip' line join was resolved at the [Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item03).

![Image showing four paths, each with a different line join.](images/linejoin-four.svg)

Four types of line joins.

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-miterlimit</span> |
| Value: | [\<number\>](https://www.w3.org/TR/css3-values/#numbers) |
| Initial: | 4 |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

When two line segments meet at a sharp angle and a value of miter, miter-clip, or arcs has been specified for [stroke-linejoin](#StrokeLinejoinProperty), it is possible for the join to extend far beyond the thickness of the line stroking the path. The [stroke-miterlimit](#StrokeMiterlimitProperty) imposes a limit on the extent of the line join.

\<number\>  
The limit on the extent of a miter, miter-clip, or arcs line join as a multiple of the [stroke-width](#StrokeWidthProperty) value. The value of [stroke-miterlimit](#StrokeMiterlimitProperty) must be a [\<number\>](https://www.w3.org/TR/css3-values/#numbers) greater than or equal to 1. Any other value is an error (see [Error processing](https://svgwg.org/svg2-draft/implnote.html#ErrorProcessing)).

For the miter or the miter-clip values, given the angle `θ` between the segments in local coordinate system, the miter length is calculated by:

$`{miter\ length} = \frac{‘stroke-width’}{\sin\frac{\theta}{2}}`$

miter length = stroke-width / sin(theta / 2)

If the miter length divided by the stroke width exceeds the [stroke-miterlimit](#StrokeMiterlimitProperty) then for the value:

miter  
the join is converted to a bevel;

miter-clip  
the miter is clipped by a line perpendicular to the line bisecting the angle between the two path segments at a distance of the value of miter length from the intersection of the two path segments.

![Image showing resulting stroke when stroke miter limit is exceeded.](images/miter-limit.svg)

Effect on line join when [stroke-miterlimit](#StrokeMiterlimitProperty) is exceeded. The olive-green dashed lines shows the position of the miter limit when the [stroke-miterlimit](#StrokeMiterlimitProperty) value is 1.5. The gray regions shows what the joins would look like without a miter limit.

For the arcs value, the *miter length* is calculated along a circular arc that is tangent to the line bisecting the angle between the two segments at the point the two segments intersect and passes through the end point of the join. The line join is clipped, if necessary, by a line perpendicular to this arc at a *miter length* equal to the value of the [stroke-miterlimit](#StrokeMiterlimitProperty) value multiplied by the stroke width.

The effect of 'stroke-miterlimit' on an 'arcs' line join was resolved at [Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item12).

See the definition of the [line join shape](#TermLineJoinShape) below for a more precise description of the shape a line join will have.

### 2.7. Dashing strokes: the ‘stroke-dasharray’, ‘stroke-dashoffset’, ‘stroke-dashcorner’ and ‘stroke-dashadjust’ properties[](#StrokeDashing)

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-dasharray</span> |
| Value: | none \| [\<dasharray\>](#DataTypeDasharray) |
| Initial: | none |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units)) |
| Media: | visual |
| Computed value: | absolute lengths or percentages for \<dasharray\>, or keyword specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes ([non-additive](https://svgwg.org/specs/animations/#AdditionAttributes)) |

where:

<span class="dfn">\<dasharray\></span> = \[ [\<length\>](https://www.w3.org/TR/css3-values/#lengths) \| [\<percentage\>](https://www.w3.org/TR/css3-values/#percentages) \| [\<number\>](https://www.w3.org/TR/css3-values/#numbers) \]#\*

The [stroke-dasharray](#StrokeDasharrayProperty) property controls the pattern of dashes and gaps used to form the shape of a path's stroke.

none  
Indicates that no dashing is used.

\<dasharray\>  
Specifies a dashing pattern to use. A [\<dasharray\>](#DataTypeDasharray) is a list of comma and/or white space separated lengths and percentages. Each value specifies a length along the path for which the stroke is to be painted (a *dash*) and not painted (a *gap*). Every second value in the list beginning with the first one specifies the length of a dash, and every other value specifies the length of a gap between the dashes. If the list has an odd number of values, then it is repeated to yield an even number of values. (Thus, the rendering behavior of stroke-dasharray: 5,3,2 is equivalent to stroke-dasharray: 5,3,2,5,3,2.)

The resulting even-length dashing pattern is repeated along each subpath. The dashing pattern is reset and begins again at the start of each subpath.

If any value in the list is negative, the [\<dasharray\>](#DataTypeDasharray) value is [invalid](https://svgwg.org/svg2-draft/types.html#TermInvalidValue). If all of the values in the list are zero, then the stroke is rendered as if a value of none were specified.

![Image showing a thick, dashed stroke.](images/dashes.svg)

A dashed stroke. The dashing pattern is 20,10. The red line shows the actual path that is stroked.

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-dashoffset</span> |
| Value: | [\<length\>](https://www.w3.org/TR/css3-values/#lengths) \| [\<percentage\>](https://www.w3.org/TR/css3-values/#percentages) |
| Initial: | 0 |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units)) |
| Media: | visual |
| Computed value: | absolute length or percentage |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

The [stroke-dashoffset](#StrokeDashoffsetProperty) property specifies the distance into the repeated dash pattern to start the stroke dashing at the beginning of the path. If the value is negative, then the effect is the same as dash offset `d`:

$`d = s - ({‘stroke-dashoffset’})\operatorname{mod}s`$

d = s - (abs(stroke-dashoffset) mod s)

where `s` is the sum of the dash array values.

![Image showing a thick, dashed stroke with a non-zero dash offset.](images/dashoffset.svg)

A dashed stroke with a non-zero dash offset. The dashing pattern is 20,10 and the dash offset is 15. The red line shows the actual path that is stroked.

See the definition of [dash positions](#TermDashPositions) below for a more precise description of positions along a path that dashes will be placed.

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-dashcorner</span> |
| Value: | none \| [\<length\>](https://www.w3.org/TR/css3-values/#lengths) |
| Initial: | none |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | refer to the size of the current viewport (see [Units](https://svgwg.org/svg2-draft/coords.html#Units)) |
| Media: | visual |
| Computed value: | absolute length or keyword specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

This is a new feature, added to allow better control of dashing at the vertices of a shape, such as at the four corners of a rectangle.

The [stroke-dashcorner](#StrokeDashcornerProperty) property controls whether a dash is always painted at the vertices of a stroked shape. The points at which a dash corner is painted include the start and end points of every segment within the shape's [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath).

[](#issue8)This will not help with placing a corner dash on a ‘[rect](https://svgwg.org/svg2-draft/shapes.html#RectElement)’ with rounded corners, as they will also be placed at the points between the arcs forming the rounded corners and the straight line segments.

none  
Indicates that no dashes are required to be painted at the vertices of the shape.

\<length\>  
Specifies that a dash of the given length is to be painted at each vertex of the shape. For an open shape, the first corner dash is positioned so that it begins at the start of the path, and the last corner dash so that it ends at the end of the path. The other corner dashes of an open shape, and all corner dashes of a closed shape, are positioned so that they are centered on their vertex.

[](#issue9)Should the corner dash at the first and last vertex of an open shape be half the length of the others? Should this be author controllable?

[](#issue10)Should there be a way to specify a padding, so that any dash pattern between the corner dashes does not not run up against them?

The [stroke-dashcorner](#StrokeDashcornerProperty) property also controls how the dash pattern given by [stroke-dasharray](#StrokeDasharrayProperty) is repeated. When none is used, the dash pattern is repeated over the entire length of the subpath. When any other value is used, the dash pattern is repeated separately on each path segment in the space between the segment's two adjacent corner dashes.

[](#issue11)Need to define what happens when corner dashes would overlap.

![Image showing a rectangle at each corner and short dashes in between.](images/dashcorner.svg)

A rectangle painted with a dashed stroke and with corner dashes. The dashing pattern is 0,8 and the corner dash length is 32.

|  |  |
|----|----|
| Name: | <span class="dfn">stroke-dashadjust</span> |
| Value: | none \| \[stretch \| compress\] \[dashes \| gaps\]? |
| Initial: | none |
| Applies to: | [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement) and [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement) |
| Inherited: | yes |
| Percentages: | N/A |
| Media: | visual |
| Computed value: | as specified |
| [Animatable](https://svgwg.org/specs/animations/#Animatable): | yes |

This is a new feature, added to allow for more visually pleasing stroke dash patterns.

The [stroke-dashadjust](#StrokeDashadjustProperty) property specifies whether and how a stroke's dash pattern will be adjusted so that it is repeated a whole number of times along an element's subpaths.

none  
Indicates that no adjustment of the dash pattern takes place.

stretch  
Indicates that when the dash pattern does not fit into a subpath a whole number times, the dashes or gaps (or both) will be lengthened so that it does.

compress  
Indicates that when the dash pattern does not fit into a subpath a whole number times, the dashes or gaps (or both) will be shortened so that it does.

dashes  
Indicates that when a dash pattern is to be stretched or compressed, only the length of the dashes will be adjusted; the gaps will remain as specified.

gaps  
Indicates that when a dash pattern is to be stretched or compressed, only the length of the gaps will be adjusted; the dashes will remain as specified.

[](#issue12)Do we need to be able to choose to stretch or compress?

If neither the dashes or gaps keyword is given, both the dashes and the gaps will be adjusted.

The target length that a dash pattern will be adjusted to depends on the value of the [stroke-dashcorner](#StrokeDashcornerProperty) property:

1.  If [stroke-dashcorner](#StrokeDashcornerProperty) is none, then the dash pattern will be adjusted to fit within the length of the subpath a whole number of times.
2.  If [stroke-dashcorner](#StrokeDashcornerProperty) has any other value, including a zero length, then the dash pattern will be adjusted differently for each segment of the subpath such that it fits between the two corner dashes at the ends of the segment a whole number of times.

The adjustment of dash and gap length in a dash pattern is done by scaling the lengths by a factor, which is the number closest to 1 that will result in the dash pattern fitting in the target length a whole number of times. If stretch is used, the factor is a number between 1 and 2, while if compress is used, the factor is a number between 0 and 1. If there is no appropriate factor that can be chosen – for example if stretch is used but the dash pattern is longer than the target length, or if gaps was specified but all of the gaps in the dash pattern are zero – then no adjustment is performed.

[](#issue13)Should there be an auto value which means round to the closest number of whole repetitions?

[](#issue14)Does the compression or expansion of the dashes and gaps happen after an odd-lengthed dash array is doubled so that it has an even number of entries or before? Probably after.

[](#issue15)Do we want to allow control of whether the stroke ends with a dash or with a gap? For a closed path, you probably want a gap at the end, while for a non-closed path, a dash at the end is probably better. Omit control for this, but just do it automatically based on whether the path is closed?

![Image showing three shapes stroked with the same dash pattern, all adjusted to their individual path lengths.](images/dashadjust.svg)

The same dash stroke used on three different paths, adjusted to fit a whole number of times on each.

## 3. Computing the shape of the stroke[](#StrokeShape)

|  |  |
|----|----|
| SVG 2 Requirement: | Specify stroke dashing more precisely. |
| Resolution: | [SVG 2 shall specify stroke dashing more precisely.](https://www.w3.org/2011/10/28-svg-irc#T18-14-14) |
| Purpose: | To define dash starting point on basic shapes and path segments. |
| Owner: | Cameron (no action) |

[](#issue16)Something in this section needs to reference ‘[pathLength](https://svgwg.org/svg2-draft/paths.html#PathLengthAttribute)’ so that dash lengths are in the author's path length space.

[](#issue17)This section doesn't handle [stroke-dashcorner](#StrokeDashcornerProperty) and [stroke-dashadjust](#StrokeDashadjustProperty) yet.

The <span class="dfn">stroke shape</span> of an element is the shape that is filled by the [stroke](#StrokeProperty) property. The following algorithm describes what the stroke shape of a ‘[path](https://svgwg.org/svg2-draft/paths.html#PathElement)’ or [basic shape](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement) is, taking into account the stroking properties above:

[](#issue18)This should include text elements too, but should we keep stroke dashing on text?

1.  Let `shape` be an empty shape.
2.  Let `path` be the [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath) of the element.
3.  For each subpath of `path`:
    1.  Let `positions` be the [dash positions](#TermDashPositions) for the subpath.
    2.  For each pair \<`start`, `end`\> in `positions`:
        1.  Let `dash` be the shape that includes, for all distances between `start` and `end` along the subpath, all points that lie on the line perpendicular to the subpath at that distance and which are within distance [stroke-width](#StrokeWidthProperty) of the point on the subpath at that position.

        2.  Set `dash` to be the union of `dash` and the starting [cap shape](#TermCapShape) for the subpath at position `start`.

        3.  Set `dash` to be the union of `dash` and the ending [cap shape](#TermCapShape) for the subpath at position `end`.

        4.  Let `index` and `last` be the indexes of the path segments in the subpath at distance `start` and `end` along the subpath.

            It does not matter whether any zero length segments are included when choosing `index` and `last`.

        5.  While `index` \< `last`:
            1.  Set `dash` to be the union of `dash` and the [line join shape](#TermLineJoinShape) for the subpath at segment index `index`.
            2.  Set `index` to `index` + 1.

        6.  Set `shape` to be the union of `shape` and `stroke`.
4.  Return `shape`.

The <span class="dfn">dash positions</span> for a given subpath of the [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath) of a ‘[path](https://svgwg.org/svg2-draft/paths.html#PathElement)’ or [basic shape](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement) is a sequence of pairs of values, which represent the starting and ending distance along the subpath for each of the dashes that form the subpath's stroke. It is determined as follows:

1.  Let `pathlength` be the length of the subpath.
2.  Let `dashes` be the list of values of [stroke-dasharray](#StrokeDasharrayProperty) on the element, converted to user units, repeated if necessary so that it has an even number of elements; if the property has the value none, then the list has a single value 0.
3.  Let `count` be the number of values in `dashes`.
4.  Let `sum` be the sum of the values in `dashes`.
5.  If `sum` = 0, then return a sequence with the single pair \<0, `pathlength`\>.
6.  Let `positions` be an empty sequence.
7.  Let `offset` be the value of the [stroke-dashoffset](#StrokeDashoffsetProperty) property on the element.
8.  If `offset` is negative, then set `offset` to `sum` − abs(`offset`).
9.  Set `offset` to `offset` mod `sum`.
10. Let `index` be the smallest integer such that sum(`dashes `<sub>`i`</sub>, 0 ≤ `i` ≤ `index`) ≥ `offset`.
11. Let `dashlength` be min(sum(`dashes `<sub>`i`</sub>, 0 ≤ `i` ≤ `index`) − `offset`, `pathlength`).
12. If `index` mod 2 = 0, then append to `positions` the pair \<0, `dashlength`\>.
13. Let `position` be `dashlength`.
14. While `position` \< `pathlength`:
    1.  Set `index` to (`index` + 1) mod `count`.
    2.  Let `dashlength` be min(`dashes` <sub>`index`</sub>, `pathlength` − `position`).
    3.  If `index` mod 2 = 0, then append to `positions` the pair \<`position`, `position` + `dashlength`\>.
    4.  Set `position` to `position` + `dashlength`.
15. Return `positions`.

The starting and ending <span class="dfn">cap shapes</span> at a given `position` along a subpath are determined as follows:

1.  If [stroke-linecap](#StrokeLinecapProperty) is butt, then return an empty shape.
2.  Otherwise, if [stroke-linecap](#StrokeLinecapProperty) is round, then:
    1.  If this is a starting cap, then return a semicircle of radius [stroke-width](#StrokeWidthProperty) positioned such that:
        - Its straight edge is parallel to the line perpendicular to the subpath at distance `position` along it.
        - The midpoint of its straight edge is at the point that is along the subpath at distance `position`.
        - The direction from the midpoint of its arc to the midpoint of its straight edge is the same as the direction of the subpath at distance `position` along it.
    2.  Otherwise, this is an ending cap. Return a semicircle of radius [stroke-width](#StrokeWidthProperty) positioned such that:
        - Its straight edge is parallel to the line perpendicular to the subpath at distance `position` along it.
        - The midpoint of its straight edge is at the point that is along the subpath at distance `position`.
        - The direction from the midpoint of its straight edge to the midpoint of its arc is the same as the direction of the subpath at distance `position` along it.
3.  Otherwise, [stroke-linecap](#StrokeLinecapProperty) is square:
    1.  If this is a starting cap, then return a rectangle with side lengths [stroke-width](#StrokeWidthProperty) and [stroke-width](#StrokeWidthProperty) / 2 positioned such that:
        - Its longer edges, `A` and `B`, are parallel to the line perpendicular to the subpath at distance `position` along it.
        - The midpoint of `A` is at `start`.
        - The direction from the midpoint of `B` to the midpoint of `A` is the same as the direction of the subpath at distance `position` along it.
    2.  Otherwise, this is an ending cap. Return a rectangle with side lengths [stroke-width](#StrokeWidthProperty) and [stroke-width](#StrokeWidthProperty) / 2 positioned such that:
        - Its longer edges, `A` and `B`, are parallel to the line perpendicular to the subpath at distance `position` along it.
        - The midpoint of `A` is at `end`.
        - The direction from the midpoint of `A` to the midpoint of `B` is the same as the direction of the subpath at distance `position` along it.

![Image showing how to construct the three types of line caps](images/linecap-construction.svg)

The three different [stroke-linecap](#StrokeLinecapProperty) values used on paths with a single, non-zero length subpath. The white line is the path itself and the thick gray area is the stroke. On the top row, the green lines indicate the perpendicular to the tangent at the path endpoints and the pink areas are the caps. The bottom row shows the stroke without the perpendicular and cap highlighting.

The <span class="dfn">line join shape</span> for a given segment of a subpath is determined as follows:

1.  Let `P` be the point at the end of the segment.
2.  Let `A` be the line parallel to the tangent at the end of the segment.
3.  Let `B` be the line parallel to the tangent at the start of the following segment.
4.  If `A` and `B` are the same line, then return an empty shape.
5.  Let `A `<sub>`left`</sub> and `A `<sub>`right`</sub> be lines parallel to `A` at a distance of [stroke-width](#StrokeWidthProperty) / 2 to the left and to the right of `A` relative to the subpath direction, respectively.
6.  Let `B `<sub>`left`</sub> and `B `<sub>`right`</sub> be lines parallel to `B` at a distance of [stroke-width](#StrokeWidthProperty) / 2 to the left and to the right of `B`, relative to the subpath direction, respectively.
7.  Let `P` <sub>1</sub>, `P` <sub>2</sub> and `P` <sub>3</sub> be points determined as follows:
    1.  If the smaller angle between `A` and `B` is on the right of these lines, considering the direction of the subpath, then `P` <sub>1</sub> and `P` <sub>2</sub> are the points on `A `<sub>`left`</sub> and `B `<sub>`left`</sub> closest to `P`, and `P` <sub>3</sub> is the intersection of `A `<sub>`left`</sub> and `B `<sub>`left`</sub>.
    2.  Otherwise, `P` <sub>1</sub> and `P` <sub>2</sub> are the points on `A `<sub>`right`</sub> and `B `<sub>`right`</sub> closest to `P`, and `P` <sub>3</sub> is the intersection of `A `<sub>`right`</sub> and `B `<sub>`right`</sub>.
8.  Let `bevel` be the triangle formed from the three points `P`, `P` <sub>1</sub> and `P` <sub>2</sub>.
9.  If [stroke-linejoin](#StrokeLinejoinProperty) is round, then return the union of `bevel` and a circular sector of radius [stroke-width](#StrokeWidthProperty), centered on `P`, and which has `P` <sub>1</sub> and `P` <sub>2</sub> as the two endpoints of the arc.
10. If [stroke-linejoin](#StrokeLinejoinProperty) is arcs, then find the circles that are tangent to the stroke edges at `P` <sub>1</sub> and `P` <sub>2</sub> with the same curvature as the edges at those points (see below). If both curvatures are zero fall through to miter-clip. Extend the stroke edges using these circles (or a line, in the case of zero curvature). If the two circles (or circle and line) do not intersect, fall through to miter-clip. If the two circles (or circle and line) intersect, the line join region is defined by the lines that connect `P` with `P` <sub>1</sub> and `P` <sub>2</sub> and the arcs defined by the circles (or arc and line) between the closest intersection point to `P`, and `P` <sub>1</sub> and `P` <sub>2</sub>. Next calculate the *miter limit* as defined in the [stroke-miterlimit](#StrokeMiterlimitProperty) section. Clip any part of the line join region that extends past the miter limit. Return the resulting region. Note that the curvatures are calculated in user-space before any transforms are applied.
11. If [stroke-linejoin](#StrokeLinejoinProperty) is miter or miter-clip then the line join region is the union of `bevel` and the triangle formed from the three points `P` <sub>1</sub>, `P` <sub>2</sub> and `P` <sub>3</sub>.
12. Let `θ` be the angle between `A` and `B`. If 1 / sin(`θ` / 2) ≤ [stroke-miterlimit](#StrokeMiterlimitProperty), then return the line join region.
13. If [stroke-linejoin](#StrokeLinejoinProperty) is miter-clip, then clip any part of the line join region that extends past the miter limit and return this region.
14. Return `bevel`.

![Image showing the lines and points computed to construct a round line join.](images/linejoin-construction.svg)

Construction of a round line join shape, shown in pink. The white line is the original path, which has two segments that come to a point, and the gray region is the stroke.

![Image showing the lines and points computed to construct an arcs line join.](images/linejoin-construction-arcs.svg)

Construction of an arcs line join shape, shown in pink. The white line is the original path, which has two segments that come to a point, and the gray region is the stroke. The dashed lines show circles that are tangent to and have the curvature of the segments at the join. The olive-green circles (concentric with the dashed circles) define the join shape.

### 3.1. Computing the circles for the arcs 'stroke-linejoin'[](#CurvatureCalculation)

The arcs [stroke-linejoin](#StrokeLinejoinProperty) requires finding circles that are both tangent to and have the same curvatures as the outer stroke edges at the ends of path segments. To find one of these circles, first calculate the curvature `κ` of the path segment at its end (see below). Next, find the radius of a circle corresponding to this curvature: `r` = 1/`κ`. Increase or decrease the radius by one half of the stroke width to account for the stroke: `r `<sub>`c`</sub> = `r` ± ½ stroke-width. The center of the circle will be on a line normal to the path end a distance of `r `<sub>`c`</sub> away from the outer stroke edge at the end.

For a line: the curvature is infinite. Extend the outer stroke edge by a line.

For an elliptical arc:

$`\kappa(t) = \frac{r_{x}r_{y}}{\left( r_{x}^{2}\sin^{2}t + r_{y}^{2}\cos^{2}t \right)^{3/2}}`$

\$\$\kappa(t) = {{r_x r_y}\over{(r_x^2 \sin^2 t + r_y^2 \cos^2 t)^{3/2}}}\$\$

where:

$`t = \arctan\left( {\frac{r_{y}}{r_{x}}\tan\theta} \right)`$

\$\$t = \arctan \left( {r_y \over r_x} \tan \theta \right)\$\$

The parameter `θ` at the beginning or end of an arc segment can be found by using the formulas in the [Elliptical arc implementation notes](https://svgwg.org/svg2-draft/implnote.html#ArcImplementationNotes). (Note, some renderers convert elliptical arcs to cubic Béziers prior to rendering so the equations here may not be needed.)

For a quadratic Bézier:

$`\kappa(0) = \frac{1}{2}\frac{\left( P_{1} - P_{0} \right) \times \left( P_{2} - P_{1} \right)}{|P_{1} - P_{0}|^{3}}`$

\$\$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over\|P_1-P_0\|^3}\$\$

$`\kappa(1) = \frac{1}{2}\frac{\left( P_{2} - P_{1} \right) \times \left( P_{0} - P_{1} \right)}{|P_{2} - P_{1}|^{3}}`$

\$\$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over\|P_1-P_0\|^3}\$\$

Where `κ(0)` and `κ(1)` are the signed curvatures at the start and end of the path segment respectively, and the `P`'s are the three points that define the quadratic Bézier.

For a cubic Bézier:

$`\kappa(0) = \frac{2}{3}\frac{\left( P_{1} - P_{0} \right) \times \left( P_{2} - P_{1} \right)}{|P_{1} - P_{0}|^{3}}`$

\$\$\kappa(0) = {2\over3}{(P_1-P_0)\times((P_0-P_1)+(P_2-P_1))\over\|P_1-P_0\|^3}\$\$

$`\kappa(1) = \frac{2}{3}\frac{\left( P_{3} - P_{2} \right) \times \left( P_{1} - P_{2} \right)}{|P_{3} - P_{2}|^{3}}`$

\$\$\kappa(1) = {2\over3}{(P_3-P_2)\times((P_1-P_2)+(P_3-P_2))\over\|P_3-P_2\|^3}\$\$

Where `κ(0)` and `κ(1)` are the signed curvatures at the start and end of the path segment respectively, and the `P`'s are the four points that define the cubic Bézier. Note, if `P `<sub>`0`</sub> and `P `<sub>`1`</sub>, or `P `<sub>`2`</sub> and `P `<sub>`3`</sub> are degenerate, the curvature will be infinite and a line should be used in constructing the join.

## 4. References[](#refs)

### 4.1. Normative references[](#normrefs)

**\[RFC2119\]**  
[Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119), S. Bradner, March 1997.\
Available at https://tools.ietf.org/html/rfc2119.

**\[SVG2\]**  
[Scalable Vector Graphics (SVG) 2](https://www.w3.org/TR/2015/WD-SVG2-20150409/), N. Andronikos, T. Bah, A. Bellamy-Royds, B. Birtles, C. Concolato, E. Dahlström, C. Lilley, C. McCormack, D. Schepers, D. Schulze, R. Schwerdtfeger, S. Takagi, J. Watt, eds. World Wide Web Consortium, 09 April 2015.\
This edition of SVG 2 is https://www.w3.org/TR/2015/WD-SVG2-20150409/.\
The [latest edition of SVG 2](https://www.w3.org/TR/SVG2/) is available at https://www.w3.org/TR/SVG2/.

## 5. Changes since SVG 2[](#ChangesSinceSVG2)

- Added the [stroke-alignment](#StrokeAlignmentProperty), [stroke-dashadjust](#StrokeDashadjustProperty) and [stroke-dashcorner](#StrokeDashcornerProperty) properties.

<!--
## Source links

- [https://www.w3.org/](https://www.w3.org/)
- [https://svgwg.org/specs/strokes/](https://svgwg.org/specs/strokes/)
- [http://www.w3.org/TR/svg-strokes/](http://www.w3.org/TR/svg-strokes/)
- [https://github.com/w3c/svgwg/tree/main/specs/strokes](https://github.com/w3c/svgwg/tree/main/specs/strokes)
- [www-svg@w3.org](mailto:www-svg@w3.org)
- [archive](https://lists.w3.org/Archives/Public/www-svg/)
- [cam@mcc.id.au](mailto:cam@mcc.id.au)
- [dschulze@adobe.com](mailto:dschulze@adobe.com)
- [Copyright](http://www.w3.org/Consortium/Legal/ipr-notice#Copyright)
- [W3C](http://www.w3.org/)
- [MIT](http://www.csail.mit.edu/)
- [ERCIM](http://www.ercim.eu/)
- [Keio](http://www.keio.ac.jp/)
- [Beihang](http://ev.buaa.edu.cn/)
- [liability](http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer)
- [trademark](http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks)
- [document use](http://www.w3.org/Consortium/Legal/copyright-documents)
- [W3C technical reports index](https://www.w3.org/TR/)
- [SVG 2 Stroke definition](https://www.w3.org/TR/SVG2/painting.html#StrokeProperties)
- [www-svg-request@w3.org](mailto:www-svg-request@w3.org)
- [W3C SVG Working Group](https://www.w3.org/Graphics/SVG/WG)
- [Graphics Activity](https://www.w3.org/Graphics/Activity)
- [W3C Interaction Domain](https://www.w3.org/Interaction/)
- [W3C SVG Charter](https://www.w3.org/Graphics/SVG/svg-2019.html)
- [https://www.w3.org/Graphics/SVG/](https://www.w3.org/Graphics/SVG/)
- [5 February 2004 W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/)
- [public list of any patent disclosures](https://www.w3.org/2004/01/pp-impl/19480/status)
- [Essential Claim(s)](https://www.w3.org/Consortium/Patent-Policy-20040205/#def-essential)
- [section 6 of the W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/#sec-Disclosure)
- [1 August 2014 W3C Process Document](https://www.w3.org/2014/Process-20140801/)
- [path](https://svgwg.org/svg2-draft/paths.html#PathElement)
- [basic shapes](https://svgwg.org/svg2-draft/shapes.html#TermBasicShapeElement)
- [text content elements](https://svgwg.org/svg2-draft/text.html#TermTextContentElement)
- [Distance along a path](https://svgwg.org/svg2-draft/paths.html#DistanceAlongAPath)
- [<paint>](https://svgwg.org/svg2-draft/painting.html#SpecifyingPaint)
- [shapes](https://svgwg.org/svg2-draft/shapes.html#TermShapeElement)
- [<color>](https://www.w3.org/TR/css3-values/#colors)
- [<url>](https://www.w3.org/TR/css3-values/#url-value)
- [Animatable](https://svgwg.org/specs/animations/#Animatable)
- [Paths](https://svgwg.org/svg2-draft/paths.html)
- [moveto](https://svgwg.org/svg2-draft/paths.html#PathDataMovetoCommands)
- [SVG 2 shall include a way to specify stroke position.](https://www.w3.org/2011/10/28-svg-irc#T18-09-48)
- [ACTION-3162](https://www.w3.org/Graphics/SVG/WG/track/actions/3162)
- [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_position)
- [fill-rule](https://svgwg.org/svg2-draft/painting.html#FillRuleProperty)
- [SVG 2 shall allow more author control over positions of dashes.](https://www.w3.org/2011/10/28-svg-irc#T18-17-51)
- [ACTION-3163](https://www.w3.org/Graphics/SVG/WG/track/actions/3163)
- [proposal page](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Stroke_dash_adjustment)
- [<number>](https://www.w3.org/TR/css3-values/#numbers)
- [Painting shapes and text](https://svgwg.org/svg2-draft/render.html#PaintingShapesAndText)
- [fill-opacity](https://svgwg.org/svg2-draft/painting.html#FillOpacityProperty)
- [opacity](https://svgwg.org/svg2-draft/render.html#ObjectAndGroupOpacityProperties)
- [<percentage>](https://www.w3.org/TR/css3-values/#percentages)
- [<length>](https://www.w3.org/TR/css3-values/#lengths)
- [Units](https://svgwg.org/svg2-draft/coords.html#Units)
- [invalid](https://svgwg.org/svg2-draft/types.html#TermInvalidValue)
- [‘path’ element implementation notes](https://svgwg.org/svg2-draft/paths.html#PathElementImplementationNotes)
- [Rigi Kaltbad group meeting](https://www.w3.org/2012/09/19-svg-minutes.html#item08)
- [Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item03)
- [Error processing](https://svgwg.org/svg2-draft/implnote.html#ErrorProcessing)
- [Sydney (2015) group meeting](https://www.w3.org/2015/02/12-svg-minutes.html#item12)
- [non-additive](https://svgwg.org/specs/animations/#AdditionAttributes)
- [equivalent path](https://svgwg.org/svg2-draft/paths.html#TermEquivalentPath)
- [rect](https://svgwg.org/svg2-draft/shapes.html#RectElement)
- [SVG 2 shall specify stroke dashing more precisely.](https://www.w3.org/2011/10/28-svg-irc#T18-14-14)
- [pathLength](https://svgwg.org/svg2-draft/paths.html#PathLengthAttribute)
- [Elliptical arc implementation notes](https://svgwg.org/svg2-draft/implnote.html#ArcImplementationNotes)
- [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119)
- [Scalable Vector Graphics (SVG) 2](https://www.w3.org/TR/2015/WD-SVG2-20150409/)
- [latest edition of SVG 2](https://www.w3.org/TR/SVG2/)
-->
