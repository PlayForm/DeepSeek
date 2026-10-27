# SCHEME - @playform/plugin-dsh-batch-edit

This document gives the structural scheme of the batch edit engine: the anatomy, the machine, the op
grammar, the write path, the contract strings, and the exact seams it consumes.

It is the source of truth alongside `Documentation/Plans/Batch-Edit-Tool/` (SCHEMA, STATE-MACHINE,
PACKAGE-AND-GOVERNANCE, ACCEPTANCE-CRITERIA).

## 1. The anatomy

```
Source/
  Library.ts            the loader contract: name, apply, Config, inject
  Function/
    Apply.ts            registration only: validation, State build, listeners
    Machine.ts          the machine registry, the verbs, the parsers, the observer
    Ops.ts              the transition-table executor (plan -> apply, the gate)
    Tools.ts            the batch_edit defineTool (flat schema, output, presenters)
    Present.ts          the state presentation (cells + prose), pure functions
    Ledger.ts           the module-owned ledger strings (byte-stable)
  Interface/
    Config.ts           the config shape (all volatile)
    Events.ts           the structural event payloads (self-contained)
    Factory.ts          the factory service contract (self-contained, PoC rule)
    Fs.ts               the fs identity types (self-contained, PoC rule)
    Output.ts           the canonical output value
    Process.ts          Process<File>: cells, ops, searches, machine records
    State.ts            the per-apply state (factory shape + module fields)
  Variable/
    Config.ts           the Schemastery schema (every knob volatile)
Configuration/          the build configs (ESBuild.ts/.js, Test-ESBuild.ts/.js,
                        TypeScript.noemit.json, TypeScript-Test.noemit.json)
```

## 2. The loader contract

The contract declares `name = "plugin-dsh-batch-edit"`, `apply` (returns nothing), `Config`
(Schemastery, validated at load, fail-loud in Function/Apply's `Validate`), and
`inject = ["pluginFactory", "tools", "jobs"]`.

The default object carries all four (the default-object-shadows pitfall).

The identity agrees in the four places: package name, `name` export, the State build's `module:`
option, and the logFile default (`~/.dsh/playform/plugin-dsh-batch-edit.log`).

## 3. The machine

- Registry: `State.Machines: Map<agentId, Map<machineId, MachineRecord>>` (the planted-board lease
  semantics), where `machinesPerAgent` caps each map.
- Machine ids: `mach-<n>`, a deterministic counter (never a clock).
- `MachineRecord`: id, scope, `searches: Map<name, SearchSpec>`, `ops: OpLine[]`,
  `files: Map<path, ProcessCell>`, persistent, closed, misses.
- `ProcessCell`: path, status (`observed | running | halted | done | errored`), version (the license
  stamp), freshVersion, haltReason (`stale | deadline | pause | interrupted`), error, diff, opAt.
- The fs/observed observer (`Machine.OnObserved`, registered through the factory's `Wire` on the
  ROOT context) is a synchronous cell flipper with no awaits and no I/O. It skips the
  `govern`-marked actors (our own writes) and flips a held cell to `halted("stale")` only when the
  version token moved, and it logs only on an actual flip (the silence invariant).

## 4. The op grammar and semantics

`file=<selector> search=<name> op=<MODE> [with=<TEXT>] [mode=first|all|<count>]`

| MODE            | Semantics                                                  |
| --------------- | ---------------------------------------------------------- |
| `replace`       | Replace matched occurrences (literal or regex) with `with` |
| `insert-after`  | Insert `with` as a new line after each matching line       |
| `insert-before` | Insert `with` as a new line before each matching line      |
| `remove-line`   | Remove matching lines                                      |
| `append`        | Append `with` at the end (no search needed)                |
| `prepend`       | Prepend `with` at the start (no search needed)             |

Selectors match exact held paths or a simple glob (`*` in one segment, `**` across).

Searches are `name=pattern` (literal, line-contains) or `name=re:/pattern/flags` (simple regex).

The `opfile` path ingests prepared op lines from a file (`#` comments and blank lines skipped).

## 5. The commit (Ops.Commit)

0. **The policy gate (D6).**

    The tool's `commit` action consults `Decide(State.Allow, "write")` BEFORE any plan or write.

    The shipped default is `write: approve`, so the apply is refused with the byte-exact
    `apply refused <id> (policy write=approve)` line (the ledger line AND the thrown error), nothing
    is read or written, and the machine stays open with its cells `observed`, so the batch waits for
    the user's approval through the existing approve binding (flip `policy.write` to `auto`, or
    approve the batch through the batch-decision hook).

    `auto` proceeds to step 1.

    The block is the shared factory policy (`policy: Policy()` composed into the schema, mapped to
    `State.Allow`), and a resolved pack's `policy` section overrides the defaults per action (the
    wiring is the next refinement).

1. **The plan.**

    The plan covers every selected cell (`observed`, `halted`, `errored`, the resume paths): stat
    (the fresh-version guard, where a mismatch halts the file with `stale` and the machine stays
    open), read, apply the ops, and diff.

    Errors mark the file `errored`, and neither abort the batch.

    Zero-changed files are the designed no-op (back to `observed`, nothing logged).

2. **The apply.**

    The apply runs through `Factory.Write` with the explicit `replaceIfVersion` intent, the
    `govern`-wrapped actor, Stash pre-registration, and the root `fs/observed` emit; then, for the
    governed basenames (`package.json`, `Cargo.toml`), `Factory.Govern(target, true)` runs the
    direct path exactly once per write.

    A write failure stops the loop and returns the unwritten remainder to `observed` (the atomic
    gate).

3. **The deadline.**

    The deadline is scanned between files with a clock read (capped at 120000).

    Overflow continues as one `batch-edit-continue` job via the jobs hub (`jobId` in the output),
    and without a hub the remainder halts with `deadline`.

4. **The one-shot close.**

    One-shot machines (`persistent: false`) close after commit (`machine closed <id>`), and then
    `machine committed <id> (...)` is logged.

Preview parity holds: the returned diffs are computed from the same content that is written
(byte-for-byte; `preview: false` omits the diff payloads but applies identically).

## 6. The contract strings (Function/Ledger)

The strings are byte-stable and module-owned (the factory never owns them):

```
machine opened <id> (<n> files, scope=<glob>)
inserted <file> at version <version>
transition running <file> op=<n>/<total>
transition applied <file> version <old> -> <new>
transition errored <file> <reason>
transition halted <file> <reason>
machine committed <id> (<applied> applied, <failed> failed, <halted> halted)
machine closed <id>
removed <file>
apply refused <id> (policy write=approve)
```

Plus the activation proofs (`disabled (enabled=false)` and `activated bundle <version> (...)`) and
the advisory `advisory intercept <tool> on a held file`.

## 7. The silence invariant

`Present.Cells` and `Present.Prose` are pure functions of the machine state: no clocks, no relative
ages, and no per-request variation.

An idle machine with no events produces byte-identical cells and prose across requests.

## 8. The self-contained seams (the PoC rule)

`Interface/Factory.ts` (the factory service: Append, State, Wire, Write, Govern, RegisterGovern),
`Interface/Fs.ts` (FsTarget/FsObservation/FsVersion/FsWriteOutcome), and `Interface/Events.ts` (the
tool/jobs/step payloads) are structural declarations typed from the family contract, with no imports
from sibling workspace packages.

The end-phase wires the real typed imports (`@playform/plugin-dsh-factory`, `@deepseek-ai/dsh-fs`).

## 9. Future work (labeled FUTURE, not present)

The future work covers the undo journal (`batch_edit_journal` domain, ranked suggestion 4), the
interactive confirmation checkpoints (7), the monitor/sweep runner (8), the process-tree edges (9),
the ownership lease TTL (10), the EffectTS twin with byte-identical ledger strings (11), the
escape-elimination counters (14), and the bash-intercept enforcement layer (v1 is advisory only, by
design).
