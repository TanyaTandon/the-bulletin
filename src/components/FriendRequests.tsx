import React, { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserPlus, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import ContactSync from "./ContactSync";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { useAppDispatch } from "@/redux";

const FriendRequests = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  // Generate a unique link - in a real app, this would be more sophisticated
  const uniqueLink = `${window.location.origin}?ref=${Math.random()
    .toString(36)
    .substring(2, 10)}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(uniqueLink);
    toast({
      title: "Link copied!",
      description:
        "Share this with your friends to invite them to the bulletin",
    });
  }, [uniqueLink, toast]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* <PopoverTrigger asChild> */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-black hover:text-black/70 hover:bg-gray-50"
        onClick={() => dispatch(setShowFriendsModal(true))}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </Popover>
  );
};

export default FriendRequests;
