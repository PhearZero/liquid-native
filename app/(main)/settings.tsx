import {View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Modal, TextInput} from 'react-native'
import {useState, useEffect, useCallback} from 'react'
import {useRouter} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import {
    getActiveSecretKeyId,
    getActiveSecretKey,
    getAllSecretKey,
    getPreferences,
    getProviders,
    SecretKey,
    Preferences,
    Provider,
    saveSecretKey,
    savePreferences,
    setActiveSecretKeyId,
    updateProvider, generateSecretKey, isValidMnemonic
} from "@/lib";
import {clearAll} from "@/lib/utils/debug";
import {v4 as uuid} from "uuid";
type KeyManagementModalType = "import-key" | "export-key"

/**
 * Component that renders a modal for importing metadata.
 * Users can paste a JSON-formatted keypair, which will be processed and saved if valid.
 *
 * @TODO: Add validation for imported keypair, hydrate entire store
 * @param {Object} props The component properties.
 * @param {function(): void} props.onClose Function to be called when the modal is closed.
 * @param {function(Error): void} props.onError Function to handle errors that occur during the import process.
 * @return {JSX.Element} A modal component with functionalities to import metadata or cancel the process.
 */
function ImportModal({secrets, onClose, onError}: { secrets: SecretKey[], onClose: () => void, onError: (error: Error) => void }) {
    const [mnemonicInput, setMnemonicInput] = useState('')
    const [errorstate, setErrorState] = useState<string | null>(null)
    const [secretName, setSecretName] = useState('')

    useEffect(() => {
        if(!isValidMnemonic(mnemonicInput)){
            setErrorState("Invalid mnemonic phrase")
        } else {
            setErrorState(null)
        }
    }, [mnemonicInput, setErrorState]);

    useEffect(() => {
        if(!secretName || errorstate) return
        if(secrets.map((s)=>s.name).includes(secretName)){
            setErrorState("Secret name already exists")
        }
    }, [errorstate, secretName, secrets]);

    const confirmImport = useCallback(async () => {
        if (!mnemonicInput || errorstate) return

        await saveSecretKey({
            name: "Imported Key",
            value: mnemonicInput,
            id: uuid()
        })
        setMnemonicInput('')
            onClose();
    }, [errorstate, mnemonicInput, onClose])
    return (
        <>
            <Text style={styles.modalTitle}>Import Metadata</Text>
            <Text style={styles.modalDescription}>Paste your keypair JSON here:</Text>
            <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                onChangeText={setMnemonicInput}
                value={mnemonicInput}
                placeholder='three need zone holiday ...'
            />
            <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                        setMnemonicInput('')
                        onClose()
                    }}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.importButton]}
                    onPress={confirmImport}
                >
                    <Text style={styles.importButtonText}>Import</Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

/**
 * Represents a modal component used to export cryptographic key metadata as JSON.
 *
 * @TODO: Lock down application for screen capture
 * @param {Object} params An object containing the callback functions for handling interactions.
 * @param {() => void} params.onClose A callback function triggered when the modal is closed.
 * @param {(error: Error) => void} params.onError A callback function triggered when an error occurs during the export process.
 * @return {JSX.Element} A React component rendering the export modal.
 */
function ExportModal({onClose, onError}: { onClose: () => void, onError: (error: Error) => void }) {
    const [exportedKey, setExportedKey] = useState('')
    const exportKey = useCallback(async () => {
        if (exportedKey) {
            onClose()
            return
        }
        try {
            const activeSecret = await getActiveSecretKey()
            if (!activeSecret) Alert.alert('Error', 'No active keypair found')
            setExportedKey(activeSecret!.value)
        } catch (e) {
            onError(e as Error)
        }
    }, [onClose, onError, exportedKey])
    return (
        <>
            <Text style={styles.modalTitle}>Export </Text>
            <Text style={styles.modalDescription}>Your current keypair will be exported as a mnemonic phrase:</Text>
            {exportedKey && <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                value={exportedKey}
                editable={false}
            />}
            {!exportedKey && <Text style={styles.textInput}>Ensure that you are in a safe location before displaying the
                secret</Text>}
            <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.importButton]}
                    onPress={exportKey}
                >
                    <Text style={styles.importButtonText}>{!exportedKey ? 'Confirm' : 'Close'}</Text>
                </TouchableOpacity>
            </View>
        </>)
}

function KeyManagementModal({secrets, open, view, onClose}: {
    secrets: SecretKey[],
    open: boolean,
    view: KeyManagementModalType,
    onClose: () => void
}) {

    const handleError = (e: Error) => {
        Alert.alert('Error', e.message)
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={open}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    {view === "import-key" && <ImportModal secrets={secrets} onClose={onClose} onError={handleError}/>}
                    {view === "export-key" && <ExportModal onClose={onClose} onError={handleError}/>}
                </View>
            </View>
        </Modal>
    )
}

export default function Settings() {
    const router = useRouter()
    const [algorandNode] = useState('Unknown')
    const [didResolver] = useState('Unknown')
    const [oidcOrigin] = useState('Unknown')
    const [preferences, setPreferences] = useState<Preferences>({feeCoverageEnabled: true})
    const [secretKeys, setSecretKeys] = useState<SecretKey[]>([])
    const [activeKeyId, setActiveKeyId] = useState<string | null>(null)
    const [providers, setProviders] = useState<Provider[]>([])

    const [modal, setModal] = useState<{ open: boolean, view: KeyManagementModalType }>({
        open: false,
        view: "import-key"
    })


    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [prefs, pairs, activeId, storedProviders] = await Promise.all([
            getPreferences(),
            getAllSecretKey(),
            getActiveSecretKeyId(),
            getProviders(),
        ])
        setPreferences(prefs)
        setSecretKeys(pairs)
        setActiveKeyId(activeId || (pairs.length > 0 ? pairs[0].id : null))
        setProviders(storedProviders)
    }

    const toggleFeeCoverage = async (value: boolean) => {
        const newPrefs = {...preferences, feeCoverageEnabled: value}
        setPreferences(newPrefs)
        await savePreferences(newPrefs)
    }

    const toggleProviderFeeCoverage = async (providerId: string, value: boolean) => {
        const updatedProviders = providers.map((p) => (p.id === providerId ? {...p, feeCoverageEnabled: value} : p))
        setProviders(updatedProviders)
        const provider = updatedProviders.find((p) => p.id === providerId)
        if (provider) {
            await updateProvider(provider)
        }
    }

    const handleSwitchMasterKey = async (id: string) => {
        await setActiveSecretKeyId(id)
        setActiveKeyId(id)
    }

    const handleAddMasterKey = async () => {
        await saveSecretKey(await generateSecretKey())
        await loadData()
    }


    const handleReset = async () => {
        Alert.alert('Reset Demo', 'This will clear all saved wallets and onboarding status. Continue?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                    await clearAll().catch(console.error)
                    router.replace('/')
                },
            },
        ])
    }


    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Secrets</Text>
                {secretKeys.map((pair) => (
                    <TouchableOpacity key={pair.id} style={styles.settingItem}
                                      onPress={() => handleSwitchMasterKey(pair.id)}>
                        <View>
                            <Text style={styles.settingLabel}>{pair.name}</Text>
                            <Text style={styles.settingValue}>{pair.id}...</Text>
                        </View>
                        {activeKeyId === pair.id && <Ionicons name="checkmark-circle" size={24} color="#4CD964"/>}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.settingItem} onPress={handleAddMasterKey}>
                    <Text style={[styles.settingLabel, {color: '#007AFF'}]}>Generate New Key</Text>
                    <Ionicons name="add" size={24} color="#007AFF"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem} onPress={() => {
                    setModal({...modal, view: "import-key", open: true})
                }}>
                    <Text style={[styles.settingLabel, {color: '#007AFF'}]}>Import Existing Key</Text>
                    <Ionicons name="add" size={24} color="#007AFF"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem} onPress={() => {
                    setModal({...modal, view: "export-key", open: true})
                }}>
                    <Text style={[styles.settingLabel, {color: '#007AFF'}]}>Export Active Key</Text>
                    <Ionicons name="archive" size={24} color="#007AFF"/>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connections & Providers</Text>
                <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/connect')}>
                    <Text style={styles.settingLabel}>Connect to Provider (QR)</Text>
                    <Text style={styles.linkText}>Open Scanner</Text>
                </TouchableOpacity>

                {providers.map((provider, i) => (
                    <View key={i} style={styles.providerItem}>
                        <View style={styles.providerInfo}>
                            <Text style={styles.settingLabel}>{provider.name}</Text>
                            <Text style={styles.settingValue}>{provider.url.toString()}</Text>
                        </View>
                        <View style={styles.feeToggle}>
                            <Text style={styles.feeToggleLabel}>Fee Coverage</Text>
                            <Switch
                                value={provider.options.feeCoverage}
                                onValueChange={(value) => toggleProviderFeeCoverage(provider.id, value)}
                            />
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Service Providers</Text>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Algorand Node</Text>
                    <Text style={styles.settingValue}>{algorandNode}</Text>
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>DID Resolver</Text>
                    <Text style={styles.settingValue}>{didResolver}</Text>
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>OIDC4VC Issuer/Verifier</Text>
                    <Text style={styles.settingValue}>{oidcOrigin}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Auto-fee Coverage</Text>
                    <Switch value={preferences.feeCoverageEnabled} onValueChange={toggleFeeCoverage}/>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Debug / Demo</Text>
                <TouchableOpacity style={styles.settingItem} onPress={handleReset}>
                    <Text style={[styles.settingLabel, {color: 'red'}]}>Reset Demo Data</Text>
                </TouchableOpacity>
            </View>

            <KeyManagementModal secrets={secretKeys} open={modal.open} onClose={() => {
                setModal({...modal, open: false})
            }} view={modal.view}/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        marginTop: 15,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingLabel: {
        fontSize: 16,
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
    },
    linkText: {
        fontSize: 14,
        color: '#007AFF',
    },
    providerItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    providerInfo: {
        marginBottom: 10,
    },
    feeToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
    },
    feeToggleLabel: {
        fontSize: 14,
        color: '#444',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    textInput: {
        width: '100%',
        height: 120,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    importButton: {
        backgroundColor: '#007AFF',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    importButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})
