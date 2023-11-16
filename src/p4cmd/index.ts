import Command from "./base";
import AddEditDeleteCommand from "./_add_edit_delete";
import StatusCommand from "./_status";
import DiffCommand from "./_diff";
import FstatCommand from "./_fstat";

const p4cmd: { [key: string]: { new(): Command } } = {
    add: AddEditDeleteCommand,
    edit: AddEditDeleteCommand,
    delete: AddEditDeleteCommand,
    open: AddEditDeleteCommand,
    status: StatusCommand,
    diff: DiffCommand,
    fstat: FstatCommand,
};

export default p4cmd;
