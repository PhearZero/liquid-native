import 'react-native-get-random-values'
import {registerGlobals} from "react-native-webrtc";
import QRCodeStyled from 'react-native-qrcode-styled';
import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import {SignalClient, fetchAttestationRequest} from '@algorandfoundation/liquid-client'
import {useEffect, useMemo, useState} from "react";

registerGlobals()

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
  fetchAttestationRequest(TEST_SERVER).then((r)=>{
    console.log(r)
  }).catch((e)=>{
    console.error(e)
  })
  const client = useMemo(()=>new SignalClient(
      TEST_SERVER
  ), []);


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
  }, [client]);

  useEffect(() => {
    if(!hasSocket) return
    async function connect() {
      setStatus('Waiting for Peer...')
      //liquid://debug.liquidauth.com/?requestId=019bde29-76eb-799d-992b-c9086ccc78c9
      const dc = await client.peer(
          requestId,
          'offer',
          RTC_CONFIGURATION
      );
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
      <QRCodeStyled data={`liquid://${TEST_SERVER.replace('https://', '')}/?requestId=${requestId}`}/>
      <Text>
        Service: {TEST_SERVER}
      </Text>
      <Text>Request ID: {requestId}</Text>
      <Text>Status: {status}</Text>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
