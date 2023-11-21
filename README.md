# p4m

A toy to mess around Perforce's [Helix Command-Line Client (P4)](https://www.perforce.com/products/helix-core-apps/command-line-client).

## Features

### `p4` command output override

By installing `p4m` to `PATH` and setting `alias p4=p4m`, p4m can act as a drop-in replacement of the original `p4` command-line. The command-line output will be colorized and reorganized.

Currently supported commands are:

- `p4 add` / `p4 edit` / `p4 delete`
- `p4 shelve` / `p4 unshelve`
- `p4 status`

Examples:

```
$ p4 add test-add-file
[ add] //my-depot/main/test-add-file
/workspace/my-depot/test-add-file - missing, assuming text.
```

```
$ p4 status
Changelist #417: My changelist
  (use p4 shelve to push them to server)
        [ add] //my-depot/main/added-file
        [edit] //my-depot/main/edited-file
        [ del] //my-depot/main/deleted-file

Untracked files:
  (use p4 add/edit/delete/reconcile to track them)
        [ add] //my-depot/main/untracked-added-file
        [ del] //my-depot/main/untracked-deleted-file
        [mdel] //my-depot/main/untracked-moved-file
        [madd] //my-depot/main/untracked-moved-new-file

No file(s) to reconcile.
```

## Bugs

- `p4 change -o` will not output in the correct format. Use `p4 -I change -o` as a temporary workaround for now (`p4m` will skip its processing if any `p4` command-line options are set).
