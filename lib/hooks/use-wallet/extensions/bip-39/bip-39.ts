import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {Provider} from "@/lib/hooks/use-wallet/types";
import {v4 as uuid} from 'uuid';
import * as Keystore from "@/lib/keystore";

export interface SecretKey {
    id: string
    name: string
    phrase: string
}

export interface BIP39 {
    add: (name: string, increment: boolean, strength: number) => Promise<void>
    remove: (id: string) => Promise<void>
    import: (mnemonic: string, name?: string) => Promise<void>
    export: (id: string) => Promise<string | undefined>
    generate: (name?: string, increment?: boolean, strength?: number) => Promise<SecretKey>
}

const init = async (provider: Provider, options: any) => {
    // Assume the keystore is available and holds BIP-39 materials
    let extended = options.keystore ? {
        secrets: await Keystore.getAllSecretKey(),
        bip39: {
            add: async (name: string, increment: boolean, strength: number) => await Keystore.saveSecretKey(await Keystore.generateSecretKey(name, increment, strength)),
            remove: async (id: string) => {
                await Keystore.removeSecretKey(id)
            },
            import: async (mnemonic: string, name: string = "Secret Key") => await Keystore.saveSecretKey({id: uuid(), name, phrase: mnemonic}),
            export: async (id: string) => (await Keystore.getSecretKeyById(id))?.phrase,
        } as BIP39,
    } : { secrets: [] as any[], bip39: {} as any }
    
    return {
        ...extended,
        bip39: {
            generate: Keystore.generateSecretKey,
            ...extended.bip39,
        },
    }
}

export default init;