# SCHEME - @playform/ets-lib-dsh-style

The contract of the one runtime `<style>` mount. Everything below is what
`Source/Function/Inject.ts` does today; nothing else is claimed.

## The surface

`Inject(Identifier, Sheet) => void`, a named export of the package entry (`Source/Library.ts`).

## The contract

| Field      | Value                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- |
| identifier | the calling plugin's package name (for example `@playform/ets-client-dsh-workspace-live`) |
| file key   | `${Identifier}/client.css`                                                                |
| element    | one `<style>` appended to `document.head`                                                 |
| attributes | `data-plugin` = the identifier, `data-plugin-css` = the file key                          |
| content    | `Sheet`, assigned as the element's `textContent`                                          |
| dedupe     | `document.querySelector('style[data-plugin-css="<file key>"]')` - a hit returns           |
| SSR guard  | `typeof document === "undefined"` returns before any DOM access                           |
| removal    | none - no unmount, no dispose, no replace path                                            |

## The twin

`@playform/ets-lib-dsh-style` is the EffectTS twin of `@playform/lib-dsh-style`: the same function,
byte-identical in behavior. Each release tree stays self-contained, and Effect buys nothing in a
browser bundle.
