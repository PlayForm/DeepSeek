# Extends

This folder covers the cycle-guarded `extends:` chain against REAL temporary user layers.

## Scenarios

- E1: base -> middle -> repo, where the deepest base merges first, the repo layer overrides its threshold, and the targets merge by path.
- E2: a two-pack cycle (`a` extends `b`, `b` extends `a`) terminates, and each pack merges once (the targets arrive base-first).
- E3: a self-cycle (`extends: [repo, base]` from the `repo` pack) is skipped, while the other base still applies.
- E4: a missing extends name is skipped (fail-open), and the rest resolves.
- E5: an `extends` array merges both bases in declaration order.
- E6: the repo layer overrides its base on the same target path.

## Expected count

6 PASS.
