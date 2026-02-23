import React from 'react'
import {
  View,
  ViewProps,
  useColorScheme,
  StyleSheet,
} from 'react-native'

export function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme()
  const backgroundColor =
    colorScheme === 'dark' ? '#121212' : '#FFFFFF'

  return (
    <View
      style={[{ backgroundColor }, styles.container, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})