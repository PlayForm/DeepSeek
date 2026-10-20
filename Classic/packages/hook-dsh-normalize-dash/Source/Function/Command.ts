// Command - the hook-dsh-normalize-dash's THIN DELEGATE over the core's
// generic `normalize-overpass` handler (@playform/hook-dsh-core/Overpass/
// Command). The grammar, the `scopes` report, the `batch` one-shot arm, the
// `results on|off` settings/editor paths, the usage line and the `files`
// decline line all live in the core; the module keeps:
//
//   * its identity - State.Module, which the core prefixes every composed
//     line with (the core never hardcodes a module name);
//   * its settings/editor seams - Function/Apply passes them through
//     unchanged;
//   * its exact user-facing strings - the suite asserts them, and they are
//     composed from State.Module in the core.
//
// The service types are re-exported because Function/Apply imports them from
// this module (the import path stays untouched).
import { Command } from "@playform/hook-dsh-core";

export type {
	CommandResult,
	CommandsService,
	ConfigEditorService,
	SettingsService,
} from "@playform/hook-dsh-core";

export default Command;
