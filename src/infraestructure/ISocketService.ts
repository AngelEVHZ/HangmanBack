import { CreateSessionRequest, SocketAction } from "../types/SocketAction";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";

export interface ISocketService {
    connect(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse>
}
