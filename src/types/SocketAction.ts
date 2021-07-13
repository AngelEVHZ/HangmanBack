import { NotifyActionEnum } from "../constant/NotifyActionEnum";
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
    gameId: string;
    notification: any;
    action: NotifyActionEnum;
}

export interface NotifyHost {
    socketId: string;
    notification: any;
    action: NotifyActionEnum;
}