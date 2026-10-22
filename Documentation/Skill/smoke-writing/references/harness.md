# The Harness: Fake Context, Real Library

## The shape of a test

```text
<bundle>/Source/Test/<Name>/
  Test.ts        the test
  README.md      the purpose and "## Expected count" -> "<N> PASS."
```

The build compiles `Test.ts` into `<bundle>/Target/Test/<Name>/Test.js`. The README stays in
`Source/Test`; the aggregate reads it from there.

## The real library

Every test loads the bundle's REAL built `Target/Library.js`. The factory's own tests and the
consumers' tests instantiate the REAL factory against a fake context. A test that imports the
`Source` or a mock proves the mock, not the bundle.

## The fake context

| Seam        | The fake provides                                    |
| ----------- | ---------------------------------------------------- |
| `on`/`emit` | Registration capture and event emission              |
| `effect`    | Immediate execution plus a recorded disposer         |
| `get`       | The real factory or a recorded probe                 |
| `reflect`   | The plugin's own registrations                       |
| `fs`        | A capturing fs: reads, writes, intents, observations |
| `waterfall` | A chain that runs the listener and the default       |
| `logger`    | A recorder for the log lines                         |
| `root`      | `get root() { return Context; }`                     |
| state       | The `__<name>State` probe                            |

## The fake fs variants

- **Capturing fs**: records reads, writes, intents, and observations; the default for behavior
  tests.
- **Real-token fs**: issues actual version tokens so the version guard can be exercised; used by the
  pinner's tests.

## Imports and symlinks

The tests run from their smokes directory with `../packages/<bundle>/Target/...` imports. The
bundles' sibling `node_modules` symlinks are not pnpm-managed; recreate them after an install.

## Running

A single folder:

```sh
node Classic/packages/ < bundle > /Target/Test/ < Name > /Test.js
```

The aggregate:

```sh
node Maintain/Run-Smokes.mjs
```

The aggregate enumerates every `Target/Test/` folder in both trees, spawns each test, and fails when
the printed `N PASS - <Name>` line does not match the folder's README count.

## The build prerequisite

`Target/Test/` exists only after the bundle's `prepublishOnly` build. A test run without the build
runs a stale Target or nothing at all.

## Failure modes

- **Mocked library**: the test passes while the bundle is broken.
- **Wrong fixture wiring**: the test passes without exercising the code (`traps-and-parity.md`).
- **Stale Target**: the test runs yesterday's build.
- **Missing symlinks**: the test cannot resolve its sibling imports.
