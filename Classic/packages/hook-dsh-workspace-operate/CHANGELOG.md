# Changelog

This file records all notable changes to this package.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together to the `0.2.1-rc.4` host line and zod 4.6.7.

- The storage-domain table cast casts the zod 4.6.7 schemas to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.
