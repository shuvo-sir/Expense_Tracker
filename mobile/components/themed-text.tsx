import React from 'react'
import {
  Text,
  TextProps,
  StyleSheet,
  useColorScheme,
} from 'react-native'

type Props = TextProps & {
  type?: 'default' | 'title' | 'link'
}

export function ThemedText({ style, type = 'default', ...props }: Props) {
  const colorScheme = useColorScheme()
  const color = colorScheme === 'dark' ? '#FFFFFF' : '#000000'

  return (
    <Text
      style={[
        { color },
        type === 'title' && styles.title,
        type === 'link' && styles.link,
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  link: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
})