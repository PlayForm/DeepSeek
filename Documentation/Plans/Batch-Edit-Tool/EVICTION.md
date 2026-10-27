---
title: The Batch Edit Tool - the eviction rule
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/EVICTION.md
index: Documentation/INDEX.md
statuses:
	- name: the eviction rule (four triggers)
		state: open
		evidence: this document only - first-cut triggers, awaiting the live tuning pass
	- name: the eviction trigger values (the lease window, the LRU cap)
		state: open
		evidence: the parent research's residuals - first-cut defaults needing the tuning pass
---

# THE BATCH EDIT TOOL - THE EVICTION RULE

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 0A.4 of the
> research, byte-preserved.

---

The main process can EVICT a child, where the license is revoked and the state of the child is
settled and released, and the child is never dropped silently.

The triggers, in order of severity:

1. **TTL expiry** - the lease pattern (the I5 lease of the live containers and the leaseTurns
   inheritance), where a machine with no transitions and no reports across its lease window is
   evicted, the final state presentation renders once, and the machine then withdraws.
2. **Constraint violation** - a breach of the schema law (an op outside the prepared schema or a
   write outside the declared scope) revokes the license of the offending process immediately, so
   the machine stays and the process goes to errored with the violation as the reason.
3. **Explicit eviction** - the own action of the main process (the LRU evictions of the ccr and the
   prune precedent of the live containers), where `close` with evict=true drops the machine
   regardless of pending state and after the settle-first pass.
4. **Capacity eviction (LRU)** - machinesPerAgent is exceeded, so the least recently active machine
   is evicted and its halted processes are summarized into the ledger before release.

Eviction always produces ledger lines and one final state presentation, because the record survives
the representation.
