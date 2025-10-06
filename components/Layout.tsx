import React, { ReactNode } from "react";
import Header from "./Header";

import { Metadata } from 'next';

type Props = {
  children: ReactNode;
};



export const metadata: Metadata = {
  title: 'Emergent Value',
  description: '',
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

const Layout: React.FC<Props> = (props) => {

  return(

   <div>
      <Header />
      <div className="p-5">{props.children}</div>
   </div>

  )
}

export default Layout;
