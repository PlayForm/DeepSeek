# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.

- The storage-domain table cast: the zod 4.6.7 schemas are cast to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.
