# Ontology exploration as visual inspiration

Source: `Raw/foundry-helix-db.md` (https://foundry.helix-db.com/), archived DOM at
`Archive/HTML/001-foundry.helix-db.com.html`.

Foundry presents a company's records as one suggested ontology: entities with record counts and a
key column, relationships with a verb, a match ratio, and the join columns that produced the match.
It then lets a reader open one record and see its properties plus every relationship in and out,
together with the load and the version that wrote it.

## What we adopt

1. **An entity card states a count and a key.** Foundry writes `Account`, `60 records`,
   `key account_id`. A catalogue group card should state its member count and the identifier that
   joins it to the rest, which for us is the package stem.
2. **Provenance is a first-class row, not a footnote.** Foundry writes `Merged from 3 sources` and
   then one line per source with its match ratio, `60 of 62 matched`. Our twins are exactly this
   shape: `47 of 48 name-matched` across the two implementation trees, and a catalogue card can
   state it in the same voice.
3. **A relationship carries its join evidence.** Foundry writes the verb, the target, the ratio, and
   the columns:
   `Requested by Support ticket -> User, 114 of 119 matched, support_tickets.csv.requester_email -> users.email`.
   Our edges should carry the same triple: the relationship kind, the target, and the evidence that
   produced it, which for a catalogue edge is the manifest dependency and for a trace edge is the
   recorded sequence.
4. **A record detail shows both directions.** Foundry opens a record and lists every relationship in
   and out, with the load and the version that wrote it. Our inspector currently shows one node in
   isolation; it should list the incoming and outgoing edges with their kinds and the snapshot
   revision, so a reader can walk the graph from the panel.
5. **The canvas stays quiet.** Foundry's ontology view is white space, small labels, and counts; the
   chrome is a thin bar. That is the same posture the full-bleed explorer now takes: a bar of
   toggles on top, the canvas below, and the inspector floating over the canvas only when a record
   is selected.

## What we reject

Foundry merges records across sources and reports match confidence. The catalogue has no merge step
and no confidence score: a package exists in one tree, and its twin is a name match rather than a
verified behavioral equivalence. The site must not borrow the "merged, 60 of 62 matched" language
for twins beyond the honest statement that the names match.

Foundry's "everything a load wrote" is a provenance record over a real write. Our story graphs are
authored walkthroughs with no write behind them, so the inspector may show the evidence class and
the snapshot revision, and must not imply a load identity.

## Where it lands

- `Source/Component/Graph/Inspector.astro`: add an in/out relationship list, each row naming the
  kind, the other node, and the evidence.
- `Source/pages/plugins.astro`: the twin count already reads `47 TWINS`; add the matched-out-of
  denominator from the catalogue so the number is legible without opening a package.
- `Source/Library/Graph/Client.mjs`: on selection, fill the relationship list from the graph's
  edges, capped and ordered by kind.
