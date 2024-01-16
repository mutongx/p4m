# Changelog

## [0.5.2] - 2024-01-16

### Added

- Add Node.js back to run unit tests to ensure node compatibility

### Changed

- Use `@stylistic` to replace eslint formatting rules
- Added a Context type to prepare for future integration with other tools
- Some p4 stdout handling changes to prepare for more fixibility

### Fixed

- Some wrong Bun usage fixes

## [0.5.1] - 2024-01-10

### Fixed

- Support default value for ActionsMapping to avoid unknown action raising exceptions

## [0.5.0] - 2024-01-10

### Changed

- Change JavaScript runtime to Bun and all related code changes

## [0.4.1] - 2024-01-04

### Added

- Support `branch` action (we should really add a default handler in the future)

## [0.4.0] - 2023-12-06

### Added

- Use `less` as a pager for `p4 diff` command
- Use custom and simple logger instead of console.log and console.error
- Add `npm run check` to automatically run `tsc` and `eslint`, and add them to CI

### Changed

- Some code style fixes

## [0.3.1] - 2023-12-04

### Fixed

- `p4 diff` will split output into multiple text chunks, and p4m can now concancate them instead of losing data

## [0.3.0] - 2023-12-04

### Added

- When called as an editor, look for p4's placeholder text and let `vim` jump to its position
- Support `diff` command with color

### Fixed

- P4EDITOR environment variable is now correctly quoted in case of unsafe character like space in path

## [0.2.0] - 2023-11-23

### Added

- Support `shelve` and `unshelve` command
  - Bug: Both of them have some duplicated codes with others. Will try to fix it in the future.
- A brand new object specification and parser to convert p4's dict object to JS object, with array support
- Use GitHub Actions to create releases

### Changed

- A lot of changes in the process of learning TypeScript, with far less type casts in code.

### Fixed

- `change` command's interactive mode no longer throws exception when invalid change is specified
- `p4 status` no longer gives a blank output when it is slow
  - When the internally-invoked `p4 change` command exits before `p4 status` command, it looks like that we are not able to catch the `exit` event. The reason is unknown. Changing the event to `close` solves the problem, and we should try to investigate it in the future.

## [0.1.0] - 2023-11-16

### Added

- Initial release version
- Support `add` / `edit` / `delete` and `status` command.
  - Bug: `p4 change -i` and `p4 change -o` will not work properly. Use the editor mode instead.
