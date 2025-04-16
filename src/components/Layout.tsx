
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FriendRequests from "./FriendRequests";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleSettingsClick = () => {
    if (location.pathname === '/settings') {
      navigate('/');
    } else {
      navigate('/settings');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-1">
          <Link 
            to="/" 
            className={`font-bold text-black lowercase ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ fontFamily: 'Sometype Mono, monospace' }}
          >
            the bulletin.
          </Link>
          
          <div className="flex items-center space-x-1">
            <FriendRequests />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSettingsClick}
              className="text-black hover:text-black/70 hover:bg-gray-50 h-8 w-8"
            >
              <Settings className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-2 container mx-auto bg-gray-50">
        {children}
      </main>
      
      <footer className="border-t border-gray-200 p-2 text-center text-gray-500 bg-white text-xs">
        <div className="container mx-auto" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
