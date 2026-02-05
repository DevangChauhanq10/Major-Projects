import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function UserDashboard() {
  const { userId } = await auth();

  if (!userId) return null;

  const feedbacks = await prisma.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const totalFeedback = await prisma.feedback.count({
    where: { userId }
  });

  // Calculate average rating if there are ratings
  const feedbackWithRatings = await prisma.feedback.findMany({
    where: { userId, rating: { gt: 0 } },
    select: { rating: true }
  });
  
  const avgRating = feedbackWithRatings.length > 0
    ? (feedbackWithRatings.reduce((acc, curr) => acc + curr.rating, 0) / feedbackWithRatings.length).toFixed(1)
    : 'N/A';


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here is an overview of your activity.</p>
        </div>
        <Link href="/submit-feedback">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Feedback
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-slate-500">Total Submissions</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{totalFeedback}</div>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-slate-500">Average Rating</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{avgRating}</div>
             <p className="text-xs text-muted-foreground mt-1">Given to products</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-slate-500">Recent Status</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-emerald-600">Active</div>
             <p className="text-xs text-muted-foreground mt-1">Last submission: {feedbacks[0]?.createdAt.toLocaleDateString() || 'Never'}</p>
           </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No feedback submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${item.category === 'Bug' ? 'bg-red-100 text-red-700' : 
                          item.category === 'Feature' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell>{item.rating > 0 ? '⭐'.repeat(item.rating) : '-'}</TableCell>
                    <TableCell>{item.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="text-slate-500 text-sm">
                        Pending
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
