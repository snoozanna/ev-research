import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { FaAnchor } from "react-icons/fa";

export default function RoleCheck() {
  const { data: session } = useSession();
  return(
<>
<Layout>
  <p>User role: {session?.user?.role ?? "No role found"}</p>
  <br/>
  <Link href="/admin/performances"
              className={`flex items-center font-bold`}
            >
              <h2>Manage performances</h2>
            </Link>
  </Layout>
  </>
  )
}