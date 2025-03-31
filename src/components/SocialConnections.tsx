
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface ConnectionProps {
  title: string;
}

const SocialConnection: React.FC<ConnectionProps> = ({ title }) => {
  // Updated names for connections
  const connections = [
    { id: 1, name: "Mahika" },
    { id: 2, name: "Tanya" },
    { id: 3, name: "Lila" },
    { id: 4, name: "Adi" },
    { id: 5, name: "Nigel" },
  ];

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {connections.map((connection) => (
          <div key={connection.id} className="flex flex-col items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1">{connection.name}</span>
          </div>
        ))}
        
        {/* Turby in a square box */}
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
            <span className="text-xs font-medium">Tu</span>
          </div>
          <span className="text-xs mt-1">Turby</span>
        </div>
        
        {/* Add box */}
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border border-dashed border-gray-300 rounded flex items-center justify-center">
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
