# @playform/style-dsh-material

_The DeepSeek Harness Plugin Family for PlayForm._

The **material** of the family's client UI: the one place the base is developed, so every UI plugin
extends it instead of copying it. SCSS only and runtime-free: no JavaScript, no TypeScript, nothing
to execute.

## The Three Partials

- `Source/Stylesheet/Token.scss` - the token expressions: the harness's code stack with the family's
  fallback chain, and the one state palette.
- `Source/Stylesheet/Material.scss` - the mixins: the scroll shell, the notice, the surface, the
  type voices, the tray, the lamp, the truncation, the form, the field, the input, the chip, the
  pill, the overlay, the focus ring, and the column.
- `Source/Stylesheet/Base.scss` - the ready-made `.dsh-*` classes, built from those mixins.

## Use

```scss
@use "@playform/style-dsh-material/Source/Stylesheet/Material" as Material;
```

A plugin includes a mixin, or extends a `.dsh-*` class, and keeps its own geometry and selectors:
the material owns the shared face, the plugin owns its layout. The base is developed here, so a new
plugin extends it instead of copying it.

The package sits in the CLASSIC tree because it is runtime-free SCSS: the EFFECT-TS plugins compile
the same partials with sass, and one cross-tree edge on a package with no runtime behavior is better
than duplicating the material per tree. The two release trees never share a dependency graph because
the Effect `Update` returns an Effect envelope; a stylesheet has no envelope. A plugin's compiled
twin is regenerated with `pnpm stylesheets`.

CC0-1.0.
