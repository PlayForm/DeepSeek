# The process

The work is a fabric, not a checklist. It has boards, wires, and a trace, and the vocabulary is the
one the hardware already uses because the shapes are the same.

- A **board** is one stage: a fixed shape with typed slots in, named signals out, one gate, and one
  handoff. A session borrows a board by filling its slots and pre-warming its sources.
- A **signal** is a wire: a claim with a basis, a shape, a producer, its consumers, and the
  condition that invalidates it.
- A **spine** is the small linear chain a run follows. Everything else is a **tap** on that spine:
  it reads a signal and writes one, without adding an edge to the chain.
- A **run** is one traversal: the boards used, the slots filled, the signals produced, the gates
  passed, and the hash of every source cited.

## The board

Every board carries the same frozen block above its prose. The block is the port list; the prose
below it is the interior and may change freely.

```
Stage      <the verb the board performs>
Takes      <typed slots: path | glob | enum | list | reference>
Gives      <the named signals it emits>
Pre-warm   <the paths and line ranges to read first, with the reason>
Gate       <one deterministic check that can fail>
Next       <the boards this one may hand off to>
```

A board without a gate is advisory and is labelled advisory. A board whose `Next` is empty is a
sink.

## The signal

One schema, one file, reused everywhere. A second vocabulary is a second thing to keep true.

| Field   | What it holds                                                                             |
| ------- | ----------------------------------------------------------------------------------------- |
| `Claim` | the sentence the signal asserts, in one line                                              |
| `Basis` | the source path, the section, and the hash at the time it was read                        |
| `Shape` | what the signal is: a table, a rule, a template, a sequence, a boundary, a record, a tree |
| `From`  | the board that produced it                                                                |
| `To`    | the boards that consume it                                                                |
| `Stale` | the condition that invalidates it: a source hash change, a board version change           |

## The spine

Three boards, because the work this session actually did has three verbs:

1. **Read** - harvest the source and its scheme; emit the facts as signals with their hashes.
2. **Board** - turn the facts into a storyboard: layout, copy, decisions; emit the board as a
   signal.
3. **Build** - implement the board as a machine, mount it, gate it; emit the built page and its
   check.

Everything else is a tap: the Detail pass reads the same facts and emits machines; the compound
pages read several boards and emit a page; the library reads the registry and emits previews. A tap
never becomes a stage, because a stage is a verb with a gate and a handoff, and most work is
neither.

## The run

Every traversal writes one ledger entry:

```
Run      <date>
Board    <stage> -> <stage> -> <stage>
Slots    <what each board was given>
Signal   <what each board emitted>
Gate     <pass | fail, and what the gate checked>
Source   <path@hash, path@hash, ...>
```

The ledger is how a later session knows what is stale. A board whose cited hash changed is stale,
and a stale board is worse than no board because it is confident.

## The rules

1. **The signal schema comes first.** Boards cannot chain without a wire.
2. **Boards are pure.** Output is a function of the slots and the cited sources; no hidden state, or
   the run cannot be replayed.
3. **Cite, never copy.** A board points at a source and a line range; it does not paraphrase the
   source into itself.
4. **No back-edges.** If a stage needs a later stage's output, insert a stage. A back-edge turns the
   chain into a mesh with no provenance.
5. **Slots are typed.** Path, glob, enum, list, reference. Free text rots within a week.
6. **One gate per board, cheap and deterministic.** A gate that needs judgement is a human review,
   and it is labelled as one.
7. **Boards are versioned, never edited in place.** A run cites a version; a new version is a new
   board with a history entry, the same way the storyboards repeat their layout in full.
8. **The routing table is human-owned.** The agent proposes the next board; the owner approves the
   chain. A self-rewiring fabric cannot be audited.
9. **Pre-warm before the gate.** A board reads its cited sources first and fails early if one moved.
10. **Prove three, then convert the rest.** A board that has never run is a guess.

## The proof

The smallest honest proof is three boards on the spine, one signal schema, and one run ledger. The
other twelve boards are converted in the order the spine runs, not in the order they were written.
