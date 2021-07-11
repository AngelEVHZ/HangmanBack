import { inject, injectable } from "inversify";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import "reflect-metadata";
import { ISocketService } from "../infraestructure/ISocketService";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import IDENTIFIERS from "../constant/Identifiers";
import { DynamoGateway } from "../gateway/DynamoGateway";
import { UserSession } from "../types/UserSession";
import { CreateSessionRequest, SocketAction } from "../types/SocketAction";
import { get } from "lodash";
import { ERRORS, ErrorEnum } from "../constant/ErrorsEnum";
import { ISocketGateway } from "../infraestructure/ISocketGateway";
import { SocketGateway } from "../gateway/SocketGateway";
import { NotifyResponse } from "../types/NotifyResponse";
import { NotifyActionEnum } from "../constant/NotifyActionEnum";


@injectable()
export class SocketService implements ISocketService {
    private readonly _dynamo: IDynamoGateway;
    private readonly _socket: ISocketGateway;

    constructor(@inject(IDENTIFIERS.DynamoGateway) dynamo: DynamoGateway,
        @inject(IDENTIFIERS.SocketGateway) socket: SocketGateway) {
        this._dynamo = dynamo;
        this._socket = socket;
    }

    public async Connect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse> {
        console.log("ON CONECTED", event);
        return { statusCode: 200, body: "OK conected" };
    }
    public async ConneconnectSessionct(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse> {
        console.log("ON ConneconnectSessionct", event);
        if (!get(event, "requestContext.connectionId")) return ERRORS.E001;
        try {
            const userSession: UserSession = {
                socketId: event.requestContext.connectionId,
                gameId: get(event, "body.data.gameId"),
                nickName: event.body.data.nickName,
                host: false,
                conected: Date.now(),
            }

            if (!userSession.gameId) {
                console.log("NEW GAME ID");
                userSession.gameId = this._generateGameId();
                userSession.host = true;
            }
            console.log("INSERT", userSession);
            const dynamoResponse = await this._dynamo.put(userSession, process.env.USER_SESSION_TABLE);
            if (!dynamoResponse) throw ErrorEnum.E003;

            const notified = userSession.host ? await this._newSessionCreated(userSession) :
                await this._newUserJoined(userSession);
            console.log("NOTIFICAICON ENVIADA",notified);
            if (!notified) throw ErrorEnum.E003;
        } catch (error) {
            console.log("ConneconnectSessionct FINAL ERROR", error);
            return ERRORS[error];
        }

        return { statusCode: 200, body: "success" };
    }

    private _generateGameId(): string {
        return "game_id" + Math.random();
    }

    private async _newSessionCreated(userSession: UserSession) {
        const notify: NotifyResponse<UserSession> = {
            action: NotifyActionEnum.SESSION_CREATED,
            data: userSession,
        }
        return await this._socket.sendMessage<UserSession>(userSession.socketId, notify);
    }
    private async _newUserJoined(userSession: UserSession) {
        console.log(userSession);
        return true;
    }
}


