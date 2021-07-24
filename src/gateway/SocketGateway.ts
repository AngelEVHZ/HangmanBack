import { injectable } from "inversify";
import "reflect-metadata";
import { ISocketGateway } from "../infraestructure/ISocketGateway";
import { PostToConnectionRequest, DeleteConnectionRequest } from "aws-sdk/clients/apigatewaymanagementapi";
import { ApiGatewayManagementApi } from "aws-sdk";

@injectable()
export class SocketGateway implements ISocketGateway {

    private readonly _client: ApiGatewayManagementApi;

    constructor() {
        this._client = new ApiGatewayManagementApi(
            {
                apiVersion: "2018-11-29",
                endpoint: process.env.SOCKET_ENDPOINT,
            }
        );
    }

    public async close(connectionId: string): Promise<boolean> {
        const params: DeleteConnectionRequest = {
            ConnectionId: connectionId
        }
        try {
            await this._client.deleteConnection(params).promise();
            return true;
        } catch (error) {
            console.log("SocketGateway Error", error);
        }
        return false;
    }

    public async sendMessage<T>(connectionId: string, event: T): Promise<boolean> {
        const params: PostToConnectionRequest = {
            ConnectionId: connectionId,
            Data: JSON.stringify(event)
        }
        try {
            await this._client.postToConnection(params).promise();
            return true;
        } catch (error) {
            console.log("SocketGateway Error", error);
        }
        return false;
    }
}


