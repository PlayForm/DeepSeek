# Identity and Ledger-String Ownership

> Source: SKILL.md, Section 1 (The loader contract), rule 2.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A plugin's identity lives in FOUR places that must agree:

1. the package name,
2. the `name` export of the plugin,
3. the `module:` option of the State build,
4. the ledger logFile default.

The ledger strings are the module's OWN - the factory never owns them.
The factory provides the ledger MACHINERY (the Append path); each
module supplies and owns its strings.

## Why: The Full Philosophy

1. **Four surfaces, one identity.** Each surface is consumed by a
   different consumer: the package name by the registry and the
   profile's bundle list, the `name` export by cordis at boot, the
   `module:` option by the State builder (it stamps every event and
   ledger row), and the logFile default by the ledger writer at first
   append. If any two drift, the system still boots - the failure is
   cross-referencing: events from one module appearing in another
   module's ledger, or a State build emitting a module stamp no plugin
   answers to.
2. **Strings are module-owned by design.** The ledger strings are the
   family's observable contract surface (see
   ./references/ledger-strings-byte-identical.md). If the factory
   owned the strings, every module's observable output would change
   whenever the factory's wording changed, and the byte-identical rule
   would be unenforceable per module. Ownership at the module makes
   the string change and the string test both local decisions.
3. **The `module:` option is not cosmetic.** The State build's
   `module:` value is what distinguishes two modules' events sharing a
   storage domain. It must be the same identity the plugin announces,
   so downstream tooling can attribute any single record to exactly one
   package without guessing.

## Examples

### Good

```
package name:      hook-dsh-canonicalize
name export:       'hook-dsh-canonicalize'
State build:       new State({ module: 'hook-dsh-canonicalize', ... })
ledger logFile:    default derived from the module identity
```

### Bad

```
name export:       'govern'                       // drift from package name
State build:       module: 'hook_dsh_canonicalize' // different stamp spelling
logFile:           hardcoded path unrelated to the module
```

## Exceptions

- The identity-driven string change: when a module's identity itself
  changes BY DESIGN (a rename that is the deliverable), its ledger
  strings change with it - and that is the documented exception to the
  zero-assertion-change smoke rule (see
  ./references/smoke-arbiter.md). Renaming a package is therefore a
  deliberate, reviewable act, never a drive-by.

## Failure Modes

- **Partial rename:** the package is renamed, the `name` export and
  `module:` option follow, but the logFile default still points at the
  old name. Cost: the old and new identities interleave in one ledger
  file; attribution is corrupted permanently.
- **Factory-side string "improvement":** someone adjusts wording in
  shared machinery that formats module strings. Cost: every module's
  smoke goes red at once, or worse, the strings change without any
  smoke covering them. The fix is ownership: the strings live in the
  modules, the factory formats nothing.
- **Case or separator drift:** `hook-dsh-x` vs `hook_dsh_x` vs
  `HookDshX`. Cost: two spellings of one module in the logs; searches
  and arbiters silently miss half the records.

## Arbiters

- The module's smoke asserts its own ledger strings byte-identically;
  the factory's smoke asserts the machinery but NOT any module's
  strings (see ./references/ledger-strings-byte-identical.md).
- Review: every diff that touches one of the four identity surfaces
  must touch all four or carry an explicit by-design exception note.
