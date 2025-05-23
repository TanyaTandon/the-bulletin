import React, {
  Component,
  LegacyRef,
  useCallback,
  useRef,
  useState,
} from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
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
import sendError from "@/hooks/use-sendError";
import { useStytch, useStytchUser } from "@stytch/react";
import "react-phone-number-input/style.css";
import PhoneInput, {
  DefaultInputComponentProps,
  Props,
  State,
} from "react-phone-number-input";

const NumberedHeart = ({ number }: { number: number }) => (
  <span className="inline-flex relative items-center justify-center align-middle mr-2">
    <Heart className="w-6 h-6 stroke-red-500 stroke-[1.5] fill-none" />
    <span className="absolute text-xs font-medium text-red-500">{number}</span>
  </span>
);

const Index = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const phoneInputRef = useRef<any>(null);

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

  type AuthResponse = {
    request_id: string;
    status_code: number;
    method_id: string;
  };

  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);

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
      await stytch.otps.sms
        .loginOrCreate(phoneNumber, {
          expiration_minutes: 5,
        })
        .then(async (res) => {
          if (res.status_code == 200) {
            setAuthResponse(res);
            setReceviedCode(true);
            setSignInStep(1);
            toast.success("We've sent you a verification code!");
          } else {
            toast.error("Something went wrong. Please try again.");
          }
        });
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(
        "We couldn't send the code. Please check your phone number and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignIn = async (code: string) => {
    if (code.includes("·")) return;
    setIsProcessing(true);
    try {
      await stytch.otps
        .authenticate(code, authResponse?.method_id, {
          session_duration_minutes: 5270, // Maximum: 366 d
        })
        .then(async (result) => {
          if (result.status_code === 200) {
            const phone = result.user.phone_numbers[0].phone_number;
            await dispatch(fetchUser(phone)).then((userDispatchResponse) => {
              const userRes: User = userDispatchResponse.payload as User;
              console.log(userRes);
              if (userRes.bulletins.length > 0) {
                navigate(`/bulletin/${userRes.bulletins[0]}`);
              } else {
                navigate("/bulletin");
              }
              toast.success("Welcome back! You're now signed in.");
            });

          }
          return result;
        });
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
      const response = await stytch.otps.sms.loginOrCreate(phoneNumber, {
        expiration_minutes: 5,
      });
      console.log(response);
      if (response.status_code == 200) {
        setAuthResponse(response);
        setReceviedCode(true);
        setSignInStep(1);
        toast.success("Great! We've sent a verification code to your phone.");
      } else {
        toast.error("Something went wrong. Please try again.");

        sendError(
          phoneNumber,
          "handleSignUp",
          JSON.stringify(response),
          JSON.stringify({
            rawPhoneNumber: phoneNumber,
            decoratedPhoneNumber: "+1" + phoneNumber,
          })
        );
      }
    } catch (error) {
      console.error("Sign up error:", error.message);
      console.error(JSON.stringify(error.e));
      if (error.message.includes("phone_number must be a valid phone number")) {
        toast.error("Please enter a valid phone number");
      } else if (error.message.includes("That phone number is taken")) {
        toast.error(error.message);
      } else {
        sendError(phoneNumber, "handleSignUp", error, {
          name,
          streetAddress,
          city,
          state,
          zipCode,
        });
        toast.error(error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignUp = async (code: string) => {
    console.log(code);
    const trueCode = code.replace("·", "");
    if (code.includes("·")) return;
    if (!code || code.trim() === "") {
      toast.error("Please enter the verification code");
      return;
    }

    setIsProcessing(true);
    try {
      await stytch.otps
        .authenticate(trueCode, authResponse?.method_id, {
          session_duration_minutes: 5270, // Maximum: 366 d
        })
        .then(async (res) => {
          if (res.status_code == 200) {
            const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`;
            await createNewUser({
              name: name,
              created_user_id: res.user_id,
              id: phoneNumber,
              phoneNumber: phoneNumber,
              fullAddress: fullAddress,
            }).then(async (res) => {
              await dispatch(fetchUser(phoneNumber));

              if (res.success) {
                navigate("/bulletin");
                toast.success(
                  "Welcome to the bulletin! Your account is ready to go."
                );
              } else {
                sendError(phoneNumber, "handleSignUp", JSON.stringify(res), {
                  name,
                  streetAddress,
                  city,
                  state,
                  zipCode,
                });
                toast.error("Something went wrong. Please try again.");
              }
            });
          }
        });
    } catch (error) {
      sendError(phoneNumber, "handleSignUp", error, {
        name,
        streetAddress,
        city,
        state,
        zipCode,
      });
      console.error("Code verification error:", error);
      toast.error(
        "That code didn't work. Double-check and try again, or request a new one."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const stytch = useStytch();

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

  const def = false;

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
                      <div
                        className="relative w-full"
                        style={{
                          border: "1px lightgray solid",
                          borderRadius: "0.5rem",
                          padding: "0.5rem",
                        }}
                      >
                        <PhoneInput
                          focusInputOnCountrySelection
                          ref={phoneInputRef}
                          defaultCountry="US"
                          value={phoneNumber}
                          type="tel"
                          onChange={(e) => {
                            setPhoneNumber(e);
                          }}
                          disabled={isProcessing}
                          className="w-full"
                        />
                      </div>
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
                          ? "Sign In"
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
                              <UserIcon className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
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
                            <div
                              className="relative"
                              style={{
                                border: "1px grey solid",
                                borderRadius: "0.5rem",
                                padding: "0.5rem",
                              }}
                            >
                              <PhoneInput
                                defaultCountry="US"
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e)}
                                disabled={isProcessing}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="street"
                              className="text-sm font-medium"
                            >
                              Street Address
                            </Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
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
                              <Building className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
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
                                <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
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
                                <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
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
                      <Button
                        onClick={async () => {
                          // await signUp.preparePhoneNumberVerification({
                          //   strategy: "phone_code",
                          // });
                        }}
                      >
                        Try Again
                      </Button>
                    </>
                  )}
                </>
              )}
            </Dialog>
          )}
          {!def ? (
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
