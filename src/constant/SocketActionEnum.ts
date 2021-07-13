export enum SocketActionEnum {
    CONNECT_SESSION = "connectSession",
    NOTIFY_ALL = "notifyAll",
    NOTIFY_HOST = "notifyHost",
    NOTIFY_PLAYERS = "notifyPlayers",
}

export type SocketActionType = SocketActionEnum.CONNECT_SESSION |
    SocketActionEnum.NOTIFY_ALL |
    SocketActionEnum.NOTIFY_HOST |
    SocketActionEnum.NOTIFY_PLAYERS;