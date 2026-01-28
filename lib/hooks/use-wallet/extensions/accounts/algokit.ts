import {BaseProvider} from "@/lib/hooks/use-wallet/types";


const init = async (provider: BaseProvider, options: any) => {
    if(typeof provider.algorand === 'undefined' || typeof options.algorand === 'undefined') throw new Error('No Algorand Client Found')
    return {
        accounts: [],
        activeAccount: null,
        account: provider.algorand.account,
    }
}

export default init;
