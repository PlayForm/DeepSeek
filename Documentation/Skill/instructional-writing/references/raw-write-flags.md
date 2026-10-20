# The raw-write Flags: normalize and govern

> Source: SKILL.md Section 1, rule 5, expanded to full philosophy.

## The Rule

The raw-write tool accepts two optional selections:

- normalize - applying it runs the normalization family's six transforms on
  the content before it is written. For verbatim writes (the default for
  instructional/fixture files) it is omitted.
- govern - applying it routes the write through the family's governance chain
  (for example, a package manifest that must pass through governance checks
  after the write). For ordinary content writes it is omitted.

Both are opt-in. The verbatim default plus omitted govern is the standard
shape of a fixture write.

## Why (the full rationale)

- normalize: the six transforms (dashes to the module's replacement, curly
  quotes to straight, ellipsis to three periods, unicode spaces to ASCII,
  invisible characters removed, fullwidth to halfwidth) are the very transform
  the fixture files exist to demonstrate. raw-write normally bypasses them;
  the normalize selection re-applies them deliberately. That makes raw-write
  with normalize the correct tool for a file whose purpose is to show the
  transform's OUTPUT - a "before and after" pair, where the before half is
  verbatim and the after half is written with normalize applied.
- govern: some writes are not just content placement; they are manifest or
  configuration writes that the family tracks through governance. Passing the
  govern selection keeps those writes inside the family's accounting instead
  of silently bypassing it.
- Both flags exist so the powerful tool stays precise: verbatim remains the
  default, and each deviation is an explicit, visible argument in the call.

## Good vs bad

- GOOD: a before/after demonstration pair - "before.md" written verbatim
  carrying the literal characters, "after.md" written with the normalize
  selection applied, both via raw-write so the pair is reproducible on demand.
- BAD: normalize applied to an instructional file whose value is the presence
  of the literal characters. That is the same destruction the plain write
  would cause, just with extra steps.
- BAD: govern applied to a plain fixture write - it adds governance machinery
  where none is required, muddying what the write was for.
- GOOD: a manifest write (package manifest, lockfile-style target) issued with
  the govern selection so the family's governance chain sees it.

## Exceptions

- A file that demonstrates the transform's output legitimately uses normalize;
  that is not a violation but the flag's intended use. The test is always the
  file's purpose: carry the characters (verbatim) vs. show their absence
  (normalize).

## Failure modes

- Copying a previous call's arguments and leaving normalize in place when the
  new write should be verbatim - the characters vanish and the byte-checks
  catch it only after the fact.
- Treating normalize as a "cleaner" and applying it habitually, which erodes
  the entire point of the verbatim path.
- Skipping govern on a manifest write and then wondering why governance
  accounting does not show the change.

## Arbiters

- The byte-checks after a verbatim write catch an accidental normalize.
- The governance ledgers catch a manifest write that should have carried the
  govern selection.
- Smoke suites that compare the before/after pair catch a pair whose halves
  were written inconsistently.
