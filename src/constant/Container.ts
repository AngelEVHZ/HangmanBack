import { Container } from "inversify";
import IDENTIFIERS from "../constant/Identifiers";
import { IHelloService } from "../infraestructure/IHelloService";
import { HelloService } from "../service/HelloService";

var CONTAINER = new Container();
CONTAINER.bind<IHelloService>(IDENTIFIERS.HelloService).to(HelloService);

export default CONTAINER;