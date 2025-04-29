import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSignUp, useClerk } from "@clerk/clerk-react";
import { Dialog } from "@mui/material";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { selectShowFriendsModal } from "@/redux/nonpersistent/controllers/selectors";
import { useAppSelector } from "@/redux";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import FriendModalContent from "./FriendModalContent";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  const showFriendsModal = useAppSelector(selectShowFriendsModal);

  const { isSignedIn } = useClerk();

  const [open, setOpen] = useState(false);
  const [vCode, setVCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(0);
  const [receviedCode, setReceviedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signUp } = useSignUp();

  console.log(isSignedIn);

  const handleSubmitPhoneNumber = async () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.create({
        phoneNumber: phoneNumber,
      });

      await signUp.preparePhoneNumberVerification({
        strategy: "phone_code",
      });

      setReceviedCode(true);
      setStep(1);
      toast.success("Verification code sent to your phone");
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!vCode || vCode.trim() === "") {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.attemptPhoneNumberVerification({
        code: vCode,
      });

      toast.success("Code verified successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {open && (
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
          {step === 0 ? (
            <>
              <p
                onClick={() => setOpen(false)}
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
                <p>Enter your Phone Number</p>
                <Input
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                  }}
                  disabled={isLoading}
                />
                <Button onClick={handleSubmitPhoneNumber} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </section>
            </>
          ) : (
            <>
              <p
                onClick={() => setOpen(false)}
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
                <p>Enter the code you received</p>
                <Input
                  value={vCode}
                  onChange={(e) => {
                    setVCode(e.target.value);
                  }}
                  disabled={isLoading}
                />
                <Button onClick={handleVerifyCode} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Submit"}
                </Button>
              </section>
            </>
          )}
        </Dialog>
      )}

      {showFriendsModal && (
        <Dialog
          PaperProps={{
            style: {
              padding: "1em",
              display: "flex",
              alignItems: "center",
              width: isMobile ? "97vw" : "52vw",
            },
          }}
          open
        >
          <FriendModalContent />
        </Dialog>
      )}
      <main className="flex-1 p-2 container mx-auto bg-gray-50">
        {children}
      </main>

      <footer className="border-t border-gray-200 p-4 text-center text-gray-500 bg-white text-xs mt-12">
        <div
          className="container mx-auto"
          style={{ fontFamily: "Sometype Mono, monospace" }}
        >
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
