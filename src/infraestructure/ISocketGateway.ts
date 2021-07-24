import { NotifyResponse } from "../types/NotifyResponse";

export interface ISocketGateway {
   sendMessage<T>(connectionId: string, event: NotifyResponse<T>): Promise<boolean>;
   close(socketIdconnectionId: string): Promise<boolean>
}
