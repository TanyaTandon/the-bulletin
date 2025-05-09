import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
// import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import FriendRequests from "./FriendRequests";
import { resetStore } from "@/redux";
import { useStytch, useStytchSession } from "@stytch/react";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session } = useStytchSession();

  const stytch = useStytch();

  const signOut = async () => {
    await stytch.session.revoke();
  };

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
        {session && (
          <div className="flex items-center space-x-2">
            <FriendRequests />
            <div className="flex items-center space-x-2">
              <Button
                onClick={async () => {
                  console.log("signing out");
                  await signOut().then(() => {
                    resetStore();
                    navigate("/");
                  });
                }}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
