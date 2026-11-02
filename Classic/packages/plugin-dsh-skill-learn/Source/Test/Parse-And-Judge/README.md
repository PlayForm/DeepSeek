# Parse-And-Judge

This folder covers the gate: the strict reply parse and the sixteen deterministic rules between a
reply and the corpus. Nine parse ids and sixteen judge ids, each with its refusal string asserted
byte for byte.

## Intent

The parse decides whether a reply IS an operation list; the judge decides whether one operation may
land. Both are pure, and both are asserted per rule, because a rule with no test is a rule the next
refactor deletes.

The parse is strict on purpose. Prose around the object, a second fenced block, a non-json fence, a
coerced number, a fourth operation kind and a nine-operation list are all FAILURES rather than
silently empty replies, because an empty operation list and a broken reply look identical to the
lifecycle and the difference is the only signal that the prompt or the route needs attention. The
two tolerances are exactly the plan's: a bare object, or one `json` fence.

The judge runs sixteen rules in the section 6.2 precedence and reports the FIRST refusal, with the
refusal string as the report and ledger detail. The folder reaches every one of the sixteen:

| Id | Check |
| --- | --- |
| `operation-known` | J1 |
| `name-grammar` | J2 (including the 64-character ceiling) |
| `target-absent` | J3 |
| `target-present` | J3 |
| `body-carried` | J4 |
| `anchor-unique` | J5 (zero and two occurrences) |
| `anchor-changed` | J6 (blank, identical, blank replacement) |
| `frontmatter-valid` | J7 (no fence, no body, the wrong name, a legacy camelCase key) |
| `description-present` | J7 (an empty description) |
| `support-path` | J8 |
| `never-agreement` | J9 |
| `never-archive` | J9 |
| `narrative-free` | J10 (a date, a reference number, a quoted user sentence) |
| `negative-claim` | J10 (and the same claim WITH the fix is accepted) |
| `duplicate-rule` | J10 |
| `size-bound` | J11 |

One boundary is deliberate and pinned: a blank `oldString` or `newString` is NOT a parse failure.
The judge's `anchor-changed` owns it, so a blank anchor ends the run as `refused` rather than
`unparsable` - the model's evidence is blamed, not its syntax.

## Scenario

- "P1: `empty` - a reply that is blank after trimming".
- "P2: `fence` - prose, a trailing note, or a non-json fence".
- "P3: `json` - `JSON.parse` threw".
- "P4: `shape` - not an object, or no operations array".
- "P5: `unknown-key` - a top-level key the phase does not allow" - including `views` in phase 2.
- "P6: `field` - a missing, non-string or blank required field" - including the phase-1 `views`
  field itself.
- "P7: `kind` - a fourth operation kind".
- "P8: `count` - more operations than the bound", at two different bounds.
- "P9: `name` - a skill or a views entry that is not kebab-case".
- "P10: a bare object and one json fence are both accepted, in both phases".
- "P11: a blank anchor is not a parse failure - the judge owns it".
- "J1" through "J11": the sixteen rules, one group each as the table above names them.

## Fixtures

The fixtures are the shared Harness: `CorpusView` (the judge's read-only view of a literal map, as
`Source/Interface/Corpus.ts` documents it), `Knobs` for the configuration the judge reads
(`maxSkillChars`, `agreementPath`, `archiveRoot`, `skillsRoot`), and the real built
`Target/Function/{Parse,Judge}.js` leaves.

The corpus paths are the temp home's, because `Expand` is the leaf's own path rule and the judge
compares against it: `~/.dsh/AGENTS.md` and `~/.dsh/skills/.archive` are the two protected paths.

`operation-known` is handed an operation built from data rather than a typed literal, because the
rule exists for exactly the caller that skipped the parse and the type does not admit a fourth kind.

## Expected ledger strings (byte-exact)

The judge's refusal strings are the ledger's `detail`, and every one of them is asserted exactly:

- `operation kind '<kind>' is not one of patch, create, support`
- `skill name '<name>' does not match the corpus grammar`
- `skill '<name>' already exists; create refuses an existing path`
- `skill '<name>' is not in the catalog; patch needs an existing skill`
- `skill '<name>' was not loaded in the confirm prompt; read before write`
- `oldString occurs <n> times in '<name>'; the anchor must be unique`
- `oldString and newString are identical or blank`
- `the result would not parse as a skill file: <reason>`
- `the frontmatter description is empty`
- `support path '<path>' is not a support file`
- `the target is the working agreement; it is never written`
- `the target is inside the archive; it is never written`
- `the text carries a date, a reference number, or quoted user text`
- `the text asserts a tool is broken without the fix that makes it work`
- `the text repeats a line already present in '<name>'`
- `the result is <n> characters; the bound is <m>`

The parse's failure details are asserted exactly too, except the `json` detail, which carries the
engine's own `JSON.parse` message and is therefore asserted by its stable prefix
(`JSON.parse failed: `).

## Expected count

22 PASS.
