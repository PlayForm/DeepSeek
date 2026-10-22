---
title: The Planned Plugin Suite - the smoke pass brief (E3)
category: Plans
kind: living-plan
date: 2026-10-22
status: complete
registry: Documentation/Plans/SMOKE-PASS-BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the smoke suites for the 36 new Classic packages
		state: implemented
		evidence: every new package carries its Source/Test suites; the build pass is green
	- name: the aggregate run (Maintain/Run-Smokes.mjs)
		state: implemented
		evidence: 359 suites / 5,337 checks, all green (the runner's last line)
---

# THE PLANNED PLUGIN SUITE - THE SMOKE PASS BRIEF (E3)

> The end-phase smoke pass for the 36 new Classic packages. The law:
> Documentation/Skill/smoke-writing/SKILL.md (read it first; the fake-context harness, the
> byte-identical ledger law, the count guard, the traps, the parity rule). The POC brief:
> Documentation/Plans/POC-BRIEF.md.

## 1. The per-package deliverable

1. `Source/Test/Harness.ts` - the fake context, adapted from the reference
   `Classic/packages/hook-dsh-workspace-observe/Source/Test/Harness.ts` (the freshest greenfield
   harness: registration capture, effect, get, reflect, fs capture, waterfall, logger, root
   identity, state probe).
2. One to three `Source/Test/<Folder>/` folders, each with `Test.ts` and a `README.md` carrying
   `## Expected count` and `<N> PASS.`.
3. The two-step build in `Source/prepublishOnly.sh` and `Source/Run.sh`: the plugin build FIRST, the
   test build SECOND (the live-containers pattern: the negation on the plugin pattern, the Harness
   selfcheck, the Test noemit tsc). The `Configuration/Test-ESBuild.ts` + `.js` and the
   `TypeScript-Test.noemit.json` already exist in every new package.
4. Build with
   `pnpm --config.verify-deps-before-run=false --dir Classic/packages/<pkg> run prepublishOnly` (the
   flag is mandatory), then run each folder with
   `node Classic/packages/<pkg>/Target/Test/<Folder>/Test.js` and compare the printed
   `N PASS - <Name>` with the README.

## 2. What every suite must cover (the per-package minimum)

- The loader contract: the default object carries name/apply/Config/inject; the service registers
  (or the hook registers its listeners); a bad config fails loud.
- The role's core behavior: the service methods (or the listeners' effects) with the real built
  library against the fake ctx.
- The ledger strings: byte-identical assertions for every module-owned line the package emits (the
  logger form and the durable form where the module has both).
- Purity: zero `writeText`/`readText` calls where the package must not touch the fs; zero timers
  where the no-timers rule applies.
- The silence/no-wall-clock invariants where the package has them.

## 3. The traps (do not fall in)

- Vacuously green: the suite must exercise the built code, not the fixture.
- Swapped assert: read the assertion's intent; `assert.equal(boolean, string)` is a defect.
- Weakening: a failing smoke means the CODE is wrong (or the expectation is wrong in a way the plan
  can justify) - never weaken the assertion.
- The count guard: every folder declares its count; the aggregate compares.

## 4. The report

```text
PACKAGES: <the lane's packages>
BUILD: <exit 0 per package>
SMOKES: <the printed N PASS - <Name> per folder, with the README counts>
COVERAGE: covered <N> of <M> required suites
RESIDUALS: <what is not covered and why>
READY-TO-COMMIT: <the package roots>
```

If a package cannot be smoked (a seam the fake cannot provide), say so explicitly and keep the
partial as partial. If blocked: `ESCALATION: <concrete reason>`.

## 5. The aggregate (the Lead)

After the lanes report: `node Maintain/Run-Smokes.mjs` (the aggregate compares each folder's printed
count with its README). The per-folder READMEs are the arbiter; the tree's smokes/README.md manifest
line is a summary that can lag - verify it before quoting a total.
