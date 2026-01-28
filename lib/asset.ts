/**
 * Asset Handler
 *
 *
 * TODO: Consolidate models between this project and
 * @link https://github.com/perawallet/pera-react-native/blob/main/packages/assets/src/models/assets.ts
 * @link https://github.com/algorandfoundation/algokit-utils-ts/blob/decoupling/src/types/asset-manager.ts
 *
 */
import {CreatorAccount} from "@/lib/account";
import Decimal from "decimal.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ASSETS_KEY = 'rocca_assets'

export type AssetType = 'Token' | 'NFT' | 'Contract' | 'Document'

/**
 * Represents an asset with relevant properties and metadata.
 *
 * @interface Asset
 *
 * @property {string} assetId - The unique identifier of the asset.
 * @property {number} decimals - The number of decimal places for the asset's fractional units.
 * @property {CreatorAccount} creator - The account information of the asset's creator.
 * @property {Decimal} totalSupply - The total supply of the asset.
 * @property {string} [name] - The optional human-readable name of the asset.
 * @property {string} [unitName] - The optional short name or symbol representing the asset.
 * @property {string} [url] - An optional URL for additional information about the asset.
 * @property {Record<string, unknown>} metadata - A key-value store for additional metadata related to the asset.
 */
export interface Asset {
    assetId: string
    decimals: number
    creator: CreatorAccount
    totalSupply: Decimal
    name?: string
    unitName?: string
    url?: string
    type: AssetType
    //peraMetadata?: PeraAssetMetadata
    metadata: Record<string, unknown>
}

// export type PeraAssetMetadata = { // TODO: Pera Provider which extends the base Asset interface
//     isDeleted: boolean
//     verificationTier: PeraAssetVerificationTier
//     category?: number //TODO: Add category type
//     logo?: string | null
//     readonly isVerified?: boolean
//     readonly explorerUrl?: string
//     collectible?: PeraCollectible
//     type?: PeraAssetType
//     readonly labels?: PeraAssetLabel[]
//     projectUrl?: string
//     projectName?: string
//     readonly logoSvg?: string | null
//     discordUrl?: string
//     telegramUrl?: string
//     twitterUsername?: string
//     description?: string
//     readonly availableOnDiscoverMobile?: string
//     isFrozen?: boolean
//     canClawback?: boolean
// }

export async function getAssets(): Promise<Asset[]> {
    const value = await AsyncStorage.getItem(ASSETS_KEY)
    return value ? JSON.parse(value) : []
}

export async function saveAssets(assets: Asset[]): Promise<void> {
    await AsyncStorage.setItem(ASSETS_KEY, JSON.stringify(assets))
}

/**
 * Add an asset to a local entity
 * @param creator
 * @param type
 * @param name
 * @param metadata
 */
export async function addAsset(
    creator: CreatorAccount,
    type: AssetType,
    // TODO: add AssetManager and Utils for deployment
    name: string,
    metadata: Record<string, unknown> = {},
): Promise<Asset> {
    const asset: Asset = {
        decimals: 10,
        totalSupply: new Decimal(100),
        assetId: Math.random().toString(36).substring(7),
        creator: creator,
        type,
        name,
        metadata,
    }
    const assets = await getAssets()
    assets.push(asset)
    await saveAssets(assets)

    return asset
}

export async function getAssetsByWallet(walletAddress: string): Promise<Asset[]> {
    const assets = await getAssets()
    return assets.filter((a) => a.creator.address === walletAddress)
}

export async function getAllAssets(): Promise<Asset[]> {
    return await getAssets()
}

export async function removeAsset(assetId: string): Promise<void> {
    const assets = await getAssets()
    const filteredAssets = assets.filter((a) => a.assetId !== assetId)
    await saveAssets(filteredAssets)
}

export async function updateAssetMetadata(assetId: string, metadata: Record<string, unknown>): Promise<void> {
    const assets = await getAssets()
    const index = assets.findIndex((a) => a.assetId === assetId)
    if (index >= 0) {
        assets[index].metadata = {...assets[index].metadata, ...metadata}
        await saveAssets(assets)
    }
}