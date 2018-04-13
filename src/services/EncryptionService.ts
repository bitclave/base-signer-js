import { ServiceRpcMethods } from './ServiceRpcMethods';
import EncryptMessage from '../models/EncryptMessage';
import Client from '../models/Client';
import FieldPassword from '../models/FieldPassword';
import Pair from '../models/Pair';

export default class EncryptionService implements ServiceRpcMethods {

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('encryptMessage', new Pair(this.encryptMessage.bind(this), new EncryptMessage()));
        map.set('generatePasswordForField', new Pair(this.generatePasswordForField.bind(this), new FieldPassword()));

        return map;
    }

    public encryptMessage(encryptMessage: EncryptMessage, client: Client | undefined): string {
        if (client != undefined) {
            return client.keyPair.encryptMessage(encryptMessage.recipientPk, encryptMessage.message);
        }
        throw 'client not found!';
    }

    public generatePasswordForField(fieldPassword: FieldPassword, client: Client | undefined): string {
        if (client != undefined) {
            const hasPermission = client.permissions.fields.indexOf(fieldPassword.fieldName) > -1
                || client.permissions.fields.indexOf('any') > -1;

            return hasPermission
                ? client.keyPair.generatePasswordForFiled(fieldPassword.fieldName)
                : '';
        }
        throw 'client not found!';
    }

}
