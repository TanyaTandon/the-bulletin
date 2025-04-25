
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FriendRequests from "./FriendRequests";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignOutButton, useAuth } from "@clerk/clerk-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const { isSignedIn } = useAuth();

  const handleSettingsClick = () => {
    if (location.pathname === "/settings") {
      navigate("/");
    } else {
      navigate("/settings");
    }
  };

  // Determine if user is on bulletin page
  const isOnBulletinPage = location.pathname === "/bulletin" || 
                          location.pathname.startsWith("/bulletin/");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-1">
          <Link
            to="/"
            className={`font-bold text-black lowercase ${
              isMobile ? "text-2xl" : "text-3xl"
            }`}
            style={{ fontFamily: "Sometype Mono, monospace" }}
          >
            the bulletin.
          </Link>
          {isSignedIn && !isOnBulletinPage ? (
            <div className="flex items-center space-x-2">
              <FriendRequests />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSettingsClick}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                <Settings className="h-5 w-5" />
                <SignOutButton />
              </Button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="flex-1 p-2 container mx-auto bg-gray-50">
        {children}
      </main>

      <footer className="border-t border-gray-200 p-2 text-center text-gray-500 bg-white text-xs">
        <div
          className="container mx-auto"
          style={{ fontFamily: "Sometype Mono, monospace" }}
        >
          &copy; {new Date().getFullYear()} the bulletin.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
