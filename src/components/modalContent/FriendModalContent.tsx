import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import {
  Check,
  Ellipsis,
  Loader2,
  PencilLine,
  Plus,
  Trash,
} from "lucide-react";
import {
  addFriendViaPhoneNumber,
  removeRecipient,
  supabase,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { useSelector } from "react-redux";
import "../../App.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { animated, useSpring } from "@react-spring/web";
import PhoneInput from "react-phone-number-input";
import { useDialog } from "@/providers/dialog-provider";
import { useReducer } from "react";
import { addRecipient } from "@/redux/user";
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour";


export type RecipientState = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  fullAddress: string;
};

const FriendModalContent: React.FC<{ full?: boolean, setState?: (state: boolean) => void, updatePositions?: () => void, tour?: TourGuideClient }> = ({ full, setState, updatePositions, tour }) => {
  const { toast } = useToast();


  const user = useSelector(staticGetUser);
  const availableRecipients = 2 - user.recipients.length;
  // console.log(user);
  const uniqueLink = `${window.location.origin}/register/${user.id}?name=${user.firstName}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(uniqueLink);
    toast({
      title: "Link copied!",
      description:
        "Share this with your friends to invite them to the bulletin",
    });
  }, [uniqueLink, toast]);

  const [step, setStep] = useState<number>(0);

  const [friendPhoneNumber, setFriendPhoneNumber] = useState<string | null>(
    null
  );

  const heightAnimation = useSpring({
    height: friendPhoneNumber == null ? "100%" : "0%",
    opacity: friendPhoneNumber == null ? 1 : 0,
    config: { tension: 300, friction: 50 },
  });

  const buttonAnimation = useSpring({
    opacity: friendPhoneNumber !== null ? 1 : 0,
    height: friendPhoneNumber !== null ? "100%" : "0%",
    position: "relative",
    zIndex: friendPhoneNumber !== null ? 10 : 0,
    width: "100%",
    display: friendPhoneNumber !== null ? "block" : "none",
    config: { tension: 300, friction: 50 },
  });
  const titleAnimation = useSpring({
    opacity: friendPhoneNumber !== null ? 1 : 0,
    height: friendPhoneNumber !== null ? "2rem" : "0%",
    width: "100%",
    config: { tension: 300, friction: 50 },
  });

  const dispatch = useAppDispatch();

  const { close } = useDialog();


  type RecipientAction =
    | { type: "SET_FIRST_NAME"; payload: string }
    | { type: "SET_LAST_NAME"; payload: string }
    | { type: "SET_PHONE"; payload: string }
    | { type: "SET_ADDRESS"; payload: string }
    | { type: "SET_CITY"; payload: string }
    | { type: "SET_ZIP"; payload: string }
    | { type: "RESET" };

  const initialRecipientState: RecipientState = {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    fullAddress: "",

  };
  function formatFullAddress(address: string, city: string, zip: string): string {
    return [address, city, zip].filter(Boolean).join("-");
  }
  function recipientReducer(state: RecipientState, action: RecipientAction): RecipientState {
    switch (action.type) {
      case "SET_FIRST_NAME":
        return { ...state, firstName: action.payload };
      case "SET_LAST_NAME":
        return { ...state, lastName: action.payload };
      case "SET_PHONE":
        return { ...state, phone: action.payload };
      case "SET_ADDRESS": {
        const address = action.payload;
        const fullAddress = formatFullAddress(address, state.city, state.zip);
        return { ...state, address, fullAddress };
      }
      case "SET_CITY": {
        const city = action.payload;
        const fullAddress = formatFullAddress(state.address, city, state.zip);
        return { ...state, city, fullAddress };
      }
      case "SET_ZIP": {
        const zip = action.payload;
        const fullAddress = formatFullAddress(state.address, state.city, zip);
        return { ...state, zip, fullAddress };
      }
      case "RESET":
        return { ...initialRecipientState };
      default:
        return state;
    }
  }

  const [recipient, setRecipient] = useReducer(recipientReducer, initialRecipientState);



  console.log(recipient);

  function switchStep(step: number) {

    switch (step) {
      case 0:
        return (
          <>
            <animated.div
              className="flex flex-col gap-4 w-full"
              style={heightAnimation}
            >
              <h1 className="text-2xl font-medium text-center">
                Here you can add friends and recipients to your bulletin.
              </h1>
              <h3 className="text-sm text-center">
                Invite your friends to join the platform and add themselves to
                your bulletin!
              </h3>
              <Button
                className="relative z-0"
                onClick={() => {
                  handleCopyLink();
                }}
              >
                Add Friend
              </Button>
              <Separator className="w-[50%] mx-auto block" />
              <h3 className="text-sm text-center">
                Or if you know your friend's phone number, you can add them
                directly to your bulletin!
                <br /> (they'll get a notification when you add them)
              </h3>
            </animated.div>

            <animated.div style={titleAnimation}>
              <h3 className="text-sm text-center mb-0">
                Your friends will receive a notification when you add them to
                your bulletin!
              </h3>
            </animated.div>
            <PhoneInput
              className="border-[1px] border-gray-300 rounded-md p-2"
              focusInputOnCountrySelection={false}
              countryCallingCodeEditable={false}
              defaultCountry="US"
              id="phone"
              type="tel"
              placeholder="Enter friend's phone number"
              onChange={(e) => {
                if (e == null) {
                  setState(true);
                  setFriendPhoneNumber(null);
                } else {
                  setState(false);
                  setFriendPhoneNumber(e);
                }
              }}
              required
            />
            <animated.div style={buttonAnimation}>
              <Button
                onClick={async () => {
                  await dispatch(
                    addFriendViaPhoneNumber({ user, friendPhoneNumber })
                  ).then((res) => {
                    if (res.payload.response.success) {
                      toast({
                        title: "Friend added!",
                      });
                      close();
                    } else {
                      toast({
                        title: "Failed to add friend",
                        description: res.payload.error.message,
                      });
                    }
                  });
                }}
                className="block w-[90%] mx-auto relative z-30"
              >
                Add Friend Directly
              </Button>
            </animated.div>
            <animated.div
              className="flex flex-col gap-4 w-full"
              style={heightAnimation}
            >
              <Separator />
              <h3 className="text-sm text-center">
                if you'd like to add someone as a Recipient, enter their
                information below!
              </h3>
              <Button
                onClick={() => {
                  setStep(1);
                  setTimeout(() => {
                    updatePositions?.();
                  }, 200);

                }}
                variant="outline"
              >
                Add Recipient
              </Button>
            </animated.div>
          </>
        );
      case 1:
        return (
          <>
            <button
              className="absolute top-5 left-5"
              onClick={() => {
                setStep(0)
                setTimeout(() => {

                  updatePositions?.();
                }, 200);
              }}
            >
              ←
            </button>
            <h1 className="text-2xl font-medium text-center">Add Recipient</h1>
            <h3 className="text-sm text-center">
              recipient's will recieve their bulletin in the mail without
              lifting a finger, however you can only have two each month
            </h3>
            <Separator />
            <h3 className="text-sm text-center">
              You can currently add {availableRecipients} recipients
            </h3>
            <section className="flex gap-2">
              <Input
                value={recipient.firstName}
                onChange={(e) => setRecipient({ type: "SET_FIRST_NAME", payload: e.target.value })}
                placeholder="Recipient First Name"
              />
              <Input
                value={recipient.lastName}
                onChange={(e) => setRecipient({ type: "SET_LAST_NAME", payload: e.target.value })}
                placeholder="Recipient Last Name"
              />
            </section>
            <PhoneInput
              className="border-[1px] border-gray-300 rounded-md p-2"
              focusInputOnCountrySelection={false}
              countryCallingCodeEditable={false}
              defaultCountry="US"
              id="phone"
              type="tel"
              value={recipient.phone}
              placeholder="Enter recipient's phone number"
              onChange={(e) => setRecipient({ type: "SET_PHONE", payload: e ?? "" })}
              required
            />
            <Input
              value={recipient.address}
              onChange={(e) => setRecipient({ type: "SET_ADDRESS", payload: e.target.value })}
              placeholder="Recipient address"
            />
            <section className="flex gap-2">
              <Input
                value={recipient.city}
                onChange={(e) => setRecipient({ type: "SET_CITY", payload: e.target.value })}
                placeholder="Recipient city"
              />
              <Input
                value={recipient.zip}
                onChange={(e) => setRecipient({ type: "SET_ZIP", payload: e.target.value })}
                placeholder="Recipient zip code"
              />
            </section>
            <Separator />
            <Button onClick={() => {
              dispatch(addRecipient({ recipient, user })).then((res) => {
                console.log(res);
                if (res.payload.success) {
                  toast({
                    title: "Recipient added!",
                  });
                  setRecipient({ type: "RESET" });
                  setStep(0);
                  if (tour && !tour.isFinished) {
                    tour.nextStep();
                  }
                  setTimeout(() => {
                    updatePositions?.();
                  }, 200);
                }
              });
            }}>Add Recipient</Button>
          </>
        );
    }
  }

  return (
    <div
      data-tg-title="friend_modal_content"
      className={full ? "flex flex-col gap-4 w-full" : "flex flex-col gap-4"}
    >
      <br />
      {switchStep(step)}
    </div>
  );
};

export default FriendModalContent;
