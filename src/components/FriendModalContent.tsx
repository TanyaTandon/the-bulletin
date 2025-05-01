import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { addFriendToSupabase, removeRecipient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { PlusCircle, X, Trash2, Loader2 } from "lucide-react";
import { fetchUser } from "@/redux/user";

const FriendModalContent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(staticGetUser);
  const { toast } = useToast();
  const [fractionUsers, setFractionUsers] = useState([]);
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [friend, setFriend] = useState({
    name: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    const fetchFractionUsers = async () => {
      const { data, error } = await fetch(
        "https://voiuicuaujbhkkljtjfw.supabase.co/rest/v1/fractional_user_record",
        {
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXVpY3VhdWpiaGtrbGp0amZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQxNzYwMSwiZXhwIjoyMDU5OTkzNjAxfQ.6OC835cAwInmVOpG2yJknezG1RUQnOMT0tAlewWFv5E",
          },
        }
      ).then((res) => res.json());

      if (error) {
        console.error("Error fetching fraction users:", error);
      } else {
        console.log("Fraction users:", data);
        setFractionUsers(data);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await fetch(
        "https://voiuicuaujbhkkljtjfw.supabase.co/rest/v1/user_record",
        {
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXVpY3VhdWpiaGtrbGp0amZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQxNzYwMSwiZXhwIjoyMDU5OTkzNjAxfQ.6OC835cAwInmVOpG2yJknezG1RUQnOMT0tAlewWFv5E",
          },
        }
      ).then((res) => res.json());

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        console.log("Users:", data);
        setUsers(data);
      }
    };

    fetchFractionUsers();
    fetchUsers();
  }, []);

  const handleAddFriend = async () => {
    setIsLoading(true);

    // Check if phone number is provided
    if (!friend.phone_number) {
      toast({
        title: "Phone number required",
        description: "Please enter your friend's phone number.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if we've already added this person
    if (user?.recipients?.includes(friend.phone_number)) {
      toast({
        title: "Friend already added",
        description: "This person is already in your recipients list.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if user already has 8 recipients
    if (user?.recipients?.length >= 8) {
      toast({
        title: "Recipient limit reached",
        description: "You can only add up to 8 recipients.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if non-user requires name and address
    const isExistingUser = users.find(
      (u) => u.phone_number === friend.phone_number
    );
    const isFractionalUser = fractionUsers.find(
      (u) => u.id === friend.phone_number
    );

    if (!isExistingUser && !isFractionalUser && (!friend.name || !friend.address)) {
      toast({
        title: "Missing information",
        description: "Please provide name and address for non-bulletin users.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    let fractionalUser = -1;
    let fractionalData = null;

    if (isExistingUser) {
      fractionalUser = 1;
    } else if (isFractionalUser) {
      fractionalUser = 0;
      fractionalData = isFractionalUser;
    }

    try {
      const userData = await addFriendToSupabase({
        friend,
        fractionalUser,
        user,
        fractionalData,
      });

      await dispatch(fetchUser(user.phone_number));

      toast({
        title: "Friend added",
        description: "Your friend has been added to your recipients list.",
      });

      // Reset form
      setFriend({
        name: "",
        phone_number: "",
        address: "",
      });
    } catch (error) {
      console.error("Error adding friend:", error);
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipient = async (recipient) => {
    try {
      await removeRecipient({
        user,
        recipient,
      });

      await dispatch(fetchUser(user.phone_number));

      toast({
        title: "Recipient removed",
        description: "The recipient has been removed from your list.",
      });
    } catch (error) {
      console.error("Error removing recipient:", error);
      toast({
        title: "Error",
        description: "Failed to remove recipient. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-4 relative">
      <button
        onClick={() => dispatch(setShowFriendsModal(false))}
        className="absolute right-2 top-0 cursor-pointer"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Add your friends!</h2>
          <p className="text-sm text-muted-foreground">
            You can add up to 6 bulletin users and 2 non-users to receive your bulletin.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={friend.phone_number}
                onChange={(e) =>
                  setFriend({ ...friend, phone_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={friend.name}
                onChange={(e) => setFriend({ ...friend, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter full address"
              value={friend.address}
              onChange={(e) => setFriend({ ...friend, address: e.target.value })}
            />
          </div>

          <Button
            onClick={handleAddFriend}
            className="w-full"
            disabled={isLoading || !friend.phone_number}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Friend
              </>
            )}
          </Button>
        </div>

        {user?.recipients?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Your Recipients</h3>
            <div className="space-y-2">
              {user.recipients.map((recipient, index) => {
                const recipientUser = users.find(
                  (u) => u.phone_number === recipient
                );
                const fractionalUser = fractionUsers.find(
                  (u) => u.id === recipient
                );

                const displayName = recipientUser
                  ? recipientUser.firstName
                  : fractionalUser
                  ? fractionalUser.suggested_name[0]
                  : recipient;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                  >
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <p className="text-sm text-gray-500">{recipient}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRecipient(recipient)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendModalContent;
