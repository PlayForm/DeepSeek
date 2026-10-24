// Section - the workspace-live section's identity (the manifest the tab's
// child slot carries through the registration's inject face). The order is
// the Config tabOrder at registration time, so it is not fixed here: the
// identity is the stable part.
export default {
	id: "workspace-live-section",
	bundle: "@playform/client-dsh-workspace-live",
	namespace: "client-dsh-workspace-live",
	title: "tab",
} as const;
