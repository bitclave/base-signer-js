import Client from '../models/Client';
import Auth from '../models/Auth';
import { KeyPairHelper } from '../helpers/keypair/KeyPairHelper';
import KeyPair from '../helpers/keypair/KeyPair';
import { ServiceRpcMethods } from './ServiceRpcMethods';
import Pair from '../models/Pair';
import AccessToken from '../models/AccessToken';
import ClientData from '../models/ClientData';

export default class ClientService implements ServiceRpcMethods {

    /**
     * string - hash from accessToken
     */
    private clients: Map<string, Client> = new Map();
    private keyPairHelper: KeyPairHelper;
    private ownKeyPair: KeyPair;
    private authenticatorAddress: string;

    constructor(keyPairHelper: KeyPairHelper, ownKeyPair: KeyPair, authenticatorAddress: string) {
        this.keyPairHelper = keyPairHelper;
        this.ownKeyPair = ownKeyPair;
        this.authenticatorAddress = authenticatorAddress;
    }

    public getPublicMethods(): Map<string, Pair<Function, Object>> {
        const map: Map<string, Pair<Function, Object | undefined>> = new Map();
        map.set('registerClient', new Pair(this.registerClient.bind(this), new Auth()));
        map.set('authenticatorRegisterClient', new Pair(this.authenticatorRegisterClient.bind(this), ''));
        map.set('checkAccessToken', new Pair(this.checkAccessToken.bind(this), new AccessToken()));
        map.set('getPublicKey', new Pair(this.getPublicKey.bind(this), undefined));

        return map;
    }

    public authenticatorRegisterClient(encryptedMessage: string): string {
        try {
            const strJsonAuth = this.ownKeyPair.decryptMessage(this.authenticatorAddress, encryptedMessage);
            const auth: Auth = Object.assign(new Auth(), JSON.stringify(strJsonAuth));

            return this.registerClient(auth);

        } catch (e) {
            throw 'Wrong auth data!';
        }
    }

    public getPublicKey(): string {
        return this.ownKeyPair.publicKey;
    }

    public getClient(accessToken: string): Client | undefined {
        return this.clients.get(accessToken);
    }

    public checkAccessToken(accessToken: AccessToken, client: Client | undefined): ClientData | undefined {
        return client ? ClientData.valueOf(client) : undefined;
    }

    // todo make private
    public registerClient(auth: Auth, local: boolean = false): string {
        const validSig = KeyPair.checkSigMessage(
            auth.getClearAccessToken(),
            this.authenticatorAddress,
            auth.getAccessTokenSig()
        );

        if (!validSig ||
            auth.origin === null ||
            (auth.origin.indexOf('https://') == -1 && auth.origin.indexOf('http://') == -1) ||
            auth.passPhrase == null ||
            auth.passPhrase.length < 5
        ) {
            throw 'Wrong auth data!';
        }

        const keyPair: KeyPair = this.keyPairHelper.createKeyPair(auth.passPhrase);

        const client: Client = new Client(
            keyPair,
            local,
            auth.accessToken,
            auth.origin,
            auth.expireDate,
            auth.permissions
        );

        this.clients.set(auth.accessToken, client);

        return keyPair.getPublicKey();
    }

}
