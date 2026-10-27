---
title: Trusted-Publisher - the OIDC empty-first-publish runbook
category: Plans
kind: queued-plan
date: 2026-10-08
status: planned
registry: Documentation/Plans/TRUSTED-PUBLISHER.md
index: Documentation/INDEX.md
statuses:
    - name: the OIDC runbook (the 31 packages)
      state: open
      evidence: the runbook prepared; the two manual steps not performed
    - name: the armed NPM.yml workflow (L0 to L1 to L2)
      state: implemented
      evidence: .github/workflows/NPM.yml exists, per the runbook
    - name: the npm publishing itself
      state: deferred
      evidence: a later session; the packages are published from source only
---

# TRUSTED-PUBLISHER - the OIDC empty-first-publish runbook (the 31 packages)

> This runbook uses the Compress-style publishing flow.
> The packages must EXIST on npm before the trusted publishers can bind.
> The user performs TWO manual steps.
> The armed `.github/workflows/NPM.yml` automates everything else: the L0 -> L1 -> L2 order, `--provenance`, the `Release` environment, and `id-token: write`.
> The VERIFIED-PUBLISHING lane prepared this runbook.
> Nothing is committed, because the user commits.

## 0. THE VERSION STRATEGY (documented once, applies to all 31)

- The placeholder is published at **0.0.0**, deliberately BELOW the package's current package.json version (the actuals; **0.1.0** today), so the real releases NEVER collide with the placeholders.
- **ONCE ON NPM, A VERSION IS IMMUTABLE.**
  0.0.0 can NEVER be republished or overwritten.
  It stays as the permanent placeholder history.
  This rule is why the placeholder carries a MINIMAL package.json (name, version, and access) and nothing else.
  Nobody is EVER intended to install it.
  The real package.json version follows from the monorepo publish.
  The 0.0.1 release is already on the registry and stays immutable.
- `npm unpublish` within 72h can remove a mistaken publish, but do NOT rely on it.
  Treat EVERY publish as permanent.

## 1. THE EMPTY-FIRST-PUBLISH SEQUENCE (the user runs locally, with their token)

Run this sequence from the repository root.
It creates a temporary minimal package per name in a temp dir and publishes 0.0.0 for ALL 31 names in the topological order (L0 -> L1 -> L2):

```bash
set -euo pipefail
NAMES=(
	# L0 - the base
	"@playform/ets-base-dsh"
	# L1 - the four foundations
	"@playform/lib-dsh-core"
	"@playform/plugin-dsh-factory"
	"@playform/ets-lib-dsh-core"
	"@playform/ets-plugin-dsh-factory"
	# L2 - the twenty-six consumers (order within the layer is arbitrary)
	"@playform/hook-dsh-cargo-governor"
	"@playform/hook-dsh-ccr"
	"@playform/hook-dsh-live-containers"
	"@playform/hook-dsh-normalize-dash"
	"@playform/hook-dsh-normalize-ellipsis"
	"@playform/plugin-dsh-normalize-file"
	"@playform/hook-dsh-normalize-fullwidth"
	"@playform/hook-dsh-normalize-invisible"
	"@playform/hook-dsh-normalize-quotes"
	"@playform/hook-dsh-normalize-spaces"
	"@playform/hook-dsh-package-governor"
	"@playform/hook-dsh-package-pinner"
	"@playform/hook-dsh-tool-coach"
	"@playform/ets-hook-dsh-cargo-governor"
	"@playform/ets-hook-dsh-ccr"
	"@playform/ets-hook-dsh-live-containers"
	"@playform/ets-hook-dsh-normalize-dash"
	"@playform/ets-hook-dsh-normalize-ellipsis"
	"@playform/ets-plugin-dsh-normalize-file"
	"@playform/ets-hook-dsh-normalize-fullwidth"
	"@playform/ets-hook-dsh-normalize-invisible"
	"@playform/ets-hook-dsh-normalize-quotes"
	"@playform/ets-hook-dsh-normalize-spaces"
	"@playform/ets-hook-dsh-package-governor"
	"@playform/ets-hook-dsh-package-pinner"
	"@playform/ets-hook-dsh-tool-coach"
)
WORK="$(mktemp -d)"
for NAME in "${NAMES[@]}"; do
	SAFE="$(echo "$NAME" | sed 's/@playform\///')"
	mkdir -p "$WORK/$SAFE"
	cat > "$WORK/$SAFE/package.json" << EOF
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

- The sequence requires `npm login` beforehand, or an exported `NPM_TOKEN`.
  The token needs publish rights on the `@playform` scope.
- If a name already exists on npm, the publish fails harmlessly.
  None of the old `hook-dsh-*` names were ever published, as verified in SPLICE-ETS.md, so skip any name that fails this way.

## 2. THE TRUSTED-PUBLISHER SPEC (the user pastes into each npm package page)

Do this step after ALL 31 names exist.
For EACH package, open the npm web UI, go to the package page, choose Settings, then Publishing access, then "Connect a supported source code repository", or use npmjs.com, then account, then Package settings.
The values are IDENTICAL for ALL 31 entries, following the pattern in the Compress screenshot:

| Field             | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| GitHub account    | `PlayForm`                                                  |
| Repository        | `DeepSeek`                                                  |
| Workflow filename | `NPM.yml`                                                   |
| Environment       | `Release`                                                   |
| Permissions       | `npm publish` (+ `npm stage publish` if the form offers it) |

The 31 package pages to configure (same shape each):

`@playform/ets-base-dsh`, `@playform/lib-dsh-core`, `@playform/plugin-dsh-factory`,
`@playform/ets-lib-dsh-core`, `@playform/ets-plugin-dsh-factory`,
`@playform/hook-dsh-cargo-governor`, `@playform/hook-dsh-ccr`, `@playform/hook-dsh-live-containers`,
`@playform/hook-dsh-normalize-dash`, `@playform/hook-dsh-normalize-ellipsis`,
`@playform/plugin-dsh-normalize-file`, `@playform/hook-dsh-normalize-fullwidth`,
`@playform/hook-dsh-normalize-invisible`, `@playform/hook-dsh-normalize-quotes`,
`@playform/hook-dsh-normalize-spaces`, `@playform/hook-dsh-package-governor`,
`@playform/hook-dsh-package-pinner`, `@playform/hook-dsh-tool-coach`,
`@playform/ets-hook-dsh-cargo-governor`, `@playform/ets-hook-dsh-ccr`,
`@playform/ets-hook-dsh-live-containers`, `@playform/ets-hook-dsh-normalize-dash`,
`@playform/ets-hook-dsh-normalize-ellipsis`, `@playform/ets-plugin-dsh-normalize-file`,
`@playform/ets-hook-dsh-normalize-fullwidth`, `@playform/ets-hook-dsh-normalize-invisible`,
`@playform/ets-hook-dsh-normalize-quotes`, `@playform/ets-hook-dsh-normalize-spaces`,
`@playform/ets-hook-dsh-package-governor`, `@playform/ets-hook-dsh-package-pinner`,
`@playform/ets-hook-dsh-tool-coach`.

Notes:

- The GitHub repository settings must name the environment exactly `Release`, because the workflow's `environment: Release` refers to it.
- The workflow file must be on the repository's default branch, because npm's trusted-publisher check resolves it there.

## 3. THE FIRST REAL PUBLISH (the verification run)

With the trusted publishers bound, the first run of the workflow, or the user's local equivalent with `--provenance`, publishes the REAL 0.1.0 for ALL 31 packages with OIDC provenance attestations.
The order is L0 -> L1 -> L2, which the workflow encodes; a local run follows the same sequence.

## 4. THE CAVEATS (repeated for emphasis)

- **ONCE ON NPM**, a published version is immutable.
  NEVER republish 0.0.0.
- The placeholders ship with NO code, so ANYONE who installs `@playform/*@0.0.0` gets an empty package.
  That result is acceptable for a brief window, because the real 0.1.0 lands immediately after the trusted publishers bind.
- The local placeholder publishes have NO provenance, which is correct, because provenance requires the GitHub OIDC context of the workflow run.
