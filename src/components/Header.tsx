import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
// import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import FriendRequests from "./FriendRequests";
import { resetAllSlices, resetStore, softReset, useAppDispatch } from "@/redux";
import { useStytch, useStytchSession } from "@stytch/react";
import FeedbackCard from "./FeedbackContent";
import { useDialog } from "@/providers/dialog-provider";
import { BookOpenIcon, ChatTextIcon, ListIcon } from "@phosphor-icons/react";
import { useSheet } from "@/providers/sheet-provider";
import NavSheetContent from "./NavSheetContent";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session } = useStytchSession();
  const [feedback, setFeedback] = useState<boolean>(false);
  const [feedbackContent, setFeedbackContent] = useState<string>("");

  const dispatch = useAppDispatch();
  const stytch = useStytch();

  const signOut = async () => {
    await stytch.session.revoke();
  };

  const { dialog } = useDialog();
  // console.log(session);

  const { sheet, close } = useSheet();

  return (
    <header className="border-b border-gray-200 bg-[#9DBD99] p-3 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-1">
        <Link
          to="/"
          className={`font-bold text-black lowercase ${
            isMobile ? "text-1xl text-left" : "text-3xl"
          }`}
          style={{ fontFamily: "Sometype Mono, monospace" }}
        >
          the bulletin.
        </Link>

        <div className={`flex items-center space-x-2 ${ isMobile &&  "max-w-[60%]"}`}>
          <Button variant="ghost" onClick={() => navigate("/catalogue")}>
            {isMobile ? <BookOpenIcon size={22} /> : "Your Bulletins"}
          </Button>
          <Button
            onClick={async () => {
              dialog(
                <FeedbackCard
                  inline
                  closure={() => setFeedback(false)}
                  feedback={feedbackContent}
                  setFeedback={setFeedbackContent}
                />
              );
            }}
            variant="ghost"
            size="icon"
            className="w-[7.5rem] hover:text-red-700 hover:bg-red-50"
            aria-label="Sign Out"
            title="Sign Out"
          >
            {isMobile ? <ChatTextIcon size={22} /> : "Feedback"}
          </Button>
          {session && (
            <>
              <FriendRequests />
              <div className="flex items-center space-x-2">
                <Button
                  onClick={async () => {
                    await signOut().then(() => {
                      dispatch(resetAllSlices);
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
