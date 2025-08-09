import { useStytch } from "@stytch/react";
import react from "@vitejs/plugin-react-swc";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useStytch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    async function callUser() {
      try {
        const details = await user.get();
        console.log();
        if (details.user_id) {
          if (pathname == "/") {
            navigate("/bulletin");
          }
        }
      } catch (error) {
        if (error.includes("401")) {
          window.location.href = "/login";
        }
      }
    }
    callUser();
  }, [user]);

  return <>{children}</>;
};

export default AuthProvider;
