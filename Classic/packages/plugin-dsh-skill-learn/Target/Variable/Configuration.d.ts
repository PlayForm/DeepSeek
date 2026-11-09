/**
 * @module Configuration
 *
 * The skill-learn service's Schemastery schema (one constant built once at load).
 * Composed with the factory's standalone Schema helper (`shared: false` - the minimal
 * block, so the module advertises only the knobs it owns; the shared `log` cell is the
 * one the service never reads, because it logs through its own `logFile` sink). Every
 * knob is a volatile cell so a hot edit lands on the next service call without a
 * remount. The service class reads these through Configure; the defaults here are the
 * truth.
 *
 * @remarks
 * `enabled` defaults to FALSE - the idle-forever posture: the patch row and the README
 * ship the service disabled, a cold mount logs `disabled (enabled=false)`, and the
 * trigger keeps answering `disabled` while the service stays resolvable, so no listener
 * hard-fails on a missing service.
 *
 * THE BUDGETS ARE SEPARATE ON PURPOSE, because they bound different costs and fail
 * differently: `intervalIterations` bounds how OFTEN a review may run, `digestTail`
 * plus the two per-line caps plus `maxInputChars` bound what one review SENDS,
 * `maxTokens` bounds what it RECEIVES, and the three write caps bound how much of the
 * corpus one reply, one run, and one session may touch. A review that blows any of them
 * is a configuration defect, not a runtime surprise, and both write caps count successes
 * rather than attempts so a refused operation never spends the budget that a real write
 * needs.
 *
 * THE TWO DAY THRESHOLDS ARE FLOORED AT 1: a cutoff at or past now would transition the
 * whole corpus on one bad config.
 */
import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, "plain"> | Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, "plain">;
export default _default;
