
import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";

const Index = () => {
  const { friends } = useUser();
  const friendsList = friends.map(friend => friend.name).join(", ");
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 py-6">
        <div className="space-y-2">
          <TypewriterText text="Welcome Jackson to the bulletin, we are so excited you are here." />
          <TypewriterText text={`Your friends ${friendsList} are excited to hear from you`} />
        </div>

        <ImageUploadGrid />
        <BlurbInput />
        
        <div className="flex justify-center">
          <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:opacity-90">
            Submit Bulletin
          </Button>
        </div>
        
        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Index;
