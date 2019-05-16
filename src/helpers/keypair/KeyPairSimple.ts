import { KeyPair } from './KeyPair';
import { AccessRight } from '../../models/Permissions';
import bitcore = require('bitcore-lib');
import Message = require('bitcore-message');
import ECIES = require('bitcore-ecies');

export default class KeyPairSimple implements KeyPair {

    protected _privateKey: any;
    protected _publicKey: any;

    constructor(privateKey: any, publicKey: any) {
        this._privateKey = privateKey;
        this._publicKey = publicKey;
    }

    getPrivateKey(): string {
        return this._privateKey.toString(16);
    }

    getPublicKey(): string {
        return this._publicKey.toString(16);
    }

    getAddress(): string {
        return this._privateKey.toAddress().toString(16);
    }

    signMessage(data: string): string {
        const message = new Message(data);

        return message.sign(this._privateKey);
    }

    public static checkSig(message: string, address: string, signature: string): boolean {
        return Message(message).verify(address, signature);
    }

    public checkSig(data: string, sig: string): boolean {
        try {
            return KeyPairSimple.checkSig(data, this._privateKey.toAddress(), sig);
        } catch (e) {
            return false;
        }
    }

    encryptMessage(recipientPk: string, message: string): string {
        const ecies: any = new ECIES({noKey: true})
            .privateKey(this._privateKey)
            .publicKey(bitcore.PublicKey.fromString(recipientPk));

        return ecies.encrypt(message)
            .toString('base64');
    }

    encryptFields(fields: Map<string, string>): Map<string, string> {
        throw new Error('not implemented');
    }

    encryptPermissionsFields(recipient: string, data: Map<string, AccessRight>): string {
        throw new Error('not implemented');
    }

    encryptFieldsWithPermissions(recipient: string, data: Map<string, AccessRight>): Map<string, string> {
        throw new Error('not implemented');
    }

    decryptMessage(senderPk: string, encrypted: string): string {
        try {
            const ecies: any = new ECIES({noKey: true})
                .privateKey(this._privateKey)
                .publicKey(bitcore.PublicKey.fromString(senderPk));

            return ecies
                .decrypt(Buffer.from(encrypted, 'base64'))
                .toString();
        } catch (e) {
            return encrypted;
        }
    }

    decryptFields(fields: Map<string, string>): Map<string, string> {
        throw 'not implemented';
    }

}
