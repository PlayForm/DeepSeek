# Transcript-And-Digest

This folder covers the live session's derived history and the bounded digest the review model
receives: the projection, the tool-call count, the tail boundary, the no-op case, the two per-line
caps, and the collapse.

## Intent

`Session.deriveMessages()` is the only history accessor this harness has, and the digest is the only
place the review spends its input budget. Two rules make the digest safe, and both are easy to
break:

- **The tail is verbatim and never starts on a tool result.** A digest that cuts between a call and
  its result hands the reviewer an unanswered call, and the first thing it does is reason about a
  result it cannot see. The tail therefore grows until it starts on a non-`tool` message.
- **The collapse keeps both sides.** A digest of assistant turns only hides exactly the corrections
  the review exists to catch; a digest of user turns only hides the workflow that was corrected.

The projection is defensive because the harness's block union has seven arms and this plugin reads
two of them: `text` contributes its text, `tool-call` contributes its name, and everything else -
`reasoning` included - contributes nothing. The count is BLOCKS, not messages, because a turn that
made three calls in one step is exactly the turn the interval exists to notice.

**One divergence from the plan is recorded here rather than hidden.** Plan section 4.4 says the
prefix drops `system` and `tool` messages; the leaf renders every non-user, non-assistant role as
`<ROLE>: <text>` and drops only an EMPTY text (`Source/Function/Digest.ts:128-132`). This folder
asserts the leaf's behaviour, because a smoke follows the leaf and reports the contradiction instead
of encoding the plan's version of it. The plan also says the older messages collapse into ONE
synthetic user message; the digest here is a string, so they collapse into one summary SECTION
behind one header, which is the same content in the shape the request needs.

## Scenario

- "P1: the projection keeps text and tool-call blocks and drops the rest" - a `reasoning` block is
  dropped at the boundary and the call is counted.
- "P2: an unknown role is dropped and a non-list content is kept empty" - a row that is not a
  message never reaches the digest.
- "P3: a session that refuses to derive is an empty transcript, not a crash" - a disposed session
  has nothing to review.
- "P4: the tool-call count is blocks, not messages" - two calls in one step count twice, and a
  nameless call is still a call.
- "G1: the tail never starts on a tool result" - with `digestTail: 2` the tail grows to three
  messages so it starts on the assistant message.
- "G2: a transcript that fits in the tail is returned unchanged" - the no-op case invents no header.
- "G3: the older turns collapse into one summary section before the tail" - one header, the summary
  lines, then the verbatim tail, with `kept + collapsed` accounting for every message.
- "G4: the two per-line caps bound the summary and never the tail" - 300 and 200 cut the summary
  lines, and a 400-character tail line is kept whole.
- "G5: an assistant line names its tools and prints `?` for an absent name" -
  `ASSISTANT[tools: read, ?]` then `ASSISTANT: done`.
- "G6: every role keeps its text and an empty text contributes no line" - the leaf's rule, and the
  empty transcript digests to nothing.

## Fixtures

The fixtures are the shared Harness: `FakeAgent` with a recorded message list (and the
`deriveThrows` arm), `Say`/`Call`/`Turn` for the block shapes, and `Foreign` for a block the
plugin's own type does not declare, which is how the projection's narrowing is asserted without a
cast.

The digest header is copied byte for byte from `Source/Function/Digest.ts` and asserted as a
constant, so a reflow of the leaf fails here.

## Expected ledger strings (byte-exact)

None. Neither leaf logs; the digest counts are the report's input, and `Source/Library.ts` owns the
line that prints them.

The digest header is asserted byte-exactly:
`[Earlier conversation digest - older turns summarised to bound the review's cost. Recent turns follow verbatim below.]`

## Expected count

10 PASS.
