
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import { FaHome, FaFileAlt, FaCalendarAlt, FaPlus, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const router = useRouter();
  const isActive = (pathname: string) => router.pathname === pathname;
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center p-4 shadow-md sticky top-0 bg-(--purpureus)">
      {/* Left side */}
      <div className="flex space-x-4 w-full">
        <Link
          href="/"
          className={`flex items-center font-bold ${isActive('/') ? 'text-gray-500' : 'text-gray-900'} hover:text-gray-700`}
        >
          <FaHome className="mr-2" />
        </Link>

        {session && (
          <>
            <Link
              href="/drafts"
              className={`flex items-center font-bold ${isActive('/drafts') ? 'text-gray-500' : 'text-gray-900'} hover:text-gray-700`}
            >
              <FaFileAlt className="mr-2" />
            </Link>

            <Link
              href="/calendar"
              className={`flex items-center font-bold ${isActive('/calendar') ? 'text-gray-500' : 'text-gray-900'} hover:text-gray-700`}
            >
              <FaCalendarAlt className="mr-2" />
            </Link>
          </>
        )}
      </div>

      {/* Right side */}
      <div className=" flex items-center w-full">
        {status === 'loading' && <p>Validating session ...</p>}

        {!session && status !== 'loading' && (
          <button
            onClick={() => signIn()}
            className="flex items-center font-bold border border-gray-900 px-4 py-2 rounded hover:bg-gray-100"
          >
            <FaSignInAlt className="mr-2" /> 
          </button>
        )}

        {session && status !== 'loading' && (
          <>

          <div className='w-full'>
            <Link href="/create">
                <button className="flex items-center font-bold hover:bg-gray-100">
                  <FaPlus className="mr-2" /> 
                </button>
              </Link>
          </div>
        
            <div className='flex flex-col justify-end items-end w-full'>
            <p className="text-sm">{session.user?.name}</p>
              <button
                onClick={() => signOut()}
                className="flex items-center font-bold  rounded hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" /> 
              </button>
             
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
