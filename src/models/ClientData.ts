import AccessData from './AccessData';
import Client from './Client';

export default class ClientData extends AccessData {

    public readonly publicKey: string;

    public static valueOf(client: Client): ClientData {
        return new ClientData(
            client.keyPair.getPublicKey(),
            client.accessToken,
            client.origin,
            client.expireDate
        );
    }

    constructor(
        publicKey: string,
        accessToken: string,
        origin: Set<string>,
        expireDate: Date
    ) {

        super(accessToken, origin, expireDate);

        this.publicKey = publicKey;
    }
}
