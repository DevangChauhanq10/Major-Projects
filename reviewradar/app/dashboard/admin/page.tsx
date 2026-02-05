import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                <p className="text-slate-500">System configuration and user management.</p>
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                Admin Access
            </span>
        </div>
      </div>
      
       <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">User Management</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                     <div>
                        <div className="font-medium text-sm text-slate-900">John Doe</div>
                        <div className="text-xs text-slate-500">user@example.com</div>
                     </div>
                  </div>
                  <select className="text-xs border-slate-200 rounded p-1">
                     <option>User</option>
                     <option>Analyst</option>
                     <option>Admin</option>
                  </select>
               </div>
               
               <button className="w-full py-2 text-sm text-rose-600 font-medium bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                  View All Users
               </button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">System Settings</h3>
             <div className="space-y-3">
                <label className="flex items-center justify-between p-2 cursor-pointer">
                    <span className="text-sm text-slate-600">Maintenance Mode</span>
                    <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div></div>
                </label>
                <label className="flex items-center justify-between p-2 cursor-pointer">
                    <span className="text-sm text-slate-600">Disable New Signups</span>
                    <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div></div>
                </label>
             </div>
        </div>
      </div>
    </div>
  );
}
