import Auth from '../../../models/Auth';
import RpcToken from '../../../models/RpcToken';

export abstract class AccessTokenValidator {

    public abstract validate(token: RpcToken): boolean;

    public abstract getAuth(token: RpcToken): Auth;
}
