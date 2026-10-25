# Palette direction - the fire-lit cavern

Source: `Reference/Assets/firelit-cavern.webp` (supplied by the user as an artistic direction for
colour). This note records the palette logic the icon set should borrow.

## What the image does

| Trait                       | In the image                               | In the icon palette                      |
| --------------------------- | ------------------------------------------ | ---------------------------------------- |
| Warm light                  | yellow, amber, orange on the lit surfaces  | the accent tone carries the warm end     |
| Cool shadow                 | violet, indigo, slate blue in the recesses | the ink tone carries the cool end        |
| Green life                  | small saturated green plants               | a rare third accent, used sparingly      |
| Dark ground                 | near-black rock behind the light           | the mono render stays on the page ground |
| Saturated, low-value shifts | every hue is pushed, values step in bands  | flat bands, no gradients                 |
| Complementary contrast      | warm light against cool shadow             | each icon pairs a warm and a cool plane  |

## What to add

A second palette family, `firelit`, alongside the current banner palette:

```text
ink     #2A1830  (cool shadow)
accent  #F2A33C  (warm light)
accent2 #7A5C9E  (violet mid)
tint    #F6E6C8  (cream highlight)
green   #6FA84C  (rare accent, interaction only)
```

The rule that keeps it from flooding: the warm tone is used on the smallest plane (core or detail),
the cool tone on the largest plane, and the green appears only when the profile is `interaction`.

## State

The palette generator still uses the banner colours (`Maintain/Icon/Palette.mjs`); the `firelit`
family is a proposed addition, not implemented. It is the natural next step after the current
solid-plane atlas, because the atlas already separates the planes that the warm/cool rule addresses.
