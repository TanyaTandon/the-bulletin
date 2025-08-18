import React from "react";
import { Button } from "./ui/button";
import { useStytch } from "@stytch/react";

const NavSheetContent: React.FC = () => {
  const stytch = useStytch();
  return (
    <section className="flex flex-col gap-4">
      <Button variant="ghost">My Bulletins</Button>
      <Button variant="ghost">Feedback</Button>
      
    </section>
  );
};

export default NavSheetContent;
