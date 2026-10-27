# raw-write: The Byte-Faithful Writer

## Semantics

| `normalize` value    | Result                     |
| -------------------- | -------------------------- |
| absent or `false`    | Verbatim bytes             |
| `true`               | All six transforms applied |
| `["dash", "quotes"]` | Only the named flavors     |

`govern: true` or a name array routes a manifest write through the direct-govern chain; `false` is
the explicit escape hatch.

## The path rule

`raw-write` resolves a relative path against the profile root, not the current directory.

A repository target needs an absolute path:

```text
raw-write(
  file_path: "/absolute/path/to/Test/fixtures/markdown/dashes.md",
  content: "...",
)
```

A relative path writes somewhere unexpected, usually inside the profile.

## Read before overwrite

`raw-write` refuses to overwrite a file it has not seen in the session.

Read the file first; the read also confirms the bytes you are about to preserve.

## When to use it

- The file's value is its exact bytes: a fixture, a byte-faithful copy, a demo pair.
- The content contains a glyph the normalize hooks would rewrite.

## When not to use it

- Ordinary prose, code, docs, or config. Those are ASCII; `write` is the right tool and the
  normalization is a feature.
- A manifest that needs governance: use `raw-write` with `govern`, not a plain write.

## Failure modes

- **Relative path**: the file lands under the profile root.
- **Unread overwrite**: refused; read first.
- **Normalize by accident**: `normalize: true` destroys the deliberate characters; check the flag
  before writing.
- **Plain write for a fixture**: the glyphs arrive as ASCII and the fixture's assertions fail later,
  far from the cause.
