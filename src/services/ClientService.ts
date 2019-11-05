import { KeyPair } from '../helpers/keypair/KeyPair';
import { KeyPairHelper } from '../helpers/keypair/KeyPairHelper';
import KeyPairSimple from '../helpers/keypair/KeyPairSimple';
import AccessToken from '../models/AccessToken';
import Auth from '../models/Auth';
import Client from '../models/Client';
import ClientData from '../models/ClientData';
import Pair from '../models/Pair';
import { ServiceRpcMethods } from './ServiceRpcMethods';

const bitcore = require('bitcore-lib');

export default class ClientService implements ServiceRpcMethods {

    private clients: Map<string, Client> = new Map();
    private keyPairHelper: KeyPairHelper;
    private ownKeyPair: KeyPair;
    private authenticatorPK: string;
    private authenticatorAddress: string;

    constructor(keyPairHelper: KeyPairHelper, ownKeyPair: KeyPair, authenticatorPublicKey: string) {
        this.keyPairHelper = keyPairHelper;
        this.ownKeyPair = ownKeyPair;
        this.authenticatorPK = authenticatorPublicKey;
        this.authenticatorAddress = bitcore.PublicKey
            .fromString(authenticatorPublicKey)
            .toAddress()
            .toString(16);
    }

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('registerClient', new Pair(this.registerClient.bind(this), Auth));
        map.set('authenticatorRegisterClient', new Pair(this.authenticatorRegisterClient.bind(this), ''));
        map.set('checkAccessToken', new Pair(this.checkAccessToken.bind(this), AccessToken));
        map.set('getPublicKey', new Pair(this.getPublicKey.bind(this), null));

        return map;
    }

    public authenticatorRegisterClient(encryptedMessage: string): string {
        try {
            const strJsonAuth = this.ownKeyPair.decryptMessage(this.authenticatorPK, encryptedMessage);
            const auth: Auth = Object.assign(new Auth(), JSON.parse(strJsonAuth));

            return this.registerClient(auth);

        } catch (e) {
            console.log(e);
            throw new Error('Wrong auth data!');
        }
    }

    public getPublicKey(): string {
        return this.ownKeyPair.getPublicKey();
    }

    public getClient(accessToken: string): Client | undefined {
        return this.clients.get(accessToken);
    }

    public checkAccessToken(accessToken: AccessToken, client: Client | undefined): ClientData | undefined {
        return client ? ClientData.valueOf(client) : undefined;
    }

    // todo make private
    public registerClient(auth: Auth, local: boolean = false): string {
        const validSig = KeyPairSimple.checkSig(
            auth.getClearAccessToken(),
            this.authenticatorAddress,
            auth.getAccessTokenSig()
        );

        if (!validSig ||
            auth.origin === null ||
            (auth.origin.indexOf('https://') === -1 && auth.origin.indexOf('http://') === -1) ||
            auth.passPhrase == null ||
            auth.passPhrase.length < 5
        ) {
            throw new Error('Wrong auth data!');
        }

        const keyPair: KeyPair = this.keyPairHelper.createClientKeyPair(auth.passPhrase, auth.origin);

        const client: Client = new Client(
            keyPair,
            local,
            auth.accessToken,
            auth.origin,
            auth.expireDate
        );

        this.clients.set(auth.accessToken, client);

        return keyPair.getPublicKey();
    }
}
