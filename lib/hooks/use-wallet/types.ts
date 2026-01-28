import WithWalletAccounts from "./extensions/accounts";
import WithAlgorand from "./extensions/algorand";
import WithPasskeys from "./extensions/passkeys";
import WithIntermezzo from "./extensions/intermezzo";
import WithXHD from "./extensions/xhd";

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
    W3_WALLET = 'w3-wallet'
}

//TODO: export type Extension<T, V> = (provider: Provider, options: T) => V
export type Extension = (provider: Provider, options: any) => any | Promise<any>
export interface ExtensionModule {
    //TODO: init<T, V>: Extension
    init: Extension
}

export interface ExtensionOptions {
    accounts?: string | false | null
    algod?: string | false | null
    intermezzo?: boolean
    liquid?: boolean
    feeCoverage?: boolean
    //oidc4v: unknown
}

export type ProviderType = 'algo' | 'provider' | 'liquid' | 'fido' | 'walletconnect' | 'pera'

export type ProviderOptions = {
    id: ProviderId;
    name: string
    url: URL
    type: ProviderType
    port?: number
    ssl?: boolean
}

/**
 * Represents a base class for managing configurations and extensions dynamically.
 * The class provides functionality to merge options, extend defaults, and add custom extensions.
 *
 * Object that can hold state in a more composed way, allowing for more than just wallet effects
 * Inspired by the work of OctoKit and TxnLab Use Wallet
 */
export class Provider {
    id: ProviderId;
    name: string
    url: URL
    type: ProviderType
    port?: number
    ssl?: boolean

    // Extension Keys, TODO: infer these from the implementation
    accounts?: any[]
    activeAccount?: any
    indexer?: any
    algod?: any
    passkeys?: any[]
    activePasskey?: any
    intermezzo?: boolean
    liquid?: any
    feeCoverage?: boolean
    keystore?: any

    options: ExtensionOptions
    // TBD: Defaults for the Provider
    static DEFAULTS = {};

    // Used to inject dependencies and|or check cross-dependencies between extensions
    // These can be independent packages consumed by the public or provided by third parties such as Pera
    static EXTENSIONS: Extension[] = [
        // Use Wallet Becomes a "Type of Provider" for any wallet that handles accounts
        WithWalletAccounts,
        // Getting access to the indexer or algod could be optional
        WithAlgorand,
        // Adding in passkeys becomes an extension of the Provider, allowing any wallet to support passkeys by becoming a Provider Extension
        WithPasskeys,
        // Adding extra functionality like Intermezzo, Liquid, and OIDC4VC becomes an extension of the Provider
        WithIntermezzo,
        // Adding in XHD
        WithXHD
    ];

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

        // if (this.options.something) {
            // TODO: extra options handling if necessary
        // }

        // Apply extensions to the current instance
        (this.constructor as typeof Provider).EXTENSIONS.forEach((ext: Extension) => {
            Object.assign(this, ext(this, this.options));
        });

    }

    /**
     * Creates and returns a new class that extends the current class, augmenting it with additional extensions.
     *
     * @param {Extension[]} extensions - An array of extensions to be added to the class. Extensions already present will be ignored.
     */
    static withExtensions(extensions: Extension[]): typeof Provider {
        return class extends this {
            static EXTENSIONS = extensions;
            constructor(options: any) {
                super(options)
            }
        }
    }
}