# Changelog

## [Unreleased]

### Fixed

- `change` command's interactive mode no longer throws exception when invalid change is specified

## [0.1.0] - 2023-11-16

### Added

- Initial release version
- Support `add` / `edit` / `delete` and `status` command.
  - Bug: `p4 change -i` and `p4 change -o` will not work properly. Use the editor mode instead.