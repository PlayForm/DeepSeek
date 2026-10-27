# Extends

The cycle-guarded `extends:` chain against REAL temporary user layers.

## Scenarios

- E1: base -> middle -> repo, where the deepest base merges first, the repo layer overrides its
  threshold, and the targets merge by path.
- E2: a two-pack cycle (`a` extends `b`, and `b` extends `a`) stops, and each pack merges once (the
  targets arrive base-first).
- E3: the resolution skips a self-cycle (`extends: [repo, base]` from the `repo` pack), and the
  other base still applies.
- E4: the resolution skips a missing extends name (fail-open), and the rest resolves.
- E5: an `extends` array merges both bases in declaration order.
- E6: the repo layer overrides its base on the same target path.

## Expected count

6 PASS.
