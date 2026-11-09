/**
 * @module Stylesheet
 *
 * The ambient module the bundler fills: the client bundle compiles `Source/Stylesheet/Plugin.scss`
 * into the string this declares, so the ESM half type-checks without a stylesheet import it cannot
 * resolve.
 */
declare module "*.scss" {
	const Sheet: string;
	export default Sheet;
}
