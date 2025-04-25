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

  console.log(isSignedIn);

  const [open, setOpen] = useState(false);
  const [vCode, setVCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(0);
  const [receviedCode, setReceviedCode] = useState(false);
  const { isLoaded, signUp } = useSignUp();

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
          {isSignedIn && location.pathname !== "/bulletin" ? (
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
            </div>
          ) : null}
        </div>
      </header>
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
                />
                <Button
                  onClick={async () => {
                    await signUp.create({
                      phoneNumber: phoneNumber,
                    });
                    await signUp
                      .preparePhoneNumberVerification({
                        strategy: "phone_code",
                      })
                      .then((res) => {
                        setReceviedCode(true);
                      });
                    setStep(1);
                  }}
                >
                  Submit
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
                        toast.success("Code verified");
                        setOpen(false);
                      });
                  }}
                >
                  submit
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
