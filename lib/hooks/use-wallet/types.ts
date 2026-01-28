import {AlgorandClient} from "@algorandfoundation/algokit-utils";
import {AlgodClient} from "@algorandfoundation/algokit-utils/algod-client";
import {IndexerClient} from "@algorandfoundation/algokit-utils/indexer-client";
import {KeyStoreExtension, SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";
import {BIP39Extension} from "@/lib/hooks/use-wallet/extensions/bip-39/types";

export enum ProviderId {
    BIATEC = 'biatec',
    DEFLY = 'defly',
    DEFLY_WEB = 'defly-web',
    CUSTOM = 'custom',
    EXODUS = 'exodus',
    KIBISIS = 'kibisis',
    KMD = 'kmd',
    LUTE = 'lute',
    MAGIC = 'magic',
    MNEMONIC = 'mnemonic',
    PERA = 'pera',
    WALLETCONNECT = 'walletconnect',
    WEB3AUTH = 'web3auth',
    W3_WALLET = 'w3-wallet',
    ALGORAND_PROVIDER = 'algo-provider'
}

//TODO: export type Extension<T, V> = (provider: Provider, options: T) => V
export type Extension<T = any> = (provider: any, options: any) => T | Promise<T>

export interface ExtensionModule<T = any> {
    init: Extension<T>
}

export interface ExtensionOptions {
    accounts?: string | false | null
    algod?: string | false | null
    intermezzo?: boolean
    liquid?: boolean
    feeCoverage?: boolean
    //oidc4v: unknown
}

export type ProviderType = 'algo' | 'provider' | 'liquid' | 'fido' | 'walletconnect' | 'pera' | 'rocca'

export type ProviderOptions = {
    id: ProviderId;
    name: string
    url: URL
    type: ProviderType
    port?: number
    ssl?: boolean
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

type ExtractExtensionReturn<E> = E extends Extension<infer R> ? (R extends Promise<infer PR> ? PR : R) : any;

export type InferExtensions<E extends readonly Extension[]> = UnionToIntersection<ExtractExtensionReturn<E[number]>>;

/**
 * Represents a base class for managing configurations and extensions dynamically.
 * The class provides functionality to merge options, extend defaults, and add custom extensions.
 *
 * Object that can hold state in a more composed way, allowing for more than just wallet effects
 * Inspired by the work of OctoKit and TxnLab Use Wallet
 */
export class Provider<E extends readonly Extension[] = any[]> {
    id: ProviderId;
    name: string
    url: URL
    type: ProviderType
    port?: number
    ssl?: boolean

    // Shared Options
    options: ExtensionOptions

    // TBD: Defaults for the Provider
    static DEFAULTS = {};

    // Used to inject dependencies and|or check cross-dependencies between extensions
    // These can be independent packages consumed by the public or provided by third parties such as Pera
    static EXTENSIONS: readonly Extension[] = []; // This could include a baseline default like KeyStore + BIP39, it can be overridden by the user

    /**
     * Constructs a new instance of the class with the provided options.
     * It merges the default options with the supplied options and applies
     * any extensions defined in the class to the current instance.
     *
     * @param config {ProviderOptions} - The unique identifier for the provider.
     * @param {object} [options] - Optional configuration options to customize the instance and extensions.
     *                              These options are merged with the default settings.
     */
    constructor(config: ProviderOptions, options?: any) {
        this.id = config.id;
        this.name = config.name;
        this.url = config.url;
        this.type = config.type;
        this.port = config.port;
        this.ssl = config.ssl;

        this.options = {
            ...(this.constructor as typeof Provider).DEFAULTS,
            ...options,
        };

        // Apply extensions to the current instance
        (this.constructor as typeof Provider).EXTENSIONS.forEach(async (ext: Extension) => {
            const result = await ext(this, this.options);
            Object.assign(this, result);
        });
    }

    /**
     * Creates and returns a new class that extends the current class, augmenting it with additional extensions.
     *
     * @param {Extension[]} extensions - An array of extensions to be added to the class. Extensions already present will be ignored.
     */
    static withExtensions<E extends readonly Extension[]>(extensions: E): typeof Provider & { new (config: ProviderOptions, options?: any): Provider<E> & InferExtensions<E> } {
        return class extends this {
            static EXTENSIONS = extensions;
            constructor(config: ProviderOptions, options?: any) {
                super(config, options)
            }
        } as any;
    }
}

export type BaseProvider<E extends readonly Extension[] = any[]> = Provider<E> & InferExtensions<E>;