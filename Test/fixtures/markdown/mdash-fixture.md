# mdash fixture - dash normalization test

This file contains em-dashes and en-dashes on purpose:

- The em-dash — a long dash — separates clauses like this. (edited live via the edit-exemption)
- The en-dash – shorter – spans ranges (2020–2024).
- Mixed: — and – and – and — in one line.
- A range 10–20, an aside — trust me — and another 30–40.

The question under test: does any hook rewrite these to a plain hyphen (-)?
Expected: no hook touches file contents - the governor/pinner/cargo govern
manifest versions only, and the mdash normalizes model output streams, not
files. This file should stay byte-identical.