// Command - the ets-hook-dsh-normalize-fullwidth's THIN DELEGATE over the ETS
// base's generic `normalize-overpass` handler (@playform/ets-base-dsh/
// Overpass/Command). The grammar, the scopes report, the batch arm, the
// results paths, the usage line and the files decline line all live in the
// base; the module keeps its identity through State.Module (the Classic
// identity, `hook-dsh-normalize-fullwidth`), its settings/editor seams
// through Apply, and its exact user-facing strings.
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
