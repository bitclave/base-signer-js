import Auth from '../models/Auth';
import RpcToken, { TokenType } from '../models/RpcToken';
import { KeyPair } from './keypair/KeyPair';

export default class Authenticator {

    private static EXPIRE_TOKEN_HOURS_MS = 5 * 60 * 60 * 1000;

    constructor(private readonly keyPair: KeyPair, private readonly signerPublicKey: string) {
    }

    public prepareLocalAuth(passPhrase: string): RpcToken {
        const expireDate = new Date(new Date().getTime() + Authenticator.EXPIRE_TOKEN_HOURS_MS);

        const auth: Auth = new Auth(passPhrase, new Set<string>(['http://localhost']), expireDate);

        return new RpcToken(this.keyPair.encryptMessage(this.signerPublicKey, JSON.stringify(auth)), TokenType.BASIC);
    }
}
