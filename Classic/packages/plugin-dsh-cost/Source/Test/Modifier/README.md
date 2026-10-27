# Modifier

What this test verifies.

## Intent

The modifier product (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.2): after the tier sum,
the priced total and every bucket are multiplied by the product of the applicable modifiers'
multipliers - a modifier applies when its Provider matches, its Model is NULL or equals the model,
its Kind matches the call's pricing mode, and the call's time is inside its effective window - and
a model-specific modifier beats a provider-wide one of the same Kind.

## Scenario

- Check: "M3: a batch modifier halves the call's price, every bucket with it" - input, output and
  the total all scale by 0.5.
- Check: "M3: a modifier outside its effective window does not apply" - a 2027 rule prices a 2026
  call unmodified.
- Check: "M3: a model-specific modifier beats a provider-wide one of the same kind" - the scoped
  0.25 applies alone, never 0.5, never their product.
- Check: "M3: the modifier product multiplies the tier sum rather than replacing it" - two
  applicable rules multiply into 0.1 of the unmodified price, never zero and never a substitution.
- Check: "M3: the shipped config rules reach the arithmetic through the default book" - the four
  shipped rows apply through the config defaults, a standard call untouched and a batch call
  halved.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open`, priced from a two-row config book (test/m at
  input 1 output 2; the shipped GLM row), with three explicit modifier rules passed to the
  arithmetic and the four shipped default rows left in the config.

## Expected count

5 PASS.
