// Open - the read-only ledger open copied from the analysis plugin's
// Function/Open: a leading "~/" is expanded to the home-anchored absolute
// path exactly once at the open site, the file is opened with
// `{ readOnly: true }`, and a failure throws one actionable line that
// starts with the package prefix and ends with the underlying message. The
// reader runs no pragma that writes, no migration and no DDL; Close closes
// the handle the caller must always pair with the read.
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";

export default function Open(Path: string): { Database: DatabaseSync; Close(): void } {
	const Resolved = Path.startsWith("~/") ? `${homedir()}${Path.slice(1)}` : Path;
	let Database: DatabaseSync;
	try {
		Database = new DatabaseSync(Resolved, { readOnly: true });
	} catch (Failure) {
		throw new Error(
			`client-dsh-panel-cost: cannot open the ledger at ${Resolved} - ` +
				`${Failure instanceof Error ? Failure.message : String(Failure)}`,
		);
	}
	return {
		Database,
		Close: () => {
			Database.close();
		},
	};
}
