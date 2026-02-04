import {useContext} from "react";
import {AlgorandContext} from "./provider.js";
import type {BaseProvider} from "@algorandfoundation/wallet-provider";
import {Store} from "@tanstack/store";
import {useStore} from "@tanstack/react-store";

import {ReactNativeProvider} from "@perawallet/react-native-provider";

// Get the context and api surface
export function useWallet<P extends BaseProvider = BaseProvider>(){
    const provider = useContext(AlgorandContext) as P | null;
    if(provider === null) throw new Error('No Provider Found')

    // This could provide the default stores that evolve. (keystore, accounts, etc)
    let secrets = useStore((provider as any).$secrets as Store<any>, (s)=>s);
    return {
        ...provider, secrets
    };
}

// Create implicit bindings to the state
// export function useKeyStore(){
//     const provider: ReactNativeProvider = useWallet()
//     const secrets = useStore(provider.$secrets, (s)=>s);
//     return {
//         secrets,
//         keystore: provider.keystore
//     }
// }