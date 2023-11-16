import Handler, { HandlerOption } from "./base";
import AddEditDeleteHandler from "./_add_edit_delete";
import StatusHandler from "./_status";
import DiffHandler from "./_diff";
import FstatHandler from "./_fstat";

const mapping: { [key: string]: { new(option?: HandlerOption): Handler } } = {
    add: AddEditDeleteHandler,
    edit: AddEditDeleteHandler,
    delete: AddEditDeleteHandler,
    open: AddEditDeleteHandler,
    status: StatusHandler,
    diff: DiffHandler,
    fstat: FstatHandler,
};

export default mapping;
