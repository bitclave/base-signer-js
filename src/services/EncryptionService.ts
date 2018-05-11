import { ServiceRpcMethods } from './ServiceRpcMethods';
import EncryptMessage from '../models/EncryptMessage';
import Client from '../models/Client';
import Pair from '../models/Pair';
import PermissionsFields from '../models/PermissionsFields';
import DecryptEncryptFields from '../models/DecryptEncryptFields';
import JsonUtils from '../helpers/JsonUtils';

export default class EncryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('encryptMessage', new Pair(this.encryptMessage.bind(this), new EncryptMessage()));
        map.set('encryptFields', new Pair(this.encryptFields.bind(this), new DecryptEncryptFields()));
        map.set('encryptPermissionsFields', new Pair(this.encryptPermissionsFields.bind(this), new PermissionsFields()));

        return map;
    }

    public encryptMessage(encryptMessage: EncryptMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.encryptMessage(encryptMessage.recipientPk, encryptMessage.message);
        }
        throw 'client not found!';
    }

    public encryptFields(data: DecryptEncryptFields, client: Client | undefined): any {
        if (client != undefined) {
            const resultMap: Map<string, string> = client.keyPair.encryptFields(JsonUtils.jsonToMap(data.fields));

            return JsonUtils.mapToJson(resultMap);
        }
        throw 'client not found!';
    }

    public encryptPermissionsFields(permissionsFields: PermissionsFields, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.encryptPermissionsFields(
                permissionsFields.recipient, JsonUtils.jsonToMap(permissionsFields.data)
            );
        }
        throw 'client not found!';
    }

}
