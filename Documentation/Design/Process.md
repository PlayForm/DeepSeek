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

## The failure this process exists to prevent

On 2026-10-31 the Architecture view of `hook-dsh-normalize-ellipsis` shipped as prose: a lede, a
"Plugs into" line, three "Does" bullets, and a caption reading "The family's own character table" -
with the table itself further down. A reader asked for the visual representation of what the plugin
does and got a description of it.

That is the exact failure the fabric is for, and it happened because the board's `Gives` was a
paragraph instead of a machine. Three rules follow, and they are not advisory:

1. **A view body is machines.** A paragraph inside a view is a defect. The view's one-line caption is
   the only prose it may carry.
2. **The machine is the explanation.** If a fact needs a sentence, the sentence is the machine's
   caption; if it needs three bullets, the three bullets are a machine's rows.
3. **A board's `Gives` names a machine, not a description of one.** A board that gives prose has not
   been designed; it has been written down.

The test, applied before a page is called done: hide the prose. The page must still say everything.
If it does not, the machines are decoration and the page is a document.

## The process, stated in full

**The goal.** The site is an executable explanation, not a catalogue. It makes a plugin's operational
capability visible by showing what changes in the same harness, the same conversation, and the same
person when that plugin participates - and what stays identical because of it.

**Two systems, one of which serves the other.**

- The *explanatory system* is the site: the views, the machines, the scenarios.
- The *production fabric* is the process: boards, signals, storyboards, history - so successive
  sessions build without losing evidence or intent.

**The reader's frame: five views.** Four are shared, because the harness, the conversation, the
family, and the person are the same system whichever plugin is installed: Conversation, Harness,
Family, Person. One is bespoke, because every plugin encodes its behaviour differently: Architecture.
A reader who moves between plugins stays in the same view; only the plugin's marks change. Within a
view, relevance is computed, never deleted: the parts that are not this plugin's function are muted in
place and restored on hover.

**The process's frame: boards and signals.** A board is one stage with a frozen port block - Stage,
Takes (typed slots), Gives (named signals), Pre-warm (paths and line ranges), Gate (one deterministic
check), Next (allowed successors). A signal is a wire - Claim, Basis (path, section, hash), Shape,
From, To, Stale. The spine is three boards: **read**, **board**, **build**. Everything else is a tap on
that spine: the Detail pass, the compound pages, the library. No back-edges; typed slots; the routing
table is human-owned; prove three boards before converting twelve.

**The per-plugin pipeline, end to end.**

1. **Read the source.** `SCHEME.md`, then `README.md`, then `Source/Function/Apply.ts` and the
   functions it calls, `Source/Variable/Config.ts`, the tests (the only trustworthy source for
   strings), `Source/Library.ts`, the Effect-TS twin, and the harness docs for the seam's order and
   dispatch semantics. Never design from a description of the source.
2. **Extract and classify.** Every structured fact becomes a table, a rule, a template, a sequence, a
   boundary, a record, or a tree - and the class decides the machine.
3. **Write the storyboard.** Seven sections: the claim, the sources, the copy (every string, decided
   before markup), the layout in ASCII, the machines, the decisions (what was rejected and why), the
   history.
4. **Translate by hand.** A `SCHEME.md` is prose with mathematics in it; the lane decides what each
   part *is* - a pipeline, a law, an invariant, a square, a race - and composes the machine that shows
   it. The build never parses it.
5. **Build the machine.** Tokens only; the geometry borrowed from `Temporary/Corca/` and
   `~/Developer/Documentation/Module/ui/`, never their skin.
6. **Mount it in a view.** Primary or muted by relevance; one machine per fact.
7. **Gate it.** The build and the seven checks; a browser read through CDP when the DOM cannot explain
   a defect.
8. **Append the history.** Dated, with the whole layout repeated rather than diffed, and the screenshot
   beside it for the reader - never read by the agent unless a defect demands it.

**The design laws.**

- Visual over text: a view body is machines; the caption is one line.
- A machine earns its place by adding a dimension the prose cannot; two pictures of one fact is a
  defect.
- The restraint is in the skin, never in the structure: density, geometry, motion, and display scale
  are wanted.
- Relevance is computed, not deleted.
- Every string traces to a source; a band that cannot be grounded is cut.

**The test.** Hide the prose: the page must still say everything. Hide the machines: the page must
still read as a page. A page that fails the first is a document with illustrations.

**The memory.** `Temporary/Lane/` holds the requirements and the lane history; `Documentation/Design/`
the storyboards and this process; `Documentation/Showcase/` the page dossiers with their screenshots;
`Documentation/Component/` the component matrix; `~/.dsh/skills/` the reusable half. Every decision
lives in a file, because the conversation is not durable and the file is.

**The loop in one sentence.** Read the source, decide what it is, draw it as a board, build the
machine, prove it with the build, append the history - and let the next session start from the file
rather than from the conversation.
