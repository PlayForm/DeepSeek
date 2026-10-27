# Overpass

What this test verifies.

## Intent

The overpass layer for the file flavor: the tools/post-execute arm (the SIX-FOLD rewrite of tool
results in the transcript), the agent/pre-step arm (the same chain on incoming batches), the
human-facing `normalize-overpass` command as the FILES SWEEP owner, and the history-safety
invariant.

This is its own folder because the arms are a separate integration surface with their own scope
gates (both off by default), the sweep as the command's unique grammar on this flavor, and its own
ledger strings.

The source suite's Run O (O1-O12) is moved verbatim.

## Scenario

- Group: registration facts.
    - Check: "overpass: the tools/post-execute arm is registered".
    - Check: "overpass: the agent/pre-step arm is registered".
    - Check: "overpass: the post-execute arm PREPENDS (outermost vs the ccr
      arm's own prepend)".
    - Check: "overpass: the pre-step arm uses default ordering (nothing
      needs to precede it)".
    - Check: "overpass: the normalize-overpass command is registered (the
      files sweep owner)".
- O1: default-off passthrough. Check: "overpass: toolResults off (default)
  -> the decision passes untouched".
- O2: the volatile flip (toolResults on) -> "the six-fold chain rewrites
  the text block"; "the tool-result ledger line is byte-exact".
- O3: exemption. Check: "overpass: exempt tool (read) passes through by
  identity".
- O4: block rules. Check: "overpass: tool-call/argument blocks pass
  untouched (execution-critical JSON)"; Check: "overpass: the text block in
  the same content IS rewritten".
- O5: the N=0 no-op rule. Check: "overpass: N=0 payload -> decision
  unchanged"; Check: "overpass: N=0 -> no ledger line".
- O6/O7: canonical and marker guard. Check: "overpass: value-carrying
  decision passes untouched"; Check: "overpass: marker-bearing content
  passes through the arm unchanged"; Check: "overpass: O5/O6/O7 added NO
  ledger lines (the no-op and pass-through rules)".
- O8: the files sweep through the command. Check: "overpass: the files
  sweep reports K and M in the command result"; Check: "overpass: the sweep
  summary ledger line is byte-exact"; Check: "overpass: each changed file
  still writes its own count line (via Normalize)"; Check: "overpass: the
  sweep wrote the changed file and left the clean one untouched"; Check:
  "overpass: a failing path fails the command with the context prefix";
  Check: "overpass: 'files' without paths is a usage error".
- O9: batch. Check: "overpass: batch off (default) -> the enter decision
  passes untouched"; Check: "overpass: batch on -> the six-fold chain
  rewrites the batch text"; Check: "overpass: the step-batch ledger line is
  byte-exact".
- O11: the command's other grammars. Check: "overpass: the scopes report is
  the read-only effective-values summary"; Check: "overpass: 'results'
  without on|off is a usage error"; Check: "overpass: 'results off' with no
  settings/config-editor service reports the settings path".
- O12: history safety. Check: "overpass: exactly the sweep's own write +
  emit happened (every other overpass path wrote NOTHING)".

## Fixtures

The harness fake ctx + the REAL factory + the REAL normalize-file apply.

One apply uses a hand-built config whose `scopes` volatile cell returns a mutable object, and the
O2/O9 flips mutate that object and dispatch through the registered `loader/volatile-update`
listener.

The sweep seeds `/tmp/normalize-file-smoke-sweep-a.txt` with All6 and
`/tmp/normalize-file-smoke-sweep-b.txt` with clean text in the in-memory Files map; the sweep
handler receives `rawInput: "files <a> <b>"`, and the error cases receive the source suite's exact
inputs.

`PostO`/`PreO` are the registered listeners, and `ExecO` builds the call identity.

The durable ledger is cleared at folder start, and no direct ledger reads occur (the ledger lines
are checked via the captured logger lines and their `includes` matches).

## Expected ledger strings (byte-exact)

- `plugin-dsh-normalize-file: overpass: normalized 7 char(s) in tool result bash call_smoke`
- `plugin-dsh-normalize-file: overpass: swept 2 file(s), normalized 7 char(s)`
- `plugin-dsh-normalize-file: overpass: normalized 7 char(s) in step batch (turn 3 step 1)`
(The scopes report contains `conversation=on`, `toolResults=on`,
`files=on`; the sweep error says `cannot sweep`.)

## Edge cases

- Both arms are off by default, and the flips are live (no remount).
- Non-text blocks, value-carrying decisions, and CCR marker text pass through untouched.
- The sweep is the only overpass path allowed to write (exactly one write and one emit for the
  changed file, with the clean file untouched).

## Expected count

29 PASS.
