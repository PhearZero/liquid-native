import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'


export default function Welcome() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your wallet</Text>
      <Text style={styles.subtitle}>A hybrid Identity and financial services solution.</Text>

      <View style={styles.buttonContainer}>
        <Button title="Connect to Provider (QR)" onPress={() => router.push('/connect')} />
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push({ pathname: '/onboarding/setup', params: { delayed: 'true' } })}
      >
        <Text style={styles.secondaryButtonText}>Create Keys and skip onboarding</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
  },
  secondaryButton: {
    marginTop: 20,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
})
