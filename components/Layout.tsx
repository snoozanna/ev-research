import React, { ReactNode } from "react";
import Header from "./Header";
import { Metadata } from 'next';
// import localFont from 'next/font/local'
 
type Props = {
  children: ReactNode;
};

// const krungthep = localFont({
//   src: './krungthep.ttf',
// })

export const metadata: Metadata = {
  title: 'Emergent Value',
  description: '',
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

const Layout: React.FC<Props> = (props) => {

  return(

  //  <div className={krungthep.className}>
      <div>
      <Header />
      <div className="p-4">{props.children}</div>
   </div>

  )
}

export default Layout;
