
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CreatePersona from "./pages/CreatePersona";
import CreateGroup from "./pages/CreateGroup";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// Create the query client outside of the component
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-persona" 
        element={
          <ProtectedRoute>
            <CreatePersona />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-group" 
        element={
          <ProtectedRoute>
            <CreateGroup />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Check if Supabase environment variables are configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseConfigured(false);
    }
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
          <p className="text-gray-700">
            Supabase environment variables are missing. Please make sure you've properly set up your Supabase integration.
          </p>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-left">
            <p className="text-sm text-amber-800">
              To fix this issue:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-amber-800">
              <li>Click on the Supabase button in the top right</li>
              <li>Connect to your Supabase project</li>
              <li>Make sure the environment variables are properly set</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
