import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AnalystDashboard() {
  const { sessionClaims } = await auth();
  
  // Double check in component (optional, middleware handles it)
  if (sessionClaims?.metadata.role !== 'analyst' && sessionClaims?.metadata.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Analyst Dashboard</h1>
                <p className="text-slate-500">Analyze feedback trends and sentiment.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                Analyst Access
            </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Feedback</h4>
            <div className="text-4xl font-bold text-slate-900">1,248</div>
            <div className="text-emerald-500 text-sm font-medium mt-1">↑ 12% vs last week</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Categorization</h4>
            <div className="text-4xl font-bold text-slate-900">42</div>
            <div className="text-amber-500 text-sm font-medium mt-1">Needs attention</div>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Sentiment Score</h4>
            <div className="text-4xl font-bold text-slate-900">8.4</div>
            <div className="text-slate-400 text-sm font-medium mt-1">Positive trend</div>
        </div>
      </div>
    </div>
  );
}
