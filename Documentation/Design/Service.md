# Service

## The claim

A service is a name on the context, the methods a consumer calls, and the consumers that call them.
The machine is a contract: the identity and the two counts on a band, the methods in the source's own
order down the reading column, the consumers as names in the inset, and the rule the contract keeps
as the last word on the one solid accent face of the shape.

The machine answers: **what does this service promise, and who depends on it?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Service.astro` | The composition: the identity band with two figures, the document and inspector split, the method rows, the consumer list, the `Also registers` sub-list, and the inverted rule band. The fifteen records are the component's own table. |
| `Site/Source/Stylesheet/Component/Service.scss` | The geometry: `minmax(0, 1.6fr)` for the reading column and `minmax(0, 1fr)` for the inspector, a method row at `minmax(0, 10em)` plus the meaning, the hover wash behind the row, the accent tick before each consumer, and the accent band across the bottom. |
| `Site/Source/pages/package/[slug].astro` | The mount: `Service` inside the portrait section, gated on `Portrait.Shape === "service"`, with the section title and the `Plugs into` lede above it. |
| `Site/Source/Content/Portrait.ts` | The fifteen packages whose shape is a service, from `plugin-dsh-factory` to `plugin-dsh-workspace-semantics`. |
| `Classic/packages/lib-dsh-core/Source/Library.ts` and `Source/Function/Service.ts` | The methods and their order: the class-form plugins declare them on the service class, the object-form ones on the function module. |
| `Temporary/Corca/Curated/Components.md` | The object row and the rule that a band paints above static content, which the hover wash has to respect. The method row is that geometry with the paint order stated. |
| `Temporary/component-page-composition-recipes.json` | M17.R01, provider and consumer: a provider, a service, and a consumer, with each edge's basis named. The inspector is that recipe with the consumers as a list. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/service-explorer.tsx` | The document and inspector split, with the selection in the document and the detail in the inspector. The service page borrows the split and drops the selection, because a contract has one subject. |

The borrow is a mechanic (a contract is read down the methods and checked across the consumers), a
geometry (a wide reading column and a narrow inspector), and a state model (a method is provided or
not, and a consumer is named or not).

## The copy

The section that mounts it prints the portrait's own title and `Plugs into ...`.

The machine's fixed labels print on every mount: `Service`, `Methods`, `Consumers`, `Methods` again
over the reading column, `Consumed by`, `Also registers`, and `Rule`. The two figures beside the
identity are `Method.length` and `Consumer.length`, so the counts and the lists are one fact.

The fifteen records, with the strings each prints:

1. `ctx.pluginFactory`, 19 methods, 4 consumers. Rule: `One service and no Config of its own, because it is the config mechanism: the schema, the ledger, the gate, and the write are the methods its consumers compose.` Consumers: `the three governance hooks`, `the six normalize flavors`, `plugin-dsh-normalize-file`, `the orchestration plugins`. Also registers: `the ctx.trace bus, provided by the constructor`, `the Policy, Decide, and Schema named exports, for a module-load schema`.
2. `ctx.batchstate`, 13 methods, 3 consumers. Rule: `The board records and projects, and the service and the spliced block read the live state rather than a copy of it.` Consumers: `the parent's activations, through the write API`, `every lane, through the spliced block`, `plugin-dsh-queue, read-only for the queue line`. Also registers: `the agent-team inbox registration: agent/inbox/spliced and agent/inbox/inserted`, `the batch/state-change event, emitted on every change`.
3. `ctx.feedback`, 7 methods, 3 consumers. Rule: `The block transfers as text and the parent only appends: nothing sanitizes the honest content, and the read is always the recipient's choice.` Consumers: `plugin-dsh-ingester, which reports the outcome after an apply`, `the parent session, which appends a delta`, `the council view, which reads the summary`.
4. `ctx.ingester`, 3 methods, 3 consumers. Rule: `One apply per decision, claimed synchronously and keyed by proposal, outcome, and time, so a decision delivered twice applies once.` Consumers: `the batch/decision event, which applies with no caller wiring`, `the batch/proposed event, which fills the recorded proposals`, `a caller that already holds a proposal and a decision`.
5. `ctx.lesson`, 19 methods, 3 consumers. Rule: `The service owns the review and never the trigger, and the shipped write verdict is approve, so an accepted operation waits even when the judge would pass it.` Consumers: `hook-dsh-lesson-nudge, which calls it from the idle phase`, `the user, through the pending queue`, `the corpus, which Accept writes`.
6. `ctx.passOn`, 2 methods, 3 consumers. Rule: `The pass-on never writes a file: it computes the proposal, the decision decides, and the ingester applies.` Consumers: `plugin-dsh-batchstate, through the inbox splice`, `plugin-dsh-ingester, through the recorded proposal`, `hook-dsh-batch-decision, through the bus`.
7. `ctx.pattern`, 9 methods, 3 consumers. Rule: `The match is a lookup plus arithmetic, never a model call, and the cold start is the shipped catalog rather than an empty registry.` Consumers: `the suggester family, which asks for a match`, `the decision hook, which reads the allowlist hint`, `the storage domain, else the JSON snapshot`.
8. `ctx.dshQueue`, 11 methods, 3 consumers. Rule: `The policy is the outer gate and autoSpawn is the inner one: an approve verdict refuses a launch even with the knob on, and a knob that is off refuses on its own.` Consumers: `the orchestrator, through the queue_enqueue and queue_status tools`, `plugin-dsh-batchstate, which projects the board line`, `the routing enforcer, which the dispatcher probes`. Also registers: `the two tools: queue_enqueue and queue_status`, `the unload effect that aborts every spawned child`.
9. `ctx.dshRoute`, 4 methods, 3 consumers. Rule: `Silence is the contract: the launch succeeds exactly as if the caller had passed the right values, and the ledger line is the only record.` Consumers: `the subagent tool's launch, through tools/pre-execute`, `a child started through the subagent service, at its first pre-step`, `plugin-dsh-queue, which resolves the route before it spawns`.
10. `ctx.workspaceAuthority`, 8 methods, 3 consumers. Rule: `The license decides and the weight only ranks: the capability carries no weight, and the policy reads the weight only to order candidates.` Consumers: `the approve step, which binds a change to a license`, `the operate step, which proposes against a resource`, `the user, through the statistics`.
11. `ctx.workspaceContext`, 4 methods, 3 consumers. Rule: `A hit in the memo returns the same packet object and writes no second line, and the graph's invalidation clears it, so the next identical query rebuilds against the new revision.` Consumers: `plugin-dsh-workspace, through the workspace_context tool`, `the graph's invalidation event, which clears the memo`, `a reader, who meets the packet as the orientation`. Also registers: `the workspace_context tool, read-only`.
12. `ctx.workspaceEvidence`, 5 methods, 3 consumers. Rule: `The service records the caller's verdict and never invents one, and its sequence is its own counter rather than a wall clock.` Consumers: `the approve step, which reads a validation's status`, `the audit hook, which writes the outcome evidence`, `the fs/observed listener, which invalidates`.
13. `ctx.workspaceGraph`, 9 methods, 3 consumers. Rule: `The deferred kinds are not faked, and a reference that names no symbol node of the same file is dropped rather than turned into a dangling edge.` Consumers: `plugin-dsh-workspace, which maps, finds, expands, and indexes`, `plugin-dsh-workspace-context, which reads the snapshot`, `hook-dsh-graph-suggester, which asks for the neighborhood`.
14. `ctx.workspaceReflect`, 4 methods, 3 consumers. Rule: `The reply is part of the type: every operation answers applied, conflict, denied, rejected, recovery-required, or outcome-unknown, never a boolean and never a thrown error.` Consumers: `the operate step, which proposes an operation`, `the graph, which re-indexes the file after an apply`, `the semantics service, which supplies the rename plan`.
15. `ctx.workspaceSemantics`, 6 methods, 3 consumers. Rule: `An extension with no adapter, or an adapter that cannot be certain, answers undefined plus one line, never a guessed plan.` Consumers: `plugin-dsh-workspace-graph, which asks for the references`, `plugin-dsh-workspace-reflect, which asks for the rename plan`, `the adapters the config names`.

The mounted instance is `ctx.pluginFactory`, and its methods print in the source's declaration order:

1. `State`; `the consumer's state: the shared cells unwrapped, the module's fields mapped`
2. `Append`; `the ledger: one logger line and one dated line in the consumer's own file, never throwing`
3. `Match`; `the exclusion-first segment match over a path`
4. `Discover`; `the nearest registry or policy file, found by a plain-fs walk`
5. `Parse`; `the JSON parse of an auxiliary file, contained`
6. `ResolvePolicy`; `the union keep-list: the global policy, the directory's, the nearest registry's`
7. `Gate`; `the gate set in order, and the verdict it reaches, logging nothing`
8. `Write`; `the one write executor: intent, policy, observe, stash, and transform`
9. `GuardedWrite`; `the write behind the version fence, with the stash pre-registered`
10. `Refresh`; `the observation re-emit at the fresh version, under the same actor`
11. `Continue`; `a transform run detached and contained, off the settled chain`
12. `Wire`; `the fs/observed registration on the root context`
13. `Attach`; `the fiber-owned effects: jobs, inflight, and the journal domain`
14. `Journal`; `the best-effort record into the consumer's journal domain`
15. `Schema`; `the schema factory: the shared block plus the module's fields`
16. `UpdateKey`; `the namespaced inflight key an update stage must register under`
17. `Seam`; `the probe-once accessor for an optional service`
18. `RegisterGovern`; `a direct-govern step for one basename, replaced in place on a reload`
19. `Govern`; `the direct-govern fold: the registered steps in order, one try/catch each`

The other fourteen method lists are not copied into this file. They live in the component's table at
`Site/Source/Component/Service.astro` lines 52 to 496, which is the source of truth for the strings;
this storyboard carries the labels, the figures, the rules, and the consumers for all fifteen, so a
reader can see the shape of every contract and the exact copy of one.

## The layout

```
+----------------------------------------------------------------------+
| SERVICE                                                              |
| the contract, its methods, and its consumers                         |
+----------------------------------------------------------------------+
| Service  ctx.pluginFactory          19 METHODS    4 CONSUMERS        |
+---------------------------------------+------------------------------+
| METHODS                               | CONSUMED BY                  |
| State        the consumer's state     | - the three governance hooks |
| Append       the ledger               | - the six normalize flavors  |
| Match        the segment match        | - plugin-dsh-normalize-file  |
| ...                                   | - the orchestration plugins  |
| Govern       the direct-govern fold   | ALSO REGISTERS               |
|                                       | the ctx.trace bus            |
| 1.6fr, the reading column             | 1fr, the inset inspector     |
+---------------------------------------+------------------------------+
| RULE   the one solid accent face, the judgement, the last word       |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The body is `1.6fr` for the methods and `1fr` for the inspector, so the
reading column is the wide one and the consumers sit on the inset face; the rule is a full-width
inverted band, the only place on the shape where the accent is a surface rather than a mark. Under
720px the two columns stack, the inspector below the methods, and the rule becomes one column.

## The machines

Service adds the contract. Tool says what the model can call, Flow says what the package does to
what passes, and this says what another plugin can call on the context and who already does.

| Neighbour on the same page | What it already says | What Service must not say |
| --- | --- | --- |
| Tool | the calls the model can make | the same names as methods. A tool is called by the model; a service is called by a plugin. |
| Flow | the order of the package's work | the methods as stages |
| Surface | every registration the README documents | the service name again as a row |
| Configuration | the knobs the plugin reads | a method's argument as a knob |

The `Also registers` block is a second surface, not a method: the queue's two tools, the factory's
trace bus, and the module-load exports are real and leaving them out would make the register
describe less than the package does. It sits under the consumers because it is a second kind of
consumer-facing surface.

When the record is absent the machine renders nothing, so a portrait with a shape of service and no
contract shows no band.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| The document and inspector split | One column of methods, with the consumers under them | The methods are prose and the consumers are identities. One column would make a list of names read as a continuation of the meanings, and the two facts would compete for the same left edge. |
| The rule is an inverted accent band at the bottom | The rule as a caption above the methods | The rule is the judgement about the whole contract, and it should be the last thing the eye meets. It is also the only solid accent face on the shape, which is why it is spent here. |
| The consumers are names | A sentence for each consumer | The source names them and says nothing about why each one calls. A why would be invented, and the page would be the authority on a relationship it did not read. |
| `Also registers` is a sub-list | Folding the tools and the bus into the methods | A tool or an event bus is not a method of the contract. Folding them in would make the method count wrong and the promise larger than the service. |
| The methods keep the source's declaration order | Alphabetical order | The order is the lifecycle: the state, the ledger, the gate, the write, then the fold. Alphabetical order would be a lookup table and would hide the sequence. |
| No type signatures | Printing each method's argument and return types | The page is a contract, not an API reference. The source's types would set the column width, and a reader who needs the signature is reading the code. |
| Two figures on the band | One figure, the method count | The contract's size and its adoption are different facts. A service with nineteen methods and one consumer is a different claim from nineteen and four. |
| One contract is transcribed in full in this storyboard | Transcribing all fifteen method lists | The copy would become a second copy of the component's table, and the two would drift. The figures, the rules, and the consumers are here for all fifteen; the strings stay in one place, and the file names it. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on fifteen package pages inside the portrait section, from
`/package/plugin-dsh-factory` to `/package/plugin-dsh-workspace-semantics`. The page that proves the
composition is the factory's, because its nineteen methods make the reading column long enough to
show the split against a tall inspector.

What is not drawn yet: the fiber ownership that `Attach` names, which is a lifecycle fact the method
row states in one clause, and the configuration of each consumer, which belongs to the consumer's
own page. The machine shows who calls the contract; it does not show what each caller does with the
answer.
