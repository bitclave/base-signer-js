import { AssistantNodeRepository, RepositoryStrategyType } from '../assistant/AssistantNodeRepository';
import CryptoUtils from '../CryptoUtils';
import { KeyPair } from './KeyPair';
import KeyPairClient from './KeyPairClient';
import { KeyPairHelper } from './KeyPairHelper';
import KeyPairSimple from './KeyPairSimple';

const bitcore = require('bitcore-lib');

export default class KeyPairHelperImpl implements KeyPairHelper {

    private readonly assistant: AssistantNodeRepository;

    constructor(nodeHost: string) {
        this.assistant = new AssistantNodeRepository(nodeHost, RepositoryStrategyType.Postgres);
    }

    public createSimpleKeyPair(passPhrase: string): KeyPair {
        const privateKey: any = this.generatePrivateKey(passPhrase);

        return new KeyPairSimple(privateKey, privateKey.toPublicKey());
    }

    public createClientKeyPair(
        passPhrase: string,
        origin: string
    ): KeyPair {
        const privateKey: any = this.generatePrivateKey(passPhrase);

        return new KeyPairClient(
            privateKey,
            privateKey.toPublicKey(),
            this.assistant,
            this.assistant,
            origin.replace(/http:\/\/|https:\/\//, ''),
        );
    }

    private generatePrivateKey(passPhrase: string): any {
        const pbkdf2: string = CryptoUtils.PBKDF2(passPhrase, 256);
        const hash: any = bitcore.crypto.Hash.sha256(new bitcore.deps.Buffer(pbkdf2));
        const bn: any = bitcore.crypto.BN.fromBuffer(hash);

        return new bitcore.PrivateKey(bn);
    }
}
