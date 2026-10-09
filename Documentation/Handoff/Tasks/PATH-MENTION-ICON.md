# TASK: PATH-MENTION ICON (agent 4f3579f8)

## TEMPORARY CURRENT STATE (inspected 2026-10-09)
- STATUS: COMPLETE (2026-10-09 - the IDLE-lane activation + one resume after a
  mid-verification death) + VERIFIED by the orchestrator: FileIcon.ts gained
  `IsPathEmbedded(Token, PrevChar)` (a "/" inside the token, a leading ~ or ./
  or a / immediately before the match => a location, not a document) + the new
  Mention() branch AFTER the code-token/quoted-run branches - path-embedded
  tokens render plain (no icon, no chip); the bare mentions keep their
  adornments. The same rule applied to the hardcoded spans (setup's ledger-path
  chips + the governor-cargo/governor-package/pinner-package path chips
  unwrapped; the bare .log chips kept; flavors' /assets/badges.svg unwrapped).
  Built verification: zero log-chips with a "/" across the 21 pages, the
  setup's ~/.dsh/profiles/<name>/package.json iconless in both metas, the bare
  mentions iconed (counts reported), the quoted-run + code-token interplay
  intact, build 21 pages + the curls 200. NEVER committed. Residuals: none of
  this lane's (the other lanes' concurrent diffs expected).

## THE TASK (the spec given)
The user: "the `~/.dsh/profiles/<name>/package.json` line gets a file placeholder
icon before it when it shouldn't, that's a full path even though it mentions
package.json". The Mention logic's file-icon pass SKIPS the path-embedded
filenames (the filename preceded by a path prefix - the ~/, the /, the ./
contexts - "~/.dsh/profiles/<name>/package.json", "node_modules/@playform/.../
package.json", the "/x/package.json" samples) - the icon attaches ONLY to the BARE
file mentions (the standalone "package.json", "pin-policy.json", "Cargo.toml" -
not preceded by the path separators); the log-chip: the same path rule (the
~/.dsh/<name>.log path line vs the bare "governor.log" - the path-embedded .log
names no chip, the bare ones yes - verify + apply). The code-token pass
unaffected. The rules: the corrected claims + the byte-exact content untouched
(the icon placement only); the typography laws; the tokens; the tabs; the
byte-integrity rule; never commit. Arbiter: the build (21 pages) + the dev-server
curls + the built-HTML verification (the setup's path line iconless, the bare
mentions iconed).

## THE ENHANCEMENTS / IMPROVEMENTS
- The "everywhere" doctrine: the path-rule applied across ALL the site's path
  mentions (the setup, the plugin pages' ledger paths, the case-study).
- The Mention's quoted-run skip + the code-token pass interplay verified after
  the change.