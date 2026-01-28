/**
 * Account Handler
 *
 * TODO: consolidate efforts with https://github.com/algorandfoundation/algokit-utils-ts/blob/decoupling/src/types/account-manager.ts
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    BIP32DerivationType,
    Encoding,
    fromSeed,
    KeyContext,
    SignMetadata,
    XHDWalletAPI
} from "@algorandfoundation/xhd-wallet-api";
import {
    generateSecretKey,
    getActiveSecretKeyId,
    getSecretKeyById, saveSecretKey,
    setActiveSecretKeyId, toRootKey
} from "@/lib/keystore";
import * as bip39 from '@scure/bip39'
import {sha512_256} from "@noble/hashes/sha2.js";
import {base32} from "@scure/base";


export const xhd = new XHDWalletAPI()

export type CreatorAccount = {
    address: string
}


export const WALLETS_KEY = 'algo_wallets'

export interface Wallet {
    id: string
    name: string
    address: string
    type: 'XHD' | 'Algorand' | 'OIDC4VC' | 'Intermezzo'
    secretKeyId?: string // Link to the master key it was derived from
    providerId?: string // Link to the provider it was configured with
    metadata?: any // Extra wallet metadata
}

export async function getWallets(): Promise<Wallet[]> {
    const value = await AsyncStorage.getItem(WALLETS_KEY)
    return value ? JSON.parse(value) : []
}

export async function getWalletById(id: string): Promise<Wallet | null> {
    const wallets = await getWallets()
    return wallets.find((p) => p.id === id) || null
}

export async function getWalletsBySecretKeyId(secretKeyId: string, account?: number): Promise<Wallet[]> {
    const wallets = await getWallets()
    return wallets.filter((w) => w.secretKeyId === secretKeyId && (!account || w.metadata?.account === account))
}

export async function saveWallets(wallets: Wallet[]): Promise<void> {
    await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
}

export async function addWallet(wallet: Wallet): Promise<void> {
    const wallets = await getWallets()
    wallets.push(wallet)
    await saveWallets(wallets)
}

export type GenerateWalletOptions = {
    name?: string,
    increment?: boolean,
    account?: number,
    index?: number,
    passphrase?: string,
    derivationType?: BIP32DerivationType,
    secretKeyId?: string,
}

export async function generateWallet(
    options: GenerateWalletOptions = {
        name: "Wallet",
        increment: true,
        passphrase: "",
        account: 0,
        derivationType: BIP32DerivationType.Peikert,
    }
): Promise<Wallet> {
    const {
        name = "Wallet",
        increment = true,
        passphrase = "",
        account = 0,
        derivationType = BIP32DerivationType.Peikert,
        index,
        secretKeyId
    } = options;

    const wallets = await getWallets();
    let postfix = `${increment ? ` ${wallets.length + 1}` : ""}`

    async function initFreshKey() {
        const key = await generateSecretKey()
        await saveSecretKey(key)
        await setActiveSecretKeyId(key.id)
        return key
    }

    let keyId = secretKeyId || await getActiveSecretKeyId();
    console.log(keyId)

    const key = keyId ? await getSecretKeyById(keyId) : await initFreshKey()
    console.log(key)
    const children = await getWalletsBySecretKeyId(key!.id, account);

    const pk = await xhd.keyGen(
        fromSeed(Buffer.from(await bip39.mnemonicToSeed(key!.value, passphrase))),
        KeyContext.Address, account,
        typeof index !== 'undefined' ? index : Math.max(children.length, 0),
        derivationType
    )

    return {
        id: Date.now().toString(),
        name: `${name}${postfix}`,
        address: encodeAddress(pk),
        type: 'XHD',
        secretKeyId: key!.id,
        metadata: {
            account,
            index
        }
    }
}

export async function signChallengeBytes(
    wallet: Wallet,
    data: Uint8Array,
    encoding: Encoding = Encoding.NONE,
    derivationType: BIP32DerivationType = BIP32DerivationType.Peikert
): Promise<Uint8Array> {
    const secret = await getSecretKeyById(wallet.secretKeyId!)
    if (!secret) throw new Error("Secret key not found")
    const metadata: SignMetadata = {encoding: encoding, schema: challenge_request_schema}
    return await xhd.signData(
        await toRootKey(secret),
        KeyContext.Address,
        wallet.metadata.account,
        wallet.metadata.index,
        data,
        metadata,
        derivationType
    )
}

/**
 * Encodes a public key into a Base32 Algorand address, which includes a checksum at the end
 * @param publicKey Public key as Uint8Array (32 bytes)
 * @returns Algorand Address
 */
export function encodeAddress(publicKey: Uint8Array): string {
    const hash = sha512_256(publicKey) // 32 bytes
    const checksum = hash.slice(-4) // last 4 bytes
    const addressBytes = new Uint8Array([...publicKey, ...checksum])
    return base32.encode(addressBytes).replace(/=+$/, '').toUpperCase()
}

const challenge_request_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://arc52/schemas/auth.request.json",
    "title": "Challenge Request",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "0": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "1": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "2": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "3": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "4": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "5": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "6": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "7": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "8": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "9": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "10": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "11": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "12": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "13": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "14": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "15": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "16": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "17": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "18": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "19": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "20": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "21": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "22": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "23": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "24": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "25": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "26": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "27": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "28": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "29": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "30": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        },
        "31": {
            "type": "integer",
            "minimum": 0,
            "maximum": 255
        }
    },
    "required": [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31"
    ]
}