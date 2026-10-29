import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    enabled: boolean;
    /** The durable journal (one log per module). */
    logFile: string;
    /** Maximum targets in one apply run. */
    maxTargets: number;
    /** Stop at the first conflict instead of continuing. */
    stopOnConflict: boolean;
    /** The recorded-proposal ring bound (the decision consumer's memory). */
    maxProposals: number;
    /** The per-action allowlist (D6): the shared factory block. The ingester
     *  is the batch flow's writer, so `write` is its own action class - the
     *  shipped `approve` records that the decision's approval is the gate. A
     *  resolved pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
