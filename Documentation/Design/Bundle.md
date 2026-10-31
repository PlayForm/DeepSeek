# Bundle

## The claim

A bundle is a sequence, not a set. The machine draws the rail the mounts happen on, the parts in the
order they run, each one stepping in from the one before it, and the rule that catches a part which
fails. The order is the shape, so the reader follows the mount without counting.

The machine answers: **what does this package load, in what order, and what happens when a part
fails?**

## The sources

| Source                                                                | What was taken                                                                                                                                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/Bundle.astro`                                  | The band with the rail and the part count, the rule, the ordered part list with a two-digit index and a body, and the containment block. The one record is the component's own table.        |
| `Site/Source/Stylesheet/Component/Bundle.scss`                        | The geometry: `--step` as a per-part custom property, `padding-left: calc(var(--space-2) * var(--step))` for the staircase, the body's own left rule, and the warn face for the containment. |
| `Site/Source/pages/package/[slug].astro`                              | The mount: `Bundle` inside the portrait section, gated on `Portrait.Shape === "bundle"`.                                                                                                     |
| `Site/Source/Content/Portrait.ts`                                     | The one package whose shape is a bundle: `plugin-dsh-boot`.                                                                                                                                  |
| `Classic/packages/plugin-dsh-boot/Source/Library.ts`                  | The five mount steps in the order the code runs them: the list read at apply, the detach, the guard, the import, and the record.                                                             |
| `Temporary/Corca/Curated/Components.md`                               | The card and the inset: a body with its own left rule, a hairline between objects, and no outer border around content.                                                                       |
| `Temporary/component-page-composition-recipes.json`                   | M04.R02, vertical explanation: a stage, a connector, a stage, with the labels fully available on a narrow screen. The part list is that orientation with the connector replaced by a step.   |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/steps.tsx` | The ordered track with equal room per step. The bundle borrows the equal room and refuses the complete, current, upcoming vocabulary, because a mount step has no state of its own.          |

The borrow is a mechanic (a sequence drawn as a cascade), a geometry (a fixed index track and a
stepping body), and a state model (a part runs, is skipped, or is contained, and the containment is
the only state the shape names).

## The copy

The section that mounts it prints the portrait's own title and `Plugs into ...`.

The machine prints, in order:

1. `Rail`
2. `the loader's apply, on the harness's own boot rail`
3. `5`
4. `Parts`
5. `A plugin that awaits inside apply holds the harness's ready message open, and a stuck fiber leaves the host loading with no error anywhere, so this bundle's apply schedules the mounts and returns.`
6. `01`
7. `the mount list`
8. `read once at apply: every specifier that is a non-empty string, in the order the config lists them`
9. `02`
10. `the detach`
11. `setImmediate hands the rail back to the loader, so no import is awaited inside apply`
12. `03`
13. `the guard`
14. `a specifier this process already mounted is skipped, because a re-applied fiber would double-register its services`
15. `04`
16. `the import`
17. `a dynamic import of the specifier, then a mount with an empty config`
18. `05`
19. `the record`
20. `the specifier joins the mounted set, in memory only, so a later turn does not mount it twice`
21. `Contained`
22. `An import that throws, or a plugin whose apply rejects, is logged once as a warning, dropped from the mounted set so a later boot retries it, and never reaches the rail.`

## The layout

```
+----------------------------------------------------------------------+
| BUNDLE                                                               |
| the rail, the parts in mount order, and the containment              |
+----------------------------------------------------------------------+
| RAIL   the loader's apply, on the boot rail         |      5  PARTS  |
+----------------------------------------------------------------------+
| RULE   why the order exists: apply schedules and returns             |
+----------------------------------------------------------------------+
| 01 | the mount list                                                  |
|    | read once at apply: every non-empty specifier, in order         |
| 02 | the detach                                                      |
|     | setImmediate hands the rail back                               |
| 03 | the guard                                                       |
|      | a specifier already mounted is skipped                        |
| 04 | the import                                                      |
|       | a dynamic import, then a mount with an empty config          |
| 05 | the record                                                      |
|        | the specifier joins the mounted set, in memory only         |
+----------------------------------------------------------------------+
| CONTAINED   the warn face: an import that throws is logged once      |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The part list is a single column with a fixed index track and a body that
steps one space to the right per part, so the left edge is a staircase rather than a straight line;
the containment is the only warn face on the shape, at the bottom, because it is the failure rule
and the last thing a reader needs before trusting the order above it.

## The machines

Bundle adds the mount. Flow says what a package does to a fact that passes; this says what a package
does before anything passes at all, which is to bring other plugins onto the rail.

| Neighbour on the same page | What it already says                      | What Bundle must not say                |
| -------------------------- | ----------------------------------------- | --------------------------------------- |
| Flow                       | the package's control flow                | the mount steps as a flow with a branch |
| Scheme                     | the laws that decide when the plugin acts | the rail as a seam                      |
| Service                    | the contract the package provides         | the mounted plugins as consumers        |
| Activation                 | the line the plugin writes on load        | the mount as a stage of activation      |

The parts are the mount steps, not the configured plugins. A bundle whose parts were a fixed set of
plugins would draw the config rather than the bundle, and the config is a profile's business; what
this package owns is the sequence, so the sequence is what is drawn.

When the record is absent the machine renders nothing.

## The decisions

| Decision                            | The alternative rejected                       | Why                                                                                                                                                                                               |
| ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The staircase                       | A flat numbered list                           | The mount order is a cascade, and the step-in says so without the reader counting. A flat list would need the two-digit index to carry the whole claim.                                           |
| Five parts, not the plugin list     | Drawing the plugins the config names           | The config is a profile's business and the page is static. The package owns the sequence, and a plugin list would change with every profile while the shape stayed the same.                      |
| The rule sits above the parts       | The rule below the parts                       | The rule explains why the order exists: apply must return, so the detach is second and the import is fourth. Above the parts, it is the premise; below, it would read as a conclusion about them. |
| The containment takes the warn face | A quiet note under the list                    | A part that fails is the fact a reader must be able to find at a glance. The warn token is the site's vocabulary for exactly that, and this is the only warn face on the shape.                   |
| The record step is drawn            | Dropping it, because the set is in memory only | The guard depends on the record. Without it the guard reads as a check of something the page never says exists.                                                                                   |
| The index is two digits             | A bullet or a dot                              | The parts are ordered and the order is the claim. Two digits also match the numbering every other machine in the library uses.                                                                    |
| No figure for the mounted count     | Printing how many plugins the bundle mounted   | The page cannot read a profile's config, and the figure would be a claim about a run the site never made.                                                                                         |
| The rail is a field                 | The constant `the loader's apply`              | The seam is a fact the source names, and the same shape serves a bundle that mounts on another rail. A constant would bake one package's rail into the component.                                 |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/package/plugin-dsh-boot`, inside the portrait section, as the only
package whose shape is a bundle. The page that proves it is that package page, and the record it
draws is the `plugin-dsh-boot` entry of `Site/Source/Component/Bundle.astro`.

What is not drawn yet: the lifetime of the mounted set across a reload, which the record step names
as memory only, and the empty config the import mounts with, which is a fact about the mount rather
than a part of the sequence. The first is the larger gap, because a reader cannot tell from this
shape whether a second boot remounts what the first one mounted.
