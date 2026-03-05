import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native"; // Added Alert
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setError("");

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const clerkError = err.errors?.[0];
      switch (clerkError?.code) {
        case "form_identifier_exists":
          setError("This email is already registered. Try signing in instead.");
          break;
        case "form_password_pwned":
          setError("This password is too common. Please choose a stronger one.");
          break;
        case "form_password_validation_failed":
          setError("Password must be at least 8 characters long.");
          break;
        default:
          setError(clerkError?.longMessage || "Sign up failed. Please try again.");
          break;
      }
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      switch (clerkError?.code) {
        case "form_code_incorrect":
          setError("The code is incorrect. Please check your email.");
          break;
        case "form_code_expired":
          setError("This code has expired. Please try resending a new one.");
          break;
        default:
          setError(clerkError?.longMessage || "Verification failed.");
          break;
      }
    }
  };

  // ... existing imports
const [success, setSuccess] = useState(""); // 1. New success state

// 2. Updated Resend Function
const onResendPress = async () => {
  if (!isLoaded || isResending) return;
  
  setIsResending(true);
  setError("");   // Clear old errors
  setSuccess(""); // Clear old success messages

  try {
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    // 3. Set the success message instead of a popup
    setSuccess("A new code has been sent to your email.");
    
    // Optional: Clear the success message after 5 seconds
    setTimeout(() => setSuccess(""), 5000);
  } catch (err: any) {
    const clerkError = err.errors?.[0];
    setError(clerkError?.longMessage || "Failed to resend code.");
  } finally {
    setIsResending(false);
  }
};

// 3. Update the Verification View UI
if (pendingVerification) {
  return (
    <View style={styles.verificationContainer}>
      <Text style={styles.verificationTitle}>Verify your email</Text>

      {/* ERROR MESSAGE BOX */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError("")}>
            <Ionicons name="close" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* SUCCESS MESSAGE BOX (New) */}
      {success ? (
        <View style={[styles.errorBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={[styles.errorText, { color: '#2E7D32' }]}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess("")}>
            <Ionicons name="close" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      ) : null}

      <TextInput
        style={[styles.verificationInput, error && styles.errorInput]}
        value={code}
        placeholder="Enter verification code"
        placeholderTextColor="#9A8478"
        onChangeText={(val) => {
            setCode(val);
            if(success) setSuccess(""); // Clear success once they start typing
        }}
        keyboardType="number-pad"
      />

      <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 5, alignItems: 'center' }}>
        <Text style={styles.footerText}>Didn't receive a code?</Text>
        <TouchableOpacity onPress={onResendPress} disabled={isResending}>
          <Text style={[styles.linkText, { marginTop: 5 }, isResending && { opacity: 0.5 }]}>
            {isResending ? "Sending..." : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

  // --- VIEW 2: SIGN UP MODE ---
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/revenue-i2.png")} style={styles.illustration} />
        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={setEmailAddress}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}