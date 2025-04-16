
import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className={`mx-auto space-y-3 ${isMobile ? 'max-w-[95%] px-1' : 'max-w-3xl'}`}>
        <div className="space-y-1">
          <TypewriterText 
            text={`hello, jackson. welcome to the bulletin!
we're happy you're here. ❤️
upload pictures & text for your friends below.
your updates for ${currentMonth} will print on ${nextMonth} 1st at 12:01 am, and your submissions are auto-saved.
your friends mahika, tanya, lila, adi, and nigel are excited to hear from you.`} 
            speed={isMobile ? 20 : 25}
          />
        </div>

        <ImageUploadGrid />
        <BlurbInput />
        
        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Index;
