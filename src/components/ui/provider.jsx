import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'

export function Provider({ children, ...props }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange {...props}>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  )
}
