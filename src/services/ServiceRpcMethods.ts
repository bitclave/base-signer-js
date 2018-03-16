import Pair from '../models/Pair';

export interface ServiceRpcMethods {

    getPublicMethods(): Map<string, Pair<Function, Object>>;

}
