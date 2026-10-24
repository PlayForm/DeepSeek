# Resolve

The layered resolution (D2) against REAL temporary trees and a temporary
home (never the real `~/.dsh`).

## Scenarios

- R1: a workspace carrying only the default marker
  (`Documentation/ARCHIVE-STYLE.md`) and no pack layer resolves to the
  BUILT-IN pack (identity), projects its seven `doc` families, and the
  locator finds it by the default signature.
- R2: a repo layer `.dsh/pack.yml` declares a custom signature, a `slug` and
  one `doc/Plan` family; the resolved pack carries them, and the locator
  resolves a FOREIGN workspace by the pack's signature (not the default).
- R3: the user layer
  `<home>/.dsh/playform/workspaces/<slug>.yml` is read first and the repo
  layer overrides it: the user's priority 9 survives, the repo's threshold
  0.5 wins, the targets merge by path (user companion first, repo companion
  appended), and the user's `learning.propose` survives.
- R4: a user-ONLY layer is located by the repo basename, lowercased.
- R5: a pack whose signature marker is absent does not resolve (the gate).
- R6: a foreign workspace without a pack stays silent (`undefined`).
- R7: a `.json` pack resolves through `JSON.parse` (the no-parser fallback).
- R8: `Load` memoizes one pack per root (the same object twice).

## Expected count

10 PASS.
