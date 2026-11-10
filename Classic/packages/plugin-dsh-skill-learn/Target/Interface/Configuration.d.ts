import type { Allowlist } from "@playform/plugin-dsh-factory";
/**
 * @module Configuration
 *
 * The validated plugin-config shape for the skill-learn service (the schema that
 * produces it lives in `Variable/Configuration.ts`). Every knob is a volatile cell in
 * the schema; the service reads them through its Configure method, so a hot edit lands
 * on the next call without a remount.
 *
 * @remarks
 *
 * The factory's minimal shared block contributes the universal `log` cell alongside
 * these knobs, and this type deliberately leaves it out: the service logs through its
 * own `logFile` sink and cannot act on the shared flag, so a knob it cannot read has no
 * place in the surface the loader hands it.
 */
export default interface Configuration {
    /**
     * Master switch; FALSE is the shipped posture, so the service stays resolvable and silent.
     */
    enabled: boolean;
    /**
     * The family ledger path, and the path every ledger line names.
     */
    logFile: string;
    /**
     * The declared storage domain; the JSON sidecar below is the store this package wires.
     */
    domain: string;
    /**
     * The usage store: one record per skill, and the curator's whole input.
     */
    storagePath: string;
    /**
     * Reserved and unread: the curator clock is the usage store's one reserved key.
     */
    statePath: string;
    /**
     * The append-only audit ledger: one row per mutation, and the revert handle.
     */
    ledgerPath: string;
    /**
     * Content-addressed before and after bytes; a snapshot names these instead of copying them.
     */
    blobRoot: string;
    /**
     * One JSON manifest per whole-tree snapshot.
     */
    snapshotRoot: string;
    /**
     * One directory per run, holding `run.json` and `REPORT.md`.
     */
    reportsRoot: string;
    /**
     * How many snapshot manifests survive a rotation; the newest is never pruned.
     */
    snapshotKeep: number;
    /**
     * The only writable corpus root; every other catalog root is refused as `foreign-root`.
     */
    skillsRoot: string;
    /**
     * The worst outcome any pass may produce, and never a write target.
     */
    archiveRoot: string;
    /**
     * The working agreement: read-only, and refused by name before any write.
     */
    agreementPath: string;
    /**
     * Tool-call blocks since the last review before one is due.
     */
    intervalIterations: number;
    /**
     * The parsed operation bound; the prompt states eight, so a higher value would make it wrong.
     */
    maxOperations: number;
    /**
     * The applied bound for one run, counted on successes rather than attempts.
     */
    maxOperationsPerRun: number;
    /**
     * The session bound, counted on successes and keyed by the agent object.
     */
    maxWritesPerSession: number;
    /**
     * Messages kept verbatim; older ones collapse into one synthetic message.
     */
    digestTail: number;
    /**
     * The per-line cap on a user line in the digest.
     */
    digestUserChars: number;
    /**
     * The per-line cap on an assistant line in the digest.
     */
    digestAssistantChars: number;
    /**
     * The digest budget of one request.
     */
    maxInputChars: number;
    /**
     * The reply budget of one request.
     */
    maxTokens: number;
    /**
     * The bound on the file a write produces.
     */
    maxSkillChars: number;
    /**
     * Days of inactivity before a skill is `stale`; floored at 1 so one bad config cannot age the
     * corpus.
     */
    staleAfterDays: number;
    /**
     * Days of inactivity before a skill is archived; floored at 1 for the same reason.
     */
    archiveAfterDays: number;
    /**
     * The minimum age of `lastRunAt` before a curator pass.
     */
    curateIntervalHours: number;
    /**
     * The opt-in second half of the curator; FALSE is the shipped default.
     */
    consolidate: boolean;
    /**
     * The route override; empty reads the agent's own provider.
     */
    provider: string;
    /**
     * The route override; empty reads the agent's own model.
     */
    model: string;
    /**
     * The per-action allowlist; `write` is the verdict that decides whether a run publishes or merely
     * reports.
     */
    policy: Allowlist;
}
