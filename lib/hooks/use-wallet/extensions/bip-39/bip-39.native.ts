import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {fromSeed} from "@algorandfoundation/xhd-wallet-api";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {v4 as uuid} from 'uuid';

import type {SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";
import type {BIP39} from "@/lib/hooks/use-wallet/extensions/bip-39/types";

export const MASTER_KEY_PAIRS_KEY = 'algo_master_key_pairs'
export const ACTIVE_MASTER_KEY_ID_KEY = 'algo_active_master_key_id'

// React Native Implementation
const init = (provider: any, options: any): BIP39 => {
    // Extend BIP-39 with a Keystore when it is available
    let extended = options.keystore ? {
        bip39: {
            add: async (name: string, increment: boolean, strength: number) => await provider.keystore.add(name, increment, strength),
            remove: (id: string) => provider.keystore.remove(id),
            import: (mnemonic: string, name: string = "Secret Key") => provider.keystore.import(mnemonic, name),
            export: (id: string) => provider.keystore.export(id),
        },
    } : { secrets: [] as SecretKey[] }
    return {
        ...extended,
        bip39: {
            generate: generateSecretKey,
            ...extended.bip39,
        },

    }
}
export default init;


export async function generateSecretKey(name: string = "Secret Key", increment: boolean = true, strength: number = 256): Promise<SecretKey> {
    let postfix = "";
    if (increment) {
        const keys = await getAllSecretKey()
        postfix = ` ${keys.length + 1}`
    }

    return {
        id: uuid(),
        name: `${name}${postfix}`,
        value: bip39.generateMnemonic(wordlist, strength),
        type: 'bip39'
    }
}
export async function saveSecretKey(keyPair: SecretKey): Promise<void> {
    const pairs = await getAllSecretKey()
    const index = pairs.findIndex((p) => p.id === keyPair.id)
    if (index >= 0) {
        pairs[index] = keyPair
    } else {
        pairs.push(keyPair)
    }
    await SecureStore.setItemAsync(MASTER_KEY_PAIRS_KEY, JSON.stringify(pairs))

// If it's the first one, or if no active key is set, set it as active
    const activeId = await getActiveSecretKeyId()
    if (!activeId) {
        await setActiveSecretKeyId(keyPair.id)
    }
}

export async function getAllSecretKey(): Promise<SecretKey[]> {
    const value = await SecureStore.getItemAsync(MASTER_KEY_PAIRS_KEY)
    return value ? JSON.parse(value) : []
}

export async function getSecretKeyById(id: string): Promise<SecretKey | null> {
    const pairs = await getAllSecretKey()
    return pairs.find((p) => p.id === id) || null
}

export async function getActiveSecretKeyId(): Promise<string | null> {
    return await AsyncStorage.getItem(ACTIVE_MASTER_KEY_ID_KEY)
}

export async function setActiveSecretKeyId(id: string | null): Promise<void> {
    if(id === null) return await AsyncStorage.removeItem(ACTIVE_MASTER_KEY_ID_KEY)
    await AsyncStorage.setItem(ACTIVE_MASTER_KEY_ID_KEY, id)
}

export async function getActiveSecretKey(): Promise<SecretKey | null> {
    const [pairs, activeId] = await Promise.all([getAllSecretKey(), getActiveSecretKeyId()])
    if (!activeId) return pairs.length > 0 ? pairs[0] : null
    return pairs.find((p) => p.id === activeId) || (pairs.length > 0 ? pairs[0] : null)
}
export async function toRootKey(secret: SecretKey, passphrase: string = '') {
    return fromMnemonic(secret.value, passphrase)
}
export async function fromMnemonic(phrase: string, passphrase = ''): Promise<Uint8Array> {
    if (!await isValidMnemonic(phrase)) {
        throw new Error('Invalid mnemonic phrase')
    }
    return fromSeed(Buffer.from(await bip39.mnemonicToSeed(phrase, passphrase)))
}

export async function removeMnemonic(id: string) {
    const pairs = await getAllSecretKey()
    const updatedPairs = pairs.filter(p => p.id !== id)
    await SecureStore.setItemAsync(MASTER_KEY_PAIRS_KEY, JSON.stringify(updatedPairs))
    if (id === await getActiveSecretKeyId()) {
        await setActiveSecretKeyId(updatedPairs[0]?.id || null)
    }
}
export async function isValidMnemonic(phrase: string): Promise<boolean> {
    return bip39.validateMnemonic(phrase, wordlist)
}