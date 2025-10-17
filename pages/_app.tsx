import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProps } from 'next/app';



const App = ({ Component, pageProps }: AppProps) => {

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />

    </ClerkProvider>
  );
};

export default App;