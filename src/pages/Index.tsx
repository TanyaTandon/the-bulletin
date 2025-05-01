import React, { useState } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux";
import { fetchUser, User } from "@/redux/user";
import { createNewUser } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Home,
  User as UserIcon,
  LoaderCircle,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { staticGetUser } from "@/redux/user/selectors";
import ReactInputVerificationCode from "react-input-verification-code";
import { useIsMobile } from "@/hooks/use-mobile";

const NumberedHeart = ({ number }: { number: number }) => (
  <span className="inline-flex relative items-center justify-center align-middle mr-2">
    <Heart className="w-6 h-6 stroke-red-500 stroke-[1.5] fill-none" />
    <span className="absolute text-xs font-medium text-red-500">{number}</span>
  </span>
);

// Function to format phone numbers to E.164 format
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the number already has a country code (starts with +)
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // For US numbers, ensure 10 digits and add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If it's 11 digits and starts with 1 (US country code)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }
  
  // Otherwise just add + if not present
  return digitsOnly.length > 0 ? `+${digitsOnly}` : digitsOnly;
};

const Index = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [signInState, setSignInState] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [receviedCode, setReceviedCode] = useState<boolean>(false);
  const [signInStep, setSignInStep] = useState<number>(0);

  const [streetAddress, setStreetAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");

  const validatePhoneNumber = (phone: string) => {
    if (!phone || phone.trim() === "") {
      toast.error("Please enter a valid phone number");
      return false;
    }
    
    // Simple validation to check if it's at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      toast.error("Phone number must have at least 10 digits");
      return false;
    }
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setIsProcessing(true);
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      
      await signIn.create({
        strategy: "phone_code",
        identifier: formattedPhoneNumber,
      });

      setSignInStep(1);
      toast.success("We've sent you a verification code!");
    } catch (error) {
      console.error("Sign in error:", error);
      if (error.message && error.message.includes("rate limit")) {
        toast.error("Too many attempts. Please wait a few minutes and try again.");
      } else {
        toast.error(
          "We couldn't send the code. Please check your phone number and try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignIn = async (code: string) => {
    if (code.includes("·")) return;
    setIsProcessing(true);
    try {
      const result = await signIn
        .attemptFirstFactor({
          strategy: "phone_code",
          code: code,
        })
        .then(async (result) => {
          if (result.status === "complete") {
            // The verification was successful and the user is now signed up
            // Create a session to sign in the user

            // Set this session as active, which will update isSignedIn to true
            await setActive({ session: result.createdSessionId });

            // Now isSignedIn will be true
            console.log("User is signed in:", isSignedIn);
          }
          return result;
        });

      if (result?.identifier) {
        const phone = result.identifier.split("+1")[1];
        await dispatch(fetchUser(phone)).then((userDispatchResponse) => {
          const userRes: User = userDispatchResponse.payload as User;

          if (userRes.bulletins.length > 0) {
            navigate(`/bulletin/${userRes.bulletins[0]}`);
          } else {
            navigate("/bulletin");
          }
          toast.success("Welcome back! You're now signed in.");
        });
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error(
        "That code didn't work. Double-check and try again, or request a new one."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }
    
    if (phoneNumber.length !== 10 && !phoneNumber.startsWith('+')) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!name || name.trim() === "") {
      toast.error("Please enter your name");
      return;
    }

    if (!streetAddress || !city || !state || !zipCode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsProcessing(true);
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      console.log("Formatted phone number:", formattedPhoneNumber);
      
      await signUp.create({
        phoneNumber: formattedPhoneNumber,
      });

      await signUp.preparePhoneNumberVerification({
        strategy: "phone_code",
      });

      setReceviedCode(true);
      setSignInStep(1);
      toast.success("Great! We've sent a verification code to your phone.");
    } catch (error) {
      console.error("Sign up error:", error);
      
      if (error.message && error.message.includes("rate limit")) {
        toast.error("Too many attempts. Please wait a few minutes and try again.");
      } else if (error.message && error.message.includes("phone_number must be a valid phone number")) {
        toast.error("Please enter a valid phone number with country code (e.g. +1 for US)");
      } else if (error.message && error.message.includes("That phone number is taken")) {
        toast.error("This phone number is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignUp = async (code: string) => {
    console.log(code);
    if (code.includes("·")) return;
    if (!code || code.trim() === "") {
      toast.error("Please enter the verification code");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await signUp.attemptPhoneNumberVerification({
        code: code,
      });

      if (result?.createdUserId) {
        const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`;
        await createNewUser({
          name: name,
          created_user_id: result.createdUserId,
          id: phoneNumber.replace(/\D/g, ''),
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          fullAddress: fullAddress,
        }).then((res) => {
          if (res.success) {
            navigate("/bulletin");
            toast.success(
              "Welcome to the bulletin! Your account is ready to go."
            );
          } else {
            toast.error("Something went wrong. Please try again.");
          }
        });
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error(
        "That code didn't work. Double-check and try again, or request a new one."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const user = useAppSelector(staticGetUser);

  const handleCloseModal = () => {
    setOpenAuthModal(false);
    setSignInStep(0);
    setCode("");
    setPhoneNumber("");
    setName("");
    setStreetAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setReceviedCode(false);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 md:px-12 py-12">
        <div className="text-left space-y-4">
          <img
            src="/BulletinLogo.svg"
            alt="logo"
            className="w-20 h-20 ml-[auto] mr-[auto]"
          />
          <p className="text-md text-muted-foreground text-left">
            hi!
            <br />
            <br />
            tanya, adi, jack and jacob here.
            <br />
            we love our friends and want to keep up with them.
            <br />
            and we're tired of phones, ads, & scrolling.
            <br />
            <br />
            so we made the bulletin!
            <br />
            <strong>here's how it works:</strong>
            <br />
            <br />
            <span className="flex items-center">
              <NumberedHeart number={1} /> you and your friends upload pictures
              & text to our webapp.
            </span>
            <span className="flex items-center">
              <NumberedHeart number={2} /> we make a monthly magazine,
              personalized for you, with all your friends' content.
            </span>
            <span className="flex items-center">
              <NumberedHeart number={3} /> you're limited to 6 close friends -
              quality over quantity!
            </span>
            <span className="flex items-center">
              <NumberedHeart number={4} /> you get this magazine on high quality
              paper in a beautiful layout to keep and cherish!
            </span>
            <br />
            <br />
            we ship your first bulletin on may 5th.
            <br />
            <br />
            love,
            <br />
            the bulletin team
          </p>
        </div>

        <div className="flex gap-4">
          {openAuthModal && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "2em",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "52rem",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  flexDirection: "column",
                  gap: "1em",
                  margin: "1rem",
                },
              }}
              open
              onClose={handleCloseModal}
            >
              <div className="w-full relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute right-2 top-0 text-xl font-medium cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {signInState ? (
                <>
                  {signInStep === 0 ? (
                    <>
                      <h1 className="text-xl font-semibold mb-2">
                        Enter your phone number
                      </h1>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please include your country code (e.g., +1 for US)
                      </p>
                      <Input
                        value={phoneNumber}
                        placeholder="Enter your Phone Number (e.g. +1234567890)"
                        type="tel"
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        disabled={isProcessing}
                        className="mb-4 w-full"
                      />
                    </>
                  ) : (
                    <>
                      <h1 className="text-xl font-semibold mb-2">
                        Enter your code
                      </h1>
                      <span style={isMobile ? { transform: "scale(0.6)" } : {}}>
                        <ReactInputVerificationCode
                          autoFocus
                          length={6}
                          onChange={(code) => setCode(code)}
                          onCompleted={(code) => handleVerifySignIn(code)}
                        />
                      </span>
                    </>
                  )}
                  <div className="flex justify-center w-full">
                    {isProcessing ? (
                      <Button
                        disabled
                        className="w-full mt-8 h-12 text-base font-medium bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity"
                      >
                        <span className="flex items-center gap-2">
                          Verifying... <LoaderCircle className="animate-spin" />
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={
                          signInStep === 0
                            ? handleSignIn
                            : (event) => {
                                if (code) handleVerifySignIn(code);
                              }
                        }
                        size="lg"
                        className="bg-gradient-to-r from-accent to-primary hover:opacity-90 w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? "Processing..."
                          : signInStep === 0
                          ? "Submit"
                          : "Verify"}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {signInStep === 0 ? (
                    <Card className="w-full">
                      <CardContent className="pt-6">
                        <h1 className="text-2xl font-semibold mb-8 text-center">
                          Create your account
                        </h1>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-sm font-medium"
                            >
                              Full Name
                            </Label>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 h-12"
                                disabled={isProcessing}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-sm font-medium"
                            >
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number (e.g. +1234567890)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-9 h-12"
                                disabled={isProcessing}
                                required
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Include your country code (e.g., +1 for US)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="street"
                              className="text-sm font-medium"
                            >
                              Street Address
                            </Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="street"
                                placeholder="Enter street address"
                                value={streetAddress}
                                onChange={(e) =>
                                  setStreetAddress(e.target.value)
                                }
                                className="pl-9 h-12"
                                disabled={isProcessing}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="city"
                              className="text-sm font-medium"
                            >
                              City
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="city"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="pl-9 h-12"
                                disabled={isProcessing}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="state"
                                className="text-sm font-medium"
                              >
                                State
                              </Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="state"
                                  placeholder="Enter state"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  className="pl-9 h-12"
                                  disabled={isProcessing}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="zipcode"
                                className="text-sm font-medium"
                              >
                                ZIP Code
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="zipcode"
                                  placeholder="Enter ZIP code"
                                  value={zipCode}
                                  onChange={(e) => setZipCode(e.target.value)}
                                  className="pl-9 h-12"
                                  disabled={isProcessing}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSignUp}
                          className="w-full mt-8 h-12 text-base font-medium bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity"
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Create Account"}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <h1 className="text-xl font-semibold mb-2">
                        Enter your code
                      </h1>
                      <span style={isMobile ? { transform: "scale(0.6)" } : {}}>
                        <ReactInputVerificationCode
                          length={6}
                          onChange={(code) => setCode(code)}
                          onCompleted={(code) => handleVerifySignUp(code)}
                        />
                      </span>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        Didn't receive a code? Make sure you entered the correct phone number.
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            setIsProcessing(true);
                            await signUp.preparePhoneNumberVerification({
                              strategy: "phone_code",
                            });
                            toast.success("Verification code resent! Please check your phone.");
                          } catch (error) {
                            console.error("Error resending code:", error);
                            toast.error("Couldn't resend the code. Please try again later.");
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            Sending... <LoaderCircle className="animate-spin" />
                          </span>
                        ) : (
                          "Resend Code"
                        )}
                      </Button>
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
                }}
                variant="outline"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => {
                if (user.bulletins.length > 0) {
                  navigate(`/bulletin/${user.bulletins[0]}`);
                } else {
                  navigate("/bulletin");
                }
              }}
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
