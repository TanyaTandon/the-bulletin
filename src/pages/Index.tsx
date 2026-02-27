import React from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { resetAllSlices, useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import AnimatedButton from "@/components/AnimatedButton";
import { useDialog } from "@/providers/dialog-provider";
import AuthModalContent from "@/components/modalContent/AuthModalContent";

const Index = () => {
  const { dialog, close } = useDialog();

  const user = useAppSelector(staticGetUser);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 md:px-12 py-12 pb-0">
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

        <p className="text-left w-[50%]">
          hi!
          <br />
          we're tanya, jacob, and jackson, from turby in the mission, right here in sf.
          <br />
          we love our friends! we want to keep up with them, see what they're up to, and have something to show for it!
          <br />
          <br />
          but — we're tired of our phones. we're tired of ads. we're tired of scrolling.
          <br />
          so we'd love to present to you something we've been working on:
          <br />
          <br />
          <b>
            the bulletin.
          </b>
          <br />
          <br />
          a monthly magazine, by your friends, created for you, in the mail. 🐌
          <br />
          made with love.
          <br />
          we've designed the bulletin to look great, feel great, and to be collage-able, scrap-bookable, and collectible.
          <br />
          <br />
          love,
          <br />
          tanya, jacob, jackson
        </p>
        <div className="gap-4">
          {user == null && (
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
                  dialog(
                    <AuthModalContent close={close} signInState={false} />,
                    {
                    }
                  );
                }}
              >
                sign up
              </AnimatedButton>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
