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
import KeyPair from './helpers/keypair/KeyPair';
import ArgumentUtils from './utils/ArgumentUtils';
import Auth from './models/Auth';
import PassPhrase from './models/PassPhrase';

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();

export default class Signer {

    public encryptionService: EncryptionService;
    public decryptionService: DecryptionService;

    private authenticator: AuthenticatorService;
    private clientService: ClientService;
    private signerService: SignerService;

    constructor() {
        const port: string = ArgumentUtils.getValue('--port', '3545');
        const signerPassPhrase: string = ArgumentUtils.getValue('--signerPass', 'signer default pass');
        const clientPassPhrase: string | undefined = ArgumentUtils.getValue('--clientPass', undefined);

        this.authenticator = new AuthenticatorService();

        const keyPairHelper: KeyPairHelper = KeyPairFactory.getDefaultKeyPairCreator();
        const ownKeyPair: KeyPair = keyPairHelper.createKeyPair(signerPassPhrase);

        const authenticatorAddress: string = ArgumentUtils.getValue('--authAddress', this.authenticator.address);

        this.clientService = new ClientService(keyPairHelper, ownKeyPair, authenticatorAddress);
        this.signerService = new SignerService();
        this.encryptionService = new EncryptionService();
        this.decryptionService = new DecryptionService();

        const methods = this.mergeRpcMethods(
            this.authenticator,
            this.clientService,
            this.signerService,
            this.encryptionService,
            this.decryptionService
        );

        this.initService(methods, parseInt(port));

        if (clientPassPhrase) {
            this.createLocalUser(clientPassPhrase);
        }
    }

    private initService(methods: object, port: number) {
        app.use(cors());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.text({type: '*/*'}));

        app.post('/', (request, response, next) => {
            const json = JSON.parse(request.body);
            const method = json.method;

            if (methods.hasOwnProperty(method)) {
                new Promise(resolve => {
                    const origin: string = (request.headers.origin === undefined)
                        ? 'http://localhost'
                        : request.headers.origin;

                    const result = methods[method](json.params, origin);

                    const data: any = {
                        'jsonrpc': '2.0',
                        result: result,
                        id: json.id
                    };

                    resolve(data);
                }).then(result => response.send(result))
                    .catch(reason => next(reason));
            } else {
                next();
            }
        });

        app.listen(port, () => {
            console.log('Signer running on port', port);
        });
    }

    private createLocalUser(pass: string) {
        const auth: Auth = this.authenticator.generateAccessToken(
            new PassPhrase(pass),
            undefined,
            'http://localhost'
        );
        const publicKey = this.clientService.registerClient(auth, true);
        console.log('access token: ', auth.accessToken);
        console.log('public key: ', publicKey);
    }

    private mergeRpcMethods(...rpcMethods: Array<ServiceRpcMethods>): object {
        const result: any = {};

        for (let service of rpcMethods) {
            const map: Map<string, Pair<Function, Object>> = service.getPublicMethods();
            map.forEach((value, key) => {
                result[key] = (args: any, origin: string) => {
                    if (value.second == null || value.second == undefined) {
                        return value.first();
                    }

                    let client: Client | undefined = undefined;
                    let arg: any = args.length > 0 ? args[0] : {};

                    const model: any = typeof arg === 'object'
                        ? Object.assign(value.second, arg)
                        : arg;

                    if (model instanceof AccessToken) {
                        client = this.clientService.getClient(model.accessToken);
                        if (client && (client.origin !== origin && !client.local)) {
                            throw 'access denied';
                        }
                    }

                    return value.first(model, client, origin);
                };
            });
        }

        return result;
    }

}

new Signer();
