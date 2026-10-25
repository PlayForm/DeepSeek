# SVG Stroke Attributes

Share Link Copied

## SVG Stroke Attributes

The `stroke` attribute sets the color of the line drawn around an element. Here we will look at the
six `stroke` attributes:

- `stroke` - sets the color of the line around an element
- `stroke-width` - sets the width of the line around an element
- `stroke-opacity` - sets the opacity of the line around an element
- `stroke-linecap` - sets the shape of the end-lines for a line or open path
- `stroke-dasharray` - sets the line to show as a dashed line
- `stroke-linejoin` - sets the shape of the corners where two lines meet

## SVG stroke Attribute

The `stroke` attribute defines the color of the outline of an element. The `stroke` attribute can be
used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`,
`<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. The value of the `stroke`
attribute can be a color name, rgb value or a hex value. Here we use the `stroke` attribute to set
the outline color for a polygon, rectangle, circle and a text: I love SVG! Sorry, your browser does
not support inline SVG. Here is the SVG code:

### Example

svg width="600" height="220" xmlns="http://www.w3.org/2000/svg" polygon points="50,10 0,190 100,190"
fill="lime" stroke="red" / rect width="150" height="100" x="120" y="50" fill="yellow" stroke="red" /
circle r="45" cx="350" cy="100" fill="pink" stroke="blue" / text x="420" y="100" fill="red"
stroke="blue"I love SVG!/text/svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke00) Here we
use the `stroke` attribute to define the color of three lines: Sorry, your browser does not support
inline SVG. Here is the SVG code:

### Example

svg height="80" width="300" xmlns="http://www.w3.org/2000/svg" g fill="none" path stroke="red" d="M5
20 l215 0" / path stroke="green" d="M5 40 l215 0" / path stroke="blue" d="M5 60 l215 0" / /svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke0)

## SVG stroke-width Attribute

The `stroke-width` attribute defines the width of the stroke. The `stroke-width` attribute can be
used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`,
`<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. Here we use the
`stroke-width` attribute to set the width of the outline for a polygon, rectangle, circle and a
text: I love SVG! Sorry, your browser does not support inline SVG. Here is the SVG code:

### Example

svg width="600" height="220" xmlns="http://www.w3.org/2000/svg" polygon points="55,10 10,190
110,190" fill="lime" stroke="red" stroke-width="4" / rect width="150" height="100" x="120" y="50"
fill="yellow" stroke="red" stroke-width="4" / circle r="45" cx="350" cy="100" fill="pink"
stroke="blue" stroke-width="4" / text x="420" y="100" fill="red" stroke="blue" stroke-width="4"I
love SVG!/text/svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke1) Here we
use the `stroke-width` attribute to set the width of three lines: Sorry, your browser does not
support inline SVG. Here is the SVG code:

### Example

svg height="80" width="300" xmlns="http://www.w3.org/2000/svg" g fill="none" stroke="red" path
stroke-width="2" d="M5 20 l215 0" / path stroke-width="4" d="M5 40 l215 0" / path stroke-width="6"
d="M5 60 l215 0" / /svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke)

## SVG stroke-opacity Attribute

The `stroke-opacity` attribute defines the opacity of the stroke. The `stroke-opacity` attribute can
be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`,
`<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. The value of the
`stroke-opacity` attribute goes from 0 to 1 (or 0% to 100%). Here we use the `stroke-opacity`
attribute to set the opacity of the outline for a polygon, rectangle, circle and a text: I love SVG!
Sorry, your browser does not support inline SVG. Here is the SVG code:

### Example

svg width="600" height="220" xmlns="http://www.w3.org/2000/svg" polygon points="55,10 10,190
110,190" fill="lime" stroke="red" stroke-width="4" stroke-opacity="0.4" / rect width="150"
height="100" x="120" y="50" fill="yellow" stroke="red" stroke-width="4" stroke-opacity="0.4" /
circle r="45" cx="350" cy="100" fill="pink" stroke="blue" stroke-width="4" stroke-opacity="0.4" /
text x="420" y="100" fill="red" stroke="blue" stroke-width="4" stroke-opacity="0.4"I love
SVG!/text/svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke4) Here we
use the `stroke-opacity` attribute to set the opacity of three lines: Sorry, your browser does not
support inline SVG. Here is the SVG code:

### Example

svg height="80" width="300" xmlns="http://www.w3.org/2000/svg" g fill="none" stroke="red" path
stroke-width="2" stroke-opacity="0.4" d="M5 20 l215 0" / path stroke-width="4" stroke-opacity="0.4"
d="M5 40 l215 0" / path stroke-width="6" stroke-opacity="0.4" d="M5 60 l215 0" / /svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke5)

## SVG stroke-linecap Attribute

The `stroke-linecap` attribute defines different types of endings for a line or an open path. The
`stroke-linecap` attribute can be used with the following SVG elements: `<path>`, `<polyline>`,
` <line>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. The value of the `stroke-linecap`
attribute can be "butt", "round" or "square". Here we use the `stroke-linecap` attribute to set
different endings for three lines: Sorry, your browser does not support inline SVG. Here is the SVG
code:

### Example

svg height="120" width="300" xmlns="http://www.w3.org/2000/svg" g fill="none" stroke="red"
stroke-width="16" path stroke-linecap="butt" d="M10 20 l215 0" / path stroke-linecap="round" d="M10
50 l215 0" / path stroke-linecap="square" d="M10 80 l215 0" / /svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke2)

## SVG stroke-dasharray Attribute

The `stroke-dasharray` attribute is used to create dashed lines. The `stroke-dasharray` attribute
can be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`,
` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. The value
of the `stroke-dasharray` attribute can be "none" or a comma or space separated list of
lengths/percentages that define the lengths of dashes and gaps. Here we use the `stroke-dasharray`
attribute to create different dashed lines: Sorry, your browser does not support inline SVG. Here is
the SVG code:

### Example

svg height="100" width="400" xmlns="http://www.w3.org/2000/svg" g fill="none" stroke="red"
stroke-width="6" path stroke-dasharray="5,5" d="M5 20 l215 0" / path stroke-dasharray="10,10" d="M5
40 l215 0" / path stroke-dasharray="35,10" d="M5 60 l215 0" / path stroke-dasharray="20,10,5,5,5,10"
d="M5 80 l215 0" / /svg
[Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke3) Here we
use the `stroke-dasharray` attribute to create different dashed outlines for a polygon, rectangle
and a circle: Sorry, your browser does not support inline SVG. Here is the SVG code:

### Example

svg width="600" height="220" xmlns="http://www.w3.org/2000/svg" polygon points="55,10 10,190
110,190" fill="lime" stroke="red" stroke-width="4" stroke-dasharray="10,5" / rect width="150"
height="100" x="120" y="50" fill="yellow" stroke="red" stroke-width="4" stroke-dasharray="10,5" /
circle r="45" cx="350" cy="100" fill="pink" stroke="blue" stroke-width="4" stroke-dasharray="10,5"
//svg [Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke7)

## SVG stroke-linejoin Attribute

The `stroke-linejoin` attribute defines the shape of the corners where two lines meet. The
`stroke-linejoin` attribute can be used with the following SVG elements: `<path>`, ` <polygon>`,
`<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`. The value of the
`stroke-linejoin` attribute can be "arcs", "bevel", "miter", miter-clip" or "round". Here we use the
`stroke-linejoin` attribute to create different corner shapes: Sorry, your browser does not support
inline SVG. Sorry, your browser does not support inline SVG. Sorry, your browser does not support
inline SVG. Here is the SVG code:

### Example

svg width="600" height="230" xmlns="http://www.w3.org/2000/svg" polygon points="55,25 10,190
110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="round" / rect width="150"
height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="round"
//svg svg width="600" height="230" xmlns="http://www.w3.org/2000/svg" polygon points="55,25 10,190
110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="miter" / rect width="150"
height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="miter"
//svgsvg width="600" height="230" xmlns="http://www.w3.org/2000/svg" polygon points="55,25 10,190
110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="bevel" / rect width="150"
height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="bevel"
//svg [Try it Yourself »](https://www.w3schools.com/graphics/tryit.asp?filename=trysvg_stroke6) Free
account

## Track your progress

XP earned **0** Day streak **0** Spaces **0** League **—** New

## Learn in Adventure Mode W3Schools Adventure App

Coding fundamentals as bite-sized lessons and challenges.
[ Download on the App Store ](https://apps.apple.com/us/app/w3schools/id6770531503 "Get W3Schools Adventure App on App Store")
[ GET IT ON Google Play ](https://play.google.com/store/apps/details?id=com.w3schools.app.prod "Get W3Schools Adventure App on Google Play")
[ TRY NOW IN Browser ](https://app.w3schools.com/ "Try W3Schools Adventure Mode in your browser")

## Contact Sales

If you want to use W3Schools services as an educational institution, team or enterprise, send us an
e-mail:sales@w3schools.com

## Report Error

If you want to report an error, or if you want to make a suggestion, send us an
e-mail:help@w3schools.com

##### Top Tutorials

[HTML Tutorial](https://www.w3schools.com/html/default.asp)
[CSS Tutorial](https://www.w3schools.com/css/default.asp)
[JavaScript Tutorial](https://www.w3schools.com/js/default.asp)
[How To Tutorial](https://www.w3schools.com/howto/default.asp)
[SQL Tutorial](https://www.w3schools.com/sql/default.asp)
[Python Tutorial](https://www.w3schools.com/python/default.asp)
[W3.CSS Tutorial](https://www.w3schools.com/w3css/default.asp)
[Bootstrap Tutorial](https://www.w3schools.com/bootstrap/bootstrap_ver.asp)
[PHP Tutorial](https://www.w3schools.com/php/default.asp)
[Java Tutorial](https://www.w3schools.com/java/default.asp)
[C++ Tutorial](https://www.w3schools.com/cpp/default.asp)
[jQuery Tutorial](https://www.w3schools.com/jquery/default.asp)

##### Top References

[HTML Reference](https://www.w3schools.com/tags/default.asp)
[CSS Reference](https://www.w3schools.com/cssref/index.php)
[JavaScript Reference](https://www.w3schools.com/jsref/default.asp)
[SQL Reference](https://www.w3schools.com/sql/sql_ref_keywords.asp)
[Python Reference](https://www.w3schools.com/python/python_reference.asp)
[W3.CSS Reference](https://www.w3schools.com/w3css/w3css_references.asp)
[Bootstrap Reference](https://www.w3schools.com/bootstrap/bootstrap_ref_all_classes.asp)
[PHP Reference](https://www.w3schools.com/php/php_ref_overview.asp)
[HTML Colors](https://www.w3schools.com/colors/colors_names.asp)
[Java Reference](https://www.w3schools.com/java/java_ref_keywords.asp)
[AngularJS Reference](https://www.w3schools.com/angularjs/angularjs_ref_directives.asp)
[jQuery Reference](https://www.w3schools.com/jquery/jquery_ref_overview.asp)

##### Top Examples

[HTML Examples](https://www.w3schools.com/html/html_examples.asp)
[CSS Examples](https://www.w3schools.com/css/css_examples.asp)
[JavaScript Examples](https://www.w3schools.com/js/js_examples.asp)
[How To Examples](https://www.w3schools.com/howto/default.asp)
[SQL Examples](https://www.w3schools.com/sql/sql_examples.asp)
[Python Examples](https://www.w3schools.com/python/python_examples.asp)
[W3.CSS Examples](https://www.w3schools.com/w3css/w3css_examples.asp)
[Bootstrap Examples](https://www.w3schools.com/bootstrap/bootstrap_examples.asp)
[PHP Examples](https://www.w3schools.com/php/php_examples.asp)
[Java Examples](https://www.w3schools.com/java/java_examples.asp)
[XML Examples](https://www.w3schools.com/xml/xml_examples.asp)
[jQuery Examples](https://www.w3schools.com/jquery/jquery_examples.asp)

##### [Get Certified](https://campus.w3schools.com/collections/course-catalog) [HTML Certificate](https://campus.w3schools.com/collections/certifications/products/html-certificate) [CSS Certificate](https://campus.w3schools.com/collections/certifications/products/css-certificate) [JavaScript Certificate](https://campus.w3schools.com/collections/certifications/products/javascript-certificate) [Front End Certificate](https://campus.w3schools.com/collections/certifications/products/front-end-certificate) [SQL Certificate](https://campus.w3schools.com/collections/certifications/products/sql-certificate) [Python Certificate](https://campus.w3schools.com/collections/certifications/products/python-certificate) [PHP Certificate](https://campus.w3schools.com/collections/certifications/products/php-certificate) [jQuery Certificate](https://campus.w3schools.com/collections/certifications/products/jquery-certificate) [Java Certificate](https://campus.w3schools.com/collections/certifications/products/java-certificate) [C++ Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate) [C# Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate-1) [XML Certificate](https://campus.w3schools.com/collections/certifications/products/xml-certificate)

W3Schools is optimized for learning and training. Examples might be simplified to improve reading
and learning. Tutorials, references, and examples are constantly reviewed to avoid errors, but we
cannot warrant full correctness of all content. While using W3Schools, you agree to have read and
accepted our [terms of use](https://www.w3schools.com/about/about_copyright.asp), cookies and
[privacy policy](https://www.w3schools.com/about/about_privacy.asp).
[Copyright 1999-2026](https://www.w3schools.com/about/about_copyright.asp) by Refsnes Data. All
Rights Reserved. [W3Schools is Powered by W3.CSS](https://www.w3schools.com/w3css/default.asp).
Cookies
