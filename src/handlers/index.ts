import Handler, { HandlerOption } from "./base";
import AddEditDeleteHandler from "./_add_edit_delete";
import StatusHandler from "./_status";
import ChangeHandler from "./_change";

const mapping: { [key: string]: { new(option?: HandlerOption): Handler } } = {
    add: AddEditDeleteHandler,
    edit: AddEditDeleteHandler,
    delete: AddEditDeleteHandler,
    open: AddEditDeleteHandler,
    status: StatusHandler,
    change: ChangeHandler,
};

export default mapping;
