import { fetchBulletins } from "@/redux/user";
import { useAppDispatch } from "@/redux/";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";
import sendError from "@/hooks/use-sendError";

const Test: React.FC = () => {
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <ReactInputVerificationCode />
        <button
          onClick={async () => {
            sendError("testUser", "handleSignUp", "test", {
              test:"works"
            });
          }}
        >
          Click me
        </button>
      </div>
    </>
  );
};

export default Test;
