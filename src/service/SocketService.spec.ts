import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { expect, use } from "chai";
import IDENTIFIERS from "src/constant/Identifiers";
import CONTAINER from "../constant/Container";
import { IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import { Mock } from "ts-mockery";
import { ISocketService } from "infraestructure/ISocketService";
import { CreateSessionRequest, NotifyAll, NotifyHost, SocketAction } from "types/SocketAction";
import { SocketActionEnum } from "constant/SocketActionEnum";
import { DynamoGateway } from "gateway/DynamoGateway";
import { SocketGateway } from "gateway/SocketGateway";
import * as sinonChai from "sinon-chai";
import { IDynamoGateway } from "infraestructure/IDynamoGateway";
use(sinonChai)

describe("SocketService", () => {
    let service: ISocketService;
    let box: SinonSandbox;
    let event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>;
    let dynamoPutStub: SinonStub;
    let socketNotifyStub: SinonStub;
    let socketCloseStub: SinonStub;
    let dynamoQueryStub: SinonStub;
    let dynamoDeleteStub: SinonStub;
    let dynamoGetStub: SinonStub;
    let dynamoUpdateStub: SinonStub;

    beforeEach(() => {
        box = createSandbox();
        CONTAINER.snapshot();
        dynamoPutStub = box.stub().returns(true);
        dynamoDeleteStub = box.stub().returns(true);
        dynamoUpdateStub = box.stub().returns(true);
        socketNotifyStub = box.stub().returns(true);
        socketCloseStub = box.stub().returns(true);

        dynamoGetStub = box.stub().returns(
            {
                socketId: "socketId",
                gameId: "gameId",
                nickName: "nickName",
                host: false,
                conected: 0,
                playerId:"id",
            }
        );
        dynamoQueryStub = box.stub().returns([
            {
                socketId: "socketId",
                gameId: "gameId",
                nickName: "nickName",
                host: false,
                conected: 0,
                playerId:"id",
            },
            {
                socketId: "socketId2",
                gameId: "gameId",
                nickName: "nickName2",
                host: true,
                conected: 0,
                playerId:"id",
            }
        ]);
        event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>>({
            requestContext: { connectionId: "conection-id" },
            body: {
                action: SocketActionEnum.CONNECT_SESSION,
                data: {
                    nickName: "nick",
                }
            }
        });
    });

    afterEach(() => {
        box.restore();
        CONTAINER.restore();
    });

    it("Test connectSession, succes", async () => {
        process.env.CREATE_SESSION = "table-arn-session"
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            put: dynamoPutStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.ConneconnectSession(event);
        console.log("FINAL RESPONSE", response);
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.equal("success");

        expect(dynamoPutStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.calledOnce;
    });

    it("Test Join connectSession, succes", async () => {
        process.env.CREATE_SESSION = "table-arn-session"
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            put: dynamoPutStub,
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        event.body.data.gameId = "111111111111";
        const response = await service.ConneconnectSession(event);
        console.log("FINAL RESPONSE", response);
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.equal("success");
        expect(dynamoPutStub).to.have.been.calledOnce;
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(3);
        console.log(socketNotifyStub.args[0][1]);
    });

    it("Test Join connectSession, session is Full, succes", async () => {
        process.env.CREATE_SESSION = "table-arn-session"
        dynamoQueryStub = box.stub().returns([
            {
                socketId: "socketId",
                gameId: "gameId",
                nickName: "nickName",
                host: false,
                conected: 0,
                playerId:"id",
            },
            {
                socketId: "socketId2",
                gameId: "gameId",
                nickName: "nickName2",
                host: true,
                conected: 0,
                playerId:"id",
            },
            {
                socketId: "socketId2",
                gameId: "gameId",
                nickName: "nickName2",
                host: false,
                conected: 0,
                playerId:"id",
            },
            {
                socketId: "socketId2",
                gameId: "gameId",
                nickName: "nickName2",
                host: false,
                conected: 0,
                playerId:"id",
            }
        ]);
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            put: dynamoPutStub,
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
            close: socketCloseStub,
        }));
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        event.body.data.gameId = "111111111111";
        const response = await service.ConneconnectSession(event);
        console.log("FINAL RESPONSE", response);
        expect(response.statusCode).to.be.equal(400);
        expect(response.body).to.be.equal("The session is full");
        expect(dynamoPutStub).not.to.have.been.calledOnce;
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).not.to.have.been.called;
        expect(socketCloseStub).to.have.been.calledOnce;
       
    });

    it("Test connect, succes", async () => {
        const event = Mock.of<IAPIGatewayWebSocketEvent>({
            requestContext: { connectionId: "conection-id" },
        });
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.Connect(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK conected");
    });

    it("Test NotifyAll, succes", async () => {
        const event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>>({
            requestContext: { connectionId: "conection-id" },
            body: {
                action: SocketActionEnum.NOTIFY_ALL,
                data: {
                    gameId: "111111111111",
                    notification: {},
                }
            }
        });
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));

        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.NotifyAll(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK NotifyAll");
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(2);
    });

    it("Test NotifyAll, Exclude owner succes", async () => {
        const event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>>({
            requestContext: { connectionId: "conection-id" },
            body: {
                action: SocketActionEnum.NOTIFY_ALL,
                data: {
                    excludeOwner: true,
                    gameId: "111111111111",
                    notification: {},
                }
            }
        });
        dynamoQueryStub = box.stub().returns([
            {
                socketId: "conection-id",
                gameId: "gameId",
                nickName: "nickName",
                host: false,
                conected: 0,
                playerId:"id",
            },
            {
                socketId: "socketId2",
                gameId: "gameId",
                nickName: "nickName2",
                host: true,
                conected: 0,
                playerId:"id",
            }
        ]);
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));

        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.NotifyAll(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK NotifyAll");
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(1);
    });

    it("Test NotifyPlayers, succes", async () => {
        const event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<NotifyAll>>>({
            requestContext: { connectionId: "conection-id" },
            body: {
                action: SocketActionEnum.NOTIFY_PLAYERS,
                data: {
                    gameId: "111111111111",
                    notification: {},
                }
            }
        });
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));

        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.NotifyPlayers(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK NotifyPlayers");
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(1);
    });

    it("Test NotifyHost, succes", async () => {
        const event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<NotifyHost>>>({
            requestContext: { connectionId: "conection-id" },
            body: {
                action: SocketActionEnum.NOTIFY_HOST,
                data: {
                    socketId: "111111111111",
                    notification: {},
                }
            }
        });
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));

        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.NotifyHost(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK NotifyHost");
        expect(socketNotifyStub).to.have.been.callCount(1);
    });

    it("Test disconnect, succes", async () => {
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            delete: dynamoDeleteStub,
            getItem: dynamoGetStub,
            query: dynamoQueryStub,
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));
        const event = Mock.of<IAPIGatewayWebSocketEvent>({
            requestContext: { connectionId: "conection-id" },
        });
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.Disconnect(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK Disconnect");
        expect(dynamoDeleteStub).to.have.been.calledOnce;
        expect(dynamoGetStub).to.have.been.calledOnce;
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(2);
    });

    it("Test disconnect host, should change host, succes", async () => {
        dynamoGetStub = box.stub().returns(
            {
                socketId: "socketId",
                gameId: "gameId",
                nickName: "nickName",
                host: true,
                conected: 0,
                playerId:"id",
            }
        );
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<IDynamoGateway>({
            delete: dynamoDeleteStub,
            getItem: dynamoGetStub,
            query: dynamoQueryStub,
            updateUserHost: dynamoUpdateStub
            
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));
        const event = Mock.of<IAPIGatewayWebSocketEvent>({
            requestContext: { connectionId: "conection-id" },
        });
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.Disconnect(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK Disconnect");
        expect(dynamoDeleteStub).to.have.been.calledOnce;
        expect(dynamoGetStub).to.have.been.calledOnce;
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(dynamoUpdateStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(2);
    });

    it("Test disconnect host with no more users, should not change host, succes", async () => {
        dynamoGetStub = box.stub().returns(
            {
                socketId: "socketId",
                gameId: "gameId",
                nickName: "nickName",
                host: true,
                conected: 0,
                playerId:"id",
            }
        );
        dynamoQueryStub = box.stub().returns([]);
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<IDynamoGateway>({
            delete: dynamoDeleteStub,
            getItem: dynamoGetStub,
            query: dynamoQueryStub,
            updateUserHost: dynamoUpdateStub
            
        }));
        CONTAINER.rebind(IDENTIFIERS.SocketGateway).toConstantValue(Mock.of<SocketGateway>({
            sendMessage: socketNotifyStub,
        }));
        const event = Mock.of<IAPIGatewayWebSocketEvent>({
            requestContext: { connectionId: "conection-id" },
        });
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.Disconnect(event);
        console.log("FINAL RESPONSE", response);
        expect(response.body).to.be.equal("OK Disconnect");
        expect(dynamoDeleteStub).to.have.been.calledOnce;
        expect(dynamoGetStub).to.have.been.calledOnce;
        expect(dynamoQueryStub).to.have.been.calledOnce;
        expect(dynamoUpdateStub).not.to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.callCount(0);
    });
});