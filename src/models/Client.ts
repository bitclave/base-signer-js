import { KeyPair } from '../helpers/keypair/KeyPair';
import AccessData from './AccessData';
import { TokenType } from './AuthData';

export default class Client extends AccessData {

    public readonly keyPair: KeyPair;
    public readonly type: TokenType;

    constructor(accessToken: string, origin: Set<string>, expireDate: Date, keyPair: KeyPair, type: TokenType) {
        super(accessToken, origin, expireDate);

        this.keyPair = keyPair;
        this.type = type;
    }

    public checkOrigin(origin: string): boolean {
        return this.origin.has('*') || this.origin.has(origin.toLowerCase());
    }

    public tokenExpired(): boolean {
        return this.expireDate.getTime() <= new Date().getTime();
    }
}
