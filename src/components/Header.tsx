import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
// import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import FriendRequests from "./FriendRequests";
import { resetAllSlices, resetStore, softReset, useAppDispatch } from "@/redux";
import { useStytch, useStytchSession } from "@stytch/react";
import FeedbackCard from "./modalContent/FeedbackContent";
import { useDialog } from "@/providers/dialog-provider";
import { BookOpenIcon, ChatTextIcon, ListIcon } from "@phosphor-icons/react";
import { useSheet } from "@/providers/sheet-provider";
import UserAvatar from "./UserAvatar";
import { useSelector } from "react-redux";
import { staticGetUser } from "@/redux/user/selectors";

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
  const user = useSelector(staticGetUser);

  return (
    <header className="border-b border-gray-200 bg-[#9DBD99] p-3 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-1">
        <Link
          to="/"
          className={`font-bold text-black lowercase ${isMobile ? "text-1xl text-left" : "text-3xl"
            }`}
          style={{ fontFamily: "Sometype Mono, monospace" }}
        >
          the bulletin.
        </Link>

        <div className={`flex items-center space-x-2 ${isMobile && "max-w-[60%]"}`}>
          <Button variant="ghost" className=" hover:text-black hover:bg-red-50 rounded-[6px]"
            onClick={() => navigate("/catalogue")}>
            {isMobile ? <BookOpenIcon size={22} /> : "your Bulletins"}
          </Button>
          {!isMobile && <Button
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
            className="w-[3rem] hover:text-red-700 hover:bg-red-50 rounded-[6px]"
            aria-label="Feedback"
            title="Feedback"
          >
            <ChatTextIcon size={22} className="mx-auto" />
          </Button>}
          {session && (
            <>
              <FriendRequests />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-0 w-9 h-9 hover:opacity-80"
                onClick={() => navigate("/settings")}
                title="Settings"
              >
                <UserAvatar firstName={user?.firstName ?? ""} size="sm" />
              </Button>
              {!isMobile && <div className="flex items-center space-x-2">
                <Button
                  onClick={async () => {
                    await signOut().then(() => {
                      dispatch(resetAllSlices);
                      navigate("/");
                    });
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[6px] w-[3rem]"
                  aria-label="Sign Out"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5 mx-auto" />
                </Button>
              </div>}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
