# Changelog

## [Unreleased]

### Added

- Support `shelve` and `unshelve` command
  - Bug: Both of them have some duplicated codes with others. Will try to fix it in the future.

### Fixed

- `change` command's interactive mode no longer throws exception when invalid change is specified

## [0.1.0] - 2023-11-16

### Added

- Initial release version
- Support `add` / `edit` / `delete` and `status` command.
  - Bug: `p4 change -i` and `p4 change -o` will not work properly. Use the editor mode instead.
