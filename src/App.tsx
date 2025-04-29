
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import SignUp from "./pages/Signup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Bulletin from "./pages/bulletin";
import FilledBulletin from "./pages/filledBulletin";
import Test from "./pages/test";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/clerk-react";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Configure Query Client with more reliable settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Helmet>
            <link rel="icon" href="/BulletinLogoICON.svg" />
            <title>The Bulletin</title>
            <meta
              name="description"
              content="Share your moments with friends and family through our monthly bulletin service"
            />
          </Helmet>
          <Toaster />
          <Sonner />
          <ToastContainer position="top-right" autoClose={3000} />
          
          <ClerkLoading>
            <div className="h-screen w-screen flex items-center justify-center">
              <p className="text-lg">Loading authentication...</p>
            </div>
          </ClerkLoading>
          
          <ClerkLoaded>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index key="index" />} />
                <Route path="/signup" element={<SignUp key="signup" />} />
                <Route 
                  path="/settings" 
                  element={
                    <SignedIn>
                      <Settings key="settings" />
                    </SignedIn>
                  } 
                />
                <Route 
                  path="/bulletin" 
                  element={
                    <SignedIn>
                      <Bulletin key="bulletin" />
                    </SignedIn>
                  } 
                />
                <Route 
                  path="/bulletin/:id" 
                  element={
                    <SignedIn>
                      <FilledBulletin key="filled-bulletin" />
                    </SignedIn>
                  }
                />
                <Route path="/test" element={<Test key="test" />} />
                <Route path="*" element={<NotFound key="not-found" />} />
              </Routes>
            </BrowserRouter>
          </ClerkLoaded>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
