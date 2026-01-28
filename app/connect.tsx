import React, {useState, useEffect, useMemo, useCallback} from 'react'
import {StyleSheet, Text, View, Button, TouchableOpacity, Alert} from 'react-native'
import {CameraView, useCameraPermissions} from 'expo-camera'
import QRCode from 'react-native-qrcode-svg'
import {useRouter} from 'expo-router'
import {
    addWallet,
    fromQRCode, generateSecretKey, generateWallet,
    getActiveSecretKeyId,
    getProviderById, getSecretKeyById,
    getWallets,
    onboardRocca,
    Provider, saveSecretKey, setActiveSecretKeyId,
    signChallengeBytes
} from "@/lib";
import {SignalClient, toBase64URL} from "@algorandfoundation/liquid-client";

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

export function Present(){
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
            setShowQRCode(true)
        }
        function handleSocketDisconnected(){
            setStatus("Disconnected from Sockets")
            setHasSocket(false)
            setShowQRCode(false)
        }
        client.on('connect', handleSocketConnect);
        client.on('disconnect', handleSocketDisconnected);
        return ()=>{
            client.off('connect', handleSocketConnect);
            client.off('disconnect', handleSocketDisconnected);
        }
    }, [client, requestId]);

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

    useEffect(() => {
        if(hasSocket && showQRCode){
            handleDataChannel();
        }
    }, [handleDataChannel, hasSocket, showQRCode]);
    return (
        <View style={styles.presentContainer}>
            <Text style={styles.instruction}>Present this QR code to a Peer</Text>
            <QRCode value={client.deepLink(requestId)} size={250}/>
            <Text style={styles.didText}>{status}</Text>
        </View>
    )
}

export function Scan(){
    const router = useRouter()
    const [scanned, setScanned] = useState(false)

    const handleLiquid = async (provider: Provider) => {
        console.log("Attempting to connect to Liquid Provider: ", provider)

        // Get a local wallet
        if((await getWallets()).filter(w=>w.secretKeyId).length === 0){
            await addWallet(await generateWallet())
        }
        const wallets = await getWallets();
        const wallet = wallets.find(w=>w.secretKeyId) ?? wallets[0]

        console.log("Using wallet: ", wallet)

        // TODO: read the QR Code
        const client = new SignalClient(TEST_SERVER)
        client.attestation(async (challenge: Uint8Array) => {
            return {
                requestId: '019be241-f7b1-7995-bea2-fc92b22c0c00',
                origin: TEST_SERVER,
                type: 'algorand',
                address: wallet.address,
                signature: signChallengeBytes(wallet, challenge),
                device: 'Demo Web Wallet'
            }
        }).then(r=>{
            console.log("Attestation Response", r)
        }).catch(e=>{
            console.log(e)
            Alert.alert(e.message)
        })
    }

    const handleRocca = async (provider: Provider) => {

        const existingProvider = await getProviderById(provider.id)
        if (existingProvider) {
            Alert.alert("Provider already added", "This provider has already been added to your wallet.")
            return
        }
        const url = provider.url;

        // TODO: Formalize the different URL structures for different intents
        const params = new URLSearchParams(url.search);
        const isDelegatedAccount = params.get("delegate") === "true";
        const isFeeCoverageEnabled = params.get("feeCoverage") === "true";

        const title = isDelegatedAccount ? "Account Custodian" : "Provider Found";
        const description = isDelegatedAccount ? "This account will be used to delegate transactions to via the provider" : "This provider will be used to issue and verify credentials";

        const body = `Do you wish to connect to this Rocca service?\n\n${url.host}\n\n${description}.`;

        Alert.alert(title, body, [
            {
                text: 'Connect',
                onPress: async () => {
                    await onboardRocca({provider})

                    router.push(`/onboarding/setup`)
                },
            },
            {
                text: 'Cancel',
                onPress: () => setScanned(false),
                style: 'cancel',
            },
        ])
    }
    const handleBarcodeScanned = ({type, data}: { type: string; data: string }) => {
        // Handle QR Code Scanned
        if (type === 'qr') {
            // TODO: Formal Logger
            console.log("QR Code Scanned: ", data)

            setScanned(true)

            const provider = fromQRCode(data)
            switch (provider.type) {
                case "rocca": // Connecting to a Rocca Provider includes intermezzo onboarding and fee delegation.
                    handleRocca(provider)
                    break;
                case "liquid": // Connecting to another wallet or service
                    handleLiquid(provider)
                    break;
                case "fido": // TODO: Handle native intent (just pass to system to handle deep-link)
                case "algo": // TODO: Pass the request to a TransactionSigner
                case "provider": // TODO: generic QR for any Provider (ie Third parties custom provider while testing)
                case "pera": // TODO: Pera deep links
                case "walletconnect": // TODO: Most likely remove this, here just in case
                    throw new Error("Not implemented")

            }
        }
    }
    return (
        <View style={styles.scannerContainer}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)}/>}
        </View>
    )
}

export default function Connect() {
    const [permission, requestPermission] = useCameraPermissions()
    const [mode, setMode] = useState<'scan' | 'present'>('scan')
    const router = useRouter()


    useEffect(() => {
        if (mode === 'scan' && (!permission || !permission.granted)) {
            requestPermission()
        }
    }, [mode, permission, requestPermission])

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permission</Text>
            </View>
        )
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text>
                <Button title="Request Permission" onPress={requestPermission}/>
                <Button title="Go Back" onPress={() => router.back()}/>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={[styles.tab, mode === 'scan' && styles.activeTab]}
                                  onPress={() => setMode('scan')}>
                    <Text style={[styles.tabText, mode === 'scan' && styles.activeTabText]}>Scan QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, mode === 'present' && styles.activeTab]}
                    onPress={() => setMode('present')}
                >
                    <Text style={[styles.tabText, mode === 'present' && styles.activeTabText]}>Present QR</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {mode === 'scan' ? (
                    <Scan/>
                ) : (
                    <Present/>
                )}
            </View>

            <View style={styles.footer}>
                <Button title="Close" onPress={() => router.back()}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    presentContainer: {
        alignItems: 'center',
        padding: 20,
    },
    instruction: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    didText: {
        marginTop: 20,
        color: '#666',
        fontSize: 12,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
})
