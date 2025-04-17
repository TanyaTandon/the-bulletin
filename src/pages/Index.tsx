import React from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Image, FileText } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  const isMobile = useIsMobile();
  
  const handleSubmitAll = () => {
    // This is a placeholder for the actual submission logic
    // You would typically gather data from all three components here
    toast.success("Submitting your bulletin content", {
      description: "Your images, text, and calendar updates will be included in the next bulletin."
    });
  };
  
  return (
    <Layout>
      <div className={`mx-auto space-y-3 ${isMobile ? 'max-w-[95%] px-1' : 'max-w-3xl'}`}>
        <div className="space-y-1">
          <TypewriterText 
            text={`<p>welcome to the bulletin!</p>
<p>we're happy you're here. ❤️</p>
<p>upload pictures, text, highlights for april & may with your friends below.</p>
<p>submit your submission soon, we will ship your bulletin on may 1st.</p>`} 
            speed={isMobile ? 20 : 25}
          />
        </div>

        <ImageUploadGrid />
        <BlurbInput />
        
        {/* Unified submit button */}
        <div className="flex justify-center pt-4 pb-8">
          <Button 
            onClick={handleSubmitAll}
            className="px-6 py-6 bg-violet-500 hover:bg-violet-600 transition-colors"
            size="lg"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <span className="text-lg">Submit All Content</span>
              </div>
              <div className="text-xs text-gray-200 flex gap-2 items-center">
                <Image className="h-3 w-3" /> 
                <FileText className="h-3 w-3" /> 
                <Calendar className="h-3 w-3" />
              </div>
            </div>
          </Button>
        </div>

        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Index;
