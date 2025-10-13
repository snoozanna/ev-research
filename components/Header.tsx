import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  FaHome,
  FaFileAlt,
  FaCalendarAlt,
  FaPlus,
  FaSignOutAlt,
  FaSignInAlt,
  FaAnchor,
} from 'react-icons/fa';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isActive = (pathname: string) => router.pathname === pathname;

  // Get user role (assuming it's stored in session.user.role)
  const role = session?.user?.role;

  // Define visibility for each role
  const canSee = {
    home: true, // Everyone
    reflections: role === 'ADMIN' || role === 'ATTENDEE' || role === 'ARTIST',
    calendar: role === 'ADMIN' || role === 'ATTENDEE',
    create: role === 'ADMIN' || role === 'ATTENDEE',
    admin: role === 'ADMIN',
  };

  return (
    <nav className="flex items-center justify-between p-4 shadow-md sticky top-0 bg-(--purpureus)">
      {/* LEFT SIDE: Nav Links */}
      <div className="flex items-center space-x-4">
        {/* Home */}
        <Link
          href="/"
          className={`flex items-center font-bold ${
            isActive('/') ? 'text-gray-500' : 'text-gray-900'
          } hover:text-gray-700`}
        >
          <FaHome className="mr-2" />
        </Link>

        {session && (
          <>
            {canSee.reflections && (
              <Link
                href="/reflections"
                className={`flex items-center font-bold ${
                  isActive('/reflections') ? 'text-gray-500' : 'text-gray-900'
                } hover:text-gray-700`}
              >
                <FaFileAlt className="mr-2" />
              </Link>
            )}

            {canSee.calendar && (
              <Link
                href="/calendar"
                className={`flex items-center font-bold ${
                  isActive('/calendar') ? 'text-gray-500' : 'text-gray-900'
                } hover:text-gray-700`}
              >
                <FaCalendarAlt className="mr-2" />
              </Link>
            )}

            {canSee.admin && (
              <Link
                href="/admin"
                className={`flex items-center font-bold ${
                  isActive('/admin') ? 'text-gray-500' : 'text-gray-900'
                } hover:text-gray-700`}
              >
                <FaAnchor className="mr-2" />
              </Link>
            )}
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
                {session && status !== 'loading' && (
          <>
            {canSee.create && (
              <Link href="/create">
                <button className="flex items-center font-bold hover:bg-gray-100">
                  <FaPlus className="mr-2" />
                </button>
              </Link>
            )}

            
          </>
        )}
      </div>
      {/* RIGHT SIDE: Create + User Info + Auth */}
      <div className="flex items-center space-x-4">
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
           
            <div className="flex flex-col items-end">
              <p className="text-sm">{session.user?.name}</p>
              <button
                onClick={() => signOut()}
                className="flex items-center font-bold hover:bg-gray-100"
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
