# SVG Stroke Attributes

[❮ Previous](svg_fill.asp) [Next ❯](svg_filters_intro.asp)

------------------------------------------------------------------------

Share

## SVG Stroke Attributes

The `stroke` attribute sets the color of the line drawn around an element.

Here we will look at the six `stroke` attributes:

- `stroke` - sets the color of the line around an element
- `stroke-width` - sets the width of the line around an element
- `stroke-opacity` - sets the opacity of the line around an element
- `stroke-linecap` - sets the shape of the end-lines for a line or open path
- `stroke-dasharray` - sets the line to show as a dashed line
- `stroke-linejoin` - sets the shape of the corners where two lines meet

------------------------------------------------------------------------

## SVG stroke Attribute

The `stroke` attribute defines the color of the outline of an element.

The `stroke` attribute can be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

The value of the `stroke` attribute can be a color name, rgb value or a hex value.

Here we use the `stroke` attribute to set the outline color for a polygon, rectangle, circle and a text:

Here is the SVG code:

### Example

\<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="50,10 0,190 100,190" fill="lime" stroke="red" /\>\
  \<rect width="150" height="100" x="120" y="50" fill="yellow" stroke="red" /\>\
  \<circle r="45" cx="350" cy="100" fill="pink" stroke="blue" /\>\
  \<text x="420" y="100" fill="red" stroke="blue"\>I love SVG!\</text\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke00)

Here we use the `stroke` attribute to define the color of three lines:

Here is the SVG code:

### Example

\<svg height="80" width="300" xmlns="http://www.w3.org/2000/svg"\>\
  \<g fill="none"\>\
    \<path stroke="red" d="M5 20 l215 0" /\>\
    \<path stroke="green" d="M5 40 l215 0" /\>\
    \<path stroke="blue" d="M5 60 l215 0" /\>\
  \</g\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke0)

------------------------------------------------------------------------

## SVG stroke-width Attribute

The `stroke-width` attribute defines the width of the stroke.

The `stroke-width` attribute can be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

Here we use the `stroke-width` attribute to set the width of the outline for a polygon, rectangle, circle and a text:

Here is the SVG code:

### Example

\<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,10 10,190 110,190" fill="lime" stroke="red" stroke-width="4" /\>\
  \<rect width="150" height="100" x="120" y="50" fill="yellow" stroke="red" stroke-width="4" /\>\
  \<circle r="45" cx="350" cy="100" fill="pink" stroke="blue" stroke-width="4" /\>\
  \<text x="420" y="100" fill="red" stroke="blue" stroke-width="4"\>I love SVG!\</text\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke1)

Here we use the `stroke-width` attribute to set the width of three lines:

Here is the SVG code:

### Example

\<svg height="80" width="300" xmlns="http://www.w3.org/2000/svg"\>\
  \<g fill="none" stroke="red"\>\
    \<path stroke-width="2" d="M5 20 l215 0" /\>\
    \<path stroke-width="4" d="M5 40 l215 0" /\>\
    \<path stroke-width="6" d="M5 60 l215 0" /\>\
  \</g\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke)

------------------------------------------------------------------------

[REMOVE ADS](https://order.w3schools.com/plans)

------------------------------------------------------------------------

## SVG stroke-opacity Attribute

The `stroke-opacity` attribute defines the opacity of the stroke.

The `stroke-opacity` attribute can be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

The value of the `stroke-opacity` attribute goes from 0 to 1 (or 0% to 100%).

Here we use the `stroke-opacity` attribute to set the opacity of the outline for a polygon, rectangle, circle and a text:

Here is the SVG code:

### Example

\<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,10 10,190 110,190" fill="lime" stroke="red" stroke-width="4" stroke-opacity="0.4" /\>\
  \<rect width="150" height="100" x="120" y="50" fill="yellow" stroke="red" stroke-width="4" stroke-opacity="0.4" /\>\
  \<circle r="45" cx="350" cy="100" fill="pink" stroke="blue" stroke-width="4" stroke-opacity="0.4" /\>\
  \<text x="420" y="100" fill="red" stroke="blue" stroke-width="4" stroke-opacity="0.4"\>I love SVG!\</text\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke4)

Here we use the `stroke-opacity` attribute to set the opacity of three lines:

Here is the SVG code:

### Example

\<svg height="80" width="300" xmlns="http://www.w3.org/2000/svg"\>\
  \<g fill="none" stroke="red"\>\
    \<path stroke-width="2" stroke-opacity="0.4" d="M5 20 l215 0" /\>\
    \<path stroke-width="4" stroke-opacity="0.4" d="M5 40 l215 0" /\>\
    \<path stroke-width="6" stroke-opacity="0.4" d="M5 60 l215 0" /\>\
  \</g\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke5)

------------------------------------------------------------------------

## SVG stroke-linecap Attribute

The `stroke-linecap` attribute defines different types of endings for a line or an open path.

The `stroke-linecap` attribute can be used with the following SVG elements: `<path>`, `<polyline>`, ` <line>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

The value of the `stroke-linecap` attribute can be "butt", "round" or "square".

Here we use the `stroke-linecap` attribute to set different endings for three lines:

Here is the SVG code:

### Example

\<svg height="120" width="300" xmlns="http://www.w3.org/2000/svg"\>\
  \<g fill="none" stroke="red" stroke-width="16"\>\
    \<path stroke-linecap="butt" d="M10 20 l215 0" /\>\
    \<path stroke-linecap="round" d="M10 50 l215 0" /\>\
    \<path stroke-linecap="square" d="M10 80 l215 0" /\>\
  \</g\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke2)

------------------------------------------------------------------------

## SVG stroke-dasharray Attribute

The `stroke-dasharray` attribute is used to create dashed lines.

The `stroke-dasharray` attribute can be used with the following SVG elements: `<circle>`, ` <ellipse>`, `<line>`, `<path>`, ` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

The value of the `stroke-dasharray` attribute can be "none" or a comma or space separated list of lengths/percentages that define the lengths of dashes and gaps.

Here we use the `stroke-dasharray` attribute to create different dashed lines:

Here is the SVG code:

### Example

\<svg height="100" width="400" xmlns="http://www.w3.org/2000/svg"\>\
  \<g fill="none" stroke="red" stroke-width="6"\>\
    \<path stroke-dasharray="5,5" d="M5 20 l215 0" /\>\
    \<path stroke-dasharray="10,10" d="M5 40 l215 0" /\>\
    \<path stroke-dasharray="35,10" d="M5 60 l215 0" /\>\
    \<path stroke-dasharray="20,10,5,5,5,10" d="M5 80 l215 0" /\>\
  \</g\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke3)

Here we use the `stroke-dasharray` attribute to create different dashed outlines for a polygon, rectangle and a circle:

Here is the SVG code:

### Example

\<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,10 10,190 110,190" fill="lime" stroke="red" stroke-width="4" stroke-dasharray="10,5" /\>\
  \<rect width="150" height="100" x="120" y="50" fill="yellow" stroke="red" stroke-width="4" stroke-dasharray="10,5" /\>\
  \<circle r="45" cx="350" cy="100" fill="pink" stroke="blue" stroke-width="4" stroke-dasharray="10,5" /\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke7)

------------------------------------------------------------------------

## SVG stroke-linejoin Attribute

The `stroke-linejoin` attribute defines the shape of the corners where two lines meet.

The `stroke-linejoin` attribute can be used with the following SVG elements: `<path>`, ` <polygon>`, `<polyline>`, ` <rect>`, `<text>`, ` <textPath>`, `<tref>` and ` <tspan>`.

The value of the `stroke-linejoin` attribute can be "arcs", "bevel", "miter", miter-clip" or "round".

Here we use the `stroke-linejoin` attribute to create different corner shapes:

Here is the SVG code:

### Example

\<svg width="600" height="230" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,25 10,190 110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="round" /\>\
  \<rect width="150" height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="round" /\>\
\</svg\>\
\
\<svg width="600" height="230" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,25 10,190 110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="miter" /\>\
  \<rect width="150" height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="miter" /\>\
\</svg\>\
\
\<svg width="600" height="230" xmlns="http://www.w3.org/2000/svg"\>\
  \<polygon points="55,25 10,190 110,190" fill="lime" stroke="red" stroke-width="16" stroke-linejoin="bevel" /\>\
  \<rect width="150" height="100" x="140" y="50" fill="yellow" stroke="red" stroke-width="16" stroke-linejoin="bevel" /\>\
\</svg\> [Try it Yourself »](tryit.asp?filename=trysvg_stroke6)\
- [❮ Previous](svg_fill.asp)
- [Next ❯](svg_filters_intro.asp)
- [★ +1](https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fwww.w3schools.com%2Fgraphics%2Fsvg_stroking.asp)
- [Sign in to track progress](https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fpathfinder.w3schools.com&origin=https%3A%2F%2Fwww.w3schools.com%2Fgraphics%2Fsvg_stroking.asp)

![W3Schools Certificate](./images-img_2026_cert_300.webp.md)

- [](https://www.youtube.com/@w3schools)
- [](https://www.linkedin.com/company/w3schools.com/)
- [](https://discord.com/invite/w3schools)
- [](https://www.facebook.com/w3schoolscom/)
- [](https://www.instagram.com/w3schools.com_official/)
- [](https://www.tiktok.com/@w3schools.com)

------------------------------------------------------------------------

Free account

## Track your progress

XP earned **0** Day streak **0** Spaces **0** League **—** [Sign in to track progress](https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fwww.w3schools.com%2Fgraphics%2Fsvg_stroking.asp)

New

## Learn in Adventure Mode W3Schools Adventure App

Coding fundamentals as bite-sized lessons and challenges.

- [](https://apps.apple.com/us/app/w3schools/id6770531503)
- [](https://play.google.com/store/apps/details?id=com.w3schools.app.prod)
- [](https://app.w3schools.com/)

[](//www.w3schools.com) [PLUS](https://order.w3schools.com/plans) [SPACES](./spaces-index.php.md) [GET CERTIFIED](https://campus.w3schools.com/collections/certifications) [FOR TEACHERS](./academy-index.php.md) [PRACTICE](./practice-index.php.md) [CONTACT US](javascript:void(0);)

## Contact Sales

If you want to use W3Schools services as an educational institution, team or enterprise, send us an e-mail:\
sales@w3schools.com

## Report Error

If you want to report an error, or if you want to make a suggestion, send us an e-mail:\
help@w3schools.com

##### Top Tutorials

[HTML Tutorial](./html-default.asp.md)\
[CSS Tutorial](./css-default.asp.md)\
[JavaScript Tutorial](./js-default.asp.md)\
[How To Tutorial](./howto-default.asp.md)\
[SQL Tutorial](./sql-default.asp.md)\
[Python Tutorial](./python-default.asp.md)\
[W3.CSS Tutorial](./w3css-default.asp.md)\
[Bootstrap Tutorial](./bootstrap-bootstrap_ver.asp.md)\
[PHP Tutorial](./php-default.asp.md)\
[Java Tutorial](./java-default.asp.md)\
[C++ Tutorial](./cpp-default.asp.md)\
[jQuery Tutorial](./jquery-default.asp.md)\

##### Top References

[HTML Reference](./tags-default.asp.md)\
[CSS Reference](./cssref-index.php.md)\
[JavaScript Reference](./jsref-default.asp.md)\
[SQL Reference](./sql-sql_ref_keywords.asp.md)\
[Python Reference](./python-python_reference.asp.md)\
[W3.CSS Reference](./w3css-w3css_references.asp.md)\
[Bootstrap Reference](./bootstrap-bootstrap_ref_all_classes.asp.md)\
[PHP Reference](./php-php_ref_overview.asp.md)\
[HTML Colors](./colors-colors_names.asp.md)\
[Java Reference](./java-java_ref_keywords.asp.md)\
[AngularJS Reference](./angularjs-angularjs_ref_directives.asp.md)\
[jQuery Reference](./jquery-jquery_ref_overview.asp.md)\

##### Top Examples

[HTML Examples](./html-html_examples.asp.md)\
[CSS Examples](./css-css_examples.asp.md)\
[JavaScript Examples](./js-js_examples.asp.md)\
[How To Examples](./howto-default.asp.md)\
[SQL Examples](./sql-sql_examples.asp.md)\
[Python Examples](./python-python_examples.asp.md)\
[W3.CSS Examples](./w3css-w3css_examples.asp.md)\
[Bootstrap Examples](./bootstrap-bootstrap_examples.asp.md)\
[PHP Examples](./php-php_examples.asp.md)\
[Java Examples](./java-java_examples.asp.md)\
[XML Examples](./xml-xml_examples.asp.md)\
[jQuery Examples](./jquery-jquery_examples.asp.md)\

##### [Get Certified](https://campus.w3schools.com/collections/course-catalog)

[HTML Certificate](https://campus.w3schools.com/collections/certifications/products/html-certificate)\
[CSS Certificate](https://campus.w3schools.com/collections/certifications/products/css-certificate)\
[JavaScript Certificate](https://campus.w3schools.com/collections/certifications/products/javascript-certificate)\
[Front End Certificate](https://campus.w3schools.com/collections/certifications/products/front-end-certificate)\
[SQL Certificate](https://campus.w3schools.com/collections/certifications/products/sql-certificate)\
[Python Certificate](https://campus.w3schools.com/collections/certifications/products/python-certificate)\
[PHP Certificate](https://campus.w3schools.com/collections/certifications/products/php-certificate)\
[jQuery Certificate](https://campus.w3schools.com/collections/certifications/products/jquery-certificate)\
[Java Certificate](https://campus.w3schools.com/collections/certifications/products/java-certificate)\
[C++ Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate)\
[C# Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate-1)\
[XML Certificate](https://campus.w3schools.com/collections/certifications/products/xml-certificate)\
[](https://www.youtube.com/@w3schools) [**](https://www.linkedin.com/company/w3schools.com/) [**](https://discord.com/invite/w3schools) [**](https://www.facebook.com/w3schoolscom/) [**](https://www.instagram.com/w3schools.com_official/) [FORUM](./forum-index.php.md) [ABOUT](./about-default.asp.md) [ACADEMY](./academy-index.php.md) W3Schools is optimized for learning and training. Examples might be simplified to improve reading and learning.\
Tutorials, references, and examples are constantly reviewed to avoid errors, but we cannot warrant full correctness\
of all content. While using W3Schools, you agree to have read and accepted our [terms of use](./about-about_copyright.asp.md), cookies and [privacy policy](./about-about_privacy.asp.md).\
\
[Copyright 1999-2026](./about-about_copyright.asp.md) by Refsnes Data. All Rights Reserved. [W3Schools is Powered by W3.CSS](//www.w3schools.com/w3css/default.asp).\
\
\
\
\
\
\
\
\
\

<!--
## Source links

- [❮ Previous](svg_fill.asp)
- [Next ❯](svg_filters_intro.asp)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke00)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke0)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke1)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke)
- [REMOVE ADS](https://order.w3schools.com/plans)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke4)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke5)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke2)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke3)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke7)
- [Try it Yourself »](tryit.asp?filename=trysvg_stroke6)
- [★ +1](https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fwww.w3schools.com%2Fgraphics%2Fsvg_stroking.asp)
- [Sign in to track progress](https://profile.w3schools.com/log-in?redirect_url=https%3A%2F%2Fpathfinder.w3schools.com&origin=https%3A%2F%2Fwww.w3schools.com%2Fgraphics%2Fsvg_stroking.asp)
- [https://campus.w3schools.com/collections/course-catalog](https://campus.w3schools.com/collections/course-catalog)
- [https://www.youtube.com/@w3schools](https://www.youtube.com/@w3schools)
- [https://www.linkedin.com/company/w3schools.com/](https://www.linkedin.com/company/w3schools.com/)
- [https://discord.com/invite/w3schools](https://discord.com/invite/w3schools)
- [https://www.facebook.com/w3schoolscom/](https://www.facebook.com/w3schoolscom/)
- [https://www.instagram.com/w3schools.com_official/](https://www.instagram.com/w3schools.com_official/)
- [https://www.tiktok.com/@w3schools.com](https://www.tiktok.com/@w3schools.com)
- [Download on the App Store](https://apps.apple.com/us/app/w3schools/id6770531503)
- [GET IT ON Google Play](https://play.google.com/store/apps/details?id=com.w3schools.app.prod)
- [TRY NOW IN Browser](https://app.w3schools.com/)
- //www.w3schools.com - source: `//www.w3schools.com`
- [SPACES](./spaces-index.php.md) - source: /spaces/index.php
- [GET CERTIFIED](https://campus.w3schools.com/collections/certifications)
- [FOR TEACHERS](./academy-index.php.md) - source: /academy/index.php
- [PRACTICE](./practice-index.php.md) - source: /practice/index.php
- [CONTACT US](javascript:void(0);)
- [HTML Tutorial](./html-default.asp.md) - source: /html/default.asp
- [CSS Tutorial](./css-default.asp.md) - source: /css/default.asp
- [JavaScript Tutorial](./js-default.asp.md) - source: /js/default.asp
- [How To Tutorial](./howto-default.asp.md) - source: /howto/default.asp
- [SQL Tutorial](./sql-default.asp.md) - source: /sql/default.asp
- [Python Tutorial](./python-default.asp.md) - source: /python/default.asp
- [W3.CSS Tutorial](./w3css-default.asp.md) - source: /w3css/default.asp
- [Bootstrap Tutorial](./bootstrap-bootstrap_ver.asp.md) - source: /bootstrap/bootstrap_ver.asp
- [PHP Tutorial](./php-default.asp.md) - source: /php/default.asp
- [Java Tutorial](./java-default.asp.md) - source: /java/default.asp
- [C++ Tutorial](./cpp-default.asp.md) - source: /cpp/default.asp
- [jQuery Tutorial](./jquery-default.asp.md) - source: /jquery/default.asp
- [HTML Reference](./tags-default.asp.md) - source: /tags/default.asp
- [CSS Reference](./cssref-index.php.md) - source: /cssref/index.php
- [JavaScript Reference](./jsref-default.asp.md) - source: /jsref/default.asp
- [SQL Reference](./sql-sql_ref_keywords.asp.md) - source: /sql/sql_ref_keywords.asp
- [Python Reference](./python-python_reference.asp.md) - source: /python/python_reference.asp
- [W3.CSS Reference](./w3css-w3css_references.asp.md) - source: /w3css/w3css_references.asp
- [Bootstrap Reference](./bootstrap-bootstrap_ref_all_classes.asp.md) - source: /bootstrap/bootstrap_ref_all_classes.asp
- [PHP Reference](./php-php_ref_overview.asp.md) - source: /php/php_ref_overview.asp
- [HTML Colors](./colors-colors_names.asp.md) - source: /colors/colors_names.asp
- [Java Reference](./java-java_ref_keywords.asp.md) - source: /java/java_ref_keywords.asp
- [AngularJS Reference](./angularjs-angularjs_ref_directives.asp.md) - source: /angularjs/angularjs_ref_directives.asp
- [jQuery Reference](./jquery-jquery_ref_overview.asp.md) - source: /jquery/jquery_ref_overview.asp
- [HTML Examples](./html-html_examples.asp.md) - source: /html/html_examples.asp
- [CSS Examples](./css-css_examples.asp.md) - source: /css/css_examples.asp
- [JavaScript Examples](./js-js_examples.asp.md) - source: /js/js_examples.asp
- [SQL Examples](./sql-sql_examples.asp.md) - source: /sql/sql_examples.asp
- [Python Examples](./python-python_examples.asp.md) - source: /python/python_examples.asp
- [W3.CSS Examples](./w3css-w3css_examples.asp.md) - source: /w3css/w3css_examples.asp
- [Bootstrap Examples](./bootstrap-bootstrap_examples.asp.md) - source: /bootstrap/bootstrap_examples.asp
- [PHP Examples](./php-php_examples.asp.md) - source: /php/php_examples.asp
- [Java Examples](./java-java_examples.asp.md) - source: /java/java_examples.asp
- [XML Examples](./xml-xml_examples.asp.md) - source: /xml/xml_examples.asp
- [jQuery Examples](./jquery-jquery_examples.asp.md) - source: /jquery/jquery_examples.asp
- [HTML Certificate](https://campus.w3schools.com/collections/certifications/products/html-certificate)
- [CSS Certificate](https://campus.w3schools.com/collections/certifications/products/css-certificate)
- [JavaScript Certificate](https://campus.w3schools.com/collections/certifications/products/javascript-certificate)
- [Front End Certificate](https://campus.w3schools.com/collections/certifications/products/front-end-certificate)
- [SQL Certificate](https://campus.w3schools.com/collections/certifications/products/sql-certificate)
- [Python Certificate](https://campus.w3schools.com/collections/certifications/products/python-certificate)
- [PHP Certificate](https://campus.w3schools.com/collections/certifications/products/php-certificate)
- [jQuery Certificate](https://campus.w3schools.com/collections/certifications/products/jquery-certificate)
- [Java Certificate](https://campus.w3schools.com/collections/certifications/products/java-certificate)
- [C++ Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate)
- [C# Certificate](https://campus.w3schools.com/collections/certifications/products/c-certificate-1)
- [XML Certificate](https://campus.w3schools.com/collections/certifications/products/xml-certificate)
- [FORUM](./forum-index.php.md) - source: /forum/index.php
- [ABOUT](./about-default.asp.md) - source: /about/default.asp
- [terms of use](./about-about_copyright.asp.md) - source: /about/about_copyright.asp
- [privacy policy](./about-about_privacy.asp.md) - source: /about/about_privacy.asp
- W3Schools is Powered by W3.CSS - source: `//www.w3schools.com/w3css/default.asp`
-->
