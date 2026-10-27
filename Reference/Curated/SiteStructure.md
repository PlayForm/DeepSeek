# Site structure - navigation, footer, cards, and item pages

> Decision: a documentation site whose index is a catalog of 106 items should treat the header as
> the only surface that lists primary sections (a handful, not 106), move the full catalog to a
> card-grid index, let the footer be a sitemap of popular destinations rather than a mirror of the
> header, and give each of the 106 items a per-item page that the card links out to, with the four
> Diataxis quadrants deciding what that page contains. The sources establish concrete thresholds and
> rules for each of these decisions, and one source (the W3C disclosure pattern) could not be
> fetched at all, so the mobile-menu requirements below come from USWDS and Carbon rather than from
> the ARIA authoring practices.

## Sources

- USWDS Header - designsystem.digital.gov/components/header/ -
  Reference/Raw/designsystem-digital-gov-components-header.md - 42423 bytes - converted.
- USWDS Footer - designsystem.digital.gov/components/footer/ -
  Reference/Raw/designsystem-digital-gov-components-footer.md - 25564 bytes - converted.
- Diataxis (homepage) - diataxis.fr - Reference/Raw/diataxis-fr.md - 2988 bytes - converted (short
  homepage summary, not a stub at 1024 bytes but only an overview; the four-quadrant definitions
  themselves are one paragraph long).
- W3C ARIA Disclosure Pattern - www.w3.org/WAI/ARIA/apg/patterns/disclosure/ - no Raw file - failed.
- USWDS Card - designsystem.digital.gov/components/card/ -
  Reference/Raw/designsystem-digital-gov-components-card.md - 19054 bytes - converted.
- Carbon Design System, UI shell header usage -
  carbondesignsystem.com/components/UI-shell-header/usage/ -
  Reference/Raw/carbondesignsystem-com-components-UI-shell-header-usage.md - 8395 bytes - converted.

## What the sources establish

1. A primary navigation carries "a modest number of sections", not a catalog: the USWDS basic header
   is the right choice only "if you have few enough sections in your main navigation to fit
   comfortably next to your logo", and the extended header exists precisely for the case of "too
   many sections ... to fit comfortably in the basic header format"
   (https://designsystem.digital.gov/components/header/). For a 106-item catalog this rules out
   putting the items themselves in the header; the header carries a handful of grouped sections.
2. The header groups deeper content rather than listing it flat: the basic header is still usable
   when "each main section listed in the horizontal navigation has six or fewer subsections that
   you'd like to include in a dropdown menu", and a megamenu is warranted only when a dropdown would
   carry "more than six links" (https://designsystem.digital.gov/components/header/). So the
   grouping threshold a documentation nav should design around is roughly six links per dropdown.
3. Header navigation is ordered and task-shaped, not org-shaped: "Present links in priority order"
   with higher-demand links farther left, "Avoid org-structure navigation" and instead structure it
   "according to the tasks and information your users most frequently need to access", and
   "Highlight the current section" so users know where they are
   (https://designsystem.digital.gov/components/header/).
4. The footer is a sitemap of popular destinations, not a repeat of the primary nav: the USWDS big
   footer exists "when you want to replicate your site's navigation scheme in the footer", but its
   usability guidance explicitly says "The footer doesn't need to mirror the header" and "Footer
   links should point to popular content that might answer a visitor's remaining questions"; a
   footer with more than five links is pushed up to the big variant
   (https://designsystem.digital.gov/components/footer/). For a catalog site this means the footer
   should curate entry points and legal/contact links, not re-list all 106 items.
5. An index card is a summary that links out, and it must not carry content shared by every card:
   "Make cards actionable. Since cards are used as a summary of more detailed information, any
   individual card should link out to that information", "Include non-redundant content. Don't
   repeat images or content common to all or most cards in a collection", and cards are wrong for
   "tabular data", for "simple calls to action" (use a button), and for sequential reading
   (https://designsystem.digital.gov/components/card/). For the 106-item index, the card carries the
   item's distinguishing summary and a link to the item page; shared metadata (the same boilerplate,
   the same category label repeated everywhere) belongs in the item page or a table, not duplicated
   per card.
6. A card collection is a list in the accessibility sense: "Use a ul for a card group and an li for
   each card", so screen readers can enumerate the 106 items and jump between them, and card
   headings must sit "in the correct, logical outline order"
   (https://designsystem.digital.gov/components/card/).
7. A per-item page is warranted when the card is only a summary of "more detailed information"
   (USWDS card rule above), and the item page is also where Diataxis says the writing should land:
   documentation splits into four forms - "tutorials, how-to guides, technical reference and
   explanation" - organised around the user's needs (https://diataxis.fr/). An item that exists only
   as a name and a one-line description can stay an entry in the list; an item that carries tutorial
   steps, how-to procedures, reference material, or an explanation needs its own page, and the
   Diataxis split decides what that page contains.
8. Carbon confirms the header-plus-panel split for deep navigation: the header is "the highest level
   of navigation" and pairs with a left panel "to offer a deeper level of navigation in a UI", and
   "as a header scales down to fit smaller screen sizes, header links and menus should collapse into
   a left-panel hamburger menu" (https://carbondesignsystem.com/components/UI-shell-header/usage/).
   Carbon's anatomy also fixes the left-to-right ordering rule: left of the header is product-level,
   the middle is system-level, and the right side is "the most global in their scope"
   (https://carbondesignsystem.com/components/UI-shell-header/usage/).
9. Mobile-menu behavior both sources agree on: USWDS renders the mobile menu as an accordion whose
   disclosure buttons carry "aria-expanded" and "aria-controls" on a button element, adds a visible
   close control, and hides background content while the menu is open ("Updated mobile navigation to
   make background content inert"); Carbon states the same collapse-into-hamburger rule above
   (https://designsystem.digital.gov/components/header/,
   https://carbondesignsystem.com/components/UI-shell-header/usage/). The W3C disclosure pattern
   itself failed to fetch, so its canonical keyboard and state requirements are an open question
   rather than a claim.

## Extracts that matter

USWDS header:

- "Use the basic header if you have few enough sections in your main navigation to fit comfortably
  next to your logo"
- "Shallow hierarchy. You may also use it if each main section listed in the horizontal navigation
  has six or fewer subsections that you'd like to include in a dropdown menu."
- "Many sections or deep hierarchy. Consider using the extended header if you have more sections in
  your horizontal navigation than will fit comfortably next to your logo"
- "Present links in priority order. Higher-demand links should appear farther to the left"
- "Avoid org-structure navigation. Don't model your navigation after your agency's org structure."
- "Deep hierarchy. Use this type of header if you'd like to include more than six links in any of
  your dropdowns."

USWDS footer:

- "Big footer: Use the big footer when you want to replicate your site's navigation scheme in the
  footer and offer newsletter signups."
- "The footer doesn't need to mirror the header. Link grouping in the footer does not have to mirror
  link grouping in top level header navigation"
- "Curate your footer. Footer links should point to popular content that might answer a visitor's
  remaining questions."
- "Medium and slim footers: Use the big footer when your footer has more than five links."

USWDS card:

- "Make cards actionable. Since cards are used as a summary of more detailed information, any
  individual card should link out to that information."
- "Include non-redundant content. Don't repeat images or content common to all or most cards in a
  collection."
- "Tabular data. Don't use a card as a substitute for a table row."
- "Use a ul for a card group and an li for each card."

Diataxis:

- "It identifies four distinct needs, and four corresponding forms of documentation - tutorials,
  how-to guides, technical reference and explanation."
- "It prescribes approaches to content, architecture and form that emerge from a systematic approach
  to understanding the needs of documentation users."

Carbon:

- "The UI shell header is the foundation for navigating and orienting your user to the UI."
- "As a header scales down to fit smaller screen sizes, header links and menus should collapse into
  a left-panel hamburger menu."

## Open questions

- The W3C ARIA disclosure pattern page failed to fetch (Cloudflare JS challenge, both with the
  default filter and with --filter raw), so its requirements for the disclosure pattern behind a
  mobile menu - button semantics, aria-expanded/aria-controls state, keyboard support (Enter, Space,
  Escape), and focus handling when the menu opens and closes - are unverified and need a retry from
  a mirror or a cached copy before the mobile menu is built.
- The Diataxis fetch is the homepage only (2988 bytes), so the per-quadrant definitions (what makes
  a page a tutorial versus a how-to versus reference versus explanation) come from one summary
  paragraph; the /tutorials-how-to/ and /reference-explanation/ pages would firm up the split.
- Neither navigation source states a hard number for how many top-level sections are too many; "fit
  comfortably next to your logo" is a design judgment that depends on label length and whether a
  search bar shares the header row.
- Whether 106 items should surface in the footer as a sitemap (USWDS big footer) or stay behind a
  single "All components" link is undecided; the footer guidance curates popular content, which for
  a catalog may mean only the most-visited items.
