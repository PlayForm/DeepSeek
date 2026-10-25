[**1** Branch](https://github.com/danmarshall/svg-path-outline/branches)[](https://github.com/danmarshall/svg-path-outline/tags)
Go to file Open more actions menu
[Merge pull request](https://github.com/danmarshall/svg-path-outline/commit/c067626ac34b82b98eefafb8d83071349d991b4b)
[#7](https://github.com/danmarshall/svg-path-outline/pull/7)
[from danmarshall/bezierjs-url](https://github.com/danmarshall/svg-path-outline/commit/c067626ac34b82b98eefafb8d83071349d991b4b)
Open commit details Feb 20, 2024
[c067626](https://github.com/danmarshall/svg-path-outline/commit/c067626ac34b82b98eefafb8d83071349d991b4b)
· Feb 20, 2024 [29 Commits](https://github.com/danmarshall/svg-path-outline/commits/master/) Open
commit details 29 Commits

| Name           | Name | Last commit message                                                                                                                                                            | Last commit date |
| -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
|                |      |                                                                                                                                                                                | Feb 20, 2024     |
|                |      |                                                                                                                                                                                | Jan 15, 2017     |
|                |      |                                                                                                                                                                                | Feb 28, 2017     |
|                |      |                                                                                                                                                                                | Jan 15, 2017     |
|                |      |                                                                                                                                                                                | Feb 28, 2017     |
|                |      |                                                                                                                                                                                | Feb 28, 2017     |
|                |      | [working version with rainbow example](https://github.com/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1 "working version with rainbow example") | Feb 28, 2017     |
|                |      | [working version with rainbow example](https://github.com/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1 "working version with rainbow example") | Feb 28, 2017     |
|                |      | [working version with rainbow example](https://github.com/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1 "working version with rainbow example") | Feb 28, 2017     |
|                |      |                                                                                                                                                                                | Feb 28, 2017     |
|                |      | [working version with rainbow example](https://github.com/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1 "working version with rainbow example") | Feb 28, 2017     |
|                |      | [working version with rainbow example](https://github.com/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1 "working version with rainbow example") | Feb 28, 2017     |
| View all files |

# svg-path-outline

Create an outline surrounding an SVG path A stroke is typically used to outline an SVG element. Use
this package if you need an actual SVG path instead. When corners are outlined, you have the option
of specifying the style of joint: round, square, or beveled. Live demo:
<https://danmarshall.github.io/svg-path-outline/browser>

## Installation

```
npm install svg-path-outline --save

```

### Browser

```
script src="https://pomax.github.io/bezierjs/bezier.js" type="text/javascript"</script
script src="https://microsoft.github.io/maker.js/target/js/browser.maker.js" type="text/javascript"</script
script src="https://danmarshall.github.io/svg-path-outline/browser/index.js" type="text/javascript"</script
```

## Usage

```
var spo = require('svg-path-outline');

var outline = spo(svgData, distance, options);
```

## Parameters

### svgData

Input is a string of either SVG `path` data, or point coordinates from SVG `polyline` or `polygon`.

### distance

Numeric distance to offset the outline.

### options

Object with these optional properties:

| option         | type    | default | description                                                                                                                                                                                                                                                                                          |
| -------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| joints         | number  | 0       | 0 - round joints1 - miter2 - bevel                                                                                                                                                                                                                                                                   |
| bezierAccuracy | number  | 0.5     | Distance of accuracy for Bezier curves. A lower number is more accurate but requires more computation. Using zero is not recommended as it may never finish computing. This number is relative to the unit system of your SVG; so if you are rendering pixels, then 0.5 is accurate to half a pixel. |
| inside         | boolean | false   | Add offset lines on the inside of the shape                                                                                                                                                                                                                                                          |
| outside        | boolean | true    | Add offset lines on the outside of the shape                                                                                                                                                                                                                                                         |
| tagName        | string  | 'path'  | SVG tag name of the type of data:'path' - SVG path language'polygon' - point coordinates, closed shape'polyline' - point coordinates, open shape                                                                                                                                                     |

### return value

Output is a string of SVG `path` data.

## Examples

Simple example in JavaScript:

```
var spo = require('svg-path-outline');
var svgData = "M 95 35 L 59 35 L 48 0 L 36 35 L 0 35 L 29 56 L 18 90 L 48 69 L 77 90 L 66 56 Z";
var outline = spo(svgData, 10);
```

Example in HTML:

```
svg id="star" fill="none" stroke="black"
 path d="M 95 35 L 59 35 L 48 0 L 36 35 L 0 35 L 29 56 L 18 90 L 48 69 L 77 90 L 66 56 Z" />
</svg

script type="text/javascript"
 var spo = require('svg-path-outline');
 var starPath = document.querySelector('#star path');
 var d = starPath.getAttribute('d');
 var outline = spo(d, 10);
 starPath.setAttribute('d', d + outline);
</script
```

## License

Apache 2.0

## About

Create an outline surrounding an SVG path
[danmarshall.github.io/svg-path-outline/browser](https://danmarshall.github.io/svg-path-outline/browser)
**77** stars **4** watching [ forks](https://github.com/danmarshall/svg-path-outline/forks)

##

No releases published

##

- [**danmarshall** Dan Marshall](https://github.com/danmarshall)

## Languages

- [HTML75.5%](https://github.com/danmarshall/svg-path-outline/search?l=html)
- [JavaScript16.8%](https://github.com/danmarshall/svg-path-outline/search?l=javascript)
- [TypeScript7.7%](https://github.com/danmarshall/svg-path-outline/search?l=typescript)

You can’t perform that action at this time.
