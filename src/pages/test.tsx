import { fetchBulletins } from "@/redux/user";
import { useAppDispatch, useAppSelector } from "@/redux/";
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
  console.log(user);
  console.log(userData);
  const tokens = stytch.session.getTokens();
  console.log(tokens);
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
            const { data, error } = await supabase.rpc("array_append_images", {
              row_id: "c4bb5824-f4d0-4f9c-abaa-3ba7dc2645d4",
              new_value: "test",
            });
            console.log(data);
          }}
        >
          click 2 here to test arrayAppend
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <button
          onClick={async () => {
            await fetch("http://localhost:8080/ping",{
              method: "GET",
            })
          }}
        >
          click try remote array_append
        </button>
      </div>
    </>
  );
};

export default Test;
