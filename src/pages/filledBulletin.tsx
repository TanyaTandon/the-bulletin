
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const FilledBulletin: React.FC = () => {
  const navigate = useNavigate();

  const handleNewSubmission = () => {
    navigate('/bulletin');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Congratulations on submitting your first bulletin
        </h1>
        <p className="text-muted-foreground text-center max-w-xl text-lg">
          History books have it that you were part of the bulletin pilot. Excited to show you what we got for you. &lt;3
        </p>
        <Button 
          onClick={handleNewSubmission}
          size="lg"
          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium"
        >
          <Sparkles className="mr-2" />
          Replace with a new submission
        </Button>
      </div>
    </Layout>
  );
};

export default FilledBulletin;
