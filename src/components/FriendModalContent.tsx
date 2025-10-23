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
import { addFriendToSupabase, removeRecipient, supabase } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { setUser } from "@/redux/user";
import { useSelector } from "react-redux";
import "../App.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

enum FriendStatus {
  NOT_REGISTERED = -1,
  FRACTIONAL = 0,
  EXISTS = 1,
}

const FriendInput: React.FC<{
  friend: string;
  existingFriends: string[];
  setFriendInputs: React.Dispatch<React.SetStateAction<string[]>>;
  setExistingFriends: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ friend, existingFriends, setFriendInputs, setExistingFriends }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState(friend ?? "");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [friendName, setFriendName] = useState<string | null>(null);
  const [hover, setHover] = useState<boolean>(false);

  const [friendDetails, setFriendDetails] = useState<{
    name: string;
    address: string;
  } | null>({ name: null, address: null });

  const [friendStatus, setFriendStatus] = useState<FriendStatus | null>(null);
  const [fractionalData, setFractionalData] = useState(null);
  const [addDetails, setAddDetails] = useState<boolean>(false);
  const [addFriend, setAddFriend] = useState<boolean>(false);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }

    if (phoneNumber) {
      const newTimer = setTimeout(async () => {
        console.log("Calling API with phone number:", phoneNumber);

        if (phoneNumber.length === 10) {
          if (phoneNumber === user.phone_number) {
            toast.info(`Sweetie... \n\n you're already your own best friend!`);
            return;
          }
          setLoading(true);
          await supabase
            .from("user_record")
            .select("*")
            .eq("phone_number", phoneNumber)
            .then(async (response) => {
              if (response.data.length === 0) {
                await supabase
                  .from("fractional_user_record")
                  .select("*")
                  .eq("id", phoneNumber)
                  .then((fractionalResponse) => {
                    if (fractionalResponse.data.length === 0) {
                      setLoading(false);
                      toast.info(
                        "You're the first to send your friend a bulletin! \n \n They're lucky 😉"
                      );
                      setAddDetails(true);
                      setFriendStatus(FriendStatus.NOT_REGISTERED);
                    } else {
                      if (existingFriends.includes(phoneNumber)) {
                        toast.info("User found with that phone number");
                      } else {
                        toast.info(
                          "Your friend has been added by others! \n \n How popular!"
                        );
                      }
                      setFriendName(
                        fractionalResponse.data[0].suggested_name[0]
                      );
                      setLoading(false);
                      setFriendStatus(FriendStatus.FRACTIONAL);
                      setFractionalData(fractionalResponse.data[0]);
                      setTimeout(() => {
                        setAddFriend(true);
                      }, 2000);
                    }
                  });
              } else {
                setLoading(false);
                setFriendName(response.data[0].firstName);
                console.log(response.data);
                toast.info("User found with that phone number");
                setFriendStatus(FriendStatus.EXISTS);
                setTimeout(() => {
                  setAddFriend(true);
                }, 2000);
              }
            });
        } else {
          toast.info("Please enter a valid phone number");
        }
      }, 1500);

      setTimer(newTimer);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [phoneNumber]);

  const user = useSelector(staticGetUser);

  const renderIcon = useMemo(() => {
    if (loading) {
      return (
        <Loader2
          style={{
            width: 50,
          }}
        />
      );
    }
    if (existingFriends.includes(friend)) {
      return (
        <>
          {hover == false ? (
            <Check
              onMouseOver={() => {
                setHover(true);
              }}
              style={{
                cursor: "pointer",
                width: 50,
                padding: 8,
                background: "lightgrey",
                borderRadius: 4,
              }}
            />
          ) : (
            <Trash
              onClick={async () => {
                await removeRecipient({
                  user,
                  recipient: friend,
                }).then((response) => {
                  if (response) {
                    setExistingFriends(
                      existingFriends.filter((item) => item !== friend)
                    );
                    setFriendInputs((prev) =>
                      prev.filter((item) => item !== friend)
                    );
                    dispatch(setUser(response[0]));
                    toast.success("Friend removed successfully");
                  }
                });
              }}
              onMouseOut={() => {
                setHover(false);
              }}
              style={{
                cursor: "pointer",
                width: 50,
                padding: 8,
                background: "lightgrey",
                borderRadius: 4,
              }}
            />
          )}
        </>
      );
    } else if (phoneNumber?.length !== 10) {
      return (
        <Ellipsis
          style={{
            width: 40,
          }}
        />
      );
    } else if (addFriend) {
      return (
        <Plus
          onClick={async () => {
            setLoading(true);
            await addFriendToSupabase({
              friend: {
                ...friendDetails,
                phone_number: phoneNumber,
              },
              fractionalUser: friendStatus,
              user,
              fractionalData,
            }).then((response) => {
              setLoading(false);
              toast.success("Friend added successfully");
              setExistingFriends([...existingFriends, phoneNumber]);
              dispatch(setUser(response[0]));
              setFriendStatus(FriendStatus.EXISTS);
            });
          }}
          style={{
            cursor: "pointer",
            width: 50,
            padding: 8,
            background: "lightgrey",
            borderRadius: 4,
          }}
        />
      );
    } else {
      if (friendStatus === FriendStatus.NOT_REGISTERED) {
        if (
          friendDetails.name == null ||
          (friendDetails.address == null && friendDetails.address?.length > 12)
        ) {
          return (
            <PencilLine
              style={{
                cursor: "pointer",
                width: 50,
                padding: 8,
                borderRadius: 4,
              }}
            />
          );
        } else {
          return (
            <Plus
              onClick={async () => {
                await addFriendToSupabase({
                  friend: {
                    ...friendDetails,
                    phone_number: phoneNumber,
                  },
                  fractionalUser: friendStatus,
                  user,
                  fractionalData,
                }).then((response) => {
                  setLoading(false);
                  toast.success("Friend added successfully");
                  setExistingFriends([...existingFriends, phoneNumber]);
                  dispatch(setUser(response[0]));
                });
              }}
              style={{
                cursor: "pointer",
                width: 50,
                padding: 8,
                background: "lightgrey",
                borderRadius: 4,
              }}
            />
          );
        }
      } else if (friendStatus === FriendStatus.FRACTIONAL) {
        return (
          <Check
            style={{
              width: 50,
              padding: 8,
            }}
          />
        );
      } else if (friendStatus === FriendStatus.EXISTS) {
        return (
          <Check
            style={{
              width: 50,
              padding: 8,
            }}
          />
        );
      }
    }
    return null;
  }, [
    loading,
    existingFriends,
    friend,
    phoneNumber,
    addFriend,
    friendDetails,
    friendStatus,
    user,
    fractionalData,
    setExistingFriends,
    hover,
    setHover,
  ]);

  const isMobile = useIsMobile();

  return (
    <>
      <span className="flex items-center gap-2 browserHelper">
        <Input
          className="disabled:opacity-100"
          disabled={existingFriends.includes(friend) && friendName != null}
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
        />
        {friendName != null && (
          <Input
            className="disabled:opacity-100"
            disabled={true}
            type="text"
            value={friendName}
          />
        )}
        {addDetails && (
          <>
            <Input
              onChange={(e) => {
                setFriendDetails({ ...friendDetails, name: e.target.value });
              }}
              type="text"
              placeholder="Enter name"
              value={friendDetails.name}
            />
          </>
        )}
        {renderIcon}
      </span>
      {friendStatus === FriendStatus.NOT_REGISTERED && (
        <>
          <Input
            value={friendDetails.address}
            onChange={(e) => {
              setFriendDetails({ ...friendDetails, address: e.target.value });
            }}
            type="text"
            placeholder="123 Test Ave, San Francisco, CA 94101"
          />
        </>
      )}
    </>
  );
};

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

  function switchStep(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <h1 className="text-2xl font-medium text-center">
              Here you can add friends to your bulletin.
            </h1>
            <h3 className="text-sm text-center">
              Copy the link below and send it to your friends
            </h3>
            <Button
              onClick={() => {
                handleCopyLink();
              }}
            >
              Add Friend
            </Button>
            <Separator />
            <h3 className="text-sm text-center">
              or if you'd just like them to be added to your bulletin, you can
              add them manually.
            </h3>
            <Button
              onClick={() => {
                setStep(1);
              }}
              variant="outline"
            >
              Add Recipient
            </Button>
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
