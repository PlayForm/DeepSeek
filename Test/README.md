# Test

The DeepSeek plugin family's fixture archive.

This folder holds ONLY the fixtures used to develop and prove the family's functionality: the
governance/normalize family, the raw-write/normalize-file tools, the P5 journaling, and the live
batteries.

Everything else (the unrelated experiments and examples) has been removed.

## Layout

```
Test/
├── fixtures/
│   ├── manifest/          # the manifest fixtures (the governance live batteries)
│   └── markdown/          # the markdown proof fixtures (the normalization proofs)
└── probes/                # the raw-write governance probes
```

## fixtures/manifest

| Entry | What it proves |
|---|---|
| `cargo-fixture/` | The Cargo.toml governance: the adopted cargo flavor (shorthand + public dep `toml`), the registry chain, `Cargo.lock` resolution |
| `governed-chain/` | The package.json interlock live battery: the governor + the update stage (`@deepseek-ai` chain pins, the verifyCommand run, the in-flight skip) - `governor.log` is the journaling evidence |
| `governed-test/` | The public-dep test policy: the chain pins, the rejected `tailwindcss` dep, the update-policy.json shape, the steward state |
| `sandbox-root-package.json` | The sandbox fixture root manifest (the trio interplay test entry) |

## fixtures/markdown

| Entry | What it proves |
|---|---|
| `mdash-fixture.md` | The dash normalization (em/en dashes) with the edit-exemption |
| `raw-marker-fixture.md` + `raw-marker-fixture2/3/4/7/8.md` | The raw-marker gate: every marker call variant surviving byte-for-byte |
| `raw-write-fixture-verbatim.md` | The raw-write path with normalization absent |
| `raw-write-fixture-normalized.md` | The raw-write path with normalization applied |
| `tool-args-fixture.md` + `tool-args-fixture2/3.md` | The tool-args gate: the family characters (dashes, quotes, ellipsis, unicode spaces) in tool arguments |
| `granular-normalize-fixture.md` | The granular normalize selection (per-flavor application) |
| `normalize-file-fixture.md` | The normalize-file tool (the whole-file pass) |

## probes

| Entry | What it proves |
|---|---|
| `raw-write-probe/` | The raw-write governance probes against a real package manifest |

## Pitfalls

The documented gaps of this archive, stated as they are:

- **The verifyCommand trap.** The `governed-chain/` fixture's `update-policy.json` carries
  `"verifyCommand": "pnpm install"` - on a vendored-fork workspace the forks are not on the
  public registry, so the verify fails and the fixture's `governor.log` records
  `update: verifyCommand failed (status 1)` (and the earlier `update stage FAILED (1);
  consecutive=2`). The failure is the documented cordis registry trap - the expected outcome of
  the live battery, not a bug. The `registry.json` note pins the same lesson: effectiveLatest
  pins the vendored fork versions; naive npm-latest would break the chain.
- **The fixture paths.** The fixture ledgers carry the neutralized display forms
  (`<repo-root>/governed-chain/package.json`, `$DSH_HOME/...`) - the factory renders the
  workspace root that way. The personal absolute paths exist only in the internal Boilerplate
  copies; never copy a live battery into this archive as-is.
- **The timestamp confusion.** The ledger lines are ISO UTC; the storage records are epoch
  milliseconds; the local display adds +03 - reconcile before hunting for "missing" records.
