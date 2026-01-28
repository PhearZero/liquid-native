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
export type Extension = (provider: Provider, options: any) => any

/**
 * Represents a base class for managing configurations and extensions dynamically.
 * The class provides functionality to merge options, extend defaults, and add custom extensions.
 *
 * Object that can hold state in a more composed way, allowing for more than just wallet effects
 * Inspired by the work of OctoKit and TxnLab Use Wallet
 */
export class Provider {
    id: ProviderId;
    options: any;

    // Used to inject dependencies and|or check cross-dependencies between extensions
    // These can be independent packages consumed by the public or provided by third parties such as Pera
    static EXTENSIONS: Extension[] = [
        // Use Wallet Becomes a "Type of Provider" for any wallet that handles accounts
        function WithWalletAccounts(provider: Provider, options: any) {
            return {
                accounts: options.accounts || [],
                activeAccount: options.activeAccount || null,
                managerStatus: options.managerStatus || null,
            }
        },
        // Getting access to the indexer or algod could be optional
        function WithAlgorand(provider, options){
            return {
                indexer: options.indexer || null,
                algod: options.algod || null,
            }
        },
        // Adding in passkeys becomes an extension of the Provider, allowing any wallet to support passkeys by becoming a Provider Extension
        function WithPasskeys(provider: Provider, options: any) {
            return {
                passkeys: options.passkeys || [],
                activePasskey: options.activePasskey || null,
            }
        },
        // Adding extra functionality like Intermezzo, Liquid, and OIDC4VC becomes an extension of the Provider
        function WithIntermezzo(provider: Provider, options: any) {
            return {
                intermezzo: options.intermezzo || false, // Would provide the API access information
                liquid: options.liquid || {/* Default Liquid Auth Options*/}, // Other extensions could be loaded by default
                // Manager operations could be included that have access to this.accounts
            }
        },
        // Adding in XHD
        function WithXHD(provider, options){
            return {
                // TODO: these should be interfaces to the library with the key paths and type of operation
                encrypt: options.encrypt || null,
                decrypt: options.decrypt || null,
            }
        }
    ];

    // TBD: Defaults for the Provider
    static DEFAULTS = {};

    /**
     * Constructs a new instance of the class with the provided options.
     * It merges the default options with the supplied options and applies
     * any extensions defined in the class to the current instance.
     *
     * @param id {ProviderId} - The unique identifier for the provider.
     * @param {object} [options] - Optional configuration options to customize the instance and extensions.
     *                              These options are merged with the default settings.
     */
    constructor(id: ProviderId, options?: any) {
        this.id = id;
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
        const currentExtensions = this.EXTENSIONS;
        return class extends this {
            static EXTENSIONS = currentExtensions.concat(extensions.filter(ext => !currentExtensions.includes(ext)));
            constructor(options: any) {
                super(options)
            }
        }
    }
}