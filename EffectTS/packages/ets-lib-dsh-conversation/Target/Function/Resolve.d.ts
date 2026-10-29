type Kind = "read" | "write" | "edit" | "delete" | "search";
type Touched = {
    Path: string;
    Kind: Kind;
};
export default _default;
declare function _default(Name: string, Arguments: unknown, Cwd: string): readonly Touched[];
