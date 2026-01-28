import { install } from 'react-native-quick-crypto';
import 'react-native-get-random-values'
import 'text-encoding'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import {isOnboarded} from "@/lib";
import {toBase64URL} from "@algorandfoundation/liquid-client";
import {create, get} from "react-native-passkeys";
import {registerGlobals} from "react-native-webrtc";
install();

// Monkey-patch WebRTC
registerGlobals();

// We are monkey-patching the globals for consistency
global.navigator.credentials = {
  get(obj){
    return get(obj?.publicKey)
  },
  async create(obj: {publicKey?: PublicKeyCredentialCreationOptions}){
    const publicKey = obj?.publicKey
    console.log(publicKey)
    const data = await create({
      attestation: "none",
      challenge: toBase64URL(publicKey?.challenge),
      user: {
        id: toBase64URL(publicKey?.user?.id),
        name: publicKey?.user?.name,
        displayName: publicKey?.user?.displayName,
      },
      authenticatorSelection: publicKey?.authenticatorSelection,
      pubKeyCredParams: publicKey?.pubKeyCredParams,
      rp: {
        name: publicKey?.rp?.name,
        id: publicKey?.rp?.id,
      }
    });
    console.log(data);
    return data
  }
}
export default function Index() {
  const [isLoading, setIsLoading] = useState(true)
  const [_isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    isOnboarded().then((onboarded) => {
      setIsOnboarded(onboarded)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (!_isOnboarded) {
    return <Redirect href="/onboarding/welcome" />
  }

  return <Redirect href="/(main)/home" />
}
