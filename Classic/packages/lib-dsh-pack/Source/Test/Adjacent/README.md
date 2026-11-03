# Adjacent

This folder covers the session-history fold and its consumers: the `Touch` fold over event objects (pure), the `Adjacent` co-touch ranking over a folded sequence (pure), the `Root` walk over REAL temporary directories, and the `builtin: false` opt-out on the layered resolution.

## Scenarios

- A1: an event that is not `tool/call` folds to nothing; a JSON-string payload is parsed defensively, an object payload is used directly, and the path field is taken in the `file_path`, `path`, `filePath` order (a missing name leaves the tool `""`).
- A1: backslashes become slashes and a leading `./` is stripped; malformed JSON, non-object payloads, path-less arguments and empty strings all fold to `undefined`.
- A2: a path that co-occurs with the anchor twice outranks one seen once (count first), and the near neighbour outranks the far one (`1 / (1 + distance)`); the anchor itself is never a candidate.
- A2: the window bounds how far a co-touch carries (a follower at distance 8 counts, distance 9 does not; a smaller window truncates), the limit slices the ranked rows, and an anchor that never appears folds to no candidates.
- A3: a directory carrying `package.json` is the root of a path inside it; the walk climbs past bare directories to the repo carrying `.git`; an empty path starts at the explicit cwd and falls back to it.
- A4: with `builtin: false` a layer-less workspace resolves to `undefined` (the default still resolves the BUILT-IN pack), and a workspace with a repo layer resolves as usual.

## Expected count

17 PASS.
