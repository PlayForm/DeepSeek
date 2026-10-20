# The Plugin Manager (plugin_manager)

> Source: SKILL.md, section 3, rule 3. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

plugin_manager manages the current profile's plugins and bundles. Every
action requires danger-full-access permission or explicit approval, because
the changes affect EVERY session in the profile, not just the current one.

The actions:

- **list_plugins** - the plugins or bundles in the current profile, with
  enable/disable, install, or remove as follow-ups. List FIRST to obtain
  exact identifiers.
- **list_bundles** - the bundles, including install targets (the spec an
  install_bundle call passes for an Official catalog entry).
- **set_plugin / set_bundle** - enable (enabled: true) or disable
  (enabled: false) one plugin entry or bundle package. The target is the
  plugin entry id or bundle package name from the list.
- **install_bundle** - install an installation spec; installation can
  execute allowed build scripts.
- **remove_bundle** - remove an installed bundle by exact package name.
- **list_version_exemptions / set_version_exemption** - grant (true) or
  revoke (false) a DSH-version exemption for one exact manifest
  package-name@version (not an alias or version range).

## Why: The Full Philosophy

1. **Profile-scoped blast radius.** The profile is shared state: every
   session in it loads the same plugins and bundles. Enabling, disabling,
   installing, or removing one entry changes what every other session - past
   and future - sees. That is why the action itself carries the permission
   requirement rather than leaving it to convention.
2. **Version gates are real, not decorative.** Unmet DSH version
   requirements (the manifest engines.dsh field, or DSH peer dependencies)
   block installation and activation. The gate exists because a plugin built
   against a different harness contract can crash the runtime or corrupt
   profile state.
3. **Exemptions are a last resort with explicit consent.** set_version_
   exemption requires warning the user about possible crashes and data loss
   and obtaining explicit permission for the EXACT plugin and runtime
   versions - acceptRisk: true only after that. General installation
   permission is not enough; the exemption is riskier than the install.
4. **Build scripts are code from strangers.** install_bundle executes
   allowed build scripts, so the approvedBuilds list carries package names
   only after the user explicitly approved running their install scripts in
   the conversation; the approval is persistent for the profile.
5. **Live profiles apply immediately.** Changes apply at once, including
   upgrades of installed packages. A change result that is not applied
   carries nextStep, which says what to do or tell the user - do not ignore
   it and claim success.
6. **Registry questions are asked, not assumed.** When the user names a
   registry, pass it (registry: the npm registry URL asked first);
   otherwise the configured registry is used, with its configured fallbacks
   while a registry is unreachable.

## Examples

### Good

- list_plugins first, then set_plugin with the exact entry id the list
  returned.
- The user says "install X and yes, run its install script": install_bundle
  with approvedBuilds: ["X"] after that explicit approval.

### Bad

- set_plugin against a remembered or guessed entry id - list first; the id
  is the contract.
- acceptRisk: true because "the user generally approves installs" - an
  exemption needs explicit permission for that exact plugin and runtime
  version pair.

## Exceptions

- None to the permission requirement: list operations included, every
  plugin_manager action runs under the same approval regime.
- The only version-gate bypass is the explicit exemption mechanism, which is
  itself permission-gated and revocable (set_version_exemption: false).

## Failure Modes

- Skipping the list and acting on a guessed identifier: the wrong entry is
  enabled, disabled, or removed - in shared profile state.
- Ignoring a not-applied result's nextStep: the profile ends in a state the
  caller believes changed but did not.
- Granting an exemption without the crash/data-loss warning: the user
  consents to something they were never told about.

## Arbiters

- The plugin_manager result itself is the arbiter of what the profile now
  contains and whether a change was applied.
- list_plugins/list_bundles are the arbiter of exact identifiers; the
  version-exemption list is the arbiter of which pairs are currently
  exempted.
