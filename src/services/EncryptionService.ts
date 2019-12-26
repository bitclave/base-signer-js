import JsonUtils from '../helpers/JsonUtils';
import Client from '../models/Client';
import DecryptEncryptFields from '../models/DecryptEncryptFields';
import EncryptMessage from '../models/EncryptMessage';
import Pair from '../models/Pair';
import PermissionsFields from '../models/PermissionsFields';
import { ServiceRpcMethods } from './ServiceRpcMethods';

export default class EncryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('encryptMessage', new Pair(this.encryptMessage.bind(this), EncryptMessage));
        map.set('encryptFields', new Pair(this.encryptFields.bind(this), DecryptEncryptFields));
        map.set('encryptPermissionsFields', new Pair(this.encryptPermissionsFields.bind(this), PermissionsFields));
        map.set(
            'encryptFieldsWithPermissions',
            new Pair(this.encryptFieldsWithPermissions.bind(this), PermissionsFields)
        );

        return map;
    }

    public encryptMessage(encryptMessage: EncryptMessage, client: Client | undefined): string {
        if (client) {
            return client.keyPair.encryptMessage(encryptMessage.recipientPk, encryptMessage.message);
        }
        throw new Error('client not found!');
    }

    public encryptFields(data: DecryptEncryptFields, client: Client | undefined): any {
        if (client) {
            const resultMap: Map<string, string> = client.keyPair.encryptFields(JsonUtils.jsonToMap(data.fields));

            return JsonUtils.mapToJson(resultMap);
        }
        throw new Error('client not found!');
    }

    public encryptPermissionsFields(permissionsFields: PermissionsFields, client: Client | undefined): string {
        if (client) {
            return client.keyPair.encryptPermissionsFields(
                permissionsFields.recipient, JsonUtils.jsonToMap(permissionsFields.data)
            );
        }
        throw new Error('client not found!');
    }

    public encryptFieldsWithPermissions(
        permissionsFields: PermissionsFields,
        client: Client | undefined
    ): Map<string, string> {
        if (client) {
            const resultMap: Map<string, string> = client.keyPair.encryptFieldsWithPermissions(
                permissionsFields.recipient, JsonUtils.jsonToMap(permissionsFields.data)
            );

            return JsonUtils.mapToJson(resultMap);
        }
        throw new Error('client not found!');
    }
}
