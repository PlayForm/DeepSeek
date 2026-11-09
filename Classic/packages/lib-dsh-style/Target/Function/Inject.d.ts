/**
 * @module Inject
 *
 * The one `<style>` mount every client plugin calls: one element per plugin
 * file, keyed by the `data-plugin-css` attribute, appended once.
 */
export default function Inject(Identifier: string, Sheet: string): void;
