# The Honest Limits - What the Agent Cannot See

> Source: SKILL.md, the document head + section 7, "The honest LIMITS". Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here. It also carries the document-head scope statement.

## The Rule

The observable surface, documented from the live harness (2026-10-08), has a
hard boundary: the GUI shows the user a lot; THIS skill is about what the
AGENT itself has access to. Five things sit outside the agent's sight:

1. **The MAIN session's own token usage.** The per-message usage is recorded
   in the SUBAGENT session files only (see ./references/session-records.md);
   the main session's usage is displayed app-side - the last observable
   snapshot of it was the conversation's own record. The SUBAGENT tally IS
   computable from the session files.
2. **The GUI's DOM.** No implicit DOM or screenshot context - the browser
   provides none unless a tool returns it.
3. **The other conversations'/sessions' live content.** The session files
   exist on disk, but the live conversations are separate.
4. **The agent-loop's role-routing internals.** The subagent tool does NOT
   consult the role mapping when provider/model/effort are omitted - it
   inherits the parent route; hence the always-explicit rule (see
   ./references/llm-route-catalog.md).
5. **The future/queue state** beyond the user's messages and the process
   records - Documentation/Plans/TOMORROW-REVIEW.md is the durable queue
   record.

## Why: The Full Philosophy

1. **Honesty about sight is a safety property.** An agent that overclaims
   what it can see will answer questions about its own usage, the UI, or
   other sessions with confident fabrications. Stating the boundary lets
   the agent say "I cannot see that, here is what I CAN compute" - which is
   the difference between a limit and a lie.
2. **The agent/GUI split is the root of most limits.** The user's screen
   (the GUI) shows conversation flow, token counts, DOM state, other
   sessions' windows. The agent has tools, not the app: its sight is what
   its tools return plus what its file access reaches. Anything displayed
   only app-side is invisible by construction, not by accident.
3. **Each limit has a compensating partial.** Most limits are not dead
   ends:
   - Main-session usage is invisible, but subagent usage is fully
     computable from the session records.
   - No implicit DOM, but a tool result can carry DOM/screenshot content
     when one is returned explicitly.
   - Other sessions' live conversations are invisible, but their
     transcript FILES on disk are readable (session records), and prior
     workspace history is searchable through the session-search machinery.
   - Routing internals are not consulted at delegation time, but the route
     can be pinned explicitly (the always-explicit rule).
   - The future is invisible, but the durable queue record
     (Documentation/Plans/TOMORROW-REVIEW.md) holds what planning chose to
     persist.
4. **Inheritance is the routing limit's mechanism.** When provider, model,
   and effort are omitted on a delegation, the subagent inherits the parent
   route - the role mapping is never consulted. The observable consequence
   is that an unnamed delegation silently runs on the parent's model and
   effort; the fix is to pass the route explicitly every time.
5. **"Last observable snapshot" is the honest phrasing for app-side data.**
   The main session's usage can be quoted only from what the conversation
   itself recorded at its last visible point - never as a current value.

## Examples

### Good

- User asks "how many tokens have you used today?" for the main session:
  state the limit (app-side display; last observable snapshot only) and
  offer the computable subagent tally from the session records instead.
- User asks "what is on screen right now?": state that no implicit DOM or
  screenshot context exists, and ask for a tool-provided capture if one is
  possible.

### Bad

- Inventing a live token count for the main session - a fabrication the
  transcript can never support.
- Claiming to see other sessions' live conversations because their files
  exist on disk - files are records, not live views.
- Omitting provider/model/effort on a delegation and assuming the role
  mapping applies - it does not; inheritance does.

## Exceptions

- DOM or screenshot content IS visible when a tool explicitly returns it -
  the limit is on implicit context, not on tool-borne context.
- The other sessions' persisted records (transcripts, ledgers) are
  readable; the limit covers their LIVE state only.
- The queue record (Documentation/Plans/TOMORROW-REVIEW.md) is an explicit,
  durable exception: what planning persisted is visible as a file.

## Failure Modes

- Overclaiming sight: fabricated usage numbers, invented screen state,
  "knowing" what another session is doing - each is a trust-breaking
  fabrication.
- Underclaiming sight: refusing to compute the subagent tally or read the
  queue record that IS available - the compensating partials exist and
  should be used.
- Relying on inheritance for delegation routing: the wrong model/effort
  runs silently (see ./references/llm-route-catalog.md).

## Arbiters

- The runtime context and the tool results are the arbiter of what the
  agent currently sees; anything not tool-observable is out of bounds for
  factual claims.
- The session records (./references/session-records.md) are the arbiter of
  subagent usage; the app-side display remains the arbiter of main-session
  usage and is out of the agent's reach except as the conversation's own
  last snapshot.
- Documentation/Plans/TOMORROW-REVIEW.md is the arbiter of durable queue
  state.
