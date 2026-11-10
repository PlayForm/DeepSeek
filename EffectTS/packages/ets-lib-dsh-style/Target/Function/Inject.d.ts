/**
 * @module Inject
 *
 * Mounts the one `<style>` element every client plugin calls: one element per
 * plugin file, keyed by the data-plugin-css attribute, appended once.
 *
 * @remarks
 *
 * The style is appended once per plugin file; a second call for the same
 * identifier is a no-op.
 */
export default function Inject(Identifier: string, Sheet: string): void;
