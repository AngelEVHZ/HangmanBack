import { inject, injectable } from "inversify";
import { GenericResponse, IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import "reflect-metadata";
import { ISocketService } from "../infraestructure/ISocketService";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import IDENTIFIERS from "../constant/Identifiers";
import { DynamoGateway } from "../gateway/DynamoGateway";
import { UserSession } from "../types/UserSession";
import { CreateSessionRequest, SocketAction, NotifyAll, NotifyHost } from "../types/SocketAction";
import { get } from "lodash";
import { ERRORS, ErrorEnum } from "../constant/ErrorsEnum";
import { ISocketGateway } from "../infraestructure/ISocketGateway";
import { SocketGateway } from "../gateway/SocketGateway";
import { NotifyResponse } from "../types/NotifyResponse";
import { NotifyActionEnum } from "../constant/NotifyActionEnum";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoIndexEnum, DynamoTableEnum } from "../constant/TableEnum";
import { MAX_PLAYERS, CODE_SIZE } from "../constant/GameLogic";
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
    public async Disconnect(event: IAPIGatewayWebSocketEvent): Promise<GenericResponse> {
        console.log("ON Disconnect", event);
        const socketId = get(event, "requestContext.connectionId");
        console.log("socket id");
        try {
            if (socketId) {
                const userSession: UserSession = await this._dynamo.getItem<UserSession>(DynamoIndexEnum.SOCKET_ID, socketId, DynamoTableEnum.USER_SESSION);
                if (userSession) {
                    const response = await this._dynamo.delete(DynamoIndexEnum.SOCKET_ID, socketId, DynamoTableEnum.USER_SESSION);
                    const conectedUsers: UserSession[] = await this._getUsersInGame(userSession.gameId);
                    await this._notifyUsers(conectedUsers, NotifyActionEnum.USER_DISCONNECTED, conectedUsers);
                    if (!response) throw ErrorEnum.E003;
                }
            }
        } catch (error) {
            console.log("Disconnect FINAL ERROR", error);
            return ERRORS[error];
        }
        return { statusCode: 200, body: "OK Disconnect" };
    }

    public async ConneconnectSession(event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>): Promise<GenericResponse> {
        console.log("ON ConneconnectSessionct", event);
        try {
            if (!get(event, "requestContext.connectionId")) throw ErrorEnum.E001;

            const userSession: UserSession = {
                socketId: event.requestContext.connectionId,
                gameId: get(event, "body.data.gameId"),
                nickName: event.body.data.nickName,
                host: false,
                conected: Date.now(),
            };
            if (!userSession.gameId) {
                userSession.gameId = this._generateGameId();
                userSession.host = true;
                const dynamoResponse = await this._dynamo.put(userSession, DynamoTableEnum.USER_SESSION);
                if (!dynamoResponse) throw ErrorEnum.E003;
                const notified = await this._notifyUser(userSession.socketId, NotifyActionEnum.SESSION_CREATED, userSession)
                if (!notified) throw ErrorEnum.E003;
            } else {
                if (userSession.gameId.length != CODE_SIZE) {
                    throw ErrorEnum.E006;
                }
                const conectedUsers: UserSession[] = await this._getUsersInGame(userSession.gameId);
                if (conectedUsers.length >= MAX_PLAYERS) throw ErrorEnum.E004;
                if (!this._getHost(conectedUsers)) {
                    throw ErrorEnum.E005;
                }
                const dynamoResponse = await this._dynamo.put(userSession, DynamoTableEnum.USER_SESSION);
                if (!dynamoResponse) throw ErrorEnum.E003;
                conectedUsers.push(userSession);
                const notified = await this._notifyUsers(conectedUsers, NotifyActionEnum.USER_JOIN, conectedUsers);
                if (!notified) throw ErrorEnum.E003;
            }
        } catch (error) {
            console.log("ConneconnectSessionct FINAL ERROR", error);
            return ERRORS[error];
        }
        return { statusCode: 200, body: "success" };
    }

    private _validateGameId(gameId: string) {
        if (!gameId || gameId.length != CODE_SIZE) {
            throw ErrorEnum.E006;
        }
        return true;
    }


    public async NotifyAll(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>): Promise<GenericResponse> {
        console.log("ON NotifyAll", event);
        try {
            this._validateGameId(get(event, "body.data.gameId", ""));
            const conectedUsers: UserSession[] = await this._getUsersInGame(event.body.data.gameId);
            await this._notifyUsers(conectedUsers, event.body.data.action, event.body.data.notification);
        } catch (error) {
            console.log("ConneconnectSessionct FINAL ERROR", error);
            return ERRORS[error];
        }
        return { statusCode: 200, body: "OK NotifyAll" };
    }

    public async NotifyHost(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyHost>>): Promise<GenericResponse> {
        console.log("ON NotifyHost", event);
        try {
            const data = event.body;
            if (!get(data, "data.socketId")) throw ErrorEnum.E001;
            await this._notifyUser(data.data.socketId, data.data.action, data.data.notification);
        } catch (error) {
            console.log("ConneconnectSessionct FINAL ERROR", error);
            return ERRORS[error];
        }
        return { statusCode: 200, body: "OK NotifyHost" };
    }

    public async NotifyPlayers(event: IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>): Promise<GenericResponse> {
        console.log("ON NotifyPlayers", event);
        try {
            this._validateGameId(get(event, "body.data.gameId", ""));
            const conectedUsers: UserSession[] = await this._getUsersInGame(event.body.data.gameId);
            await this._notifyUsers(this._getPlayers(conectedUsers), event.body.data.action, event.body.data.notification);
        } catch (error) {
            console.log("ConneconnectSessionct FINAL ERROR", error);
            return ERRORS[error];
        }
        return { statusCode: 200, body: "OK NotifyPlayers" };
    }


    private _generateGameId(): string {
        return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    }

    private _getHost(users: UserSession[]) {
        return users.find((item) => item.host)
    }
    private _getPlayers(users: UserSession[]) {
        return users.filter((item) => !item.host)
    }

    private async _notifyUser(socketId: string, action: NotifyActionEnum, notification: any) {
        const notify: NotifyResponse<UserSession> = {
            action,
            data: notification,
        }
        return await this._socket.sendMessage<any>(socketId, notify);
    }

    private async _getUsersInGame(gameId: string): Promise<UserSession[]> {
        const conectedUsers: UserSession[] = await this._dynamo.query<UserSession>(this._queryByGameId(gameId));
        console.log("_getUsersInGame", conectedUsers);
        return conectedUsers;
    }

    private async _notifyUsers(conectedUsers: UserSession[], action: NotifyActionEnum, notification: any) {
        const notify: NotifyResponse<any> = {
            action,
            data: notification,
        }
        console.log("_notifyUsersInGame", notify);
        for (let user of conectedUsers) {
            await this._socket.sendMessage<any>(user.socketId, notify);
        }
        return true;
    }

    private _queryByGameId(gameId: string): DocumentClient.QueryInput {
        return {
            ExpressionAttributeNames: {
                "#gameId": "gameId"
            },
            ExpressionAttributeValues: {
                ":gameId": gameId,
            },
            IndexName: DynamoIndexEnum.GAME_ID,
            TableName: DynamoTableEnum.USER_SESSION,
            KeyConditionExpression: "#gameId = :gameId",
        };
    }
}


