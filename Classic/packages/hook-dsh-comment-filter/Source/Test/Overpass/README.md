# Overpass

This file states what the test verifies.

## Intent

The suite covers the overpass arm of the comment filter: the tools/post-execute listener that strips
code comments from `read` and `ccr_retrieve` tool results before they re-enter the model, and the
agent/pre-step listener that stashes the per-task intent the arm is gated on.

It has its own folder because the arm is a separate integration surface with its own registration
contract (prepended, like the other arms of the family), its own deliberate target and exemption table
(where `read` is TARGETED, the opposite of the normalize flavors), its own transform contract (the
read envelope), and its own ledger strings.

## Scenario

- O0: registration and default facts.
    - Check: "overpass: the tools/post-execute arm is registered".
    - Check: "overpass: the post-execute arm PREPENDS (the ccr arm's own
      prepend sees the filtered bytes)".
    - Check: "overpass: the agent/pre-step arm is registered".
    - Check: "overpass: the default targets are read and ccr_retrieve (read is
      NOT exempt here)".
    - Check: "overpass: the default exemption list omits read and ccr_retrieve
      (the deliberate opposite)".
    - Check: "overpass: the activation line is byte-exact".
- O1: the envelope strip.
    - Check: "overpass: a read envelope strips comments and preserves every
      line-number prefix and the footer".
    - Check: "overpass: the tool-result ledger line is byte-exact".
    - Check: "overpass: the omission notice is appended when notice is on".
- O2: the string guard. Check: "overpass: a `//` inside a string is untouched
  (only the real trailing comment is removed)".
- O3: unknown extension. Check: "overpass: an unknown extension (.md) passes
  through by identity".
- O4: ccr_retrieve.
    - Check: "overpass: ccr_retrieve is targeted (its read-shaped envelope
      strips)".
    - Check: "overpass: the ccr_retrieve ledger line is byte-exact".
- O5: exemption. Check: "overpass: an exempt tool (edit) passes through by
  identity".
- O6: the N=0 no-op rule.
    - Check: "overpass: N=0 -> the downstream decision is unchanged".
    - Check: "overpass: N=0 -> NO ledger line (the no-op rule)".
- O7: the CCR marker guard. Check: "overpass: a block carrying the CCR marker
  passes through (the core's marker guard)".
- O8: fail-open. Check: "overpass: a thrown transform fails open (the
  downstream decision unchanged, no ledger line)".
- O9: notice off. Check: "overpass: notice off strips without the omission
  notice".

## Fixtures

The harness supplies the fake ctx with the REAL factory and the REAL comment-filter apply.

One apply uses the REAL schema defaults, and `Validate({ logFile: Ledger })` fills every default, so
the O0 checks prove the default table of the mission too.

`PostO` is the registered tools/post-execute listener, `NextAcceptO` is the downstream decision, and
`Exec(name)` builds the call identity.

The O8 fail-open case uses a SECOND apply whose `Notice` cell is replaced by a throwing getter, so the
transform throws after a successful scan, and it asserts that the downstream decision survives.

The durable ledger is cleared at folder start.

## Expected ledger strings (byte-exact)

- `hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=/tmp/comment-filter-smoke-ledger.log)`
- `hook-dsh-comment-filter: filtered 2 comment(s) in tool result read call_smoke`
- `hook-dsh-comment-filter: filtered 2 comment(s) in tool result ccr_retrieve call_smoke`

## Edge cases

- `read` and `ccr_retrieve` are TARGETED and not exempt, which is the deliberate opposite of the
  normalize flavors.
- A full-line comment becomes an empty line with the line-number prefix preserved byte-exactly, and a
  trailing comment is removed from its start.
- A `//` inside a string is a string and not a comment, and an unknown extension is never parsed, so
  it passes by identity.
- N=0, where nothing is stripped, keeps the downstream decision and writes NO ledger line.
- The CCR marker guard and the fail-open both preserve the downstream decision untouched, so the code
  never throws into the waterfall and never touches a CCR replacement.

## Expected count

19 PASS.
