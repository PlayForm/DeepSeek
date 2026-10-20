---
title: The Tomorrow Review - the live-testing findings (2026-10-20)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-LIVE-TESTING-2026-10-20.md
index: Documentation/INDEX.md
statuses:
	- name: the mount incident (the "plugins not working" root cause)
		state: resolved
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - 17 package.json files with unresolved git merge conflict markers; the user resolved all 17, the tree clean
	- name: the probe results (the family partial boot)
		state: resolved
		evidence: the ccr + governance probes negative (not mounted); the tool-coach fired live - the coach + the factory confirmed mounted
	- name: the live-testing results (the family fully mounted)
		state: resolved
		evidence: the governance trio proven (the /tmp probe governed within 9s); the ccr mount + store path + the live-reload proven (the marker <<<CCR:963aa7ace83af081797777cf|terminal|58222>>>)
	- name: the two ccr anomalies
		state: open
		evidence: the retrieve's range parameter coordinate space; the preview header's line count/exit display
---

# THE LIVE-TESTING FINDINGS (2026-10-20 - THE FIRST PROBES + THE MOUNT INCIDENT)

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the LIVE-TESTING
> FINDINGS section; the master record remains the authoritative source).

---

## 1. The mount incident (root cause of the "plugins not working")

- After the user's second restart, ONLY the factory + the tool-coach were
  registered (the list total 207 vs 218; 11 family entries missing - the
  governors, the pinner, the cargo, the 7 normalize flavors, the ccr -
  no ccr ledger, no ccr_retrieve tool, the governance chain silent).
- ROOT CAUSE: 17 package.json files (Classic quotes/spaces/invisible/
  governor/pinner + 12 ETS) carried UNRESOLVED GIT MERGE CONFLICT
  MARKERS inside the devDependencies (the user's mid-task commit 99891ef
  collided with the upgrade lane's manifest edits; the invalid JSON -> the
  loader could not register the plugins).
- THE USER RESOLVED ALL 17 (verified: all 30 package.json VALID, ZERO
  markers, the tree CLEAN - committed).
- The family mounts fully at the NEXT restart.

## 2. The probe results (the current boot, the family partial)

- THE CCR PROBE (seq 1 20000) - NO marker (the harness's own
  spill/truncation handled the output; the ccr was not mounted).
- THE GOVERNANCE PROBE (the /tmp/dsh-live-probe package.json + Cargo.toml
  writes via the tool layer) - NO pinning/governing observed (the
  governors were not mounted).
- THE TOOL-COACH FIRED LIVE on the orchestrator's own bash tail/grep
  commands - the tier-1 notes delivered (strike 3 read-class + strike 8
  search-class, with the live registry descriptions) - the coach + the
  factory confirmed mounted.
- The probes re-run after the restart.

## 3. The live-testing results (2026-10-20 - the family fully mounted, all verified from the ledgers + the disk truth)

- (1) THE GOVERNANCE TRIO PROVEN - the /tmp/dsh-live-probe package.json
  write was governed within 9s: "left-pad": "^0.3.4" -> "left-pad":
  "1.3.0" (the pinner's exact-pin) + the tab->2-space canonicalization
  (the governor); the Cargo.toml's static serde correctly untouched.
- (2) THE CCR - the mount + the store path proven (the ledger's "stored
  bash terminal 58355"). The marker was initially masked: the harness's
  bash-output cap (~14-58KB) keeps EVERY bash result UNDER the
  autoExpandLimitBytes 102400, so the auto-expand path always fired.
  THE LIVE-RELOAD PROVEN: the volatile cell autoExpandLimitBytes lowered
  102400 -> 1024 via the control panel, the SAME `seq 1 60000` command
  then produced the marker
  `<<<CCR:963aa7ace83af081797777cf|terminal|58222>>>`.
  The flip took effect WITHOUT a remount (the volatile cell read live at
  the hook execution) + the ccr_retrieve round-trip worked (the full
  60000-line restore).
- TWO CCR ANOMALIES FLAGGED (the follow-up items): (a) the retrieve's
  range parameter indexes a DIFFERENT coordinate space (start:1 -> the
  compressed-out middle segment's lines 49335-49339, not the restored
  document's first lines); (b) the preview header's line count/exit
  ("[terminal:exit ? | 8265 lines | 334]" - 8265 != the real 60000, the
  exit shown as ?).
- (3) The tool-coach's tier-1 notes + the I9 fail-open (the dash's mount
  with the skipped registration) proven live.
- CURRENT KNOB STATE: the ccr's autoExpandLimitBytes is at 1024 (the test
  flip - restore to 102400 via the panel if the aggressive compression is
  not wanted).
