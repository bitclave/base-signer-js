import JsonUtils from '../helpers/JsonUtils';
import Client from '../models/Client';
import DecryptEncryptFields from '../models/DecryptEncryptFields';
import DecryptMessage from '../models/DecryptMessage';
import Pair from '../models/Pair';
import { ServiceRpcMethods } from './ServiceRpcMethods';

export default class DecryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('decryptMessage', new Pair(this.decryptMessage.bind(this), DecryptMessage));
        map.set('decryptFields', new Pair(this.decryptFields.bind(this), DecryptEncryptFields));

        return map;
    }

    public decryptMessage(decryptMessage: DecryptMessage, client: Client | undefined): string {
        if (client) {
            return client.keyPair.decryptMessage(decryptMessage.senderPk, decryptMessage.encrypted);
        }
        throw new Error('client not found!');
    }

    public decryptFields(data: DecryptEncryptFields, client: Client | undefined): any {
        if (client) {
            const resultMap: Map<string, string> =
                client.keyPair.decryptFields(JsonUtils.jsonToMap(data.fields), JsonUtils.jsonToMap(data.passwords));

            return JsonUtils.mapToJson(resultMap);
        }
        throw new Error('client not found!');
    }
}
