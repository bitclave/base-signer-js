import { ServiceRpcMethods } from './ServiceRpcMethods';
import Client from '../models/Client';
import Pair from '../models/Pair';
import DecryptMessage from '../models/DecryptMessage';

export default class DecryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('decryptMessage', new Pair(this.decryptMessage.bind(this), new DecryptMessage()));

        return map;
    }

    public decryptMessage(decryptMessage: DecryptMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.decryptMessage(decryptMessage.senderPk, decryptMessage.encrypted);
        }
        throw 'client not found!';
    }

}
