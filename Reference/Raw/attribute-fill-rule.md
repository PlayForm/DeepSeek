# fill-rule

Baseline Widely available

This feature is well established and works across many devices and browser versions. It’s been available across browsers since March 2020.

- [See full compatibility](#browser_compatibility)
- Learn more

The **`fill-rule`** attribute is a presentation attribute defining the algorithm to use to determine the *inside* part of a shape.

**Note:** As a presentation attribute, `fill-rule` also has a CSS property counterpart: `fill-rule`. When both are specified, the CSS property takes priority.

You can use this attribute with the following SVG elements:

- `<path>`
- `<polygon>`
- `<polyline>`
- `<text>`
- `<textPath>`
- `<tspan>`

## Example

## Usage notes

|               |                        |
|---------------|------------------------|
| Value         | `nonzero` \| `evenodd` |
| Default value | `nonzero`              |
| Animatable    | discrete               |

The `fill-rule` attribute provides two options for how the inside (that is, the area to be filled) of a shape is determined:

### nonzero

The value `nonzero` determines the "insideness" of a point in the shape by drawing a ray from that point to infinity in any direction, and then examining the places where a segment of the shape crosses the ray. Starting with a count of zero, add one each time a path segment crosses the ray from left to right and subtract one each time a path segment crosses the ray from right to left. After counting the crossings, if the result is zero then the point is outside the path. Otherwise, it is inside.

#### Example

### evenodd

The value `evenodd` determines the "insideness" of a point in the shape by drawing a ray from that point to infinity in any direction and counting the number of path segments from the given shape that the ray crosses. If this number is odd, the point is inside; if even, the point is outside.

#### Example

## Specifications

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th>Specification</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://w3c.github.io/svgwg/svg2-draft/painting.html#WindingRule">Scalable Vector Graphics (SVG) 2<br />
# WindingRule</a></td>
</tr>
</tbody>
</table>

## Browser compatibility

## See also

- CSS `fill-rule` property

## Help improve MDN

Learn how to contribute

This page was last modified on Apr 16, 2025 by MDN contributors.

[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/svg/reference/attribute/fill-rule/index.md?plain=1) • [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F3c83d88f02f33f4066224e9f624a17dd2a0b0d19%0A*+Document+last+modified%3A+2025-04-16T15%3A02%3A49.000Z%0A%0A%3C%2Fdetails%3E)

<!--
## Source links

- Learn more - source: `/en-US/docs/Glossary/Baseline/Compatibility`
- fill-rule - source: `/en-US/docs/Web/CSS/Reference/Properties/fill-rule`
- <path> - source: `/en-US/docs/Web/SVG/Reference/Element/path`
- <polygon> - source: `/en-US/docs/Web/SVG/Reference/Element/polygon`
- <polyline> - source: `/en-US/docs/Web/SVG/Reference/Element/polyline`
- <text> - source: `/en-US/docs/Web/SVG/Reference/Element/text`
- <textPath> - source: `/en-US/docs/Web/SVG/Reference/Element/textPath`
- <tspan> - source: `/en-US/docs/Web/SVG/Reference/Element/tspan`
- [Scalable Vector Graphics (SVG) 2 # WindingRule](https://w3c.github.io/svgwg/svg2-draft/painting.html#WindingRule)
- Learn how to contribute - source: `/en-US/docs/MDN/Community/Getting_started`
- MDN contributors - source: `/en-US/docs/Web/SVG/Reference/Attribute/fill-rule/contributors.txt`
- [View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/svg/reference/attribute/fill-rule/index.md?plain=1)
- [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FSVG%2FReference%2FAttribute%2Ffill-rule%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fsvg%2Freference%2Fattribute%2Ffill-rule%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F3c83d88f02f33f4066224e9f624a17dd2a0b0d19%0A*+Document+last+modified%3A+2025-04-16T15%3A02%3A49.000Z%0A%0A%3C%2Fdetails%3E)
- MDN - source: `/`
- [https://github.com/mdn/](https://github.com/mdn/)
- [https://bsky.app/profile/developer.mozilla.org](https://bsky.app/profile/developer.mozilla.org)
- [https://x.com/mozdevnet](https://x.com/mozdevnet)
- [https://mastodon.social/@mdn](https://mastodon.social/@mdn)
- /en-US/blog/rss.xml - source: `/en-US/blog/rss.xml`
- About - source: `/en-US/about`
- Blog - source: `/en-US/blog/`
- [Mozilla careers](https://www.mozilla.org/en-US/careers/listings/)
- Advertise with us - source: `/en-US/advertising`
- MDN Plus - source: `/en-US/plus`
- [Product help](https://support.mozilla.org/products/mdn-plus)
- MDN Community - source: `/en-US/community`
- Community resources - source: `/en-US/docs/MDN/Community`
- Writing guidelines - source: `/en-US/docs/MDN/Writing_guidelines`
- MDN Discord - source: `/discord`
- [MDN on GitHub](https://github.com/mdn)
- Web technologies - source: `/en-US/docs/Web`
- Learn web development - source: `/en-US/docs/Learn_web_development`
- Guides - source: `/en-US/docs/MDN/Guides`
- Tutorials - source: `/en-US/docs/MDN/Tutorials`
- Glossary - source: `/en-US/docs/Glossary`
- [Hacks blog](https://hacks.mozilla.org/)
- [Mozilla](https://www.mozilla.org/)
- [Website Privacy Notice](https://www.mozilla.org/privacy/websites/)
- [Telemetry Settings](https://www.mozilla.org/en-US/privacy/websites/data-preferences/)
- [Legal](https://www.mozilla.org/about/legal/terms/mozilla)
- [Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/)
- a Creative Commons license - source: `/docs/MDN/Writing_guidelines/Attrib_copyright_license`
-->
