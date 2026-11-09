import type { Plugin } from "esbuild";
/** The CSS text of one sheet, with the material resolved through the package's load paths. */
export declare function Compile(File: string, LoadPaths: string[]): string;
/** The esbuild plugin: every `.scss` resolves to a JS module exporting its CSS. */
export default function Stylesheet(Directory: string): Plugin;
/**
 * The material's build: its public surface is Target, so the partials are
 * copied there for the plugins' `@use`, and Base.scss compiles to the one CSS
 * artifact a non-sass consumer can read.
 */
export declare function Publish(Directory: string): void;
