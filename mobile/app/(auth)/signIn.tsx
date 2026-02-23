import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { StyleSheet, TextInput, View, Pressable } from 'react-native'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [showEmailCode, setShowEmailCode] = React.useState(false)

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else if (signInAttempt.status === 'needs_second_factor') {
        // Check if email_code is a valid second factor
        // This is required when Client Trust is enabled and the user
        // is signing in from a new device.
        // See https://clerk.com/docs/guides/secure/client-trust
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        )

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          setShowEmailCode(true)
        }
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password])

  // Handle the submission of the email verification code
  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, signIn, setActive, router, code])

  // Display email code verification form
  if (showEmailCode) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Verify your email
        </ThemedText>
        <ThemedText style={styles.description}>
          A verification code has been sent to your email.
        </ThemedText>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onVerifyPress}
        >
          <ThemedText style={styles.buttonText}>Verify</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Sign in
      </ThemedText>
      <ThemedText style={styles.label}>Email address</ThemedText>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
      />
      <ThemedText style={styles.label}>Password</ThemedText>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSignInPress}
        disabled={!emailAddress || !password}
      >
        <ThemedText style={styles.buttonText}>Sign in</ThemedText>
      </Pressable>
      <View style={styles.linkContainer}>
        <ThemedText>Don't have an account? </ThemedText>
        <Link href="/signUp">
          <ThemedText type="link">Sign up</ThemedText>
        </Link>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
  },
})

// Microsoft Windows [Version 10.0.19045.6466]
// (c) Microsoft Corporation. All rights reserved.

// C:\Users\shuvo>ipconfig

// Windows IP Configuration


// Wireless LAN adapter Local Area Connection* 1:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// Wireless LAN adapter Local Area Connection* 2:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::6aa0:ca13:bddf:2104%10
//    IPv4 Address. . . . . . . . . . . : 192.168.137.1
//    Subnet Mask . . . . . . . . . . . : 255.255.255.0
//    Default Gateway . . . . . . . . . :

// Wireless LAN adapter Wi-Fi:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::4503:ac28:1240:6960%7
//    IPv4 Address. . . . . . . . . . . : 192.168.43.159
//    Subnet Mask . . . . . . . . . . . : 255.255.255.0
//    Default Gateway . . . . . . . . . : 192.168.43.1

// Ethernet adapter Bluetooth Network Connection:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// C:\Users\shuvo>Wireless LAN adapter Wi-Fi
// 'Wireless' is not recognized as an internal or external command,
// operable program or batch file.

// C:\Users\shuvo>IPv4 Address
// 'IPv4' is not recognized as an internal or external command,
// operable program or batch file.

// C:\Users\shuvo>ipconfig /flushdns

// Windows IP Configuration

// Successfully flushed the DNS Resolver Cache.

// C:\Users\shuvo>ipconfig /release

// Windows IP Configuration

// No operation can be performed on Local Area Connection* 1 while it has its media disconnected.
// No operation can be performed on Bluetooth Network Connection while it has its media disconnected.

// Wireless LAN adapter Local Area Connection* 1:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// Wireless LAN adapter Local Area Connection* 2:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::6aa0:ca13:bddf:2104%10
//    IPv4 Address. . . . . . . . . . . : 192.168.137.1
//    Subnet Mask . . . . . . . . . . . : 255.255.255.0
//    Default Gateway . . . . . . . . . :

// Wireless LAN adapter Wi-Fi:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::4503:ac28:1240:6960%7
//    Default Gateway . . . . . . . . . :

// Ethernet adapter Bluetooth Network Connection:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// C:\Users\shuvo>ipconfig /renew

// Windows IP Configuration

// No operation can be performed on Local Area Connection* 1 while it has its media disconnected.
// No operation can be performed on Bluetooth Network Connection while it has its media disconnected.

// Wireless LAN adapter Local Area Connection* 1:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// Wireless LAN adapter Local Area Connection* 2:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::6aa0:ca13:bddf:2104%10
//    IPv4 Address. . . . . . . . . . . : 192.168.137.1
//    Subnet Mask . . . . . . . . . . . : 255.255.255.0
//    Default Gateway . . . . . . . . . :

// Wireless LAN adapter Wi-Fi:

//    Connection-specific DNS Suffix  . :
//    Link-local IPv6 Address . . . . . : fe80::4503:ac28:1240:6960%7
//    IPv4 Address. . . . . . . . . . . : 192.168.43.159
//    Subnet Mask . . . . . . . . . . . : 255.255.255.0
//    Default Gateway . . . . . . . . . : 192.168.43.1

// Ethernet adapter Bluetooth Network Connection:

//    Media State . . . . . . . . . . . : Media disconnected
//    Connection-specific DNS Suffix  . :

// C:\Users\shuvo>netsh int ip reset
// Resetting Compartment Forwarding, OK!
// Resetting Compartment, OK!
// Resetting Control Protocol, OK!
// Resetting Echo Sequence Request, OK!
// Resetting Global, failed.
// The requested operation requires elevation (Run as administrator).
// Resetting Interface, failed.
// The requested operation requires elevation (Run as administrator).
// Resetting Anycast Address, OK!
// Resetting Multicast Address, OK!
// Resetting Unicast Address, failed.
// The requested operation requires elevation (Run as administrator).
// Resetting Neighbor, failed.
// The requested operation requires elevation (Run as administrator).
// Resetting Path, failed.
// The requested operation requires elevation (Run as administrator).
// Resetting Potential, OK!
// Resetting Prefix Policy, OK!
// Resetting Proxy Neighbor, OK!
// Resetting Route, OK!
// Resetting Site Prefix, OK!
// Resetting Subinterface, OK!
// Resetting Wakeup Pattern, OK!
// Resetting Resolve Neighbor, OK!
// Resetting , OK!
// Resetting , OK!
// Resetting , OK!
// Resetting , OK!
// Resetting , failed.
// The requested operation requires elevation (Run as administrator).
// Resetting , OK!
// Resetting , OK!
// Resetting , OK!
// Resetting , failed.
// The requested operation requires elevation (Run as administrator).
// Resetting , OK!
// Resetting , OK!
// Resetting , OK!
// Resetting , OK!
// Restart the computer to complete this action.


// C:\Users\shuvo>netsh winsock reset