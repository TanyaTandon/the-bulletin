
import React, { useState } from "react";
import { useUser, FriendRequest } from "@/contexts/UserContext";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const FriendRequests = () => {
  const { friendRequests, updateFriendRequestStatus } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const pendingRequests = friendRequests.filter(request => request.status === "pending");

  const handleAccept = (request: FriendRequest) => {
    updateFriendRequestStatus(request.id, "accepted");
    toast({
      title: "Friend request accepted",
      description: `You are now friends with ${request.name}`,
    });
  };

  const handleReject = (request: FriendRequest) => {
    updateFriendRequestStatus(request.id, "rejected");
    toast({
      description: `Friend request from ${request.name} rejected`,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <UserPlus className="h-5 w-5" />
          {pendingRequests.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col space-y-4">
          <h3 className="font-medium text-sm">Friend Requests</h3>
          
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No pending friend requests
            </p>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{request.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{request.name}</p>
                      <p className="text-xs text-muted-foreground">{request.phone}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                      onClick={() => handleAccept(request)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                      onClick={() => handleReject(request)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendRequests;
