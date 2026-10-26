# Python library for working with SVG paths

Streamlined fork of mathandy/svgpathtools. Focuses on providing complete working support SVG path
manipulations without document support. Input/output functionalities are limited to the parsing and
pretty-printing of paths.

Main classes:

- `Path` objects correspond to general SVG paths, made up of one more connected `Subpath` s
- `Subpath` objects correspond to continuous (connected) SVG paths; each subpath can be
  topologically closed or not, and subpaths that are geometrically closed are not necessarily
  topologically closed (i.e., just because the subpath ends where it starts does not mean that `Z`
  property has been set)
- `Segment` is the parent class of the constituent segments that make up subpaths; each segment is
  either an `Arc` or a `BezierCurve`
- `Arc` afore-mentioned instance of `Segment`
- `BezierCurve` instance of `Segment`, parent class of `Line`, `QuadraticBezier` and `CubicBezier`
- `CubicBezier` instance of `BezierCurve` (and `Segment`)
- `QuadraticBezier` instance of `BezierCurve` (and `Segment`)
- `Line` instance of `BezierCurve` (and `Segment`)
- `Curve` base class from which all the above inherit

Thus:

1.  a `Path` is a container of `Subpath` s
2.  a `Subpath` is a container of `Segment` s
3.  each `Segment` is either an `Arc` or a `BezierCurve`
4.  the atomic `Segment` types are `Arc`, `Line`, `QuadraticBezier` and `CubicBezier`, with the
    latter 3 inheriting from `BezierCurve`
5.  besides the inheritances described above, all objects also inherit from `Curve`, where
    operations common to all objects such `.length` or `.transform` are implemented

Note `Path` and `Subpaths` present much the same API and are often interchangeable objects.

## Features

- **parse** and **pretty-print** paths
- **parse** and **pretty-print** SVG transforms, navigating between three format types: transform
  `string`, list of tokens (`["translate", 0, 10, "scale", 2.3]`), and numpy `nd.array`
- **apply transforms** to paths
- compute **tangent vectors** and (right-hand rule) **normal vectors**
- compute **curvature**
- compute **intersections** between paths and/or segments
- compute **bounding boxes** of paths, subpaths and segments
- **reverse** segment/subpath/path orientation
- **crop** and **split** paths and segments
- **offset** and **stroke** paths
- take path **unions**
- compute **enclosed area**
- compute **arc length**
- compute **inverse arc length**
- convert between path, subpath and segment parameterizations (see notes on `Address` object below)
- convert Arc segments to CubicBezier segments
- convert Bézier path segments to **numpy.poly1d** (polynomial) objects
- convert polynomials (in standard form) to their Bézier form
- some HTML color manipulation convenience functions (conversion from rgb tuples to hexadecimal
  strings and back, named html color table)

## The `Address` object

While positions on paths, subpaths and segments are specified parameterically, this easily leads to
"parameter ambiguity". (I.e., does the given real number represent a segment, path or subpath
parameter?) To counter the tendency for confusion, the module wraps parameter values inside of a
larger `Address` object that disambiguates the type of the parameter. `Address` objects can be
substituted at all points in the API for parameter values, and the module will check that the right
type of `Address` object is used in the right place.

## Prerequisites

- **numpy**

## Licence

This module is under a MIT License.

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2FvistuleB%2Fsvgpathsio.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2FvistuleB%2Fsvgpathsio
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=vistuleB%2Fsvgpathsio.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=vistuleB%2Fsvgpathsio
- [vistuleB](./vistuleB.md) - source: /vistuleB
- [svgpathsio](./vistuleB-svgpathsio.md) - source: /vistuleB/svgpathsio
- [Pull requests](./vistuleB-svgpathsio-pulls.md) - source: /vistuleB/svgpathsio/pulls
- [Actions](./vistuleB-svgpathsio-actions.md) - source: /vistuleB/svgpathsio/actions
- [Projects](./vistuleB-svgpathsio-projects.md) - source: /vistuleB/svgpathsio/projects
- [Wiki](./vistuleB-svgpathsio-wiki.md) - source: /vistuleB/svgpathsio/wiki
- [Security and quality](./vistuleB-svgpathsio-security.md) - source: /vistuleB/svgpathsio/security
- [Insights](./vistuleB-svgpathsio-pulse.md) - source: /vistuleB/svgpathsio/pulse
- [mathandy/svgpathtools](./mathandy-svgpathtools.md) - source: /mathandy/svgpathtools
- [Notifications](./login?return_to=%2FvistuleB%2Fsvgpathsio.md) - source: /login?return_to=%2FvistuleB%2Fsvgpathsio
- [Activity](./vistuleB-svgpathsio-activity.md) - source: /vistuleB/svgpathsio/activity
- [0 forks](./vistuleB-svgpathsio-forks.md) - source: /vistuleB/svgpathsio/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2FvistuleB%2Fsvgpathsio&report=vistuleB+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2FvistuleB%2Fsvgpathsio&report=vistuleB+%28user%29
- [5 Branches](./vistuleB-svgpathsio-branches.md) - source: /vistuleB/svgpathsio/branches
- [13 Tags](./vistuleB-svgpathsio-tags.md) - source: /vistuleB/svgpathsio/tags
- [88 commits ahead of](./vistuleB-svgpathsio-compare-mathandy%3Asvgpathtools%3Amaster...master.md) - source: /vistuleB/svgpathsio/compare/mathandy%3Asvgpathtools%3Amaster...master
- [252 commits behind](./vistuleB-svgpathsio-compare-master...mathandy%3Asvgpathtools%3Amaster.md) - source: /vistuleB/svgpathsio/compare/master...mathandy%3Asvgpathtools%3Amaster
- [vistuleB](./vistuleB-svgpathsio-commits?author=vistuleB.md) - source: /vistuleB/svgpathsio/commits?author=vistuleB
- [latest](./vistuleB-svgpathsio-commit-da086e3b47e4630406c9203c400b7d1c891794e3.md) - source: /vistuleB/svgpathsio/commit/da086e3b47e4630406c9203c400b7d1c891794e3
- [221 Commits](./vistuleB-svgpathsio-commits-master.md) - source: /vistuleB/svgpathsio/commits/master/
- [svgpathsio](./vistuleB-svgpathsio-tree-master-svgpathsio.md) - source: /vistuleB/svgpathsio/tree/master/svgpathsio
- [.gitignore](./vistuleB-svgpathsio-blob-master-.gitignore.md) - source: /vistuleB/svgpathsio/blob/master/.gitignore
- [removed build & eggs-info from git repo](./vistuleB-svgpathsio-commit-2b1670460e97b896077ae2370f4a5b750d3adfc8.md) - source: /vistuleB/svgpathsio/commit/2b1670460e97b896077ae2370f4a5b750d3adfc8
- [.travis.yml](./vistuleB-svgpathsio-blob-master-.travis.yml.md) - source: /vistuleB/svgpathsio/blob/master/.travis.yml
- [added SciPy to Travis CI environment](./vistuleB-svgpathsio-commit-f77f94db5b4af0ab00f1e8f0596a00e817eff941.md) - source: /vistuleB/svgpathsio/commit/f77f94db5b4af0ab00f1e8f0596a00e817eff941
- [README.rst](./vistuleB-svgpathsio-blob-master-README.rst.md) - source: /vistuleB/svgpathsio/blob/master/README.rst
- [redid README](./vistuleB-svgpathsio-commit-0de41c8e72bf177e374a374d96c883f3157c5130.md) - source: /vistuleB/svgpathsio/commit/0de41c8e72bf177e374a374d96c883f3157c5130
- [decorated_ellipse.svg](./vistuleB-svgpathsio-blob-master-decorated_ellipse.svg.md) - source: /vistuleB/svgpathsio/blob/master/decorated_ellipse.svg
- [initial commit](./vistuleB-svgpathsio-commit-9b3d6fe5e3513e03235822e4bbf5352abef46dd2.md) - source: /vistuleB/svgpathsio/commit/9b3d6fe5e3513e03235822e4bbf5352abef46dd2
- [output1.svg](./vistuleB-svgpathsio-blob-master-output1.svg.md) - source: /vistuleB/svgpathsio/blob/master/output1.svg
- [add ability to preserve svg-attributes](./vistuleB-svgpathsio-commit-15d186ff33af1f9bfbe1f2ea9e36a9d61ad3ff68.md) - source: /vistuleB/svgpathsio/commit/15d186ff33af1f9bfbe1f2ea9e36a9d61ad3ff68
- [output2.svg](./vistuleB-svgpathsio-blob-master-output2.svg.md) - source: /vistuleB/svgpathsio/blob/master/output2.svg
- [output_intersections.svg](./vistuleB-svgpathsio-blob-master-output_intersections.svg.md) - source: /vistuleB/svgpathsio/blob/master/output_intersections.svg
- [path.svg](./vistuleB-svgpathsio-blob-master-path.svg.md) - source: /vistuleB/svgpathsio/blob/master/path.svg
- [test.svg](./vistuleB-svgpathsio-blob-master-test.svg.md) - source: /vistuleB/svgpathsio/blob/master/test.svg
- [vectorframes.svg](./vistuleB-svgpathsio-blob-master-vectorframes.svg.md) - source: /vistuleB/svgpathsio/blob/master/vectorframes.svg
- [Releases](./vistuleB-svgpathsio-releases.md) - source: /vistuleB/svgpathsio/releases
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
