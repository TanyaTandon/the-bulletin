
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FilledBulletin: React.FC = () => {
  const navigate = useNavigate();

  const handleNewSubmission = () => {
    navigate('/bulletin');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <h1 className="text-4xl font-bold text-center text-foreground">
          hooray! your bulletin has been submitted.
        </h1>
        <p className="text-muted-foreground text-center max-w-xl text-lg">
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
    </Layout>
  );
};

export default FilledBulletin;
