// this class assistant for only read data from Base-node. without any permissions
import DataRequest from '../../models/DataRequest';
import { Site } from '../../models/Site';
import { PermissionsSource } from './PermissionsSource';
import { SiteDataSource } from './SiteDataSource';

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

export enum RepositoryStrategyType {

    Postgres = 'POSTGRES',
    Hybrid = 'HYBRID'

}

export class AssistantNodeRepository implements PermissionsSource, SiteDataSource {

    private readonly GET_DATA_REQUEST_FROM_TO: string = '/v1/data/request/from/{fromPk}/to/{toPk}/';
    private readonly GET_SITE_DATA_API: string = '/v1/site/{origin}';

    private headers: Map<string, string> = new Map<string, string>([
        ['Accept', 'application/json'], ['Content-Type', 'application/json']
    ]);

    private nodeEndPoint: string;

    public constructor(nodeEndPoint: string, strategy: RepositoryStrategyType) {
        this.nodeEndPoint = nodeEndPoint;
        this.headers.set('strategy', strategy);
    }

    public getGrandAccessRecords(publicKeyFrom: string, publicKeyTo: string): Array<DataRequest> {
        const url = this.nodeEndPoint + this.GET_DATA_REQUEST_FROM_TO
            .replace('{fromPk}', publicKeyFrom)
            .replace('{toPk}', publicKeyTo);

        const response: string = this.nodeRequest(url);

        return Object.assign([], JSON.parse(response));
    }

    public getSiteData(origin: string): Site {
        const url = this.nodeEndPoint + this.GET_SITE_DATA_API
            .replace('{origin}', origin);

        const response: string = this.nodeRequest(url);

        return Object.assign(new Site(), JSON.parse(response));
    }

    private nodeRequest(url: string): any {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', url, false);

        this.headers.forEach((value, key) => {
            request.setRequestHeader(key, value);
        });

        request.send(null);

        return request.responseText;
    }

}
