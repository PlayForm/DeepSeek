---
title: The Workspace Family - the pitfalls log
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: open
registry: Documentation/Plans/Workspace-Family/PITFALLS-LOG.md
index: Documentation/INDEX.md
statuses:
	- name: the pitfalls log (from the day's work + the design's hazards)
		state: open
		evidence: this document - the seven logged hazards
---

# THE WORKSPACE FAMILY - THE PITFALLS LOG

> Detailed document of the Workspace Plugin Family Decomposition. The parent hub is
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. The content comes from the day's
> work and the hazards of the design. THE FRAMING (binding): the workspace family is the DEEPSEEK
> HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, and the @playform plugin family
> powers it - it is never one plugin.

---

- **THE EVENT-SPONSORSHIP GAP**: the fs and observed chain works from the filesystem, so the events
  of the remote blocks need the extension of the event sponsorship, and the local-only assumptions
  in the write path of the governors and in the ledger strings must change.
- **THE ADAPTER COVERAGE GAPS**: the binary files, the compound documents (the OOXML of the docx -
  the zip-based XML trees!), and the large files add the cost and the freshness problem of the
  knowledge-graph extraction.
- **THE SEMANTIC UNCERTAINTY PER TYPE**: the rename has a different meaning for each format (the .ts
  symbol, the displayed text of the .docx, and the .rs item), and the refusal-to-guess rule applies
  for each adapter.
- **THE REPRESENTATION'S STALENESS**: the external edits that come without events (the editors, the
  git operations, and the remote syncs) need the qualified freshness and the digest-based
  reconciliation.
- **THE CLOUD/REMOTE RISKS**: the latency, the authentication, and the version compatibility need
  the authenticated fallback rule.
- **THE INVERSE REPRESENTATION'S OWN FAILURE MODES**: the graph cycles, the dangling references, the
  evicted states in the middle of an edit, and the crash between the commit and the journal.
- **THE LICENSE/WEIGHT CONFLATION**: the priority, the retention, and the permission are never
  interchangeable, because the license is the authority and the weight is the representation.
