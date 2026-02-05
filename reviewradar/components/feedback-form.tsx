'use client';

import { useActionState } from 'react'; // React 19 hook (Next.js 15+)
import { createFeedback } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { useState } from 'react';

const initialState = {
  message: '',
  errors: {},
};

export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(createFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
      setRating(0);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>
          Help us improve ReviewRadar directly. We value your input!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Brief summary of your feedback" required />
            {state?.errors?.title && (
              <p className="text-sm text-red-500">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="Feature">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug Report</SelectItem>
                <SelectItem value="Feature">Feature Request</SelectItem>
                <SelectItem value="UX">User Experience (UX)</SelectItem>
                <SelectItem value="Performance">Performance Issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.category && (
              <p className="text-sm text-red-500">{state.errors.category[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (min 10 chars)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Tell us more details..." 
              required 
              className="min-h-[100px]"
            />
            {state?.errors?.description && (
              <p className="text-sm text-red-500">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rating (Optional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`dark:hover:text-yellow-400 hover:text-yellow-500 transition-colors ${
                    rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                  }`}
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating || 0} />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
