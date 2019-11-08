import { MessageDecrypt } from './MessageDecrypt';
import { MessageEncrypt } from './MessageEncrypt';
import { MessageSigner } from './MessageSigner';
import { OriginConfigurator } from './OriginConfigurator';

export interface KeyPair extends MessageSigner, MessageEncrypt, MessageDecrypt, OriginConfigurator {

    getPrivateKey(): string;

    getPublicKey(): string;

    getAddress(): string;
}
