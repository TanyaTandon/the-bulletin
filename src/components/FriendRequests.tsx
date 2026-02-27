import React, { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "./modalContent/FriendModalContent";
import { ClosureDirection } from "./ui/dialog";
import { useTourGuideWithInit } from "@/providers/contexts/TourGuideContext";

const FriendRequests: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { dialog } = useDialog();

  const [state, setState] = useState<boolean>(false);

  const { updatePositions, tour } = useTourGuideWithInit();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Button
        data-tg-title="friend_modal_trigger"
        variant="ghost"
        size="icon"
        className="friendButton relative text-black hover:text-black/70 hover:bg-gray-50"
        onClick={() =>
          dialog(<FriendModalContent setState={setState} updatePositions={updatePositions} tour={tour} />, {
            closureCondition: state ? ClosureDirection.TOP : undefined,
          })
        }
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </Popover>
  );
};

export default FriendRequests;
