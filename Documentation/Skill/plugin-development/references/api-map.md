# The API Map: The Seams and Their Three Roles

> Source: SKILL.md, section 1 "The API map". Sources: glossary.md:9,
> capability-seams.md:578-672.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every integration a plugin performs goes through one of the eight seams in
this table. Learn the entry points; the manual's other references explain
each seam's contract in depth.

| Seam | Entry | Role |
|---|---|---|
| Events | `ctx.on/emit/waterfall/parallel/serial/bail` | observe & influence the host |
| Config | `export const Config = Schema.object({...})` | validated, defaulted, UI-editable |
| Services | `ctx.provide` / `ctx.inject` / Service classes | typed capabilities on `ctx.<name>` |
| Tools | `ctx.tools.register(defineTool({...}))` | model-callable operations |
| Effects | `ctx.effect` | registrations that unwind on unload |
| Logger | `ctx.logger(name)` | diagnostics (never `console.log`) |
| Subprocess/Sandbox | `ctx.subprocess`, `ctx.sandbox` | confined process execution |
| Jobs | `ctx.jobs.start({kind, label, owner, run})` | harness-owned background work |

## The Three Roles of a Seam

Seams are swappable capabilities with three roles, cataloged in
capability-seams.md:578-672:

1. **Service Definition** -- the abstract class that owns `ctx.<key>` plus
   its vocabulary. It is "never a TypeScript `interface`" (glossary.md:9):
   the runtime needs the class identity for lookup and typing, and an
   interface carries no runtime presence.
2. **Service Provider** -- the plugin that registers the concrete
   implementation onto `ctx.<key>` (see ./references/services.md).
3. **Consumer** -- the plugin that declares the seam in `inject` and uses
   the capability through `ctx.<name>`.

## Why: The Full Philosophy

1. The seam table is the sanity check for any design: if your planned
   feature cannot be expressed with one of these eight rows, the feature
   wants a core patch, and per ./references/one-sentence.md there is no
   privileged core to patch.
2. The roles explain the dependency direction: definitions and providers sit
   upstream, consumers declare dependence and wait (PENDING) until the seam
   is populated. This is why load order in `cordis.yml` does not matter (see
   ./references/services.md).
3. The seam entries are deliberately narrow: `ctx.subprocess`/`ctx.sandbox`
   exist so process execution is confined and auditable; `ctx.jobs` exists so
   background work is owned and cancellable; `ctx.logger` exists so
   diagnostics are model-visible. Each narrow entry replaces a category of
   free-floating Node.js.

## Examples

### Good

- Consuming the fs seam through `ctx.fs` plus the `fs/*` events, and the
  process seam through `ctx.subprocess` with a sandbox policy.
- Providing a new capability by defining an abstract Service class, then
  providing it, then letting other plugins `inject` it.

### Bad

- Spawning processes with `child_process` directly.
- Writing diagnostics with `console.log` instead of `ctx.logger(name)`.
- Declaring a seam as a TypeScript `interface` and expecting consumers to
  find it.

## Exceptions

- None for the seams themselves. The "registers NO service" archetype (a
  plugin that integrates only through events) is a legitimate specialization
  of the map, not an exception -- see ./references/services.md.

## Failure Modes

- Using an off-map channel (raw `setTimeout`, raw `fs`, `console`) and
  losing unwind-on-unload, ownership, confinement, or visibility.
- Confusing definition with provider: exporting only the interface-shaped
  declaration and never calling `ctx.provide`, leaving consumers PENDING
  forever.
- Parsing opaque ids (`targetKey`, `FsVersion`, `exec.token`) instead of
  using the seam's typed surface (see ./references/checklist.md, item 9).

## Arbiters

- Review: every capability use in the plugin maps to a table row.
- The checklist (./references/checklist.md, items 9, 10, 13) audits
  seam usage item by item.
- Live probes: `ctx.get(name)` returning the provided value proves a
  provider-consumer pair is wired.
