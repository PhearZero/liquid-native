import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {v4 as uuid} from 'uuid';
import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {fromSeed} from "@algorandfoundation/xhd-wallet-api";
import {BaseProvider} from "@/lib/hooks/use-wallet/types";
import type {KeyStore, SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";
export const MASTER_KEY_PAIRS_KEY = 'algo_master_key_pairs'
export const ACTIVE_MASTER_KEY_ID_KEY = 'algo_active_master_key_id'

const init = (provider: BaseProvider, options: any): KeyStore => {
    return {
        secrets: options.secrets || [] as SecretKey[],
        activeSecret: options.activeSecret || null as SecretKey | null,
        keystore: options.keystore || {
            secrets: [] as SecretKey[],
            add: async (name: string, increment: boolean, strength: number) => await saveSecretKey(await generateSecretKey(name, increment, strength)),
            remove: async (id: string) => {
                await removeSecretKey(id)
            },
            import: async (mnemonic: string, name: string = "Secret Key") => await saveSecretKey({id: uuid(), name, value: mnemonic, type: 'bip39'}),
            export: async (id: string) => (await getSecretKeyById(id))?.value,
        },
    }
}

export default init;

// Implementation for React Native

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
export async function saveSecretKey(keyPair: SecretKey): Promise<string> {
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
    return keyPair.id
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
export async function removeSecretKey(id: string): Promise<void> {
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