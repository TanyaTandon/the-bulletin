import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";

const Test: React.FC = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <ReactInputVerificationCode />
        <button
          onClick={() =>
            toast.success("This feature is not available yet", {
              position: "top-right",
            })
          }
        >
          Click me
        </button>
      </div>
    </>
  );
};

export default Test;
