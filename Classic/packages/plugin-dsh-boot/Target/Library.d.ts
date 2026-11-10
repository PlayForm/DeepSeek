/**
 * @module Library
 *
 * The DETACHED MOUNT RAIL (@playform/plugin-dsh-boot).
 *
 * @remarks
 * One job: keep the PlayForm family off the harness's boot rail. This plugin's
 * `apply` does no work beyond scheduling; the plugins named in `mount:` are
 * imported and mounted from a later turn, so `runProfile` (and therefore the
 * host's `ready` message, and therefore the UI) never waits on them.
 *
 * Why a later turn rather than a top-level await or a promise the loader
 * awaits: the loader mounts bundles sequentially at boot and awaits the tree's
 * readiness. Anything that awaits inside `apply` - or a plugin whose own
 * `apply` never settles - holds that readiness open, which is exactly the
 * failure this rail exists to prevent (a stuck fiber leaves the host at
 * "Loading plugins..." forever, with no error anywhere).
 *
 * CONTAINMENT (defensive, per the family rule): a specifier that fails to
 * import, or a plugin whose apply rejects, is logged once as a warning and
 * skipped. Nothing here may throw into the rail, and a failure never removes a
 * specifier permanently - it is dropped from the mounted set so a later boot
 * retries it.
 *
 * OWN DATA ONLY: this plugin reads nothing and writes nothing. The plugins it
 * mounts keep their own state under ~/.dsh/playform/<name>/.
 */
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
export declare const name = "plugin-dsh-boot";
export declare const Config: Schema<Schemastery.ObjectS<NoInfer<{
    /**
     * Package specifiers mounted after the harness's own rail is free.
     */
    mount: Schema<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    /**
     * Package specifiers mounted after the harness's own rail is free.
     */
    mount: Schema<string[], string[], "defined">;
}>>, "plain">;
export declare const apply: (Context: Context, Configuration?: {
    mount?: string[];
}) => void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: Schema<Schemastery.ObjectS<NoInfer<{
        /**
         * Package specifiers mounted after the harness's own rail is free.
         */
        mount: Schema<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        /**
         * Package specifiers mounted after the harness's own rail is free.
         */
        mount: Schema<string[], string[], "defined">;
    }>>, "plain">;
};
export default _default;
