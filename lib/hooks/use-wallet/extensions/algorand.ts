// Adding in Algorand Support
import {Provider} from "@/lib/hooks/use-wallet/types";
import {AlgodClient} from '@algorandfoundation/algokit-utils/algod-client'
import {IndexerClient} from '@algorandfoundation/algokit-utils/indexer-client'

export function WithAlgorand(provider: Provider, options: any){
    if(typeof provider.options.accounts !== 'undefined'){
        // Could load additional information
        // provider.accounts.forEach(account => {
        //     account.balance = 0;
        // })
    }
    return {
        indexer: options.indexer ? (typeof options.indexer.constructor !== 'undefined' && options.indexer.constructor.name === 'IndexerClient' ? options.indexer : new IndexerClient({baseUrl: provider.id, token: options.indexer, port: provider.port })) : null,
        algod: options.algod ? (typeof options.algod.constructor !== 'undefined' && options.algod.constructor.name === 'AlgodClient' ? options.algod : new AlgodClient({baseUrl: provider.id, token: options.algod, port: provider.port })) : null,
    }
}

export default WithAlgorand;