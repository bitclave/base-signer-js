import { ServiceRpcMethods } from './ServiceRpcMethods';
import Client from '../models/Client';
import Pair from '../models/Pair';
import DecryptMessage from '../models/DecryptMessage';
import DecryptEncryptFields from '../models/DecryptEncryptFields';
import JsonUtils from '../helpers/JsonUtils';

export default class DecryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, { new(): any }>> {
        const map: Map<string, Pair<Function, { new(): any }>> = new Map();
        map.set('decryptMessage', new Pair(this.decryptMessage.bind(this), DecryptMessage));
        map.set('decryptFields', new Pair(this.decryptFields.bind(this), DecryptEncryptFields));

        return map;
    }

    public decryptMessage(decryptMessage: DecryptMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.decryptMessage(decryptMessage.senderPk, decryptMessage.encrypted);
        }
        throw 'client not found!';
    }

    public decryptFields(data: DecryptEncryptFields, client: Client | undefined): any {
        if (client != undefined) {
            const resultMap: Map<string, string> =
                client.keyPair.decryptFields(JsonUtils.jsonToMap(data.fields), JsonUtils.jsonToMap(data.passwords));

            return JsonUtils.mapToJson(resultMap);
        }
        throw 'client not found!';
    }

}
