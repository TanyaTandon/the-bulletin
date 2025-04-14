
import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const { friends } = useUser();
  
  const friendsList = friends.map(friend => friend.name).join(", ");
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome Jackson
          </h1>
          <p className="text-muted-foreground">
            Your friends {friendsList} are excited to see your latest bulletin
          </p>
        </div>

        <ImageUploadGrid />
        
        <BlurbInput />
        
        <div className="flex justify-center mb-8">
          <Button size="lg">
            Submit Bulletin
          </Button>
        </div>
        
        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Index;
