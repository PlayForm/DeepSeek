# ARCHIVE-STYLE - The Single Document Template for the Documentation Tree

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| Registry | Documentation/ARCHIVE-STYLE.md                            |
| Category | Documentation root                                        |
| Kind     | Living standard - governs every other document            |
| Date     | 2026-10-20                                                |
| State    | Active                                                    |
| Index    | Documentation/INDEX.md                                    |

> One style for every document in the Documentation tree, so any later
> document - and any reader - can navigate the archive the same way every
> time. The style takes its conventions from the HPC (Halted-Process
> Classification) tables and the plans in
> `~/Developer/Application/PlayForm/Aphrodite/.hermes`: one fixed table
> schema everywhere, a metadata header up top, a status table at the
> bottom, numbered sections, ASCII only.

---

## 1. The three fixed blocks

Every document is built from three blocks, in this order:

1. **The title** - the document's own first heading, unchanged from its
   original content.
2. **The metadata table** - directly under the title, one fixed schema
   (section 2).
3. **The body** - the original content, untouched (the prose, the
   sections, the quoted ledger strings stay byte-exact).
4. **The status table** - at the very end, one fixed schema (section 3).

Nothing from the original content is removed or rewritten when a document
is converted: the conversion is the header + the status table + updated
cross-references. The status table is the document's face toward the
archive; the body is the one-shot record of what was attempted.

## 2. The metadata table (the header)

Six rows, always the same labels, always a two-column pipe table:

```markdown
| Field    | Value                              |
| -------- | ---------------------------------- |
| Registry | Documentation/Plans/TOMORROW-REVIEW.md |
| Category | Plans                              |
| Kind     | Living record                      |
| Date     | 2026-10-07                         |
| State    | Active                             |
| Index    | Documentation/INDEX.md             |
```

| Row        | Allowed values                                                                                          | Meaning                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `Registry` | the document's own path from the Documentation root                                                      | the canonical address (update it if the file moves)          |
| `Category` | `Plans` / `Researches` / `Guides` / `Reports` / `Plugins` / `Archive/<Topic>` / `Documentation root`      | which folder it lives in                                     |
| `Kind`     | `Living record` / `Living plan` / `Queued plan` / `Research output` / `Guide` / `Report` / `One-shot record` / `Standard` | what the document is                                     |
| `Date`     | `YYYY-MM-DD`                                                                                             | the date the work happened (the original date, never the conversion date) |
| `State`    | `Active` / `Complete` / `Superseded` / `Planned`                                                          | the document-level state                                     |
| `Index`    | `Documentation/INDEX.md`                                                                                 | the archive index every document points back to              |

## 3. The status table (the footer)

One table at the end of the document, under a `## STATUS TABLE` heading.
One row per functionality, feature, decision, or problem the document
describes - the things a reader would want to check against reality.

```markdown
## STATUS TABLE

| Functionality                      | Status      | Evidence                                                     | Date       |
| ---------------------------------- | ----------- | ------------------------------------------------------------ | ---------- |
| Per-test smoke folders             | implemented | `Maintain/Run-Smokes.mjs` - "All 207 smoke suites passed"     | 2026-10-20 |
| The routing enforcer plugin        | open        | this document only - no package exists                        | 2026-10-09 |
| Dual-source one-name builds        | superseded  | by SPLICE-ETS - the `ets-*` namespace split                   | 2026-10-09 |
```

### 3.1 The columns

| Column          | Content                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| `Functionality` | the feature, decision, or problem, named the way the body names it                          |
| `Status`        | one value from the vocabulary in 3.2                                                        |
| `Evidence`      | the concrete proof: the command's last line, the commit, the file path, or "this document only" |
| `Date`          | the date the evidence is from (`YYYY-MM-DD`)                                                 |

### 3.2 The status vocabulary (fixed, seven values)

| Value         | Meaning                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| `implemented` | the functionality exists in code and is verified by its arbiter (the smokes, the build, the live battery) |
| `resolved`    | the problem/decision was settled (a question answered, a decision ratified, a bug fixed and verified) |
| `in-progress` | the work has started but has not landed its final verification                                  |
| `open`        | described or decided but nothing exists yet - a candidate for a later session                   |
| `superseded`  | a later decision replaced it (name the replacement in `Evidence`)                                |
| `deferred`    | explicitly postponed (name the condition in `Evidence`)                                         |
| `rejected`    | considered and declined (name the reason in `Evidence`)                                          |

### 3.3 The evidence discipline

- Every row cites something checkable: a command's last line, a commit
  hash, a file path, a ledger line - or honestly says `this document
  only` when nothing exists outside the document.
- Statuses come from the actual state, never from the document's own
  optimism. The authoritative sources are (in order): the document
  itself, `Documentation/Plans/TOMORROW-REVIEW.md` (see the index), the
  git log, the runner (`node Maintain/Run-Smokes.mjs` - its last line),
  and the built site (`Site/Target`).
- A row may be `open` even in a `Complete` document: the table records
  per-functionality truth, the `State` field records the document's
  lifecycle.

## 4. The section structure (the body)

The body keeps the original content, but where a document is written
new, it follows this four-part arc (the HPC plans' shape):

1. **The intent** - what was attempted and why (the header blockquote
   carries this).
2. **The attempt** - the design, the plan, the research (the body).
3. **The outcome** - what landed, with the evidence (the status table).
4. **The residuals** - what remains open (the `open` / `deferred` rows).

## 5. The formatting rules

1. **ASCII only** in new content. The existing unicode in the original
   bodies stays byte-exact (the quoted ledger strings are part of the
   smoke contract and are never rewritten).
2. **Tabs for indentation**, pipe tables aligned with spaces (the
   repository's Prettier style; YAML blocks inside documents keep
   spaces - tabs are invalid YAML indentation).
3. **One fixed table schema per table** across the whole tree - a row's
   meaning is the same in every document (the HPC convention: all pass
   files share one table schema).
4. **Cross-references use paths from the Documentation root**, e.g.
   `Documentation/Archive/Live-Containers/RESEARCH.md` - so a moved file
   is found by grep.
5. **New documents register themselves**: add a row to
   `Documentation/INDEX.md` when a document is added.
6. **Numbered sections** for the body where the original uses them;
   the metadata table and the status table are never numbered (they
   are the fixed frame).

## 6. The conversion procedure (how a document is converted)

1. Move the file to its category folder (`mv` - byte fidelity, no
   content change on the move).
2. Insert the metadata table directly under the title (the `edit` tool
   only - the normalize hooks are active for streamed writes).
3. Append the `## STATUS TABLE` at the end, one row per functionality
   described, statuses from the actual state.
4. Update every cross-reference in the tree that pointed at the old
   path.
5. Add the document to `Documentation/INDEX.md`.

## 7. The folder tree (the categories)

```text
Documentation/
  INDEX.md              the archive index + the status dashboard
  ARCHIVE-STYLE.md      this standard
  FRAMEWORK.md          the distilled requirements + the skill framework
  Brand/                the branding
  Plans/                the living + queued plans (the work that has not landed)
  Researches/           the research outputs (the questions that were answered)
  Guides/               the operating manuals (how to run and test the family)
  Reports/              the audits and diagnoses (what was investigated)
  Plugins/              the plugin registry documents
  Archive/              the one-shot records of completed attempts
    Smoke-Restructure/  the smoke-suite restructure
    Site/               the site updates and the case study
    Live-Containers/    the live containers research, requirements, design
    Tool-Coach/         the tool-coach plans
    Split/              the Classic/EffectTS split decisions
    CCR/                the CCR hook plans
    Normalize/          the normalize-family plans
  Handoff/             (untouched) the original handoff tree
  Skill/                (untouched) the loadable skills
```

The untouched trees (`Handoff/`, `Skill/`) keep their own internal
structure: `Handoff/` is the original delivery record, `Skill/` is the
loadable skills home - both are referenced by path from the harness and
from this document.

## STATUS TABLE

| Functionality                                            | Status      | Evidence                                                          | Date       |
| -------------------------------------------------------- | ----------- | ----------------------------------------------------------------- | ---------- |
| The single template (metadata table + status table)      | implemented | this document; applied to every document in the conversion         | 2026-10-20 |
| The status vocabulary (seven fixed values)               | implemented | section 3.2                                                        | 2026-10-20 |
| The folder tree (Plans/Researches/Guides/Reports/Archive) | implemented | the conversion; `Documentation/INDEX.md`                           | 2026-10-20 |
| The conversion procedure (move, header, table, refs)      | implemented | the conversion session's report                                    | 2026-10-20 |
| Style source: the HPC tables in Aphrodite `.hermes`      | resolved    | `classification/TAXONOMY.md` - one table schema, metadata header   | 2026-10-20 |
| New-document self-registration rule                      | open        | enforced by convention only - no lint/gate checks it yet           | 2026-10-20 |
