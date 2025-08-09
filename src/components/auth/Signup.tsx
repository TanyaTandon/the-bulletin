import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import PhoneInput, {
  DefaultInputComponentProps,
  Props,
  State,
} from "react-phone-number-input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

const SignUP: React.FC<{}> = ({}) => {

    const isMobile = useIsMobile()

  return (
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
          <h1 className="text-xl font-semibold mb-2">Enter your code</h1>
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
  );
};

export default SignUP;
