import CONTAINER from '../constant/Container';
import IDENTIFIERS from '../constant/Identifiers';
import { ISocketService } from '../infraestructure/ISocketService';
import 'source-map-support/register';

const CORE:ISocketService = CONTAINER.get<ISocketService>(IDENTIFIERS.SocketService);
const handler = async (event) => {
    console.log("INPUT ",event);    
    return CORE.Disconnect(event);
  }
export const main = handler;
