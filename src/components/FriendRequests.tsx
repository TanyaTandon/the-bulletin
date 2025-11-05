import React, { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "./FriendModalContent";

const FriendRequests: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { dialog } = useDialog();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-black hover:text-black/70 hover:bg-gray-50"
        onClick={() =>
          dialog(<FriendModalContent />, {
            headerOptions: {},
          })
        }
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </Popover>
  );
};

export default FriendRequests;
