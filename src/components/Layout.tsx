
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";
import FriendRequests from "./FriendRequests";
import { Settings, Archive } from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-primary lowercase" style={{ fontFamily: 'Courier New, monospace' }}>
            the bulletin.
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Archive className="h-5 w-5" />
            </Button>
            <FriendRequests />
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 container mx-auto">
        {children}
      </main>
      
      <footer className="border-t p-4 text-center text-muted-foreground">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
