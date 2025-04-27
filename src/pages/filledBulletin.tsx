
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const FilledBulletin: React.FC = () => {
  const navigate = useNavigate();

  const handleNewSubmission = () => {
    navigate('/bulletin');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6 w-full text-center">
          <h1 className="text-4xl font-bold text-foreground">
            hooray! your bulletin has been submitted.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            thank you for being part of our pilot. 
            we're excited to show you what your friends have been up to! &lt;3
          </p>
          <div className="flex flex-col items-center space-y-2">
            <Button 
              onClick={handleNewSubmission}
              size="lg"
              variant="default"
              className="font-medium"
            >
              Delete and replace your monthly update
            </Button>
            <p className="text-sm text-muted-foreground italic">
              we'll use the latest submission
            </p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              we'd love to hear anything and everything: comments, critiques, suggestions, requests?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Share your thoughts with us..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FilledBulletin;
