
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FriendRequests from "./FriendRequests";
import { History, Settings } from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSettingsClick = () => {
    if (location.pathname === '/settings') {
      navigate('/');
    } else {
      navigate('/settings');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="text-3xl font-bold text-black lowercase" 
            style={{ fontFamily: 'Sometype Mono, monospace' }}
          >
            the bulletin.
          </Link>
          
          <div className="flex items-center space-x-2">
            <FriendRequests />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSettingsClick}
              className="text-black hover:text-black/70 hover:bg-gray-50"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-black hover:text-black/70 hover:bg-gray-50"
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 container mx-auto bg-gray-50">
        {children}
      </main>
      
      <footer className="border-t border-gray-200 p-4 text-center text-gray-500 bg-white">
        <div className="container mx-auto" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
