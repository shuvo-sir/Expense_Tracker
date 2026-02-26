import { styles } from '@/assets/styles/home.styles'
import { COLORS } from '@/constants/colors'
import { useClerk } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use useClerk() to access the signOut() function
  const {signOut} = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
   Alert.alert("Log Out", "Are you sure you want to log out?", [
    {
      text: "Cancel",
      style: "cancel"
    },
    {
      text: "Log Out",
      style: "destructive", onPress: signOut}
   ])
  }

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
    </TouchableOpacity>
  )
}