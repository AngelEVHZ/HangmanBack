import { createSandbox, SinonSandbox } from "sinon";
import {expect} from "chai";
import IDENTIFIERS from "src/constant/Identifiers";
import { IHelloService } from "src/infraestructure/IHelloService";
import CONTAINER from "../constant/Container";
import { IAPIGatewayEvent } from "../libs/apiGateway";
import {Mock} from "ts-mockery";

describe("HelloSerive", () => {
    let service: IHelloService;
    let box: SinonSandbox;
    let event: IAPIGatewayEvent<any>;

    beforeEach(() => {
        box = createSandbox();
        CONTAINER.snapshot();

        event = Mock.of<IAPIGatewayEvent<any>> ({
            body:{
                name: "angel",
            }
        });
    });

    afterEach(() => {
        box.restore();
        CONTAINER.restore();
    });

    it("Test hello, succes", (done: Mocha.Done) => {
        service = CONTAINER.get<IHelloService>(IDENTIFIERS.HelloService);
        const response = service.hello(event);
        const expectedResponse = {statusCode: 200, body: JSON.stringify("hola angel")};
        expect(response).to.be.deep.equal(expectedResponse);
        done();
    });

});