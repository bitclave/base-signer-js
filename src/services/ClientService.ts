import { AccessTokenValidator } from '../helpers/access/tokens/AccessTokenValidator';
import { KeyPair } from '../helpers/keypair/KeyPair';
import { KeyPairHelper } from '../helpers/keypair/KeyPairHelper';
import Client from '../models/Client';
import ClientData from '../models/ClientData';
import Pair from '../models/Pair';
import RpcToken from '../models/RpcToken';
import { LruMap } from '../utils/LruMap';
import { ServiceRpcMethods } from './ServiceRpcMethods';

export default class ClientService implements ServiceRpcMethods {

    private clients: LruMap<string, Client> = new LruMap(5000);

    constructor(
        private readonly keyPairHelper: KeyPairHelper,
        private readonly ownKeyPair: KeyPair,
        private readonly tokenValidator: AccessTokenValidator
    ) {
    }

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('getClientData', new Pair(this.getClientData.bind(this), RpcToken));
        map.set('getPublicKey', new Pair(this.getPublicKey.bind(this), null));

        return map;
    }

    public getPublicKey(): string {
        return this.ownKeyPair.getPublicKey();
    }

    public getClientData(accessToken: RpcToken, client: Client | undefined): ClientData | undefined {
        return client ? ClientData.valueOf(client) : undefined;
    }

    public checkAccessToken(accessToken: RpcToken, origin: string): Client | undefined {
        let client: Client | undefined;

        try {
            client = this.clients.get(accessToken.accessToken) || this.authenticatorRegisterClient(accessToken);

            const clearOrigin = origin.toLowerCase()
                .replace('http://', '')
                .replace('https://', '')
                .replace('www.', '');

            const isValidOrigin = client ? client.checkOrigin(clearOrigin) : false;
            const tokenExpired = client ? client.tokenExpired() : true;

            client = isValidOrigin && !tokenExpired ? client : undefined;

        } catch (e) {
            console.log(e);
            client = undefined;
        }

        return client;
    }

    public authenticatorRegisterClient(token: RpcToken): Client {
        if (this.tokenValidator.validate(token)) {

            const auth = this.tokenValidator.getAuth(token);
            const keyPair = this.keyPairHelper.createClientKeyPair(auth.passPhrase, '');

            keyPair.setAcceptedOrigins(auth.origin);

            const client: Client = new Client(
                auth.origin,
                auth.expireDate,
                keyPair,
                token.tokenType
            );

            this.clients.set(token.accessToken, client, auth.expireDate.getTime());

            return client;
        }

        throw new Error('Wrong auth token!');
    }
}
