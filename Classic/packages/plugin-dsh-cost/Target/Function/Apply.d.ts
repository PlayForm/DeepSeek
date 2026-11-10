import type { Context } from "@deepseek-ai/cordis";
import type { CommandResult } from "@playform/lib-dsh-core";
import type Factory from "@playform/plugin-dsh-factory";
import type Config from "../Interface/Config.js";
/**
 * @module Apply
 *
 * The plugin entry function: the State build, the ledger database opened
 * through the fiber's effect lifecycle, the project resolution from the session
 * cwd, the durable activation proof, and the human surface - the five /cost
 * verbs plus the backfill job when the capture gate asks for it.
 *
 * @remarks
 *
 * The State build is the factory's cell unwrap plus the P10 volatile refresh.
 * The ledger effect opens it, registers the two session listeners while the
 * ledger is open and closes it on dispose. The function returns NOTHING - the
 * loader treats apply returns specially, and a returned value silently kills
 * event delivery.
 *
 * The session-log seam (section 1) is exactly two listeners. `session/event`
 * (emit, post-commit) is the synchronous recorder: it pushes the event into the
 * capture queue and never awaits, never touches I/O and never throws - a throw
 * here would fail the tool call that produced the event. `session/flush`
 * (parallel) is the durability checkpoint: it peeks the session's queue, folds
 * it into the ledger inside the drain's transaction, acknowledges the batch
 * only after the fold returns committed, and keeps it for a bounded retry when
 * the fold fails (E1, A2 section 1.3). Both listeners are disposed with the
 * ledger effect. The plugin stays silent - no tool, no prompt section, no
 * model-visible message; the commands render their text OUTSIDE model history.
 *
 * The human surface (Documentation/Plans/COST-TRACK-PLUGIN.md section 5): the
 * registry's name law allows no spaces in a command name, so ONE command owns
 * the grammar and the verb is its first word - "report [scope] [range]",
 * "export <csv|json|markdown> [path]", "annotate [path]", "assess [session]",
 * "forecast [days]" - the five /cost invocations. The registration is fail-open
 * (the normalize-file precedent): a missing or already-registered commands
 * service skips the surface and the mount continues with the silent listeners.
 * The backfill is a JOB (section 6, started through the probed jobs service -
 * the walk itself never runs on the boot path), and the jobs stack being absent
 * is a ledger line, not a crash.
 */
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The plugin-factory service (@playform/plugin-dsh-factory).
         */
        pluginFactory: Factory;
        /**
         * The human command registry (@deepseek-ai/dsh-commands).
         */
        commands: Commands;
    }
    interface Events {
        /**
         * One committed session log event; the subject is the session.
         */
        "session/event"(Subject: unknown, Event: unknown): void;
        /**
         * The session's durability checkpoint; the subject is the session.
         */
        "session/flush"(Subject: unknown): void;
    }
}
/**
 * The structural command-registry surface the plugin registers through.
 */
interface Commands {
    register(Definition: {
        name: string;
        description: string;
        handler: (Invocation: {
            rawInput?: unknown;
            signal?: unknown;
        }) => Promise<CommandResult> | CommandResult;
    }): unknown;
}
export default _default;
declare function _default(Context: Context, Options: Config): void;
