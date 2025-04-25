import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/redux";
import { fetchUser } from "@/redux/user";
import { createNewUser } from "@/lib/api";
import { toast } from "react-toastify";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { signIn } = useSignIn();
  const isMobile = useIsMobile();

  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [signInState, setSignInState] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [receviedCode, setReceviedCode] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signInStep, setSignInStep] = useState<number>(0);

  const formatPhoneNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.startsWith('1') ? `+1${digitsOnly.substring(1)}` : `+1${digitsOnly}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSignInSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "phone_code",
        identifier: phoneNumber,
      });
      setSignInStep(1);
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInVerify = async () => {
    if (!code || code.length < 4) {
      toast.error("Please enter a valid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: code,
      });
      
      if (result.status === "complete") {
        const phoneId = result.identifier.split("+1")[1];
        await dispatch(fetchUser(phoneId));
        setOpenAuthModal(false);
        navigate("/bulletin");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async () => {
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (!address) {
      toast.error("Please enter your address");
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
      setSignInStep(1);
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpVerify = async () => {
    if (!code || code.length < 4) {
      toast.error("Please enter a valid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.attemptPhoneNumberVerification({
        code: code,
      });
      
      if (result?.createdUserId) {
        await createNewUser({
          name: name,
          created_user_id: result.createdUserId,
          id: phoneNumber,
          phoneNumber: phoneNumber,
          address: address,
        });
        
        setOpenAuthModal(false);
        navigate("/bulletin");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <div className="text-left space-y-4">
          <img src="/BulletinLogo.svg" alt="logo" className="w-20 h-20 ml-[auto] mr-[auto]" />
          <h1 className="text-4xl font-bold text-left">Welcome to Bulletin</h1>
          <p className="text-md text-muted-foreground text-left">
            hi!
            <br />
            <br />
            the bulletin team here. we love our friends, we want to keep up with them, and have something to show for it! but we're tired of our phones, ads, & scrolling.
            <br />
            <br />
            so we'd love to present to you — the bulletin! 
            <br />
            <br />
            1. you and your friends upload pictures and text to our webapp. 
            <br />
            2. we make a monthly magazine, personalized for you, with all your friends' content. 
            <br />
            3. you're limited to 6 close friends - quality over quantity! 
            <br />
            4. you get this magazine on high quality paper in a beautiful layout to keep and cherish! 
            <br />
            <br />
            Expect your first bulletin by May 1st!
            <br />
            <br />
            love, 
            <br />
            tanya, adi, jackson - the bulletin team
          </p>
        </div>

        <div className="flex gap-4 ">
          {openAuthModal && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "1.5em",
                  display: "flex",
                  alignItems: "center",
                  width: isMobile ? "90vw" : "52vw",
                  maxWidth: "500px",
                  flexDirection: "column",
                  gap: "1em",
                },
              }}
              open
            >
              {signInState ? (
                <>
                  {signInStep === 0 ? (
                    <>
                      <div style={{ width: "100%", textAlign: "right" }}>
                        <span
                          onClick={() => setOpenAuthModal(false)}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            fontSize: "18px",
                          }}
                        >
                          x
                        </span>
                      </div>
                      <h1 className="text-xl font-bold mb-2">Sign In</h1>
                      <Input
                        value={phoneNumber}
                        placeholder="Enter your Phone Number"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9]*"
                        onChange={handlePhoneNumberChange}
                        className="w-full mb-4"
                      />
                      <div className="flex justify-center w-full">
                        <Button
                          onClick={handleSignInSubmit}
                          disabled={isLoading}
                          size="lg"
                          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          {isLoading ? "Sending..." : "Submit"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: "100%", textAlign: "right" }}>
                        <span
                          onClick={() => setOpenAuthModal(false)}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            fontSize: "18px",
                          }}
                        >
                          x
                        </span>
                      </div>
                      <h1 className="text-xl font-bold mb-2">Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter verification code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                        className="w-full mb-4"
                      />
                      <div className="flex justify-center w-full">
                        <Button
                          onClick={handleSignInVerify}
                          disabled={isLoading}
                          size="lg"
                          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          {isLoading ? "Verifying..." : "Submit"}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {signInStep === 0 ? (
                    <>
                      <div style={{ width: "100%", textAlign: "right" }}>
                        <span
                          onClick={() => setOpenAuthModal(false)}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            fontSize: "18px",
                          }}
                        >
                          x
                        </span>
                      </div>
                      <h1 className="text-xl font-bold mb-2">Sign Up</h1>
                      <Input
                        placeholder="Enter your Name"
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        className="w-full mb-2"
                      />
                      <Input
                        placeholder="Enter your Phone Number"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9]*"
                        onChange={handlePhoneNumberChange}
                        className="w-full mb-2"
                      />
                      <Input
                        placeholder="Enter your Address"
                        onChange={(e) => {
                          setAddress(e.target.value);
                        }}
                        className="w-full mb-4"
                      />
                      <div className="flex justify-center w-full">
                        <Button
                          onClick={handleSignUpSubmit}
                          disabled={isLoading}
                          size="lg"
                          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          {isLoading ? "Creating Account..." : "Submit"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: "100%", textAlign: "right" }}>
                        <span
                          onClick={() => setOpenAuthModal(false)}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            fontSize: "18px",
                          }}
                        >
                          x
                        </span>
                      </div>
                      <h1 className="text-xl font-bold mb-2">Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter verification code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                        className="w-full mb-4"
                      />
                      <div className="flex justify-center w-full">
                        <Button
                          onClick={handleSignUpVerify}
                          disabled={isLoading}
                          size="lg"
                          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          {isLoading ? "Verifying..." : "Verify Phone Number"}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </Dialog>
          )}
          {!isSignedIn ? (
            <>
              <Button
                size="lg"
                onClick={() => {
                  setOpenAuthModal(true);
                  setSignInState(true);
                  setSignInStep(0);
                  setCode("");
                  setPhoneNumber("");
                }}
                className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
              >
                Sign In
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setOpenAuthModal(true);
                  setSignInState(false);
                  setSignInStep(0);
                  setCode("");
                  setPhoneNumber("");
                  setName("");
                  setAddress("");
                }}
                variant="outline"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/bulletin")}
              className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
            >
              Go to Bulletin
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
