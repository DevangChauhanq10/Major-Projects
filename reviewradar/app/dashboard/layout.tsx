import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata.role;

  if (!role) {
    // Ideally redirect to an onboarding page or show a "No Role Assigned" message
    // For now, we'll just let them pass but they see no special links
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white p-4 border-b border-slate-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
             <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ReviewRadar</Link>
             <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 text-emerald-400 uppercase tracking-wider">
                {role || 'Guest'}
             </span>
             
             <nav className="flex gap-4 text-sm text-slate-300">
               {/* Base User Link - Everyone gets this? Or just 'user' role? */}
               {/* Taking requirement: /dashboard/user is User Role Only (implies strictly User?) or Base Access? 
                   Usually Admin/Analyst also have User access. I will allow all logged in users to see 'User Dashboard' link for now or stick to strict req if implied.
                   Request said: /dashboard/user (User role only) - treating literally. 
               */}
               {(role === 'user' || role === 'analyst' || role === 'admin') && (
                 <Link href="/dashboard/user" className="hover:text-white transition-colors">User View</Link>
               )}
               
               {(role === 'analyst' || role === 'admin') && (
                 <Link href="/dashboard/analyst" className="hover:text-white transition-colors">Analyst View</Link>
               )}

               {role === 'admin' && (
                 <Link href="/dashboard/admin" className="hover:text-white transition-colors">Admin View</Link>
               )}
             </nav>
          </div>

          <div className="flex items-center gap-4">
             <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-slate-700 hover:border-emerald-500 transition-all"
                  }
                }}
             />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50 p-6">
        {children}
      </main>
    </div>
  );
}
