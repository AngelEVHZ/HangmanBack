import { IAPIGatewayEvent } from "libs/apiGateway";

export interface IHelloService {
    hello(event: IAPIGatewayEvent<any>): {statusCode: number; body: string;}
}
