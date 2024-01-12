import Handler, { type HandlerOption } from "./base";
import AddEditDeleteHandler from "./_add_edit_delete";
import StatusHandler from "./_status";
import ChangeHandler from "./_change";
import ShelveHandler from "./_shelve";
import UnshelveHandler from "./_unshelve";
import DiffHandler from "./_diff";

import type Context from "../common/context";

const HandlerMapping: Record<string, { new(context: Context, option?: HandlerOption): Handler<unknown> }> = {
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

export default HandlerMapping;
