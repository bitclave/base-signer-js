import { MessageSigner } from './MessageSigner';
import { MessageEncrypt } from './MessageEncrypt';
import { MessageDecrypt } from './MessageDecrypt';

export interface KeyPair extends MessageSigner, MessageEncrypt, MessageDecrypt {

    getPrivateKey(): string;

    getPublicKey(): string

    getAddress(): string;

}
