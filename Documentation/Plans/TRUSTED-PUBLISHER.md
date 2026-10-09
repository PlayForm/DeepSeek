# TRUSTED-PUBLISHER - the OIDC empty-first-publish runbook (the 25 packages)

> The Compress-style publishing: the packages must EXIST on npm before the
> trusted publishers can bind. The user performs two manual steps, everything
> else is automated by the armed `.github/workflows/NPM.yml` (the L0 -> L1 ->
> L2 order, `--provenance`, the `Release` environment, `id-token: write`).
> Prepared by the VERIFIED-PUBLISHING lane. Nothing committed - the user commits.

## 0. THE VERSION STRATEGY (documented once, applies to all 25)

- The placeholder is published at **0.0.0** - deliberately BELOW the real
  **0.0.1**, so the real releases never collide with the placeholders.
- **ONCE ON NPM, A VERSION IS IMMUTABLE.** 0.0.0 can never be republished or
  overwritten; it stays as the permanent placeholder history. This is why the
  placeholder carries a MINIMAL package.json (name + version + access) and
  nothing else - it is never intended to be installed; the real 0.0.1 follows
  from the monorepo publish.
- `npm unpublish` within 72h can remove a mistaken publish, but do not rely on
  it; treat every publish as permanent.

## 1. THE EMPTY-FIRST-PUBLISH SEQUENCE (the user runs locally, with their token)

Run from the repository root. It scaffolds a throwaway minimal package per
name in a temp dir and publishes 0.0.0 for all 25 names in the topological
order (L0 -> L1 -> L2):

```bash
set -euo pipefail
NAMES=(
  # L0 - the base
  "@playform/ets-dsh-hook"
  # L1 - the four foundations
  "@playform/hook-dsh-core"
  "@playform/plugin-dsh-factory"
  "@playform/ets-hook-dsh-core"
  "@playform/ets-plugin-dsh-factory"
  # L2 - the twenty consumers (order within the layer is arbitrary)
  "@playform/hook-dsh-cargo-governor"
  "@playform/hook-dsh-normalize-dash"
  "@playform/hook-dsh-normalize-ellipsis"
  "@playform/hook-dsh-normalize-file"
  "@playform/hook-dsh-normalize-fullwidth"
  "@playform/hook-dsh-normalize-invisible"
  "@playform/hook-dsh-normalize-quotes"
  "@playform/hook-dsh-normalize-spaces"
  "@playform/hook-dsh-package-governor"
  "@playform/hook-dsh-package-pinner"
  "@playform/ets-hook-dsh-cargo-governor"
  "@playform/ets-hook-dsh-normalize-dash"
  "@playform/ets-hook-dsh-normalize-ellipsis"
  "@playform/ets-hook-dsh-normalize-file"
  "@playform/ets-hook-dsh-normalize-fullwidth"
  "@playform/ets-hook-dsh-normalize-invisible"
  "@playform/ets-hook-dsh-normalize-quotes"
  "@playform/ets-hook-dsh-normalize-spaces"
  "@playform/ets-hook-dsh-package-governor"
  "@playform/ets-hook-dsh-package-pinner"
)
WORK="$(mktemp -d)"
for NAME in "${NAMES[@]}"; do
  SAFE="$(echo "$NAME" | sed 's/@playform\///')"
  mkdir -p "$WORK/$SAFE"
  cat > "$WORK/$SAFE/package.json" <<EOF
{
	"name": "$NAME",
	"version": "0.0.0",
	"description": "Placeholder publication (the real package ships from github.com/PlayForm/DeepSeek).",
	"license": "CC0-1.0",
	"repository": "github:PlayForm/DeepSeek",
	"publishConfig": { "access": "public" }
}
EOF
  (cd "$WORK/$SAFE" && npm publish --access public)
done
```

- Requires `npm login` beforehand (or `NPM_TOKEN` exported; the token needs
  publish rights on the `@playform` scope).
- If a name already exists on npm (none of the old `hook-dsh-*` names were
  ever published - verified in SPLICE-ETS.md), the publish fails harmlessly;
  skip that name.

## 2. THE TRUSTED-PUBLISHER SPEC (the user pastes into each npm package page)

After all 25 names exist: for EACH package, npm web UI -> the package page ->
Settings -> Publishing access -> "Connect a supported source code repository"
(or npmjs.com -> account -> Package settings). The values are IDENTICAL for
all 25 entries (the Compress screenshot's pattern):

| Field                | Value                          |
| -------------------- | ------------------------------ |
| GitHub account       | `PlayForm`                     |
| Repository           | `DeepSeek`                     |
| Workflow filename    | `NPM.yml`                      |
| Environment          | `Release`                      |
| Permissions          | `npm publish` (+ `npm stage publish` if the form offers it) |

The 25 package pages to configure (same shape each):

`@playform/ets-dsh-hook`, `@playform/hook-dsh-core`, `@playform/plugin-dsh-factory`,
`@playform/ets-hook-dsh-core`, `@playform/ets-plugin-dsh-factory`,
`@playform/hook-dsh-cargo-governor`, `@playform/hook-dsh-normalize-dash`,
`@playform/hook-dsh-normalize-ellipsis`, `@playform/hook-dsh-normalize-file`,
`@playform/hook-dsh-normalize-fullwidth`, `@playform/hook-dsh-normalize-invisible`,
`@playform/hook-dsh-normalize-quotes`, `@playform/hook-dsh-normalize-spaces`,
`@playform/hook-dsh-package-governor`, `@playform/hook-dsh-package-pinner`,
`@playform/ets-hook-dsh-cargo-governor`, `@playform/ets-hook-dsh-normalize-dash`,
`@playform/ets-hook-dsh-normalize-ellipsis`, `@playform/ets-hook-dsh-normalize-file`,
`@playform/ets-hook-dsh-normalize-fullwidth`, `@playform/ets-hook-dsh-normalize-invisible`,
`@playform/ets-hook-dsh-normalize-quotes`, `@playform/ets-hook-dsh-normalize-spaces`,
`@playform/ets-hook-dsh-package-governor`, `@playform/ets-hook-dsh-package-pinner`.

Notes:
- The environment must be named exactly `Release` in the GitHub repository
  settings too (the workflow's `environment: Release` refers to it).
- The workflow file must be on the repository's default branch for npm's
  trusted-publisher check to resolve it.

## 3. THE FIRST REAL PUBLISH (the verification run)

With the trusted publishers bound, the first run of the workflow (or the
user's local equivalent with `--provenance`) publishes the REAL 0.0.1 for all
25 packages with OIDC provenance attestations. Order: L0 -> L1 -> L2 (the
workflow encodes this; locally, run the same sequence).

## 4. THE CAVEATS (repeated for emphasis)

- **ONCE ON NPM** - a published version is immutable; never republish 0.0.0.
- The placeholders ship with no code; anyone installing `@playform/*@0.0.0`
  gets an empty package. Acceptable for a brief window; the real 0.0.1 lands
  immediately after the trusted publishers bind.
- The local placeholder publishes have NO provenance (correct - provenance
  requires the GitHub OIDC context of the workflow run).
