import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {Asset, AssetType, getAssetsByWallet} from "@/lib";

export default function WalletAssets() {
  const { address } = useLocalSearchParams<{ address: string }>()

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    if (!address) return
    const loadAssets = async () => {
      setLoading(true)
      try {
        const walletAssets = await getAssetsByWallet(address!)
        setAssets(walletAssets)
      } catch (error) {
        console.error('Error loading assets:', error)
      }
      setLoading(false)
    }

    loadAssets()
  }, [address])

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'Token':
        return 'cash-outline'
      case 'NFT':
        return 'image-outline'
      case 'Contract':
        return 'code-working-outline'
      case 'Document':
        return 'document-text-outline'
      default:
        return 'help-circle-outline'
    }
  }

  const renderAsset = ({ item }: { item: Asset }) => (
    <View style={styles.assetCard}>
      <View style={styles.assetHeader}>
        <Ionicons name={getAssetIcon(item.type)} size={24} color="#007AFF" />
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <Text style={styles.assetType}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.metadataContainer}>
        {Object.entries(item.metadata).map(([key, value]) => (
          <View key={key} style={styles.metadataRow}>
            <Text style={styles.metadataKey}>{key}:</Text>
            <Text style={styles.metadataValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address:</Text>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
          {address}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text>Loading assets...</Text>
        </View>
      ) : assets.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No assets found for this wallet.</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          renderItem={renderAsset}
          keyExtractor={(item) => item.assetId}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addressContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  listContent: {
    padding: 15,
  },
  assetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetInfo: {
    marginLeft: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assetType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  metadataContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metadataKey: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  metadataValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
})
