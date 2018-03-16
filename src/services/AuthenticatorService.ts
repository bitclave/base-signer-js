import { ServiceRpcMethods } from './ServiceRpcMethods';
import KeyPair from '../helpers/keypair/KeyPair';
import KeyPairFactory from '../helpers/keypair/KeyPairFactory';
import Auth from '../models/Auth';
import PassPhrase from '../models/PassPhrase';
import Pair from '../models/Pair';

/**
 * This class only for demo and for debug flavor
 */
export default class AuthenticatorService implements ServiceRpcMethods {

    private keyPair: KeyPair;

    constructor() {
        this.keyPair = KeyPairFactory.getDefaultKeyPairCreator().createKeyPair('AuthenticatorService');
    }

    getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('generateAccessToken', new Pair(this.generateAccessToken.bind(this), new PassPhrase()));

        return map;
    }

    public generateAccessToken(passPhrase: PassPhrase): Auth {
        let accessToken: string = this.makeClearAccessToken();
        accessToken += this.keyPair.signMessage(accessToken);

        return new Auth(passPhrase.pass, 'http://localhost/', accessToken);
    }

    public get address(): string {
        return this.keyPair.address;
    }

    private makeClearAccessToken(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 32; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

}