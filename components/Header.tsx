"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import {
  FaCalendarAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaPencilAlt,
  FaQuoteLeft
} from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { PiNotePencilBold } from "react-icons/pi";



const Header: React.FC = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
console.log("user", user)
  const isActive = (pathname: string) => router.pathname === pathname;
const userName = user?.username
// TODO 
  // const role = GET ROLE 

  // // Define role visibility
  // const canSee = {
  //   home: true,
  //   reflections: ["ADMIN", "ATTENDEE", "ARTIST"].includes(role || ""),
  //   calendar: ["ADMIN", "ATTENDEE"].includes(role || ""),
  //   create: ["ADMIN", "ATTENDEE"].includes(role || ""),
  //   admin: role === "ADMIN",
  // };

  if (!isLoaded) {
    return (
      <nav className="flex flex-col items-center justify-between p-4  sticky top-0 bg-(--bg) gap-2">
        <p>Loading user...</p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col items-center justify-between p-4  sticky top-0 bg-(--bg) gap-2">
      <div className="flex flex-col">
      {isSignedIn && (
        <span className="w-full text-center text-(--teal) italic">{userName}'s</span>)}
        <h1 className="uppercase text-center mb-0 text-2xl">Performance Journal</h1></div>
      {/* LEFT SIDE: Nav Links */}
      <div className="border-t-3 border-(--green) w-full flex p-3">
        <div className="flex items-center w-full justify-around">
        <Link
          href="/"
          className={`flex items-center font-bold ${
            isActive("/")  ? "text-(--icon-active)": "opacity-100"
          } hover:opacity-80`}
        >
          <GoHomeFill size="1.5rem" />
        </Link>

       
          {/* {isSignedIn && canSee.reflections && ( */}
            {isSignedIn && (
            <Link
              href="/reflections"
              className={`flex items-center font-bold ${
                isActive("/reflections") ? "text-(--icon-active)" : "opacity-100"
              } hover:opacity-80`}
            >
              <FaQuoteLeft size="1.5rem" />
            </Link>
          )}

          {/* {isSignedIn && canSee.calendar && ( */}
             {isSignedIn && (
            <Link
              href="/calendar"
              className={`flex items-center font-bold ${
                isActive("/calendar")  ? "text-(--icon-active)": "opacity-100"
              } hover:opacity-80`}
            >
              <FaCalendarAlt size="1.5rem"  />
            </Link>
          )}

          {/* {isSignedIn &&  canSee.admin && ( */}
          {/* {isSignedIn && (
            <Link
              href="/admin"
              className={`flex items-center font-bold ${
                isActive("/admin")  ? "text-(--icon-active)": "opacity-100"
              } hover:opacity-80`}
            >
              <FaAnchor className="mr-2" />
            </Link>
          )} */}
       
  


      {isSignedIn && (

          // {canSee.create && (
            <Link href="/create" className="flex items-center font-bold hover:bg-purple-700">
             
                <FaPencilAlt size="1.5rem" />
       
            </Link>
          )}
       


   
        {!isSignedIn && (
      
          <SignInButton mode="modal" >
            <button className="flex items-center font-bold border border-white px-4 py-2 rounded hover:bg-purple-700">
              <FaSignInAlt className="mr-2" size="1.5rem" /> 
              </button>
          </SignInButton>
        )}

{isSignedIn && (
          <div className="flex items-end">
            {/* <p className="text-sm">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p> */}
            <SignOutButton>
              <button className="flex items-center font-bold hover:bg-purple-700">
                <FaSignOutAlt className="mr-2" size="1.5rem"/> 
              </button>
            </SignOutButton>
          </div>
)}
      </div>
      </div>
    </nav>
  );
};

export default Header;
