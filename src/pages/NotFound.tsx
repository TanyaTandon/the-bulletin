
import { useLocation, useNavigate, useEffect } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Log the attempted route for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "User agent:",
      navigator.userAgent
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    // Navigate to home and force a page refresh to ensure proper loading
    window.location.href = '/';
  };
  
  const handleGoToBulletin = () => {
    // Navigate to bulletin and force a page refresh
    window.location.href = '/bulletin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-violet-600">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-6">
          We couldn't find the page you were looking for.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={handleGoHome} className="w-full">
            Return to Home
          </Button>
          <Button 
            onClick={handleGoToBulletin} 
            variant="outline"
            className="w-full"
          >
            Go to Bulletin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
