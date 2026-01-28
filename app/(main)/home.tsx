import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Easing } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState, useRef } from 'react'
import {
  addWallet,
  generateWallet,
  getProviders,
  getWallets,
  Provider,
  Wallet,
} from "@/lib";
import {Identity} from "@/lib/identity";

export default function Home() {
  const router = useRouter()

  const [isGenerating, setIsGenerating] = useState(false)
  const [showCheckmark, setShowCheckmark] = useState(false)
  const spinValue = useRef(new Animated.Value(0)).current

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [identities, setIdentities] = useState<Identity[]>([])

  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    } else {
      spinValue.setValue(0)
    }
  }, [isGenerating])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  useEffect(() => {
    if(isGenerating) return
    loadWallets().then(r => console.log)
    loadProviders()
  }, [isGenerating])

  const loadWallets = async () => {
    const storedWallets = await getWallets()
    setWallets(storedWallets)
  }

  const loadProviders = async () => {
      const providers = await getProviders()
      console.log(providers)
      setProviders(providers)
  }

  const handleGenerateWallet = async () => {
    setIsGenerating(true)
    const wallet = await generateWallet();
    await addWallet(wallet)
    await loadWallets()
    setIsGenerating(false)
    setShowCheckmark(true)
    setTimeout(() => {
      setShowCheckmark(false)
    }, 600)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Wallet</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/settings')}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
        { providers.length > 0 && identities.length > 0  && <View style={styles.card}>
            <Text style={styles.cardTitle}>My Identity (OIDC4VC)</Text>
            <View style={styles.credentialRow}>
                <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
                <View style={styles.credentialInfo}>
                    <Text style={styles.credentialName}>Verified Person</Text>
                    <Text style={styles.credentialIssuer}>Issued by: Rocca IDP</Text>
                </View>
            </View>
        </View>}
        {providers.length === 0 && identities.length === 0 && <TouchableOpacity style={styles.card} onPress={()=>router.push('/connect')}>
            <View style={styles.credentialRow}>
                <Ionicons name="qr-code" size={32} color="#007AFF" />
                <View style={styles.credentialInfo}>
                    <Text style={styles.credentialName}>Scan QR Code</Text>
                    <Text style={styles.credentialIssuer}>Import providers to the wallet</Text>
                </View>
            </View>
        </TouchableOpacity>}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Accounts</Text>
          <TouchableOpacity onPress={handleGenerateWallet} disabled={isGenerating || showCheckmark}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons 
                name={isGenerating ? "refresh-outline" : showCheckmark ? "checkmark-circle-outline" : "add-circle-outline"} 
                size={24} 
                color={showCheckmark ? "#4CD964" : "#007AFF"} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {wallets.map((wallet, i) => (
          <TouchableOpacity
            key={i}
            style={styles.walletRow}
            onPress={() => {
              router.push(`/account/${wallet.address}`)
            }}
          >
            <View>
              <Text style={styles.walletName}>{wallet.type}-{wallet.name}</Text>
              <Text style={styles.walletAddress}>{wallet.address.slice(0, 10) + '...' + wallet.address.slice(-10)}</Text>
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceText}>0.00 ALGO</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: 10 }}>
          <Text style={styles.subtitle}>Total Assets</Text>
          <View style={styles.assetRow}>
            <Text>ALGO</Text>
            <Text>00.00</Text>
          </View>
          <View style={styles.assetRow}>
            <Text>USDC (ASA)</Text>
            <Text>00.00</Text>
          </View>
        </View>
      </View>


    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
    fontWeight: '600',
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
  },
  walletAddress: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  credentialInfo: {
    marginLeft: 15,
  },
  credentialName: {
    fontSize: 16,
    fontWeight: '600',
  },
  credentialIssuer: {
    fontSize: 12,
    color: '#666',
  },
})
