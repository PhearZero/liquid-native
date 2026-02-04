// Dependencies
import * as bip39 from '@scure/bip39'
import {wordlist as englishWordList} from "@scure/bip39/wordlists/english.js";

// Shared Libraries
import type {BaseProvider, ExtensionOptions} from "@algorandfoundation/wallet-provider";
import type {KeyStoreApi, KeyStoreExtension, SecretKey} from '@algorandfoundation/keystore-extension'
import type {WalletAccount} from "@algorandfoundation/accounts-extension";

// Crypto Libraries
import type {BIP39CryptoApi, BIP39CryptoExtension} from "@algorandfoundation/bip39-crypto-extension";
import type {XHDCryptoApi, XHDCryptoExtension} from "@algorandfoundation/xhd-crypto-extension";

// Implementation Specifics
// TODO: remove code generation for Type System (aka remove Enum to avoid closures)
import {BIP32DerivationType, fromSeed, KeyContext, XHDWalletAPI} from '@algorandfoundation/xhd-wallet-api'

export interface XHDAccountsExtension {
    // XHD Supplies Accounts
    accounts: WalletAccount[],
    activeAccount: WalletAccount | null

    // XHD Supplies a generic Wallet Interface
    wallet: {
        xhd: XHDWalletAccountsApi,
    }
}
export interface XHDWalletAccountsApi {
    add: (options: GenerateAccountOptions)=>Promise<WalletAccount>,
    remove: (id: string)=>Promise<void>,
    generate: (options: GenerateAccountOptions)=>Promise<WalletAccount>,
    import: (options: ImportAccountOptions)=>Promise<WalletAccount>,
    export: (id: string)=>Promise<{wallet: WalletAccount, Key: SecretKey}>
}

type XHDProviderContext = BaseProvider &
    KeyStoreExtension &
    BIP39CryptoExtension &
    XHDCryptoExtension &
    XHDAccountsExtension &
    {crypto: any, wallet: any}
export const init = (provider: XHDProviderContext, options: ExtensionOptions): XHDAccountsExtension => {
    if(!provider.keystore)
        throw new Error('No keystore extension installed')
    if(typeof provider.crypto === 'undefined')
        throw new Error('No crypto extension installed')
    if(typeof provider.crypto.bip39 === 'undefined')
        throw new Error('No BIP-39 extension installed')

    return {
        // State
        accounts: [], // TODO: move to reactive store and combine stores
        activeAccount: null, // TODO: move to reactive

        // Wallet API Interfaces
        wallet: {
            xhd: {
                add: async (options: GenerateAccountOptions) => {
                    throw new Error('Not implemented')
                },
                remove: async (id: string) => {
                    throw new Error('Not implemented')
                },
                generate: async (options: GenerateAccountOptions) => generateAccount(provider, options),
                import: async (options: ImportAccountOptions) => {
                    throw new Error('Not implemented')
                },
                export: async (id: string) => await provider.crypto.bip39.export(id)
            },
            ...provider.wallet, // Add in any other provider API's for accounts
        }
    }
}

export type GenerateAccountOptions = {
    name?: string,
    increment?: boolean,
    account?: number,
    index?: number,
    passphrase?: string,
    derivationType?: BIP32DerivationType,
    secretKeyId: string,
    strength?: number
}

export type ImportAccountOptions = {
    mnemonic: string,
    account: number,
    index: number,
    passphrase: string
}

export async function generateAccount(
    provider: XHDProviderContext,
    options: GenerateAccountOptions
) /*: Promise<Wallet> */{
    const keystoreApi = provider.keystore as KeyStoreApi
    const bip39Api = provider.crypto.bip39 as BIP39CryptoApi
    const xhd = provider.crypto.xhd as XHDWalletAPI
    const accounts = provider.accounts as WalletAccount[]

    // Get Options
    const {
        name = "Wallet",
        increment = true,
        passphrase = "",
        account = 0,
        derivationType = BIP32DerivationType.Peikert,
        index,
        secretKeyId,
        strength = 256
    } = options;

    const wallets: WalletAccount[] = provider.accounts;
    let postfix = `${increment ? ` ${wallets.length + 1}` : ""}`

    console.log(secretKeyId)
    let key: SecretKey | null = secretKeyId ? await keystoreApi.export(secretKeyId) : await bip39Api.generate({name,strength});
    console.log(key)
    if(key === null) throw new Error("Invalid secret key ID")
    if(key.type !== 'bip39') throw new Error("Invalid secret type")
    if(key.value === null) throw new Error("Invalid secret key value")


    // Create the new PublicKey and auto-increment the index
    const children = accounts.filter((p) => p.secretKeyId === secretKeyId && p.metadata?.xhdAccount === account);
    const pk = await xhd.keyGen(
        fromSeed(Buffer.from(await bip39.mnemonicToSeed(key!.value, passphrase))),
        KeyContext.Address, account,
        typeof index !== 'undefined' ? index : Math.max(children.length, 0),
        derivationType
    )

    return {
        id: Date.now().toString(),
        name: `${name}${postfix}`,
        address: encodeAddress(provider, pk),
        type: 'XHD',
        secretId: key!.id,
        metadata: {
            xhdAccount: account,
            xhdIndex: index
        }
    }
}

export async function toRootKey(secret: SecretKey, passphrase: string = '') {
    if(secret.type !== 'bip39') throw new Error('Invalid secret type')
    if(secret.value === null) throw new Error('Invalid secret value')
    return fromMnemonic(secret.value, passphrase)
}
export async function fromMnemonic(phrase: string, passphrase = '', wordlist=englishWordList): Promise<Uint8Array> {
    if (!bip39.validateMnemonic(phrase, wordlist)) {
        throw new Error('Invalid mnemonic phrase')
    }
    return fromSeed(Buffer.from(await bip39.mnemonicToSeed(phrase, passphrase)))
}
export function encodeAddress(provider: XHDProviderContext, publicKey: Uint8Array): string {
    if(typeof provider.crypto.base32 === 'undefined') throw new Error('No crypto extension installed')
    if(typeof provider.crypto.sha512_256 === 'undefined') throw new Error('No crypto extension installed')

    const base32 = provider.crypto.base32

    const hash = provider.crypto.sha512_256(publicKey) // 32 bytes
    const checksum = hash.slice(-4) // last 4 bytes
    const addressBytes = new Uint8Array([...publicKey, ...checksum])
    return base32.encode(addressBytes).replace(/=+$/, '').toUpperCase()
}