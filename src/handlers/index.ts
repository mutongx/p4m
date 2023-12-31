import Handler, { HandlerOption } from "./base";
import AddEditDeleteHandler from "./_add_edit_delete";
import StatusHandler from "./_status";
import ChangeHandler from "./_change";
import ShelveHandler from "./_shelve";
import UnshelveHandler from "./_unshelve";
import DiffHandler from "./_diff";

const mapping: Record<string, { new(option?: HandlerOption): Handler<unknown> }> = {
    add: AddEditDeleteHandler,
    edit: AddEditDeleteHandler,
    delete: AddEditDeleteHandler,
    open: AddEditDeleteHandler,
    status: StatusHandler,
    change: ChangeHandler,
    shelve: ShelveHandler,
    unshelve: UnshelveHandler,
    diff: DiffHandler,
};

export default mapping;
