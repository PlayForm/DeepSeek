/**
 * @module Translate
 *
 * The resolver shape the panel accepts from the slot.
 *
 * @remarks
 *
 * The locale service hands the view a function that replaces `{name}` occurrences from the
 * parameter bag; the panel never formats a string itself, so this signature is the whole surface
 * the table needs.
 */
export type Translate = (key: string, params?: Readonly<Record<string, string | number>>) => string;
