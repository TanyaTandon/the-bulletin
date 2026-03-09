import React, { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, UserPlus } from "lucide-react";
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "./modalContent/FriendModalContent";
import { ClosureDirection } from "./ui/dialog";
import { useTourGuideWithInit } from "@/providers/contexts/TourGuideContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const FriendRequests: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { dialog } = useDialog();

  const { updatePositions, tour } = useTourGuideWithInit();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Button
        data-tg-title="friend_modal_trigger"
        variant="ghost"
        size="icon"
        className="friendButton m-0 relative text-black hover:text-black/70 hover:bg-gray-50 rounded-[6px] w-[3rem]"
        onClick={() =>
          dialog(<FriendModalContent updatePositions={updatePositions} tour={tour} />, {
            parentOptions: {
              className: "helperFriendModal",
            },
            topLeftIcon: (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    <HelpCircle size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[220px] text-xs">
                  <p><strong>Friends</strong> are people on the platform — you can add each other to your bulletins and they'll get notified.</p>
                  <p className="mt-1"><strong>Recipients</strong> receive your bulletin by mail each month without needing an account, but you can only have 2.</p>
                </TooltipContent>
              </Tooltip>
            ),
          })
        }
      >
        <UserPlus className="h-5 w-5 mx-auto" />
      </Button>
    </Popover>
  );
};

export default FriendRequests;
