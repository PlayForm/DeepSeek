# The DeepSeek Reference shelf

The DeepSeek repository keeps its external sources in `Reference/`, following the shelf already in
use in a sibling project's `Reference/` directory.

## Layout

```text
Reference/
  README.md          the index: source -> link -> raw file -> role -> current status
  Raw/               one Markdown file per fetched URL, unedited
  Curated/           the project's distilled notes and code extracts
  Specimens/         generated artefacts that illustrate a decision
  fetch-errors.log   one line per failed URL: URL, exit code, crawler message
```

## Conventions

1. **The names.**

    File names are kebab-case and derived from the URL.

    Two pages of one site keep the site prefix: `paperjs-division-raster.md` and
    `paperjs-qbertify.md`.

2. **The text-poor page.**

    A fetched page that is a canvas demo, a client-rendered shell, or a bot wall is kept and marked
    text-poor in the README.

    Its useful content goes to `Curated/` as a code extract.

3. **The index.**

    The README table is the source of truth, and a file in `Raw/` without a row is a defect.

4. **The curated file.**

    A file in `Curated/` states the decision and the source link at the top, then the detail.

    It is not a copy of the page.

5. **The date.**

    The fetch date is recorded in the fetch-status paragraph of the README, because the pages drift.

## The sibling shelf's precedent

A sibling project's Reference shelf established the same three-part shelf (index, Raw, Curated) for
its own toolchain.

The DeepSeek shelf copies the shape, not the content: its subject is the procedural icon pipeline,
so `Raw/` holds rendering libraries and generative examples, and `Curated/` holds the toolchain
decision and the algorithm notes that the generator implements.
