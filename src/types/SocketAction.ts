import { SocketActionType } from "../constant/SocketActionEnum";

export interface SocketAction<T> {
    action: SocketActionType;
    data: T;
}
  

export interface CreateSessionRequest {
    nickName: string;
    gameId?: string;
}

export interface NotifyAll {
    excludeOwner?: boolean;
    gameId: string;
    notification: any;
}

export interface NotifyHost {
    socketId: string;
    notification: any;
}