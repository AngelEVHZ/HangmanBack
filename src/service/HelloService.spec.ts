import { createSandbox, SinonSandbox } from "sinon";
import {expect} from "chai";
import IDENTIFIERS from "src/constant/Identifiers";
import { IHelloService } from "src/infraestructure/IHelloService";
import CONTAINER from "../constant/Container";

describe("HelloSerive", () => {
    let service: IHelloService;
    let box: SinonSandbox;

    beforeEach(() => {
        box = createSandbox();
        CONTAINER.snapshot();
    });

    afterEach(() => {
        box.restore();
        CONTAINER.restore();
    });

    it("Test hello, succes", (done: Mocha.Done) => {
        service = CONTAINER.get<IHelloService>(IDENTIFIERS.HelloService);
        const response = service.hello();
        expect(response).to.be.equal("HELLOOOO BITCHERS");
        done();
    });

});