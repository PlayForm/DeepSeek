---
name: anydoc-documents
description:
    "Parse and convert PDF, DOCX, PPTX, XLSX, EPUB, ODT, RTF, and CSV to GitHub-Flavored Markdown
    with the anydoc CLI; read a document's text in one fast command, not LibreOffice or Python
    extractors."
whenToUse:
    "Load when a task needs a PDF, DOCX, PPTX, XLSX, EPUB, ODT, ODP, ODS, RTF, DOC, PPT, or CSV
    file's text or structure, or one converted to markdown. Not for layout rendering, PDF export, or
    authoring Office files."
version: 1.1.0
updated: 2026-10-28
---

# anydoc Documents

This skill governs one decision: how to get a document's content into text.

`anydoc` converts a document to GitHub-Flavored Markdown in one process, with no GUI, no daemon, and
no Office suite.

The failure that it prevents is the slow path: launching LibreOffice headless or assembling a Python
extractor stack to answer a question that one command answers in under a second.

## When to use

- Read or extract text from a PDF, DOCX, PPTX, XLSX, EPUB, ODT, ODP, ODS, RTF, DOC, PPT, or CSV
  file.
- Convert one of those formats to Markdown for indexing, quoting, diffing, or input to another model
  or tool.
- Summarize a paper, contract, deck, or spreadsheet without opening it.
- Extract text in bulk across a directory of mixed documents.
- Do not use this skill for visual layout, page images, or rendering fidelity (see the
  `office-render` skill), for a PDF (see `office-export-pdf`), for authoring or editing DOCX, PPTX,
  or XLSX (see `office-docx`, `office-pptx`, `office-xlsx`), or for HTML input, which anydoc does
  not support.

## The rules

1. **anydoc first.**

    Use `anydoc` first for each request that reads a document, and keep LibreOffice, `pdftotext`,
    and Python parsers as fallbacks rather than defaults.

2. **The PATH call.**

    Call `anydoc` from `PATH`.

    If `PATH` does not hold it, find it once and report the absolute path that you used, and never
    hardcode an installation path.

3. **One input per call.**

    Give the command one input file per call, and use a shell loop for a batch.

4. **The output file.**

    Write the Markdown with `-o <out.md>` when the text will be reused, and send it to stdout only
    for a quick read.

5. **The exit code.**

    Read the exit code before you open the output, because a non-zero code means that the Markdown
    is absent or partial.

6. **The scanned PDF.**

    Treat exit 3 as "scanned PDF": do not invent text, and do not start OCR before you ask the user.

7. **The OCR consent.**

    Ask for explicit consent before `--ocr hosted`, because it uploads the document to Firecrawl
    Parse and needs `FIRECRAWL_API_KEY`.

8. **No HTML claim.**

    Never claim HTML support, because anydoc rejects HTML with exit 1.

9. **No source overwrite.**

    Never overwrite the source document, and write the Markdown to a new path.

10. **The quoted path.**

    Quote the path when it holds spaces, and never put a shell glob in the command for a filename.

11. **The audit.**

    Audit the converted Markdown before you quote it, because page headers, OCR noise, table loss,
    ligatures, and hyphenation survive the conversion.

    The shared audit method belongs to the `crawl4ai` skill and its `markdown-quality` reference,
    and the document-specific catalog is `references/conversion-artifacts.md`.

## The workflow

1. **The input.**

    Find the input file and confirm that it exists: `ls -l "<file>"`.

2. **The binary.**

    Confirm the binary and its version: `anydoc --version`.

    Expect `0.2.4` (verified 2026-10-21).

3. **The conversion.**

    Convert to a Markdown file next to the output location that you need:
    `anydoc "<file>" -o "<file>.md"`.

    For a one-off read, drop `-o` and read stdout.

4. **The exit codes.**

    Read the exit code.

    `0` means success; `1` means that the document could not be read or converted; `2` means a usage
    error; `3` means that OCR is necessary.

5. **The check.**

    Read the produced Markdown with the `read` tool and confirm that it holds the expected headings,
    tables, and body text; check it against `references/conversion-artifacts.md` before you quote
    it.

6. **The format retry.**

    On exit 1, try again once with an explicit format: `... -f pdf "<file>"`.

    If it still fails, report the failure and the exit code, and do not switch tools without a word.

7. **The OCR stop.**

    On exit 3, stop and ask the user whether to run OCR; explain that `--ocr hosted` sends the file
    to Firecrawl Parse.

    On consent, run: `... --ocr hosted "<file>" -o "<file>.md"`.

8. **The stdin case.**

    For stdin, pipe into `-`; CSV from stdin needs an explicit format:
    `... - --format csv < data.csv`.

9. **The gate.**

    Verification gate: the output file exists, is not empty, and starts with Markdown content; then
    report the command that you used and the exit code.

## Decision table

| Situation                                  | Action                                             |
| ------------------------------------------ | -------------------------------------------------- |
| Text PDF, DOCX, PPTX, XLSX, EPUB, ODT, RTF | `anydoc <file> -o <file>.md`                       |
| Need only a quick look at the content      | `anydoc <file>` and read stdout                    |
| Several documents in one directory         | Shell loop, one `anydoc` call per file             |
| Input is a CSV or extensionless file       | Add `-f csv` (or the matching format name)         |
| Exit 1 on a file with a clear extension    | Retry once with `-f <format>`, then report failure |
| Exit 3 (scanned or image-only PDF)         | Ask the user; only then `--ocr hosted`             |
| Input is HTML                              | Unsupported; use a text extractor instead          |
| Need page images, layout, or visual check  | `office-render` skill                              |
| Need to create a PDF                       | `office-export-pdf` skill                          |
| Need to author or edit an Office file      | `office-docx`, `office-pptx`, `office-xlsx`        |

## Verification

Run `anydoc --version` and expect `0.2.4`. Run `anydoc "<file>" -o "<file>.md"; echo $?` and expect
`0` with an output file that is not empty. A non-zero code is a true failure of this skill's path
and not a reason to try another tool without a word, so report the code and the file. The full
format list is the `--format` line of `anydoc --help`:

```text
doc, docx, odt, pdf, ppt, pptx, rtf, epub, xlsx, ods, odp, csv
```

## Anti-patterns

| Mistake                                          | Cost                                      | Correct move                      |
| ------------------------------------------------ | ----------------------------------------- | --------------------------------- |
| `soffice --headless --convert-to txt` for a read | Tens of seconds, profile locks, no tables | `anydoc <file>`                   |
| Writing a `pdfplumber`/`python-docx` script      | Minutes of setup, brittle dependencies    | One `anydoc` call                 |
| Sending a private scan to hosted OCR unasked     | Confidential data leaves the machine      | Ask first, then `--ocr hosted`    |
| Claiming HTML is supported                       | Failed conversion, false promise          | Say unsupported; use an extractor |
| Ignoring exit 3 and quoting empty Markdown       | Fabricated or missing content             | Stop, report, ask about OCR       |
| Overwriting the source with `-o <source>`        | Data loss                                 | Write to a new `.md` path         |
| Converting a whole tree with one glob argument   | `anydoc` takes one input only             | Loop one file per invocation      |

## References

| File                                 | Covers                       | When to read              |
| ------------------------------------ | ---------------------------- | ------------------------- |
| `references/conversion-artifacts.md` | PDF and OCR artifacts        | A document looks wrong    |
| `anydoc --help` (binary, no file)    | Options, formats, exit codes | Before an unfamiliar flag |
| The `office` skill                   | Routing across Office work   | When the task is mixed    |
| The `office-render` skill            | Layout and page images       | When fidelity matters     |
| The `office-export-pdf` skill        | PDF creation from Office     | When the output is a PDF  |
