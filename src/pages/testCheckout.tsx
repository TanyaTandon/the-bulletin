import { fetchBulletins } from "@/redux/user";
import { resetAllSlices, useAppDispatch, useAppSelector } from "@/redux/";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";
import axios from "axios";
import { staticGetUser } from "@/redux/user/selectors";
import { useStytch, useStytchUser } from "@stytch/react";
import { quickValidation, supabase } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import phoneNumbers from "../../phone_numbers.json";
import { EmbeddedCheckout } from "@stripe/react-stripe-js";
// import { myQApi } from "@hjdhjd/myq"

const TestCheckout: React.FC = () => {

  return (
    <Layout>
      <EmbeddedCheckout />
    </Layout>
  );
};

export default TestCheckout;
