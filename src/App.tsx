
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
            <meta name="description" content="Share your moments with friends and family through our monthly bulletin service" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index key="index" />} />
              <Route path="/signup" element={<SignUp key="signup" />} />
              <Route path="/settings" element={<Settings key="settings" />} />
              <Route path="/bulletin" element={<Bulletin key="bulletin" />} />
              <Route path="/bulletin/filled" element={<FilledBulletin key="filled-bulletin" />} />
              <Route path="*" element={<NotFound key="not-found" />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
