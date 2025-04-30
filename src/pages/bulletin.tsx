
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths } from "date-fns";
import Layout from "@/components/Layout";
import ImageUploadGrid, { UploadedImage } from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import TypewriterText from "@/components/TypewriterText";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { createNewBulletin } from "@/lib/api";
import { Send, Calendar, Image, FileText, LoaderCircle } from "lucide-react";
import { useAuth, useSignUp } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Dialog } from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { setUser } from "@/redux/user";

const Bulletin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = useAppSelector(staticGetUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [blurb, setBlurb] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<CalendarNote[]>([]);
  
  // Custom placeholder for the blurb textarea
  const customPlaceholder = "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";

  const handleSubmitBulletin = async () => {
    if (!blurb && images.length === 0) {
      toast.error("Please add some content to your bulletin before submitting");
      return;
    }

    // Validate the number of images
    if (images.length > 4) {
      toast.error("You can only upload up to 4 images");
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
      }).then((response) => {
        console.log("Response:", response);
        if (response.newUserData) {
          dispatch(setUser(response.newUserData[0]));
        }
        if (response.success) {
          navigate(`/bulletin/${response.bulletinId}`);
        } else {
          toast.error("We couldn't save your bulletin. Please try again.");
        }
      });

      toast.dismiss();

      setImages([]);
      setBlurb("");
      setSavedNotes([]);

      navigate("/bulletin/filled");
    } catch (error) {
      console.error("Error saving bulletin:", error);
      toast.error("We couldn't save your bulletin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("User:", savedNotes);

  return (
    <Layout>
      <div className={`mx-auto ${isMobile ? "px-4 pt-0" : "container py-6"}`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-left min-h-[6em]">
            <TypewriterText
              text={`<p>welcome to the bulletin!</p><p>we're happy you're here. ❤️</p><p>upload your pictures, text, and calendar dates below.</p><p>we will gather this content from all your friends, design it beautifully into your bulletin, and ship it to you on may 5th.</p>`}
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
                placeholder={customPlaceholder}
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
