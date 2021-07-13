import { CreateSessionRequest, SocketAction, NotifyAll, NotifyHost } from "../types/SocketAction";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";

export interface ISocketService {
    ConneconnectSession(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse>
    Connect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse>
    Disconnect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse>
    NotifyAll(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>): Promise<GenericResponse>
    NotifyHost(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyHost>>): Promise<GenericResponse>
    NotifyPlayers(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>): Promise<GenericResponse>
}
