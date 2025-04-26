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
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Building, Home, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { signIn } = useSignIn();

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
    return phone && phone.trim() !== "";
  };

  const handleSignIn = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsProcessing(true);
    try {
      await signIn.create({
        strategy: "phone_code",
        identifier: phoneNumber,
      });
      
      setSignInStep(1);
      toast.success("Verification code sent to your phone");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignIn = async () => {
    if (!code || code.trim() === "") {
      toast.error("Please enter the verification code");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: code,
      });
      
      if (result?.identifier) {
        const phone = result.identifier.split("+1")[1];
        await dispatch(fetchUser(phone));
        navigate("/bulletin");
        toast.success("Successfully signed in!");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid phone number");
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
      await signUp.create({
        phoneNumber: phoneNumber,
      });
      
      await signUp.preparePhoneNumberVerification({
        strategy: "phone_code",
      });
      
      setReceviedCode(true);
      setSignInStep(1);
      toast.success("Verification code sent to your phone");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignUp = async () => {
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
          id: phoneNumber,
          phoneNumber: phoneNumber,
          address: fullAddress,
        });
        
        navigate("/bulletin");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setOpenAuthModal(false);
    setSignInStep(0);
    setCode("");
    setPhoneNumber("");
    setName("");
    setAddress("");
    setReceviedCode(false);
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

        <div className="flex gap-4">
          {openAuthModal && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "2em",
                  display: "flex",
                  alignItems: "center",
                  width: "52vw",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  flexDirection: "column",
                  gap: "1em",
                },
              }}
              open
              onClose={handleCloseModal}
            >
              <div className="w-full relative">
                <button 
                  onClick={handleCloseModal}
                  className="absolute right-2 top-0 text-xl font-medium cursor-pointer"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              {signInState ? (
                <>
                  {signInStep === 0 ? (
                    <>
                      <h1 className="text-xl font-semibold mb-2">Enter your phone number</h1>
                      <Input
                        value={phoneNumber}
                        placeholder="Enter your Phone Number"
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
                      <h1 className="text-xl font-semibold mb-2">Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter your Code"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                        disabled={isProcessing}
                        className="mb-4 w-full"
                      />
                    </>
                  )}
                  <div className="flex justify-center w-full">
                    <Button
                      onClick={signInStep === 0 ? handleSignIn : handleVerifySignIn}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-primary hover:opacity-90 w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : signInStep === 0 ? "Submit" : "Verify"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {signInStep === 0 ? (
                    <Card className="w-full">
                      <CardContent className="pt-6">
                        <h1 className="text-xl font-semibold mb-6 text-center">Create your account</h1>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9"
                                disabled={isProcessing}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-9"
                                disabled={isProcessing}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="street"
                                placeholder="Enter street address"
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                className="pl-9"
                                disabled={isProcessing}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="city"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="pl-9"
                                disabled={isProcessing}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="state"
                                  placeholder="Enter state"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  className="pl-9"
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="zipcode">ZIP Code</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="zipcode"
                                  placeholder="Enter ZIP code"
                                  value={zipCode}
                                  onChange={(e) => setZipCode(e.target.value)}
                                  className="pl-9"
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSignUp}
                          className="w-full mt-6 bg-gradient-to-r from-accent to-primary hover:opacity-90"
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Create Account"}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <h1 className="text-xl font-semibold mb-2">Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter your Code"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                        disabled={isProcessing}
                        className="mb-4 w-full"
                      />
                    </>
                  )}

                  <div className="flex justify-center w-full">
                    <Button
                      onClick={signInStep === 0 ? handleSignUp : handleVerifySignUp}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-primary hover:opacity-90 w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing 
                        ? "Processing..." 
                        : signInStep === 0 
                          ? "Submit" 
                          : "Verify Phone Number"
                      }
                    </Button>
                  </div>
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
