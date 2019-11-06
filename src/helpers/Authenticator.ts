import Auth from '../models/Auth';
import { AuthData, TokenType } from '../models/AuthData';
import { StringUtils } from '../utils/StringUtils';
import { KeyPair } from './keypair/KeyPair';

export default class Authenticator {

    private static EXPIRE_TOKEN_HOURS_MS = 5 * 60 * 60 * 1000;

    constructor(private readonly keyPair: KeyPair, private readonly signerPublicKey: string) {
    }

    public prepareLocalAuth(passPhrase: string): AuthData {
        let accessToken: string = StringUtils.generateString();
        accessToken += this.keyPair.signMessage(accessToken);

        const expireDate = new Date(new Date().getTime() + Authenticator.EXPIRE_TOKEN_HOURS_MS);

        const auth: Auth = new Auth(accessToken, passPhrase, 'http://localhost', expireDate);
        const encryptedAuth: string = this.keyPair.encryptMessage(this.signerPublicKey, JSON.stringify(auth));

        return new AuthData(TokenType.BASIC, JSON.stringify(encryptedAuth));
    }
}
