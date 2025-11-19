import React from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";


const UserStatus  = () => {
    const {isSignedIn } = useUser();

    return (
        <>

 <div className="bg-(--offwhite) p-2 rounded-md">
      {!isSignedIn && (
           <div className="flex items-center flex-col text-xs">
            <span>Sign In</span>
          <SignInButton mode="modal" >
            <button className="flex items-center font-bold border border-white px-4 py-2 rounded hover:bg-purple-700">
              <FaSignInAlt className="mr-2" size="1rem" /> 
              </button>
          </SignInButton>
          </div>
        )}
    
    {isSignedIn && (
              <div className="flex items-center flex-col text-xs">
            <span>Sign Out</span>
                <SignOutButton>
                  <button className="flex items-center font-bold hover:bg-purple-700">
                    <FaSignOutAlt className="" size="1rem"/> 
                  </button>
                </SignOutButton>
              </div>
    )}
 </div>
</>
    )
}


export default UserStatus;