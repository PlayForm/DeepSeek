# Structure and Design

## The source map

| Path                       | What it holds                                                       |
| -------------------------- | ------------------------------------------------------------------- |
| `Source/Layout/Base.astro` | The shell: head, SEO, fonts, theme script, nav, footer              |
| `Source/Component/`        | The UI components                                                   |
| `Source/pages/`            | The pages, including `plugins/<15 detail pages>`                    |
| `Source/Library/`          | `Content.ts`, `Live.ts`, `Links.ts`, `FileIcon.ts`, `DiagramNav.ts` |
| `Source/Content/Mermaid/`  | `Render.mjs`, the diagram pipeline                                  |
| `Source/Script/`           | Client scripts                                                      |
| `Source/Stylesheet/`       | `Base.css` (Tailwind), `Global.css` (tokens and components)         |
| `Public/`                  | `404.html`, `_headers`, `Manifest.json`, `robots.txt`, `assets/`    |
| `Scripts/`                 | `Drift-Guard.mjs`                                                   |
| `Target/`                  | The built site; never hand-edited                                   |

## The components

| Component        | Use                                          |
| ---------------- | -------------------------------------------- |
| `Base.astro`     | The page shell; every page wraps in it       |
| `PageHero`       | The title and sub-paragraph                  |
| `SectionHeader`  | The section title and metadata               |
| `Badge`          | The eyebrow and status badges                |
| `Card`           | A titled card with an icon and a description |
| `Concept`        | A titled concept with an optional diagram    |
| `Terminal`       | A terminal frame with typed lines            |
| `TerminalTray`   | A set of terminal demos                      |
| `CodeBlock`      | A syntax-highlighted code block              |
| `Compare`        | The raw-versus-normalized slider             |
| `Configurator`   | The setup selection surface                  |
| `FlavorBadge`    | A flavor chip                                |
| `InstallDemo`    | An install command with a copy action        |
| `Seams`          | The harness-seam diagram row                 |
| `Showcase`       | The example switcher                         |
| `StatsBand`      | The figures band                             |
| `SupportsButton` | The support call-to-action                   |
| `BrandIcon`      | A brand glyph with an accessible label       |
| `ArrowIcon`      | A decorative arrow                           |

## The page anatomy

1. `Base` with the title, description, canonical, Open Graph, and JSON-LD.
2. The eyebrow row of badges.
3. `PageHero`.
4. Sections: `SectionHeader` plus cards, tables, concepts, demos.
5. The notation.
6. The footer.

One `<h1>` per page. Headings descend. Meaningful icons carry labels; decorative ones are
`aria-hidden`.

## The design tokens

- `--color-primary` `#003ec7`, `--color-primary-container` `#0052ff`.
- White and near-white surfaces; 1px `outline-variant` hairlines.
- The `--radius-*` scale; the 8pt spacing rhythm.
- Inter for prose, IBM Plex Mono for code and labels.
- The 13px type floor.
- Zero elevation: no shadows, no gradients.

## Accessibility

- Focus-visible styles on every interactive element.
- `aria-current` on the active nav item; `aria-expanded`/`aria-controls` on the menu toggle.
- `prefers-reduced-motion` guards in CSS and in every script animation.
- Alt text on images; `role="img"` plus a label on meaningful icons.
- A skip link is recommended for the long pages.

## Performance

- The stylesheet is the dominant weight; measure before adding a large page-specific block.
- Client scripts are per page; keep them small and defer where possible.
- Prefetch is on hover; the service worker caches the built assets.
- Self-host fonts; do not add an external font dependency.

## Failure modes

- **A hardcoded figure**: drifts from `Content.ts`.
- **A missing accessible label**: the icon is invisible to a screen reader.
- **A page-specific style in the shared sheet**: every page pays for it.
- **An external dependency in the shell**: the error page fails when the network does.
