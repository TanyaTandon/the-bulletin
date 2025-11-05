import { fetchBulletins } from "@/redux/user";
import { resetAllSlices, useAppDispatch, useAppSelector } from "@/redux/";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";
import sendError from "@/hooks/use-sendError";
import axios from "axios";
import { staticGetUser } from "@/redux/user/selectors";
import { useStytch, useStytchUser } from "@stytch/react";
import { supabase } from "@/lib/api";

const Test: React.FC = () => {
  const stytch = useStytch();

  const user = useAppSelector(staticGetUser);
  const userData = useStytchUser();
  const dispatch = useAppDispatch();
  console.log(user);
  console.log(userData);
  const tokens = stytch.session.getTokens();
  console.log(tokens);

  const signOut = async () => {
    await stytch.session.revoke();
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <button
          onClick={async () => {
            await fetch("http://localhost:8080/protected/profile", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${tokens.session_jwt}`,
              },
            });
          }}
        >
          Click me
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <button
          onClick={async () => {
            const { data, error } = await supabase.rpc("add_phone_number", {
              adding_number: "+12535149837",
              number_to_be_added: "+14692226142",
            });
            console.log(data);
          }}
        >
          apppppendy
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <button
          onClick={async () => {
            // await fetch("http://localhost:8080/ping",{
            //   method: "GET",
            // })
            signOut();
          }}
        >
          click try remote array_append
        </button>
      </div>
    </>
  );
};

export default Test;
