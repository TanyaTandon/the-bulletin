
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface ConnectionProps {
  title: string;
}

const SocialConnection: React.FC<ConnectionProps> = ({ title }) => {
  // Updated names for connections with pastel colors
  const connections = [
    { id: 1, name: "Mahika", color: "#FFDEE2" }, // Soft Pink
    { id: 2, name: "Tanya", color: "#E5DEFF" },  // Soft Purple
    { id: 3, name: "Lila", color: "#D3E4FD" },   // Soft Blue  
    { id: 4, name: "Adi", color: "#F2FCE2" },    // Soft Green
    { id: 5, name: "Nigel", color: "#FEF7CD" },  // Soft Yellow
  ];

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {connections.map((connection) => (
          <div key={connection.id} className="flex flex-col items-center">
            <Avatar className="h-10 w-10" style={{ backgroundColor: connection.color }}>
              <AvatarFallback style={{ backgroundColor: connection.color, color: "#333" }}>
                {connection.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1">{connection.name}</span>
          </div>
        ))}
        
        {/* Removed Turby block */}
        
        {/* Add box */}
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
            <Plus className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-xs mt-1">Add</span>
        </div>
      </div>
    </div>
  );
};

const SocialConnections: React.FC = () => {
  return (
    <div className="mb-6 border-b pb-4">
      <SocialConnection title="Followers" />
      <SocialConnection title="Following" />
    </div>
  );
};

export default SocialConnections;
