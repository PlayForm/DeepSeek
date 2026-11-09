type Kind = "read" | "write" | "edit" | "delete" | "search";
type Touched = {
    Path: string;
    Kind: Kind;
};
export declare const Search: (Tool: string) => boolean;
export declare const Content: (Tool: string, Arguments: string) => string | undefined;
export declare const Rendered: (Result: unknown) => string | undefined;
export default _default;
declare function _default(Name: string, Arguments: string, Cwd: string, Result?: unknown): readonly Touched[];
