export default class DataRequest {

    public readonly id: number = 0;
    public readonly fromPk: string = '';
    public readonly toPk: string = '';
    public readonly rootPk: string = '';
    public readonly requestData: string = '';
    public readonly responseData: string = '';

    constructor(toPk: string = '',
                requestData: string = '',
                responseData: string = '') {
        this.toPk = toPk;
        this.requestData = requestData;
        this.responseData = responseData;
    }
}
