import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import SignUp from "./pages/Signup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Bulletin from "./pages/bulletin";
import FilledBulletin from "./pages/filledBulletin";

const queryClient = new QueryClient();

const App = () => {
  console.log("App");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Helmet>
            <link rel="icon" href="/BulletinLogoICON.svg" />
            <title>The Bulletin</title>
            <meta name="description" content="Share your moments with friends and family through our monthly bulletin service" />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bulletin" element={<Bulletin />} />
              <Route path="/bulletin/:id" element={<FilledBulletin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
