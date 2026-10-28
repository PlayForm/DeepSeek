# cytoscape-elk


## Description


The [elk](https://github.com/OpenKieler/elkjs) layout algorithm adapter for Cytoscape.js

[ELK](https://www.eclipse.org/elk/) is a set of layout algorithms implemented by the Eclipse Foundation in Java. The source code is compiled to JS by the [ELK.js](https://github.com/kieler/elkjs) project using GWT. This Cytoscape extension adds support for the ELK layout aglorithms in Cytoscape.

## Dependencies


- Cytoscape.js \>= 3.2.0
- elkjs \>= 0.9.2

## Usage instructions


Download the library:

- via npm or yarn: `npm install cytoscape-elk` or `yarn add cytoscape-elk`,
- via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

import cytoscape from 'cytoscape';\
import elk from 'cytoscape-elk';\
\
cytoscape.use( elk );

CommonJS require:

let cytoscape = require('cytoscape');\
let elk = require('cytoscape-elk');\
\
cytoscape.use( elk ); // register extension

AMD:

require(\['cytoscape', 'cytoscape-elk'\], function( cytoscape, elk ){\
  elk( cytoscape ); // register extension\
});

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.

## API


var options = {\
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions\
  fit: true, // Whether to fit\
  padding: 20, // Padding on fit\
  animate: false, // Whether to transition the node positions\
  animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions\
  animationDuration: 500, // Duration of animation in ms if enabled\
  animationEasing: undefined, // Easing of animation if enabled\
  transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position\
  ready: undefined, // Callback on layoutready\
  stop: undefined, // Callback on layoutstop\
  nodeLayoutOptions: undefined, // Per-node options function\
  elk: {\
    // All options are available at http://www.eclipse.org/elk/reference.html\
    //\
    // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.\
    // E.g. for 'org.eclipse.elk.direction' use:\
    // 'elk.direction'\
    //\
    // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:\
    // 'elk.direction': 'DOWN'\
    //\
    // The main field to set is \`algorithm\`, which controls which particular layout algorithm is used.\
    // Example (downwards layered layout):\
    'algorithm': 'layered',\
    'elk.direction': 'DOWN',\
  },\
  priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled\
};\
\
cy.layout( options ).run();

You can set layout options per node by defining a `nodeLayoutOptions` function which is called on a per-node basis. This is useful for tweaking the layout of a particular node, like for [setting its partition](https://www.eclipse.org/elk/reference/options/org-eclipse-elk-partitioning-partition.html) for the layered layout. For instance, if you want to store these options within the node's `scratch` object, you can do something like this:

nodeLayoutOptions: node =\> n.scratch('layoutOptions')

The set of `options.elk.algorithm` values that are supported by ELK.js follows:

- `box` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=box)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-box.html)) Pack the nodes like boxes.
- `disco` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=disco)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-disco.html)) Pack the (disconnected) components. A secondary layout may be applied to each component via `options.elk.componentLayoutAlgorithm`.
- `force` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=force)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-force.html)) Apply a basic force-directed layout.
- `layered` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html)) Apply a hierarchical layout, appropriate for DAGs and trees.
- `mrtree` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=mrtree) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-mrtree.html)) Apply a traditional, hierarchical tree layout.
- `random` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=random)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-random.html)) Apply random positions to the nodes.
- `stress` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=stress)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-stress.html)) Apply a force-directed layout.

See the [ELK.js documentation](https://github.com/OpenKieler/elkjs) and the [ELK algorithm options documentation](https://www.eclipse.org/elk/reference/algorithms.html) for more information.

## Build targets


- `npm run test` : Run Mocha tests in `./test`
- `npm run build` : Build `./src/**` into `cytoscape.js-elk`
- `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
- `npm run dev` : Automatically build on changes with live reloading with webpack dev server
- `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.

## Publishing instructions


This project is set up to automatically be published to npm. To publish:

1.  Build the extension : `npm run build`
2.  Commit the build : `git commit -am "Build for release"`
3.  Bump the version number and tag: `npm version major|minor|patch`
4.  Push to origin: `git push && git push --tags`
5.  Publish to npm: `npm publish .`

<!--
## Source links

- [/](./index.md) - source: /
- [/login?return_to=https%3A%2F%2Fgithub.com%2Fcytoscape%2Fcytoscape.js-elk](./login?return_to=https%3A%2F%2Fgithub.com%2Fcytoscape%2Fcytoscape.js-elk.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fcytoscape%2Fcytoscape.js-elk
- [GitHub Repository hosting, code review, and collaboration](https://github.com/platform)
- [Copilot AI coding agent for tasks, projects and automated work](https://github.com/features/copilot)
- [Actions CI/CD and automation](https://github.com/features/actions)
- [Code Quality Quality analysis, fixes, and enforcement](https://github.com/features/code-quality)
- [Codespaces Cloud development environments](https://github.com/features/codespaces)
- [Code Security Vulnerability detection and remediation](https://github.com/security/advanced-security/code-security)
- [Secret Protection Secret scanning and leak prevention](https://github.com/security/advanced-security/secret-protection)
- [All Features](https://github.com/features)
- [Documentation](https://docs.github.com/en)
- [Training](https://learn.github.com/skills)
- [Certifications](https://learn.github.com/credentials)
- [Build with Copilot](https://github.com/features/ai)
- [Customize Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-copilot-overview)
- [Integrations](https://github.com/marketplace)
- [Trending repos](https://github.com/trending)
- [GitHub Sponsors](https://github.com/open-source/sponsors)
- [Events](https://github.com/resources/events)
- [Changelog Your source for the latest features, improvements, and fixes across GitHub products, all i](https://github.blog/changelog/)
- [Enterprises](https://github.com/enterprise)
- [Team](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [Why GitHub](https://github.com/why-github)
- [Customer Stories](https://github.com/customer-stories)
- [Business insights](https://github.com/solutions/executive-insights)
- [Trust Center](https://github.com/trust-center)
- [GitHub Advanced Security Enterprise-grade code security](https://github.com/security/advanced-security)
- [Copilot for business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Resource center](https://github.com/resources)
- [Blog](https://github.blog/)
- [Community Forum](https://github.com/orgs/community/discussions)
- [Customer support](https://help.github.com/)
- [GitHub Status](https://www.githubstatus.com/)
- [About](https://github.com/about)
- [Partners](https://github.com/partners)
- [GitHub Universe The event for developers, by developers — talks, workshops, and what’s next for GitH](https://githubuniverse.com/)
- [Pricing](https://github.com/pricing)
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=cytoscape%2Fcytoscape.js-elk.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=cytoscape%2Fcytoscape.js-elk
- [cytoscape](./cytoscape.md) - source: /cytoscape
- [cytoscape.js-elk](./cytoscape-cytoscape.js-elk.md) - source: /cytoscape/cytoscape.js-elk
- [Issues](./cytoscape-cytoscape.js-elk-issues.md) - source: /cytoscape/cytoscape.js-elk/issues
- [Pull requests 1](./cytoscape-cytoscape.js-elk-pulls.md) - source: /cytoscape/cytoscape.js-elk/pulls
- [Actions](./cytoscape-cytoscape.js-elk-actions.md) - source: /cytoscape/cytoscape.js-elk/actions
- [Projects](./cytoscape-cytoscape.js-elk-projects.md) - source: /cytoscape/cytoscape.js-elk/projects
- [Security and quality](./cytoscape-cytoscape.js-elk-security.md) - source: /cytoscape/cytoscape.js-elk/security
- [Insights](./cytoscape-cytoscape.js-elk-pulse.md) - source: /cytoscape/cytoscape.js-elk/pulse
- [Notifications](./login?return_to=%2Fcytoscape%2Fcytoscape.js-elk.md) - source: /login?return_to=%2Fcytoscape%2Fcytoscape.js-elk
- [Activity](./cytoscape-cytoscape.js-elk-activity.md) - source: /cytoscape/cytoscape.js-elk/activity
- [Custom properties](./cytoscape-cytoscape.js-elk-custom-properties.md) - source: /cytoscape/cytoscape.js-elk/custom-properties
- [29 forks](./cytoscape-cytoscape.js-elk-forks.md) - source: /cytoscape/cytoscape.js-elk/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fcytoscape%2Fcytoscape.js-elk&report=cytoscape+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fcytoscape%2Fcytoscape.js-elk&report=cytoscape+%28user%29
- [3 Branches](./cytoscape-cytoscape.js-elk-branches.md) - source: /cytoscape/cytoscape.js-elk/branches
- [19 Tags](./cytoscape-cytoscape.js-elk-tags.md) - source: /cytoscape/cytoscape.js-elk/tags
- [/maxkfranz](./maxkfranz.md) - source: /maxkfranz
- [maxkfranz](./cytoscape-cytoscape.js-elk-commits?author=maxkfranz.md) - source: /cytoscape/cytoscape.js-elk/commits?author=maxkfranz
- [Delete .github/stale.yml](./cytoscape-cytoscape.js-elk-commit-8cf116841e241626752b6be79053217f9b9e9101.md) - source: /cytoscape/cytoscape.js-elk/commit/8cf116841e241626752b6be79053217f9b9e9101
- [128 Commits](./cytoscape-cytoscape.js-elk-commits-master.md) - source: /cytoscape/cytoscape.js-elk/commits/master/
- [demo](./cytoscape-cytoscape.js-elk-tree-master-demo.md) - source: /cytoscape/cytoscape.js-elk/tree/master/demo
- [Upgrade to elk@0.9 and revise webpack config](./cytoscape-cytoscape.js-elk-commit-651409c6ddfb441e4cbbdc1698cea427f059967d.md) - source: /cytoscape/cytoscape.js-elk/commit/651409c6ddfb441e4cbbdc1698cea427f059967d
- [dist](./cytoscape-cytoscape.js-elk-tree-master-dist.md) - source: /cytoscape/cytoscape.js-elk/tree/master/dist
- [Build for release](./cytoscape-cytoscape.js-elk-commit-0ab0aaf3d3027f3cfd4e60d339dff3a180f06fcd.md) - source: /cytoscape/cytoscape.js-elk/commit/0ab0aaf3d3027f3cfd4e60d339dff3a180f06fcd
- [src](./cytoscape-cytoscape.js-elk-tree-master-src.md) - source: /cytoscape/cytoscape.js-elk/tree/master/src
- [Adding functional layoutOptions](./cytoscape-cytoscape.js-elk-commit-0366945e0177d8a6abcf90696fa300a7e6834438.md) - source: /cytoscape/cytoscape.js-elk/commit/0366945e0177d8a6abcf90696fa300a7e6834438
- [.babelrc](./cytoscape-cytoscape.js-elk-blob-master-.babelrc.md) - source: /cytoscape/cytoscape.js-elk/blob/master/.babelrc
- [chore(build): upgrade to Babel 7 using npx babel-upgrade](./cytoscape-cytoscape.js-elk-commit-16dfdd43683298da9656efc1759d014337ace4c5.md) - source: /cytoscape/cytoscape.js-elk/commit/16dfdd43683298da9656efc1759d014337ace4c5
- [.eslintignore](./cytoscape-cytoscape.js-elk-blob-master-.eslintignore.md) - source: /cytoscape/cytoscape.js-elk/blob/master/.eslintignore
- [Update scaffolding](./cytoscape-cytoscape.js-elk-commit-2b471679e92fa31bf457392db3a0c635bad919af.md) - source: /cytoscape/cytoscape.js-elk/commit/2b471679e92fa31bf457392db3a0c635bad919af
- [.eslintrc](./cytoscape-cytoscape.js-elk-blob-master-.eslintrc.md) - source: /cytoscape/cytoscape.js-elk/blob/master/.eslintrc
- [chore: upgrade ESLint + add & fix some prefer-*s](./cytoscape-cytoscape.js-elk-commit-8b6f0b0d09ed03143454cb8ca081318e52ea1bf0.md) - source: /cytoscape/cytoscape.js-elk/commit/8b6f0b0d09ed03143454cb8ca081318e52ea1bf0
- [.gitignore](./cytoscape-cytoscape.js-elk-blob-master-.gitignore.md) - source: /cytoscape/cytoscape.js-elk/blob/master/.gitignore
- [Fix demo deployment](./cytoscape-cytoscape.js-elk-commit-4de7a00b0fdb69893c57390e324e3861dd6ad58f.md) - source: /cytoscape/cytoscape.js-elk/commit/4de7a00b0fdb69893c57390e324e3861dd6ad58f
- [.npmignore](./cytoscape-cytoscape.js-elk-blob-master-.npmignore.md) - source: /cytoscape/cytoscape.js-elk/blob/master/.npmignore
- [LICENSE](./cytoscape-cytoscape.js-elk-blob-master-LICENSE.md) - source: /cytoscape/cytoscape.js-elk/blob/master/LICENSE
- [Do a release build](./cytoscape-cytoscape.js-elk-commit-a67585d4422051c023a9d46a5227ffb32db8664f.md) - source: /cytoscape/cytoscape.js-elk/commit/a67585d4422051c023a9d46a5227ffb32db8664f
- [README.md](./cytoscape-cytoscape.js-elk-blob-master-README.md.md) - source: /cytoscape/cytoscape.js-elk/blob/master/README.md
- [Update README.md](./cytoscape-cytoscape.js-elk-commit-bb1d03ea4f303b60c0c0fe8aea65e95154cb9dbe.md) - source: /cytoscape/cytoscape.js-elk/commit/bb1d03ea4f303b60c0c0fe8aea65e95154cb9dbe
- [package.json](./cytoscape-cytoscape.js-elk-blob-master-package.json.md) - source: /cytoscape/cytoscape.js-elk/blob/master/package.json
- [2.3.0](./cytoscape-cytoscape.js-elk-commit-30f85dd5a8b0c9682045c54d38c0b7b63cda0bef.md) - source: /cytoscape/cytoscape.js-elk/commit/30f85dd5a8b0c9682045c54d38c0b7b63cda0bef
- [webpack.config.js](./cytoscape-cytoscape.js-elk-blob-master-webpack.config.js.md) - source: /cytoscape/cytoscape.js-elk/blob/master/webpack.config.js
- [elk](https://github.com/OpenKieler/elkjs)
- [ELK](https://www.eclipse.org/elk/)
- [ELK.js](https://github.com/kieler/elkjs)
- [setting its partition](https://www.eclipse.org/elk/reference/options/org-eclipse-elk-partitioning-partition.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=box)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-box.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=disco)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-disco.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=force)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-force.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=mrtree)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-mrtree.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=random)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-random.html)
- [Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=stress)
- [Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-stress.html)
- [ELK algorithm options documentation](https://www.eclipse.org/elk/reference/algorithms.html)
- [Releases](./cytoscape-cytoscape.js-elk-releases.md) - source: /cytoscape/cytoscape.js-elk/releases
- [Used by](./cytoscape-cytoscape.js-elk-network-dependents.md) - source: /cytoscape/cytoscape.js-elk/network/dependents
- [Contributors](./cytoscape-cytoscape.js-elk-graphs-contributors.md) - source: /cytoscape/cytoscape.js-elk/graphs/contributors
- [/akx](./akx.md) - source: /akx
- [/simonwarchol](./simonwarchol.md) - source: /simonwarchol
- [/PeterTSmith](./PeterTSmith.md) - source: /PeterTSmith
- [/MarshallChen](./MarshallChen.md) - source: /MarshallChen
- [/d2fong](./d2fong.md) - source: /d2fong
- [/alexcli](./alexcli.md) - source: /alexcli
- [/Lorenz-N](./Lorenz-N.md) - source: /Lorenz-N
- [/saulshanabrook](./saulshanabrook.md) - source: /saulshanabrook
- [/jfstephe](./jfstephe.md) - source: /jfstephe
- [/itf](./itf.md) - source: /itf
- [/yuan0728a](./yuan0728a.md) - source: /yuan0728a
- [JavaScript 100%](./cytoscape-cytoscape.js-elk-search?l=javascript.md) - source: /cytoscape/cytoscape.js-elk/search?l=javascript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
