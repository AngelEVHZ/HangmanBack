import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { expect } from "chai";
import IDENTIFIERS from "src/constant/Identifiers";

import CONTAINER from "../constant/Container";
import { IAPIGatewayWebSocketEvent } from "../libs/apiGateway";
import { Mock } from "ts-mockery";
import { ISocketService } from "infraestructure/ISocketService";
import { CreateSessionRequest, SocketAction } from "types/SocketAction";
import { SocketActionEnum } from "constant/SocketActionEnum";
import { DynamoGateway } from "gateway/DynamoGateway";

describe("SocketService", () => {
    let service: ISocketService;
    let box: SinonSandbox;
    let event: IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>;
    let dynamoPutStub: SinonStub;

    beforeEach(() => {
        box = createSandbox();
        CONTAINER.snapshot();
        dynamoPutStub = box.stub().returns(true);
        event = Mock.of<IAPIGatewayWebSocketEvent<SocketAction<CreateSessionRequest>>>({
            requestContext:{connectionId:"conection-id"},
            body: {
                action: SocketActionEnum.CREATE_SESSION,
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

    it("Test connect, succes", async () => {
        process.env.CREATE_SESSION = "table-arn-session"
        CONTAINER.rebind(IDENTIFIERS.DynamoGateway).toConstantValue(Mock.of<DynamoGateway>({
            put: dynamoPutStub,
        }));
        service = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
        const response = await service.connect(event);
        console.log("FINAL RESPONSE",response);
        expect(response.statusCode).to.be.deep.equal(200);

    });

});