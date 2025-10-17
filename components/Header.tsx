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
  FaHome,
  FaFileAlt,
  FaCalendarAlt,
  FaPlus,
  FaSignOutAlt,
  FaSignInAlt,
  FaAnchor,
} from "react-icons/fa";

const Header: React.FC = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
// console.log("user", isSignedIn)
  const isActive = (pathname: string) => router.pathname === pathname;

  // Assuming you’ve stored role in Clerk publicMetadata (recommended)
  const role = user?.publicMetadata?.role as string | undefined;

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
      <nav className="flex items-center justify-between p-4 shadow-md bg-purple-600 text-white">
        <p>Loading user...</p>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 shadow-md sticky top-0 bg-purple-600 text-white">
      {/* LEFT SIDE: Nav Links */}
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className={`flex items-center font-bold ${
            isActive("/") ? "opacity-70" : "opacity-100"
          } hover:opacity-80`}
        >
          <FaHome className="mr-2" />
        </Link>

       
          {/* {isSignedIn && canSee.reflections && ( */}
            {isSignedIn && (
            <Link
              href="/reflections"
              className={`flex items-center font-bold ${
                isActive("/reflections") ? "opacity-70" : "opacity-100"
              } hover:opacity-80`}
            >
              <FaFileAlt className="mr-2" />
            </Link>
          )}

          {/* {isSignedIn && canSee.calendar && ( */}
             {isSignedIn && (
            <Link
              href="/calendar"
              className={`flex items-center font-bold ${
                isActive("/calendar") ? "opacity-70" : "opacity-100"
              } hover:opacity-80`}
            >
              <FaCalendarAlt className="mr-2" />
            </Link>
          )}

          {/* {isSignedIn &&  canSee.admin && ( */}
          {isSignedIn && (
            <Link
              href="/admin"
              className={`flex items-center font-bold ${
                isActive("/admin") ? "opacity-70" : "opacity-100"
              } hover:opacity-80`}
            >
              <FaAnchor className="mr-2" />
            </Link>
          )}
       
      </div>

      {/* MIDDLE: Create Button */}
      <div className="flex items-center space-x-4">
      {isSignedIn && (

          // {canSee.create && (
            <Link href="/create">
              <button className="flex items-center font-bold hover:bg-purple-700 px-2 py-1 rounded">
                <FaPlus className="mr-2" />
              </button>
            </Link>
          )}
       
      </div>

      {/* RIGHT SIDE: User Info / Auth */}
      <div className="flex items-center space-x-4">
        {!isSignedIn && (
      
          <SignInButton mode="modal">
            <button className="flex items-center font-bold border border-white px-4 py-2 rounded hover:bg-purple-700">
              <FaSignInAlt className="mr-2" /> Sign In
            </button>
          </SignInButton>
        )}

{isSignedIn && (
          <div className="flex flex-col items-end">
            <p className="text-sm">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
            <SignOutButton>
              <button className="flex items-center font-bold hover:bg-purple-700 px-2 py-1 rounded">
                <FaSignOutAlt className="mr-2" /> Sign Out
              </button>
            </SignOutButton>
          </div>
)}
      </div>
    </nav>
  );
};

export default Header;
