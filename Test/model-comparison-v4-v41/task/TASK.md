# Task: Markdown Table Normalizer (CLI)

A self-contained coding task. Every run (all four subagents, in both rounds)
executes this exact spec from its own results folder. Nothing outside the run's
results folder may be created or modified.

## What to build

A zero-dependency Node.js CLI that normalizes GitHub-Flavored Markdown (GFM)
pipe tables in a text file, and leaves everything else byte-identical.

### Deliverable (all inside the run's results folder)

| File | What it is |
|---|---|
| `src/normalize-tables.js` | The CLI entry: `node src/normalize-tables.js <input.md> [output.md]` |
| `src/` (rest) | Modules as you see fit |
| `test/run.js` | The test runner: Node built-in `assert` only, zero deps, prints one `PASS`/`FAIL` line per case, exits `0` only when every case passes |
| `fixtures/` | Input fixtures (`*.in.md`) + expected outputs (`*.out.md`) |
| `README.md` | Usage, design decisions, edge-case handling notes |
| `REPORT.md` | The run report (see the prompt's report format) |

Run from the results folder: `node src/normalize-tables.js <input> [output]`.

## Behavior spec

1. **Table detection.** A GFM pipe table starts at a line whose first
   non-space character is `|`, has a delimiter row as its SECOND row (only
   `-`, `:`, and spaces: `---`, `:---`, `---:`, `:---:` variants), and
   continues while subsequent lines start (after optional leading spaces)
   with `|`. A table directly after a heading or prose line with no blank
   line between is still a table.
2. **Normalization.** For each table:
   - Split rows into cells on unescaped `|` (a `\|` inside a cell is content,
     not a separator). Trim each cell's surrounding whitespace.
   - Pad every cell to the maximum content width of its column: one space
     between the pipe and the cell content, i.e. `| a  | bb |`.
   - Keep the delimiter row's alignment semantics: `---` (or `:---`) = left,
     `---:` = right, `:---:` = center. The colon sits at the padded edge:
     `| :---: |` centers within the column width, `| ---: |` right-aligns
     with the colon at the right edge. The delimiter row is padded to the
     same column widths as the body rows.
   - A trailing `|` closes every row (including the delimiter row).
3. **Everything else is byte-identical.** Prose, lists, blockquotes,
   headings, and especially tables inside fenced code blocks (triple
   backticks) pass through untouched.
4. **Empty cells** pad to the column width (e.g. a width-2 column gives
   `|    |`).
5. **Not-a-table cases (leave untouched, never crash):**
   - A `|`-starting line whose second line is not a delimiter row.
   - A table whose body rows have an inconsistent column count (the
     delimiter's column count wins; any mismatch = the whole construct is
     not a table).
   - A delimiter row containing anything other than `-`, `:`, spaces.
6. **Output.** With `output.md`, write the normalized content there; without
   it, print to stdout. Preserve the input's line endings (CRLF stays CRLF,
   LF stays LF) and its final-newline state. Exit `0` always, except a
   missing/unreadable input file: print a message to stderr and exit `1`.
7. **`--check` flag.** `node src/normalize-tables.js --check <input.md>`:
   exit `0` if the input is already normalized, exit `1` if it would change,
   printing a one-line-per-difference summary to stderr.

## Tests (all must pass)

| Case | Input | Expect |
|---|---|---|
| T1 | Ragged 3-column table with cells of unequal width | Cells padded to each column's max width |
| T2 | Table with left / right / center alignment colons | Colons preserved with correct padding |
| T3 | A table inside a fenced code block | Untouched, byte-identical |
| T4 | Empty cells in a table | Padded to column width |
| T5 | `| not a table` followed by prose | Untouched |
| T6 | Table with inconsistent column counts | Untouched, no crash, exit 0 |
| T7 | `--check` on an already-normalized file / on a ragged file | Exit 0 / exit 1 |
| T8 | Idempotence: normalize the normalized output again | Byte-identical second pass |

Expected outputs for T1-T8 live in `fixtures/expected/`; the runner compares
actual vs expected byte-for-byte (line endings normalized for comparison on
CRLF fixtures, but the output bytes for LF fixtures must match exactly).

## Adversarial edges (the arbiters check beyond the list above)

- A single-column table.
- A 10+ column table.
- `\|` escaped pipes inside cell content (not separators).
- CRLF input file (CRLF preserved in output).
- A table with no blank line before it, directly under a heading.
- A delimiter row with stray whitespace between the colons.
- Inline code spans containing `|` inside a cell (treated as content).
- A file with no tables at all (output must be byte-identical to input).

## Constraints

- Node.js only, zero dependencies (no packages, no `npm install`).
- Works on Node 18+.
- Do not look for an existing implementation anywhere (no web search, no
  prior artifacts, no reference implementation) - write it from this spec.
- Do not touch anything outside your results folder. Do not run `git` writes.
