import { KeyPairHelper } from './KeyPairHelper';
import CryptoUtils from '../CryptoUtils';
import KeyPair from './KeyPair';

import bitcore = require('bitcore-lib');

export default class BitKeyPair implements KeyPairHelper {

    createKeyPair(passPhrase: string): KeyPair {
        const pbkdf2: string = CryptoUtils.PBKDF2(passPhrase, 256);
        const hash: any = bitcore.crypto.Hash.sha256(new bitcore.deps.Buffer(pbkdf2));
        const bn: any = bitcore.crypto.BN.fromBuffer(hash);
        const privateKey: any = new bitcore.PrivateKey(bn);

        return new KeyPair(
            privateKey,
            privateKey.toPublicKey()
        );
    }

}
