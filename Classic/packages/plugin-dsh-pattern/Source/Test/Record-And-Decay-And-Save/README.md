# Record-And-Decay-And-Save - the learner, the decay and the snapshot tests

The Record ledger lines byte-exactly, the unknown-id silence, the half-life
decay toward the 0.5 floor, the clamping, and the snapshot persistence
against real files inside the redirected temp $HOME.

## Scenarios

- R1: each outcome applies its own delta (accepted +0.1, rejected -0.2,
  applied +0.15, failed -0.25, clamped to 0..1) and logs the byte-exact
  `recorded <outcome> on <id> (confidence <0.00>)` line; an unknown id is
  silent; Record stamps the passed `Now`, never the wall clock.
- R2: the decay pulls the confidence toward the 0.5 floor by the half-life
  factor (two half-lives = quarter of the distance), downward for confident
  and upward for low patterns, no-op at the floor.
- R3: Save writes the versioned snapshot file and logs the byte-exact
  `saved 5 patterns to <path>` line; a seeded snapshot replaces the catalog
  at construction with the byte-exact `restored 2 patterns from snapshot`
  line; an unreadable or wrong-version snapshot is a silent miss.

## Expected count

10 PASS.
