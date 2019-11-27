import * as Express from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { AccessTokenValidatorStrategy } from './helpers/access/tokens/AccessTokenValidatorStrategy';
import { BasicAccessTokenValidator } from './helpers/access/tokens/BasicAccessTokenValidator';
import { JwtAccessTokenValidator } from './helpers/access/tokens/JwtAccessTokenValidator';
import Authenticator from './helpers/Authenticator';
import { Configurator } from './helpers/console/Configurator';
import { KeyPair } from './helpers/keypair/KeyPair';
import { KeyPairHelper } from './helpers/keypair/KeyPairHelper';
import KeyPairHelperImpl from './helpers/keypair/KeyPairHelperImpl';
import Client from './models/Client';
import Pair from './models/Pair';
import RpcToken, { TokenType } from './models/RpcToken';
import ClientService from './services/ClientService';
import DecryptionService from './services/DecryptionService';
import EncryptionService from './services/EncryptionService';
import { ServiceRpcMethods } from './services/ServiceRpcMethods';
import SignerService from './services/SignerService';
import ArgumentUtils from './utils/ArgumentUtils';
import { StringUtils } from './utils/StringUtils';

const bodyParser = require('body-parser');
const cors = require('cors');
const app = Express();

class Signer {

    public encryptionService: EncryptionService;
    public decryptionService: DecryptionService;

    private clientService: ClientService;
    private signerService: SignerService;

    constructor() {
        const useLocal: string = ArgumentUtils.getValue('USE_LOCAL', '--useLocal', 'false');

        if (!useLocal || useLocal !== 'true') {
            this.initRemote();
        } else {
            this.initLocal();
        }
    }

    private initRemote() {
        const port: string = ArgumentUtils.getValue('PORT', '--port', '3545');
        const host: string = ArgumentUtils.getValue('HOST', '--host', '127.0.0.1');
        const nodeHost: string = ArgumentUtils.getValue('HOST_NODE', '--node', '');
        const signerPassPhrase: string = ArgumentUtils.getValue('PASS_PHRASE', '--signerPass', 'signer default pass');
        const authenticatorPublicKey: string = ArgumentUtils.getValue('AUTHENTICATOR_PK', '--authPK');
        const jwtRsaCert: string = ArgumentUtils.getValue('JWT_RSA_CERT', '--jwtRsaCert');

        this.init(
            false,
            parseInt(port, 10),
            host,
            nodeHost,
            signerPassPhrase,
            authenticatorPublicKey,
            undefined,
            jwtRsaCert
        );
    }

    private initLocal() {
        Configurator.prepareConfiguration().then((result: Map<string, string>) => {
            const port: number = parseInt(result.get('port') || '0', 10);
            const nodeHost: string = result.get('node') || '';
            const clientPassPhrase: string = result.get('mnemonic') || '';

            this.init(true, port, nodeHost, '', '', clientPassPhrase);
        });
    }

    private init(
        useLocal: boolean,
        port: number,
        host: string,
        nodeHost: string,
        signerPassPhrase: string,
        authenticatorPublicKey?: string,
        clientPassPhrase?: string,
        jwtRsaCert?: string,
    ) {

        if (port <= 0) {
            throw new Error(`invalid port number: ${port}`);
        }

        if (!nodeHost ||
            nodeHost.length === 0 ||
            nodeHost.indexOf('http') === -1) {
            throw new Error('For run Signer need setup node host! For setup use' +
                ' "environment": "HOST_NODE" or "command arguments": "--node" ');
        }

        const keyPairHelper: KeyPairHelper = new KeyPairHelperImpl(nodeHost);

        let authenticatorKeyPair: KeyPair | undefined;

        if (useLocal) {
            authenticatorKeyPair = keyPairHelper.createSimpleKeyPair(StringUtils.generateString());
            authenticatorPublicKey = authenticatorKeyPair.getPublicKey();

            signerPassPhrase = StringUtils.generateString();
        }

        const ownKeyPair: KeyPair = keyPairHelper.createSimpleKeyPair(signerPassPhrase);

        authenticatorPublicKey = StringUtils.isEmpty(authenticatorPublicKey) ? '' : authenticatorPublicKey!!;

        const tokenValidatorStrategy = new AccessTokenValidatorStrategy();
        tokenValidatorStrategy.setStrategy(
            TokenType.BASIC,
            new BasicAccessTokenValidator(authenticatorPublicKey, ownKeyPair)
        );

        tokenValidatorStrategy.setStrategy(TokenType.KEYCLOACK_JWT, new JwtAccessTokenValidator(jwtRsaCert || ''));

        this.clientService = new ClientService(keyPairHelper, ownKeyPair, tokenValidatorStrategy);
        this.signerService = new SignerService();
        this.encryptionService = new EncryptionService();
        this.decryptionService = new DecryptionService();

        const methods = this.mergeRpcMethods(
            this.clientService,
            this.signerService,
            this.encryptionService,
            this.decryptionService
        );

        this.initService(methods, port, host);

        if (clientPassPhrase && authenticatorKeyPair) {
            const authenticator: Authenticator = new Authenticator(authenticatorKeyPair, ownKeyPair.getPublicKey());
            this.clientService.authenticatorRegisterClient(authenticator.prepareLocalAuth(clientPassPhrase));
        }
    }

    private initService(methods: Map<string, (args: any, origin: string) => any>, port: number, host: string) {
        app.use(cors());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.text({type: '*/*', limit: '50MB'}));

        app.post(
            '/',
            (req: Request<any>, res: Response, next: NextFunction) => this.executeMethod(methods, req, res, next)
        );

        app.listen(port, host, () => console.log('Signer running on port and host', port, host));
    }

    private async executeMethod(
        methods: Map<string, (args: any, origin: string) => any>,
        req: Request<any>,
        res: Response,
        next: NextFunction
    ): Promise<void> {

        const data = {
            jsonrpc: '2.0',
            result: undefined,
            id: -1,
            error: undefined
        };

        try {
            const json = JSON.parse(req.body);
            const method = json.method;

            data.id = json.id || -1;

            if (!methods.has(method)) {
                throw new Error(`Unknown method: ${method}`);
            }

            const origin: string = (req.headers.origin === undefined)
                                   ? 'http://localhost'
                                   : req.headers.origin.toString();

            data.result = methods.get(method)!!(json.params, origin);
            delete data.error;

            res.send(data);

        } catch (e) {
            data.error = (e.stack || '')
                .toString()
                .replace('    ', '')
                .split('\n');

            data.result = e.message;

            res.status(500).send(data);
        }
    }

    private mergeRpcMethods(...rpcMethods: Array<ServiceRpcMethods>): Map<string, (args: any, origin: string) => void> {
        const result = new Map<string, (args: any, origin: string) => any>();

        for (const service of rpcMethods) {
            const map: Map<string, Pair<(...args: any) => any, any>> = service.getPublicMethods();
            map.forEach((value, key) => {
                result.set(key, (args: any, origin: string) => {

                    if (value.second === null || value.second === undefined) {
                        return value.first(origin);
                    }

                    let client: Client | undefined;
                    const arg: any = args.length > 0 ? args[0] : {};

                    const model: any = typeof arg !== null && typeof value.second !== 'string'
                                       ? Object.assign(new value.second(), arg)
                                       : arg;

                    if (model instanceof RpcToken) {
                        client = this.clientService.checkAccessToken(model, origin);

                        if (!client) {
                            throw new Error('access denied');
                        }

                        client.keyPair.changeCurrentOrigin(origin);
                    }

                    return value.first(model, client, origin);
                });
            });
        }

        return result;
    }
}

// tslint:disable-next-line:no-unused-expression
new Signer();
