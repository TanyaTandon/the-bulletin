import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { Button } from "./ui/button";
import ReactInputVerificationCode from "react-input-verification-code";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Home, LoaderCircle, Mail, MapPin } from "lucide-react";
import { Label } from "./ui/label";
import { UserIcon } from "@phosphor-icons/react";
import { Input } from "./ui/input";
import { useAuth } from "@/providers/contexts/AuthContext";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router";
import OPTVerification from "./OPTVerification";

const AuthModalContent: React.FC<{
  signInState: boolean;
  close: () => void;
}> = ({ signInState, close }) => {
  const isMobile = useIsMobile();
  const phoneInputRef = useRef(null);

  const {
    setFirstName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    code,
    setCode,
    isProcessing,
    handleSignIn,
    handleVerifySignIn,
    handleSignUp,
    handleVerifySignUp,
    signInStep,
    setStreetAddress,
    setCity,
    setState,
    setZipCode,
  } = useAuth();

  const navigate = useNavigate();

  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setDisabled(false);
    }, 100);
  }, []);

  return (
    <>
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
                  focusInputOnCountrySelection={false}
                  countryCallingCodeEditable={false}
                  ref={phoneInputRef}
                  defaultCountry="US"
                  value={phoneNumber}
                  type="tel"
                  onChange={(e) => {
                    setPhoneNumber(e);
                  }}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <section className="">
              <h1 className="text-xl font-semibold mb-2">Enter your code</h1>
              <span style={isMobile ? { transform: "scale(0.6)" } : {}}>
                <OPTVerification
                  onComplete={(code) => handleVerifySignIn(code, navigate, close)}
                />
              </span>
            </section>
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
                      if (code) handleVerifySignIn(code, navigate, close);
                    }
                }
                size="lg"
                className={`bg-gradient-to-r from-accent to-primary hover:opacity-90 ${isMobile ? "w-auto" : "w-full"
                  }`}
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
            <>
              <h1 className=" text-2xl font-semibold mb-8 text-center">
                Create your account
              </h1>
              <div className="space-y-6">
                <aside className="flex gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      First Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your first name"
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-9 h-12"
                        disabled={isProcessing}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your last name"
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-9 h-12"
                        disabled={isProcessing}
                        required
                      />
                    </div>
                  </div>
                </aside>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
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
                      focusInputOnCountrySelection={false}
                      countryCallingCodeEditable={false}
                      defaultCountry="US"
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      onChange={(e) => setPhoneNumber(e)}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Street Address
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="pl-9 h-12"
                      disabled={isProcessing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="Enter city"
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-9 h-12"
                      disabled={isProcessing}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="state"
                        placeholder="Enter state"
                        onChange={(e) => setState(e.target.value)}
                        className="pl-9 h-12"
                        disabled={isProcessing}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipcode" className="text-sm font-medium">
                      ZIP Code
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="zipcode"
                        placeholder="Enter ZIP code"
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
            </>
          ) : (
            <section
              className={`flex flex-col items-center justify-center ${isMobile ? "w-[85vw]" : "w-[30vw]"
                }`}
            >
              <h1 className="text-xl font-semibold mb-2">Enter your code</h1>
              <span
                style={
                  isMobile
                    ? { transform: "scale(0.6)" }
                    : { transform: "scale(0.85)" }
                }
              >
                <ReactInputVerificationCode
                  length={6}
                  onChange={(code) => setCode(code)}
                  onCompleted={(code) =>
                    handleVerifySignUp(code, navigate, close)
                  }
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
            </section>
          )}
        </>
      )}
    </>
  );
};

export default AuthModalContent;
