# Color functions for JavaScript

Culori is a JavaScript color library that supports the conversion and manipulation of all formats
defined in the [CSS Colors Level 4](https://drafts.csswg.org/css-color/) specification, plus
[additional color spaces](https://culorijs.org/color-spaces). It handles
[color differences](https://en.wikipedia.org/wiki/Color_difference), interpolation, gradients, blend
modes [and much more](https://culorijs.org/api/).

```
npm install culori
```

[Get started](https://culorijs.org/getting-started)

## What sets Culori apart?

**A function-oriented API.** Colors are represented as plain JavaScript objects you pass through a
series of [functions](https://culorijs.org/api), which makes it super easy to extend. **Accurate
alpha.** On the `alpha` channel, the library doesn't equate an `undefined` value with an opaque
color, but rather with a color for which we don't care about the opacity. This gives you the
opportunity to interpret `undefined` as you see fit. The hex string `#ff0000` _should_ probably be
rendered as fully opaque red, but for running functions on colors it's useful to discern `#ff0000`
from `#ff0000ff` — the former has an implicit alpha of 1, while for the latter it's explicit.
**Comprehensive functionality.** Build advanced color tools with Culori's rich collection of color
spaces and functions. **Tree-shakeable version available.** When you're ready to optimize for bundle
size, switch to [a tree-shakeable version of the library](https://culorijs.org/guides/tree-shaking).
