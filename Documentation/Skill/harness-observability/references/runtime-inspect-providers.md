# The Runtime Inspect Providers (cordis_inspect_list / cordis_inspect_query)

> Source: SKILL.md, section 1, "The runtime introspection tools". Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The runtime exposes its structure through Inspect Providers, read through
exactly two tools:

- **cordis_inspect_list** - list every Inspect Provider currently known to
  the Host, including local Host Providers and the latest manifests
  synchronized from the Client. Each entry includes its platform, purpose,
  read-only methods, and input/output schemas. Call it before writing or
  configuring a plugin, then select the provider and method for
  cordis_inspect_query from its result.
- **cordis_inspect_query** - run one read-only query declared by an Inspect
  Provider. The platform, provider, and method MUST come from
  cordis_inspect_list, and the input MUST satisfy that method's schema.

The introspection surface is nine providers, all read-only:

| Platform | Provider | Method | What it exposes |
|---|---|---|---|
| host | Service | listService | the Host's service directory (compact signatures) or one exact Service contract with its referenced type declarations |
| host | Event | listEvents | the Event directory (the listener signatures) or one exact Event contract |
| host | Config | listConfigs | the live plugin Config entries (paged, with schema status) or one entry's projected JSON Schema |
| host | Tool | listTools | every Tool schema currently callable by the requesting Agent (incl. scoped + dynamic registrations) |
| client | Service | listService | the Client half's service directory/contracts |
| client | Event | listEvents | the Client half's events |
| client | Builtin | listBuiltins | the plain-JavaScript symbols available to a dynamic Client half |
| client | Slots | listSubTree | the live Slot + Factory topology trees (one exact root's catalog, occupants, identity, scope, registrant) |
| client | Theme | listTokens | the current theme token names + the light/dark override requirements |

Two hard sub-rules:

1. **Never guess names.** The exact Service methods, Event modes, Config
   schemas, Tool schemas, theme tokens, and live Slot trees and props come
   from the providers - not from memory, not from plausibility.
2. **Inspect is never business Services.** Do not guess names and do not
   treat an Inspect method as a business Service that Plugin code can call.
   The query tool cannot invoke business Service methods and cannot modify
   the runtime.

## Why: The Full Philosophy

1. **Names are contracts, not vocabulary.** A Service method name, an Event
   mode, a Config key, a Tool parameter, a theme token, a Slot id - each is
   a live contract with the running system. Code written against a guessed
   name compiles against a fiction and fails at dispatch time, after the
   cost is already sunk. The providers are the only source that is checked
   against the actual runtime.
2. **Read-only by design.** The Inspect Providers deliberately carry no
   mutation path. They answer "what is the runtime right now"; changing it
   belongs to the plugin tools, the composition system, and the user. This
   separation keeps introspection safe to run at any moment, including
   mid-change.
3. **Two halves, one runtime.** The host providers (Service, Event, Config,
   Tool) read the Host's side: the service directory, the event listener
   signatures, the live plugin Config entries with their projected JSON
   Schemas, and every Tool schema currently callable by the requesting Agent
   - including scoped and dynamic registrations. The client providers
   (Service, Event, Builtin, Slots, Theme) read the rendered half: the
   Client's own services and events, the plain-JavaScript symbols available
   to a dynamic Client half, the live Slot + Factory topology (catalog,
   occupants, identity, scope, registrant), and the theme tokens with the
   light/dark override requirements.
4. **List-then-query is a discipline, not a formality.** cordis_inspect_query
   validates its platform/provider/method against the manifests that
   cordis_inspect_list returned. The list is therefore not optional
   ceremony: it is the source the query trusts.
5. **Host queries are local; Client queries wait.** A Host query runs
   locally and answers immediately. A Client query waits for the first valid
   page response within the configured timeout; otherwise it reports a
   Client failure or asks you to reconnect and retry. Plan for that
   asymmetry when querying the rendered half.

## Examples

### Good

- Before adding a panel: cordis_inspect_list, then query client/Slots
  listSubTree for the exact root, read the occupants, identity, scope, and
  registrants, then write the patch against the observed ids.
- Before calling a Service from plugin code: query host/Service listService
  for the exact contract and its referenced type declarations.
- Before styling: query client/Theme listTokens, then use only the returned
  token names, honoring the light/dark override requirements.

### Bad

- Writing a Service call because the method name "sounds right" - the
  dispatch fails at runtime and the fiction never surfaces earlier.
- Calling an Inspect method from inside plugin code as if it were a business
  Service - it is a read-only agent tool, not part of the runtime API.
- Skipping the list and calling the query with a remembered provider name -
  the query rejects it and the turn is wasted.

## Exceptions

- There is no sanctioned path that skips the manifest check: the query tool
  itself rejects platform/provider/method combinations that no manifest
  declares. The only "shortcut" is remembering the result of a list you ran
  earlier in the same session - re-list when the plugins change mid-task.

## Failure Modes

- **Guessed names:** the query returns an error naming the exact manifest
  requirement; the cost is a wasted turn and the fix is to re-run
  cordis_inspect_list.
- **Client query timeout:** a client-platform query that gets no valid page
  response within the configured timeout reports a Client failure or asks to
  reconnect and retry; retry after reconnecting, do not conclude the
  provider does not exist.
- **Stale snapshots:** manifests and live trees are snapshots; a tree read
  before a plugin change does not describe the runtime after it.

## Arbiters

- cordis_inspect_query itself: it is the arbiter of whether a
  platform/provider/method/input combination is real.
- The plugin-review discipline: any patch that references a Service, Event,
  Config, Tool, token, or Slot id should be traceable to an inspect result.
