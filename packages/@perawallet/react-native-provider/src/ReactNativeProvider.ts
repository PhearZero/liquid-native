// Dependencies
import {AlgorandClient} from "@algorandfoundation/algokit-utils";

// Core Interfaces
import {Provider} from '@algorandfoundation/wallet-provider'
import type {KeyStoreApi, SecretKey} from '@algorandfoundation/keystore-extension';
import type {WalletAccount} from '@algorandfoundation/accounts-extension'

// Concrete Extensions
import WithBIP39Crypto, {BIP39CryptoApi} from '@algorandfoundation/bip39-crypto-extension';
import WithXHDCrypto, {XHDCryptoApi} from '@algorandfoundation/xhd-crypto-extension';
import WithXHDAccounts, {XHDWalletAccountsApi} from '@algorandfoundation/xhd-accounts-extension'

// Bespoke Wallet Extensions
import WithKeyStore from '@perawallet/react-native-keystore';
import type {Store} from "@tanstack/store";

/**
 * ReactNativeProvider is a specialized extension-based provider class designed to connect and configure
 * various cryptographic APIs, keystore management, wallet interfaces, and blockchain clients. It serves
 * as a centralized context for managing cryptographic operations and account handling, supporting the use
 * of specific extension modules.
 *
 * This class includes the ability to:
 * - Handle account management.
 * - Manage cryptographic operations using supported APIs.
 * - Interface with wallets and keystores.
 * - Interact with blockchain clients, such as Algorand.
 *
 * Note: The available extensions can be customized based on requirements. Extensions currently active are
 * defined statically in the `EXTENSIONS` constant.
 *
 * Features:
 * - Enables account management functionality allowing access to an array of accounts and an active account.
 * - Exposes cryptographic APIs tailored to specific use cases such as BIP39 and XHD wallets.
 * - Provides wallet and keystore APIs for secure key management.
 * - Offers interaction with external blockchain ecosystems like Algorand.
 * - Extensible for custom identity and passkey-related functionalities.
 */
export class ReactNativeProvider extends Provider<typeof ReactNativeProvider.EXTENSIONS> {
    static EXTENSIONS = [
        WithKeyStore,
        WithBIP39Crypto,
        WithXHDCrypto,
        WithXHDAccounts,
    ] as const

    secrets!: SecretKey[]
    $secrets!: Store<SecretKey[]>

    // State of Accounts which can sign transactions.
    accounts: WalletAccount[] = []
    activeAccount: WalletAccount | null = null

    //passkeys: any[] = []
    //identities: any[] = []

    // Crypto API Interfaces (Granularity TBD could be a single crypto extension with its own options to enable/disable)
    crypto!: XHDCryptoApi & { bip39: BIP39CryptoApi}

    // Available Wallet Interfaces
    wallet!:{
        xhd: XHDWalletAccountsApi
        //algo25: Algo25AccountsApi,
    }
    // The generic Keystore Interface
    keystore!: KeyStoreApi & {clear: () => Promise<void>}
    // Our good friends from AlgoKit
    algorand!: AlgorandClient

    // Implementation specifics with a concrete requirement (aka "Do Something in this Provided Context")
    async doSomethingInThisContext(){
        if (this.keystore && this.crypto.bip39.add) {
            // Use the dedicated bip39 keystore interface
            const key = await this.crypto.bip39.add()
            // Then the key should be available in storage
            console.log(await this.keystore.export(key.id))
        } else {
            // We no longer have access to the Keystore Interface, fallback to handling operations manually,
            // this is in limited cases where this Provider becomes widely adopted and may be implemented `withExtension` overrides.
            // We then would need to handle the edge cases to ensure that this method always completes as expected with all side effects accounted for.
            console.log(this.crypto.bip39.generate())
        }

    }
}