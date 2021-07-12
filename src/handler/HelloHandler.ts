import CONTAINER from '../constant/Container';
import IDENTIFIERS from '../constant/Identifiers';
import { IHelloService } from '../infraestructure/IHelloService';
import 'source-map-support/register';
import { JSON_BODY_MIDDLEWARE } from '../libs/lambda';

const CORE:IHelloService = CONTAINER.get<IHelloService>(IDENTIFIERS.HelloService);
const handler = async (event) => {
    console.log("INPUT",event);
    JSON_BODY_MIDDLEWARE(event);
    
    return CORE.hello(event);
  }
export const main = handler;
