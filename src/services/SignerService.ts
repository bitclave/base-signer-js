import SignMessage from '../models/SignMessage';
import Client from '../models/Client';
import { ServiceRpcMethods } from './ServiceRpcMethods';
import Pair from '../models/Pair';

export default class SignerService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('signMessage', new Pair(this.signMessage.bind(this), new SignMessage()));

        return map;
    }

    public signMessage(signMessage: SignMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.signMessage(signMessage.message);
        }

        throw 'client not found';
    }

}