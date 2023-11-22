# Changelog

## [0.1.1-unreleased] - 2023-11-21

### Added

- Support `shelve` and `unshelve` command
  - Bug: Both of them have some duplicated codes with others. Will try to fix it in the future.
- Use GitHub Actions to create releases

### Fixed

- `change` command's interactive mode no longer throws exception when invalid change is specified
- `p4 status` no longer gives a blank output when it is slow
  - When the internally-invoked `p4 change` command exits before `p4 status` command, it looks like that we are not able to catch the `exit` event. The reason is unknown. Changing the event to `close` solves the problem, and we should try to investigate it in the future.

## [0.1.0] - 2023-11-16

### Added

- Initial release version
- Support `add` / `edit` / `delete` and `status` command.
  - Bug: `p4 change -i` and `p4 change -o` will not work properly. Use the editor mode instead.
