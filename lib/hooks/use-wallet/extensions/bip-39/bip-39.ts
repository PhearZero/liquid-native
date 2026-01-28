import {v4 as uuid} from 'uuid';
import { wordlist } from '@scure/bip39/wordlists/english.js'
import * as bip39 from '@scure/bip39'

import type {BaseProvider} from "@/lib/hooks/use-wallet/types";
import type {SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";


const init = async (provider: BaseProvider, options: any) => {
    return {
        secrets: options.secrets || [],
        bip39: {
            generate: generateSecretKey,
        },
    }
}

export default init;

export async function generateSecretKey(name: string = "Secret Key", strength: number = 256): Promise<SecretKey> {
    // TODO: eventually support a keystore that is backed by WebCrypto and IndexDB
    return {
        id: uuid(),
        name,
        value: bip39.generateMnemonic(wordlist, strength),
        type: 'bip39'
    }
}