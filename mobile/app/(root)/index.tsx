import { SignOutButton } from "@/components/SignOutButton"
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTransactions } from "@/hooks/useTransactions.js"
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'; // ✅ make sure useCallback is here
import { StyleSheet } from 'react-native'

export default function Page() {
  const { user } = useUser()

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()
  console.log(session?.currentTask)

  const {transactions,isLoading,loadData,summary,deleteTransaction} = useTransactions(user?.id)


  useEffect(() => {
    loadData()
  },[loadData]);
  console.log("Transactions", transactions);
  console.log("Summary", summary);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      {/* Show the sign-in and sign-up buttons when the user is signed out */}
      <SignedOut>
        <Link href="/(auth)/signIn">
          <ThemedText>Sign in</ThemedText>
        </Link>
        <Link href="/(auth)/signUp">
          <ThemedText>Sign up</ThemedText>
        </Link>
      </SignedOut>
      {/* Show the sign-out button when the user is signed in */}
      <SignedIn>
        <ThemedText>Hello {user?.emailAddresses[0].emailAddress}</ThemedText>
        <SignOutButton />
      </SignedIn>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
})