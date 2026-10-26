[!culori](/) [v4.0.2](https://github.com/evercoder/culori/releases)

# Color functions for JavaScript

Culori is a JavaScript color library that supports the conversion and manipulation of all formats defined in the [CSS Colors Level 4](https://drafts.csswg.org/css-color/) specification, plus [additional color spaces](./color-spaces). It handles [color differences](https://en.wikipedia.org/wiki/Color_difference), interpolation, gradients, blend modes and much more.

``` bash
npm install culori
```

[Get started](./getting-started)

## What sets Culori apart?

**A function-oriented API.** Colors are represented as plain JavaScript objects you pass through a series of [functions](./api), which makes it super easy to extend.

**Accurate alpha.** On the `alpha` channel, the library doesn't equate an `undefined` value with an opaque color, but rather with a color for which we don't care about the opacity. This gives you the opportunity to interpret `undefined` as you see fit. The hex string `#ff0000` *should* probably be rendered as fully opaque red, but for running functions on colors it's useful to discern `#ff0000` from `#ff0000ff` — the former has an implicit alpha of 1, while for the latter it's explicit.

**Comprehensive functionality.** Build advanced color tools with Culori's rich collection of color spaces and functions.

**Tree-shakeable version available.** When you're ready to optimize for bundle size, switch to [a tree-shakeable version of the library](./guides/tree-shaking).

<!--
## Source links

- / - source: `/`
- [v4.0.2](https://github.com/evercoder/culori/releases)
- Get started - source: `/getting-started/`
- API reference - source: `/api/`
- Color spaces - source: `/color-spaces/`
- Guides - source: `/guides/`
- [GitHub ↗](https://github.com/Evercoder/culori)
- [CSS Colors Level 4](https://drafts.csswg.org/css-color/)
- [additional color spaces](./color-spaces)
- [color differences](https://en.wikipedia.org/wiki/Color_difference)
- [Get started](./getting-started)
- [functions](./api)
- [a tree-shakeable version of the library](./guides/tree-shaking)
- [Moqups](https://moqups.com)
- Colophon - source: `/colophon/`
- Resources - source: `/resources/`
- [Edit it on GitHub](https://github.com/Evercoder/culori/blob/main/./docs/index.md)
-->
