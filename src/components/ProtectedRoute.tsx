import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const checkAuth = async (retryCount = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("[ProtectedRoute] No session, redirecting to /auth");
        navigate("/auth");
        return;
      }

      console.log("[ProtectedRoute] Session found, user ID:", session.user.id);

      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("[ProtectedRoute] Error fetching user role:", error);
        navigate("/auth");
        return;
      }

      console.log("[ProtectedRoute] User roles:", userRoles);

      if (!userRoles || userRoles.length === 0) {
        console.log("[ProtectedRoute] No roles found, retry:", retryCount);
        if (retryCount < 5) {
          await new Promise(resolve => setTimeout(resolve, 800));
          checkAuth(retryCount + 1);
          return;
        }
        console.log("[ProtectedRoute] Max retries reached, redirecting to /");
        navigate("/");
        return;
      }

      const userRole = userRoles[0].role;

      if (!allowedRoles.includes(userRole)) {
        console.log("[ProtectedRoute] Role not allowed:", userRole);
        navigate("/");
        return;
      }

      // Check tutor approval status
      const isPendingPath = location.pathname === "/tutor/pending" || location.pathname === "/tutor/resubmit";
      
      if (userRole === "tutor" && !isPendingPath) {
        const { data: tutorDetails, error: tutorError } = await supabase
          .from("tutor_details")
          .select("is_approved")
          .eq("tutor_id", session.user.id)
          .maybeSingle();

        if (tutorError) {
          console.error("[ProtectedRoute] Error fetching tutor details:", tutorError);
        }

        if (!tutorDetails || !tutorDetails.is_approved) {
          console.log("[ProtectedRoute] Tutor not approved or no details, redirecting to /tutor/pending");
          navigate("/tutor/pending");
          return;
        }
      }

      console.log("[ProtectedRoute] Authorized!");
      setAuthorized(true);
    } catch (error) {
      console.error("[ProtectedRoute] Auth check error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [allowedRoles, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
};

export default ProtectedRoute;