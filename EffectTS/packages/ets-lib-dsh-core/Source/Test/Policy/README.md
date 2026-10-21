# Policy

What this test verifies.

## Intent

`Policy` is the update-policy loader every update engine calls before dispatching:
it reads the module's `update-policy.json`, falls back to the module's built-in
default object on any failure, and reports each decision through the caller's
`Append` (the module's ledger). It is its own folder because it is the core's only
filesystem-touching helper - the read path, the fallback path and the diagnostics
are one contract, and the two diagnostic lines are byte-identical ledger strings
consumers rely on. This is the ETS suite's section 3 (the Classic arbiter section,
byte-identical), moved verbatim; it is also the only folder in the core suite that
touches the filesystem.

## Scenario

- Group: Policy - the read -> fallback -> diagnostics mechanics (the tmpdir
  fixture from the harness; every sub-scenario resets the captured lines).
    - Check 1: "Policy: absent file -> built-in default + the byte-identical
      diagnostics" - returns the built-in default object BY IDENTITY and captures
      exactly the two diagnostic lines (no-policy + default).
    - Check 2: "Policy: readable file -> the file's policy, silent" - writes a
      valid policy file, gets its parsed contents back, and the captured lines
      stay EMPTY (the negative control for the diagnostics).
    - Check 3: "Policy: unreadable file -> built-in default + the unreadable
      diagnostic" - writes "{ not json", gets the default back, and captures the
      unreadable + default lines.
    - Check 4: "Policy: the Quiet form skips every diagnostic" - the Quiet form
      returns the default and captures NO lines even for a missing file.

## Fixtures

- A fresh OS tmpdir root (`mkdtempSync`, prefix "core-smoke-") from the harness's
  `TempRoot` - created once per run, left in place after the run (the source
  suite's behavior).
- Three files inside it, created by the test: `nope.json` (never created - the
  absent case), `policy.json` (valid JSON: `{"reject":["chalk"],
  "verifyCommand":"npm test"}`), `bad.json` ("{ not json").
- `Lines` + `Append`: the capturing ledger seam; `Defaults = { reject: [],
  verifyCommand: null }`: the built-in default object.

## Expected ledger strings (byte-exact)

The two diagnostic lines (the separator is U+2014, an em dash, in the runtime
string; shown here with an ASCII hyphen because this README is ASCII):

- `update: no policy at <abs-path>/nope.json - using built-in default`
- `update: using built-in default policy`

And for the unreadable case:

- `update: unreadable policy at <abs-path>/bad.json - using built-in default`
- `update: using built-in default policy`

`<abs-path>` is the mkdtemp root; the line interpolates the SAME `Path.join` the
assertion builds, so the strings match byte-for-byte at runtime.

## Edge cases

- Absent file and unreadable file both fall back to the built-in default - the
  object is returned BY IDENTITY (reference equality), not a copy.
- The happy path (readable file) must stay SILENT - zero diagnostic lines.
- The Quiet form suppresses the diagnostics but not the fallback.

## Expected count

4 PASS.
