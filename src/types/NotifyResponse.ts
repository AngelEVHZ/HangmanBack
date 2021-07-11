import { NotifyActionType } from "../constant/NotifyActionEnum";

export interface NotifyResponse<T> {
    action: NotifyActionType;
    data: T;
}
