import DataRequest from '../../models/DataRequest';

export interface PermissionsSource {

    getGrandAccessRecords(publicKeyFrom: string, publicKeyTo: string): Array<DataRequest>

}
