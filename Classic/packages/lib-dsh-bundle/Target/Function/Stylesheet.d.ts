import type { Plugin } from "esbuild";
/** The CSS text of one sheet, with the material resolved through the package's load paths. */
export declare function Compile(File: string, LoadPaths: string[]): string;
/** The esbuild plugin: every `.scss` resolves to a JS module exporting its CSS. */
export default function Stylesheet(Directory: string): Plugin;
export declare function Publish(Directory: string): void;
