import { fetchBulletins } from "@/redux/user";
import { useAppDispatch } from "@/redux/";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";

const Test: React.FC = () => {
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <ReactInputVerificationCode />
        <button
          onClick={async () => {
            await dispatch(fetchBulletins());
          }}
        >
          Click me
        </button>
      </div>
    </>
  );
};

export default Test;
