# Deny-Tools

What this test verifies.

## Intent

The unconditional per-tool deny list (`denyTools`), the sibling of the
strikes ladder. A listed tool is denied on its VERY FIRST call - something the
ladder can never do (`enforceThreshold >= 1` means a strike must exist
first) - and the deny fires BEFORE and independent of the ladder check, so
`enforce: "off"` never suppresses it while the ladder itself stays inert
(the sed call on the other judged tool passes). The reason text is the
byte-exact NOTE_DENIED_TOOL template (placeholder-safe: the deny carries no
match, so the composer fills nothing and leaves no unfilled placeholder), the
denied ledger line is byte-exact, a tool outside the list is never denied by
it, the deny is unconditional (a non-judged listed tool is denied too), the
denial leaves no strike machinery behind, and an empty `notes.deniedTool`
fails validation loud.

## Scenario

- Group: the empty list.
    - Sub: "R7: denyTools [] - the first judged call passes"
    - Sub: "R7: the empty list logs no deny line"
- Group: the listed judged tool (denyTools: ["bash"]).
    - Sub: "R7: denyTools ['bash'] - the FIRST call of the listed tool is
      denied with the byte-exact NOTE_DENIED_TOOL reason" (the full
      `Blocked by tool-coach: this tool is disabled...` sentence, no
      placeholders left unfilled)
    - Sub: "R7: the denied ledger line is byte-exact: 'denied bash
      denyTools'"
    - Sub: "R7: the deny-list denial leaves no strike machinery (no ': strike'
      line)"
- Group: outside the list (denyTools: ["pwsh"]).
    - Sub: "R7: a tool outside the list is never denied by it"
- Group: independence from the ladder (enforce: "off", denyTools: ["bash"]).
    - Sub: "R7: enforce='off' does NOT suppress the deny-list (the deny fires
      on the first call)"
    - Sub: "R7: enforce='off' still lets the ladder-only call through" (sed on
      pwsh)
- Group: the unconditional scope (denyTools: ["read"], a non-judged tool).
    - Sub: "R7: the deny is unconditional - a non-judged listed tool is denied
      too"
- Group: validation.
    - Sub: "R7: fail-loud validation - an empty notes.deniedTool is rejected"

## Fixtures

The harness world: a fresh `Make(Validate({ logFile: Ledger, ... }))` per
sub-group (six applies: denyTools=[], denyTools=["bash"], denyTools=["pwsh"],
enforce=off + denyTools=["bash"], denyTools=["read"], and the invalid-notes
throw) against the cleared harness tmpdir ledger, the `Pre` waterfall helper,
and fresh agents per group so no prior call can arm the ladder - the first
call IS the denial.

## Expected ledger strings (byte-exact)

- The deny reason: `Blocked by tool-coach: this tool is disabled in this
  profile. Use the documented alternative for that surface instead.` (the
  NOTE_DENIED_TOOL template, verbatim - no placeholder residue)
- `: denied bash denyTools`

## Edge cases

- The deny fires even when the call's command is not an offense at all (`cat
  f` passes the ladder everywhere) - the list is per-TOOL, not per-command.
- `enforce: "off"` disables the ladder only; the deny list stays armed.
- A listed tool outside `judgeTools` is still denied (the check is
  unconditional, not ladder-scoped).
- The empty default keeps the pre-existing behavior byte-for-byte: no deny
  line, every call passes.

## Expected count

10 PASS.
