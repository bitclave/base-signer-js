//declare function require(arg:string): any;
import ClientService from './services/ClientService';
import SignerService from './services/SignerService';
import { KeyPairHelper } from './helpers/keypair/KeyPairHelper';
import KeyPairFactory from './helpers/keypair/KeyPairFactory';
import { ServiceRpcMethods } from './services/ServiceRpcMethods';
import AuthenticatorService from './services/AuthenticatorService';
import Pair from './models/Pair';
import Client from './models/Client';
import AccessToken from './models/AccessToken';
import EncryptionService from './services/EncryptionService';
import DecryptionService from './services/DecryptionService';
import JsonRpcWs = require('json-rpc-ws');

export default class Signer {

    private clientService: ClientService;
    private signerService: SignerService;
    public encryptionService: EncryptionService;
    public decryptionService: DecryptionService;

    constructor() {
        const keyPairHelper: KeyPairHelper = KeyPairFactory.getDefaultKeyPairCreator();

        const authenticator: AuthenticatorService = new AuthenticatorService();
        this.clientService = new ClientService(keyPairHelper, authenticator.address);
        this.signerService = new SignerService();
        this.encryptionService = new EncryptionService();
        this.decryptionService = new DecryptionService();

        const server = JsonRpcWs.createServer();

        const methods = this.mergeRpcMethods(
            authenticator,
            this.clientService,
            this.signerService,
            this.encryptionService,
            this.decryptionService
        );

        for (let key in methods) {
            server.expose(key, methods[key]);
        }

        server.start({port: 3545}, () => {
            console.log('Signer running on port 3545');
        });
    }

    private mergeRpcMethods(...rpcMethods: Array<ServiceRpcMethods>): object {
        const result: any = {};

        for (let service of rpcMethods) {
            const map: Map<string, Pair<Function, Object>> = service.getPublicMethods();
            map.forEach((value, key) => {
                result[key] = (args: any, callback) => {
                    return new Promise(resolve => {
                        let client: Client | undefined = undefined;
                        let arg: any = args.length > 0 ? args[0] : {};
                        const model: any = Object.assign(value.second, JSON.parse(arg));

                        if (model instanceof AccessToken) {
                            client = this.clientService.getClient(model.accessToken);
                        }

                        const methodResult = value.first(model, client);
                        resolve(methodResult);

                    }).then((result) => callback(result));
                };
            });
        }

        return result;
    }

}

new Signer();
