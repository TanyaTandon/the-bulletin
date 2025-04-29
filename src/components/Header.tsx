
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
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
    // Add logging to debug authentication state
    console.log("Auth state updated:", { isSignedIn, hasUser: !!user, isAuthenticated: !!isSignedIn && !!user });
  }, [isSignedIn, user]);

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
        
        {/* Show buttons if either condition is true to ensure better reliability */}
        {(isSignedIn || isAuthenticated) && (
          <div className="flex items-center space-x-2">
            <FriendRequests/>
            <div className="flex items-center space-x-2">
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
