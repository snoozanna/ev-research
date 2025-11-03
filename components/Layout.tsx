import React, { ReactNode } from "react";
import Header from "./Header";
import { Metadata } from 'next';
import localFont from 'next/font/local'
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import UserStatus from "./UserStatus";

// import krungthep from "../public/font/local/krungthep.ttf"
 
type Props = {
  children: ReactNode;
};

const krungthep = localFont({
  src: "../public/font/local/krungthep.ttf",
})

export const metadata: Metadata = {
  title: 'Performance Journal',
  description: 'Keep track of your performance experiences',
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

const Layout: React.FC<Props> = (props) => {

  return(

   <div className={`${krungthep.className}`}>

      <Header />
      <div className="p-4">{props.children}</div>
    <div className="fixed bottom-5 right-5 "><UserStatus/></div>
   </div>

  )
}

export default Layout;
