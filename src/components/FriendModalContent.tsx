import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Check, Ellipsis, PencilLine, Plus } from "lucide-react";
import { addFriendToSupabase, supabase } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";

const FriendInput: React.FC<{
  friend: string;
  setFriendInputs: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ friend, setFriendInputs }) => {
  const [phoneNumber, setPhoneNumber] = useState(friend ?? "");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [friendDetails, setFriendDetails] = useState<{
    name: string;
    address: string;
  } | null>({ name: null, address: null });

  const [friendStatus, setFriendStatus] = useState<number | null>(null);
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
                      toast.info("Your friend hasn't registered yet");
                      setAddDetails(true);
                      setFriendStatus(-1);
                    } else {
                      setFriendStatus(0);
                      setFractionalData(fractionalResponse.data[0]);
                      setTimeout(() => {
                        setAddFriend(true);
                      }, 2000);
                    }
                  });
              } else {
                toast.info("User found with that phone number");
                setFriendStatus(1);
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

  const user = useAppSelector(staticGetUser);

  function renderIcon() {
    if (phoneNumber?.length !== 10) {
      return (
        <Ellipsis
          style={{
            width: 40,
            height: "-webkit-fill-available",
          }}
        />
      );
    } else if (addFriend) {
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
            });
          }}
          style={{
            cursor: "pointer",
            width: 50,
            height: "-webkit-fill-available",
            padding: 8,
            background: "lightgrey",
            borderRadius: 4,
          }}
        />
      );
    } else {
      if (friendStatus === -1) {
        if (friendDetails.name == null || friendDetails.address == null) {
          return <PencilLine />;
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
                });
              }}
              style={{
                cursor: "pointer",
                width: 20,
                height: "-webkit-fill-available",
                padding: 8,
                background: "lightgrey",
                borderRadius: 4,
              }}
            />
          );
        }
      } else if (friendStatus === 0) {
        return (
          <Check
            style={{
              width: 40,
              height: "-webkit-fill-available",
            }}
          />
        );
      } else if (friendStatus === 1) {
        return (
          <Check
            style={{
              width: 40,
              height: "-webkit-fill-available",
            }}
          />
        );
      }
    }
  }

  return (
    <>
      <span className="flex items-center gap-2">
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
        />
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
        {renderIcon()}
      </span>
      {friendStatus === -1 && (
        <>
          <Input
            value={friendDetails.address}
            onChange={(e) => {
              setFriendDetails({ ...friendDetails, address: e.target.value });
            }}
            type="text"
            placeholder="Enter your friend's address"
          />
        </>
      )}
    </>
  );
};

const FriendModalContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(staticGetUser);

  console.log(user);

  const [friendInputs, setFriendInputs] = useState<string[]>(
    user.recipients.length > 0 ? user.recipients : [null]
  );

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => {
          dispatch(setShowFriendsModal(false));
        }}
        className="absolute right-2 top-0 text-xl font-medium cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        ×
      </button>
      <p>{user.recipients.length > 0 ? "Friends" : "Add friends"}</p>

      <div className="flex flex-col gap-4">
        {friendInputs.map((friend) => (
          <FriendInput friend={friend} setFriendInputs={setFriendInputs} />
        ))}
        {friendInputs.length !== 6 && (
          <Button
            onClick={() => {
              setFriendInputs([...friendInputs, null]);
            }}
          >
            Add Recipient
          </Button>
        )}
      </div>
    </div>
  );
};

export default FriendModalContent;
