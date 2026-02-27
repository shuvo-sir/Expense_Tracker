import { SignOutButton } from "@/components/SignOutButton"
import { useTransactions } from "@/hooks/useTransactions.js"
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Link, router, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'; // ✅ make sure useCallback is here
import PageLoading from '@/components/PageLoading'
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from "react-native";
import { styles } from "@/assets/styles/home.styles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionItem } from "@/components/TransactionItem";
import NoTransactionFound from "@/components/NoTransactionFound";


export default function Page() {
  const { user } = useUser()
  const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()
  console.log(session?.currentTask)

  const {transactions,isLoading,loadData,summary,deleteTransaction} = useTransactions(user?.id)


  useEffect(() => {
    loadData()
  },[loadData]);

  console.log("userId",user?.id)
    const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    }

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id)
        }
      ]
    )
  }

if (isLoading && !refreshing) return <PageLoading />
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left */}
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}>{user?.emailAddresses[0]?.emailAddress.split('@')[0]}</Text>
            </View>
          </View>
          {/* Right */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/signUp")}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>
        <BalanceCard summary={summary} />

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
      </View>

      <FlatList 
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data = {transactions}
        renderItem={({item}) => (
          <TransactionItem item={item} onDelete={handleDelete}/>
        )}
        ListEmptyComponent={<NoTransactionFound/>}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />
    </View>
  )
}

