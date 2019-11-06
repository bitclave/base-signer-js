import { AccessTokenValidator } from '../helpers/access/tokens/AccessTokenValidator';
import { KeyPair } from '../helpers/keypair/KeyPair';
import { KeyPairHelper } from '../helpers/keypair/KeyPairHelper';
import AccessToken from '../models/AccessToken';
import { AuthData } from '../models/AuthData';
import Client from '../models/Client';
import ClientData from '../models/ClientData';
import Pair from '../models/Pair';
import { ServiceRpcMethods } from './ServiceRpcMethods';

export default class ClientService implements ServiceRpcMethods {

    private clients: Map<string, Client> = new Map();

    constructor(
        private readonly keyPairHelper: KeyPairHelper,
        private readonly ownKeyPair: KeyPair,
        private readonly tokenValidator: AccessTokenValidator
    ) {
    }

    public getPublicMethods(): Map<string, Pair<() => void, any>> {
        const map: Map<string, Pair<() => void, any>> = new Map();
        map.set('authenticatorRegisterClient', new Pair(this.authenticatorRegisterClient.bind(this), AuthData));
        map.set('checkAccessToken', new Pair(this.checkAccessToken.bind(this), AccessToken));
        map.set('getPublicKey', new Pair(this.getPublicKey.bind(this), null));

        return map;
    }

    public authenticatorRegisterClient(authData: AuthData): string {
        if (this.tokenValidator.validate(authData)) {
            const auth = this.tokenValidator.getAuth(authData);
            const keyPair = this.keyPairHelper.createClientKeyPair(auth.passPhrase, auth.origin);

            const client: Client = new Client(
                auth.accessToken,
                auth.origin,
                auth.expireDate,
                keyPair,
                authData.type
            );

            this.clients.set(auth.accessToken, client);

            return auth.accessToken;
        }

        console.warn('token validation fail');
        throw new Error('Wrong auth token!');
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
}
