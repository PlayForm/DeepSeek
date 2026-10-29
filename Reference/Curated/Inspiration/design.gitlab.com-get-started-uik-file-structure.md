# File structure

The Pajamas UI Kit is comprised of multiple Figma files that organize separate, but related
concepts. Each publishes a library that can be enabled in your design files (some are enabled by
default). Dependencies are only the libraries used directly in creating assets and don't include
those used for organization or documentation.

- [**Design tokens**](https://www.figma.com/design/tiAetVi1j5MGP8WA5FswcD/Design-tokens): Design
  token implementation as variables in Figma along with chromatic and brand color styles. Published
  as the "Design tokens" library and enabled for all team design files.
  [How can I use design tokens in Figma?](https://design.gitlab.com/product-foundations/design-tokens-using#in-design)
- [**Component library**](https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library):
  The main file for design components that are used in Pajamas and in all other files. The library
  is published as "Component library" and enabled for all team design files.
- [**GitLab Product Icons**](https://www.figma.com/design/h4YjjttHL5YI0mXZfQ4uuU/GitLab-Product-Icons):
  The main file for product iconography. The library is published as "GitLab Product Icons" and
  enabled for all team files.
- [**GitLab Product Illustrations**](https://www.figma.com/design/1ui9w228X0S5WxaD0SRdIA/GitLab-Product-Illustrations):
  The main file for product illustration. Published as the "GitLab Product Illustrations" library.
- [**Patterns and Page Templates**](https://www.figma.com/design/Amn6vBN9edRtuaTgy6ygkl/%F0%9F%9A%A7-DRAFT-Patterns-and-Page-Templates):
  Shared global resources that includes components and design assets owned by feature teams,
  maintained in a shared space due to their wide usage. The file also contains globally useful
  abstractions and combinations that promote a more consistent UI. Published as the "Patterns and
  Page Templates" library, although many assets are only available as "sticker sheets" to
  copy/paste.
- [**Data Visualization**](https://www.figma.com/design/17NxNEMa7i28Is8sMetO2H/Data-Visualization):
  Components, styles, and charts used within GitLab. Published as the "Data Visualization" library.
- [**Annotations and utilities**](https://www.figma.com/design/dWP1ldkBU4jeUqx5rO3jrn/Annotations-and-utilities):
  Shared resources to annotate and present Figma artifacts. Published as the "Annotations and
  utilities" library.

In addition to the links above, some files are available from the
[GitLab Product Design](https://www.figma.com/@GitLabDesign) community page and the
[project repository](https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/tree/main/ui-kit).

## Dependencies

- Component library uses Design tokens, GitLab Product Icons, and GitLab Product Illustrations.
- GitLab Product Illustrations uses Design tokens.
- Patterns and Page Templates uses Design tokens, Component library, GitLab Product Icons, and
  GitLab Product Illustrations.
- Data Visualization uses Design tokens, Component Library, and GitLab Product Icons.

The UI kit files make use of GitLab Sans, and GitLab Mono. Refer to the
[type fundamentals](https://design.gitlab.com/product-foundations/type-fundamentals) for more
information. The fonts are enabled in Figma automatically for GitLab team members, and are available
to download in [this package](https://www.npmjs.com/package/@gitlab/fonts).

## Plugins

We use the
[Pajamas Figma Plugin](https://www.figma.com/community/plugin/1432845550222168453/pajamas-figma-plugin)
(internal) to read documentation, inspect variables, and find deprecated items. Otherwise, we don't
use plugins for critical actions or capabilities to avoid making any part of the design process
reliant on plugin updates or functionality.

Last updated at: Thursday, August 20, 2026 at 7:26 PM
