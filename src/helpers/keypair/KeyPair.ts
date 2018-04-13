import { MessageSigner } from './MessageSigner';
import { MessageEncrypt } from './MessageEncrypt';
import { MessageDecrypt } from './MessageDecrypt';
import CryptoUtils from '../CryptoUtils';
import bitcore = require('bitcore-lib');
import Message = require('bitcore-message');
import ECIES = require('bitcore-ecies');

export default class KeyPair implements MessageSigner, MessageEncrypt, MessageDecrypt {

    private _privateKey: any;
    private _publicKey: any;

    constructor(privateKey: any, publicKey: any) {
        this._privateKey = privateKey;
        this._publicKey = publicKey;
    }

    get address(): string {
        return this._privateKey.toAddress().toString(16);
    }

    get privateKey(): string {
        return this._privateKey.toString(16);
    }

    get publicKey(): string {
        return this._publicKey.toString(16);
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
            return KeyPair.checkSig(data, this._privateKey.toAddress(), sig);
        } catch (e) {
            return false;
        }
    }

    getPublicKey(): string {
        return this._publicKey.toString(16);
    }

    encryptMessage(recipientPk: string, message: string): string {
        const ecies: any = ECIES()
            .privateKey(this._privateKey)
            .publicKey(bitcore.PublicKey.fromString(recipientPk));

        return ecies.encrypt(message)
            .toString('base64');
    }

    generatePasswordForFiled(fieldName: String): string {
        return CryptoUtils.PBKDF2(
            CryptoUtils.keccak256(this._privateKey.toString(16)) + fieldName.toLowerCase(),
            384
        );
    }

    decryptMessage(senderPk: string, encrypted: string): string {
        try {
            const ecies: any = ECIES()
                .privateKey(this._privateKey)
                .publicKey(bitcore.PublicKey.fromString(senderPk));

            return ecies
                .decrypt(new Buffer(encrypted, 'base64'))
                .toString();

        } catch (e) {
            return encrypted;
        }
    }

}
