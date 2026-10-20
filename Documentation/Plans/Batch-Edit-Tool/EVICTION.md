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

> Granular section of the Batch Edit Tool feature research (R-BET-1).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md.
> This document carries section 0A.4 of the research, byte-preserved.

---

The main process can EVICT a child (the license revoked + the child's state
settled and released - never dropped silently). The triggers, in order of
severity:

1. **TTL expiry** - the lease pattern (the live containers' I5 lease, the
   leaseTurns inheritance): a machine with no transitions and no reports
   across its lease window is evicted; the final state presentation renders
   once, then withdraws.
2. **Constraint violation** - a schema-law breach (an op outside the
   prepared schema, a write outside the declared scope) revokes the
   offending process's license immediately; the machine stays, the process
   goes to errored with the violation as the reason.
3. **Explicit eviction** - the main process's own action (the ccr's LRU
   evictions / the live containers' prune precedent): `close` with
   evict=true drops the machine regardless of pending state, after the
   settle-first pass.
4. **Capacity eviction (LRU)** - machinesPerAgent exceeded: the least
   recently active machine is evicted, its halted processes summarized into
   the ledger before release.

Eviction always produces ledger lines and one final state presentation -
the record survives the representation.
