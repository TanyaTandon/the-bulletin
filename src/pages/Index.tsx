
import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";

const Index = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const deadlineDay = "25th";
  const currentMonth = format(new Date(), "MMMM");
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="space-y-1">
          <TypewriterText text={`hello, jackson. welcome to the bulletin!

we're happy you're here. ❤️

upload pictures & text for your friends below. The ${nextMonth} deadline is ${currentMonth} ${deadlineDay}, so get them in soon!

your friends mahika, tanya, lila, adi, and nigel are excited to hear from you.`} />
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

