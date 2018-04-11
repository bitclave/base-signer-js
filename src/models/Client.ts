import KeyPair from '../helpers/keypair/KeyPair';
import AccessData from './AccessData';
import Permissions from './Permissions';

export default class Client extends AccessData {

    keyPair: KeyPair;
    local: boolean;

    constructor(keyPair: KeyPair,
                local: boolean = false,
                accessToken: string = '',
                origin: string = '',
                expireDate: string = '',
                permissions: Permissions = new Permissions()) {
        super(accessToken, origin, expireDate, permissions);

        this.keyPair = keyPair;
        this.local = local;
    }

}
