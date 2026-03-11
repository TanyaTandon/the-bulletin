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
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRef, useEffect, useCallback, useMemo } from "react";
import { getTokens } from "@/redux/tokens/selectors";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const TestCheckout: React.FC = () => {
  const tokens = useAppSelector(getTokens);
  const tokensRef = useRef(tokens);
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch(`${import.meta.env.VITE_BE_URL}/api/checkout/stripe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokensRef.current?.session_jwt}`,
      },
    });
    const data = await response.json();
    return data.clientSecret;
  }, []);

  const options = useMemo(() => ({
    fetchClientSecret
  }), [fetchClientSecret]);

  return (
    <Layout>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout className="stripeHelper" />
      </EmbeddedCheckoutProvider>
    </Layout>
  );
};

export default TestCheckout;
