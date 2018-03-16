import Client from '../models/Client';
import Auth from '../models/Auth';
import { KeyPairHelper } from '../helpers/keypair/KeyPairHelper';
import KeyPair from '../helpers/keypair/KeyPair';
import { ServiceRpcMethods } from './ServiceRpcMethods';
import Pair from '../models/Pair';

export default class ClientService implements ServiceRpcMethods {

    /**
     * string - hash from accessToken
     */
    private clients: Map<string, Client> = new Map();
    private keyPairHelper: KeyPairHelper;
    private authenticatorAddress: string;

    constructor(keyPairHelper: KeyPairHelper, authenticatorAddress: string) {
        this.keyPairHelper = keyPairHelper;
        this.authenticatorAddress = authenticatorAddress;
    }

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object>> = new Map();
        map.set('registerClient', new Pair(this.registerClient.bind(this), new Auth()));

        return map;
    }

    public registerClient(auth: Auth, client: Client | undefined): string {
        const validSig = KeyPair.checkSigMessage(
            auth.getClearAccessToken(),
            this.authenticatorAddress,
            auth.getAccessTokenSig()
        );

        if (!validSig ||
            auth.baseUrl === null ||
            (auth.baseUrl.indexOf('https://') == -1 && auth.baseUrl.indexOf('http://') == -1) ||
            auth.passPhrase == null ||
            auth.passPhrase.length < 5
        ) {
            throw 'Wrong auth data!';
        }

        const keyPair: KeyPair = this.keyPairHelper.createKeyPair(auth.passPhrase);

        this.clients.set(auth.accessToken, new Client(keyPair, auth.baseUrl));

        return keyPair.getPublicKey();
    }

    public getClient(accessToken: string): Client | undefined {
        return this.clients.get(accessToken);
    }

}
