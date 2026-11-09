# SCHEME - @playform/style-dsh-material

The material's contract: the mixin table, the base-class table, and the naming rule. Everything
below is what the three partials do today; nothing else is claimed.

## 1. The mixins (`Target/Stylesheet/Material.scss`)

| Mixin         | Owns                                                                            | Came from                                                   |
| ------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `Scroll`      | the scrollable tab shell: grid, flex, 880px cap, 20/16/28 padding, inner scroll | family tab; workspace root                                  |
| `Notice`      | the centered empty-state line at 13/20 in the quiet ink                         | family tab; workspace root                                  |
| `NoticeFrame` | the dashed card frame a notice gains when it stands in for content              | workspace root                                              |
| `Surface`     | the card face: card fill, card stroke, one radius (`$Radius`)                   | family section; workspace card                              |
| `Heading`     | the 13/18 semibold primary line                                                 | family section; workspace header                            |
| `Meta`        | the 11/16 medium secondary line                                                 | workspace count                                             |
| `Label`       | the uppercase 0.04em eyebrow at `$Size`                                         | family status                                               |
| `Code`        | the mono 11/16 secondary line over `Token.$Font`                                | workspace meta                                              |
| `Tray`        | the inset mono list: 2px gap, `$Height` cap, layer-1 fill and hairline          | family tail; workspace trace                                |
| `Lamp`        | the state dot: `$Size` square, 50% radius, round corner shape                   | family status; workspace dot; cost dot                      |
| `Truncate`    | one line, an ellipsis, no wrap                                                  | family tail; family field; workspace label; workspace trace |
| `Form`        | the auto-fit 200px grid with a 10/12 gap                                        | family form                                                 |
| `Field`       | the label-over-control grid at 12/16                                            | family field                                                |
| `Input`       | the 28px control: hairline, `radius-sm`, brand `:focus-visible` ring            | family input                                                |
| `Chip`        | the 19px short value on the layer-2 fill                                        | cost pill; cost chip                                        |
| `Pill`        | the brand-ink 999px marker                                                      | family override                                             |
| `Overlay`     | the shell overlay face: 80vh cap, panel radius, panel elevation                 | family overlay                                              |
| `FocusRing`   | the business-ink hairline with `$Offset`                                        | cost focus                                                  |
| `Column`      | the full-height flex column with the inner scroll                               | cost root                                                   |

## 2. The base classes (`Target/Stylesheet/Base.scss`)

| Class                      | Mixin         | Emits                        |
| -------------------------- | ------------- | ---------------------------- |
| `.dsh-scroll`              | `Scroll`      | the panel body               |
| `.dsh-notice`              | `Notice`      | the empty-state line         |
| `.dsh-notice--framed`      | `NoticeFrame` | the notice's frame           |
| `.dsh-card`                | `Surface`     | the default card face        |
| `.dsh-heading`             | `Heading`     | the section heading          |
| `.dsh-meta`                | `Meta`        | the small meta line          |
| `.dsh-label`               | `Label`       | the eyebrow                  |
| `.dsh-code`                | `Code`        | the code line                |
| `.dsh-tray`                | `Tray`        | the 136px tray               |
| `.dsh-lamp`                | `Lamp`        | the 6px dot                  |
| `.dsh-truncate`            | `Truncate`    | the one-line ellipsis        |
| `.dsh-form`                | `Form`        | the form grid                |
| `.dsh-field`               | `Field`       | the field                    |
| `.dsh-input`               | `Input`       | the input and its focus ring |
| `.dsh-chip`                | `Chip`        | the chip                     |
| `.dsh-pill`                | `Pill`        | the pill                     |
| `.dsh-overlay`             | `Overlay`     | the overlay panel            |
| `.dsh-column`              | `Column`      | the cost column              |
| `.dsh-focus:focus-visible` | `FocusRing`   | the focus ring only          |

## 3. The naming rule

- **Mixin** - PascalCase, one word (`Scroll`, `Surface`, `FocusRing`); a site that differs passes
  its own parameter (`$Radius`, `$Size`, `$Height`, `$Offset`).
- **Class** - the `dsh-` prefix, lowercase kebab-case, `--` for a modifier (`.dsh-notice--framed`);
  the focus state is the `:focus-visible` pseudo-class on `.dsh-focus`.
- **Token** - the harness's `--dsw-*` alias (`--dsw-alias-*`, `--dsw-radius-*`,
  `--dsw-elevation-*`); the code stack is the harness's `--ds-font-family-code` with the family's
  fallback chain, held in `Token.$Font`.
