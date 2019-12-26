import { AcceptedField } from '../../models/AcceptedField';
import DataRequest from '../../models/DataRequest';
import { AccessRight, Permissions } from '../../models/Permissions';
import { Site } from '../../models/Site';
import { PermissionsSource } from '../assistant/PermissionsSource';
import { SiteDataSource } from '../assistant/SiteDataSource';
import CryptoUtils from '../CryptoUtils';
import JsonUtils from '../JsonUtils';
import KeyPairSimple from './KeyPairSimple';

const bitcore = require('bitcore-lib');

export default class KeyPairClient extends KeyPairSimple {

    private permissions: Permissions;
    private permissionsSource: PermissionsSource;
    private siteDataSource: SiteDataSource;
    private acceptedOrigins: Set<string>;
    private currentOrigin: string;
    private isConfidential: boolean = false;

    constructor(
        privateKey: any,
        publicKey: any,
        permissionsSource: PermissionsSource,
        siteDataSource: SiteDataSource,
        origin: string
    ) {
        super(privateKey, publicKey);

        this.permissions = new Permissions();
        this.permissionsSource = permissionsSource;
        this.siteDataSource = siteDataSource;
        this.currentOrigin = origin;
    }

    public encryptFields(fields: Map<string, string>): Map<string, string> {
        return this.prepareData(fields, true, new Map());
    }

    public encryptPermissionsFields(recipient: string, data: Map<string, AccessRight>): string {
        const resultMap: Map<string, AcceptedField> = new Map();

        if (data && data.size > 0) {
            this.syncPermissions();

            for (const [key, value] of data.entries()) {
                if (!this.hasPermissions(key, false)) {
                    continue;
                }

                const pass = this.generatePasswordForField(key.toLowerCase());
                resultMap.set(key, new AcceptedField(pass, value));
            }
        }

        const jsonMap: any = JsonUtils.mapToJson(resultMap);

        return this.encryptMessage(recipient, JSON.stringify(jsonMap));
    }

    public encryptFieldsWithPermissions(recipient: string, data: Map<string, AccessRight>): Map<string, string> {
        const resultMap: Map<string, string> = new Map();

        if (data != null && data.size > 0) {
            this.syncPermissions();

            for (const [key, value] of data.entries()) {
                if (!this.hasPermissions(key, false)) {
                    continue;
                }

                const pass = this.generatePasswordForField(key.toLowerCase());
                const encrypted = this.encryptMessage(recipient, JSON.stringify(new AcceptedField(pass, value)));
                resultMap.set(key, encrypted);
            }
        }

        return resultMap;
    }

    public decryptFields(fields: Map<string, string>, passwords?: Map<string, string>): Map<string, string> {
        return this.prepareData(fields, false, passwords || new Map());
    }

    public setAcceptedOrigins(origins: Set<string>) {
        this.acceptedOrigins = new Set<string>(origins);

        this.permissions.fields.clear();
        this.isConfidential = this.acceptedOrigins.has('*');
    }

    public changeCurrentOrigin(origin: string) {
        const clearOrigin = origin.toLowerCase()
            .replace('http://', '')
            .replace('https://', '')
            .replace('www.', '');

        if (!this.acceptedOrigins.has('*') && !this.acceptedOrigins.has(clearOrigin)) {
            throw new Error('Unapproved origin');
        }

        if (this.currentOrigin !== clearOrigin && !this.acceptedOrigins.has('*')) {
            this.permissions.fields.clear();
            this.isConfidential = false;
        }

        this.currentOrigin = clearOrigin;
    }

    private prepareData(
        data: Map<string, string>,
        encrypt: boolean,
        passwords: Map<string, string>
    ): Map<string, string> {
        const result: Map<string, string> = new Map<string, string>();

        this.syncPermissions();

        for (const [key, value] of data.entries()) {
            if (!this.hasPermissions(key, !encrypt)) {
                continue;
            }

            const pass = passwords.has(key) ? passwords.get(key) : this.generatePasswordForField(key);
            if (pass && pass.length > 0) {
                const changedValue = encrypt
                                     ? CryptoUtils.encryptAes256(value, pass)
                                     : CryptoUtils.decryptAes256(value, pass);

                result.set(key.toLowerCase(), changedValue);
            }
        }

        return result;
    }

    private hasPermissions(field: string, read: boolean): boolean {
        if (this.isConfidential) {
            return true;
        }

        const keyPermission: AccessRight | undefined = this.permissions.fields.get(field);

        return read
               ? keyPermission === AccessRight.R || keyPermission === AccessRight.RW
               : keyPermission === AccessRight.RW;
    }

    private syncPermissions() {
        if (!this.isConfidential && this.permissions.fields.size === 0) {
            const site: Site = this.siteDataSource.getSiteData(this.currentOrigin);
            this.isConfidential = site.confidential;

            if (!site.confidential) {
                const requests: Array<DataRequest> = this.permissionsSource.getGrandAccessRecords(
                    site.publicKey, this.getPublicKey()
                );

                for (const request of requests) {
                    const strDecrypt: string = this.decryptMessage(site.publicKey, request.responseData);
                    const jsonDecrypt: any = JSON.parse(strDecrypt);
                    let resultMap: Map<string, AcceptedField> = new Map();

                    // for Backward compatibility of deprecated data
                    if (!request.rootPk || request.rootPk.length <= 0) {
                        resultMap = JsonUtils.jsonToMap(jsonDecrypt);

                    } else {
                        resultMap.set(
                            request.requestData,
                            Object.assign(new AcceptedField('', AccessRight.R), jsonDecrypt)
                        );
                    }

                    this.permissions.fields.clear();

                    resultMap.forEach((value, key) => {
                        this.permissions.fields.set(key, value.access);
                    });
                }
            }
        }
    }

    private generatePasswordForField(fieldName: string): string {
        // const result: string = CryptoUtils.PBKDF2(
        //     CryptoUtils.keccak256(this.privateKey.toString(16)) + fieldName.toLowerCase(),
        //     384
        // );

        return bitcore.crypto.Hash.sha256hmac(
            bitcore.deps.Buffer(this._privateKey.toString(16)),
            bitcore.deps.Buffer(fieldName.toLowerCase())
        ).toString('hex');
    }
}
