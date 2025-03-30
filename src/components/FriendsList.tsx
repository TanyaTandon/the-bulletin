
import React, { useState } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, Persona } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";

const FriendsList = () => {
  const { personas } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="mb-6 w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="p-0 h-auto flex items-center gap-2 font-medium text-lg hover:bg-transparent"
            onClick={toggleExpanded}
          >
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Bulletin Contributors ({personas.length})</CardTitle>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {personas.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-2">No personas found.</p>
          ) : (
            <Table>
              <TableBody>
                {personas.map((persona: Persona) => (
                  <TableRow key={persona.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                        {persona.avatar && <AvatarImage src={persona.avatar} alt={persona.name} />}
                      </Avatar>
                      <div>
                        <p className="font-medium">{persona.name}</p>
                        {persona.bio && <p className="text-xs text-muted-foreground">{persona.bio}</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default FriendsList;
