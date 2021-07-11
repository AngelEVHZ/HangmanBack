import { inject, injectable } from "inversify";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import "reflect-metadata";
import { ISocketService } from "../infraestructure/ISocketService";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import IDENTIFIERS from "constant/Identifiers";
import { DynamoGateway } from "gateway/DynamoGateway";
import {  UserSession} from "../types/UserSession";
import { CreateSessionRequest, SocketAction } from "types/SocketAction";
import { SocketActionEnum } from "constant/SocketActionEnum";



@injectable()
export class SocketService implements ISocketService {
    private readonly _dynamo: IDynamoGateway;

    constructor(@inject(IDENTIFIERS.DynamoGateway) dynamo: DynamoGateway) {
        this._dynamo = dynamo;
    }

    public async connect(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse> {
        console.log("ON CONECTED",event);
        if (!event.requestContext.connectionId) return {statusCode:500, body: "Error on conect"};
        
        const userSession: UserSession = {
            socketId: event.requestContext.connectionId,
            gameId: event.body.data.gameId || "",
            nickName: event.body.data.nickName,
            host: false,
            conected: Date.now(),
        }

        if (event.body.action === SocketActionEnum.CREATE_SESSION) {
            userSession.gameId = this._generateGameId();
            userSession.host = true;
        
        }
        const dynamoResponse = await this._dynamo.put(userSession, "table");
        console.log("dynamo response", dynamoResponse);
        return {statusCode:200, body: JSON.stringify(userSession)};
    }

    private _generateGameId(): string {
        return "game_id" + Math.random();
    }
}


