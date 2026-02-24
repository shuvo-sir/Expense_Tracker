import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Image, TextInput, View, TouchableOpacity, Text } from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import { useState } from 'react'
import {styles} from '@/assets/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors'



export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showEmailCode, setShowEmailCode] = useState(false)
   const [error, setError] = useState('')

   

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return
    
    setError('')

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
    } catch (err: any) {
        const message =
        // for this flow, we expect errors to come from the sign-in attempt, so we can check for them in the 'errors' array on the error object
          // err?.errors?.[0]?.longMessage ||
          // err?.errors?.[0]?.message ||
          'Invalid email or password.'

        setError(message)
  }
  }, [isLoaded, signIn, setActive, router, emailAddress, password])

  // Handle the submission of the email verification code
  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return
    
    setError('')

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
    } catch (err: any) {
  const message =
    err?.errors?.[0]?.longMessage ||
    err?.errors?.[0]?.message ||
    'Verification failed. Please try again.'

  setError(message)
}
  }, [isLoaded, signIn, setActive, router, code])

  // Display email code verification form
  // if (showEmailCode) {
  //   return (
  //     <ThemedView style={styles.container}>
  //       <ThemedText type="title" style={styles.title}>
  //         Verify your email
  //       </ThemedText>
  //       <ThemedText style={styles.description}>
  //         A verification code has been sent to your email.
  //       </ThemedText>
  //       <TextInput
  //         style={styles.input}
  //         value={code}
  //         placeholder="Enter verification code"
  //         placeholderTextColor="#666666"
  //         onChangeText={(code) => setCode(code)}
  //         keyboardType="numeric"
  //       />
  //       <Pressable
  //         style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  //         onPress={onVerifyPress}
  //       >
  //         <ThemedText style={styles.buttonText}>Verify</ThemedText>
  //       </Pressable>
  //     </ThemedView>
  //   )
  // }

  return (
    <KeyboardAwareScrollView
      style={{flex: 1, }}
      contentContainerStyle={{flexGrow: 1}}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/revenue-i4.png')}
          style={styles.illustration}
        />
        <Text style={styles.title}>Sign In</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={COLORS.expense}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Ionicons
                name="close"
                size={20}
                color={COLORS.expense}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={(email) => setEmailAddress(email)}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style = {styles.footerContainer}>
          <Text style={styles.footerText}>Didn't have an account?</Text>
          <Link href="/signUp" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
 