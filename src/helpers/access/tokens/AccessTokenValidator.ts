import Auth from '../../../models/Auth';
import { AuthData } from '../../../models/AuthData';

export abstract class AccessTokenValidator {

    public abstract validate(data: AuthData): boolean;

    public abstract getAuth(data: AuthData): Auth;
}
