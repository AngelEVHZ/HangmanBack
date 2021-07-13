import CONTAINER from '../constant/Container';
import IDENTIFIERS from '../constant/Identifiers';
import { ISocketService } from '../infraestructure/ISocketService';
import 'source-map-support/register';
import { JSON_BODY_MIDDLEWARE } from '../libs/lambda';

const CORE:ISocketService = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
const handler = async (event) => {
    console.log("INPUT",event);
    JSON_BODY_MIDDLEWARE(event);
    
    return CORE.NotifyPlayers(event);
  }
export const main = handler;
