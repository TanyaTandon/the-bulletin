import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useStytch } from "@stytch/react";
import { useAppDispatch } from "@/redux";
import { fetchUser, User } from "@/redux/user";
import { createNewUser } from "@/lib/api";
import { toast } from "sonner";
import { NavigateFunction, useNavigate } from "react-router-dom";
import sendError from "@/hooks/use-sendError";
import { useDialog } from "../dialog-provider";

type AuthResponse = {
  request_id: string;
  status_code: number;
  method_id: string;
};

interface AuthContextType {
  // State
  isProcessing: boolean;
  signInStep: number;
  receivedCode: boolean;
  authResponse: AuthResponse | null;

  // Form fields
  name: string;
  phoneNumber: string;
  code: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  // Setters
  setName: (name: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setCode: (code: string) => void;
  setStreetAddress: (streetAddress: string) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  setZipCode: (zipCode: string) => void;

  // Actions
  handleSignIn: () => Promise<void>;
  handleVerifySignIn: (
    code: string,
    navigate: NavigateFunction
  ) => Promise<void>;
  handleSignUp: () => Promise<void>;
  handleVerifySignUp: (
    code: string,
    navigate: NavigateFunction,
    close: () => void
  ) => Promise<void>;
  resetAuthState: () => void;
  setAdditionalAction: (action: () => void | null) => void;

  // Validation
  validatePhoneNumber: (phone: string) => boolean;
}

const CreateAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(CreateAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContext");
  }
  return context;
};

export const AuthContext: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const stytch = useStytch();
  const dispatch = useAppDispatch();
  // State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [signInStep, setSignInStep] = useState<number>(0);
  const [receivedCode, setReceivedCode] = useState<boolean>(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);

  // Form fields
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");

  const [additionalAction, setAdditionalAction] =
    useState<() => Promise<void> | null>(null);

  const validatePhoneNumber = (phone: string) => {
    return phone && phone.trim() !== "";
  };

  const resetAuthState = useCallback(() => {
    setSignInStep(0);
    setCode("");
    setPhoneNumber("");
    setName("");
    setStreetAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setReceivedCode(false);
    setAuthResponse(null);
  }, []);

  const handleSignIn = useCallback(async () => {
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
            setReceivedCode(true);
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
  }, [phoneNumber, stytch.otps.sms]);

  const handleVerifySignIn = useCallback(
    async (code: string, navigate: NavigateFunction) => {
      if (code.includes("·")) return;
      setIsProcessing(true);
      try {
        await stytch.otps
          .authenticate(code, authResponse?.method_id, {
            session_duration_minutes: 525599, // Maximum: 366 d
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
                // Close any open dialogs
                const closeDialogButton =
                  document.getElementById("close-dialog");
                if (closeDialogButton) {
                  closeDialogButton.click();
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
    },
    [authResponse?.method_id, stytch.otps, dispatch]
  );

  const handleSignUp = useCallback(async () => {
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
        expiration_minutes: 10,
      });
      console.log(response);
      if (response.status_code == 200) {
        setAuthResponse(response);
        setReceivedCode(true);
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
  }, [name, phoneNumber, streetAddress, city, state, zipCode, stytch.otps.sms]);

  const handleVerifySignUp = useCallback(
    async (code: string, navigate: NavigateFunction, close: () => void) => {
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
            session_duration_minutes: 525599, // Maximum: 366 d
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
                  close();
                  if (additionalAction !== null) {
                    await additionalAction();
                  }
                  toast.success(
                    "Welcome to the bulletin! Your account is ready to go."
                  );
                  navigate("/bulletin?onboarding=true");
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
    },
    [
      authResponse?.method_id,
      stytch.otps,
      dispatch,
      name,
      phoneNumber,
      streetAddress,
      city,
      state,
      zipCode,
      additionalAction,
    ]
  );

  const value: AuthContextType = {
    // State
    isProcessing,
    signInStep,
    receivedCode,
    authResponse,

    // Form fields
    name,
    phoneNumber,
    code,
    streetAddress,
    city,
    state,
    zipCode,

    // Setters
    setName,
    setPhoneNumber,
    setCode,
    setStreetAddress,
    setCity,
    setState,
    setZipCode,

    // Actions
    handleSignIn,
    handleVerifySignIn,
    handleSignUp,
    handleVerifySignUp,
    resetAuthState,
    setAdditionalAction,

    // Validation
    validatePhoneNumber,
  };

  return <CreateAuthContext.Provider value={value}>{children}</CreateAuthContext.Provider>;
};
