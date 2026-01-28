import AsyncStorage from "@react-native-async-storage/async-storage";

export const PROVIDERS_KEY = 'algo_providers'

export interface ExtensionOptions {
    algod?: string | false
    intermezzo?: boolean
    liquid?: boolean
    feeCoverage?: boolean
    //oidc4v: unknown
}

/**
 * Represents a provider with associated configuration and capabilities.
 *
 * @interface Provider
 * @property {string} id The unique identifier for the provider.
 * @property {string} name The name of the provider.
 * @property {string} url The base URL of the provider.
 * @property {Object} extensions Additional capabilities and configuration options for the provider.
 * @property {Object} extensions.algod Configuration for the Algorand-related services.
 * @property {string} extensions.algod.token The token used for authenticating with the Algorand service.
 * @property {string} extensions.algod.server The server URL for the Algorand service.
 * @property {string} extensions.algod.port The port used for connecting to the Algorand service.
 * @property {boolean} extensions.intermezzo Indicates whether intermezzo capabilities are enabled.
 * @property {boolean} extensions.liquid Indicates whether liquid functionality is supported.
 * @property {boolean} extensions.feeCoverage Specifies if the provider covers transaction fees.
 */
export interface Provider {
    id: string
    name: string
    url: URL
    type: ProviderType
    port?: number
    ssl?: boolean
    options: ExtensionOptions

    // TODO: Build concrete provider
    //static EXTENSIONS: any
    //connect(): void
    //disconnect(): void
}

export type ProviderType = 'algo' | 'provider' | 'liquid' | 'fido' | 'walletconnect' | 'pera'
export function fromQRCode(text: string): Provider {
    let data
    try {
        data = JSON.parse(text)
        return {
            ...data,
            type: data.type as ProviderType,
            options: data.extensions as ExtensionOptions
        }
    } catch (e) {
        const parsedUrl = new URL(text)
        const type = parsedUrl.protocol.split(':')[0] as ProviderType
        return {
            id: parsedUrl.hostname,
            name: parsedUrl.searchParams.get('name') || "Generic Wallet Provider",
            url: parsedUrl,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : undefined,
            ssl: parsedUrl.protocol !== 'http:', // Only use HTTP explicitly, everything should be ssl by default
            type,
            options: {
                algod: parsedUrl.searchParams.get('algod') || undefined,
                liquid: type === 'liquid' || parsedUrl.searchParams.get('liquid') === "true",
                intermezzo: type === 'algo' || parsedUrl.searchParams.get('intermezzo') === "true",
                //indexer: parsedUrl.searchParams.get('indexer') || undefined
            }
        }
    }
}
export async function getProviders(): Promise<Provider[]> {
    const value = await AsyncStorage.getItem(PROVIDERS_KEY)
    return value ? JSON.parse(value) : []
}

export async function getProviderById(id: string): Promise<Provider | null> {
    const providers = await getProviders()
    return providers.find((p) => p.id === id) || null
}

export async function saveProviders(providers: Provider[]): Promise<void> {
    await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers))
}

export async function addProvider(provider: Partial<Provider>): Promise<void> {
    const providers = await getProviders()
    providers.push(provider as Provider)
    await saveProviders(providers)
}

export async function updateProvider(provider: Provider): Promise<void> {
    const providers = await getProviders()
    const index = providers.findIndex((p) => p.id === provider.id)
    if (index >= 0) {
        providers[index] = provider
        await saveProviders(providers)
    }
}