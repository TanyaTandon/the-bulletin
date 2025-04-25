import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/redux";
import { fetchUser } from "@/redux/user";
import { createNewUser } from "@/lib/api";

const Index = () => {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { signIn } = useSignIn();

  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);

  const [signInState, setSignInState] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [receviedCode, setReceviedCode] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);

  const [signInStep, setSignInStep] = useState<number>(0);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <div className="text-left space-y-4">
          <img src="/BulletinLogo.svg" alt="logo" className="w-20 h-20 ml-[auto] mr-[auto]" />
          <h1 className="text-4xl font-bold text-left">Welcome to Bulletin</h1>
          <p className="text-md text-muted-foreground text-left">
            hi!
            <br />
            <br />
            the bulletin team here. we love our friends, we want to keep up with them, and have something to show for it! but we're tired of our phones, ads, & scrolling.
            <br />
            <br />
            so we'd love to present to you — the bulletin! 
            <br />
            <br />
            1. you and your friends upload pictures and text to our webapp. 
            <br />
            2. we make a monthly magazine, personalized for you, with all your friends' content. 
            <br />
            3. you're limited to 6 close friends - quality over quantity! 
            <br />
            4. you get this magazine on high quality paper in a beautiful layout to keep and cherish! 
            <br />
            <br />
            Expect your first bulletin by May 1st!
            <br />
            <br />
            love, 
            <br />
            tanya, adi, jackson - the bulletin team
          </p>
        </div>

        <div className="flex gap-4 ">
          {openAuthModal && (
            <Dialog
              PaperProps={{
                style: {
                  padding: "1em",
                  display: "flex",
                  alignItems: "center",
                  width: "52vw",
                  flexDirection: "column",
                  gap: "1em",
                },
              }}
              open
            >
              <p
                onClick={() => setOpenAuthModal(false)}
                style={{
                  position: "absolute",
                  right: "1em",
                  top: "0px",
                  cursor: "pointer",
                }}
              >
                x
              </p>
              {signInState ? (
                <>
                  {signInStep === 0 ? (
                    <>
                      <h1>Enter your phone number</h1>
                      <Input
                        value={phoneNumber}
                        placeholder="Enter your Phone Number"
                        type="tel"
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      />
                    </>
                  ) : (
                    <>
                      <h1>Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter your Code"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                      />
                    </>
                  )}
                  <div className="flex justify-center">
                    <Button
                      onClick={async () => {
                        if (signInStep === 0) {
                          await signIn.create({
                            strategy: "phone_code",
                            identifier: phoneNumber,
                          });
                          setSignInStep(1);
                        } else {
                          await signIn
                            .attemptFirstFactor({
                              strategy: "phone_code",
                              code: code,
                            })
                            .then(async (res) => {
                              console.log("res", res.identifier.split("+1")[1]);
                              dispatch(
                                fetchUser(res.identifier.split("+1")[1])
                              ).then(() => {
                                navigate("/bulletin");
                              });
                            });
                        }
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
                    >
                      {signInStep === 0 ? "Send me a one time verification code" : "Verify Code"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {signInStep === 0 ? (
                    <>
                      <h1>Enter your Name and Phone Number</h1>
                      <Input
                        placeholder="Enter your Name"
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      />
                      <Input
                        placeholder="Enter your Phone Number"
                        type="tel"
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      />
                      <Input
                        placeholder="Enter your Address"
                        onChange={(e) => {
                          setAddress(e.target.value);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <h1>Enter your code</h1>
                      <Input
                        value={code}
                        placeholder="Enter your Code"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                      />
                    </>
                  )}

                  <div className="flex justify-center">
                    <Button
                      onClick={async () => {
                        if (signInStep === 0) {
                          await signUp.create({
                            phoneNumber: phoneNumber,
                          });
                          await signUp
                            .preparePhoneNumberVerification({
                              strategy: "phone_code",
                            })
                            .then((res) => {
                              setReceviedCode(true);
                              setSignInStep(1);
                            });
                        } else {
                          await signUp
                            .attemptPhoneNumberVerification({
                              code: code,
                            })
                            .then((res) => {
                              console.log(res);
                              createNewUser({
                                name: name,
                                created_user_id: res.createdUserId,
                                id: phoneNumber,
                                phoneNumber: phoneNumber,
                                address: address,
                              }).then(() => {
                                navigate("/bulletin");
                              });
                            });
                        }
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
                    >
                      {signInStep === 0 ? "Send me a one time verification code" : "Verify Code"}
                    </Button>
                  </div>
                </>
              )}
            </Dialog>
          )}
          {!isSignedIn ? (
            <>
              <Button
                size="lg"
                onClick={() => {
                  setOpenAuthModal(true);
                  setSignInState(true);
                }}
                className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
              >
                Sign In
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setOpenAuthModal(true);
                  setSignInState(false);
                }}
                variant="outline"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/bulletin")}
              className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
            >
              Go to Bulletin
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
