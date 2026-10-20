// Command - the ets-hook-dsh-normalize-dash's THIN DELEGATE over the ETS
// base's generic `normalize-overpass` handler (@playform/ets-base-dsh/
// Overpass/Command). The grammar, the `scopes` report, the `batch` one-shot
// arm, the `results on|off` settings/editor paths, the usage line and the
// `files` decline line all live in the base; the module keeps:
//
//   * its identity - State.Module (the Classic identity,
//     `hook-dsh-normalize-dash`), which the base prefixes every composed
//     line with - so every user-facing string stays byte-identical;
//   * its settings/editor seams - Function/Apply passes them through
//     unchanged;
//   * its exact user-facing strings - the suite asserts them.
//
// The service types are re-exported because Function/Apply imports them from
// this module (the import path stays untouched).
import { Command } from "@playform/ets-base-dsh";

export type {
	CommandResult,
	CommandsService,
	ConfigEditorService,
	SettingsService,
} from "@playform/ets-base-dsh";

export default Command;
