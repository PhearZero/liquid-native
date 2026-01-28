import {useContext} from "react";
import {AlgorandContext} from "@/lib/hooks/use-wallet/provider";

import {BaseProvider} from "@/lib/hooks/use-wallet/types";

export function useWallet<P extends BaseProvider = BaseProvider>(){
    const provider = useContext(AlgorandContext) as P | null;

    if(provider === null) throw new Error('No Provider Found')
    return provider;
}