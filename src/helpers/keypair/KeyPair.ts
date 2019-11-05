import { MessageDecrypt } from './MessageDecrypt';
import { MessageEncrypt } from './MessageEncrypt';
import { MessageSigner } from './MessageSigner';

export interface KeyPair extends MessageSigner, MessageEncrypt, MessageDecrypt {

    getPrivateKey(): string;

    getPublicKey(): string;

    getAddress(): string;
}
