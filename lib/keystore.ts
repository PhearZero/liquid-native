import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {v4 as uuid} from 'uuid';
import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {fromSeed} from "@algorandfoundation/xhd-wallet-api";
export const MASTER_KEY_PAIRS_KEY = 'rocca_master_key_pairs'
export const ACTIVE_MASTER_KEY_ID_KEY = 'rocca_active_master_key_id'


export interface SecretKey {
    id: string
    name: string
    phrase: string
}

export async function generateSecretKey(name: string = "Secret Key", increment: boolean = true, strength: number = 256): Promise<SecretKey> {
    let postfix = "";
    if (increment) {
        const keys = await getAllSecretKey()
        postfix = ` ${keys.length + 1}`
    }

    return {
        id: uuid(),
        name: `${name}${postfix}`,
        phrase: bip39.generateMnemonic(wordlist, strength),
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

export async function setActiveSecretKeyId(id: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_MASTER_KEY_ID_KEY, id)
}

export async function getActiveSecretKey(): Promise<SecretKey | null> {
    const [pairs, activeId] = await Promise.all([getAllSecretKey(), getActiveSecretKeyId()])
    if (!activeId) return pairs.length > 0 ? pairs[0] : null
    return pairs.find((p) => p.id === activeId) || (pairs.length > 0 ? pairs[0] : null)
}
export async function toRootKey(secret: SecretKey, passphrase: string = '') {
    return fromMnemonic(secret.phrase, passphrase)
}
export async function fromMnemonic(phrase: string, passphrase = ''): Promise<Uint8Array> {
    if (!await isValidMnemonic(phrase)) {
        throw new Error('Invalid mnemonic phrase')
    }
    return fromSeed(Buffer.from(await bip39.mnemonicToSeed(phrase, passphrase)))
}
export async function isValidMnemonic(phrase: string): Promise<boolean> {
    return bip39.validateMnemonic(phrase, wordlist)
}