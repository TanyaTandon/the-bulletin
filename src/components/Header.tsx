import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
// import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import FriendRequests from "./FriendRequests";
import { resetStore } from "@/redux";
import { useStytch, useStytchSession } from "@stytch/react";
import { Dialog } from "@mui/material";
import FeedbackCard from "./FeedbackContent";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session } = useStytchSession();
  const [feedback, setFeedback] = useState<boolean>(false);
  const [feedbackContent, setFeedbackContent] = useState<string>("");

  const stytch = useStytch();

  const signOut = async () => {
    await stytch.session.revoke();
  };

  console.log(session)
  return (
    <header className="border-b border-gray-200 bg-[#9DBD99] p-3 shadow-sm">
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={async () => {
              setFeedback(true);
            }}
            variant="ghost"
            size="icon"
            className="w-[7.5rem] hover:text-red-700 hover:bg-red-50"
            aria-label="Sign Out"
            title="Sign Out"
          >
            Feedback
          </Button>
          {feedback && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "1em",
                  display: "flex",
                  alignItems: "center",
                  width: isMobile ? "97vw" : "52vw",
                },
              }}
              open
            >
              <p
                onClick={() => setFeedback(false)}
                style={{
                  position: "absolute",
                  right: "1em",
                  top: "0px",
                  cursor: "pointer",
                }}
              >
                x
              </p>
              <FeedbackCard
                inline
                closure={() => setFeedback(false)}
                feedback={feedbackContent}
                setFeedback={setFeedbackContent}
              />
            </Dialog>
          )}
          {session && (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
