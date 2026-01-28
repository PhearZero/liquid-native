import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import {useEffect, useState} from 'react'

import {
  addWallet,
  generateWallet, getWallets,
} from "@/lib";
import {useWallet} from "@/lib/hooks/use-wallet/hook";
import {ReactNativeProvider} from "@/lib/hooks/use-wallet/providers/ReactNativeProvider";

export default function Setup() {
  const router = useRouter()
  const { delayed, skip_local_keys } = useLocalSearchParams<{ delayed?: string, skip_local_keys?:string }>()
  const [isGenerating, setIsGenerating] = useState(()=>skip_local_keys !== 'true')
  const {accounts, activeAccount, } = useWallet<ReactNativeProvider>();

  console.log(accounts, activeAccount)
    // console.log(query)
    useEffect(() => {
        async function setup(){
            const wallets = await getWallets()
            if(wallets.length > 0) return
            return addWallet(await generateWallet())
        }
        setup().then(()=>{
            router.replace({pathname: '/(main)/home'})
        })
            .catch((e)=>{
                console.error("Error during onboard", e)
                setIsGenerating(false)
            })
            .finally(()=>{
                setIsGenerating(false)
            })
    }, [router]);



  return (
    <View style={styles.container}>
      <Text style={styles.title}>{delayed === 'true' ? 'Creating Keys' : 'Setting up your Wallet'}</Text>
        {isGenerating && (<Text style={styles.description}>
        {delayed === 'true'
          ? 'We are generating your secure cryptographic keys. You can complete the full onboarding process later.'
          : 'We are generating your secure cryptographic keys and configuring your connection to the Algorand blockchain and OIDC4VC providers.'}
      </Text>)}

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Generating keys...</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444',
  },
  preferenceContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
})
