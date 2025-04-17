
import React, { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserPlus, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import ContactSync from "./ContactSync";

const FriendRequests = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Generate a unique link - in a real app, this would be more sophisticated
  const uniqueLink = `${window.location.origin}?ref=${Math.random().toString(36).substring(2, 10)}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(uniqueLink);
    toast({
      title: "Link copied!",
      description: "Share this with your friends to invite them to the bulletin",
    });
  }, [uniqueLink, toast]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-black hover:text-black/70 hover:bg-gray-50"
        >
          <UserPlus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col space-y-4">
          <div className="text-center mb-2">
            <h3 className="font-medium text-base">Invite your friends to join</h3>
          </div>
          
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Share this link with your friends to invite them to the bulletin:</p>
            <div className="flex space-x-2">
              <Input 
                value={uniqueLink} 
                readOnly 
                className="text-xs"
              />
              <Button size="sm" onClick={handleCopyLink}>
                <Share2 className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-2">Add Friends</h3>
            <div className="flex justify-center">
              <ContactSync />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendRequests;
