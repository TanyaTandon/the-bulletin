
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import FriendRequests from "./FriendRequests";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { useAppDispatch } from "@/redux";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Use both Clerk's isSignedIn and the user object to determine authentication status
  useEffect(() => {
    setIsAuthenticated(!!isSignedIn && !!user);
  }, [isSignedIn, user]);

  const handleSettingsClick = () => {
    if (location.pathname === "/settings") {
      navigate("/");
    } else {
      navigate("/settings");
    }
  };

  const dispatch = useAppDispatch();

  return (
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
        
        {/* Use both isSignedIn from Clerk and our local state to determine if we should show the buttons */}
        {(isSignedIn || isAuthenticated) && (
          <div className="flex items-center space-x-2">
            <FriendRequests/>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSettingsClick}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <SignOutButton redirectUrl="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Sign Out"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </SignOutButton>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
