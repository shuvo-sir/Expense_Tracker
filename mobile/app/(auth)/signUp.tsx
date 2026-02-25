import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

import { TextInput, Text, View, TouchableOpacity } from 'react-native'
import {styles} from '@/assets/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors'
import { Image } from 'expo-image'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import { useState } from 'react'



export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true)
    } catch (err: any) {
        const clerkError = err?.errors?.[0]

        if (clerkError?.code === 'form_identifier_exists') {
          setError('An account with this email already exists.')
        } else if (clerkError?.longMessage) {
          setError(clerkError.longMessage)
        } else {
          setError('Failed to create account. Please try again.')
        }
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
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
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
    const clerkError = err?.errors?.[0]

    if (clerkError?.code === 'form_code_incorrect') {
      setError('The verification code is incorrect.')
    } else if (clerkError?.code === 'form_code_expired') {
      setError('The verification code has expired. Please request a new one.')
    } else if (clerkError?.longMessage) {
      setError(clerkError.longMessage)
    } else {
      setError('Verification failed. Please try again.')
    }
  }
}
  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>
          Verify your email
        </Text>
        <Text style={styles.verificationDescription}>
          A verification code has been sent to your email.
        </Text>

        {error ? (
          <View style = {styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
            <Ionicons name="close" size={20} color={COLORS.expense}/>
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <TouchableOpacity
          onPress={onVerifyPress}
          style = {styles.button}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView
      style={{flex: 1, }}
      contentContainerStyle={{flexGrow: 1}}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/revenue-i2.png')}
          style={styles.illustration}
        />
        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style = {styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
            <Ionicons name="close" size={20} color={COLORS.expense}/>
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
        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style = {styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
 