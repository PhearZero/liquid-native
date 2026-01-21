import 'react-native-get-random-values'
import {registerGlobals} from "react-native-webrtc";
import QRCodeStyled from 'react-native-qrcode-styled';
import { Image } from 'expo-image';
import {Button, StyleSheet, Text} from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import {SignalClient, toBase64URL} from '@algorandfoundation/liquid-client'
import {useCallback, useEffect, useMemo, useState} from "react";
import nacl from "tweetnacl";
import {get, create} from 'react-native-passkeys'

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

// Hard coded key
const TEST_ACCOUNT = {
  addr: "IKMUKRWTOEJMMJD4MUAQWWB4C473DEHXLCYHJ4R3RZWZKPNE7E2ZTQ7VD4",
  sk: new Uint8Array([
    153,
    99,
    94,
    233,
    195,
    182,
    109,
    64,
    9,
    200,
    81,
    184,
    78,
    219,
    114,
    95,
    177,
    210,
    244,
    157,
    200,
    206,
    99,
    196,
    224,
    196,
    38,
    72,
    151,
    81,
    204,
    245,
    66,
    153,
    69,
    70,
    211,
    113,
    18,
    198,
    36,
    124,
    101,
    1,
    11,
    88,
    60,
    23,
    63,
    177,
    144,
    247,
    88,
    176,
    116,
    242,
    59,
    142,
    109,
    149,
    61,
    164,
    249,
    53
  ])
}

// Remote configuration
const TEST_SERVER = "https://debug.liquidauth.com"
const RTC_CONFIGURATION = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
};

export default function HomeScreen() {
  const [requestId] = useState(()=>SignalClient.generateRequestId());
  const [status, setStatus] = useState('Connecting to Sockets...');
  const [hasSocket, setHasSocket] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  // Connect to service
  const client = useMemo(()=>new SignalClient(
      TEST_SERVER
  ), []);

  // Handle connection to service
  useEffect(() => {
    function handleSocketConnect(){
      setStatus("Connected to Sockets")
      setHasSocket(true)
    }
    function handleSocketDisconnected(){
      setStatus("Disconnected from Sockets")
      setHasSocket(false)
    }
    client.on('connect', handleSocketConnect);
    client.on('disconnect', handleSocketDisconnected);
    return ()=>{
      client.off('connect', handleSocketConnect);
      client.off('disconnect', handleSocketDisconnected);
    }
  }, [client, requestId]);

  useEffect(() => {
    if(hasSocket && showQRCode){
      handleDataChannel();
    }
  }, [hasSocket, showQRCode]);

  const handleDataChannel = useCallback(() => {
    if(!hasSocket) return
    async function connect() {
      setStatus('Waiting for Peer...')
      //liquid://debug.liquidauth.com/?requestId=019bde29-76eb-799d-992b-c9086ccc78c9
      const dc = await client.peer(
          requestId,
          'offer',
          RTC_CONFIGURATION
      );
      dc.send("Hello World")
      setStatus('Connected to Peer!')
    }
    try {
      connect();
    } catch (e) {
      console.log(e);
    }
  }, [client, hasSocket, requestId]);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {!showQRCode &&<Button
          onPress={()=>{
            client.attestation(async (challenge: Uint8Array) => {
              return {
                requestId: '019be241-f7b1-7995-bea2-fc92b22c0c00',
                origin: TEST_SERVER,
                type: 'algorand',
                address: TEST_ACCOUNT.addr,
                signature: toBase64URL(nacl.sign.detached(challenge, TEST_ACCOUNT.sk)),
                device: 'Demo Web Wallet'
              }
            }).then(r=>{
              console.log("Attestation Response", r)
            }).catch(e=>{
              console.log(e)
              setStatus(e.message)
            })
          }}
          title="Scan QR Code"
          color="#841584"
          accessibilityLabel="Scan a QR Code"
      />}
      <Text>Or use another app to connect by scanning the following QR Code (Liquid Auth, this Application)</Text>
      <Button title={showQRCode ? "Hide QR Code" : "Show QR Code"} onPress={()=>{
        setShowQRCode(!showQRCode)
      }}/>
      {showQRCode &&
          (<QRCodeStyled data={`liquid://${TEST_SERVER.replace('https://', '')}/?requestId=${requestId}`}/>)
      }


      <Text style={styles.titleInfo}>Debug Information</Text>
      <Text>
        Service: {TEST_SERVER}
      </Text>
      <Text>Device Request ID: {requestId}</Text>
      <Text>Status: {status}</Text>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleInfo: {
    fontSize: 20,
    textTransform: "uppercase"
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

