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
        // console.log();
        if (details.user_id) {
          if (pathname == "/") {
            navigate("/bulletin");
          }
        }
      } catch (error) {
        // console.log(typeof error);
        // console.log(Object.keys(error));
        // console.log(error.status_code);
        if (
          error.status_code &&
          error.status_code == 401 &&
          pathname !== "/" &&
          pathname !== "/test"
        ) {
          window.location.href = "/";
        }
      }
    }
    callUser();
  }, [user]);

  return <>{children}</>;
};

export default AuthProvider;
