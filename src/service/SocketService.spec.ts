import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { expect, use } from "chai";
import IDENTIFIERS from "src/constant/Identifiers";
import CONTAINER from "../constant/Container";
import { IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import { Mock } from "ts-mockery";
import { ISocketService } from "infraestructure/ISocketService";
import { CreateSessionRequest, SocketAction } from "types/SocketAction";
import { SocketActionEnum } from "constant/SocketActionEnum";
import { DynamoGateway } from "gateway/DynamoGateway";
import { SocketGateway } from "gateway/SocketGateway";
import * as sinonChai from "sinon-chai";
use(sinonChai)

describe("SocketService", () => {
    let service: ISocketService;
    let box: SinonSandbox;
    let event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>;
    let dynamoPutStub: SinonStub;
    let socketNotifyStub: SinonStub;

    beforeEach(() => {
        box = createSandbox();
        CONTAINER.snapshot();
        dynamoPutStub = box.stub().returns(true);
        socketNotifyStub = box.stub().returns(true);
        event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>>({
            requestContext:{connectionId:"conection-id"},
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
        const response = await service.ConneconnectSessionct(event);
        console.log("FINAL RESPONSE",response);
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.equal("success");

        expect(dynamoPutStub).to.have.been.calledOnce;
        expect(socketNotifyStub).to.have.been.calledOnce;
    });

    it("Test connect, succes", async () => {
        process.env.CREATE_SESSION = "table-arn-session"
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            put: dynamoPutStub,
        }));
        const event = Mock.of<IAPIGatewayWebSocketEvent>({
            requestContext:{connectionId:"conection-id"},
        });
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.Connect(event);
        console.log("FINAL RESPONSE",response);
        expect(response.body).to.be.equal("OK conected");
    });

});