import React from "react";
import AuthProvider from "./AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TourGuideProvider } from "@/providers/contexts/TourGuideContext";
import { AuthContext } from "@/providers/contexts/AuthContext";
import { ToastContext } from "../providers/contexts/toastcontextTP";
import { DialogProvider } from "../providers/dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showToast } from "../main";
import { SheetProvider } from "./sheet-provider";

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
