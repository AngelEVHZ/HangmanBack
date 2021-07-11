import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";

export interface ISocketService {
    connect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse>
}
