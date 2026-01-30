import {Provider} from '@/lib/hooks/use-wallet/types'
//TODO: consolidate with WebProvider and prefer package.exports for ReactNative overrides
//ie package.json { exports {react-native: 'keystore.native', default: 'keystore} }
import WithKeyStore from '@/lib/hooks/use-wallet/extensions/keystore/keystore.native';
import WithAccounts from "@/lib/hooks/use-wallet/extensions/accounts/algokit";
import WithAlgorand from '@/lib/hooks/use-wallet/extensions/algorand';
import {KeyStoreExtension} from "@/lib/hooks/use-wallet/extensions/keystore/types";
import WithBIP39, {BIP39Extension} from "@/lib/hooks/use-wallet/extensions/bip-39";
import {AlgorandClient} from "@algorandfoundation/algokit-utils";

export class ReactNativeProvider extends Provider<typeof ReactNativeProvider.EXTENSIONS> {
    static EXTENSIONS = [
        WithKeyStore,
        WithBIP39,
        WithAlgorand,
        WithAccounts
    ] as const

    // State of Accounts which can spend
    accounts: any[] = []
    activeAccount: any = null

    // Credentials from various providers
    credentials: any[] = []
    activeCredential: any = null

    // Passkeys from various providers
    passkeys: any[] = []
    activePasskey: any = null


    // API interfaces
    bip39!: BIP39Extension
    keystore!: KeyStoreExtension
    algorand!: AlgorandClient

    // Implementation specifics with requirements
    constructor(provider: Provider) {
        super(provider, options);
        console.log(this)
    }
    async doSomethingInThisContext(){
        const key = await this.bip39.generate()
        // The key should be available in storage
        await this.keystore.export(key.id)
    }
}