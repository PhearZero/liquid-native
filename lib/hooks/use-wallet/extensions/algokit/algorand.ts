import {Provider} from "@/lib/hooks/use-wallet/types";
import {AlgorandClient} from "@algorandfoundation/algokit-utils";

export const init = (provider: Provider, options: any)=>{
    console.log(options)
    return {
        algorand: AlgorandClient.fromConfig(options.algorand),
    }
}

export default init