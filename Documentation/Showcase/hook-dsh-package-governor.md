# hook-dsh-package-governor

## The claim

A `package.json` an agent writes is canonicalized and pinned before anyone reads it, and the author
is never told. The page answers: **what did the governor change, and why can the author not tell?**

## The layout

```
+--------------------------------------------------------------------------+
| hook-dsh-package-governor                              [hook] [Classic]  |
| The silent governor of every written package.json                        |
| version 0.2.1   licence CC0-1.0   directory Classic/packages/...         |
+--------------------------------------------------------------------------+
| FACTS        package / version / kind / release / licence / directory    |
+--------------------------------------------------------------------------+
| WHAT IT DOES one sentence, and the README link                            |
+--------------------------------------------------------------------------+
| PORTRAIT     [Rewrite]                                                   |
|              "The silent governor of every written package.json"          |
|              Plugs into fs/observed, the registry walk-up, the fence.     |
|              +------------------------------------------------------+     |
|              | the gate | the chain pass | the update stage        |     |
|              | the fence| the ledger     | the silence             |     |
+--------------------------------------------------------------------------+
| FLOW         01 seam fs/observed -> 02 gate -> 03 registry -> 04 chain    |
|              -> 05 refusal guard -> 06 fenced write -> 07 update stage    |
|              -> 08 breaker -> 09 ledger                                   |
+--------------------------------------------------------------------------+
| ACTIVATION   activated (anywhere mode, logFile=..., updateMode=chain,    |
|              ncuBin=ncu, exclude=[], policyFile=(discovery))              |
|              the template, the three rules, four variants                 |
+--------------------------------------------------------------------------+
| SCHEME       P the chain pass  ->  U the update stage                     |
|              TRIGGER    present + author tool + package.json basename     |
|              EXCLUSION  no path segment inside the tooling                |
|              NON-TRIGGER its own write, its own continuation              |
|              IDENTICAL  the result, the transcript, the events            |
|              DIFFERENT  the bytes on disk, the ledger line                |
+--------------------------------------------------------------------------+
| INSTALL      pnpm add @playform/hook-dsh-package-governor                 |
+--------------------------------------------------------------------------+
| DEFAULT      the harness's own listeners at fs/observed, and the family   |
+--------------------------------------------------------------------------+
| CHANGE       before / after pair, the property, the knob                  |
+--------------------------------------------------------------------------+
| SURFACE      the seams it registers on                                    |
+--------------------------------------------------------------------------+
| DEPENDENCIES the factory, the core library                                |
+--------------------------------------------------------------------------+
| CONFIGURATION every knob, its type, its default                           |
+--------------------------------------------------------------------------+
| RELEASE      the line it ships on                                         |
+--------------------------------------------------------------------------+
| SOURCE       the files the page reads                                     |
+--------------------------------------------------------------------------+
| ORIGIN       the provenance rail                                          |
+--------------------------------------------------------------------------+
```

## The machines

| Machine    | What it adds                                                  | Component        |
| ---------- | ------------------------------------------------------------- | ---------------- |
| Portrait   | what the package is, in one authored line, and its shape      | `Rewrite`        |
| Flow       | the order of its work, with the branch inline                 | `Flow`           |
| Activation | the exact line it writes on load, and the rules that build it | `Activation`     |
| Scheme     | the laws it states in its own document                        | `Scheme`         |
| Change     | the one line that differs with it installed                   | `Difference`     |
| Default    | the harness's own listeners at the same seam                  | prose plus links |
| Surface    | the seams it registers on                                     | `Table`          |

## The data

| Fact                 | Source                                              |
| -------------------- | --------------------------------------------------- |
| the claim, the role  | `README.md`, `SCHEME.md` sections 2 and 3           |
| the flow stages      | `SCHEME.md` section 2, and `Source/Function/`       |
| the activation line  | `Source/Function/Apply.ts`, `Activate([...])`       |
| the laws             | `SCHEME.md` sections 3, 4, and 5                    |
| the before and after | `Documentation/Interpretability/Delta-Workspace.md` |
| the knobs            | `README.md` configuration table, `Config.ts`        |
| the seams            | `Source/Index.ts` registration                      |

## The history

### v1 - 2026-10-31

The page exists as fifteen sections: facts, what it does, the portrait, the flow, the activation,
the scheme, install, default, change, surface, dependencies, configuration, release, source, origin.
The governor is the first package with a `Scheme` machine, and the machine is the model for the
other forty-seven packages that ship a `SCHEME.md`.

The layout as built:

```
+--------------------------------------------------------------------------+
| hook-dsh-package-governor                              [hook] [Classic]  |
| The silent governor of every written package.json                        |
| version 0.2.1   licence CC0-1.0   directory Classic/packages/...         |
+--------------------------------------------------------------------------+
| FACTS        package / version / kind / release / licence / directory    |
+--------------------------------------------------------------------------+
| WHAT IT DOES one sentence, and the README link                           |
+--------------------------------------------------------------------------+
| PORTRAIT     [Rewrite]                                                   |
|              Plugs into fs/observed, the registry walk-up, the fence.     |
+--------------------------------------------------------------------------+
| FLOW         01 seam -> 02 gate -> 03 registry -> 04 chain -> 05 refusal  |
|              -> 06 fenced write -> 07 update -> 08 breaker -> 09 ledger   |
+--------------------------------------------------------------------------+
| ACTIVATION   activated (anywhere mode, logFile=..., updateMode=chain,    |
|              ncuBin=ncu, exclude=[], policyFile=(discovery))              |
+--------------------------------------------------------------------------+
| SCHEME       P the chain pass -> U the update stage                       |
|              TRIGGER / EXCLUSION / NON-TRIGGER                            |
|              IDENTICAL: result, transcript, events                        |
|              DIFFERENT: the bytes on disk, the ledger line                |
+--------------------------------------------------------------------------+
| INSTALL / DEFAULT / CHANGE / SURFACE / DEPENDENCIES / CONFIGURATION /     |
| RELEASE / SOURCE / ORIGIN                                                 |
+--------------------------------------------------------------------------+
```

What v1 does not draw: the registry walk-up (named in the portrait, not drawn), and the update
stage's dual mode (a harness job or a detached continuation) is one sentence in the flow rather than
a fork. Both are the v2 candidates.
