import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';

import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      {/* <ColorModeProvider> */}
      <CSSReset />
      <Component {...pageProps} />
      {/* </ColorModeProvider> */}
    </ThemeProvider>
  );
}

export default MyApp;
