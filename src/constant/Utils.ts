import { UserSession, UserSessionResponse } from "../types/UserSession";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoIndexEnum, DynamoTableEnum } from "../constant/TableEnum";

export class Utils
{

    static generateId(size: number): string {
        const origin = 2;
        return Math.random().toString(36).substring(origin, origin + size) +
            Math.random().toString(36).substring(origin, origin + size);
    }

    static getHost(users: UserSession[]) {
        return users.find((item) => item.host)
    }
    static getPlayers(users: UserSession[]) {
        return users.filter((item) => !item.host)
    }

    static getPlayersExcludeOwner(users: UserSession[], sockerId: string) {
        return users.filter((item) => item.socketId != sockerId)
    }


    static queryByGameId(gameId: string): DocumentClient.QueryInput {
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

    static parseArrayToUserResponse(users: UserSession[], playerId: string): UserSessionResponse[]{
        return users.map( (item) => Utils.parseToUserResponse(item, item.playerId == playerId));
    }

    static parseToUserResponse(user: UserSession, owner: boolean): UserSessionResponse{
        return {
            gameId: user.gameId,
            nickName: user.nickName,
            host: user.host,
            playerId: user.playerId,
            owner,
        } as UserSessionResponse;
    }
}