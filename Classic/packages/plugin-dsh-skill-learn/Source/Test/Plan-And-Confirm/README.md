# Plan-And-Confirm

This folder covers the two requests: the plan call that carries the digest and the skill index and
no bodies, and the confirm call that carries every body the plan asked to see.

## Intent

The phase split IS the read-before-write property. Phase 1 may only name the skills whose bodies it
needs; phase 2 is the only request that may return the final list, and it carries the exact current
text so a patch anchor can only be copied from something the model was shown. Two calls maximum, no
repair pass, no iteration.

Three things this folder pins because they are easy to lose:

- **Phase 1 carries no body at all.** The index is one line per skill (`name` and `description`),
  the digest is the transcript, and the phase marker says which reply is wanted. A body can only
  arrive in the second request.
- **Phase 2 renders exactly the set it is handed, each body labelled and fenced.** The fence is one
  backtick longer than the longest backtick run in the body, because a skill about a build pipeline
  almost certainly contains a triple-backtick fence and a fixed delimiter would close early and
  hand the model a truncated body.
- **The reply is the visible text only.** `reasoning`, `tool-call`, `usage` and `finish` frames are
  skipped, so a reply is never a prose-plus-JSON concatenation.

**One obligation this folder cannot reach on its own.** The union the caller loads - `views` plus
every patch and support target - is computed in `Source/Library.ts`, which a parallel lane is
writing. The leaves prove the two halves that make the union work: phase 1 cannot smuggle a body,
phase 2 carries whatever it is given, and the judge refuses a patch target that was never carried
(`C11`). The wiring itself belongs to the service's own folder once `Library.ts` lands.

## Scenario

- "C1: the phase-1 request is one user message: digest, index, marker" - the exact three sections,
  in order, separated by one blank line.
- "C2: the phase-1 request carries the index and no body" - no `File:` label and no fence, and an
  empty catalog states its fallback.
- "C3: the index is one line per skill, and a hidden row is filtered" - a row reporting
  `modelInvocable: false` is hidden, and the index costs one `list` and no `get`.
- "C4: the request carries exactly the six documented fields" - `provider`, `model`, `system`,
  `messages`, `maxTokens`, `signal`, and no `purpose`.
- "C5: the system text is byte-stable and phase 2 removes one section" - the two prompts differ by
  exactly the first-request section, both end with the shared rules, and the text is ASCII.
- "C6: the reply is read from `text-delta` frames only" - reasoning, tool-call, usage and finish
  frames never reach the reply.
- "C7: the phase-2 request carries every body it was handed" - two views, labelled and fenced, in
  the order the caller loaded them.
- "C8: the fence is one backtick longer than the longest run in the body" - a body with a
  triple-backtick fence takes a four-backtick delimiter and is not truncated.
- "C9: the digest and the index precede the bodies, and the marker is last".
- "C10: the route is the knob override per half, then the agent's own options" - each half falls
  back on its own, and an incomplete pair is no route rather than an empty one.
- "C11: a patch target the caller did not carry is refused" - the judge's `body-carried` refusal,
  byte for byte, and the same operation passes once its body was carried.
- "C12: phase 1 asks for views, phase 2 returns the list, and a third call is unrepresentable" - a
  phase-2 reply that carries `views` is refused `unknown-key`.

## Fixtures

The fixtures are the shared Harness: `FakeLLM` (the reply split across two `text-delta` frames, the
recorded request, and a programmable frame list), `FakeSkills` (the rows and the loaded bodies),
`FakeAgent` (the route), and the real built `Target/Function/{Plan,Confirm,Prompt,Catalog,Route}.js`
leaves.

The two phase markers and the digest header are copied byte for byte from the leaves, so a reflow
fails here.

## Expected ledger strings (byte-exact)

None. Neither request logs; the service logs the outcome, and `Source/Library.ts` owns that line.

The phase markers are asserted byte-exactly:
`Phase 1 of 2: return the plan. Reply with one JSON object and nothing else.`
`Phase 2 of 2: return the final list. The bodies above are the current text. Reply with one JSON object and nothing else.`

## Expected count

12 PASS.
