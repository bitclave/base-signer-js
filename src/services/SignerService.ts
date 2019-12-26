import CheckSignature from '../models/CheckSignature';
import Client from '../models/Client';
import Pair from '../models/Pair';
import SignMessage from '../models/SignMessage';
import { ServiceRpcMethods } from './ServiceRpcMethods';

export default class SignerService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('signMessage', new Pair(this.signMessage.bind(this), SignMessage));
        map.set('checkSig', new Pair(this.checkSig.bind(this), CheckSignature));

        return map;
    }

    public signMessage(signMessage: SignMessage, client: Client | undefined): string {
        if (client) {
            return client.keyPair.signMessage(signMessage.message);
        }

        throw new Error('client not found');
    }

    public checkSig(signature: CheckSignature, client: Client | undefined): boolean {
        if (client) {
            return client.keyPair.checkSig(signature.msg, signature.sig);
        }

        throw new Error('client not found');
    }
}
