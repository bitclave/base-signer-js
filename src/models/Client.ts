import { KeyPair } from '../helpers/keypair/KeyPair';
import AccessData from './AccessData';

export default class Client extends AccessData {

    public readonly keyPair: KeyPair;
    public readonly local: boolean;

    constructor(keyPair: KeyPair,
                local: boolean = false,
                accessToken: string = '',
                origin: string = '',
                expireDate: string = '') {

        super(accessToken, origin, expireDate);

        this.keyPair = keyPair;
        this.local = local;
    }
}
