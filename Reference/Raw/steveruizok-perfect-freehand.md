# [![Screenshot](./steveruizok-perfect-freehand-raw-main-assets-perfect-freehand-logo.svg.md)](/steveruizok/perfect-freehand/blob/main/assets/perfect-freehand-logo.svg)

Draw perfect pressure-sensitive freehand lines.

🔗 Curious? Try out a [demo](https://perfect-freehand-example.vercel.app/).

💅 Designer? Check out the
[Figma Plugin](https://www.figma.com/community/plugin/950892731860805817).

🕊 This library is written in TypeScript but are community ports in:

- [dart version](https://pub.dev/packages/perfect_freehand)
- [odin](https://github.com/sibaiper/odin-freehand)
- [python](https://github.com/bigbluebutton/perfect-freehand-python)
- [rust](https://crates.io/crates/perfect_freehand)
- ...and probably more. Make a pull request!

💕 Love this library? Consider
[becoming a sponsor](https://github.com/sponsors/steveruizok?frequency=recurring&sponsor=steveruizok).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Community](#community)
- [Author](#author)

## Installation

npm install perfect-freehand

or

yarn add perfect-freehand

## Introduction

This package exports a function named `getStroke` that will generate the points for a polygon based
on an array of points.

[![Screenshot](./steveruizok-perfect-freehand-raw-main-assets-process.gif.md)](/steveruizok/perfect-freehand/blob/main/assets/process.gif)
[![Screenshot](https://github.com/steveruizok/perfect-freehand/raw/main/assets/process.gif)](https://github.com/steveruizok/perfect-freehand/blob/main/assets/process.gif)

[](https://github.com/steveruizok/perfect-freehand/blob/main/assets/process.gif)

To do this work, `getStroke` first creates a set of spline points (red) based on the input points
(grey) and then creates outline points (blue). You can render the result any way you like, using
whichever technology you prefer.

[![Edit perfect-freehand-example](https://camo.githubusercontent.com/8d9126f975c90f522660bc02011b3aa57131ad361088d110e999cfbbb9e62d08/68747470733a2f2f636f646573616e64626f782e696f2f7374617469632f696d672f706c61792d636f646573616e64626f782e737667)](https://codesandbox.io/s/perfect-freehand-example-biwyi?fontsize=14&hidenavigation=1&theme=dark)

## Usage

To use this library, import the `getStroke` function and pass it an array of **input points**, such
as those recorded from a user's mouse movement. The `getStroke` function will return a new array of
**outline points**. These outline points will form a polygon (called a "stroke") that surrounds the
input points.

import { getStroke } from 'perfect-freehand'\
\
const inputPoints = \[\
  \[0, 0\],\
  \[10, 5\],\
  \[20, 8\],\
  // ...\
\]\
\
const outlinePoints = getStroke(inputPoints)

You then can **render** your stroke points using your technology of choice. See the
[Rendering](#rendering) section for examples in SVG and HTML Canvas.

You can **customize** the appearance of the stroke shape by passing `getStroke` a second parameter:
an options object containing one or more options. See the [Options](#options) section for a full
list of available options.

const stroke = getStroke(myPoints, {\
  size: 32,\
  thinning: 0.7,\
})

The appearance of a stroke is effected by the **pressure** associated with each input point. By
default, the `getStroke` function will simulate pressure based on the distance between input points.

To use **real pressure**, such as that from a pen or stylus, provide the pressure as the third
number for each input point, and set the `simulatePressure` option to `false`.

const inputPoints = \[\
  \[0, 0, 0.5\],\
  \[10, 5, 0.7\],\
  \[20, 8, 0.8\],\
  // ...\
\]\
\
const outlinePoints = getStroke(inputPoints, {\
  simulatePressure: false,\
})

In addition to providing points as an array of arrays, you may also provide your points as an
**array of objects** as show in the example below. In both cases, the value for pressure is optional
(it will default to `.5`).

const inputPoints = \[\
  { x: 0, y: 0, pressure: 0.5 },\
  { x: 10, y: 5, pressure: 0.7 },\
  { x: 20, y: 8, pressure: 0.8 },\
  // ...\
\]\
\
const outlinePoints = getStroke(inputPoints, {\
  simulatePressure: false,\
})

**Note:** Internally, the `getStroke` function will convert your object points to array points,
which will have an effect on performance. If you're using this library ambitiously and want to
format your points as objects, consider modifying this library's `getStrokeOutlinePoints` to use the
object syntax instead (e.g. replacing all `[0]` with `.x`, `[1]` with `.y`, and `[2]` with
`.pressure`).

## Example

import \* as React from 'react'\
import { getStroke } from 'perfect-freehand'\
import { getSvgPathFromStroke } from './utils'\
\
export default function Example() {\
  const \[points, setPoints\] = React.useState(\[\])\
\
  function handlePointerDown(e) {\
    e.target.setPointerCapture(e.pointerId)\
    setPoints(\[\[e.pageX, e.pageY, e.pressure\]\])\
  }\
\
  function handlePointerMove(e) {\
    if (e.buttons !== 1) return\
    setPoints(\[...points, \[e.pageX, e.pageY, e.pressure\]\])\
  }\
\
  const stroke = getStroke(points, {\
    size: 16,\
    thinning: 0.5,\
    smoothing: 0.5,\
    streamline: 0.5,\
  })\
\
  const pathData = getSvgPathFromStroke(stroke)\
\
  return (\
    \<svg\
      onPointerDown={handlePointerDown}\
      onPointerMove={handlePointerMove}\
      style={{ touchAction: 'none' }}\
    \>\
      {points && \<path d={pathData} /\>}\
    \</svg\>\
  )\
}

> **Tip:** For implementations in Typescript, see the example project included in this repository.

[![Edit perfect-freehand-example](https://camo.githubusercontent.com/8d9126f975c90f522660bc02011b3aa57131ad361088d110e999cfbbb9e62d08/68747470733a2f2f636f646573616e64626f782e696f2f7374617469632f696d672f706c61792d636f646573616e64626f782e737667)](https://codesandbox.io/s/perfect-freehand-example-biwyi?fontsize=14&hidenavigation=1&theme=dark)

## Documentation

### Options

The options object is optional, as are each of its properties.

| Property           | Type     | Default | Description                                           |
| ------------------ | -------- | ------- | ----------------------------------------------------- |
| `size`             | number   | 8       | The base size (diameter) of the stroke.               |
| `thinning`         | number   | .5      | The effect of pressure on the stroke's size.          |
| `smoothing`        | number   | .5      | How much to soften the stroke's edges.                |
| `streamline`       | number   | .5      | How much to streamline the stroke.                    |
| `simulatePressure` | boolean  | true    | Whether to simulate pressure based on velocity.       |
| `easing`           | function | t =\> t | An easing function to apply to each point's pressure. |
| `start`            | { }      |         | Tapering options for the start of the line.           |
| `end`              | { }      |         | Tapering options for the end of the line.             |
| `last`             | boolean  | true    | Whether the stroke is complete.                       |

**Note:** When the `last` property is `true`, the line's end will be drawn at the last input point,
rather than slightly behind it.

The `start` and `end` options accept an object:

| Property | Type              | Default | Description                                                                              |
| -------- | ----------------- | ------- | ---------------------------------------------------------------------------------------- |
| `cap`    | boolean           | true    | Whether to draw a cap.                                                                   |
| `taper`  | number or boolean | 0       | The distance to taper. If set to true, the taper will be the total length of the stroke. |
| `easing` | function          | t =\> t | An easing function for the tapering effect.                                              |

**Note:** The `cap` property has no effect when `taper` is more than zero.

getStroke(myPoints, {\
  size: 8,\
  thinning: 0.5,\
  smoothing: 0.5,\
  streamline: 0.5,\
  easing: (t) =\> t,\
  simulatePressure: true,\
  last: true,\
  start: {\
    cap: true,\
    taper: 0,\
    easing: (t) =\> t,\
  },\
  end: {\
    cap: true,\
    taper: 0,\
    easing: (t) =\> t,\
  },\
})

> **Tip:** To create a stroke with a steady line, set the `thinning` option to `0`.

> **Tip:** To create a stroke that gets thinner with pressure instead of thicker, use a negative
> number for the `thinning` option.

### Other Exports

For advanced usage, the library also exports smaller functions that `getStroke` uses to generate its
outline points.

#### `getStrokePoints`

A function that accepts an array of points (formatted either as `[x, y, pressure]` or
`{ x: number, y: number, pressure: number}`) and (optionally) an options object. Returns a set of
adjusted points as `{ point, pressure, vector, distance, runningLength }`. The path's total length
will be the `runningLength` of the last point in the array.

import { getStrokePoints } from 'perfect-freehand'\
import samplePoints from "./samplePoints.json'\
\
const strokePoints = getStrokePoints(samplePoints)

#### `getStrokeOutlinePoints`

A function that accepts an array of points (formatted as
`{ point, pressure, vector, distance, runningLength }`, i.e. the output of `getStrokePoints`) and
(optionally) an options object, and returns an array of points (`[x, y]`) defining the outline of a
pressure-sensitive stroke.

import { getStrokePoints, getStrokeOutlinePoints } from 'perfect-freehand'\
import samplePoints from "./samplePoints.json'\
\
const strokePoints = getStrokePoints(samplePoints)\
\
const outlinePoints = getStrokeOutlinePoints(strokePoints)

**Note:** Internally, the `getStroke` function passes the result of `getStrokePoints` to
`getStrokeOutlinePoints`, just as shown in this example. This means that, in this example, the
result of `outlinePoints` will be the same as if the `samplePoints` array had been passed to
`getStroke`.

#### `StrokeOptions`

A TypeScript type for the options object. Useful if you're defining your options outside of the
`getStroke` function.

import { StrokeOptions, getStroke } from 'perfect-freehand'\
\
const options: StrokeOptions = {\
  size: 16,\
}\
\
const stroke = getStroke(options)

## Tips & Tricks

### Freehand Anything

While this library was designed for rendering the types of input points generated by the movement of
a human hand, you can pass any set of points into the library's functions. For example, here's what
you get when running [Feather Icons](https://feathericons.com/) through `getStroke`.

[![Icons](./steveruizok-perfect-freehand-raw-main-assets-icons.png.md)](/steveruizok/perfect-freehand/blob/main/assets/icons.png)

### Rendering

While `getStroke` returns an array of points representing the outline of a stroke, it's up to you to
decide how you will render these points.

The function below will turn the points returned by `getStroke` into SVG path data.

const average = (a, b) =\> (a + b) / 2\
\
function getSvgPathFromStroke(points, closed = true) {\
  const len = points.length\
\
  if (len \< 4) {\
    return \`\`\
  }\
\
  let a = points\[0\]\
  let b = points\[1\]\
  const c = points\[2\]\
\
  let result = \`M\${a\[0\].toFixed(2)},\${a\[1\].toFixed(2)} Q\${b\[0\].toFixed(\
    2\
  )},\${b\[1\].toFixed(2)} \${average(b\[0\], c\[0\]).toFixed(2)},\${average(\
    b\[1\],\
    c\[1\]\
  ).toFixed(2)} T\`\
\
  for (let i = 2, max = len - 1; i \< max; i++) {\
    a = points\[i\]\
    b = points\[i + 1\]\
    result += \`\${average(a\[0\], b\[0\]).toFixed(2)},\${average(a\[1\], b\[1\]).toFixed(\
      2\
    )} \`\
  }\
\
  if (closed) {\
    result += 'Z'\
  }\
\
  return result\
}

To use this function, first run your input points through `getStroke`, then pass the result to
`getSvgPathFromStroke`.

const outlinePoints = getStroke(inputPoints)\
\
const pathData = getSvgPathFromStroke(outlinePoints)

You could then pass this string of SVG path data either to an
[SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) element:

\<path d={pathData} /\>

Or, if you are rendering with HTML Canvas, you can pass the string to a
[`Path2D` constructor](https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D#using_svg_paths)).

const myPath = new Path2D(pathData)\
\
ctx.fill(myPath)

### Flattening

By default, the polygon's paths include self-crossings. You may wish to remove these crossings and
render a stroke as a "flattened" polygon. To do this, install the
[`polygon-clipping`](https://github.com/mfogel/polygon-clipping) package and use the following
function together with the `getSvgPathFromStroke`.

import polygonClipping from 'polygon-clipping'\
\
function getFlatSvgPathFromStroke(stroke) {\
  const faces = polygonClipping.union(\[stroke\])\
\
  const d = \[\]\
\
  faces.forEach((face) =\>\
    face.forEach((points) =\> {\
      d.push(getSvgPathFromStroke(points))\
    })\
  )\
\
  return d.join(' ')\
}

## Development & Contributions

To work on this library:

- clone this repo
- run `yarn` in the folder root to install dependencies
- run `yarn start` to start the local development server

The development server is located at `packages/dev`. The library and its tests are located at
`packages/perfect-freehand`.

Pull requests are very welcome!

## Community

### Support

Need help? Please [open an issue](https://github.com/steveruizok/perfect-freehand/issues/new) for
support.

### Discussion

Have an idea or casual question? Visit the
[discussion page](https://github.com/steveruizok/perfect-freehand/discussions).

### License

- MIT
- ...but if you're using `perfect-freehand` in a commercial product, consider
  [becoming a sponsor](https://github.com/sponsors/steveruizok?frequency=recurring&sponsor=steveruizok).
  💰

## Author

- [@steveruizok](https://twitter.com/steveruizok)

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fsteveruizok%2Fperfect-freehand.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fsteveruizok%2Fperfect-freehand
- [GitHub Copilot Write better code with AI](https://github.com/features/copilot)
- [GitHub Copilot app Direct agents from issue to merge](https://github.com/features/ai/github-app)
- [MCP Registry Integrate external tools](https://github.com/mcp)
- [Actions Automate any workflow](https://github.com/features/actions)
- [Codespaces Instant dev environments](https://github.com/features/codespaces)
- [Issues Plan and track work](https://github.com/features/issues)
- [Code Review Manage code changes](https://github.com/features/code-review)
- [Code Quality Enforce quality at merge](https://github.com/features/code-quality)
- [GitHub Advanced Security Find and fix vulnerabilities](https://github.com/security/advanced-security)
- [Code security Secure your code as you build](https://github.com/security/advanced-security/code-security)
- [Secret protection Stop leaks before they start](https://github.com/security/advanced-security/secret-protection)
- [Why GitHub](https://github.com/why-github)
- [Documentation](https://docs.github.com)
- [Blog](https://github.blog)
- [Changelog](https://github.blog/changelog)
- [Marketplace](https://github.com/marketplace)
- [View all features](https://github.com/features)
- [Enterprises](https://github.com/enterprise)
- [Small and medium teams](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [App Modernization](https://github.com/solutions/use-case/app-modernization)
- [DevSecOps](https://github.com/solutions/use-case/devsecops)
- [DevOps](https://github.com/solutions/use-case/devops)
- [CI/CD](https://github.com/solutions/use-case/ci-cd)
- [View all use cases](https://github.com/solutions/use-case)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [View all solutions](https://github.com/solutions)
- [AI](https://github.com/resources/articles?topic=ai)
- [Software Development](https://github.com/resources/articles?topic=software-development)
- [DevOps](https://github.com/resources/articles?topic=devops)
- [Security](https://github.com/resources/articles?topic=security)
- [View all topics](https://github.com/resources/articles)
- [Customer stories](https://github.com/customer-stories)
- [Events & webinars](https://github.com/resources/events)
- [Ebooks & reports](https://github.com/resources/whitepapers)
- [Business insights](https://github.com/solutions/executive-insights)
- [GitHub Skills](https://skills.github.com)
- [Customer support](https://support.github.com)
- [Community forum](https://github.com/orgs/community/discussions)
- [Trust center](https://github.com/trust-center)
- [Partners](https://github.com/partners)
- [View all resources](https://github.com/resources)
- [GitHub Sponsors Fund open source developers](https://github.com/open-source/sponsors)
- [Security Lab](https://securitylab.github.com)
- [Maintainer Community](https://maintainers.github.com)
- [GitHub Stars](https://stars.github.com)
- [Archive Program](https://archiveprogram.github.com)
- [Topics](https://github.com/topics)
- [Trending](https://github.com/trending)
- [Collections](https://github.com/collections)
- [Copilot for Business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Pricing](https://github.com/pricing)
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=steveruizok%2Fperfect-freehand.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=steveruizok%2Fperfect-freehand
- [steveruizok](./steveruizok.md) - source: /steveruizok
- [perfect-freehand](./steveruizok-perfect-freehand.md) - source: /steveruizok/perfect-freehand
- [Issues 6](./steveruizok-perfect-freehand-issues.md) - source: /steveruizok/perfect-freehand/issues
- [Pull requests 16](./steveruizok-perfect-freehand-pulls.md) - source: /steveruizok/perfect-freehand/pulls
- [Discussions](./steveruizok-perfect-freehand-discussions.md) - source: /steveruizok/perfect-freehand/discussions
- [Actions](./steveruizok-perfect-freehand-actions.md) - source: /steveruizok/perfect-freehand/actions
- [Security and quality](./steveruizok-perfect-freehand-security.md) - source: /steveruizok/perfect-freehand/security
- [Insights](./steveruizok-perfect-freehand-pulse.md) - source: /steveruizok/perfect-freehand/pulse
- [Sponsor](./sponsors-steveruizok.md) - source: /sponsors/steveruizok
- [Notifications](./login?return_to=%2Fsteveruizok%2Fperfect-freehand.md) - source: /login?return_to=%2Fsteveruizok%2Fperfect-freehand
- [perfectfreehand.com](https://perfectfreehand.com)
- [drawing](./topics-drawing.md) - source: /topics/drawing
- [graphics](./topics-graphics.md) - source: /topics/graphics
- [html-canvas](./topics-html-canvas.md) - source: /topics/html-canvas
- [lines](./topics-lines.md) - source: /topics/lines
- [pressure](./topics-pressure.md) - source: /topics/pressure
- [stroke](./topics-stroke.md) - source: /topics/stroke
- [svg](./topics-svg.md) - source: /topics/svg
- [variable-width](./topics-variable-width.md) - source: /topics/variable-width
- [Activity](./steveruizok-perfect-freehand-activity.md) - source: /steveruizok/perfect-freehand/activity
- [215 forks](./steveruizok-perfect-freehand-forks.md) - source: /steveruizok/perfect-freehand/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fsteveruizok%2Fperfect-freehand&report=steveruizok+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fsteveruizok%2Fperfect-freehand&report=steveruizok+%28user%29
- [28 Branches](./steveruizok-perfect-freehand-branches.md) - source: /steveruizok/perfect-freehand/branches
- [25 Tags](./steveruizok-perfect-freehand-tags.md) - source: /steveruizok/perfect-freehand/tags
- [sibaiper](./steveruizok-perfect-freehand-commits?author=sibaiper.md) - source: /steveruizok/perfect-freehand/commits?author=sibaiper
- [steveruizok](./steveruizok-perfect-freehand-commits?author=steveruizok.md) - source: /steveruizok/perfect-freehand/commits?author=steveruizok
- [Update README to link to new Rust port (](./steveruizok-perfect-freehand-commit-176e00f2399f4969e1b0965c5921d96a3e50ce9f.md) - source: /steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f
- [#95](https://github.com/steveruizok/perfect-freehand/pull/95)
- [241 Commits](./steveruizok-perfect-freehand-commits-main.md) - source: /steveruizok/perfect-freehand/commits/main/
- [.github](./steveruizok-perfect-freehand-tree-main-.github.md) - source: /steveruizok/perfect-freehand/tree/main/.github
- [Modernize build tooling and dev infrastructure for 2026 (](./steveruizok-perfect-freehand-commit-a2433b166608f1e36ca744a670cfc072a30ea4b2.md) - source: /steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
- [#96](https://github.com/steveruizok/perfect-freehand/pull/96)
- [.husky](./steveruizok-perfect-freehand-tree-main-.husky.md) - source: /steveruizok/perfect-freehand/tree/main/.husky
- [.vscode](./steveruizok-perfect-freehand-tree-main-.vscode.md) - source: /steveruizok/perfect-freehand/tree/main/.vscode
- [Improvement thinning (](./steveruizok-perfect-freehand-commit-f4225a3b1203266abfb789bd786fb1fcf5bb86d8.md) - source: /steveruizok/perfect-freehand/commit/f4225a3b1203266abfb789bd786fb1fcf5bb86d8
- [#33](https://github.com/steveruizok/perfect-freehand/pull/33)
- [assets](./steveruizok-perfect-freehand-tree-main-assets.md) - source: /steveruizok/perfect-freehand/tree/main/assets
- [Updates README](./steveruizok-perfect-freehand-commit-79e4ef96045ab2aad25d25f2d4d1412b2951af61.md) - source: /steveruizok/perfect-freehand/commit/79e4ef96045ab2aad25d25f2d4d1412b2951af61
- [packages](./steveruizok-perfect-freehand-tree-main-packages.md) - source: /steveruizok/perfect-freehand/tree/main/packages
- [chore: bump version to 1.2.3](./steveruizok-perfect-freehand-commit-b6a6c8aa4dbd3883b26dcd21d6b8dc82ba89f76d.md) - source: /steveruizok/perfect-freehand/commit/b6a6c8aa4dbd3883b26dcd21d6b8dc82ba89f76d
- [tutorial](./steveruizok-perfect-freehand-tree-main-tutorial.md) - source: /steveruizok/perfect-freehand/tree/main/tutorial
- [Updates readme](./steveruizok-perfect-freehand-commit-2841a73260df6e2234173288aa1a0b7a7da8855c.md) - source: /steveruizok/perfect-freehand/commit/2841a73260df6e2234173288aa1a0b7a7da8855c
- [.editorconfig](./steveruizok-perfect-freehand-blob-main-.editorconfig.md) - source: /steveruizok/perfect-freehand/blob/main/.editorconfig
- [.gitattributes](./steveruizok-perfect-freehand-blob-main-.gitattributes.md) - source: /steveruizok/perfect-freehand/blob/main/.gitattributes
- [Initial commit](./steveruizok-perfect-freehand-commit-d81a08a0f36260a833d47efa3d38dd93c0543271.md) - source: /steveruizok/perfect-freehand/commit/d81a08a0f36260a833d47efa3d38dd93c0543271
- [.gitignore](./steveruizok-perfect-freehand-blob-main-.gitignore.md) - source: /steveruizok/perfect-freehand/blob/main/.gitignore
- [.npmignore](./steveruizok-perfect-freehand-blob-main-.npmignore.md) - source: /steveruizok/perfect-freehand/blob/main/.npmignore
- [Moves to a monorepo with esbuild (](./steveruizok-perfect-freehand-commit-07ba771ecb45f560576a722ce966399ef10a55a9.md) - source: /steveruizok/perfect-freehand/commit/07ba771ecb45f560576a722ce966399ef10a55a9
- [#28](https://github.com/steveruizok/perfect-freehand/pull/28)
- [.nvmrc](./steveruizok-perfect-freehand-blob-main-.nvmrc.md) - source: /steveruizok/perfect-freehand/blob/main/.nvmrc
- [.prettierignore](./steveruizok-perfect-freehand-blob-main-.prettierignore.md) - source: /steveruizok/perfect-freehand/blob/main/.prettierignore
- [.prettierrc](./steveruizok-perfect-freehand-blob-main-.prettierrc.md) - source: /steveruizok/perfect-freehand/blob/main/.prettierrc
- [.yarnrc.yml](./steveruizok-perfect-freehand-blob-main-.yarnrc.yml.md) - source: /steveruizok/perfect-freehand/blob/main/.yarnrc.yml
- [CLAUDE.md](./steveruizok-perfect-freehand-blob-main-CLAUDE.md.md) - source: /steveruizok/perfect-freehand/blob/main/CLAUDE.md
- [chore: update claude.md](./steveruizok-perfect-freehand-commit-1a7d5a4345343ce7332d6aeed6a352d77dfbbf1f.md) - source: /steveruizok/perfect-freehand/commit/1a7d5a4345343ce7332d6aeed6a352d77dfbbf1f
- [LICENSE](./steveruizok-perfect-freehand-blob-main-LICENSE.md) - source: /steveruizok/perfect-freehand/blob/main/LICENSE
- [Update LICENSE](./steveruizok-perfect-freehand-commit-5048c724592eac43491ecdbc6543c0502fd691ec.md) - source: /steveruizok/perfect-freehand/commit/5048c724592eac43491ecdbc6543c0502fd691ec
- [README.md](./steveruizok-perfect-freehand-blob-main-README.md.md) - source: /steveruizok/perfect-freehand/blob/main/README.md
- [build.mjs](./steveruizok-perfect-freehand-blob-main-build.mjs.md) - source: /steveruizok/perfect-freehand/blob/main/build.mjs
- [Updates comments](./steveruizok-perfect-freehand-commit-9cf702c933467f6f5297ecf59eed7dd7e54c9e2c.md) - source: /steveruizok/perfect-freehand/commit/9cf702c933467f6f5297ecf59eed7dd7e54c9e2c
- [commitlint.config.js](./steveruizok-perfect-freehand-blob-main-commitlint.config.js.md) - source: /steveruizok/perfect-freehand/blob/main/commitlint.config.js
- [eslint.config.mjs](./steveruizok-perfect-freehand-blob-main-eslint.config.mjs.md) - source: /steveruizok/perfect-freehand/blob/main/eslint.config.mjs
- [icons.png](./steveruizok-perfect-freehand-blob-main-icons.png.md) - source: /steveruizok/perfect-freehand/blob/main/icons.png
- [lazy.config.js](./steveruizok-perfect-freehand-blob-main-lazy.config.js.md) - source: /steveruizok/perfect-freehand/blob/main/lazy.config.js
- [package.json](./steveruizok-perfect-freehand-blob-main-package.json.md) - source: /steveruizok/perfect-freehand/blob/main/package.json
- [perfect-freehand-card.png](./steveruizok-perfect-freehand-blob-main-perfect-freehand-card.png.md) - source: /steveruizok/perfect-freehand/blob/main/perfect-freehand-card.png
- [updates assets](./steveruizok-perfect-freehand-commit-5939fb5252f749fbb8ba242d8862f671808f0219.md) - source: /steveruizok/perfect-freehand/commit/5939fb5252f749fbb8ba242d8862f671808f0219
- [perfect-freehand-logo.svg](./steveruizok-perfect-freehand-blob-main-perfect-freehand-logo.svg.md) - source: /steveruizok/perfect-freehand/blob/main/perfect-freehand-logo.svg
- [Update perfect-freehand-logo.svg](./steveruizok-perfect-freehand-commit-7e3a982cc7125b6436be7df8345a665601f546ca.md) - source: /steveruizok/perfect-freehand/commit/7e3a982cc7125b6436be7df8345a665601f546ca
- [process.gif](./steveruizok-perfect-freehand-blob-main-process.gif.md) - source: /steveruizok/perfect-freehand/blob/main/process.gif
- [setupTests.ts](./steveruizok-perfect-freehand-blob-main-setupTests.ts.md) - source: /steveruizok/perfect-freehand/blob/main/setupTests.ts
- [todo.md](./steveruizok-perfect-freehand-blob-main-todo.md.md) - source: /steveruizok/perfect-freehand/blob/main/todo.md
- [tsconfig.base.json](./steveruizok-perfect-freehand-blob-main-tsconfig.base.json.md) - source: /steveruizok/perfect-freehand/blob/main/tsconfig.base.json
- [tsconfig.json](./steveruizok-perfect-freehand-blob-main-tsconfig.json.md) - source: /steveruizok/perfect-freehand/blob/main/tsconfig.json
- [vitest.config.ts](./steveruizok-perfect-freehand-blob-main-vitest.config.ts.md) - source: /steveruizok/perfect-freehand/blob/main/vitest.config.ts
- [yarn.lock](./steveruizok-perfect-freehand-blob-main-yarn.lock.md) - source: /steveruizok/perfect-freehand/blob/main/yarn.lock
- [chore: fix yarn.lock](./steveruizok-perfect-freehand-commit-f56f097e0e211fffa1601b93883e4d9f9dccf122.md) - source: /steveruizok/perfect-freehand/commit/f56f097e0e211fffa1601b93883e4d9f9dccf122
- [/steveruizok/perfect-freehand/blob/main/assets/perfect-freehand-logo.svg](./steveruizok-perfect-freehand-blob-main-assets-perfect-freehand-logo.svg.md) - source: /steveruizok/perfect-freehand/blob/main/assets/perfect-freehand-logo.svg
- [demo](https://perfect-freehand-example.vercel.app/)
- [Figma Plugin](https://www.figma.com/community/plugin/950892731860805817)
- [dart version](https://pub.dev/packages/perfect_freehand)
- [odin](https://github.com/sibaiper/odin-freehand)
- [python](https://github.com/bigbluebutton/perfect-freehand-python)
- [rust](https://crates.io/crates/perfect_freehand)
- [becoming a sponsor](https://github.com/sponsors/steveruizok?frequency=recurring&sponsor=steveruizok)
- [/steveruizok/perfect-freehand/blob/main/assets/process.gif](./steveruizok-perfect-freehand-blob-main-assets-process.gif.md) - source: /steveruizok/perfect-freehand/blob/main/assets/process.gif
- [https://github.com/steveruizok/perfect-freehand/blob/main/assets/process.gif](https://github.com/steveruizok/perfect-freehand/blob/main/assets/process.gif)
- [https://codesandbox.io/s/perfect-freehand-example-biwyi?fontsize=14&hidenavigation=1&theme=dark](https://codesandbox.io/s/perfect-freehand-example-biwyi?fontsize=14&hidenavigation=1&theme=dark)
- [Feather Icons](https://feathericons.com/)
- [/steveruizok/perfect-freehand/blob/main/assets/icons.png](./steveruizok-perfect-freehand-blob-main-assets-icons.png.md) - source: /steveruizok/perfect-freehand/blob/main/assets/icons.png
- [SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d)
- [Path2D constructor](https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D#using_svg_paths)
- [polygon-clipping](https://github.com/mfogel/polygon-clipping)
- [open an issue](https://github.com/steveruizok/perfect-freehand/issues/new)
- [discussion page](https://github.com/steveruizok/perfect-freehand/discussions)
- [@steveruizok](https://twitter.com/steveruizok)
- [Learn more about GitHub Sponsors](./sponsors.md) - source: /sponsors
- [Used by](./steveruizok-perfect-freehand-network-dependents.md) - source: /steveruizok/perfect-freehand/network/dependents
- [Contributors](./steveruizok-perfect-freehand-graphs-contributors.md) - source: /steveruizok/perfect-freehand/graphs/contributors
- [/claude](./claude.md) - source: /claude
- [/Redemption198](./Redemption198.md) - source: /Redemption198
- [/miles-crighton](./miles-crighton.md) - source: /miles-crighton
- [/mudcube](./mudcube.md) - source: /mudcube
- [/yaojingguo](./yaojingguo.md) - source: /yaojingguo
- [/gilesvangruisen](./gilesvangruisen.md) - source: /gilesvangruisen
- [/calebeby](./calebeby.md) - source: /calebeby
- [/TodePond](./TodePond.md) - source: /TodePond
- [/mattclarkestudio](./mattclarkestudio.md) - source: /mattclarkestudio
- [/aaronsantiago](./aaronsantiago.md) - source: /aaronsantiago
- [/sibaiper](./sibaiper.md) - source: /sibaiper
- [HTML 53.1%](./steveruizok-perfect-freehand-search?l=html.md) - source: /steveruizok/perfect-freehand/search?l=html
- [TypeScript 42.9%](./steveruizok-perfect-freehand-search?l=typescript.md) - source: /steveruizok/perfect-freehand/search?l=typescript
- [CSS 2.2%](./steveruizok-perfect-freehand-search?l=css.md) - source: /steveruizok/perfect-freehand/search?l=css
- [JavaScript 1.8%](./steveruizok-perfect-freehand-search?l=javascript.md) - source: /steveruizok/perfect-freehand/search?l=javascript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
