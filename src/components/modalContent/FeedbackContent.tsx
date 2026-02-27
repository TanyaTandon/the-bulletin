import React, { useState } from "react";
import {
  Card,
  CardFooter,
  CardContent,
  CardTitle,
  CardHeader,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { staticGetUser } from "@/redux/user/selectors";
import { useAppSelector } from "@/redux";
import { submitFeedback } from "@/lib/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const FeedbackCard: React.FC<{
  feedback: string;
  setFeedback: (feedback: string) => void;
  inline?: boolean;
  closure?: () => void;
}> = ({ feedback, setFeedback, inline, closure }) => {
  const user = useAppSelector(staticGetUser);

  const [name, setName] = useState<string | null>(null);

  return (
    <Card
      style={{ border: inline ? "none" : "", boxShadow: inline ? "none" : "" }}
      className="w-full"
    >
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          we'd love to hear anything and everything: comments, critiques,
          suggestions, requests?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          placeholder="Enter your name"
        />
        <br />
        <br />
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="we'd love to hear anything and everything: comments, critiques, suggestions, requests?"
          className="min-h-[120px]"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={async () => {
            await submitFeedback({
              feedback: name ? `${name}: ${feedback}` : feedback,
              user: user?.phone_number ?? name ?? "",
            }).then((res) => {
              if (res.success) {
                closure?.();
                toast.success("Feedback submitted. Thank you!");
              } else {
                toast.error("Failed to submit feedback");
              }
            });
          }}
          className="w-full"
        >
          Submit Feedback
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedbackCard;
