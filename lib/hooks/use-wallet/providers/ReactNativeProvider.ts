import {Provider} from '@/lib/hooks/use-wallet/types'
//TODO: consolidate with WebProvider and prefer package.exports for ReactNative overrides
//ie package.json { exports {react-native: 'keystore.native', default: 'keystore} }
import WithKeyStore from '@/lib/hooks/use-wallet/extensions/keystore/keystore.native';
import WithBIP39 from "@/lib/hooks/use-wallet/extensions/bip-39/bip-39.native";
import WithAccounts from "@/lib/hooks/use-wallet/extensions/accounts/algokit";
import WithAlgokit from '@/lib/hooks/use-wallet/extensions/algokit/algorand';
import {KeyStoreExtension} from "@/lib/hooks/use-wallet/extensions/keystore/types";
import {BIP39Extension} from "@/lib/hooks/use-wallet/extensions/bip-39/types";
import {AlgorandClient} from "@algorandfoundation/algokit-utils";

export class ReactNativeProvider extends (Provider as any)<typeof ReactNativeProvider.EXTENSIONS> {
    static EXTENSIONS = [WithKeyStore, WithBIP39, WithAlgokit, WithAccounts] as const
    accounts: any[] = []
    activeAccount: any = null
    bip39!: BIP39Extension
    keystore!: KeyStoreExtension
    algorand!: AlgorandClient

    constructor(state: any, options: any) {
        if(!options.algorand) {
            throw new Error('No Algorand Client Found')
        }
        super(state, options);
    }
    async doSomethingInThisContext(){
        const key = await this.bip39.generate()
        // The key should be available in storage
        await this.keystore.export(key.id)
    }
}