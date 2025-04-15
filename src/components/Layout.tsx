
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
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-white lowercase" style={{ fontFamily: 'Courier New, monospace' }}>
            the bulletin.
          </Link>
          
          <div className="flex items-center space-x-2">
            <FriendRequests />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSettingsClick}
              className="text-white/70 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <History className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 container mx-auto">
        {children}
      </main>
      
      <footer className="border-t border-white/10 p-4 text-center text-white/50">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
