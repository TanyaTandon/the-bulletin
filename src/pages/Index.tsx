
import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";

const Index = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="space-y-1">
          <TypewriterText text={`hello, jackson. welcome to the bulletin! 

we're happy you're here. ❤️

upload pictures & text for your friends below. your updates for ${currentMonth} will print on ${nextMonth} 1st, and your submissions are auto-saved. 

your friends mahika, tanya, lila, adi, and nigel are excited to hear from you.`} />
        </div>

        <ImageUploadGrid />
        <BlurbInput />
      </div>
    </Layout>
  );
};

export default Index;
