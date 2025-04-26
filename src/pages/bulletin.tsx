import React, { useState } from "react";
import Layout from "@/components/Layout";
import ImageUploadGrid, { UploadedImage } from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import { useUser } from "@/contexts/UserContext";
import TypewriterText from "@/components/TypewriterText";
import { format, addMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useSignUp } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Dialog } from "@mui/material";
import { createNewBulletin, createNewUser } from "@/lib/api";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { log } from "console";

const Bulletin = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  const isMobile = useIsMobile();

  const user = useAppSelector(staticGetUser);

  console.log(user);
  const handleSubmitAll = () => {
    toast.success("Submitting your bulletin content", {
      description:
        "Your images, text, and calendar updates will be included in the next bulletin.",
    });
  };

  const [images, setImages] = useState<UploadedImage[]>([]);

  const friendsList = friends.map((friend) => friend.name).join(", ");

  const { isSignedIn } = useAuth();

  const { isLoaded, signUp } = useSignUp();

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [vCode, setVCode] = useState<string | null>(null);
  const [receviedCode, setReceviedCode] = useState<boolean>(false);
  const [blurb, setBlurb] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [savedNotes, setSavedNotes] = useState<CalendarNote[]>([]);

  return (
    <Layout>
      <div
        className={`mx-auto space-y-3 ${
          isMobile ? "max-w-[95%] px-1" : "max-w-3xl"
        }`}
      >
        <div className="space-y-1">
          <TypewriterText
            text={`<p>welcome to the bulletin!  </p>
<p>we're happy you're here. ❤️ </p>
<p>upload pictures, text, highlights for april & may with your friends below. </p>
<p>submit your submission soon, we will ship your bulletin on may 1st. </p>`}
            speed={isMobile ? 20 : 25}
          />
        </div>

        <ImageUploadGrid images={images} setImages={setImages} />
        <BlurbInput
          savedNotes={savedNotes}
          setSavedNotes={setSavedNotes}
          blurb={blurb}
          setBlurb={setBlurb}
        />

        <div className="flex justify-center">
          <Button
            onClick={async () => {
              await createNewBulletin({
                user: user,
                bulletin: {
                  images: images,
                  blurb: blurb,
                  savedNotes: savedNotes,
                  owner: user.phone_number,
                },
              });
            }}
            size="lg"
            className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            Save Bulletin
          </Button>
        </div>

        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Bulletin;
