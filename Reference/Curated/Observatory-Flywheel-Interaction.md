# Flywheel interaction: the two projections and what they demonstrate

> Statement: The Flywheel sources establish a research graph as a directed acyclic graph of durable
> nodes that hold questions, claims, hypotheses, tasks, results, and decisions, with branch and
> merge as first-class graph operations and a Web UI that shows the graph as a draggable canvas plus
> an optional linear timeline view. They also establish `flywheel ui` as a strictly read-only local
> browser view of committed and staged work, which is the only documented model for a "local
> browser" mode on the PlayForm site.

## What the two projections demonstrate

1. The homepage graph is the catalogue projection, not a conversation recording. The captured
   PlayForm homepage describes "The family explorer 91 PACKAGES 10 GROUPS" whose content is the
   package catalogue: packages, ten groups, and dependency edges. The only interactions it documents
   are "activate a row for its facts - the panel is inline, no navigation. Escape closes the open
   detail." plus search, filter, sort, and group-bar filtering.
2. The /tl page, which the Design Brief proposes as the timeline projection, has a documented
   contract in the harness, not in Flywheel: the Trajectory tab's overview "projects real record
   start/duration timing from left to right". Flywheel establishes only that a timeline view exists
   and is "a more organized, linear view of the graphs".
3. Flywheel's own canvas projection establishes: drag nodes to organize them, hover to preview
   content, click for details, pan and zoom, and a timeline toggle.

## The ordering rule

- Flywheel keeps alternatives visible "without flattening everything into one timeline"; its
  timeline toggle is a linear view of the same graph, not a different dataset.
- The harness session log is append-only and "seq is the monotonic position in the log", so any
  timeline the site builds orders nodes by recorded sequence and recorded start times, never by
  invented or interpolated time.

## The local browser read-only rule

- "The graph browser has no controls to edit, commit, delete, share, or publish nodes." The Flywheel
  local UI serves committed and staged work on 127.0.0.1 and shows uncommitted work before an agent
  commits it. Any "Local harness read only" mode on the site adopts exactly this shape: read-only,
  local, staged work visible and labeled as uncommitted.
- Publication is explicit and separate: "a commit never publishes on its own, and agents acting on a
  user's behalf first show the user the dry-run summary, then run repo:push only after the user
  approves publication."

## The node vocabulary and its translation

Flywheel names the roles a node can hold; the harness names the events a session records. The site's
node kinds come from the right-hand column.

| Flywheel role | Harness concept                                     | Durable event the site renders                                                                          |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Question      | an open question claimed into a turn                | user/message                                                                                            |
| Claim         | the model's settled statement                       | assistant/message                                                                                       |
| Hypothesis    | a stated alternative the model weighs before acting | assistant/message content; a branch when alternatives diverge                                           |
| Task          | work proposed for a tool                            | tool/call (callId, name, raw JSON arguments)                                                            |
| Result        | the tool's model-facing outcome                     | tool/result                                                                                             |
| Decision      | the policy outcome between call and result          | no event kind: the pre-execute, monotonic-guard, and approval stage; a denial still records tool/result |
| Branch        | a fork at a turn boundary                           | the fork seed and the `forked` turn/end reason                                                          |
| Merge         | the reconciling step that succeeds both branches    | a later assistant/message; the log records no merge event, the site renders the merge from topology     |
| Artifact      | durable evidence                                    | attachments, fs/observed, tool/result meta                                                              |

Traceability quotes:

- "It can hold a question, claim, hypothesis, task, result, or decision." (graph model)
- "A branch creates a child node from an existing node; a merge records that multiple branches have
  been resolved into one outcome." (graph model)
- "The model requested one tool invocation: `name` with the raw `arguments` JSON string exactly as
  the model produced it (unparsed). `callId` pairs the call with its `tool/result`." (session)
- "Use nodes to record questions, hypotheses, experiments, and conclusions." (tutorial)

## Visual behaviors the public sources establish

Established, so the site may claim them once it implements them:

- Canvas: drag to organize, hover to preview, click for details, pan and zoom (Flywheel Web UI).
- Timeline: a toggle to "a more organized, linear view of the graphs" (Flywheel Web UI).
- Duration-bearing timeline: real start/duration projected left to right, assistant spans dividing
  recorded TTFT from decoding, a hover that reveals exact clock and duration details, dragging an
  interval to focus the ledger, wheel zoom of the time domain, right-click clear, right-drag pan
  (harness Trajectory tab).
- Honesty rule: in-flight records "show a start marker without inventing elapsed time".
- Read-only local browsing with staged work labeled (flywheel ui).

Not established, so the site must not claim these as sourced behavior:

- Duration bars or a calibrated time axis in Flywheel's own timeline; the tutorial says only "a more
  organized, linear view of the graphs".
- A playhead or playback of the graph; no source in the shelf establishes one.
- Hover previews, node dragging, or pan and zoom on the PlayForm homepage graph; the capture
  documents only activate-for-facts, search, filter, sort, and Escape.
- Any current behavior of /tl; no raw capture of that page exists in the shelf.

## Stub pages

- Reference/Raw/flywheel-docs.md is the docs landing page: nine lines, one sentence of substance
  plus a link list. It contributes nothing beyond naming the doc set and is cited nowhere else in
  this note.

## Sources

- https://docs.flywheel.paradigma.inc/concepts/graph-model - Reference/Raw/flywheel-graph-model.md
- https://docs.flywheel.paradigma.inc/tutorial - Reference/Raw/flywheel-tutorial.md
- https://docs.flywheel.paradigma.inc/terminal-preview - Reference/Raw/flywheel-terminal-preview.md
- https://docs.flywheel.paradigma.inc/concepts/repos - Reference/Raw/flywheel-repos.md
- https://docs.flywheel.paradigma.inc/ (index only) - Reference/Raw/flywheel-docs.md
- https://deepseek.playform.cloud/ - Reference/Raw/playform-site.md
- DeepSeek Harness Trajectory package README (URL not recorded in the capture) -
  Reference/Raw/dsh-trajectory.md
