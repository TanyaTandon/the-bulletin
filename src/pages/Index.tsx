import React from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { resetAllSlices, useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import AnimatedButton from "@/components/AnimatedButton";
import { useDialog } from "@/providers/dialog-provider";
import AuthModalContent from "@/components/AuthModalContent";
import { useAuth } from "@/providers/contexts/AuthContext";

const Index = () => {
  const { dialog, close } = useDialog();



  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 md:px-12 py-12">
        <div className="text-left space-y-4">
          <img
            src="/BulletinLogo.svg"
            alt="logo"
            className="w-20 h-20 ml-[auto] mr-[auto]"
          />
        </div>
        <Link
          to="/"
          className={`lowercase text-5xl`}
          style={{ fontFamily: "Delight, monospace", fontWeight: "600" }}
        >
          the bulletin
        </Link>

        <div className="gap-4">
          <section className="flex flex-col items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                dialog(<AuthModalContent close={close} signInState={true} />);
              }}
              className="block w-[10rem] text-[#FCE5BA] rounded-[100px] hover:opacity-90"
            >
              sign in
            </Button>
            <br />
            <AnimatedButton
              onClick={() => {
                dialog(<AuthModalContent close={close} signInState={false} />);
              }}
            >
              sign up
            </AnimatedButton>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
