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

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const port = 3545;

export default class Signer {

    public encryptionService: EncryptionService;
    public decryptionService: DecryptionService;

    private clientService: ClientService;
    private signerService: SignerService;

    constructor() {
        const passPhrase: string = ArgumentUtils.getValue('-p');
        // const authenticatorAddress: string = ArgumentUtils.getValue('-a');

        const keyPairHelper: KeyPairHelper = KeyPairFactory.getDefaultKeyPairCreator();
        const ownKeyPair: KeyPair = keyPairHelper.createKeyPair(passPhrase);

        const authenticator: AuthenticatorService = new AuthenticatorService();
        this.clientService = new ClientService(keyPairHelper, ownKeyPair, authenticator.address);
        this.signerService = new SignerService();
        this.encryptionService = new EncryptionService();
        this.decryptionService = new DecryptionService();

        const methods = this.mergeRpcMethods(
            authenticator,
            this.clientService,
            this.signerService,
            this.encryptionService,
            this.decryptionService
        );

        app.use(cors());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.text({type: '*/*'}));

        app.post('/', (request, response, next) => {
            const json = JSON.parse(request.body);
            const method = json.method;

            if (methods.hasOwnProperty(method)) {
                new Promise(resolve => {
                    const result = methods[method](json.params, request.headers.origin);
                    resolve(result);
                }).then(result => response.send(result))
                    .catch(reason => next(reason));
            } else {
                next();
            }
        });

        app.listen(port, () => {
            console.log('Signer running on port 3545');
        });
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
                        if (client && client.baseUrl !== origin) {
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
