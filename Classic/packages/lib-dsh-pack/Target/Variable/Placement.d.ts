/**
 * @module Placement
 *
 * The two pack-layer locations (D2): the user layer hangs off the home
 * directory under `.dsh/playform/workspaces/<slug>.<ext>`, the repo layer off
 * the workspace root under `.dsh/pack.<ext>`.
 *
 * @remarks
 *
 * The extensions are probed in order; `.yml` is the documented form, `.yaml`
 * and `.json` are accepted so a repo can adopt the schema without a YAML
 * parser.
 */
declare const _default: {
    /**
     * The user layer's directory, relative to the home directory.
     */
    UserDirectory: string;
    /**
     * The repo layer's directory, relative to the workspace root.
     */
    RepoDirectory: string;
    /**
     * The repo layer's file stem (the extension is appended).
     */
    RepoFile: string;
    /**
     * The probed extensions, in order.
     */
    Extensions: string[];
};
export default _default;
