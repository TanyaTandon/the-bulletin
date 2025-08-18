import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { selectShowFriendsModal } from "@/redux/nonpersistent/controllers/selectors";
import { useAppSelector } from "@/redux";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import FriendModalContent from "./FriendModalContent";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col ">
      {location.pathname !== "/" && <Header />}

      <main className="flex-1 p-2 container mx-auto">{children}</main>

      <footer className="border-t border-gray-200 p-4 text-center text-gray-500 text-xs mt-12">
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
