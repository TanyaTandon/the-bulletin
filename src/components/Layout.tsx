
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Users, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    activePersona, 
    activeGroup, 
    personas, 
    groups, 
    setActivePersona,
    setActiveGroup
  } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            PicNoteScribe
          </Link>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {activePersona ? activePersona.name : "Select Persona"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Your Personas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {personas.map((persona) => (
                  <DropdownMenuItem 
                    key={persona.id}
                    onClick={() => setActivePersona(persona.id)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {persona.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/create-persona" className="cursor-pointer flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Persona
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {activeGroup ? activeGroup.name : "Select Group"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Your Groups</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setActiveGroup(null)}
                  className="cursor-pointer"
                >
                  No Group (Individual)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {groups.map((group) => (
                  <DropdownMenuItem 
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {group.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/create-group" className="cursor-pointer flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Group
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 container mx-auto">
        {children}
      </main>
      
      <footer className="border-t p-4 text-center text-muted-foreground">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} PicNoteScribe App
        </div>
      </footer>
    </div>
  );
};

export default Layout;
