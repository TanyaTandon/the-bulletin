import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
  Check,
  Ellipsis,
  Loader2,
  PencilLine,
  Plus,
  Trash,
} from "lucide-react";
import {
  addFriendToSupabase,
  addFriendViaPhoneNumber,
  removeRecipient,
  supabase,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { useSelector } from "react-redux";
import "../App.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { animated, useSpring } from "@react-spring/web";
import PhoneInput from "react-phone-number-input";
import { useDialog } from "@/providers/dialog-provider";

const FriendModalContent: React.FC<{ full?: boolean }> = ({ full }) => {
  const { toast } = useToast();

  const user = useSelector(staticGetUser);
  console.log(user);
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

  console.log(friendPhoneNumber?.length);

  const dispatch = useAppDispatch();

  const { close } = useDialog();

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
                  setFriendPhoneNumber(null);
                } else {
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
                  ).then(() => {
                    toast({
                      title: "Friend added!",
                    });
                    close();
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
                setStep(0);
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
              You can to {2} left for this month
            </h3>
            <section className="flex gap-2">
              <Input placeholder="Recipient Last Name" />
              <Input placeholder="Recipient First Name" />
            </section>
            <Input placeholder="Recipient phone number" />
            <Input placeholder="Recipient address" />
            <section className="flex gap-2">
              <Input placeholder="Recipient city" />
              <Input placeholder="Recipient state" />
            </section>
            <Input placeholder="Recipient zip code" />
            <Separator />
            <Button>Add Recipient</Button>
          </>
        );
    }
  }

  return (
    <div
      data-tg-title="friend modal"
      className={full ? "flex flex-col gap-4 w-full" : "flex flex-col gap-4"}
    >
      {switchStep(step)}
    </div>
  );
};

export default FriendModalContent;
