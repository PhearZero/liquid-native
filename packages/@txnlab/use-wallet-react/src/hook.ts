import {useContext} from "react";
import {AlgorandContext} from "./provider.js";
import type {BaseProvider} from "@algorandfoundation/wallet-provider";
import {Store} from "@tanstack/store";
import {useStore} from "@tanstack/react-store";

export function useWallet<P extends BaseProvider = BaseProvider>(){
    const provider = useContext(AlgorandContext) as P | null;
    if(provider === null) throw new Error('No Provider Found')

    // Handle Store Hydration, this will be more robust in the future.
    // ie. Object.entries to construct the result
    let secrets = useStore((provider as any).$secrets as Store<any>, (s)=>s);


    return {
        ...provider,
        secrets
    };
}