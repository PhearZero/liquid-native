
import {generateSecretKey, getActiveSecretKeyId, saveSecretKey} from "@/lib/keystore";
import {addProvider, Provider} from "@/lib/provider";
import {addWallet} from "@/lib/account";
import {isOnboarded, setOnboarded} from "@/lib/state";
import {v4 as uuid} from 'uuid';

export type OnboardOptions = {
    delayed?: boolean
    remember?: boolean
    provider: Provider
}

export async function onboardRocca({delayed, provider}: OnboardOptions) {
    const onboarded = await isOnboarded()
    if (onboarded) throw new Error("Already onboarded")

    // TODO: Await Handshake
    console.warn(`Faking Handshake with Provider`)

    // Generate a master key pair if none exists
    const masterKey = await getActiveSecretKeyId()
    if (!masterKey) {
        await saveSecretKey(await generateSecretKey("Rocca Secret"))
    }

    // assume some Provider library is called here to validate, it would return the address created
    // const {accounts, passkeys, credentials, etc} = await addProvider(provider)
    await addProvider({
        ...provider,
        options: {
            ...provider.options,
            // intermezzo: {
            //     address: ""
            // },
        }
    })
    // for each account in the provider, add a wallet entry
    await addWallet({
        id: uuid(), // This should come from the provider
        name: "RPC Wallet",
        type: "Intermezzo",
        providerId: provider.id,
        address: "INTERMEZZO2TBXYWZ3LNJAUGRF3Q7ZGUXUHFSVJL7KYLQXMBCDVJJCRK64" // Assume this came from intermezzo
    })

    await setOnboarded(true)
}