import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FriendRequests from "./FriendRequests";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignOutButton, useAuth, useSignUp } from "@clerk/clerk-react";
import { Dialog } from "@mui/material";
import { Input } from "./ui/input";
import { toast } from "react-toastify";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const { isSignedIn } = useAuth();

  const handleSettingsClick = () => {
    if (location.pathname === "/settings") {
      navigate("/");
    } else {
      navigate("/settings");
    }
  };

  const [open, setOpen] = useState(false);
  const [vCode, setVCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(0);
  const [receviedCode, setReceviedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signUp } = useSignUp();

  const formatPhoneNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.startsWith('1') ? `+1${digitsOnly.substring(1)}` : `+1${digitsOnly}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSubmitPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.create({
        phoneNumber,
      });
      await signUp.preparePhoneNumberVerification({
        strategy: "phone_code",
      });
      setReceviedCode(true);
      setStep(1);
    } catch (error) {
      console.error("Error in phone verification:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!vCode || vCode.length < 4) {
      toast.error("Please enter a valid verification code");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.attemptPhoneNumberVerification({
        code: vCode,
      });
      toast.success("Code verified");
      setOpen(false);
    } catch (error) {
      console.error("Error in code verification:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-1">
          <Link
            to="/"
            className={`font-bold text-black lowercase ${
              isMobile ? "text-2xl" : "text-3xl"
            }`}
            style={{ fontFamily: "Sometype Mono, monospace" }}
          >
            the bulletin.
          </Link>
          {isSignedIn ? (
            <div className="flex items-center space-x-2">
              <FriendRequests />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSettingsClick}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                <Settings className="h-5 w-5" />
                <SignOutButton />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              ></Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setOpen(true);
                setStep(0);
                setVCode("");
                setPhoneNumber("");
              }}
              variant="ghost"
              size="icon"
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>
      {open && (
        <Dialog
          PaperProps={{
            style: {
              padding: "1em",
              display: "flex",
              alignItems: "center",
              width: isMobile ? "90vw" : "52vw",
              maxWidth: "500px",
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
                  padding: "10px",
                  fontSize: "18px",
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
                  width: "100%",
                }}
              >
                <p>Enter your Phone Number</p>
                <Input
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="tel"
                  placeholder="e.g., 2125551234"
                  style={{ width: "100%" }}
                />
                <Button
                  onClick={handleSubmitPhone}
                  disabled={isLoading}
                  style={{ width: "100%" }}
                >
                  {isLoading ? "Sending..." : "Submit"}
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
                  padding: "10px",
                  fontSize: "18px",
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
                  width: "100%",
                }}
              >
                <p>Enter the code you received</p>
                <Input
                  value={vCode}
                  onChange={(e) => {
                    setVCode(e.target.value);
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter verification code"
                  style={{ width: "100%" }}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  style={{ width: "100%" }}
                >
                  {isLoading ? "Verifying..." : "Submit"}
                </Button>
              </section>
            </>
          )}
        </Dialog>
      )}
      <main className="flex-1 p-2 container mx-auto bg-gray-50">
        {children}
      </main>

      <footer className="border-t border-gray-200 p-2 text-center text-gray-500 bg-white text-xs">
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
