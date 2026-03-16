import { Navigate, useLocation } from "@modules/core";
import { PATH_LOGIN } from "@/Routes/Paths/Paths";
import { useAuth } from "@/Routes/UseAuth/UseAuth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }): ReactNode {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={PATH_LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
