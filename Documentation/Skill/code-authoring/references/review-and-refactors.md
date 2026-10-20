# Review Passes and Behavior-Identical Refactors

A refactor is a change of structure with no change of behavior. The
discipline exists because the family's contract is byte-exact strings and
smoke counts; a refactor that "improves" either one has broken the
contract, not the code.

## The behavior-identical law

A refactor keeps all of the following byte-identical:

1. The ledger strings: activation lines, refusal lines, chain-pass lines,
   journal records.
2. The observable behavior: outputs, ordering, timing where asserted.
3. The silence invariant: a pass that produced no change writes no line.
4. The smoke counts: the same assertions pass in the same numbers.

The one permitted change is identity-driven: when a module's identity
changes by design (a package rename), its own `<module>: ` prefixes and
its default `logFile` change with it. That is a rename, not a refactor,
and it is recorded as such.

## The protocol

1. Record the baseline: run the bundle's smoke suite and note the printed
   total. For the site, note the page count from the built output.
2. Make the structural change, one definition at a time.
3. Re-run the arbiter after each logical step, not only at the end.
4. Compare: the printed total equals the baseline; the ledger strings
   diff empty.
5. If the total changed, stop. A changed count means behavior changed or
   an assertion was weakened. Read the failure's intent before touching
   either side.

## The review checklist

### The change

- [ ] The diff is structural: names, files, folders, composition.
- [ ] No ledger string changed (unless the module's identity changed by
      design, and that is stated).
- [ ] The smoke count equals the baseline.
- [ ] The site build, if site files changed, emits the same page count and
      the changed strings appear in `Site/Target/`.

### The discipline

- [ ] No terminal content edit or read in the session.
- [ ] Every file was read before it was edited.
- [ ] Bulk transformations were followed by the byte scan.
- [ ] No git mutation; the report is READY-TO-COMMIT.

### The style

- [ ] One definition per leaf.
- [ ] Anonymous defaults outside the entry.
- [ ] Full-word names; documented exceptions only.
- [ ] Single-use bindings inlined.
- [ ] Guard chains as `switch (true)`.
- [ ] Depth earned; barrels where folders group siblings.

### The documentation

- [ ] The bundle's `README.md` and `SCHEME.md` still describe the code.
- [ ] A new config field appears in the schema, the README, and the site's
      config surface.
- [ ] The smoke suite has additive coverage for a new feature.

## When the refactor cannot stay identical

Some changes are behavioral by design: a new feature, a new config field,
a fixed bug. They are not refactors. They follow the feature path:

1. Add the assertions first (additive coverage).
2. Make the change.
3. The new count is the new baseline, recorded in the suite's README.
4. The ledger strings for the new behavior are written once and then
   treated as contract.

A behavior change that silently rides inside a "refactor" is the most
expensive kind of change: it invalidates the baseline and hides in a diff
that claimed to be structural.
