import { StringUtils } from '../utils/StringUtils';
import Auth from '../models/Auth';
import { KeyPair } from './keypair/KeyPair';

export default class Authenticator {

    private keyPair: KeyPair;

    constructor(keyPair: KeyPair) {
        this.keyPair = keyPair;
    }

    public prepareAuth(passPhrase: string): Auth {
        let accessToken: string = StringUtils.generateString();
        accessToken += this.keyPair.signMessage(accessToken);

        return new Auth(passPhrase, accessToken, 'http://localhost');
    }

}
