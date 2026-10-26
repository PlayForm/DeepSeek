# Parse-And-Judge

The gate between a model's reply and the corpus: the strict parse, then the
deterministic acceptance rules.

## Intent

A lenient parse makes a broken reply look like a quiet session; a missing rule
makes a plausible artifact land in the corpus. This folder pins the closed
operation set, the three parse tolerances (a fence, surrounding prose, a missing
`ops`), and every judge rule with its own id - because a rule with no test is a
rule the next refactor deletes.

## Scenario

Parse:

- "R1: a fenced reply parses to its operations" - a ```` ```json ```` block is
  tolerated, the note survives.
- "R2: `Nothing to save.` is an empty proposal, not an error".
- "R3: an unknown operation kind is a parse FAILURE" - `rewrite` is not in the
  closed set.
- "R4: `support` without a file is a parse failure".
- "R5: more operations than the cap are cut to the cap".
- "R6: prose around the object is sliced away".
- "R7: a non-object reply is a parse failure".

Judge:

- "J1: a non-kebab name is refused" (`name-shape`).
- "J2: a session-artifact name is refused" (`name-artifact`: a year, an
  issue number, a `fix-`/`debug-`/`wip-` prefix).
- "J3: create over an existing skill is refused" (`exists`).
- "J4: patch on a missing skill is refused" (`missing`).
- "J5: a pinned skill is off-limits even to a patch" (`pinned`).
- "J6: a body whose frontmatter names another skill is refused"
  (`frontmatter`).
- "J7: incident narration dressed as a rule is refused" (`narrative`).
- "J8: a negative claim without a fix is refused" (`negative-claim`).
- "J9: the same claim WITH the fix is accepted".
- "J10: a support path outside the three kinds is refused" (`support-path`).
- "J11: the same operation twice is refused as a duplicate".
- "J12: the service's judge reads the LIVE corpus" - a seeded directory exists.
- "J13: the service's judge honours a pin set through the service".

## Fixtures

The shared Harness plus the built `Target/Function/Parse.js` and
`Target/Function/Judge.js` imported directly, with a literal two-predicate
corpus (`exists`, `pinned`) for the rule assertions. J12/J13 go through the real
service so the store-plus-directory corpus wiring is exercised, not assumed.

## Expected ledger strings (byte-exact)

`Pin` logs `lesson: pinned pinned-skill` (message-only form). The folder asserts
the verdict, not the line.

## Expected count

20 PASS.
