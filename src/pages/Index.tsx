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
// import { Dialog } from "@radix-ui/react-dialog";
import { Dialog } from "@mui/material";
import createNewUser from "@/lib/api";

const Index = () => {
  const { friends } = useUser();
  const nextMonth = format(addMonths(new Date(), 1), "MMMM");
  const currentMonth = format(new Date(), "MMMM");
  const isMobile = useIsMobile();

  const handleSubmitAll = () => {
    // This is a placeholder for the actual submission logic
    // You would typically gather data from all three components here
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

  console.log(savedNotes);
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

        {!isSignedIn && (
          <>
            <Input
              placeholder="Enter your Name"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <Input
              placeholder="Enter your Phone Number"
              type="tel"
              onChange={(e) => {
                setPhoneNumber(e.target.value);
              }}
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            />
          </>
        )}

        <div className="flex justify-center">
          <Button
            onClick={async () => {
              await signUp.create({
                phoneNumber: "2535149837",
              });
              await signUp
                .preparePhoneNumberVerification({
                  strategy: "phone_code",
                })
                .then((res) => {
                  setReceviedCode(true);
                });
            }}
            size="lg"
            className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            Submit Bulletin
          </Button>

          {receviedCode && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "1em",
                  display: "flex",
                  alignItems: "center",
                  width: "52vw",
                },
              }}
              open
            >
              
              <p
                onClick={() => setReceviedCode(false)}
                style={{
                  position: "absolute",
                  right: "1em",
                  top: "0px",
                  cursor: "pointer",
                }}
              >
                x
              </p>
              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1em",
                }}
              >
                <p>Enter your Verification Code</p>
                <Input
                  onChange={(e) => {
                    setVCode(e.target.value);
                  }}
                />
                <Button
                  onClick={async () => {
                    console.log(vCode);
                    setReceviedCode(true);
                    await signUp
                      .attemptPhoneNumberVerification({
                        code: vCode,
                      })
                      .then((res) => {
                        const userData = {
                          name: name,
                          id: phoneNumber,
                          // created_user_id: res.createdUserId,
                          blurb: blurb,
                          images: images,
                          phoneNumber: phoneNumber,
                          savedNotes: savedNotes,
                        };
                        createNewUser(userData).then(() => {
                          toast.success("User created successfully");
                          setReceviedCode(false);
                        });
                      });
                  }}
                >
                  submit
                </Button>
                <button onClick={() => toast.success("test")}>test</button>
              </section>
            </Dialog>
          )}
        </div>

        <MonthlyTimer />
      </div>
    </Layout>
  );
};

export default Index;
