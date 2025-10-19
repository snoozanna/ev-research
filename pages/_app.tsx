import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProps } from 'next/app';
import { useRouter } from "next/router";


const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  return (
    <ClerkProvider {...pageProps} 
    >
      <Component {...pageProps} />

    </ClerkProvider>
  );
};

export default App;