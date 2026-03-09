import Layout from "@/components/Layout";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { staticGetUser } from "@/redux/user/selectors";
import { useAppDispatch, useAppSelector } from "@/redux";
import { getTokens } from "@/redux/tokens/selectors";
import { mapUserRecordFromDb, supabase } from "@/lib/api";
import { setUser, SubscriptionStatus } from "@/redux/user";
import { Button } from "@/components/ui/button";

const CheckoutReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const user = useSelector(staticGetUser);
  const tokens = useAppSelector(getTokens);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId || !user) return;

    const handleReturn = async () => {
      try {
        // Ask the backend to retrieve the Stripe session and return the subscription ID
        const response = await fetch(
          `http://localhost:8080/api/checkout/stripe/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${tokens?.session_jwt}`,
            },
          }
        );

        const data = await response.json();
        const subscriptionId: string | undefined = data?.subscription_id ?? data?.subscription;
        const customerId: string | undefined = data?.customer_id ?? data?.customer;

        if (!subscriptionId) throw new Error("No subscription ID in response");

        const { data: updatedRow, error } = await supabase
          .from("user_record")
          .update({
            subscription_status: SubscriptionStatus.Basic,
            subscription_id: subscriptionId,
            ...(customerId && { customer_id: customerId }),
          })
          .eq("phone_number", user.phone_number)
          .select()
          .single();

        if (error) throw error;

        dispatch(setUser(mapUserRecordFromDb(updatedRow) as typeof user));
        setStatus("success");
      } catch {
        setStatus("error");
      } finally {
        // Remove session_id from the URL without triggering a re-render
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    handleReturn();
  }, [sessionId]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        {status === "loading" && (
          <p className="text-muted-foreground">Setting up your subscription…</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold">You're subscribed!</h1>
            <p className="text-muted-foreground">
              Your bulletin will be sent to your recipients at the end of each month.
            </p>
            <Button onClick={() => navigate("/catalogue")}>Go to your bulletins</Button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              Your payment may have gone through — please contact support if your subscription
              doesn't appear in settings.
            </p>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              Go to settings
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutReturn;
