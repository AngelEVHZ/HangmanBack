export enum NotifyActionEnum {
    SESSION_CREATED = "SESSION_CREATED",
    USER_JOIN = "USER_JOIN"
}

export type NotifyActionType =
    NotifyActionEnum.SESSION_CREATED |
    NotifyActionEnum.USER_JOIN;