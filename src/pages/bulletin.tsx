
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { UploadedImage } from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createNewBulletin } from "@/lib/api";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";

const Bulletin = () => {
  const navigate = useNavigate();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  const isMobile = useIsMobile();
  const user = useAppSelector(staticGetUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [blurb, setBlurb] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<CalendarNote[]>([]);

  const handleSubmitBulletin = async () => {
    if (!blurb && images.length === 0) {
      toast.error("Please add some content to your bulletin before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Saving your bulletin...");
      
      await createNewBulletin({
        user: user,
        bulletin: {
          images: images,
          blurb: blurb,
          savedNotes: savedNotes,
          owner: user?.phone_number || "",
        },
      });
      
      toast.dismiss();
      
      setImages([]);
      setBlurb("");
      setSavedNotes([]);
      
      navigate('/bulletin/filled');
      
    } catch (error) {
      console.error("Error saving bulletin:", error);
      toast.error("We couldn't save your bulletin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className={`mx-auto ${isMobile ? "px-4" : "container py-6"}`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-4 text-left min-h-[300px]">
            <TypewriterText
              text={`<p>welcome to the bulletin!</p>

<p>we're happy you're here. ❤️</p>

<p>upload your pictures, text, and calendar dates below.</p>

<p>we will gather this content from all your friends, design it beautifully into your bulletin, and ship it to you on may 5th.</p>`}
              speed={isMobile ? 30 : 35}
              className="text-xl"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <BlurbInput
                savedNotes={savedNotes}
                setSavedNotes={setSavedNotes}
                blurb={blurb}
                setBlurb={setBlurb}
                images={images}
                setImages={setImages}
              />
            </div>

            <div className="flex flex-col items-center space-y-8">
              <Button
                onClick={handleSubmitBulletin}
                size="lg"
                className="w-full max-w-md bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    Saving... <LoaderCircle className="animate-spin" />
                  </span>
                ) : (
                  "Submit your monthly update"
                )}
              </Button>

              <div className="w-full max-w-md">
                <MonthlyTimer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bulletin;
