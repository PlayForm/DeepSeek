---
title: The Tomorrow Review - the known missing and the open decisions
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-07
status: complete
registry: Documentation/Archive/Tomorrow-Review/MISSING-AND-OPEN-DECISIONS.md
index: Documentation/INDEX.md
statuses:
	- name: the known missing / the open decisions (the "missing quite a lot" list)
		state: open
		evidence: this document; the master record Documentation/Plans/TOMORROW-REVIEW.md section 3
---

# THE KNOWN MISSING / THE OPEN DECISIONS (THE "MISSING QUITE A LOT")

> Granular topic document distilled from the descriptive plan preserved 2026-10-07
> (Documentation/Plans/TOMORROW-REVIEW.md section 3 - byte-preserved; the master record remains the
> authoritative source).

---

1. **The submodule structure (#16).**

    Each release package becomes a separate repository, added as submodules, with the per-repo
    gitignores; the monorepo's own gitignore currently anticipates it.

    The item is NOT STARTED.

2. **The Boilerplate's gitignore decision.**

    Exclude it from the parent repo so the internal reference stays personal, or make it a private
    submodule.

3. **The governor's `ncuBin` residual.**

    The CORSAIR path sits in the governor-package's Config default, a smoke-asserted code constant,
    so re-pin + rebuild when the releases must be fully clean.

4. **The naming refinements (#15).**

    The `lib-`/`manifest` proposals (lib-dsh-core, manifest vs package) are UNDECIDED, and the
    Site + the READMEs currently use the user's exact approved names.

5. **The releases' polish.**

    The work covers the per-package publish configs (the registry, the publish flow), the
    license/attribution per repo, and the CHANGELOGs.

6. **The site's remaining feedback.**

    The work is the review of the correctness agent's output, per the user's directions: the
    usage/integration demos, the before/after showcases, the truthful injection points, the
    functionality-adapted benchmarks, and the case-study third pass.

7. **The known engineering gaps** (the working lessons).

    - The smoke/live fidelity gap, because the smokes prove the mechanics and the live battery
      proves the wiring; the live findings came from the battery, not the smokes.

    - The load-order nondeterminism, because the pinner activates before the governor at this boot;
      the fold + the fresh-version writes make the order irrelevant, but the registration order
      isn't controlled.

    - The `update stage` verifyCommand failures, the documented cordis registry trap with the
      vendored forks.

    - The subagent stalls (the reading-loop pattern), recovered by the scaffold-first +
      bounded-reading prompts.

    - The local/UTC timestamp confusion in the storage records.

8. **The register's still-open items**: #12's residuals, #13's follow-ups (the EffectTS's
   per-package polish, such as the READMEs' "zero runtime dependencies" line for the core), #14 (the
   parallel smoke coverage in the Classic), and #16 (above).
