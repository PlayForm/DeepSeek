# The Bundle Anatomy, the Build, and Activation

## The anatomy

```text
<bundle>/
  Source/
    Library.ts            the entry: name, apply, Config, inject
    Function/             the behavior, one definition per file
    Interface/            the types
    Variable/             the Config schema and defaults
  Configuration/
    ESBuild.ts            the build configuration
    ESBuild.js            the hand-kept twin the build loader swaps to
    TypeScript.noemit.json
  Target/                 the build output; never hand-edited
  README.md               the package's public description
  SCHEME.md               the design and the method ledger
```

The tsconfig path aliases (`@Function/*`, `@Interface/*`, `@Variable/*`) are rewritten to relative
output paths by `tsc-alias`.

## The build chain

`prepublishOnly` runs:

```text
Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts \
  --TypeScript Configuration/TypeScript.noemit.json
&& tsc -p tsconfig.json
&& tsc-alias -f -p tsconfig.json
```

Rules:

1. **The red build.**

    A red `tsc` fails the build.

    No `@ts-ignore`, no skipped check.

2. **The factory first.**

    The factory is rebuilt before any consumer.

    Consumers type-check against the factory's built `Target/`, not its `Source/`.

3. **The serialization.**

    Workspace builds run serialized (`--workspace-concurrency=1`).

    The packages share Targets; parallel builds race them.

4. **The Target.**

    The build wipes and regenerates `Target/`.

    Never edit `Target/` by hand; the next build discards it.

## Activation

A bundle is active when it appears in both places:

1. the profile's `package.json` dependencies (`link:` or `file:`), and
2. the profile's `dsh.profile.bundles` list.

The bundles list is what activates.

A `file:` dependency alone does not.

The patch file (`cordis.patch.yml`) declares or patches entries:

```yaml
- insert:
      - id: hook-dsh-package-governor
        name: "@playform/hook-dsh-package-governor"
        config:
            log: true
            logFile: ~/.dsh/playform/hook-dsh-package-governor.log
- id: hook-dsh-normalize-dash
  config:
      scopes:
          conversation: true
```

A bare `id:` row patches an existing entry.

Its config replaces the entry's config wholesale; it does not merge.

An unknown id is rejected.

## The dev loop

A linked checkout carries its own `node_modules` and its own `pnpm-workspace.yaml`
(`packages: [.]`).

An install inside a bundle under the profile's workspace acts on the workspace root and does nothing
to the bundle.

The loop:

1. **The build.**

    The bundle is built (`prepublishOnly`).

2. **The restart.**

    The host restarts; the loader reads `Target/Library.js` and inserts the patch rows at startup.

3. **The ledger.**

    The activation line is verified in the ledger.

## Failure modes

- **Parallel builds**: phantom type errors from a half-written Target.
- **Consumer before factory**: stale-Target errors that "fix themselves" after a rebuild.
- **`file:` without the bundles list**: installed but not activated.
- **A patch row without the insert**: the config replaces wholesale and the other fields vanish.
- **Hand-edited Target**: the next build discards the change.
