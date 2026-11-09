type Kind = "read" | "write" | "edit" | "delete" | "search";
type Touched = {
    Path: string;
    Kind: Kind;
};
export declare const Search: (Tool: string) => boolean;
export default _default;
declare function _default(Name: string, Arguments: string, Cwd: string, Result?: unknown): readonly Touched[];
