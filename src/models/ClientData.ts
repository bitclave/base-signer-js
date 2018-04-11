import AccessData from './AccessData';
import Client from './Client';
import Permissions from './Permissions';

export default class ClientData extends AccessData {

    publicKey: string;

    constructor(publicKey: string,
                accessToken: string,
                origin: string,
                expireDate: string,
                permissions: Permissions) {
        super(accessToken, origin, expireDate, permissions);
        this.publicKey = publicKey;
    }

    public static valueOf(client: Client): ClientData {
        return new ClientData(
            client.keyPair.publicKey,
            client.accessToken,
            client.origin,
            client.expireDate,
            client.permissions
        );
    }

}