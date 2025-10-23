import React, { useEffect } from "react";
import AuthProvider from "./AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { TourGuideProvider } from "@/providers/contexts/TourGuideContext";
import { AuthContext } from "@/providers/contexts/AuthContext";
import { ToastContext } from "../providers/contexts/toastcontextTP";
import { DialogProvider } from "../providers/dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showToast } from "../main";
import { SheetProvider } from "./sheet-provider";
import { getBulletins } from "@/redux/user/selectors";
import { useAppSelector } from "@/redux";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});

const ProviderProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = window.location.pathname;
  const allBulletins = useAppSelector(getBulletins);



  useEffect(() => {
    console.log("ProviderProvider");
    if (pathname === "/" || pathname === "/bulletin") {
      if (
        allBulletins.length !== 0 &&
        allBulletins.some(
          (bulletin) => bulletin.month === new Date().getMonth() + 1
        )
      ) {
        window.location.href = `/bulletin/${
          allBulletins.find(
            (bulletin) => bulletin.month === new Date().getMonth() + 1
          )?.id
        }`;
      }
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContext.Provider value={{ showToast }}>
        <TooltipProvider>
          <AuthContext>
            <BrowserRouter>
              <AuthProvider>
                <DialogProvider>
                  <SheetProvider>
                    <TourGuideProvider>{children}</TourGuideProvider>
                  </SheetProvider>
                </DialogProvider>
              </AuthProvider>
            </BrowserRouter>
          </AuthContext>
        </TooltipProvider>
      </ToastContext.Provider>
    </QueryClientProvider>
  );
};

export default ProviderProvider;
