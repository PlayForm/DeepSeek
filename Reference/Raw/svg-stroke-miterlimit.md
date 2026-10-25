# stroke-miterlimit

Baseline Widely available This feature is well established and works across many devices and browser
versions. It’s been available across browsers since March 2020.

- [ See full compatibility ](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit#browser_compatibility)

The **`stroke-miterlimit`**attribute is a presentation attribute defining a limit on the ratio of
the miter length to
the[`stroke-width`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-width)
used to draw a miter join. When the limit is exceeded, the join is converted from a miter to a
bevel. **Note:** As a presentation attribute, `stroke-miterlimit` also has a CSS property
counterpart:
[`stroke-miterlimit`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-miterlimit).
When both are specified, the CSS property takes priority. You can use this attribute with the
following SVG elements:

When two line segments meet at a sharp angle and `miter` joins have been specified for
[`stroke-linejoin`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linejoin),
it is possible for the miter to extend far beyond the thickness of the line stroking the path. The
`stroke-miterlimit` ratio is used to define when the limit is exceeded, if so the join is converted
from a miter to a bevel. The ratio of miter length (distance between the outer tip and the inner
corner of the miter) to
[`stroke-width`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-width)
is directly related to the angle (theta) between the segments in user space by the formula:
stroke-miterlimit=miterLengthstroke-width=sin()\text{stroke-miterlimit} =
\frac{\text{miterLength}}{\text{stroke-width}} = \frac{1}{\sin\left(\frac{\theta}{2}\right)} For
example, a miter limit of 1.414 converts miters to bevels for theta less than 90 degrees, a limit of
4.0 converts them for theta less than approximately 29 degrees, and a limit of 10.0 converts them
for theta less than approximately 11.5 degrees.

## [Usage context](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit#usage_context)

| Value                                                                |     |
| -------------------------------------------------------------------- | --- |
| Default value                                                        | 4   |
| Animatable                                                           | Yes |
| The value of `stroke-miterlimit` must be greater than or equal to 1. |

## [Specifications](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit#specifications)

| Specification                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Scalable Vector Graphics (SVG) 2# StrokeMiterlimitProperty](https://w3c.github.io/svgwg/svg2-draft/painting.html#StrokeMiterlimitProperty) |

## [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit#browser_compatibility)

## [See also](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit#see_also)

- CSS
  [`stroke-miterlimit`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-miterlimit)
  property

## Help improve MDN

[Learn how to contribute](https://developer.mozilla.org/en-US/docs/MDN/Community/Getting_started)
This page was last modified on Apr 16, 2025 by
[MDN contributors](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit/contributors.txt).
[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/svg/reference/attribute/stroke-miterlimit/index.md?plain=1 "Folder: en-us/web/svg/reference/attribute/stroke-miterlimit (Opens in a new tab)")
•
[Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Fstroke-miterlimit&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Fstroke-miterlimit%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Fstroke-miterlimit%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Fstroke-miterlimit%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F3c83d88f02f33f4066224e9f624a17dd2a0b0d19%0A*+Document+last+modified%3A+2025-04-16T15%3A02%3A49.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")
