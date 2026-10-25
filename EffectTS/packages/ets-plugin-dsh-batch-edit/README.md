# @playform/plugin-dsh-batch-edit

> v0.1.0 - UNPUBLISHED - plan:
> [BATCH-EDIT-TOOL-FEATURE](../../../Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md)

## The role

The batch edit engine for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugin family (the Classic release). One tool - `batch_edit` - that turns files into **processes
held in state**: you open a machine, insert files into it, and the files process like a state
machine in one go. Each file on the system is a process the harness holds (`Process<File>`), not
inert bytes - the reversed view of the default UNIX file.

The philosophy and the research live in
[Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md](../../../Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md)
and its granular subdocuments under `Documentation/Plans/Batch-Edit-Tool/`.

## The machine (one tool, six actions)

| Action   | Effect                                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`   | Declare the scope, insert files (paths or globs) as `observed` processes with their held version; the prepared schema (searches + ops) is validated fail-loud; misses are listed, never guessed |
| `insert` | Add files to an open machine mid-life (the lease stays)                                                                                                                                         |
| `remove` | Drop files from an open machine                                                                                                                                                                 |
| `commit` | Run the transition table in one go, through the factory's write executor - behind the D6 policy gate (see below)                                                                                |
| `state`  | Re-present the current state of every held file                                                                                                                                                 |
| `close`  | Close the machine (in-flight processes settle first - nothing silently dropped)                                                                                                                 |

## The Process\<File\> states

```
observed -> running    (commit/insert/monitor dispatch)
running   -> done      (Factory.Write outcome + the fresh version)
running   -> errored   (outcome.error / intent denial)
running   -> halted    (deadline / stale version / machine pause)
halted    -> running   (agent resumes: action=commit on the same machine)
done      -> observed  (re-inserted for a next batch)
errored   -> observed  (agent corrects the op)
any       -> halted    (machine close with in-flight work: settle-first)
```

A held file touched externally between insert and commit **halts** with the `stale` reason; the
machine stays open; you resume it explicitly.

## The transition table (one line per op)

```
file=<selector> search=<name> op=<MODE> [with=<TEXT>] [mode=first|all|<count>]
```

`MODE` is one of `replace`, `insert-after`, `insert-before`, `remove-line`, `append`, `prepend`.
Searches are named at open: `name=pattern` (literal) or `name=re:/pattern/flags` (simple regex, the
v1 scope). Larger batches use the `opfile` escape hatch (a prepared file path, ingested line by
line - no schema limit).

## The write path and the atomic gate

Every write goes through **Factory.Write and nothing else**: explicit `replaceIfVersion` intent (the
fresh-stat version guard), the `govern` actor marker so the event path skips the marked events, and
the governed basenames (`package.json`, `Cargo.toml`) re-run through the factory's **direct** path
exactly once per write.

The gate is all-or-nothing on the apply loop: a planning failure halts or errors that file alone; a
write failure stops the loop and returns the unwritten remainder to observed.

A commit exceeding the in-line deadline (capped at 120000, the composition contract) continues as
one background job and returns the typed `jobId`; the settle truth arrives through the jobs
subscription and the next `state` presentation. No plugin-owned timers anywhere.

## The policy block (D6) - the apply gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The `commit` action consults `Decide(State.Allow, "write")` **before any plan or write**.

The shipped default is `write: approve`, so an apply is **refused** with the byte-exact
`apply refused <id> (policy write=approve)` line (in the ledger and as the thrown error): nothing is
read or written, the machine stays open with its cells `observed`, and the batch waits for the
user's approval - the existing approve binding (flip `policy.write` to `auto`, or approve the batch
through the batch-decision hook).

With `write: auto` the commit proceeds exactly as described above. The block is one volatile object
(a policy flip is hot-editable), and a resolved pack's `policy` section overrides the defaults per
action (the wiring is the next refinement).

## The ledger lines (the contract, byte-stable)

```
machine opened <id> (<n> files, scope=<glob>)
inserted <file> at version <version>
transition running <file> op=<n>/<total>
transition applied <file> version <old> -> <new>
transition errored <file> <reason>
transition halted <file> <reason>
machine committed <id> (<applied> applied, <failed> failed, <halted> halted)
machine closed <id>
apply refused <id> (policy write=approve)
```

Plus the module-owned `removed <file>` line for the `remove` action. The ledger file defaults to
`~/.dsh/playform/ets-plugin-dsh-batch-edit.log` (one log per module).

## The configuration

Ships **disabled** (`enabled: false` - the IDLE-forever posture; it enables only by an explicit
ACTIVATE in the profile). Every knob is volatile (hot-editable without remounting):

| Field              | Default                                         | Meaning                                                                  |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------ |
| `enabled`          | `false`                                         | The master switch                                                        |
| `log`              | `true`                                          | The ledger switch (the factory's shared volatile cell)                   |
| `logFile`          | `~/.dsh/playform/ets-plugin-dsh-batch-edit.log` | The module ledger                                                        |
| `machinesPerAgent` | `2`                                             | Open machines per agent                                                  |
| `opsPerCommit`     | `64`                                            | Op lines per commit (overflow goes to `opfile`)                          |
| `deadlineMs`       | `120000`                                        | In-line commit deadline (1000..120000)                                   |
| `strictMode`       | `false`                                         | Search-not-found errors vs skips                                         |
| `interceptBash`    | `false`                                         | The advisory bash intercept (v1: tags and records, never denies)         |
| `monitorChecksets` | `[]`                                            | Per-file check-set names (the live containers' vocabulary, labels in v1) |
| `policy.*`         | D6 defaults                                     | The per-action allowlist (the apply gate; see above)                     |

## The plan

Classic PoC (source complete; the smoke suite, the build pass and the EffectTS twin are end-phase
work - see [Documentation/Plans/POC-BRIEF.md](../../../Documentation/Plans/POC-BRIEF.md)).

## License

CC0-1.0.
