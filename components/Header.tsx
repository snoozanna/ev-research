"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useUser,
} from "@clerk/nextjs";
import {
  FaRegCalendarAlt,
  FaPencilAlt,
  FaInfoCircle,
  FaLayerGroup, 
  FaHome,
  FaAnchor
} from "react-icons/fa";

type HeaderProps = {
  userRole?: "ADMIN" | "ARTIST" | "ATTENDEE";
};

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const isActive = (pathname: string) => router.pathname === pathname;
const userName = user?.username
// TODO 
  // const role = GET ROLE 

  // Define role visibility
  const canSee = {
    home: true,
    reflections: ["ADMIN", "ATTENDEE", "ARTIST"].includes(userRole || ""),
    calendar: ["ADMIN", "ATTENDEE"].includes(userRole || ""),
    create: ["ADMIN", "ATTENDEE"].includes(userRole || ""),
    admin: userRole === "ADMIN",
  };

  if (!isLoaded) {
    return (
      <nav className="flex flex-col items-center justify-between p-4  sticky top-0 bg-(--bg) gap-2 z-2">
        <p>Loading user...</p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col items-center justify-between p-4  sticky top-0 bg-(--bg) gap-2 z-2 mb-4">
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
          <FaHome size="1.5rem" />
        </Link>

       
          {isSignedIn && canSee.reflections && (
            // {isSignedIn && (
            <Link
              href="/reflections"
              className={`flex items-center font-bold ${
                isActive("/reflections") ? "text-(--icon-active)" : "opacity-100"
              } hover:opacity-80`}
            >
              <FaLayerGroup size="1.5rem" />
            </Link>
          )}

          {isSignedIn && canSee.calendar && (
            //  {isSignedIn && (
            <Link
              href="/calendar"
              className={`flex items-center font-bold ${
                isActive("/calendar")  ? "text-(--icon-active)": "opacity-100"
              } hover:opacity-80`}
            >
              <FaRegCalendarAlt size="1.5rem"  />
            </Link>
          )}

          {isSignedIn &&  canSee.admin && (
          // {isSignedIn && (
            <Link
              href="/admin"
              className={`flex items-center font-bold ${
                isActive("/admin")  ? "text-(--icon-active)": "opacity-100"
              } hover:opacity-80`}
            >
              <FaAnchor size="1.5rem" />
            </Link>
          )}
       
  


       {isSignedIn &&  canSee.create && (
            <Link href="/create" className="flex items-center font-bold hover:opacity-80">
             
                <FaPencilAlt size="1.5rem" />
       
            </Link>
          )}
       
{isSignedIn && (
          <div className="flex items-end">
           <Link href="/about" className="flex items-center font-bold hover:opacity-80">
             <FaInfoCircle size="1.5rem" />
         </Link>
           
          </div>
)}
      </div>
      </div>
    </nav>
  );
};

export default Header;
