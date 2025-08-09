import React, { useState, useCallback } from "react";
import { useUser } from "@/providers/contexts/UserContext";
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
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "./FriendModalContent";

const FriendRequests = () => {
  const [open, setOpen] = useState(false);

  const { dialog } = useDialog();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-black hover:text-black/70 hover:bg-gray-50"
        onClick={() => dialog(<FriendModalContent />)}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </Popover>
  );
};

export default FriendRequests;
