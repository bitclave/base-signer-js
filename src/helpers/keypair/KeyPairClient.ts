import CryptoUtils from '../CryptoUtils';
import { AcceptedField } from '../../models/AcceptedField';
import { Site } from '../../models/Site';
import JsonUtils from '../JsonUtils';
import { AccessRight, Permissions } from '../../models/Permissions';
import { PermissionsSource } from '../assistant/PermissionsSource';
import { SiteDataSource } from '../assistant/SiteDataSource';
import KeyPairSimple from './KeyPairSimple';
import DataRequest from '../../models/DataRequest';

export default class KeyPairClient extends KeyPairSimple {

    private permissions: Permissions;
    private permissionsSource: PermissionsSource;
    private siteDataSource: SiteDataSource;
    private origin: string;
    private isConfidential: boolean = false;

    constructor(privateKey: any,
                publicKey: any,
                permissionsSource: PermissionsSource,
                siteDataSource: SiteDataSource,
                origin: string) {
        super(privateKey, publicKey);

        this.permissions = new Permissions();
        this.permissionsSource = permissionsSource;
        this.siteDataSource = siteDataSource;
        this.origin = origin;
    }

    encryptFields(fields: Map<string, string>): Map<string, string> {
        return this.prepareData(fields, true);
    }

    encryptPermissionsFields(recipient: string, data: Map<string, AccessRight>): string {
        const resultMap: Map<string, AcceptedField> = new Map();

        if (data != null && data.size > 0) {
            let pass: string;

            this.syncPermissions();

            for (let [key, value] of data.entries()) {
                if (!this.hasPermissions(key, false)) {
                    continue;
                }

                pass = this.generatePasswordForField(key.toLowerCase());
                resultMap.set(key, new AcceptedField(pass, value));
            }
        }

        const jsonMap: any = JsonUtils.mapToJson(resultMap);

        return this.encryptMessage(recipient, JSON.stringify(jsonMap));
    }

    decryptFields(fields: Map<string, string>): Map<string, string> {
        return this.prepareData(fields, false);
    }

    private prepareData(data: Map<string, string>, encrypt: boolean): Map<string, string> {
        const result: Map<string, string> = new Map<string, string>();
        let pass: string;
        let changedValue: string;

        this.syncPermissions();

        for (let [key, value] of data.entries()) {
            if (!this.hasPermissions(key, !encrypt)) {
                continue;
            }

            pass = this.generatePasswordForField(key);
            if (pass != null && pass != undefined && pass.length > 0) {
                changedValue = encrypt
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
            const site: Site = this.siteDataSource.getSiteData(this.origin);
            this.isConfidential = site.confidential;

            if (!site.confidential) {
                const requests: Array<DataRequest> = this.permissionsSource.getGrandAccessRecords(
                    site.publicKey, this.getPublicKey()
                );

                for (let request of requests) {
                    const strDecrypt: string = this.decryptMessage(site.publicKey, request.responseData);
                    const jsonDecrypt: any = JSON.parse(strDecrypt);
                    const resultMap: Map<string, AcceptedField> = JsonUtils.jsonToMap(jsonDecrypt);

                    this.permissions.fields.clear();

                    resultMap.forEach((value, key) => {
                        this.permissions.fields.set(key, value.access);
                    });
                }
            }
        }
    }

    private generatePasswordForField(fieldName: string): string {
        return CryptoUtils.PBKDF2(
            CryptoUtils.keccak256(this._privateKey.toString(16)) + fieldName.toLowerCase(),
            384
        );
    }

}
