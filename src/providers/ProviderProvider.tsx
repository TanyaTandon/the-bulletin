import React, { useEffect } from "react";
import AuthProvider from "./AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { TourGuideProvider } from "@/providers/contexts/TourGuideContext";
import { AuthContext } from "@/providers/contexts/AuthContext";
import { ToastContext } from "../providers/contexts/toastcontextTP";
import { DialogProvider, useDialog } from "../providers/dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showToast } from "../main";
import { SheetProvider } from "./sheet-provider";
import { getBulletins, staticGetUser } from "@/redux/user/selectors";
import { useAppDispatch, useAppSelector } from "@/redux";
import { useStytchUser } from "@stytch/react";
import Controller from "./Controller";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { getTokens } from "@/redux/tokens/selectors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});



// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {
});


const ProviderProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = window.location.pathname;
  const searchParams = window.location.search;
  const allBulletins = useAppSelector(getBulletins);
  const user = useAppSelector(staticGetUser);
  const stytchUser = useStytchUser();

  useEffect(() => {
    if (
      (pathname === "/" || pathname === "/bulletin") &&
      user &&
      stytchUser.user
    ) {
      if (
        allBulletins.length !== 0 &&
        allBulletins.some(
          (bulletin) => bulletin.month === new Date().getMonth() + 1
        ) &&
        !searchParams.includes("onboarding")
      ) {
        window.location.href = `/bulletin/${allBulletins.find(
          (bulletin) => bulletin.month === new Date().getMonth() + 1
        )?.id
          }`;
      }
    }
  }, [pathname]);
  const tokens = useAppSelector(getTokens);

  async function fetchClientSecret() {
    const response = await fetch(`${import.meta.env.VITE_BE_URL}/api/checkout/stripe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.session_jwt}`,
      },
    });
    const data = await response.json();
    return data.clientSecret;
  }

  const options = { fetchClientSecret };

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContext.Provider value={{ showToast }}>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={options}
        >

          <TooltipProvider>
            <AuthContext>
              <BrowserRouter>
                <AuthProvider>
                  <DialogProvider>
                    <SheetProvider>
                      <TourGuideProvider
                        initialOptions={{ exitOnClickOutside: false }}
                      >
                        <Controller>

                          {children}
                        </Controller>
                      </TourGuideProvider>
                    </SheetProvider>
                  </DialogProvider>
                </AuthProvider>
              </BrowserRouter>
            </AuthContext>
          </TooltipProvider>
        </EmbeddedCheckoutProvider>
      </ToastContext.Provider>
    </QueryClientProvider>
  );
};

export default ProviderProvider;
