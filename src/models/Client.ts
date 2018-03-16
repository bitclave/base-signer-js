import KeyPair from '../helpers/keypair/KeyPair';

export default class Client {

    keyPair: KeyPair;
    baseUrl: string;

    constructor(keyPair: KeyPair, baseUrl: string) {
        this.keyPair = keyPair;
        this.baseUrl = baseUrl;
    }

}
