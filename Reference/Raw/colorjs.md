## Impact
  * Has been used to create demos for several W3C specifications
  * Has been used by browsers to test their CSS Color 4/5 implementations
  * Over [333 million total npm downloads](https://limonte.dev/total-npm-downloads/?package=colorjs.io)!
  * Used by several [high impact projects](https://www.npmjs.com/browse/depended/colorjs.io), including [Sass](https://sass-lang.com/), [Open Props](https://open-props.style/), [axe](https://www.deque.com/axe/) accessibility testing engine, and [OddContrast](https://www.oddcontrast.com/) and [CSS HD Gradients](https://gradient.style/) color tools
  * Parts of Color.js’s API are used as a testing ground for the design of a [native `Color` object for the Web platform](https://github.com/wicg/color-api).


## Installation
Color.js is designed make simple things easy, and complex things possible, and that extends to installation as well.
For quick experiments, you can just import Color.js directly from a CDN such as [esm.sh](https://esm.sh) with all modules included:

```
import Color from "https://esm.sh/colorjs.io";
```

You can also install via npm if you’d prefer:

```
npm install colorjs.io
```

Whether you’re using NPM, the CDN, or local files, Color.js allows you to also import specific modules by directly importing from `src`:
  * `https://colorjs.io/src/` for the CDN
  * `node_modules/colorjs.io/src/` for NPM


For example:

```
import Color from "https://colorjs.io/src/color.js";
import p3 from "https://colorjs.io/src/spaces/p3.js";
import rec2020 from "https://colorjs.io/src/spaces/rec2020.js";
import deltaE200 from "https://colorjs.io/src/deltaE/deltaE2000.js";
```

To use `import` statements in a browser, your `script` needs `type="module"`
Are you old school and prefer to simply have a global `Color` variable? We’ve got you covered! Just include the following script in your HTML:

```
script src="https://colorjs.io/dist/color.global.js"</script
```

[Read more about installation](https://colorjs.io/get)
## Reading colors
Any color from CSS Color Level 4 should work:

```
let color = new Color("slategray");
let color2 = new Color("hwb(60 30% 40% / .5)");
let color3 = new Color("color(display-p3 0 1 0 / .9)");
let color4 = new Color("lch(50% 80 30)");
```

You can also create `Color` objects manually:

```
let color2 = new Color("hwb", [60, 30, 40], .5);
let color3 = new Color({space: "p3", coords: [0, 1, 0], alpha: .9});
```

[Read more about color objects](https://colorjs.io/docs/the-color-object)
## Manipulating colors
You can use properties to modify coordinates of any color space and convert back

```
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

To modify coordinates in any color space you use `color.set()` and `color.setAll()`:

```
let color = new Color("slategray");

// Multiple coordinates
color.set({
	"lch.l": 80, // set lightness to 80
	"lch.c": c => c * 1.2 // Relative manipulation
});

// Set single coordinate
color.set("hwb.w", w => w + 10);
```

Coordinates of the color's color space are available without a prefix:

```
let color = new Color("slategray").to("lch");

// Multiple coordinates
color.set({
	l: 80, // set lightness to 80
	c: c => c * 1.2 // Relative manipulation
});

// Set single coordinate
color.set("h", 30);
```

Chaining-style modifications are also supported:

```
let color = new Color("lch(50% 50 10)");
color = color.set({
	h: h => h + 180,
	c: 60
}).lighten();
```

You can also use properties:

```
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

Coordinates of the color's color space are available without a prefix:

```
let color = new Color("slategray").to("lch");
color.l = 80; // Set LCH lightness
color.c *= 1.2; // saturate by increasing LCH chroma
```

[Read more about color manipulation](https://colorjs.io/docs/manipulation)
## Converting between color spaces & stringifying
Convert to any color space:

```
let color = new Color("slategray");
color.to("lch") // Convert to LCH
```

Output in any color space

```
let color = new Color("slategray");
color + ""; // default stringification
color.to("p3").toString({precision: 3});
```

Clip to gamut or don't

```
let color = new Color("p3", [0, 1, 0]);
color.to("srgb") + ""; // Default toString()
color.to("srgb").toString({inGamut: false});
```

[Read more about output](https://colorjs.io/docs/output)
## Interpolation
Get a function that accepts a percentage:

```
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.range("red", {
	space: "lch", // interpolation space
	outputSpace: "srgb"
});
redgreen(.5); // midpoint
```

Interpolation by discrete steps:

```
let color = new Color("p3", [0, 1, 0]);
color.steps("red", {
	space: "lch",
	outputSpace: "srgb",
	maxDeltaE: 3, // max deltaE between consecutive steps
	steps: 10 // min number of steps
});
```

Shortcut for specific points in the range:

```
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.mix("red", .5, {space: "lch", outputSpace: "srgb"});
let reddishGreen = color.mix("red", .25, {space: "lch", outputSpace: "srgb"});
```

Static syntax (every color method has a static one too):

```
Color.mix("color(display-p3 0 1 0)", "red", .5);
```

[Read more about interpolation](https://colorjs.io/docs/interpolation)
## Other Color.js Initiatives
These are all very experimental and not as polished as Color.js itself, but we are excited about their potential.
### [Color Elements](https://elements.colorjs.io)
This is a set of (currently 10) web components for building color-related apps (the first library of its kind to our knowledge). It includes things like color pickers, color charts, interactive color scales, and more.
### [Color Apps](https://apps.colorjs.io)
A set of color-related apps, such as color pickers, converters, and more.
### [Color Palettes](https://palettes.colorjs.io)
A research project which aims to analyze designer-created color palettes in a variety of color spaces, both to document patterns (e.g. what hue names are most popular?) and to understand what makes aesthetically pleasing color scales.
## Maintainer team
Color.js is maintained by a small grassroots core team of core maintainers, with [numerous contributions from the community](https://github.com/color-js/color.js/graphs/contributors). The core team is:  
| Maintainer  | GitHub  | Socials  |  
| --- | --- | --- |  
|  [@lea.verou.me](https://bsky.app/profile/lea.verou.me) [@lea.verou.me](https://front-end.social/@leaverou) [@LeaVerou](https://x.com/LeaVerou)  |  
|  [@svgeesus@mastodon.scot](https://mastodon.scot/@svgeesus@mastodon.scot) [@svgeesus](https://x.com/svgeesus)  |  
| Adam Thompson-Sharpe  |  
| Lloyd Kupchanko  |  
| [Dmitry Sharabin](https://d12n.me/)  |  [@d12n.me](https://bsky.app/profile/d12n.me) [@dmitrysharabin@front-end.social](https://front-end.social/@dmitrysharabin@front-end.social) [@dmitrysharabin](https://x.com/dmitrysharabin)  |  
| Isaac Muse  |  
| [James Stuckey Weber](https://jamessw.com/)  |  [@jamessw.com](https://bsky.app/profile/jamessw.com) [@jamessw@front-end.social](https://front-end.social/@jamessw) [@jamesnw](https://x.com/jamesnw)  |  
| [Jonny Gerig Meyer](https://www.oddbird.net)  |  [@jgerigmeyer.bsky.social](https://bsky.app/profile/jgerigmeyer.bsky.social) [@jgerigmeyer@front-end.social](https://front-end.social/@jgerigmeyer@front-end.social)  |  
## Sponsor
Color.js is a free and open source project, developed on a volunteer basis. We very recently started an [Open Collective](https://opencollective.com/color) so you can fund Color.js's development. **If your company depends on Color.js in any way, it is in your best interest to ensure its future is sustainable.**
The best way to sponsor Color.js is to [become a sponsor on Open Collective](https://opencollective.com/color/donate):
Once there are enough sponsors, **we plan to feature them prominently on our website and README** , so if you want to be among the first ones to get your name in there, now’s the chance!
