/**
 * @module Section
 *
 * The workspace-live section's identity.
 *
 * @remarks
 * The identity is the manifest the tab's child slot carries through the
 * registration's inject face. The order is the Config tabOrder at
 * registration time, so it is not fixed here: the identity is the stable
 * part.
 */
declare const _default: {
    readonly id: "workspace-live-section";
    readonly bundle: "@playform/ets-client-dsh-workspace-live";
    readonly namespace: "client-dsh-workspace-live";
    readonly title: "tab";
};
export default _default;
