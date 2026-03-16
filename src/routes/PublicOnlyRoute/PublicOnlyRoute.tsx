import { Navigate, useLocation } from "@modules/core";
import { PATH_HOME } from "@/Routes/Paths/Paths";
import { useAuth } from "@/Routes/UseAuth/UseAuth";
import type { ReactNode } from "react";

export function PublicOnlyRoute({ children }: { children: ReactNode }): ReactNode {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? PATH_HOME;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
