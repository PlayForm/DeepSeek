// Lookup - the symbol lookup (Function/Lookup): exact qualified-name match
// within the path's built model. No index entry is NO lookup: the caller
// resolves first (a read path never silently builds).
import type State from "@Interface/State.js";
import type SymbolNode from "@Interface/SymbolNode.js";

export default (State: State, Path: string, QualifiedName: string): SymbolNode | undefined => {
	return State.Index.get(Path)?.symbols.find((Symbol) => Symbol.qualifiedName === QualifiedName);
};
