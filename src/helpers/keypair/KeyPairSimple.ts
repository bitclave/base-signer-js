import { AccessRight } from '../../models/Permissions';
import { KeyPair } from './KeyPair';

const ECIES = require('bitcore-ecies');
const Message = require('bitcore-message');
const bitcore = require('bitcore-lib');

export default class KeyPairSimple implements KeyPair {

    protected _privateKey: any;
    protected _publicKey: any;

    public static checkSig(message: string, address: string, signature: string): boolean {
        try {
            return Message(message).verify(address, signature);

        } catch (e) {
            console.warn(e);
            return false;
        }
    }

    constructor(privateKey: any, publicKey: any) {
        this._privateKey = privateKey;
        this._publicKey = publicKey;
    }

    public getPrivateKey(): string {
        return this._privateKey.toString(16);
    }

    public getPublicKey(): string {
        return this._publicKey.toString(16);
    }

    public getAddress(): string {
        return this._privateKey.toAddress().toString(16);
    }

    public signMessage(data: string): string {
        const message = new Message(data);

        return message.sign(this._privateKey);
    }

    public checkSig(data: string, sig: string): boolean {
        try {
            return KeyPairSimple.checkSig(data, this._privateKey.toAddress(), sig);
        } catch (e) {
            return false;
        }
    }

    public encryptMessage(recipientPk: string, message: string): string {
        const ecies: any = new ECIES({noKey: true})
            .privateKey(this._privateKey)
            .publicKey(bitcore.PublicKey.fromString(recipientPk));

        return ecies.encrypt(message)
            .toString('base64');
    }

    public encryptFields(fields: Map<string, string>): Map<string, string> {
        throw new Error('not implemented');
    }

    public encryptPermissionsFields(recipient: string, data: Map<string, AccessRight>): string {
        throw new Error('not implemented');
    }

    public decryptMessage(senderPk: string, encrypted: string): string {
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

    public decryptFields(fields: Map<string, string>): Map<string, string> {
        throw new Error('not implemented');
    }

    public encryptFieldsWithPermissions(recipient: string, data: Map<string, AccessRight>): Map<string, string> {
        throw new Error('not implemented');
    }
}
