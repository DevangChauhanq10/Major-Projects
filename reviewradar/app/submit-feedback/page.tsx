import { FeedbackForm } from "@/components/feedback-form";

export default function SubmitFeedbackPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Feedback Submission</h1>
          <p className="text-muted-foreground">
            Encountered a bug? Have a great idea? Let us know.
          </p>
        </div>
        <FeedbackForm />
      </div>
    </div>
  );
}
