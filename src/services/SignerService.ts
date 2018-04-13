import SignMessage from '../models/SignMessage';
import Client from '../models/Client';
import { ServiceRpcMethods } from './ServiceRpcMethods';
import Pair from '../models/Pair';
import CheckSignature from '../models/CheckSignature';

export default class SignerService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('signMessage', new Pair(this.signMessage.bind(this), new SignMessage()));
        map.set('checkSig', new Pair(this.checkSig.bind(this), new CheckSignature()));

        return map;
    }

    public signMessage(signMessage: SignMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.signMessage(signMessage.message);
        }

        throw 'client not found';
    }

    public checkSig(signature: CheckSignature, client: Client | undefined): boolean {
        if (client != undefined) {
            return client.keyPair.checkSig(signature.msg, signature.sig);
        }

        throw 'client not found';
    }

}
