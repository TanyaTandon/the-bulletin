import { useAppDispatch } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  addFriendViaPhoneNumber,
  mapUserRecordFromDb,
  supabase,
} from "@/lib/api";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import "../../App.css";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { animated, useSpring } from "@react-spring/web";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useDialog } from "@/providers/dialog-provider";
import { useReducer } from "react";
import { addRecipient, User } from "@/redux/user";
import type { TourInstance } from "@/providers/contexts/TourGuideContext";
import { PencilLine, Plus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";


export type RecipientState = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  fullAddress: string;
};

const AddFriendRow: React.FC<{
  onCopyLink: () => void;
  onAddFriendSuccess: () => void;
  user: User;
}> = ({ onCopyLink, onAddFriendSuccess, user }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);

  const isValid = phoneNumber ? isValidPhoneNumber(phoneNumber) : false;
  const isMobile = useIsMobile();

  // On mobile always show the split so the pencil is always visible.
  // Also stays true while hovering so the spring never resets mid-hover.
  const showSplit = isMobile || isHovered || isExpanded;

  const mainSpring = useSpring({
    width: showSplit ? "87.5%" : "100%",
    paddingRight: showSplit && !isExpanded ? "4px" : "0px",
    config: { tension: 300, friction: 30 },
  });

  const pencilSpring = useSpring({
    width: showSplit ? "12.5%" : "0%",
    opacity: showSplit ? 1 : 0,
    config: { tension: 300, friction: 30 },
  });

  const handleAdd = async () => {
    if (!phoneNumber || !isValid) return;
    const res = await dispatch(addFriendViaPhoneNumber({ user, friendPhoneNumber: phoneNumber }));
    const payload = res.payload as any;
    if (payload?.response?.success) {
      toast({ title: "Friend added!" });
      onAddFriendSuccess();
    } else {
      toast({
        title: "Failed to add friend",
        description: payload?.error?.message,
      });
    }
  };

  if (isExpanded) {
    return (
      <div className="flex w-full items-center gap-1">
        <div className="flex-[7] min-w-0">
          <PhoneInput
            className="border-[1px] border-gray-300 rounded-none p-[7px]"
            focusInputOnCountrySelection={false}
            countryCallingCodeEditable={false}
            defaultCountry="US"
            value={phoneNumber}
            placeholder="Friend's phone number"
            onChange={(val) => {
              setPhoneNumber(val ?? undefined);
            }}
          />
        </div>
        <div className="flex-[1] flex justify-center items-center">
          {!phoneNumber ? (
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center min-w-[47px]"
              onClick={() => {
                setIsExpanded(false);
                setPhoneNumber(undefined);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant={isValid ? "default" : "outline"}
              size="icon"
              className="flex items-center justify-center min-w-[47px]"
              disabled={!isValid}
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <animated.div className="shrink-0 overflow-hidden" style={mainSpring}>
        <Button
          className="bg-violet-500 w-full whitespace-nowrap overflow-hidden text-xs sm:text-sm"
          variant="outline"
          onClick={onCopyLink}
        >
          <span className="truncate text-white">
            {isHovered ? "copy friend link, or enter number →" : "add a friend"}
          </span>
        </Button>
      </animated.div>
      <animated.div className="shrink-0 overflow-hidden" style={pencilSpring}>
        <Button
          variant="outline"
          size="icon"
          className="w-full h-full flex items-center justify-center"
          onClick={() => setIsExpanded(true)}
        >
          <PencilLine className="h-4 w-4" />
        </Button>
      </animated.div>
    </div>
  );
};


const FriendModalContent: React.FC<{ updatePositions?: () => void, tour?: TourInstance }> = ({ updatePositions, tour }) => {
  const { toast } = useToast();

  const user = useSelector(staticGetUser);
  const availableRecipients = 2 - user.recipients.length;
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

  const [connectionDetails, setConnectionDetails] = useState<{ firstName: string; lastName: string; phone_number: string }[]>([]);
  const [recipientDetails, setRecipientDetails] = useState<{ id: string; suggested_name: string[] }[]>([]);

  console.log('recipientDetails', recipientDetails);
  useEffect(() => {
    if (user.connections?.length > 0) {
      supabase
        .from("user_record")
        .select("first_name, last_name, phone_number")
        .in("phone_number", user.connections)
        .then(({ data }) => {
          if (data) setConnectionDetails(data.map(mapUserRecordFromDb) as typeof connectionDetails);
        });
    }
    if (user.recipients?.length > 0) {
      supabase
        .from("fractional_user_record")
        .select("id, suggested_name")
        .in("id", user.recipients)
        .then(({ data }) => {
          if (data) setRecipientDetails(data);
        });
    }
  }, [user.connections, user.recipients]);

  console.log('tour', tour);

  function switchStep(step: number) {

    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-4 w-full">
            <aside className="flex gap-2 justify-between items-baseline">

              <h2 className="text-lg font-medium">Friends</h2>
              <p className="text-sm">
                {connectionDetails.length}/6
              </p>
            </aside>
            {connectionDetails.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {connectionDetails.map((c) => (
                  <li key={c.phone_number} className="text-sm px-2 py-1 rounded-md bg-muted">
                    {c.firstName} {c.lastName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No friends added yet.</p>
            )}

            <AddFriendRow
              onCopyLink={handleCopyLink}
              onAddFriendSuccess={close}
              user={user}
            />

            <Separator />

            {/* Recipients section */}
            <h2 className="text-lg font-medium">Recipients <span className="text-sm font-normal text-muted-foreground">({user.recipients.length}/2)</span></h2>
            {recipientDetails.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {recipientDetails.map((r) => (
                  <li key={r.id} className="text-sm px-2 py-1 rounded-md bg-muted">
                    {r.suggested_name ?? "Unnamed recipient"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recipients added yet.</p>
            )}

            {availableRecipients > 0 && (
              <Button
                onClick={() => {
                  setStep(1);
                  if (tour && !tour.isFinished && tour.activeStep !== 0) {
                    setTimeout(() => updatePositions?.(), 200);
                  }
                }}
                variant="outline"
              >
                add recipient
              </Button>
            )}
          </div>
        );
      case 1:
        return (
          <>
            <button
              className="absolute top-5 left-5"
              onClick={() => {
                setStep(0)
                console.log('tourshit', tour, tour.isFinished, tour.activeStep);
                if (tour && !tour.isFinished && tour.activeStep !== 0) {
                  setTimeout(() => {
                    updatePositions?.();
                  }, 200);
                }
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
              you can currently add <span style={{
                fontWeight: "500"
              }} className="text-purple-700 font-[Delight]">{availableRecipients}</span> recipients
            </h3>
            <section className="flex gap-2">
              <Input
                value={recipient.firstName}
                onChange={(e) => setRecipient({ type: "SET_FIRST_NAME", payload: e.target.value })}
                placeholder="first name"
              />
              <Input
                value={recipient.lastName}
                onChange={(e) => setRecipient({ type: "SET_LAST_NAME", payload: e.target.value })}
                placeholder="last name"
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
              placeholder="recipient's phone number"
              onChange={(e) => setRecipient({ type: "SET_PHONE", payload: e ?? "" })}
              required
            />
            <Input
              value={recipient.address}
              onChange={(e) => setRecipient({ type: "SET_ADDRESS", payload: e.target.value })}
              placeholder="address"
            />
            <section className="flex gap-2">
              <Input
                value={recipient.city}
                onChange={(e) => setRecipient({ type: "SET_CITY", payload: e.target.value })}
                placeholder="city"
              />
              <Input
                value={recipient.zip}
                onChange={(e) => setRecipient({ type: "SET_ZIP", payload: e.target.value })}
                placeholder="zip code"
              />
            </section>
            <Separator />
            <Button onClick={() => {
              dispatch(addRecipient({ recipient, user })).then((res) => {
                const payload = res.payload as any;
                if (payload?.success) {
                  toast({
                    title: "Recipient added!",
                  });
                  setRecipient({ type: "RESET" });
                  if (tour && !tour.isFinished && tour.activeStep !== 0) {
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
      className={"flex flex-col gap-4 w-full min-w-[25vw]"}
    >
      <br />
      {switchStep(step)}
    </div>
  );
};

export default FriendModalContent;
