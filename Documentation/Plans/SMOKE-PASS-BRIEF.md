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
	- name: the aggregate run (Maintain/Run/Smokes/Index.mjs)
		state: implemented
		evidence: 359 suites / 5,337 checks, all green (the runner's last line)
---

# THE PLANNED PLUGIN SUITE - THE SMOKE PASS BRIEF (E3)

> The end-phase smoke pass for the 36 new Classic packages. The law is
> Documentation/Skill/smoke-writing/SKILL.md, which you read first for the fake-context harness, the
> byte-identical ledger law, the count guard, the traps, and the parity rule. The POC brief is
> Documentation/Plans/POC-BRIEF.md.

## 1. The per-package deliverable

1. **The harness.**

    Write `Source/Test/Harness.ts` as the fake context, adapted from the reference
    `Classic/packages/hook-dsh-workspace-observe/Source/Test/Harness.ts`, which is the freshest
    greenfield harness with registration capture, effect, get, reflect, fs capture, waterfall,
    logger, root identity, and state probe.

2. **The folders.**

    Write one to three `Source/Test/<Folder>/` folders, each with `Test.ts` and a `README.md` that
    carries `## Expected count` and `<N> PASS.`.

3. **The two-step build.**

    The build in `Source/prepublishOnly.sh` and `Source/Run.sh` runs the plugin build FIRST and the
    test build SECOND under the live-containers pattern of the negation on the plugin pattern, the
    Harness selfcheck, and the Test noemit tsc. The `Configuration/Test-ESBuild.ts` and `.js` and
    the `TypeScript-Test.noemit.json` already exist in every new package.

4. **The build and the run.**

    Build with
    `pnpm --config.verify-deps-before-run=false --dir Classic/packages/<pkg> run prepublishOnly`,
    where the flag is mandatory, then run each folder with
    `node Classic/packages/<pkg>/Target/Test/<Folder>/Test.js` and compare the printed
    `N PASS - <Name>` with the README.

## 2. What every suite must cover (the per-package minimum)

- The loader contract: the default object carries name, apply, Config, and inject; the service
  registers, or the hook registers its listeners; and a bad config fails loud.
- The core behavior of the role: the service methods, or the effects of the listeners, with the real
  built library against the fake ctx.
- The ledger strings: byte-identical assertions for every module-owned line that the package emits,
  in the logger form and in the durable form where the module has both.
- Purity: zero `writeText` and `readText` calls where the package must not touch the fs, and zero
  timers where the no-timers rule applies.
- The silence and no-wall-clock invariants where the package has them.

## 3. The traps (do not fall in)

- Vacuously green: the suite must exercise the built code and not the fixture.
- Swapped assert: read the intent of the assertion, because `assert.equal(boolean, string)` is a
  defect.
- Weakening: a failing smoke means that the CODE is wrong, or that the expectation is wrong in a way
  that the plan can justify, and the assertion is never weakened.
- The count guard: every folder declares its count, and the aggregate compares them.

## 4. The report

```text
PACKAGES: <the lane's packages>
BUILD: <exit 0 per package>
SMOKES: <the printed N PASS - <Name> per folder, with the README counts>
COVERAGE: covered <N> of <M> required suites
RESIDUALS: <what is not covered and why>
READY-TO-COMMIT: <the package roots>
```

If a package cannot be smoked because of a seam that the fake cannot provide, say so explicitly and
keep the partial as partial. If the lane is blocked, write `ESCALATION: <concrete reason>`.

## 5. The aggregate (the Lead)

After the lanes report, run `node Maintain/Run/Smokes/Index.mjs`, where the aggregate compares the
printed count of each folder with its README.

The per-folder READMEs are the arbiter, and the manifest line of the tree's `smokes/README.md` is a
summary that can lag, so verify it before you quote a total.
