import AccessData from './AccessData';
import Client from './Client';

export default class ClientData extends AccessData {

    publicKey: string;

    constructor(publicKey: string,
                accessToken: string,
                origin: string,
                expireDate: string) {

        super(accessToken, origin, expireDate);

        this.publicKey = publicKey;
    }

    public static valueOf(client: Client): ClientData {
        return new ClientData(
            client.keyPair.getPublicKey(),
            client.accessToken,
            client.origin,
            client.expireDate
        );
    }

}