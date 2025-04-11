
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import ContactSync from "./ContactSync";

interface ConnectionProps {
  title: string;
}

const SocialConnection: React.FC<ConnectionProps> = ({ title }) => {
  const { friends } = useUser();
  const isFollowers = title === "Followers";
  
  // We'll use the same friends list for both followers and following for simplicity
  const connections = friends;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {connections.map((connection) => (
          <div key={connection.id} className="flex flex-col items-center">
            <Avatar className="h-10 w-10" style={{ backgroundColor: connection.id === "f1" ? "#FFDEE2" : 
                                                  connection.id === "f2" ? "#E5DEFF" : 
                                                  connection.id === "f3" ? "#D3E4FD" :
                                                  connection.id === "f4" ? "#F2FCE2" :
                                                  connection.id === "f5" ? "#FEF7CD" : "#EFEFEF" }}>
              <AvatarFallback style={{ backgroundColor: "transparent", color: "#333" }}>
                {connection.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1">{connection.name}</span>
          </div>
        ))}
        
        {/* Add box only shown in the Following section */}
        {!isFollowers && (
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-xs mt-1">Add</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SocialConnections: React.FC = () => {
  return (
    <div className="mb-6 border-b pb-4">
      <SocialConnection title="Followers" />
      <SocialConnection title="Following" />
      
      <div className="flex justify-end mt-2">
        <ContactSync />
      </div>
    </div>
  );
};

export default SocialConnections;
