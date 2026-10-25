# fill-rule
Baseline 
Widely available
This feature is well established and works across many devices and browser versions. It’s been available across browsers since March 2020.
  * [ See full compatibility ](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule#browser_compatibility)


The **`fill-rule`**attribute is a presentation attribute defining the algorithm to use to determine the _inside_ part of a shape.
**Note:** As a presentation attribute, `fill-rule` also has a CSS property counterpart: [`fill-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/fill-rule). When both are specified, the CSS property takes priority.
You can use this attribute with the following SVG elements:


##  [Usage notes](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule#usage_notes)  
| Value  |  `nonzero` | `evenodd`  |  
| --- | --- |  
| Default value  | `nonzero`  |  
| Animatable  | discrete  |  
The `fill-rule` attribute provides two options for how the inside (that is, the area to be filled) of a shape is determined:
The value `nonzero` determines the "insideness" of a point in the shape by drawing a ray from that point to infinity in any direction, and then examining the places where a segment of the shape crosses the ray. Starting with a count of zero, add one each time a path segment crosses the ray from left to right and subtract one each time a path segment crosses the ray from right to left. After counting the crossings, if the result is zero then the point is outside the path. Otherwise, it is inside.
#### Example
The value `evenodd` determines the "insideness" of a point in the shape by drawing a ray from that point to infinity in any direction and counting the number of path segments from the given shape that the ray crosses. If this number is odd, the point is inside; if even, the point is outside.
#### Example
##  [Specifications](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule#specifications)  
|  Specification   |  
| --- |  
| [Scalable Vector Graphics (SVG) 2# WindingRule](https://w3c.github.io/svgwg/svg2-draft/painting.html#WindingRule)  |  
##  [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule#browser_compatibility)
##  [See also](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule#see_also)
  * CSS [`fill-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/fill-rule) property


##  Help improve MDN 
[Learn how to contribute](https://developer.mozilla.org/en-US/docs/MDN/Community/Getting_started)
This page was last modified on Apr 16, 2025 by [MDN contributors](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule/contributors.txt). 
[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/svg/reference/attribute/fill-rule/index.md?plain=1 "Folder: en-us/web/svg/reference/attribute/fill-rule \(Opens in a new tab\)") • [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F3c83d88f02f33f4066224e9f624a17dd2a0b0d19%0A*+Document+last+modified%3A+2025-04-16T15%3A02%3A49.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")
