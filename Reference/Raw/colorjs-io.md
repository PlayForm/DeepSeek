![](logo.svg)

# Color.js [v0.7.1](https://github.com/LeaVerou/color.js/releases/)

## Let's get serious about color

#### Fully color space aware

Each color belongs to a color space; operations are color space agnostic. Modules for
[a wide variety of color spaces](./docs-spaces.md), including Lab/LCh, OKLab/OKLCh, sRGB and friends
(HSL/HSV/HWB), Display P3, J <sub>z</sub> a <sub>z</sub> b <sub>z</sub>, REC.2100 and many
[more](./docs-spaces.md).

#### Doesn't gloss over color science

Actual [gamut mapping](./docs-gamut-mapping.md) instead of naïve clipping, multiple
[DeltaE](./docs-color-difference.md) methods (76, CMC, 2000, J <sub>z</sub>), multiple
[chromatic adaptation](./docs-adaptation.md) methods (von Kries, Bradford, CAT02, CAT16), all with
sensible defaults

#### Up to date with CSS Color 4

Every [CSS Color 4](https://drafts.csswg.org/css-color-4/) format & color space supported for both
[input](./docs-the-color-object.md) and [output](./docs-output.md), whether your browser supports it
or not.

#### Readable, object-oriented API

Color objects for multiple operations on the same color, and static Color.something() functions for
one-off calculations

#### Modular & Extensible

Use only what you need, or a bundle. Client-side or Node. Deep extensibility with
[hooks](api/#Hooks-hooks.js).

#### Fast & efficient

[Procedural, tree-shakeable API](./docs-procedural.md) available for performance sensitive tasks and
reduced bundle size

# Color.js: Let’s get serious about color

[![Netlify Status](https://api.netlify.com/api/v1/badges/a6208d72-3d48-43ab-9132-b9f31f828609/deploy-status)](https://app.netlify.com/sites/colorjs/deploys)
[![npm](https://img.shields.io/npm/dw/colorjs.io)](https://npmjs.com/package/colorjs.io)

[Official website](https://colorjs.io) • [Contribution guide](CONTRIBUTING.md)

Color.js is a color conversion and modification library created by two of the editors of the CSS
Color specifications: [Lea Verou](https://lea.verou.me/) and [Chris Lilley](https://svgees.us/).
They continue to work on it, but are also joined by an exceptional
[small grassroots team of co-maintainers](#maintainers).

## Features

- **Color space agnostic**: Each color object is basically a list of coords and a color space
  reference. Operations are color space agnostic. Modules for
  [a wide variety of color spaces](https://colorjs.io/docs/spaces), including Lab/LCh, OKLab/OKLCh,
  sRGB and friends (HSL/HSV/HWB), Display P3, J <sub>z</sub> a <sub>z</sub> b <sub>z</sub>, REC.2100
  and many [more](https://colorjs.io/docs/spaces).
- **Doesn't gloss over color science**: Actual
  [gamut mapping](https://colorjs.io/docs/gamut-mapping) instead of naïve clipping, multiple
  [DeltaE](https://colorjs.io/docs/color-difference) methods (76, CMC, 2000, J <sub>z</sub>),
  multiple [chromatic adaptation](https://colorjs.io/docs/adaptation) methods (von Kries, Bradford,
  CAT02, CAT16), all with sensible defaults
- **Up to date with CSS Color 4**: Every [CSS Color 4](https://drafts.csswg.org/css-color-4/) format
  & color space supported for both [input](https://colorjs.io/docs/the-color-object) and
  [output](https://colorjs.io/docs/output), whether your browser supports it or not.
- **Readable, object-oriented API**: Color objects for multiple operations on the same color, and
  static `Color.something()` functions for one-off calculations
- **Modular & Extensible**: Use only what you need, or a bundle. Client-side or Node. Deep
  extensibility with [hooks](https://colorjs.io/api/#Hooks-hooks.js).
- **Fast & efficient**: [Procedural, tree-shakeable API](https://colorjs.io/docs/procedural)
  available for performance sensitive tasks and reduced bundle size
- **Dependency free**: Not that there’s anything wrong with dependencies, but we gotta mention it!

## Impact

- Has been used to create demos for several W3C specifications
- Has been used by browsers to test their CSS Color 4/5 implementations
- Over
  [335 million total npm downloads](https://limonte.dev/total-npm-downloads/?package=colorjs.io)!
- Used by several [high impact projects](https://www.npmjs.com/browse/depended/colorjs.io),
  including [Sass](https://sass-lang.com/), [Open Props](https://open-props.style/),
  [axe](https://www.deque.com/axe/) accessibility testing engine, and
  [OddContrast](https://www.oddcontrast.com/) and [CSS HD Gradients](https://gradient.style/) color
  tools
- Parts of Color.js’s API are used as a testing ground for the design of a
  [native `Color` object for the Web platform](https://github.com/wicg/color-api).

## Installation

Color.js is designed make simple things easy, and complex things possible, and that extends to
installation as well.

For quick experiments, you can just import Color.js directly from a CDN such as
[esm.sh](https://esm.sh) with all modules included:

```js
import Color from "https://esm.sh/colorjs.io";
```

You can also install via npm if you’d prefer:

```javascript
npm install colorjs.io
```

Whether you’re using NPM, the CDN, or local files, Color.js allows you to also import specific
modules by directly importing from `src`:

- `https://colorjs.io/src/` for the CDN
- `node_modules/colorjs.io/src/` for NPM

For example:

```js
import Color from "https://colorjs.io/src/color.js";
import deltaE200 from "https://colorjs.io/src/deltaE/deltaE2000.js";
import p3 from "https://colorjs.io/src/spaces/p3.js";
import rec2020 from "https://colorjs.io/src/spaces/rec2020.js";
```

To use `import` statements in a browser, your `<script>` needs `type="module"`

Are you old school and prefer to simply have a global `Color` variable? We’ve got you covered! Just
include the following script in your HTML:

```html
<script src="https://colorjs.io/dist/color.global.js"></script>
```

[Read more about installation](https://colorjs.io/get)

## Reading colors

Any color from CSS Color Level 4 should work:

```js
let color = new Color("slategray");
let color2 = new Color("hwb(60 30% 40% / .5)");
let color3 = new Color("color(display-p3 0 1 0 / .9)");
let color4 = new Color("lch(50% 80 30)");
```

You can also create `Color` objects manually:

```js
let color2 = new Color("hwb", [60, 30, 40], 0.5);
let color3 = new Color({ space: "p3", coords: [0, 1, 0], alpha: 0.9 });
```

[Read more about color objects](https://colorjs.io/docs/the-color-object)

## Manipulating colors

You can use properties to modify coordinates of any color space and convert back

```js
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

To modify coordinates in any color space you use `color.set()` and `color.setAll()`:

```js
let color = new Color("slategray");

// Multiple coordinates
color.set({
	"lch.l": 80, // set lightness to 80
	"lch.c": (c) => c * 1.2, // Relative manipulation
});

// Set single coordinate
color.set("hwb.w", (w) => w + 10);
```

Coordinates of the color's color space are available without a prefix:

```js
let color = new Color("slategray").to("lch");

// Multiple coordinates
color.set({
	l: 80, // set lightness to 80
	c: (c) => c * 1.2, // Relative manipulation
});

// Set single coordinate
color.set("h", 30);
```

Chaining-style modifications are also supported:

```js
let color = new Color("lch(50% 50 10)");
color = color
	.set({
		h: (h) => h + 180,
		c: 60,
	})
	.lighten();
```

You can also use properties:

```js
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

Coordinates of the color's color space are available without a prefix:

```js
let color = new Color("slategray").to("lch");
color.l = 80; // Set LCH lightness
color.c *= 1.2; // saturate by increasing LCH chroma
```

[Read more about color manipulation](https://colorjs.io/docs/manipulation)

## Converting between color spaces & stringifying

Convert to any color space:

```js
let color = new Color("slategray");
color.to("lch"); // Convert to LCH
```

Output in any color space

```js
let color = new Color("slategray");
color + ""; // default stringification
color.to("p3").toString({ precision: 3 });
```

Clip to gamut or don't

```js
let color = new Color("p3", [0, 1, 0]);
color.to("srgb") + ""; // Default toString()
color.to("srgb").toString({ inGamut: false });
```

[Read more about output](https://colorjs.io/docs/output)

## Interpolation

Get a function that accepts a percentage:

```js
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.range("red", {
	space: "lch", // interpolation space
	outputSpace: "srgb",
});
redgreen(0.5); // midpoint
```

Interpolation by discrete steps:

```js
let color = new Color("p3", [0, 1, 0]);
color.steps("red", {
	space: "lch",
	outputSpace: "srgb",
	maxDeltaE: 3, // max deltaE between consecutive steps
	steps: 10, // min number of steps
});
```

Shortcut for specific points in the range:

```js
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.mix("red", 0.5, { space: "lch", outputSpace: "srgb" });
let reddishGreen = color.mix("red", 0.25, { space: "lch", outputSpace: "srgb" });
```

Static syntax (every color method has a static one too):

```js
Color.mix("color(display-p3 0 1 0)", "red", 0.5);
```

[Read more about interpolation](https://colorjs.io/docs/interpolation)

## Other Color.js Initiatives

These are all very experimental and not as polished as Color.js itself, but we are excited about
their potential.

### [Color Elements](https://elements.colorjs.io)

This is a set of (currently 10) web components for building color-related apps (the first library of
its kind to our knowledge). It includes things like color pickers, color charts, interactive color
scales, and more.

### [Color Apps](https://apps.colorjs.io)

A set of color-related apps, such as color pickers, converters, and more.

### [Color Palettes](https://palettes.colorjs.io)

A research project which aims to analyze designer-created color palettes in a variety of color
spaces, both to document patterns (e.g. what hue names are most popular?) and to understand what
makes aesthetically pleasing color scales.

## Maintainer team

Color.js is maintained by a small grassroots core team of core maintainers, with
[numerous contributions from the community](https://github.com/color-js/color.js/graphs/contributors).
The core team is:

| Maintainer                                   | GitHub                                              | Socials                                                                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Lea Verou](https://lea.verou.me/)           | [LeaVerou](https://github.com/LeaVerou)             | [@lea.verou.me](https://bsky.app/profile/lea.verou.me) [@lea.verou.me](https://front-end.social/@leaverou) [@LeaVerou](https://x.com/LeaVerou)                                             |
| [Chris Lilley](https://svgees.us/)           | [svgeesus](https://github.com/svgeesus)             | [@svgeesus@mastodon.scot](https://mastodon.scot/@svgeesus@mastodon.scot) [@svgeesus](https://x.com/svgeesus)                                                                               |
| Adam Thompson-Sharpe                         | [MysteryBlokHed](https://github.com/MysteryBlokHed) | [@MysteryBlokHed](https://x.com/MysteryBlokHed)                                                                                                                                            |
| Lloyd Kupchanko                              | [lloydk](https://github.com/lloydk)                 | [@lkupchanko](https://x.com/lkupchanko)                                                                                                                                                    |
| [Dmitry Sharabin](https://d12n.me/)          | [dmitrysharabin](https://github.com/dmitrysharabin) | [@d12n.me](https://bsky.app/profile/d12n.me) [@dmitrysharabin@front-end.social](https://front-end.social/@dmitrysharabin@front-end.social) [@dmitrysharabin](https://x.com/dmitrysharabin) |
| Isaac Muse                                   | [facelessuser](https://github.com/facelessuser)     |                                                                                                                                                                                            |
| [James Stuckey Weber](https://jamessw.com/)  | [jamesnw](https://github.com/jamesnw)               | [@jamessw.com](https://bsky.app/profile/jamessw.com) [@jamessw@front-end.social](https://front-end.social/@jamessw) [@jamesnw](https://x.com/jamesnw)                                      |
| [Jonny Gerig Meyer](https://www.oddbird.net) | [jgerigmeyer](https://github.com/jgerigmeyer)       | [@jgerigmeyer.bsky.social](https://bsky.app/profile/jgerigmeyer.bsky.social) [@jgerigmeyer@front-end.social](https://front-end.social/@jgerigmeyer@front-end.social)                       |

## Sponsor

Color.js is a free and open source project, developed on a volunteer basis. We very recently started
an [Open Collective](https://opencollective.com/color) so you can fund Color.js's development. **If
your company depends on Color.js in any way, it is in your best interest to ensure its future is
sustainable.**

The best way to sponsor Color.js is to
[become a sponsor on Open Collective](https://opencollective.com/color/donate):

[![](https://opencollective.com/color/donate/button@2x.png?color=blue)](https://opencollective.com/color/donate)

Once there are enough sponsors, **we plan to feature them prominently on our website and README**,
so if you want to be among the first ones to get your name in there, now’s the chance!

<!--
## Source links

- [Get Color.js](./get/)
- [Docs](./docs/)
- [The Color object](./docs-the-color-object.md) - source: /docs/the-color-object
- [Supported color spaces](./docs-spaces.md) - source: /docs/spaces
- [Color difference](./docs-color-difference.md) - source: /docs/color-difference
- [Color manipulation](./docs-manipulation.md) - source: /docs/manipulation
- [Contrast](./docs-contrast.md) - source: /docs/contrast
- [Gamut Mapping](./docs-gamut-mapping.md) - source: /docs/gamut-mapping
- [Interpolation](./docs-interpolation.md) - source: /docs/interpolation
- [Chromatic Adaptation](./docs-adaptation.md) - source: /docs/adaptation
- [Output](./docs-output.md) - source: /docs/output
- [Procedural, tree-shakable API](./docs-procedural.md) - source: /docs/procedural
- [API](./api/)
- [Play!](./notebook/)
- [Demos](https://apps.colorjs.io/)
- [Elements](https://elements.colorjs.io/)
- [Tests](./test/)
- [GitHub](https://github.com/LeaVerou/color.js)
- [Discord](https://discord.gg/K64FJBznq4)
- [♡ Sponsor](https://opencollective.com/color)
- [File bug](https://github.com/LeaVerou/color.js/issues/new)
- [v0.7.1](https://github.com/LeaVerou/color.js/releases/)
- [CSS Color 4](https://drafts.csswg.org/css-color-4/)
- [hooks](api/#Hooks-hooks.js)
- [https://app.netlify.com/sites/colorjs/deploys](https://app.netlify.com/sites/colorjs/deploys)
- [https://npmjs.com/package/colorjs.io](https://npmjs.com/package/colorjs.io)
- [Official website](https://colorjs.io)
- [Contribution guide](CONTRIBUTING.md)
- [Lea Verou](https://lea.verou.me/)
- [Chris Lilley](https://svgees.us/)
- [a wide variety of color spaces](https://colorjs.io/docs/spaces)
- [gamut mapping](https://colorjs.io/docs/gamut-mapping)
- [DeltaE](https://colorjs.io/docs/color-difference)
- [chromatic adaptation](https://colorjs.io/docs/adaptation)
- [input](https://colorjs.io/docs/the-color-object)
- [output](https://colorjs.io/docs/output)
- [hooks](https://colorjs.io/api/#Hooks-hooks.js)
- [Procedural, tree-shakeable API](https://colorjs.io/docs/procedural)
- [335 million total npm downloads](https://limonte.dev/total-npm-downloads/?package=colorjs.io)
- [high impact projects](https://www.npmjs.com/browse/depended/colorjs.io)
- [Sass](https://sass-lang.com/)
- [Open Props](https://open-props.style/)
- [axe](https://www.deque.com/axe/)
- [OddContrast](https://www.oddcontrast.com/)
- [CSS HD Gradients](https://gradient.style/)
- [native Color object for the Web platform](https://github.com/wicg/color-api)
- [esm.sh](https://esm.sh)
- [Read more about installation](https://colorjs.io/get)
- [Read more about color manipulation](https://colorjs.io/docs/manipulation)
- [Read more about interpolation](https://colorjs.io/docs/interpolation)
- [Color Elements](https://elements.colorjs.io)
- [Color Apps](https://apps.colorjs.io)
- [Color Palettes](https://palettes.colorjs.io)
- [numerous contributions from the community](https://github.com/color-js/color.js/graphs/contributors)
- [LeaVerou](https://github.com/LeaVerou)
- [@lea.verou.me](https://bsky.app/profile/lea.verou.me)
- [@lea.verou.me](https://front-end.social/@leaverou)
- [@LeaVerou](https://x.com/LeaVerou)
- [svgeesus](https://github.com/svgeesus)
- [@svgeesus@mastodon.scot](https://mastodon.scot/@svgeesus@mastodon.scot)
- [@svgeesus](https://x.com/svgeesus)
- [MysteryBlokHed](https://github.com/MysteryBlokHed)
- [@MysteryBlokHed](https://x.com/MysteryBlokHed)
- [lloydk](https://github.com/lloydk)
- [@lkupchanko](https://x.com/lkupchanko)
- [Dmitry Sharabin](https://d12n.me/)
- [dmitrysharabin](https://github.com/dmitrysharabin)
- [@d12n.me](https://bsky.app/profile/d12n.me)
- [@dmitrysharabin@front-end.social](https://front-end.social/@dmitrysharabin@front-end.social)
- [@dmitrysharabin](https://x.com/dmitrysharabin)
- [facelessuser](https://github.com/facelessuser)
- [James Stuckey Weber](https://jamessw.com/)
- [jamesnw](https://github.com/jamesnw)
- [@jamessw.com](https://bsky.app/profile/jamessw.com)
- [@jamessw@front-end.social](https://front-end.social/@jamessw)
- [@jamesnw](https://x.com/jamesnw)
- [Jonny Gerig Meyer](https://www.oddbird.net)
- [jgerigmeyer](https://github.com/jgerigmeyer)
- [@jgerigmeyer.bsky.social](https://bsky.app/profile/jgerigmeyer.bsky.social)
- [@jgerigmeyer@front-end.social](https://front-end.social/@jgerigmeyer@front-end.social)
- [become a sponsor on Open Collective](https://opencollective.com/color/donate)
- [Lea Verou](http://lea.verou.me)
- [Chris Lilley](https://svgees.us)
-->
