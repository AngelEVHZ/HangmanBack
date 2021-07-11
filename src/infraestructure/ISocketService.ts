import { CreateSessionRequest, SocketAction } from "../types/SocketAction";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";

export interface ISocketService {
    ConneconnectSessionct(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse>
    Connect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse>
}
