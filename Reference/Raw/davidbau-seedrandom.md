# seedrandom.js


[![Build Status](https://camo.githubusercontent.com/d17855eb6b91c8ec009b7242415a88f5450870a9740cf319170c0b6e7e108d78/68747470733a2f2f7472617669732d63692e6f72672f64617669646261752f7365656472616e646f6d2e7376673f6272616e63683d6d6173746572)](https://travis-ci.org/davidbau/seedrandom) [![NPM version](https://camo.githubusercontent.com/5f104d203588b2bc089be0207171fda27951265b6de90acc07909b1e83351f12/68747470733a2f2f62616467652e667572792e696f2f6a732f7365656472616e646f6d2e737667)](http://badge.fury.io/js/seedrandom) [![Bower version](https://camo.githubusercontent.com/b037ba207ed9c9ecc9fdab2c0e57c3b7a4bfef771aeeb9f9899af03116489a73/68747470733a2f2f62616467652e667572792e696f2f626f2f7365656472616e646f6d2e737667)](http://badge.fury.io/bo/seedrandom)

Seeded random number generator for JavaScript.

Version 3.0.5

Author: David Bau

Date: 2019-09-14

Can be used as a plain script, a Node.js module or an AMD module.

## Script tag usage


\<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"\>\
\</script\>

// Make a predictable pseudorandom number generator.\
var myrng = new Math.seedrandom('hello.');\
console.log(myrng());                // Always 0.9282578795792454\
console.log(myrng());                // Always 0.3752569768646784\
\
// Use "quick" to get only 32 bits of randomness in a float.\
console.log(myrng.quick());          // Always 0.7316977467853576\
\
// Use "int32" to get a 32 bit (signed) integer\
console.log(myrng.int32());          // Always 1966374204\
\
// Calling seedrandom with no arguments creates an ARC4-based PRNG\
// that is autoseeded using the current time, dom state, and other\
// accumulated local entropy.\
var prng = new Math.seedrandom();\
console.log(prng());                // Reasonably unpredictable.\
\
// Seeds using the given explicit seed mixed with accumulated entropy.\
prng = new Math.seedrandom('added entropy.', { entropy: true });\
console.log(prng());                // As unpredictable as added entropy.\
\
// Warning: if you call Math.seedrandom without \`new\`, it replaces\
// Math.random with the predictable new Math.seedrandom(...), as follows:\
Math.seedrandom('hello.');\
console.log(Math.random());          // Always 0.9282578795792454\
console.log(Math.random());          // Always 0.3752569768646784

**Note**: calling `Math.seedrandom('constant')` without `new` will make `Math.random()` predictable globally, which is intended to be useful for derandomizing code for testing, but should not be done in a production library. If you need a local seeded PRNG, use `myrng = new Math.seedrandom('seed')` instead. For example, [cryptico](https://www.npmjs.com/package/cryptico), an RSA encryption package, [uses the wrong form](https://github.com/wwwtyro/cryptico/blob/9291ece6/api.js#L264), and thus secretly makes `Math.random()` perfectly predictable. The cryptico library (and any other library that does this) should not be trusted in a security-sensitive application.

## Other Fast PRNG Algorithms


The package includes some other fast PRNGs. To use Johannes Baagøe's extremely fast Alea PRNG:

\<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/lib/alea.min.js"\>\
\</script\>

// Use alea for Johannes Baagøe's clever and fast floating-point RNG.\
var arng = new alea('hello.');\
\
// By default provides 32 bits of randomness in a float.\
console.log(arng());               // Always 0.4783254903741181\
\
// Use "double" to get 56 bits of randomness.\
console.log(arng.double());        // Always 0.8297006866124559\
\
// Use "int32" to get a 32 bit (signed) integer.\
console.log(arng.int32());         // Always 1076136327

Besides alea, there are several other faster PRNGs available. Note that none of these fast PRNGs provide autoseeding: you need to provide your own seed (or use the default autoseeded seedrandom to make a seed).

| PRNG name   | Time vs native | Period      | Author                |
|-------------|----------------|-------------|-----------------------|
| `alea`      | 1.95 ns, 0.9x  | ~2^116      | Baagøe                |
| `xor128`    | 2.04 ns, 0.9x  | 2^128-1     | Marsaglia             |
| `tychei`    | 2.32 ns, 1.1x  | ~2^127      | Neves/Araujo (ChaCha) |
| `xorwow`    | 2.40 ns, 1.1x  | 2^192-2^32  | Marsaglia             |
| `xor4096`   | 2.40 ns, 1.1x  | 2^4096-2^32 | Brent (xorgens)       |
| `xorshift7` | 2.64 ns, 1.3x  | 2^256-1     | Panneton/L'ecuyer     |
| `quick`     | 3.80 ns, 1.8x  | ~2^1600     | Bau (ARC4)            |

(Timings were done on node v0.12.2 on a single-core Google Compute Engine instance. `quick` is just the 32-bit version of the RC4-based PRNG originally packaged with seedrandom.)

## CJS / Node.js usage


```
npm install seedrandom
```

// Local PRNG: does not affect Math.random.\
var seedrandom = require('seedrandom');\
var rng = seedrandom('hello.');\
console.log(rng());                  // Always 0.9282578795792454\
\
// Global PRNG: set Math.random.\
seedrandom('hello.', { global: true });\
console.log(Math.random());          // Always 0.9282578795792454\
\
// Autoseeded ARC4-based PRNG.\
rng = seedrandom();\
console.log(rng());                  // Reasonably unpredictable.\
\
// Mixing accumulated entropy.\
rng = seedrandom('added entropy.', { entropy: true });\
console.log(rng());                  // As unpredictable as added entropy.\
\
// Using alternate algorithms, as listed above.\
var rng2 = seedrandom.xor4096('hello.')\
console.log(rng2());

Starting in version 3, when using via require('seedrandom'), the global `Math.seedrandom` is no longer available.

## Require.js usage


Similar to Node.js usage:

```
bower install seedrandom
```

```
require(['seedrandom'], function(seedrandom) {
  var rng = seedrandom('hello.');
  console.log(rng());                  // Always 0.9282578795792454
});
```

## Network seeding


\<script src=//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js\>\
\</script\>\
\<!-- Seeds using urandom bits from a server. --\>\
\<script src=//jsonlib.appspot.com/urandom?callback=Math.seedrandom\>\
\</script\>\
\
\<!-- Seeds mixing in random.org bits --\>\
\<script\>\
(function(x, u, s){\
  try {\
    // Make a synchronous request to random.org.\
    x.open('GET', u, false);\
    x.send();\
    s = unescape(x.response.trim().replace(/^\|\s/g, '%'));\
  } finally {\
    // Seed with the response, or autoseed on failure.\
    Math.seedrandom(s, !!s);\
  }\
})(new XMLHttpRequest, 'https://www.random.org/integers/' +\
  '?num=256&min=0&max=255&col=1&base=16&format=plain&rnd=new');\
\</script\>

## Reseeding using user input


var seed = Math.seedrandom();        // Use prng with an automatic seed.\
document.write(Math.random());       // Pretty much unpredictable x.\
\
var rng = new Math.seedrandom(seed); // A new prng with the same seed.\
document.write(rng());               // Repeat the 'unpredictable' x.\
\
function reseed(event, count) {      // Define a custom entropy collector.\
  var t = \[\];\
  function w(e) {\
    t.push(\[e.pageX, e.pageY, +new Date\]);\
    if (t.length \< count) { return; }\
    document.removeEventListener(event, w);\
    Math.seedrandom(t, { entropy: true });\
  }\
  document.addEventListener(event, w);\
}\
reseed('mousemove', 100);            // Reseed after 100 mouse moves.

The "pass" option can be used to get both the prng and the seed. The following returns both an autoseeded prng and the seed as an object, without mutating Math.random:

var obj = Math.seedrandom(null, { pass: function(prng, seed) {\
  return { random: prng, seed: seed };\
}});

## Saving and Restoring PRNG state


var seedrandom = Math.seedrandom;\
var saveable = seedrandom("secret-seed", {state: true});\
for (var j = 0; j \< 1e5; ++j) saveable();\
var saved = saveable.state();\
var replica = seedrandom("", {state: saved});\
assert(replica() == saveable());

In normal use the prng is opaque and its internal state cannot be accessed. However, if the "state" option is specified, the prng gets a state() method that returns a plain object the can be used to reconstruct a prng later in the same state (by passing that saved object back as the state option).

## Version notes


The random number sequence is the same as version 1.0 for string seeds.

- Version 2.0 changed the sequence for non-string seeds.
- Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
- Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
- Version 2.3 adds support for "new", module loading, and a null seed arg.
- Version 2.3.1 adds a build environment, module packaging, and tests.
- Version 2.3.4 fixes bugs on IE8, and switches to MIT license.
- Version 2.3.6 adds a readable options object argument.
- Version 2.3.10 adds support for node.js crypto (contributed by ctd1500).
- Version 2.3.11 adds an option to load and save internal state.
- Version 2.4.0 adds implementations of several other fast PRNGs.
- Version 2.4.2 adds an implementation of Baagoe's very fast Alea PRNG.
- Version 2.4.3 ignores nodejs crypto when under browserify.
- Version 2.4.4 avoids strict mode problem with global this reference.
- Version 3.0.1 removes Math.seedrandom for require('seedrandom') users.
- Version 3.0.3 updates package.json for CDN entrypoints.
- Version 3.0.5 removes eval to avoid triggering content-security policy.

The standard ARC4 key scheduler cycles short keys, which means that seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'. Therefore it is a good idea to add a terminator to avoid trivial equivalences on short string seeds, e.g., Math.seedrandom(str + '\0'). Starting with version 2.0, a terminator is added automatically for non-string seeds, so seeding with the number 111 is the same as seeding with '111\0'.

When seedrandom() is called with zero args or a null seed, it uses a seed drawn from the browser crypto object if present. If there is no crypto support, seedrandom() uses the current time, the native rng, and a walk of several DOM objects to collect a few bits of entropy.

Each time the one- or two-argument forms of seedrandom are called, entropy from the passed seed is accumulated in a pool to help generate future seeds for the zero- and two-argument forms of seedrandom.

On speed - This javascript implementation of Math.random() is several times slower than the built-in Math.random() because it is not native code, but that is typically fast enough. Some details (timings on Chrome 25 on a 2010 vintage macbook):

- seeded Math.random() - avg less than 0.0002 milliseconds per call
- seedrandom('explicit.') - avg less than 0.2 milliseconds per call
- seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
- seedrandom() with crypto - avg less than 0.2 milliseconds per call

Autoseeding without crypto is somewhat slow, about 20-30 milliseconds on a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera. Seeded rng calls themselves are fast across these browsers, with slowest numbers on Opera at about 0.0005 ms per seeded Math.random().

## LICENSE (MIT)


Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fdavidbau%2Fseedrandom`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=davidbau%2Fseedrandom`
- davidbau - source: `/davidbau`
- [seedrandom](./davidbau-seedrandom.md) - source: /davidbau/seedrandom
- Issues 10 - source: `/davidbau/seedrandom/issues`
- Pull requests 1 - source: `/davidbau/seedrandom/pulls`
- Actions - source: `/davidbau/seedrandom/actions`
- Projects - source: `/davidbau/seedrandom/projects`
- Wiki - source: `/davidbau/seedrandom/wiki`
- Security and quality - source: `/davidbau/seedrandom/security`
- Insights - source: `/davidbau/seedrandom/pulse`
- Notifications - source: `/login?return_to=%2Fdavidbau%2Fseedrandom`
- Activity - source: `/davidbau/seedrandom/activity`
- 168 forks - source: `/davidbau/seedrandom/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fdavidbau%2Fseedrandom&report=davidbau+%28user%29`
- 2 Branches - source: `/davidbau/seedrandom/branches`
- 25 Tags - source: `/davidbau/seedrandom/tags`
- davidbau - source: `/davidbau/seedrandom/commits?author=davidbau`
- release 3.0.5 - source: `/davidbau/seedrandom/commit/4460ad325a0a15273a211e509f03ae0beb99511a`
- 161 Commits - source: `/davidbau/seedrandom/commits/released/`
- lib - source: `/davidbau/seedrandom/tree/released/lib`
- Update npm packages. - source: `/davidbau/seedrandom/commit/9a841c893894bf360966f5245ba8151f87a999dc`
- test - source: `/davidbau/seedrandom/tree/released/test`
- Prepare for 3.0.5 release. - source: `/davidbau/seedrandom/commit/45a8a57ec1fd8abbd3b0776dcd6d9a6918c9ff69`
- .coveralls.yml - source: `/davidbau/seedrandom/blob/released/.coveralls.yml`
- Rearrange names, add travis coveralls yml. - source: `/davidbau/seedrandom/commit/8523b852123b64985b353032a4f38e11a2104e98`
- .gitignore - source: `/davidbau/seedrandom/blob/released/.gitignore`
- Move from istanbul tool to nyc. - source: `/davidbau/seedrandom/commit/12cb7e99b2d46b0e81d1fe4348d2bde8625ae5ad`
- .npmignore - source: `/davidbau/seedrandom/blob/released/.npmignore`
- Ignore the test directory in npm pacakage (472K) - source: `/davidbau/seedrandom/commit/2d5b1f62d1c31ce7fb1350ad4a96c9205c595b54`
- .nvmrc - source: `/davidbau/seedrandom/blob/released/.nvmrc`
- Upgrade to qunit 2.0. - source: `/davidbau/seedrandom/commit/a1895d0d56a2a9b308b1bdc1d2e572a70288a798`
- .travis.yml - source: `/davidbau/seedrandom/blob/released/.travis.yml`
- Eliminate old node versions for travis. - source: `/davidbau/seedrandom/commit/4faff3bd9e8cb16e07f1944de206cf8a908ee8c9`
- Gruntfile.js - source: `/davidbau/seedrandom/blob/released/Gruntfile.js`
- Switch back to patched grunt-release. - source: `/davidbau/seedrandom/commit/a72457f0a9edb4446b1055cb68e42a60a79e665b`
- README.md - source: `/davidbau/seedrandom/blob/released/README.md`
- bower.json - source: `/davidbau/seedrandom/blob/released/bower.json`
- Update bower.json to current conventions. - source: `/davidbau/seedrandom/commit/c6052aab2f90a8a7d4011bf352d0ade10bd746c8`
- component.json - source: `/davidbau/seedrandom/blob/released/component.json`
- version bump to 3.0.0. - source: `/davidbau/seedrandom/commit/872042c8f042558e59b90a416da4fb6b8fd0ea0a`
- index.js - source: `/davidbau/seedrandom/blob/released/index.js`
- Include the impressively fast alea algorithm. - source: `/davidbau/seedrandom/commit/55c92f55b35d65364766af94b8ffa2ad9830c4fb`
- package-lock.json - source: `/davidbau/seedrandom/blob/released/package-lock.json`
- package.json - source: `/davidbau/seedrandom/blob/released/package.json`
- seedrandom.js - source: `/davidbau/seedrandom/blob/released/seedrandom.js`
- Avoid using eval() to get global object. - source: `/davidbau/seedrandom/commit/5f2ec4218ff700fd0dba5b2d5782d0ac4ad19df5`
- seedrandom.min.js - source: `/davidbau/seedrandom/blob/released/seedrandom.min.js`
- [https://travis-ci.org/davidbau/seedrandom](https://travis-ci.org/davidbau/seedrandom)
- [http://badge.fury.io/js/seedrandom](http://badge.fury.io/js/seedrandom)
- [http://badge.fury.io/bo/seedrandom](http://badge.fury.io/bo/seedrandom)
- [cryptico](https://www.npmjs.com/package/cryptico)
- [uses the wrong form](https://github.com/wwwtyro/cryptico/blob/9291ece6/api.js#L264)
- Releases - source: `/davidbau/seedrandom/releases`
- Used by - source: `/davidbau/seedrandom/network/dependents`
- Contributors - source: `/davidbau/seedrandom/graphs/contributors`
- /TimothyGu - source: `/TimothyGu`
- /danielledeleo - source: `/danielledeleo`
- /mreinstein - source: `/mreinstein`
- /tmcw - source: `/tmcw`
- /automata - source: `/automata`
- /bluelovers - source: `/bluelovers`
- /jared-stilwell - source: `/jared-stilwell`
- /ZJONSSON - source: `/ZJONSSON`
- /louh - source: `/louh`
- /dave-5 - source: `/dave-5`
- JavaScript 81.3% - source: `/davidbau/seedrandom/search?l=javascript`
- HTML 18.5% - source: `/davidbau/seedrandom/search?l=html`
- Shell 0.2% - source: `/davidbau/seedrandom/search?l=shell`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
