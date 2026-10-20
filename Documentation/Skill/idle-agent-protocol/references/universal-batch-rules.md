# The Universal Rules (Batch-Wide Invariants)

> Source: SKILL.md, "The execution (when ACTIVATED)", bullet 3 ("THE UNIVERSAL rules"). Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every agent in the DeepSeek Harness Plugin Family batch carries the same invariant set, active the whole time it works, regardless of what its individual spec says:

1. **Git: NEVER run git add/commit.** The user commits.
2. **Arbiters: the smokes + the site build.** Run them; report the printed results; never assert green without running.
3. **Formatting: tabs** (tabWidth 4, printWidth 100) **; YAML stays spaces.**
4. **Typography laws: Inter + IBM Plex Mono, the 13px floor, no JetBrains Mono.**
5. **Design tokens: the Harness Blue tokens + zero elevation.**
6. **Ledger strings: quoted ledger strings stay byte-exact** - the ledger lines, the JournalExcerpt - never templatized, never reworded.
7. **Corrected facts stay truthful:** the totals 733 Classic / 746 EffectTS, the 19-method ledger, the versions 0.0.1 / effect 4.0.2.

## Why: The Full Philosophy

1. **Git belongs to the user because the user commits MID-SESSION.** A batch agent committing would (a) capture other lanes' in-flight files into its commit, (b) fight the user's own commits for HEAD, and (c) make the tree state unverifiable for every other lane (see ./references/batch-environment.md). The rule is absolute - there is no "safe" commit in a concurrent batch. Reading git state (status, log, diff) is not forbidden; mutating it is.
2. **Arbiters over assertions.** An agent's claim "the build is green" is not evidence; the printed output of the smokes and the site build is. The rule forces every report to carry evidence, which makes each lane's report checkable by any other reader without re-running anything.
3. **Tabs vs YAML is not a contradiction - it is a file-type split.** The family's TypeScript/format surface uses tabs at tabWidth 4 and printWidth 100; YAML files stay spaces because the YAML data format does not accept tab indentation for structure. The split is the family's formatter reality; an agent "harmonizing" one side to the other breaks one of the two.
4. **Typography laws are product law, not taste.** Inter is the UI face, IBM Plex Mono is the mono face, 13px is the smallest permitted text size, and JetBrains Mono is banned outright. A font or sub-13px size introduced in one lane's edit contradicts every other lane's output and the design system.
5. **Zero elevation means no shadows or layered-depth effects** on top of the Harness Blue token set; components derive their hierarchy from the tokens, not from ad-hoc shadows added per surface.
6. **Ledger strings are evidence artifacts.** The ledger lines and the JournalExcerpt are quoted text that the smokes assert byte-identically. Templatizing or rewording them - even to "fix" grammar - breaks the byte comparison and destroys the property that makes them evidence: that they are exactly what was recorded.
7. **The corrected facts are the shared ground truth.** The totals 733 Classic / 746 EffectTS, the 19-method ledger, and the versions 0.0.1 / effect 4.0.2 were corrected by the user and are the reference for every report. An agent that recomputes a "better" number and prints it contradicts the batch's shared reality; the correct response to an observed mismatch is the flag path (see ./references/flag-and-report.md), never a silent substitution.

## Examples

### Good

- Finishing a component edit, running the package's smokes, and pasting the printed totals into the report: "... smokes pass; printed totals: 733 Classic / 746 EffectTS".
- Writing TypeScript indented with tabs (width 4) at a 100-column print width; leaving the plugin's YAML exactly as the formatter spaces it.
- A UI surface set in Inter at 13px with IBM Plex Mono for code, colored only through the Harness Blue tokens, with no shadow.
- Copying a ledger line character-for-character into the report, including its punctuation.

### Bad

- `git add -A && git commit -m "wip"` at the end of a lane - captures other lanes' in-flight files and moves HEAD under everyone.
- "Smokes should pass; my change was small" in the report without running them.
- Replacing tabs with spaces in a .ts file "for consistency" with the YAML.
- Introducing JetBrains Mono in a code block because it looks closer to the design.
- Rewording a JournalExcerpt quote so it reads better - the smokes' byte-identical assertion fails.
- Printing "812 total methods" from a local recount while the corrected facts say otherwise - print the corrected facts and flag the mismatch instead.

## Exceptions

- **Git reads are allowed; git writes are not.** status/log/diff-style inspection is part of verifying the runtime facts (see ./references/batch-environment.md); add/commit/push/checkout-style mutation is forbidden without exception.
- **YAML's spaces rule is built into the format**, so it is an exception inside the tabs rule rather than an exception to the discipline.
- **No exception exists for the ledger strings or the corrected facts.** A genuine discrepancy between what you observe and the corrected facts is a flag, not a correction.

## Failure Modes

- **The helpful commit.** An agent "cleans up" with a commit. Cost: foreign in-flight files captured, HEAD moved under other lanes, tree state unverifiable.
- **The asserted green.** Reports claim arbiter results that were never run. Cost: the batch aggregates false completion; broken surfaces reach the user's review.
- **Format drift.** One lane reformats shared files against the tabs/YAML split. Cost: formatter churn across every other lane's diffs.
- **Typography drift.** Cost: visual inconsistency the user must review twice; banned fonts reappear.
- **The "improved" ledger quote.** Cost: byte-identical smoke assertions fail; the evidence property of the ledger is destroyed.
- **The recomputed fact.** Cost: two numbers circulate in one batch; the user's corrections are silently overridden.

## Arbiters

- **The smokes** - the byte-identical ledger assertions catch every templatized or reworded string; the totals printed by the smokes are the report's evidence.
- **The site build** - catches typography and token violations that survive typing.
- **Review scans** for the banned font name (JetBrains Mono) and for elevation shadows on family surfaces.
- **The report itself** - every arbiter claim in a final report must carry the printed output next to it (see ./references/flag-and-report.md).
