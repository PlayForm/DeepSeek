# Absent

## The claim

The names a plugin leaves alone are a decision, not a failure. The machine prints the decision's own
label, the name, and the source's reason, on an inset face with no accent anywhere, because nothing
here failed and a reader should not go looking for the error.

The machine answers: **what does this plugin deliberately not handle, and why?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Absent.astro` | The shape: an `aside`, a label paragraph, and a definition list of one name and one reason per item. The label defaults to `Deliberately absent` and is a prop, because the same shape states two different decisions on two pages. |
| `Site/Source/Stylesheet/Component/Absent.scss` | The geometry: the tray face, a `64px` name track and a flexible reason, one hairline between items, `max-width: var(--measure)`, and no accent token anywhere in the file. |
| `Site/Source/Content/Detail.ts` | Both lists: the four extensions of the `Syntax` record and the six tools of the `Compress` record's `Exempt`, each with the source's own sentence. |
| `Site/Source/pages/package/[slug].astro` | The two mounts: `Absent` under the family matrix with the default label, and `Absent` with `Label="Never compressed"` under the compressor's detail. |
| `Temporary/Corca/Curated/Components.md` | The object row and the rule that hairlines separate while only a surface encloses. The panel is a tray with hairlines between items, not a bordered card. |
| `Temporary/component-page-composition-recipes.json` | M13.R05, unsupported capability: state what the source does not include, and what it does include, without a recovery affordance the source cannot back. |

The borrow is a mechanic (a deliberate absence is stated, not apologized for), a geometry (a fixed
name track and a prose reason), and a state model (a name is either handled or exempt, and the list
holds only the exempt ones).

## The copy

The section that mounts it prints `Detail` and, on the syntax page, `The comment syntax the scanner
knows, and the extensions it leaves alone.`

The first mount prints, in order:

1. `Deliberately absent`
2. `md`
3. `Prose has no code comment to remove; a // in a markdown code fence is content.`
4. `mdx`
5. `Prose has no code comment to remove; a // in a markdown code fence is content.`
6. `json`
7. `Data has no code comment to remove; a // in a JSON string is content.`
8. `txt`
9. `Plain text has no code comment to remove.`

The second mount prints, in order:

1. `Never compressed`
2. `write`
3. `The author's own file write; its content is the work, not a result to compress.`
4. `edit`
5. `The edit result is the change the author asked for, and the diff is the evidence.`
6. `raw-write`
7. `A raw write is the bytes themselves; replacing it would replace the file's content with a marker.`
8. `subagent`
9. `A subagent's brief is another agent's whole answer, and the parent reads it once.`
10. `ask_user_question`
11. `The question is a gate the user answers; a marker would ask the user to retrieve their own prompt.`
12. `ccr_retrieve`
13. `The retrieval tool's own echo; compressing it would make the restore of a restore.`

The machine prints no figure. It counts nothing, so no count appears in the copy or on the face.

## The layout

```
+----------------------------------------------------------------------+
| ABSENT                                                               |
| a decision, an inset face, one hairline between reasons              |
+----------------------------------------------------------------------+
| LABEL   the decision, small caps, no accent                          |
| Deliberately absent                                                  |
+----------------------------------------------------------------------+
| NAME 64px   | REASON, one sentence, the source's own                 |
| md          | Prose has no code comment to remove; a // in a ...     |
+-------------+--------------------------------------------------------+
| mdx         | Prose has no code comment to remove; a // in a ...     |
+-------------+--------------------------------------------------------+
| json        | Data has no code comment to remove; a // in a ...      |
+-------------+--------------------------------------------------------+
| txt         | Plain text has no code comment to remove.              |
+----------------------------------------------------------------------+
| the panel is a tray, max width the measure, no outer accent          |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The panel is one column at the measure, because a reason is a sentence and
a sentence needs the measure; the name track is 64px, wide enough for `raw-write` and
`ask_user_question` at the small mono size, and the reasons take everything else. The label is the
only line above the list, and the hairlines are the only separators.

## The machines

Absent adds the negative half of a package's scope. Every other machine on the package page states
what the package does; this one states what it will not do, and it is the only machine on the site
whose face carries no accent.

| Neighbour on the same page | What it already says | What Absent must not say |
| --- | --- | --- |
| Family | the seven syntaxes and their extensions | the four extensions as chips in a row |
| Flow | the order the filter works in | the exemption as a branch with a fail badge |
| Configuration | the knobs a reader can set | an implied knob that would add a name back |
| Surface | the listeners the package registers | the exemption list as a surface row |

The two mounts are the same machine. When the record is absent the panel is not rendered, so a
package with no exemption list shows no panel and no empty tray.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| A quiet tray with no accent | The warn face, as `Bundle` uses for a contained failure | Warn is the site's word for something that went wrong. These names are a decision, and painting them as a failure would be the exact misreading the machine exists to prevent. |
| One component with a `Label` prop | Two components, one per decision | The shape is identical and only the sentence above the list differs. Two components would drift in geometry while claiming to be the same panel. |
| The name is a 64px mono cell | A chip per name | A chip reads as a token to select or to copy. These names are values to compare against a file extension or a tool call, so they are set as a column, not as objects. |
| The reason is the source's own sentence | A rewrite in the site's voice | The machine's claim is that the plugin's decision is documented. A rewrite would make the site the authority on the exemption and hide the fact that the sentence comes from the package. |
| No figure is printed | A count of exemptions | The two mounts have different denominators, four extensions and six tools, and a count would invite a comparison between them that means nothing. |
| No recovery affordance | A link that would add the name back anyway | The plugin's decision is not the reader's to override from a static page, and the site cannot invoke the plugin. An affordance would promise an action the page cannot take. |
| No per-name link | Linking `md` to a format specification | The panel is about the plugin's scope, not about the format. A link would send a reader away from the decision they are reading. |
| The panel is capped at the measure | Full width, like the matrix above it | The matrix is a comparison and needs width; this is prose and needs the measure. Capping it also keeps the panel from reading as a second table. |
| The label is small caps, not a heading | An `h3` per panel | The panel sits inside a section that already has a heading, and two of these panels can appear on one page. A heading level would invent a document outline the page does not have. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted twice: on `/package/hook-dsh-comment-filter` under the family matrix
with the default label, and on `/package/hook-dsh-ccr` under the compressor's detail with the label
`Never compressed`. The page that proves the default mount is the comment filter's; the page that
proves the named mount is the compressor's.

What is not drawn yet: the enforcement, which is an exact-name match in the filter's exemption table
rather than a property of the extension, and the twin pages, which read the same records through the
`ets-` prefix. Neither gap changes the copy; both would change what a reader believes about how the
decision is kept.
