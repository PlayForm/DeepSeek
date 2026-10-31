# The showcase dossiers

One file per plugin, holding the whole design of that plugin's page: the layout drawn in ASCII, the
machines it uses, the data each machine reads, and the history of every iteration. The page is built
from the dossier, not from a conversation, so the design survives a context that has been compacted,
lost, or handed to a different agent.

A dossier is append-only. A new iteration adds a dated section and leaves the old one standing, so the
history of the design is readable and a later agent can see what was tried, what was replaced, and
why. The current layout is always the last section; the earlier sections are the record.

## The files

| File | What it holds |
| --- | --- |
| `README.md` | this method |
| `<slug>.md` | one plugin's page: layout, machines, data, history |

## The dossier schema

Every dossier has the same five parts, in this order:

1. **The claim** - one sentence the page must leave with, and the question it answers.
2. **The layout** - the page drawn in ASCII, top to bottom, with each machine named at the position it
   occupies. This is the part that makes the dossier worth keeping: an agent can implement a drawing,
   and a reader can disagree with it before anything is built.
3. **The machines** - a table of the machines on the page, what each adds, and the component that
   draws it.
4. **The data** - where each machine's facts come from: the source file, the `SCHEME.md` section, the
   README table, the test string.
5. **The history** - dated sections, newest last, each saying what changed and why.

## The layout convention

ASCII, one screen tall per section, with the machine named in brackets and the content sketched:

```
+--------------------------------------------------------------+
| hook-dsh-package-governor              [kind] [release]       |
| The silent governor of every written package.json             |
+--------------------------------------------------------------+
| FACTS       six rows, two columns                              |
+--------------------------------------------------------------+
| PORTRAIT    [Rewrite] the chain pass, the update, the fence    |
+--------------------------------------------------------------+
| FLOW        01 seam -> 02 gate -> 03 registry -> ... -> ledger |
+--------------------------------------------------------------+
| ACTIVATION  activated (anywhere mode, logFile=..., ...)        |
+--------------------------------------------------------------+
```

The sketch is not decoration: it fixes the order, the proportion, and the machine per band, which is
exactly what an agent gets wrong when it works from prose.

## How a lane uses a dossier

1. Read the dossier before reading anything else about the plugin.
2. Read the data sources it names.
3. Implement the layout as drawn, or propose a change by adding a section to the history first.
4. Append the history section: the date, what changed, and the reason.
5. Never rewrite an earlier section. If a decision is reversed, the new section says so.

## How a dossier is started

A dossier for a plugin with no page yet is written from the source, in this order: the `SCHEME.md`,
the README, the `Source/Function/` headers, the tests, and the package's place in the family. The
first section's layout is a proposal; the second iteration is what the page actually became.
